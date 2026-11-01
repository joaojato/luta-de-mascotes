"""Mão sempre por cima do andador (João, 01/11/2026). Na revisão v4 as tampas
dos arcos e o arco de trás cobrem os dedos. Repõe por cima da montagem os
pixels de pele do corpo (com o contorno) perto da pegada: até 22 px abaixo
do topo do andador em cada quadro e em volta das mãos que o rig marca.
No agachamento a mão segura o arco de trás mais embaixo e o rosto passa
atrás do arco da frente: lá a faixa desce mais e só vale no arco de trás.
Não toca na entrega do Codex: grava em `coxa/v4-maos/normal/`.
Uso: python scripts/coxa_maos_por_cima_v4.py ."""
import json, sys
from pathlib import Path
from PIL import Image, ImageChops, ImageFilter

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else '.')
V4 = ROOT / 'public/assets/lutadores/coxa/revisao-v4/normal'
DEST = ROOT / 'public/assets/lutadores/coxa/v4-maos/normal'
# A voadora segue a provisória e a transformação volta à v3.
FORA = {'low-kick', 'special-transform'}
FAIXA = 22
# ação: (faixa, só o arco de trás)
ESPECIAL = {'crouch': (40, True)}
RAIO = 20


def pele(px):
    r, g, b, a = px
    return a > 120 and r > 175 and 85 < g < 205 and b < 160 and r - g > 35


def maos_por_cima(cel, corpo, pontos=(), faixa=FAIXA, so_tras=False):
    """Cola o corpo por cima da montagem onde há pele perto da pegada."""
    alfa_corpo = corpo.getchannel('A')
    # Andador = o que a montagem tem e o corpo não tem.
    so_andador = ImageChops.subtract(cel.getchannel('A'), alfa_corpo).point(lambda a: 255 if a > 60 else 0)
    caixa = so_andador.getbbox()
    zona = Image.new('L', cel.size, 0)
    if caixa:
        direita = caixa[0] + 50 if so_tras else cel.width
        zona.paste(255, (0, max(0, caixa[1] - 6), direita, caixa[1] + faixa))
    for x, y in pontos:
        zona.paste(255, (int(x - RAIO), int(y - RAIO), int(x + RAIO), int(y + RAIO)))
    mascara = Image.new('L', cel.size, 0)
    px, z = corpo.load(), zona.load()
    m = mascara.load()
    for y in range(cel.height):
        for x in range(cel.width):
            if z[x, y] and pele(px[x, y]):
                m[x, y] = 255
    # Engorda 2 px para levar o contorno escuro dos dedos junto.
    mascara = ImageChops.multiply(mascara.filter(ImageFilter.MaxFilter(5)), alfa_corpo.point(lambda a: 255 if a > 20 else 0))
    saida = cel.copy()
    saida.paste(corpo, (0, 0), mascara)
    return saida


if __name__ == '__main__':
    DEST.mkdir(parents=True, exist_ok=True)
    for composta in sorted(V4.glob('*-composed.png')):
        acao = composta.name[:-len('-composed.png')]
        if acao in FORA:
            continue
        folha = Image.open(composta).convert('RGBA')
        corpos = Image.open(V4 / f'{acao}-body.png').convert('RGBA')
        rig = V4 / f'{acao}-rig.json'
        quadros = json.loads(rig.read_text(encoding='utf-8')) if rig.exists() else []
        saida = Image.new('RGBA', folha.size)
        for r in range(folha.height // 320):
            for c in range(folha.width // 512):
                i, caixa = r * 5 + c, (c * 512, r * 320, c * 512 + 512, r * 320 + 320)
                q = quadros[i] if i < len(quadros) else {}
                pontos = [q['hand']] if q.get('hand') and not q.get('released') else []
                pontos += q.get('otherHand') or []
                faixa, so_tras = ESPECIAL.get(acao, (FAIXA, False))
                saida.paste(maos_por_cima(folha.crop(caixa), corpos.crop(caixa), pontos, faixa, so_tras), caixa[:2])
        saida.save(DEST / composta.name)
        print(acao)
