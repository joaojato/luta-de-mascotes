"""Pack independently image-generated dragon actions; never paint or warp art."""
import argparse
import hashlib
import json
import math
import shutil
import statistics
from pathlib import Path
from PIL import Image, ImageDraw
from urubu_asas_v1 import extract, bounds, foot_axis

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/dragao-v1'
DEST=ROOT/'public/assets/lutadores/dragao/base-v1'

def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def shorts_axis(im,lower=.58,upper=.70):
    """Measure garment center only; do not recolor dark cloth or skin."""
    runs=[]
    for y in range(round(im.height*lower),round(im.height*upper)):
        start=None
        for x in range(im.width+1):
            ok=x<im.width and im.getpixel((x,y))[3]>128 and max(im.getpixel((x,y))[:3])<85
            if ok and start is None:start=x
            if not ok and start is not None:
                if x-start>im.width*.08:runs.append((x-start,(x+start)/2,y))
                start=None
    assert len(runs)>=4,'Garment ambiguous; measure anchors manually'
    top=sorted(runs,reverse=True)[:8]
    return statistics.median(x for w,x,y in top),statistics.median(y for w,x,y in top)

def measure_waist(name,lower=.58,upper=.70):
    folder=OUT/name;r=json.loads((folder/'report.json').read_text())
    assert not r['reviewed'],'Do not change reviewed source alignment'
    guard=Image.open(ROOT/'referencia/dragao/guarda-producao-v1.png').convert('RGBA')
    offset=(foot_axis(guard)-shorts_axis(guard)[0])*200/guard.height
    axes=[]
    for i in range(r['frames']):
        im=Image.open(folder/f'extracted-{i}.png').convert('RGBA')
        x,y=shorts_axis(im,lower,upper);axes.append([x+offset/r['scale'],y])
    (folder/'anchors.json').write_text(json.dumps(axes),encoding='utf-8')
    (folder/'axis-notes.json').write_text(json.dumps({'method':'Measured black-shorts centers plus canonical waist-to-foot-root offset, complete figures translated only. Review required after repack.','canonicalFootMinusWaistPixels':offset,'sourceFractions':[lower,upper]},indent=2),encoding='utf-8')
    print(json.dumps({'name':name,'anchors':axes}))

