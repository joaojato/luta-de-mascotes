"""Composição de camadas: só translação/rotação rígida do acessório gerado."""
from PIL import Image, ImageDraw
from pathlib import Path
import json, math, hashlib, argparse, shutil, html
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/coxa-rigido-v1'
def superseded(skin,action):
    return action=='base-body' or (skin=='normal' and action in ('crouch','beer-throw','beer-throw-fixed','hit-high','jump-punch'))
def canonical(action):
    return {'crouch-backpain':'crouch','beer-throw-final':'beer-throw','hit-high-final':'hit-high','jump-punch-final':'jump-punch'}.get(action,action)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def prepare():
    folder=OUT/'objetos';folder.mkdir(parents=True,exist_ok=True)
    specs=[('upright',ROOT/'referencia/coritiba/andador-isolado-v1.png',[(430,150),(950,190),(580,620)])]
    result={}
    for name,path,points in specs:
        im=Image.open(path).convert('RGBA');box=im.getchannel('A').point(lambda x:255 if x>=100 else 0).getbbox();im=im.crop(box)
        factor=100/im.height;size=(round(im.width*factor),100);im=im.resize(size,Image.Resampling.NEAREST);dest=folder/(name+'.png');im.save(dest)
        anchors=[[(x-box[0])*factor,(y-box[1])*factor] for x,y in points]
        result[name]={'file':str(dest.relative_to(OUT)).replace('\\','/'),'size':size,'anchors':dict(zip(['handle-far','handle-near','rear-left-leg'],anchors)),'source':str(path.relative_to(ROOT)).replace('\\','/'),'source_sha256':sha(path),'sha256':sha(dest),'scale':factor,'anatomy':'quatro pernas, quatro ponteiras, dois arcos, uma barra'}
    (folder/'views.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8');return result
def map_point(report,i,point):
    rect,box=report['source_crops'][i];scale=report['scale'];w,h=report['cell'];pw=round((box[2]-box[0])*scale);ph=round((box[3]-box[1])*scale)
    px=round(w*.72)-pw;py=h-28-ph
    if report['action'] in ('jump-punch','jump-kick') or (report['action']=='jump' and i>=3):py=60
    return (px+(point[0]-rect[0]-box[0])*scale,py+(point[1]-rect[1]-box[1])*scale)
def attach(cell,obj,anchor,point,angle=0):
    # Rotaciona a imagem inteira em torno da âncora; escala fixa da vista.
    canvas=Image.new('RGBA',(400,400));origin=(200-anchor[0],200-anchor[1]);canvas.alpha_composite(obj,(round(origin[0]),round(origin[1])))
    canvas=canvas.rotate(angle,resample=Image.Resampling.NEAREST,center=(200,200))
    cell.alpha_composite(canvas,(round(point[0]-200),round(point[1]-200)))
