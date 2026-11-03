"""Logos da abertura em estilo retrô (João, 03/11/2026): Resenha Games, a
desenvolvedora, e depois a PUC-Rio.

Cada logo vira pixel arte de console de 16 bits: fundo tirado, resolução
baixa (o jogo amplia 3x sem suavizar), paleta curta e borda sem meio-tom.
A folha tem os quadros do mosaico, do pixel grosso ao fino, como o efeito
de mosaico do Super Nintendo: cada bloco pega a cor de um pixel só, então a
paleta não muda entre os quadros. O último quadro é a logo pronta.

Fonte (fora do git): referencia/abertura/resenha-games.png e puc-rio.png.
Saída: public/assets/abertura/<nome>.png. Os tamanhos de quadro são os de
src/game/abertura.ts (LOGOS_DA_ABERTURA); o teste confere os dois.

    python scripts/abertura_logos.py
"""
from collections import deque
from pathlib import Path

from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
FONTE = RAIZ / 'referencia/abertura'
DESTINO = RAIZ / 'public/assets/abertura'
PREVIA = RAIZ / 'output/abertura-retro'

# Lado do bloco em cada quadro do mosaico, do grosso ao fino.
BLOCOS = [12, 8, 5, 3, 2, 1]

# nome: (arquivo, quadro largura x altura, lado que manda, tamanho dele, cores, tolerância do fundo)
LOGOS = {
    'resenha-games': ('resenha-games.png', (176, 120), 'largura', 168, 8, 40),
    'puc-rio': ('puc-rio.png', (80, 120), 'altura', 112, 12, 60),
}


def sem_fundo(im, tolerancia):
    """Apaga o fundo ligado aos cantos (preenchimento a partir das bordas)."""
    im = im.convert('RGBA')
    px = im.load()
    w, h = im.size
    fundo = px[0, 0][:3]
    perto = lambda p: sum(abs(a - b) for a, b in zip(p[:3], fundo)) <= tolerancia
    visto = set()
    fila = deque((x, y) for x in range(w) for y in (0, h - 1))
    fila.extend((x, y) for y in range(h) for x in (0, w - 1))
    while fila:
        x, y = fila.popleft()
        if (x, y) in visto or not (0 <= x < w and 0 <= y < h) or not perto(px[x, y]):
            continue
        visto.add((x, y))
        px[x, y] = (0, 0, 0, 0)
        fila.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    return im.crop(im.getbbox())


def pixel_arte(im, lado, tamanho, cores):
    """Reduz, binariza o alfa e limita a paleta."""
    if lado == 'largura':
        novo = (tamanho, round(im.height * tamanho / im.width))
    else:
        novo = (round(im.width * tamanho / im.height), tamanho)
    # Reduz com o alfa pré-multiplicado, para a borda não puxar a cor do fundo.
    pequeno = im.convert('RGBa').resize(novo, Image.LANCZOS).convert('RGBA')
    alfa = pequeno.getchannel('A').point(lambda a: 255 if a >= 110 else 0)
    rgb = Image.new('RGB', pequeno.size)
    rgb.paste(pequeno.convert('RGB'), mask=alfa)
    paleta = rgb.quantize(cores, method=Image.Quantize.MEDIANCUT, kmeans=2).convert('RGB')
    saida = paleta.convert('RGBA')
    saida.putalpha(alfa)
    return saida


def mosaico(im, bloco):
    if bloco == 1:
        return im
    reduzido = im.resize((max(1, im.width // bloco), max(1, im.height // bloco)), Image.NEAREST)
    return reduzido.resize((reduzido.width * bloco, reduzido.height * bloco), Image.NEAREST).crop((0, 0, im.width, im.height))


def folha(nome, arquivo, quadro, lado, tamanho, cores, tolerancia):
    logo = pixel_arte(sem_fundo(Image.open(FONTE / arquivo), tolerancia), lado, tamanho, cores)
    qw, qh = quadro
    assert logo.width <= qw and logo.height <= qh, f'{nome}: {logo.size} não cabe em {quadro}'
    centrado = Image.new('RGBA', quadro)
    centrado.paste(logo, ((qw - logo.width) // 2, (qh - logo.height) // 2))
    saida = Image.new('RGBA', (qw * len(BLOCOS), qh))
    for i, bloco in enumerate(BLOCOS):
        saida.paste(mosaico(centrado, bloco), (i * qw, 0))
    DESTINO.mkdir(parents=True, exist_ok=True)
    saida.save(DESTINO / f'{nome}.png')
    PREVIA.mkdir(parents=True, exist_ok=True)
    previa = Image.new('RGBA', saida.size, (5, 3, 10, 255))
    previa.alpha_composite(saida)
    previa.resize((saida.width * 3, saida.height * 3), Image.NEAREST).save(PREVIA / f'{nome}.png')
    print(f'{nome}: logo {logo.size} no quadro {quadro}, {len(BLOCOS)} quadros')


if __name__ == '__main__':
    for nome, dados in LOGOS.items():
        folha(nome, *dados)
    print(f'prévia ampliada em {PREVIA.relative_to(RAIZ)}')
