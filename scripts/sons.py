"""Sintetiza os sons do jogo (docs/sons.md, ADR 0007).

Só biblioteca padrão. Cada som é uma função que devolve amostras entre -1 e
1; o script normaliza e grava WAV mono 22 kHz em public/assets/audio/sfx/.

Desde 03/11/2026 a base dos efeitos é gravada (scripts/sons_gravados.py,
ADR 0008). Este script só grava as chaves que lá não têm receita, para não
apagar o som gravado.

Rodar tudo: python scripts/sons.py
Rodar alguns: python scripts/sons.py pulo ko
"""
import math
import random
import struct
import sys
import wave
from pathlib import Path

PASTA = Path(__file__).resolve().parents[1] / 'public/assets/audio/sfx'
TAXA = 22050
TAU = 2 * math.pi


# ---------------------------------------------------------------- ferramentas

def n(segundos: float) -> int:
    return int(TAXA * segundos)


def ruido(segundos: float, semente: int) -> list[float]:
    r = random.Random(semente)
    return [r.uniform(-1, 1) for _ in range(n(segundos))]


def passa_baixa(x: list[float], corte: float) -> list[float]:
    a = 1 - math.exp(-TAU * corte / TAXA)
    y, s = [], 0.0
    for v in x:
        s += a * (v - s)
        y.append(s)
    return y


def passa_alta(x: list[float], corte: float) -> list[float]:
    baixo = passa_baixa(x, corte)
    return [v - b for v, b in zip(x, baixo)]


def faixa(x: list[float], grave: float, agudo: float) -> list[float]:
    return passa_alta(passa_baixa(x, agudo), grave)


def faixa_movel(x: list[float], centro, largura: float = 0.6) -> list[float]:
    """Filtro de faixa cujo centro muda no tempo (sopro que sobe ou desce)."""
    y, baixo, alto = [], 0.0, 0.0
    for i, v in enumerate(x):
        c = centro(i / TAXA)
        a1 = 1 - math.exp(-TAU * c * (1 + largura) / TAXA)
        a2 = 1 - math.exp(-TAU * c * (1 - largura / 2) / TAXA)
        baixo += a1 * (v - baixo)
        alto += a2 * (baixo - alto)
        y.append(baixo - alto)
    return y


def tom(segundos: float, freq, forma: str = 'seno') -> list[float]:
    """Oscilador com frequência variável `freq(t)`."""
    fase, y = 0.0, []
    for i in range(n(segundos)):
        fase += TAU * freq(i / TAXA) / TAXA
        if forma == 'seno':
            y.append(math.sin(fase))
        elif forma == 'quadrada':
            y.append(1.0 if math.sin(fase) >= 0 else -1.0)
        else:  # dente de serra suave: soma de harmônicos
            y.append(sum(math.sin(k * fase) / k for k in range(1, 6)) * 0.6)
    return y


def env(x: list[float], ataque: float = 0.003, queda: float = 0.1, sustenta: float = 0.0) -> list[float]:
    """Ataque linear, sustenta e cai exponencialmente."""
    y = []
    for i, v in enumerate(x):
        t = i / TAXA
        if t < ataque:
            g = t / ataque
        elif t < ataque + sustenta:
            g = 1.0
        else:
            g = math.exp(-(t - ataque - sustenta) / queda)
        y.append(v * g)
    return y


def ganho(x: list[float], g: float) -> list[float]:
    return [v * g for v in x]


def pico(x: list[float], alvo: float = 1.0) -> list[float]:
    """Normaliza uma parte antes de misturar, para o ganho dizer a proporção."""
    m = max((abs(v) for v in x), default=0) or 1.0
    return [v * alvo / m for v in x]


def mistura(*partes, inicio=None) -> list[float]:
    """Soma partes; `inicio` dá o atraso de cada uma em segundos."""
    inicio = inicio or [0.0] * len(partes)
    total = max(n(d) + len(p) for p, d in zip(partes, inicio))
    y = [0.0] * total
    for p, d in zip(partes, inicio):
        o = n(d)
        for i, v in enumerate(p):
            y[o + i] += v
    return y


def eco(x: list[float], atraso: float, repete: int, perda: float) -> list[float]:
    partes = [ganho(x, perda ** k) for k in range(repete + 1)]
    return mistura(*partes, inicio=[atraso * k for k in range(repete + 1)])


def batida(freq_ini: float, freq_fim: float, segundos: float, queda: float) -> list[float]:
    """Bumbo, surdo, baque: seno que desce de tom e some."""
    return env(tom(segundos, lambda t: freq_fim + (freq_ini - freq_fim) * math.exp(-t / 0.04)), 0.002, queda)


def apito(segundos: float, base: float = 2950, desce: float = 0.0, semente: int = 7) -> list[float]:
    """Apito de bolinha, como o dos menus (scripts/apito.py)."""
    r = random.Random(semente)
    y = []
    for i in range(n(segundos)):
        t = i / TAXA
        f = base - desce * t / segundos
        tremor = 0.55 + 0.45 * math.sin(TAU * 46 * t)
        v = tremor * (math.sin(TAU * (f + 70 * math.sin(TAU * 46 * t)) * t) + 0.25 * math.sin(TAU * 2 * f * t))
        v += 0.12 * r.uniform(-1, 1)
        g = min(1.0, t / 0.012) * min(1.0, (segundos - t) / 0.05)
        y.append(v * g)
    return y


# ---------------------------------------------------------------- voz (formantes)
# Voz de gente e de bicho: fonte de pulsos (a glote) com tremor natural, mais
# sopro, passando por ressonadores nas frequências das vogais. O tremor e o
# sopro é que tiram o "som de brinquedo"; tom limpo vira apito.

