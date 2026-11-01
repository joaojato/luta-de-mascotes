from pathlib import Path
from PIL import Image
import json,shutil,hashlib,zipfile,math
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'output/coxa-v4';DEST=ROOT/'public/assets/lutadores/coxa/revisao-v4';OLD=ROOT/'output/coxa-rigido-v1'
def data(p):return json.loads(p.read_text(encoding='utf-8'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
ms=data(OUT/'manifest.json');DEST.mkdir(parents=True,exist_ok=True)
priority={('normal','light-punch'):0,('normal','special-transform'):1,('normal','beer-throw'):2,('normal','low-kick'):3}
ms.sort(key=lambda m:(priority.get((m['skin'],m['action']),4),m['skin']!='normal',m['action']))
for m in ms:
    folder=OUT/m['skin']/m['sourceAction'];target=DEST/m['skin'];target.mkdir(exist_ok=True);r=data(folder/'report.json');body=folder/'aligned-body-sheet.png'
    if not body.exists():body=folder/'sheet.png'
    base=m['action'];shutil.copy2(body,target/(base+'-body.png'));shutil.copy2(folder/'composed-sheet.png',target/(base+'-composed.png'));shutil.copy2(folder/'attachments.json',target/(base+'-rig.json'))
    m.update(body=f'{m["skin"]}/{base}-body.png',composed=f'{m["skin"]}/{base}-composed.png',rig=f'{m["skin"]}/{base}-rig.json',bodyAlreadyAligned=True,body_sha256=sha(body),composed_sha256=sha(folder/'composed-sheet.png'),references=r.get('references',[]),assemblySources=r.get('assemblySources',[]),status='arte para revisão do usuário; sem registro nem teste em combate')
    m['visualBoxes']=[Image.open(folder/f'composed-{i:02}.png').getbbox() for i in range(m['frames'])]
    if (folder/'props.json').exists():shutil.copy2(folder/'props.json',target/(base+'-props.json'));m['props']=f'{m["skin"]}/{base}-props.json'
objdest=DEST/'objetos';objdest.mkdir(exist_ok=True);views=[]
for name in ('andador.png','andador-lateral.png'):
    p=OUT/'objetos'/name;shutil.copy2(p,objdest/name);views.append({'file':'objetos/'+name,'size':Image.open(p).size,'sha256':sha(p),'structure':'4 pernas / 4 ponteiras / 2 arcos / 1 barra'})
effects=[]
for action,source in [('beer-can','beer-can-spin'),('beer-drops','beer-drops-v4')]:
    folder=OUT/'efeitos'/source;target=DEST/'efeitos';target.mkdir(exist_ok=True);shutil.copy2(folder/'sheet.png',target/(action+'.png'));r=data(folder/'report.json');effects.append({'action':action,'file':'efeitos/'+action+'.png','frames':r['frames'],'cell':r['cell'],'columns':5,'fpsProposed':r['fps'],'source':str(folder.relative_to(ROOT)).replace('\\','/')})
shutil.copy2(OUT/'efeitos/latinha.png',DEST/'efeitos/latinha.png');shutil.copy2(OUT/'beer-emitter.json',DEST/'efeitos/beer-emitter.json');previews=DEST/'previews';previews.mkdir(exist_ok=True);shutil.copy2(OUT/'beer-flight.gif',previews/'beer-flight.gif');shutil.copy2(OUT/'beer-scale.png',previews/'beer-scale.png')
manifest={'version':4,'bodyActions':36,'bodyFrames':232,'body':ms,'objectViews':views,'effects':effects,'pending':['pesado maromba','rasteiro maromba','volta ao normal'],'runtimeIntegrated':False}
(DEST/'manifest-art.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
cards=[]
labels={('normal','light-punch'):'Rápido normal — duas estocadas com as ponteiras',('normal','special-transform'):'Transformação — apoio, B2 e transporte baixo de lado'}
for m in ms:
    rel=f'{m["skin"]}/{m["sourceAction"]}';name=labels.get((m['skin'],m['action']),f'{m["skin"]} / {m["action"]}');cards.append(f'<article><h2>{name}</h2><img loading="lazy" src="{rel}/composed-preview.gif"><p>{m["frames"]} quadros · {m["fpsProposed"]} FPS propostos</p><a href="{rel}/composed-contact.png">Quadro a quadro com andador</a> · <a href="{rel}/composed-sheet.png">Folha transparente montada</a></article>')
page='<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Coxa — conjunto v4</title><style>body{background:#181c22;color:#eee;font:16px system-ui;margin:30px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(440px,1fr));gap:18px}article{background:#292e38;padding:16px}h2{font-size:19px}img{width:100%;max-width:768px;image-rendering:pixelated}a{color:#a7daff}</style><h1>Coxa — conjunto v4 com andador</h1><p>36 ações / 232 quadros. Rápido normal: levantar as mãos e dar duas estocadas com as ponteiras. Maromba: repouso baixo, curvas à esquerda e pernas à direita, conforme base v9.</p><article><h2>Latinha redesenhada e gotas durante o voo</h2><img style="max-width:1024px" src="beer-flight.gif"><p>Lata nativa 8×14 px para corpo de aproximadamente200 px; gotas de1–3 px. Prévia do emissor em escala de jogo.</p><a href="beer-flight.gif">Abrir prévia em1×</a> · <a href="beer-scale.png">Conferir tamanho na mão e detalhe8×</a> · <a href="beer-emitter.json">Guia do emissor</a></article><p>Duas vistas fixas: <a href="objetos/andador.png">vertical original</a> · <a href="objetos/andador-lateral.png">lateral completa</a>. No rápido usa-se apenas o modelo padrão girado inteiro. As partes ocultas pelo corpo continuam na camada do objeto. <a href="coxa-revisao-v4.zip">Pacote de sprites</a>.</p><p>Prévias para revisão. Sem integração em combate; pesado/rasteiro maromba e volta ao normal aguardam definição.</p><main>'+''.join(cards)+'</main></html>'
(OUT/'revisao.html').write_text(page,encoding='utf-8')
with zipfile.ZipFile(OUT/'coxa-revisao-v4.zip','w',zipfile.ZIP_DEFLATED) as z:
    for p in DEST.rglob('*'):
        if p.is_file():z.write(p,p.relative_to(DEST))
print('Entregues 36 folhas corporais / 232 quadros, duas vistas rígidas e dois efeitos. Sem alterações de runtime.')