def save(name,frames,fps,extra):
    folder=OUT/name;folder.mkdir(parents=True,exist_ok=True)
    w,h=frames[0].size;n=len(frames)
    sheet=Image.new('RGBA',(w*5,h*math.ceil(n/5)))
    contact=Image.new('RGB',(w*2,(h+24)*math.ceil(n/2)),'#35404b')
    draw=ImageDraw.Draw(contact);previews=[]
    for i,frame in enumerate(frames):
        assert frame.size==(w,h)
        frame.save(folder/f'frame-{i}.png')
        sheet.alpha_composite(frame,(i%5*w,i//5*h))
        x,y=i%2*w,i//2*(h+24)
        contact.paste(frame,(x,y+22),frame);draw.text((x+8,y+4),f'{name} {i}',fill='white')
        bg=Image.new('RGB',(w,h),'#35404b');bg.paste(frame,(0,0),frame);previews.append(bg)
    sheet.save(folder/'sheet.png');contact.save(folder/'contact.png')
    durations=extra.get('frameDurationsMs')
    if durations:assert len(durations)==n and all(t>0 for t in durations)
    for file,ms in [('preview.gif',round(1000/fps)),('slow.gif',180)]:
        previews[0].save(folder/file,save_all=True,append_images=previews[1:],duration=durations if durations and file=='preview.gif' else ms,loop=0)
    report={'action':name,'frames':n,'fps':fps,'cell':[w,h],'columns':5,
        'frameBounds':[bounds(f) for f in frames],'sha256':sha(folder/'sheet.png'),
        'reviewed':False,'runtimeModified':False,**extra}
    (folder/'report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    print(json.dumps({'action':name,'cell':[w,h],'bounds':report['frameBounds'],'scale':extra.get('scale')}))

def pack(name,source,count,columns=2,calibration=0,height=200,export_count=None,fps=12,
         align='feet',cell_width=512,cell_height=384,root_y=260,guard_start=False,guard_end=False,air_frames=None,crouch_start=False,crouch_end=False):
    folder=OUT/name;folder.mkdir(parents=True,exist_ok=True)
    existing=folder/'report.json'
    if existing.exists():assert not json.loads(existing.read_text()).get('reviewed'),'Do not overwrite reviewed art; version the correction'
    target=folder/'source.png'
    if Path(source).resolve()!=target.resolve():
        assert not target.exists(),'Keep earlier sources; use versioned folder'
        shutil.copy2(source,target)
    poses=extract(Image.open(target).convert('RGBA'),count,columns)
    for i,p in enumerate(poses):p.save(folder/f'extracted-{i}.png')
    scale=height/poses[calibration].height
    axis_file=folder/'anchors.json';axes=json.loads(axis_file.read_text()) if axis_file.exists() else None
    frames=[];placements=[];w,h=cell_width,cell_height
    for i,p in enumerate(poses[:export_count or count]):
        f=p.resize((round(p.width*scale),round(p.height*scale)),Image.Resampling.NEAREST)
        assert f.width<w-8 and f.height<h-8,('Oversize; redraw or use larger cells',name,i,f.size)
        point=axes[i] if axes else [foot_axis(p),p.height*.63]
        x=round(w/2-point[0]*scale)
        y=h-24-f.height
        if align=='jump' and i>=3:y=160
        if align=='air':y=round(root_y-point[1]*scale)
        if align=='head':y=160
        if align=='takeoff' and i>=3:y=round(root_y-point[1]*scale)
        if align=='return' and i<3:y=round(root_y-point[1]*scale)
        if i in (air_frames or []):y=round(root_y-point[1]*scale)
        assert x>=3 and y>=3 and x+f.width<=w-3 and y+f.height<=h-3,('Clipped packed pose',name,i,(x,y),f.size)
        frame=Image.new('RGBA',(w,h));frame.alpha_composite(f,(x,y));frames.append(frame)
        placements.append({'sourceSize':list(p.size),'position':[x,y],'scale':scale})
    canonical=Image.open(OUT/'guard.png').convert('RGBA')
    if guard_start:assert canonical.size==(w,h);frames[0]=canonical.copy()
    if guard_end:assert canonical.size==(w,h);frames[-1]=canonical.copy()
    if crouch_start or crouch_end:
        low=Image.open(OUT/'crouch-guard.png').convert('RGBA');assert low.size==(w,h)
        if crouch_start:frames[0]=low.copy()
        if crouch_end:frames[-1]=low.copy()
    save(name,frames,fps,{'sourceSha256':sha(target),'scale':scale,'calibration':calibration,
        'heightRuler':height,'sourceCount':count,'alignment':align,'canonicalStart':guard_start,
        'canonicalEnd':guard_end,'canonicalCrouchStart':crouch_start,'canonicalCrouchEnd':crouch_end,'bodyRootLocal':[w/2,h-24],'placements':placements,'airFrames':air_frames})

def accept(name,notes,relative=None,replace=False):
    folder=OUT/name;r=json.loads((folder/'report.json').read_text())
    assert sha(folder/'sheet.png')==r['sha256']
    path=DEST/(relative or f'{name}.png');path.parent.mkdir(parents=True,exist_ok=True)
    if path.exists():
        assert replace,'Inspect and preserve existing destination'
        shutil.copy2(path,folder/f'before-{sha(path)[:12]}.png');r['previousSha256']=sha(path)
    shutil.copy2(folder/'sheet.png',path)
    r.update(reviewed=True,reviewNotes=notes,asset=str(path.relative_to(ROOT)).replace('\\','/'))
    (folder/'report.json').write_text(json.dumps(r,indent=2),encoding='utf-8');review()

def pack_fx(name,source,count=6,columns=1,extent=120,cell_width=256,cell_height=192,
            origin_x=220,origin_y=96,fps=12):
    """Assemble complete generated flame figures, fixed mouth stem and one scale."""
    folder=OUT/name;folder.mkdir(parents=True,exist_ok=True)
    existing=folder/'report.json'
    if existing.exists():assert not json.loads(existing.read_text()).get('reviewed'),'Version reviewed effect corrections'
    target=folder/'source.png'
    if Path(source).resolve()!=target.resolve():
        assert not target.exists(),'Keep previous effect source'
        shutil.copy2(source,target)
    poses=extract(Image.open(target).convert('RGBA'),count,columns)
    scale=extent/max(p.width for p in poses);frames=[];origins=[]
    for i,p in enumerate(poses):
        p.save(folder/f'extracted-{i}.png')
        stem=[]
        for y in range(p.height):
            for x in range(round(p.width*.95),p.width):
                if p.getpixel((x,y))[3]>32:stem.append(y)
        assert stem,'Missing connected emission stem'
        sy=sum(stem)/len(stem)
        f=p.resize((round(p.width*scale),round(p.height*scale)),Image.Resampling.NEAREST)
        x=origin_x-f.width;y=round(origin_y-sy*scale)
        assert x>=3 and y>=3 and x+f.width<=cell_width-3 and y+f.height<=cell_height-3,('Clipped flame',i,f.size,(x,y))
        frame=Image.new('RGBA',(cell_width,cell_height));frame.alpha_composite(f,(x,y));frames.append(frame)
        origins.append({'sourceStemY':sy,'position':[x,y],'scale':scale})
    save(name,frames,fps,{'sourceSha256':sha(target),'scale':scale,'sourceCount':count,
        'emissionOrigin':[origin_x,origin_y],'direction':[-1,0],'maxVisualReach':extent,
        'placements':origins,'bodyRootLocal':None,'alignment':'connected flame stem, not body/feet'})

def review():
    plan=json.loads((OUT/'plan.json').read_text());names=set(plan['body'])|set(plan['effects'])
    rows=[]
    for p in sorted(OUT.glob('*/report.json')):
        r=json.loads(p.read_text())
        # Rejected/versioned studies may retain their old action identifier.
        if r['action'] in names and p.parent.name==r['action']:rows.append(r)
    cards=''.join(f'<article><h2>{r["action"]}</h2><p>{r["frames"]} quadros / {r["fps"]} FPS / {"conferido" if r["reviewed"] else "em revisao"}</p><img src="{r["action"]}/preview.gif"><p><a href="{r["action"]}/contact.png">Quadros</a> | <a href="{r["action"]}/slow.gif">Lento</a> | <a href="{r["action"]}/sheet.png">PNG</a></p></article>' for r in rows)
    js='''<script>const rows=DATA,sel=document.querySelector('#action'),slider=document.querySelector('#frame'),canvas=document.querySelector('#viewer'),ctx=canvas.getContext('2d');let row,im,frame=0,playing=true,last=performance.now(),elapsed=0;rows.forEach((r,i)=>sel.add(new Option(r.action,i)));function draw(){if(!im?.complete||!im.naturalWidth)return;const[w,h]=row.cell;ctx.imageSmoothingEnabled=false;ctx.fillStyle='#35404b';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#65717a';ctx.beginPath();ctx.moveTo(0,h-24);ctx.lineTo(w,h-24);ctx.stroke();ctx.drawImage(im,frame%5*w,Math.floor(frame/5)*h,w,h,0,0,w,h);slider.value=frame;document.querySelector('#counter').textContent=`${frame}/${row.frames-1} | ${row.fps} FPS | ${w}x${h}`;}function choose(){row=rows[+sel.value];frame=0;elapsed=0;slider.max=row.frames-1;canvas.width=row.cell[0];canvas.height=row.cell[1];im=new Image();im.onload=draw;im.src=row.action+'/sheet.png';}sel.onchange=choose;document.querySelector('#play').onclick=()=>{playing=!playing;document.querySelector('#play').textContent=playing?'Pausar':'Reproduzir';};slider.oninput=()=>{playing=false;frame=+slider.value;draw();};function tick(now){if(playing&&row){elapsed+=(now-last)*+document.querySelector('#speed').value;let duration=row.frameDurationsMs?.[frame]??1000/row.fps;while(elapsed>=duration){elapsed-=duration;frame=(frame+1)%row.frames;draw();duration=row.frameDurationsMs?.[frame]??1000/row.fps;}}last=now;requestAnimationFrame(tick);}if(rows.length)choose();requestAnimationFrame(tick);</script>'''.replace('DATA',json.dumps(rows))
    html='<!doctype html><meta charset="utf-8"><title>Dragao — revisao de arte</title><style>body{background:#17212b;color:#eee;font:16px system-ui;margin:24px}section,article{background:#35404b;padding:16px;margin:16px 0;border-radius:8px}main{display:flex;flex-wrap:wrap;gap:20px}img,canvas{image-rendering:pixelated;max-width:100%}a{color:#9ef}</style><h1>Dragao do Atletico Goianiense</h1><p>Previa de artes; combate e geometria do fogo ainda dependem de integracao. <a href="fogo-preview.html">Composicao do fogo</a></p><section>Acao <select id="action"></select> <button id="play">Pausar</button> <select id="speed"><option value="1">1x</option><option value=".5">0,5x</option><option value=".25">0,25x</option></select><p><input id="frame" type="range" min="0" value="0"><span id="counter"></span></p><canvas id="viewer"></canvas></section><main>'+cards+'</main>'+js
    (OUT/'revisao.html').write_text(html,encoding='utf-8')
    (OUT/'manifest.json').write_text(json.dumps(rows,indent=2),encoding='utf-8')

def verify():
    review();plan=json.loads((OUT/'plan.json').read_text());expected=plan['body']|plan['effects']
    rows={r['action']:r for r in json.loads((OUT/'manifest.json').read_text())}
    assert set(rows)==set(expected),('Missing',sorted(set(expected)-set(rows)))
    total=0
    for name,(n,fps) in expected.items():
        r=rows[name];assert r['reviewed'] and (r['frames'],r['fps'])==(n,fps),name
        path=ROOT/r['asset'];assert sha(path)==r['sha256'],name
        im=Image.open(path);w,h=r['cell'];assert im.mode=='RGBA' and im.size==(w*5,h*math.ceil(n/5)),name
        assert im.getchannel('A').getextrema()[0]==0,name
        for i in range(math.ceil(n/5)*5):
            f=im.crop((i%5*w,i//5*h,(i%5+1)*w,(i//5+1)*h));b=bounds(f)
            if i>=n:assert b is None,(name,'padding',i)
            else:assert b and b[0]>=2 and b[1]>=2 and b[2]<=w-2 and b[3]<=h-2,(name,i,b)
        total+=n
    result={'actions':len(rows),'bodyActions':len(plan['body']),'effectActions':len(plan['effects']),'frames':total,'rgba':True,'hashes':True,'margins':True,'emptyCells':True,'runtimeModified':False}
    (OUT/'validation.json').write_text(json.dumps(result,indent=2),encoding='utf-8');print(json.dumps(result))

if __name__=='__main__':
    p=argparse.ArgumentParser();sub=p.add_subparsers(dest='cmd',required=True)
    q=sub.add_parser('pack');q.add_argument('name');q.add_argument('source');q.add_argument('count',type=int)
    for key,default in [('columns',2),('calibration',0),('height',200),('fps',12),('cell-width',512),('cell-height',384),('root-y',260)]:q.add_argument('--'+key,type=int,default=default)
    q.add_argument('--export-count',type=int);q.add_argument('--align',choices=['feet','jump','air','head','takeoff','return'],default='feet')
    q.add_argument('--guard-start',action='store_true');q.add_argument('--guard-end',action='store_true')
    q.add_argument('--air-frames',type=int,nargs='*',default=[])
    q.add_argument('--crouch-start',action='store_true');q.add_argument('--crouch-end',action='store_true')
    q=sub.add_parser('accept');q.add_argument('name');q.add_argument('notes');q.add_argument('--relative');q.add_argument('--replace',action='store_true')
    q=sub.add_parser('measure-waist');q.add_argument('name');q.add_argument('--lower',type=float,default=.58);q.add_argument('--upper',type=float,default=.70)
    q=sub.add_parser('pack-fx');q.add_argument('name');q.add_argument('source')
    for key,default in [('count',6),('columns',1),('extent',120),('cell-width',256),('cell-height',192),('origin-x',220),('origin-y',96),('fps',12)]:q.add_argument('--'+key,type=int,default=default)
    sub.add_parser('review');sub.add_parser('verify')
    args=vars(p.parse_args());cmd=args.pop('cmd')
    {'pack':pack,'accept':accept,'review':review,'verify':verify,'measure-waist':measure_waist,'pack-fx':pack_fx}[cmd](**args)