VOGAIS = {
    'a': [(730, 110, 1.0), (1150, 120, 0.55), (2500, 200, 0.25)],
    'o': [(520, 90, 1.0), (880, 110, 0.5), (2450, 200, 0.15)],
    'u': [(330, 80, 1.0), (800, 110, 0.3), (2250, 200, 0.08)],
    'e': [(500, 90, 1.0), (1700, 140, 0.35), (2500, 200, 0.2)],
    'neutra': [(560, 110, 1.0), (1450, 140, 0.45), (2450, 200, 0.2)],
}


def glote(segundos: float, f0, semente: int, tremor: float = 0.02, sopro_: float = 0.15) -> list[float]:
    """Pulsos da glote com jitter (tom tremido) e shimmer (força tremida)."""
    r = random.Random(semente)
    y, fase, alvo, forca = [], 0.0, 0.0, 1.0
    for i in range(n(segundos)):
        t = i / TAXA
        if fase >= 1.0:
            fase -= 1.0
            alvo = r.uniform(-tremor, tremor)
            forca = 1 + r.uniform(-tremor * 4, tremor * 4)
        fase += f0(t) * (1 + alvo) / TAXA
        pulso = (1 - 2 * fase) if fase < 1 else -1.0
        y.append(pulso * forca + sopro_ * r.uniform(-1, 1))
    return passa_baixa(y, 3500)


def ressoar(x: list[float], freq, banda: float) -> list[float]:
    """Ressonador de dois polos; `freq` pode ser número ou função do tempo."""
    r = math.exp(-math.pi * banda / TAXA)
    y1 = y2 = 0.0
    y = []
    fixo = not callable(freq)
    if fixo:
        c = 2 * r * math.cos(TAU * freq / TAXA)
    for i, v in enumerate(x):
        if not fixo:
            c = 2 * r * math.cos(TAU * freq(i / TAXA) / TAXA)
        s = (1 - r) * v + c * y1 - r * r * y2
        y2, y1 = y1, s
        y.append(s)
    return y


def vogal(fonte: list[float], de: str, para: str | None = None, escala: float = 1.0) -> list[float]:
    """Filtra a fonte pelas formantes de uma vogal, deslizando para outra."""
    dur = len(fonte) / TAXA
    para = para or de
    partes = []
    for (f1, b, g), (f2, _, _) in zip(VOGAIS[de], VOGAIS[para]):
        partes.append(ganho(ressoar(fonte, lambda t, f1=f1, f2=f2: escala * (f1 + (f2 - f1) * min(1, t / dur)), b * escala), g))
    return mistura(*partes)


def aspira(segundos: float, semente: int) -> list[float]:
    """O "h" antes do grunhido: ar passando."""
    return env(faixa(ruido(segundos, semente), 600, 4000), 0.005, segundos / 2)


# ---------------------------------------------------------------- camada 1

def ui_mover():
    return env(tom(0.05, lambda t: 1900, 'quadrada'), 0.001, 0.012)


def ui_travar():
    return mistura(ganho(batida(160, 60, 0.3, 0.12), 1.2), ganho(apito(0.1), 0.4), inicio=[0, 0.05])


def plim():
    """Abertura (03/11/2026): sino de console quando a logo fica nítida.
    Um blip de onda quadrada dá o ataque de 8 bits; o sino em sol com dois
    harmônicos curtos soa e some, com um eco pequeno."""
    blip = ganho(env(tom(0.05, lambda t: 1760, 'quadrada'), 0.001, 0.015), 0.3)
    sino = mistura(*[ganho(env(tom(0.8, lambda t, f=f: f), 0.002, q), g)
                     for f, q, g in ((1568, 0.3, 1.0), (3136, 0.16, 0.45), (4704, 0.08, 0.2))])
    return eco(mistura(blip, pico(sino)), 0.11, 2, 0.25)


# ---------------------------------------------------------------- camada 2

def torcida():
    """Multidão em loop: ruído em faixa de voz que respira, e vozes soltas."""
    dur = 4.0
    base = faixa(ruido(dur + 0.5, 11), 250, 1400)
    r = random.Random(12)
    lento = [0.6 + 0.4 * math.sin(TAU * 0.35 * i / TAXA + 1.3) * math.sin(TAU * 0.13 * i / TAXA) for i in range(len(base))]
    corpo = [b * l for b, l in zip(base, lento)]
    vozes = []
    inicios = []
    for _ in range(26):
        f = r.uniform(170, 420)
        d = r.uniform(0.15, 0.4)
        vozes.append(env(faixa(tom(d, lambda t, f=f: f * (1 + 0.15 * math.sin(TAU * 5 * t)), 'serra'), 200, 1800), 0.04, d / 2.5))
        inicios.append(r.uniform(0, dur))
    y = mistura(corpo, *[ganho(v, 0.12) for v in vozes], inicio=[0] + inicios)
    # Emenda: o fim volta suave no começo, para o loop não estalar.
    tamanho, cruz = n(dur), n(0.5)
    saida = y[:tamanho]
    for i in range(cruz):
        a = i / cruz
        saida[i] = saida[i] * a + y[tamanho + i] * (1 - a)
    return saida


def round_():
    surdo = mistura(batida(120, 55, 0.4, 0.14), ganho(env(passa_baixa(ruido(0.05, 3), 900), 0.001, 0.02), 0.6))
    return mistura(surdo, surdo, inicio=[0, 0.26])


def luta_comeca():
    return apito(0.65, 3050)


