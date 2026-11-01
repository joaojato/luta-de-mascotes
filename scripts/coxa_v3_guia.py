from pathlib import Path
from PIL import Image, ImageDraw
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/coxa-rigido-v3';OUT.mkdir(parents=True,exist_ok=True)
im=Image.new('RGBA',(1024,640),'#eeeeee');obj=Image.open(ROOT/'output/coxa-rigido-v1/objetos/upright.png').convert('RGBA')
body=Image.open(ROOT/'output/coxa-rigido-v1/normal/idle/frame-00.png').convert('RGBA')
for k in range(4):
    x=(k%2)*512;y=(k//2)*320
    if k==0:im.alpha_composite(body,(x,y))
    im.alpha_composite(obj,(x+217,y+192))
    d=ImageDraw.Draw(im);d.text((x+30,y+20),['START: both hands DOWN','RIGHT FAR hand descends toward body','GRASP SECOND tube from left','LIFT ONLY AFTER fingers close'][k],fill='#111111')
    dot=[(246,198),(254,222),(261,243),(261,243)][k]
    d.ellipse((x+dot[0]-4,y+dot[1]-4,x+dot[0]+4,y+dot[1]+4),fill='#ff00ff')
    if k in (1,2):d.line((x+246,y+198,x+dot[0],y+dot[1]),fill='#ff00ff',width=2)
im.save(OUT/'guia-pegada.png')
