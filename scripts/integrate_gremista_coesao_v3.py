"""Apply reviewed animation metadata; preserve existing combat/NPC configuration."""
from pathlib import Path
import copy,json,hashlib
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/gremista-coesao-v3'
runtime=ROOT/'src/game/lutadores/mosqueteiro-gremio.json'
before=json.loads((OUT/'runtime-before.json').read_text(encoding='utf-8-sig'))
current=json.loads(runtime.read_text(encoding='utf-8-sig'))
assert current==before,'Runtime changed since audit; inspect before overwriting'
labels=['Guarda','Andar para frente','Recuar','Avanço rápido','Recuo rápido','Agachar','Salto','Defesa alta','Defesa baixa','Receber golpe','Atordoado','Queda','Chamar Flecha Negra','Dois cortes rápidos','Corte descendente','Duas pistolas','Corte na canela','Corte no ar','Estocada no ar']
manifest=json.loads((ROOT/'public/assets/lutadores/mosqueteiro-gremio/coesao-v3/manifest-art.json').read_text(encoding='utf-8'))
assert not manifest['missing'] and len(manifest['animations'])==19
result=copy.deepcopy(current);old={a['action']:a for a in current['actions']};actions=[]
for r,label in zip(manifest['animations'],labels):
 name=r['action'];a=copy.deepcopy(old.get(name,{}))
 if not a:
  a={'action':name,'defaultVisual':{'x':230,'y':160,'width':165,'height':200}}
  if name.startswith('jump-'):
   a['defaultVisual']={'x':260,'y':155,'width':140,'height':180}
   # Seed boxes only for newly added aerial actions, as required by registry.
   # Existing ground hitboxes/travel and all balance remain unchanged.
   if name=='jump-punch':a['attack']={'frames':[2,3],'bounds':{'x':190,'y':185,'width':85,'height':120}}
   else:a['attack']={'frames':[2,3],'bounds':{'x':170,'y':260,'width':80,'height':70}}
 a.update(label=label,file='coesao-v3/'+r['file'],frames=r['frames'],frameWidth=640,frameHeight=384,frameRate=r['fps'],repeat=r['repeat'])
 if name=='shot':a['timing']=[{'frames':[i,i],'ms':ms} for i,ms in enumerate(r['durationsMs'])]
 actions.append(a)
result['actions']=actions
assert result['moves']==before['moves'] and result['combat']==before['combat'] and result['stats']==before['stats']
runtime.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(OUT/'integration-report.json').write_text(json.dumps({'runtime':runtime.relative_to(ROOT).as_posix(),'actions':len(actions),'frames':sum(a['frames'] for a in actions),'combatAndNpcConfigUnchanged':True,'existingAttackGuardTravelBoxesUnchanged':True,'newAerialBoxes':'Seeded for registry; refine in Academia','runtimeSha256':hashlib.sha256(runtime.read_bytes()).hexdigest(),'combatTested':False},ensure_ascii=False,indent=2),encoding='utf-8')
print('Integrated 19 animations / 122 frames; existing combat and NPC configuration preserved')
