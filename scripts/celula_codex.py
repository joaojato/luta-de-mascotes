"""Converte folhas do Codex com célula grande para a célula do jogo.

O Codex entregou o Mosqueteiro em células 640x320 (espada e mosquete longos),
pé em y=296. O motor mede tudo em células de 256 de altura com o pé em
y=228 (Regra da Régua do Idle). Este script escala cada célula e recorta
numa célula 512x256 (largura de ação larga, como o golpe de asas do Urubu),
sem mexer nos originais.

    python scripts/celula_codex.py ORIGEM DESTINO --escala 0.92 --pe 296 [--celula 640x320]
        [--saida 512x256 --pe-saida 228] [--so a.png,b.png] [--espelhar a.png,b.png]

Cada PNG do topo de ORIGEM vira um PNG de mesmo nome em DESTINO, com as
mesmas 5 colunas. Subpastas (peças, NPCs) são ignoradas; NPC é convertido
chamando de novo com a pasta dele, com `--saida` do tamanho dele e o pé no
fundo da célula (o esquadrão desenha o aliado com origem no pé). `--espelhar`
vira a ação inteira, nunca um quadro solto (o Bonezinho voa para a direita).
"""
import argparse
from pathlib import Path

from PIL import Image

SAIDA_L, SAIDA_A, PE_JOGO = 512, 256, 228


def converter(origem: Path, destino: Path, escala: float, pe: int, cel_l: int, cel_a: int,
              saida=(SAIDA_L, SAIDA_A), pe_saida: int = PE_JOGO, so=None, espelhar=()) -> None:
    SAIDA_L, SAIDA_A = saida
    destino.mkdir(parents=True, exist_ok=True)
    novo_l, novo_a = round(cel_l * escala), round(cel_a * escala)
    # Centro da célula continua no centro; o pé vai para a linha do jogo.
    dx = round(SAIDA_L / 2 - cel_l * escala / 2)
    dy = round(pe_saida - pe * escala)
    for arquivo in sorted(origem.glob('*.png')):
        if so and arquivo.name not in so:
            continue
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
                if arquivo.name in espelhar:
                    menor = menor.transpose(Image.FLIP_LEFT_RIGHT)
                quadro = Image.new('RGBA', (SAIDA_L, SAIDA_A))
                quadro.alpha_composite(menor, (max(dx, 0), max(dy, 0)), (max(-dx, 0), max(-dy, 0)))
                # Conferir se algum pixel do desenho ficou fora da célula nova.
                if arquivo.name in espelhar:
                    caixa = (cel_l - caixa[2], caixa[1], cel_l - caixa[0], caixa[3])
                fora = (caixa[0] * escala + dx < 0 or caixa[2] * escala + dx > SAIDA_L
                        or caixa[1] * escala + dy < -0.5 or caixa[3] * escala + dy > SAIDA_A + 0.5)
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
    p.add_argument('--saida', default=f'{SAIDA_L}x{SAIDA_A}', help='célula de destino')
    p.add_argument('--pe-saida', type=int, default=PE_JOGO, help='linha do pé na célula de destino')
    p.add_argument('--so', default='', help='só estes arquivos, separados por vírgula')
    p.add_argument('--espelhar', default='', help='arquivos a virar inteiros, separados por vírgula')
    a = p.parse_args()
    cel_l, cel_a = (int(v) for v in a.celula.split('x'))
    saida = tuple(int(v) for v in a.saida.split('x'))
    lista = lambda texto: {nome for nome in texto.split(',') if nome}
    converter(a.origem, a.destino, a.escala, a.pe, cel_l, cel_a, saida, a.pe_saida, lista(a.so), lista(a.espelhar))


if __name__ == '__main__':
    main()
