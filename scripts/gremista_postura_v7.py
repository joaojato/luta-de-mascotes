"""Four-action posture revision; generated artwork assembled without deformation."""
from pathlib import Path
import json,shutil,sys,math
from PIL import Image,ImageDraw
import gremista_coesao_v3 as art
art.OUT=art.ROOT/'output/gremista-postura-v7';art.DEST=art.ROOT/'public/assets/lutadores/mosqueteiro-gremio/postura-v7'
art.SPECS={'walk-forward':(8,8,True),'walk-backward':(8,8,True),'light-punch':(16,40,False),'low-kick':(12,32,False)}
def prepare():
 art.OUT.mkdir(parents=True,exist_ok=True)
 for a in art.SPECS:(art.OUT/a).mkdir(exist_ok=True)
 for name in ['guard.png','guard-magenta-source.png']:shutil.copy2(art.ROOT/'output/gremista-coesao-v3'/name,art.OUT/name)
 if not (art.OUT/'runtime-before.json').exists():shutil.copy2(art.ROOT/'src/game/lutadores/mosqueteiro-gremio.json',art.OUT/'runtime-before.json')
def guides():
 front=[(280,350),(272,338),(254,336),(247,350),(255,350),(264,350),(272,350),(280,350)]
 rear=[(357,350),(352,350),(346,350),(338,350),(334,345),(329,334),(340,342),(357,350)]
 kneesA=[(263,316),(252,307),(242,306),(240,318),(245,320),(251,318),(259,315),(263,316)]
 kneesB=[(332,316),(330,317),(328,319),(326,320),(321,313),(316,307),(325,310),(332,316)]
 for name,order in [('walk-forward',list(range(8))),('walk-backward',[0,6,5,4,3,2,1,0])]:
  im=Image.new('RGB',(1280,500),'#eeeeee');d=ImageDraw.Draw(im);records=[]
  for f,k in enumerate(order):
   aa,bb,ka,kb=front[k],rear[k],kneesA[k],kneesB[k]
   if name=='walk-backward':
    aa=[(280,350),(285,350),(292,350),(300,350),(300,345),(309,337),(294,343),(280,350)][f]
    bb=[(357,350),(365,340),(378,337),(383,350),(379,350),(372,350),(365,350),(357,350)][f]
    ka=[(263,316),(267,317),(271,318),(277,320),(278,309),(284,305),(274,310),(263,316)][f]
    kb=[(332,316),(333,307),(337,307),(342,320),(340,322),(337,320),(334,318),(332,316)][f]
   ox=f%4*320;oy=f//4*250
   def xy(p):return (ox+p[0]-160,oy+p[1]-140)
   d.text((ox+8,oy+8),f'{f} opponent LEFT / chest 3-4 LEFT',fill='black')
   d.line([xy((300,220)),xy((315,280))],fill='#555555',width=9)
   for hip,knee,ankle,color,label in [((325,282),kb,bb,'#3c8c4b','B left FAR REAR'),((300,282),ka,aa,'#176fd0','A right NEAR FRONT')]:
    d.line([xy(hip),xy(knee),xy(ankle)],fill=color,width=6);toe=(ankle[0]-26,ankle[1]+8);d.line([xy(ankle),xy(toe)],fill=color,width=9)
    for p in [hip,knee,ankle]:
     x,y=xy(p);d.ellipse((x-4,y-4,x+4,y+4),fill=color)
   d.text((ox+8,oy+224),'Blue=A right lead; green=B left rear',fill='#333333');records.append({'frame':f,'rightHip':[300,282],'rightKnee':ka,'rightAnkle':aa,'leftHip':[325,282],'leftKnee':kb,'leftAnkle':bb})
  im.save(art.OUT/name/'motion-guide.png');art.write(art.OUT/name/'joint-guide.json',records)
 for name in ['light-punch','low-kick']:
  low=name=='low-kick';n=12 if low else 16
  wx=([258,270,282,290,277,252,230,228,250,275,265,258] if low else [258,270,280,286,274,250,228,226,252,280,282,252,228,226,252,258])
  wy=([310]*12 if low else [244,250,252,252,252,252,252,252,242,240,240,240,240,240,244,244])
  lean=([0,0,0,0,3,8,12,12,6,0,0,0] if low else [0,0,0,0,3,8,12,12,6,0,0,8,12,12,6,0])
  im=Image.new('RGB',(1280,250*((n+3)//4)),'#eeeeee');d=ImageDraw.Draw(im);records=[]
  for f in range(n):
   ox=f%4*320;oy=f//4*250;sh=(300-lean[f],285 if low else 235);wr=(wx[f],wy[f]);dx=wr[0]-sh[0];dy=wr[1]-sh[1];dist=math.hypot(dx,dy);l=34
   assert dist<2*l
   h=math.sqrt(l*l-dist*dist/4);el=((sh[0]+wr[0])/2+dy/dist*h,(sh[1]+wr[1])/2-dx/dist*h)
   tip=(wr[0]-70,wr[1])
   if f in [0,n-1]:tip=(wr[0]-35,wr[1]-60)
   elif f==n-2:tip=(wr[0]-52,wr[1]-40)
   def xy(p):return (ox+p[0]-140,oy+p[1]-140)
   d.text((ox+8,oy+8),f'{f} RIGHT shoulder drives LEFT',fill='black');d.line([xy((320,300)),xy(sh)],fill='#777777',width=9)
   d.line([xy(sh),xy(el),xy(wr)],fill='#176fd0',width=7);d.line([xy(wr),xy(tip)],fill='#c52d2d',width=5)
   for p in [sh,el,wr]:
    x,y=xy(p);d.ellipse((x-4,y-4,x+4,y+4),fill='#176fd0')
   d.text((ox+8,oy+226),'Fixed arm lengths; extend ELBOW, not wrist',fill='#333333');records.append({'frame':f,'rightShoulder':sh,'rightElbow':el,'rightWrist':wr,'bladeTip':tip,'upperArmLength':l,'forearmLength':l})
  im.save(art.OUT/name/'motion-guide.png');art.write(art.OUT/name/'joint-guide.json',records)
def mount(action):
 art.mount(action);f=art.OUT/action;r=json.loads((f/'report.json').read_text());frames=[]
 for i in range(r['frames']):
  fr=Image.open(f/f'frame-{i:02}.png').convert('RGBA');bg=Image.new('RGB',(640,384),'#777777');bg.paste(fr,mask=fr.getchannel('A'));frames.append(bg)
 elapsed=previous=0;ds=[]
 for ms in r['durationsMs']:
  elapsed+=ms;b=round(elapsed/10)*10;ds.append(b-previous);previous=b
 frames[0].save(f/'preview.gif',save_all=True,append_images=frames[1:],duration=ds,loop=0)
def finalize():
 art.finalize()
 for p in [art.DEST/'manifest-art.json',art.OUT/'report.json']:
  d=json.loads(p.read_text(encoding='utf-8'));d.update(revision=7,scope='Opponent-facing bent-knee footwork; shoulder-driven aggressive sword attacks');art.write(p,d)
 for name in ['viewer.js','revisao.html']:
  p=art.OUT/name;p.write_text(p.read_text(encoding='utf-8').replace('coesao-v3','postura-v7').replace('coesão v3','postura v7'),encoding='utf-8')
 old={a['action']:a for a in json.loads((art.OUT/'runtime-before.json').read_text())['actions']};html=[]
 for name,(n,fps,loop) in art.SPECS.items():
  sheet=Image.open(art.ROOT/'public/assets/lutadores/mosqueteiro-gremio'/old[name]['file']).convert('RGBA');frames=[]
  for i in range(n):
   before=sheet.crop((i%5*640,i//5*384,(i%5+1)*640,(i//5+1)*384));after=Image.open(art.OUT/name/f'frame-{i:02}.png').convert('RGBA');bg=Image.new('RGB',(1280,384),'#555555');bg.paste(before,(0,0),before.getchannel('A'));bg.paste(after,(640,0),after.getchannel('A'));d=ImageDraw.Draw(bg);d.text((8,8),'ANTES',fill='white');d.text((648,8),'REVISAO V7',fill='white');frames.append(bg)
  ds=[round((i+1)*1000/fps/10)*10-round(i*1000/fps/10)*10 for i in range(n)]
  frames[0].save(art.OUT/name/'antes-depois.gif',save_all=True,append_images=frames[1:],duration=ds,loop=0);html.append(f'<h2>{name}: antes / revisão</h2><img src="{name}/antes-depois.gif">')
 p=art.OUT/'revisao.html';p.write_text(p.read_text(encoding='utf-8')+''.join(html),encoding='utf-8')
 refs=[art.BASE,art.OUT/'guard-magenta-source.png',art.ROOT/'output/gremista-coesao-v3/crouch/held-reference-magenta.png']
 refs += [p for a in art.SPECS for p in (art.OUT/a).iterdir() if p.name in ['motion-guide.png','joint-guide.json','prompt.txt','config.json','source-magenta.png']]
 art.write(art.OUT/'reference-hashes-v7.json',[{'path':p.relative_to(art.ROOT).as_posix(),'sha256':art.sha(p)} for p in refs])
def integrate():
 p=art.ROOT/'src/game/lutadores/mosqueteiro-gremio.json';before=json.loads((art.OUT/'runtime-before.json').read_text(encoding='utf-8'));current=json.loads(p.read_text(encoding='utf-8'));old={a['action']:a for a in before['actions']}
 for a in current['actions']:
  if a['action'] in art.SPECS:assert a==old[a['action']],'Affected action changed; inspect first'
 shutil.copy2(p,art.OUT/'runtime-integration-before.json')
 for a in current['actions']:
  if a['action'] in art.SPECS:
   r=json.loads((art.OUT/a['action']/'report.json').read_text());assert a['frames']==r['frames'] and a['frameRate']==r['fps'];a['file']='postura-v7/'+r['file']
 p.write_text(json.dumps(current,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print('Only four sprite paths changed; all combat and animation timing preserved')
if __name__=='__main__':
 cmd=sys.argv[1]
 if cmd=='prepare':prepare();guides()
 elif cmd=='chroma':art.chroma(Path(sys.argv[2]),Path(sys.argv[3]))
 elif cmd=='mount':mount(sys.argv[2])
 elif cmd=='finalize':finalize()
 elif cmd=='integrate':integrate()
