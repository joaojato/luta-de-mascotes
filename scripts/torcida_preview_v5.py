"""Previa offline: mesmos atores, tres corredores e ordem estrutural do runtime."""
from pathlib import Path
from PIL import Image,ImageDraw
from functools import lru_cache
import json
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'output/torcida-humores-v5';DEST=ROOT/'public/assets/cenarios/estadio/torcida'
snapshots=json.loads((OUT/'previa-posicoes.json').read_text(encoding='utf-8'))
meta=json.loads((DEST/'cadeiras-camadas-v5.json').read_text(encoding='utf-8'))
background=Image.open(DEST/'arquibancada-vazia.png').convert('RGBA')
chairs=Image.open(DEST/'cadeiras-camadas-v5.png').convert('RGBA')
chair_frames=[chairs.crop((0,c['topo'],2048,c['base']+1)) for c in meta['camadas']]
names={'torcendo':'torcedores-comemoracao-v3-camisa.png','quieta':'torcida-quieta-v5-camisa.png','brava':'torcida-brava-v5-camisa.png','irritada':'torcida-brava-v5-camisa.png',
       'andar':'torcida-andar-v4-camisa.png','descer':'torcida-descer-v4-camisa.png','copo':'torcida-copo-v5.png'}
sheets={a:Image.open(DEST/f).convert('RGBA') for a,f in names.items()}

@lru_cache(maxsize=4096)
def tile(action,index,scale,lado):
    if action=='copo':frame=sheets[action].copy()
    else:
        cols=8 if action in ('andar','descer') else 4;h=112 if cols==8 else 80
        frame=sheets[action].crop(((index%cols)*64,(index//cols)*h,(index%cols+1)*64,(index//cols+1)*h))
        px=frame.load();color=(176,16,16) if lado==0 else (24,96,216)
        for y in range(frame.height):
            for x in range(frame.width):
                r,g,b,a=px[x,y]
                if a and max(r,b)>60 and abs(r-b)<max(r,b)*.12+6 and g<max(r,b)*.2:
                    v=max(r,b)/255;px[x,y]=(*(round(c*v) for c in color),a)
    return frame.resize((max(1,round(frame.width*scale)),max(1,round(frame.height*scale))),Image.Resampling.NEAREST)

def draw_person(scene,p):
    action=p['action'];f=tile(action,p['frame'],round(p['s'],3),p.get('lado',0))
    if p.get('flip'):f=f.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    if action=='copo':
        f=f.rotate(-p.get('angle',0),resample=Image.Resampling.NEAREST,expand=True)
        x=round(p['x']-f.width/2);y=round(p['y']-f.height/2)
    else:
        anchor=111 if action in ('andar','descer') else 80
        x=round(p['x']-f.width/2);y=round(p['y']-anchor*p['s'])
    scene.alpha_composite(f,(x,y))

def compose(snapshot):
    scene=background.copy();groups=[[] for _ in range(14)]
    for p in snapshot['parados']+snapshot['objetos']+sorted(snapshot['andando'],key=lambda p:p['y']):groups[p['camada']].append(p)
    for i,group in enumerate(groups):
        if i<13:scene.alpha_composite(chair_frames[i],(0,meta['camadas'][i]['topo']))
        for p in group:draw_person(scene,p)
    scene.alpha_composite(background.crop((0,624,2048,869)),(0,624))
    return scene

frames=[]
for i,snapshot in enumerate(snapshots):
    scene=compose(snapshot)
    if i in (0,10,30,60,95,len(snapshots)-1):scene.save(OUT/f'estadio-{i:03}.png')
    scene=scene.resize((768,326),Image.Resampling.NEAREST)
    frame=Image.new('RGB',(768,352),'#181b21');frame.paste(scene,(0,0))
    t=snapshot['t'];label='Espera tranquila' if t<4 else 'Verde x vermelho: irritacao, arremesso raro 1/15' if t<9 else 'Saidas individuais apos derrota' if t<20 else 'Apos round perdido: amarelo contra verde, saida 1/60' if t<30 else 'Vermelho contra verde: 35% extras + sorteios individuais' if t<45 else 'Derrota final: restante indo embora'
    ImageDraw.Draw(frame).text((8,334),f"{label} | {t:.1f} s simulados | previa offline acelerada",fill='white')
    frames.append(frame)
palette=frames[0].quantize(colors=256,method=Image.Quantize.MEDIANCUT)
indexed=[frame.quantize(palette=palette,dither=Image.Dither.NONE) for frame in frames]
indexed[0].save(OUT/'torcida-v5.gif',save_all=True,append_images=indexed[1:],duration=125,loop=0,optimize=False)

# Regressao visual isolada: pernas sobre cadeiras vazias no modelo anterior.
walker={'x':700,'y':332,'s':.845,'action':'andar','frame':4,'camada':1}
lower={'x':735,'y':340,'s':.855,'action':'quieta','frame':0,'camada':2,'lado':0}
old=background.copy();draw_person(old,walker);draw_person(old,lower)
new=compose({'parados':[lower],'andando':[walker],'objetos':[]})
covered=sum(1 for y in range(316,333) for x in range(680,718) if old.getpixel((x,y))!=new.getpixel((x,y)) and chairs.getpixel((x,y))[3])
assert covered>0,'A cadeira da fileira inferior nao cobriu as pernas.'
comparison=Image.new('RGB',(1000,330),'#181b21')
for i,(im,title) in enumerate(((old,'ANTES: pernas sobre as cadeiras'),(new,'AGORA: cadeira inferior cobre as pernas'))):
    crop=im.crop((600,240,850,390)).resize((500,300),Image.Resampling.NEAREST)
    comparison.paste(crop,(i*500,25));ImageDraw.Draw(comparison).text((i*500+10,8),title,fill='white')
comparison.save(OUT/'comparacao-camadas.png')

routes=json.loads((OUT/'rotas-3-corredores.json').read_text(encoding='utf-8'));map_image=background.copy();draw=ImageDraw.Draw(map_image)
colors=['#52ffbd','#ffd766','#63bdff']
for r in routes:
    points=[(p['x'],p['y']) for p in r['rota'][1:-1]]
    draw.line(points,fill=colors[r['corredor']],width=4)
    for x,y in points:draw.ellipse((x-3,y-3,x+3,y+3),fill=colors[r['corredor']])
draw.text((650,640),'3 corredores por escada: largadas, ritmos e pequenos desvios individuais',fill='white',stroke_width=2,stroke_fill='black')
map_image.save(OUT/'mapa-tres-corredores.png')
(OUT/'validacao-visual.json').write_text(json.dumps({'pixelsDePernaCobertosNoExemplo':covered,'quadrosPrevia':len(frames)},indent=2),encoding='utf-8')
print(f'Previa e comparacao salvas. {covered} pixels de pernas cobertos pelas cadeiras no exemplo.')
