"""Organize generated art without drawing, recoloring or deforming sprites."""
from pathlib import Path
from PIL import Image, ImageDraw
from collections import deque
import hashlib, json, shutil, sys

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT/'output/flecha-negra-v1'
DEST = ROOT/'public/assets/npcs/flecha-negra/base-v1'
BASE = ROOT/'referencia/gremio/flecha-negra/base-v1.png'
SPECS = {'idle':(4,6,True), 'war-run':(6,14,True),
         'turn-exit':(8,14,False), 'run-stop':(8,12,False),
         'shoot-standing':(8,12,False), 'shoot-low':(8,12,False),
         'shoot-air':(8,14,False), 'kneel-transition':(4,12,False)}
W,H,COLS = 512,320,5

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,obj): p.write_text(json.dumps(obj,ensure_ascii=False,indent=2),encoding='utf-8')

def parts(im):
    w,h=im.size; raw=im.getchannel('A').tobytes(); seen=bytearray(w*h); out=[]
    for seed,v in enumerate(raw):
        if v<12 or seen[seed]: continue
        q=deque([seed]); seen[seed]=1; pixels=[]; x0=w; y0=h; x1=y1=0
        while q:
            k=q.popleft(); pixels.append(k); x=k%w; y=k//w
            x0=min(x0,x); x1=max(x1,x); y0=min(y0,y); y1=max(y1,y)
            for n in ([k-1] if x else [])+([k+1] if x+1<w else [])+([k-w] if y else [])+([k+w] if y+1<h else []):
                if not seen[n] and raw[n]>=12: seen[n]=1; q.append(n)
        if len(pixels)>1200: out.append((pixels,(x0,y0,x1+1,y1+1)))
    return out

def extract(im,part):
    pixels,box=part; w,h=im.size; raw=im.getchannel('A').tobytes(); mask=bytearray(w*h)
    for k in pixels: mask[k]=raw[k]
    cut=im.copy(); cut.putalpha(Image.frombytes('L',(w,h),bytes(mask)))
    return cut.crop(box)

def prepare():
    OUT.mkdir(parents=True,exist_ok=True); DEST.mkdir(parents=True,exist_ok=True)
    for action in SPECS: (OUT/action).mkdir(exist_ok=True)
    shutil.copy2(BASE,OUT/'base.png'); shutil.copy2(BASE,DEST/'base.png')
    im=Image.open(BASE).convert('RGBA'); ps=parts(im); assert len(ps)==1
    cut=extract(im,ps[0]); scale=200/(1500-78)
    cut=cut.resize((round(cut.width*scale),round(cut.height*scale)),Image.Resampling.NEAREST)
    frame=Image.new('RGBA',(W,H)); box=ps[0][1]
    frame.alpha_composite(cut,(round(256-(510-box[0])*scale),round(296-(1500-box[1])*scale)))
    frame.save(OUT/'guard.png'); frame.save(DEST/'guard-reference.png')
    refs=[BASE,ROOT/'referencia/urubu/modelo-oficial.png',ROOT/'public/assets/npcs/guerreiro/base-v1/manifest.json']
    write(OUT/'references.json',[{'file':p.relative_to(ROOT).as_posix(),'sha256':sha(p)} for p in refs])

def ordered(im,rows):
    ps=parts(im); h=im.height
    return sorted(ps,key=lambda p:(int((p[1][1]+p[1][3])/2/h*rows),p[1][0]))

