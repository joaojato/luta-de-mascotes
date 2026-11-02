"""Simple low/air attacks. Generated bodies; one unchanged rigid walker."""
from pathlib import Path
from PIL import Image,ImageDraw
from collections import deque
import json,hashlib,shutil
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'output/coxa-maromba-v7';DEST=ROOT/'public/assets/lutadores/coxa/maromba-ataques-v7'
OBJ=ROOT/'output/coxa-rigido-v1/objetos/upright.png'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def prepare():
 OUT.mkdir(exist_ok=True);DEST.mkdir(exist_ok=True)
 guard=Image.open(OUT/'guard.png').convert('RGBA');body=Image.open(ROOT/'output/coxa-rigido-v1/maromba/idle/frame-00.png').convert('RGBA')
 guard.resize((2048,1280),Image.Resampling.NEAREST).save(OUT/'guard-4x.png');body.resize((2048,1280),Image.Resampling.NEAREST).save(OUT/'body-4x.png')
 for action,n in [('low-kick',8),('jump-punch',5),('jump-kick',6)]:
  f=OUT/action;f.mkdir(exist_ok=True)
  guide=Image.new('RGBA',(512*n,320));obj=Image.open(OBJ).convert('RGBA')
  for i in range(n):
   frame=body.copy();a=frame.getchannel('A').point(lambda v:round(v*.2));frame.putalpha(a)
   # Existing walker is positioned FIRST, then the grip is marked.
   hp=(224,181) if action=='low-kick' else (224,148)
   if action=='jump-punch':hp=([224,214,204,214,224][i],148)
   frame.alpha_composite(obj,(round(hp[0]-43.907),round(hp[1]-49.13)))
   guide.alpha_composite(frame,(i*512,0))
  guide.save(f/'grip-guide.png')
 refs=[OUT/'guard.png',OBJ,ROOT/'src/game/lutadores/coxa-maromba.json']
 (OUT/'references.json').write_text(json.dumps([{'file':str(p.relative_to(ROOT)),'sha256':sha(p)} for p in refs],indent=2),encoding='utf-8')
def parts(im):
 w,h=im.size;raw=im.getchannel('A').tobytes();seen=bytearray(w*h);out=[]
 for seed,v in enumerate(raw):
  if v<8 or seen[seed]:continue
  q=deque([seed]);seen[seed]=1;pixels=[];x0=w;y0=h;x1=y1=0
  while q:
   k=q.popleft();pixels.append(k);x=k%w;y=k//w;x0=min(x0,x);x1=max(x1,x);y0=min(y0,y);y1=max(y1,y)
   for n in ([k-1] if x else [])+([k+1] if x+1<w else [])+([k-w] if y else [])+([k+w] if y+1<h else []):
    if not seen[n] and raw[n]>=8:seen[n]=1;q.append(n)
  if len(pixels)>1000:out.append((pixels,(x0,y0,x1+1,y1+1)))
 return out
