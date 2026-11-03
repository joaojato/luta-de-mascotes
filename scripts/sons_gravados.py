"""Efeitos gravados do jogo (docs/sons.md, ADR 0008).

A base dos efeitos é som gravado de licença CC0 (OpenGameArt), não síntese:
o João achou a síntese "muito digitalizada" (03/11/2026). Cada som é uma
receita de camadas (trecho de um arquivo, atraso, ganho, tom) que o ffmpeg
mistura e trata: grave reforçado, saturação e compressão, o peso sujo de
Hotline Miami. Grava WAV mono 22 kHz em public/assets/audio/sfx/, por cima
do que `scripts/sons.py` sintetizava com a mesma chave.

O material bruto fica fora do git, em referencia/sons-cc0/.

Baixar os pacotes:  python scripts/sons_gravados.py baixar
Gerar tudo:         python scripts/sons_gravados.py
Gerar alguns:       python scripts/sons_gravados.py impacto-leve passo
Listar receitas:    python scripts/sons_gravados.py lista
"""
from __future__ import annotations

import math
import shutil
import struct
import subprocess
import sys
import urllib.request
import wave
import zipfile
from dataclasses import dataclass, field
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
BRUTO = RAIZ / 'referencia/sons-cc0'
PASTA = RAIZ / 'public/assets/audio/sfx'
TAXA = 22050
OGA = 'https://opengameart.org/sites/default/files/'

# Pacote (página em opengameart.org/content/<pacote>, todos CC0) → arquivos.
PACOTES = {
    '37-hitspunches': ['independent_nu_ljudbank-hits_and_punches.7z'],
    '12-wet-towel-hittingfallingpunching-floor-sounds': ['wet_towel_on_floor.7z'],
    '75-cc0-breaking-falling-hit-sfx': ['sfx_breaking_and_falling.zip'],
    '100-cc0-sfx': ['100-CC0-SFX_0.zip'],
    '100-cc0-sfx-2': ['sfx_100_v2.zip'],
    '100-cc0-metal-and-wood-sfx': ['100-CC0-wood-metal-SFX.zip'],
    '80-cc0-rpg-sfx': ['80-CC0-RPG-SFX_0.zip'],
    '80-cc0-creature-sfx': ['80-CC0-creature-SFX_0.zip'],
    'swishes-sound-pack': ['swishes.zip'],
    'air-whoosh': ['whoosh2_0.wav'],
    '10-impactshield-blocks': ['impact_-_starninjas.zip'],
    '8-wet-squish-slurp-impacts': ['independent_nu_ljudbank-wet_squish_slurp_impacts.7z'],
    '40-cc0-water-splash-slime-sfx': ['water-splash-slime-sfx.zip'],
    '5-break-crunch-impacts': ['independent_nu_ljudbank-break_crunch_impact.7z'],
    '35-wooden-crackshitsdestructions': ['independent_nu_ljudbank-wood_crack_hit_destruction.7z'],
    'dragon-flap-0': ['dragonflap.wav'],
    'gunshots': ['Black%20Powder.wav'],
    'battle-at-sea': ['cannon_fire_1.ogg', 'cannon_hit_1.ogg', 'cannon_hit_ship_short.ogg', 'ship_ram_ship_shortened.ogg'],
    'dog-sounds': ['dog.7z'],
    'crow-caw': ['crow_caw.wav'],
    'crow': ['crow_0.ogg'],
    'oooooooooooooo': ['oooooooooo_0.ogg'],
    'applause-in-a-large-hall-or-church': ['applause-clapping-church-crowd-immersive.wav'],
    'thwack-sounds': ['thwack-1.0.zip'],
    'punch': ['qubodupPunch.7z'],
    'impact': ['qubodupImpact.7z'],
    '20-sword-sound-effects-attacks-and-clashes': ['sword_-_starninjas_1.zip', 'sword_clash_-_starninjas_0.zip'],
    'fantozzis-footsteps-grasssand-stone': ['Fantozzi-footsteps.7z'],
}

