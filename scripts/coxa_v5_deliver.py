"""Consolida as tres correcoes normais preservando as demais artes v4."""
from coxa_v5 import *
def deliver():
    old=ROOT/'public/assets/lutadores/coxa/revisao-v4'
    shutil.copytree(old,DEST,dirs_exist_ok=True)
    manifest=read(old/'manifest-art.json');manifest['version']=5
    manifest['revision']='Normal: repouso e caminhadas com pegadas nas duas manoplas e passos alternados.'
    manifest['previousVersion']='../revisao-v4/manifest-art.json'
    cards=[]
    names={'idle':'Postura parada','walk-forward':'Caminhada para frente','walk-backward':'Caminhada para trás'}
    for action,title in names.items():
        folder=OUT/'normal'/action;r=read(folder/'report.json');rig=read(folder/'attachments.json')
        entry=next(x for x in manifest['body'] if x['skin']=='normal' and x['action']==action)
        for source,key in [('aligned-body-sheet.png','body'),('composed-sheet.png','composed'),('attachments.json','rig')]:
            shutil.copy2(folder/source,DEST/entry[key])
        entry.update(source_sha256=r['source_sha256'],attachments=rig,references=r['references'],assemblySources=[],sourceRevision=5,status='Arte refeita e montada para revisão visual; integração de combate pendente.',visualBoxes=[list(Image.open(folder/f'composed-{i:02}.png').getbbox()) for i in range(r['frames'])])
        entry['assemblySources']=[{'frame':a['frame'],'source':a['bodySource'],'sha256':a['bodySource_sha256'],'sourceFrame':a['bodySourceFrame']} for a in rig]
        entry['body_sha256']=sha(DEST/entry['body']);entry['composed_sha256']=sha(DEST/entry['composed'])
        cards.append(f'<article><h2>{title}</h2><p>{r["frames"]} quadros · {r["fps"]} FPS · duas mãos nas manoplas</p><canvas id="{action}" width="480" height="480"></canvas><p><button onclick="step(\'{action}\',-1)">◀</button> <button onclick="toggle(\'{action}\')">Pausar / reproduzir</button> <button onclick="step(\'{action}\',1)">▶</button> <span id="n-{action}"></span></p><details><summary>Ver todos os quadros</summary><img class="contact" src="normal/{action}/composed-contact.png"></details><a href="normal/{action}/composed-preview.gif">Abrir GIF</a> · <a href="normal/{action}/composed-sheet.png">Folha com andador</a> · <a href="normal/{action}/aligned-body-sheet.png">Corpo separado</a></article>')
    save(DEST/'manifest-art.json',manifest);save(OUT/'manifest-art.json',manifest)
    config={x:{'n':read(OUT/'normal'/x/'report.json')['frames'],'fps':read(OUT/'normal'/x/'report.json')['fps']} for x in names}
    page='''<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Coxa normal — apoio e caminhadas v5</title><style>body{background:#20252b;color:#f1f2ed;font:16px system-ui;max-width:1100px;margin:32px auto;padding:0 20px}h1{font-size:28px}main{display:flex;flex-wrap:wrap;gap:20px}article{background:#303740;border-radius:12px;padding:16px;flex:1 1 460px}canvas{width:100%;max-width:768px;image-rendering:pixelated;background:repeating-conic-gradient(#363d46 0% 25%,#3e4650 0% 50%) 0/20px 20px}.contact{width:100%;image-rendering:pixelated}a{color:#9ee0b5}button,select{font:inherit;padding:6px;margin:3px}details{margin:15px 0}</style><h1>Coxa normal — postura e passos refeitos</h1><p>Duas mãos envolvendo as manoplas. Passos com elevação dos pés, passagem e troca de apoio. O andador é a mesma imagem rígida em todos os quadros.</p><p>Velocidade: <select id="speed"><option value="1">Normal</option><option value="0.5">Metade</option><option value="0.25">Um quarto</option></select> · <a href="coxa-revisao-v5.zip">Baixar pacote completo atualizado</a></p><main>'''+''.join(cards)+'''</main><p>20 quadros refeitos nesta revisão. Pacote consolidado: 36 ações, 232 quadros corporais; demais ações e efeitos preservados da v4. Arte ainda sem registro do lutador no jogo.</p><script>const cfg='''+json.dumps(config)+''';const states={};for(const [id,c]of Object.entries(cfg)){const im=new Image();im.src='normal/'+id+'/composed-sheet.png';states[id]={...c,im,i:0,play:true,t:0};}function draw(id){const s=states[id],c=document.getElementById(id).getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,480,480);if(s.im.complete)c.drawImage(s.im,(s.i%5)*512+190,Math.floor(s.i/5)*320+70,240,240,0,0,480,480);document.getElementById('n-'+id).textContent=(s.i+1)+' / '+s.n}function step(id,d){const s=states[id];s.play=false;s.i=(s.i+d+s.n)%s.n;draw(id)}function toggle(id){states[id].play=!states[id].play}function tick(t){const speed=+document.getElementById('speed').value;for(const[id,s]of Object.entries(states)){if(s.play&&t-s.t>=1000/s.fps/speed){s.i=(s.i+1)%s.n;s.t=t}draw(id)}requestAnimationFrame(tick)}requestAnimationFrame(tick);</script></html>'''
    (OUT/'revisao.html').write_text(page,encoding='utf-8')
    with zipfile.ZipFile(OUT/'coxa-revisao-v5.zip','w',zipfile.ZIP_DEFLATED) as z:
        for p in DEST.rglob('*'):
            if p.is_file():z.write(p,p.relative_to(DEST))
    print(json.dumps({'actions':manifest['bodyActions'],'frames':manifest['bodyFrames'],'replaced':list(names),'gallery':str(OUT/'revisao.html')}))
if __name__=='__main__':deliver()
