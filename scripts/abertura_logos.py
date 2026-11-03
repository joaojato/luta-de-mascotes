"""Logos da abertura em estilo retrô (João, 03/11/2026): Resenha Games, a
desenvolvedora, e depois a PUC-Rio.

Cada logo vira pixel arte de console de 16 bits: fundo tirado, resolução
baixa (o jogo amplia 3x sem suavizar), paleta curta e borda sem meio-tom.
A folha tem os quadros do mosaico, do pixel grosso ao fino, como o efeito
de mosaico do Super Nintendo: cada bloco pega a cor de um pixel só, então a
paleta não muda entre os quadros. O último quadro do mosaico é a logo pronta.

Na Resenha Games, depois do mosaico vêm os quadros do olhar (João,
03/11/2026): os olhos do controle, que olham para a esquerda, vão até a
direita em OLHAR passos. A pupila está fundida no contorno esquerdo do olho;
cada quadro refaz o olho vazio espelhando a metade direita (limpa) e
redesenha a pupila redonda mais à direita.

Fonte (fora do git): referencia/abertura/resenha-games.png e
puc-rio-transparente.png.
Saída: public/assets/abertura/<nome>.png. Os tamanhos de quadro são os de
src/game/abertura.ts (LOGOS_DA_ABERTURA); o teste confere os dois.

    python scripts/abertura_logos.py
"""
from collections import deque
from statistics import median
from pathlib import Path

from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
FONTE = RAIZ / 'referencia/abertura'
DESTINO = RAIZ / 'public/assets/abertura'
PREVIA = RAIZ / 'output/abertura-retro'

# Lado do bloco em cada quadro do mosaico, do grosso ao fino.
BLOCOS = [12, 8, 5, 3, 2, 1]

# Quadros do olhar, da esquerda (o último do mosaico) até a direita.
OLHAR = 3

# nome: (arquivo, quadro largura x altura, lado que manda, tamanho dele, cores,
#        tolerância do fundo, linha da fonte a partir da qual o texto vira branco,
#        se o "O" de RIO precisa do furo aberto, um ponto dentro de cada olho
#        que olha, no quadro)
# A PUC usa a versão para fundo escuro que o João baixou (03/11/2026): fundo
# já transparente e "PUC RIO" já em branco, então não pinta nada.
LOGOS = {
    'resenha-games': ('resenha-games.png', (176, 120), 'largura', 168, 8, 40, None, False, [(80, 32), (112, 32)]),
    'puc-rio': ('puc-rio-transparente.png', (80, 120), 'altura', 112, 12, 60, None, True, []),
}
BRANCO = (255, 255, 255)


def sem_fundo(im, tolerancia, texto_branco=None):
    """Apaga o fundo ligado aos cantos (preenchimento a partir das bordas) e,
    com `texto_branco`, pinta de branco o que sobrou dessa linha para baixo."""
    im = im.convert('RGBA')
    px = im.load()
    w, h = im.size
    if px[0, 0][3] == 0:
        # Fonte que já vem sem fundo: só recorta.
        return im.crop(im.getbbox())
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
    if texto_branco is not None:
        for y in range(texto_branco, h):
            for x in range(w):
                if px[x, y][3]:
                    px[x, y] = BRANCO + (px[x, y][3],)
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


def abrir_o(im, linhas=8, anel=2):
    """O "O" de RIO tem um furo de 2 px na fonte, que some na redução e
    vira bolinha. Pega a última letra da linha de baixo (a mais à direita) e
    deixa só um anel de `anel` px, como o desenho original."""
    px = im.load()
    w, h = im.size
    topo = h - linhas
    cheio = {(x, y) for y in range(topo, h) for x in range(w) if px[x, y][3]}
    if not cheio:
        return im
    inicio = max(cheio, key=lambda p: p[0])
    letra, fila = set(), deque([inicio])
    while fila:
        x, y = fila.popleft()
        if (x, y) in letra or (x, y) not in cheio:
            continue
        letra.add((x, y))
        fila.extend((x + dx, y + dy) for dx in (-1, 0, 1) for dy in (-1, 0, 1))
    miolo = [(x, y) for x, y in letra
             if all((x + dx, y + dy) in letra for dx in range(-anel, anel + 1) for dy in range(-anel, anel + 1))]
    for x, y in miolo:
        px[x, y] = (0, 0, 0, 0)
    return im


def claro(p):
    return p[3] and sum(p[:3]) > 500


def miolo_claro(px, w, h, semente):
    """O branco do olho em volta da pupila: a região clara que contém a semente."""
    vis, fila = set(), deque([semente])
    while fila:
        x, y = fila.popleft()
        if (x, y) in vis or not (0 <= x < w and 0 <= y < h) or not claro(px[x, y]):
            continue
        vis.add((x, y))
        fila.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    return vis


