"""Pack Galo peck artwork and visual previews; no gameplay writes."""
import json
import math
from pathlib import Path
from PIL import Image, ImageDraw
from urubu_meteoro import cells_from
from skins_urubu import bbox

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/galo-bicada'
DEST=ROOT/'public/assets/lutadores/galo/urubu-v1'

def main():
    report=[]
    for item in json.loads((OUT/'manifest.json').read_text()):
        figures=[c.crop(bbox(c)) for c in cells_from(item)]
        standing=figures[0 if item['id']=='charge' else 11]
        scale=min(200/standing.height,244/max(f.width for f in figures),244/max(f.height for f in figures))
        sheet=Image.new('RGBA',(1280,math.ceil(item['frames']/5)*256))
        frames=[]
        for i,f in enumerate(figures):
            f=f.resize((round(f.width*scale),round(f.height*scale)),Image.Resampling.NEAREST)
            cell=Image.new('RGBA',(256,256))
            # Fixed ground anchor; airborne frames use a stable upper silhouette.
            grounded=(item['id']=='charge' and i<=2) or (item['id']=='peck' and i>=9)
            y=228-f.height if grounded else 38
            y=max(6,min(250-f.height,y))
            cell.alpha_composite(f,((256-f.width)//2,y))
            assert (b:=bbox(cell)) and min(b[:2])>0 and max(b[2:])<256
            frames.append(cell)
            sheet.alpha_composite(cell,(i%5*256,i//5*256))
        sheet.save(item['dest'])
        contact=Image.new('RGB',(item['cols']*256,item['rows']*280),'#26313d')
        d=ImageDraw.Draw(contact)
        previews=[]
        for i,f in enumerate(frames):
            x,y=i%item['cols']*256,i//item['cols']*280
            contact.paste(f,(x,y+24),f)
            d.text((x+8,y+5),str(i),fill='white')
            bg=Image.new('RGBA',(256,256),'#26313d');bg.alpha_composite(f)
            previews.append(bg.convert('RGB'))
        contact.save(OUT/(item['id']+'-contact.png'))
        previews[0].save(OUT/(item['id']+'-preview.gif'),save_all=True,append_images=previews[1:],duration=round(1000/item['fps']),loop=0)
        report.append(dict(id=item['id'],file=item['file'],frames=item['frames'],fps=item['fps'],columns=5,frameWidth=256,frameHeight=256,frameBoxes=[bbox(f) for f in frames]))
        for i in range(item['frames'],sheet.width//256*(sheet.height//256)):
            assert not bbox(sheet.crop((i%5*256,i//5*256,i%5*256+256,i//5*256+256)))
    (OUT/'art-contract.json').write_text(json.dumps(report,indent=2))
    preview()
    print('Verified: 2 transparent sheets, 17 frames, margins and empty cells. Runtime unchanged.')

def preview():
    sheets={k:Image.open(p).convert('RGBA') for k,p in {
        'charge':DEST/'special-peck-charge-v1.png','peck':DEST/'special-flying-peck-v1.png',
        'idle':DEST/'idle.png','enemy':ROOT/'public/assets/lutadores/urubu/frente/idle.png',
        'crouch':ROOT/'public/assets/lutadores/urubu/frente/crouch.png'}.items()}
    def render(t,crouch=False):
        im=Image.new('RGBA',(960,540),'#26313d');d=ImageDraw.Draw(im)
        d.rectangle((0,475,960,540),fill='#1a2532');d.line((0,475,960,475),fill='#53677c')
        d.text((24,24),'PREVIA DE ARTE - '+('ESQUIVA ABAIXADO' if crouch else 'BICADA NA ALTURA DA CABECA'),fill='white')
        def sprite(key,f,x,y,flip=False):
            s=sheets[key].crop((f%5*256,f//5*256,f%5*256+256,f//5*256+256))
            if flip:s=s.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
            im.alpha_composite(s,(round(x-128),round(y-256)))
        sprite('crouch' if crouch else 'enemy',4 if crouch else int(t*8)%4,665,500)
        if t<.36:sprite('charge',min(4,int(t/.36*5)),210,500,True)
        elif t<1.11:
            u=(t-.36)/.75;f=min(8,int(u*9))
            # Travel and short lift are preview choreography, not encoded physics.
            x=210+350*min(1,u/.67);y=500+5*min(1,u/.15)
            sprite('peck',f,x,y,True)
        elif t<1.36:sprite('peck',9+min(2,int((t-1.11)/.25*3)),560,500,True)
        else:sprite('idle',int(t*8)%4,560,500,True)
        return im.convert('RGB')
    for crouch,name in [(False,'acerto'),(True,'esquiva')]:
        frames=[render(i/25,crouch).resize((640,360),Image.Resampling.NEAREST) for i in range(55)]
        frames[0].save(OUT/('previa-'+name+'.gif'),save_all=True,append_images=frames[1:],duration=40,loop=0)
    board=Image.new('RGB',(1440,588),'#101721');d=ImageDraw.Draw(board)
    for i,(t,c,label) in enumerate([(.17,False,'1. Preparacao'),(.43,False,'2. Voo baixo'),(.86,False,'3. Bicada'),(.86,True,'4. Esquiva abaixado'),(1.18,False,'5. Pouso'),(1.65,False,'6. Guarda')]):
        x,y=i%3*480,i//3*294;d.text((x+8,y+6),label,fill='white')
        board.paste(render(t,c).resize((480,270),Image.Resampling.NEAREST),(x,y+24))
    board.save(OUT/'storyboard.png')

if __name__=='__main__':main()