# Volume percebido de cada família (dB nos 150 ms mais fortes): todo som
# sai no mesmo patamar e o volume relativo fica em src/game/sonsLista.ts.
NIVEIS = {'golpe': -10.0, 'leve': -13.0, 'natural': -13.0, 'abafado': -14.0}

# Tratamento final de cada família (cadeia de filtros do ffmpeg).
TRATAMENTOS = {
    # Pancada: grave na frente, saturada e comprimida. Hotline Miami.
    'golpe': 'equalizer=f=85:t=o:w=1.3:g=7,volume=10dB,asoftclip=type=tanh,'
             'acompressor=threshold=-16dB:ratio=5:attack=1:release=90,lowpass=f=9000',
    # Corpo e movimento: um pouco de peso, sem estourar.
    'leve': 'equalizer=f=110:t=o:w=1:g=3,volume=5dB,asoftclip=type=tanh,lowpass=f=10000',
    # Bicho, voz, ambiente: como foi gravado.
    'natural': 'highpass=f=35',
    # Torcida no fundo: abafada, como vinda de longe.
    'abafado': 'highpass=f=80,lowpass=f=2600',
}


@dataclass
class C:
    """Uma camada: trecho de um arquivo, posta num ponto do som."""
    arquivo: str            # '<pacote>/<nome do arquivo>'
    ini: float = 0.0        # onde começa o trecho no arquivo (s)
    dur: float | None = None  # quanto do arquivo usar (s)
    em: float = 0.0         # atraso da camada no som final (s)
    db: float = 0.0         # ganho da camada
    tom: float = 0.0        # semitons (muda tom e duração, como fita)
    filtro: str = ''        # filtros extras só desta camada


@dataclass
class Som:
    camadas: list[C]
    tratamento: str = 'golpe'
    dur: float | None = None   # corte final (s)
    nivel: float | None = None  # volume percebido em dB (padrão: o da família)
    loop: bool = False
    extra: list[str] = field(default_factory=list)


H = '37-hitspunches/'
P = 'punch/'
T = 'thwack-sounds/'
W = '12-wet-towel-hittingfallingpunching-floor-sounds/wet_towel_on_floor-'
SW = 'swishes-sound-pack/swish-'
SWD = '20-sword-sound-effects-attacks-and-clashes/'
MW = '100-cc0-metal-and-wood-sfx/'
S1 = '100-cc0-sfx/'
S2 = '100-cc0-sfx-2/sfx100v2_'
BF = '75-cc0-breaking-falling-hit-sfx/bfh1_'
CR = '80-cc0-creature-sfx/'
RPG = '80-cc0-rpg-sfx/'
AG = '40-cc0-water-splash-slime-sfx/'
DOG = 'dog-sounds/'
FLAP = 'dragon-flap-0/dragonflap.wav'
VENTO = 'air-whoosh/whoosh2_0.wav'