def compose(skin,action,framespec):
    folder=OUT/skin/action;r=json.loads((folder/'report.json').read_text(encoding='utf-8'));views=json.loads((OUT/'objetos/views.json').read_text(encoding='utf-8'));n=r['frames'];w,h=r['cell'];sheet=Image.new('RGBA',(w*5,h*math.ceil(n/5)));previews=[];mapping=[]
    for i,s in enumerate(framespec):
        body=Image.open(folder/f'frame-{i:02}.png').convert('RGBA');cell=body.copy();v=views[s.get('view','upright')];obj=Image.open(OUT/v['file']).convert('RGBA');point=map_point(r,i,s['hand']) if s.get('sourceCoords',True) else tuple(s['hand']);anchor=v['anchors'][s.get('grip','handle-far')]
        if s.get('visible',True):attach(cell,obj,anchor,point,s.get('angle',0))
        # Dedos gerados sobre o tubo: recorte da própria mão, sem redesenho/deformação.
        for hp in ([] if s.get('released') else [s['hand']]+s.get('otherHands',[])):
            hx,hy=map_point(r,i,hp) if s.get('sourceCoords',True) else hp
            box=(round(hx-7),round(hy-6),round(hx+7),round(hy+6));patch=body.crop(box);cell.alpha_composite(patch,(box[0],box[1]))
        cell.save(folder/f'composed-{i:02}.png');sheet.alpha_composite(cell,((i%5)*w,(i//5)*h));bg=Image.new('RGBA',(w,h),'#333842');bg.alpha_composite(cell);previews.append(bg.convert('RGB'))
        mapping.append({'frame':i,'view':s.get('view','upright'),'grip':s.get('grip','handle-far'),'point':point,'angle':s.get('angle',0),'visible':s.get('visible',True),'handOcclusion':not s.get('released',False),'objectScale':1,'view_sha256':v['sha256']})
    sheet.save(folder/'composed-sheet.png');previews[0].save(folder/'composed-preview.gif',save_all=True,append_images=previews[1:],duration=round(1000/r['fps']),loop=0)
    bg=Image.new('RGBA',sheet.size,'#eee');bg.alpha_composite(sheet);bg.convert('RGB').save(folder/'composed-contact.png')
    (folder/'attachments.json').write_text(json.dumps(mapping,ensure_ascii=False,indent=2),encoding='utf-8')
def hand_point(im):
    box=im.getbbox();x0,y0,x1,y1=box;height=y1-y0
    candidates=[]
    for y in range(round(y0+height*.23),round(y0+height*.66)):
        for x in range(x0,x1):
            r,g,b,a=im.getpixel((x,y))
            if a>100 and r>130 and g>65 and b<r*.73 and g<r*.86:candidates.append((x,y))
    if not candidates:return (x0+8,y0+height*.5)
    xmin=min(x for x,y in candidates);edge=sorted(y for x,y in candidates if x<=xmin+8)
    return (xmin+5,edge[len(edge)//2])
def all_compose():
    prepare();count=0
    for p in sorted(OUT.glob('*/*/report.json')):
        r=json.loads(p.read_text(encoding='utf-8'));skin,action=r['skin'],r['action']
        if skin not in ('normal','maromba') or superseded(skin,action):continue
        folder=p.parent;frames=[Image.open(folder/f'frame-{i:02}.png').convert('RGBA') for i in range(r['frames'])];points=[hand_point(f) for f in frames];spec=[]
        for i,point in enumerate(points):
            grip='rear-left-leg' if skin=='maromba' or (action=='special-transform' and i>=2) else 'handle-far'
            angle=0;released=False
            if skin=='normal' and action in ('block-high','block-low','crouch-backpain','special-charge','beer-throw-final'):
                point=points[0];released=i>0
            if action=='knockdown' and i>=3:
                point=(frames[i].getbbox()[0]+25,250);grip='rear-left-leg';angle=-min(90,(i-2)*18);released=True
            if skin=='maromba' and action in ('light-punch','jump-punch') and i in (1,2,3):angle=-12
            spec.append({'hand':point,'grip':grip,'angle':angle,'sourceCoords':False,'released':released})
        compose(skin,action,spec);count+=1
    print(count,'ações compostas com o MESMO objeto rígido; escala de objeto = 1 em todos os quadros.')
def gallery(deliver=False):
    cards=[];manifest=[]
    dest=ROOT/'public/assets/lutadores/coxa/rigido-v1'
    for p in sorted(OUT.glob('*/*/attachments.json')):
        folder=p.parent;r=json.loads((folder/'report.json').read_text(encoding='utf-8'));attachments=json.loads(p.read_text(encoding='utf-8'));skin,action=r['skin'],r['action'];name=canonical(action);rel=f'{skin}/{action}'
        if superseded(skin,action):continue
        entry={'skin':skin,'action':name,'body':f'{skin}/{name}-body.png','composedPreview':f'{skin}/{name}-composed.png','frames':r['frames'],'frameRateProposed':r['fps'],'frameWidth':512,'frameHeight':320,'columns':5,'attachments':attachments,'source_sha256':r['source_sha256'],'status':'arte para revisão; sem registro de lutador nem teste em combate'};manifest.append(entry)
        cards.append(f'<article><h2>{html.escape(skin+" / "+name)}</h2><img src="{rel}/composed-preview.gif"><p>{r["frames"]} quadros · {r["fps"]} FPS propostos</p><a href="{rel}/composed-contact.png">Todos os quadros</a> · <a href="{rel}/sheet.png">Corpo transparente</a> · <a href="{rel}/attachments.json">Pegadas</a></article>')
        if deliver:
            target=dest/skin;target.mkdir(parents=True,exist_ok=True)
            for src,dst in [('sheet.png',name+'-body.png'),('composed-sheet.png',name+'-composed.png')]:
                to=target/dst
                if to.exists() and sha(to)!=sha(folder/src):raise RuntimeError(f'Destino alterado: {to}')
                shutil.copy2(folder/src,to)
    (OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    page='<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Coxa em camadas</title><style>body{background:#181c22;color:#eee;font:16px system-ui;margin:30px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(430px,1fr));gap:18px}article{background:#292e38;padding:15px;border-radius:10px}h2{font-size:18px}img{width:100%;max-width:512px;image-rendering:pixelated}a{color:#a7daff}</style><h1>Coxa — sprites em camadas</h1><p>Corpo animado + mesmo andador rígido. Prévias para revisão, sem integração de combate. Volta ao normal, pesado e rasteiro maromba ainda aguardam definição.</p><main>'+''.join(cards)+'</main></html>'
    (OUT/'revisao.html').write_text(page,encoding='utf-8')
    if deliver:
        target=dest/'objetos';target.mkdir(parents=True,exist_ok=True);shutil.copy2(OUT/'objetos/upright.png',target/'andador.png');shutil.copy2(OUT/'manifest.json',dest/'manifest-art.json')
    print(len(manifest),'folhas corporais /',sum(x['frames'] for x in manifest),'quadros')
if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('mode',choices=['prepare','compose','gallery','deliver'],default='compose',nargs='?');a=ap.parse_args()
    if a.mode=='prepare':prepare()
    elif a.mode=='compose':all_compose()
    elif a.mode=='gallery':gallery()
    else:gallery(True)