def ko():
    return mistura(ganho(batida(110, 40, 0.8, 0.3), 1.3), apito(0.9, 3000, desce=600))


def tempo_esgotado():
    return mistura(apito(0.16), apito(0.16), inicio=[0, 0.24])


def vitoria():
    subida = tom(0.55, lambda t: 700 + 2600 * (t / 0.55) ** 1.5)
    subida = [v * (0.25 + 0.75 * i / len(subida)) * 0.5 for i, v in enumerate(subida)]
    estouro = env(passa_baixa(ruido(0.9, 21), 1600), 0.001, 0.22)
    r = random.Random(22)
    estalos = [env(passa_alta(ruido(0.02, 30 + k), 2500), 0.0005, 0.006) for k in range(14)]
    return mistura(subida, ganho(estouro, 1.4), *[ganho(e, 0.5) for e in estalos],
                   inicio=[0, 0.55] + [0.65 + r.uniform(0, 0.6) for _ in estalos])


def relogio():
    return mistura(env(tom(0.04, lambda t: 1300), 0.0005, 0.01), ganho(env(tom(0.04, lambda t: 2600), 0.0005, 0.006), 0.4))


def especial_pronto():
    notas = [523, 659, 784, 1047]
    partes = [env(tom(0.4, lambda t, f=f: f), 0.004, 0.12) for f in notas]
    brilho = ganho(pico(sopro(0.35, 1500, 5000, 84)), 0.35)
    return eco(mistura(pico(mistura(*partes, inicio=[0.05 * k for k in range(len(notas))])), brilho), 0.09, 2, 0.3)


def especial_entrada():
    brilho = env(passa_alta(ruido(0.6, 41), 3500), 0.002, 0.14)
    metal = mistura(*[env(tom(0.6, lambda t, f=f: f), 0.002, 0.2) for f in (2900, 4170, 5380)])
    return mistura(ganho(brilho, 0.8), ganho(metal, 0.25), ganho(batida(140, 50, 0.5, 0.15), 1.1))


# ---------------------------------------------------------------- camada 3

def passo():
    return mistura(ganho(batida(130, 70, 0.08, 0.025), 0.8), ganho(env(passa_baixa(ruido(0.05, 51), 500), 0.001, 0.015), 0.5))


def sopro(segundos: float, ini: float, fim: float, semente: int) -> list[float]:
    centro = lambda t: ini + (fim - ini) * (t / segundos)
    x = faixa_movel(ruido(segundos, semente), centro)
    return [v * math.sin(math.pi * i / len(x)) ** 1.5 for i, v in enumerate(x)]


def pulo():
    return sopro(0.2, 500, 1800, 61)


def aterrissar():
    return mistura(ganho(batida(80, 38, 0.25, 0.07), 1.2), batida(130, 60, 0.15, 0.04),
                   ganho(env(passa_baixa(ruido(0.12, 62), 400), 0.001, 0.035), 0.8))


def dash():
    return sopro(0.16, 2200, 700, 63)


def queda():
    corpo = mistura(ganho(batida(90, 35, 0.6, 0.12), 1.4), ganho(env(passa_baixa(ruido(0.3, 64), 500), 0.001, 0.08), 1.0))
    poeira = env(faixa(ruido(0.5, 65), 800, 3000), 0.02, 0.15)
    return mistura(corpo, ganho(batida(70, 35, 0.3, 0.07), 0.8), ganho(poeira, 0.15), inicio=[0, 0.18, 0.05])


def tontura():
    # Cabeça zonza: zumbido no ouvido e um vento que vai e volta. Sem passarinho.
    dur = 1.1
    zumbido = env(tom(dur, lambda t: 2900 + 35 * math.sin(TAU * 3 * t)), 0.08, 0.45)
    vento = faixa_movel(ruido(dur, 66), lambda t: 520 + 260 * math.sin(TAU * 2.2 * t), 0.7)
    vento = [v * math.sin(math.pi * i / len(vento)) for i, v in enumerate(vento)]
    return mistura(ganho(pico(zumbido), 0.18), pico(vento))


# ---------------------------------------------------------------- camada 4

def ar_leve():
    return sopro(0.1, 3200, 1800, 71)


def ar_pesado():
    return sopro(0.24, 1300, 400, 72)


def impacto_leve():
    tapa = env(passa_alta(ruido(0.08, 73), 900), 0.0005, 0.018)
    return mistura(tapa, ganho(batida(320, 160, 0.08, 0.02), 0.5))


def impacto_pesado():
    estalo = env(passa_alta(ruido(0.03, 74), 2000), 0.0003, 0.006)
    corpo = env(passa_baixa(ruido(0.2, 75), 1400), 0.0008, 0.04)
    return mistura(ganho(estalo, 0.6), corpo, ganho(batida(160, 60, 0.25, 0.07), 1.2))


def impacto_baixo():
    arrasto = env(faixa(ruido(0.3, 76), 1200, 4000), 0.01, 0.09)
    return mistura(impacto_pesado(), ganho(arrasto, 0.35), inicio=[0, 0.02])


def impacto_especial():
    pancada = mistura(ganho(batida(100, 35, 0.7, 0.2), 1.5), env(passa_baixa(ruido(0.4, 77), 1800), 0.0008, 0.07),
                      ganho(env(passa_alta(ruido(0.04, 78), 2200), 0.0003, 0.01), 0.7))
    return eco(pancada, 0.11, 3, 0.35)


def defesa():
    return mistura(ganho(env(passa_baixa(ruido(0.12, 79), 650), 0.001, 0.03), 1.2), ganho(batida(220, 120, 0.1, 0.03), 0.6))