SONS: dict[str, Som] = {
    # ------------------------------------------------ golpes gerais (motor)
    'ar-leve': Som([C(SW + '10.wav', tom=-2), C(SW + '12.wav', em=0.02, db=-6, tom=-4)], 'leve'),
    'ar-pesado': Som([C(SW + '3.wav', tom=-5), C(S2 + 'air_03.ogg', db=-4, tom=-3)], 'leve', dur=0.32),
    'impacto-leve': Som([C(P + 'qubodupPunch01.flac', dur=0.28), C(T + 'thwack-02.wav', db=-7)], dur=0.3),
    'impacto-pesado': Som([C(H + 'hit22.mp3.flac'), C(P + 'qubodupPunch03.flac', db=-3)], dur=0.5),
    'impacto-baixo': Som([C(H + 'hit28.mp3.flac'), C(W + '03.flac', em=0.03, db=-3)], dur=0.5),
    'impacto-especial': Som([C(H + 'hit35.mp3.flac'), C(T + 'thwack-08.wav', db=-2),
                             C('battle-at-sea/cannon_hit_1.ogg', dur=1.0, db=-9, filtro='lowpass=f=900')],
                            dur=1.1, extra=['aecho=0.8:0.6:70:0.25']),
    'defesa': Som([C('10-impactshield-blocks/impact.5.ogg', filtro='lowpass=f=2500'),
                   C(W + '07.flac', db=-6)], 'leve', dur=0.28),
    'defesa-quebrada': Som([C(MW + 'wood_cracking_04.ogg'), C('10-impactshield-blocks/impact.4.ogg', db=-2)], dur=0.5),
    'defesa-perfeita': Som([C(SWD + 'sword_clash.8.ogg'), C('10-impactshield-blocks/impact.8.ogg', db=-8)], 'natural'),
    'projetil-lancar': Som([C(SW + '7.wav', tom=-6), C(SW + '9.wav', em=0.03, db=-5, tom=-8)], 'leve'),
    'especial-carga': Som([C(VENTO, ini=0.4, dur=1.1, filtro='afade=t=in:d=0.6'),
                           C(S2 + 'air_01.ogg', dur=1.1, db=-6, tom=3, filtro='afade=t=in:d=0.8')], 'leve', dur=1.1),
    'especial-entrada': Som([C(SWD + 'sword.6.ogg'), C(H + 'hit22.mp3.flac', em=0.04, db=-2)], dur=0.8),

    # ------------------------------------------------ corpo
    'passo': Som([C('fantozzis-footsteps-grasssand-stone/Fantozzi-SandL3.flac', dur=0.16, filtro='lowpass=f=3500'),
                  C(S2 + 'footstep_wood_03.ogg', db=-10)], 'leve', dur=0.18),
    'pulo': Som([C('fantozzis-footsteps-grasssand-stone/Fantozzi-SandR3.flac', dur=0.12, filtro='lowpass=f=4000'),
                 C(SW + '6.wav', em=0.02, tom=-4, db=-2)], 'leve', dur=0.25),
    'aterrissar': Som([C(W + '07.flac', dur=0.25), C('fantozzis-footsteps-grasssand-stone/Fantozzi-SandL1.flac',
                                                     dur=0.2, db=-5, filtro='lowpass=f=3500')], 'leve', dur=0.3),
    'dash': Som([C(SW + '2.wav', tom=-3), C('fantozzis-footsteps-grasssand-stone/Fantozzi-SandR2.flac',
                                            dur=0.25, db=-4, filtro='lowpass=f=4000')], 'leve', dur=0.3),
    'queda': Som([C(BF + 'hit_02.ogg'), C(W + '03.flac', em=0.05), C(H + 'hit20.mp3.flac', em=0.12, db=-4)], dur=0.9),
    'dor': Som([C(CR + 'grunt_03.ogg')], 'natural', dur=0.4),
    'dor-forte': Som([C(CR + 'grunt_01.ogg'), C(CR + 'grunt_02.ogg', db=-8, tom=-2)], 'natural', dur=0.6),
    'dor-ko': Som([C(CR + 'grunt_02.ogg', tom=-3), C(RPG + 'creature_hurt_01.ogg', em=0.15, db=-3, tom=-4)],
                  'natural', dur=1.0),

    # ------------------------------------------------ torcida (gravada)
    'torcida-uh': Som([C('oooooooooooooo/oooooooooo_0.ogg')], 'abafado'),
    'torcida-palmas': Som([C('applause-in-a-large-hall-or-church/applause-clapping-church-crowd-immersive.wav',
                             ini=6, dur=3.5, filtro='afade=t=in:d=0.4,afade=t=out:st=2.8:d=0.7')], 'abafado'),

    # ------------------------------------------------ acerto de cada mascote
    # Almirante: madeira de navio e canhão.
    'acerto-leve-madeira': Som([C(P + 'qubodupPunch04.flac', dur=0.25), C(MW + 'wood_hit_08.ogg', db=-3)], dur=0.3),
    'acerto-pesado-madeira': Som([C(H + 'hit24.mp3.flac'), C('35-wooden-crackshitsdestructions/impactwood14.mp3.flac',
                                                             dur=0.5, db=-2)], dur=0.55),
    'acerto-especial-canhao': Som([C('battle-at-sea/cannon_hit_ship_short.ogg', dur=1.3), C(H + 'hit35.mp3.flac', db=-3)],
                                  dur=1.3),
    'tiro-garrucha': Som([C('gunshots/Black%20Powder.wav', dur=1.3)], 'leve', dur=1.3, extra=['aecho=0.7:0.5:120:0.2']),
    'caravela': Som([C('battle-at-sea/ship_ram_ship_shortened.ogg', dur=1.8),
                     C(AG + 'splash_04.ogg', em=0.3, db=-4)], 'leve', dur=1.8),
    'sino-navio': Som([C(S1 + 'bell_01.ogg')], 'natural'),
    # Urubu: pena e bico.
    'acerto-leve-pena': Som([C(P + 'qubodupPunch02.flac', dur=0.25), C(FLAP, ini=0.3, dur=0.18, db=-6, tom=4)], dur=0.3),
    'acerto-pesado-pena': Som([C(H + 'hit33.mp3.flac'), C(FLAP, ini=0.25, dur=0.35, db=-3)], dur=0.6),
    'bicada': Som([C(MW + 'wood_hit_05.ogg', tom=3), C(BF + 'hit_04.ogg', db=-4)], dur=0.2),
    'asas': Som([C(FLAP, ini=0.2, dur=0.9)], 'leve', dur=0.9),
    'mergulho': Som([C(VENTO, ini=1.0, dur=1.2, tom=-5, filtro='afade=t=in:d=0.4')], 'leve', dur=1.2),
    'meteoro-pouso': Som([C('battle-at-sea/cannon_hit_1.ogg', dur=1.6), C(BF + 'rock_breaking_02.ogg', em=0.05, db=-3),
                          C(H + 'hit35.mp3.flac', db=-2)], dur=1.6),
    'dor-urubu': Som([C('crow-caw/crow_caw.wav', tom=-4)], 'natural', dur=0.5),
    'dor-forte-urubu': Som([C('crow/crow_0.ogg', tom=-6)], 'natural', dur=0.7),
    # Saci: leve e rápido.
    'acerto-leve-saci': Som([C(T + 'thwack-02.wav'), C(SW + '11.wav', db=-8)], 'leve', dur=0.2),
    'acerto-pesado-saci': Som([C(T + 'thwack-05.wav'), C(P + 'qubodupPunch05.flac', db=-5)], dur=0.35),
    'cachimbo': Som([C(MW + 'wood_hit_09.ogg'), C(SW + '8.wav', em=0.02, db=-3, tom=2)], dur=0.3),
    'tornado': Som([C(VENTO, ini=0.5, dur=2.0, filtro='afade=t=in:d=0.3,afade=t=out:st=1.5:d=0.5'),
                    C(S2 + 'air_01.ogg', dur=2.0, db=-5)], 'leve', dur=2.0),
    # Cartola: bengala de madeira.
    'acerto-leve-bengala': Som([C(MW + 'wood_hit_07.ogg'), C(P + 'qubodupPunch01.flac', dur=0.2, db=-6)], dur=0.25),
    'acerto-pesado-bengala': Som([C(MW + 'wood_slam_04.ogg'), C(H + 'hit26.mp3.flac', db=-3)], dur=0.4),
    # Bira: bicho de rua.
    'garra': Som([C(RPG + 'blade_01.ogg', filtro='lowpass=f=6000'), C(P + 'qubodupPunch02.flac', dur=0.2, db=-6)], dur=0.3),
    'bote': Som([C(DOG + 'Dog Bark 1.wav'), C(CR + 'eat_02.ogg', em=0.12)], 'natural', dur=0.6),
    'latido': Som([C(DOG + 'Dog Bark 1.wav'), C(DOG + 'Dog Bark 3.wav', em=0.28)], 'natural'),
    'latido-voo': Som([C(DOG + 'Dog Bark 2.wav'), C(DOG + 'Dog Bark 3.wav', em=0.5, db=-2),
                       C(DOG + 'Dog Bark 1.wav', em=0.75, db=-3)], 'natural'),
    'dor-cao': Som([C(DOG + 'Sad Dog 1.wav', ini=0.18, dur=0.45)], 'natural', dur=0.45),
    'dor-forte-cao': Som([C(DOG + 'Sad Dog.wav', ini=0.18, dur=0.9)], 'natural', dur=0.9),
    'coco': Som([C(AG + 'slime_04.ogg'), C(AG + 'splash_09.ogg', em=0.05, db=-4)], 'leve'),
    # Porco: pesado e molhado.
    'acerto-leve-porco': Som([C(P + 'qubodupPunch03.flac', dur=0.25), C(W + '08.flac', db=-4)], dur=0.3),
    'acerto-pesado-porco': Som([C(H + 'hit33.mp3.flac'), C('8-wet-squish-slurp-impacts/impactsplat03.mp3.flac',
                                                           dur=0.4, db=-5)], dur=0.6),
    'mordida': Som([C(CR + 'eat_02.ogg'), C(CR + 'eat_04.ogg', em=0.1, db=-3)], 'leve'),
    'coice': Som([C(H + 'hit27.mp3.flac'), C(MW + 'wood_slam_01.ogg', db=-4)], dur=0.4),
    'vomito': Som([C(CR + 'burp_02.ogg'), C(AG + 'splash_04.ogg', em=0.25), C(AG + 'slime_09.ogg', em=0.45)],
                  'natural', dur=1.4),
    # Mosqueteiros: aço.
    'acerto-leve-espada': Som([C(SWD + 'sword.8.ogg', dur=0.25), C(P + 'qubodupPunch05.flac', dur=0.2, db=-5)], dur=0.3),
    'acerto-pesado-espada': Som([C(SWD + 'sword_clash.5.ogg'), C(H + 'hit22.mp3.flac', db=-3)], dur=0.5),
    'corte': Som([C(SWD + 'sword.6.ogg', dur=0.4)], 'leve', dur=0.4),
    'tiro-mosquete': Som([C('gunshots/Black%20Powder.wav', dur=1.4, tom=-3),
                          C('battle-at-sea/cannon_fire_1.ogg', db=-8)], 'leve', dur=1.5),
    # Esquadrão: armadura de herói.
    'acerto-leve-metal': Som([C(P + 'qubodupPunch01.flac', dur=0.25), C(MW + 'metal_hit_04.ogg', db=-9)], dur=0.3),
    'acerto-pesado-metal': Som([C(H + 'hit19.mp3.flac'), C(MW + 'metal_slam_01.ogg', db=-4)], dur=0.5),
    # Dragão: bruto e fogo.
    'acerto-pesado-dragao': Som([C(H + 'hit35.mp3.flac'), C(RPG + 'creature_roar_01.ogg', db=-8, tom=-3)], dur=0.6),
    'fogo-cuspe': Som([C(RPG + 'spell_fire_02.ogg')], 'leve'),
    'fogo-sopro': Som([C(RPG + 'spell_fire_05.ogg'), C(VENTO, ini=1, dur=1.5, db=-6, tom=-6)], 'leve', dur=1.6),
    'dor-dragao': Som([C(RPG + 'creature_roar_03.ogg', tom=-2)], 'natural', dur=0.4),
    'dor-forte-dragao': Som([C(RPG + 'creature_roar_02.ogg', tom=-2)], 'natural', dur=0.8),
    # Vovô Coxa: andador de alumínio, lata e arroto.
    'acerto-leve-andador': Som([C(MW + 'metal_hit_05.ogg', db=-3), C(P + 'qubodupPunch04.flac', dur=0.2, db=-4)], dur=0.3),
    'acerto-pesado-cabecada': Som([C(H + 'hit25.mp3.flac'), C(MW + 'wood_hit_09.ogg', db=-2)], dur=0.45),
    'lata': Som([C(S2 + 'metal_hit_02.ogg'), C(AG + 'splash_09.ogg', em=0.03, db=-4)], 'leve'),
    'arroto': Som([C(CR + 'burp_01.ogg', tom=-2)], 'natural'),
    'acerto-pesado-maromba': Som([C(H + 'hit21.mp3.flac'), C(MW + 'metal_slam_01.ogg', db=-3)], dur=0.55),
    # Os que ainda eram síntese e têm gravação boa.
    'termica': Som([C(VENTO, ini=0.2, dur=1.2, tom=3, filtro='afade=t=in:d=0.5')], 'leve', dur=1.2),
    'meteoro': Som([C(VENTO, ini=2.0, dur=1.0, tom=-3), C(FLAP, ini=0.2, dur=0.5, db=-3)], 'leve', dur=1.0),
    'giro': Som([C(SW + '4.wav', tom=-3), C(SW + '5.wav', em=0.09, tom=-4), C(SW + '9.wav', em=0.18, tom=-5)], 'leve'),
    'ovo-arremesso': Som([C(SW + '13.wav', tom=-2)], 'leve'),
    'ovo-quebra': Som([C(BF + 'glass_hit_02.ogg', filtro='lowpass=f=5000', db=-4), C(AG + 'slime_08.ogg', em=0.03)],
                      'leve', dur=0.4),
    'po-de-arroz': Som([C(S2 + 'air_02.ogg', dur=0.5, tom=-4), C(S1 + 'plop_01.ogg', db=-6)], 'leve', dur=0.6),
    'enjoo': Som([C(CR + 'burble_01.ogg'), C(CR + 'burp_01.ogg', em=0.45, db=-3, tom=-3)], 'natural'),
}


