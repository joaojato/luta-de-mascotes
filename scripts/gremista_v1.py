"""One generated action at a time; crop, uniformly align, preview and validate."""
from pathlib import Path
from PIL import Image,ImageDraw
from collections import deque
import hashlib,json,shutil
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'output/gremista-v1';DEST=ROOT/'public/assets/lutadores/mosqueteiro-gremio/ataques-v1'
BASE=ROOT/'referencia/gremio/base-manga-longa-cabelos-pretos-v8.png'
SPECS={'light-punch':(8,20,[2,5]),'heavy-punch':(8,14,[2,3]),'shot':(12,12,[]),'low-kick':(6,16,[2,3]),'jump-punch':(6,14,[2,3]),'jump-kick':(6,14,[2,3])}
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def prepare():
 OUT.mkdir(exist_ok=True);DEST.mkdir(parents=True,exist_ok=True)
 shutil.copy2(BASE,OUT/'approved-base.png');shutil.copy2(BASE,ROOT/'referencia/gremio/base-aprovada-manga-longa.png')
 im=Image.open(BASE).convert('RGBA');scale=190/(1196-180)
 guard=Image.new('RGBA',(640,384));s=im.resize((round(im.width*scale),round(im.height*scale)),Image.Resampling.NEAREST)
 # Belt/root x~770, feet y1196; common origin is [320,360].
 guard.alpha_composite(s,(round(320-770*scale),round(360-1196*scale)))
 guard.save(OUT/'guard.png');guard.save(DEST/'guard-reference.png')
 for a in SPECS:(OUT/a).mkdir(exist_ok=True)
 refs=[BASE,ROOT/'src/game/lutadores/mosqueteiro.json']
 (OUT/'references.json').write_text(json.dumps([{'file':str(p.relative_to(ROOT)),'sha256':sha(p)} for p in refs],indent=2),encoding='utf-8')
def parts(im):
 w,h=im.size;raw=im.getchannel('A').tobytes();seen=bytearray(w*h);out=[]
 for seed,v in enumerate(raw):
  if v<12 or seen[seed]:continue
  q=deque([seed]);seen[seed]=1;p=[];x0=w;y0=h;x1=y1=0
  while q:
   k=q.popleft();p.append(k);x=k%w;y=k//w;x0=min(x0,x);x1=max(x1,x);y0=min(y0,y);y1=max(y1,y)
   for n in ([k-1] if x else [])+([k+1] if x+1<w else [])+([k-w] if y else [])+([k+w] if y+1<h else []):
    if not seen[n] and raw[n]>=12:seen[n]=1;q.append(n)
  if len(p)>1200:out.append((p,(x0,y0,x1+1,y1+1)))
 return out