def mount(action):
    folder=OUT/action; cfg=json.loads((folder/'config.json').read_text()); n,fps,loop=SPECS[action]
    im=Image.open(folder/'source.png').convert('RGBA'); ps=ordered(im,cfg['rows'])
    assert len(ps)==n,(action,len(ps),[p[1] for p in ps])
    frames=[]; meta=[]; scale=cfg['scale']
    for i,(part,anchor) in enumerate(zip(ps,cfg['anchors'])):
        cut=extract(im,part); cut.save(folder/f'extracted-{i:02}.png'); box=part[1]
        cut=cut.resize((round(cut.width*scale),round(cut.height*scale)),Image.Resampling.NEAREST)
        tx,ty=cfg.get('frameTargets',{}).get(str(i),cfg.get('target',[256,296])); x=round(tx-(anchor[0]-box[0])*scale); y=round(ty-(anchor[1]-box[1])*scale)
        assert x>1 and y>1 and x+cut.width<W-1 and y+cut.height<H-1,(action,i,x,y,cut.size)
        frame=Image.new('RGBA',(W,H)); frame.alpha_composite(cut,(x,y))
        if i in cfg.get('exactGuardFrames',[]): frame=Image.open(OUT/'guard.png').convert('RGBA')
        frame.save(folder/f'frame-{i:02}.png'); frames.append(frame)
        info={'frame':i,'sourceBox':box,'sourceAnchor':anchor,'visualBounds':frame.getbbox()}
        if str(i) in cfg.get('arrowOriginSource',{}):
            ax,ay=cfg['arrowOriginSource'][str(i)]; info['arrowOrigin']=[round(x+(ax-box[0])*scale),round(y+(ay-box[1])*scale)]
        meta.append(info)
    sheet=Image.new('RGBA',(W*COLS,H*((n+COLS-1)//COLS)))
    contact=Image.new('RGB',(W*4,H*((n+3)//4)),'#777777'); previews=[]
    for i,f in enumerate(frames):
        sheet.alpha_composite(f,((i%COLS)*W,(i//COLS)*H))
        bg=Image.new('RGB',(W,H),'#777777'); bg.paste(f,mask=f.getchannel('A')); previews.append(bg)
        contact.paste(bg,((i%4)*W,(i//4)*H)); ImageDraw.Draw(contact).text(((i%4)*W+8,(i//4)*H+8),str(i),fill='white')
    sheet.save(folder/'sheet.png'); sheet.save(DEST/f'{action}.png'); contact.save(folder/'contact.png')
    durations=cfg.get('durationsMs',[round(1000/fps)]*n)
    for name,ds in [('preview',durations),('slow',[300]*n)]:
        previews[0].save(folder/f'{name}.gif',save_all=True,append_images=previews[1:],duration=ds,loop=0)
    report={'action':action,'file':f'{action}.png','sha256':sha(DEST/f'{action}.png'),'sourceSha256':sha(folder/'source.png'),
            'frames':n,'fpsProposed':fps,'loop':loop,'frameWidth':W,'frameHeight':H,'columns':COLS,'origin':[256,296],
            'scale':scale,'durationsMs':durations,'frameData':meta}
    if action.startswith('shoot-'): report['releaseFrame']=cfg.get('releaseFrame',5)
    write(folder/'report.json',report); print('Mounted',action,n,'frames')

def projectile():
    folder=OUT/'arrow'; im=Image.open(folder/'source.png').convert('RGBA'); ps=parts(im); assert len(ps)==1
    cut=extract(im,ps[0]); scale=74/cut.width
    cut=cut.resize((74,round(cut.height*scale)),Image.Resampling.NEAREST)
    frame=Image.new('RGBA',(96,24));frame.alpha_composite(cut,(11,round((24-cut.height)/2)))
    frame.save(DEST/'arrow.png');frame.save(folder/'projectile.png')
    write(folder/'report.json',{'file':'arrow.png','cell':[96,24],'direction':'left','shaftLengthPx':74,'origin':[48,12],
                              'tip':[11,12],'sha256':sha(DEST/'arrow.png'),'sourceSha256':sha(folder/'source.png')})

def demos():
    """Illustrate world motion separately from local sprite cells, without combat logic."""
    arrow=Image.open(DEST/'arrow.png').convert('RGBA')
    for variant in ['shoot-standing','shoot-low','shoot-air']:
        timeline=[]
        def add(a,i,x=740,dy=0,phase=''):
            timeline.append((a,i,x,dy,phase))
        for i in range(10): add('idle',i%4,820,phase='Guarda ao fundo')
        for i in [2,3]: add('turn-exit',i,820,phase='Chamado: virar e sair pelo fundo')
        for i in range(12): add('turn-exit',4+i%4,820+35*(i+1),phase='Saída pelo fundo')
        for i in range(14): add('war-run',i%6,1170-i*31,phase='Entrada correndo na arena')
        for i in range(4): add('run-stop',i,760-i*7,phase='Frear antes do ataque')
        if variant=='shoot-low':
            for i in range(4): add('kneel-transition',i,phase='Ajoelhar')
        offsets=[0,0,-30,-65,-85,-70,-35,0] if variant=='shoot-air' else [0]*8
        release_index=None
        for i in range(8):
            if i==5: release_index=len(timeline)
            add(variant,i,dy=offsets[i],phase='Soltar uma flecha' if i==5 else 'Disparo: '+variant)
        if variant=='shoot-low':
            for i in [3,2,1,0]: add('kneel-transition',i,phase='Levantar')
        elif variant=='shoot-air':
            for i in [1,0]: add('kneel-transition',i,phase='Recuperar pouso')
        for i in range(4): add('turn-exit',i,phase='Virar para sair da arena')
        for i in range(16): add('turn-exit',4+i%4,740+32*(i+1),phase='Saída da arena')
        for i in range(10): add('war-run',i%6,1190-i*29,phase='Retorno pelo fundo')
        for i in range(8): add('run-stop',i,820+round(100*(1-i/7)**2),phase='Frear no posto')
        for i in range(12): add('idle',i%4,820,phase='Guarda frontal')
        release=json.loads((OUT/variant/'report.json').read_text())['frameData'][5]['arrowOrigin']
        release_x=740-256+release[0]; release_y=release[1]+offsets[5]
        frames=[]
        for t,(a,i,x,dy,phase) in enumerate(timeline):
            bg=Image.new('RGB',(1100,340),'#30343d');d=ImageDraw.Draw(bg)
            d.line((0,296,1100,296),fill='#727785');d.text((16,16),phase,fill='#eeeeee')
            f=Image.open(OUT/a/f'frame-{i:02}.png');bg.paste(f,(round(x)-256,dy),f.getchannel('A'))
            if release_index is not None and 0<=t-release_index<13:
                age=t-release_index;ax=round(release_x-11-age*65);ay=release_y-12
                bg.paste(arrow,(ax,ay),arrow.getchannel('A'))
            frames.append(bg)
        frames[0].save(OUT/variant/'world-preview.gif',save_all=True,append_images=frames[1:],duration=85,loop=0)
        write(OUT/variant/'demo-timeline.json',{'illustrationOnly':True,'releaseIndex':release_index,'frames':timeline})
    p=OUT/'revisao.html';html=p.read_text(encoding='utf-8')
    insertion='<section><h2>Ciclo completo ilustrativo</h2><p>Deslocamento e salto compostos só para revisar as transições. Sem teste de combate.</p>'
    for a in ['shoot-standing','shoot-low','shoot-air']: insertion+=f'<details><summary>{a}</summary><img src="{a}/world-preview.gif"></details>'
    html=html.replace('<select id="action">',insertion+'</section><select id="action">',1);p.write_text(html,encoding='utf-8')

def finalize():
    reports=[json.loads((OUT/a/'report.json').read_text()) for a in SPECS]
    contract={'character':'Flecha Negra','role':'NPC de guarda / especial do Gremista','base':BASE.relative_to(ROOT).as_posix(),
              'baseSha256':sha(BASE),'animations':reports,'anatomy':{'armA':'direito, retira/encaixa/puxa e solta','armB':'esquerdo, arco SEMPRE','legA':'direita','legB':'esquerda'},
              'special':{'variants':['shoot-standing','shoot-low','shoot-air'],'selectOncePerInvocation':True,'equalProbabilityProposed':True,'oneArrowPerInvocation':True,'releaseFrame':5,
                         'sequence':['idle','turn-exit:2-7 pelo fundo','war-run na arena','frear no ponto escolhido','UMA variante de disparo','turn-exit:0-7','war-run pelo fundo','run-stop','idle'],
                         'worldMotionByEngine':True,'airTrajectoryByEngine':True,'mirrorWholeSequenceOnly':True},
              'turnExit':{'turnFrames':[0,1,2,3],'runLoop':[4,5,6,7],'summonFromFrontalStartsAt':2},
              'lowTransition':{'enter':[0,1,2,3],'exit':[3,2,1,0],'lowShotStaysKneeling':True},
              'air':{'loadFrames':[0,1],'airborneFrames':[2,3,4,5,6],'landingFrame':7,'landingRecovery':'kneel-transition frames 1,0','localHipAnchor':[256,202],'engineSuppliesElevation':True},
              'projectile':json.loads((OUT/'arrow/report.json').read_text()),
              'runtimeModified':False,'status':'Arte produzida e revisada; aprovação visual e integração/teste de combate pendentes',
              'notSet':['dano','hitboxes','velocidade de flecha','balanceamento','cancelamentos','probabilidade definitiva']}
    write(DEST/'manifest-art.json',contract); write(OUT/'report.json',contract)
    checks=[]
    for r in reports:
        im=Image.open(DEST/r['file']); assert im.mode=='RGBA' and im.size==(W*COLS,H*((r['frames']+4)//5))
        assert sha(DEST/r['file'])==r['sha256']
        for i in range(r['frames'],COLS*((r['frames']+4)//5)):
            assert im.crop(((i%5)*W,(i//5)*H,(i%5+1)*W,(i//5+1)*H)).getbbox() is None
        for f in r['frameData']:
            x0,y0,x1,y1=f['visualBounds']; assert 0<x0<x1<W and 0<y0<y1<H
        source=Image.open(OUT/r['action']/'source.png').getchannel('A').point(lambda a:255 if a>=64 else 0); sw,sh=source.size
        for box in [(0,0,sw,1),(0,sh-1,sw,sh),(0,0,1,sh),(sw-1,0,sw,sh)]: assert source.crop(box).getbbox() is None,(r['action'],'source edge')
        checks.append({'action':r['action'],'frames':r['frames'],'rgba':True,'dimensions':True,'clearMargins':True,'unusedCellsEmpty':True,'hashMatches':True})
    write(OUT/'validation.json',checks)
    names={'idle':'Guarda frontal','war-run':'Corrida de aproximação','turn-exit':'Virada e saída','run-stop':'Volta correndo e parada na guarda','shoot-standing':'Flecha reta em pé','shoot-low':'Flecha rasteira agachado','shoot-air':'Salto e flecha aérea','kneel-transition':'Ajoelhar / levantar (ordem inversa)'}
    data=json.dumps(reports,ensure_ascii=False)
    html='<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Flecha Negra — animações</title><style>body{font:16px system-ui;background:#20232a;color:#eee;margin:24px}canvas,img{image-rendering:pixelated;max-width:100%}canvas{background:#50525a}button,select,input{margin:6px;padding:6px}a{color:#6ed2ff}section{margin:32px 0}</style><h1>Flecha Negra — NPC de guarda</h1><p>Prévia de arte. Uma flecha por chamada; três variantes. Integração de combate pendente.</p><select id="action"></select><button id="play">Pausar</button><button id="prev">← Quadro</button><button id="next">Quadro →</button><select id="speed"><option value="1">Normal</option><option value="0.5">Metade</option><option value="0.25">Um quarto</option></select><input id="frame" type="range" min="0" value="0"><p id="info"></p><canvas id="canvas" width="512" height="320"></canvas><canvas id="guard" width="512" height="320"></canvas><p>Guarda à direita, em escala idêntica. A repetição dos ataques serve para revisão.</p>'
    for r in reports:
        a=r['action']; html+=f'<section><h2>{names[a]}</h2><img src="{a}/preview.gif"><details><summary>Fonte, prompt e quadros</summary><a href="{a}/source.png">Fonte</a> · <a href="{a}/prompt.txt">Prompt</a><p><img src="{a}/contact.png"></p></details></section>'
    js="""const DATA=__DATA__,NAMES=__NAMES__;let action=0,frame=0,playing=true,acc=0,last=0;const sel=document.getElementById('action'),slider=document.getElementById('frame'),ctx=document.getElementById('canvas').getContext('2d');ctx.imageSmoothingEnabled=false;const imgs=DATA.map(r=>{const im=new Image();im.src='../../public/assets/npcs/flecha-negra/base-v1/'+r.file;im.onload=draw;return im});DATA.forEach((r,i)=>{const o=document.createElement('option');o.value=i;o.textContent=NAMES[r.action];sel.append(o)});const guard=new Image();guard.src='guard.png';guard.onload=()=>document.getElementById('guard').getContext('2d').drawImage(guard,0,0);function draw(){const r=DATA[action];slider.max=r.frames-1;slider.value=frame;ctx.clearRect(0,0,512,320);if(imgs[action].complete&&imgs[action].naturalWidth)ctx.drawImage(imgs[action],frame%5*512,Math.floor(frame/5)*320,512,320,0,0,512,320);document.getElementById('info').textContent='Quadro '+frame+'/'+(r.frames-1)+(r.releaseFrame===frame?' — soltar UMA flecha':'')}function pause(){playing=false;document.getElementById('play').textContent='Reproduzir'}sel.onchange=()=>{action=Number(sel.value);frame=0;acc=0;draw()};slider.oninput=()=>{pause();frame=Number(slider.value);draw()};document.getElementById('play').onclick=()=>{playing=!playing;document.getElementById('play').textContent=playing?'Pausar':'Reproduzir'};document.getElementById('prev').onclick=()=>{pause();frame=(frame+DATA[action].frames-1)%DATA[action].frames;draw()};document.getElementById('next').onclick=()=>{pause();frame=(frame+1)%DATA[action].frames;draw()};function tick(t){if(!last)last=t;const dt=Math.min(t-last,100);last=t;if(playing){acc+=dt*Number(document.getElementById('speed').value);const r=DATA[action];if(acc>=r.durationsMs[frame]){acc-=r.durationsMs[frame];frame=(frame+1)%r.frames;draw()}}requestAnimationFrame(tick)}draw();requestAnimationFrame(tick);""".replace('__DATA__',data).replace('__NAMES__',json.dumps(names,ensure_ascii=False))
    (OUT/'viewer.js').write_text(js,encoding='utf-8'); (OUT/'revisao.html').write_text(html+'<script src="viewer.js"></script></html>',encoding='utf-8')
    paths=[OUT/'guard.png']+[OUT/r['action']/f"frame-{r.get('releaseFrame',2):02}.png" for r in reports]
    compare=Image.new('RGB',(W*4,H*2*((len(paths)+3)//4))); d=ImageDraw.Draw(compare)
    for i,p in enumerate(paths):
        f=Image.open(p)
        for row,bg in enumerate(['#eeeeee','#222222']):
            x=i%4*W;y=(i//4*2+row)*H; d.rectangle((x,y,x+W,y+H),fill=bg);compare.paste(f,(x,y),f.getchannel('A'))
    compare.save(OUT/'guard-comparison.png')
    print('PASS:',len(reports),'RGBA sheets,',sum(r['frames'] for r in reports),'frames; dimensions, margins, hashes, empty cells. Combat integration pending.')

if __name__=='__main__':
    command=sys.argv[1]
    if command=='prepare': prepare()
    elif command=='inspect':
        im=Image.open(OUT/sys.argv[2]/'source.png').convert('RGBA'); rows=int(sys.argv[3]); print(im.size,[p[1] for p in ordered(im,rows)])
    elif command=='mount': mount(sys.argv[2])
    elif command=='projectile': projectile()
    elif command=='demos': demos()
    elif command=='finalize': finalize()
