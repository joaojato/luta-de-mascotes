"""Pack generated NPC art without painting or deforming poses."""
from pathlib import Path
from PIL import Image, ImageDraw
import hashlib, json

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/guerreiro-v2'
DEST = ROOT / 'public/assets/npcs/guerreiro/base-v1'
CW, CH, COLS = 512, 320, 5

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def pack(action, boxes, anchors, scale, fps, loop, contacts):
    folder = OUT / action
    source = Image.open(folder / 'source.png').convert('RGBA')
    sheet = Image.new('RGBA', (CW * COLS, CH * ((len(boxes)+4)//5)))
    frames, report = [], []
    for i, (box, anchor) in enumerate(zip(boxes, anchors)):
        crop = source.crop(box)
        # Suppress only near-transparent generation residue; no recoloring.
        alpha = crop.getchannel('A')
        crop.putalpha(alpha.point(lambda a: 0 if a < 8 else a))
        crop.save(folder / f'extracted-{i}.png')
        resized = crop.resize((round(crop.width*scale), round(crop.height*scale)), Image.Resampling.NEAREST)
        x = round(294-(anchor[0]-box[0])*scale)
        y = round(296-(anchor[1]-box[1])*scale)
        assert x >= 0 and y >= 0 and x+resized.width <= CW and y+resized.height <= CH
        frame = Image.new('RGBA', (CW,CH))
        frame.alpha_composite(resized,(x,y))
        frame.save(folder / f'frame-{i}.png')
        frames.append(frame)
        sheet.alpha_composite(frame,((i%COLS)*CW,(i//COLS)*CH))
        report.append({'frame':i,'sourceBox':box,'supportFootSource':anchor,'visualBounds':frame.getbbox()})
    target = DEST / f'{action}.png'
    sheet.save(target)
    sheet.save(folder / 'sheet.png')
    backgrounds = []
    for frame in frames:
        bg = Image.new('RGB',frame.size,'#777777')
        bg.paste(frame,mask=frame.getchannel('A'))
        backgrounds.append(bg)
    backgrounds[0].save(folder/'preview.gif',save_all=True,append_images=backgrounds[1:],duration=round(1000/fps),loop=0 if loop else 1)
    backgrounds[0].save(folder/'slow.gif',save_all=True,append_images=backgrounds[1:],duration=300,loop=0)
    contact = Image.new('RGB',(CW*4,CH*((len(frames)+3)//4)),'#777777')
    for i,bg in enumerate(backgrounds):
        contact.paste(bg,((i%4)*CW,(i//4)*CH))
        ImageDraw.Draw(contact).text(((i%4)*CW+8,(i//4)*CH+8),str(i),fill='white')
    contact.save(folder/'contact.png')
    return {'file':str(target.relative_to(ROOT)),'sha256':sha(target),'sourceSha256':sha(folder/'source.png'),'frames':len(frames),'fps':fps,'loop':loop,'frameWidth':CW,'frameHeight':CH,'columns':COLS,'origin':[256,296],'supportFoot':[294,296],'scale':scale,'contactFrames':contacts,'frameData':report}

DEST.mkdir(parents=True,exist_ok=True)
idle = pack('idle',[(80,0,565,724),(605,0,1095,724),(1135,0,1627,724),(1680,0,2150,724)],[(438,696),(965,696),(1498,696),(2038,696)],200/636,6,True,[])
kick = pack('sparta-kick',[(12,0,377,512),(426,0,784,512),(794,0,1142,512),(1143,0,1536,512),(0,512,461,1024),(476,512,800,1024),(814,512,1165,1024),(1206,512,1536,1024)],[(280,492),(690,495),(1024,496),(1430,498),(330,996),(620,990),(1064,996),(1440,996)],200/460,12,False,[3,4])
manifest={'character':'Guerreiro','role':'NPC do Cartola / Fluminense','base':'referencia/fluminense/base-guerreiro-v2.png','baseSha256':sha(ROOT/'referencia/fluminense/base-guerreiro-v2.png'),'animations':[idle,kick],'status':'Arte revisada; aprovação do usuário e integração no jogo pendentes','anatomy':{'armA':'direito, lança','armB':'esquerdo, escudo','legA':'direita, executa chute','legB':'esquerda, apoio'},'trigger':'Somente acerto confirmado do pó de arroz que aplique stun; erro/esquiva/bloqueio não invoca chute','placement':'Motor posiciona Guerreiro atrás do alvo, no lado oposto ao Cartola, voltado ao alvo','sound':'Nenhum áudio ou texto; boca aberta nos quadros de golpe','singleHit':True}
(DEST/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
(OUT/'report.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
html='''<!doctype html><meta charset="utf-8"><title>Guerreiro — revisão</title><style>body{background:#222;color:white;font:16px sans-serif}img{image-rendering:pixelated;max-width:100%}section{margin:24px 0}</style><h1>Guerreiro — NPC</h1><p>Espera frontal e chute com grito visual. Arte; sem simulação de combate.</p>'''
for action in ['idle','sparta-kick']:
    html+=f'<section><h2>{action}</h2><img src="{action}/preview.gif"><img src="{action}/slow.gif"><details><summary>Quadros em escala real</summary><img src="{action}/contact.png"></details></section>'
(OUT/'revisao.html').write_text(html,encoding='utf-8')
print('Packed 2 RGBA sheets, 12 frames; manifest, GIFs and contacts saved.')
