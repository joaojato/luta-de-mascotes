"""Veste a torcida da comemoração v3 com a camiseta em cor chave (magenta).

A v3 (docs/torcida-coletiva-v3.md) foi desenhada sem camisa de propósito:
a camisa entra depois, por cima. Este script pinta, em cada um dos 40
quadros, uma camiseta de manga curta no tronco, em magenta com a sombra da
pele, e o motor troca o magenta pela estampa do clube de cada lado
(src/game/torcida.ts, pintarChave). A animação fica pixel por pixel a
aprovada; só a pele do tronco muda de cor. Depois cada célula é ampliada
até o tamanho do atlas antigo (AMPLIACAO).

    python scripts/torcida_camisa.py            gera atlas e prévia
    python scripts/torcida_camisa.py --sem 3 9  deixa os tipos 3 e 9 sem camisa

Como acha o tronco, em cada célula 64x80:
1. calça: as fileiras de baixo quase todas escuras; o topo dela é a cintura;
2. gola: subindo da cintura pelo meio do corpo, a primeira linha escura é o
   queixo (mediana de várias colunas, para um risco do peito não contar);
3. camiseta: a pele ligada à cintura entre a gola e a calça, numa faixa que
   começa na largura da cintura e abre até a manga curta perto dos ombros.
"""
import argparse
from pathlib import Path

from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
PASTA = RAIZ / 'public/assets/cenarios/estadio/torcida'
ORIGEM = PASTA / 'torcedores-comemoracao-v3.png'
DESTINO = PASTA / 'torcedores-comemoracao-v3-camisa.png'
PREVIA = RAIZ / 'output/torcida-camisa-v1'
CEL_L, CEL_A = 64, 80
MANGA = 6  # quanto a camiseta abre além da cintura na altura dos ombros
# Brilho do magenta no atlas antigo: metade em 255, o mais escuro perto de 176.
BRILHO_MIN, BRILHO_MAX = 0.62, 1.0
# A v3 veio desenhada menor na célula (mediana de 48 px de altura contra 55 no
# atlas antigo) e a arquibancada encolheu na Luta (João, 03/11/2026). Cada
# célula é ampliada com o pé fixo no meio da base, sem misturar cores, para a
# chave magenta continuar exata.
AMPLIACAO = 55 / 48


def lum(p):
    return 0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2]


def escuro(p):
    return p[3] > 0 and lum(p) < 50


def pele(p):
    r, g, b, a = p
    return a > 0 and lum(p) >= 50 and r > g > b and r - b > 30


