from pathlib import Path
from PIL import Image,ImageDraw
import json,math
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'output/coxa-v4';OUT.mkdir(exist_ok=True)
obj=Image.open(ROOT/'output/coxa-rigido-v1/objetos/upright.png').convert('RGBA')
# Somente montagem do MESMO objeto. Guia, sem desenho de anatomia.
states=[(246,198,0),(246,158,-30),(230,125,-90),(185,125,-90),(225,125,-90),(175,125,-90),(225,125,-90),(240,146,-60),(246,170,-25),(246,198,0)]
canvas=Image.new('RGBA',(2560,640),'#eee');anchors={'far':(29.4,3.7),'near':(79.7,7.5)};result=[]
for i,(x,y,angle) in enumerate(states):
    layer=Image.new('RGBA',(400,400));layer.alpha_composite(obj,(round(200-anchors['far'][0]),round(200-anchors['far'][1])));layer=layer.rotate(angle,resample=Image.Resampling.NEAREST,center=(200,200));cell=Image.new('RGBA',(512,320));cell.alpha_composite(layer,(x-200,y-200));rad=math.radians(-angle);vx=anchors['near'][0]-anchors['far'][0];vy=anchors['near'][1]-anchors['far'][1];near=(x+vx*math.cos(rad)-vy*math.sin(rad),y+vx*math.sin(rad)+vy*math.cos(rad));d=ImageDraw.Draw(cell)
    for p,color in [((x,y),'#ff00ff'),(near,'#00c8ff')]:d.ellipse((p[0]-4,p[1]-4,p[0]+4,p[1]+4),fill=color)
    d.text((20,15),f'{i}: '+['REST','LIFT BOTH HANDS','READY FEET LEFT','THRUST 1','RETRACT','THRUST 2','RETRACT','LOWER','LOWER','REST'][i],fill='#111')
    canvas.alpha_composite(cell,((i%5)*512,(i//5)*320));result.append({'frame':i,'far':[x,y],'near':near,'angle':angle})
canvas.save(OUT/'guia-duas-estocadas.png');(OUT/'light-rig.json').write_text(json.dumps(result,indent=2))
guide=Image.new('RGBA',(2048,960),'#eeeeee')
for i in range(12):
    cell=Image.new('RGBA',(512,320));cell.alpha_composite(obj,(217,192));d=ImageDraw.Draw(cell)
    hp=(246+min(i,5)*3,198+min(i,5)*3.6)
    for p,col in [(hp,'#ff00ff'),((309,198),'#00bfff')]:d.ellipse((p[0]-4,p[1]-4,p[0]+4,p[1]+4),fill=col)
    d.text((20,15),f'{i}: '+('BENT ELBOWS: HANDS AT WAIST/TOP HANDLES' if i==0 else 'RIGHT HAND SLIGHTLY DOWN TO B2' if i<=5 else 'GROW, GRIP B2, TURN WRIST, THEN LOWER BOTH ARMS'),fill='#111')
    guide.alpha_composite(cell,((i%4)*512,(i//4)*320))
guide.save(OUT/'guia-transformacao-b2.png')
