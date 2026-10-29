"""Assemble individually generated Biriba actions; never draw or warp bodies."""
import argparse
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageDraw
from movimentos_v10 import bounds, extract

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/biriba'
DEST = ROOT / 'public/assets/cenarios/biriba'
SPECS = {'idle': (4, 6), 'walk': (4, 8), 'bark': (6, 10)}


def base():
    source = Image.open(OUT / 'base-source.png').convert('RGBA')
    figure = source.crop(bounds(source))
    scale = 220 / figure.width
    figure = figure.resize((round(figure.width * scale), round(figure.height * scale)), Image.Resampling.NEAREST)
    frame = Image.new('RGBA', (256, 256))
    frame.alpha_composite(figure, ((256 - figure.width) // 2, 232 - figure.height))
    frame.save(OUT / 'base.png')


def pack(action):
    count, fps = SPECS[action]
    source = Image.open(OUT / f'{action}-source.png').convert('RGBA')
    poses = extract(source, count)
    reference = Image.open(OUT / 'base.png').convert('RGBA')
    rb = bounds(reference)
    first = bounds(poses[0])
    scale = (rb[3] - rb[1]) / (first[3] - first[1])
    frames = []
    for i, pose in enumerate(poses):
        figure = pose.crop(bounds(pose))
        figure = figure.resize((round(figure.width * scale), round(figure.height * scale)), Image.Resampling.NEAREST)
        assert figure.width < 250 and figure.height < 228, (action, i, figure.size)
        frame = Image.new('RGBA', (256, 256))
        frame.alpha_composite(figure, ((256 - figure.width) // 2, 232 - figure.height))
        if action == 'idle' and i == 0:
            frame = reference.copy()
        frames.append(frame)
    sheet = Image.new('RGBA', (1280, 256 * ((count + 4) // 5)))
    contact = Image.new('RGB', (256 * 3, 282 * ((count + 3) // 3)), '#35404b')
    draw = ImageDraw.Draw(contact)
    for i, frame in enumerate([reference] + frames):
        x, y = i % 3 * 256, i // 3 * 282
        contact.paste(frame, (x, y + 20), frame)
        draw.text((x + 8, y + 3), 'Base' if i == 0 else f'{action} {i - 1}', fill='white')
    for i, frame in enumerate(frames):
        sheet.alpha_composite(frame, (i % 5 * 256, i // 5 * 256))
    sheet.save(OUT / f'{action}.png')
    contact.save(OUT / f'{action}-contact.png')
    previews = []
    for frame in frames:
        bg = Image.new('RGB', (256, 256), '#35404b')
        bg.paste(frame, (0, 0), frame)
        previews.append(bg)
    previews[0].save(OUT / f'{action}.gif', save_all=True, append_images=previews[1:], duration=round(1000 / fps), loop=0)
    report = {'action': action, 'frames': count, 'fps': fps, 'columns': 5, 'cell': [256, 256],
              'baseline': 232, 'sharedScale': scale, 'frameBounds': [bounds(f) for f in frames],
              'sourceSha256': hashlib.sha256((OUT / f'{action}-source.png').read_bytes()).hexdigest(),
              'assetSha256': hashlib.sha256((OUT / f'{action}.png').read_bytes()).hexdigest(),
              'status': 'pending visual inspection'}
    (OUT / f'{action}-report.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps(report))


def install(action, notes):
    import shutil
    path = OUT / f'{action}-report.json'
    report = json.loads(path.read_text(encoding='utf-8'))
    assert notes and hashlib.sha256((OUT / f'{action}.png').read_bytes()).hexdigest() == report['assetSha256']
    DEST.mkdir(parents=True, exist_ok=True)
    target = DEST / f'{action}.png'
    assert not target.exists(), 'Inspect existing destination before replacing'
    shutil.copy2(OUT / f'{action}.png', target)
    report.update(status='installed after visual inspection', reviewNotes=notes)
    path.write_text(json.dumps(report, indent=2), encoding='utf-8')
    review()


def review():
    cards = []
    for action in SPECS:
        path = OUT / f'{action}-report.json'
        if not path.exists():
            continue
        report = json.loads(path.read_text(encoding='utf-8'))
        if not report['status'].startswith('installed'):
            continue
        cards.append(f'<article><h2>{action}</h2><img src="{action}.gif">'
                     f'<p>{report["frames"]} quadros / {report["fps"]} FPS</p>'
                     f'<a href="{action}-contact.png">Todos os quadros</a> | '
                     f'<a href="{action}-source.png">Fonte</a></article>')
    (OUT / 'revisao.html').write_text('<!doctype html><html lang="pt-BR"><meta charset="utf-8">'
        '<title>Biriba</title><style>body{background:#202934;color:#eef5fc;font:16px system-ui;padding:24px}'
        'main{display:flex;flex-wrap:wrap;gap:20px}article{background:#35404b;padding:16px}'
        'img{width:256px;height:256px;image-rendering:pixelated}a{color:#a8d5ff}</style>'
        '<h1>Biriba, acompanhante do Bira</h1><p>Espera, caminhada e latido sem som. '
        'Os GIFs repetem para conferir a arte; no jogo o latido termina e ele volta a acompanhar.</p>'
        '<main>' + ''.join(cards) + '</main></html>', encoding='utf-8')


def verify():
    reports = []
    for action, (count, fps) in SPECS.items():
        report = json.loads((OUT / f'{action}-report.json').read_text(encoding='utf-8'))
        assert report['status'].startswith('installed'), action
        assert report['frames'] == count and report['fps'] == fps, action
        path = DEST / f'{action}.png'
        assert hashlib.sha256(path.read_bytes()).hexdigest() == report['assetSha256'], action
        sheet = Image.open(path)
        assert sheet.mode == 'RGBA' and sheet.size == (1280, 256 * ((count + 4) // 5)), action
        for i in range(sheet.width // 256 * (sheet.height // 256)):
            cell = sheet.crop((i % 5 * 256, i // 5 * 256, (i % 5 + 1) * 256, (i // 5 + 1) * 256))
            if i >= count:
                assert cell.getchannel('A').getbbox() is None, (action, i)
            else:
                b = bounds(cell)
                assert b[0] >= 2 and b[1] >= 2 and b[2] <= 254 and b[3] <= 254, (action, i, b)
                assert cell.getchannel('A').getextrema()[0] == 0, (action, i)
        reports.append(report)
    result = {'actions': reports, 'allHashesMatch': True, 'rgba': True, 'cells': [256, 256],
              'columns': 5, 'unusedCellsEmpty': True, 'marginsVerified': True}
    (DEST / 'manifest.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
    (OUT / 'validation.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
    print('Verified all three installed Biriba actions')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('action', choices=['base', 'verify', *SPECS])
    parser.add_argument('--install', metavar='REVIEW_NOTES')
    args = parser.parse_args()
    if args.action == 'base':
        base()
    elif args.action == 'verify':
        verify()
    elif args.install:
        install(args.action, args.install)
    else:
        pack(args.action)
