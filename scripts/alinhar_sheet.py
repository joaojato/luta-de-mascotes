"""
Alinha sheet gerada por modelo de imagem (ChatGPT, Gemini) à grade que o
motor lê: células de 256x256, 5 colunas, mesma escala e mesma linha dos pés
de uma sheet de referência.

    python scripts/alinhar_sheet.py ENTRADA SAIDA --ref <sheet de referência>

O que faz:
  1. Se a entrada não tiver transparência, recorta o fundo: verde chapado
     (#00FF00) ou fundo claro sólido (branco), este por preenchimento a
     partir das bordas, o que preserva partes brancas do personagem.
  2. Separa os quadros por faixas vazias. Quando um braço esticado encosta
     no quadro vizinho e não sobra coluna vazia, usa `--esperados` para
     saber que falta quadro e cortar o bloco mais largo.
  3. Aplica a MESMA escala a todos os quadros (medida no primeiro), para
     quadro agachado não virar gigante.
  4. Põe cada quadro numa célula 256x256 com os pés na linha da referência.

Também é módulo: `sprite.py` importa `preparar`, `separar`, `montar` e
`regua_de` para tratar imagem com várias ações, uma por fileira.

Só usa Pillow (não tem numpy nesta máquina).
"""
import argparse
import json
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


def preparar(caminho) -> Image.Image:
    """Abre a imagem e garante fundo transparente."""
    im = Image.open(caminho).convert('RGBA')
    if bbox_alpha(im) != (0, 0, im.width, im.height):
        return im

    verde = recortar_verde(im)
    if bbox_alpha(verde) != (0, 0, im.width, im.height):
        print('fundo: verde chapado')
        return verde

    print('fundo: sólido, removido a partir das bordas')
    return recortar_borda(im)


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


def densidade_colunas(a: Image.Image, x0: int, x1: int, y0: int, y1: int) -> list[int]:
    """Quantos pixels opacos por coluna, no recorte dado."""
    faixa = a.crop((x0, y0, x1, y1))
    return [faixa.crop((x, 0, x + 1, y1 - y0)).histogram()[255] for x in range(x1 - x0)]


