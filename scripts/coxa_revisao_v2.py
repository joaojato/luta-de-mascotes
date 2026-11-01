"""Correções dirigidas: coordenadas explícitas, objeto rígido e camadas revisáveis."""
from pathlib import Path
from PIL import Image
import json, math, shutil, hashlib, html, zipfile
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/coxa-rigido-v2'
OLD=ROOT/'output/coxa-rigido-v1'
DEST=ROOT/'public/assets/lutadores/coxa/rigido-v2'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def data(p):return json.loads(p.read_text(encoding='utf-8'))
def save(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2),encoding='utf-8')
def point(r,i,p):
    rect,b=r['source_crops'][i];sc=r['scale'];w=round((b[2]-b[0])*sc);h=round((b[3]-b[1])*sc)
    return (round(512*.72)-w+(p[0]-rect[0]-b[0])*sc,292-h+(p[1]-rect[1]-b[1])*sc)
def stamp(obj,cell,xy):cell.alpha_composite(obj,(round(xy[0]),round(xy[1])))
def outputs(folder,frames,fps):
    sheet=Image.new('RGBA',(2560,320*math.ceil(len(frames)/5)));previews=[]
    for i,cell in enumerate(frames):
        cell.save(folder/f'composed-{i:02}.png');sheet.alpha_composite(cell,((i%5)*512,(i//5)*320));bg=Image.new('RGBA',cell.size,'#333842');bg.alpha_composite(cell);previews.append(bg.convert('RGB'))
    sheet.save(folder/'composed-sheet.png');bg=Image.new('RGBA',sheet.size,'#eee');bg.alpha_composite(sheet);bg.convert('RGB').save(folder/'composed-contact.png');previews[0].save(folder/'composed-preview.gif',save_all=True,append_images=previews[1:],duration=round(1000/fps),loop=0)
def rebuild():
    (OUT/'objetos').mkdir(parents=True,exist_ok=True);shutil.copy2(OLD/'objetos/upright.png',OUT/'objetos/andador.png')
    for action in ('special-transform',):
        target=OUT/'normal'/action
        if not target.exists():shutil.copytree(OLD/'normal'/action,target)
    obj=Image.open(OUT/'objetos/andador.png').convert('RGBA');can=Image.open(OLD/'efeitos/beer-can/frame-00.png').convert('RGBA');can=can.crop(can.getbbox())
    # Coordenadas anotadas nas fontes. Direita anatômica = braço distante/esquerda da imagem.
    beer_near=[(355,286),(864,287),(1374,288),(391,778),(896,779),(1398,779)]
    beer_far=[(202,326),(646,149),(1180,70),(90,645),(626,767),(1204,820)]
    kick_near=[(365,283),(786,315),(1195,310),(1736,313),(493,735),(833,713),(1237,725),(1672,722)]
    grab_far=[(94,188),(610,363),(1117,382),(127,843),(646,733),(1145,734)]
    manifests=[]
    for action in ('beer-throw','low-kick','block-low','special-transform','walker-grab'):
        folder=OUT/'normal'/action;r=data(folder/'report.json');frames=[];attachments=[];offsets=[];props=[]
        for i in range(r['frames']):
            original=Image.open(folder/f'frame-{i:02}.png').convert('RGBA');body=Image.new('RGBA',(512,320));shift=(0,0);origin=(225,192);fingers=[];behind=False
            if action=='beer-throw':
                near=point(r,i,beer_near[i]);shift=(305-near[0],200-near[1]);fingers=[(305,200)]
            elif action=='low-kick':
                near=point(r,i,kick_near[i]);shift=(340-near[0],200-near[1]);origin=(260,192);fingers=[(340,200)];behind=True
            elif action=='block-low':
                shift=(35,0);origin=(225,192)
            elif action in ('special-transform','special-charge'):
                # O corpo é independente: nunca recalcular a posição do objeto a partir de outra mão.
                origin=(161,192)
                if action=='special-charge':shift=(-70,0)
            elif action=='walker-grab':
                hp=point(r,i,grab_far[i]);origin=(161,192)
                if i>=3:
                    grip0=point(r,3,grab_far[3]);anchor=(grip0[0]-161,grip0[1]-192)
                    origin=(hp[0]-anchor[0],hp[1]-anchor[1]);fingers=[hp]
            dx,dy=round(shift[0]),round(shift[1]);stamp(original,body,(dx,dy));offsets.append([dx,dy]);cell=Image.new('RGBA',body.size)
            if behind:stamp(obj,cell,origin);cell.alpha_composite(body)
            else:cell.alpha_composite(body);stamp(obj,cell,origin)
            for x,y in fingers:
                box=(round(x-4),round(y-5),round(x+5),round(y+5));patch=body.crop(box);stamp(patch,cell,(box[0],box[1]))
            if action=='beer-throw' and i<=3:
                x,y=point(r,i,beer_far[i]);x+=dx;y+=dy
                if i==3:x-=14;y-=5
                angle=[0,-15,-45,-60][i];prop=can.rotate(angle,resample=Image.Resampling.NEAREST,expand=True);stamp(prop,cell,(x-prop.width/2,y-prop.height/2))
                if i<3:
                    box=(round(x-2),round(y-2),round(x+3),round(y+3));stamp(body.crop(box),cell,(box[0],box[1]))
                props.append({'frame':i,'hand':'right-far' if i<3 else None,'released':i==3,'position':[x,y],'angle':angle})
            elif action=='special-charge' and i>0:
                raw=[None,(715,299),(1138,157),(237,592),(681,554),(1125,735)][i];x,y=point(r,i,raw);x+=dx;y+=dy;angle=[0,0,-90,-65,180,0][i];prop=can.rotate(angle,resample=Image.Resampling.NEAREST,expand=True);stamp(prop,cell,(x-prop.width/2,y-prop.height/2));props.append({'frame':i,'hand':'right-far','position':[x,y],'angle':angle})
            frames.append(cell);attachments.append({'frame':i,'object':'objetos/andador.png','origin':origin,'scale':1,'rotation':0,'sha256':sha(OUT/'objetos/andador.png'),'layer':'behind-body' if behind else 'in-front-of-body','gripHand':'left-near' if action in ('beer-throw','low-kick') else 'right-far' if action=='walker-grab' and i>=3 else None,'rearLeftLegGrip':action=='walker-grab' and i>=3})
        outputs(folder,frames,r['fps']);save(folder/'attachments.json',attachments);save(folder/'body-offsets.json',offsets);save(folder/'props.json',props)
        entry={'skin':'maromba' if action=='walker-grab' else 'normal','action':action,'frames':r['frames'],'frameRateProposed':r['fps'],'frameWidth':512,'frameHeight':320,'columns':5,'body':f'normal/{action}-body.png','composedPreview':f'normal/{action}-composed.png','bodyOffsets':offsets,'attachments':attachments,'props':props,'source_sha256':r['source_sha256'],'status':'revisão visual, sem integração em combate'};manifests.append(entry)
    # Prévia contínua: crescimento primeiro, depois alcançar, fechar a mão e erguer.
    combined=[]
    for action in ('special-transform','walker-grab'):
        r=data(OUT/'normal'/action/'report.json');combined.extend(Image.open(OUT/'normal'/action/f'composed-{i:02}.png').convert('RGBA') for i in range(r['frames']))
    seq=OUT/'transformacao-completa';seq.mkdir(exist_ok=True);outputs(seq,combined,12)
    save(OUT/'manifest-correcoes.json',manifests)
    cards=[]
    labels={'beer-throw':'Arremesso — mão direita distante','low-kick':'Chute apoiado avançado','block-low':'Defesa baixa atrás do andador','special-charge':'Bebida — mão direita','special-transform':'Transformação — objeto imóvel','walker-grab':'Alcançar a perna, fechar e levantar'}
    for m in manifests:
        action=m['action'];rel=f'normal/{action}';cards.append(f'<article><h2>{labels[action]}</h2><img src="{rel}/composed-preview.gif"><p>{m["frames"]} quadros · {m["frameRateProposed"]} FPS propostos</p><a href="{rel}/composed-contact.png">Quadro a quadro</a></article>')
    page='<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Coxa — correções v2</title><style>body{background:#181c22;color:#eee;font:16px system-ui;margin:30px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(430px,1fr));gap:18px}article{background:#292e38;padding:15px}img{width:100%;max-width:512px;image-rendering:pixelated}a{color:#a7daff}</style><h1>Coxa — correções v2</h1><p>Direita anatômica = braço distante, à esquerda da imagem. Andador é sempre o mesmo PNG, sem escala nem deformação.</p><p>Estas quatro correções substituem as respectivas prévias v1. <a href="../coxa-rigido-v1/revisao.html">Demais ações anteriores</a>. Sem integração no jogo.</p><article><h2>Transformação + nova pegada</h2><img src="transformacao-completa/composed-preview.gif"><p>O objeto fica no chão até a mão alcançar e fechar a pegada.</p></article><main>'+''.join(cards)+'</main></html>'
    (OUT/'revisao.html').write_text(page,encoding='utf-8')
    previous=OLD/'revisao.html';oldpage=previous.read_text(encoding='utf-8')
    banner='<p style="padding:18px;background:#624716">Revisão posterior: <a href="../coxa-rigido-v2/revisao.html">arremesso, chute apoiado, defesa baixa, transformação e nova pegada corrigidos na v2</a>. As prévias antigas dessas quatro ações abaixo foram substituídas.</p>'
    if 'corrigidos na v2' not in oldpage:previous.write_text(oldpage.replace('<main>',banner+'<main>',1),encoding='utf-8')
    durations=[round(1000/18)]*10+[round(1000/12)]*6
    gifs=[]
    for cell in combined:
        bg=Image.new('RGBA',cell.size,'#333842');bg.alpha_composite(cell);gifs.append(bg.convert('RGB'))
    gifs[0].save(seq/'composed-preview.gif',save_all=True,append_images=gifs[1:],duration=durations,loop=0)
    return manifests
def deliver():
    manifests=data(OUT/'manifest-correcoes.json');DEST.mkdir(parents=True,exist_ok=True)
    for m in manifests:
        action=m['action'];target=DEST/'normal';target.mkdir(exist_ok=True);folder=OUT/'normal'/action
        for src,suffix in [('sheet.png','-body.png'),('composed-sheet.png','-composed.png'),('attachments.json','-attachments.json'),('props.json','-props.json'),('body-offsets.json','-body-offsets.json')]:shutil.copy2(folder/src,target/(action+suffix))
    (DEST/'objetos').mkdir(exist_ok=True);shutil.copy2(OUT/'objetos/andador.png',DEST/'objetos/andador.png');save(DEST/'manifest-correcoes.json',manifests)
    with zipfile.ZipFile(OUT/'coxa-correcoes-v2.zip','w',zipfile.ZIP_DEFLATED) as z:
        for p in DEST.rglob('*'):
            if p.is_file():z.write(p,p.relative_to(DEST))
    print(len(manifests),'folhas corrigidas/adicionadas,',sum(m['frames'] for m in manifests),'quadros')
if __name__=='__main__':
    import sys
    if len(sys.argv)>1 and sys.argv[1]=='deliver':deliver()
    else:rebuild()
