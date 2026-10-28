"""Pack image-generated corrections; preserve combat configuration and frame counts.

Run without flags to generate review sheets. --apply only after visual review.
"""
from pathlib import Path
import sys, math, json, hashlib, shutil
from PIL import Image, ImageDraw
from revisao_golpes_v2 import component_frames

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/coerencia-v6'
SPECS = [
    ('saci', 6, 3, 2, 24, 'saci/light-snap-v5.png'),
    ('cartola-heavy', 16, 4, 4, 12, 'cartola/urubu-v1/heavy-cane-extended-v5.png'),
    ('cartola-low', 16, 4, 4, 12, 'cartola/urubu-v1/low-cane-extended-v5.png'),
]

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    report = []
    for name, n, cols, rows, fps, dest in SPECS:
        source = OUT / f'{name}-source.png'
        if not source.exists(): continue
        target = ROOT / 'public/assets/lutadores' / dest
        backup = OUT / f'{name}-before.png'
        if not backup.exists(): shutil.copy2(target, backup)
        figures = component_frames(source, cols, rows, n)
        if name == 'cartola-low':
            original = Image.open(backup).convert('RGBA')
            frames = [original.crop((i%5*256, i//5*256, i%5*256+256, i//5*256+256)) for i in range(n)]
            fixes = component_frames(OUT/'cartola-low-fix-source.png',3,2,6)
            factor = 200 / fixes[0].height
            for slot, source_index in {7:1,8:2,9:3,10:3,11:3,12:4,13:5}.items():
                f=fixes[source_index]
                f=f.resize((round(f.width*factor),round(f.height*factor)),Image.Resampling.NEAREST)
                feet=f.getchannel('A').crop((0,f.height-10,f.width,f.height)).point(lambda a:255 if a>64 else 0).getbbox()
                x=round(128-(feet[0]+feet[2])/2);x=max(4,min(x,252-f.width))
                assert f.width<248 and f.height<248
                cell=Image.new('RGBA',(256,256));cell.alpha_composite(f,(x,228-f.height));frames[slot]=cell
            figures=[]
        elif name == 'cartola-heavy':
            # Retain approved timing/impact and valid original artwork. Replace only
            # inverted handle at 8 and contradictory recovery at 12/13.
            original = Image.open(backup).convert('RGBA')
            frames = [original.crop((i%5*256, i//5*256, i%5*256+256, i//5*256+256)) for i in range(n)]
            factor = 200 / figures[0].height
            for slot, source_index in {8:7, 12:11, 13:13}.items():
                f = figures[source_index]
                f = f.resize((round(f.width*factor), round(f.height*factor)), Image.Resampling.NEAREST)
                assert f.width < 248 and f.height < 248
                feet = f.getchannel('A').crop((0,f.height-10,f.width,f.height)).point(lambda a:255 if a>64 else 0).getbbox()
                x = round(128-(feet[0]+feet[2])/2)
                x = max(4,min(x,252-f.width))
                cell = Image.new('RGBA',(256,256));cell.alpha_composite(f,(x,228-f.height));frames[slot]=cell
            figures = []
        else:
            frames = []
        scale = min(200 / figures[0].height, 240 / max(f.width for f in figures), 240 / max(f.height for f in figures)) if figures else 1
        for f in figures:
            f = f.resize((round(f.width * scale), round(f.height * scale)), Image.Resampling.NEAREST)
            # Anchor on feet, rather than the full silhouette including fist/cane.
            feet = f.getchannel('A').crop((0, f.height - 10, f.width, f.height)).point(lambda a: 255 if a > 64 else 0).getbbox()
            anchor = 145 if name == 'saci' else 143
            x = round(anchor - (feet[0] + feet[2]) / 2)
            x = max(6, min(x, 250 - f.width))
            cell = Image.new('RGBA', (256, 256))
            cell.alpha_composite(f, (x, 228 - f.height))
            b = cell.getchannel('A').point(lambda a:255 if a>32 else 0).getbbox()
            assert b and b[0] > 0 and b[1] > 0 and b[2] < 256 and b[3] < 256, (name, b)
            frames.append(cell)
        sheet = Image.new('RGBA', (1280, math.ceil(n / 5) * 256))
        contact = Image.new('RGB', (1024, math.ceil(n / 4) * 280), '#26313d')
        draw = ImageDraw.Draw(contact)
        gif = []
        for i, f in enumerate(frames):
            sheet.alpha_composite(f, (i % 5 * 256, i // 5 * 256))
            contact.paste(f, (i % 4 * 256, i // 4 * 280 + 24), f)
            draw.text((i % 4 * 256 + 8, i // 4 * 280 + 6), str(i), fill='white')
            bg = Image.new('RGBA', (256,256), '#26313d'); bg.alpha_composite(f); gif.append(bg.convert('RGB'))
        packed = OUT / f'{name}-packed.png'
        sheet.save(packed); contact.save(OUT / f'{name}-contact.png')
        gif[0].save(OUT / f'{name}-preview.gif', save_all=True, append_images=gif[1:], duration=round(1000/fps), loop=0)
        assert Image.open(target).size == sheet.size
        if '--apply' in sys.argv:
            assert sha(target) in [sha(backup), sha(packed)], f'Concurrent art change: {target}'
            shutil.copy2(packed, target)
        report.append(dict(id=name, file=str(target.relative_to(ROOT)), frames=n, fps=fps, sha256=sha(packed), frameBoxes=[f.getbbox() for f in frames], applied='--apply' in sys.argv))
    (OUT/'report.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    cards = ''.join(f'<article><h2>{r["id"]}</h2><img src="{r["id"]}-preview.gif"><p>{r["frames"]} quadros / {r["fps"]} FPS</p><a href="{r["id"]}-contact.png">Quadros numerados</a></article>' for r in report)
    (OUT/'revisao.html').write_text('<!doctype html><meta charset="utf-8"><title>Revisão de coerência</title><style>body{background:#18232e;color:white;font:18px system-ui;padding:24px}article{display:inline-block;vertical-align:top;padding:20px}img{display:block;width:384px;image-rendering:pixelated}a{color:#aee2ff}</style><h1>Revisão de coerência dos golpes</h1>'+cards, encoding='utf-8')
    print(f'{len(report)} sheets packed; applied={"--apply" in sys.argv}')

if __name__ == '__main__': main()
