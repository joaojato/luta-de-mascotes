"""Pack Bahia's separately image-generated actions; no combat registration."""
import argparse
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps
from movimentos_v10 import extract, bounds

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/bahia-v11'
DEST=ROOT/'public/assets/lutadores/bahia/base'
SOURCES={'heavy-punch':'heavy-punch-isolated-source.png',
         'heavy-kick':'eye-laser-source.png', 'special':'special-source.png',
         'special-charge':'special-charge-source.png'}
FPS={'heavy-punch':14,'heavy-kick':14,'special':12,'special-charge':12}


def belt_center(im):
    b=bounds(im)
    pixels=im.load()
    points=[]
    for y in range(round(b[1]+(b[3]-b[1])*.36),round(b[1]+(b[3]-b[1])*.68)):
        for x in range(b[0],b[2]):
            r,g,bl,a=pixels[x,y]
            if a>128 and min(r,g,bl)>170 and max(r,g,bl)-min(r,g,bl)<55:
                points.append((x,y))
    assert points, 'No white belt'
    top=min(y for x,y in points)
    points=[(x,y) for x,y in points if y<top+(b[3]-b[1])*.045]
    return sum(x for x,y in points)/len(points),sum(y for x,y in points)/len(points)


def rebuild_review():
    reports=[json.loads(p.read_text(encoding='utf-8')) for p in OUT.glob('*-report.json')]
    (OUT/'report.json').write_text(json.dumps(reports,indent=2),encoding='utf-8')
    cards=[]
    for r in reports:
        name=r['action']
        if r['kind']=='body':
            cards.append(f'<article><h2>{name}</h2><img class="sprite" src="{name}-preview.gif">'
                         f'<a href="{name}-contact.png">Guarda e todos os quadros</a></article>')
        else:
            cards.append(f'<article><h2>{name}</h2><img class="effect" src="{name}-packed.png"></article>')
    (OUT/'revisao.html').write_text(
        '<!doctype html><meta charset="utf-8"><title>Bahia — golpes próprios</title>'
        '<style>body{background:#28333f;color:white;font:16px system-ui;padding:24px}'
        'article{display:inline-block;padding:20px;vertical-align:top}img{display:block;image-rendering:pixelated}'
        '.sprite{width:256px}.effect{max-width:700px}a{color:#bde3ff}</style>'
        '<h1>Bahia — golpes próprios</h1><p>Base v1. Guarda fofa; ataques muito bravos. '
        'Artes ainda dependem da integração pelo responsável pela lógica.</p>'
        '<h2>Expressões ampliadas</h2><img class="effect" src="expressions.png">'
        +''.join(cards),encoding='utf-8')


def install(packed, target, apply):
    if not apply:
        return
    target.parent.mkdir(parents=True,exist_ok=True)
    if target.exists():
        assert target.read_bytes()==packed.read_bytes(), ('Existing asset differs',target)
    target.write_bytes(packed.read_bytes())


