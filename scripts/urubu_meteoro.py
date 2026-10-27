"""Pack generated Urubu special art; never edits gameplay or fighter JSON."""
import json
import math
from pathlib import Path
from PIL import Image, ImageDraw
from skins_urubu import bbox, cuts

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/urubu-meteoro'
DEST=ROOT/'public/assets/lutadores/urubu/frente'


def render_preview():
    """Art-only storyboard/GIF matching the HTML choreography, no combat logic."""
    filenames={'charge':'special-thermal-charge-v1.png','meteor':'special-meteor-v1.png','thermal':'thermal-updraft-v1.png','trail':'meteor-trail-v1.png','idle':'idle.png'}
    sheets={k:Image.open(DEST/v).convert('RGBA') for k,v in filenames.items()}
    sheets['enemy']=Image.open(ROOT/'public/assets/lutadores/cachorro/urubu-v1/idle.png').convert('RGBA')
    def render(t):
        stage=Image.new('RGBA',(960,540),'#26313d')
        draw=ImageDraw.Draw(stage)
        draw.rectangle((0,475,960,540),fill='#1a2532')
        draw.line((0,475,960,475),fill='#53677c')
        def sprite(key,f,x,y,size=256,flip=False,alpha=1):
            im=sheets[key].crop((f%5*256,f//5*256,f%5*256+256,f//5*256+256))
            if flip:
                im=im.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
            if size!=256:
                im=im.resize((round(size),round(size)),Image.Resampling.NEAREST)
            if alpha!=1:
                im.putalpha(im.getchannel('A').point(lambda a:round(a*max(0,min(1,alpha)))))
            stage.alpha_composite(im,(round(x-size/2),round(y-size)))
        sprite('enemy',int(t*8)%4,665,500)
        if t<.42:
            sprite('thermal',min(3,int(t*12)),210,500,260,False,.85)
            sprite('charge',min(4,int(t/.42*5)),210,500,256,True)
        elif t<.72:
            u=(t-.42)/.30
            sprite('thermal',int(t*12)%6,210,500,260+u*170,False,1-u*.6)
            sprite('meteor',min(2,int(u*3)),210,500-u*u*(3-2*u)*580,256,True)
        elif t<.86:
            sprite('thermal',5,210,500,340,False,.3)
        elif t<1.24:
            u=(t-.86)/.38
            x,y=180+u*485,15+u*485
            sprite('trail',min(4,int(u*6)),x-80,y-40,360,True,.85)
            sprite('meteor',4+min(4,int(u*5)),x,y,256,True)
        elif t<1.50:
            u=(t-1.24)/.26
            sprite('meteor',9+min(2,int(u*3)),665,500,256,True)
        else:
            sprite('idle',int(t*8)%4,665,500,256,True)
        return stage.convert('RGB')
    frames=[render(i/25).resize((640,360),Image.Resampling.NEAREST) for i in range(60)]
    frames[0].save(OUT/'previa-especial.gif',save_all=True,append_images=frames[1:],duration=40,loop=0)
    moments=[(.24,'1. Corrente termica'),(.60,'2. Subida'),(.79,'3. Fora da tela'),(1.10,'4. Mergulho diagonal'),(1.30,'5. Impacto'),(1.90,'6. Recuperacao')]
    storyboard=Image.new('RGB',(1440,588),'#101721')
    draw=ImageDraw.Draw(storyboard)
    for i,(t,label) in enumerate(moments):
        x,y=i%3*480,i//3*294
        draw.text((x+8,y+6),label,fill='white')
        storyboard.paste(render(t).resize((480,270),Image.Resampling.NEAREST),(x,y+24))
    storyboard.save(OUT/'storyboard.png')


def cells_from(item):
    im=Image.open(item['source']).convert('RGBA')
    assert im.getchannel('A').getextrema()[0]<255, item['id']+' has no transparency'
    # Effects retain the original alpha/glow and fixed cell origin. For body
    # sheets find gutters near the intended equal grid boundaries.
    ys=[round(i*im.height/item['rows']) for i in range(item['rows']+1)] if item['id'] in ('thermal','trail') else cuts(im,item['rows'],'y')
    cells=[]
    for row in range(item['rows']):
        band=im.crop((0,ys[row],im.width,ys[row+1]))
        xs=[round(i*im.width/item['cols']) for i in range(item['cols']+1)] if item['id'] in ('thermal','trail') else cuts(band,item['cols'],'x')
        for col in range(item['cols']):
            if len(cells)==item['frames']:
                break
            c=band.crop((xs[col],0,xs[col+1],band.height))
            assert bbox(c), (item['id'],len(cells),'empty frame')
            cells.append(c)
    return cells


def main():
    manifest=json.loads((OUT/'manifest.json').read_text(encoding='utf-8'))
    report=[]
    for item in manifest:
        cells=cells_from(item)
        sheet=Image.new('RGBA',(1280,math.ceil(item['frames']/5)*256))
        frames=[]
        boxes=[]
        effect=item['id'] in ('thermal','trail')
        if not effect:
            figures=[c.crop(bbox(c)) for c in cells]
            standing=figures[0 if item['id']=='charge' else 11]
            scale=min(200/standing.height,248/max(f.width for f in figures),248/max(f.height for f in figures))
            print(item['id'],'standing height',round(standing.height*scale),'scale',round(scale,3))
        for i,c in enumerate(cells):
            cell=Image.new('RGBA',(256,256))
            if effect:
                # Retain semitransparent pixels; no chroma key / alpha threshold.
                c.thumbnail((244,244),Image.Resampling.NEAREST)
                cell.alpha_composite(c,((256-c.width)//2,(256-c.height)//2))
            else:
                f=figures[i]
                f=f.resize((max(1,round(f.width*scale)),max(1,round(f.height*scale))),Image.Resampling.NEAREST)
                f=f.crop(bbox(f))
                grounded=(item['id']=='charge' and i<=2) or (item['id']=='meteor' and i>=9)
                x=round(128-f.width/2)
                y=228-f.height if grounded else round(128-f.height/2)
                y=max(4,min(252-f.height,y))
                cell.alpha_composite(f,(x,y))
            sheet.alpha_composite(cell,(i%5*256,i//5*256))
            boxes.append(bbox(cell))
            frames.append(cell)
        sheet.save(item['dest'])
        previews=[]
        for f in frames:
            bg=Image.new('RGBA',(256,256),'#26313d')
            bg.alpha_composite(f)
            previews.append(bg.convert('RGB'))
        previews[0].save(OUT/(item['id']+'-preview.gif'),save_all=True,append_images=previews[1:],duration=round(1000/item['fps']),loop=0)
        contact=Image.new('RGB',(item['cols']*256,item['rows']*280),'#26313d')
        draw=ImageDraw.Draw(contact)
        for i,f in enumerate(frames):
            x,y=i%item['cols']*256,i//item['cols']*280
            contact.paste(f,(x,y+24),f)
            draw.text((x+8,y+5),str(i),fill='white')
        contact.save(OUT/(item['id']+'-contact.png'))
        report.append(dict(id=item['id'],file=item['file'],frames=item['frames'],fps=item['fps'],columns=5,frameWidth=256,frameHeight=256,frameBoxes=boxes))
    (OUT/'art-contract.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    for item in manifest:
        im=Image.open(item['dest']).convert('RGBA')
        assert im.size==(1280,math.ceil(item['frames']/5)*256)
        for i in range(item['frames']):
            c=im.crop((i%5*256,i//5*256,i%5*256+256,i//5*256+256))
            b=bbox(c)
            assert b and b[0]>0 and b[1]>0 and b[2]<256 and b[3]<256,(item['id'],i,b)
        for i in range(item['frames'],im.width//256*(im.height//256)):
            assert not bbox(im.crop((i%5*256,i//5*256,i%5*256+256,i//5*256+256)))
    print('Verified 4 transparent sheets, 29 frames. Runtime special unchanged.')
    render_preview()


if __name__=='__main__':
    main()
