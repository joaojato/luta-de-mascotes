"""Validação estrutural das correções; não substitui revisão de anatomia/estilo."""
from pathlib import Path
from PIL import Image
import json, hashlib, math
root=Path(__file__).resolve().parents[1];out=root/'output/coxa-rigido-v2'
manifest=json.loads((out/'manifest-correcoes.json').read_text(encoding='utf-8'))
digest=hashlib.sha256((out/'objetos/andador.png').read_bytes()).hexdigest()
assert len(manifest)==5
for m in manifest:
    folder=out/'normal'/m['action'];n=m['frames'];sheet=Image.open(folder/'composed-sheet.png')
    assert sheet.mode=='RGBA' and sheet.size==(2560,320*math.ceil(n/5))
    for i in range(n,5*math.ceil(n/5)):
        assert not sheet.crop(((i%5)*512,(i//5)*320,(i%5+1)*512,(i//5+1)*320)).getbbox()
    assert all(a['scale']==1 and a['rotation']==0 and a['sha256']==digest for a in m['attachments'])
    for i in range(n):
        im=Image.open(folder/f'composed-{i:02}.png');box=im.getbbox()
        assert box and box[0]>0 and box[1]>0 and box[2]<512 and box[3]<320
    if m['action']!='walker-grab':assert len({tuple(a['origin']) for a in m['attachments']})==1
    else:
        assert len({tuple(a['origin']) for a in m['attachments'][:4]})==1
        assert all(a['rearLeftLegGrip'] for a in m['attachments'][3:])
    if m['action']=='beer-throw':
        assert [p['hand'] for p in m['props']]==['right-far','right-far','right-far',None]
        assert m['props'][-1]['released']
    if m['action']=='low-kick':assert all(a['gripHand']=='left-near' for a in m['attachments'])
    if m['action']=='block-low':assert all(a['layer']=='in-front-of-body' for a in m['attachments'])
print('OK: cinco folhas / 34 quadros; margens, transparência, sobras vazias, mão da lata, apoio contínuo e objeto rígido.')
