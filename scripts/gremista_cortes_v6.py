"""Near-to-far sweeps, doubled in-betweens preserving absolute animation time."""
from pathlib import Path
import json,shutil,sys,math
import gremista_coesao_v3 as art
art.OUT=art.ROOT/'output/gremista-cortes-v6'
art.DEST=art.ROOT/'public/assets/lutadores/mosqueteiro-gremio/cortes-v6'
art.SPECS={'low-kick':(12,32,False),'light-punch':(16,40,False)}
def prepare():
 art.OUT.mkdir(parents=True,exist_ok=True)
 for a in art.SPECS:(art.OUT/a).mkdir(exist_ok=True)
 for name in ['guard.png','guard-magenta-source.png']:shutil.copy2(art.ROOT/'output/gremista-coesao-v3'/name,art.OUT/name)
 snapshot=art.OUT/'runtime-before.json'
 if not snapshot.exists():shutil.copy2(art.ROOT/'src/game/lutadores/mosqueteiro-gremio.json',snapshot)
def finalize():
 landmarks=json.loads((art.OUT/'blade-source-landmarks.json').read_text())['points'];orientation=[]
 for name,points in landmarks.items():
  angles=[]
  for tip,hilt in points:
   assert tip[0]<hilt[0],(name,tip,hilt)
   angles.append(math.degrees(math.atan2(tip[1]-hilt[1],tip[0]-hilt[0])))
  changes=[abs((b-a+180)%360-180) for a,b in zip(angles,angles[1:])];assert max(changes)<45,(name,changes)
  orientation.append({'action':name,'allTipsLeftOfOwnHilt':True,'maxConsecutiveAngleDegrees':max(changes),'manualSourceAnglesDegrees':angles})
 art.write(art.OUT/'orientation-review.json',orientation)
 art.finalize()
 for path in [art.DEST/'manifest-art.json',art.OUT/'report.json']:
  d=json.loads(path.read_text(encoding='utf-8'));d['revision']=6;d['scope']='Near-to-far anticipation; active far-to-near cuts with continuously left-pointing blade';art.write(path,d)
 for name in ['viewer.js','revisao.html']:
  p=art.OUT/name;p.write_text(p.read_text(encoding='utf-8').replace('coesao-v3','cortes-v6').replace('coesão v3','cortes fluidos v6'),encoding='utf-8')
def integrate():
 path=art.ROOT/'src/game/lutadores/mosqueteiro-gremio.json'
 before=json.loads((art.OUT/'runtime-before.json').read_text(encoding='utf-8'));current=json.loads(path.read_text(encoding='utf-8'));original={a['action']:a for a in before['actions']}
 for a in current['actions']:
  if a['action'] in art.SPECS:assert a==original[a['action']],'Affected action changed: inspect first'
 shutil.copy2(path,art.OUT/'runtime-integration-before.json')
 for a in current['actions']:
  if a['action'] in art.SPECS:
   r=json.loads((art.OUT/a['action']/'report.json').read_text());assert a['frames']*2==r['frames'] and a['frameRate']*2==r['fps']
   assert not a.get('timing'),'Review explicit timing before integrating'
   for window in [a.get('attack'),*a.get('attackSpans',[])]:
    if window:window['frames']=[v for f in window['frames'] for v in [f*2,f*2+1]]
   for window in [a.get('travel'),*a.get('recuo',[])]:
    if window:window['frames']=[window['frames'][0]*2,window['frames'][1]*2+1]
   a.update(file='cortes-v6/'+r['file'],frames=r['frames'],frameRate=r['fps'])
 for a in current['actions']:
  if a['action'] in art.SPECS:
   old=original[a['action']];assert old['frames']/old['frameRate']==a['frames']/a['frameRate']
   for ow,nw in zip(old.get('attackSpans',[]),a.get('attackSpans',[])):
    ot=(min(ow['frames'])/old['frameRate'],(max(ow['frames'])+1)/old['frameRate']);nt=(min(nw['frames'])/a['frameRate'],(max(nw['frames'])+1)/a['frameRate']);assert ot==nt and ow['bounds']==nw['bounds']
 art.write(art.OUT/'integration-report.json',{'actions':list(art.SPECS),'frames':28,'durationAndAttackTimesPreserved':True,'damageAndBoxesPreserved':True,'combatTested':False})
 path.write_text(json.dumps(current,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print('Integrated two sheets with doubled frames/FPS; total duration and active/travel times preserved')
if __name__=='__main__':
 cmd=sys.argv[1]
 if cmd=='prepare':prepare()
 elif cmd=='chroma':art.chroma(Path(sys.argv[2]),Path(sys.argv[3]))
 elif cmd=='mount':
  action=sys.argv[2];art.mount(action)
  # GIF only supports centiseconds. Distribute rounding instead of truncating
  # every25ms/31.25ms frame and accidentally speeding the whole preview up.
  f=art.OUT/action;r=json.loads((f/'report.json').read_text());frames=[]
  for i in range(r['frames']):
   fr=art.Image.open(f/f'frame-{i:02}.png').convert('RGBA');bg=art.Image.new('RGB',(640,384),'#777777');bg.paste(fr,mask=fr.getchannel('A'));frames.append(bg)
  elapsed=previous=0;durations=[]
  for ms in r['durationsMs']:
   elapsed+=ms;boundary=round(elapsed/10)*10;durations.append(boundary-previous);previous=boundary
  frames[0].save(f/'preview.gif',save_all=True,append_images=frames[1:],duration=durations,loop=0)
 elif cmd=='finalize':finalize()
 elif cmd=='integrate':integrate()