# ---------------------------------------------------------------- baixar

def baixar() -> None:
    """Baixa e extrai os pacotes CC0 em referencia/sons-cc0/<pacote>/."""
    sete = shutil.which('7z') or next((p for p in [r'C:\Program Files\7-Zip\7z.exe'] if Path(p).exists()), None)
    for pacote, arquivos in PACOTES.items():
        pasta = BRUTO / pacote
        pasta.mkdir(parents=True, exist_ok=True)
        for nome in arquivos:
            destino = pasta / nome
            if not destino.exists():
                print(f'baixando {pacote}/{nome}')
                urllib.request.urlretrieve(OGA + nome, destino)
            extraido = pasta / f'{destino.stem}_x'
            if destino.suffix == '.zip' and not extraido.exists():
                zipfile.ZipFile(destino).extractall(extraido)
            elif destino.suffix == '.7z' and not extraido.exists():
                if not sete:
                    sys.exit('Precisa do 7-Zip para extrair os .7z (winget install 7zip.7zip).')
                subprocess.run([sete, 'x', '-y', f'-o{extraido}', str(destino)], check=True, capture_output=True)


# ---------------------------------------------------------------- gerar

def achar(caminho: str) -> Path:
    pacote, nome = caminho.split('/', 1)
    achados = [p for p in (BRUTO / pacote).rglob(nome) if not p.name.startswith('._')]
    if not achados:
        sys.exit(f'Não achei {caminho}. Rode: python scripts/sons_gravados.py baixar')
    return achados[0]


