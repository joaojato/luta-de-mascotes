"""Monta as fontes generativas, registra referencias e desenha o mapa de circulacao.

Arte corporal e variantes vestidas vem da ferramenta de imagens; nenhum membro
ou figurino e redesenhado por script. Apenas a chave magenta e normalizada.
"""
from pathlib import Path
from collections import deque
from PIL import Image, ImageDraw
import hashlib, json

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/torcida-circulacao-v4'
DEST=ROOT/'public/assets/cenarios/estadio/torcida'
MAP=json.loads((DEST/'circulacao-v4.json').read_text(encoding='utf-8'))

def components(im):
    alpha=im.getchannel('A').point(lambda a:255 if a>=192 else 0)
    px=alpha.load(); seen=set(); groups=[]
    for y in range(im.height):
        for x in range(im.width):
            if not px[x,y] or (x,y) in seen: continue
            q=deque([(x,y)]); seen.add((x,y)); group=[]
            while q:
                xx,yy=q.popleft(); group.append((xx,yy))
                for nx,ny in ((xx-1,yy),(xx+1,yy),(xx,yy-1),(xx,yy+1)):
                    if 0<=nx<im.width and 0<=ny<im.height and (nx,ny) not in seen and px[nx,ny]:
                        seen.add((nx,ny)); q.append((nx,ny))
            if len(group)>1000:
                groups.append(group)
    if len(groups)!=40: raise ValueError(f'Esperados 40 corpos conectados; encontrados {len(groups)}')
    boxes=[]
    for g in groups:
        boxes.append((min(x for x,y in g),min(y for x,y in g),max(x for x,y in g)+1,max(y for x,y in g)+1,g))
    boxes.sort(key=lambda b:(b[1]+b[3])/2)
    ordered=[]
    for row in range(5): ordered.extend(sorted(boxes[row*8:row*8+8],key=lambda b:b[0]))
    return ordered

def build(action,costume=False):
    suffix='-camisa' if costume else ''
    source=Image.open(OUT/f'{action}{suffix}-fonte.png').convert('RGBA')
    if costume:
        px=source.load()
        for y in range(source.height):
            for x in range(source.width):
                r,g,b,a=px[x,y]
                if a and r>60 and b>60 and g<min(r,b)*.4 and b>r*.6:
                    value=min((112,176,255),key=lambda v:abs(v-max(r,b)))
                    px[x,y]=(value,0,value,a)
    boxes=components(source)
    sheet=Image.new('RGBA',(512,560)); frames=[]
    for i,(x0,y0,x1,y1,group) in enumerate(boxes):
        body=source.crop((x0,y0,x1,y1)); mask=Image.new('L',body.size)
        for x,y in group: mask.putpixel((x-x0,y-y0),255)
        body.putalpha(mask)
        body=body.resize((round(body.width*.44),round(body.height*.44)),Image.Resampling.NEAREST)
        if body.width>60 or body.height>105: raise ValueError(f'Quadro {i} excede margens: {body.size}')
        frame=Image.new('RGBA',(64,112)); frame.alpha_composite(body,((64-body.width)//2,111-body.height))
        box=frame.getbbox()
        assert box and box[0]>0 and box[1]>0 and box[2]<64 and box[3]==111
        if costume:
            chave=sum(1 for r,g,b,a in frame.get_flattened_data() if a and r==b and g==0 and r in (112,176,255))
            assert chave>50, f'Camisa sem chave suficiente: {action} {i}'
        frames.append(frame)
        sheet.alpha_composite(frame,((i%8)*64,(i//8)*112))
        frame.save(OUT/f'{action}{suffix}-{i:02}.png')
    sheet.save(DEST/f'torcida-{action}-v4{suffix}.png')
    contact=Image.new('RGBA',sheet.size,'#363941');contact.alpha_composite(sheet)
    contact.resize((768,840),Image.Resampling.NEAREST).save(OUT/f'{action}{suffix}-contato.png')
    gifs=[]
    for t in range(4):
        contact=Image.new('RGBA',(640,112),'#363941')
        for typ in range(10): contact.alpha_composite(frames[typ*4+t],(typ*64,0))
        gifs.append(contact.convert('RGB').resize((960,168),Image.Resampling.NEAREST))
    gifs[0].save(OUT/f'{action}{suffix}.gif',save_all=True,append_images=gifs[1:],duration=125 if action=='andar' else 167,loop=0)
    return {'escala':.44,'recortes':[b[:4] for b in boxes],'caixas':[f.getbbox() for f in frames],'fonte_sha256':hashlib.sha256((OUT/f'{action}{suffix}-fonte.png').read_bytes()).hexdigest(),'sha256':hashlib.sha256((DEST/f'torcida-{action}-v4{suffix}.png').read_bytes()).hexdigest()}

def map_preview():
    im=Image.open(DEST/'arquibancada-vazia.png').convert('RGBA'); draw=ImageDraw.Draw(im)
    for n in MAP['niveis']:
        y=n['peY'];x=n['escadaEsquerdaX']
        draw.line((x,y,2048-x,y),fill='#ffcb55',width=2)
        draw.text((980,y-15),f"nivel {n['nivel']}",fill='white',stroke_width=2,stroke_fill='black')
        for px in (x,2048-x): draw.ellipse((px-6,y-6,px+6,y+6),fill='#52ffbd')
    for right in (False,True):
        points=[(2048-n['escadaEsquerdaX'] if right else n['escadaEsquerdaX'],n['peY']) for n in MAP['niveis']]
        draw.line(points,fill='#52ffbd',width=5)
    draw.line((0,623,2048,623),fill='#ff6666',width=5)
    draw.text((650,640),'NIVEL 0 / corredor atras do alambrado -> saidas fora do quadro',fill='white',stroke_width=2,stroke_fill='black')
    im.save(OUT/'mapa-arquibancada.png')

if __name__=='__main__':
    OUT.mkdir(parents=True,exist_ok=True)
    report={a+('-camisa' if c else ''):build(a,c) for a in ('andar','descer') for c in (False,True)}
    report['referencias']={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in (OUT/'referencia.png',DEST/'arquibancada-vazia.png')}
    (OUT/'relatorio.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    map_preview()
    print('160 quadros montados; bases, variantes generativas e mapa salvos.')
