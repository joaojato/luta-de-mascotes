"""Voadora provisória v4: remonta a v3 com a mão esquerda presa no topo do
andador em todo quadro (João, 01/11/2026). Na v3 a mão escorrega de 198 a
219 px tubo abaixo e o corpo desce junto; presa em 198, o corpo sobe até 21 px.
Usa os corpos já alinhados da v3 (mão em x 309), sem redesenho. A flexão
(quadros 1 e 2) fica como estava: ali a mão desce porque o corpo agacha.
Uso: python scripts/coxa_voadora_presa_v4.py ."""
import json, sys
from pathlib import Path
from PIL import Image
from coxa_maos_por_cima_v4 import maos_por_cima

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else '.')
V3 = ROOT / 'public/assets/lutadores/coxa/rigido-v3'
DEST = ROOT / 'public/assets/lutadores/coxa/rigido-v4-provisorio/normal'
TOPO = 198
MAO_V3 = [198, 205, 216, 219, 219, 219, 219, 219, 219, 219, 207, 198]
FLEXAO = {1, 2}

corpo = Image.open(V3 / 'normal/low-kick-body.png').convert('RGBA')
andador = Image.open(V3 / 'objetos/andador.png').convert('RGBA')
anexos = json.loads((V3 / 'normal/low-kick-attachments.json').read_text(encoding='utf-8'))
folha = Image.new('RGBA', corpo.size)
subidas = []
for i, mao in enumerate(MAO_V3):
    c, r = i % 5, i // 5
    cel_corpo = corpo.crop((c * 512, r * 320, c * 512 + 512, r * 320 + 320))
    sobe = 0 if i in FLEXAO else mao - TOPO
    subidas.append(sobe)
    preso = Image.new('RGBA', (512, 320))
    preso.alpha_composite(cel_corpo, (0, -sobe))
    cel = Image.new('RGBA', (512, 320))
    origem = tuple(anexos[i]['origin'])
    if anexos[i]['layer'] == 'behind':
        cel.alpha_composite(andador, origem)
        cel.alpha_composite(preso)
    else:
        cel.alpha_composite(preso)
        cel.alpha_composite(andador, origem)
    # A mão fica sempre por cima do andador (João, 01/11/2026).
    cel = maos_por_cima(cel, preso, [(309, mao - sobe)])
    folha.alpha_composite(cel, (c * 512, r * 320))
DEST.mkdir(parents=True, exist_ok=True)
folha.save(DEST / 'low-kick-composed.png')
print('subida por quadro:', subidas)
