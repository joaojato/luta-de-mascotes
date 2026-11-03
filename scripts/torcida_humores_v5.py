"""Monta as fontes de imagem da torcida quieta/brava e extrai o copo desenhado na mao."""
from pathlib import Path
from collections import deque
from PIL import Image
import json,hashlib
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/torcida-humores-v5'
DEST=ROOT/'public/assets/cenarios/estadio/torcida'

def extract(im):
    alpha=im.getchannel('A').point(lambda a:255 if a>=192 else 0);px=alpha.load();seen=set();groups=[]
    for y in range(im.height):
        for x in range(im.width):
            if not px[x,y] or (x,y) in seen:continue
            queue=deque([(x,y)]);seen.add((x,y));g=[]
            while queue:
                xx,yy=queue.popleft();g.append((xx,yy))
                for nx,ny in ((xx-1,yy),(xx+1,yy),(xx,yy-1),(xx,yy+1)):
                    if 0<=nx<im.width and 0<=ny<im.height and (nx,ny) not in seen and px[nx,ny]:
                        seen.add((nx,ny));queue.append((nx,ny))
            if len(g)>1000:groups.append(g)
    assert len(groups)==40,f'Esperados 40 corpos; encontrados {len(groups)}'
    boxes=[(min(x for x,y in g),min(y for x,y in g),max(x for x,y in g)+1,max(y for x,y in g)+1,g) for g in groups]
    boxes.sort(key=lambda b:(b[1]+b[3])/2)
    ordered=[]
    for row in range(10):ordered.extend(sorted(boxes[row*4:row*4+4],key=lambda b:b[0]))
    return ordered

def build(action,shirt=False):
    suffix='-camisa' if shirt else '';sourcefile=OUT/f'{action}{suffix}-fonte.png'
    im=Image.open(sourcefile).convert('RGBA')
    if shirt:
        px=im.load()
        for y in range(im.height):
            for x in range(im.width):
                r,g,b,a=px[x,y]
                if a and r>60 and b>60 and g<min(r,b)*.4 and b>r*.6:
                    v=min((112,176,255),key=lambda v:abs(v-max(r,b)));px[x,y]=(v,0,v,a)
    boxes=extract(im);sheet=Image.new('RGBA',(256,800));frames=[]
    for i,(x0,y0,x1,y1,group) in enumerate(boxes):
        body=im.crop((x0,y0,x1,y1));mask=Image.new('L',body.size)
        for x,y in group:mask.putpixel((x-x0,y-y0),255)
        body.putalpha(mask);body=body.resize((round(body.width*.4),round(body.height*.4)),Image.Resampling.NEAREST)
        assert body.width<=62 and body.height<=76,(action,i,body.size)
        frame=Image.new('RGBA',(64,80));frame.alpha_composite(body,((64-body.width)//2,79-body.height))
        if shirt:assert sum(1 for r,g,b,a in frame.get_flattened_data() if a and r==b and g==0 and r in (112,176,255))>50
        frame.save(OUT/f'{action}{suffix}-{i:02}.png');frames.append(frame)
        sheet.alpha_composite(frame,((i%4)*64,(i//4)*80))
    filename=f'torcida-{action}-v5{suffix}.png';sheet.save(DEST/filename)
    contact=Image.new('RGBA',sheet.size,'#363941');contact.alpha_composite(sheet)
    contact.resize((384,1200),Image.Resampling.NEAREST).save(OUT/f'{action}{suffix}-contato.png')
    gifs=[]
    for q in range(4):
        preview=Image.new('RGBA',(640,80),'#363941')
        for typ in range(10):preview.alpha_composite(frames[typ*4+q],(typ*64,0))
        gifs.append(preview.convert('RGB').resize((960,120),Image.Resampling.NEAREST))
    gifs[0].save(OUT/f'{action}{suffix}.gif',save_all=True,append_images=gifs[1:],duration=333 if action=='quieta' else 167,loop=0)
    return {'arquivo':filename,'escalaUniforme':.4,'fonteSha256':hashlib.sha256(sourcefile.read_bytes()).hexdigest(),
            'sha256':hashlib.sha256((DEST/filename).read_bytes()).hexdigest(),'recortes':[b[:4] for b in boxes],'caixas':[f.getbbox() for f in frames]}

def cup():
    im=Image.open(OUT/'brava-fonte.png').convert('RGBA');cell=im.crop((0,0,im.width//4,im.height//10))
    white=[(x,y) for y in range(round(cell.height*.72),cell.height) for x in range(cell.width) if cell.getpixel((x,y))[3]>192 and min(cell.getpixel((x,y))[:3])>180]
    assert white,'Copo branco da primeira pose ausente'
    box=(min(x for x,y in white)-2,min(y for x,y in white)-2,max(x for x,y in white)+3,max(y for x,y in white)+3)
    body=cell.crop(box);px=body.load()
    for y in range(body.height):
        for x in range(body.width):
            r,g,b,a=px[x,y]
            if r>g>b and r-b>30:px[x,y]=(0,0,0,0)
            elif a<192:px[x,y]=(0,0,0,0)
            else:px[x,y]=(r,g,b,255)
    body=body.resize((round(body.width*.4),round(body.height*.4)),Image.Resampling.NEAREST)
    assert max(body.size)<=22
    canvas=Image.new('RGBA',(24,24));canvas.alpha_composite(body,((24-body.width)//2,(24-body.height)//2))
    canvas.save(DEST/'torcida-copo-v5.png');canvas.resize((240,240),Image.Resampling.NEAREST).save(OUT/'copo.png')

if __name__=='__main__':
    report={a+('-camisa' if shirt else ''):build(a,shirt) for a in ('quieta','brava') for shirt in (False,True)}
    cup()
    report['referencias']={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in (OUT/'referencia-base.png',OUT/'referencia-camisa.png')}
    (OUT/'relatorio.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    manifest={a:{'arquivo':f'torcida-{a}-v5.png','arquivoVestido':f'torcida-{a}-v5-camisa.png','celulaLargura':64,'celulaAltura':80,'colunas':4,'linhas':10,'tipos':10,'quadrosPorTipo':4,'fps':3 if a=='quieta' else 6,'ancora':{'x':32,'y':79}} for a in ('quieta','brava')}
    manifest['objeto']={'arquivo':'torcida-copo-v5.png','largura':24,'altura':24,'quadroSoltura':2,'limiteSimultaneo':12}
    (DEST/'humores-v5.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False),encoding='utf-8')
    print('160 quadros novos e copo extraido da fonte; manifesto e relatorio salvos.')
