"""Pack separately image-generated actions. No painting or combat changes."""
import argparse
import hashlib
import json
import math
import shutil
from pathlib import Path
from PIL import Image, ImageDraw
from urubu_asas_v1 import extract, bounds, foot_axis

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/mosqueteiro-v1'
DEST = ROOT / 'public/assets/lutadores/mosqueteiro/base-v1'
CELL = (640, 320)


def belt_point(im):
    """Locate the square gold waist buckle; weapons must not drag body axis."""
    pts = set()
    for y in range(round(im.height*.40), round(im.height*.73)):
        for x in range(round(im.width*.42), round(im.width*.94)):
            r,g,b,a = im.getpixel((x,y))
            if a>32 and r>145 and g>85 and b<110 and g>b*1.3:
                pts.add((x,y))
    candidates=[]
    while pts:
        todo=[pts.pop()]; c=[]
        while todo:
            x,y=todo.pop(); c.append((x,y))
            for q in [(x-1,y),(x+1,y),(x,y-1),(x,y+1)]:
                if q in pts: pts.remove(q); todo.append(q)
        if len(c)<5: continue
        x1,x2=min(x for x,y in c),max(x for x,y in c)
        y1,y2=min(y for x,y in c),max(y for x,y in c)
        if .55 <= (x2-x1+1)/(y2-y1+1) <= 1.8:
            cx,cy=round((x1+x2)/2),round((y1+y2)/2)
            r,g,b,a=im.getpixel((cx,cy))
            wine=r>35 and r>g*1.3 and b>g*.9 and r>b
            candidates.append((len(c)*(8 if wine else 1),(x1+x2)/2,(y1+y2)/2))
    return max(candidates)[1:] if candidates else (foot_axis(im),im.height*.58)


def belt_axis(im):
    return belt_point(im)[0]


def beak_point(im):
    """Track bird head independently of long wing tips and folded legs."""
    pts=set()
    for y in range(im.height):
        for x in range(im.width):
            r,g,b,a=im.getpixel((x,y))
            if a>32 and r>150 and g>90 and b<110 and r>g*.95 and g>b*1.4:
                pts.add((x,y))
    components=[]
    while pts:
        todo=[pts.pop()];c=[]
        while todo:
            x,y=todo.pop();c.append((x,y))
            for q in [(x-1,y),(x+1,y),(x,y-1),(x,y+1)]:
                if q in pts:pts.remove(q);todo.append(q)
        if len(c)>12:
            components.append((sum(y for x,y in c)/len(c),sum(x for x,y in c)/len(c)))
    assert components,'No beak found'
    y,x=min(components)
    return x,y


def bird_point(im):
    bx,by=beak_point(im)
    feet=[]
    for y in range(round(by+im.height*.18),im.height):
        for x in range(im.width):
            r,g,b,a=im.getpixel((x,y))
            if a>32 and r>150 and g>90 and b<110 and r>g*.95 and g>b*1.4:
                feet.append(x)
    return (sum(feet)/len(feet) if feet else bx),by


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def pack(name, source, count, columns, calibration=0, height=214, fps=12,
         export_count=None, align='feet', reference=None, cell_height=320, waist_y=200):
    global CELL
    CELL=(640,cell_height)
    folder = OUT / name
    folder.mkdir(parents=True, exist_ok=True)
    existing=folder/'report.json'
    if existing.exists():
        assert not json.loads(existing.read_text()).get('compacted'), 'Final crop already applied; do not overwrite corrected export with old source'
    target = folder / 'source.png'
    if Path(source).resolve() != target.resolve():
        assert not target.exists(), 'Preserve existing source; use a versioned action name'
        shutil.copy2(source, target)
    image = Image.open(target).convert('RGBA')
    assert image.getchannel('A').getextrema()[0] == 0
    poses = extract(image, count, columns)
    scale = height / poses[calibration].height
    axis_path=folder/'axes.json'
    axes=json.loads(axis_path.read_text()) if axis_path.exists() else None
    frames = []
    for i, pose in enumerate(poses[:export_count or count]):
        pose.save(folder / f'extracted-{i}.png')
        figure = pose.resize((round(pose.width * scale), round(pose.height * scale)), Image.Resampling.NEAREST)
        assert figure.width < CELL[0]-8 and figure.height < CELL[1]-10, ('Oversize', name, i, figure.size)
        point=bird_point(pose) if align=='beak' else belt_point(pose)
        custom=axes[i] if axes else None
        axis = ((custom[0] if isinstance(custom,list) else custom) if custom is not None else point[0])*scale if align in {'feet','jump','air','beak'} else figure.width / 2
        x = round(CELL[0]/2 - axis)
        y = CELL[1]-24 - figure.height if align in {'feet','jump'} else round(CELL[1]/2 - figure.height / 2)
        if align == 'jump' and i >= 3:
            y = 78
        if align in {'air','beak'}:
            y=round(waist_y-(custom[1] if isinstance(custom,list) else point[1])*scale)
        if align=='beak' and ((name.endswith('-takeoff') and i<3) or (name.endswith('-return') and i>=2)):
            y=CELL[1]-24-figure.height
        assert x >= 3 and y >= 3 and x + figure.width <= CELL[0]-3 and y + figure.height <= CELL[1]-3, ('Clipping', name, i, x, y, figure.size)
        frame = Image.new('RGBA', CELL)
        frame.alpha_composite(figure, (x, y))
        frame.save(folder / f'frame-{i}.png')
        frames.append(frame)
    save(name, frames, fps, {'sourceSha256': sha(target), 'scale': scale,
         'sourceCount': count, 'calibration': calibration, 'heightRuler': height,
         'alignment': align, 'reference': reference})


