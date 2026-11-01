"""Confere montagem das camadas; anatomia e coreografia exigem inspeção visual."""
from pathlib import Path
from PIL import Image
import json, math, hashlib
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'output/coxa-rigido-v3'
ms=json.loads((OUT/'manifest.json').read_text(encoding='utf-8'));obj=Image.open(OUT/'objetos/andador.png').convert('RGBA');normalized=Image.new('RGBA',obj.size);normalized.alpha_composite(obj);pixels=normalized.crop(normalized.getbbox()).tobytes();digest=hashlib.sha256((OUT/'objetos/andador.png').read_bytes()).hexdigest()
assert [m['frames'] for m in ms]==[10,12,12]
for m in ms:
    folder=OUT/'normal'/m['sourceAction'];n=m['frames'];r=json.loads((folder/'report.json').read_text(encoding='utf-8'));assert not r['warnings']
    for name in ('composed-sheet.png','aligned-body-sheet.png'):
        sheet=Image.open(folder/name);assert sheet.mode=='RGBA' and sheet.size==(2560,320*math.ceil(n/5))
        for i in range(n,5*math.ceil(n/5)):
            assert not sheet.crop(((i%5)*512,(i//5)*320,(i%5+1)*512,(i//5+1)*320)).getbbox()
    for i in range(n):
        im=Image.open(folder/f'composed-{i:02}.png');b=im.getbbox();assert b and b[0]>0 and b[1]>0 and b[2]<512 and b[3]<320
        layer=Image.open(folder/f'walker-layer-{i:02}.png').convert('RGBA');assert layer.crop(layer.getbbox()).tobytes()==pixels,'Andador alterado/cortado'
    assert all(a['scale']==1 and a['rotation']==0 and a['sha256']==digest for a in m['attachments'])
    if m['action']=='beer-throw':
        assert [p['frame'] for p in m['props']]==[3,4,5,6]
        assert [p['hand'] for p in m['props']]==['left-near']*3+[None]
        assert m['props'][-1]['released']
    elif m['action']=='low-kick':assert all(a['grip']=='left-near-support' for a in m['attachments'])
    else:
        assert all(a['origin']==[217,192] for a in m['attachments'][:9])
        assert all(a['grip']=='right-far-rear-left-leg' for a in m['attachments'][5:])
print('OK: 3 ações, 34 quadros; andador idêntico pixel a pixel em todas as camadas; bolso/esquerda/soltura, apoio e pegada durante crescimento.')