def renderizar(som: Som) -> list[float]:
    """Mistura as camadas e aplica o tratamento; devolve amostras em float."""
    entradas, cadeias = [], []
    for k, c in enumerate(som.camadas):
        entradas += ['-i', str(achar(c.arquivo))]
        f = f'[{k}:a]aformat=sample_fmts=fltp:channel_layouts=mono,aresample=44100,atrim=start={c.ini}'
        f += f':duration={c.dur}' if c.dur else ''
        f += ',asetpts=PTS-STARTPTS'
        if c.tom:
            f += f',asetrate={44100 * 2 ** (c.tom / 12):.0f},aresample=44100'
        f += f',volume={c.db}dB'
        if c.filtro:
            f += ',' + c.filtro
        f += f',adelay={int(c.em * 1000)}:all=1[c{k}]'
        cadeias.append(f)
    rotulos = ''.join(f'[c{k}]' for k in range(len(som.camadas)))
    final = f'{rotulos}amix=inputs={len(som.camadas)}:normalize=0:duration=longest,{TRATAMENTOS[som.tratamento]}'
    for e in som.extra:
        final += ',' + e
    final += f',aresample={TAXA}'
    grafo = ';'.join(cadeias + [final + '[saida]'])
    bruto = subprocess.run(['ffmpeg', '-v', 'error', *entradas, '-filter_complex', grafo, '-map', '[saida]',
                            '-f', 'f32le', '-ac', '1', '-'], capture_output=True, check=True).stdout
    return list(struct.unpack(f'<{len(bruto) // 4}f', bruto))


