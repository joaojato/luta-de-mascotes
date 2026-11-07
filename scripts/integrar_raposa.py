"""Monta os JSONs da Raposa (raposa.json e raposa-taco.json) a partir da arte v2.

Fonte: public/assets/lutadores/raposa/art-manifest-v2.json (Codex, 06/11/2026).
Células 512x384, pés na linha 360, corpo em guarda de 200 px.

O que este script decide, e por quê:
- Caixa de acerto medida no desenho (Regra do Corpo): nos quadros de contato,
  só o que passa da frente do corpo de referência (o idle no chão, o salto
  no ar), sem um pixel além. A Raposa olha para a esquerda: frente = x menor.
- Ação no chão usa a caixa visual do idle (mesma régua e mesmo pé).
- O Pulo de Raposa é uma sheet só: `special` + `special-land`, porque o
  especial `hop` toca uma sheet do começo ao fim (sai em normal-v2/special-pulo.png).
- A garrafa vira a ação `garrafa` (golpe `mina`), não `heavy-kick`: quem acerta
  são os cacos, não o corpo.

Rodar: python scripts/integrar_raposa.py
"""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[1]
ARTE = ROOT / 'public/assets/lutadores/raposa'
SAIDA = ROOT / 'src/game/lutadores'
FW, FH, COLS = 512, 384, 5
PE = 360
# Meia largura da caixa dos pés na queda do Pulo de Raposa (px da célula).
PES = 40
ALFA = 96
# Quanto a caixa de acerto entra no corpo, para o contato registrar.
SOBREPOR = 6
# Folga em volta da guarda: o corpo que só balançou não conta como golpe.
FOLGA = 6

manifesto = json.loads((ARTE / 'art-manifest-v2.json').read_text(encoding='utf-8'))
POR = {(a['form'], a['action']): a for a in manifesto['actions']}