def defesa_quebrada():
    estalos = [env(passa_alta(ruido(0.03, 80 + k), 1800), 0.0003, 0.008) for k in range(4)]
    return mistura(ganho(batida(180, 70, 0.2, 0.05), 0.9), *estalos, inicio=[0, 0, 0.025, 0.045, 0.07])


def defesa_perfeita():
    ting = mistura(*[env(tom(0.6, lambda t, f=f: f), 0.001, 0.18) for f in (2637, 3951, 5274)])
    return mistura(ganho(ting, 0.5), ganho(sopro(0.12, 3000, 5000, 81), 0.5))


def projetil_lancar():
    return sopro(0.15, 1600, 900, 82)


def especial_carga():
    dur = 0.75
    zumbido = tom(dur, lambda t: 110 + 380 * (t / dur) ** 1.3, 'serra')
    tremolo = [v * (0.6 + 0.4 * math.sin(TAU * (8 + 14 * i / n(dur)) * i / TAXA)) * min(1, i / n(0.1)) for i, v in enumerate(zumbido)]
    return mistura(ganho(passa_baixa(tremolo, 1800), 0.9), ganho(sopro(dur, 400, 2600, 83), 0.4))


SONS = {
    'ui-mover': ui_mover, 'ui-travar': ui_travar, 'plim': plim,
    'round': round_, 'luta-comeca': luta_comeca, 'ko': ko,
    'tempo-esgotado': tempo_esgotado, 'vitoria': vitoria, 'relogio': relogio,
    'especial-pronto': especial_pronto, 'especial-entrada': especial_entrada,
    'passo': passo, 'pulo': pulo, 'aterrissar': aterrissar, 'dash': dash, 'queda': queda, 'tontura': tontura,
    'ar-leve': ar_leve, 'ar-pesado': ar_pesado, 'impacto-leve': impacto_leve, 'impacto-pesado': impacto_pesado,
    'impacto-baixo': impacto_baixo, 'impacto-especial': impacto_especial, 'defesa': defesa,
    'defesa-quebrada': defesa_quebrada, 'defesa-perfeita': defesa_perfeita,
    'projetil-lancar': projetil_lancar, 'especial-carga': especial_carga,
}


# ---------------------------------------------------------------- camada 5: cada mascote

def tiro_garrucha():
    estalo = env(passa_alta(ruido(0.02, 101), 2500), 0.0002, 0.004)
    estouro = mistura(env(passa_baixa(ruido(0.3, 102), 2200), 0.0005, 0.05), ganho(batida(90, 40, 0.3, 0.07), 1.3))
    polvora = env(passa_alta(ruido(0.5, 103), 3000), 0.01, 0.15)
    return mistura(ganho(estalo, 1.2), eco(estouro, 0.13, 3, 0.3), ganho(polvora, 0.12), inicio=[0, 0, 0.03])


def caravela():
    dur = 2.4
    # Onda: ruído grave que cresce e quebra no fim.
    mar = passa_baixa(ruido(dur, 104), 700)
    mar = [v * (0.25 + 0.75 * (i / len(mar)) ** 1.6) * (0.75 + 0.25 * math.sin(TAU * 0.9 * i / TAXA)) for i, v in enumerate(mar)]
    espuma = env(faixa(ruido(0.9, 105), 1200, 5000), 0.05, 0.3)
    # Madeira rangendo: trem de pulsos graves com o tom tremendo.
    r = random.Random(106)
    rangidos, inicios = [], []
    for k in range(4):
        d = r.uniform(0.25, 0.45)
        f0 = r.uniform(70, 110)
        pulsos = tom(d, lambda t, f0=f0, d=d: f0 * (1 + 0.35 * t / d) * (1 + 0.08 * math.sin(TAU * 23 * t)), 'serra')
        rangidos.append(env(faixa(pulsos, 150, 1600), 0.03, d / 2))
        inicios.append(0.2 + k * 0.5 + r.uniform(0, 0.15))
    return mistura(mar, ganho(espuma, 0.5), *[ganho(x, 0.35) for x in rangidos], inicio=[0, dur - 0.9] + inicios)


def sino_navio():
    def badalada():
        parciais = [(520, 1.0, 0.5), (1248, 0.5, 0.35), (1690, 0.35, 0.25), (2600, 0.2, 0.15)]
        return mistura(*[ganho(env(tom(1.1, lambda t, f=f: f), 0.001, q), g) for f, g, q in parciais])
    return mistura(badalada(), badalada(), inicio=[0, 0.32])


def bicada():
    def toc(semente):
        estalo = env(passa_alta(ruido(0.012, semente), 2500), 0.0002, 0.003)
        return mistura(pico(estalo), ganho(pico(batida(260, 130, 0.07, 0.016)), 0.8))
    return mistura(toc(150), toc(151), inicio=[0, 0.09])


def asas():
    def bater(semente, g):
        return ganho(env(faixa(ruido(0.18, semente), 250, 1400), 0.02, 0.05), g)
    return mistura(bater(110, 0.6), bater(111, 0.8), bater(112, 1.0), sopro(0.3, 1400, 500, 113),
                   inicio=[0, 0.14, 0.3, 0.32])


def termica():
    dur = 1.1
    x = faixa_movel(ruido(dur, 114), lambda t: 300 + 900 * t / dur, 0.9)
    return [v * min(1, i / n(0.2)) * (0.7 + 0.3 * math.sin(TAU * 4 * i / TAXA)) for i, v in enumerate(x)]


