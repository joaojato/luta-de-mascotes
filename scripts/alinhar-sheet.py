"""
Alinha uma sheet gerada por modelo de imagem (Gemini, GPT Image) à grade
que o motor lê: células de 256x256, 5 colunas, mesma escala e mesma linha
dos pés de uma sheet de referência (normalmente o idle do mascote).

Uso:
    python scripts/alinhar-sheet.py ENTRADA SAIDA --ref public/assets/lutadores/<slug>/idle.png

O que faz:
  1. Se a entrada não tiver transparência, recorta o fundo: verde chapado
     (#00FF00) ou fundo claro sólido (branco), este por preenchimento a
     partir das bordas, o que preserva partes brancas do personagem.
  2. Separa os quadros por colunas e linhas vazias (funciona para uma
     fileira ou para uma grade sem células fixas).
  3. Mede a altura da figura no primeiro quadro da referência e no
     primeiro quadro da entrada; aplica a MESMA escala a todos os quadros
     (quadro agachado ou com braço erguido não é reescalado sozinho).
  4. Coloca cada quadro numa célula 256x256 com os pés na linha da
     referência e centralizado pelos pés.
  5. Imprime a contagem de quadros e a caixa visual medida, para o JSON.

Só usa Pillow (não tem numpy nesta máquina).
"""
import argparse
import math
import sys

from PIL import Image, ImageChops, ImageDraw, ImageFilter

CELL = 256
COLS = 5
ALPHA_MIN = 8


def bbox_alpha(im: Image.Image):
    a = im.getchannel('A').point(lambda v: 255 if v > ALPHA_MIN else 0)
    return a.getbbox()


def recortar_borda(im: Image.Image) -> Image.Image:
    """Remove o fundo sólido conectado às bordas (branco, cinza, qualquer cor
    chapada) por preenchimento a partir dos quatro cantos. Preserva áreas da
    mesma cor que não toquem a borda, como um calção branco."""
    rgb = im.convert('RGB')
    w, h = rgb.size
    work = rgb.copy()
    marca = (255, 0, 255)
    for semente in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)):
        ImageDraw.floodfill(work, semente, marca, thresh=30)
    px = work.load()
    alpha = Image.new('L', (w, h), 255)
    ap = alpha.load()
    for y in range(h):
        for x in range(w):
            if px[x, y] == marca:
                ap[x, y] = 0
    out = rgb.copy()
    out.putalpha(alpha)
    return out


def recortar_verde(im: Image.Image) -> Image.Image:
    rgb = im.convert('RGB')
    r, g, b = rgb.split()
    max_rb = ImageChops.lighter(r, b)
    chroma = ImageChops.multiply(
        ImageChops.multiply(
            ImageChops.subtract(g, max_rb).point(lambda v: 255 if v > 110 else 0),
            g.point(lambda v: 255 if v > 150 else 0),
        ),
        max_rb.point(lambda v: 255 if v < 120 else 0),
    )
    alpha = ImageChops.invert(chroma).filter(ImageFilter.MinFilter(3))
    out = rgb.copy()
    out.putalpha(alpha)
    return out


def faixas_ocupadas(perfil, minimo_vazio):
    """Dado um perfil (lista de bool 'tem pixel'), devolve [(ini, fim)] das
    faixas ocupadas, ignorando buracos menores que `minimo_vazio`."""
    faixas = []
    ini = None
    vazio = 0
    for i, ocupado in enumerate(perfil):
        if ocupado:
            if ini is None:
                ini = i
            vazio = 0
        else:
            if ini is not None:
                vazio += 1
                if vazio >= minimo_vazio:
                    faixas.append((ini, i - vazio + 1))
                    ini = None
                    vazio = 0
    if ini is not None:
        faixas.append((ini, len(perfil)))
    return faixas


