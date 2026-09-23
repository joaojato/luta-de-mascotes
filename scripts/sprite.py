"""
Automatiza o que cerca a geração de sprite no ChatGPT ou no Gemini: monta o
pedido (prompt + as duas imagens de referência) e recebe o resultado
(alinha à grade e registra no JSON do lutador).

Gerar a imagem continua sendo o João, no chat. O que sai daqui é tudo o que
ele precisa colar e anexar, e o que entra é o PNG que o chat devolveu.

    python scripts/sprite.py pedido urubu idle
    python scripts/sprite.py entrega urubu idle ~/Downloads/resultado.png

O pedido vai para `referencia/pedidos/<slug>-<acao>/` (fora do git):

    prompt.txt          para colar no chat
    1-personagem.png    o modelo oficial do mascote
    2-movimento.png     a mesma ação num lutador que já está no jogo

A entrega alinha pela escala do lutador de amostra (o mesmo de onde saiu a
referência de movimento), escreve a sheet na pasta da skin e atualiza o JSON
do mascote (`frames`, `frameRate`, `repeat`, `defaultVisual`) e a lista
`sobrescreve` da skin.

Nada aqui usa Spriterrific: a arte vem do chat, o movimento vem do lutador
que já está no jogo, e a escala vem dele também.
"""
import argparse
import json
import os
import re
import subprocess
import sys
import time
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
import alinhar_sheet  # noqa: E402

RAIZ = Path(__file__).resolve().parent.parent
PUBLIC = RAIZ / 'public'
LUTADORES = RAIZ / 'src' / 'game' / 'lutadores'
PEDIDOS = RAIZ / 'referencia' / 'pedidos'
CELL = 256
COLS = 5
ALPHA_MIN = 8

# Lutador do jogo de onde sai a referência de movimento, e quantos quadros
# pedir. Menos quadros do que a sheet original: o chat perde a mão quando
# passa disso, e o jogo não precisa de mais para ler a ação.
REFERENCIA_MOVIMENTO = 'red-brawler'
QUADROS = {
    'idle': 4,
    'walk-forward': 6,
    'walk-backward': 6,
    'crouch': 3,
    'jump': 5,
    'block-high': 4,
    'block-low': 4,
    'hit-high': 4,
    'light-punch': 6,
    'heavy-kick': 6,
    'special-charge': 4,
    'special': 8,
    'knockdown': 6,
}

# Uma frase por ação, para o chat saber o que o corpo faz. O resto (estilo,
# identidade, direção) vem da descrição travada e da imagem de referência.
MOVIMENTO = {
    'idle': 'a breathing idle stance, fists up in guard, feet planted, only the chest and shoulders move',
    'walk-forward': 'walking forward in a guarded stance, guard up, upright torso, no sprint lean',
    'walk-backward': 'stepping backwards in a guarded stance, guard up, weight on the back foot',
    'crouch': 'crouching down low, knees bent, guard still up',
    'jump': 'a vertical jump: crouch, launch, airborne with legs tucked, and landing',
    'block-high': 'a standing high block, both forearms raised to cover the head, feet planted',
    'block-low': 'a low crouching block, knees bent, both forearms covering the head and chest',
    'hit-high': 'being hit in the face: head snaps back, body staggers one step, returns to guard',
    'light-punch': 'a quick straight jab with the lead fist, feet planted, snapping back to guard',
    'heavy-kick': 'a heavy roundhouse kick with the back leg, full hip rotation, recovering to guard',
    'special-charge': 'charging up power, crouched slightly, fists clenched at the sides',
    'special': 'a powerful signature attack, big wind-up, full extension, slow recovery',
    'knockdown': 'being knocked down: thrown backwards, falling, landing flat on the back',
}


def bbox_alpha(im: Image.Image):
    return im.getchannel('A').point(lambda v: 255 if v > ALPHA_MIN else 0).getbbox()


def carregar_lutador(slug: str) -> tuple[Path, dict]:
    caminho = LUTADORES / f'{slug}.json'
    if not caminho.exists():
        sys.exit(f'não achei {caminho}')
    return caminho, json.loads(caminho.read_text(encoding='utf-8'))


def skin_base(lutador: dict) -> str:
    skins = lutador.get('skins') or []
    return skins[0]['pasta'] if skins else ''


def pasta_skin(lutador: dict, skin: str | None) -> Path:
    raiz = PUBLIC / lutador['assetRoot'].lstrip('/')
    skins = lutador.get('skins') or []
    if not skins:
        return raiz
    alvo = skin or skins[0]['pasta']
    return raiz / alvo


def descricao(slug: str) -> str:
    doc = RAIZ / 'docs' / 'mascotes' / f'{slug}.md'
    if not doc.exists():
        sys.exit(f'falta a descrição visual em {doc}')
    texto = doc.read_text(encoding='utf-8')
    achado = re.search(r'<!-- DESCRICAO:INICIO -->(.*?)<!-- DESCRICAO:FIM -->', texto, re.S)
    if not achado:
        sys.exit(f'{doc} não tem o bloco DESCRICAO:INICIO/FIM')
    return achado.group(1).strip()


