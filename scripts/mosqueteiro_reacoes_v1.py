"""Extend the existing packer: whole-sprite assembly and delivery metadata only."""
import json
import shutil
from PIL import Image, ImageDraw
import mosqueteiro_v1 as m

SPECS = {'hit-high': (6, 12, False), 'stunned': (4, 6, True), 'knockdown': (10, 10, False)}


def write(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding='utf-8')


def finish_frames(name):
    folder = m.OUT/name
    r = json.loads((folder/'report.json').read_text(encoding='utf-8'))
    frames = [Image.open(folder/f'frame-{i}.png').convert('RGBA') for i in range(r['frames'])]
    if name == 'hit-high':
        # Canonical guard closes both transitions without repainting any pixels.
        frames[0] = Image.open(m.OUT/'idle/frame-0.png').convert('RGBA')
        frames[-1] = frames[0].copy()
    if name == 'knockdown':
        frames[0] = Image.open(m.OUT/'idle/frame-0.png').convert('RGBA')
        # Explicitly requested still hold, not a replacement for a moving pose.
        frames[9] = frames[8].copy()
    excluded = {'action','frames','fps','columns','cell','frameBounds','sha256','reviewed','runtimeModified'}
    extra = {k:v for k,v in r.items() if k not in excluded}
    extra.update(loop=SPECS[name][2], bodyRootLocal=[320,296])
    if name == 'hit-high': extra['canonicalGuardFrames'] = [0,5]
    if name == 'knockdown':
        extra.update(canonicalGuardFrames=[0], groundContactFrame=5, supineFrame=8, stillFrames=[8,9], holdLastFrame=True)
    for i,f in enumerate(frames): f.save(folder/f'frame-{i}.png')
    m.save(name, frames, r['fps'], extra)
    # Both backgrounds at real export scale, with canonical guard alongside each pose.
    board = Image.new('RGB', (1280, 320*len(frames)), '#eeeeee')
    guard = Image.open(m.OUT/'idle/frame-0.png').convert('RGBA')
    for i,f in enumerate(frames):
        for j,color in enumerate(('#eeeeee','#202830')):
            tile=Image.new('RGB',(640,320),color)
            tile.paste(guard,(-160,0),guard)
            tile.paste(f,(100,0),f)
            ImageDraw.Draw(tile).text((8,8),f'idle | {name} {i}',fill='#888888')
            board.paste(tile,(640*j,320*i))
    board.save(folder/'guard-comparison.png')


def deliver():
    plan=json.loads((m.OUT/'plan.json').read_text(encoding='utf-8'))
    for name,(n,fps,loop) in SPECS.items():
        r=json.loads((m.OUT/name/'report.json').read_text(encoding='utf-8'))
        assert (r['frames'],r['fps'],r['loop']) == (n,fps,loop)
        assert r['reviewed']
        plan['mosqueteiro'][name]=n
        refs=[]
        for p,role in [('output/mosqueteiro-v1/guard.png','approved palette, scale, lighting and costume'),('referencia/corinthians/base-mosqueteiro-v6.png','identity detail')]:
            refs.append({'file':p,'sha256':m.sha(m.ROOT/p),'role':role})
        ficha={'action':name,'baselineReferences':refs,'limbContinuity':'A anatomical right sword arm and near rear leg; B left free arm and far forward leg. Same hand and belt attachments throughout.',
               'frames':n,'fps':fps,'loop':loop,'cell':[640,320],'columns':5,'bodyRootLocal':[320,296],
               'scale':r['scale'],'scalePolicy':'One uniform nearest-neighbor scale per action; canonical idle at guard transitions; no painting or per-pose resizing.',
               'sourceSha256':r['sourceSha256'],'promptSha256':m.sha(m.OUT/name/'prompt.txt'),
               'finalSha256':r['sha256'],'reviewNotes':r['reviewNotes'],'runtimeModified':False}
        write(m.OUT/name/'ficha.json',ficha)
    write(m.OUT/'plan.json',plan)
    m.verify()
    validation=json.loads((m.OUT/'validation.json').read_text(encoding='utf-8'))
    guard=Image.open(m.OUT/'idle/frame-0.png').convert('RGBA')
    details={}
    for name,(n,fps,loop) in SPECS.items():
        frames=[Image.open(m.OUT/name/f'frame-{i}.png').convert('RGBA') for i in range(n)]
        assert all(m.bounds(f)[3]==296 for f in frames), (name,'ground baseline')
        if name=='hit-high': assert frames[0].tobytes()==frames[5].tobytes()==guard.tobytes()
        if name=='knockdown': assert frames[8].tobytes()==frames[9].tobytes()
        gif=Image.open(m.OUT/name/'preview.gif')
        assert (gif.info.get('loop')==0)==loop, (name,'preview repetition')
        details[name]={'frames':n,'fps':fps,'loop':loop,'groundY':296,'bodyRootLocal':[320,296],
                       'sourceAndFramesVisuallyReviewed':True,'lightAndDarkGuardComparison':True}
    validation.update(reactions=details,canonicalHitHighGuard=True,knockdownFinalFramesIdentical=True,
                      combatTested=False,userApproved=False)
    write(m.OUT/'validation.json',validation)
    rows=json.loads((m.OUT/'manifest.json').read_text(encoding='utf-8'))
    contract=json.loads((m.DEST/'claude-integration.json').read_text(encoding='utf-8'))
    contract['production'].update(actions=len(rows),frames=sum(r['frames'] for r in rows))
    contract['sheets']=[s for s in contract['sheets'] if s['action'] not in SPECS]
    for r in rows:
        name=r['action']
        if name not in SPECS: continue
        contract['sheets'].append(dict(action=name,file=r['asset'].replace('\\','/'),frames=r['frames'],fps=r['fps'],loop=r['loop'],columns=5,
            frameWidth=640,frameHeight=320,bodyRootLocal=[320,296],frameVisualBounds=r['frameBounds'],sha256=r['sha256'],sourceSha256=r['sourceSha256']))
    contract['mosqueteiro'].update({
        'hit-high':{'frames':6,'fps':12,'loop':False,'endState':'idle','canonicalGuardFrames':[0,5],'feetGrounded':True},
        'stunned':{'frames':4,'fps':6,'loop':True,'feetGrounded':True,'effects':False,'weaponHand':'anatomical right'},
        'knockdown':{'frames':10,'fps':10,'loop':False,'groundContactFrame':5,'backGroundContactFrame':7,'supineFrame':8,'stillFrames':[8,9],'holdLastFrame':True,'endState':'supine on ground','groundY':296}})
    write(m.OUT/'claude-integration.json',contract)
    for name in ['manifest.json','validation.json','claude-integration.json']:
        shutil.copy2(m.OUT/name,m.DEST/name)
    # Existing player treats all old clips as loops; new reactions respect their contract.
    path=m.OUT/'revisao.html'
    html=path.read_text(encoding='utf-8').replace('frame=(frame+1)%row.frames;', 'frame=row.loop===false?Math.min(frame+1,row.frames-1):(frame+1)%row.frames;')
    path.write_text(html,encoding='utf-8')


if __name__ == '__main__':
    import sys
    if sys.argv[1]=='deliver': deliver()
    else: finish_frames(sys.argv[1])
