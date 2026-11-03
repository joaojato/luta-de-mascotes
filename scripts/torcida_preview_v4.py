"""Renderiza, offline, as posicoes produzidas pelo controlador real em torcida_preview_v4.mjs."""
from pathlib import Path
from PIL import Image,ImageDraw
from functools import lru_cache
import json
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/torcida-circulacao-v4'
DEST=ROOT/'public/assets/cenarios/estadio/torcida'
snapshots=json.loads((OUT/'previa-posicoes.json').read_text(encoding='utf-8'))
background=Image.open(DEST/'arquibancada-vazia.png').convert('RGBA')
sheets={'parado':Image.open(DEST/'torcedores-comemoracao-v3-camisa.png').convert('RGBA'),
        'andar':Image.open(DEST/'torcida-andar-v4-camisa.png').convert('RGBA'),
        'descer':Image.open(DEST/'torcida-descer-v4-camisa.png').convert('RGBA')}

@lru_cache(maxsize=4096)
def tile(action,typ,phase,scale,lado):
    cols=4 if action=='parado' else 8
    height=80 if action=='parado' else 112
    index=typ*4+phase
    frame=sheets[action].crop(((index%cols)*64,(index//cols)*height,(index%cols+1)*64,(index//cols+1)*height))
    px=frame.load();color=(176,16,16) if lado==0 else (24,96,216)
    for y in range(height):
        for x in range(64):
            r,g,b,a=px[x,y]
            if a and max(r,b)>60 and abs(r-b)<max(r,b)*.12+6 and g<max(r,b)*.2:
                value=max(r,b)/255;px[x,y]=(*(round(c*value) for c in color),a)
    return frame.resize((round(64*scale),round(height*scale)),Image.Resampling.NEAREST)

frames=[]
for i,snapshot in enumerate(snapshots[:196]):
    scene=background.copy();drawables=[]
    for p in snapshot['parados']:
        f=tile('parado',p['tipo'],(i+p['tipo'])%4,round(p['s'],3),p['lado'])
        drawables.append((p['y']+20*p['s'],f,round(p['x']-f.width/2),round(p['y']-f.height)))
    for p in snapshot['andando']:
        action,typ=p['anim'].split(':');lado=0
        f=tile(action,int(typ),i%4,round(p['s'],3),lado)
        if p['flip']: f=f.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
        drawables.append((p['y'],f,round(p['x']-f.width/2),round(p['y']-111*p['s'])))
    for depth,f,x,y in sorted(drawables,key=lambda a:a[0]):scene.alpha_composite(f,(x,y))
    scene.alpha_composite(background.crop((0,624,2048,869)),(0,624))
    scene=scene.resize((1024,435),Image.Resampling.NEAREST)
    frame=Image.new('RGB',(1024,463),'#181b21');frame.paste(scene,(0,0))
    label='Antes da derrota' if snapshot['t']<1 else 'Derrota para verde: saida de 35%' if snapshot['t']<25 else 'Nova pressao verde x vermelho: mais 35% (70% total)' if snapshot['t']<70 else 'Derrota decisiva: restante vai embora'
    ImageDraw.Draw(frame).text((12,443),f"{label} | {snapshot['t']:.0f} s simulados | {len(snapshot['parados'])} nos lugares, {len(snapshot['andando'])} saindo | previa offline acelerada",fill='white')
    frames.append(frame)
    if i in (0,30,70,120,190):frame.save(OUT/f'estadio-{i:03}.png')
frames[0].save(OUT/'saida-coletiva.gif',save_all=True,append_images=frames[1:],duration=100,loop=0)
print('Previa offline animada: saida-coletiva.gif')
