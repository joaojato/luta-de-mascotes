"""QA de camadas, quadros e apoio do objeto; anatomia e pegada revisadas visualmente."""
from coxa_v6 import *
from PIL import ImageDraw
manifest=read(DEST/'manifest-art.json');old=read(ROOT/'public/assets/lutadores/coxa/revisao-v5/manifest-art.json')
assert manifest['bodyActions']==36 and manifest['bodyFrames']==240
summary=[]
for action in ['walk-forward','walk-backward']:
    f=OUT/'normal'/action;r=read(f/'report.json');rig=read(f/'attachments.json');assert len(rig)==r['frames']==12
    contact=Image.new('RGB',(960,750),'#e7e7e7');d=ImageDraw.Draw(contact)
    obj=Image.open(DEST/'objetos/andador.png').convert('RGBA')
    for sheetname in ['aligned-body-sheet.png','composed-sheet.png']:
        sheet=Image.open(f/sheetname);assert sheet.mode=='RGBA' and sheet.size==(2560,960)
        for i in range(12,15):assert not sheet.crop((i%5*512,i//5*320,(i%5+1)*512,(i//5+1)*320)).getbbox()
    errors=[]
    for i,a in enumerate(rig):
        assert a['scale']==1 and a['rotation']==0 and a['object_sha256']==sha(DEST/'objetos/andador.png')
        layer=Image.open(f/f'walker-layer-{i:02}.png');x,y=a['origin'];assert layer.crop((x,y,x+obj.width,y+obj.height)).tobytes()==obj.tobytes()
        assert x+a['rootX']==a['walkerWorldX']
        cell=Image.open(f/f'composed-{i:02}.png');b=cell.getbbox();assert b and 0<b[0]<b[2]<512 and 0<b[1]<b[3]<320
        target=(x+82,y+9);near=a['hands']['left-near'];err=[round(near[0]-target[0],2),round(near[1]-target[1],2)];errors.append(err)
        assert abs(err[0])<=9 and abs(err[1])<=8,(action,i,err)
        crop=cell.crop((160,65,400,305));contact.paste(crop,(i%4*240,i//4*250),crop);d.text((i%4*240+3,i//4*250+1),str(i)+' '+a['phase'],fill='#111')
    plant=rig[3:] if action=='walk-forward' else rig[:9]
    assert len(set(a['walkerWorldX'] for a in plant))==1
    assert all(a['origin'][1]==192 for a in plant)
    carried=rig[1:3] if action=='walk-forward' else rig[9:11]
    assert all(a['origin'][1]<192 for a in carried)
    assert len(set(a['rootX'] for a in carried))==1
    assert rig[-1]['origin']==rig[0]['origin'] and (rig[-1]['rootX']<0 if action=='walk-forward' else rig[-1]['rootX']>0)
    assert (f/'world-preview.gif').exists();contact.save(f/'native-review.png')
    summary.append({'action':action,'frames':12,'walkerWorldPlantedX':plant[0]['walkerWorldX'],'liftHeightMax':192-min(a['origin'][1] for a in rig),'nearGripErrorsPx':errors})
for e in manifest['body']:
    assert sha(DEST/e['body'])==e['body_sha256'] and sha(DEST/e['composed'])==e['composed_sha256']
    if e['skin']!='normal' or e['action'] not in ['walk-forward','walk-backward']:
        before=next(x for x in old['body'] if x['skin']==e['skin'] and x['action']==e['action']);assert e['body_sha256']==before['body_sha256'] and e['composed_sha256']==before['composed_sha256']
save(OUT/'validation.json',{'replacedActions':2,'frames':24,'preservedActions':34,'rigidObject':'24 camadas identicas ao objeto completo; apenas translacao','worldContact':'Andador estacionario no mundo durante os passos; carregado com root parado','details':summary,'runtimeIntegrated':False})
print('OK: 24 quadros; objeto rigido completo; apoio estacionario nas fases de passos; 34 acoes preservadas.')
