"""Revisão do conjunto a partir do andador e da postura v9."""
from pathlib import Path
from PIL import Image
import json, math, shutil, hashlib
from coxa_revisao_v2 import point,outputs
from coxa_rigido_v1 import map_point,hand_point
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'output/coxa-v4';OLD=ROOT/'output/coxa-rigido-v1'
def data(p):return json.loads(p.read_text(encoding='utf-8'))
def save(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2),encoding='utf-8')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def hand(im,extended=False):
    # Proposta de âncora na mão distante; a composição resultante é revista visualmente.
    b=im.getbbox();x0,y0,x1,y1=b;h=y1-y0;w=x1-x0;pix=im.load();seen=set();groups=[]
    def skin(x,y):
        r,g,bb,a=pix[x,y];return a>100 and r>130 and g>60 and bb<r*.72 and g<r*.86
    for y in range(y0,y1):
        for x in range(x0,x1):
            if (x,y) in seen or not skin(x,y):continue
            todo=[(x,y)];seen.add((x,y));group=[]
            while todo:
                xx,yy=todo.pop();group.append((xx,yy))
                for nx,ny in ((xx-1,yy),(xx+1,yy),(xx,yy-1),(xx,yy+1)):
                    if x0<=nx<x1 and y0<=ny<y1 and (nx,ny) not in seen and skin(nx,ny):seen.add((nx,ny));todo.append((nx,ny))
            if len(group)<18:continue
            gx0=min(p[0] for p in group);gy0=min(p[1] for p in group);gy1=max(p[1] for p in group)
            if y0+h*.25<gy0<y0+h*.52 and gx0<x0+w*.55 and gy1-gy0>h*.07:groups.append((gy0,gx0,group))
    if not groups:return (x0+8,y0+h*.62)
    group=min(groups,key=lambda g:(g[1],g[0]))[2]
    if extended:
        low=min(x for x,y in group);edge=[p for p in group if p[0]<low+7]
    else:
        bottom=max(y for x,y in group);edge=[p for p in group if p[1]>bottom-6]
    return (sum(x for x,y in edge)/len(edge),sum(y for x,y in edge)/len(edge))
def put(im,src,xy):im.alpha_composite(src,tuple(round(v) for v in xy))
def object_layer(obj,anchor,p,angle):
    canvas=Image.new('RGBA',(400,400));put(canvas,obj,(200-anchor[0],200-anchor[1]));canvas=canvas.rotate(angle,resample=Image.Resampling.NEAREST,center=(200,200));layer=Image.new('RGBA',(512,320));put(layer,canvas,(p[0]-200,p[1]-200));return layer
