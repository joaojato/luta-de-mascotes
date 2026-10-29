"""Pack individually image-generated Bahia actions; never draw or deform poses."""
import argparse
import hashlib
import json
import shutil
from pathlib import Path
from PIL import Image, ImageDraw
from movimentos_v10 import extract, bounds


def belt_center(im):
    """Find the dense white waist band, ignoring single pale outline pixels."""
    b=bounds(im);height=b[3]-b[1];rows={}
    for y in range(round(b[1]+height*.35),round(b[1]+height*.68)):
        pts=[]
        for x in range(b[0],b[2]):
            r,g,bl,a=im.getpixel((x,y))
            if a>160 and min(r,g,bl)>195 and max(r,g,bl)-min(r,g,bl)<30:
                pts.append(x)
        rows[y]=pts
    peak=max(rows,key=lambda y:len(rows[y]))
    assert len(rows[peak])>=3,'No visible belt'
    points=[(x,y) for y,xs in rows.items() if abs(y-peak)<max(2,height*.022)
            and len(xs)>=len(rows[peak])*.45 for x in xs]
    return sum(x for x,y in points)/len(points),sum(y for x,y in points)/len(points)


def head_top(im):
    skin=[]
    for y in range(im.height):
        for x in range(im.width):
            r,g,b,a=im.getpixel((x,y))
            if a>180 and r>145 and g>75 and b>40 and r>g*1.07 and g>b*1.08:
                skin.append((x,y))
    assert skin,'No face landmark'
    left=min(x for x,y in skin);right=max(x for x,y in skin);top=min(y for x,y in skin);bottom=max(y for x,y in skin)
    margin=round((right-left)*.25)
    hair=[]
    for y in range(max(0,top-(bottom-top)),top+1):
        for x in range(max(0,left-margin),min(im.width,right+margin+1)):
            r,g,b,a=im.getpixel((x,y))
            if a>180 and 15<max(r,g,b)<100 and b>=r*.9 and b>=g*.9:
                hair.append(y)
    assert hair,'No hair landmark'
    return min(hair)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/bahia-v12'
DEST = ROOT / 'public/assets/lutadores/bahia/base'
LABELS = dict(zip(
    ['idle','walk-forward','walk-backward','hit-high','knockdown','light-punch','block-high','block-low',
     'crouch','jump','stunned','dash-forward','dash-back','low-kick','jump-punch','jump-kick',
     'heavy-punch','eye-laser','special-charge','special'],
    ['Guarda flutuante','Flutuar para frente','Flutuar para trás','Reação ao golpe','Queda',
     'Dois socos rápidos','Defesa alta','Defesa baixa','Esquiva baixa','Salto','Atordoado',
     'Arrancada para frente','Arrancada para trás','Chute baixo','Soco no ar','Voadora',
     'Corte descendente','Laser dos olhos','Preparar grito','Bora Bahêa']))