def dividir_em_dois(a, bloco, y0, y1) -> list[tuple[int, int]]:
    """Corta um bloco no meio, na coluna com menos pixel.

    Usado quando um braço esticado encosta no quadro vizinho e não sobra
    coluna vazia entre eles.
    """
    x0, x1 = bloco
    largura = x1 - x0
    dens = densidade_colunas(a, x0, x1, y0, y1)
    margem = max(6, largura // 4)
    ini, fim = margem, largura - margem
    if ini >= fim:
        return [bloco]
    corte = x0 + min(range(ini, fim), key=lambda x: dens[x])
    return [(x0, corte), (corte, x1)]


def separar(im: Image.Image, esperados=0) -> list[list[Image.Image]]:
    """Corta a imagem em quadros, agrupados por fileira.

    `esperados` pode ser um número (quantos quadros a imagem inteira tem) ou
    uma lista com o esperado de cada fileira, para imagem que traz uma ação
    por linha. Faltando quadro, o bloco mais largo engoliu um vizinho: corta
    em dois e repete.
    """
    a = im.getchannel('A').point(lambda v: 255 if v > ALPHA_MIN else 0)
    w, h = a.size
    linhas = [a.crop((0, y, w, y + 1)).getbbox() is not None for y in range(h)]

    fileiras = []
    for (y0, y1) in faixas_ocupadas(linhas, minimo_vazio=6):
        faixa = a.crop((0, y0, w, y1))
        colunas = [faixa.crop((x, 0, x + 1, y1 - y0)).getbbox() is not None for x in range(w)]
        blocos = [b for b in faixas_ocupadas(colunas, minimo_vazio=6) if (b[1] - b[0]) > 20]
        if blocos:
            fileiras.append({'y': (y0, y1), 'blocos': blocos})

    if not fileiras:
        return []

    por_fileira = esperados if isinstance(esperados, list) else None
    if por_fileira:
        for i, fileira in enumerate(fileiras):
            alvo = por_fileira[i] if i < len(por_fileira) else 0
            _completar(a, fileira, alvo)
    elif esperados:
        # Ação única: o alvo vale para o total, que pode estar espalhado em
        # mais de uma fileira quando o chat quebra a linha.
        while sum(len(f['blocos']) for f in fileiras) < esperados:
            escolhida = max(
                fileiras,
                key=lambda f: max(b[1] - b[0] for b in f['blocos']),
            )
            if not _completar(a, escolhida, len(escolhida['blocos']) + 1):
                break

    quadros = []
    for fileira in fileiras:
        y0, y1 = fileira['y']
        desta = []
        for (x0, x1) in fileira['blocos']:
            q = im.crop((x0, y0, x1, y1))
            bb = bbox_alpha(q)
            if bb and (bb[2] - bb[0]) > 20 and (bb[3] - bb[1]) > 20:
                desta.append(q.crop(bb))
        if desta:
            quadros.append(desta)
    return quadros


def _completar(a, fileira, alvo: int) -> bool:
    """Divide blocos desta fileira até chegar em `alvo`. Falso se travou."""
    y0, y1 = fileira['y']
    mexeu = False
    while alvo and len(fileira['blocos']) < alvo:
        maior = max(
            range(len(fileira['blocos'])),
            key=lambda i: fileira['blocos'][i][1] - fileira['blocos'][i][0],
        )
        partes = dividir_em_dois(a, fileira['blocos'][maior], y0, y1)
        if len(partes) == 1:
            return mexeu
        largura = fileira['blocos'][maior][1] - fileira['blocos'][maior][0]
        print(f'  bloco de {largura}px separado em dois')
        fileira['blocos'][maior:maior + 1] = partes
        mexeu = True
    return mexeu


def centro_dos_pes(q: Image.Image) -> float:
    """Centro horizontal da parte de baixo da figura (os 12% finais)."""
    w, h = q.size
    base = q.crop((0, int(h * 0.88), w, h))
    bb = bbox_alpha(base)
    if not bb:
        return w / 2
    return (bb[0] + bb[2]) / 2


def regua_de(caminho) -> tuple[int, int, float]:
    """Altura da figura, linha dos pés e centro, na primeira célula da sheet
    de referência. É o que faz todas as ações saírem na mesma escala."""
    ref = Image.open(caminho).convert('RGBA')
    cel = ref.crop((0, 0, CELL, CELL))
    bb = bbox_alpha(cel)
    return bb[3] - bb[1], bb[3], centro_dos_pes(cel.crop(bb)) + bb[0]


def montar(quadros: list[Image.Image], regua: tuple[int, int, float], cols: int = COLS):
    """Monta a sheet na grade e devolve (imagem, medidas para o JSON)."""
    altura, base, centro = regua
    escala = altura / quadros[0].height
    print(f'referência: figura de {altura}px, pés em y={base}, centro x={centro:.0f}')
    print(f'entrada: {len(quadros)} quadros, primeiro com {quadros[0].height}px '
          f'-> escala {escala:.3f}')

    linhas = math.ceil(len(quadros) / cols)
    sheet = Image.new('RGBA', (cols * CELL, linhas * CELL), (0, 0, 0, 0))
    caixas = []
    for i, q in enumerate(quadros):
        nw, nh = max(1, round(q.width * escala)), max(1, round(q.height * escala))
        qs = q.resize((nw, nh), Image.LANCZOS)
        x = int(round(centro - centro_dos_pes(qs)))
        y = int(round(base - nh))
        col, lin = i % cols, i // cols
        sheet.alpha_composite(qs, (col * CELL + x, lin * CELL + y))
        caixas.append((x, y, x + nw, y + nh))
        print(f'  quadro {i}: célula ({col},{lin}) figura {nw}x{nh} em x={x} y={y}')

    x0 = min(c[0] for c in caixas)
    y0 = min(c[1] for c in caixas)
    x1 = max(c[2] for c in caixas)
    y1 = max(c[3] for c in caixas)
    medidas = {
        'frames': len(quadros),
        'defaultVisual': {'x': x0, 'y': y0, 'width': x1 - x0, 'height': y1 - y0},
        'caixas': caixas,
    }
    return sheet, medidas


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument('entrada')
    p.add_argument('saida')
    p.add_argument('--ref', required=True, help='sheet de referência já na grade (ex. idle.png)')
    p.add_argument('--cols', type=int, default=COLS)
    p.add_argument('--esperados', type=int, default=0,
                   help='quantos quadros o pedido pediu; separa blocos colados')
    p.add_argument('--json', dest='json_saida', help='grava frames e defaultVisual neste arquivo')
    args = p.parse_args()

    fileiras = separar(preparar(args.entrada), args.esperados)
    quadros = [q for fileira in fileiras for q in fileira]
    if not quadros:
        print('nenhum quadro encontrado', file=sys.stderr)
        return 1

    sheet, medidas = montar(quadros, regua_de(args.ref), args.cols)
    sheet.save(args.saida, optimize=True)
    visual = medidas['defaultVisual']
    print(f'salvo {args.saida} ({sheet.width}x{sheet.height})')
    print(f'JSON: "frames": {medidas["frames"]}, "defaultVisual": {json.dumps(visual)}')

    if args.json_saida:
        with open(args.json_saida, 'w', encoding='utf-8') as f:
            json.dump(medidas, f)
    return 0


if __name__ == '__main__':
    sys.exit(main())
