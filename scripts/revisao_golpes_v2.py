"""Art-only punch standardization, Bira gallop and existing kick audit."""
import hashlib
import json
import math
import shutil
from pathlib import Path
from PIL import Image, ImageDraw, ImageChops, ImageFilter
from collections import deque
from urubu_meteoro import cells_from
from skins_urubu import bbox

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/revisao-golpes-v2'
ASSETS=ROOT/'public/assets/lutadores'
NAMES={'urubu':'Urubu','almirante':'Almirante','cachorro':'Bira','cartola':'Cartola','galo':'Galo','saci':'Saci'}

def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()

def component_frames(path,cols,rows,count):
    """Extract complete disconnected figures when bounds cross source grid lines."""
    im=Image.open(path).convert('RGBA');w,h=im.size
    todo={i for i,a in enumerate(im.getchannel('A').tobytes()) if a>32}
    regions=[]
    while todo:
        start=todo.pop();q=deque([start]);pixels=[]
        while q:
            p=q.popleft();pixels.append(p);x,y=p%w,p//w
            for dx,dy in [(1,0),(-1,0),(0,1),(0,-1),(1,1),(-1,-1),(1,-1),(-1,1)]:
                nx,ny=x+dx,y+dy
                if 0<=nx<w and 0<=ny<h:
                    n=ny*w+nx
                    if n in todo:todo.remove(n);q.append(n)
        if len(pixels)>1000:
            xs=[p%w for p in pixels];ys=[p//w for p in pixels]
            regions.append(((min(xs),min(ys),max(xs)+1,max(ys)+1),pixels))
    assert len(regions)==count,(str(path),len(regions),'connected figures',count)
    regions.sort(key=lambda r:(int(((r[0][1]+r[0][3])/2)/(h/rows)),(r[0][0]+r[0][2])/2))
    result=[]
    for box,pixels in regions:
        left,top,right,bottom=box;crop=im.crop(box);mask=Image.new('L',crop.size)
        ImageDraw.Draw(mask).point([(p%w-left,p//w-top) for p in pixels],fill=255)
        crop.putalpha(ImageChops.multiply(crop.getchannel('A'),mask.filter(ImageFilter.MaxFilter(3))))
        result.append(crop)
    return result
def split(path,count):
    im=Image.open(path).convert('RGBA')
    assert im.width==1280 and im.height==math.ceil(count/5)*256,(path,im.size,count)
    return [im.crop((i%5*256,i//5*256,i%5*256+256,i//5*256+256)) for i in range(count)]

def previews(id,frames,fps):
    contact=Image.new('RGB',(768,math.ceil(len(frames)/3)*280),'#26313d');d=ImageDraw.Draw(contact)
    images=[]
    for i,f in enumerate(frames):
        x,y=i%3*256,i//3*280;contact.paste(f,(x,y+24),f);d.text((x+8,y+6),str(i),fill='white')
        bg=Image.new('RGBA',(256,256),'#26313d');bg.alpha_composite(f);images.append(bg.convert('RGB'))
    contact.save(OUT/(id+'-contact.png'))
    images[0].save(OUT/(id+'-preview.gif'),save_all=True,append_images=images[1:],duration=round(1000/fps),loop=0)

def main():
    specs=json.loads((OUT/'manifest.json').read_text())
    report=[]
    for s in specs:
        if not Path(s['source']).exists():
            print('Pending',s['id']);continue
        if s['kind']=='gallop' and (OUT/'gallop-a-source.png').exists() and (OUT/'gallop-b-source.png').exists():
            figs=component_frames(OUT/'gallop-a-source.png',2,2,4)+component_frames(OUT/'gallop-b-source.png',2,2,4)
        elif s['kind']=='pounce':figs=component_frames(s['source'],s['cols'],s['rows'],s['frames'])
        else:figs=[c.crop(bbox(c)) for c in cells_from(s)]
        if s['kind']=='gallop':scale=min(228/max(f.width for f in figs),160/max(f.height for f in figs))
        else:
            standing=figs[11 if s['kind']=='pounce' else 0]
            scale=min(200/standing.height,244/max(f.width for f in figs),244/max(f.height for f in figs))
        frames=[]
        sheet=Image.new('RGBA',(1280,math.ceil(s['frames']/5)*256))
        for i,f in enumerate(figs):
            f=f.resize((round(f.width*scale),round(f.height*scale)),Image.Resampling.NEAREST)
            airborne=s['kind']=='pounce' and 2<=i<=6
            y=min(95,248-f.height) if airborne else 228-f.height
            if s['kind']=='gallop' and i in (2,3):y=min(110,218-f.height)
            cell=Image.new('RGBA',(256,256));cell.alpha_composite(f,((256-f.width)//2,y))
            b=bbox(cell);assert b and min(b[:2])>0 and max(b[2:])<256,(s['id'],i,b)
            sheet.alpha_composite(cell,(i%5*256,i//5*256));frames.append(cell)
        sheet.save(s['dest'])
        assert sheet.getchannel('A').getextrema()[0]==0
        for i in range(s['frames'],5*math.ceil(s['frames']/5)):
            assert not bbox(sheet.crop((i%5*256,i//5*256,i%5*256+256,i//5*256+256)))
        previews(s['id'],frames,s['fps'])
        report.append(dict(id=s['id'],character=s['character'],kind=s['kind'],file=s['dest'],frames=s['frames'],fps=s['fps'],frameWidth=256,frameHeight=256,columns=5,frameBoxes=[bbox(f) for f in frames],sha256=digest(Path(s['dest']))))
    catalog=[]
    for file in (ROOT/'src/game/lutadores').glob('*.json'):
        d=json.loads(file.read_text(encoding='utf-8'));id=d['id'];folder=(d.get('skins') or [{'pasta':''}])[0]['pasta'];base=ASSETS/id/folder
        actions={a['action']:a for a in d['actions']}
        light=next(s for s in specs if s['character']==id and s['kind']=='light') if id!='almirante' else None
        if light and not Path(light['dest']).exists():continue
        if id in ('urubu','galo','cartola'):
            src=base/('light-punch-v2.png' if id=='urubu' else 'light-punch.png');dest=base/'heavy-cross-v2.png'
            # Freeze original punch as a distinct heavy asset; never repoint runtime.
            shutil.copy2(src,dest)
            assert digest(src)==digest(dest)
            heavy=dict(file=str(dest),frames=actions['light-punch']['frames'],fps=12,source=str(src),copyExact=True)
        elif id=='cachorro':
            heavy=dict(file=str(base/'heavy-claw-v1.png'),frames=10,fps=12,exception='Patada preservada por resposta explicita do usuario')
        else:
            heavy_spec=next(s for s in specs if s['character']==id and s['kind']=='heavy')
            if not Path(heavy_spec['dest']).exists():continue
            heavy=dict(file=heavy_spec['dest'],frames=6,fps=12)
        a=actions['heavy-kick'];kick=dict(file=str(base/a['file']),frames=a['frames'],fps=a['frameRate'])
        oldlight=actions['light-punch']
        lightentry=dict(file=light['dest'],frames=6,fps=14) if light else dict(file=str(base/oldlight['file']),frames=oldlight['frames'],fps=oldlight['frameRate'],preserved=True)
        row=dict(character=id,label=NAMES[id],light=lightentry,heavy=heavy,kick=kick)
        for kind in ('light','heavy','kick'):
            entry=row[kind];frames=split(Path(entry['file']),entry['frames'])
            assert all(bbox(f) for f in frames),(id,kind,'empty frame')
            entry['sha256']=digest(Path(entry['file']));entry['frameBoxes']=[bbox(f) for f in frames]
            previews(id+'-'+kind,frames,entry['fps'])
        catalog.append(row)
    (OUT/'art-contract.json').write_text(json.dumps(report,indent=2))
    (OUT/'catalog.json').write_text(json.dumps(catalog,indent=2,ensure_ascii=False),encoding='utf-8')
    write_html(catalog)
    if all(Path(s['source']).exists() for s in specs):
        assert len(report)==9 and len(catalog)==6
        board=Image.new('RGB',(1024,len(catalog)*280),'#26313d');draw=ImageDraw.Draw(board)
        for row,entry in enumerate(catalog):
            for col,(kind,index,label) in enumerate([('light',1,'Leve 1'),('light',3,'Leve 2'),('heavy',4 if entry['character']=='cachorro' else 2,'Pesado'),('kick',5,'Chute')]):
                e=entry[kind];frame=split(Path(e['file']),e['frames'])[index]
                x,y=col*256,row*280;draw.text((x+6,y+5),entry['label']+' - '+label,fill='white');board.paste(frame,(x,y+24),frame)
        board.save(OUT/'comparacao.png')
        render_bira()
        print('Verified 9 generated sheets (62 frames), 3 exact heavy copies, 6 real kick sheets. No runtime changes.')
    else:print('Partial build: generated',len(report),'of',len(specs))

def write_html(catalog):
    cards=''
    for row in catalog:
        id=row['character'];cards+=f'<h2>{row["label"]}</h2><div class="grid">'
        for kind,label in [('light','Leve: dois rapidos'),('heavy','Pesado: patada' if id=='cachorro' else 'Pesado: cruzado'),('kick','Chute existente')]:
            cards+=f'<article><h3>{label}</h3><a href="{id}-{kind}-contact.png"><img src="{id}-{kind}-preview.gif"></a><p>{row[kind]["frames"]} quadros · {row[kind]["fps"]} fps</p></article>'
        cards+='</div>'
    (OUT/'revisao.html').write_text('''<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Revisao de golpes</title><style>body{max-width:1100px;margin:auto;padding:24px;background:#101721;color:#eee;font:16px system-ui}p{line-height:1.5}a{color:#a8d7ff}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px}article{background:#26313d;padding:12px;border-radius:12px}img{width:100%;image-rendering:pixelated}h3{font-size:17px}</style><h1>Leve duplo, pesado e chute</h1><p>Leve segue os dois socos do Almirante. Pesado segue o antigo leve do Urubu/Galo; Bira preserva a patada. As folhas novas aguardam integracao por Claude. Clique nas animacoes para ver os quadros.</p><h2>Bira: galope e bote com mordida</h2><p><a href="bira-previa.html">Ver corrida, salto da mordida e esquiva com pulo</a></p><div class="grid"><article><h3>Galope com suspensao</h3><img src="bira-gallop-preview.gif"></article><article><h3>Bote e mordida no ar</h3><img src="bira-pounce-preview.gif"></article></div>'''+cards+'</html>',encoding='utf-8')

def render_bira():
    base=ASSETS/'cachorro/urubu-v1'
    sheets={k:Image.open(p).convert('RGBA') for k,p in {
        'charge':base/'special-bite-charge-v1.png','run':base/'special-bounding-run-v2.png','bite':base/'special-pounce-bite-v2.png','fx':base/'bite-snap-fx-v1.png','idle':base/'idle.png','enemy':ASSETS/'urubu/frente/idle.png','jump':ASSETS/'urubu/frente/jump.png'}.items()}
    def render(t,jump=False):
        im=Image.new('RGBA',(960,540),'#26313d');d=ImageDraw.Draw(im)
        d.rectangle((0,475,960,540),fill='#1a2532');d.line((0,475,960,475),fill='#53677c')
        d.text((24,24),'PREVIA DE ARTE - '+('ESQUIVA COM PULO' if jump else 'GALOPE E BOTE COM MORDIDA'),fill='white')
        def sprite(key,f,x,y,flip=False,size=256):
            c=sheets[key].crop((f%5*256,f//5*256,f%5*256+256,f//5*256+256))
            if flip:c=c.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
            if size!=256:c=c.resize((size,size),Image.Resampling.NEAREST)
            im.alpha_composite(c,(round(x-size/2),round(y-size)))
        air=jump and .70<t<1.65
        sprite('jump' if air else 'enemy',4 if air else int(t*8)%4,700,315 if air else 500)
        if t<.36:sprite('charge',min(4,int(t/.36*5)),180,500,True)
        elif t<1.11:
            u=(t-.36)/.75;f=int((t-.36)*16)%8
            # A small world-space bound complements the suspended leg poses.
            phase=((t-.36)*2)%1;lift=20*math.sin(math.pi*phase)
            sprite('run',f,180+u*350,500-lift,True)
        elif t<1.86:
            u=(t-1.11)/.75;f=min(11,int(u*12))
            x=530+70*min(1,u/.4);lift=45*math.sin(math.pi*min(1,u/.7)) if u<.7 else 0
            sprite('bite',f,x,500-lift,True)
            if not jump and 1.20<t<1.53:sprite('fx',min(5,int((t-1.20)*18)),695,450,True,140)
        else:sprite('idle',int(t*8)%4,600,500,True)
        return im.convert('RGB')
    for jump,name in [(False,'acerto'),(True,'esquiva')]:
        frames=[render(i/25,jump).resize((640,360),Image.Resampling.NEAREST) for i in range(65)]
        frames[0].save(OUT/('bira-'+name+'.gif'),save_all=True,append_images=frames[1:],duration=40,loop=0)
    (OUT/'bira-previa.html').write_text('''<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Bira — galope e bote</title><style>body{max-width:1000px;margin:auto;padding:24px;background:#101721;color:white;font:16px system-ui}img{width:100%;image-rendering:pixelated}button{padding:12px;margin:6px}a{color:#a8d7ff}</style><h1>Bira: corrida aos saltos e mordida com pulo</h1><button onclick="document.getElementById('p').src='bira-acerto.gif'">Adversario em pe</button><button onclick="document.getElementById('p').src='bira-esquiva.gif'">Adversario pulando</button><img id="p" src="bira-acerto.gif"><p>Coreografia visual; trajetoria e esquiva reais ficam com Claude. O Bira faz galope com suspensao e salta para fechar a mordida.</p><a href="revisao.html">Todos os golpes</a></html>''',encoding='utf-8')

if __name__=='__main__':main()
