"""Pack image-generated dizzy poses; leaves combat integration to its owner."""
import json
import hashlib
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/stun-v8'
ROOTS = {'urubu': 'urubu/frente', 'almirante': 'almirante/base',
         'saci': 'saci', 'cartola': 'cartola/urubu-v1',
         'bira': 'cachorro/urubu-v1', 'galo': 'galo/urubu-v1'}


def box(im):
    return im.getchannel('A').point(lambda a: 255 if a > 32 else 0).getbbox()


def main():
    source = Image.open(OUT / 'atlas-source.png').convert('RGBA')
    report, cards = [], []
    for row, (name, folder) in enumerate(ROOTS.items()):
        crops = [source.crop((col * source.width // 4, row * source.height // 6,
                             (col + 1) * source.width // 4, (row + 1) * source.height // 6))
                 for col in range(4)]
        bounds = [box(c) for c in crops]
        assert all(bounds), name
        for c, b in zip(crops, bounds):
            assert b[0] > 0 and b[1] > 0 and b[2] < c.width and b[3] < c.height, (name, 'clipped', b)
        idle = Image.open(OUT / f'{name}-idle.png').convert('RGBA')
        ib = box(idle)
        # Uniform row scale, keeping foot baseline and full orbit in the cell.
        scale = min((ib[3] - 8) / max(b[3] - b[1] for b in bounds),
                    224 / max(b[2] - b[0] for b in bounds))
        frames = []
        for crop, b in zip(crops, bounds):
            figure = crop.crop(b)
            figure = figure.resize((round(figure.width * scale), round(figure.height * scale)), Image.Resampling.NEAREST)
            cell = Image.new('RGBA', (256, 256))
            cell.alpha_composite(figure, ((256 - figure.width) // 2, ib[3] - figure.height))
            frames.append(cell)
        sheet = Image.new('RGBA', (1280, 256))
        contact = Image.new('RGB', (1280, 280), '#28333f')
        draw = ImageDraw.Draw(contact)
        contact.paste(idle, (0, 24), idle)
        draw.text((8, 5), 'idle', fill='white')
        gifs = []
        for i, f in enumerate(frames):
            sheet.alpha_composite(f, (i * 256, 0))
            contact.paste(f, ((i + 1) * 256, 24), f)
            draw.text(((i + 1) * 256 + 8, 5), str(i), fill='white')
            bg = Image.new('RGB', (256, 256), '#28333f')
            bg.paste(f, (0, 0), f)
            gifs.append(bg)
        target = ROOT / 'public/assets/lutadores' / folder / 'stunned.png'
        assert not target.exists() or target.read_bytes() == (OUT / f'{name}-packed.png').read_bytes(), ('Existing art changed', target)
        sheet.save(OUT / f'{name}-packed.png')
        sheet.save(target)
        contact.save(OUT / f'{name}-contact.png')
        gifs[0].save(OUT / f'{name}-preview.gif', save_all=True, append_images=gifs[1:], duration=160, loop=0)
        report.append(dict(id=name, file=target.relative_to(ROOT).as_posix(), action='stunned',
                           frames=4, frameRate=6, repeat=-1, columns=5, frameWidth=256, frameHeight=256,
                           frameBoxes=[box(f) for f in frames],
                           sha256=hashlib.sha256(target.read_bytes()).hexdigest()))
        cards.append(f'<article><h2>{name}</h2><img src="{name}-preview.gif"><a href="{name}-contact.png">Guarda e quatro quadros</a></article>')
    (OUT / 'claude-integration.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    (OUT / 'revisao.html').write_text('<!doctype html><meta charset="utf-8"><title>Tontura</title><style>body{background:#18222e;color:white;font:16px system-ui;padding:24px}article{display:inline-block;padding:16px}img{display:block;width:320px;image-rendering:pixelated}a{color:#bde3ff}</style><h1>Estunados: ciclo de tontura</h1><p>4 quadros, 6 FPS sugeridos. Arte pronta para integrar ao stun.</p>' + ''.join(cards), encoding='utf-8')
    print('Packed six dizzy loops; combat definitions unchanged.')


if __name__ == '__main__':
    main()
