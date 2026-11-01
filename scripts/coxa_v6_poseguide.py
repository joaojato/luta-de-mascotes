"""Monta guia com poses existentes, acessorio original e marcadores de novas pegadas."""
from coxa_v6 import *
from PIL import ImageDraw
ch=read(OUT/'choreography.json')
for action in ['walk-forward','walk-backward']:
    sheet=Image.new('RGBA',(2048,960),'#e9e9e9');d=ImageDraw.Draw(sheet)
    if action=='walk-forward':sources=[('idle',0)]*4+[('walk-forward',1),('walk-forward',2),('walk-forward',3),('walk-forward',4),('walk-forward',5),('walk-forward',6),('walk-forward',7),('idle',0)]
    else:sources=[('idle',0),('walk-backward',1),('walk-backward',2),('walk-backward',3),('walk-backward',4),('walk-backward',5),('walk-backward',6),('idle',0),('idle',0),('idle',0),('idle',0),('idle',0)]
    for i,(name,f) in enumerate(sources):
        ox=i%4*512;oy=i//4*320;p=ch[action][i]
        body=Image.open(ROOT/f'output/coxa-v5/normal/{name}/aligned-body-{f:02}.png').convert('RGBA')
        sheet.alpha_composite(body,(ox,oy))
        obj=Image.open(ROOT/'output/coxa-v4/objetos/andador.png').convert('RGBA');wx,wy=p['walkerOrigin'];sheet.alpha_composite(obj,(ox+wx,oy+wy))
        for j,(x,y) in enumerate(p['hands']):
            c='#d92060' if j==0 else '#00aaca';d.ellipse((ox+x-5,oy+y-5,ox+x+5,oy+y+5),outline=c,width=2)
        d.text((ox+160,oy+65),str(i)+' '+p['phase'],fill='#111')
    sheet.save(OUT/'guias'/(action+'-corpo.png'))
