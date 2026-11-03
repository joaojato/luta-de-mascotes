"""Generated-art assembly/review only: one uniform scale per action, no deformation."""
from pathlib import Path
from PIL import Image,ImageDraw
from collections import deque
import json,hashlib,shutil,sys
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'output/gremista-coesao-v3';DEST=ROOT/'public/assets/lutadores/mosqueteiro-gremio/coesao-v3'
BASE=ROOT/'referencia/gremio/base-manga-longa-cabelos-pretos-v8.png'
SPECS={'idle':(4,8,True),'walk-forward':(8,8,True),'walk-backward':(8,8,True),'dash-forward':(5,18,False),'dash-back':(4,18,False),'crouch':(5,20,False),'jump':(8,10,False),'block-high':(4,10,False),'block-low':(4,10,False),'hit-high':(6,12,False),'stunned':(4,6,True),'knockdown':(10,10,False),'special':(6,12,False),'light-punch':(8,20,False),'heavy-punch':(8,14,False),'shot':(12,12,False),'low-kick':(6,16,False),'jump-punch':(6,14,False),'jump-kick':(6,14,False)}
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,o):p.write_text(json.dumps(o,ensure_ascii=False,indent=2),encoding='utf-8')
def chroma(source,destination):
 im=Image.open(source).convert('RGBA');px=im.load();removed=0
 for y in range(im.height):
  for x in range(im.width):
   r,g,b,a=px[x,y]
   if r>g*1.8+25 and b>g*1.8+25 and abs(r-b)<75:
    px[x,y]=(0,0,0,0);removed+=1
   else:px[x,y]=(r,g,b,255)
 im.save(destination);print('Chroma key:',removed,'background pixels removed; alpha binary, no feather whitening or body erosion')
def parts(im):
 w,h=im.size;raw=im.getchannel('A').tobytes();seen=bytearray(w*h);out=[]
 for seed,v in enumerate(raw):
  if v<12 or seen[seed]:continue
  q=deque([seed]);seen[seed]=1;p=[];x0=w;y0=h;x1=y1=0
  while q:
   k=q.popleft();p.append(k);x=k%w;y=k//w;x0=min(x0,x);x1=max(x1,x);y0=min(y0,y);y1=max(y1,y)
   for n in ([k-1] if x else [])+([k+1] if x+1<w else [])+([k-w] if y else [])+([k+w] if y+1<h else []):
    if not seen[n] and raw[n]>=12:seen[n]=1;q.append(n)
  if len(p)>1000:out.append((p,(x0,y0,x1+1,y1+1)))
 return out
def ordered(im,rows):return sorted(parts(im),key=lambda p:(int((p[1][1]+p[1][3])/2/im.height*rows),p[1][0]))
def extract(im,part):
 ps,box=part;raw=im.getchannel('A').tobytes();mask=bytearray(im.width*im.height)
 for k in ps:mask[k]=raw[k]
 cut=im.copy();cut.putalpha(Image.frombytes('L',im.size,bytes(mask)));return cut.crop(box)
