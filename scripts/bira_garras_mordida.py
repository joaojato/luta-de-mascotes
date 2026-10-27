"""Pack generated Bira artwork and previews, without changing combat files."""
import json
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageChops, ImageFilter
from collections import deque
from urubu_meteoro import cells_from
from skins_urubu import bbox

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/bira-garras-mordida'
DEST=ROOT/'public/assets/lutadores/cachorro/urubu-v1'

def isolate_cell(c):
    """Crop away disconnected fragments of neighboring grid figures, no redraw."""
    mask={(i%c.width,i//c.width) for i,a in enumerate(c.getchannel('A').tobytes()) if a>32}
    regions=[]
    while mask:
        x,y=mask.pop()
        queue=deque([(x,y)])
        count=0;left=right=int(x);top=bottom=int(y);pixels=[]
        while queue:
            px,py=queue.popleft();count+=1;pixels.append((px,py))
            left=min(left,px);right=max(right,px);top=min(top,py);bottom=max(bottom,py)
            for dx,dy in [(1,0),(-1,0),(0,1),(0,-1),(1,1),(-1,-1),(1,-1),(-1,1)]:
                nx,ny=px+dx,py+dy
                if (nx,ny) in mask:
                    mask.remove((nx,ny));queue.append((nx,ny))
        regions.append((count,(left,top,right+1,bottom+1),pixels))
    regions.sort(key=lambda r:r[0],reverse=True)
    keep=Image.new('L',c.size);draw=ImageDraw.Draw(keep)
    for count,box,pixels in regions:
        if count>=regions[0][0]*.01:draw.point(pixels,fill=255)
    keep=keep.filter(ImageFilter.MaxFilter(3))
    result=c.copy();result.putalpha(ImageChops.multiply(c.getchannel('A'),keep))
    return result

def main():
    report=[]
    for item in json.loads((OUT/'manifest.json').read_text()):
        if item['body']:
            cells=cells_from(item)
            if item['id']=='bite':cells=[isolate_cell(c) if i in (4,5) else c for i,c in enumerate(cells)]
            figures=[c.crop(bbox(c)) for c in cells]
            standing=figures[11 if item['id']=='bite' else 0]
            scale=min(200/standing.height,244/max(f.width for f in figures),244/max(f.height for f in figures))
        else:
            src=Image.open(item['source']).convert('RGBA')
            cells=[src.crop((round(i%item['cols']*src.width/item['cols']),round(i//item['cols']*src.height/item['rows']),round((i%item['cols']+1)*src.width/item['cols']),round((i//item['cols']+1)*src.height/item['rows']))) for i in range(item['frames'])]
        sheet=Image.new('RGBA',(1280,math.ceil(item['frames']/5)*256))
        frames=[]
        for i,c in enumerate(cells):
            f=Image.new('RGBA',(256,256))
            if item['body']:
                fig=figures[i].resize((round(figures[i].width*scale),round(figures[i].height*scale)),Image.Resampling.NEAREST)
                f.alpha_composite(fig,((256-fig.width)//2,228-fig.height))
            else:
                c.thumbnail((236,236),Image.Resampling.NEAREST)
                f.alpha_composite(c,((256-c.width)//2,(256-c.height)//2))
            b=bbox(f)
            assert b and min(b[:2])>0 and max(b[2:])<256,(item['id'],i,b)
            frames.append(f)
            sheet.alpha_composite(f,(i%5*256,i//5*256))
        sheet.save(item['dest'])
        assert sheet.getchannel('A').getextrema()[0]==0
        for i in range(item['frames'],5*math.ceil(item['frames']/5)):
            assert not bbox(sheet.crop((i%5*256,i//5*256,i%5*256+256,i//5*256+256)))
        contact=Image.new('RGB',(item['cols']*256,item['rows']*280),'#26313d');d=ImageDraw.Draw(contact)
        gif=[]
        for i,f in enumerate(frames):
            x,y=i%item['cols']*256,i//item['cols']*280
            contact.paste(f,(x,y+24),f);d.text((x+8,y+6),str(i),fill='white')
            bg=Image.new('RGBA',(256,256),'#26313d');bg.alpha_composite(f);gif.append(bg.convert('RGB'))
        contact.save(OUT/(item['id']+'-contact.png'))
        gif[0].save(OUT/(item['id']+'-preview.gif'),save_all=True,append_images=gif[1:],duration=round(1000/item['fps']),loop=0)
        report.append(dict(id=item['id'],file=item['file'],frames=item['frames'],fps=item['fps'],columns=5,frameWidth=256,frameHeight=256,frameBoxes=[bbox(f) for f in frames]))
    (OUT/'art-contract.json').write_text(json.dumps(report,indent=2))
    preview()
    print('Verified 5 transparent sheets, 39 frames, internal margins, empty trailing cells. Runtime untouched.')

def preview():
    sheets={s['id']:Image.open(s['dest']).convert('RGBA') for s in json.loads((OUT/'manifest.json').read_text())}
    for key,file in [('idle',DEST/'idle.png'),('enemy',ROOT/'public/assets/lutadores/urubu/frente/idle.png'),('jump',ROOT/'public/assets/lutadores/urubu/frente/jump.png')]:sheets[key]=Image.open(file).convert('RGBA')
    def render(t,mode):
        im=Image.new('RGBA',(960,540),'#26313d');d=ImageDraw.Draw(im)
        d.rectangle((0,475,960,540),fill='#1a2532');d.line((0,475,960,475),fill='#53677c')
        d.text((24,22),'PREVIA DE ARTE - '+{'heavy':'PATADA PESADA','bite':'AVANCO E MORDIDA','jump':'ESQUIVA COM PULO'}[mode],fill='white')
        def sprite(key,f,x,y,flip=False,size=256):
            c=sheets[key].crop((f%5*256,f//5*256,f%5*256+256,f//5*256+256))
            if flip:c=c.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
            if size!=256:c=c.resize((size,size),Image.Resampling.NEAREST)
            im.alpha_composite(c,(round(x-size/2),round(y-size)))
        airborne=mode=='jump' and .50<t<1.35
        sprite('jump' if airborne else 'enemy',4 if airborne else int(t*8)%4,665,320 if airborne else 500)
        if mode=='heavy':
            sprite('heavy',min(9,int(t*12)),535,500,True)
            if .25<t<.59:sprite('slash',min(5,int((t-.25)*18)),640,480,True,210)
        elif t<.36:sprite('charge',min(4,int(t/.36*5)),210,500,True)
        elif t<.86:
            u=(t-.36)/.5;sprite('bite',1+int(u*8)%3,210+u*350,500,True)
        elif t<1.36:
            f=4+min(4,int((t-.86)*10));sprite('bite',f,560,500,True)
            if 1.00<t<1.33 and mode!='jump':sprite('bitefx',min(5,int((t-1)*18)),660,485,True,150)
        elif t<1.61:sprite('bite',9+min(2,int((t-1.36)*12)),560,500,True)
        else:sprite('idle',int(t*8)%4,560,500,True)
        return im.convert('RGB')
    for mode in ['heavy','bite','jump']:
        frames=[render(i/25,mode).resize((640,360),Image.Resampling.NEAREST) for i in range(55)]
        frames[0].save(OUT/('previa-'+mode+'.gif'),save_all=True,append_images=frames[1:],duration=40,loop=0)
    board=Image.new('RGB',(1440,588),'#101721');d=ImageDraw.Draw(board)
    for i,(t,mode,label) in enumerate([(.34,'heavy','1. Patada cortante'),(.24,'bite','2. Quatro apoios'),(.65,'bite','3. Avanco baixo'),(1.01,'bite','4. Mandibula aberta'),(1.12,'bite','5. Mordida'),(1.12,'jump','6. Esquiva com pulo')]):
        x,y=i%3*480,i//3*294;d.text((x+8,y+6),label,fill='white');board.paste(render(t,mode).resize((480,270),Image.Resampling.NEAREST),(x,y+24))
    board.save(OUT/'storyboard.png')

if __name__=='__main__':main()