def quadros_da_sheet(caminho: Path, total: int) -> list[Image.Image]:
    """Corta a sheet do lutador de amostra em quadros de 256, na ordem."""
    sheet = Image.open(caminho).convert('RGBA')
    quadros = []
    for i in range(total):
        col, lin = i % COLS, i // COLS
        cel = sheet.crop((col * CELL, lin * CELL, (col + 1) * CELL, (lin + 1) * CELL))
        if bbox_alpha(cel):
            quadros.append(cel)
    return quadros


def escolher(quadros: list, quantos: int) -> list:
    """Pega `quantos` quadros distribuídos, sempre com o primeiro e o último."""
    if len(quadros) <= quantos:
        return quadros
    passo = (len(quadros) - 1) / (quantos - 1)
    return [quadros[round(i * passo)] for i in range(quantos)]


PASTAS_VIGIADAS = [Path.home() / 'Downloads', Path.home() / 'Desktop']
IMAGENS = {'.png', '.jpg', '.jpeg', '.webp'}


def vigiar(minutos: int) -> Path | None:
    """Espera um arquivo de imagem novo em Downloads ou na Área de Trabalho.

    Evita o palpite de "arquivo mais recente" fotografando o que já existe
    antes de esperar, e só aceita o que aparecer depois. Espera o tamanho
    parar de crescer para não pegar download pela metade.
    """
    antes = {
        arquivo
        for pasta in PASTAS_VIGIADAS
        if pasta.exists()
        for arquivo in pasta.iterdir()
        if arquivo.suffix.lower() in IMAGENS
    }
    limite = time.time() + minutos * 60
    print(f'esperando a imagem cair em Downloads ou na Área de Trabalho '
          f'(até {minutos} min, Ctrl+C para sair)...')

    while time.time() < limite:
        for pasta in PASTAS_VIGIADAS:
            if not pasta.exists():
                continue
            for arquivo in pasta.iterdir():
                if arquivo.suffix.lower() not in IMAGENS or arquivo in antes:
                    continue
                tamanho = -1
                while tamanho != arquivo.stat().st_size:
                    tamanho = arquivo.stat().st_size
                    time.sleep(0.6)
                print(f'peguei {arquivo}')
                return arquivo
        time.sleep(1.5)

    print('tempo esgotado, nada apareceu.')
    return None


def comando_pedido(args) -> int:
    caminho_json, lutador = carregar_lutador(args.slug)
    acao = args.acao
    quantos = args.quadros or QUADROS.get(acao, 5)

    _, amostra = carregar_lutador(REFERENCIA_MOVIMENTO)
    spec = next((a for a in amostra['actions'] if a['action'] == acao), None)
    if not spec:
        sys.exit(f'{REFERENCIA_MOVIMENTO} não tem a ação "{acao}". Ações: '
                 + ', '.join(a['action'] for a in amostra['actions']))

    destino = PEDIDOS / f'{args.slug}-{acao}'
    destino.mkdir(parents=True, exist_ok=True)

    # 1. o personagem
    modelo = RAIZ / 'referencia' / args.slug / 'modelo-oficial.png'
    if not modelo.exists():
        sys.exit(f'falta o modelo oficial em {modelo}')
    Image.open(modelo).save(destino / '1-personagem.png')

    # 2. o movimento, em uma fileira ampliada
    sheet = PUBLIC / amostra['assetRoot'].lstrip('/') / spec['file']
    quadros = escolher(quadros_da_sheet(sheet, spec['frames']), quantos)
    recortes = [q.crop(bbox_alpha(q)) for q in quadros]
    escala = 2
    altura = max(r.height for r in recortes) * escala
    largura = sum(r.width for r in recortes) * escala + 20 * (len(recortes) + 1)
    fileira = Image.new('RGBA', (largura, altura + 40), (255, 255, 255, 255))
    x = 20
    for r in recortes:
        g = r.resize((r.width * escala, r.height * escala), Image.NEAREST)
        fileira.alpha_composite(g, (x, altura + 20 - g.height))
        x += g.width + 20
    fileira.convert('RGB').save(destino / '2-movimento.png')

    prompt = f"""Replace the fighter in image 2 with the character from
image 1. Same {len(recortes)} frames, same poses.

The character:
{descricao(args.slug)}"""

    (destino / 'prompt.txt').write_text(prompt, encoding='utf-8')

    print(f'pedido pronto em {destino}')
    print(f'  1-personagem.png  modelo oficial do {args.slug}')
    print(f'  2-movimento.png   {acao} do {REFERENCIA_MOVIMENTO}, '
          f'{len(recortes)} de {spec["frames"]} quadros, ampliado {escala}x')
    print(f'  prompt.txt        {len(prompt)} caracteres')
    print()
    if args.abrir or args.aguardar:
        try:
            subprocess.run(['clip'], input=prompt.encode('utf-16-le'), check=True)
            print('prompt copiado para a área de transferência')
        except Exception as erro:
            print(f'(não consegui copiar o prompt: {erro})')
        subprocess.run(['explorer', str(destino)])

    if args.abrir or args.aguardar:
        os.startfile('https://chatgpt.com/')
        print('ChatGPT aberto numa conversa nova.')

    print()
    print('1. Ctrl+V no chat (o prompt já está copiado)')
    print('2. arrasta 1-personagem.png e 2-movimento.png da pasta que abriu')
    print('3. Enter, e salva a imagem que voltar (Downloads serve)')

    if not args.aguardar:
        print()
        print(f'Depois: npm run sprite -- entrega {args.slug} {acao} <arquivo baixado>')
        return 0

    print()
    baixado = vigiar(args.minutos)
    if not baixado:
        return 1
    return entregar(args.slug, acao, baixado, args.skin, None)