LIGHT_FAR=[(158,216),(531,178),(883,121),(1180,146),(1669,122),(63,522),(523,507),(915,615),(1302,615),(1701,614)]
LIGHT_NEAR=[(247,216),(619,196),(964,189),(1236,205),(1753,191),(109,577),(602,571),(999,615),(1376,615),(1784,614)]
def compose():
    objdir=OUT/'objetos';objdir.mkdir(exist_ok=True);shutil.copy2(OLD/'objetos/upright.png',objdir/'andador.png');obj=Image.open(objdir/'andador.png').convert('RGBA');digest=sha(objdir/'andador.png');manifest=[]
    side=Image.open(OUT/'andador-side-topology-source.png').convert('RGBA');sb=side.getbbox();side=side.crop(sb);sf=110/side.width;side=side.resize((110,round(side.height*sf)),Image.Resampling.NEAREST);side.save(objdir/'andador-lateral.png');sidehash=sha(objdir/'andador-lateral.png');sideanchor=((470-sb[0])*sf,(560-sb[1])*sf)
    for p in sorted(OUT.glob('*/*/report.json')):
        r=data(p);skin,action=r['skin'],r['action'];folder=p.parent;frames=[];attachments=[]
        if skin not in ('normal','maromba'):continue
        if skin=='maromba' and action=='heavy-kick' and (OUT/'maromba/heavy-kick-low/report.json').exists():continue
        if skin=='normal' and action in ('special-transform','special-transform-b2') and (OUT/'normal/special-transform-final/report.json').exists():continue
        source_action=action
        if action=='heavy-kick-low':action='heavy-kick'
        if action=='special-transform-final':action='special-transform'
        if r.get('reuseComposite'):
            old=data(folder/'attachments.json');normalized=[]
            for i,a in enumerate(old):
                if 'origin' in a:
                    layer=Image.new('RGBA',(512,320));put(layer,obj,a['origin'])
                else:
                    views=data(OLD/'objetos/views.json');local=views.get(a.get('view','upright'),views['upright'])['anchors'][a.get('grip','handle-far')];layer=object_layer(obj,local,a['point'],a.get('angle',0))
                layer.save(folder/f'walker-layer-{i:02}.png');normalized.append({**a,'view':'andador.png','scale':1,'object_sha256':digest,'reusedMountedSource':r['reused_body_source']})
            save(folder/'attachments.json',normalized);manifest.append({'skin':skin,'action':action,'sourceAction':source_action,'frames':r['frames'],'fpsProposed':r['fps'],'cell':[512,320],'columns':5,'source_sha256':r['source_sha256'],'attachments':normalized,'reusedComposite':True});continue
        aligned=[]
        for i in range(r['frames']):
            body=Image.open(folder/f'frame-{i:02}.png').convert('RGBA');angle=0;using_side=skin=='maromba';anchor=sideanchor if using_side else (29.4,3.7);hp=hand(body,skin=='normal');other=[];released=False;hand_patches=None;real_hand=None
            if skin=='normal' and action=='jump' and i==1:
                shifted=Image.new('RGBA',body.size);put(shifted,body,(0,-12));body=shifted
            if skin=='normal':hp=hand_point(body)
            if skin=='normal' and action=='light-punch':
                hp=point(r,i,LIGHT_FAR[i]);near=point(r,i,LIGHT_NEAR[i]);vx,vy=near[0]-hp[0],near[1]-hp[1];distance=math.hypot(vx,vy);fx=max(24,min(42,80-distance));anchor=(fx,5);angle=-math.degrees(math.atan2(vy,vx));other=[near]
            elif skin=='normal' and action=='heavy-punch':
                hp=map_point(r,i,[(164,285),(664,287),(1166,299),(199,782),(664,781),(1162,782)][i]);other=[map_point(r,i,[(333,291),(814,293),(1329,290),(346,771),(815,785),(1322,782)][i])]
            elif skin=='maromba' and action in ('light-punch','jump-punch') and i in (1,2,3):hp=hand(body,True)
            if skin=='maromba' and action=='jump-punch':hp=map_point(r,i,[(126,336),(681,212),(1057,182),(172,794),(619,829)][i])
            if skin=='maromba' and action=='knockdown' and i>=5:
                hp=[(230,240),(190,260),(150,271),(150,271),(150,271)][i-5];released=True
            if skin=='normal' and action=='knockdown' and i>=3:
                hp=[(210,220),(180,230),(150,232),(140,232),(140,232),(140,232),(140,232)][i-3];anchor=(44,24);angle=[-25,-50,-75,-90,-90,-90,-90][i-3];released=True
            if skin=='normal' and action=='special-transform':
                if i<6:
                    actual=hp;target=(246+i*3,198+i*3.6);dx,dy=target[0]-actual[0],target[1]-actual[1];shifted=Image.new('RGBA',body.size);put(shifted,body,(dx,dy));body=shifted
                    near_raw=[(230,183),(610,180),(993,176),(1370,180),(231,520),(612,520)][i];near=map_point(r,i,near_raw);near=(near[0]+dx,near[1]+dy);hp=(217,192);anchor=(0,0);real_hand=target;other=[near];hand_patches=[target,near]
                else:
                    using_side=True;anchor=sideanchor;hp=hand(body);angle=[-30,-15,-5,0,0,0][i-6];real_hand=hp
            hidden_grip=skin=='maromba' and source_action=='heavy-kick-low' and i in (1,2,3,4,5)
            if hidden_grip:hp=(260,210)
            layer=object_layer(side if using_side else obj,anchor,hp,angle);cell=body.copy();aligned.append(body)
            if hidden_grip:cell=layer.copy();cell.alpha_composite(body)
            else:cell.alpha_composite(layer)
            # Tubo diante da palma; restituir apenas duas faixas dos dedos nas bordas.
            for hx,hy in ([] if released or hidden_grip else hand_patches if hand_patches is not None else [hp]+other):
                for box in [(round(hx-6),round(hy-5),round(hx-2),round(hy+5)),(round(hx+2),round(hy-5),round(hx+6),round(hy+5))]:put(cell,body.crop(box),(box[0],box[1]))
            frames.append(cell);layer.save(folder/f'walker-layer-{i:02}.png');attachments.append({'frame':i,'view':'andador-lateral.png' if using_side else 'andador.png','anchorLocal':anchor,'socketPoint':hp,'hand':None if released else real_hand or hp,'released':released,'hiddenGrip':hidden_grip,'otherHand':other,'angle':angle,'scale':1,'object_sha256':sidehash if using_side else digest,'orientation':'curvas à esquerda / pernas à direita' if using_side else 'pés lideram as estocadas' if action=='light-punch' else 'vertical'})
        body_sheet=Image.new('RGBA',(2560,320*math.ceil(r['frames']/5)))
        for i,b in enumerate(aligned):put(body_sheet,b,((i%5)*512,(i//5)*320))
        body_sheet.save(folder/'aligned-body-sheet.png')
        outputs(folder,frames,r['fps']);save(folder/'attachments.json',attachments);manifest.append({'skin':skin,'action':action,'sourceAction':source_action,'frames':r['frames'],'fpsProposed':r['fps'],'cell':[512,320],'columns':5,'source_sha256':r['source_sha256'],'attachments':attachments})
    save(OUT/'manifest.json',manifest)
    cards=[]
    for m in manifest:
        rel=f'{m["skin"]}/{m["sourceAction"]}';cards.append(f'<article><h2>{m["skin"]}/{m["action"]}</h2><img src="{rel}/composed-preview.gif"><p>{m["frames"]} quadros</p><a href="{rel}/composed-contact.png">Todos os quadros montados</a></article>')
    (OUT/'revisao.html').write_text('<!doctype html><meta charset="utf-8"><title>Coxa v4</title><style>body{background:#181c22;color:white;font:16px system-ui;margin:30px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(440px,1fr));gap:16px}article{background:#292e38;padding:16px}img{width:100%;image-rendering:pixelated}a{color:#a7daff}</style><h1>Coxa — revisão do conjunto v4</h1><p>Andador rígido em todas as prévias. Maromba segue o transporte baixo e de lado da base v9. Produção em revisão, sem integração de combate.</p><main>'+''.join(cards)+'</main>',encoding='utf-8')
    print(len(manifest),'ações montadas /',sum(m['frames'] for m in manifest),'quadros')
if __name__=='__main__':compose()