def quadros(arquivo: Path, n: int, fw: int = FW, fh: int = FH) -> list[np.ndarray]:
    """Canal alfa de cada quadro da grade."""
    im = np.array(Image.open(arquivo).convert('RGBA'))[:, :, 3]
    return [im[(i // COLS) * fh:(i // COLS + 1) * fh, (i % COLS) * fw:(i % COLS + 1) * fw] for i in range(n)]


def caixa(mask: np.ndarray) -> dict | None:
    ys, xs = np.nonzero(mask)
    if len(xs) == 0:
        return None
    return {'x': int(xs.min()), 'y': int(ys.min()), 'width': int(xs.max() - xs.min() + 1), 'height': int(ys.max() - ys.min() + 1)}


def uniao(caixas: list[dict]) -> dict:
    x0 = min(c['x'] for c in caixas); y0 = min(c['y'] for c in caixas)
    x1 = max(c['x'] + c['width'] for c in caixas); y1 = max(c['y'] + c['height'] for c in caixas)
    return {'x': x0, 'y': y0, 'width': x1 - x0, 'height': y1 - y0}


def visual(forma: str, acao: str) -> dict:
    return uniao([{k: b[k] for k in ('x', 'y', 'width', 'height')} for b in POR[(forma, acao)]['boxes']])


def alcance(forma: str, acao: str, quadro: int, frente: int, arquivo: Path | None = None, n: int | None = None,
            faixa: tuple[float, float] = (0, 1)) -> dict:
    """O que o quadro desenha à frente de `frente` (x menor), mais a sobreposição."""
    info = POR.get((forma, acao))
    arq = arquivo or ARTE / f'{forma}-v2/{acao}.png'
    mask = quadros(arq, n or info['frames'])[quadro] > ALFA
    corpo = caixa(mask)
    # Só a faixa de altura do corpo em que o golpe acontece (o pé da voadora, o taco erguido).
    de = corpo['y'] + int(corpo['height'] * faixa[0]); ate = corpo['y'] + int(corpo['height'] * faixa[1])
    mask[:de, :] = False
    mask[ate:, :] = False
    mask[:, frente + SOBREPOR:] = False
    achada = caixa(mask)
    assert achada, f'{forma} {acao} quadro {quadro}: nada à frente de x={frente}'
    return achada


def saiu(forma: str, acao: str, quadro: int) -> dict:
    """No chão: o maior pedaço do quadro que ficou fora da guarda (o idle com folga).

    Corpo que só se deslocou fica dentro da folga; braço, perna e taco
    esticados formam o maior pedaço de fora. A caixa entra `SOBREPOR` px
    no corpo para o contato.
    """
    info = POR[(forma, acao)]
    mask = quadros(ARTE / f'{forma}-v2/{acao}.png', info['frames'])[quadro] > ALFA
    guarda = quadros(ARTE / f'{forma}-v2/idle.png', POR[(forma, 'idle')]['frames'])[0] > ALFA
    fora = mask & ~ndimage.binary_dilation(guarda, iterations=FOLGA)
    rotulos, n = ndimage.label(fora)
    assert n, f'{forma} {acao} quadro {quadro}: nada saiu do corpo'
    areas = ndimage.sum(fora, rotulos, range(1, n + 1))
    achada = caixa(rotulos == int(np.argmax(areas)) + 1)
    achada['width'] += SOBREPOR
    return achada


def baixo(forma: str, acao: str, quadros_: list[int], fracao: float, arquivo: Path, n: int) -> dict:
    """Parte de baixo do corpo nos quadros (a descida do pulo cai com os pés)."""
    alfas = quadros(arquivo, n)
    caixas = []
    for q in quadros_:
        c = caixa(alfas[q] > ALFA)
        topo = c['y'] + int(c['height'] * (1 - fracao))
        caixas.append({'x': c['x'], 'y': topo, 'width': c['width'], 'height': c['y'] + c['height'] - topo})
    return uniao(caixas)


def pes(bounds: dict, idle: dict) -> dict:
    """A queda do pulo só acerta com os pés: a faixa central do corpo, sem a cauda.

    Quem avança e passa por baixo dela fica atrás do pouso e escapa (pedido do
    João, docs/raposa-animacoes-v1.md); com o corpo inteiro como caixa, não escapava.
    """
    centro = idle['x'] + idle['width'] // 2
    return {**bounds, 'x': centro - PES, 'width': 2 * PES}


def montar_pulo() -> Path:
    """special (8) + special-land (3) numa sheet de 11 quadros, mesma grade."""
    a = Image.open(ARTE / 'normal-v2/special.png').convert('RGBA')
    b = Image.open(ARTE / 'normal-v2/special-land.png').convert('RGBA')
    cel = lambda im, i: im.crop(((i % COLS) * FW, (i // COLS) * FH, (i % COLS + 1) * FW, (i // COLS + 1) * FH))
    celulas = [cel(a, i) for i in range(8)] + [cel(b, i) for i in range(3)]
    linhas = (len(celulas) + COLS - 1) // COLS
    out = Image.new('RGBA', (FW * COLS, FH * linhas), (0, 0, 0, 0))
    for i, c in enumerate(celulas):
        # Quadro desenhado abaixo da linha do pé (o impulso e a descida, que no
        # jogo já estão no ar) sobe até ela: ninguém afunda no piso (Regra da Régua).
        subida = max(0, c.getbbox()[3] - PE)
        celula = Image.new('RGBA', (FW, FH), (0, 0, 0, 0))
        celula.paste(c, (0, -subida))
        out.paste(celula, ((i % COLS) * FW, (i // COLS) * FH))
    destino = ARTE / 'normal-v2/special-pulo.png'
    out.save(destino)
    return destino


def retrato() -> str:
    """Retrato e âncora da forma normal: a referência v19 sem o fundo magenta."""
    im = np.array(Image.open(ARTE / 'bases/base-boxe-azul-soco-ingles-v19.png').convert('RGB')).astype(int)
    fundo = np.median(np.concatenate([im[0], im[-1], im[:, 0], im[:, -1]]), axis=0)
    distancia = np.abs(im - fundo).sum(2)
    alfa = np.clip((distancia - 60) * 255 // 80, 0, 255)
    # Borda que ainda puxa para o magenta: tira o excesso de vermelho e azul.
    rgb = im.copy()
    borda = (alfa > 0) & (alfa < 255)
    teto = rgb[:, :, 1] + 40
    rgb[:, :, 0] = np.where(borda, np.minimum(rgb[:, :, 0], teto), rgb[:, :, 0])
    rgb[:, :, 2] = np.where(borda, np.minimum(rgb[:, :, 2], teto), rgb[:, :, 2])
    rgba = Image.fromarray(np.dstack([rgb, alfa]).astype(np.uint8), 'RGBA')
    x0, y0, x1, y1 = rgba.getbbox()
    rgba.crop((max(0, x0 - 12), max(0, y0 - 12), x1 + 12, y1 + 12)).save(ARTE / 'bases/retrato-v19.png')
    return 'bases/retrato-v19.png'


ROTULOS = {
    'normal': {
        'idle': 'Guarda de boxe, taco nas costas', 'entrance': 'Entrada: arrasta o taco e acende o charuto',
        'walk-forward': 'Avançar', 'walk-backward': 'Recuar', 'dash-forward': 'Avanço rápido', 'dash-back': 'Recuo rápido',
        'crouch': 'Agachar', 'jump': 'Salto', 'block-high': 'Defesa alta', 'block-low': 'Defesa baixa',
        'hit-high': 'Receber golpe', 'stunned': 'Atordoada', 'knockdown': 'Queda',
        'light-punch': 'Dois socos alternados', 'heavy-punch': 'Gancho ascendente', 'garrafa': 'Garrafa quebrada no chão',
        'low-kick': 'Chute baixo transversal', 'jump-punch': 'Soco no ar', 'jump-kick': 'Voadora',
        'special-charge': 'Preparação do Pulo de Raposa', 'special': 'Pulo de Raposa', 'special-return': 'Guarda o taco nas costas',
    },
    'taco': {
        'idle': 'Guarda com o taco', 'walk-forward': 'Avançar com o taco', 'walk-backward': 'Recuar com o taco',
        'dash-forward': 'Avanço rápido', 'dash-back': 'Recuo rápido', 'crouch': 'Agachar', 'jump': 'Salto',
        'block-high': 'Defesa alta', 'block-low': 'Defesa baixa', 'hit-high': 'Receber golpe', 'stunned': 'Atordoada',
        'knockdown': 'Queda', 'light-punch': 'Duas tacadas curtas', 'heavy-punch': 'Gancho ascendente',
        'heavy-kick': 'Tacada ascendente', 'low-kick': 'Varredura com o taco', 'jump-punch': 'Tacada descendente no ar',
        'jump-kick': 'Tacada diagonal no ar', 'draw-bat': 'Saca o taco das costas',
    },
}
REPETE = {'idle', 'walk-forward', 'walk-backward', 'stunned'}
AEREAS = {'jump', 'jump-punch', 'jump-kick', 'knockdown', 'special'}
# Contatos (indicações de arte do Codex, docs/raposa-animacoes-v2.md).
CONTATOS = {
    'normal': {'light-punch': [[1], [3]], 'heavy-punch': [[3]], 'low-kick': [[3]], 'jump-punch': [[2]], 'jump-kick': [[1, 2, 3]]},
    'taco': {'light-punch': [[1], [3]], 'heavy-punch': [[3]], 'heavy-kick': [[4, 5]], 'low-kick': [[3]],
             'jump-punch': [[2, 3]], 'jump-kick': [[2, 3]]},
}
# Golpes medidos só numa faixa da altura do corpo, à frente dele: a voadora
# pelo pé (metade de baixo) e o gancho com taco pelo taco erguido (metade de cima).
FAIXAS = {('normal', 'jump-kick'): (.5, 1), ('taco', 'heavy-punch'): (0, .5)}
# Regra do Passo: chute e soco forte de chão avançam.
PASSOS = {'heavy-punch': {'frames': [1, 3], 'distance': 20}, 'heavy-kick': {'frames': [2, 4], 'distance': 20},
          'low-kick': {'frames': [1, 3], 'distance': 30}}


def acoes(forma: str) -> list[dict]:
    idle = visual(forma, 'idle')
    frente_chao = idle['x']
    salto = POR[(forma, 'jump')]
    frente_ar = min(b['x'] for b in salto['boxes'][3:6])
    lista = []
    for nome, rotulo in ROTULOS[forma].items():
        fonte_forma, fonte = forma, nome
        if nome == 'garrafa':
            fonte = 'heavy-kick'
        if nome == 'special-return':
            fonte = 'stow-bat'
        if nome == 'draw-bat':
            fonte_forma = 'normal'
        info = POR[(fonte_forma, fonte)]
        arquivo = f'{fonte_forma}-v2/{fonte}.png'
        frames = info['frames']
        fps = info['fps']
        dv = visual(fonte_forma, fonte) if nome in AEREAS or nome in ('crouch', 'block-low', 'knockdown') else idle
        spec = {'action': nome, 'label': rotulo, 'file': arquivo, 'frames': frames, 'frameWidth': FW, 'frameHeight': FH,
                'frameRate': fps, 'repeat': -1 if nome in REPETE else 0, 'defaultVisual': dv}
        if nome == 'special':
            caminho = montar_pulo()
            # Acerta só no último quadro antes do pouso: quem avançou por baixo já
            # cruzou com ela e está atrás dos pés (10 fps dá esse tempo a quem anda).
            spec.update(file='normal-v2/special-pulo.png', frames=11, frameRate=10,
                        defaultVisual=uniao([caixa(q > ALFA) for q in quadros(caminho, 11)]),
                        attack={'frames': [7], 'bounds': pes(baixo('normal', 'special', [7], .55, caminho, 11), idle)})
        janelas = CONTATOS[forma].get(nome)
        if janelas:
            frente = frente_ar if nome.startswith('jump-') else frente_chao
            spans = []
            for janela in janelas:
                faixa = FAIXAS.get((forma, nome))
                if faixa:
                    medir = lambda q: alcance(fonte_forma, fonte, q, frente, faixa=faixa)
                elif nome.startswith('jump-'):
                    medir = lambda q: alcance(fonte_forma, fonte, q, frente)
                else:
                    medir = lambda q: saiu(fonte_forma, fonte, q)
                bounds = uniao([medir(q) for q in janela])
                spans.append({'frames': janela, 'bounds': bounds})
            if len(spans) == 1:
                spec['attack'] = spans[0]
            else:
                spec['attackSpans'] = spans
                spec['attack'] = spans[0]
        if nome.startswith('block-'):
            v = visual(forma, nome)
            spec['guard'] = {'x': v['x'] - 4, 'y': v['y'], 'width': 60, 'height': v['height']}
        if nome in PASSOS:
            spec['travel'] = PASSOS[nome]
        lista.append(spec)
    return lista


def principal() -> None:
    museu = {
        'apelido': 'A Raposa da Toca: charuto aceso e taco nas costas.',
        'descricao': 'Boxeadora de rua com soco-inglês numa mão e aliança na outra. Quebra garrafa no chão '
                     'e deixa os cacos esperando quem pisar; garrafa em cima de garrafa dobra o estrago. '
                     'No Pulo de Raposa salta alto e cai em cima do adversário: se acertar, saca o taco '
                     'e luta com ele por oito segundos.',
        'historia': 'A raposa virou mascote da torcida celeste mineira nos anos 1940, desenhada como bicho '
                    'esperto que leva vantagem sem fazer barulho. Aqui ela ganhou a malandragem de boteco '
                    'e o taco de quem já viu muita briga de rua.',
    }
    base = {
        'id': 'raposa', 'label': 'Raposa', 'estado': 'MG', 'rival': 'galo',
        'nomes': {'soco-rapido': 'Dois socos', 'soco-forte': 'Gancho', 'chute-basico': 'Garrafa',
                  'chute-baixo': 'Rasteira', 'soco-no-ar': 'Soco no ar', 'voadora': 'Voadora', 'especial': 'Pulo Raposa'},
        'rosto': {'x': 0.37, 'y': 0.17, 'lado': 0.32},
        'assetRoot': '/assets/lutadores/raposa',
        'anchorFile': retrato(),
        'portraitFile': 'bases/retrato-v19.png',
        'anchorUsage': 'Raposa de regata azul com cinco estrelas, em guarda de boxe, voltada para a esquerda',
        'sons': {'acerto-leve': 'acerto-leve-metal', 'acerto-pesado': 'acerto-pesado-metal'},
        'torcida': {'estampa': 'lisa', 'cores': ['#1E4FBF', '#F0F0F0']},
        'museu': museu,
        'stats': {}, 'combat': {},
        'moves': {
            'kick': {'kind': 'mina', 'action': 'garrafa',
                     'mina': {'quadro': 5, 'avanco': 70, 'largura': 70, 'altura': 18, 'segundos': 5, 'dano': 12,
                              'acumula': {'segundos': 7, 'dano': 18}, 'chao': 104,
                              'efeito': 'garrafa-quebra', 'efeitoDuplo': 'cacos-dupla'}},
            'special': {'kind': 'hop', 'reach': 0, 'travelFrames': [1, 7], 'landFrame': 8, 'hopHeight': 250,
                        'unblockable': True, 'stunMs': 1500, 'dodge': 'cruzar',
                        'forma': {'lutador': 'raposa-taco', 'segundos': 8, 'soNoAcerto': True, 'entrada': 'draw-bat', 'rotulo': 'TACO'}},
            'effects': {
                'garrafa-quebra': {'file': 'effects-v2/bottle-break.png', 'frames': 4, 'frameRate': 12, 'repeat': 0, 'frameWidth': 256, 'frameHeight': 128},
                'cacos-dupla': {'file': 'effects-v2/shards-double.png', 'frames': 1, 'frameRate': 1, 'repeat': 0, 'frameWidth': 256, 'frameHeight': 128},
            },
        },
        'actions': acoes('normal'),
    }
    taco = {
        'id': 'raposa-taco', 'label': 'Raposa com Taco', 'estado': 'MG', 'selecionavel': False,
        'nomes': {'soco-rapido': 'Duas tacadas', 'soco-forte': 'Gancho', 'chute-basico': 'Tacada',
                  'chute-baixo': 'Varredura', 'soco-no-ar': 'Tacada no ar', 'voadora': 'Tacada diagonal', 'especial': 'Especial'},
        'assetRoot': '/assets/lutadores/raposa',
        'anchorFile': 'bases/guarda-taco-azul-v19.png', 'portraitFile': 'bases/guarda-taco-azul-v19.png',
        'anchorUsage': 'Raposa em guarda com o taco, voltada para a esquerda',
        'sons': {'acerto-leve': 'acerto-leve-madeira', 'acerto-pesado': 'acerto-pesado-madeira', 'acerto-baixo': 'acerto-pesado-madeira'},
        'torcida': {'estampa': 'lisa', 'cores': ['#1E4FBF', '#F0F0F0']},
        'stats': {}, 'combat': {},
        'actions': acoes('taco'),
    }
    for nome, dados in (('raposa', base), ('raposa-taco', taco)):
        (SAIDA / f'{nome}.json').write_text(json.dumps(dados, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        print(nome, len(dados['actions']), 'ações')


if __name__ == '__main__':
    principal()