def save(name, frames, fps, extra):
    global CELL
    CELL=frames[0].size
    folder = OUT / name
    n = len(frames)
    sheet = Image.new('RGBA', (CELL[0] * 5, CELL[1] * math.ceil(n / 5)))
    contact = Image.new('RGB', (CELL[0] * 2, (CELL[1]+24) * math.ceil(n / 2)), '#35404b')
    draw = ImageDraw.Draw(contact)
    previews = []
    for i, frame in enumerate(frames):
        sheet.alpha_composite(frame, (i % 5 * CELL[0], i // 5 * CELL[1]))
        x, y = i % 2 * CELL[0], i // 2 * (CELL[1]+24)
        contact.paste(frame, (x, y + 22), frame)
        draw.text((x + 8, y + 4), f'{name} {i}', fill='white')
        bg = Image.new('RGB', CELL, '#35404b'); bg.paste(frame, (0, 0), frame)
        previews.append(bg)
    sheet.save(folder / 'sheet.png'); contact.save(folder / 'contact.png')
    repetition = {'loop': 0} if extra.get('loop', True) else {}
    previews[0].save(folder / 'preview.gif', save_all=True, append_images=previews[1:],
                     duration=[round(1000/fps)]*n, **repetition)
    previews[0].save(folder / 'slow.gif', save_all=True, append_images=previews[1:], duration=180, **repetition)
    report = {'action': name, 'frames': n, 'fps': fps, 'columns': 5, 'cell': CELL,
              'frameBounds': [bounds(f) for f in frames], 'sha256': sha(folder/'sheet.png'),
              'reviewed': False, 'runtimeModified': False, **extra}
    (folder/'report.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps({'name': name, 'scale': extra.get('scale'), 'bounds': report['frameBounds']}))


def accept(name, notes, relative=None, replace=False):
    folder = OUT/name; r = json.loads((folder/'report.json').read_text())
    assert sha(folder/'sheet.png') == r['sha256']
    path = DEST/(relative or f'{name}.png')
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        assert replace, 'Inspect existing destination before replacing'
        backup=folder/f'before-{sha(path)[:12]}.png'
        shutil.copy2(path,backup)
        r['previousSha256']=sha(path)
    shutil.copy2(folder/'sheet.png', path)
    r.update(reviewed=True, reviewNotes=notes, asset=str(path.relative_to(ROOT)))
    (folder/'report.json').write_text(json.dumps(r, indent=2), encoding='utf-8')


def review():
    reports = []
    plan=json.loads((OUT/'plan.json').read_text())
    expected=set(plan['mosqueteiro'])|{f'npc-{npc}-{action}' for npc,actions in plan['npcs'].items() for action in actions}
    for path in sorted(OUT.glob('*/report.json')):
        r = json.loads(path.read_text())
        if r['action'] in expected: reports.append(r)
    cards = ''.join(f'<article><h2>{r["action"]}</h2><p>{r["frames"]} quadros / {r["fps"]} FPS / '
                    f'{"conferido" if r["reviewed"] else "em revisao"}</p><img src="{r["action"]}/preview.gif">'
                    f'<p><a href="{r["action"]}/slow.gif">Lento</a> | '
                    f'<a href="{r["action"]}/contact.png">Quadros</a> | '
                    f'<a href="{r["action"]}/sheet.png">PNG</a></p></article>' for r in reports)
    controls='<section><label>Acao <select id="action"></select></label> <button id="play">Pausar</button> <select id="speed"><option value="1">1x</option><option value=".5">0,5x</option><option value=".25">0,25x</option></select><p><input id="frame" type="range" min="0" value="0"><span id="counter"></span></p><canvas id="viewer" width="640" height="384"></canvas></section>'
    player='''<script>const rows=DATA,sel=document.querySelector('#action'),slider=document.querySelector('#frame'),canvas=document.querySelector('#viewer'),ctx=canvas.getContext('2d');let row,im,frame=0,playing=true,elapsed=0,last=performance.now();rows.forEach((r,i)=>sel.add(new Option(r.action,i)));function choose(){row=rows[+sel.value];frame=0;elapsed=0;slider.max=row.frames-1;canvas.width=row.cell[0];canvas.height=row.cell[1];im=new Image();im.onload=draw;im.src=row.action+'/sheet.png';}function draw(){if(!im?.complete||!im.naturalWidth)return;const[w,h]=row.cell;ctx.imageSmoothingEnabled=false;ctx.fillStyle='#35404b';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#65717a';ctx.beginPath();ctx.moveTo(0,h-24);ctx.lineTo(w,h-24);ctx.stroke();ctx.drawImage(im,frame%5*w,Math.floor(frame/5)*h,w,h,0,0,w,h);slider.value=frame;document.querySelector('#counter').textContent=` ${frame} / ${row.frames-1} | ${row.fps} FPS | ${w}x${h}`;}document.querySelector('#play').onclick=()=>{playing=!playing;document.querySelector('#play').textContent=playing?'Pausar':'Reproduzir';};slider.oninput=()=>{playing=false;document.querySelector('#play').textContent='Reproduzir';frame=+slider.value;draw();};sel.onchange=choose;function tick(now){if(playing&&row){elapsed+=(now-last)*+document.querySelector('#speed').value;while(elapsed>=1000/row.fps){elapsed-=1000/row.fps;frame=(frame+1)%row.frames;draw();}}last=now;requestAnimationFrame(tick);}if(rows.length)choose();requestAnimationFrame(tick);</script>'''.replace('DATA',json.dumps(reports))
    player = player.replace('frame=(frame+1)%row.frames;',
        'frame=row.loop===false?Math.min(frame+1,row.frames-1):(frame+1)%row.frames;')
    (OUT/'revisao.html').write_text('<!doctype html><meta charset="utf-8"><title>Mosqueteiro e Gaviao da Fiel</title>'
        '<style>body{background:#17212b;color:#eee;font:16px system-ui;margin:24px}main{display:flex;flex-wrap:wrap;gap:20px}'
        'article{background:#35404b;padding:12px;border-radius:8px}img{max-width:640px;image-rendering:pixelated}canvas{image-rendering:pixelated;max-width:100%}section{padding:16px;background:#25313d;margin-bottom:24px}a{color:#9ef}</style>'
        '<h1>Mosqueteiro e Gavioes da Fiel</h1><p>Artes individuais. Integracao de combate separada. Linha horizontal indica o chao local; trajetorias de mundo pertencem ao jogo.</p>'+controls+'<main>'+cards+'</main>'+player, encoding='utf-8')
    (OUT/'manifest.json').write_text(json.dumps(reports, indent=2), encoding='utf-8')


def compact_npcs():
    """Crop only empty margins, one cell size per NPC, preserving every pixel."""
    plan=json.loads((OUT/'plan.json').read_text());stats=[]
    for npc,actions in plan['npcs'].items():
        rows=[]
        for action in actions:
            folder=OUT/f'npc-{npc}-{action}'
            r=json.loads((folder/'report.json').read_text())
            assert r['reviewed'] and not r.get('compacted')
            rows.append((folder,r))
        extent=max(max(320-b[0],b[2]-320) for f,r in rows for b in r['frameBounds'])
        miny=min(b[1] for f,r in rows for b in r['frameBounds'])
        w=max(256,64*math.ceil((2*extent+16)/64));h=max(256,64*math.ceil((384-miny+8)/64))
        assert w<=640 and h<=384
        left=(640-w)//2;top=384-h
        for folder,r in rows:
            backup=folder/'before-compact';backup.mkdir()
            for name in ['sheet.png','report.json']+[f'frame-{i}.png' for i in range(r['frames'])]:
                shutil.copy2(folder/name,backup/name)
            frames=[]
            for i in range(r['frames']):
                original=Image.open(folder/f'frame-{i}.png').convert('RGBA');b=bounds(original)
                assert b[0]>=left+3 and b[2]<=left+w-3 and b[1]>=top+3
                f=original.crop((left,top,left+w,top+h))
                restored=Image.new('RGBA',original.size);restored.paste(f,(left,top))
                assert restored.tobytes()==original.tobytes(), ('Crop changes nonempty pixels',r['action'],i)
                f.save(folder/f'frame-{i}.png');frames.append(f)
            excluded={'action','frames','fps','columns','cell','frameBounds','sha256','reviewed','runtimeModified'}
            extra={k:v for k,v in r.items() if k not in excluded}
            extra.update(compacted=True,cropOffset=[left,top],bodyRootLocal=[w/2,h-24],previousSha256=r['sha256'])
            save(r['action'],frames,r['fps'],extra)
            new=json.loads((folder/'report.json').read_text());new['reviewed']=True
            new['reviewNotes']=r['reviewNotes']+' Final export removes empty cell margins only; all sprite pixels preserved.'
            (folder/'report.json').write_text(json.dumps(new,indent=2),encoding='utf-8')
            shutil.copy2(folder/'sheet.png',ROOT/r['asset'])
        stats.append({'npc':npc,'cell':[w,h],'sourceCell':[640,384],'unchangedSpritePixels':True})
    (OUT/'npc-cell-crops.json').write_text(json.dumps(stats,indent=2),encoding='utf-8');review();print(json.dumps(stats))


def verify():
    review()
    plan=json.loads((OUT/'plan.json').read_text())
    expected=dict(plan['mosqueteiro'])|{f'npc-{npc}-{action}':n for npc,actions in plan['npcs'].items() for action,n in actions.items()}
    reports={r['action']:r for r in json.loads((OUT/'manifest.json').read_text())}
    assert set(expected)==set(reports), ('Missing actions',sorted(set(expected)-set(reports)))
    total=0
    for name,n in expected.items():
        r=reports[name]; assert r['reviewed'] and r['frames']==n, name
        path=ROOT/r['asset'];assert sha(path)==r['sha256'],name
        image=Image.open(path);w,h=r['cell']
        assert image.mode=='RGBA' and image.size==(w*5,h*math.ceil(n/5)),name
        assert image.getchannel('A').getextrema()[0]==0,name
        for i in range(math.ceil(n/5)*5):
            cell=image.crop((i%5*w,i//5*h,(i%5+1)*w,(i//5+1)*h));b=bounds(cell)
            if i>=n: assert b is None,(name,'nonempty padding',i)
            else: assert b and b[0]>=2 and b[1]>=2 and b[2]<=w-2 and b[3]<=h-2,(name,i,b)
        total+=n
    result={'actions':len(expected),'frames':total,'rgba':True,'hashes':True,'margins':True,'emptyCells':True,'runtimeModified':False}
    (OUT/'validation.json').write_text(json.dumps(result,indent=2),encoding='utf-8');print(json.dumps(result))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(); sub = parser.add_subparsers(dest='cmd', required=True)
    p = sub.add_parser('pack'); p.add_argument('name'); p.add_argument('source'); p.add_argument('count', type=int)
    p.add_argument('--columns', type=int, default=2); p.add_argument('--calibration', type=int, default=0)
    p.add_argument('--height', type=int, default=214); p.add_argument('--fps', type=int, default=12)
    p.add_argument('--export-count', type=int); p.add_argument('--align', choices=['feet','center','jump','air','beak'], default='feet')
    p.add_argument('--cell-height', type=int, default=320); p.add_argument('--waist-y', type=int, default=200)
    p = sub.add_parser('accept'); p.add_argument('name'); p.add_argument('notes'); p.add_argument('--relative'); p.add_argument('--replace', action='store_true')
    sub.add_parser('review')
    sub.add_parser('verify')
    sub.add_parser('compact-npcs')
    args = vars(parser.parse_args()); cmd = args.pop('cmd')
    if cmd == 'pack': pack(**args)
    elif cmd == 'accept': accept(**args); review()
    elif cmd=='verify': verify()
    elif cmd=='compact-npcs': compact_npcs()
    else: review()
