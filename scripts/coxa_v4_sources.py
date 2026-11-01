"""Consolida fontes existentes válidas e duas fases geradas da transformação."""
from pathlib import Path
from PIL import Image
import json,shutil,hashlib,math
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'output/coxa-v4';OLD=ROOT/'output/coxa-rigido-v1'
def data(p):return json.loads(p.read_text(encoding='utf-8'))
def save(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2),encoding='utf-8')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
reports=list((OLD/'normal').glob('*/report.json'))
for m in data(OLD/'manifest.json'):
    if m['skin']!='normal' or m['action'] in ('light-punch','special-transform'):continue
    action=m['action'];origin=next(p.parent for p in reports if data(p)['source_sha256']==m['source_sha256'])
    if action in ('beer-throw','low-kick'):origin=ROOT/'output/coxa-rigido-v3/normal'/action
    if action=='block-low':origin=ROOT/'output/coxa-rigido-v2/normal/block-low'
    target=OUT/'normal'/action
    if target.exists():continue
    shutil.copytree(origin,target);r=data(target/'report.json');r.update(skin='normal',action=action,reused_body_source=str(origin.relative_to(ROOT)).replace('\\','/'))
    if action in ('beer-throw','low-kick','block-low','block-high','crouch','special-charge'):
        r['reuseComposite']=True
        if action in ('beer-throw','low-kick'):
            for i in range(r['frames']):shutil.copy2(target/f'aligned-body-{i:02}.png',target/f'frame-{i:02}.png')
            shutil.copy2(target/'aligned-body-sheet.png',target/'sheet.png')
    save(target/'report.json',r)
# Montagem das fases corretas: braços de apoio da segunda fonte + crescimento/figurino final da primeira.
target=OUT/'normal/special-transform-final';target.mkdir(exist_ok=True);r=data(OUT/'normal/special-transform-b2/report.json');origins=[]
sheet=Image.new('RGBA',(2560,960))
for i in range(12):
    src=OUT/'normal'/('special-transform-b2' if i<6 else 'special-transform');p=src/f'frame-{i:02}.png';shutil.copy2(p,target/f'frame-{i:02}.png');im=Image.open(p).convert('RGBA');sheet.alpha_composite(im,((i%5)*512,(i//5)*320));origins.append({'frame':i,'source':str(p.relative_to(ROOT)).replace('\\','/'),'sha256':sha(p)})
sheet.save(target/'sheet.png');sheet.save(target/'source-assembly.png');r.update(action='special-transform-final',assemblySources=origins,source_sha256=sha(target/'source-assembly.png'),source='output/coxa-v4/normal/special-transform-final/source-assembly.png',warnings=[])
save(target/'report.json',r);save(target/'spec.json',r);(target/'prompt.txt').write_text('Montagem sem redesenho: frames 0–5 de special-transform-b2; frames 6–11 de special-transform. Fontes, prompts e hashes preservados nas pastas indicadas em assemblySources.',encoding='utf-8')
print('Fontes normais consolidadas e transformação composta de fases geradas.')
