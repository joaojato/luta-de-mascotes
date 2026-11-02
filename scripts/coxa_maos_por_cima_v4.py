"""Mão sempre por cima do andador (João, 01/11/2026). Nas montagens do Codex
as tampas e os tubos do andador cobrem os dedos e o pulso. Repõe por cima da
montagem os pixels de pele do corpo (com o contorno) só onde a mão segura;
joelho e coxa continuam atrás do arco da frente. Três jeitos de achar a mão:

- normal (v4 e v5): faixa logo abaixo do topo do andador, mais as mãos que o
  rig marca; no agachamento a faixa desce e só vale no arco de trás;
- maromba (rigido-v1): círculo em volta do ponto de pegada que o Codex
  registrou por quadro (`output/coxa-rigido-v1/maromba/<ação>/attachments.json`);
  nos ataques da v7 o ponto vem do `<ação>-rig.json` ao lado da folha;
- transformação (rigido-v3): o braço que desce até o andador fica à esquerda
  de uma linha medida quadro a quadro; à direita dela é perna.

Não toca nas entregas do Codex: grava em `coxa/maos-por-cima/<origem>/`.
Uso: python scripts/coxa_maos_por_cima_v4.py ."""
import json, sys
from pathlib import Path
from PIL import Image, ImageChops, ImageFilter

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else '.')
COXA = ROOT / 'public/assets/lutadores/coxa'
DEST = COXA / 'maos-por-cima'
FAIXA = 20
# ação: (faixa, só o arco de trás)
ESPECIAL = {'crouch': (40, True)}
RAIO = 20
RAIO_MAROMBA = 26
# Transformação: x da linha braço | perna por quadro; acima de `TOPO_MAO` a
# mão de cima segura a manopla e também vale (quadros 0 a 4).
LINHA_TRANSF = [250, 250, 250, 250, 250, 264, 264, 300, 276, 270, 280, 275]
TOPO_MAO = 210


def pele(px):
    r, g, b, a = px
    return a > 120 and r > 175 and 85 < g < 205 and b < 160 and r - g > 35


def por_cima(cel, corpo, zona):
    """Cola o corpo por cima da montagem onde há pele dentro da zona."""
    mascara = Image.new('L', cel.size, 0)
    px, z, m = corpo.load(), zona.load(), mascara.load()
    for y in range(cel.height):
        for x in range(cel.width):
            if z[x, y] and pele(px[x, y]):
                m[x, y] = 255
    # Engorda 2 px para levar o contorno escuro dos dedos junto.
    alfa = corpo.getchannel('A').point(lambda a: 255 if a > 20 else 0)
    mascara = ImageChops.multiply(mascara.filter(ImageFilter.MaxFilter(5)), alfa)
    saida = cel.copy()
    saida.paste(corpo, (0, 0), mascara)
    return saida


def maos_por_cima(cel, corpo, pontos=(), faixa=FAIXA, so_tras=False, raio=RAIO):
    """Zona = faixa sob o topo do andador mais um quadrado em cada pegada."""
    # Andador = o que a montagem tem e o corpo não tem.
    so_andador = ImageChops.subtract(cel.getchannel('A'), corpo.getchannel('A')).point(lambda a: 255 if a > 60 else 0)
    caixa = so_andador.getbbox()
    zona = Image.new('L', cel.size, 0)
    if caixa and faixa:
        direita = caixa[0] + 50 if so_tras else cel.width
        zona.paste(255, (0, max(0, caixa[1] - 6), direita, caixa[1] + faixa))
    for x, y in pontos:
        zona.paste(255, (int(x - raio), int(y - raio), int(x + raio), int(y + raio)))
    return por_cima(cel, corpo, zona)


def zona_transformacao(q):
    zona = Image.new('L', (512, 320), 0)
    if q >= len(LINHA_TRANSF):  # célula vazia no fim da folha
        return zona
    zona.paste(255, (0, 0, LINHA_TRANSF[q], 320))
    if q <= 4:
        zona.paste(255, (0, 0, 512, TOPO_MAO))
    return zona


