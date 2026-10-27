"""Art-only pose revision. No fighter JSON or gameplay code is written.

prepare snapshots current files and writes image-generation briefs; import packs
generated artwork into the EXISTING sheet layouts; verify checks the PNGs.
"""
import copy
import hashlib
import json
import math
import sys
from pathlib import Path
from PIL import Image, ImageDraw
from skins_urubu import bbox, cuts

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/revisao-poses'
ASSETS = ROOT / 'public/assets/lutadores'
CHARACTERS = {
    'urubu': ('Urubu', 'frente', 'referencia/urubu/modelo-oficial.png'),
    'cachorro': ('Bira', 'urubu-v1', 'referencia/bira/referencia-estilo-urubu-v1.png'),
    'cartola': ('Cartola', 'urubu-v1', 'referencia/cartola/referencia-estilo-urubu-v1.png'),
    'galo': ('Galo', 'urubu-v1', 'referencia/galo/referencia-estilo-urubu-v1.png'),
    'almirante': ('Almirante', 'base', 'public/assets/lutadores/almirante/base/anchor-w.png'),
    'saci': ('Saci', '', 'public/assets/lutadores/saci/anchor-w.png'),
}


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def frame_of(sheet, i):
    return sheet.crop((i%5*256, i//5*256, i%5*256+256, i//5*256+256))


def prepare():
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = []
    for slug, (name, folder, identity) in CHARACTERS.items():
        d = json.loads((ROOT / f'src/game/lutadores/{slug}.json').read_text(encoding='utf-8'))
        target = OUT / slug
        target.mkdir(exist_ok=True)
        idle = Image.open(ASSETS / slug / folder / 'idle.png').convert('RGBA')
        idle_bb = bbox(frame_of(idle, 0))
        for a in d['actions']:
            if a['action'] not in (['jump'] if slug == 'saci' else ['crouch', 'jump', 'block-high', 'block-low']):
                continue
            action, n = a['action'], a['frames']
            original_path = ASSETS / slug / folder / a['file']
            original = Image.open(original_path).convert('RGBA')
            backup = target / f'{action}-before.png'
            if not backup.exists():
                original.save(backup)
            cols = 3 if n == 6 else 5 if n == 5 else 4
            rows = math.ceil(n/cols)
            takeoff = d.get('moves', {}).get('jump', {}).get('takeoff', 3)
            air_end = d.get('moves', {}).get('jump', {}).get('airEnd', n-1)
            land = d.get('moves', {}).get('jump', {}).get('land', takeoff-1)
            if action == 'block-high':
                movement = '''Four poses: frame 0 normal fighting guard; frame 1 both fists move up to face; frame 2 tight defensive guard; frame 3 STILL HOLD THE SAME TIGHT GUARD. Like the Saci reference, BOTH hands/forearms stay BETWEEN the incoming opponent at LEFT and the face/chest. Fists at cheek/eyebrow height, elbows tucked, chin lowered. Protect the face from the FRONT, do NOT just raise one arm above the head or put hands behind ears. Both feet planted, standing. Most important: the FINAL frame MUST remain BLOCKING, never return to idle or lower the hands. Last two frames differ only by a tiny breath. The player holds this final pose while blocking.'''
            elif action == 'block-low':
                movement = '''Four poses: frame 0 standing fighting guard; frame 1 lower into a squat while bringing BOTH forearms in front of face and upper chest; frames 2 and 3 HOLD a DEEP CROUCHING BLOCK, same tight guard held in BOTH final frames. Feet planted, hips low, knees deeply flexed, torso/head visibly lowered well below standing height. BOTH fists and forearms are a shield BETWEEN opponent at LEFT and the face, chin tucked. Do NOT put hands behind ears, on the crown of the head, or behind the skull. Do not return to idle or stand up in the final frame. Use the Saci's hand-blocking principle, but keep TWO legs for this character.'''
            elif action == 'crouch':
                movement = f'''EXACTLY {n} poses: frame 0 the normal standing fighting guard at full height; frame 1 halfway lowering; frame 2 a DEEP EVASIVE SQUAT; every remaining frame STAYS in that same deep squat with tiny breathing changes. Both feet firmly planted; lower hips close to knee/ankle level, bend both knees deeply, lean torso forward modestly, tuck chin, hands compact near jaw. Final head/shoulders must be MUCH LOWER than standing, below a horizontal punch aimed at standing face/upper chest: final silhouette about 55-60 percent of standing height. Do not simply hunch shoulders, bend the neck, or shrink the entire character. Same anatomical size, legs truly folding. Final frame stays crouching; no return to standing. This is an evasion, not an overhead block.'''
            else:
                movement = f'''EXACTLY {n} poses with zero-based indices: frame 0 standing guard, grounded. Grounded wind-up frames 1 through {takeoff-1}: bend knee(s) to prepare, feet stay on one common baseline; the deepest grounded squat also serves as touchdown frame {land}. Flight frames {takeoff} through {air_end}: ALL are AIRBORNE, same body size, with pelvis/waist fixed at the SAME local X and Y inside each cell. Change only limb articulation from launch (legs beginning to tuck), to compact apex pose, to descent (legs gradually extending ready to land). DO NOT draw an up/down trajectory, vertical bob, bounce, second launch, return to squat or planted feet inside the flight frames. The GAME ENGINE moves the entire sprite along the physical arc. Within these flight frames the HIP stays at a fixed height, no whole-character translation. Head and torso maintain a stable position, legs articulate beneath them. Last flight frame remains airborne and ready for touchdown; no standing reset. Any frame after {air_end}, if present, is grounded touchdown at frame {land}. No kicking or punching in this sheet.'''
            leg_rule = 'Saci has EXACTLY ONE LEG in EVERY frame. Preserve the approved Saci identity, red cap, shirt, shorts and sole boot. No second leg, no phantom limb.' if slug == 'saci' else 'This character has EXACTLY TWO legs in every pose. Do not copy the Saci reference single-legged anatomy.'
            prompt = f'''Use case: precise-object-edit / fighting game sprite animation redesign.
Image 1: APPROVED {name} appearance and pixel-art reference. Preserve the EXACT character identity, outfit, colors, proportions and detailing.
Image 2: Saci block sheet, reference ONLY for tight hands/forearms shielding face and KEEPING guard at the end. Do not copy Saci's outfit, anatomy or one leg.
Create a corrected {action} animation for {name}, following the movement specification below. ONE sprite sheet, EXACTLY {n} full-body poses, {cols} equal SQUARE columns x {rows} equal SQUARE rows, read left-to-right then top-to-bottom. Use identical body scale throughout; generous transparent gutters around ALL hats/crests/tails/fists/feet. Blank unused cells. All figures face LEFT in 3/4 fighting view.
MOVEMENT: {movement}
ANATOMY: {leg_rule}
STYLE: crisp arcade pixel art, strong dark contour, limited palette and hard-edged shadow clusters matching the approved base. No photorealism, smooth vector art, glossy rendering or chibi proportions. Do NOT change the costume to Saci's. No extra accessories.
True alpha-transparent background. No ground, ground shadows, aura, particles, motion trails, grid lines, borders, labels, numbering, text, logos or badge. Render only the sprite sheet. Grid discipline and exact frame count are essential.'''
            item = dict(slug=slug, name=name, action=action, frames=n, cols=cols, rows=rows, spec=copy.deepcopy(a), identity=str(ROOT/identity), reference=str(ASSETS/'saci/block-high.png'), source=str(target/f'{action}-source.png'), destination=str(original_path), original_hash=digest(original_path), sheet_size=list(original.size), idle_bb=idle_bb, takeoff=takeoff, air_end=air_end, land=land, prompt=prompt)
            (target/f'{action}-prompt.txt').write_text(prompt, encoding='utf-8')
            manifest.append(item)
    (OUT/'manifest.json').write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding='utf-8')
    print(f'Prepared {len(manifest)} art-only sheets')


def import_art():
    manifest = json.loads((OUT/'manifest.json').read_text(encoding='utf-8'))
    report = []
    for item in manifest:
        if not Path(item['source']).exists():
            raise ValueError('Missing art: '+item['source'])
        target = Path(item['destination'])
        if digest(target) != item['original_hash']:
            raise ValueError('Concurrent asset edit: '+str(target))
        im = Image.open(item['source']).convert('RGBA')
        if im.getchannel('A').getextrema()[0] == 255:
            raise ValueError('No transparency: '+item['source'])
        ys = cuts(im, item['rows'], 'y')
        cells = []
        for row in range(item['rows']):
            band = im.crop((0, ys[row], im.width, ys[row+1]))
            xs = cuts(band, item['cols'], 'x')
            for col in range(item['cols']):
                if len(cells) == item['frames']:
                    break
                cell = band.crop((xs[col], 0, xs[col+1], band.height))
                if not bbox(cell):
                    raise ValueError('Empty generated frame: '+item['source'])
                cells.append(cell)
        boxes = [bbox(c) for c in cells]
        idle = item['idle_bb']
        scale = (idle[3]-idle[1])/(boxes[0][3]-boxes[0][1])
        scale = min(scale, 244/max(b[2]-b[0] for b in boxes), 220/max(b[3]-b[1] for b in boxes))
        center = (idle[0]+idle[2])/2
        sheet = Image.new('RGBA', item['sheet_size'])
        previews = []
        frame_boxes = []
        for i, (raw, b) in enumerate(zip(cells, boxes)):
            figure = raw.crop(b)
            figure = figure.resize((max(1,round(figure.width*scale)),max(1,round(figure.height*scale))), Image.Resampling.NEAREST)
            figure = figure.crop(bbox(figure))
            x = round(center-figure.width/2)
            y = idle[3]-figure.height
            if item['action'] == 'jump' and item['takeoff'] <= i <= item['air_end']:
                # Jump guard keeps the crest/hat/head above the fists. Anchor that
                # upper-body landmark, so only knees/feet articulate, not an arc.
                y = idle[1]
            x = max(4,min(252-figure.width,x))
            y = max(4,min(252-figure.height,y))
            cell = Image.new('RGBA',(256,256))
            cell.alpha_composite(figure,(x,y))
            sheet.alpha_composite(cell,(i%5*256,i//5*256))
            frame_boxes.append(bbox(cell))
            bg = Image.new('RGBA',(256,256),'#26313d')
            bg.alpha_composite(cell)
            previews.append(bg.convert('RGB'))
        packed = OUT/item['slug']/(item['action']+'-packed.png')
        sheet.save(packed)
        sheet.save(target)
        previews[0].save(OUT/item['slug']/(item['action']+'-preview.gif'),save_all=True,append_images=previews[1:],duration=round(1000/item['spec']['frameRate']),loop=0)
        report.append(dict(slug=item['slug'],action=item['action'],frames=item['frames'],frameRate=item['spec']['frameRate'],destination=str(target),frame_boxes=frame_boxes,sha256=digest(target)))
        print('Imported',item['slug'],item['action'],len(cells))
    (OUT/'report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    review(manifest)


def review(manifest):
    items = []
    for i in manifest:
        items.append(dict(name=i['name'],action=i['action'],n=i['frames'],fps=i['spec']['frameRate'],before=f"{i['slug']}/{i['action']}-before.png",after=f"{i['slug']}/{i['action']}-packed.png"))
    html = '''<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Revisão de poses</title><style>body{background:#111923;color:white;font:16px system-ui;margin:24px}section{display:inline-block;border:1px solid #48596b;padding:12px;margin:8px}canvas{width:256px;height:256px;background:#26313d;image-rendering:pixelated}label{display:inline-block;text-align:center}p{color:#abc}button{padding:8px}</style><h1>Revisão de agachamento, salto e guarda</h1><p>Somente arte. Antes e depois sincronizados, com os tempos existentes do jogo.</p><button id="pause">Pausar</button><main></main><script>const items=DATA;let play=true,t=0,last=performance.now();const groups=items.map(a=>{const s=document.createElement('section');s.innerHTML=`<h2>${a.name} · ${a.action}</h2><p>${a.n} quadros · ${a.fps} fps</p>`;const views=[a.before,a.after].map((url,i)=>{const l=document.createElement('label');l.innerHTML=(i?'Depois':'Antes')+'<br>';const c=document.createElement('canvas');c.width=c.height=256;l.append(c);s.append(l);const im=new Image();im.src=url;return{im,ctx:c.getContext('2d')}});document.querySelector('main').append(s);return{...a,views}});document.querySelector('pause');document.querySelector('#pause').onclick=()=>{play=!play;document.querySelector('#pause').textContent=play?'Pausar':'Continuar'};function tick(now){if(play)t+=(now-last)/1000;last=now;for(const a of groups){const f=Math.floor(t*a.fps)%a.n;for(const v of a.views){v.ctx.clearRect(0,0,256,256);if(v.im.complete&&v.im.naturalWidth)v.ctx.drawImage(v.im,f%5*256,Math.floor(f/5)*256,256,256,0,0,256,256)}}requestAnimationFrame(tick)}requestAnimationFrame(tick)</script>'''
    (OUT/'revisao.html').write_text(html.replace('DATA',json.dumps(items)),encoding='utf-8')
    for slug in CHARACTERS:
        selected = [i for i in manifest if i['slug']==slug]
        canvas = Image.new('RGB',(1280,len(selected)*280),'#26313d')
        draw = ImageDraw.Draw(canvas)
        for row,item in enumerate(selected):
            draw.text((8,row*280+4),item['name']+' '+item['action'],fill='white')
            sheet = Image.open(OUT/slug/(item['action']+'-packed.png')).convert('RGBA')
            indices = list(range(item['frames'])) if item['frames']<=5 else [0,1,item['takeoff'],(item['takeoff']+item['air_end'])//2,item['air_end']]
            for col,i in enumerate(indices):
                frame = frame_of(sheet,i)
                canvas.paste(frame,(col*256,row*280+22),frame)
        canvas.save(OUT/slug/'contact.png')


def verify():
    manifest=json.loads((OUT/'manifest.json').read_text(encoding='utf-8'))
    report=json.loads((OUT/'report.json').read_text(encoding='utf-8'))
    for item,r in zip(manifest,report):
        im=Image.open(item['destination']).convert('RGBA')
        assert list(im.size)==item['sheet_size']
        assert digest(item['destination'])==r['sha256']
        for i in range(item['frames']):
            b=bbox(frame_of(im,i))
            assert b and 0<b[0]<b[2]<256 and 0<b[1]<b[3]<256,(item['slug'],item['action'],i,b)
        if item['action']=='crouch':
            standing=bbox(frame_of(im,0))
            lowered=bbox(frame_of(im,item['frames']-1))
            assert (lowered[3]-lowered[1]) <= .72*(standing[3]-standing[1]), ('Crouch not deep enough',item['slug'])
            assert abs(lowered[3]-standing[3])<=2, ('Crouch foot line',item['slug'])
        if item['action']=='jump':
            tops=[bbox(frame_of(im,i))[1] for i in range(item['takeoff'],item['air_end']+1)]
            assert max(tops)-min(tops)<=1, ('Flight vertical jitter',item['slug'],tops)
        for i in range(item['frames'],im.width//256*(im.height//256)):
            assert bbox(frame_of(im,i)) is None, ('Unexpected extra frame',item['slug'],item['action'],i)
        print('Verified',item['slug'],item['action'],item['frames'])
    print(f'{len(manifest)} sheets checked, including crouch depth and stable flight head height. No JSON or gameplay file modified by this pipeline.')


def attach_guides():
    manifest=json.loads((OUT/'manifest.json').read_text(encoding='utf-8'))
    for item in manifest:
        if item['slug'] not in ('cachorro','cartola','galo'):
            continue
        item['guide']=str(OUT/'urubu'/(item['action']+'-source.png'))
        extra='''\nImage 3 is the CORRECTED URUBU POSE TEMPLATE for this exact action. Copy its poses, limb directions, phase order and final held posture FRAME FOR FRAME, changing ONLY the character skin to image 1. Preserve the same grid. Identity and clothing come ONLY from image 1, not from Urubu or Saci. Never transfer red/black horizontal stripes, white shorts, orange beak or dark-blue feathered skin to this character. Never transfer Saci's one leg. The template's last block frame holds both hands shielding the face; keep that hold. The template's crouch stays deeply crouched at the end; keep that hold. The jump's flight frames never include a second grounded squat or standing reset.'''
        if item['slug']=='galo':
            extra+=' Galo has white feathered arms/head/tail, red comb/wattle, gold beak, vertical black-white shirt, ENTIRELY BLACK folded knee-length trousers in EVERY pose (no white thigh fabric), gold bird shins and three-toed feet with claws, NO shoes.'
        if item['slug']=='cartola':
            extra+=' Cartola keeps his black top hat, red/burgundy tailcoat, green tie and GREEN striped TROUSERS in EVERY pose. No shorts.'
        if item['slug']=='cachorro':
            extra+=' Bira keeps grey/tan canine fur, pointed ears, tail, vertical black-white jersey, BLACK shorts, black socks and black/white shoes in EVERY pose.'
        if extra not in item['prompt']:
            item['prompt']+=extra
        (OUT/item['slug']/(item['action']+'-prompt.txt')).write_text(item['prompt'],encoding='utf-8')
    (OUT/'manifest.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False),encoding='utf-8')


if __name__=='__main__':
    {'prepare':prepare,'import':import_art,'verify':verify,'attach-guides':attach_guides}[sys.argv[1]]()
