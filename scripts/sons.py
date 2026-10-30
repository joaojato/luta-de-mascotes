"""Sintetiza os sons do jogo (docs/sons.md, ADR 0007).

Só biblioteca padrão. Cada som é uma função que devolve amostras entre -1 e
1; o script normaliza e grava WAV mono 22 kHz em public/assets/audio/sfx/.

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


# ---------------------------------------------------------------- camada 1

def ui_mover():
    return env(tom(0.05, lambda t: 1900, 'quadrada'), 0.001, 0.012)


def ui_travar():
    return mistura(ganho(batida(160, 60, 0.3, 0.12), 1.2), ganho(apito(0.1), 0.4), inicio=[0, 0.05])


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
    notas = [1047, 1319, 1568, 2093]
    partes = [env(tom(0.22, lambda t, f=f: f, 'quadrada'), 0.002, 0.06) for f in notas]
    return ganho(mistura(*partes, inicio=[0.055 * k for k in range(len(notas))]), 0.35)


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
    return mistura(batida(110, 50, 0.15, 0.04), ganho(env(passa_baixa(ruido(0.1, 62), 400), 0.001, 0.03), 0.8))


def dash():
    return sopro(0.16, 2200, 700, 63)


def queda():
    corpo = mistura(ganho(batida(90, 35, 0.6, 0.12), 1.4), ganho(env(passa_baixa(ruido(0.3, 64), 500), 0.001, 0.08), 1.0))
    poeira = env(faixa(ruido(0.5, 65), 800, 3000), 0.02, 0.15)
    return mistura(corpo, ganho(batida(70, 35, 0.3, 0.07), 0.8), ganho(poeira, 0.15), inicio=[0, 0.18, 0.05])


def tontura():
    piu = lambda f: env(tom(0.09, lambda t, f=f: f + 1400 * t / 0.09), 0.004, 0.03)
    return ganho(mistura(*[piu(2400 if k % 2 == 0 else 2900) for k in range(6)], inicio=[0.14 * k for k in range(6)]), 0.6)


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
    'ui-mover': ui_mover, 'ui-travar': ui_travar,
    'torcida': torcida, 'round': round_, 'luta-comeca': luta_comeca, 'ko': ko,
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
    def toc(f):
        return mistura(env(tom(0.05, lambda t, f=f: f * (1 - 0.5 * t / 0.05)), 0.0003, 0.012),
                       ganho(env(passa_alta(ruido(0.02, int(f)), 2000), 0.0002, 0.004), 0.7))
    return mistura(toc(1900), toc(1500), inicio=[0, 0.09])


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
    subida = sopro(0.35, 400, 2600, 115)
    queda_tom = tom(0.45, lambda t: 2600 - 2000 * t / 0.45)
    assobio = [v * 0.5 * min(1, i / n(0.05)) for i, v in enumerate(queda_tom)]
    vento = sopro(0.45, 3000, 800, 116)
    return mistura(subida, assobio, ganho(vento, 0.7), impacto_especial(), inicio=[0, 0.75, 0.75, 1.2])


def cachimbo():
    dur = 0.7
    giro_ = tom(dur, lambda t: 1400 - 300 * t / dur)
    return [v * (0.5 + 0.5 * math.sin(TAU * 14 * i / TAXA)) * min(1, i / n(0.03)) * 0.6 for i, v in enumerate(giro_)]


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
    gotas = [env(tom(0.06, lambda t, f=r.uniform(500, 900): f * (1 + 2 * t)), 0.001, 0.015) for _ in range(5)]
    return mistura(splat, ganho(passa_baixa(molhado, 1500), 0.8), *[ganho(g, 0.25) for g in gotas],
                   inicio=[0, 0] + [0.06 + 0.05 * k for k in range(5)])


def latido():
    def au(f):
        voz = tom(0.13, lambda t: f * (1.3 - 0.5 * t / 0.13), 'serra')
        return env(faixa(mistura(voz, ganho(ruido(0.13, int(f)), 0.25)), 400, 2600), 0.004, 0.04)
    return mistura(au(560), au(520), inicio=[0, 0.2])


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
    def co(d, f):
        voz = tom(d, lambda t: f * (1 + 0.25 * math.sin(TAU * 30 * t)), 'serra')
        return env(faixa(voz, 500, 3000), 0.005, d / 2.5)
    return mistura(co(0.07, 700), co(0.07, 720), co(0.07, 700), co(0.28, 820), inicio=[0, 0.11, 0.22, 0.36])


def laser():
    zap = tom(0.28, lambda t: 2600 - 2200 * t / 0.28 + 120 * math.sin(TAU * 60 * t), 'quadrada')
    return mistura(ganho(env(passa_baixa(zap, 5000), 0.002, 0.1), 0.6),
                   ganho(env(passa_alta(ruido(0.2, 136), 3000), 0.001, 0.05), 0.25))


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
    r = random.Random(146)
    blips = [env(tom(0.08, lambda t, f=r.uniform(180, 420): f * (1 + 3 * t)), 0.004, 0.025) for _ in range(9)]
    ronco = env(passa_baixa(ruido(0.8, 147), 250), 0.1, 0.3, 0.3)
    return mistura(ganho(ronco, 0.8), *[ganho(b, 0.5) for b in blips], inicio=[0] + [r.uniform(0, 0.65) for _ in blips])


def vomito():
    r = random.Random(148)
    jato = passa_baixa(ruido(0.9, 149), 1000)
    jato = [v * (0.6 + 0.4 * math.sin(TAU * 11 * i / TAXA)) * min(1, i / n(0.04)) * math.exp(-max(0, i / TAXA - 0.45) / 0.15)
            for i, v in enumerate(jato)]
    blips = [env(tom(0.06, lambda t, f=r.uniform(150, 350): f * (1 + 2 * t)), 0.003, 0.02) for _ in range(6)]
    return mistura(jato, *[ganho(b, 0.4) for b in blips], inicio=[0] + [r.uniform(0.05, 0.6) for _ in blips])


SONS.update({
    'tiro-garrucha': tiro_garrucha, 'caravela': caravela, 'sino-navio': sino_navio,
    'bicada': bicada, 'asas': asas, 'termica': termica, 'meteoro': meteoro,
    'cachimbo': cachimbo, 'tornado': tornado, 'po-de-arroz': po_de_arroz,
    'garra': garra, 'bote': bote, 'assobio-dedos': assobio_dedos, 'coco': coco, 'latido': latido,
    'giro': giro, 'ovo-arremesso': ovo_arremesso, 'ovo-quebra': ovo_quebra, 'cacarejo': cacarejo,
    'laser': laser, 'corte': corte, 'bora-bahea': bora_bahea,
    'mordida': mordida, 'coice': coice, 'enjoo': enjoo, 'vomito': vomito,
})

LOOPS = {'torcida'}


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
    nomes = sys.argv[1:] or list(SONS)
    for nome in nomes:
        gravar(nome, SONS[nome]())


if __name__ == '__main__':
    main()
