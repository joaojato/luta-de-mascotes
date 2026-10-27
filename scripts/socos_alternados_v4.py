"""Prepare corrected alternating-hand light art; --apply updates existing PNGs only."""
import hashlib
import json
import math
import shutil
import sys
from pathlib import Path
from PIL import Image,ImageDraw
from urubu_meteoro import cells_from
from skins_urubu import bbox
from revisao_golpes_v2 import split

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/socos-alternados-v4'
NAMES={'urubu':'Urubu','cachorro':'Bira','cartola':'Cartola','galo':'Galo'}
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()

def preview(id,frames,fps=14):
    contact=Image.new('RGB',(768,560),'#26313d');d=ImageDraw.Draw(contact);gif=[]
    for i,f in enumerate(frames):
        x,y=i%3*256,i//3*280;contact.paste(f,(x,y+24),f);d.text((x+8,y+6),str(i),fill='white')
        bg=Image.new('RGBA',(256,256),'#26313d');bg.alpha_composite(f);gif.append(bg.convert('RGB'))
    contact.save(OUT/(id+'-contact.png'))
    gif[0].save(OUT/(id+'-preview.gif'),save_all=True,append_images=gif[1:],duration=round(1000/fps),loop=0)

def main():
    specs=json.loads((OUT/'manifest.json').read_text());report=[]
    board=Image.new('RGB',(1024,4*280),'#26313d');draw=ImageDraw.Draw(board)
    for row,s in enumerate(specs):
        if not Path(s['source']).exists():print('Pending',s['id']);continue
        cells=cells_from(s);cells=[cells[i] for i in s.get('frameOrder',range(6))]
        figs=[c.crop(bbox(c)) for c in cells]
        scale=min(200/figs[0].height,244/max(f.width for f in figs),244/max(f.height for f in figs))
        frames=[];sheet=Image.new('RGBA',(1280,512))
        for i,f in enumerate(figs):
            f=f.resize((round(f.width*scale),round(f.height*scale)),Image.Resampling.NEAREST)
            frame=Image.new('RGBA',(256,256));frame.alpha_composite(f,((256-f.width)//2,228-f.height));b=bbox(frame)
            assert b and min(b[:2])>0 and max(b[2:])<256,(s['id'],i,b)
            sheet.alpha_composite(frame,(i%5*256,i//5*256));frames.append(frame)
        assert sheet.getchannel('A').getextrema()[0]==0
        for i in range(6,10):assert not bbox(sheet.crop((i%5*256,i//5*256,i%5*256+256,i//5*256+256)))
        sheet.save(s['dest']);preview(s['id'],frames)
        old=next(b for b in json.loads((OUT/'before.json').read_text()) if Path(b['file'])==Path(s['active']))
        before=split(Path(old['backup']),6);preview(s['id']+'-before',before)
        for col,(f,label) in enumerate([(before[1],'Antes 1'),(before[3],'Antes 2'),(frames[1],'Depois: primeira mao'),(frames[3],'Depois: outra mao')]):
            x,y=col*256,row*280;draw.text((x+6,y+6),NAMES[s['id']]+' - '+label,fill='white');board.paste(f,(x,y+24),f)
        report.append(dict(id=s['id'],canonical=s['dest'],active=s['active'],frames=6,columns=5,frameWidth=256,frameHeight=256,fps=14,frameBoxes=[bbox(f) for f in frames],sha256=sha(s['dest'])))
    restores=[]
    for kind,source,active in [('light','light-punch.png','light-double-jab-v2.png'),('heavy','heavy-punch.png','heavy-cross-v2.png')]:
        base=ROOT/'public/assets/lutadores/saci';src=base/source
        frames=split(src,6);assert all(bbox(f) for f in frames);preview('saci-'+kind,frames,12)
        restores.append(dict(id='saci-'+kind,source=str(src),active=str(base/active),frames=6,fpsOriginal=12,sha256=sha(src)))
    board.save(OUT/'comparacao-maos.png')
    (OUT/'art-contract.json').write_text(json.dumps(dict(corrected=report,restored=restores),indent=2))
    cards=''
    for s in specs:
        id=s['id'];cards+=f'<h2>{NAMES[id]}</h2><div class="pair"><article><h3>Antes: mesmo braco repetido</h3><img src="{id}-before-preview.gif"></article><article><h3>Corrigido: uma mao e a outra</h3><a href="{id}-contact.png"><img src="{id}-preview.gif"></a></article></div>'
    (OUT/'revisao.html').write_text('''<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Socos com maos alternadas</title><style>body{max-width:1050px;margin:auto;padding:24px;background:#101721;color:#eee;font:16px system-ui}p{line-height:1.5}.pair{display:grid;grid-template-columns:1fr 1fr;gap:16px}article{background:#26313d;padding:16px;border-radius:12px}img{width:100%;image-rendering:pixelated}a{color:#b9ddff}</style><h1>Leve: um soco com cada mao</h1><p>Primeiro soco mostra a frente; segundo usa o braco oposto com giro do ombro e tronco. Clique na animacao corrigida para conferir os seis quadros.</p><a href="comparacao-maos.png">Comparar os dois impactos de todos</a>'''+cards+'''<h2>Saci: originais restaurados</h2><div class="pair"><article><h3>Fraco original</h3><img src="saci-light-preview.gif"></article><article><h3>Forte original</h3><img src="saci-heavy-preview.gif"></article></div><p>Almirante preservado. <a href="../../docs/socos-alternados-v4.md">Guia e arquivos</a></p></html>''',encoding='utf-8')
    if '--apply' in sys.argv:
        assert len(report)==4,'All four new sheets must be ready before apply'
        changes=[(r['canonical'],r['active']) for r in report]+[(r['source'],r['active']) for r in restores]
        snapshots={Path(r['file']):r for r in json.loads((OUT/'before.json').read_text())}
        # Check every target first, then replace PNGs; preserve concurrent changes.
        for src,dest in changes:
            assert sha(dest) in (snapshots[Path(dest)]['sha256'],sha(src)),('Concurrent art change',dest)
        for src,dest in changes:shutil.copy2(src,dest);assert sha(src)==sha(dest)
        (OUT/'applied.json').write_text(json.dumps([dict(source=src,active=dest,sha256=sha(dest)) for src,dest in changes],indent=2))
        print('Applied 4 corrected light sheets and restored 2 original Saci sheets. No runtime code/JSON written.')
    else:print('Prepared',len(report),'of 4 sheets. Review before --apply.')

if __name__=='__main__':main()
