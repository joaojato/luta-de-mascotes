"""Prepare guides and pack individually image-generated Porco actions.

No combat registration or mechanics. Scripts never redraw or warp anatomy.
"""
import argparse
import hashlib
import json
import shutil
from pathlib import Path
from PIL import Image, ImageDraw
from movimentos_v10 import bounds, extract

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/porco-v1'
DEST = ROOT / 'public/assets/lutadores/porco/terno-v1'
IDENTITY = ROOT / 'referencia/porco/base-terno-v2.png'
GUARD = ROOT / 'referencia/porco/sprite-terno-v2-256.png'
SPECS = {
    'idle': (4, 8), 'walk-forward': (8, 8), 'walk-backward': (8, 8),
    'dash-forward': (5, 18), 'dash-back': (4, 18), 'crouch': (5, 20),
    'jump': (8, 10), 'jump-kick': (6, 14), 'jump-punch': (5, 14),
    'block-high': (4, 10), 'block-low': (4, 10), 'hit-high': (6, 12),
    'stunned': (4, 6), 'light-punch': (6, 14), 'heavy-punch': (8, 14),
    'heavy-kick': (10, 12), 'low-kick-run': (8, 16), 'low-kick': (10, 14),
    'special-charge': (5, 14), 'special': (6, 12), 'knockdown': (10, 10)
}
LOOPS = {'idle', 'walk-forward', 'walk-backward', 'stunned', 'low-kick-run'}
AIR = {'jump-kick', 'jump-punch'}
RETURN_GUARD = {'dash-forward', 'dash-back', 'hit-high', 'light-punch', 'heavy-punch', 'heavy-kick', 'low-kick', 'special'}


def shorts_axis(im):
    """Measure the largest neutral white garment region, never repaint it."""
    points = set()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = im.getpixel((x, y))
            if a > 128 and min(r, g, b) >= 145 and max(r, g, b) - min(r, g, b) < 40:
                points.add((x, y))
    components = []
    while points:
        start = points.pop()
        todo = [start]
        component = [start]
        while todo:
            x, y = todo.pop()
            for neighbor in [(x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)]:
                if neighbor in points:
                    points.remove(neighbor)
                    todo.append(neighbor)
                    component.append(neighbor)
        components.append(component)
    main = max(components, key=len)
    assert len(main) >= 15, 'Cannot locate white shorts'
    return (min(x for x, y in main) + max(x for x, y in main)) / 2