def comando_entrega(args) -> int:
    entrada = Path(args.arquivo).expanduser()
    if not entrada.exists():
        sys.exit(f'não achei {entrada}')
    return entregar(args.slug, args.acao, entrada, args.skin, args.fps)


def entregar(slug: str, acao_nome: str, entrada: Path, skin: str | None, fps: int | None,
             esperados: int = 0) -> int:
    caminho_json, lutador = carregar_lutador(slug)

    base = skin_base(lutador)
    destino_skin = skin or base
    saida = pasta_skin(lutador, destino_skin) / f'{acao_nome}.png'
    saida.parent.mkdir(parents=True, exist_ok=True)

    # A régua de escala é o mesmo lutador de onde saiu a referência de
    # movimento, para o resultado voltar na escala das poses que o chat copiou.
    # Nunca depende de sheet anterior do próprio mascote.
    _, base_amostra = carregar_lutador(REFERENCIA_MOVIMENTO)
    regua = PUBLIC / base_amostra['assetRoot'].lstrip('/') / 'idle.png'
    if not regua.exists():
        sys.exit(f'falta a régua de escala em {regua}')

    fileiras = alinhar_sheet.separar(
        alinhar_sheet.preparar(entrada), QUADROS.get(acao_nome, 0) if not esperados else esperados
    )
    quadros = [q for fileira in fileiras for q in fileira]
    if not quadros:
        sys.exit('nenhum quadro encontrado na imagem')

    sheet, dados = alinhar_sheet.montar(quadros, alinhar_sheet.regua_de(regua))
    sheet.save(saida, optimize=True)

    registrar(lutador, caminho_json, acao_nome, dados, destino_skin, fps)
    print(f'sheet em {saida.relative_to(RAIZ)}')
    avisar_golpe(acao_nome)
    print('Confira na Academia antes de dar por pronto.')
    return 0


def registrar(lutador: dict, caminho_json: Path, acao_nome: str, dados: dict,
              destino_skin: str, fps: int | None) -> None:
    """Escreve a ação no JSON, na skin certa.

    Cada sheet tem sua contagem de quadros e sua caixa, então ação de skin
    extra vai para o bloco `acoes` dela, e nunca por cima da base: senão a
    base passa a apontar para arquivo que não existe na pasta dela.
    """
    _, amostra = carregar_lutador(REFERENCIA_MOVIMENTO)
    modelo = next((a for a in amostra['actions'] if a['action'] == acao_nome), None)

    spec = {
        'file': f'{acao_nome}.png',
        'frames': dados['frames'],
        'frameRate': fps or (modelo['frameRate'] if modelo else 10),
        'repeat': modelo['repeat'] if modelo else 0,
        'defaultVisual': dados['defaultVisual'],
    }

    skins = lutador.get('skins') or []
    base = skins[0]['pasta'] if skins else ''
    variante = next((v for v in skins if v['pasta'] == destino_skin), None)

    if variante is not None and destino_skin != base:
        antiga = (variante.setdefault('acoes', {})).get(acao_nome, {})
        rotulo = antiga.get('label') or acao_nome.replace('-', ' ').title()
        variante['acoes'][acao_nome] = {**antiga, **spec, 'label': rotulo}
        onde = f'skin {destino_skin}'
    else:
        acao = next((a for a in lutador['actions'] if a['action'] == acao_nome), None)
        if acao is None:
            acao = {'action': acao_nome, 'label': acao_nome}
            lutador['actions'].append(acao)
        acao.update(spec)
        acao['label'] = acao.get('label', acao_nome).replace(' (placeholder: idle)', '')
        onde = 'base'

    caminho_json.write_text(
        json.dumps(lutador, indent=2, ensure_ascii=False) + '\n', encoding='utf-8'
    )
    print(f'JSON ({onde}): {acao_nome}, {spec["frames"]} quadros, {spec["frameRate"]} fps')