def meteoro():
    # Subida do mergulho: ar grave puxado para cima. O resto é `mergulho` e `meteoro-pouso`.
    dur = 0.5
    vento = sopro(dur, 250, 1300, 115)
    ronco = env(passa_baixa(ruido(dur, 116), 160), 0.05, 0.2, 0.2)
    return mistura(pico(vento), ganho(pico(ronco), 0.7))


def cachimbo():
    dur = 0.7
    giro_ = faixa_movel(ruido(dur, 160), lambda t: 900 + 450 * math.sin(TAU * 6 * t), 0.6)
    giro_ = [v * math.sin(math.pi * i / len(giro_)) for i, v in enumerate(giro_)]
    r = random.Random(161)
    brasas = [env(passa_alta(ruido(0.006, 162 + k), 3000), 0.0002, 0.002) for k in range(10)]
    return mistura(pico(giro_), *[ganho(pico(b), 0.25) for b in brasas], inicio=[0] + [r.uniform(0.05, 0.6) for _ in brasas])


def tornado():
    dur = 1.3
    x = faixa_movel(ruido(dur, 117), lambda t: 850 + 550 * math.sin(TAU * 3 * t), 0.8)
    return [v * math.sin(math.pi * i / len(x)) ** 0.7 for i, v in enumerate(x)]


def po_de_arroz():
    puf = env(passa_baixa(ruido(0.4, 118), 900), 0.03, 0.12)
    r = random.Random(119)
    brilhos = [env(tom(0.12, lambda t, f=r.uniform(4000, 7000): f), 0.001, 0.03) for _ in range(7)]
    return mistura(puf, *[ganho(b, 0.15) for b in brilhos], inicio=[0] + [0.05 + 0.06 * k for k in range(7)])


def garra():
    def risco(semente, ini):
        return faixa_movel(env(ruido(0.09, semente), 0.002, 0.03), lambda t: ini - 2500 * t / 0.09, 0.5)
    return mistura(risco(120, 5000), risco(121, 4600), risco(122, 4200), inicio=[0, 0.04, 0.08])


def mordida():
    def crunch(semente):
        return mistura(env(passa_baixa(ruido(0.07, semente), 1600), 0.0005, 0.02),
                       ganho(env(passa_alta(ruido(0.01, semente + 1), 2500), 0.0002, 0.003), 0.8))
    return mistura(crunch(140), crunch(142), inicio=[0, 0.08])


def bote():
    def pata(semente):
        return mistura(ganho(batida(140, 70, 0.07, 0.02), 0.7), ganho(env(passa_baixa(ruido(0.04, semente), 700), 0.001, 0.01), 0.5))
    galope = [pata(130 + k) for k in range(6)]
    return mistura(*galope, mordida(), inicio=[0.0, 0.09, 0.27, 0.36, 0.54, 0.63, 0.85])


def assobio_dedos():
    def nota(d, a, b):
        return env(tom(d, lambda t: a + (b - a) * min(1, t / (d * 0.4))), 0.01, d / 2, d / 3)
    sopro_ = ganho(env(passa_alta(ruido(0.7, 123), 3000), 0.01, 0.2), 0.08)
    return mistura(nota(0.22, 2000, 2900), nota(0.35, 2300, 3100), sopro_, inicio=[0, 0.3, 0])


def coco():
    splat = env(passa_baixa(ruido(0.25, 124), 1200), 0.001, 0.05)
    molhado = [v * math.sin(TAU * 140 * i / TAXA) for i, v in enumerate(env(ruido(0.2, 125), 0.001, 0.05))]
    r = random.Random(126)
    respingos = [env(ressoar(ruido(0.05, 170 + k), r.uniform(300, 650), 90), 0.001, 0.015) for k in range(4)]
    return mistura(pico(splat), ganho(pico(passa_baixa(molhado, 1500)), 0.7), *[ganho(pico(g), 0.2) for g in respingos],
                   inicio=[0, 0] + [0.05 + 0.05 * k for k in range(4)])


def latido():
    return mistura(au(210, 1.0), au(211, 0.92), inicio=[0, 0.22])


def giro():
    x = sopro(0.5, 1800, 700, 127)
    return [v * (0.45 + 0.55 * abs(math.sin(TAU * 5 * i / TAXA))) for i, v in enumerate(x)]


def ovo_arremesso():
    return sopro(0.13, 2400, 1300, 128)


def ovo_quebra():
    estalos = [env(passa_alta(ruido(0.015, 129 + k), 2500), 0.0002, 0.003) for k in range(5)]
    gema = env(passa_baixa(ruido(0.2, 135), 900), 0.002, 0.05)
    return mistura(*estalos, ganho(gema, 0.9), inicio=[0, 0.012, 0.026, 0.035, 0.05, 0.03])


def cacarejo():
    # Galo bravo: dois "có" secos e um grito rouco, sem melodia.
    def co(semente):
        return env(vogal(glote(0.08, lambda t: 430, semente, 0.06, 0.4), 'o', escala=1.3), 0.004, 0.03)
    grito = vogal(glote(0.32, lambda t: 560 + 260 * math.sin(math.pi * t / 0.32), 182, 0.08, 0.6), 'a', 'e', 1.5)
    grito = env(grito, 0.01, 0.12, 0.12)
    return mistura(pico(co(180)), pico(co(181)), pico(grito), inicio=[0, 0.12, 0.26])


def laser():
    # Feixe queimando: chiado contínuo com zumbido grave por baixo, sem "piu".
    dur = 0.34
    chiado = faixa(ruido(dur, 136), 2200, 7000)
    chiado = [v * (0.75 + 0.25 * math.sin(TAU * 37 * i / TAXA)) for i, v in enumerate(chiado)]
    zumbido = passa_baixa(tom(dur, lambda t: 110, 'serra'), 900)
    corpo = env(mistura(ganho(pico(chiado), 0.6), pico(zumbido)), 0.006, 0.12, 0.12)
    estalo = env(passa_alta(ruido(0.015, 137), 2500), 0.0002, 0.004)
    return mistura(ganho(pico(estalo), 0.6), corpo)


