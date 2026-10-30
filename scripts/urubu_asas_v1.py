"""Assemble image-generated wing opening/closing without drawing body parts."""
import argparse
import hashlib
import json
import math
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/urubu-asas-v1'
DEST = ROOT / 'public/assets/lutadores/urubu/frente/heavy-wing-spread-v1.png'
CELL = (512, 256)


def bounds(im):
    return im.getchannel('A').point(lambda a: 255 if a > 32 else 0).getbbox()


def extract(source, count, columns=2, strict=True):
    w, h = source.size
    alpha = source.getchannel('A').tobytes()
    visited = bytearray(w * h)
    components = []
    for start, value in enumerate(alpha):
        if value <= 32 or visited[start]:
            continue
        visited[start] = 1; todo = [start]; component = []
        while todo:
            i = todo.pop(); component.append(i); x, y = i % w, i // w
            for j in (i - 1 if x else -1, i + 1 if x + 1 < w else -1, i - w if y else -1, i + w if y + 1 < h else -1):
                if j >= 0 and not visited[j] and alpha[j] > 32:
                    visited[j] = 1; todo.append(j)
        if len(component) > 100:
            xs = [i % w for i in component]; ys = [i // w for i in component]
            components.append(((min(xs), min(ys), max(xs) + 1, max(ys) + 1), component))
    components = sorted(components, key=lambda pair: len(pair[1]), reverse=True)[:count]
    assert len(components) == count, 'Missing body'
    components.sort(key=lambda pair: pair[0][1] + pair[0][3])
    ordered = []
    for i in range(0, count, columns):
        ordered.extend(sorted(components[i:i + columns], key=lambda pair: pair[0][0] + pair[0][2]))
    figures = []
    for b, component in ordered:
        if strict:
            assert b[0] > 1 and b[1] > 1 and b[2] < w - 1 and b[3] < h - 1, ('Clipped source', b)
        raw = bytearray(w * h)
        for i in component:
            raw[i] = 255
        mask = Image.frombytes('L', source.size, bytes(raw)).filter(ImageFilter.MaxFilter(3))
        figure = source.copy()
        figure.putalpha(ImageChops.multiply(source.getchannel('A'), mask))
        figures.append(figure.crop(bounds(figure)))
    return figures


def foot_axis(im):
    b = bounds(im)
    band = im.crop((0, max(b[1], b[3] - round((b[3] - b[1]) * .075)), im.width, b[3]))
    bb = bounds(band)
    return (bb[0] + bb[2]) / 2


def wide_guard():
    guard = Image.open(OUT / 'guard.png').convert('RGBA')
    frame = Image.new('RGBA', CELL)
    frame.alpha_composite(guard, (128, 0))
    return frame


def pack(part):
    count = 8 if part == 'opening' else 12
    calibration = 0 if part == 'opening' else 11
    source_path = OUT / f'{part}-source.png'
    figures = extract(Image.open(source_path).convert('RGBA'), count, columns=2 if part == 'opening' else 3)
    scale = 200 / figures[calibration].height
    guard = wide_guard(); target_axis = foot_axis(guard)
    frames = []
    for i, figure in enumerate(figures):
        figure = figure.resize((round(figure.width * scale), round(figure.height * scale)), Image.Resampling.NEAREST)
        # Closing0 is a non-exported contact reference; final contact holds opening7.
        max_width = 420 if part == 'closing' and i == 0 else 380
        assert figure.width <= max_width and figure.height <= 220, (part, i, figure.size, 'Redraw proportions instead of squeezing')
        x = round(target_axis - foot_axis(figure)); y = 228 - figure.height
        assert x >= 2 and y >= 2 and x + figure.width <= 510 and y + figure.height <= 254
        frame = Image.new('RGBA', CELL); frame.alpha_composite(figure, (x, y))
        if i == calibration:
            frame = guard.copy()
        frames.append(frame)
    save_part(part, frames, scale, source_path)


def save_part(part, frames, scale, source_path):
    sheet = Image.new('RGBA', (2560, 256 * math.ceil(len(frames) / 5)))
    contact = Image.new('RGB', (1024, 282 * math.ceil((len(frames) + 1) / 2)), '#35404b')
    draw = ImageDraw.Draw(contact)
    for i, frame in enumerate([wide_guard()] + frames):
        x, y = i % 2 * 512, i // 2 * 282
        contact.paste(frame, (x, y + 20), frame)
        draw.text((x + 8, y + 4), 'CANONICAL GUARD' if i == 0 else f'{part} {i - 1}', fill='white')
    for i, frame in enumerate(frames):
        sheet.alpha_composite(frame, (i % 5 * 512, i // 5 * 256))
        frame.save(OUT / f'{part}-frame{i}.png')
    sheet.save(OUT / f'{part}-packed.png'); contact.save(OUT / f'{part}-contact.png')
    if part == 'opening':
        frames[-1].save(OUT / 'peak-reference.png')
    (OUT / f'{part}-report.json').write_text(json.dumps({'part': part, 'frames': len(frames), 'scale': scale,
        'sourceSha256': hashlib.sha256(source_path.read_bytes()).hexdigest(), 'frameBounds': [bounds(f) for f in frames],
        'footAxes': [foot_axis(f) for f in frames], 'reviewed': False}, indent=2), encoding='utf-8')
    print(part, 'scale', scale, 'widths', [bounds(f)[2] - bounds(f)[0] for f in frames])


def pack_bridge():
    source_path = OUT / 'bridge-source.png'
    figures = extract(Image.open(source_path).convert('RGBA'), 2, 2)
    scale = 200 / figures[1].height
    figure = figures[0].resize((round(figures[0].width * scale), round(figures[0].height * scale)), Image.Resampling.NEAREST)
    assert figure.width <= 380 and figure.height <= 210
    frame = Image.new('RGBA', CELL)
    frame.alpha_composite(figure, (round(foot_axis(wide_guard()) - foot_axis(figure)), 228 - figure.height))
    frame.save(OUT / 'bridge-frame.png')
    (OUT / 'bridge-report.json').write_text(json.dumps({'frames': 1, 'calibration': 1, 'scale': scale,
        'bounds': bounds(frame), 'sourceSha256': hashlib.sha256(source_path.read_bytes()).hexdigest(),
        'reviewed': False}, indent=2), encoding='utf-8')


def assemble():
    for part in ['opening', 'closing', 'bridge']:
        assert json.loads((OUT / f'{part}-report.json').read_text())['reviewed'], f'Review {part} first'
    frames = [Image.open(OUT / f'opening-frame{i}.png').convert('RGBA') for i in range(8)]
    # Intentional extra contact beat, not a substitute for a wrong recovery pose.
    frames.append(frames[-1].copy())
    frames.append(Image.open(OUT / 'bridge-frame.png').convert('RGBA'))
    frames.extend(Image.open(OUT / f'closing-frame{i}.png').convert('RGBA') for i in range(2, 12))
    assert len(frames) == 20
    sheet = Image.new('RGBA', (2560, 1024))
    contact = Image.new('RGB', (1536, 282 * 7), '#35404b'); draw = ImageDraw.Draw(contact)
    previews = []
    for i, frame in enumerate(frames):
        b = bounds(frame)
        assert min(b[0], b[1]) >= 2 and b[2] <= 510 and b[3] <= 254
        assert b[2] - b[0] <= 380, 'Final spread must stay restrained'
        sheet.alpha_composite(frame, (i % 5 * 512, i // 5 * 256))
        contact.paste(frame, (i % 3 * 512, i // 3 * 282 + 20), frame)
        draw.text((i % 3 * 512 + 7, i // 3 * 282 + 4), f'{i}: '+('ACTIVE' if 6 <= i <= 8 else 'RECOVERY' if i >= 9 else 'OPENING'), fill='white')
        bg = Image.new('RGB', CELL, '#35404b'); bg.paste(frame, (0, 0), frame); previews.append(bg)
    sheet.save(OUT / 'heavy-wing-spread-v1.png'); contact.save(OUT / 'all-frames-contact.png')
    previews[0].save(OUT / 'preview.gif', save_all=True, append_images=previews[1:], duration=[70 if i % 4 == 3 else 60 for i in range(20)], loop=0)
    previews[0].save(OUT / 'slow-preview.gif', save_all=True, append_images=previews[1:], duration=150, loop=0)
    report = {'frames': 20, 'fps': 16, 'cell': CELL, 'columns': 5, 'activeFrames': [6, 7, 8],
        'recoveryFrames': list(range(9, 20)), 'frameBounds': [bounds(f) for f in frames],
        'footAxes': [foot_axis(f) for f in frames], 'canonicalGuardEndpoints': frames[0].tobytes() == frames[-1].tobytes() == wide_guard().tobytes(),
        'sha256': hashlib.sha256((OUT / 'heavy-wing-spread-v1.png').read_bytes()).hexdigest(), 'installed': False}
    (OUT / 'report.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    (OUT / 'revisao.html').write_text('<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Urubu — asas</title>'
        '<style>body{background:#202934;color:#eef5fc;font:16px system-ui;padding:24px}img{image-rendering:pixelated;max-width:100%}a{color:#a8d5ff}</style>'
        '<h1>Pesado do Urubu — abertura das duas asas</h1><p>20 quadros, 16 FPS. Abertura0–5; contato6–8; recuperação9–19.</p>'
        '<p>Prévias repetem para revisão. No jogo, o ataque executa uma vez.</p>'
        '<canvas id="view" width="512" height="256"></canvas><p><button id="toggle">Pausar</button> '
        '<select id="speed"><option value="1">16 FPS</option><option value="0.5">Metade da velocidade</option></select> '
        '<input id="scrub" type="range" min="0" max="19" value="0"><span id="label"></span></p>'
        '<script>const c=document.querySelector("canvas"),ctx=c.getContext("2d"),img=new Image();'
        'ctx.imageSmoothingEnabled=false;let frame=0,playing=true,previous=0,elapsed=0;'
        'const scrub=document.querySelector("#scrub"),label=document.querySelector("#label"),button=document.querySelector("#toggle");'
        'function draw(){ctx.fillStyle="#35404b";ctx.fillRect(0,0,512,256);ctx.drawImage(img,frame%5*512,Math.floor(frame/5)*256,512,256,0,0,512,256);'
        'scrub.value=frame;label.textContent=` ${frame}/19 — ${frame<6?"Abertura":frame<9?"Contato":"Recuperação"}`;}'
        'scrub.oninput=()=>{playing=false;button.textContent="Reproduzir";frame=Number(scrub.value);elapsed=0;draw();};'
        'button.onclick=()=>{playing=!playing;button.textContent=playing?"Pausar":"Reproduzir";elapsed=0;};'
        'function tick(t){const dt=previous?t-previous:0;previous=t;if(playing){elapsed+=dt*Number(document.querySelector("#speed").value);'
        'while(elapsed>=62.5){frame=(frame+1)%20;elapsed-=62.5;}draw();}requestAnimationFrame(tick);}'
        'img.onload=()=>{draw();requestAnimationFrame(tick);};img.src="heavy-wing-spread-v1.png";</script>'
        '<h2>GIF no ritmo normal</h2><img src="preview.gif">'
        '<h2>Revisão lenta</h2><img src="slow-preview.gif"><p><a href="all-frames-contact.png">Todos os quadros</a></p>', encoding='utf-8')
    print(json.dumps(report))


if __name__ == '__main__':
    p = argparse.ArgumentParser(); p.add_argument('part', choices=['opening', 'closing', 'bridge', 'assemble'])
    a = p.parse_args()
    if a.part == 'assemble':
        assemble()
    elif a.part == 'bridge':
        pack_bridge()
    else:
        pack(a.part)
