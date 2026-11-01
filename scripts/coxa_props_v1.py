"""Monta a latinha como objeto independente, sem redesenhar o corpo."""
from coxa_rigido_v1 import OUT, map_point, gallery
from PIL import Image
import json, math, shutil, zipfile
can=Image.open(OUT/'efeitos/beer-can/frame-00.png').convert('RGBA');can=can.crop(can.getbbox())
configs={'special-charge':[None,((715,299),0),((1138,157),-90),((237,592),-65),((681,554),180),((1125,735),0)],'beer-throw-final':[((220,370),0),((694,173),-45),None,None]}
for action,poses in configs.items():
    folder=OUT/'normal'/action;r=json.loads((folder/'report.json').read_text(encoding='utf-8'));sheet=Image.new('RGBA',(2560,320*math.ceil(r['frames']/5)));previews=[];props=[]
    for i,pose in enumerate(poses):
        cell=Image.open(folder/f'composed-{i:02}.png').convert('RGBA')
        if pose:
            raw,angle=pose;x,y=map_point(r,i,raw);obj=can.rotate(angle,resample=Image.Resampling.NEAREST,expand=True);cell.alpha_composite(obj,(round(x-obj.width/2),round(y-obj.height/2)))
            # Os dedos originais ficam na frente da lata; nenhuma alteração anatômica.
            body=Image.open(folder/f'frame-{i:02}.png').convert('RGBA');box=(round(x-2),round(y-2),round(x+3),round(y+3));cell.alpha_composite(body.crop(box),(box[0],box[1]))
            props.append({'frame':i,'object':'beer-can','center':[x,y],'angle':angle})
        cell.save(folder/f'composed-{i:02}.png');sheet.alpha_composite(cell,((i%5)*512,(i//5)*320));bg=Image.new('RGBA',cell.size,'#333842');bg.alpha_composite(cell);previews.append(bg.convert('RGB'))
    sheet.save(folder/'composed-sheet.png');bg=Image.new('RGBA',sheet.size,'#eee');bg.alpha_composite(sheet);bg.convert('RGB').save(folder/'composed-contact.png');previews[0].save(folder/'composed-preview.gif',save_all=True,append_images=previews[1:],duration=round(1000/r['fps']),loop=0)
    (folder/'props.json').write_text(json.dumps(props,indent=2),encoding='utf-8')
gallery(True)
dest=OUT.parents[1]/'public/assets/lutadores/coxa/rigido-v1'
for name in ('beer-can','beer-drops'):
    target=dest/'efeitos'/name;target.mkdir(parents=True,exist_ok=True)
    for f in ('sheet.png','report.json'):shutil.copy2(OUT/'efeitos'/name/f,target/f)
for action in configs:
    canonical='beer-throw' if action=='beer-throw-final' else action
    shutil.copy2(OUT/'normal'/action/'props.json',dest/'normal'/(canonical+'-props.json'))
with zipfile.ZipFile(OUT/'coxa-sprites-v1.zip','w',zipfile.ZIP_DEFLATED) as z:
    for p in dest.rglob('*'):
        if p.is_file():z.write(p,p.relative_to(dest))
print('Pacote salvo:',OUT/'coxa-sprites-v1.zip')