def avisar_golpe(acao_nome: str) -> None:
    if acao_nome in ('light-punch', 'heavy-kick', 'special'):
        print(f'  ATENÇÃO: {acao_nome} precisa de `attack` (quadros ativos e caixa), '
              'que sai na Academia.')


# Quantas ações e quantos quadros cabem numa imagem só sem o chat perder a
# mão. Acima disso as poses começam a sair desalinhadas entre as fileiras.
LOTE_ACOES = 3
LOTE_QUADROS = 13


def copiar(texto: str) -> None:
    try:
        subprocess.run(['clip'], input=texto.encode('utf-16-le'), check=True)
    except Exception as erro:
        print(f'(não consegui copiar: {erro})')


def acoes_faltando(lutador: dict, skin: str | None) -> list[str]:
    """Ações que ainda não têm sheet própria na skin de destino."""
    _, amostra = carregar_lutador(REFERENCIA_MOVIMENTO)
    tem_referencia = {a['action'] for a in amostra['actions']}

    if skin:
        variante = next((v for v in lutador.get('skins') or [] if v['pasta'] == skin), None)
        if variante is not None and 'sobrescreve' in variante:
            proprios = set(variante['sobrescreve'])
            return [
                a['action'] for a in lutador['actions']
                if a['action'] in tem_referencia and f'{a["action"]}.png' not in proprios
            ]

    # Skin base: falta o que ainda aponta para a sheet de outra ação.
    return [
        a['action'] for a in lutador['actions']
        if a['action'] in tem_referencia and a['file'] != f'{a["action"]}.png'
    ]


def agrupar(acoes: list[str]) -> list[list[str]]:
    """Junta ações em blocos que cabem numa imagem só."""
    blocos, atual, quadros = [], [], 0
    for acao in acoes:
        custo = QUADROS.get(acao, 5)
        if atual and (len(atual) >= LOTE_ACOES or quadros + custo > LOTE_QUADROS):
            blocos.append(atual)
            atual, quadros = [], 0
        atual.append(acao)
        quadros += custo
    if atual:
        blocos.append(atual)
    return blocos


def imagem_de_movimento(acoes: list[str], destino: Path, indice: int) -> list[int]:
    """Uma imagem com uma ação por fileira. Devolve quantos quadros em cada."""
    _, amostra = carregar_lutador(REFERENCIA_MOVIMENTO)
    raiz = PUBLIC / amostra['assetRoot'].lstrip('/')

    linhas, contagem = [], []
    for acao in acoes:
        spec = next(a for a in amostra['actions'] if a['action'] == acao)
        quadros = escolher(
            quadros_da_sheet(raiz / spec['file'], spec['frames']), QUADROS.get(acao, 5)
        )
        recortes = [q.crop(bbox_alpha(q)) for q in quadros]
        linhas.append(recortes)
        contagem.append(len(recortes))

    escala = 2
    folga_x, folga_y = 20, 60
    largura = max(
        sum(r.width for r in linha) * escala + folga_x * (len(linha) + 1) for linha in linhas
    )
    alturas = [max(r.height for r in linha) * escala for linha in linhas]
    altura = sum(alturas) + folga_y * (len(linhas) + 1)

    imagem = Image.new('RGBA', (largura, altura), (255, 255, 255, 255))
    y = folga_y
    for linha, alt in zip(linhas, alturas):
        x = folga_x
        for recorte in linha:
            g = recorte.resize((recorte.width * escala, recorte.height * escala), Image.NEAREST)
            imagem.alpha_composite(g, (x, y + alt - g.height))
            x += g.width + folga_x
        y += alt + folga_y

    imagem.convert('RGB').save(destino / f'movimento-{indice}.png')
    return contagem


