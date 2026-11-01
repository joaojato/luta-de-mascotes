"""Latinha proporcional, rotação rígida e prévia do emissor de gotas."""
from pathlib import Path
from PIL import Image,ImageDraw
import json,math,hashlib,shutil
from coxa_revisao_v2 import outputs
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'output/coxa-v4'
def data(p):return json.loads(p.read_text(encoding='utf-8'))
def save(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2),encoding='utf-8')
def put(im,src,xy):im.alpha_composite(src,tuple(round(v) for v in xy))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
master=Image.open(OUT/'efeitos/beer-can-master/frame-00.png').convert('RGBA');master=master.crop(master.getbbox());(OUT/'efeitos').mkdir(exist_ok=True);master.save(OUT/'efeitos/latinha.png')
spin=OUT/'efeitos/beer-can-spin';spin.mkdir(exist_ok=True);sheet=Image.new('RGBA',(160,64));rotations=[]
for i in range(8):
    rotated=master.rotate(i*45,resample=Image.Resampling.NEAREST,expand=True);cell=Image.new('RGBA',(32,32));put(cell,rotated,((32-rotated.width)//2,(32-rotated.height)//2));cell.save(spin/f'frame-{i:02}.png');put(sheet,cell,((i%5)*32,(i//5)*32));rotations.append(cell)
sheet.save(spin/'sheet.png');save(spin/'report.json',{'action':'beer-can','frames':8,'fps':16,'cell':[32,32],'columns':5,'nativeCanSize':master.size,'source':'output/coxa-v4/efeitos/beer-can-master/source.png','source_sha256':sha(OUT/'efeitos/beer-can-master/source.png'),'method':'mesma imagem girada com nearest; sem escala por orientação'})
previews=[]
for cell in rotations:
    bg=Image.new('RGBA',cell.size,'#333842');bg.alpha_composite(cell);previews.append(bg.resize((256,256),Image.Resampling.NEAREST).convert('RGB'))
previews[0].save(spin/'zoom-preview.gif',save_all=True,append_images=previews[1:],duration=90,loop=0)
for action in ('beer-throw','special-charge'):
    folder=OUT/'normal'/action;r=data(folder/'report.json');props=data(folder/'props.json');byframe={p['frame']:p for p in props};frames=[]
    for i in range(r['frames']):
        body=Image.open(folder/f'frame-{i:02}.png').convert('RGBA');cell=body.copy();cell.alpha_composite(Image.open(folder/f'walker-layer-{i:02}.png').convert('RGBA'))
        support=(246,198) if action=='beer-throw' else (309,200)
        for hx,hy in [support]:
            for b in ((hx-5,hy-5,hx-2,hy+5),(hx+2,hy-5,hx+5,hy+5)):put(cell,body.crop(b),(b[0],b[1]))
        cell.save(folder/f'no-can-{i:02}.png')
        if i in byframe:
            p=byframe[i];x,y=p['center'];obj=master.rotate(p['angle'],resample=Image.Resampling.NEAREST,expand=True);put(cell,obj,(x-obj.width/2,y-obj.height/2))
            if not p.get('released',False):
                for b in [(round(x-4),round(y+1),round(x-3),round(y+5)),(round(x+3),round(y+1),round(x+4),round(y+5))]:put(cell,body.crop(b),(b[0],b[1]))
            p.update(nativeSize=list(master.size),scale=1,source='efeitos/latinha.png')
        frames.append(cell)
    outputs(folder,frames,r['fps']);save(folder/'props.json',props)
# Prévia ilustrativa na mesma escala das sprites, sem alterar o runtime.
actor=OUT/'normal/beer-throw';props={p['frame']:p for p in data(actor/'props.json')};release=props[6]['center'];actor_offset=500;release_time=6/14;rate=24;duration=2.2;flight_limit=1.4;drops=[Image.open(OUT/'efeitos/beer-drops-v4'/f'frame-{i:02}.png').convert('RGBA') for i in range(6)]
def projectile(t):return (release[0]+actor_offset-420*t,release[1]-320*t+.5*600*t*t)
def opening(t):
    x,y=projectile(t);phase=(6+int(t*16))%8;a=math.radians(phase*45);return (x-6*math.sin(a),y-6*math.cos(a))
frames=[];snapshots=[]
for k in range(math.ceil(duration*rate)):
    t=k/rate;phase=min(9,int(t*14));stage=Image.new('RGBA',(1024,320),'#333842');put(stage,Image.open(actor/f'no-can-{phase:02}.png').convert('RGBA'),(actor_offset,0));d=ImageDraw.Draw(stage);d.text((20,18),'Escala 1x: corpo ~200 px | lata 8x14 px | gotas separadas',fill='#eeeeee')
    if phase in (3,4,5):
        p=props[phase];obj=master.rotate(p['angle'],resample=Image.Resampling.NEAREST,expand=True);put(stage,obj,(p['center'][0]+actor_offset-obj.width/2,p['center'][1]-obj.height/2))
    tr=t-release_time
    if 0<=tr<=flight_limit:
        x,y=projectile(tr);canphase=(6+int(tr*16))%8;put(stage,rotations[canphase],(x-16,y-16))
    for birth in range(max(0,int(max(tr,0)*24)+1)):
        bt=birth/24;age=tr-bt
        if not 0<=age<.3 or bt>flight_limit:continue
        sx,sy=opening(bt);vx=-42+((birth*7)%17-8);vy=18+(birth%4)*5;x=sx+vx*age;y=sy+vy*age+.5*900*age*age;frame=min(5,int(age*20));put(stage,drops[frame],(x-8,y-8))
    frames.append(stage.convert('RGB'))
    if k in (18,23,29):snapshots.append(stage.copy())
frames[0].save(OUT/'beer-flight.gif',save_all=True,append_images=frames[1:],duration=round(1000/rate),loop=0)
snapshots[1].convert('RGB').save(OUT/'beer-flight-contact.png')
scale=Image.new('RGBA',(512,320),'#eeeeee');put(scale,Image.open(actor/'composed-03.png').convert('RGBA'),(0,0));d=ImageDraw.Draw(scale);d.text((15,15),'Lata proporcional na mao: 8x14 px',fill='#111111');zoom=master.resize((master.width*8,master.height*8),Image.Resampling.NEAREST);put(scale,zoom,(60,110));d.text((30,235),'Detalhe 8x',fill='#111111');scale.convert('RGB').save(OUT/'beer-scale.png')
guide={'status':'contrato visual e preview; integrar no sistema de projétil, sem runtime alterado','characterReferenceHeight':200,'can':{'file':'efeitos/beer-can.png','cell':[32,32],'frames':8,'columns':5,'fps':16,'nativeSize':list(master.size),'scale':1,'scaleRule':'usar a mesma escala visual do lutador; nao esticar para preencher a celula','rotation':'mesma lata, escala constante'},'throw':{'action':'beer-throw','frames':10,'fpsProposed':14,'hand':'left-near','retrievePocketFrames':[1,2,3],'heldFrames':[3,4,5],'releaseFrame':6,'releasePoint':release,'trajectoryReference':'Saci: speed420, launchVy320, gravity600; adaptar no responsavel pela logica'},'drips':{'file':'efeitos/beer-drops.png','cell':[16,16],'frames':6,'columns':5,'fps':20,'nativeClusterMaxHeight':5,'emitOnly':'durante voo da lata','spawnFrom':'abertura da lata transformada pela rotacao','previewRate':24,'lifetimeSeconds':.3,'gravityPreview':900,'inheritsHorizontalVelocityFraction':.1,'damage':0,'parenting':'particulas soltam do projetil e caem; nao acompanham rigidamente a lata'}}
save(OUT/'beer-emitter.json',guide);print('Latinha nativa',master.size,'/8 orientações rígidas; gotas5px; prévia com corpo/andador e emissão em voo.')