def acabar(x: list[float], som: Som) -> list[float]:
    """Corta o silêncio do começo e do fim, aplica o corte final e o fade."""
    pico = max((abs(v) for v in x), default=0) or 1.0
    ini = next((i for i, v in enumerate(x) if abs(v) > pico * 0.02), 0)
    x = x[ini:]
    if som.dur:
        x = x[:int(som.dur * TAXA)]
    fim = len(x)
    while fim > 1 and abs(x[fim - 1]) < pico * 0.003:
        fim -= 1
    x = x[:fim]
    if som.loop:
        # Junta o fim no começo para o loop não ter emenda.
        m = int(0.6 * TAXA)
        cabeca, corpo, cauda = x[:m], x[m:-m], x[-m:]
        x = corpo + [c * (1 - i / m) + h * (i / m) for i, (c, h) in enumerate(zip(cauda, cabeca))]
    else:
        q = min(int(0.012 * TAXA), len(x))
        x = x[:-q] + [v * (1 - i / q) for i, v in enumerate(x[-q:])] if q else x
    return x


def forca(x: list[float]) -> float:
    """Volume percebido: a média quadrática dos 150 ms mais fortes."""
    j = min(int(0.15 * TAXA), len(x))
    melhor = max(sum(v * v for v in x[i:i + j]) / j for i in range(0, max(1, len(x) - j + 1), 200))
    return melhor ** 0.5 or 1e-9


