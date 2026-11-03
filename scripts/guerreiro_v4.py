"""Extract individual generated figures; align and pack without redrawing."""
from pathlib import Path
from PIL import Image,ImageDraw
from collections import deque
import json,hashlib
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'output/guerreiro-v4';DEST=ROOT/'public/assets/npcs/guerreiro/base-v1'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def components(im):
 w,h=im.size;raw=im.getchannel('A').tobytes();seen=bytearray(w*h);parts=[]
 for seed,v in enumerate(raw):
  if v<8 or seen[seed]:continue
  q=deque([seed]);seen[seed]=1;coords=[];x0=w;y0=h;x1=y1=0
  while q:
   k=q.popleft();coords.append(k);x=k%w;y=k//w;x0=min(x0,x);x1=max(x1,x);y0=min(y0,y);y1=max(y1,y)
   for n in ([k-1] if x else [])+([k+1] if x+1<w else [])+([k-w] if y else [])+([k+w] if y+1<h else []):
    if not seen[n] and raw[n]>=8:seen[n]=1;q.append(n)
  if len(coords)>1500:parts.append((coords,(x0,y0,x1+1,y1+1)))
 return parts
def pack(action,anchors,scale,fps):
 folder=OUT/action;source=Image.open(folder/'source.png').convert('RGBA');w,h=source.size
 parts=components(source)
 parts.sort(key=lambda p:(int((p[1][1]+p[1][3])/2 >= h/2),p[1][0]))
 assert len(parts)==len(anchors),(action,len(parts),[p[1] for p in parts])
 frames=[];data=[]
 for i,((pixels,box),anchor) in enumerate(zip(parts,anchors)):
  mask=bytearray(w*h);raw=source.getchannel('A').tobytes()
  for k in pixels:mask[k]=raw[k]
  cut=source.copy();cut.putalpha(Image.frombytes('L',(w,h),bytes(mask)));cut=cut.crop(box)
  cut.save(folder/f'extracted-{i}.png')
  cut=cut.resize((round(cut.width*scale),round(cut.height*scale)),Image.Resampling.NEAREST)
  x=round(256-(anchor[0]-box[0])*scale);y=round(296-(anchor[1]-box[1])*scale)
  assert x>=0 and y>=0 and x+cut.width<512 and y+cut.height<320,(i,x,y,cut.size)
  frame=Image.new('RGBA',(512,320));frame.alpha_composite(cut,(x,y));frame.save(folder/f'frame-{i}.png');frames.append(frame)
  data.append({'frame':i,'sourceBox':box,'sourceAnchor':anchor,'visualBounds':frame.getbbox()})
 sheet=Image.new('RGBA',(2560,320*((len(frames)+4)//5)));contact=Image.new('RGB',(2048,320*((len(frames)+3)//4)),'#777777');gifs=[]
 for i,f in enumerate(frames):
  sheet.alpha_composite(f,((i%5)*512,(i//5)*320));bg=Image.new('RGB',(512,320),'#777777');bg.paste(f,mask=f.getchannel('A'));gifs.append(bg)
  contact.paste(bg,((i%4)*512,(i//4)*320));ImageDraw.Draw(contact).text(((i%4)*512+8,(i//4)*320+8),str(i),fill='white')
 sheet.save(folder/'sheet.png');sheet.save(DEST/f'{action}.png');contact.save(folder/'contact.png')
 for name,ms in [('preview',round(1000/fps)),('slow',300)]:gifs[0].save(folder/f'{name}.gif',save_all=True,append_images=gifs[1:],duration=[ms]*(len(gifs)-1)+[800],loop=0)
 return {'file':str((DEST/f'{action}.png').relative_to(ROOT)),'sha256':sha(DEST/f'{action}.png'),'sourceSha256':sha(folder/'source.png'),'frames':len(frames),'fps':fps,'loop':False,'frameWidth':512,'frameHeight':320,'columns':5,'origin':[256,296],'scale':scale,'contactFrames':[],'frameData':data}

def finalize():
 previous=json.loads((OUT/'previous-manifest.json').read_text(encoding='utf-8'))
 reports=[json.loads((OUT/a/'report.json').read_text()) for a in ['run-stop','turn-exit']]
 manifest={**previous,'revision':4,'animations':previous['animations']+reports,'returnAndExit':{'run-stop':{'start':'Já correndo para a esquerda','end':'Guarda frontal de fundo, depois idle','worldMotion':'Motor desacelera até o ponto de espera; sem deslocamento embutido nas células'},'turn-exit':{'start':'Postura esquerda após chute','turnFrames':[0,1,2,3],'runFrames':[4,5,6,7],'end':'Continua correndo para a direita até sair; não retornar à guarda','loopUntilOutside':[4,5,6,7],'worldMotion':'Motor move para a borda após a virada e remove o ator somente fora da câmera'}},'status':'Artes e montagem revisadas; aprovação visual e integração no combate pendentes'}
 (DEST/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
 (OUT/'report.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
 checks=[]
 for a in reports:
  im=Image.open(ROOT/a['file']);assert im.mode=='RGBA';assert im.size==(2560,320*((a['frames']+4)//5))
  for i in range(a['frames'],5*((a['frames']+4)//5)):assert im.crop(((i%5)*512,(i//5)*320,(i%5+1)*512,(i//5+1)*320)).getbbox() is None
  for f in a['frameData']:
   b=f['visualBounds'];assert b[0]>0 and b[1]>0 and b[2]<512 and b[3]<320
  checks.append({'file':a['file'],'frames':a['frames'],'rgba':True,'margins':True,'unusedCellsEmpty':True,'sha256':a['sha256']})
 (OUT/'validation.json').write_text(json.dumps(checks,indent=2),encoding='utf-8')
 refs=['referencia/fluminense/base-guerreiro-v2.png','output/guerreiro-v3/kick/source.png','output/guerreiro-v3/run/source.png','output/guerreiro-v2/idle/frame-0.png']
 (OUT/'references.json').write_text(json.dumps([{'file':p,'sha256':sha(ROOT/p)} for p in refs],indent=2),encoding='utf-8')
 html='<!doctype html><meta charset="utf-8"><title>Guerreiro — saída e guarda</title><style>body{background:#222;color:white;font:16px sans-serif}img{image-rendering:pixelated;max-width:100%}</style><h1>Guerreiro — saída e retorno à guarda</h1><p>Arte e demonstração visual; sem simulação de lógica de combate.</p>'
 for a,title in [('turn-exit','Virada e corrida para fora'),('run-stop','Corrida, frenagem e guarda frontal')]:
  demo=[]
  sequence=list(range(4))+[4+i%4 for i in range(24)] if a=='turn-exit' else list(range(8))+[7]*10
  for n,index in enumerate(sequence):
   bg=Image.new('RGB',(1000,340),'#303038');d=ImageDraw.Draw(bg);d.line((0,296,1000,296),fill='#777777')
   f=Image.open(OUT/a/f'frame-{index}.png')
   if a=='turn-exit':pos=450 if n<4 else 450+(n-3)*32
   else:pos=430+round(150*(1-min(n/5,1))**2)
   bg.paste(f,(pos-256,0),f.getchannel('A'));demo.append(bg)
  demo[0].save(OUT/a/'world-preview.gif',save_all=True,append_images=demo[1:],duration=round(1000/(14 if a=='turn-exit' else 12)),loop=0)
  html+=f'<h2>{title}</h2><img src="{a}/world-preview.gif"><img src="{a}/preview.gif"><img src="{a}/slow.gif"><details><summary>Quadros em escala real</summary><img src="{a}/contact.png"></details>'
 (OUT/'revisao.html').write_text(html,encoding='utf-8')
 # Compare both endpoints with existing guard at unchanged game scale.
 compare=Image.new('RGB',(1536,640));draw=ImageDraw.Draw(compare)
 paths=[ROOT/'output/guerreiro-v2/idle/frame-0.png',OUT/'run-stop/frame-7.png',OUT/'turn-exit/frame-2.png']
 for row,bg in enumerate(['#eeeeee','#222222']):
  draw.rectangle((0,row*320,1536,(row+1)*320),fill=bg)
  for col,p in enumerate(paths):
   f=Image.open(p);compare.paste(f,(col*512,row*320),f.getchannel('A'))
 compare.save(OUT/'guard-comparison.png')
 print('PASS: 2 new RGBA sheets, 16 frames, dimensions, margins, empty cells and hashes.')
if __name__=='__main__':
 import sys
 if sys.argv[1]=='inspect':
  im=Image.open(OUT/sys.argv[2]/'source.png').convert('RGBA');print(im.size);print([p[1] for p in components(im)])
 elif sys.argv[1]=='pack':
  a=sys.argv[2];c=json.loads((OUT/a/'config.json').read_text());report=pack(a,c['anchors'],c['scale'],c['fps']);(OUT/a/'report.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print('Packed',a,report['frames'])
 elif sys.argv[1]=='finalize':finalize()
