from pathlib import Path
from PIL import Image
import json,hashlib,math
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'output/coxa-v4';ms=json.loads((OUT/'manifest.json').read_text(encoding='utf-8'));problems=[]
assert len(ms)==36 and sum(m['frames'] for m in ms)==232
for m in ms:
    folder=OUT/m['skin']/m['sourceAction'];n=m['frames'];im=Image.open(folder/'composed-sheet.png');assert im.mode=='RGBA' and im.size==(2560,320*math.ceil(n/5))
    for i in range(n,5*math.ceil(n/5)):
        assert not im.crop(((i%5)*512,(i//5)*320,(i%5+1)*512,(i//5+1)*320)).getbbox()
    for i,a in enumerate(m['attachments']):
        assert a['scale']==1
        view=OUT/'objetos'/a['view'];assert hashlib.sha256(view.read_bytes()).hexdigest()==a['object_sha256']
        src=Image.open(view).convert('RGBA');layer=Image.open(folder/f'walker-layer-{i:02}.png').convert('RGBA');count=lambda x:sum(v>=100 for v in x.getchannel('A').tobytes());ratio=count(layer)/count(src)
        if not .94<=ratio<=1.06:problems.append([m['skin'],m['action'],i,'andador cortado',ratio])
        cell=Image.open(folder/f'composed-{i:02}.png');b=cell.getbbox()
        if not b or b[0]<=0 or b[1]<=0 or b[2]>=512 or b[3]>=320:problems.append([m['skin'],m['action'],i,'borda',b])
print(json.dumps({'actions':len(ms),'frames':sum(m['frames'] for m in ms),'problems':problems},ensure_ascii=False,indent=2))
if problems:raise SystemExit(1)
can=Image.open(OUT/'efeitos/latinha.png').convert('RGBA');assert can.size==(8,14)
spin=Image.open(OUT/'efeitos/beer-can-spin/sheet.png');assert spin.mode=='RGBA' and spin.size==(160,64)
for i in range(8):
    cell=spin.crop(((i%5)*32,(i//5)*32,(i%5+1)*32,(i//5+1)*32));b=cell.getbbox();assert b and b[0]>0 and b[1]>0 and b[2]<32 and b[3]<32
    if i==0:assert (b[2]-b[0],b[3]-b[1])==(8,14)
    if i==2:assert (b[2]-b[0],b[3]-b[1])==(14,8)
for i in range(6):
    drop=Image.open(OUT/'efeitos/beer-drops-v4'/f'frame-{i:02}.png');b=drop.getbbox();assert b and b[3]-b[1]<=5
guide=json.loads((OUT/'beer-emitter.json').read_text(encoding='utf-8'));assert guide['throw']['hand']=='left-near' and guide['throw']['releaseFrame']==6
assert (OUT/'beer-flight.gif').exists()
print('Efeitos OK: lata 8x14px, 8 rotacoes sem escala por quadro, gotas ate 5px e soltura na esquerda.')