def corte():
    return mistura(sopro(0.14, 4200, 2000, 137), ganho(env(passa_alta(ruido(0.02, 138), 3000), 0.0002, 0.004), 0.5),
                   inicio=[0, 0.11])


def bora_bahea():
    estrondo = ganho(batida(90, 40, 0.6, 0.18), 1.2)
    rugido = faixa_movel(ruido(1.0, 139), lambda t: 350 + 500 * t, 0.8)
    rugido = [v * min(1, i / n(0.15)) * math.exp(-max(0, i / TAXA - 0.5) / 0.2) for i, v in enumerate(rugido)]
    return eco(mistura(estrondo, ganho(rugido, 1.2)), 0.12, 2, 0.3)


def coice():
    return mistura(sopro(0.18, 900, 400, 144), ganho(batida(80, 35, 0.35, 0.09), 1.4),
                   ganho(env(passa_baixa(ruido(0.15, 145), 800), 0.0008, 0.04), 0.8), inicio=[0, 0.16, 0.16])


def enjoo():
    # Barriga roncando e gorgolejo: ruído grave e bolhas de verdade (ruído ressoado), sem "blip".
    dur = 0.9
    ronco = passa_baixa(ruido(dur, 147), 180)
    ronco = [v * (0.6 + 0.4 * math.sin(TAU * 3 * i / TAXA)) * math.sin(math.pi * i / len(ronco)) for i, v in enumerate(ronco)]
    r = random.Random(146)
    bolhas = [env(ressoar(ruido(0.07, 190 + k), r.uniform(180, 420), 50), 0.003, 0.02) for k in range(7)]
    return mistura(pico(ronco), *[ganho(pico(b), 0.45) for b in bolhas], inicio=[0] + [r.uniform(0.05, 0.75) for _ in bolhas])


def vomito():
    r = random.Random(148)
    jato = passa_baixa(ruido(0.9, 149), 1000)
    jato = [v * (0.6 + 0.4 * math.sin(TAU * 11 * i / TAXA)) * min(1, i / n(0.04)) * math.exp(-max(0, i / TAXA - 0.45) / 0.15)
            for i, v in enumerate(jato)]
    bolhas = [env(ressoar(ruido(0.06, 200 + k), r.uniform(150, 350), 60), 0.003, 0.02) for k in range(5)]
    chao = env(faixa(ruido(0.3, 206), 300, 2500), 0.003, 0.08)
    return mistura(pico(jato), *[ganho(pico(b), 0.3) for b in bolhas], ganho(pico(chao), 0.6),
                   inicio=[0] + [r.uniform(0.05, 0.6) for _ in bolhas] + [0.55])


def au(semente: int, tom_: float = 1.0) -> list[float]:
    """Um latido: rosnado curto que sobe e cai, abrindo em "a" e fechando em "u"."""
    dur = 0.15
    fonte = glote(dur, lambda t: tom_ * (330 + 230 * math.sin(math.pi * t / dur)), semente, 0.07, 0.45)
    voz = vogal(fonte, 'a', 'u', 1.15)
    voz = [v * min(1, i / n(0.006)) * math.exp(-max(0, i / TAXA - 0.045) / 0.04) for i, v in enumerate(voz)]
    peito = batida(170, 90, 0.08, 0.025)
    return mistura(pico(voz), ganho(pico(peito), 0.35))


def latido_voo():
    # O Biriba atravessa a tela latindo: au... au-au.
    return mistura(au(212, 1.0), au(213, 1.05), au(214, 0.95), inicio=[0, 0.55, 0.75])


def mergulho():
    # O Urubu desce: ronco de ar que engrossa até o chão (0,45 s, o tempo do mergulho).
    dur = 0.45
    ar = faixa_movel(ruido(dur, 220), lambda t: 1400 - 1100 * t / dur, 0.8)
    ar = [v * (0.2 + 0.8 * (i / len(ar)) ** 1.5) for i, v in enumerate(ar)]
    grave = passa_baixa(ruido(dur, 221), 140)
    grave = [v * (i / len(grave)) ** 2 for i, v in enumerate(grave)]
    return mistura(pico(ar), ganho(pico(grave), 0.9))


def meteoro_pouso():
    # Pouso do mergulho: estrondo grave, chão tremendo e cascalho caindo.
    estrondo = pico(batida(75, 26, 1.6, 0.45))
    tremor = env(passa_baixa(ruido(1.8, 222), 110), 0.004, 0.5)
    estalo = env(passa_alta(ruido(0.04, 223), 1500), 0.0003, 0.012)
    r = random.Random(224)
    cascalho = [env(passa_baixa(ruido(0.03, 225 + k), 2500), 0.0005, 0.01) for k in range(22)]
    pancada = mistura(estrondo, ganho(pico(tremor), 0.9), ganho(pico(estalo), 0.5))
    return mistura(eco(pancada, 0.13, 3, 0.3), *[ganho(pico(c), r.uniform(0.04, 0.12)) for c in cascalho],
                   inicio=[0] + [0.15 + r.uniform(0, 0.9) for _ in cascalho])


# ---------------------------------------------------------------- dor
# Grunhido curto quando o golpe entra. A voz é a mesma; o motor varia o tom a
# cada vez (detune), para não repetir igual.

