"""Converte folhas do Codex com célula grande para a célula do jogo.

O Codex entregou o Mosqueteiro em células 640x320 (espada e mosquete longos),
pé em y=296. O motor mede tudo em células de 256 de altura com o pé em
y=228 (Regra da Régua do Idle). Este script escala cada célula e recorta
numa célula 512x256 (largura de ação larga, como o golpe de asas do Urubu),
sem mexer nos originais.

    python scripts/celula_codex.py ORIGEM DESTINO --escala 0.92 --pe 296 [--celula 640x320]

Cada PNG do topo de ORIGEM vira um PNG de mesmo nome em DESTINO, com as
mesmas 5 colunas. Subpastas (peças, NPCs) são ignoradas; NPC é convertido
chamando de novo com a pasta dele.
"""
import argparse
from pathlib import Path

from PIL import Image

SAIDA_L, SAIDA_A, PE_JOGO = 512, 256, 228


def converter(origem: Path, destino: Path, escala: float, pe: int, cel_l: int, cel_a: int) -> None:
    destino.mkdir(parents=True, exist_ok=True)
    novo_l, novo_a = round(cel_l * escala), round(cel_a * escala)
    # Centro da célula continua no centro; o pé vai para a linha do jogo.
    dx = round(SAIDA_L / 2 - cel_l * escala / 2)
    dy = round(PE_JOGO - pe * escala)
    for arquivo in sorted(origem.glob('*.png')):
        folha = Image.open(arquivo).convert('RGBA')
        colunas, linhas = folha.width // cel_l, folha.height // cel_a
        saida = Image.new('RGBA', (colunas * SAIDA_L, linhas * SAIDA_A))
        cortados = 0
        for linha in range(linhas):
            for coluna in range(colunas):
                celula = folha.crop((coluna * cel_l, linha * cel_a, (coluna + 1) * cel_l, (linha + 1) * cel_a))
                caixa = celula.getbbox()
                if not caixa:
                    continue
                menor = celula.resize((novo_l, novo_a), Image.LANCZOS)
                quadro = Image.new('RGBA', (SAIDA_L, SAIDA_A))
                quadro.alpha_composite(menor, (max(dx, 0), max(dy, 0)), (max(-dx, 0), max(-dy, 0)))
                # Conferir se algum pixel do desenho ficou fora da célula nova.
                fora = (caixa[0] * escala + dx < 0 or caixa[2] * escala + dx > SAIDA_L
                        or caixa[1] * escala + dy < -0.5 or caixa[3] * escala + dy > SAIDA_A)
                cortados += fora
                saida.alpha_composite(quadro, (coluna * SAIDA_L, linha * SAIDA_A))
        saida.save(destino / arquivo.name)
        aviso = f'  ATENÇÃO: {cortados} quadro(s) passaram da célula' if cortados else ''
        print(f'{arquivo.name}: {colunas}x{linhas} células -> {saida.width}x{saida.height}{aviso}')


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument('origem', type=Path)
    p.add_argument('destino', type=Path)
    p.add_argument('--escala', type=float, default=0.92)
    p.add_argument('--pe', type=int, default=296, help='linha do pé na célula de origem')
    p.add_argument('--celula', default='640x320')
    a = p.parse_args()
    cel_l, cel_a = (int(v) for v in a.celula.split('x'))
    converter(a.origem, a.destino, a.escala, a.pe, cel_l, cel_a)


if __name__ == '__main__':
    main()
