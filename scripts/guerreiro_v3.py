"""Assemble corrected kick and charge; never redraw or distort artwork."""
from pathlib import Path
from PIL import Image, ImageDraw
import json,hashlib
from collections import deque
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/guerreiro-v3'
DEST=ROOT/'public/assets/npcs/guerreiro/base-v1'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()

def pack(action,filename,rows,anchors,scale,fps,loop,contacts):
 source=Image.open(OUT/action/'source.png').convert('RGBA')
 frames=[]; data=[]
 for i,(box,anchor) in enumerate(zip(rows,anchors)):
  crop=source.crop(box)
  # Isolate the connected figure; neighboring capes overlap in x only.
  if action=='run':
   alpha=crop.getchannel('A');w,h=crop.size;raw=alpha.tobytes();seen=bytearray(w*h);best=[]
   for seed,v in enumerate(raw):
    if v<8 or seen[seed]:continue
    q=deque([seed]);seen[seed]=1;component=[]
    while q:
     k=q.popleft();component.append(k);xx=k%w
     for n in ([k-1] if xx>0 else [])+([k+1] if xx+1<w else [])+([k-w] if k>=w else [])+([k+w] if k+w<w*h else []):
      if not seen[n] and raw[n]>=8:seen[n]=1;q.append(n)
    if len(component)>len(best):best=component
   isolated=bytearray(w*h)
   for k in best:isolated[k]=raw[k]
   crop.putalpha(Image.frombytes('L',(w,h),bytes(isolated)))
  crop.putalpha(crop.getchannel('A').point(lambda a:0 if a<8 else a))
  crop.save(OUT/action/f'extracted-{i}.png')
  crop=crop.resize((round(crop.width*scale),round(crop.height*scale)),Image.Resampling.NEAREST)
  x=round(294-(anchor[0]-box[0])*scale);y=round(296-(anchor[1]-box[1])*scale)
  assert x>=0 and y>=0 and x+crop.width<=512 and y+crop.height<=320,(action,i,x,y,crop.size)
  frame=Image.new('RGBA',(512,320));frame.alpha_composite(crop,(x,y))
  frame.save(OUT/action/f'frame-{i}.png');frames.append(frame)
  data.append({'frame':i,'sourceBox':box,'sourceAnchor':anchor,'visualBounds':frame.getbbox()})
 sheet=Image.new('RGBA',(2560,320*((len(frames)+4)//5)))
 contact=Image.new('RGB',(2048,320*((len(frames)+3)//4)),'#777777'); gifs=[]
 for i,f in enumerate(frames):
  sheet.alpha_composite(f,((i%5)*512,(i//5)*320))
  bg=Image.new('RGB',(512,320),'#777777');bg.paste(f,mask=f.getchannel('A'));gifs.append(bg)
  contact.paste(bg,((i%4)*512,(i//4)*320));ImageDraw.Draw(contact).text(((i%4)*512+8,(i//4)*320+8),str(i),fill='white')
 contact.save(OUT/action/'contact.png');sheet.save(OUT/action/'sheet.png');sheet.save(DEST/filename)
 for name,duration in [('preview',round(1000/fps)),('slow',300)]:
  gifs[0].save(OUT/action/f'{name}.gif',save_all=True,append_images=gifs[1:],duration=duration,loop=0)
 return {'file':str((DEST/filename).relative_to(ROOT)),'sha256':sha(DEST/filename),'sourceSha256':sha(OUT/action/'source.png'),'frames':len(frames),'fps':fps,'loop':loop,'frameWidth':512,'frameHeight':320,'columns':5,'origin':[256,296],'scale':scale,'contactFrames':contacts,'frameData':data}

def main():
 kick=pack('kick','sparta-kick.png',[(50,0,440,443),(530,0,894,443),(950,0,1338,443),(1338,0,1774,443),(8,443,448,887),(540,443,898,887),(950,443,1340,887),(1384,443,1774,887)],[(304,432),(746,432),(1181,432),(1663,432),(309,878),(746,878),(1189,878),(1628,878)],0.5,12,False,[3,4])
 runconfig=json.loads((OUT/'run/config.json').read_text())
 run=pack('run','war-run.png',runconfig['boxes'],runconfig['anchors'],runconfig['scale'],14,True,[])
 old=json.loads((OUT/'previous-manifest.json').read_text(encoding='utf-8'))
 idle=next(a for a in old['animations'] if a['file'].endswith('idle.png'))
 m={**old,'revision':3,'animations':[idle,run,kick],'placement':'Começa no lado oposto ao Cartola, atrás do alvo à distância; CORRE até perto; não aparece já colado ao alvo','transition':{'runToKick':'Ao entrar no alcance, completar fase de apoio B esquerdo (corrida quadro 4) e iniciar chute quadro 0','kickLeg':'Direita A próxima da câmera em TODOS os quadros; esquerda B distante apoia','worldMotion':'Motor desloca a corrida, não os atlas; parar antes do chute','singleHitFrames':[3,4]},'status':'Fontes e quadros revistos; aprovação visual do usuário e integração pendentes','rejected':'Chute v2 trocava leitura da perna; primeiras corridas v3 repetiam passadas sem alternância. Não reutilizar.'}
 (DEST/'manifest.json').write_text(json.dumps(m,ensure_ascii=False,indent=2),encoding='utf-8');(OUT/'report.json').write_text(json.dumps(m,ensure_ascii=False,indent=2),encoding='utf-8')
 html='<!doctype html><meta charset="utf-8"><title>Guerreiro v3</title><style>body{background:#222;color:white;font:16px sans-serif}img{max-width:100%;image-rendering:pixelated}</style><h1>Guerreiro — corrida e chute</h1><p>Corrida aproxima; chute só perto do alvo. Arte, sem simulação de combate.</p>'
 for a in ['run','kick']:
  html+=f'<h2>{a}</h2><img src="{a}/preview.gif"><img src="{a}/slow.gif"><details><summary>Quadros</summary><img src="{a}/contact.png"></details>'
 (OUT/'revisao.html').write_text(html,encoding='utf-8')
 # Illustrative approach only, no game physics/collision claims.
 scene=[]
 for i in range(17+8):
  bg=Image.new('RGB',(1000,340),'#303038');d=ImageDraw.Draw(bg)
  d.line((0,296,1000,296),fill='#999999',width=1)
  d.line((290,160,290,296),fill='#e3b353',width=2);d.text((264,306),'ALVO',fill='#e3b353')
  if i<17:
   frame=Image.open(OUT/'run'/f'frame-{i%6}.png');pos=800-round(400*i/16)
  else:frame=Image.open(OUT/'kick'/f'frame-{i-17}.png');pos=400
  bg.paste(frame,(pos-256,0),frame.getchannel('A'));scene.append(bg)
 scene[0].save(OUT/'approach-preview.gif',save_all=True,append_images=scene[1:],duration=[71]*17+[83]*8,loop=0)
 html=html.replace('<h1>','<img src="approach-preview.gif"><p>Composição ilustrativa: aproximação e chute. A linha marca o alvo.</p><h1>',1)
 (OUT/'revisao.html').write_text(html,encoding='utf-8')
 checks=[]
 for a in [run,kick]:
  im=Image.open(ROOT/a['file']);assert im.mode=='RGBA'
  for i in range(a['frames'],((a['frames']+4)//5)*5):assert im.crop(((i%5)*512,(i//5)*320,(i%5+1)*512,(i//5+1)*320)).getbbox() is None
  for f in a['frameData']:
   b=f['visualBounds'];assert b[0]>0 and b[1]>0 and b[2]<512 and b[3]<320
  checks.append({'file':a['file'],'frames':a['frames'],'rgba':True,'margins':True,'emptyCells':True})
 (OUT/'validation.json').write_text(json.dumps(checks,indent=2),encoding='utf-8')
 print('PASS: run + corrected kick assembled and validated.')
if __name__=='__main__':main()
