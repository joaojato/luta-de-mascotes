"""Torcedor sem camisa rodando a camisa do clube na mão (pedido do João, 03/11/2026).

Parte de um tipo da comemoração v3 sem camisa (o mesmo tamanho do atlas
vestido, `ampliar` de torcida_camisa.py) e desenha, em cada um dos 4 quadros,
uma camiseta em cor chave (magenta) presa no punho mais alto, girando de
quadro em quadro. O motor pinta o magenta com a estampa do clube como nas
outras camisas e põe alguns desses torcedores em cada metade da arquibancada
(`destaque` no torcida.json).

    python scripts/torcida_camisa_na_mao.py            tipo 0
    python scripts/torcida_camisa_na_mao.py --tipo 6
"""
import argparse
import sys
from pathlib import Path

from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parent))
from torcida_camisa import CEL_A, CEL_L, ORIGEM, PASTA, PREVIA, RAIZ, ampliar, pele  # noqa: E402

DESTINO = PASTA / 'torcedor-camisa-na-mao.png'
CONTORNO = (28, 18, 16, 255)
# Camiseta: gola, mangas abertas e barra, desenhada em 15x14 e ampliada por
# TAMANHO. O ponto de pega é a ponta da manga esquerda, que fica na mão.
CAMISETA = [(4, 0), (6, 1), (8, 1), (10, 0), (14, 3), (12, 6), (11, 5), (11, 13), (3, 13), (3, 5), (2, 6), (0, 3)]
PEGA = (0, 3)
TAMANHO = 2.0
# Célula com folga em cima e dos lados para o pano não cortar na borda; o
# torcedor fica no meio da base, com o pé no mesmo ponto do atlas vestido.
FOLGA = 16
CELULA = (CEL_L + 2 * FOLGA, CEL_A + FOLGA)
# Ângulo da camiseta em cada quadro (graus, anti-horário; 0 é pendurada para
# baixo e para a direita): ela abre para cima e para fora do corpo, e muda
# de quadro em quadro, como quem roda a camisa.
ANGULOS = [150, 140, 165, 150]


def camiseta(angulo):
    """Camiseta em magenta sombreado e contornada, girada, e onde a pega foi parar."""
    w, h = round(15 * TAMANHO) + 3, round(14 * TAMANHO) + 3
    im = Image.new('RGBA', (w, h))
    pontos = [(1 + x * TAMANHO, 1 + y * TAMANHO) for x, y in CAMISETA]
    ImageDraw.Draw(im).polygon(pontos, fill=(255, 0, 255, 255), outline=CONTORNO)
    px = im.load()
    # Sombra: a metade de baixo e a manga da direita mais escuras (dobra do pano).
    for y in range(h):
        for x in range(w):
            if px[x, y] == (255, 0, 255, 255) and (y > 8 * TAMANHO or x > 11 * TAMANHO):
                v = 200 if (x + y) % 6 else 170
                px[x, y] = (v, 0, v, 255)
    pega = (round(1 + PEGA[0] * TAMANHO), round(1 + PEGA[1] * TAMANHO))
    com_borda = im
    # Gira e acha onde a pega foi parar girando junto um pixel marcado.
    marca = Image.new('L', com_borda.size)
    marca.putpixel(pega, 255)
    girada = com_borda.rotate(angulo, resample=Image.NEAREST, expand=True)
    caixa = marca.rotate(angulo, resample=Image.NEAREST, expand=True).getbbox()
    return girada, (caixa[0], caixa[1])


def punho_mais_alto(px, x0, y0):
    """Topo do punho mais alto, fora da cabeça (pele a mais de 12 px do meio)."""
    pontos = [(x, y) for y in range(CEL_A) for x in range(CEL_L) if pele(px[x0 + x, y0 + y])]
    meio = sorted(x for x, _ in pontos)[len(pontos) // 2]
    fora = [(x, y) for x, y in pontos if abs(x - meio) > 12]
    x, y = min(fora, key=lambda p: p[1])
    return x, y, x < meio


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--tipo', type=int, default=0, help='tipo da v3 (0 a 9) que tira a camisa')
    args = ap.parse_args()
    base = ampliar(Image.open(ORIGEM).convert('RGBA'))
    px = base.load()
    folha = Image.new('RGBA', (CELULA[0] * 4, CELULA[1]))
    for q in range(4):
        x0, y0 = q * CEL_L, args.tipo * CEL_A
        celula = base.crop((x0, y0, x0 + CEL_L, y0 + CEL_A))
        fx, fy, esquerda = punho_mais_alto(px, x0, y0)
        # Na mão da esquerda da imagem a camiseta voa para a esquerda; na outra, espelhada.
        angulo = ANGULOS[q]
        pano, (pgx, pgy) = camiseta(angulo)
        if not esquerda:
            pano = pano.transpose(Image.FLIP_LEFT_RIGHT)
            pgx = pano.width - 1 - pgx
        # A pega fica 2 px dentro do punho; a mão fica na frente do pano.
        camada = Image.new('RGBA', CELULA)
        camada.paste(pano, (FOLGA + fx - pgx, FOLGA + fy + 2 - pgy), pano)
        camada.alpha_composite(celula, (FOLGA, FOLGA))
        folha.paste(camada, (q * CELULA[0], 0))
        print(f'quadro {q}: punho em ({fx}, {fy}) {"esquerda" if esquerda else "direita"} da imagem, ângulo {angulo}')
    folha.save(DESTINO)
    PREVIA.mkdir(parents=True, exist_ok=True)
    fundo = Image.new('RGBA', folha.size, (40, 44, 50, 255))
    fundo.alpha_composite(folha)
    fundo.resize((folha.width * 4, folha.height * 4), Image.NEAREST).save(PREVIA / 'camisa-na-mao.png')
    print(f'folha: {DESTINO.relative_to(RAIZ)}')


if __name__ == '__main__':
    main()
