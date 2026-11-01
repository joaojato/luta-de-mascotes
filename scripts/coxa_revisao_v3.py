"""Montagem de corpos gerados e andador imutável; sem deformação anatômica."""
from pathlib import Path
from PIL import Image
import json, math, shutil, hashlib, zipfile
from coxa_revisao_v2 import point, outputs
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'output/coxa-rigido-v3';DEST=ROOT/'public/assets/lutadores/coxa/rigido-v3';OLD=ROOT/'output/coxa-rigido-v1'
def data(p):return json.loads(p.read_text(encoding='utf-8'))
def save(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2),encoding='utf-8')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def put(im,src,xy):im.alpha_composite(src,tuple(round(v) for v in xy))
BEER_FAR=[(137,239),(512,238),(893,240),(1275,239),(1697,239),(117,619),(527,619),(923,619),(1272,619),(1699,619)]
BEER_CAN={3:(1404,214),4:(1804,131),5:(245,485),6:(411,520)}
KICK_NEAR=[(233,222),(576,236),(949,262),(1378,259),(320,592),(660,587),(1012,588),(1418,607),(403,933),(711,925),(1036,938),(1354,921)]
TRANS_FAR=[(89,216),(441,241),(805,268),(1170,277),(86,632),(454,632),(795,619),(1135,609),(67,964),(425,930),(760,892),(1114,880)]
TRANS_NEAR=[(203,198),(567,196),(931,204),(1294,200),(222,550),(594,553),(953,550),(1318,550),(222,909),(584,905),(947,863),(1310,862)]
def build():
    objdir=OUT/'objetos';objdir.mkdir(exist_ok=True);shutil.copy2(OLD/'objetos/upright.png',objdir/'andador.png');obj=Image.open(objdir/'andador.png').convert('RGBA');objhash=sha(objdir/'andador.png')
    can=Image.open(OLD/'efeitos/beer-can/frame-00.png').convert('RGBA');can=can.crop(can.getbbox())
    manifest=[]
    for action,source_action in [('beer-throw','beer-throw'),('low-kick','low-kick'),('special-transform','special-transform-fit')]:
        folder=OUT/'normal'/source_action;r=data(folder/'report.json');n=r['frames'];frames=[];bodies=[];attachments=[];props=[];offsets=[];lastshift=0
        for i in range(n):
            original=Image.open(folder/f'frame-{i:02}.png').convert('RGBA');origin=(217,192);shift=(0,0);fingers=[];layer='front';grip=None;griplocal=None
            if action=='beer-throw':
                far=point(r,i,BEER_FAR[i]);shift=(246-far[0],198-far[1]);grip='right-far-support'
                if i!=7:fingers=[(246,198)]
            elif action=='low-kick':
                near=point(r,i,KICK_NEAR[i]);hand_y=[198,205,216,219,219,219,219,219,219,219,207,198][i]
                shift=(309-near[0],hand_y-near[1]);fingers=[(309,hand_y)];grip='left-near-support';griplocal=(92,hand_y-192)
                if i>=3 and i<=10:layer='behind'
            else:
                far=point(r,i,TRANS_FAR[i]);near=point(r,i,TRANS_NEAR[i])
                if i<5:
                    shift=(309-near[0],198-near[1]);fingers=[(309,198)];grip='left-near-support'
                elif i<=8:
                    shift=(261-far[0],0);lastshift=shift[0];fingers=[(261,far[1])];grip='right-far-rear-left-leg';griplocal=(44,far[1]-192)
                else:
                    shift=(lastshift,0);hp=(far[0]+lastshift,far[1]);anchor=(44,point(r,8,TRANS_FAR[8])[1]-192);origin=(hp[0]-anchor[0],hp[1]-anchor[1]);fingers=[hp];grip='right-far-rear-left-leg';griplocal=anchor
            dx,dy=round(shift[0]),round(shift[1]);offsets.append([dx,dy]);body=Image.new('RGBA',(512,320));put(body,original,(dx,dy));bodies.append(body);cell=Image.new('RGBA',body.size)
            walker_layer=Image.new('RGBA',body.size);put(walker_layer,obj,origin);walker_layer.save(folder/f'walker-layer-{i:02}.png')
            if layer=='behind':put(cell,obj,origin);cell.alpha_composite(body)
            else:cell.alpha_composite(body);put(cell,obj,origin)
            for x,y in fingers:
                box=(round(x-5),round(y-5),round(x+5),round(y+5));put(cell,body.crop(box),(box[0],box[1]))
            if action=='beer-throw' and i in BEER_CAN:
                x,y=point(r,i,BEER_CAN[i]);x+=dx;y+=dy
                if i==6:x-=14;y-=4
                angle={3:0,4:-15,5:-45,6:-65}[i];prop=can.rotate(angle,resample=Image.Resampling.NEAREST,expand=True);put(cell,prop,(x-prop.width/2,y-prop.height/2))
                if i<6:
                    box=(round(x-2),round(y-2),round(x+3),round(y+3));put(cell,body.crop(box),(box[0],box[1]))
                props.append({'frame':i,'object':'beer-can','hand':'left-near' if i<6 else None,'released':i==6,'center':[x,y],'angle':angle})
            frames.append(cell);attachments.append({'frame':i,'object':'objetos/andador.png','origin':[round(v,3) for v in origin],'scale':1,'rotation':0,'sha256':objhash,'layer':layer,'grip':grip,'gripLocal':griplocal,'fingersOverlay':fingers})
        outputs(folder,frames,r['fps']);bs=Image.new('RGBA',(2560,320*math.ceil(n/5)))
        for i,body in enumerate(bodies):body.save(folder/f'aligned-body-{i:02}.png');put(bs,body,((i%5)*512,(i//5)*320))
        bs.save(folder/'aligned-body-sheet.png');save(folder/'attachments.json',attachments);save(folder/'props.json',props);save(folder/'body-offsets.json',offsets)
        m={'action':action,'sourceAction':source_action,'frames':n,'fpsProposed':r['fps'],'cell':[512,320],'columns':5,'body':f'normal/{action}-body.png','composed':f'normal/{action}-composed.png','attachments':attachments,'props':props,'source_sha256':r['source_sha256'],'references':r['references'],'status':'arte revisada localmente; aguarda revisão do usuário e integração em combate'};manifest.append(m)
    save(OUT/'manifest.json',manifest)
    labels={'beer-throw':'Esquerda: apoio → bolso → retirada → arremesso','low-kick':'Duas mãos apoiadas → preparação → voadora apoiada → repouso','special-transform':'Crescer enquanto alcança e pega a perna → levantar'}
    cards=[]
    for m in manifest:
        rel='normal/'+m['sourceAction'];cards.append(f'<article><h2>{labels[m["action"]]}</h2><img src="{rel}/composed-preview.gif"><p>{m["frames"]} quadros · {m["fpsProposed"]} FPS propostos</p><a href="{rel}/composed-contact.png">Todos os quadros com andador</a> · <a href="{rel}/composed-sheet.png">PNG transparente montado</a></article>')
    page='<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Coxa — revisão v3</title><style>body{background:#181c22;color:#eee;font:16px system-ui;margin:30px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(470px,1fr));gap:18px}article{background:#292e38;padding:16px}img{width:100%;max-width:768px;image-rendering:pixelated}a{color:#a7daff}h2{font-size:19px}</style><h1>Coxa — revisão v3 com andador</h1><p>Esquerda anatômica = braço próximo da câmera, à direita da imagem. A retirada do bolso aparece antes do lançamento. A transformação já contém o alcance e a pegada durante o crescimento.</p><p>Andador composto do mesmo PNG imutável em todos os quadros. As prévias podem ocultar partes por sobreposição do corpo; não há peças removidas ou redesenhadas.</p><main>'+''.join(cards)+'</main></html>'
    (OUT/'revisao.html').write_text(page,encoding='utf-8')
    for m in manifest:
        folder=OUT/'normal'/m['sourceAction'];previews=[]
        for i in range(m['frames']):
            cell=Image.open(folder/f'composed-{i:02}.png').convert('RGBA');bg=Image.new('RGBA',cell.size,'#333842');bg.alpha_composite(cell);previews.append(bg.convert('RGB'))
        durations=[round(1000/m['fpsProposed'])]*m['frames'];durations[0]=300;durations[-1]=800 if m['action']=='special-transform' else 300
        previews[0].save(folder/'composed-preview.gif',save_all=True,append_images=previews[1:],duration=durations,loop=0)
    print('Montadas três ações:',sum(m['frames'] for m in manifest),'quadros com andador.')
def deliver():
    ms=data(OUT/'manifest.json');DEST.mkdir(parents=True,exist_ok=True)
    for m in ms:
        folder=OUT/'normal'/m['sourceAction'];target=DEST/'normal';target.mkdir(exist_ok=True)
        for src,end in [('aligned-body-sheet.png','-body.png'),('composed-sheet.png','-composed.png'),('attachments.json','-attachments.json'),('props.json','-props.json')]:shutil.copy2(folder/src,target/(m['action']+end))
    (DEST/'objetos').mkdir(exist_ok=True);shutil.copy2(OUT/'objetos/andador.png',DEST/'objetos/andador.png');save(DEST/'manifest-art.json',ms)
    for name in ('beer-can','beer-drops'):
        target=DEST/'efeitos';target.mkdir(exist_ok=True);shutil.copy2(OLD/'efeitos'/name/'sheet.png',target/(name+'.png'))
    with zipfile.ZipFile(OUT/'coxa-revisao-v3.zip','w',zipfile.ZIP_DEFLATED) as z:
        for p in DEST.rglob('*'):
            if p.is_file():z.write(p,p.relative_to(DEST))
    print('Entregue:',DEST)
if __name__=='__main__':
    import sys
    if len(sys.argv)>1 and sys.argv[1]=='deliver':deliver()
    else:build()
