"""Pack personalized attack artwork and visual-only choreography previews."""
import hashlib
import json
import math
import shutil
from pathlib import Path
from PIL import Image, ImageDraw
from urubu_meteoro import cells_from
from skins_urubu import bbox

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/golpes-personalizados-v3'
ASSETS=ROOT/'public/assets/lutadores'

def sha(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def split(path,n):
    im=Image.open(path).convert('RGBA')
    assert im.size==(1280,math.ceil(n/5)*256),(str(path),im.size,n)
    return [im.crop((i%5*256,i//5*256,i%5*256+256,i//5*256+256)) for i in range(n)]

def previews(id,frames,fps):
    contact=Image.new('RGB',(768,math.ceil(len(frames)/3)*280),'#26313d');draw=ImageDraw.Draw(contact);gif=[]
    for i,f in enumerate(frames):
        x,y=i%3*256,i//3*280;contact.paste(f,(x,y+24),f);draw.text((x+8,y+6),str(i),fill='white')
        bg=Image.new('RGBA',(256,256),'#26313d');bg.alpha_composite(f);gif.append(bg.convert('RGB'))
    contact.save(OUT/(id+'-contact.png'))
    gif[0].save(OUT/(id+'-preview.gif'),save_all=True,append_images=gif[1:],duration=round(1000/fps),loop=0)

def main():
    specs=json.loads((OUT/'manifest.json').read_text());report=[]
    for s in specs:
        if not Path(s['source']).exists():print('Pending',s['id']);continue
        if s['kind']=='body':
            cells=cells_from(s);figs=[c.crop(bbox(c)) for c in cells]
            scale=min(200/figs[0].height,244/max(f.width for f in figs),244/max(f.height for f in figs))
        else:
            src=Image.open(s['source']).convert('RGBA')
            assert src.getchannel('A').getextrema()[0]==0
            cells=[src.crop((round(i%s['cols']*src.width/s['cols']),round(i//s['cols']*src.height/s['rows']),round((i%s['cols']+1)*src.width/s['cols']),round((i//s['cols']+1)*src.height/s['rows']))) for i in range(s['frames'])]
            if s['kind']=='prop':
                figs=[c.crop(bbox(c)) for c in cells];scale=54/max(max(f.size) for f in figs)
        frames=[];sheet=Image.new('RGBA',(1280,math.ceil(s['frames']/5)*256))
        for i,c in enumerate(cells):
            frame=Image.new('RGBA',(256,256))
            if s['kind'] in ('body','prop'):
                f=figs[i].resize((max(1,round(figs[i].width*scale)),max(1,round(figs[i].height*scale))),Image.Resampling.NEAREST)
                y=228-f.height if s['kind']=='body' else (256-f.height)//2
                frame.alpha_composite(f,((256-f.width)//2,y))
            else:
                c.thumbnail((244,244),Image.Resampling.NEAREST);frame.alpha_composite(c,((256-c.width)//2,(256-c.height)//2))
            b=bbox(frame);assert b and min(b[:2])>0 and max(b[2:])<256,(s['id'],i,b)
            frames.append(frame);sheet.alpha_composite(frame,(i%5*256,i//5*256))
        sheet.save(s['dest']);assert sheet.getchannel('A').getextrema()[0]==0
        for i in range(s['frames'],5*math.ceil(s['frames']/5)):
            assert not bbox(sheet.crop((i%5*256,i//5*256,i%5*256+256,i//5*256+256)))
        previews(s['id'],frames,s['fps'])
        report.append(dict(id=s['id'],character=s['character'],kind=s['kind'],file=s['dest'],frames=s['frames'],fps=s['fps'],columns=5,frameWidth=256,frameHeight=256,frameBoxes=[bbox(f) for f in frames],sha256=sha(s['dest'])))
    copies=[]
    for character,folder,n,fps in [('urubu','frente',10,12),('saci','',14,12),('galo','urubu-v1',10,12)]:
        base=ASSETS/character/folder;src=base/'heavy-kick.png';dest=base/'low-kick-classic-v3.png';shutil.copy2(src,dest)
        assert sha(src)==sha(dest);frames=split(dest,n);assert all(bbox(f) for f in frames)
        previews(character+'-low-classic',frames,fps)
        copies.append(dict(character=character,source=str(src),file=str(dest),frames=n,fps=fps,copyExact=True,sha256=sha(dest)))
    src=ASSETS/'cachorro/urubu-v1/claw-slash-fx-v1.png';dest=ASSETS/'galo/urubu-v1/talon-slash-fx-v3.png';shutil.copy2(src,dest)
    assert sha(src)==sha(dest)
    copies.append(dict(character='galo',source=str(src),file=str(dest),frames=6,fps=18,copyExact=True,sha256=sha(dest)))
    previews('galo-slash',split(dest,6),18)
    (OUT/'art-contract.json').write_text(json.dumps(dict(generated=report,reused=copies),indent=2))
    write_html(specs)
    if len(report)==len(specs):
        render_scenes(specs)
        print('Verified 8 new sheets, 66 frames; 3 exact classic-kick copies and exact Bira slash reuse. Runtime untouched.')
    else:print('Partial build:',len(report),'of',len(specs))

def write_html(specs):
    titles={'cartola-heavy-cane':'Cartola — bengalada seca','cartola-low-cane':'Cartola — rasteira de bengala','cartola-rice':'Cartola — po de arroz','urubu-beak-rip':'Urubu — bicada, fecha e puxa','saci-pipe-throw':'Saci — arremessa e troca cachimbo','galo-spin-kick':'Galo — chute giratorio','rice-cloud':'Efeito: po de arroz','pipe-projectile':'Projetil: cachimbo em rotacao'}
    cards=''
    for s in specs:
        id=s['id'];cards+=f'<article><h2>{titles[id]}</h2><a href="{id}-contact.png"><img src="{id}-preview.gif" alt="{titles[id]}"></a><p>{s["frames"]} quadros · {s["fps"]} fps</p></article>'
    for id,label in [('urubu','Urubu'),('saci','Saci'),('galo','Galo')]:cards+=f'<article><h2>{label} — chute baixo</h2><a href="{id}-low-classic-contact.png"><img src="{id}-low-classic-preview.gif"></a><p>Animacao de chute anterior preservada.</p></article>'
    (OUT/'revisao.html').write_text('''<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Golpes personalizados</title><style>body{max-width:1120px;margin:auto;padding:24px;background:#101721;color:#eee;font:16px system-ui}p{line-height:1.5}a{color:#b6ddff}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}article{padding:16px;background:#26313d;border-radius:12px}img{width:100%;image-rendering:pixelated}h2{font-size:19px}</style><h1>Golpes personalizados</h1><p>Artes no estilo aprovado, com identidades preservadas. Clique nas animacoes para ver os quadros numerados.</p><p><a href="cenas.html">Ver golpes com efeitos e trajetorias</a> · <a href="../../docs/golpes-personalizados-v3.md">Guia para Claude</a></p><div class="grid">'''+cards+'</div></html>',encoding='utf-8')

def render_scenes(specs):
    sheets={s['id']:Image.open(s['dest']).convert('RGBA') for s in specs}
    for key,path in {'slash':ASSETS/'galo/urubu-v1/talon-slash-fx-v3.png','enemy':ASSETS/'urubu/frente/idle.png','block':ASSETS/'urubu/frente/block-high-v2.png','dog':ASSETS/'cachorro/urubu-v1/idle.png'}.items():sheets[key]=Image.open(path).convert('RGBA')
    names={'cartola-heavy-cane':'BENGALADA SECA','cartola-low-cane':'VARREDURA NAS PERNAS','cartola-rice':'PO DE ARROZ','urubu-beak-rip':'BICADA E PUXAO','saci-pipe-throw':'CACHIMBO EM PARABOLA','galo-spin-kick':'GIRO COM GARRAS'}
    def render(id,t,blocked=False):
        stage=Image.new('RGBA',(960,540),'#26313d');draw=ImageDraw.Draw(stage)
        draw.rectangle((0,475,960,540),fill='#1a2532');draw.line((0,475,960,475),fill='#53677c')
        draw.text((24,20),'PREVIA DE ARTE - '+names[id]+(' - BLOQUEADO' if blocked else ''),fill='white')
        def sprite(key,f,x,y,flip=False,size=256,center=False):
            c=sheets[key].crop((f%5*256,f//5*256,f%5*256+256,f//5*256+256))
            if flip:c=c.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
            if size!=256:c=c.resize((size,size),Image.Resampling.NEAREST)
            stage.alpha_composite(c,(round(x-size/2),round(y-(size/2 if center else size))))
        enemy_x=700 if id=='saci-pipe-throw' else 650
        sprite('block' if blocked else 'dog' if id=='urubu-beak-rip' else 'enemy',3 if blocked else int(t*8)%4,enemy_x,500)
        s=next(s for s in specs if s['id']==id);f=min(s['frames']-1,int(t*s['fps']))
        x=300 if id=='saci-pipe-throw' else 425 if id=='cartola-rice' else 525
        sprite(id,f,x,500,True)
        if id=='cartola-rice' and .285<t<1.15:
            u=(t-.285)/.865;sprite('rice-cloud',min(7,int(u*8)),510+u*125,365,True,270,True)
        if id=='saci-pipe-throw' and .215<t<1.20:
            u=(t-.215)/.985
            # This is visual choreography only: parabolic trajectory to ground.
            px=350+u*450;py=335-230*u+344*u*u
            sprite('pipe-projectile',int(u*16)%6,px,py,True,256,True)
        if id=='galo-spin-kick' and .25<t<.59:sprite('slash',min(5,int((t-.25)*18)),625,385,True,190,True)
        return stage.convert('RGB')
    ids=[s['id'] for s in specs if s['kind']=='body']
    for id in ids:
        frames=[render(id,i/25).resize((640,360),Image.Resampling.NEAREST) for i in range(55)]
        frames[0].save(OUT/(id+'-scene.gif'),save_all=True,append_images=frames[1:],duration=40,loop=0)
    frames=[render('cartola-rice',i/25,True).resize((640,360),Image.Resampling.NEAREST) for i in range(55)]
    frames[0].save(OUT/'cartola-rice-blocked-scene.gif',save_all=True,append_images=frames[1:],duration=40,loop=0)
    board=Image.new('RGB',(1440,588),'#101721');draw=ImageDraw.Draw(board)
    for i,(id,t) in enumerate([('cartola-heavy-cane',.30),('cartola-low-cane',.30),('cartola-rice',.44),('urubu-beak-rip',.30),('saci-pipe-throw',.65),('galo-spin-kick',.28)]):
        x,y=i%3*480,i//3*294;draw.text((x+8,y+6),names[id],fill='white');board.paste(render(id,t).resize((480,270),Image.Resampling.NEAREST),(x,y+24))
    board.save(OUT/'storyboard.png')
    cards=''.join(f'<article><h2>{names[id]}</h2><img src="{id}-scene.gif"></article>' for id in ids)
    cards+='<article><h2>PO DE ARROZ — BLOQUEADO</h2><img src="cartola-rice-blocked-scene.gif"></article>'
    (OUT/'cenas.html').write_text('''<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Previas dos golpes</title><style>body{max-width:1100px;margin:auto;padding:24px;background:#101721;color:#eee;font:16px system-ui}article{margin:24px 0}img{width:100%;image-rendering:pixelated}a{color:#b6ddff}</style><h1>Golpes, efeitos e trajetorias</h1><p>Previas de coreografia visual. Colisao, bloqueio, parabola fisica e stun de 1,5 s ficam com Claude. Animacoes de stun dos adversarios serao feitas depois, conforme pedido.</p><a href="revisao.html">Folhas e quadros</a>'''+cards+'</html>',encoding='utf-8')

if __name__=='__main__':main()