def folhas(origem, nome):
    pasta = COXA / origem
    return Image.open(pasta / f'{nome}-composed.png').convert('RGBA'), Image.open(pasta / f'{nome}-body.png').convert('RGBA')


def gravar(origem, nome, por_quadro):
    """Aplica `por_quadro(i, cel, corpo)` em cada célula e grava a folha."""
    folha, corpos = folhas(origem, nome)
    saida = Image.new('RGBA', folha.size)
    for r in range(folha.height // 320):
        for c in range(folha.width // 512):
            caixa = (c * 512, r * 320, c * 512 + 512, r * 320 + 320)
            saida.paste(por_quadro(r * 5 + c, folha.crop(caixa), corpos.crop(caixa)), caixa[:2])
    destino = DEST / origem
    destino.mkdir(parents=True, exist_ok=True)
    saida.save(destino / f'{nome}-composed.png')
    print(origem, nome)


def normal(origem, nome):
    rig = COXA / origem / f'{nome}-rig.json'
    quadros = json.loads(rig.read_text(encoding='utf-8')) if rig.exists() else []
    faixa, so_tras = ESPECIAL.get(nome, (FAIXA, False))

    def q(i, cel, corpo):
        info = quadros[i] if i < len(quadros) else {}
        pontos = [info['hand']] if info.get('hand') and not info.get('released') else []
        pontos += info.get('otherHand') or []
        pontos += list((info.get('hands') or {}).values())  # formato da v6
        return maos_por_cima(cel, corpo, pontos, faixa, so_tras)
    gravar(origem, nome, q)


def maromba(nome):
    pegadas = json.loads((ROOT / f'output/coxa-rigido-v1/maromba/{nome}/attachments.json').read_text(encoding='utf-8'))

    def q(i, cel, corpo):
        info = pegadas[i] if i < len(pegadas) else {}
        pontos = [info['point']] if info.get('visible', True) and info.get('point') else []
        return maos_por_cima(cel, corpo, pontos, faixa=0, raio=RAIO_MAROMBA)
    gravar('rigido-v1/maromba', nome, q)


def maromba_v7(nome):
    """Ataques simples do maromba (Codex, 02/11/2026): pegada no rig, mesmo raio."""
    rig = json.loads((COXA / 'maromba-ataques-v7' / f'{nome}-rig.json').read_text(encoding='utf-8'))

    def q(i, cel, corpo):
        pontos = [rig[i]['hand']] if i < len(rig) and rig[i].get('hand') else []
        return maos_por_cima(cel, corpo, pontos, faixa=0, raio=RAIO_MAROMBA)
    gravar('maromba-ataques-v7', nome, q)


if __name__ == '__main__':
    # A voadora segue a provisória, a transformação usa a v3, a guarda vem da
    # v5 e as caminhadas da v6 (andador como apoio alternado).
    for nome in ['beer-throw', 'block-high', 'block-low', 'crouch', 'dash-back', 'dash-forward', 'heavy-punch',
                 'hit-high', 'jump', 'jump-kick', 'jump-punch', 'knockdown', 'light-punch', 'special-charge', 'stunned']:
        normal('revisao-v4/normal', nome)
    normal('revisao-v5/normal', 'idle')
    for nome in ['walk-forward', 'walk-backward']:
        normal('revisao-v6/normal', nome)
    for pasta in sorted((ROOT / 'output/coxa-rigido-v1/maromba').iterdir()):
        if (pasta / 'attachments.json').exists() and (COXA / 'rigido-v1/maromba' / f'{pasta.name}-body.png').exists():
            maromba(pasta.name)
    gravar('rigido-v3/normal', 'special-transform', lambda i, cel, corpo: por_cima(cel, corpo, zona_transformacao(i)))
    for rig in sorted((COXA / 'maromba-ataques-v7').glob('*-rig.json')):
        maromba_v7(rig.name.removesuffix('-rig.json'))
