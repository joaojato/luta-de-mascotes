"""Separa as cadeiras pintadas em treze camadas, sem redesenhar nenhum pixel."""
from pathlib import Path
from PIL import Image,ImageDraw
import json,hashlib
ROOT=Path(__file__).resolve().parents[1]
DEST=ROOT/'public/assets/cenarios/estadio/torcida'
OUT=ROOT/'output/torcida-humores-v5'
data=json.loads((DEST/'torcida.json').read_text(encoding='utf-8-sig'))
levels=json.loads((DEST/'circulacao-v4.json').read_text(encoding='utf-8'))['niveis']
source=Image.open(DEST/'arquibancada-vazia.png').convert('RGBA')
mask=Image.new('L',source.size);draw=ImageDraw.Draw(mask);layers=[]
previous=None
for i,level in enumerate(levels):
    central=min((f for f in data['fileiras'] if f['setor']=='central'),key=lambda f:abs(f['y']-level['fileiraY']))
    side=min((f for f in data['fileiras'] if f['setor']=='lateral-esquerda'),key=lambda f:abs(f['y']-level['fileiraY']))
    t=i/12;top=267 if i==0 else levels[i-1]['fileiraY']+1;bottom=level['fileiraY']
    left=central['xInicio']-round(8+20*t);right=central['xFim']+round(8+20*t)
    side_end=side['xFim']+round(12-18*t)
    top_left=left+10 if previous is None else previous[0]+2
    top_right=right-10 if previous is None else previous[1]-2
    top_side=side_end+10 if previous is None else previous[2]-1
    polygons=[[(top_left,top),(top_right,top),(right,bottom),(left,bottom)],
              [(0,top),(top_side,top),(side_end,bottom),(0,bottom)],
              [(2048-top_side,top),(2047,top),(2047,bottom),(2048-side_end,bottom)]]
    for poly in polygons:draw.polygon(poly,fill=255)
    layers.append({'indice':i,'topo':top,'base':bottom,'poligonos':polygons})
    previous=(left,right,side_end)
result=source.copy();result.putalpha(mask)
result.save(DEST/'cadeiras-camadas-v5.png')
manifest={'arquivo':'cadeiras-camadas-v5.png','largura':2048,'altura':869,'camadas':layers,'fonte':'arquibancada-vazia.png',
          'fonteSha256':hashlib.sha256((DEST/'arquibancada-vazia.png').read_bytes()).hexdigest()}
(DEST/'cadeiras-camadas-v5.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False),encoding='utf-8')
preview=Image.new('RGBA',source.size,'#a75d7b');preview.alpha_composite(result)
preview.resize((1024,435),Image.Resampling.NEAREST).save(OUT/'cadeiras-camadas.png')
assert all(result.getpixel((x,y))[:3]==source.getpixel((x,y))[:3] for x,y in [(1024,n['fileiraY']) for n in levels])
print('13 camadas de cadeiras extraidas da pintura original.')
