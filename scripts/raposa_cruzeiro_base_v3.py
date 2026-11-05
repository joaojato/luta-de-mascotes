"""Mount image-tool correction; only key background and uniformly align assets."""
from pathlib import Path
from PIL import Image, ImageDraw
import hashlib, json, shutil

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/raposa-cruzeiro-v3'
REF = ROOT / 'referencia/cruzeiro'
DEST = ROOT / 'public/assets/lutadores/raposa/bases'

def main():
    source = OUT / 'source-magenta.png'
    im = Image.open(source).convert('RGBA')
    im.putdata([(0,0,0,0) if r > g*1.8+25 and b > g*1.8+25 and abs(r-b)<75 else (r,g,b,255)
                for r,g,b,a in im.get_flattened_data()])
    old = Image.open(REF / 'base-raposa-v2-laranja.png').convert('RGBA')
    assert im.size == old.size, 'Review changed coordinate system before mounting'
    box = im.getbbox()
    assert box and 0 < box[0] < box[2] < im.width and 0 < box[1] < box[3] < im.height
    full = REF / 'base-raposa-v3-dedos-focinho.png'
    im.save(full)
    sc = json.loads((ROOT/'output/raposa-cruzeiro-v1/report.json').read_text())['uniformScale']
    oldbox = Image.open(REF/'base-raposa-v1.png').getbbox()
    cut = im.crop(box).resize((round((box[2]-box[0])*sc),round((box[3]-box[1])*sc)),Image.Resampling.NEAREST)
    native = Image.new('RGBA',(256,256))
    native.alpha_composite(cut,(round(128+(box[0]-(oldbox[0]+oldbox[2])/2)*sc),round(228+(box[1]-oldbox[3])*sc)))
    small = REF/'base-raposa-v3-dedos-focinho-256.png'
    native.save(small)
    DEST.mkdir(parents=True,exist_ok=True)
    for p,name in [(full,'base-v3-dedos-focinho.png'),(small,'base-v3-dedos-focinho-256.png')]:
        shutil.copy2(p,DEST/name)
    assert set(im.getchannel('A').get_flattened_data()) == {0,255}
    review = Image.new('RGB',(1536,768))
    for col,bg in enumerate(['#eeeeee','#222222','#777777']):
        x=col*512
        ImageDraw.Draw(review).rectangle((x,0,x+511,767),fill=bg)
        review.paste(native,(x+128,0),native.getchannel('A'))
        large=native.resize((512,512),Image.Resampling.NEAREST)
        review.paste(large,(x,256),large.getchannel('A'))
    review.save(OUT/'revisao-base.png')
    paths=[source,REF/'base-raposa-v2-laranja.png',REF/'prompt-base-raposa-v3-dedos-focinho.txt',full,small,DEST/'base-v3-dedos-focinho.png',DEST/'base-v3-dedos-focinho-256.png']
    report={'version':3,'change':'Orange exposed fingers on both fists; black nose; white cloth wraps preserved','sourceSize':im.size,'visibleBounds':box,'uniformScale':sc,'feetBaseline':228,'alphaBinary':True,'runtimeRegistered':False,'files':[{'path':p.relative_to(ROOT).as_posix(),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in paths]}
    (OUT/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False))

if __name__ == '__main__':
    main()