def pack(action, count, fps, mode='belt', calibration=0, source_count=None, scale_override=None, source_offset=0):
    source = OUT / f'{action}-source.png'
    im = Image.open(source).convert('RGBA')
    crops = extract(im, source_count or count)
    guard = Image.open(OUT / 'guard.png').convert('RGBA')
    gb = bounds(guard)
    reference = bounds(crops[calibration])
    scale = scale_override if scale_override is not None else (gb[3]-gb[1])/(reference[3]-reference[1])
    belt = belt_center(guard)
    frames, boxes, placements, hover_offsets = [], [], [], []
    for i, crop in enumerate(crops[source_offset:source_offset+count]):
        crop.save(OUT / f'{action}-extracted-{i}.png')
        cut = crop.crop(bounds(crop))
        cut = cut.resize((round(cut.width*scale), round(cut.height*scale)), Image.Resampling.NEAREST)
        try:
            cb = belt_center(cut)
            x = round(belt[0]-cb[0])
        except AssertionError:
            x = (256-cut.width)//2
        if mode == 'belt':
            y = round(belt[1]-belt_center(cut)[1])
        elif mode == 'top':
            y = gb[1]
        elif mode == 'head':
            y = gb[1]-head_top(cut)
        elif mode == 'center':
            y = round(128-cut.height/2)
        else:
            y = gb[3]-cut.height
        if action == 'jump' and i in (1, 2):
            y = gb[3]-cut.height
        if action == 'idle':
            y += [0, -1, -2, -1][i]
        assert cut.width <= 250 and cut.height <= 250, ('Oversized source anatomy', action, i, cut.size)
        # A shared anatomical belt axis is preferred; allow minimal translation
        # within the canvas, without resizing an individual frame.
        x = max(3, min(253-cut.width, x))
        y = max(3, min(253-cut.height, y))
        frame = Image.new('RGBA', (256, 256))
        frame.alpha_composite(cut, (x, y))
        if (i == 0 and calibration == 0 and source_offset == 0) or (i == count-1 and action in
                ['hit-high','light-punch','heavy-punch','eye-laser','special','low-kick','dash-forward','dash-back']):
            frame = guard.copy()
        hover = 8 if action != 'knockdown' else max(0, 8-round(i*8/5))
        if hover:
            fb=bounds(frame)
            assert fb[1]-hover>=2,('Not enough headroom for hovering',action,i,fb)
            shifted=Image.new('RGBA',(256,256));shifted.alpha_composite(frame,(0,-hover));frame=shifted
        frames.append(frame)
        boxes.append(bounds(frame))
        placements.append([x, y])
        hover_offsets.append(hover)
    sheet = Image.new('RGBA', (1280, 256*((count+4)//5)))
    contact = Image.new('RGB', (256*min(5, count+1), 280*((count+5)//5)), '#29343f')
    draw = ImageDraw.Draw(contact)
    comparison_guard=Image.new('RGBA',(256,256));comparison_guard.alpha_composite(guard,(0,-8))
    for i, frame in enumerate([comparison_guard]+frames):
        x,y = i%5*256,i//5*280
        contact.paste(frame, (x,y+24), frame)
        draw.text((x+8,y+5), 'base v1' if i == 0 else str(i-1), fill='white')
    gifs=[]
    for i, frame in enumerate(frames):
        sheet.alpha_composite(frame, (i%5*256, i//5*256))
        bg=Image.new('RGB',(256,256),'#29343f');bg.paste(frame,(0,0),frame);gifs.append(bg)
    sheet.save(OUT/f'{action}-packed.png')
    contact.save(OUT/f'{action}-contact.png')
    gifs[0].save(OUT/f'{action}-preview.gif',save_all=True,append_images=gifs[1:],duration=round(1000/fps),loop=0)
    report={'action':action,'frames':count,'fps':fps,'scale':scale,'frameBoxes':boxes,'placements':placements,
            'calibration':calibration,'packing':{'mode':mode,'sourceCount':source_count or count,
            'sharedScaleOverride':scale_override,'sourceOffset':source_offset},
            'scaleBasis':'anatomical landmarks' if scale_override is not None else 'canonical guard height',
            'hoverOffsets':hover_offsets,'logicalBaseline':228,
            'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),
            'sha256':hashlib.sha256((OUT/f'{action}-packed.png').read_bytes()).hexdigest(),'status':'packed, awaiting visual inspection'}
    target=DEST/f'{action}.png'
    report['expectedTargetSha256']=hashlib.sha256(target.read_bytes()).hexdigest() if target.exists() else None
    (OUT/f'{action}-report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    print(json.dumps(report))


def accept(action, notes):
    """Explicitly reviewed poses only; merge into current JSON, preserving mechanics."""
    report_path=OUT/f'{action}-report.json'
    r=json.loads(report_path.read_text(encoding='utf-8'))
    packed=OUT/f'{action}-packed.png'
    target=DEST/f'{action}.png'
    assert not r['status'].startswith('rejected'),'Rejected artwork must be redrawn and repacked first'
    assert hashlib.sha256(packed.read_bytes()).hexdigest()==r['sha256'],'Packed asset changed after report'
    if 'expectedTargetSha256' in r:
        current=hashlib.sha256(target.read_bytes()).hexdigest() if target.exists() else None
        assert current in (r['expectedTargetSha256'],r['sha256']),('Target changed during visual review',action)
    if target.exists() and not (OUT/f'{action}-before.png').exists():
        shutil.copy2(target,OUT/f'{action}-before.png')
    target.write_bytes(packed.read_bytes())
    path=ROOT/'src/game/lutadores/bahia.json'
    d=json.loads(path.read_text(encoding='utf-8'))
    old=next((a for a in d['actions'] if a['action']==action),None)
    b=r['frameBoxes'];left=min(v[0] for v in b);top=min(v[1] for v in b);right=max(v[2] for v in b)
    # Logical ground hurtbox baseline remains the canonical idle baseline;
    # actual measured visual bounds are kept separately in each report.
    spec={'action':action,'label':LABELS[action],'file':target.name,
          'frames':r['frames'],'frameRate':r['fps'],'repeat':-1 if action in ['idle','walk-forward','walk-backward','stunned'] else 0,
          'defaultVisual':{'x':left,'y':top,'width':right-left,'height':228-top}}
    if action=='idle':
        # Keep the approved gameplay body; cape flutter is not extra hurt area.
        spec['defaultVisual']={'x':63,'y':28,'width':130,'height':200}
    elif action in ['jump','jump-kick','jump-punch','special','knockdown']:
        spec['defaultVisual']['height']=max(v[3] for v in b)-top
    if old:
        for key in ['attack','attackSpans','guard','travel','timing']:
            if key in old:spec[key]=old[key]
        d['actions'][d['actions'].index(old)]=spec
    else:
        d['actions'].append(spec)
    if action=='jump':d['moves']['jump']={'takeoff':3,'airEnd':7,'land':2}
    path.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    r['status']='installed after visual inspection';r['reviewNotes']=notes
    report_path.write_text(json.dumps(r,ensure_ascii=False,indent=2),encoding='utf-8')
    rebuild_review()
    print('installed',target.relative_to(ROOT))


def rebuild_review():
    reports=[json.loads(p.read_text(encoding='utf-8')) for p in OUT.glob('*-report.json')]
    cards=[];pending=[]
    expected=json.loads((OUT/'action-specs.json').read_text(encoding='utf-8'))
    installed=[r['action'] for r in reports if r['status'].startswith('installed')]
    for r in reports:
        a=r['action']
        if not r['status'].startswith('installed'):
            pending.append(f'<li>{a}: {r["status"]}</li>')
            continue
        prompt=f'{a}-corrected-prompt.txt' if (OUT/f'{a}-corrected-prompt.txt').exists() else f'{a}-final-prompt.txt'
        cards.append(f'<article><h2>{a}</h2><img src="{a}-preview.gif">'
                     f'<p>{r["frames"]} quadros · {r["fps"]} FPS</p><p>{r["status"]}</p>'
                     f'<a href="{a}-contact.png">Quadros e base</a> · <a href="{a}-source.png">Fonte</a> · '
                     f'<a href="{prompt}">Prompt</a></article>')
    for a in expected:
        if not any(r['action']==a for r in reports):
            pending.append(f'<li>{a}: pendente de geração</li>')
    (OUT/'revisao.html').write_text('<!doctype html><html lang="pt-BR"><meta charset="utf-8">'
        '<title>Bahia — revisão individual v12</title><style>'
        'body{background:#202934;color:#eef5fc;font:16px system-ui;padding:24px}'
        'main{display:flex;flex-wrap:wrap;gap:18px}article{background:#303d4b;padding:16px;border-radius:8px;width:280px}'
        'img{image-rendering:pixelated;width:256px;height:256px;object-fit:contain}a{color:#a8d5ff}'
        '</style><h1>Bahia — revisão individual v12</h1>'
        f'<p>{len(installed)} de {len(expected)} animações instaladas após revisão.</p>'
        '<p>Uma ação por geração. Guarda própria como régua de identidade. Pairando, sem passos. '
        'GIFs e contatos são revisão de arte, não testes de combate.</p><main>'+''.join(cards)+
        '</main><h2>Em revisão, não instaladas</h2><ul>'+''.join(pending)+'</ul>',encoding='utf-8')
    (OUT/'report.json').write_text(json.dumps(reports,ensure_ascii=False,indent=2),encoding='utf-8')
    (OUT/'progress.json').write_text(json.dumps({'installed':installed,
        'pending':[a for a in expected if a not in installed]},ensure_ascii=False,indent=2),encoding='utf-8')


def compose_individual(action, poses):
    """Assemble independently generated poses at one shared source scale.

    `None` denotes the explicitly required canonical guard endpoint. The first
    generated pose establishes the source resolution; later poses must use the
    same square canvas and anatomical scale, checked visually before assembly.
    No frame is resized independently to make its body fit.
    """
    generated=[Image.open(OUT/p).convert('RGBA') for p in poses if p]
    assert generated and len({im.size for im in generated})==1,'Different source canvases'
    size=generated[0].size
    assert size[0]==size[1],'Individual pose source must be square'
    first=bounds(generated[0]);height=first[3]-first[1]
    guard=Image.open(OUT/'guard.png').convert('RGBA');guard=guard.crop(bounds(guard))
    guard=guard.resize((round(guard.width*height/200),height),Image.Resampling.NEAREST)
    cols=2 if len(poses)<=4 else 3
    source=Image.new('RGBA',(size[0]*cols,size[1]*((len(poses)+cols-1)//cols)))
    for i,path in enumerate(poses):
        if path:
            im=Image.open(OUT/path).convert('RGBA')
        else:
            im=Image.new('RGBA',size);im.alpha_composite(guard,((size[0]-guard.width)//2,(size[1]-guard.height)//2))
        source.alpha_composite(im,(i%cols*size[0],i//cols*size[1]))
    source.save(OUT/f'{action}-source.png')
    (OUT/f'{action}-individual-sources.json').write_text(json.dumps({
        'poses':poses,'sourceCanvas':size,'sharedBodyScale':200/height,
        'assemblyOnly':True,'perFrameAnatomicalRescaling':False},indent=2),encoding='utf-8')


if __name__ == '__main__':
    p=argparse.ArgumentParser();p.add_argument('action');p.add_argument('count',type=int,nargs='?');p.add_argument('fps',type=int,nargs='?')
    p.add_argument('--mode',choices=['belt','feet','top','head','center'],default='belt')
    p.add_argument('--calibration',type=int,default=0);p.add_argument('--source-count',type=int)
    p.add_argument('--scale',type=float,help='One shared action scale from verified anatomical landmarks')
    p.add_argument('--source-offset',type=int,default=0,help='Skip a source-only canonical guard calibrator')
    p.add_argument('--accept',metavar='REVIEW_NOTES')
    args=p.parse_args()
    if args.accept:accept(args.action,args.accept)
    else:pack(args.action,args.count,args.fps,args.mode,args.calibration,args.source_count,args.scale,args.source_offset)