def mount(action):
 folder=OUT/action;cfg=json.loads((folder/'config.json').read_text());src=Image.open(folder/'source.png').convert('RGBA');w,h=src.size
 ps=parts(src);ps.sort(key=lambda p:(int((p[1][1]+p[1][3])/2>=h/2) if cfg.get('rows',2)==2 else 0,p[1][0]));assert len(ps)==len(cfg['hands']),(len(ps),[p[1] for p in ps])
 obj=Image.open(OBJ).convert('RGBA');scale=cfg['scale'];frames=[];bodies=[];rig=[]
 for i,((pixels,box),hand,anchor) in enumerate(zip(ps,cfg['hands'],cfg['anchors'])):
  raw=src.getchannel('A').tobytes();alpha=bytearray(w*h)
  for k in pixels:alpha[k]=raw[k]
  cut=src.copy();cut.putalpha(Image.frombytes('L',(w,h),bytes(alpha)));cut=cut.crop(box);cut.save(folder/f'extracted-{i:02}.png')
  cut=cut.resize((round(cut.width*scale),round(cut.height*scale)),Image.Resampling.NEAREST)
  # One uniform scale per action. Grounded actions anchor the supporting foot;
  # airborne actions use fixed reference hips, never a drawn jump trajectory.
  target=cfg.get('target',[350,292]);x=round(target[0]-(anchor[0]-box[0])*scale);y=round(target[1]-(anchor[1]-box[1])*scale)
  body=Image.new('RGBA',(512,320));body.alpha_composite(cut,(x,y));body.save(folder/f'body-{i:02}.png')
  hp=[round(x+(hand[0]-box[0])*scale),round(y+(hand[1]-box[1])*scale)]
  origin=[round(hp[0]-43.90715667),round(hp[1]-49.12959381)];layer=Image.new('RGBA',(512,320));layer.paste(obj,tuple(origin));layer.save(folder/f'walker-layer-{i:02}.png')
  assert layer.crop((origin[0],origin[1],origin[0]+104,origin[1]+100)).tobytes()==obj.tobytes()
  assert body.getpixel(tuple(hp))[3]>32,(action,i,'grip misses hand',hp)
  composed=body.copy();composed.alpha_composite(layer)
  # Original generated finger pixels go over the tube, no artificial fingers.
  patchbox=(hp[0]-7,hp[1]-7,hp[0]+8,hp[1]+7);composed.alpha_composite(body.crop(patchbox),patchbox[:2])
  reused_guard=action in ('low-kick','heavy-punch') and i in (0,len(ps)-1)
  if reused_guard:
   # Intentional exact guard endpoints, not replacement of an attacking pose.
   body=Image.open(ROOT/'output/coxa-rigido-v1/maromba/idle/frame-00.png').convert('RGBA')
   composed=Image.open(OUT/'guard.png').convert('RGBA');hp=[224,181];origin=[180,132]
   body.save(folder/f'body-{i:02}.png');layer=Image.new('RGBA',(512,320));layer.paste(obj,tuple(origin));layer.save(folder/f'walker-layer-{i:02}.png')
  composed.save(folder/f'frame-{i:02}.png');frames.append(composed);bodies.append(body)
  b=composed.getbbox();assert b and b[0]>0 and b[1]>0 and b[2]<512 and b[3]<320,(action,i,b)
  rig.append({'frame':i,'hand':hp,'walkerOrigin':origin,'rotation':0,'scale':1,'objectSha256':sha(OBJ),'objectRgbaUnchanged':True,'handCoversGrip':True,'sourceBox':box,'visualBounds':b,'exactExistingGuard':reused_guard})
 for name,fs in [('body',bodies),('composed',frames)]:
  sheet=Image.new('RGBA',(2560,320*((len(fs)+4)//5)))
  for i,f in enumerate(fs):sheet.alpha_composite(f,((i%5)*512,(i//5)*320))
  sheet.save(folder/f'{name}-sheet.png');sheet.save(DEST/f'{action}-{name}.png')
 previews=[];contact=Image.new('RGB',(2048,320*((len(frames)+3)//4)),'#777777')
 for i,f in enumerate(frames):
  bg=Image.new('RGB',(512,320),'#777777');bg.paste(f,mask=f.getchannel('A'));previews.append(bg);contact.paste(bg,((i%4)*512,(i//4)*320));ImageDraw.Draw(contact).text(((i%4)*512+8,(i//4)*320+8),str(i),fill='white')
 contact.save(folder/'contact.png')
 for name,ms in [('preview',round(1000/cfg['fps'])),('slow',300)]:previews[0].save(folder/f'{name}.gif',save_all=True,append_images=previews[1:],duration=ms,loop=0)
 report={'action':action,'frames':len(frames),'fpsProposed':cfg['fps'],'frameWidth':512,'frameHeight':320,'columns':5,'origin':[256,292],'bodyScale':scale,'contactFrames':cfg['contacts'],'body':f'{action}-body.png','composed':f'{action}-composed.png','sourceSha256':sha(folder/'source.png'),'bodySha256':sha(DEST/f'{action}-body.png'),'composedSha256':sha(DEST/f'{action}-composed.png'),'rig':rig}
 (folder/'report.json').write_text(json.dumps(report,indent=2),encoding='utf-8');(DEST/f'{action}-rig.json').write_text(json.dumps(rig,indent=2),encoding='utf-8');print('Mounted',action,len(frames),'frames, unchanged walker and grips checked.')
def finalize():
 actions=['heavy-punch','low-kick','jump-punch','jump-kick'];reports=[json.loads((OUT/a/'report.json').read_text()) for a in actions]
 shutil.copy2(OBJ,DEST/'andador.png')
 manifest={'character':'Vovô Coxa Maromba','date':'2026-11-02','baseRuntime':'maos-por-cima/rigido-v1/maromba/idle-composed.png','animations':reports,'object':{'file':'andador.png','sha256':sha(OBJ),'size':[104,100],'scale':1,'rotation':0,'allowedTransform':'Somente translação inteira; nenhum redesenho, alongamento, deformação ou perspectiva diferente'},'anatomy':{'rightFarB':'Segura andador; perna executa os chutes','leftNearA':'Mão livre em guarda; perna apoia no rasteiro/recolhe nos aéreos'},'integration':'Artes somente; runtime, dano, hitboxes e trajetórias não alterados','status':'Fontes e quadros montados revisados; aprovação do usuário e teste em combate pendentes'}
 (DEST/'manifest-art.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8');(OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
 checks=[];obj=Image.open(OBJ).convert('RGBA')
 for r in reports:
  a=r['action'];im=Image.open(DEST/r['composed']);assert im.mode=='RGBA' and im.size==(2560,320*((r['frames']+4)//5))
  for i in range(r['frames'],5*((r['frames']+4)//5)):assert im.crop(((i%5)*512,(i//5)*320,(i%5+1)*512,(i//5+1)*320)).getbbox() is None
  for f in r['rig']:
   i=f['frame'];x,y=f['walkerOrigin'];layer=Image.open(OUT/a/f'walker-layer-{i:02}.png').convert('RGBA');assert layer.crop((x,y,x+104,y+100)).tobytes()==obj.tobytes()
   body=Image.open(OUT/a/f'body-{i:02}.png');hx,hy=f['hand'];assert body.getpixel((hx,hy))[3]>32
   skin=sum(1 for red,green,blue,alpha in body.crop((hx-4,hy-4,hx+5,hy+5)).get_flattened_data() if alpha>100 and red>150 and red>green>blue)
   assert skin>8,(a,i,'grip not skin',skin)
  checks.append({'action':a,'frames':r['frames'],'sameWalkerBytesEveryFrame':True,'gripInsideHand':True,'dimensions':True,'unusedCellsEmpty':True})
 (OUT/'validation.json').write_text(json.dumps(checks,indent=2),encoding='utf-8')
 html='<!doctype html><meta charset="utf-8"><title>Vovô Maromba — ataques simples</title><style>body{background:#222;color:#eee;font:16px sans-serif}img{image-rendering:pixelated;max-width:100%}section{margin:24px 0}</style><h1>Vovô Maromba — rasteiro e ataques aéreos</h1><p>O mesmo andador rígido em todos os quadros. Prévias de arte, sem teste de combate.</p>'
 for a in actions:html+=f'<section><h2>{a}</h2><img src="{a}/preview.gif"><img src="{a}/slow.gif"><details><summary>Quadros em escala real</summary><img src="{a}/contact.png"></details></section>'
 (OUT/'revisao.html').write_text(html,encoding='utf-8')
 paths=[OUT/'guard.png',OUT/'low-kick/frame-03.png',OUT/'jump-punch/frame-02.png',OUT/'jump-kick/frame-03.png'];cmp=Image.new('RGB',(2048,640));draw=ImageDraw.Draw(cmp)
 for row,color in enumerate(['#eeeeee','#222222']):
  draw.rectangle((0,row*320,2048,(row+1)*320),fill=color)
  for col,p in enumerate(paths):
   f=Image.open(p);cmp.paste(f,(col*512,row*320),f.getchannel('A'))
 cmp.save(OUT/'guard-comparison.png');print('PASS: 4 actions, 25 frames; canonical walker RGBA identical in all25 layers, grips and atlas verified.')
if __name__=='__main__':
 import sys
 if len(sys.argv)==1:prepare()
 elif sys.argv[1]=='inspect':
  im=Image.open(OUT/sys.argv[2]/'source.png').convert('RGBA');print(im.size);print([p[1] for p in parts(im)])
 elif sys.argv[1]=='mount':mount(sys.argv[2])
 elif sys.argv[1]=='finalize':finalize()
