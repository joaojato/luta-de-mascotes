"""Prepare movement references and import generated mascot skins.

Art is generated with the built-in image tool. This script only packs frames,
normalizes sprite scale/placement and exports engine assets and review files.
Run: python scripts/skins_urubu.py prepare|import|verify [--character galo]
"""
import copy
import json
import math
import statistics
import sys
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/skins-urubu'
DEFS = ROOT / 'src/game/lutadores'
ASSETS = ROOT / 'public/assets/lutadores'
URUBU = json.loads((DEFS / 'urubu.json').read_text(encoding='utf-8'))
CHARACTERS = {'cachorro': ('Bira', 'bira'), 'cartola': ('Cartola', 'cartola')}


def output_for(slug):
    return OUT / slug


def bbox(im):
    return im.getchannel('A').point(lambda a: 255 if a > 32 else 0).getbbox()


def original_frames(action):
    im = Image.open(ASSETS / 'urubu/frente' / action['file']).convert('RGBA')
    return [im.crop((i % 5 * 256, i // 5 * 256, i % 5 * 256 + 256, i // 5 * 256 + 256)) for i in range(action['frames'])]


def prepare():
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = []
    for action in URUBU['actions']:
        n = action['frames']
        cols = 3 if n == 6 else 5 if n in (5, 10) else 4
        rows = math.ceil(n / cols)
        reference = Image.new('RGBA', (cols * 256, rows * 256))
        for i, frame in enumerate(original_frames(action)):
            reference.alpha_composite(frame, (i % cols * 256, i // cols * 256))
        ref = OUT / f"urubu-{action['action']}-reference.png"
        reference.save(ref)
        for slug, (name, folder) in CHARACTERS.items():
            target = output_for(slug)
            target.mkdir(exist_ok=True)
            identity = ROOT / f'referencia/{folder}/referencia-estilo-urubu-v1.png'
            prompt = f'''Use case: style-transfer. Production 2D arcade fighting game sprite sheet.
Image 1 is the APPROVED {name} identity and pixel-art style. Image 2 is the EXACT Urubu movement template, not a character design reference.
Redraw EVERY frame of image 2 replacing ONLY the vulture character with {name} from image 1. This is a character skin, NOT a new animation. Copy the pose, head angle, torso rotation, arm positions, leg positions, planted foot, airborne height and motion phase of EACH corresponding frame, in the SAME ORDER. Do not invent a different attack or walking cycle. Preserve the approved character's face, proportions, colors, clothing and accessories throughout. Do not transfer the vulture's dark-blue feathers, red-black jersey or white shorts to the new character.
Action: {action['action']}. EXACTLY {n} full-body frames in a strict {cols}-column by {rows}-row evenly spaced grid, read left to right then top to bottom. Each grid cell has the same dimensions. Keep each figure entirely inside its cell with generous empty gutters. No extra poses, no missing frames. Empty unused cells stay transparent.
Match image 1's chunky crisp arcade pixel art, strong dark outlines, limited palette and hard-edged shade clusters. Consistent body size across all frames; crouching and falling must shorten the silhouette naturally, never enlarge the character to fill the cell. Keep head, fists, tail and feet fully visible. Facing LEFT as in the movement template (preserve its torso turns). True transparent background, no ground shadow, no scenery, no effects, no motion lines, no numbers, labels, borders, logos, badges or text.
Render ONLY the completed sprite sheet. This sheet will be cut into equal grid cells, so grid discipline and exact frame count are essential.'''
            if slug == 'galo':
                prompt += '''\nGALO IDENTITY LOCK: white/light-grey feathered rooster head and muscular arms, RED comb swept backwards and RED hanging wattle, dark fierce eyebrows, golden/ochre curved beak, white/light-grey swept tail feathers, BLACK AND WHITE VERTICAL striped short-sleeve jersey (never horizontal stripes), black knee-length trousers with folded cuffs, ochre scaly bird shins and broad THREE-TOED taloned feet with pale claws. NO shoes or socks. Keep the exact head/body ratio of approved image 1, not a giant cartoon head. Preserve the tail and comb in every frame. When torso turns away, show the back of the vertically striped jersey, not the chest. Copy the reference movement even during special, kick and falling; no pecking, wings, new attacks or detached comb/tail.'''
            (target / f"{action['action']}-prompt.txt").write_text(prompt, encoding='utf-8')
            manifest.append({'slug': slug, 'name': name, 'action': action['action'], 'frames': n, 'cols': cols, 'rows': rows, 'identity': str(identity), 'reference': str(ref), 'source': str(target / f"{action['action']}-source.png"), 'prompt': prompt})
    (OUT / 'manifest.json').write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding='utf-8')
    print(f'Prepared {len(manifest)} sheets')


def cuts(im, count, axis):
    """Find transparent gutters near each expected equal-grid boundary."""
    a = im.getchannel('A').point(lambda v: 255 if v > 32 else 0)
    length = im.width if axis == 'x' else im.height
    step = length / count
    result = [0]
    for i in range(1, count):
        mid = round(i * step)
        scores = []
        for p in range(max(result[-1]+1, round(mid-step*.18)), min(length, round(mid+step*.18))):
            strip = a.crop((p, 0, p+1, im.height) if axis == 'x' else (0, p, im.width, p+1))
            scores.append((strip.histogram()[255], p))
        best = min(s[0] for s in scores)
        candidates = [p for score, p in scores if score == best]
        result.append(min(candidates, key=lambda p: abs(p-mid)))
    return result + [length]


def extract(item):
    im = Image.open(item['source']).convert('RGBA')
    if im.getchannel('A').getextrema()[0] == 255:
        raise ValueError(f"No transparency: {item['source']}")
    ys = cuts(im, item['rows'], 'y')
    frames = []
    for row in range(item['rows']):
        band = im.crop((0, ys[row], im.width, ys[row+1]))
        xs = cuts(band, item['cols'], 'x')
        for col in range(item['cols']):
            if len(frames) == item['frames']:
                break
            cell = band.crop((xs[col], 0, xs[col+1], band.height))
            bb = bbox(cell)
            if not bb:
                raise ValueError(f"Empty frame {len(frames)}: {item['source']}")
            # Disallow figures intersecting the extraction gutter.
            if bb[0] == 0 or bb[1] == 0 or bb[2] == cell.width or bb[3] == cell.height:
                print(f"CHECK border: {item['slug']} {item['action']} frame {len(frames)}")
            frames.append(cell.crop(bb))
    return frames


def import_assets():
    manifest = json.loads((OUT / 'manifest.json').read_text(encoding='utf-8'))
    for slug, (name, folder) in CHARACTERS.items():
        selected = [i for i in manifest if i['slug'] == slug]
        missing = [i['action'] for i in selected if not Path(i['source']).exists()]
        if missing:
            raise ValueError(f'{slug} missing {missing}')
        definition_path = DEFS / f'{slug}.json'
        definition = json.loads(definition_path.read_text(encoding='utf-8')) if definition_path.exists() else None
        backup = OUT / slug / 'previous-definition.json'
        previous_art = definition is not None and definition.get('skins', [{}])[0].get('pasta') != 'urubu-v1'
        if previous_art and not backup.exists():
            backup.write_text(json.dumps(definition, indent=2, ensure_ascii=False)+'\n', encoding='utf-8')
        destination = ASSETS / slug / 'urubu-v1'
        destination.mkdir(parents=True, exist_ok=True)
        actions = []
        for item, ref in zip(selected, URUBU['actions']):
            assert item['action'] == ref['action']
            frames = extract(item)
            references = original_frames(ref)
            boxes = [bbox(f) for f in references]
            # One common scale per action keeps knees bending and bodies falling.
            scale = statistics.median((b[3]-b[1])/f.height for b, f in zip(boxes, frames))
            scale = min(scale, 246/max(f.width for f in frames), 220/max(f.height for f in frames))
            sheet = Image.new('RGBA', (1280, math.ceil(len(frames)/5)*256))
            union = None
            gif_frames = []
            for i, (frame, rb) in enumerate(zip(frames, boxes)):
                frame = frame.resize((max(1, round(frame.width*scale)), max(1, round(frame.height*scale))), Image.Resampling.NEAREST)
                x = max(4, min(252-frame.width, round((rb[0]+rb[2]-frame.width)/2)))
                y = max(4, min(252-frame.height, rb[3]-frame.height))
                cell = Image.new('RGBA', (256, 256))
                cell.alpha_composite(frame, (x, y))
                sheet.alpha_composite(cell, (i%5*256, i//5*256))
                b = bbox(cell)
                union = b if union is None else (min(union[0], b[0]), min(union[1], b[1]), max(union[2], b[2]), max(union[3], b[3]))
                bg = Image.new('RGBA', (256, 256), '#26313d')
                bg.alpha_composite(cell)
                gif_frames.append(bg.convert('RGB'))
            filename = f"{item['action']}.png"
            sheet.save(destination / filename)
            action = copy.deepcopy(ref)
            action['file'] = filename
            action['defaultVisual'] = dict(x=union[0], y=union[1], width=union[2]-union[0], height=union[3]-union[1])
            actions.append(action)
            gif_frames[0].save(OUT / slug / f"{item['action']}-preview.gif", save_all=True, append_images=gif_frames[1:], duration=round(1000/ref['frameRate']), loop=0)
        identity = Image.open(ROOT / f'referencia/{folder}/referencia-estilo-urubu-v1.png').convert('RGBA')
        figure = identity.crop(bbox(identity))
        anchor = Image.new('RGBA', (1024, 1024))
        figure.thumbnail((850, 900), Image.Resampling.NEAREST)
        anchor.alpha_composite(figure, ((1024-figure.width)//2, 970-figure.height))
        anchor.save(destination / 'anchor-w.png')
        # Portrait from the approved base, with the same costume and face.
        original = identity.crop(bbox(identity))
        portrait = original.crop((0, 0, original.width, round(original.height*.56)))
        portrait.thumbnail((1130, 1130), Image.Resampling.NEAREST)
        canvas = Image.new('RGBA', (1254, 1254))
        canvas.alpha_composite(portrait, ((1254-portrait.width)//2, (1254-portrait.height)//2))
        canvas.save(destination / 'portrait.png')
        skins = [dict(id='urubu-v1', label='Padrão Urubu', pasta='urubu-v1')]
        if backup.exists():
            old = json.loads(backup.read_text(encoding='utf-8'))
            old_skin = copy.deepcopy(old['skins'][0])
            old_skin['label'] = 'Arte anterior'
            old_skin['acoes'] = {a['action']: dict(a) for a in old['actions']}
            for a in URUBU['actions']:
                if a['action'] not in old_skin['acoes']:
                    fallback = next(x for x in old['actions'] if x['action'] == ('heavy-punch' if a['action'] == 'heavy-kick' else a['action']))
                    old_skin['acoes'][a['action']] = copy.deepcopy(fallback)
                    old_skin['acoes'][a['action']]['action'] = a['action']
            old_skin['sobrescreve'] = ['anchor-w.png', 'portrait.png']
            skins.append(old_skin)
        if definition is None:
            definition = dict(id=slug, assetRoot=f'/assets/lutadores/{slug}', selecionavel=True)
        definition.update(label=name, anchorUsage=f'{name}, padrão Urubu, guarda voltada para a esquerda', actions=actions, stats=copy.deepcopy(URUBU['stats']), combat=copy.deepcopy(URUBU['combat']))
        definition.pop('moves', None)
        definition['skins'] = skins
        (DEFS / f'{slug}.json').write_text(json.dumps(definition, indent=2, ensure_ascii=False)+'\n', encoding='utf-8')
        print(f'Imported {name}: {len(actions)} actions')
    review(manifest)


def review(manifest):
    labels = ['Urubu'] + [name for name, _ in CHARACTERS.values()]
    data = []
    for action in URUBU['actions']:
        paths = [f"../../public/assets/lutadores/urubu/frente/{action['file']}"]
        paths += [f"../../public/assets/lutadores/{slug}/urubu-v1/{action['action']}.png" for slug in CHARACTERS]
        data.append(dict(action=action['action'], frames=action['frames'], fps=action['frameRate'], paths=paths))
    html = '''<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Skins do Urubu — Bira e Cartola</title>
<style>body{background:#111923;color:#eee;font:16px system-ui;margin:28px}h1{font-size:24px}section{display:inline-block;border:1px solid #445;padding:14px;margin:8px;border-radius:10px}canvas{width:256px;height:256px;image-rendering:pixelated;background:#26313d}label{display:inline-block;text-align:center}p{color:#aabaca}button,input{margin:8px}</style>
<h1>Bira e Cartola — movimentos do Urubu</h1><p>Mesma ordem, quantidade de quadros e velocidade. As três animações ficam sincronizadas.</p><button id="pause">Pausar</button><label>Velocidade <input id="speed" type="range" min="0.1" max="1.5" value="1" step="0.1"></label><div id="gallery"></div>
<script>const data=DATA;let running=true,t=0,last=performance.now();const gallery=document.querySelector('#gallery');const groups=data.map(a=>{const s=document.createElement('section');s.innerHTML=`<h2>${a.action}</h2><p>${a.frames} quadros · ${a.fps} fps · <span></span></p>`;const views=a.paths.map((path,i)=>{const l=document.createElement('label');l.innerHTML=['Urubu','Bira','Cartola'][i]+'<br>';const c=document.createElement('canvas');c.width=c.height=256;l.append(c);s.append(l);const im=new Image();im.src=path;return{im,ctx:c.getContext('2d')}});gallery.append(s);return{...a,views,counter:s.querySelector('span')}});document.querySelector('#pause').onclick=()=>{running=!running;document.querySelector('#pause').textContent=running?'Pausar':'Continuar'};function tick(now){if(running)t+=(now-last)/1000*Number(document.querySelector('#speed').value);last=now;for(const a of groups){const f=Math.floor(t*a.fps)%a.frames;a.counter.textContent='quadro '+(f+1);for(const {im,ctx}of a.views){ctx.clearRect(0,0,256,256);if(im.complete&&im.naturalWidth)ctx.drawImage(im,f%5*256,Math.floor(f/5)*256,256,256,0,0,256,256)}}requestAnimationFrame(tick)}requestAnimationFrame(tick)</script>'''
    names = ' e '.join(labels[1:])
    html = html.replace('Bira e Cartola', names).replace('As três animações', 'As animações')
    html = html.replace("['Urubu','Bira','Cartola']", json.dumps(labels))
    (OUT / 'revisao.html').write_text(html.replace('DATA', json.dumps(data)), encoding='utf-8')
    for page, start in enumerate(range(0, len(URUBU['actions']), 7), 1):
        chunk = URUBU['actions'][start:start+7]
        canvas = Image.new('RGB', (len(labels)*256, len(chunk)*230), '#26313d')
        draw = ImageDraw.Draw(canvas)
        for row, action in enumerate(chunk):
            draw.text((8, row*230+6), action['action'], fill='white')
            characters = [('urubu', 'frente')] + [(slug, 'urubu-v1') for slug in CHARACTERS]
            for col, (slug, folder) in enumerate(characters):
                filename = action['file'] if slug == 'urubu' else action['action']+'.png'
                im = Image.open(ASSETS / slug / folder / filename).convert('RGBA')
                frame = im.crop((0, 0, 256, 256)).resize((205, 205), Image.Resampling.NEAREST)
                canvas.paste(frame, (col*256, row*230+24), frame)
        canvas.save(OUT / f'review-page-{page}.png')


def verify():
    for slug in CHARACTERS:
        d = json.loads((DEFS / f'{slug}.json').read_text(encoding='utf-8'))
        assert len(d['actions']) == len(URUBU['actions'])
        for a, ref in zip(d['actions'], URUBU['actions']):
            for key in ('action', 'frames', 'frameRate', 'repeat', 'attack', 'attackSpans', 'guard'):
                assert a.get(key) == ref.get(key), (slug, a['action'], key)
            im = Image.open(ASSETS / slug / d['skins'][0]['pasta'] / a['file']).convert('RGBA')
            assert im.size == (1280, math.ceil(a['frames']/5)*256)
            for i in range(a['frames']):
                b = bbox(im.crop((i%5*256, i//5*256, i%5*256+256, i//5*256+256)))
                assert b and b[0] > 0 and b[1] > 0 and b[2] < 256 and b[3] < 256, (slug, a['action'], i, b)
            for i in range(a['frames'], im.width//256*(im.height//256)):
                assert bbox(im.crop((i%5*256, i//5*256, i%5*256+256, i//5*256+256))) is None
        assert d['stats'] == URUBU['stats'] and d['combat'] == URUBU['combat']
        print(f"Verified {slug}: {len(d['actions'])} actions, {sum(a['frames'] for a in d['actions'])} frames; timing and combat identical to Urubu")


if __name__ == '__main__':
    if '--character' in sys.argv:
        slug = sys.argv[sys.argv.index('--character')+1]
        if slug != 'galo':
            raise ValueError(f'Unknown standalone character: {slug}')
        CHARACTERS = {'galo': ('Galo', 'galo')}
        OUT = ROOT / 'output/skins-galo'
    {'prepare': prepare, 'import': import_assets, 'verify': verify}[sys.argv[1]]()
