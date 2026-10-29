"""Extract independently generated poses and pack without drawing/recoloring."""
import argparse
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/movimentos-v10'
COUNTS = {'dash-forward': 5, 'dash-back': 4, 'jump-punch': 5}
FPS = {'dash-forward': 18, 'dash-back': 16, 'jump-punch': 14}


def bounds(im):
    return im.getchannel('A').point(lambda a: 255 if a > 32 else 0).getbbox()


def hip_axis(im):
    """Estimate waist/hip axis from broad opaque runs, ignoring a distant fist."""
    b=bounds(im)
    samples=[]
    a=im.getchannel('A')
    for y in range(round(b[1]+(b[3]-b[1])*.54), round(b[1]+(b[3]-b[1])*.60)):
        runs=[]
        start=None
        for x in range(im.width+1):
            opaque=x<im.width and a.getpixel((x,y))>64
            if opaque and start is None:
                start=x
            if not opaque and start is not None:
                runs.append((start,x))
                start=None
        if runs:
            run=max(runs,key=lambda r:r[1]-r[0])
            samples.append((run[0]+run[1])/2)
    assert samples
    samples.sort()
    return samples[len(samples)//2]


def extract(source, count, keep_dust=False):
    """Connected figures rather than rigid cuts through imperfect generated grids."""
    w, h = source.size
    raw = source.getchannel('A').tobytes()
    visited = bytearray(w*h)
    components = []
    for index, alpha in enumerate(raw):
        if alpha <= 32 or visited[index]:
            continue
        todo = [index]
        visited[index] = 1
        component = []
        while todo:
            i = todo.pop()
            component.append(i)
            x, y = i % w, i // w
            for j in (i-1 if x else -1, i+1 if x+1<w else -1,
                      i-w if y else -1, i+w if y+1<h else -1):
                if j >= 0 and not visited[j] and raw[j] > 32:
                    visited[j] = 1
                    todo.append(j)
        if len(component) > 10:
            components.append(component)
    components.sort(key=len, reverse=True)
    major = components[:count]
    assert len(major) == count and min(map(len, major)) > w*h*.007, 'Missing figure'
    def extent(c):
        xs, ys = [i%w for i in c], [i//w for i in c]
        return min(xs), min(ys), max(xs)+1, max(ys)+1
    major.sort(key=lambda c: (int((extent(c)[1]+extent(c)[3])/2 > h/2),
                              (extent(c)[0]+extent(c)[2])/2))
    result = []
    for component in major:
        b = extent(component)
        assert b[0]>1 and b[1]>1 and b[2]<w-1 and b[3]<h-1, ('Clipped source', b)
        mask = Image.new('L', source.size)
        data = bytearray(w*h)
        for i in component:
            data[i] = 255
        if keep_dust:
            for small in components[count:]:
                sb=extent(small)
                if (sb[1] > b[3]-(b[3]-b[1])*.18 and sb[3] <= b[3]+8
                    and sb[0] >= b[0]-30 and sb[2] <= b[2]+30
                    and len(small)<len(component)*.02):
                    for i in small:
                        data[i]=255
        mask.frombytes(bytes(data))
        # Preserve antialiased edge pixels adjacent to the extracted component.
        mask = mask.filter(ImageFilter.MaxFilter(3))
        cut = source.copy()
        cut.putalpha(ImageChops.multiply(source.getchannel('A'), mask))
        cb=bounds(cut)
        cut = cut.crop((max(0,cb[0]-2),max(0,cb[1]-2),min(w,cb[2]+2),min(h,cb[3]+2)))
        result.append(cut)
    return result


def main():
    p=argparse.ArgumentParser()
    p.add_argument('character')
    p.add_argument('action', choices=COUNTS)
    p.add_argument('--apply', action='store_true')
    args=p.parse_args()
    folder=OUT/args.character
    reference=json.loads((folder/'reference.json').read_text())
    source_path=folder/(args.action+'-source.png')
    source=Image.open(source_path).convert('RGBA')
    n=COUNTS[args.action]
    # Jump-punch source has a sixth standing reference solely for uniform scale.
    crops=extract(source, n+1 if args.action=='jump-punch' else n, args.action=='dash-forward')
    idle=Image.open(folder/'idle.png').convert('RGBA')
    ib=bounds(idle)
    guard=crops[-1] if args.action=='jump-punch' else crops[0]
    gb=bounds(guard)
    scale=(ib[3]-ib[1])/(gb[3]-gb[1])
    prepared=[]
    for crop in crops[:n]:
        figure=crop.crop(bounds(crop))
        prepared.append(figure.resize((round(figure.width*scale),round(figure.height*scale)),
                                       Image.Resampling.NEAREST))
    axes=[hip_axis(f) for f in prepared]
    minimum_axis=max(2+a for a in axes)
    maximum_axis=min(254-f.width+a for f,a in zip(prepared,axes))
    assert minimum_axis<=maximum_axis, 'Cannot fit poses with stable body axis'
    target_axis=max(minimum_axis,min(maximum_axis,hip_axis(idle)))
    frames=[]
    placements=[]
    for index,crop in enumerate(crops[:n]):
        crop.save(folder/f'{args.action}-extracted-{index}.png')
        figure=prepared[index]
        assert figure.width<252 and figure.height<250, ('Oversize pose',index,figure.size)
        frame=Image.new('RGBA',(256,256))
        # Align the body rather than the full silhouette: an extending fist must
        # not push the torso to the opposite side of the cell.
        x=round(target_axis-axes[index])
        if args.action=='jump-punch':
            # Pose center is stable; motor supplies the world-space jump parabola.
            y=round(ib[1]+(ib[3]-ib[1])*.43-figure.height*.43)
            y=max(4,min(250-figure.height,y))
        else:
            y=ib[3]-figure.height
            if args.action=='dash-back' and index in (1,2):
                y-=7
        assert x>=2 and y>=2 and x+figure.width<=254 and y+figure.height<=254, (index,x,y)
        frame.alpha_composite(figure,(x,y))
        # Exact guard endpoints explicitly requested; preserve base pixels.
        if args.action!='jump-punch' and index in (0,n-1):
            frame=idle.copy()
        frames.append(frame)
        placements.append(dict(x=x,y=y,estimatedHipAxis=hip_axis(frame)))
    sheet=Image.new('RGBA',(1280,256))
    contact=Image.new('RGB',((n+1)*256,280),'#29343f')
    draw=ImageDraw.Draw(contact)
    contact.paste(idle,(0,24),idle)
    draw.text((8,5),'idle / '+args.character,fill='white')
    gifs=[]
    for i,frame in enumerate(frames):
        sheet.alpha_composite(frame,(i*256,0))
        contact.paste(frame,((i+1)*256,24),frame)
        draw.text(((i+1)*256+8,5),str(i),fill='white')
        bg=Image.new('RGB',(256,256),'#29343f')
        bg.paste(frame,(0,0),frame)
        gifs.append(bg)
    packed=folder/(args.action+'-packed.png')
    sheet.save(packed)
    contact.save(folder/(args.action+'-contact.png'))
    gifs[0].save(folder/(args.action+'-preview.gif'),save_all=True,append_images=gifs[1:],
                 duration=round(1000/FPS[args.action]),loop=0)
    target=ROOT/'public/assets/lutadores'/reference['folder']/(args.action+'.png')
    backup=folder/(args.action+'-previous.png')
    if args.apply:
        if target.exists():
            snapshot=OUT/'alignment-before.json'
            allowed=json.loads(snapshot.read_text()) if snapshot.exists() else {}
            expected=allowed.get(target.relative_to(ROOT).as_posix())
            current_hash=hashlib.sha256(target.read_bytes()).hexdigest()
            packed_hash=hashlib.sha256(packed.read_bytes()).hexdigest()
            if expected:
                assert current_hash in (expected,packed_hash), ('Changed since alignment review',target)
            if not backup.exists():
                backup.write_bytes(target.read_bytes())
            else:
                assert expected or target.read_bytes() in (backup.read_bytes(),packed.read_bytes())
        target.write_bytes(packed.read_bytes())
    report=dict(character=args.character,action=args.action,source=source_path.relative_to(ROOT).as_posix(),
                file=target.relative_to(ROOT).as_posix(),frames=n,columns=5,frameWidth=256,frameHeight=256,
                frameRateProposed=FPS[args.action],repeat=0,frameBoxes=[bounds(f) for f in frames],
                sourceSha256=hashlib.sha256(source_path.read_bytes()).hexdigest(),
                sha256=hashlib.sha256(packed.read_bytes()).hexdigest(),applied=args.apply,
                reference=reference,scale=scale,
                guardEndpointsFromIdle=args.action!='jump-punch',
                placements=placements,
                targetHipAxis=target_axis,
                punchArmObserved='B, far in reference guard' if args.action=='jump-punch' else None,
                gameReview='pending integration by logic owner')
    (folder/(args.action+'-report.json')).write_text(json.dumps(report,indent=2),encoding='utf-8')
    reports=[json.loads(f.read_text()) for f in OUT.glob('*/*-report.json')]
    (OUT/'report.json').write_text(json.dumps(reports,indent=2),encoding='utf-8')
    cards=[]
    for r in reports:
        path=r['character']+'/'+r['action']
        cards.append(f'<article><h2>{r["character"]} / {r["action"]}</h2>'
                     f'<img src="{path}-preview.gif"><a href="{path}-contact.png">Guarda e quadros</a></article>')
    (OUT/'revisao.html').write_text(
        '<!doctype html><meta charset="utf-8"><title>Movimentos v10</title>'
        '<style>body{background:#18222e;color:white;font:16px system-ui;padding:24px}'
        'article{display:inline-block;padding:16px}img{display:block;width:256px;image-rendering:pixelated}'
        'a{color:#bde3ff}</style><h1>Movimentos individuais v10</h1>'+''.join(cards),encoding='utf-8')
    print(args.character,args.action, 'applied' if args.apply else 'preview', len(frames),'frames')


if __name__=='__main__':
    main()