def grunhido(dur, f0, de, para, semente, tremor=0.03, sopro_=0.3, escala=1.0, solta=0.06):
    fonte = glote(dur, f0, semente, tremor, sopro_)
    voz = vogal(fonte, de, para, escala)
    voz = [v * min(1, i / n(0.012)) * math.exp(-max(0, i / TAXA - dur * 0.35) / solta) for i, v in enumerate(voz)]
    return mistura(ganho(pico(aspira(0.05, semente + 1)), 0.25), pico(voz), inicio=[0, 0.02])


def dor():
    return grunhido(0.2, lambda t: 150 - 220 * t, 'neutra', 'u', 300)


def dor_forte():
    return grunhido(0.42, lambda t: 180 - 190 * t, 'a', 'o', 302, tremor=0.05, sopro_=0.4, solta=0.12)


def dor_ko():
    return grunhido(0.75, lambda t: 165 - 120 * t, 'a', 'u', 304, tremor=0.06, sopro_=0.45, solta=0.25)


def dor_porco():
    g = grunhido(0.2, lambda t: 88 - 60 * t, 'u', 'neutra', 310, tremor=0.08, sopro_=0.5, escala=0.85)
    return [v * (0.55 + 0.45 * math.sin(TAU * 32 * i / TAXA)) for i, v in enumerate(g)]


def dor_forte_porco():
    return mistura(dor_porco(), ganho(dor_porco(), 1.1), inicio=[0, 0.17])


def dor_galo():
    return grunhido(0.2, lambda t: 600 + 500 * math.sin(math.pi * t / 0.2), 'a', 'e', 320, tremor=0.08, sopro_=0.6, escala=1.5, solta=0.05)


def dor_forte_galo():
    grito = grunhido(0.36, lambda t: 560 + 380 * math.sin(math.pi * t / 0.36), 'a', 'e', 322, tremor=0.09, sopro_=0.6, escala=1.5, solta=0.09)
    return mistura(pico(grito), ganho(pico(asas()), 0.35), inicio=[0, 0.05])


def dor_urubu():
    chiado = env(faixa(ruido(0.3, 330), 1800, 6000), 0.01, 0.1)
    ronco = grunhido(0.2, lambda t: 70, 'o', 'u', 331, tremor=0.12, sopro_=0.7, escala=0.9)
    return mistura(ganho(pico(chiado), 0.7), pico(ronco), inicio=[0, 0.04])


def dor_forte_urubu():
    chiado = env(faixa(ruido(0.5, 332), 1800, 6000), 0.01, 0.18)
    ronco = grunhido(0.35, lambda t: 75, 'a', 'u', 333, tremor=0.12, sopro_=0.7, escala=0.9, solta=0.1)
    return mistura(ganho(pico(chiado), 0.8), pico(ronco), inicio=[0, 0.05])


def dor_cao():
    return grunhido(0.13, lambda t: 820 - 1800 * t, 'a', 'u', 340, tremor=0.05, sopro_=0.4, escala=1.3, solta=0.035)


def dor_forte_cao():
    ganido = grunhido(0.35, lambda t: 680 - 400 * t, 'u', 'u', 342, tremor=0.06, sopro_=0.35, escala=1.2, solta=0.1)
    return mistura(pico(dor_cao()), ganho(pico(ganido), 0.6), inicio=[0, 0.16])


# ---------------------------------------------------------------- torcida à toa
# Sons soltos por cima do loop, em hora sorteada: o estádio vive sozinho.

def multidao(notas, vozes: int, vogal_: str, semente: int, base: float = 190.0) -> list[float]:
    """Coro: `notas` é [(início, duração, semitom)]; cada voz com seu tom e atraso."""
    r = random.Random(semente)
    fim = max(a + d for a, d, _ in notas) + 0.2
    fontes = []
    for k in range(vozes):
        alt = base * r.choice([0.5, 1.0, 1.0, 2.0]) * 2 ** (r.uniform(-0.5, 0.5) / 12)
        for a, d, st in notas:
            f = alt * 2 ** (st / 12)
            g = glote(d, lambda t, f=f, vib=r.uniform(4, 6.5): f * (1 + 0.012 * math.sin(TAU * vib * t)), semente + k * 31 + int(a * 100), 0.02, 0.35)
            g = [v * min(1, i / n(0.06)) * min(1, (len(g) - i) / n(0.08)) for i, v in enumerate(g)]
            fontes.append((g, a + r.uniform(0, 0.07)))
    soma = mistura(*[g for g, _ in fontes], inicio=[a for _, a in fontes])
    soma += [0.0] * max(0, n(fim) - len(soma))
    coro = vogal(soma, vogal_)
    fundo = faixa(ruido(len(coro) / TAXA, semente + 1), 300, 1800)
    return eco(mistura(pico(coro), ganho(pico(fundo), 0.25)), 0.09, 3, 0.4)


def torcida_coro():
    notas = [(0, 0.42, 0), (0.48, 0.42, 0), (0.96, 0.3, 2), (1.3, 0.3, 0), (1.64, 0.7, -3)]
    return passa_baixa(multidao(notas, 26, 'o', 400), 3000)


def torcida_uh():
    # "Uuuuh!" de quase-gol: sobe junto e cai.
    r = random.Random(410)
    dur = 1.3
    fontes = [glote(dur, lambda t, b=190 * r.choice([0.5, 1.0, 2.0]) * r.uniform(0.95, 1.05): b * (1 + 0.25 * math.sin(math.pi * t / dur)), 411 + k, 0.02, 0.35)
              for k in range(24)]
    soma = mistura(*fontes, inicio=[r.uniform(0, 0.1) for _ in fontes])
    soma = [v * math.sin(math.pi * min(1, i / len(soma))) ** 0.8 for i, v in enumerate(soma)]
    return eco(passa_baixa(vogal(soma, 'u', 'o'), 2500), 0.1, 3, 0.4)


