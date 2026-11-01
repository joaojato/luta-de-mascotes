"""Guias tecnicos de articulacoes A/B. Nao sao sprites nem redesenhos do corpo."""
from pathlib import Path
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'output/coxa-v5/guias'
obj=Image.open(ROOT/'output/coxa-v4/objetos/andador.png').convert('RGBA')
# Ancas fixas; A esquerda anatomica/proxima (laranja), B direita/distante (azul).
forward=[((280,245),(282,277),(340,247),(351,277)),((277,239),(280,261),(340,247),(351,277)),((268,241),(259,266),(340,247),(351,277)),((273,249),(264,277),(340,247),(351,277)),((276,249),(269,277),(337,239),(341,264)),((280,248),(275,277),(315,236),(315,257)),((282,247),(279,277),(316,244),(321,271)),((281,246),(282,277),(331,247),(339,277))]
backward=[((280,245),(282,277),(340,247),(351,277)),((280,245),(282,277),(344,238),(356,260)),((280,245),(282,277),(352,244),(370,267)),((284,245),(286,277),(352,250),(370,277)),((290,237),(298,262),(348,250),(365,277)),((310,238),(320,258),(344,250),(359,277)),((307,245),(314,272),(341,248),(354,277)),((291,245),(296,277),(340,247),(351,277))]
for name,poses in [('walk-forward',forward),('walk-backward',backward)]:
    sheet=Image.new('RGBA',(2048,640),'#eee');d=ImageDraw.Draw(sheet)
    for i,(bk,bf,ak,af) in enumerate(poses):
        ox=(i%4)*512;oy=(i//4)*320
        sheet.alpha_composite(obj,(ox+217,oy+192))
        for hip,knee,ankle,c,label in [((315,216),bk,bf,'#196bbf','B DIREITA fundo'),((331,220),ak,af,'#db6b16','A ESQUERDA perto')]:
            pts=[(x+ox,y+oy) for x,y in [hip,knee,ankle]];d.line(pts,fill=c,width=4)
            for x,y in pts:d.ellipse((x-4,y-4,x+4,y+4),fill=c)
            x,y=pts[-1];d.line((x-13,y+10,x+7,y+10),fill=c,width=4)
        d.line((ox+210,oy+292,ox+390,oy+292),fill='#999',width=1)
        d.text((ox+215,oy+110),str(i)+' A laranja / B azul',fill='#222')
        for x,y in [(241,197),(299,201)]:d.ellipse((ox+x-4,oy+y-4,ox+x+4,oy+y+4),outline='#b11',width=2)
    sheet.save(OUT/(name+'-articulacoes.png'))
