"""Verificacao estrutural da entrega; revisao anatomica continua visual."""
from coxa_v5 import *
from PIL import ImageDraw
manifest=read(DEST/'manifest-art.json');old=read(ROOT/'public/assets/lutadores/coxa/revisao-v4/manifest-art.json')
assert manifest['bodyActions']==36 and manifest['bodyFrames']==232
names=['idle','walk-forward','walk-backward'];count=0
qa=Image.new('RGB',(800,1250),'#e7e7e7');draw=ImageDraw.Draw(qa);slot=0
for action in names:
    folder=OUT/'normal'/action;r=read(folder/'report.json');rig=read(folder/'attachments.json')
    n=4 if action=='idle' else 8
    assert r['frames']==n and r['fps']==8 and len(rig)==n
    for sheetname in ['aligned-body-sheet.png','composed-sheet.png']:
        sheet=Image.open(folder/sheetname);assert sheet.mode=='RGBA' and sheet.size==(2560,320*math.ceil(n/5))
        for i in range(n,5*math.ceil(n/5)):
            assert not sheet.crop(((i%5)*512,(i//5)*320,(i%5+1)*512,(i//5+1)*320)).getbbox()
    hashes=[]
    for i,a in enumerate(rig):
        assert a['scale']==1 and a['rotation']==0 and a['origin']==[217,192]
        layer=Image.open(folder/f'walker-layer-{i:02}.png').convert('RGBA')
        obj=Image.open(DEST/'objetos/andador.png').convert('RGBA')
        assert layer.crop((217,192,217+obj.width,192+obj.height)).tobytes()==obj.tobytes()
        assert a['object_sha256']==sha(DEST/'objetos/andador.png')
        assert layer.getbbox()[0]>0 and layer.getbbox()[3]<320
        far=a['hands']['right-far'];near=a['hands']['left-near']
        assert 237<=far[0]<=245 and 194<=far[1]<=200
        assert 291<=near[0]<=305 and 195<=near[1]<=205,(action,i,near)
        frame=Image.open(folder/f'composed-{i:02}.png');bb=frame.getbbox()
        assert bb and 0<bb[0]<bb[2]<512 and 0<bb[1]<bb[3]<320
        hashes.append(sha(folder/f'aligned-body-{i:02}.png'))
        crop=frame.crop((200,70,400,310));qa.paste(crop,(slot%4*200,slot//4*250),crop)
        draw.text((slot%4*200+5,slot//4*250+3),action+' '+str(i),fill='#111');slot+=1;count+=1
    assert len(set(hashes))==n,'Nao repetir poses para esconder erros'
for entry in manifest['body']:
    assert sha(DEST/entry['body'])==entry['body_sha256']
    assert sha(DEST/entry['composed'])==entry['composed_sha256']
    if entry['skin']!='normal' or entry['action'] not in names:
        prev=next(x for x in old['body'] if x['skin']==entry['skin'] and x['action']==entry['action'])
        assert prev['body_sha256']==entry['body_sha256'] and prev['composed_sha256']==entry['composed_sha256']
qa.save(OUT/'revisao-escala-real.png')
save(OUT/'validation.json',{'actionsRedrawn':3,'framesReviewed':count,'fps':8,'fullActions':36,'fullBodyFrames':232,'rigidWalker':'Pixels identicos nos 20 quadros, escala 1 e sem cortes','otherActions':'33 preservadas por hash','runtimeIntegrated':False,'anatomicalReview':'Fonte e montagem revistas visualmente; guia A/B e apoio por fase registrados.'})
print('OK: 3 acoes / 20 quadros RGBA; 20 andadores identicos; 33 acoes preservadas.')