def comando_lote(args) -> int:
    _, lutador = carregar_lutador(args.slug)
    faltando = args.acoes or acoes_faltando(lutador, args.skin)
    if not faltando:
        print('nada faltando: todas as ações já têm sheet própria.')
        return 0

    blocos = agrupar(faltando)
    destino = PEDIDOS / f'{args.slug}-lote'
    destino.mkdir(parents=True, exist_ok=True)

    modelo = RAIZ / 'referencia' / args.slug / 'modelo-oficial.png'
    if not modelo.exists():
        sys.exit(f'falta o modelo oficial em {modelo}')
    Image.open(modelo).save(destino / '1-personagem.png')

    contagens = [imagem_de_movimento(bloco, destino, i + 1) for i, bloco in enumerate(blocos)]

    primeira = f"""Replace the fighter in image 2 with the character from
image 1. Keep the {len(blocos[0])} rows, same poses in each.

The character:
{descricao(args.slug)}"""

    (destino / 'texto-1.txt').write_text(primeira, encoding='utf-8')

    roteiro = [
        f'# Lote do {args.slug}: {len(faltando)} ações em {len(blocos)} mensagens',
        '',
        'Tudo na **mesma conversa**, na ordem. O personagem fica no contexto do',
        'chat, então da segunda mensagem em diante o texto é curto.',
        '',
        '## Mensagem 1',
        '',
        'Anexa `1-personagem.png` e `movimento-1.png`, e cola:',
        '',
        '```',
        primeira,
        '```',
        '',
    ]

    for i, bloco in enumerate(blocos[1:], start=2):
        seguinte = (
            f'Same character. New reference attached, {len(bloco)} rows.'
        )
        (destino / f'texto-{i}.txt').write_text(seguinte, encoding='utf-8')
        roteiro += [f'## Mensagem {i}', '', f'Anexa `movimento-{i}.png`, e cola:', '',
                    '```', seguinte, '```', '']

    (destino / 'roteiro.md').write_text('\n'.join(roteiro), encoding='utf-8')

    print(f'lote pronto em {destino}')
    for i, bloco in enumerate(blocos, start=1):
        print(f'  mensagem {i}: {", ".join(bloco)} ({sum(contagens[i - 1])} quadros)')

    if args.abrir or args.aguardar:
        copiar(primeira)
        subprocess.run(['explorer', str(destino)])
        os.startfile('https://chatgpt.com/')
        print()
        print('ChatGPT aberto, texto da mensagem 1 já copiado.')

    print()
    print('Por mensagem: cola o texto, arrasta a imagem, envia, salva o resultado.')
    print('Os textos na ordem estão em roteiro.md.')

    if not args.aguardar:
        return 0

    for i, bloco in enumerate(blocos, start=1):
        print()
        print(f'--- mensagem {i}: {", ".join(bloco)} ---')
        baixado = vigiar(args.minutos)
        if not baixado:
            print('parei aqui. O que já entrou está registrado.')
            return 1
        entregar_bloco(args.slug, bloco, contagens[i - 1], baixado, args.skin)
        if i < len(blocos):
            copiar((destino / f'texto-{i + 1}.txt').read_text(encoding='utf-8'))
            print(f'texto da mensagem {i + 1} copiado. Anexa movimento-{i + 1}.png.')
    return 0


# Uma sobra do quadro vizinho (pé cortado, sombra solta) chega como faixa
# isolada dentro da célula. Abaixo disto ela é lixo do gerador, não pose.
VAO_MINIMO = 24


def ilhas_soltas(cel: Image.Image) -> list[tuple[int, int]]:
    """Faixas horizontais da célula que estão separadas do corpo do lutador.

    O Codex às vezes deixa cair na célula de baixo o pé do quadro de cima.
    Devolve as faixas (y0, y1) que não são o bloco principal, para avisar ou
    apagar. Lista vazia quer dizer célula limpa.
    """
    px = cel.load()
    largura, altura = cel.size
    cheias = [any(px[x, y][3] > ALPHA_MIN for x in range(largura)) for y in range(altura)]

    faixas, inicio = [], None
    for y, cheia in enumerate(cheias + [False]):
        if cheia and inicio is None:
            inicio = y
        elif not cheia and inicio is not None:
            if faixas and inicio - faixas[-1][1] < VAO_MINIMO:
                faixas[-1] = (faixas[-1][0], y)  # vão curto: mesmo corpo
            else:
                faixas.append((inicio, y))
            inicio = None

    if len(faixas) < 2:
        return []
    corpo = max(faixas, key=lambda f: f[1] - f[0])
    return [f for f in faixas if f != corpo]


