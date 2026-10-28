"""Pack readable longer attacks, compact translucent slashes and light fixes.

No combat code/JSON writes. --apply-safe replaces only equal-frame-count PNGs.
"""
import json,math,hashlib,shutil,sys
from pathlib import Path
from PIL import Image,ImageDraw
from urubu_meteoro import cells_from
from skins_urubu import bbox
from revisao_golpes_v2 import component_frames

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/animacoes-legiveis-v5'
ASSETS=ROOT/'public/assets/lutadores'
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def box(im):return im.getchannel('A').getbbox()
def frames_from(p,n):
    im=Image.open(p).convert('RGBA');assert im.size==(1280,math.ceil(n/5)*256)
    return [im.crop((i%5*256,i//5*256,i%5*256+256,i//5*256+256)) for i in range(n)]

def previews(id,frames,fps):
    contact=Image.new('RGB',(1024,math.ceil(len(frames)/4)*280),'#26313d');d=ImageDraw.Draw(contact);gif=[]
    for i,f in enumerate(frames):
        x,y=i%4*256,i//4*280;contact.paste(f,(x,y+24),f);d.text((x+8,y+6),str(i),fill='white')
        bg=Image.new('RGBA',(256,256),'#26313d');bg.alpha_composite(f);gif.append(bg.convert('RGB'))
    contact.save(OUT/(id+'-contact.png'))
    gif[0].save(OUT/(id+'-preview.gif'),save_all=True,append_images=gif[1:],duration=round(1000/fps),loop=0)

def main():
    m=json.loads((OUT/'manifest.json').read_text());extra=json.loads((OUT/'extra-jobs.json').read_text())
    jobs={j['id']:j for j in m['jobs']+extra};actions=m['actions']+[
        dict(id='saci-snap',frames=6,fps=24,parts=['saci-snap'],dest=str(ASSETS/'saci/light-snap-v5.png')),
        dict(id='urubu-outline',frames=6,fps=14,parts=['urubu-outline'],dest=str(ASSETS/'urubu/frente/light-clean-outline-v5.png'))]
    report=[]
    for s in actions:
        if not all(Path(jobs[p]['source']).exists() for p in s['parts']):print('Pending',s['id']);continue
        figs=[];anchor_height=None
        for part_number,part in enumerate(s['parts']):
            j=jobs[part]
            cells=component_frames(j['source'],j['cols'],j['rows'],j['frames']) if part=='bira-slide' or part.startswith(('cane-','galo-')) else cells_from(j)
            cells=[cells[i] for i in j.get('frameOrder',range(j['frames']))]
            part_figs=[c.crop(bbox(c) or box(c)) for c in cells]
            if len(s['parts'])>1:
                standing=part_figs[0 if part_number==0 else -1]
                if anchor_height is None:anchor_height=standing.height
                factor=anchor_height/standing.height
                part_figs=[f.resize((max(1,round(f.width*factor)),max(1,round(f.height*factor))),Image.Resampling.NEAREST) for f in part_figs]
            figs.extend(part_figs)
        assert len(figs)==s['frames']
        effect=s.get('effect',False)
        if effect:scale=72/max(max(f.size) for f in figs)
        else:scale=min(200/figs[0].height,244/max(f.width for f in figs),244/max(f.height for f in figs))
        frames=[];sheet=Image.new('RGBA',(1280,math.ceil(s['frames']/5)*256))
        for i,f in enumerate(figs):
            f=f.resize((max(1,round(f.width*scale)),max(1,round(f.height*scale))),Image.Resampling.NEAREST)
            if effect:
                max_a=f.getchannel('A').getextrema()[1];factor=min(1,105/max(1,max_a))
                f.putalpha(f.getchannel('A').point(lambda a:round(a*factor)))
            cell=Image.new('RGBA',(256,256));y=(256-f.height)//2 if effect else 228-f.height
            cell.alpha_composite(f,((256-f.width)//2,y));b=box(cell) if effect else bbox(cell)
            assert b and min(b[:2])>0 and max(b[2:])<256,(s['id'],i,b)
            if effect:assert max(b[2]-b[0],b[3]-b[1])<=72 and cell.getchannel('A').getextrema()[1]<=105
            sheet.alpha_composite(cell,(i%5*256,i//5*256));frames.append(cell)
        sheet.save(s['dest']);assert sheet.getchannel('A').getextrema()[0]==0
        for i in range(s['frames'],5*math.ceil(s['frames']/5)):assert not box(sheet.crop((i%5*256,i//5*256,i%5*256+256,i//5*256+256)))
        previews(s['id'],frames,s['fps'])
        report.append(dict(id=s['id'],file=s['dest'],frames=s['frames'],fps=s['fps'],durationSeconds=s['frames']/s['fps'],columns=5,frameWidth=256,frameHeight=256,frameBoxes=[box(f) if effect else bbox(f) for f in frames],maxAlpha=max(f.getchannel('A').getextrema()[1] for f in frames),sha256=sha(s['dest'])))
    (OUT/'art-contract.json').write_text(json.dumps(report,indent=2))
    write_html(report)
    if len(report)==7:
        render_scenes(report)
        print('Verified 7 sheets / 84 frames. Slashes <=72px and alpha <=105/255.')
    if '--apply-safe' in sys.argv:
        assert len(report)==7
        byid={r['id']:r for r in report}
        changes=[(byid['slash']['file'],ASSETS/'cachorro/urubu-v1/claw-slash-fx-v1.png'),(byid['slash']['file'],ASSETS/'galo/urubu-v1/talon-slash-fx-v3.png'),(byid['urubu-outline']['file'],ASSETS/'urubu/frente/light-alternating-v4.png'),(byid['saci-snap']['file'],ASSETS/'saci/light-punch.png')]
        snaps={Path(s['active']):s for n in ['effects-before.json','lights-before.json'] for s in json.loads((OUT/n).read_text())}
        for src,dest in changes:assert sha(dest) in [snaps[Path(dest)]['sha256'],sha(src)],('Concurrent change',str(dest))
        for src,dest in changes:shutil.copy2(src,dest);assert sha(src)==sha(dest)
        shutil.copy2(byid['slash']['file'],ASSETS/'galo/urubu-v1/talon-slash-small-v5.png')
        (OUT/'applied-safe.json').write_text(json.dumps([dict(source=src,active=str(dest),sha256=sha(dest)) for src,dest in changes],indent=2))
        print('Applied 2 reduced slash sheets and 2 light art fixes. New longer actions/FPS await Claude metadata integration.')

def write_html(report):
    names={'cartola-heavy':'Cartola: bengalada pesada','cartola-low':'Cartola: varredura baixa','galo-spin':'Galo: giro completo','bira-slide':'Bira: carrinho baixo','slash':'Corte menor e transparente','saci-snap':'Saci: jab rapido','urubu-outline':'Urubu: contorno corrigido'}
    cards=''
    for r in report:
        id=r['id'];cards+=f'<article><h2>{names[id]}</h2><a href="{id}-contact.png"><img src="{id}-preview.gif"></a><p>{r["frames"]} quadros · {r["fps"]} FPS · {r["durationSeconds"]:.2f} s</p></article>'
    (OUT/'revisao.html').write_text('''<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Animacoes mais legiveis</title><style>body{max-width:1120px;margin:auto;padding:24px;background:#101721;color:white;font:16px system-ui}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:18px}article{padding:16px;background:#26313d;border-radius:12px}img{width:100%;image-rendering:pixelated}h2{font-size:18px}a{color:#b9ddff}p{line-height:1.5}</style><h1>Movimentos mais claros e efeitos discretos</h1><p>Preparacao, extensao e retorno visiveis. Clique para ver todos os quadros. As duracoes abaixo sao as sugeridas para a integracao com Claude.</p><p><a href="cenas.html">Golpes em contexto</a> · <a href="../../docs/animacoes-legiveis-v5.md">Guia de integracao</a></p><div class="grid">'''+cards+'</div></html>',encoding='utf-8')

def render_scenes(report):
    sheets={r['id']:Image.open(r['file']).convert('RGBA') for r in report}
    for id,p in {'enemy':ASSETS/'urubu/frente/idle.png','dog':ASSETS/'cachorro/urubu-v1/idle.png','oldSlash':OUT/'cachorro-slash-before.png','oldUrubu':OUT/'urubu-light-before.png'}.items():sheets[id]=Image.open(p).convert('RGBA')
    names={'cartola-heavy':'BENGALADA: PREPARA, ESTENDE, VOLTA','cartola-low':'VARREDURA DE BENGALA','galo-spin':'GIRO COMPLETO E CHUTE','bira-slide':'CARRINHO BAIXO','saci-snap':'SACI: JAB RAPIDO','urubu-outline':'URUBU: SEM HALO PRETO'}
    def render(id,t,old=False):
        im=Image.new('RGBA',(960,540),'#26313d');draw=ImageDraw.Draw(im)
        draw.rectangle((0,475,960,540),fill='#1a2532');draw.line((0,475,960,475),fill='#53677c');draw.text((24,24),'PREVIA DE ARTE - '+names[id],fill='white')
        def sprite(key,f,x,y,flip=False,size=256,center=False):
            c=sheets[key].crop((f%5*256,f//5*256,f%5*256+256,f//5*256+256))
            if flip:c=c.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
            if size!=256:c=c.resize((size,size),Image.Resampling.NEAREST)
            im.alpha_composite(c,(round(x-size/2),round(y-(size/2 if center else size))))
        r=next(r for r in report if r['id']==id);f=min(r['frames']-1,int(t*r['fps']))
        sprite('dog' if id=='urubu-outline' else 'enemy',int(t*8)%4,680,500)
        x=520
        if id=='bira-slide':x=410+min(1,max(0,(t-.2)/.4))*165
        sprite(id,f,x,500,True)
        if id=='galo-spin' and 10<=f<=13:sprite('slash',min(5,f-10),650,345,True,256,True)
        return im.convert('RGB')
    ids=[r['id'] for r in report if r['id']!='slash']
    for id in ids:
        r=next(r for r in report if r['id']==id);n=math.ceil((r['durationSeconds']+.65)*25)
        frames=[render(id,i/25).resize((640,360),Image.Resampling.NEAREST) for i in range(n)]
        frames[0].save(OUT/(id+'-scene.gif'),save_all=True,append_images=frames[1:],duration=40,loop=0)
    board=Image.new('RGB',(1440,588),'#101721');draw=ImageDraw.Draw(board)
    moments=[('cartola-heavy',.82),('cartola-low',.82),('galo-spin',.36),('galo-spin',.8),('bira-slide',.48),('saci-snap',.09)]
    for i,(id,t) in enumerate(moments):
        x,y=i%3*480,i//3*294;draw.text((x+8,y+6),names[id],fill='white');board.paste(render(id,t).resize((480,270),Image.Resampling.NEAREST),(x,y+24))
    board.save(OUT/'storyboard.png')
    compare=Image.new('RGBA',(768,512),'#26313d');d=ImageDraw.Draw(compare)
    # Same character background: effect visibility can be judged through it.
    fighter=sheets['dog'].crop((0,0,256,256))
    for i,key in enumerate(['oldSlash','slash']):
        tile=Image.new('RGBA',(384,512),'#26313d');tile.alpha_composite(fighter,(64,130))
        fx=sheets[key].crop((512,0,768,256));tile.alpha_composite(fx,(64,130))
        ImageDraw.Draw(tile).text((20,30),'ANTES' if i==0 else 'DEPOIS: menor, alpha <=41%',fill='white');compare.alpha_composite(tile,(i*384,0))
    compare.convert('RGB').save(OUT/'efeitos-antes-depois.png')
    cards=''.join(f'<h2>{names[id]}</h2><img src="{id}-scene.gif">' for id in ids)
    (OUT/'cenas.html').write_text('''<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Golpes em contexto</title><style>body{max-width:1000px;margin:auto;padding:24px;background:#101721;color:white;font:16px system-ui}img{width:100%;image-rendering:pixelated}a{color:#b9ddff}</style><h1>Golpes com mais leitura</h1><p>Coreografia visual; deslocamento real, janelas e FPS de runtime ficam com Claude. Cortes nao devem encobrir o lutador.</p><a href="revisao.html">Quadros e duracoes</a><h2>Cortes antes/depois</h2><img src="efeitos-antes-depois.png">'''+cards+'</html>',encoding='utf-8')

if __name__=='__main__':main()
