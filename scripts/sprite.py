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

    prompt = f"""Image 1 is the ONLY reference for who the character is.
Image 2 is the ONLY reference for how the body moves.

Draw the character from image 1 performing the motion shown in image 2.
Replace the fighter in image 2 with the character from image 1, frame by
frame, keeping every pose, every limb angle and the spacing between frames
exactly as they are in image 2. Do not copy anything else from image 2: not
the clothes, not the colors, not the face, not the body proportions.

THE CHARACTER (never change any of this):
{descricao(args.slug)}

THE ACTION: "{acao}", {len(recortes)} frames in a single horizontal row,
evenly spaced, all frames on the same baseline, the whole body visible in
every frame. The motion is {MOVIMENTO.get(acao, 'the motion shown in image 2')}.

The character faces LEFT in every frame, side view, and never turns toward
the camera.

Style: high fidelity pixel art for a 2D arcade fighting game, bold flat
colors, clean dark outlines, same pixel density as image 1.

Transparent background (a flat white background is also fine). No text, no
letters, no numbers, no logo, no crest, no sponsor, no ground shadow, no
motion lines, no glow, no extra characters, no frame borders."""

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


def entregar(slug: str, acao_nome: str, entrada: Path, skin: str | None, fps: int | None) -> int:
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

    medidas = RAIZ / '.sprite-medidas.json'
    alinhar = subprocess.run(
        [sys.executable, str(RAIZ / 'scripts' / 'alinhar-sheet.py'), str(entrada), str(saida),
         '--ref', str(regua), '--json', str(medidas)],
        cwd=RAIZ,
    )
    if alinhar.returncode != 0:
        return alinhar.returncode

    dados = json.loads(medidas.read_text(encoding='utf-8'))
    medidas.unlink()

    _, amostra = carregar_lutador(REFERENCIA_MOVIMENTO)
    modelo = next((a for a in amostra['actions'] if a['action'] == acao_nome), None)

    acao = next((a for a in lutador['actions'] if a['action'] == acao_nome), None)
    if acao is None:
        acao = {'action': acao_nome, 'label': acao_nome}
        lutador['actions'].append(acao)

    acao['file'] = f'{acao_nome}.png'
    acao['frames'] = dados['frames']
    acao['frameRate'] = fps or (modelo['frameRate'] if modelo else 10)
    acao['repeat'] = modelo['repeat'] if modelo else 0
    acao['defaultVisual'] = dados['defaultVisual']
    acao['label'] = acao.get('label', acao_nome).replace(' (placeholder: idle)', '')

    if destino_skin:
        for variante in lutador.get('skins') or []:
            if variante['pasta'] == destino_skin and 'sobrescreve' in variante:
                if f'{acao_nome}.png' not in variante['sobrescreve']:
                    variante['sobrescreve'].append(f'{acao_nome}.png')

    caminho_json.write_text(
        json.dumps(lutador, indent=2, ensure_ascii=False) + '\n', encoding='utf-8'
    )

    print()
    print(f'sheet em {saida.relative_to(RAIZ)}')
    print(f'JSON atualizado: {acao_nome}, {acao["frames"]} quadros, {acao["frameRate"]} fps')
    if acao_nome in ('light-punch', 'heavy-kick', 'special'):
        print('ATENÇÃO: golpe precisa de `attack` (quadros ativos e caixa). '
              'Conferir na Academia e definir.')
    print('Confira na Academia antes de dar por pronto.')
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

    args = p.parse_args()
    return args.func(args)


if __name__ == '__main__':
    sys.exit(main())