def body(action,apply):
    source_path=OUT/SOURCES[action]
    source=Image.open(source_path).convert('RGBA')
    crops=extract(source,4 if action=='special-charge' else 6)
    scale_guard=crops[0]
    override=None
    if action=='heavy-kick' and (OUT/'eye-laser-frame3-source.png').exists():
        override_path=OUT/'eye-laser-frame3-source.png'
        single=Image.open(override_path).convert('RGBA')
        sb=bounds(single)
        assert sb[0]>1 and sb[1]>1 and sb[2]<single.width-1 and sb[3]<single.height-1
        single=single.crop(sb)
        source_height=bounds(crops[0])[3]-bounds(crops[0])[1]
        factor=source_height/single.height
        crops[3]=single.resize((round(single.width*factor),round(single.height*factor)),Image.Resampling.NEAREST)
        override={'frame':3,'file':override_path.relative_to(ROOT).as_posix(),
                  'sha256':hashlib.sha256(override_path.read_bytes()).hexdigest(),
                  'sourceResolutionNormalization':factor}
    guard=Image.open(OUT/'guard.png').convert('RGBA')
    gb=bounds(guard);cb=bounds(scale_guard)
    scale=(gb[3]-gb[1])/(cb[3]-cb[1])
    if action=='special':
        # The inhalation is a separate action; begin emission already shouting.
        crops=crops[1:]
    count=len(crops)
    guard_indices=[count-1] if action=='special' else [0] if action=='special-charge' else [0,count-1]
    target_belt=belt_center(guard)
    frames=[];placements=[]
    for i,crop in enumerate(crops):
        crop.save(OUT/f'{action}-extracted-{i}.png')
        cut=crop.crop(bounds(crop))
        cut=cut.resize((round(cut.width*scale),round(cut.height*scale)),Image.Resampling.NEAREST)
        belt=belt_center(cut)
        x,y=round(target_belt[0]-belt[0]),round(target_belt[1]-belt[1])
        assert x>=2 and y>=2 and x+cut.width<=254 and y+cut.height<=254,(action,i,x,y,cut.size)
        frame=Image.new('RGBA',(256,256));frame.alpha_composite(cut,(x,y))
        if i in guard_indices:
            frame=guard.copy()
        frames.append(frame);placements.append({'x':x,'y':y,'belt':belt_center(frame)})
    sheet=Image.new('RGBA',(1280,256*((count+4)//5)))
    contact=Image.new('RGB',((count+1)*256,280),'#29343f')
    draw=ImageDraw.Draw(contact)
    contact.paste(guard,(0,24),guard);draw.text((8,5),'base v1',fill='white')
    gifs=[]
    for i,f in enumerate(frames):
        sheet.alpha_composite(f,((i%5)*256,(i//5)*256))
        contact.paste(f,((i+1)*256,24),f);draw.text(((i+1)*256+8,5),str(i),fill='white')
        bg=Image.new('RGB',(256,256),'#29343f');bg.paste(f,(0,0),f);gifs.append(bg)
    packed=OUT/f'{action}-packed.png';sheet.save(packed)
    contact.save(OUT/f'{action}-contact.png')
    gifs[0].save(OUT/f'{action}-preview.gif',save_all=True,append_images=gifs[1:],
                 duration=round(1000/FPS[action]),loop=0)
    target=DEST/f'{action}.png'
    install(packed,target,apply)
    report={'action':action,'kind':'body','file':target.relative_to(ROOT).as_posix(),
            'frames':count,'frameWidth':256,'frameHeight':256,'columns':5,'frameRateProposed':FPS[action],
            'repeat':0,'source':source_path.relative_to(ROOT).as_posix(),
            'sourceSha256':hashlib.sha256(source_path.read_bytes()).hexdigest(),
            'sha256':hashlib.sha256(packed.read_bytes()).hexdigest(),'frameBoxes':[bounds(f) for f in frames],
            'scale':scale,'placements':placements,'guardFrameIndices':guard_indices,
            'expression':('last cute; preceding poses shouting/angry' if action=='special' else
                          '0 cute; 1-3 extremely angry' if action=='special-charge' else
                          '0/5 cute; 1-4 extremely angry'),'applied':apply,
            'redrawnFrame':override,
            'runtimeRegistered':False,'combatIntegration':'pending logic owner'}
    (OUT/f'{action}-report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    rebuild_review()
    print(action, 'applied' if apply else 'preview')


def effect(name,apply):
    source_path=OUT/f'{name}-source.png'
    source=Image.open(source_path).convert('RGBA')
    cut=source.crop(bounds(source))
    dims=(768,256) if name=='bora-bahea-projectile' else (256,256)
    limit=(736,208) if dims[0]==768 else (240,80)
    cut=ImageOps.contain(cut,limit,Image.Resampling.NEAREST)
    packed_im=Image.new('RGBA',dims);packed_im.alpha_composite(cut,((dims[0]-cut.width)//2,(dims[1]-cut.height)//2))
    packed=OUT/f'{name}-packed.png';packed_im.save(packed)
    target=DEST/f'{name}.png';install(packed,target,apply)
    report={'action':name,'kind':'effect','file':target.relative_to(ROOT).as_posix(),
            'size':dims,'frames':1,'visualBox':bounds(packed_im),'source':source_path.relative_to(ROOT).as_posix(),
            'sourceSha256':hashlib.sha256(source_path.read_bytes()).hexdigest(),
            'sha256':hashlib.sha256(packed.read_bytes()).hexdigest(),'applied':apply,
            'runtimeRegistered':False}
    (OUT/f'{name}-report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    rebuild_review();print(name,'applied' if apply else 'preview')


if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('action',choices=list(SOURCES)+['bora-bahea-projectile','eye-laser-projectile'])
    p.add_argument('--apply',action='store_true');args=p.parse_args()
    if args.action in SOURCES:
        body(args.action,args.apply)
    else:
        effect(args.action,args.apply)
