"""Horizontal depth sweeps; assembly delegates to the reviewed v3 extractor."""
from pathlib import Path
import json,shutil,sys
import gremista_coesao_v3 as art
art.OUT=art.ROOT/'output/gremista-horizontais-v5'
art.DEST=art.ROOT/'public/assets/lutadores/mosqueteiro-gremio/horizontais-v5'
art.SPECS={a:art.SPECS[a] for a in ['low-kick','light-punch']}
def prepare():
 art.OUT.mkdir(parents=True,exist_ok=True)
 for a in art.SPECS:(art.OUT/a).mkdir(exist_ok=True)
 for name in ['guard.png','guard-magenta-source.png']:shutil.copy2(art.ROOT/'output/gremista-coesao-v3'/name,art.OUT/name)
 snapshot=art.OUT/'runtime-before.json'
 if not snapshot.exists():shutil.copy2(art.ROOT/'src/game/lutadores/mosqueteiro-gremio.json',snapshot)
def finalize():
 art.finalize()
 for path in [art.DEST/'manifest-art.json',art.OUT/'report.json']:
  d=json.loads(path.read_text(encoding='utf-8'));d['revision']=5;d['scope']='Horizontal edge sweeps from background toward camera';art.write(path,d)
 for name in ['viewer.js','revisao.html']:
  p=art.OUT/name;p.write_text(p.read_text(encoding='utf-8').replace('coesao-v3','horizontais-v5').replace('coesão v3','cortes horizontais v5'),encoding='utf-8')
def integrate():
 path=art.ROOT/'src/game/lutadores/mosqueteiro-gremio.json'
 before=json.loads((art.OUT/'runtime-before.json').read_text(encoding='utf-8'));current=json.loads(path.read_text(encoding='utf-8'));original={a['action']:a for a in before['actions']}
 for a in current['actions']:
  if a['action'] in art.SPECS:assert a==original[a['action']],'Affected action changed: inspect first'
 shutil.copy2(path,art.OUT/'runtime-integration-before.json')
 for a in current['actions']:
  if a['action'] in art.SPECS:
   r=json.loads((art.OUT/a['action']/'report.json').read_text());assert a['frames']==r['frames'] and a['frameRate']==r['fps'];a['file']='horizontais-v5/'+r['file']
 path.write_text(json.dumps(current,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print('Integrated only two image paths; mechanics/counts/FPS preserved')
if __name__=='__main__':
 cmd=sys.argv[1]
 if cmd=='prepare':prepare()
 elif cmd=='chroma':art.chroma(Path(sys.argv[2]),Path(sys.argv[3]))
 elif cmd=='inspect':
  im=art.Image.open(art.OUT/sys.argv[2]/'source.png').convert('RGBA');print(im.size,[p[1] for p in art.ordered(im,2)])
 elif cmd=='mount':art.mount(sys.argv[2])
 elif cmd=='finalize':finalize()
 elif cmd=='integrate':integrate()
