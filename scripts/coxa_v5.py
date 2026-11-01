"""Revisao de apoio e passos: montagem de camadas rigidas, sem redesenhar anatomia."""
from pathlib import Path
from PIL import Image
import json, math, hashlib, shutil, zipfile
from coxa_revisao_v2 import point, outputs
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/coxa-v5'
DEST=ROOT/'public/assets/lutadores/coxa/revisao-v5'
def read(p):return json.loads(p.read_text(encoding='utf-8'))
def save(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2),encoding='utf-8')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def build(action,far,near,overrides=None):
    folder=OUT/'normal'/action;r=read(folder/'report.json')
    obj=Image.open(ROOT/'output/coxa-v4/objetos/andador.png').convert('RGBA')
    frames=[];bodies=[];rig=[]
    for i in range(r['frames']):
        override=(overrides or {}).get(str(i))
        source_folder=OUT/'normal'/override['folder'] if override else folder
        source_report=read(source_folder/'report.json') if override else r
        source_i=override.get('index',0) if override else i
        old=Image.open(source_folder/f'frame-{source_i:02}.png').convert('RGBA')
        a=point(source_report,source_i,override['far'] if override else far[i]);b=point(source_report,source_i,override['near'] if override else near[i])
        dx,dy=round(241-a[0]),round(197-a[1])
        body=Image.new('RGBA',(512,320));body.alpha_composite(old,(dx,dy))
        hands=[(a[0]+dx,a[1]+dy),(b[0]+dx,b[1]+dy)]
        layer=Image.new('RGBA',body.size);layer.paste(obj,(217,192))
        result=body.copy();result.alpha_composite(layer)
        # Dedos existentes passam na frente da manopla; tubo continua diante da palma.
        for x,y in hands:
            for box in [(round(x-6),round(y-5),round(x+7),round(y-1)),(round(x-5),round(y+3),round(x+6),round(y+6))]:
                result.alpha_composite(body.crop(box),(box[0],box[1]))
        bodies.append(body);frames.append(result)
        body.save(folder/f'aligned-body-{i:02}.png');layer.save(folder/f'walker-layer-{i:02}.png')
        rig.append({'frame':i,'origin':[217,192],'rotation':0,'scale':1,'object':'objetos/andador.png','object_sha256':sha(ROOT/'output/coxa-v4/objetos/andador.png'),'hands':{'right-far':hands[0],'left-near':hands[1]},'bodyOffset':[dx,dy],'bodySource':str(source_folder.relative_to(ROOT)/'source.png'),'bodySource_sha256':source_report['source_sha256'],'bodySourceFrame':source_i})
    sheet=Image.new('RGBA',(2560,320*math.ceil(len(bodies)/5)))
    for i,b in enumerate(bodies):sheet.alpha_composite(b,((i%5)*512,(i//5)*320))
    sheet.save(folder/'aligned-body-sheet.png');outputs(folder,frames,r['fps']);save(folder/'attachments.json',rig)
    return rig
if __name__=='__main__':
    coords=read(OUT/'anchors.json')
    for action,c in coords.items():build(action,c['far'],c['near'],c.get('overrides'))
