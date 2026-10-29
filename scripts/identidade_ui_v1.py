"""Assemble image-generated UI into the existing fixed-coordinate atlas."""
import argparse
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/identidade-ui-v1'
DEST = ROOT / 'public/assets/ui/fighting/fighting-ui-atlas-transparent.png'
MANIFEST = ROOT / 'public/assets/ui/fighting/fighting-ui-atlas-transparent.manifest.json'


def box(im):
    return im.getchannel('A').point(lambda a: 255 if a > 128 else 0).getbbox()


def trim(im):
    b = box(im)
    assert b, 'Empty source'
    return im.crop(b)


def region(im, x0, y0, x1, y1):
    return trim(im.crop((round(x0 * im.width), round(y0 * im.height),
                         round(x1 * im.width), round(y1 * im.height))))


def opening(im):
    """Locate the transparent central opening in an image-generated frame."""
    a = im.getchannel('A')
    cx, cy = im.width // 2, im.height // 2
    assert a.getpixel((cx, cy)) < 64, 'Expected open socket'
    left, right, top, bottom = cx, cx, cy, cy
    while left > 0 and a.getpixel((left - 1, cy)) < 128:
        left -= 1
    while right < im.width and a.getpixel((right, cy)) < 128:
        right += 1
    while top > 0 and a.getpixel((cx, top - 1)) < 128:
        top -= 1
    while bottom < im.height and a.getpixel((cx, bottom)) < 128:
        bottom += 1
    assert left > 0 and top > 0 and right < im.width and bottom < im.height
    return left, top, right, bottom


