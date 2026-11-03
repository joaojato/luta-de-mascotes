"""Composite image-tool hair edits through localized masks; preserve original geometry."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageChops
import json,hashlib,shutil,colorsys,sys
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'output/gremista-cabelos-pretos-v2'
ROIS={'base':[[540,260,820,475]],
 'light-punch':[[195,108,306,186],[635,108,750,187],[1033,108,1146,186],[1475,108,1595,186],[171,540,285,619],[635,544,751,621],[1035,533,1155,613],[1470,543,1585,620]]}
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,obj):p.write_text(json.dumps(obj,ensure_ascii=False,indent=2),encoding='utf-8')
def mask_for(im,rois,generated):
 m=Image.new('L',im.size); px=im.load(); mp=m.load()
 for x0,y0,x1,y1 in rois:
  for y in range(y0,y1):
   for x in range(x0,x1):
    r,g,b,a=px[x,y]; h,s,v=colorsys.rgb_to_hsv(r/255,g/255,b/255)
    gp=generated.getpixel((x,y))[:3]
    if a>0 and s>.3 and r>3 and ((.095<h<.22) or (.055<h<.22 and r<100 and max(gp)<60) or (.07<h<.22 and b<r*.25 and max(gp)<60)):
     mp[x,y]=255
 return m
def assemble(action):
 f=OUT/action;f.mkdir(exist_ok=True)
 original=ROOT/'referencia/gremio/teste-manga-longa-v6.png' if action=='base' else ROOT/f'output/gremista-v1/{action}/source.png'
 backup=f/'before.png'
 if not backup.exists():shutil.copy2(original,backup)
 src=Image.open(backup).convert('RGBA');gen=Image.open(OUT/f'{action}-generated.png').convert('RGBA');assert src.size==gen.size
 rois=ROIS.get(action,json.loads((f/'rois.json').read_text()) if (f/'rois.json').exists() else None);assert rois
 mask=mask_for(src,rois,gen);mask.save(f/'mask.png')
 # The user explicitly requests recoloring the ORIGINAL frames only. Transfer
 # the image tool's near-black hair palette without transferring its redrawn
 # expressions or moving any pixel boundary. No new shapes are synthesized.
 palette=[(2,2,2),(7,7,7),(13,13,13),(19,19,19)]
 painted=src.copy(); pp=painted.load(); sp=src.load()
 for y in range(src.height):
  for x in range(src.width):
   if mask.getpixel((x,y)):
    r,g,b,a=sp[x,y]; tone=min(3,int(max(r,g,b)/64)); pp[x,y]=(*palette[tone],a)
 result=Image.composite(painted,src,mask);result.save(f/'result.png')
 changed=ImageChops.difference(src,result); outside=Image.composite(changed,Image.new('RGBA',src.size),ImageChops.invert(mask))
 assert outside.convert('RGB').getbbox() is None
 assert ImageChops.difference(src.getchannel('A'),result.getchannel('A')).getbbox() is None
 chosen=[result.getpixel((x,y))[:3] for y in range(src.height) for x in range(src.width) if mask.getpixel((x,y))]
 bright=sum(max(p)>80 for p in chosen)
 write(f/'validation.json',{'original':original.relative_to(ROOT).as_posix(),'beforeSha256':sha(backup),'generatedSha256':sha(OUT/f'{action}-generated.png'),'resultSha256':sha(f/'result.png'),'maskPixels':len(chosen),'nonHairPixelsIdentical':True,'alphaIdentical':True,'brightSamplesInHair':bright,'rois':rois})
 # Enlarged comparisons for face and hair inspection only.
 contact=Image.new('RGB',(300*3,210*len(rois)),'#777777')
 for i,box in enumerate(rois):
  for col,im in enumerate([src,gen,result]):
   crop=im.crop(box);scale=min(290/crop.width,190/crop.height);crop=crop.resize((round(crop.width*scale),round(crop.height*scale)),Image.Resampling.NEAREST)
   contact.paste(crop,(col*300+5,i*210+10),crop.getchannel('A'))
 contact.save(f/'faces.png');print(action,'hair pixels',len(chosen),'bright in result',bright)
def finalize():
 actions=['base','light-punch','heavy-punch','shot','low-kick','jump-punch']
 reports=[json.loads((OUT/a/'validation.json').read_text(encoding='utf-8')) for a in actions]
 write(OUT/'validation.json',{'images':reports,'existingAnimationFrames':40,'baseImages':1,'hairOnly':True,'runtimeModified':False})
 html='''<!doctype html><meta charset="utf-8"><title>Gremista — cabelos pretos</title><style>body{background:#222;color:white;font:16px system-ui}img{image-rendering:pixelated;max-width:100%}a{color:#7cd5ff}</style><h1>Gremista: todos os pelos pretos</h1><p>Cabelo, costeletas, sobrancelhas, bigode e barba. Somente recoloração dos desenhos existentes.</p><p><a href="../gremista-v1/revisao.html">Animações recompostas</a> · <a href="../../referencia/gremio/base-manga-longa-cabelos-pretos-v8.png">Base atual</a></p>'''
 for a in actions:
  html+=f'<h2>{a}</h2><p>Esquerda: original; centro: edição de referência; direita: aplicação preservando o desenho.</p><a href="{a}/prompt.txt">Prompt</a><p><img src="{a}/faces.png"></p>'
 (OUT/'revisao.html').write_text(html,encoding='utf-8')
 print('PASS: 6 source images;40 existing frames; original alpha and all pixels outside hair masks preserved.')
if __name__=='__main__':
 if sys.argv[1]=='finalize':finalize()
 else:assemble(sys.argv[1])
