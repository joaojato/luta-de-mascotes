"""Amostras da música do jogo (docs/musica.md, ADR 0008).

A música é montada nota a nota no navegador (src/game/musica/). Este script
prepara as notas que ela toca, todas do soundfont FluidR3 GM (MIT):

- percussão (bumbo, caixa e repique de marcha, cuíca, güiro, agogô, apito)
  tirada do FluidR3Mono_GM.sf3 do MuseScore;
- instrumentos (trompete, acordeão, baixo, coro) das notas já renderizadas
  do mesmo FluidR3 em github.com/gleitz/midi-js-soundfonts.

Tudo sai mono, 22 kHz e com o agudo cortado em 8 kHz: timbre de cartucho de
16 bits, sem bip de chiptune. WAV, não MP3: MP3 tem atraso no começo e a
batida sairia fora do tempo.

Material bruto em referencia/soundfont/ (fora do git).

Rodar: python scripts/musica_amostras.py
"""
from __future__ import annotations

import struct
import subprocess
import tempfile
import urllib.request
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
BRUTO = RAIZ / 'referencia/soundfont'
PASTA = RAIZ / 'public/assets/audio/musica'
SF3 = 'https://github.com/musescore/MuseScore/raw/2.0.3/share/sound/FluidR3Mono_GM.sf3'
GLEITZ = 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/'
TAXA = 22050
TRATAR = f'aresample={TAXA},lowpass=f=8000,highpass=f=30'

# Percussão: chave do jogo → (nome da amostra no sf3, duração máxima em s).
PERCUSSAO = {
    'bumbo': ('57_0_BD1NORM', 0.6),        # surdo de primeira / bombo da hinchada
    'bumbo-2': ('57_48_BD3_NORM', 0.5),    # surdo de resposta
    'caixa': ('56_50_SNR_NORM_WHOL', 0.35),
    'caixa-aro': ('56_52_SNR_RIMSHOT', 0.35),
    'caixa-rufo': ('56_48_SNR_BUZZ', 0.4),
    'repique': ('55_72_TNR2_NORM', 0.4),
    'repique-agudo': ('55_96_TNR1_NORM', 0.35),
    'tamborim': ('55_120_TNRSPOCK_NOR', 0.25),
    'prato': ('58_72_FULLCRASH1', 1.6),
    'prato-seco': ('58_79_CRASHCHOKE1', 0.4),
    'cuica-aguda': ('Quica Hi', 0.5),
    'cuica-grave': ('Quica Low', 0.5),
    'guiro-curto': ('Guiro Down(L)', 0.2),
    'guiro-longo': ('Guiro Up(L)', 0.35),
    'agogo-agudo': ('High Agogo(L)', 0.3),
    'agogo-grave': ('Low Agogo(L)', 0.3),
    'apito': ('Short Whistle', 0.3),
    'palma': ('Clap(L)', 0.3),
    'timbal': ('High Timbale(L)', 0.4),
    'chocalho': ('Maracas(L)', 0.15),
}

# Instrumentos: chave → (instrumento GM em gleitz, notas MIDI, duração em s).
# Uma nota a cada 3 semitons; o navegador afina as do meio (no máximo 1,5).
INSTRUMENTOS = {
    'trompete': ('trumpet', range(57, 85, 3), 1.2),
    'acordeao': ('accordion', range(48, 79, 3), 1.4),
    'baixo': ('electric_bass_finger', range(28, 56, 3), 1.0),
    'coro': ('choir_aahs', range(48, 76, 3), 1.8),
}

NOMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']


def nome_da_nota(midi: int) -> str:
    return f'{NOMES[midi % 12]}{midi // 12 - 1}'


def baixar(url: str, destino: Path) -> Path:
    if not destino.exists():
        destino.parent.mkdir(parents=True, exist_ok=True)
        print(f'baixando {url}')
        urllib.request.urlretrieve(url, destino)
    return destino


def ffmpeg(entrada: Path, saida: Path, filtros: str) -> None:
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(entrada), '-ac', '1', '-af', filtros,
                    '-c:a', 'pcm_s16le', str(saida)], check=True)


def amostras_do_sf3(caminho: Path) -> dict[str, bytes]:
    """Lê o sf3 (RIFF): nome de cada amostra → bytes do Ogg dela."""
    d = caminho.read_bytes()
    blocos: dict[str, tuple[int, int]] = {}

    def percorrer(ini: int, fim: int) -> None:
        while ini < fim:
            tipo, tamanho = struct.unpack('<4sI', d[ini:ini + 8])
            if tipo == b'LIST':
                percorrer(ini + 12, ini + 8 + tamanho)
            else:
                blocos[tipo.decode('latin1')] = (ini + 8, tamanho)
            ini += 8 + tamanho

    percorrer(12, len(d))
    smpl, _ = blocos['smpl']
    shdr_ini, shdr_tam = blocos['shdr']
    saida = {}
    for i in range(shdr_ini, shdr_ini + shdr_tam, 46):
        nome = d[i:i + 20].split(b'\0')[0].decode('latin1')
        ini, fim = struct.unpack('<II', d[i + 20:i + 28])
        saida.setdefault(nome, d[smpl + ini:smpl + fim])
    return saida


def main() -> None:
    PASTA.mkdir(parents=True, exist_ok=True)
    amostras = amostras_do_sf3(baixar(SF3, BRUTO / 'FluidR3Mono_GM.sf3'))
    with tempfile.TemporaryDirectory() as tmp:
        for chave, (nome, dur) in PERCUSSAO.items():
            ogg = Path(tmp) / f'{chave}.ogg'
            ogg.write_bytes(amostras[nome])
            ffmpeg(ogg, PASTA / f'{chave}.wav',
                   f'{TRATAR},atrim=0:{dur},afade=t=out:st={dur * 0.7:.3f}:d={dur * 0.3:.3f},loudnorm=I=-14:TP=-1,aresample={TAXA}')
            print(f'{chave}.wav')
    for chave, (gm, notas, dur) in INSTRUMENTOS.items():
        for midi in notas:
            mp3 = baixar(f'{GLEITZ}{gm}-mp3/{nome_da_nota(midi)}.mp3', BRUTO / 'gleitz' / gm / f'{nome_da_nota(midi)}.mp3')
            # O MP3 de origem tem silêncio no começo: corta antes do ataque.
            ffmpeg(mp3, PASTA / f'{chave}-{midi}.wav',
                   f'silenceremove=start_periods=1:start_threshold=-45dB,{TRATAR},atrim=0:{dur},'
                   f'afade=t=out:st={dur * 0.6:.3f}:d={dur * 0.4:.3f},volume=-3dB')
        print(f'{chave}: {len(notas)} notas')


if __name__ == '__main__':
    main()