def fit_socket(im, size, slot):
    """Nine-slice assembly aligns the authored opening with the runtime socket."""
    sx0, sy0, sx1, sy1 = opening(im)
    dx0, dy0 = slot['x'], slot['y']
    dx1, dy1 = dx0 + slot['width'], dy0 + slot['height']
    xs, ys = [0, sx0, sx1, im.width], [0, sy0, sy1, im.height]
    # Bounds stay unchanged, but unused padding stays transparent: do not inflate
    # a thin painted outline to occupy the old ornamental frame's entire area.
    border_x, border_y = 12, 8 if slot['width'] > 300 else 12
    xd = [max(0, dx0-border_x), dx0, dx1, min(size[0], dx1+border_x)]
    yd = [max(0, dy0-border_y), dy0, dy1, min(size[1], dy1+border_y)]
    result = Image.new('RGBA', size)
    for row in range(3):
        for col in range(3):
            if row == col == 1:
                continue
            part = im.crop((xs[col], ys[row], xs[col+1], ys[row+1]))
            part = part.resize((xd[col+1]-xd[col], yd[row+1]-yd[row]),
                               Image.Resampling.NEAREST)
            result.alpha_composite(part, (xd[col], yd[row]))
    assert result.crop((dx0, dy0, dx1, dy1)).getchannel('A').getbbox() is None
    return result


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    manifest = json.loads(MANIFEST.read_text(encoding='utf-8'))
    frames = {f['name']: f for f in manifest['frames']}
    strips = Image.open(OUT / 'streetStrips-source.png').convert('RGBA')
    strip_parts = [region(strips, 0, r/4, 1, (r+1)/4) for r in range(4)]
    icons = Image.open(OUT / 'streetIconsFix-source.png').convert('RGBA')
    # Actual generated top row is taller than bottom row; inspect source before packing.
    icon_parts = [region(icons, c/3, 0, (c+1)/3, .64) for c in range(3)]
    icon_parts += [region(icons, c/3, .64, (c+1)/3, 1) for c in range(3)]
    fills = Image.open(OUT / 'streetFills-source.png').convert('RGBA')
    fill_parts = [region(fills, 0, r/3, 1, (r+1)/3) for r in range(3)]
    sparks = Image.open(OUT / 'sparks-source.png').convert('RGBA')
    spark_parts = [region(sparks, c/3, 0, (c+1)/3, 1) for c in range(3)]
    atlas = Image.new('RGBA', (1254, 1254))
    old = Image.open(OUT / 'atlas-previous.png').convert('RGBA')
    pieces = {}
    for name, f in frames.items():
        b = f['bounds']
        size = b['width'], b['height']
        socket = f.get('fillSlot') or f.get('portraitSocket')
        if name.startswith('health-frame'):
            source = strip_parts[0 if name.endswith('left') else 1]
        elif name.startswith('portrait-frame'):
            source = icon_parts[0 if 'gold' in name else 1]
            if name.endswith('right'):
                source = ImageOps.mirror(source)
        elif name == 'timer-frame':
            source = icon_parts[2]
        elif name.startswith('health-fill'):
            source = fill_parts[0 if 'green' in name else 1 if 'yellow' in name else 2]
        elif name.startswith('meter-pip'):
            source = icon_parts[3 if 'blue' in name else 4 if 'gold' in name else 5]
        elif name.startswith('nameplate'):
            source = strip_parts[2 if name.endswith('left') else 3]
        elif name.startswith('icon-hit'):
            source = spark_parts[0 if 'red' in name else 1 if 'gold' in name else 2]
        else:
            source = old.crop((b['x'], b['y'], b['x']+b['width'], b['y']+b['height']))
        if socket:
            piece = fit_socket(source, size, socket)
        elif name.startswith('icon-hit'):
            piece = Image.new('RGBA', size)
            cut = ImageOps.contain(source, (size[0]-4, size[1]-4), Image.Resampling.NEAREST)
            piece.alpha_composite(cut, ((size[0]-cut.width)//2, (size[1]-cut.height)//2))
        else:
            piece = source.resize(size, Image.Resampling.NEAREST)
        pieces[name] = piece
        atlas.alpha_composite(piece, (b['x'], b['y']))
    final = OUT / 'fighting-ui-atlas-transparent.png'
    atlas.save(final)
    # Compare actual frame bounds and sockets without changing either manifest.
    for name, f in frames.items():
        b = f['bounds']
        packed = atlas.crop((b['x'], b['y'], b['x']+b['width'], b['y']+b['height']))
        assert packed.getchannel('A').tobytes() == pieces[name].getchannel('A').tobytes(), name
        backdrop = Image.new('RGBA', packed.size, '#292b2d')
        assert Image.alpha_composite(backdrop, packed).tobytes() == Image.alpha_composite(backdrop, pieces[name]).tobytes(), name
    outputs = [(final, DEST)]
    for source_name, file, dims in [
        ('streetMode1v1', 'mode-1v1-card.png', (1330, 1182)),
        ('streetModecpu', 'mode-1vcpu-card.png', (1392, 1130))
    ]:
        source = Image.open(OUT / (source_name + '-source.png')).convert('RGB')
        path = OUT / file
        source.resize(dims, Image.Resampling.NEAREST).save(path)
        outputs.append((path, ROOT / 'public/assets/mode-cards' / file))
    logo_source = trim(Image.open(OUT / 'streetLogo-source.png').convert('RGBA'))
    logo = Image.new('RGBA', (1200, 400))
    logo_cut = ImageOps.contain(logo_source, (1160, 360), Image.Resampling.NEAREST)
    logo.alpha_composite(logo_cut, ((1200-logo_cut.width)//2, (400-logo_cut.height)//2))
    logo_path = OUT / 'luta-de-mascotes-logo.png'
    logo.save(logo_path)
    outputs.append((logo_path, ROOT / 'public/assets/branding/luta-de-mascotes-logo.png'))
    if args.apply:
        for source, target in outputs:
            target.parent.mkdir(parents=True, exist_ok=True)
            backup_name = {
                DEST: 'atlas-previous.png',
                ROOT / 'public/assets/mode-cards/mode-1v1-card.png': 'mode-1v1-previous.png',
                ROOT / 'public/assets/mode-cards/mode-1vcpu-card.png': 'mode-1vcpu-previous.png'
            }.get(target)
            if backup_name and target.exists():
                assert target.read_bytes() in ((OUT / backup_name).read_bytes(), source.read_bytes()), (
                    'Asset changed since backup; inspect before replacing', target)
            target.write_bytes(source.read_bytes())
    # Runtime-sized static mockup for checking fills and portrait alignment.
    preview = Image.new('RGBA', (1280, 280), '#292b2d')
    draw = ImageDraw.Draw(preview)
    name_font = ImageFont.truetype('C:/Windows/Fonts/consolab.ttf', 15)
    timer_font = ImageFont.truetype('C:/Windows/Fonts/consolab.ttf', 34)
    for side, x in [('left', 122), ('right', 690)]:
        f = frames['health-frame-' + side]
        b, slot = f['bounds'], f['fillSlot']
        scale_x, scale_y = 468/b['width'], 88/b['height']
        fill = pieces['health-fill-green-left'].resize(
            (round(slot['width']*scale_x), round(slot['height']*scale_y)), Image.Resampling.NEAREST)
        preview.alpha_composite(fill, (x+round(slot['x']*scale_x), 24+round(slot['y']*scale_y)))
        preview.alpha_composite(pieces['health-frame-'+side].resize((468,88), Image.Resampling.NEAREST), (x,24))
        name_x = x if side == 'left' else x+168
        preview.alpha_composite(pieces['nameplate-gold-'+side].resize((300,33),Image.Resampling.NEAREST),(name_x,114))
        draw.text((name_x+150,130), 'URUBU' if side == 'left' else 'GALO',
                  fill='#fff8e6', font=name_font, anchor='mm')
        portrait_name = 'portrait-frame-gold-left' if side == 'left' else 'portrait-frame-blue-right'
        portrait = pieces[portrait_name]
        portrait_meta = frames[portrait_name]
        socket = portrait_meta['portraitSocket']
        pb = portrait_meta['bounds']
        px, py = (20 if side == 'left' else 1164), 16
        character = 'urubu/frente' if side == 'left' else 'galo/urubu-v1'
        face = Image.open(ROOT / 'public/assets/lutadores' / character / 'portrait.png').convert('RGBA')
        if side == 'left':
            face = ImageOps.mirror(face)
        face = face.resize((round(socket['width']*96/pb['width']),
                            round(socket['height']*96/pb['height'])), Image.Resampling.NEAREST)
        preview.alpha_composite(face, (px+round(socket['x']*96/pb['width']),
                                       py+round(socket['y']*96/pb['height'])))
        preview.alpha_composite(portrait.resize((96,96),Image.Resampling.NEAREST),(px,py))
        for i in range(2):
            pip = pieces['meter-pip-gold-1' if i == 0 else 'meter-pip-empty-1']
            pip_x = x+i*36 if side == 'left' else x+468-30-i*36
            preview.alpha_composite(pip.resize((30,20),Image.Resampling.NEAREST),(pip_x,155))
    preview.alpha_composite(pieces['timer-frame'].resize((96,94),Image.Resampling.NEAREST),(592,16))
    draw.text((640,63),'99',fill='white',font=timer_font,anchor='mm')
    for i, color in enumerate(['red','gold','blue']):
        preview.alpha_composite(pieces['icon-hit-'+color], (475+i*115,180))
    preview.convert('RGB').save(OUT / 'hud-preview.png')
    report = dict(applied=args.apply, atlasSize=[1254,1254],
                  manifestSha256=sha(MANIFEST), frames=manifest['frames'],
                  outputs=[dict(file=t.relative_to(ROOT).as_posix(),
                                size=list(Image.open(s).size), sha256=sha(s)) for s,t in outputs])
    (OUT / 'report.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    (OUT / 'revisao.html').write_text(
        '<!doctype html><meta charset="utf-8"><title>Identidade de rua</title>'
        '<style>body{background:#26282b;color:#fff8e6;font:16px system-ui;margin:32px}'
        'img{max-width:100%;image-rendering:pixelated}.cards{display:flex;gap:24px}.cards img{width:46%}'
        '</style><h1>Luta de Mascotes — identidade de rua</h1>'
        '<h2>HUD em escala de tela</h2><img src="hud-preview.png">'
        '<h2>Atlas 1254 × 1254 — coordenadas preservadas</h2><img src="fighting-ui-atlas-transparent.png">'
        '<h2>Modos</h2><div class="cards"><img src="mode-1v1-card.png"><img src="mode-1vcpu-card.png"></div>'
        '<h2>Logo transparente 1200 × 400</h2><img src="luta-de-mascotes-logo.png">',
        encoding='utf-8')
    print('Packed 22 fixed atlas regions, two mode cards and logo.' + (' Applied.' if args.apply else ' Preview only.'))


if __name__ == '__main__':
    main()
