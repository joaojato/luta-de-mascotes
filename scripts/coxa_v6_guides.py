"""Guias de juntas e contato no mundo; nao desenha anatomia de sprites."""
from pathlib import Path
from PIL import Image,ImageDraw
import json
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'output/coxa-v6';(OUT/'guias').mkdir(parents=True,exist_ok=True)
obj=Image.open(ROOT/'output/coxa-v4/objetos/andador.png').convert('RGBA')
data={}
for action in ['walk-forward','walk-backward']:
    if action=='walk-forward':
        root=[0,0,0,0,0,-3,-7,-9,-12,-16,-18,-18]
        world=[217,214,206,199,199,199,199,199,199,199,199,199]
        ys=[192,184,182,192,192,192,192,192,192,192,192,192]
        phase=['apoio','levanta andador','avanca andador','planta andador','passo B sai','passo B no ar','passo B pousa','passo A sai','passo A no ar','passo A pousa','assenta','apoio']
        feetB=[(282,278),(282,278),(282,278),(282,278),(282,269),(275,258),(271,278),(273,278),(276,278),(280,278),(282,278),(282,278)]
        feetA=[(351,278),(351,278),(351,278),(351,278),(351,278),(354,278),(358,278),(360,269),(355,258),(349,278),(351,278),(351,278)]
    else:
        root=[0,0,4,9,9,13,18,18,18,18,18,18]
        world=[217]*8+[221,229,235,235]
        ys=[192]*8+[184,182,186,192]
        phase=['apoio','passo A sai','passo A no ar','passo A pousa','passo B sai','passo B no ar','passo B pousa','apoio','levanta andador','recua andador','aproxima andador','planta andador']
        feetB=[(282,278),(282,278),(278,278),(273,278),(273,269),(277,258),(282,278),(282,278),(282,278),(282,278),(282,278),(282,278)]
        feetA=[(351,278),(351,269),(356,258),(360,278),(360,278),(356,278),(351,278),(351,278),(351,278),(351,278),(351,278),(351,278)]
    sheet=Image.new('RGBA',(2048,960),'#e9e9e9');d=ImageDraw.Draw(sheet);records=[]
    for i in range(12):
        ox=i%4*512;oy=i//4*320;wx=world[i]-root[i];wy=ys[i];lean=round((217-wx)*.45)
        sheet.alpha_composite(obj,(ox+wx,oy+wy))
        hands=[(wx+24,wy+5),(wx+82,wy+9)]
        for sh,el,h,c in [((280-lean,176),(263-lean,184+(wy-192)*.4),hands[0],'#196bbf'),((318-lean,175),(330-lean,183+(wy-192)*.5),hands[1],'#db6b16')]:
            pts=[(round(x+ox),round(y+oy)) for x,y in [sh,el,h]];d.line(pts,fill=c,width=3)
            for x,y in pts:d.ellipse((x-3,y-3,x+3,y+3),fill=c)
        for hip,ankle,c in [((315,218),feetB[i],'#196bbf'),((331,220),feetA[i],'#db6b16')]:
            x,y=ankle;knee=(round((hip[0]+x)/2-10),242 if y<278 else 248)
            pts=[(px+ox,py+oy) for px,py in [hip,knee,ankle]];d.line(pts,fill=c,width=3)
            for px,py in pts:d.ellipse((px-3,py-3,px+3,py+3),fill=c)
            d.line((x+ox-13,y+oy+10,x+ox+7,y+oy+10),fill=c,width=4)
        d.text((ox+180,oy+75),str(i)+' '+phase[i],fill='#222');d.line((ox+175,oy+292,ox+395,oy+292),fill='#888')
        records.append({'frame':i,'rootX':root[i],'walkerOrigin':[wx,wy],'walkerWorldX':world[i],'hands':hands,'phase':phase[i],'feetB':feetB[i],'feetA':feetA[i]})
    sheet.save(OUT/'guias'/(action+'.png'));data[action]=records
(OUT/'choreography.json').write_text(json.dumps(data,indent=2,ensure_ascii=False),encoding='utf-8')