def tronco(px, x0, y0):
    """Máscara {(x, y)} da camiseta numa célula, em coordenadas da folha."""
    def at(x, y):
        return px[x0 + x, y0 + y]

    # 1. Calça: de baixo para cima, fileiras com 75% ou mais de pixels escuros.
    cintura = None
    for y in range(CEL_A - 1, -1, -1):
        opacos = [x for x in range(CEL_L) if at(x, y)[3] > 0]
        if not opacos:
            if cintura is not None:
                break
            continue
        if sum(escuro(at(x, y)) for x in opacos) / len(opacos) >= 0.75:
            cintura = y
        elif cintura is not None:
            break
    if cintura is None:
        return set()
    base = cintura - 1

    # Largura da cintura: o trecho de pele mais comprido logo acima da calça.
    trechos, atual = [], []
    for x in range(CEL_L):
        if pele(at(x, base)):
            atual.append(x)
        elif atual:
            trechos.append(atual)
            atual = []
    if atual:
        trechos.append(atual)
    if not trechos:
        return set()
    meio_trecho = max(trechos, key=len)
    esq, dir_ = meio_trecho[0], meio_trecho[-1]
    meio = (esq + dir_) // 2

    # 2. Gola: subindo pelo meio, a primeira linha escura depois de pele.
    paradas = []
    for x in range(max(esq, meio - 4), min(dir_, meio + 4) + 1):
        y = base
        while y > 0 and not escuro(at(x, y)):
            y -= 1
        paradas.append(y)
    paradas.sort()
    gola = paradas[len(paradas) // 2] + 1
    if gola >= base - 4:
        return set()

    # 3. Pele ligada à cintura, dentro da faixa que abre até a manga.
    def limite(y):
        t = (base - y) / max(1, base - gola)
        m = round(1 + (MANGA - 1) * t)
        return esq - m, dir_ + m

    semente = (meio, base)
    if not pele(at(*semente)):
        return set()
    mascara, fila = set(), [semente]
    while fila:
        x, y = fila.pop()
        if (x, y) in mascara or not (gola <= y <= base):
            continue
        a, b = limite(y)
        if not (a <= x <= b) or not pele(at(x, y)):
            continue
        mascara.add((x, y))
        fila.extend([(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)])

    # Laterais: a faixa estreita leva a camiseta até o contorno do tronco
    # quando sobram até 3 px de pele; mais que isso é braço encostado.
    for y in range(gola, base + 1):
        linha = [x for x, yy in mascara if yy == y]
        if not linha:
            continue
        for inicio, passo in ((min(linha), -1), (max(linha), 1)):
            resto = []
            x = inicio + passo
            while 0 <= x < CEL_L and pele(at(x, y)) and len(resto) <= 3:
                resto.append(x)
                x += passo
            if len(resto) <= 3 and 0 <= x < CEL_L and not pele(at(x, y)):
                mascara.update((xx, y) for xx in resto)

    # Ombros: até 3 fileiras acima da gola, a pele que encosta na camiseta
    # vira o alto da manga (a linha do queixo é escura e segura o rosto).
    for y in range(gola - 1, gola - 4, -1):
        a, b = limite(gola)
        for x in range(max(0, a), min(CEL_L - 1, b) + 1):
            if (x, y + 1) in mascara and pele(at(x, y)):
                mascara.add((x, y))
    return {(x0 + x, y0 + y) for x, y in mascara}


def vestir(origem, sem):
    im = Image.open(origem).convert('RGBA')
    px = im.load()
    linhas = im.height // CEL_A
    colunas = im.width // CEL_L
    relatorio = []
    for tipo in range(linhas):
        for quadro in range(colunas):
            if tipo in sem:
                relatorio.append((tipo, quadro, 0))
                continue
            mascara = tronco(px, quadro * CEL_L, tipo * CEL_A)
            if mascara:
                # Sombra: a pele mais clara do tronco vira o magenta cheio.
                tons = sorted(lum(px[p]) for p in mascara)
                ref = tons[int(len(tons) * 0.8)] or 1
                for p in mascara:
                    v = round(255 * max(BRILHO_MIN, min(BRILHO_MAX, lum(px[p]) / ref)))
                    px[p] = (v, 0, v, 255)
            relatorio.append((tipo, quadro, len(mascara)))
    return im, relatorio


def ampliar(im):
    """Amplia cada célula por AMPLIACAO, ancorada no meio da base."""
    saida = Image.new('RGBA', im.size)
    largura, altura = round(CEL_L * AMPLIACAO), round(CEL_A * AMPLIACAO)
    sobra_x = (largura - CEL_L) // 2
    for y0 in range(0, im.height, CEL_A):
        for x0 in range(0, im.width, CEL_L):
            cel = im.crop((x0, y0, x0 + CEL_L, y0 + CEL_A)).resize((largura, altura), Image.NEAREST)
            saida.paste(cel.crop((sobra_x, altura - CEL_A, sobra_x + CEL_L, altura)), (x0, y0))
    return saida


def previa(original, vestido):
    """Original, vestido e vestido com uma estampa de teste, lado a lado, ampliados."""
    def pintado(cor):
        im = vestido.copy()
        px = im.load()
        for y in range(im.height):
            for x in range(im.width):
                r, g, b, a = px[x, y]
                if a and g == 0 and r == b and r >= 60:
                    px[x, y] = tuple(round(v * r / 255) for v in cor) + (255,)
        return im

    folhas = [original, vestido, pintado((40, 110, 220)), pintado((30, 140, 60))]
    fundo = Image.new('RGBA', (original.width * len(folhas) + 8 * (len(folhas) - 1), original.height), (40, 44, 50, 255))
    for i, f in enumerate(folhas):
        fundo.alpha_composite(f, (i * (original.width + 8), 0))
    return fundo.resize((fundo.width * 3, fundo.height * 3), Image.NEAREST)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--sem', type=int, nargs='*', default=[], help='tipos (0 a 9) que ficam sem camisa')
    args = ap.parse_args()
    original = ampliar(Image.open(ORIGEM).convert('RGBA'))
    vestido, relatorio = vestir(ORIGEM, set(args.sem))
    vestido = ampliar(vestido)
    vestido.save(DESTINO)
    PREVIA.mkdir(parents=True, exist_ok=True)
    previa(original, vestido).save(PREVIA / 'contato.png')
    for tipo, quadro, n in relatorio:
        aviso = '' if n or tipo in args.sem else '  <- sem camiseta, conferir'
        print(f'tipo {tipo} quadro {quadro}: {n} px{aviso}')
    print(f'atlas: {DESTINO.relative_to(RAIZ)}')
    print(f'prévia: {(PREVIA / "contato.png").relative_to(RAIZ)}')


if __name__ == '__main__':
    main()
