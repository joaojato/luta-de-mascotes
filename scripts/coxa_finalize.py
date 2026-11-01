from pathlib import Path
import json, shutil, subprocess, sys, zipfile
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
p=ROOT/'scripts/coxa_rigido_v1.py'
s=p.read_text(encoding='utf-8')
old="name='crouch' if action=='crouch-backpain' else 'beer-throw' if action=='beer-throw-fixed' else action;rel=f'{skin}/{action}'"
s=s.replace(old,"name=canonical(action);rel=f'{skin}/{action}'\n        if superseded(skin,action):continue")
p.write_text(s,encoding='utf-8')
out=ROOT/'output/coxa-rigido-v1'
for name in ('beer-can','beer-drops'):
    old=ROOT/'output/coxa-producao-v2/efeitos'/name
    new=out/'efeitos'/name
    new.mkdir(parents=True,exist_ok=True)
    spec=json.loads((old/'spec.json').read_text(encoding='utf-8'))
    if name=='beer-can':spec['targetheight']=14
    (new/'spec.json').write_text(json.dumps(spec,ensure_ascii=False,indent=2),encoding='utf-8')
    subprocess.run([sys.executable,str(ROOT/'scripts/coxa_art_v2.py'),'import','--spec',str(new/'spec.json'),'--source',str(old/'source.png'),'--out',str(out)],check=True)
subprocess.run([sys.executable,str(p),'compose'],check=True)
subprocess.run([sys.executable,str(p),'gallery'],check=True)