def gravar(nome: str, x: list[float], nivel: float) -> None:
    """Leva o som ao volume percebido pedido; o que passar do teto é dobrado, não cortado."""
    g = 10 ** (nivel / 20) / forca(x)
    x = [v * g for v in x]
    x = [v if abs(v) < 0.8 else (0.8 + 0.18 * math.tanh((abs(v) - 0.8) / 0.18)) * (1 if v > 0 else -1) for v in x]
    with wave.open(str(PASTA / f'{nome}.wav'), 'wb') as arquivo:
        arquivo.setnchannels(1)
        arquivo.setsampwidth(2)
        arquivo.setframerate(TAXA)
        arquivo.writeframes(b''.join(struct.pack('<h', int(v * 32767)) for v in x))
    print(f'{nome}.wav: {len(x) / TAXA:.2f} s')


def main() -> None:
    if sys.argv[1:2] == ['baixar']:
        baixar()
        return
    if sys.argv[1:2] == ['lista']:
        print('\n'.join(SONS))
        return
    PASTA.mkdir(parents=True, exist_ok=True)
    for nome in sys.argv[1:] or list(SONS):
        som = SONS[nome]
        gravar(nome, acabar(renderizar(som), som), som.nivel or NIVEIS[som.tratamento])


if __name__ == '__main__':
    main()
