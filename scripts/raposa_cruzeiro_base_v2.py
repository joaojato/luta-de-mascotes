"""Orange recolor + slightly smaller hat; key and align without altering character art."""
from pathlib import Path
from PIL import Image,ImageDraw
import hashlib,json,shutil
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'output/raposa-cruzeiro-v2';REF=ROOT/'referencia/cruzeiro';DEST=ROOT/'public/assets/lutadores/raposa/bases'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def main():
 OUT.mkdir(parents=True,exist_ok=True);DEST.mkdir(parents=True,exist_ok=True)
 source=OUT/'source-magenta.png';im=Image.open(source).convert('RGBA');px=im.load()
 for y in range(im.height):
  for x in range(im.width):
   r,g,b,a=px[x,y];px[x,y]=(0,0,0,0) if r>g*1.8+25 and b>g*1.8+25 and abs(r-b)<75 else (r,g,b,255)
 box=im.getbbox();assert box and 0<box[0]<box[2]<im.width and 0<box[1]<box[3]<im.height
 path=REF/'base-raposa-v2-laranja.png';im.save(path);shutil.copy2(path,DEST/'base-v2-laranja.png')
 old=Image.open(REF/'base-raposa-v1.png').convert('RGBA');oldbox=old.getbbox();baseline=json.loads((ROOT/'output/raposa-cruzeiro-v1/report.json').read_text());sc=baseline['uniformScale']
 assert old.size==im.size,'Review source coordinate system before aligning'
 # Preserve the previous body scale and feet baseline, not a new bbox fit.
 cut=im.crop(box).resize((round((box[2]-box[0])*sc),round((box[3]-box[1])*sc)),Image.Resampling.NEAREST);native=Image.new('RGBA',(256,256));x=round(128+(box[0]-(oldbox[0]+oldbox[2])/2)*sc);y=round(228+(box[1]-oldbox[3])*sc);native.alpha_composite(cut,(x,y));native.save(REF/'base-raposa-v2-laranja-256.png');native.save(DEST/'base-v2-laranja-256.png')
 assert set(im.getchannel('A').get_flattened_data())=={0,255}
 assert not any(a and r>g*1.8+25 and b>g*1.8+25 and abs(r-b)<75 for r,g,b,a in im.get_flattened_data())
 review=Image.new('RGB',(1536,768));d=ImageDraw.Draw(review)
 for col,bg in enumerate(['#eeeeee','#222222','#777777']):
  x=col*512;d.rectangle((x,0,x+511,767),fill=bg);review.paste(native,(x+128,0),native.getchannel('A'));large=native.resize((512,512),Image.Resampling.NEAREST);review.paste(large,(x,256),large.getchannel('A'))
 review.save(OUT/'revisao-base.png')
 comparison=Image.new('RGB',(1024,600),'#777777');oldnative=Image.open(REF/'base-raposa-v1-256.png').convert('RGBA')
 for x,fr,label in [(0,oldnative,'V1'),(512,native,'V2')]:
  large=fr.resize((512,512),Image.Resampling.NEAREST);comparison.paste(large,(x,40),large.getchannel('A'));ImageDraw.Draw(comparison).text((x+12,12),label,fill='white')
 comparison.save(OUT/'antes-depois.png')
 oldhat=old.getchannel('A').crop((0,180,old.width,350)).getbbox();newhat=im.getchannel('A').crop((0,180,im.width,350)).getbbox();ratio=(newhat[2]-newhat[0])/(oldhat[2]-oldhat[0])
 refs=[REF/'base-raposa-v1.png',REF/'prompt-base-raposa-v2-laranja.txt',OUT/'prompt-ajuste-chapeu.txt',source]
 report={'character':'Raposa do Cruzeiro','version':2,'status':'Base revision for user visual review','generation':'Built-in image tool, edit only fur palette and straw hat size','userColorReference':'Attached orange Cruzeiro fox poster; palette only','sourceSize':im.size,'visibleBounds':box,'sameBodyScaleAsV1':True,'uniformScale':sc,'nativeCell':[256,256],'feetBaseline':228,'hatBandRegionWidthRatioV2toV1':ratio,'hatBandRegionWidthReductionPercent':round((1-ratio)*100,1),'alphaBinary':True,'noMagentaRemainder':True,'marginsClear':True,'runtimeRegistered':False,'references':[{'path':p.relative_to(ROOT).as_posix(),'sha256':sha(p)} for p in refs],'outputs':[{'path':p.relative_to(ROOT).as_posix(),'sha256':sha(p)} for p in [path,REF/'base-raposa-v2-laranja-256.png',DEST/'base-v2-laranja.png',DEST/'base-v2-laranja-256.png']]}
 (OUT/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print('Saved orange base RGBA; no magenta/soft alpha; same body scale asV1; hat region reduction',report['hatBandRegionWidthReductionPercent'],'percent')
if __name__=='__main__':main()