def mount(a):
 DEST.mkdir(parents=True,exist_ok=True);f=OUT/a;cfg=json.loads((f/'config.json').read_text());im=Image.open(f/'source.png').convert('RGBA');ps=ordered(im,cfg['rows']);n,fps,loop=SPECS[a];assert len(ps)==n,(a,len(ps),[p[1] for p in ps]);assert len(cfg['anchors'])==n
 frames=[];meta=[];sc=cfg['scale'];allboxes=[]
 for i,(part,anchor) in enumerate(zip(ps,cfg['anchors'])):
  cut=extract(im,part);cut.save(f/f'extracted-{i:02}.png');box=part[1];allboxes.append(box)
  cut=cut.resize((round(cut.width*sc),round(cut.height*sc)),Image.Resampling.NEAREST)
  tx,ty=cfg.get('frameTargets',{}).get(str(i),cfg.get('target',[320,360]));x=round(tx-(anchor[0]-box[0])*sc);y=round(ty-(anchor[1]-box[1])*sc)
  assert x>1 and y>1 and x+cut.width<639 and y+cut.height<383,(a,i,x,y,cut.size)
  frame=Image.new('RGBA',(640,384));frame.alpha_composite(cut,(x,y))
  exactGuard=i in cfg.get('guardFrames',[])
  if exactGuard:frame=Image.open(OUT/'guard.png').convert('RGBA')
  productionPose=cfg.get('productionPoses',{}).get(str(i))
  if productionPose:frame=Image.open(OUT/productionPose['action']/f"frame-{productionPose['frame']:02}.png").convert('RGBA')
  frame.save(f/f'frame-{i:02}.png');frames.append(frame)
  m={'frame':i,'sourceBox':box,'sourceAnchor':anchor,'target':[tx,ty],'visualBounds':frame.getbbox(),'exactProductionGuard':exactGuard,'exactProductionPose':productionPose}
  for key,points in cfg.get('landmarks',{}).items():
   if i<len(points) and points[i] is not None:
    px,py=points[i];m[key]=[round(tx+(px-anchor[0])*sc),round(ty+(py-anchor[1])*sc)]
  meta.append(m)
 sheet=Image.new('RGBA',(3200,384*((n+4)//5)));contact=Image.new('RGB',(640*4,384*((n+3)//4)),'#777777');previews=[]
 for i,fr in enumerate(frames):
  sheet.alpha_composite(fr,(i%5*640,i//5*384));bg=Image.new('RGB',(640,384),'#777777');bg.paste(fr,mask=fr.getchannel('A'));previews.append(bg);contact.paste(bg,(i%4*640,i//4*384));ImageDraw.Draw(contact).text((i%4*640+8,i//4*384+8),str(i),fill='white')
 sheet.save(f/'sheet.png');sheet.save(DEST/f'{a}.png');contact.save(f/'contact.png');ds=cfg.get('durationsMs',[round(1000/fps)]*n)
 for name,durations in [('preview',ds),('slow',[300]*n)]:previews[0].save(f/f'{name}.gif',save_all=True,append_images=previews[1:],duration=durations,loop=0)
 if a=='idle':shutil.copy2(f/'frame-00.png',OUT/'guard.png');shutil.copy2(f/'extracted-00.png',OUT/'working-guard.png');shutil.copy2(f/'frame-00.png',DEST/'guard-reference.png')
 # Contact with fixed-size production guard: never fit the body to its own bbox.
 compare=Image.new('RGB',(640*4,384*2*((n+3)//4)));d=ImageDraw.Draw(compare);guard=Image.open(OUT/'guard.png').convert('RGBA')
 for i,fr in enumerate(frames):
  for row,bg in enumerate(['#eeeeee','#222222']):
   x=i%4*640;y=(i//4*2+row)*384;d.rectangle((x,y,x+640,y+384),fill=bg)
   compare.paste(fr,(x,y),fr.getchannel('A'));d.text((x+8,y+8),str(i),fill='#777777')
 compare.save(f/'comparison.png')
 report={'action':a,'file':f'{a}.png','frames':n,'fps':fps,'repeat':-1 if loop else 0,'frameWidth':640,'frameHeight':384,'columns':5,'origin':[320,360],'scaleUniform':sc,'durationsMs':ds,'frameData':meta,'sourceSha256':sha(f/'source.png'),'sha256':sha(DEST/f'{a}.png'),'review':cfg.get('review','Pending visual review')}
 write(f/'report.json',report);print('Mounted',a,n,'frames; uniform scale',sc)
def finalize():
 reports=[json.loads((OUT/a/'report.json').read_text()) for a in SPECS if (OUT/a/'report.json').exists()];checks=[]
 for r in reports:
  im=Image.open(DEST/r['file']);assert im.mode=='RGBA' and im.size==(3200,384*((r['frames']+4)//5));assert sha(DEST/r['file'])==r['sha256']
  assert set(im.getchannel('A').get_flattened_data()) <= {0,255},r['action']+' soft alpha'
  assert not any(a and red>green*1.8+25 and blue>green*1.8+25 and abs(red-blue)<75 for red,green,blue,a in im.get_flattened_data()),r['action']+' magenta remainder'
  source=Image.open(OUT/r['action']/'source.png').convert('RGBA');sb=source.getbbox();assert sb and sb[0]>0 and sb[1]>0 and sb[2]<source.width and sb[3]<source.height,r['action']+' clipped source'
  for i in range(r['frames'],5*((r['frames']+4)//5)):assert im.crop((i%5*640,i//5*384,(i%5+1)*640,(i//5+1)*384)).getbbox() is None
  for fr in r['frameData']:
   x0,y0,x1,y1=fr['visualBounds'];assert 0<x0<x1<640 and 0<y0<y1<384
  checks.append({'action':r['action'],'frames':r['frames'],'rgba':True,'binaryAlpha':True,'noMagentaRemainder':True,'sourceEdgeClear':True,'dimensions':True,'margins':True,'hash':True,'emptyUnusedCells':True})
 references=[BASE,OUT/'guard-magenta-source.png',OUT/'guard.png']
 references += [p for a in SPECS for p in (OUT/a).glob('*') if p.name in ['movement-gray.png','movement-guide.png','prompt.txt','source-magenta.png','config.json']]
 write(OUT/'reference-hashes.json',[{'path':p.relative_to(ROOT).as_posix(),'sha256':sha(p)} for p in references if p.exists()])
 missing=[a for a in SPECS if a not in [r['action'] for r in reports]]
 write(OUT/'validation.json',checks);manifest={'character':'Gremista','revision':3,'identity':BASE.relative_to(ROOT).as_posix(),'baseSha256':sha(BASE),'productionGuard':'idle frame0','animations':reports,'missing':missing,'status':'Visual review in progress' if missing else 'Visual art reviewed; combat testing separate'};write(DEST/'manifest-art.json',manifest);write(OUT/'report.json',manifest)
 data=json.dumps(reports,ensure_ascii=False)
 html='''<!doctype html><meta charset="utf-8"><title>Gremista — coesão v3</title><style>body{font:16px system-ui;background:#222;color:#eee;margin:24px}canvas,img{image-rendering:pixelated;max-width:100%}canvas{background:#666}button,select,input{padding:6px;margin:6px}a{color:#7cd5ff}</style><h1>Gremista — coesão v3</h1><p>Esquerda: ação. Direita: guarda de produção, mesma escala. As repetições servem à revisão.</p><select id="action"></select><button id="play">Pausar</button><button id="previous">← Quadro</button><button id="next">Quadro →</button><select id="speed"><option value="1">Normal</option><option value="0.5">Metade</option><option value="0.25">Um quarto</option></select><input id="frame" type="range" min="0"><p id="info"></p><canvas id="canvas" width="640" height="384"></canvas><canvas id="guard" width="640" height="384"></canvas>'''
 for r in reports:
  a=r['action'];html+=f'<h2>{a}</h2><img src="{a}/preview.gif"><details><summary>Fonte, prompt e quadros</summary><a href="{a}/prompt.txt">Prompt</a> · <a href="{a}/source.png">Fonte</a><p><img src="{a}/contact.png"></p></details>'
 js='''const DATA=__DATA__;let a=0,f=0,playing=true,last=0,acc=0;const sel=document.getElementById('action'),slide=document.getElementById('frame'),ctx=document.getElementById('canvas').getContext('2d');ctx.imageSmoothingEnabled=false;const imgs=DATA.map(r=>{const im=new Image();im.src='../../public/assets/lutadores/mosqueteiro-gremio/coesao-v3/'+r.file;im.onload=draw;return im});DATA.forEach((r,i)=>{const o=document.createElement('option');o.value=i;o.textContent=r.action;sel.append(o)});const g=new Image();g.src='guard.png';g.onload=()=>document.getElementById('guard').getContext('2d').drawImage(g,0,0);function draw(){const r=DATA[a];slide.max=r.frames-1;slide.value=f;ctx.clearRect(0,0,640,384);if(imgs[a].complete&&imgs[a].naturalWidth)ctx.drawImage(imgs[a],f%5*640,Math.floor(f/5)*384,640,384,0,0,640,384);document.getElementById('info').textContent=r.action+' — quadro '+f+'/'+(r.frames-1)}function pause(){playing=false;document.getElementById('play').textContent='Reproduzir'}sel.onchange=()=>{a=Number(sel.value);f=0;acc=0;draw()};slide.oninput=()=>{pause();f=Number(slide.value);draw()};document.getElementById('play').onclick=()=>{playing=!playing;document.getElementById('play').textContent=playing?'Pausar':'Reproduzir'};document.getElementById('previous').onclick=()=>{pause();f=(f+DATA[a].frames-1)%DATA[a].frames;draw()};document.getElementById('next').onclick=()=>{pause();f=(f+1)%DATA[a].frames;draw()};function tick(t){if(!last)last=t;if(playing){acc+=Math.min(100,t-last)*Number(document.getElementById('speed').value);if(acc>=DATA[a].durationsMs[f]){acc-=DATA[a].durationsMs[f];f=(f+1)%DATA[a].frames;draw()}}last=t;requestAnimationFrame(tick)}draw();requestAnimationFrame(tick);'''.replace('__DATA__',data)
 (OUT/'viewer.js').write_text(js,encoding='utf-8');(OUT/'revisao.html').write_text(html+'<script src="viewer.js"></script>',encoding='utf-8');print('Verified',len(reports),'sheets;',sum(r['frames'] for r in reports),'frames; missing',missing)
if __name__=='__main__':
 if sys.argv[1]=='chroma':chroma(Path(sys.argv[2]),Path(sys.argv[3]))
 elif sys.argv[1]=='inspect':
  im=Image.open(OUT/sys.argv[2]/'source.png').convert('RGBA');print(im.size,[p[1] for p in ordered(im,int(sys.argv[3]))])
 elif sys.argv[1]=='mount':mount(sys.argv[2])
 elif sys.argv[1]=='finalize':finalize()
