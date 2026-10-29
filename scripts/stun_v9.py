"""Pack individually image-generated stun poses. No art drawing or recoloring."""
import argparse
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/stun-v9'
FOLDERS = {'urubu': 'urubu/frente', 'almirante': 'almirante/base',
           'saci': 'saci', 'cartola': 'cartola/urubu-v1',
           'bira': 'cachorro/urubu-v1', 'galo': 'galo/urubu-v1'}


def bounds(im):
    return im.getchannel('A').point(lambda a: 255 if a > 32 else 0).getbbox()


def body_top(im):
    """Find largest connected opaque component, ignoring detached dizzy marks."""
    factor = 4
    small = im.getchannel('A').resize((im.width // factor, im.height // factor),
                                     Image.Resampling.NEAREST)
    pixels = small.load()
    seen = set()
    largest = []
    for y in range(small.height):
        for x in range(small.width):
            if (x, y) in seen or pixels[x, y] <= 32:
                continue
            todo, component = [(x, y)], []
            seen.add((x, y))
            while todo:
                px, py = todo.pop()
                component.append((px, py))
                for nx, ny in ((px-1, py), (px+1, py), (px, py-1), (px, py+1)):
                    if 0 <= nx < small.width and 0 <= ny < small.height:
                        if (nx, ny) not in seen and pixels[nx, ny] > 32:
                            seen.add((nx, ny))
                            todo.append((nx, ny))
            if len(component) > len(largest):
                largest = component
    assert largest
    return min(y for x, y in largest) * factor


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    reports, cards = [], []
    all_contact = Image.new('RGB', (1280, 280 * 6), '#29343f')
    for row, (name, folder) in enumerate(FOLDERS.items()):
        source_path = OUT / (f'{name}-fixed-source.png' if name in ('urubu', 'cartola')
                             else f'{name}-source.png')
        source = Image.open(source_path).convert('RGBA')
        crops = [source.crop((i * source.width // 4, 0,
                              (i + 1) * source.width // 4, source.height)) for i in range(4)]
        if name == 'cartola':
            # Actual new drawing replaces the contradictory third pose, never a duplicate.
            crops[2] = Image.open(OUT / 'cartola-third-source.png').convert('RGBA')
            b = bounds(crops[2])
            # Normalize this separately generated frame to the same source body scale.
            reference_height = bounds(crops[0])[3] - body_top(crops[0])
            height = b[3] - body_top(crops[2])
            ratio = reference_height / height
            crops[2] = crops[2].resize((round(crops[2].width * ratio),
                                       round(crops[2].height * ratio)), Image.Resampling.NEAREST)
        boxes = [bounds(c) for c in crops]
        for c, b in zip(crops, boxes):
            assert b and b[0] > 0 and b[1] > 0 and b[2] < c.width and b[3] < c.height, (name, b)
        idle = Image.open(OUT / f'{name}-idle.png').convert('RGBA')
        ib = bounds(idle)
        target_height = (ib[3] - ib[1]) * .96
        scale = target_height / max(b[3] - body_top(c) for c, b in zip(crops, boxes))
        # Effects must fit, but they never define the character's intended scale.
        assert max((b[3] - b[1]) * scale for b in boxes) <= ib[3] - 2, name
        assert max((b[2] - b[0]) * scale for b in boxes) < 250, name
        frames = []
        for c, b in zip(crops, boxes):
            cut = c.crop(b)
            cut = cut.resize((round(cut.width * scale), round(cut.height * scale)),
                             Image.Resampling.NEAREST)
            frame = Image.new('RGBA', (256, 256))
            x = round((ib[0] + ib[2]) / 2 - cut.width / 2)
            x = max(2, min(254 - cut.width, x))
            frame.alpha_composite(cut, (x, ib[3] - cut.height))
            frames.append(frame)
        sheet = Image.new('RGBA', (1280, 256))
        contact = Image.new('RGB', (1280, 280), '#29343f')
        draw = ImageDraw.Draw(contact)
        contact.paste(idle, (0, 24), idle)
        draw.text((8, 5), name + ' / idle', fill='white')
        previews = []
        for i, frame in enumerate(frames):
            sheet.alpha_composite(frame, (i * 256, 0))
            contact.paste(frame, ((i + 1) * 256, 24), frame)
            draw.text(((i + 1) * 256 + 8, 5), str(i), fill='white')
            bg = Image.new('RGB', (256, 256), '#29343f')
            bg.paste(frame, (0, 0), frame)
            previews.append(bg)
        sheet.save(OUT / f'{name}-packed.png')
        contact.save(OUT / f'{name}-contact.png')
        all_contact.paste(contact, (0, row * 280))
        previews[0].save(OUT / f'{name}-preview.gif', save_all=True,
                         append_images=previews[1:], duration=167, loop=0)
        target = ROOT / 'public/assets/lutadores' / folder / 'stunned.png'
        previous = OUT / f'{name}-previous.png'
        if args.apply:
            if not previous.exists():
                previous.write_bytes(target.read_bytes())
            else:
                assert target.read_bytes() in (previous.read_bytes(), (OUT / f'{name}-packed.png').read_bytes())
            target.write_bytes((OUT / f'{name}-packed.png').read_bytes())
        assert sheet.crop((1024, 0, 1280, 256)).getbbox() is None
        reports.append(dict(id=name, file=target.relative_to(ROOT).as_posix(),
                            frames=4, columns=5, frameWidth=256, frameHeight=256,
                            frameRate=6, repeat=-1, frameBoxes=[bounds(f) for f in frames],
                            sha256=hashlib.sha256((OUT / f'{name}-packed.png').read_bytes()).hexdigest(),
                            applied=args.apply))
        cards.append(f'<article><h2>{name}</h2><img src="{name}-preview.gif">'
                     f'<a href="{name}-contact.png">Guarda e quatro quadros</a></article>')
    all_contact.save(OUT / 'all-contact.png')
    (OUT / 'report.json').write_text(json.dumps(reports, indent=2), encoding='utf-8')
    (OUT / 'revisao.html').write_text(
        '<!doctype html><meta charset="utf-8"><title>Stun v9</title>'
        '<style>body{background:#18222e;color:white;font:16px system-ui;padding:24px}'
        'article{display:inline-block;padding:16px}img{display:block;width:256px;'
        'image-rendering:pixelated}a{color:#bde3ff}</style><h1>Stun v9</h1>'
        '<p>4 quadros / 6 FPS. Referencias individuais; escala calculada pelo corpo.</p>'
        + ''.join(cards), encoding='utf-8')
    print('Six sheets packed.' + (' Applied.' if args.apply else ' Preview only.'))


if __name__ == '__main__':
    main()
