"""Corpos inteiros ancorados no chao; apoio no mundo derivado da pegada desenhada."""
from coxa_v6 import *
def finish(action,bodies,frames,rig):
    folder=OUT/'normal'/action;sheet=Image.new('RGBA',(2560,960))
    for i,b in enumerate(bodies):sheet.alpha_composite(b,(i%5*512,i//5*320));b.save(folder/f'aligned-body-{i:02}.png')
    sheet.save(folder/'aligned-body-sheet.png');outputs(folder,frames,10);save(folder/'attachments.json',rig)
    delta=rig[-1]['rootX'];previews=[]
    for cycle in range(3):
        for i,(cell,p) in enumerate(zip(frames,rig)):
            bg=Image.new('RGBA',(512,340),'#303740');d=ImageDraw.Draw(bg);d.line((0,293,512,293),fill='#87908a')
            for x in range(0,512,18):d.line((x,294,x,300),fill='#87908a')
            bg.alpha_composite(cell,(40+cycle*delta+p['rootX'],0));d.text((15,315),str(i)+' | '+p['phase'],fill='#fff');previews.append(bg.convert('RGB').resize((1024,680),Image.Resampling.NEAREST))
    previews[0].save(folder/'world-preview.gif',save_all=True,append_images=previews[1:],duration=100,loop=0)
    save(folder/'motion-guide.json',{'action':action,'frames':12,'fpsProposed':10,'cycleDisplacementX':delta,'rootTrack':rig,'integration':'Respeitar rootX por fase para manter andador plantado no mundo. Nao somar velocidade constante sem compensar as ancoras. Escala corporal e do deslocamento uniformes. Sem integracao de combate.'})
def build():
    action='walk-forward';folder=OUT/'normal'/action;r=read(folder/'report.json');c=read(OUT/'anchors.json')[action];guide=read(OUT/'choreography.json')[action]
    objpath=ROOT/'output/coxa-v4/objetos/andador.png';obj=Image.open(objpath).convert('RGBA');base=point(r,0,c['far'][0]);dx=round(241-base[0]);bodies=[];frames=[];rig=[];plant=None
    for i,p in enumerate(guide):
        if i==9:p={**p,'phase':'passo A avanca'}
        if i==10:p={**p,'phase':'passo A pousa'}
        j=0 if i==11 else i;raw=Image.open(folder/f'frame-{j:02}.png').convert('RGBA');dy=292-raw.getbbox()[3]
        body=Image.new('RGBA',(512,320));body.alpha_composite(raw,(dx,dy));a=point(r,j,c['far'][j]);b=point(r,j,c['near'][j]);hands=[[a[0]+dx,a[1]+dy],[b[0]+dx,b[1]+dy]]
        origin=[round(hands[0][0]-24),p['walkerOrigin'][1]]
        if i==3:plant=origin[0]
        root=0 if i<3 else plant-origin[0]
        layer=Image.new('RGBA',body.size);layer.paste(obj,tuple(origin));cell=body.copy();cell.alpha_composite(layer)
        for x,y in hands:
            for box in [(round(x-6),round(y-5),round(x+7),round(y-1)),(round(x-5),round(y+3),round(x+6),round(y+6))]:cell.alpha_composite(body.crop(box),(box[0],box[1]))
        layer.save(folder/f'walker-layer-{i:02}.png');bodies.append(body);frames.append(cell)
        rig.append({'frame':i,'phase':p['phase'],'rootX':root,'origin':origin,'walkerOrigin':origin,'walkerWorldX':origin[0]+root,'walkerGrounded':origin[1]==192,'rotation':0,'scale':1,'object':'objetos/andador.png','object_sha256':sha(objpath),'hands':{'right-far':hands[0],'left-near':hands[1]},'bodyOffset':[dx,dy],'source_sha256':r['source_sha256'],'bodySource':str((folder/'source.png').relative_to(ROOT)),'bodySourceFrame':j,'guardReturn':i==11})
    finish(action,bodies,frames,rig)
    action='walk-backward';back=OUT/'normal'/action
    if not (back/'rejected-source.png').exists():
        shutil.copy2(back/'source.png',back/'rejected-source.png');shutil.copy2(back/'report.json',back/'rejected-report.json')
    shutil.copy2(folder/'source.png',back/'source.png')
    for name in ['prompt.txt','spec.json']:
        rejected=back/('rejected-'+name)
        if not rejected.exists():shutil.copy2(back/name,rejected)
    (back/'prompt.txt').write_text('Montagem por reversao integral de walk-forward, preservando membros, pegadas e curvas de apoio. Fonte generativa: ../walk-forward/source.png; prompt de geracao em ../walk-forward/prompt.txt. A ultima pose do avanco retorna intencionalmente ao quadro 0. O estudo generativo direto foi rejeitado e preservado em rejected-source.png.',encoding='utf-8')
    report={**r,'action':action,'source':str((back/'source.png').relative_to(ROOT)),'assemblyMode':'Reversao integral do ciclo de apoio: dois passos para tras e depois recolher andador.','sourceFrameOrder':list(reversed(range(12)))};save(back/'report.json',report)
    save(back/'spec.json',{'skin':'normal','action':action,'frames':12,'fps':10,'assemblyMode':report['assemblyMode'],'sourceAction':'walk-forward','sourceFrameOrder':list(reversed(range(12)))})
    phases=['apoio','passo A sai','passo A no ar','passo A recua','passo A pousa','passo B sai','passo B no ar','passo B pousa','apoio','recolhe andador','aproxima andador','planta andador'];delta=rig[-1]['rootX'];backrig=[]
    for i,j in enumerate(reversed(range(12))):
        a=rig[j];root=a['rootX']-delta;backrig.append({**a,'frame':i,'phase':phases[i],'rootX':root,'walkerWorldX':a['origin'][0]+root,'reversedFromForwardFrame':j})
        shutil.copy2(folder/f'walker-layer-{j:02}.png',back/f'walker-layer-{i:02}.png')
    finish(action,list(reversed(bodies)),list(reversed(frames)),backrig)
if __name__=='__main__':build()
