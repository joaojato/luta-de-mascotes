"""Sintetiza o apito curto de juiz que confirma escolhas nos menus.

Substitui o `ui-confirm.mp3` herdado do Chong-U. Sem dependência: só a
biblioteca padrão. Rodar: python scripts/apito.py
"""
import math
import random
import struct
import wave
from pathlib import Path

SAIDA = Path(__file__).resolve().parents[1] / 'public/assets/audio/sfx/apito.wav'
TAXA = 22050
DURACAO = 0.2


def amostra(t: float, ruido: float) -> float:
    # Apito de bolinha: tom agudo que treme rápido (a bolinha batendo) e um pouco de sopro.
    tremor = 0.55 + 0.45 * math.sin(2 * math.pi * 46 * t)
    tom = math.sin(2 * math.pi * (2950 + 70 * math.sin(2 * math.pi * 46 * t)) * t)
    harmonico = 0.25 * math.sin(2 * math.pi * 5900 * t)
    ataque = min(1.0, t / 0.012)
    queda = min(1.0, (DURACAO - t) / 0.05)
    return (tremor * (tom + harmonico) + 0.12 * ruido) * ataque * queda


def main() -> None:
    random.seed(7)
    quadros = int(TAXA * DURACAO)
    dados = [amostra(i / TAXA, random.uniform(-1, 1)) for i in range(quadros)]
    pico = max(abs(v) for v in dados)
    with wave.open(str(SAIDA), 'wb') as arquivo:
        arquivo.setnchannels(1)
        arquivo.setsampwidth(2)
        arquivo.setframerate(TAXA)
        arquivo.writeframes(b''.join(struct.pack('<h', int(v / pico * 0.8 * 32767)) for v in dados))
    print(f'{SAIDA.name}: {quadros} amostras, {SAIDA.stat().st_size} bytes')


if __name__ == '__main__':
    main()
