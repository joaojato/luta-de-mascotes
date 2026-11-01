"""Montagem de corpos gerados e andador rigido com fases de apoio no mundo."""
from pathlib import Path
from PIL import Image,ImageDraw
import json,math,hashlib,shutil,zipfile
from coxa_revisao_v2 import point,outputs
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'output/coxa-v6';DEST=ROOT/'public/assets/lutadores/coxa/revisao-v6'
def read(p):return json.loads(p.read_text(encoding='utf-8'))
def save(p,x):p.write_text(json.dumps(x,indent=2,ensure_ascii=False),encoding='utf-8')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def build(action,coords):
    folder=OUT/'normal'/action;r=read(folder/'report.json');phases=read(OUT/'choreography.json')[action]
    objpath=ROOT/'output/coxa-v4/objetos/andador.png';obj=Image.open(objpath).convert('RGBA')
    bodies=[];frames=[];rig=[]
    for i,p in enumerate(phases):
        override=coords.get('overrides',{}).get(str(i))
        source_folder=OUT/'normal'/override['folder'] if override else folder
        source_report=read(source_folder/'report.json') if override else r
        source_i=override['index'] if override else i
        body0=Image.open(source_folder/f'frame-{source_i:02}.png').convert('RGBA')
        a=point(source_report,source_i,override['far'] if override else coords['far'][i]);b=point(source_report,source_i,override['near'] if override else coords['near'][i]);target=p['hands'][0]
        dx,dy=round(target[0]-a[0]),round(target[1]-a[1])
        body=Image.new('RGBA',(512,320));body.alpha_composite(body0,(dx,dy));hands=[[a[0]+dx,a[1]+dy],[b[0]+dx,b[1]+dy]]
        layer=Image.new('RGBA',body.size);layer.paste(obj,tuple(p['walkerOrigin']))
        cell=body.copy();cell.alpha_composite(layer)
        for x,y in hands:
            for box in [(round(x-6),round(y-5),round(x+7),round(y-1)),(round(x-5),round(y+3),round(x+6),round(y+6))]:cell.alpha_composite(body.crop(box),(box[0],box[1]))
        body.save(folder/f'aligned-body-{i:02}.png');layer.save(folder/f'walker-layer-{i:02}.png')
        bodies.append(body);frames.append(cell)
        rig.append({**p,'origin':p['walkerOrigin'],'rotation':0,'scale':1,'object':'objetos/andador.png','object_sha256':sha(objpath),'hands':{'right-far':hands[0],'left-near':hands[1]},'bodyOffset':[dx,dy],'walkerGrounded':p['walkerOrigin'][1]==192,'source_sha256':source_report['source_sha256'],'bodySource':str(source_folder.relative_to(ROOT)/'source.png'),'bodySourceFrame':source_i})
    sheet=Image.new('RGBA',(2560,960))
    for i,b in enumerate(bodies):sheet.alpha_composite(b,((i%5)*512,(i//5)*320))
    sheet.save(folder/'aligned-body-sheet.png');outputs(folder,frames,r['fps']);save(folder/'attachments.json',rig)
    # Camera fixa e marcas de chao: o objeto plantado permanece no mesmo lugar no mundo.
    preview=[];delta=phases[-1]['rootX']
    for cycle in range(3):
        for i,(cell,p) in enumerate(zip(frames,phases)):
            bg=Image.new('RGBA',(512,340),'#303740');d=ImageDraw.Draw(bg)
            d.line((0,293,512,293),fill='#87908a',width=1)
            for x in range(0,512,18):d.line((x,294,x,300),fill='#87908a')
            bg.alpha_composite(cell,(65+cycle*delta+p['rootX'],0))
            d.text((15,315),str(i)+' | '+p['phase'],fill='#fff')
            preview.append(bg.convert('RGB').resize((1024,680),Image.Resampling.NEAREST))
    preview[0].save(folder/'world-preview.gif',save_all=True,append_images=preview[1:],duration=100,loop=0)
    save(folder/'motion-guide.json',{'action':action,'frames':12,'fpsProposed':10,'cycleDisplacementX':delta,'rootTrack':phases,'integration':'Aplicar rootX por fase; movimento global constante faria o andador deslizar enquanto plantado. Escalar deslocamento junto do corpo, sem distorcer objeto. Arte ainda sem integracao no jogo.'})
    return rig
if __name__=='__main__':
    from coxa_v6_mount import build as mount_supported_gait
    mount_supported_gait()
