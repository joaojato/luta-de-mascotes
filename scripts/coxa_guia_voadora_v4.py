"""Guia da voadora apoiada v4: andador fixo, a mesma pegada em todo quadro e
as linhas-alvo de pé, quadril e cabeça. O corpo v3 aparece apagado, só como
referência do que está errado. Uso: python scripts/coxa_guia_voadora_v4.py ."""
import os, sys
from PIL import Image, ImageDraw

PROJ = sys.argv[1]
COXA = os.path.join(PROJ, 'public', 'assets', 'lutadores', 'coxa')
ORIGEM = (217, 192)           # andador, igual à v3: ocupa x 217–321, y 192–292
PEGADA = (309, 198)           # mão próxima (esquerda anatômica), topo do arco
CHAO, TOPO_ANDADOR, CABECA_IDLE = 293, 192, 88
# Por quadro: (pé mais baixo, quadril, rótulo). Pé y=293 é o chão.
ALVOS = [
    (293, 200, '0 repouso, duas mãos'), (293, 205, '1 flexiona'), (293, 210, '2 flexiona'),
    (293, 205, '3 direita sobe p/ guarda'), (293, 200, '4 trava o braço'),
    (265, 192, '5 impulsão: empurra'), (215, 186, '6 sobe sobre a mão'),
    (188, 182, '7 chute acima do andador'), (188, 182, '8 chute estendido'),
    (220, 188, '9 recolhe a perna'), (285, 200, '10 aterrissa'), (293, 200, '11 repouso'),
]

andador = Image.open(os.path.join(COXA, 'rigido-v3', 'objetos', 'andador.png')).convert('RGBA')
corpo = Image.open(os.path.join(COXA, 'rigido-v3', 'normal', 'low-kick-body.png')).convert('RGBA')
folha = Image.new('RGBA', (512 * 5, 320 * 3), '#2b303a')
for i, (pe, quadril, rotulo) in enumerate(ALVOS):
    cel = Image.new('RGBA', (512, 320), '#2b303a')
    c, r = i % 5, i // 5
    velho = corpo.crop((c * 512, r * 320, c * 512 + 512, r * 320 + 320))
    velho.putalpha(velho.getchannel('A').point(lambda a: a * 30 // 100))
    cel.alpha_composite(velho)
    cel.alpha_composite(andador, ORIGEM)
    d = ImageDraw.Draw(cel)
    d.line([(0, CHAO), (512, CHAO)], fill='#7d8796')
    d.line([(150, TOPO_ANDADOR), (360, TOPO_ANDADOR)], fill='#e05252', width=1)
    d.line([(150, CABECA_IDLE), (380, CABECA_IDLE)], fill='#ffffff')
    d.line([(150, quadril), (380, quadril)], fill='#f2c94c')
    d.line([(150, pe), (380, pe)], fill='#4fd1e8', width=2)
    x, y = PEGADA
    d.ellipse([x - 5, y - 5, x + 5, y + 5], outline='#ff3b3b', width=3)
    d.text((8, 6), rotulo, fill='white')
    d.text((390, CABECA_IDLE - 6), 'cabeça >= idle', fill='white')
    d.text((390, quadril - 6), 'quadril', fill='#f2c94c')
    d.text((390, pe - 6), 'pé mais baixo', fill='#4fd1e8')
    d.text((390, TOPO_ANDADOR + 4), 'topo do andador', fill='#e05252')
    folha.alpha_composite(cel, (c * 512, r * 320))
ImageDraw.Draw(folha).text((2 * 512 + 10, 2 * 320 + 20),
    'Vermelho: a mão esquerda fica NESTE ponto em todos os quadros.\n'
    'Braço esticado empurra o andador; o quadril sobe até a mão.\n'
    'Quadros 7-8: a perna do chute passa ACIMA da linha vermelha.\n'
    'Corpo apagado = v3 (errado), só referência.', fill='white')
destino = os.path.join(COXA, 'guias')
os.makedirs(destino, exist_ok=True)
folha.save(os.path.join(destino, 'low-kick-guia-v4.png'))

print('ok')
