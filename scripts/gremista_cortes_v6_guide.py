"""Technical movement guide only. Colored joints/blade never enter final sprites."""
from pathlib import Path
from PIL import Image,ImageDraw
import json
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'output/gremista-cortes-v6'
xs=[285,297,312,325,322,307,288,282,283,284,285,285]
ys=[330,326,322,318,319,324,330,332,332,331,330,330]
lengths=[70,62,49,34,37,52,68,70,70,70,70,70]
dys=[0,-3,-8,-12,-11,-6,-1,0,0,0,0,0]
def guide(action):
 n=12 if action=='low-kick' else 16;cols=4;cw=320;ch=230
 canvas=Image.new('RGB',(cols*cw,((n+cols-1)//cols)*ch),'#eeeeee');d=ImageDraw.Draw(canvas)
 base=Image.open(ROOT/'output/gremista-coesao-v3'/('crouch/frame-04.png' if n==12 else 'guard.png')).convert('RGBA')
 gray=base.convert('L').convert('RGBA');gray.putalpha(base.getchannel('A').point(lambda a:round(a*.15)))
 records=[]
 phases=['NEAR READY','WINDUP','WINDUP','FAR READY','CUT TO CAMERA','CUT TO CAMERA','CONTACT NEAR','FOLLOW','SETTLE','RECOVER','READY','READY']
 for f in range(n):
  ox=f%4*cw;oy=f//4*ch;canvas.paste(gray.crop((160,160,480,390)),(ox,oy),gray.crop((160,160,480,390)).getchannel('A'))
  if n==12:w=(xs[f],ys[f]);tip=(w[0]-lengths[f],w[1]+dys[f]);shoulder=(300,275);elbow=(302+(w[0]-285)*.25,303);label=phases[f]
  else:
   # Two compact equal-direction arcs. No blade changes its left-pointing sign.
   k=[0,1,2,3,4,5,6,7,2,3,4,5,6,7,1,0][f]
   w=(xs[k],ys[k]-65+(0 if f<8 else -12));tip=(w[0]-lengths[k],w[1]+dys[k]);shoulder=(300,220);elbow=(303+(w[0]-285)*.2,245);label=phases[k]
  def pt(p):return (ox+p[0]-160,oy+p[1]-160)
  d.line([pt(shoulder),pt(elbow),pt(w)],fill='#146ac2',width=5)
  d.line([pt(w),pt(tip)],fill='#d42a2a',width=5)
  for p in [shoulder,elbow,w]:
   x,y=pt(p);d.ellipse((x-4,y-4,x+4,y+4),fill='#146ac2')
  d.text((ox+8,oy+8),f'{f}: {label}',fill='#111111');d.text((ox+8,oy+25),'RED = blade; tip ALWAYS LEFT',fill='#aa2222')
  records.append({'frame':f,'phase':label,'rightShoulder':shoulder,'rightElbow':elbow,'rightWrist':w,'tip':tip,'leftwardTip':tip[0]<w[0]})
 folder=OUT/action;folder.mkdir(parents=True,exist_ok=True);canvas.save(folder/'motion-guide.png');(folder/'joint-guide.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
for action in ['low-kick','light-punch']:guide(action)
