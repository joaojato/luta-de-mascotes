"""Assemble image-generated diving kicks and Urubu light repair, without combat edits."""
import json, math, hashlib, shutil, sys
from pathlib import Path
from statistics import median, mean
from PIL import Image, ImageDraw
from revisao_golpes_v2 import component_frames

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/voadoras-v7'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def feather_stats(im):
    v=[(r,g,b) for r,g,b,a in im.convert('RGBA').get_flattened_data() if a>230 and b>r+4 and b>g and 15<r<110 and b<140]
    return dict(sampleCount=len(v),medianRGB=[median(c) for c in zip(*v)],meanRGB=[round(mean(c),1) for c in zip(*v)]) if v else None
def split(im,n): return [im.crop((i%5*256,i//5*256,i%5*256+256,i//5*256+256)) for i in range(n)]

def preview(name,frames,fps,idle):
    contact=Image.new('RGB',(768,560),'#28333f');d=ImageDraw.Draw(contact);gif=[]
    for i,f in enumerate(frames):
        x,y=i%3*256,i//3*280;contact.paste(f,(x,y+24),f);d.text((x+8,y+6),str(i),fill='white')
        bg=Image.new('RGBA',(256,256),'#28333f');bg.alpha_composite(f);gif.append(bg.convert('RGB'))
    contact.save(OUT/f'{name}-contact.png')
    gif[0].save(OUT/f'{name}-preview.gif',save_all=True,append_images=gif[1:],duration=round(1000/fps),loop=0)
    compare=Image.new('RGB',(768,280),'#28333f');dc=ImageDraw.Draw(compare)
    for i,(label,f) in enumerate([('Guarda aprovada',idle),('Primeiro quadro',frames[0]),('Impacto',frames[2])]):
        compare.paste(f,(i*256,24),f);dc.text((i*256+8,6),label,fill='white')
    compare.save(OUT/f'{name}-style-compare.png')

def main():
    manifest=json.loads((OUT/'manifest.json').read_text(encoding='utf-8'))
    specs=[dict(id='urubu-light',dest=manifest['light']['dest'],frames=6,fps=14,root='public/assets/lutadores/urubu/frente')]+manifest['characters']
    report=[]
    for s in specs:
        name=s['id'];source=OUT/f'{name}-source.png'
        if not source.exists():continue
        raw=Image.open(source).convert('RGBA');alpha=raw.getchannel('A')
        edge_pixels=[]
        for edge in [(0,0,raw.width,1),(0,raw.height-1,raw.width,raw.height),(0,0,1,raw.height),(raw.width-1,0,raw.width,raw.height)]:
            edge_pixels.extend(alpha.crop(edge).get_flattened_data())
        assert not any(a>32 for a in edge_pixels), ('Source is clipped at canvas edge; redraw before packing',name)
        figures=component_frames(source,3,2,6)
        target=ROOT/s['dest'];target.parent.mkdir(parents=True,exist_ok=True)
        idle=Image.open(ROOT/s['root']/'idle.png').convert('RGBA').crop((0,0,256,256)) if s['root'] else Image.open(OUT/'bahia-style.png').convert('RGBA')
        if not s['root']:
            b=idle.getchannel('A').point(lambda a:255 if a>32 else 0).getbbox();idle=idle.crop(b);idle.thumbnail((150,200),Image.Resampling.NEAREST);c=Image.new('RGBA',(256,256));c.alpha_composite(idle,((256-idle.width)//2,228-idle.height));idle=c
        idlebox=idle.getchannel('A').point(lambda a:255 if a>32 else 0).getbbox()
        desired=idlebox[3]-idlebox[1] if name=='urubu-light' else 185
        scale=min(desired/(figures[0].height if name=='urubu-light' else max(f.height for f in figures)),238/max(f.width for f in figures),216/max(f.height for f in figures))
        figures=[f.resize((max(1,round(f.width*scale)),max(1,round(f.height*scale))),Image.Resampling.NEAREST) for f in figures]
        head_centers=[]
        if name!='urubu-light':
            head_band=round(max(f.height for f in figures)*.20)
            for f in figures:
                hb=f.getchannel('A').crop((0,0,f.width,head_band)).point(lambda a:255 if a>64 else 0).getbbox()
                head_centers.append((hb[0]+hb[2])/2)
            low=max(6+h for h in head_centers);high=min(250-f.width+h for f,h in zip(figures,head_centers))
            assert low<=high,('Insufficient canvas to lock head anchor',name,low,high)
            head_x=max(low,min(156,high))
        frames=[]
        for index,f in enumerate(figures):
            if name=='urubu-light':
                feet=f.getchannel('A').crop((0,f.height-10,f.width,f.height)).point(lambda a:255 if a>64 else 0).getbbox()
                x=round(128-(feet[0]+feet[2])/2);y=idlebox[3]-f.height
            else:
                # Anchor head, not changing silhouette: retracting a foot must
                # not translate the torso sideways. Physics handles travel.
                x=round(head_x-head_centers[index]);y=32
            x=max(6,min(x,250-f.width))
            c=Image.new('RGBA',(256,256));c.alpha_composite(f,(x,y));b=c.getchannel('A').point(lambda a:255 if a>32 else 0).getbbox()
            assert b and min(b[:2])>0 and max(b[2:])<256,(name,b)
            frames.append(c)
        sheet=Image.new('RGBA',(1280,512))
        for i,f in enumerate(frames):sheet.alpha_composite(f,(i%5*256,i//5*256))
        packed=OUT/f'{name}-packed.png';sheet.save(packed);preview(name,frames,s['fps'],idle)
        if name=='urubu-light':
            reference=feather_stats(idle)['medianRGB']
            for index in [0,5]:
                observed=feather_stats(frames[index])['medianRGB']
                assert max(abs(a-b) for a,b in zip(reference,observed))<=6, ('Guard palette drift; redraw rather than recolor',index,reference,observed)
        backup=OUT/f'{name}-target-before.png'
        if target.exists() and not backup.exists():shutil.copy2(target,backup)
        if '--apply' in sys.argv:
            if target.exists():assert sha(target) in [sha(backup),sha(packed)],('Concurrent art change',target)
            shutil.copy2(packed,target)
        report.append(dict(id=name,file=str(target.relative_to(ROOT)),frames=6,frameRate=s['fps'],repeat=0,frameWidth=256,frameHeight=256,columns=5,frameBoxes=[f.getchannel('A').point(lambda a:255 if a>32 else 0).getbbox() for f in frames],sha256=sha(packed),applied='--apply' in sys.argv,source=str(source.relative_to(ROOT))))
    (OUT/'report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    cards=''.join(f'<article><h2>{s["id"]}</h2><img src="{s["id"]}-preview.gif"><p>6 quadros · {s["frameRate"]} FPS sugeridos</p><a href="{s["id"]}-contact.png">Quadros numerados</a> · <a href="{s["id"]}-style-compare.png">Comparar com guarda</a></article>' for s in report)
    (OUT/'revisao.html').write_text('<!doctype html><meta charset="utf-8"><title>Voadoras e padrão de iluminação</title><style>body{background:#17212b;color:white;font:17px system-ui;padding:24px}article{display:inline-block;padding:20px;vertical-align:top}img{display:block;width:320px;image-rendering:pixelated}a{color:#bde3ff}</style><h1>Voadoras diagonais descendentes</h1><p>Prévias de articulação: a trajetória real fica com o motor.</p>'+cards,encoding='utf-8')
    if any(s['id']=='urubu-light' for s in report):
        light=split(Image.open(OUT/'urubu-light-packed.png').convert('RGBA'),6)
        old=split(Image.open(OUT/'urubu-light-before.png').convert('RGBA'),6)
        idle=Image.open(ROOT/'public/assets/lutadores/urubu/frente/idle.png').convert('RGBA').crop((0,0,256,256))
        stats=dict(idle=feather_stats(idle),before=feather_stats(old[0]),after=feather_stats(light[0]))
        (OUT/'style-after.json').write_text(json.dumps(stats,indent=2),encoding='utf-8')
        compare=Image.new('RGB',(768,280),'#28333f');d=ImageDraw.Draw(compare)
        for i,(label,f) in enumerate([('Guarda aprovada',idle),('Leve anterior',old[0]),('Leve corrigido',light[0])]):compare.paste(f,(i*256,24),f);d.text((i*256+5,5),label,fill='white')
        compare.save(OUT/'urubu-before-after.png')
    print(f'{len(report)} sheets assembled; applied={"--apply" in sys.argv}')

if __name__=='__main__':main()
