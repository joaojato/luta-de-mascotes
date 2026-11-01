"""Montagem e QA de arte gerada, sem alterar combate ou redesenhar sprites."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageChops
import argparse, hashlib, json, math, shutil, html

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/coxa-producao-v2'
DEST=ROOT/'public/assets/lutadores/coxa/animacoes-v2'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def isolate(frame):
    # Extração do componente principal; descarta somente fragmentos de células vizinhas.
    ww,hh=frame.size;data=bytearray(frame.getchannel('A').point(lambda v:255 if v>=100 else 0).tobytes());best=[]
    for start in range(len(data)):
        if not data[start]:continue
        stack=[start];data[start]=0;group=[]
        while stack:
            k=stack.pop();group.append(k);x=k%ww;y=k//ww
            for xx,yy in ((x-1,y),(x+1,y),(x,y-1),(x,y+1),(x-1,y-1),(x+1,y-1),(x-1,y+1),(x+1,y+1)):
                if 0<=xx<ww and 0<=yy<hh:
                    q=yy*ww+xx
                    if data[q]:data[q]=0;stack.append(q)
        if len(group)>len(best):best=group
    pixels=bytearray(ww*hh)
    for k in best:pixels[k]=255
    mask=Image.frombytes('L',frame.size,bytes(pixels)).filter(ImageFilter.MaxFilter(3))
    frame.putalpha(ImageChops.multiply(frame.getchannel('A'),mask))
    return frame
def locate(im,n,cols,rows):
    # Localiza figuras inteiras; evita recortar botas/penas pela grade aproximada da fonte.
    step=2
    mask=im.getchannel('A').resize((math.ceil(im.width/step),math.ceil(im.height/step)),Image.Resampling.NEAREST).point(lambda v:255 if v>=180 else 0)
    ww,hh=mask.size; data=bytearray(mask.tobytes());components=[]
    for start in range(len(data)):
        if data[start]==0:continue
        stack=[start];data[start]=0;count=0;x0=ww;y0=hh;x1=y1=0
        while stack:
            k=stack.pop();x=k%ww;y=k//ww;count+=1;x0=min(x0,x);x1=max(x1,x);y0=min(y0,y);y1=max(y1,y)
            for xx,yy in ((x-1,y),(x+1,y),(x,y-1),(x,y+1)):
                if 0<=xx<ww and 0<=yy<hh:
                    q=yy*ww+xx
                    if data[q]:data[q]=0;stack.append(q)
        if count>150:components.append((count,(max(0,x0*step-2),max(0,y0*step-2),min(im.width,(x1+1)*step+2),min(im.height,(y1+1)*step+2))))
    slots={}
    for count,b in components:
        cx=(b[0]+b[2])/2;cy=(b[1]+b[3])/2
        slot=min(rows-1,int(cy/im.height*rows))*cols+min(cols-1,int(cx/im.width*cols))
        if slot<n and (slot not in slots or count>slots[slot][0]):slots[slot]=(count,b)
    return [slots[i][1] for i in range(n)] if len(slots)==n else None
def pack(spec, source):
    folder=OUT/spec['skin']/spec['action']; folder.mkdir(parents=True,exist_ok=True)
    target=folder/'source.png'
    if target.exists() and source.resolve()!=target.resolve(): raise RuntimeError(f'Nao sobrescrever fonte: {target}')
    if source.resolve()!=target.resolve(): shutil.copy2(source,target)
    im=Image.open(target).convert('RGBA')
    n,cols,rows=spec['frames'],spec['cols'],spec['rows']
    cuts=spec.get('rects') or (None if spec.get('effect') else locate(im,n,cols,rows)) or [(round((i%cols)*im.width/cols),round((i//cols)*im.height/rows),round((i%cols+1)*im.width/cols),round((i//cols+1)*im.height/rows)) for i in range(n)]
    pieces=[]; sourceboxes=[]; warnings=[]
    for i,rect in enumerate(cuts):
        frame=im.crop(rect)
        if not spec.get('effect'):frame=isolate(frame)
        mask=frame.getchannel('A').point(lambda v:255 if v>=100 else 0)
        box=mask.getbbox()
        if box is None: raise RuntimeError(f'Quadro vazio {i}')
        if (rect[0]==0 and box[0]<=1) or (rect[1]==0 and box[1]<=1) or (rect[2]==im.width and box[2]>=frame.width-1) or (rect[3]==im.height and box[3]>=frame.height-1): warnings.append(f'Inspecionar borda externa fonte no quadro {i}')
        box=(max(0,box[0]-2),max(0,box[1]-2),min(frame.width,box[2]+2),min(frame.height,box[3]+2))
        pieces.append(frame.crop(box));sourceboxes.append([rect,box])
    targetheight=spec.get('targetheight',200)
    scale=targetheight/max(x.height for x in pieces)
    w,h=spec.get('cell',[512,320]);sheet=Image.new('RGBA',(w*5,h*math.ceil(n/5)))
    previews=[];boxes=[]
    for i,piece in enumerate(pieces):
        piece=piece.resize((max(1,round(piece.width*scale)),max(1,round(piece.height*scale))),Image.Resampling.NEAREST)
        cell=Image.new('RGBA',(w,h))
        # Mesma escala em todos os quadros. O alinhamento ancora o apoio da pose.
        px=round(w*.72)-piece.width; py=h-28-piece.height
        if spec.get('align')=='center': px=(w-piece.width)//2
        if spec.get('effect'): py=(h-piece.height)//2
        if spec.get('air'): py=50
        if spec['action'] in ('jump-punch','jump-kick') or (spec['action']=='jump' and i>=3):py=60
        if px<0 or py<0: raise RuntimeError('Sprite maior que celula')
        cell.alpha_composite(piece,(px,py))
        cell.save(folder/f'frame-{i:02}.png')
        sheet.alpha_composite(cell,((i%5)*w,(i//5)*h))
        boxes.append(cell.getbbox())
        bg=Image.new('RGBA',cell.size,(47,50,57,255));bg.alpha_composite(cell);previews.append(bg.convert('RGB'))
    sheet.save(folder/'sheet.png')
    previews[0].save(folder/'preview.gif',save_all=True,append_images=previews[1:],duration=round(1000/spec['fps']),loop=0)
    contact=Image.new('RGB',sheet.size,'#eeeeee');contact.paste(sheet,mask=sheet.getchannel('A'));contact.save(folder/'contact.png')
    refs=[{'path':p,'sha256':sha(ROOT/p)} for p in spec.get('refs',[]) if (ROOT/p).exists()]
    report={**spec,'source':str(target.relative_to(ROOT)),'source_sha256':sha(target),'references':refs,'cell':[w,h],'columns':5,'scale':scale,'boxes':boxes,'source_crops':sourceboxes,'warnings':warnings,'status':'gerada; revisao visual local, sem aprovacao do usuario nem teste em combate'}
    (folder/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    (folder/'prompt.txt').write_text(spec['prompt'],encoding='utf-8')
    print(json.dumps({'skin':spec['skin'],'action':spec['action'],'frames':n,'sourceSize':im.size,'warnings':warnings,'contact':str(folder/'contact.png')},ensure_ascii=False))

def gallery():
    reports=[]
    for p in sorted(OUT.glob('*/*/report.json')):
        r=json.loads(p.read_text(encoding='utf-8'));reports.append(r)
    cards=[]
    for r in reports:
        rel=f"{r['skin']}/{r['action']}";label=html.escape(rel)
        cards.append(f'<article><h2>{label}</h2><img src="{rel}/preview.gif"><p>{r["frames"]} quadros · {r["fps"]} FPS propostos · célula {r["cell"]}</p><a href="{rel}/contact.png">Quadros em fundo claro</a> · <a href="{rel}/sheet.png">PNG transparente</a><p>{html.escape(r.get("review",""))}</p></article>')
    page='<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Coxa — revisão de animações</title><style>body{background:#171a20;color:#eee;font:16px system-ui;margin:30px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(430px,1fr));gap:20px}article{background:#252a34;padding:16px;border-radius:10px}img{width:100%;max-width:512px;image-rendering:pixelated}a{color:#9fd4ff}h2{font-size:18px}</style><h1>Coxa — animações por versão</h1><p>Fontes individuais geradas com image_gen. FPS propostos; sem registro no jogo. Confira estrutura do andador, membros, cores e escala. Transformação reversa permanece pendente.</p><main>'+''.join(cards)+'</main></html>'
    (OUT/'revisao.html').write_text(page,encoding='utf-8')
    (OUT/'manifest.json').write_text(json.dumps(reports,ensure_ascii=False,indent=2),encoding='utf-8')
    print(f'{len(reports)} folhas / {sum(r["frames"] for r in reports)} quadros')

if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('mode',choices=['import','gallery','deliver']);ap.add_argument('--spec');ap.add_argument('--source');ap.add_argument('--out');a=ap.parse_args()
    if a.out:OUT=ROOT/a.out
    OUT.mkdir(parents=True,exist_ok=True)
    if a.mode=='import':
        src=Path(a.source) if a.source else max((Path.home()/'.codex/generated_images').rglob('*.png'),key=lambda p:p.stat().st_mtime)
        pack(json.loads(Path(a.spec).read_text(encoding='utf-8')),src)
    elif a.mode=='gallery': gallery()
    else:
        for p in OUT.glob('*/*/report.json'):
            r=json.loads(p.read_text(encoding='utf-8'));dest=DEST/r['skin'];dest.mkdir(parents=True,exist_ok=True)
            target=dest/(r['action']+'.png')
            if target.exists() and sha(target)!=sha(p.parent/'sheet.png'): raise RuntimeError(f'Destino ja existe: {target}')
            shutil.copy2(p.parent/'sheet.png',target)
        gallery()