def sheets_com_sobra(caminho: Path) -> list[int]:
    """Índices dos quadros que têm sobra de quadro vizinho."""
    sheet = Image.open(caminho).convert('RGBA')
    colunas = sheet.width // CELL
    sujos = []
    for i in range(colunas * (sheet.height // CELL)):
        col, lin = i % colunas, i // colunas
        cel = sheet.crop((col * CELL, lin * CELL, (col + 1) * CELL, (lin + 1) * CELL))
        if ilhas_soltas(cel):
            sujos.append(i)
    return sujos


def limpar_ilhas(caminho: Path) -> int:
    """Apaga as sobras de quadro vizinho na sheet. Devolve quantas apagou."""
    sheet = Image.open(caminho).convert('RGBA')
    vazio = Image.new('RGBA', (CELL, 1), (0, 0, 0, 0))
    apagadas = 0
    for i in range(sheet.width // CELL * (sheet.height // CELL)):
        col, lin = i % (sheet.width // CELL), i // (sheet.width // CELL)
        cel = sheet.crop((col * CELL, lin * CELL, (col + 1) * CELL, (lin + 1) * CELL))
        for y0, y1 in ilhas_soltas(cel):
            for y in range(y0, y1):
                sheet.paste(vazio, (col * CELL, lin * CELL + y))
            apagadas += 1
    if apagadas:
        sheet.save(caminho, optimize=True)
    return apagadas


def medir_sheet(caminho: Path) -> dict:
    """Mede uma sheet que JÁ está na grade: quantos quadros e a caixa visual.

    Serve para sheet que chegou pronta (o Codex, por exemplo, já alinha), sem
    passar de novo pelo recorte e realinhamento.
    """
    sheet = Image.open(caminho).convert('RGBA')
    colunas = sheet.width // CELL
    linhas = sheet.height // CELL

    caixas = []
    for i in range(colunas * linhas):
        col, lin = i % colunas, i // colunas
        cel = sheet.crop((col * CELL, lin * CELL, (col + 1) * CELL, (lin + 1) * CELL))
        bb = bbox_alpha(cel)
        if bb:
            caixas.append(bb)

    if not caixas:
        sys.exit(f'{caminho} está vazia')

    return {
        'frames': len(caixas),
        'defaultVisual': {
            'x': min(c[0] for c in caixas),
            'y': min(c[1] for c in caixas),
            'width': max(c[2] for c in caixas) - min(c[0] for c in caixas),
            'height': max(c[3] for c in caixas) - min(c[1] for c in caixas),
        },
    }


def comando_registrar(args) -> int:
    """Registra no JSON uma sheet que já está na grade, dentro da pasta da skin."""
    caminho_json, lutador = carregar_lutador(args.slug)
    destino_skin = args.skin or skin_base(lutador)
    sheet = pasta_skin(lutador, destino_skin) / f'{args.acao}.png'
    if not sheet.exists():
        sys.exit(f'não achei {sheet}')

    if args.limpar:
        apagadas = limpar_ilhas(sheet)
        print(f'limpeza: {apagadas} sobra(s) de quadro vizinho apagada(s).')
    else:
        sujas = sheets_com_sobra(sheet)
        if sujas:
            print(f'  ATENÇÃO: sobra de quadro vizinho nos quadros {sujas}.')
            print('  Rode de novo com --limpar para apagar antes de registrar.')

    dados = medir_sheet(sheet)
    registrar(lutador, caminho_json, args.acao, dados, destino_skin, args.fps)
    avisar_golpe(args.acao)
    print('Confira na Academia antes de dar por pronto.')
    return 0


def ancora_de(cel: Image.Image) -> tuple[float, int]:
    """Centro dos pés e linha do chão de um quadro."""
    bb = bbox_alpha(cel)
    return alinhar_sheet.centro_dos_pes(cel.crop(bb)) + bb[0], bb[3]


def primeiro_quadro(caminho: Path) -> Image.Image:
    return Image.open(caminho).convert('RGBA').crop((0, 0, CELL, CELL))


def escalar_sheet(caminho: Path, fator: float, destino: tuple[float, int]) -> tuple[float, float]:
    """Põe a sheet na escala e no chão da referência, sem achatar o movimento.

    A célula inteira é reduzida em torno do pé do primeiro quadro, e não o
    recorte de cada figura: assim o salto continua subindo e o knockdown
    continua deitado. Devolve o deslocamento aplicado, para as caixas irem
    junto.
    """
    sheet = Image.open(caminho).convert('RGBA')
    cols = sheet.width // CELL
    ox, oy = ancora_de(sheet.crop((0, 0, CELL, CELL)))
    dx, dy = destino
    desloc_x, desloc_y = dx - ox * fator, dy - oy * fator

    nova = Image.new('RGBA', sheet.size, (0, 0, 0, 0))
    lado = max(1, round(CELL * fator))
    for i in range(cols * (sheet.height // CELL)):
        col, lin = i % cols, i // cols
        cel = sheet.crop((col * CELL, lin * CELL, (col + 1) * CELL, (lin + 1) * CELL))
        if not bbox_alpha(cel):
            continue
        # Folga de uma célula de cada lado para aceitar deslocamento negativo.
        folgada = Image.new('RGBA', (CELL * 3, CELL * 3), (0, 0, 0, 0))
        folgada.alpha_composite(
            cel.resize((lado, lado), Image.LANCZOS),
            (CELL + round(desloc_x), CELL + round(desloc_y))
        )
        nova.alpha_composite(
            folgada.crop((CELL, CELL, CELL * 2, CELL * 2)), (col * CELL, lin * CELL)
        )

    nova.save(caminho, optimize=True)
    return desloc_x, desloc_y


def fixar_chao(caminho: Path, chao: int, so_abaixo: bool = False) -> list[int]:
    """Põe o pé de cada quadro na mesma linha do chão.

    O gerador move o chão de um quadro para o outro, e na tela isso vira
    tremor vertical. Só para ação que fica em pé: quem sai do chão (salto,
    queda) precisa do movimento que tem, e para essas `so_abaixo` sobe apenas
    o quadro que afundou no piso, deixando o resto do voo como está.
    """
    sheet = Image.open(caminho).convert('RGBA')
    cols = sheet.width // CELL
    nova_sheet = Image.new('RGBA', sheet.size, (0, 0, 0, 0))
    ajustes = []
    for i in range(cols * (sheet.height // CELL)):
        col, lin = i % cols, i // cols
        cel = sheet.crop((col * CELL, lin * CELL, (col + 1) * CELL, (lin + 1) * CELL))
        bb = bbox_alpha(cel)
        if not bb:
            continue
        dy = chao - bb[3]
        if so_abaixo:
            dy = min(dy, 0)
        ajustes.append(dy)
        folgada = Image.new('RGBA', (CELL, CELL * 3), (0, 0, 0, 0))
        folgada.alpha_composite(cel, (0, CELL + dy))
        nova_sheet.alpha_composite(folgada.crop((0, CELL, CELL, CELL * 2)), (col * CELL, lin * CELL))
    nova_sheet.save(caminho, optimize=True)
    return ajustes


def mover_caixa(caixa: dict, fator: float, desloc: tuple[float, float]) -> dict:
    """Leva uma caixa (attack, guard) para a escala nova."""
    return {
        'x': round(caixa['x'] * fator + desloc[0]),
        'y': round(caixa['y'] * fator + desloc[1]),
        'width': round(caixa['width'] * fator),
        'height': round(caixa['height'] * fator),
    }


def comando_escalar(args) -> int:
    """Refaz a proporção de uma sheet pela escala e pelo chão do `idle`.

    O gerador entrega cada ação num tamanho, e na luta o mascote cresce e
    encolhe. A régua é sempre o `idle` da mesma pasta, e o fator sai da pose
    em pé do primeiro quadro (guarda), que quase toda ação tem.
    """
    caminho_json, lutador = carregar_lutador(args.slug)
    destino_skin = args.skin or skin_base(lutador)
    pasta = pasta_skin(lutador, destino_skin)
    sheet = pasta / f'{args.acao}.png'
    referencia = pasta / f'{args.referencia}.png'
    if not sheet.exists():
        sys.exit(f'não achei {sheet}')
    if not referencia.exists():
        sys.exit(f'não achei a régua {referencia}')
    if sheet == referencia:
        sys.exit('a régua não se reescala')

    bb_ref = bbox_alpha(primeiro_quadro(referencia))
    bb_acao = bbox_alpha(primeiro_quadro(sheet))
    alvo = bb_ref[3] - bb_ref[1]
    atual = bb_acao[3] - bb_acao[1]
    fator = args.fator if args.fator else alvo / atual

    print(f'{args.acao}: quadro 0 com {atual}px, régua {args.referencia} com {alvo}px '
          f'-> fator {fator:.3f}')
    if not args.fator and not 0.5 < fator < 1.6:
        sys.exit('fator fora do esperado: o quadro 0 não deve ser pose em pé. '
                 'Passe --fator à mão.')

    chao = ancora_de(primeiro_quadro(referencia))
    desloc = escalar_sheet(sheet, fator, chao)
    if args.chao or args.piso:
        ajustes = fixar_chao(sheet, int(chao[1]), so_abaixo=args.piso)
        print(f'chão em y={int(chao[1])}: ajuste de {min(ajustes)} a {max(ajustes)} px')

    dados = medir_sheet(sheet)
    registrar(lutador, caminho_json, args.acao, dados, destino_skin, args.fps)

    # As caixas foram medidas na escala antiga e precisam ir junto.
    caminho_json, lutador = carregar_lutador(args.slug)
    spec = acao_no_json(lutador, args.acao, destino_skin)
    for campo in ('attack', 'guard'):
        if campo in spec:
            alvo_caixa = spec[campo]['bounds'] if campo == 'attack' else spec[campo]
            movida = mover_caixa(alvo_caixa, fator, desloc)
            if campo == 'attack':
                spec['attack']['bounds'] = movida
            else:
                spec['guard'] = movida
            print(f'  {campo} movida para {movida}')
    for span in spec.get('attackSpans', []):
        span['bounds'] = mover_caixa(span['bounds'], fator, desloc)
    caminho_json.write_text(
        json.dumps(lutador, indent=2, ensure_ascii=False) + chr(10), encoding='utf-8'
    )
    print('Confira na Academia antes de dar por pronto.')
    return 0


def acao_no_json(lutador: dict, acao_nome: str, destino_skin: str) -> dict:
    """A ação como ela está gravada: na skin extra, ou na lista da base."""
    skins = lutador.get('skins') or []
    base = skins[0]['pasta'] if skins else ''
    if destino_skin and destino_skin != base:
        variante = next((v for v in skins if v['pasta'] == destino_skin), None)
        return (variante or {}).get('acoes', {}).get(acao_nome, {})
    return next((a for a in lutador['actions'] if a['action'] == acao_nome), {})


def comando_aguardar(args) -> int:
    """Espera a imagem e entrega, sem montar pedido de novo.

    Serve para quando a geração falha no chat e você tenta outra vez: o
    pedido já está montado, só falta a imagem.
    """
    baixado = vigiar(args.minutos)
    if not baixado:
        return 1
    return entregar(args.slug, args.acao, baixado, args.skin, args.fps)


def entregar_bloco(slug: str, acoes: list[str], quadros_por_acao: list[int],
                   entrada: Path, skin: str | None) -> int:
    """Processa uma imagem com várias ações, uma por fileira."""
    caminho_json, lutador = carregar_lutador(slug)
    destino_skin = skin or skin_base(lutador)

    _, amostra = carregar_lutador(REFERENCIA_MOVIMENTO)
    regua = alinhar_sheet.regua_de(PUBLIC / amostra['assetRoot'].lstrip('/') / 'idle.png')

    fileiras = alinhar_sheet.separar(alinhar_sheet.preparar(entrada), quadros_por_acao)
    if len(fileiras) != len(acoes):
        print(f'esperava {len(acoes)} fileiras ({", ".join(acoes)}) e achei {len(fileiras)}.')
        print('não registrei nada: peça a imagem de novo, uma fileira por ação.')
        return 1

    for acao, quadros in zip(acoes, fileiras):
        print(f'{acao}:')
        sheet, dados = alinhar_sheet.montar(quadros, regua)
        saida = pasta_skin(lutador, destino_skin) / f'{acao}.png'
        saida.parent.mkdir(parents=True, exist_ok=True)
        sheet.save(saida, optimize=True)
        registrar(lutador, caminho_json, acao, dados, destino_skin, None)
        avisar_golpe(acao)
    return 0


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    sub = p.add_subparsers(dest='comando', required=True)

    ped = sub.add_parser('pedido', help='monta prompt e referências para o chat')
    ped.add_argument('slug')
    ped.add_argument('acao')
    ped.add_argument('--quadros', type=int)
    ped.add_argument('--abrir', action='store_true',
                     help='copia o prompt, abre a pasta e o ChatGPT')
    ped.add_argument('--aguardar', action='store_true',
                     help='implica --abrir e entrega sozinho a imagem que você salvar')
    ped.add_argument('--skin', help='pasta da skin de destino (padrão: a base)')
    ped.add_argument('--minutos', type=int, default=15,
                     help='quanto tempo esperar a imagem (padrão: 15)')
    ped.set_defaults(func=comando_pedido)

    ent = sub.add_parser('entrega', help='alinha o PNG do chat e registra no JSON')
    ent.add_argument('slug')
    ent.add_argument('acao')
    ent.add_argument('arquivo')
    ent.add_argument('--skin', help='pasta da skin (padrão: a base)')
    ent.add_argument('--fps', type=int)
    ent.set_defaults(func=comando_entrega)

    reg = sub.add_parser('registrar', help='sheet que já está na grade: só escreve o JSON')
    reg.add_argument('slug')
    reg.add_argument('acao')
    reg.add_argument('--skin', help='pasta da skin (padrão: a base)')
    reg.add_argument('--fps', type=int)
    reg.add_argument('--limpar', action='store_true',
                     help='apaga sobra de quadro vizinho antes de medir')
    reg.set_defaults(func=comando_registrar)

    esc = sub.add_parser('escalar', help='refaz a proporção de uma sheet pela régua do idle')
    esc.add_argument('slug')
    esc.add_argument('acao')
    esc.add_argument('--skin', help='pasta da skin (padrão: a base)')
    esc.add_argument('--referencia', default='idle', help='sheet que serve de régua')
    esc.add_argument('--fator', type=float, help='em vez de medir pela pose em pé')
    esc.add_argument('--chao', action='store_true',
                     help='põe o pé de todo quadro na mesma linha (ação que fica em pé)')
    esc.add_argument('--piso', action='store_true',
                     help='só tira do chão o quadro que afundou (ação aérea)')
    esc.add_argument('--fps', type=int)
    esc.set_defaults(func=comando_escalar)

    agu = sub.add_parser('aguardar', help='só espera a imagem e entrega (para retry)')
    agu.add_argument('slug')
    agu.add_argument('acao')
    agu.add_argument('--skin', help='pasta da skin de destino (padrão: a base)')
    agu.add_argument('--fps', type=int)
    agu.add_argument('--minutos', type=int, default=20)
    agu.set_defaults(func=comando_aguardar)

    lot = sub.add_parser('lote', help='tudo que falta, numa conversa só')
    lot.add_argument('slug')
    lot.add_argument('--acoes', nargs='*', help='em vez de descobrir o que falta')
    lot.add_argument('--skin', help='pasta da skin de destino (padrão: a base)')
    lot.add_argument('--abrir', action='store_true',
                     help='copia o texto, abre a pasta e o ChatGPT')
    lot.add_argument('--aguardar', action='store_true',
                     help='implica --abrir e processa cada imagem que você salvar, na ordem')
    lot.add_argument('--minutos', type=int, default=20)
    lot.set_defaults(func=comando_lote)

    args = p.parse_args()
    return args.func(args)


if __name__ == '__main__':
    sys.exit(main())
