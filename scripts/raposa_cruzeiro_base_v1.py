"""Base concept only: chroma-key, uniform alignment and transparent PNG checks."""
from pathlib import Path
from PIL import Image,ImageDraw
import json,hashlib,shutil
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'output/raposa-cruzeiro-v1';REF=ROOT/'referencia/cruzeiro';DEST=ROOT/'public/assets/lutadores/raposa/bases'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def main():
 OUT.mkdir(parents=True,exist_ok=True);DEST.mkdir(parents=True,exist_ok=True)
 source=OUT/'source-magenta.png';im=Image.open(source).convert('RGBA');px=im.load()
 for y in range(im.height):
  for x in range(im.width):
   r,g,b,a=px[x,y]
   px[x,y]=(0,0,0,0) if r>g*1.8+25 and b>g*1.8+25 and abs(r-b)<75 else (r,g,b,255)
 box=im.getbbox();assert box and box[0]>0 and box[1]>0 and box[2]<im.width and box[3]<im.height
 im.save(REF/'base-raposa-v1.png');shutil.copy2(REF/'base-raposa-v1.png',DEST/'base-v1.png')
 # One uniform nearest-neighbor scale; never resize separate body parts.
 scale=200/(box[3]-box[1]);cut=im.crop(box);cut=cut.resize((round(cut.width*scale),200),Image.Resampling.NEAREST)
 native=Image.new('RGBA',(256,256));native.alpha_composite(cut,((256-cut.width)//2,28));native.save(REF/'base-raposa-v1-256.png');native.save(DEST/'base-v1-256.png')
 assert set(im.getchannel('A').get_flattened_data())=={0,255}
 assert not any(a and r>g*1.8+25 and b>g*1.8+25 and abs(r-b)<75 for r,g,b,a in im.get_flattened_data())
 review=Image.new('RGB',(1536,768));d=ImageDraw.Draw(review)
 for col,bg in enumerate(['#eeeeee','#222222','#777777']):
  x=col*512;d.rectangle((x,0,x+511,767),fill=bg);review.paste(native,(x+128,0),native.getchannel('A'));large=native.resize((512,512),Image.Resampling.NEAREST);review.paste(large,(x,256),large.getchannel('A'))
 review.save(OUT/'revisao-base.png')
 refs=[ROOT/'referencia/urubu/modelo-oficial.png',source,REF/'prompt-base-raposa-v1.txt',OUT/'prompt-cleanup.txt']
 report={'character':'Raposa do Cruzeiro','stage':'First base only; awaiting user visual review','sourceSize':im.size,'visibleBounds':box,'nativeCell':[256,256],'nativeBodyHeight':200,'origin':[128,228],'uniformScale':scale,'alphaBinary':True,'noMagentaRemainder':True,'sourceMarginsClear':True,'runtimeRegistered':False,'generation':'Built-in image tool; magenta cleanup requested after soft-alpha first result','userReferences':['Attached white boxing fox: identity, handwraps, bare torso and shorts','Attached straw hat photo: accessory shape, straw color, brown band'],'references':[{'path':p.relative_to(ROOT).as_posix(),'sha256':sha(p)} for p in refs],'files':[{'path':p.relative_to(ROOT).as_posix(),'sha256':sha(p)} for p in [REF/'base-raposa-v1.png',REF/'base-raposa-v1-256.png',DEST/'base-v1.png',DEST/'base-v1-256.png']]}
 (OUT/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print('Base saved; transparent RGBA, zero magenta, clear margins; native body200px in256px cell')
if __name__=='__main__':main()