def separar_quadros(im: Image.Image):
    a = im.getchannel('A').point(lambda v: 255 if v > ALPHA_MIN else 0)
    w, h = a.size
    # linhas: projeta no eixo vertical
    linhas = [a.crop((0, y, w, y + 1)).getbbox() is not None for y in range(h)]
    quadros = []
    for (y0, y1) in faixas_ocupadas(linhas, minimo_vazio=6):
        faixa = a.crop((0, y0, w, y1))
        colunas = [faixa.crop((x, 0, x + 1, y1 - y0)).getbbox() is not None for x in range(w)]
        for (x0, x1) in faixas_ocupadas(colunas, minimo_vazio=6):
            q = im.crop((x0, y0, x1, y1))
            bb = bbox_alpha(q)
            if bb and (bb[2] - bb[0]) > 20 and (bb[3] - bb[1]) > 20:
                quadros.append(q.crop(bb))
    return quadros


def centro_dos_pes(q: Image.Image) -> float:
    """Centro horizontal da parte de baixo da figura (os 12% finais)."""
    w, h = q.size
    base = q.crop((0, int(h * 0.88), w, h))
    bb = bbox_alpha(base)
    if not bb:
        return w / 2
    return (bb[0] + bb[2]) / 2


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument('entrada')
    p.add_argument('saida')
    p.add_argument('--ref', required=True, help='sheet de referência já na grade (ex. idle.png)')
    p.add_argument('--cols', type=int, default=COLS)
    p.add_argument('--json', dest='json_saida', help='grava frames e defaultVisual neste arquivo')
    args = p.parse_args()

    ref = Image.open(args.ref).convert('RGBA')
    ref_cell = ref.crop((0, 0, CELL, CELL))
    rb = bbox_alpha(ref_cell)
    ref_altura = rb[3] - rb[1]
    ref_base = rb[3]           # linha dos pés na célula
    ref_centro = centro_dos_pes(ref_cell.crop(rb)) + rb[0]

    im = Image.open(args.entrada)
    im = im.convert('RGBA')
    if bbox_alpha(im) == (0, 0, im.width, im.height):
        # sem transparência: decide entre chroma verde e fundo sólido de borda
        verde = recortar_verde(im)
        if bbox_alpha(verde) != (0, 0, im.width, im.height):
            im = verde
            print('fundo: verde chapado')
        else:
            im = recortar_borda(im)
            print('fundo: sólido, removido a partir das bordas')

    quadros = separar_quadros(im)
    if not quadros:
        print('nenhum quadro encontrado', file=sys.stderr)
        return 1

    escala = ref_altura / quadros[0].height
    print(f'referência: figura de {ref_altura}px, pés em y={ref_base}, centro x={ref_centro:.0f}')
    print(f'entrada: {len(quadros)} quadros, primeiro com {quadros[0].height}px -> escala {escala:.3f}')

    linhas = math.ceil(len(quadros) / args.cols)
    sheet = Image.new('RGBA', (args.cols * CELL, linhas * CELL), (0, 0, 0, 0))
    caixas = []
    for i, q in enumerate(quadros):
        nw, nh = max(1, round(q.width * escala)), max(1, round(q.height * escala))
        qs = q.resize((nw, nh), Image.LANCZOS)
        cx = centro_dos_pes(qs)
        x = int(round(ref_centro - cx))
        y = int(round(ref_base - nh))
        col, lin = i % args.cols, i // args.cols
        sheet.alpha_composite(qs, (col * CELL + x, lin * CELL + y))
        caixas.append((x, y, x + nw, y + nh))
        print(f'  quadro {i}: célula ({col},{lin}) figura {nw}x{nh} em x={x} y={y}')

    sheet.save(args.saida, optimize=True)
    x0 = min(c[0] for c in caixas); y0 = min(c[1] for c in caixas)
    x1 = max(c[2] for c in caixas); y1 = max(c[3] for c in caixas)
    print(f'salvo {args.saida} ({sheet.width}x{sheet.height})')
    print(f'JSON: "frames": {len(quadros)}, "defaultVisual": {{"x": {x0}, "y": {y0}, "width": {x1 - x0}, "height": {y1 - y0}}}')

    if args.json_saida:
        import json
        with open(args.json_saida, 'w', encoding='utf-8') as f:
            json.dump(
                {
                    'frames': len(quadros),
                    'defaultVisual': {'x': x0, 'y': y0, 'width': x1 - x0, 'height': y1 - y0},
                    'caixas': caixas,
                },
                f,
            )
    return 0


if __name__ == '__main__':
    sys.exit(main())