def medir_olho(px, w, h, semente):
    """Eixo do olho, faixa do contorno e da pupila em cada fileira e quanto
    a pupila anda até a direita. O olho é simétrico; a pupila mora à esquerda."""
    assert claro(px[semente]), f'semente {semente} fora do branco do olho'
    branco = miolo_claro(px, w, h, semente)
    linhas = sorted({y for _, y in branco})
    assert len(linhas) >= 20, f'olho em {semente} pequeno demais: {len(linhas)} fileiras'
    esq = {y: min(x for x, yy in branco if yy == y) for y in linhas}
    dir_ = {y: max(x for x, yy in branco if yy == y) for y in linhas}
    # Eixo: nas fileiras de cima a pupila não chega e o branco é simétrico.
    de_cima = sorted(esq[y] + dir_[y] for y in linhas[1:len(linhas) // 4 + 1])
    soma = de_cima[len(de_cima) // 2]
    # Grossura do contorno à direita (onde um olho encosta no outro, a corrida é maior).
    corridas = []
    for y in linhas:
        x = dir_[y] + 1
        while not claro(px[x, y]):
            x += 1
        corridas.append(x - dir_[y] - 1)
    borda = round(median(c for c in corridas if c <= 6))
    # Fileiras da pupila: o branco começa depois do espelho da borda direita.
    contorno = {y: (soma - (dir_[y] + borda), esq[y] - 1) for y in linhas if esq[y] > soma - dir_[y] + 1}
    curso = min(soma - a - b for a, b in contorno.values())
    # A pupila é redonda: a borda esquerda é o espelho da direita em torno do
    # centro dela (na fileira mais larga). O resto da faixa é contorno e fica.
    larga = max(contorno.values(), key=lambda f: f[1] - f[0])
    pupila = {y: (max(a, larga[0] + larga[1] - b), b) for y, (a, b) in contorno.items()}
    return soma, contorno, pupila, curso


def olhar(logo, sementes, passos):
    """Quadros com a pupila de cada olho indo para a direita, um por passo."""
    px = logo.load()
    olhos = [medir_olho(px, logo.width, logo.height, s) for s in sementes]
    quadros = []
    for passo in range(1, passos + 1):
        q = logo.copy()
        qp = q.load()
        for soma, contorno, pupila, curso in olhos:
            # Olho vazio: a metade esquerda espelhada da direita.
            for y, (a, _) in contorno.items():
                for x in range(a, soma // 2 + 1):
                    qp[x, y] = px[soma - x, y]
            dx = round(curso * passo / passos)
            for y, (a, b) in pupila.items():
                for x in range(a, b + 1):
                    qp[x + dx, y] = px[x, y]
        quadros.append(q)
    return quadros


def mosaico(im, bloco):
    if bloco == 1:
        return im
    reduzido = im.resize((max(1, im.width // bloco), max(1, im.height // bloco)), Image.NEAREST)
    return reduzido.resize((reduzido.width * bloco, reduzido.height * bloco), Image.NEAREST).crop((0, 0, im.width, im.height))


def folha(nome, arquivo, quadro, lado, tamanho, cores, tolerancia, texto_branco, furo_do_o, olhos):
    logo = pixel_arte(sem_fundo(Image.open(FONTE / arquivo), tolerancia, texto_branco), lado, tamanho, cores)
    if furo_do_o:
        logo = abrir_o(logo)
    qw, qh = quadro
    assert logo.width <= qw and logo.height <= qh, f'{nome}: {logo.size} não cabe em {quadro}'
    centrado = Image.new('RGBA', quadro)
    centrado.paste(logo, ((qw - logo.width) // 2, (qh - logo.height) // 2))
    quadros = [mosaico(centrado, bloco) for bloco in BLOCOS]
    if olhos:
        quadros += olhar(centrado, olhos, OLHAR)
    saida = Image.new('RGBA', (qw * len(quadros), qh))
    for i, q in enumerate(quadros):
        saida.paste(q, (i * qw, 0))
    DESTINO.mkdir(parents=True, exist_ok=True)
    saida.save(DESTINO / f'{nome}.png')
    PREVIA.mkdir(parents=True, exist_ok=True)
    previa = Image.new('RGBA', saida.size, (5, 3, 10, 255))
    previa.alpha_composite(saida)
    previa.resize((saida.width * 3, saida.height * 3), Image.NEAREST).save(PREVIA / f'{nome}.png')
    print(f'{nome}: logo {logo.size} no quadro {quadro}, {len(BLOCOS)} de mosaico e {OLHAR if olhos else 0} de olhar')


if __name__ == '__main__':
    for nome, dados in LOGOS.items():
        folha(nome, *dados)
    print(f'prévia ampliada em {PREVIA.relative_to(RAIZ)}')