def torcida_assobio():
    r = random.Random(420)
    assobios = []
    for k in range(10):
        d = r.uniform(0.3, 0.7)
        a, b = r.uniform(2200, 3000), r.uniform(2400, 3300)
        assobios.append(env(tom(d, lambda t, a=a, b=b, d=d: a + (b - a) * min(1, t / d)), 0.03, d / 2, d / 3))
    fundo = faixa(ruido(2.0, 421), 300, 1800)
    fundo = [v * math.sin(math.pi * i / len(fundo)) for i, v in enumerate(fundo)]
    return passa_baixa(mistura(ganho(pico(fundo), 0.5), *[ganho(pico(x), 0.18) for x in assobios],
                               inicio=[0] + [r.uniform(0, 1.3) for _ in assobios]), 4500)


def torcida_batucada():
    # Surdo, caixa e repique de arquibancada, de longe.
    batida_s = 60 / 150
    r = random.Random(430)
    partes, inicios = [], []
    for compasso in range(2):
        for tempo in range(4):
            t0 = (compasso * 4 + tempo) * batida_s
            partes.append(ganho(pico(batida(85 if tempo % 2 else 70, 45, 0.4, 0.13)), 1.0 if tempo % 2 else 0.8))
            inicios.append(t0)
            for sub in range(4):
                forte = sub == 0 or (sub == 2 and tempo % 2)
                caixa = env(faixa(ruido(0.08, 431 + compasso * 100 + tempo * 10 + sub), 1500, 6000), 0.0005, 0.03 if forte else 0.018)
                partes.append(ganho(pico(caixa), 0.45 if forte else 0.22))
                inicios.append(max(0.0, t0 + sub * batida_s / 4 + r.uniform(-0.006, 0.006)))
    return eco(passa_baixa(mistura(*partes, inicio=inicios), 3800), 0.11, 2, 0.3)


def torcida_palmas():
    r = random.Random(440)
    ritmo = [0, 0.42, 0.84, 1.05, 1.26]
    partes, inicios = [], []
    for t0 in ritmo:
        for k in range(40):
            partes.append(ganho(env(faixa(ruido(0.03, 441 + int(t0 * 1000) + k), 800, 3500), 0.0005, 0.008), r.uniform(0.5, 1)))
            inicios.append(max(0.0, t0 + r.gauss(0, 0.018)))
    return eco(mistura(*partes, inicio=inicios), 0.08, 2, 0.35)

SONS.update({
    'tiro-garrucha': tiro_garrucha, 'caravela': caravela, 'sino-navio': sino_navio,
    'bicada': bicada, 'asas': asas, 'termica': termica, 'meteoro': meteoro,
    'cachimbo': cachimbo, 'tornado': tornado, 'po-de-arroz': po_de_arroz,
    'garra': garra, 'bote': bote, 'assobio-dedos': assobio_dedos, 'coco': coco, 'latido': latido,
    'giro': giro, 'ovo-arremesso': ovo_arremesso, 'ovo-quebra': ovo_quebra, 'cacarejo': cacarejo,
    'laser': laser, 'corte': corte, 'bora-bahea': bora_bahea,
    'mordida': mordida, 'coice': coice, 'enjoo': enjoo, 'vomito': vomito,
    # Entrega 3: voz, latido, pouso do Urubu, torcida à toa.
    'latido-voo': latido_voo, 'mergulho': mergulho, 'meteoro-pouso': meteoro_pouso,
    'dor': dor, 'dor-forte': dor_forte, 'dor-ko': dor_ko,
    'dor-porco': dor_porco, 'dor-forte-porco': dor_forte_porco, 'dor-galo': dor_galo, 'dor-forte-galo': dor_forte_galo,
    'dor-urubu': dor_urubu, 'dor-forte-urubu': dor_forte_urubu, 'dor-cao': dor_cao, 'dor-forte-cao': dor_forte_cao,
    'torcida-coro': torcida_coro, 'torcida-uh': torcida_uh, 'torcida-assobio': torcida_assobio,
    'torcida-batucada': torcida_batucada, 'torcida-palmas': torcida_palmas,
})

LOOPS: set[str] = set()


def gravar(nome: str, dados: list[float], pico_alvo: float = 0.85) -> None:
    if nome not in LOOPS:
        # Fade de 8 ms no fim: som cortado no meio estala no alto-falante.
        cauda = n(0.008)
        dados = dados[:-cauda] + [v * (1 - k / cauda) for k, v in enumerate(dados[-cauda:])]
    pico = max(abs(v) for v in dados) or 1.0
    with wave.open(str(PASTA / f'{nome}.wav'), 'wb') as arquivo:
        arquivo.setnchannels(1)
        arquivo.setsampwidth(2)
        arquivo.setframerate(TAXA)
        arquivo.writeframes(b''.join(struct.pack('<h', int(v / pico * pico_alvo * 32767)) for v in dados))
    print(f'{nome}.wav: {len(dados) / TAXA:.2f} s')


def main() -> None:
    PASTA.mkdir(parents=True, exist_ok=True)
    from sons_gravados import SONS as GRAVADOS
    nomes = [nome for nome in sys.argv[1:] or list(SONS) if nome not in GRAVADOS]
    for nome in nomes:
        gravar(nome, SONS[nome]())


if __name__ == '__main__':
    main()