def mount(action):
 f=OUT/action;cfg=json.loads((f/'config.json').read_text());src=Image.open(f/'source.png').convert('RGBA');w,h=src.size;n,fps,contacts=SPECS[action]
 ps=parts(src);rows=cfg['rows'];ps.sort(key=lambda p:(int(((p[1][1]+p[1][3])/2)/h*rows),p[1][0]));assert len(ps)==n,(action,len(ps),[p[1] for p in ps])
 order=cfg.get('sourceFrameOrder',list(range(n)));ps=[ps[j] for j in order]
 frames=[];meta=[];scale=cfg['scale'];raw=src.getchannel('A').tobytes()
 for i,((pixels,box),anchor) in enumerate(zip(ps,cfg['anchors'])):
  mask=bytearray(w*h)
  for k in pixels:mask[k]=raw[k]
  cut=src.copy();cut.putalpha(Image.frombytes('L',(w,h),bytes(mask)));cut=cut.crop(box);cut.save(f/f'extracted-{i:02}.png')
  cut=cut.resize((round(cut.width*scale),round(cut.height*scale)),Image.Resampling.NEAREST)
  tx,ty=cfg.get('target',[320,360]);x=round(tx-(anchor[0]-box[0])*scale);y=round(ty-(anchor[1]-box[1])*scale)
  assert x>=2 and y>=2 and x+cut.width<638 and y+cut.height<382,(action,i,x,y,cut.size)
  frame=Image.new('RGBA',(640,384));frame.alpha_composite(cut,(x,y));reused=False
  if cfg.get('guardEndpoints') and i in (0,n-1):frame=Image.open(OUT/'guard.png').convert('RGBA');reused=True
  frame.save(f/f'frame-{i:02}.png');frames.append(frame);fm={'frame':i,'sourceFrame':order[i],'sourceBox':box,'sourceAnchor':anchor,'visualBounds':frame.getbbox(),'exactApprovedGuard':reused}
  if str(i) in cfg.get('sourceMuzzles',{}):
   mx,my=cfg['sourceMuzzles'][str(i)];fm['muzzle']=[round(x+(mx-box[0])*scale),round(y+(my-box[1])*scale)]
  meta.append(fm)
 sheet=Image.new('RGBA',(3200,384*((n+4)//5)));contact=Image.new('RGB',(640*3,384*((n+2)//3)),'#777777');gifs=[]
 for i,frame in enumerate(frames):
  sheet.alpha_composite(frame,((i%5)*640,(i//5)*384));bg=Image.new('RGB',(640,384),'#777777');bg.paste(frame,mask=frame.getchannel('A'));gifs.append(bg);contact.paste(bg,((i%3)*640,(i//3)*384));ImageDraw.Draw(contact).text(((i%3)*640+8,(i//3)*384+8),str(i),fill='white')
 sheet.save(f/'sheet.png');sheet.save(DEST/f'{action}.png');contact.save(f/'contact.png')
 durations=cfg.get('durationsMs',[round(1000/fps)]*n)
 for name,ds in [('preview',durations),('slow',[250]*n)]:gifs[0].save(f/f'{name}.gif',save_all=True,append_images=gifs[1:],duration=ds,loop=0)
 report={'action':action,'frames':n,'fpsProposed':fps,'frameWidth':640,'frameHeight':384,'columns':5,'origin':[320,360],'scale':scale,'contactFrames':contacts,'loop':False,'file':f'{action}.png','sha256':sha(DEST/f'{action}.png'),'sourceSha256':sha(f/'source.png'),'frameData':meta,'durationsMs':durations}
 (f/'report.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print('Packed',action,n,'frames')
def finalize():
 reports=[json.loads((OUT/a/'report.json').read_text()) for a in SPECS if (OUT/a/'report.json').exists()]
 shot=next(r for r in reports if r['action']=='shot');ds=shot['durationsMs']
 releases=[{'frame':i,'hand':'A-direita' if i==3 else 'B-esquerda','timeMs':sum(ds[:i]),'muzzle':shot['frameData'][i]['muzzle']} for i in [3,4]]
 contract={'character':'Gremista','baseApproved':str(BASE.relative_to(ROOT)),'baseSha256':sha(BASE),'animations':reports,'cell':[640,384],'columns':5,'origin':[320,360],'shooting':{'releases':releases,'totalMsProposed':sum(ds),'secondShotToReadyMs':sum(ds)-releases[1]['timeMs'],'swordOwnership':'Embainhada durante saque/tiros/guardar; volta à mão direita na recuperação final','mustWaitRecovery':True,'oneProjectilePerReleasePerActivation':True,'loop':False,'timingNote':'Usar durationsMs por quadro ou fases equivalentes; tocar tudo a12FPS perde o contraste saque/recuperação'},'heavyForwardStep':{'frames':[4,5],'afterContactFrames':[2,3],'distancePxProposed':16,'engineMovesRoot':True,'note':'Pequeno avanço DEPOIS do corte, não lunge antes de acertar'},'lowKick':{'startCrouched':True,'endsCrouched':True,'contact':'Lâmina na canela, um único corte, não estocada'},'airAttacks':{'allFramesAirborne':True,'engineMovesJumpTrajectory':True,'noLandingInAttack':True},'logicParametersNotSet':['dano','hitboxes','velocidade/alcance/projéteis','cancelamentos/balanceamento'],'runtimeModified':False,'status':'Arte e montagem revisadas; aprovação de cada animação e integração em combate pendentes'}
 contract['pendingActions']=[a for a in SPECS if not (OUT/a/'report.json').exists()]
 contract['hairRevision']='v8: cabelo, barba, bigode, sobrancelhas e costeletas pretos; somente recoloração dos desenhos existentes'
 (DEST/'manifest-art.json').write_text(json.dumps(contract,ensure_ascii=False,indent=2),encoding='utf-8');(DEST/'art-contract.json').write_text(json.dumps(contract,ensure_ascii=False,indent=2),encoding='utf-8');(OUT/'report.json').write_text(json.dumps(contract,ensure_ascii=False,indent=2),encoding='utf-8')
 checks=[]
 for r in reports:
  a=r['action'];im=Image.open(DEST/r['file']);assert im.mode=='RGBA' and im.size==(3200,384*((r['frames']+4)//5));assert sha(DEST/r['file'])==r['sha256']
  for i in range(r['frames'],5*((r['frames']+4)//5)):assert im.crop(((i%5)*640,(i//5)*384,(i%5+1)*640,(i//5+1)*384)).getbbox() is None
  for f in r['frameData']:
   b=f['visualBounds'];assert b and b[0]>0 and b[1]>0 and b[2]<640 and b[3]<384
  src=Image.open(OUT/a/'source.png').getchannel('A').point(lambda v:255 if v>=64 else 0);sw,sh=src.size
  assert src.crop((0,0,sw,1)).getbbox() is None and src.crop((0,sh-1,sw,sh)).getbbox() is None and src.crop((0,0,1,sh)).getbbox() is None and src.crop((sw-1,0,sw,sh)).getbbox() is None,(a,'source touches outer edge')
  checks.append({'action':a,'frames':r['frames'],'rgba':True,'dimensions':True,'margins':True,'sourceEdgesClear':True,'unusedCellsEmpty':True,'hash':True})
 assert sha(BASE)==sha(OUT/'approved-base.png')
 (OUT/'validation.json').write_text(json.dumps(checks,indent=2),encoding='utf-8')
 refs=[BASE,OUT/'jump-punch/movement-guide.png',OUT/'jump-kick/movement-guide.png']
 (OUT/'visual-references.json').write_text(json.dumps([{'file':str(p.relative_to(ROOT)),'sha256':sha(p)} for p in refs],indent=2),encoding='utf-8')
 # Same native size on two backgrounds, no per-frame normalization for comparison.
 paths=[OUT/'guard.png']+[OUT/r['action']/f"frame-{(r['contactFrames'] or [3])[0]:02}.png" for r in reports]
 comparison=Image.new('RGB',(640*len(paths),768));draw=ImageDraw.Draw(comparison)
 for row,bg in enumerate(['#eeeeee','#222222']):
  draw.rectangle((0,row*384,comparison.width,(row+1)*384),fill=bg)
  for col,p in enumerate(paths):
   f=Image.open(p);comparison.paste(f,(col*640,row*384),f.getchannel('A'))
 comparison.save(OUT/'guard-comparison.png')
 names={'light-punch':'Cortes rápidos','heavy-punch':'Corte descendente + avanço','shot':'Duas pistolas','low-kick':'Corte na canela','jump-punch':'Corte aéreo','jump-kick':'Ponta descendente aérea'}
 data=json.dumps(reports,ensure_ascii=False)
 html='''<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Gremista — golpes v1</title><style>body{background:#20232a;color:#eee;font:16px system-ui;margin:24px}canvas{background:#444;max-width:100%;image-rendering:pixelated}button,select,input{margin:6px;padding:6px}img{image-rendering:pixelated;max-width:100%}section{margin:30px 0}a{color:#8ecbff}</style><h1>Gremista — golpes próprios</h1><p>Base de manga longa aprovada. Prévia de arte; sem teste de combate.</p><select id="action"></select><button id="play">Pausar</button><button id="prev">← Quadro</button><button id="next">Quadro →</button><select id="speed"><option value="1">Velocidade normal</option><option value="0.5">Metade</option><option value="0.25">Um quarto</option></select><input id="frame" type="range" min="0" value="0"><p id="info"></p><canvas id="canvas" width="640" height="384"></canvas><canvas id="guard" width="640" height="384"></canvas><p>À direita: guarda aprovada, na mesma escala. As repetições são apenas para revisar a arte.</p>'''
 for r in reports:
  a=r['action'];html+=f'<section><h2>{names[a]}</h2><img src="{a}/preview.gif"><details><summary>Fonte e quadros em escala real</summary><a href="{a}/source.png">Fonte</a> · <a href="{a}/prompt.txt">Prompt</a><p><img src="{a}/contact.png"></p></details></section>'
 js='''const DATA=__DATA__,LABELS=__LABELS__;let index=0,frame=0,playing=true,acc=0,last=0;const select=document.getElementById('action'),slider=document.getElementById('frame'),ctx=document.getElementById('canvas').getContext('2d');ctx.imageSmoothingEnabled=false;const images=DATA.map(r=>{let im=new Image();im.src='../../public/assets/lutadores/mosqueteiro-gremio/ataques-v1/'+r.file;im.onload=draw;return im});DATA.forEach((r,i)=>{let o=document.createElement('option');o.value=i;o.textContent=LABELS[r.action];select.append(o)});const g=new Image();g.src='guard.png';g.onload=()=>{document.getElementById('guard').getContext('2d').drawImage(g,0,0)};function draw(){const r=DATA[index];slider.max=r.frames-1;slider.value=frame;ctx.clearRect(0,0,640,384);if(images[index].complete&&images[index].naturalWidth)ctx.drawImage(images[index],frame%5*640,Math.floor(frame/5)*384,640,384,0,0,640,384);let event=r.contactFrames.includes(frame)?' — contato visual':'';if(r.action==='shot'&&(frame===3||frame===4))event=' — disparo '+(frame===3?'A/direita':'B/esquerda');if(r.action==='heavy-punch'&&(frame===4||frame===5))event=' — avanço após o corte';document.getElementById('info').textContent='Quadro '+frame+' de '+(r.frames-1)+event}function pause(){playing=false;document.getElementById('play').textContent='Reproduzir'}select.onchange=()=>{index=Number(select.value);frame=0;acc=0;draw()};slider.oninput=()=>{pause();frame=Number(slider.value);draw()};document.getElementById('play').onclick=()=>{playing=!playing;document.getElementById('play').textContent=playing?'Pausar':'Reproduzir'};document.getElementById('prev').onclick=()=>{pause();frame=(frame+DATA[index].frames-1)%DATA[index].frames;draw()};document.getElementById('next').onclick=()=>{pause();frame=(frame+1)%DATA[index].frames;draw()};function tick(t){if(!last)last=t;const dt=Math.min(t-last,100);last=t;if(playing){acc+=dt*Number(document.getElementById('speed').value);const r=DATA[index];if(acc>=r.durationsMs[frame]){acc-=r.durationsMs[frame];frame=(frame+1)%r.frames;draw()}}requestAnimationFrame(tick)}draw();requestAnimationFrame(tick);'''.replace('__DATA__',data).replace('__LABELS__',json.dumps(names,ensure_ascii=False))
 (OUT/'viewer.js').write_text(js,encoding='utf-8');html+='<script src="viewer.js"></script></html>';(OUT/'revisao.html').write_text(html,encoding='utf-8');print('PASS: existing sheets checked: source margins, RGBA, dimensions, empty cells, hashes; contract and viewer saved.')
if __name__=='__main__':
 import sys
 if sys.argv[1]=='prepare':prepare()
 elif sys.argv[1]=='inspect':
  im=Image.open(OUT/sys.argv[2]/'source.png').convert('RGBA');print(im.size);print([p[1] for p in parts(im)])
 elif sys.argv[1]=='mount':mount(sys.argv[2])
 elif sys.argv[1]=='finalize':finalize()