def prepare():
    OUT.mkdir(parents=True, exist_ok=True)
    DEST.mkdir(parents=True, exist_ok=True)
    assert not (OUT / 'production.json').exists(), 'Already prepared; preserve reference snapshot'
    shutil.copy2(GUARD, OUT / 'guard.png')
    shutil.copy2(GUARD, DEST / 'guard-reference.png')
    refs = []
    for name, folder in [('urubu', 'urubu/frente'), ('cachorro', 'cachorro/urubu-v1')]:
        definition = ROOT / f'src/game/lutadores/{name}.json'
        data = json.loads(definition.read_text(encoding='utf-8'))
        for a in data['actions']:
            source = ROOT / 'public/assets/lutadores' / folder / a['file']
            sheet = Image.open(source).convert('RGBA')
            n = a['frames']
            cols = (n + 1) // 2 if n > 4 else 2
            guide = Image.new('RGBA', (cols * 256, 512))
            for i in range(n):
                cell = sheet.crop((i % 5 * 256, i // 5 * 256, (i % 5 + 1) * 256, (i // 5 + 1) * 256))
                guide.alpha_composite(cell, (i % cols * 256, i // cols * 256))
            guide.save(OUT / f'{name}-{a["action"]}-guide.png')
            refs.append({'character': name, 'action': a['action'], 'file': str(source.relative_to(ROOT)),
                         'frames': n, 'fps': a['frameRate'], 'sha256': hashlib.sha256(source.read_bytes()).hexdigest()})
    (OUT / 'production.json').write_text(json.dumps({'identity': str(IDENTITY.relative_to(ROOT)),
        'identitySha256': hashlib.sha256(IDENTITY.read_bytes()).hexdigest(),
        'guardSha256': hashlib.sha256(GUARD.read_bytes()).hexdigest(), 'actions': SPECS,
        'limbs': {'A': 'near leg at image-right in original guard', 'B': 'far leg advanced image-left in original guard',
                  'armA': 'near arm at image-right guarding abdomen', 'armB': 'far raised arm at image-left'},
        'referenceSnapshot': refs, 'runtimeModified': False}, ensure_ascii=False, indent=2), encoding='utf-8')


def pack(action, calibration=0, mode='feet', scale_override=None, source_count=None):
    count, fps = SPECS[action]
    path = OUT / f'{action}-source.png'
    source = Image.open(path).convert('RGBA')
    poses = extract(source, source_count or count)
    base = Image.open(GUARD).convert('RGBA')
    cb = bounds(poses[calibration])
    scale = scale_override or 200 / (cb[3] - cb[1])
    prepared = []
    for i, pose in enumerate(poses[:count]):
        figure = pose.crop(bounds(pose))
        figure = figure.resize((round(figure.width * scale), round(figure.height * scale)), Image.Resampling.NEAREST)
        assert figure.width <= 250 and figure.height <= 250, (action, i, figure.size, 'Use shared anatomical scale; never fit individual frames')
        frame = Image.new('RGBA', (256, 256))
        y = 228 - figure.height
        if mode == 'head' or (action == 'jump' and i >= 3) or (action == 'low-kick' and 3 <= i <= 6):
            y = 28
        elif mode == 'ko':
            y = 228 - figure.height
        if action == 'low-kick-run' and i in {0, 1, 2, 3, 7}:
            y = 80  # Suspended gallop beats; ground contacts remain in 4-6.
        if action == 'dash-back' and i in {1, 2}:
            y = 208 - figure.height  # Two unsupported hop poses, then landing.
        assert y >= 2 and y + figure.height <= 254, (action, i, y, figure.height)
        frame.alpha_composite(figure, ((256 - figure.width) // 2, y))
        if i == 0 and calibration == 0 and action not in AIR and action not in {'stunned', 'low-kick-run', 'walk-forward', 'walk-backward'}:
            frame = base.copy()
        if i == count - 1 and action in RETURN_GUARD:
            frame = base.copy()
        prepared.append(frame)
    sheet = Image.new('RGBA', (1280, 256 * ((count + 4) // 5)))
    contact = Image.new('RGB', (768, 282 * ((count + 3) // 3)), '#35404b')
    draw = ImageDraw.Draw(contact)
    for i, frame in enumerate([base] + prepared):
        x, y = i % 3 * 256, i // 3 * 282
        contact.paste(frame, (x, y + 20), frame)
        draw.text((x + 6, y + 4), 'BASE' if i == 0 else f'{action} {i - 1}', fill='white')
    previews = []
    for i, frame in enumerate(prepared):
        sheet.alpha_composite(frame, (i % 5 * 256, i // 5 * 256))
        bg = Image.new('RGB', (256, 256), '#35404b')
        bg.paste(frame, (0, 0), frame)
        previews.append(bg)
    sheet.save(OUT / f'{action}.png')
    contact.save(OUT / f'{action}-contact.png')
    durations = [round(1000 / fps)] * count
    if action in {'crouch', 'block-high', 'block-low', 'special-charge', 'knockdown'}:
        durations[-1] += 800
    previews[0].save(OUT / f'{action}.gif', save_all=True, append_images=previews[1:], duration=durations, loop=0)
    report = {'action': action, 'frames': count, 'fps': fps, 'repeatSuggested': -1 if action in LOOPS else 0,
        'columns': 5, 'cell': [256, 256], 'scale': scale, 'calibration': calibration, 'mode': mode, 'sourceCount': source_count or count,
        'frameBounds': [bounds(f) for f in prepared], 'whiteShortsAxes': [shorts_axis(f) for f in prepared],
        'sourceSha256': hashlib.sha256(path.read_bytes()).hexdigest(),
        'assetSha256': hashlib.sha256((OUT / f'{action}.png').read_bytes()).hexdigest(), 'status': 'pending visual inspection'}
    (OUT / f'{action}-report.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps(report))


def accept(action, notes):
    p = OUT / f'{action}-report.json'
    r = json.loads(p.read_text(encoding='utf-8'))
    assert notes and hashlib.sha256((OUT / f'{action}.png').read_bytes()).hexdigest() == r['assetSha256']
    target = DEST / f'{action}.png'
    assert not target.exists(), 'Review destination before replacement'
    shutil.copy2(OUT / f'{action}.png', target)
    r.update(status='installed after visual inspection', reviewNotes=notes)
    p.write_text(json.dumps(r, indent=2), encoding='utf-8')
    review()


def pack_vomit():
    action = 'vomit-jet'
    source_path = OUT / f'{action}-source.png'
    source = Image.open(source_path).convert('RGBA')
    assert source.getchannel('A').getextrema()[0] == 0, 'Effect needs real transparency'
    def gutter_cuts(image, count, axis):
        alpha = image.getchannel('A').point(lambda a: 255 if a > 32 else 0)
        length = image.width if axis == 'x' else image.height
        result = [0]
        for i in range(1, count):
            middle = length * i / count
            lo = max(result[-1] + 1, round(middle - length / count * .3))
            hi = min(length - 1, round(middle + length / count * .3))
            runs = []; start = None
            for n in range(lo, hi + 1):
                strip = alpha.crop((n, 0, n + 1, image.height) if axis == 'x' else (0, n, image.width, n + 1))
                empty = strip.getbbox() is None
                if empty and start is None:
                    start = n
                if not empty and start is not None:
                    runs.append((start, n)); start = None
            if start is not None:
                runs.append((start, hi + 1))
            assert runs, 'No transparent effect gutter'
            a, b = max(runs, key=lambda r: r[1] - r[0])
            result.append((a + b) // 2)
        return result + [length]
    ys = gutter_cuts(source, 2, 'y')
    cells = []
    for row in range(2):
        band = source.crop((0, ys[row], source.width, ys[row + 1]))
        xs = gutter_cuts(band, 3, 'x')
        cells.extend(band.crop((xs[col], 0, xs[col + 1], band.height)) for col in range(3))
    # One scale across all six effect cells, preserving disconnected droplets.
    scale = min(460 / max(c.width for c in cells), 220 / max(c.height for c in cells))
    frames = []
    for cell in cells:
        b = bounds(cell)
        assert b and b[0] > 1 and b[1] > 1 and b[2] < cell.width - 1 and b[3] < cell.height - 1, ('Clipped effect', b)
        figure = cell.crop(b)
        figure = figure.resize((round(figure.width * scale), round(figure.height * scale)), Image.Resampling.NEAREST)
        # Narrow tail at the RIGHT is the mouth emission attachment.
        a = figure.getchannel('A')
        edge_y = [y for y in range(figure.height) for x in range(max(0, figure.width - 4), figure.width) if a.getpixel((x, y)) > 32]
        origin_y = round((min(edge_y) + max(edge_y)) / 2)
        frame = Image.new('RGBA', (512, 256))
        x, y = 480 - figure.width, 128 - origin_y
        assert x >= 2 and y >= 2 and y + figure.height <= 254, ('Effect does not fit', x, y, figure.size)
        frame.alpha_composite(figure, (x, y))
        frames.append(frame)
    sheet = Image.new('RGBA', (2560, 512))
    contact = Image.new('RGB', (1024, 846), '#35404b')
    previews = []
    for i, f in enumerate(frames):
        sheet.alpha_composite(f, (i % 5 * 512, i // 5 * 256))
        contact.paste(f, (i % 2 * 512, i // 2 * 282 + 20), f)
        ImageDraw.Draw(contact).text((i % 2 * 512 + 6, i // 2 * 282 + 3), f'vomit {i}', fill='white')
        bg = Image.new('RGB', (512, 256), '#35404b'); bg.paste(f, (0, 0), f); previews.append(bg)
    sheet.save(OUT / f'{action}.png'); contact.save(OUT / f'{action}-contact.png')
    previews[0].save(OUT / f'{action}.gif', save_all=True, append_images=previews[1:], duration=100, loop=0)
    r = {'action': action, 'frames': 6, 'fps': 10, 'columns': 5, 'cell': [512, 256],
         'direction': 'left', 'mouthOrigin': [480, 128], 'frameBounds': [bounds(f) for f in frames],
         'scale': scale, 'sourceSha256': hashlib.sha256(source_path.read_bytes()).hexdigest(),
         'assetSha256': hashlib.sha256((OUT / f'{action}.png').read_bytes()).hexdigest(), 'status': 'pending visual inspection'}
    (OUT / f'{action}-report.json').write_text(json.dumps(r, indent=2), encoding='utf-8')
    print(json.dumps(r))


def review():
    cards = []
    reports = []
    for action in SPECS:
        p = OUT / f'{action}-report.json'
        if not p.exists():
            continue
        r = json.loads(p.read_text(encoding='utf-8'))
        if not r['status'].startswith('installed'):
            continue
        reports.append(r)
        cards.append(f'<article><h2>{action}</h2><img src="{action}.gif"><p>{r["frames"]} quadros / {r["fps"]} FPS</p>'
                     f'<a href="{action}-contact.png">Quadros</a> | <a href="{action}-source.png">Fonte</a></article>')
    effects = []
    fp = OUT / 'vomit-jet-report.json'
    if fp.exists():
        fx = json.loads(fp.read_text(encoding='utf-8'))
        if fx['status'].startswith('installed'):
            effects.append(fx)
            cards.append('<article><h2>Vômito — efeito separado</h2><img style="width:512px" src="vomit-jet.gif">'
                         '<p>6 quadros / 10 FPS / origem da boca em (480,128)</p><a href="vomit-jet-contact.png">Quadros</a></article>')
    (OUT / 'revisao.html').write_text('<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Porco</title>'
        '<style>body{background:#202934;color:#eef5fc;font:16px system-ui;padding:24px}main{display:flex;flex-wrap:wrap;gap:18px}'
        'article{background:#35404b;padding:16px}img{width:256px;height:256px;image-rendering:pixelated}a{color:#a8d5ff}</style>'
        f'<h1>Porco — terno verde, calção branco</h1><p>{len(reports)} de {len(SPECS)} ações de corpo revisadas.</p>'
        '<p>GIFs repetem para revisão; não são testes de combate. Artes e contratos para integração da lógica.</p>'
        + ('<p>Composição de emissão para conferir a boca e o jato (200 ms por pose, só para revisão):</p>'
           '<img style="width:800px;height:320px;max-width:100%;object-fit:contain" src="special-composite-preview.gif">'
           if (OUT / 'special-composite-preview.gif').exists() else '') +
        '<main>' + ''.join(cards) + '</main>', encoding='utf-8')
    (DEST / 'manifest.json').write_text(json.dumps({'actions': reports,
        'pending': [a for a in SPECS if a not in {r['action'] for r in reports}],
        'effects': effects, 'runtimeRegistered': False}, ensure_ascii=False, indent=2), encoding='utf-8')


def verify():
    production = json.loads((OUT / 'production.json').read_text(encoding='utf-8'))
    assert hashlib.sha256(IDENTITY.read_bytes()).hexdigest() == production['identitySha256'], 'Identity changed during production'
    assert hashlib.sha256(GUARD.read_bytes()).hexdigest() == production['guardSha256'], 'Guard changed during production'
    guard = Image.open(GUARD).convert('RGBA')
    assert guard.tobytes() == Image.open(DEST / 'guard-reference.png').convert('RGBA').tobytes()
    summaries = []
    for action in [*SPECS, 'vomit-jet']:
        r = json.loads((OUT / f'{action}-report.json').read_text(encoding='utf-8'))
        assert r['status'].startswith('installed'), action
        file = DEST / f'{action}.png'
        assert hashlib.sha256(file.read_bytes()).hexdigest() == r['assetSha256'], action
        assert hashlib.sha256((OUT / f'{action}-source.png').read_bytes()).hexdigest() == r['sourceSha256'], (action, 'source changed')
        w, h = r['cell']; count = r['frames']; sheet = Image.open(file)
        assert sheet.mode == 'RGBA' and sheet.size == (w * 5, h * ((count + 4) // 5)), action
        frames = []
        for i in range(sheet.width // w * (sheet.height // h)):
            cell = sheet.crop((i % 5 * w, i // 5 * h, (i % 5 + 1) * w, (i // 5 + 1) * h))
            if i >= count:
                assert cell.getchannel('A').getbbox() is None, (action, i, 'unused cell')
                continue
            b = bounds(cell)
            assert b and min(b[0], b[1]) >= 2 and b[2] <= w - 2 and b[3] <= h - 2, (action, i, b)
            assert cell.getchannel('A').getextrema()[0] == 0, (action, i, 'transparency')
            frames.append(cell)
        if action in RETURN_GUARD:
            assert frames[-1].tobytes() == guard.tobytes(), (action, 'return guard')
        if action in AIR or action == 'stunned':
            assert all(f.tobytes() != guard.tobytes() for f in frames), (action, 'unintended guard flash')
        if action in {'crouch', 'block-high', 'block-low', 'special-charge', 'knockdown'}:
            assert frames[-1].tobytes() != guard.tobytes(), (action, 'hold final pose')
        if action == 'crouch':
            b = bounds(frames[-1]); assert b[3] - b[1] <= 140, (action, 'deep crouch')
        if action == 'jump':
            assert all(abs(bounds(f)[1] - 28) <= 2 for f in frames[3:]), 'Second jump arc'
        if action == 'low-kick':
            assert all(bounds(frames[i])[3] < 228 for i in range(3, 7)), 'Back kick must be airborne'
        if action == 'low-kick-run':
            assert all(bounds(frames[i])[3] < 228 for i in [0, 1, 2, 3, 7]), 'Run suspension'
        duplicates = [[i, j] for i in range(count) for j in range(i + 1, count) if frames[i].tobytes() == frames[j].tobytes()]
        summaries.append({'action': action, 'frames': count, 'fps': r['fps'], 'exactDuplicatePairs': duplicates})
    result = {'bodyActions': len(SPECS), 'bodyFrames': sum(n for n, fps in SPECS.values()),
              'effectSheets': 1, 'effectFrames': 6, 'rgba': True, 'marginsVerified': True,
              'allSourceAndAssetHashesMatch': True, 'canonicalGuardUnchanged': True,
              'heldAndAirborneStatesVerified': True, 'visualCombatTest': False, 'actions': summaries}
    (OUT / 'validation.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
    review()
    print(json.dumps(result))


if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('action', choices=['prepare', 'review', 'verify', 'vomit-jet', *SPECS])
    p.add_argument('--calibration', type=int, default=0)
    p.add_argument('--mode', choices=['feet', 'head', 'ko'], default='feet')
    p.add_argument('--scale', type=float)
    p.add_argument('--source-count', type=int)
    p.add_argument('--accept', metavar='REVIEW_NOTES')
    a = p.parse_args()
    if a.action == 'prepare':
        prepare()
    elif a.action == 'review':
        review()
    elif a.action == 'verify':
        verify()
    elif a.accept:
        accept(a.action, a.accept)
    elif a.action == 'vomit-jet':
        pack_vomit()
    else:
        pack(a.action, a.calibration, a.mode, a.scale, a.source_count)
