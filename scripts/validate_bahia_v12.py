"""Verify installed, visually reviewed Bahia sheets without changing their art."""
import hashlib
import json
import sys
from pathlib import Path
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
from bahia_v12 import OUT, DEST, ROOT, bounds, rebuild_review

reports = [json.loads(p.read_text(encoding='utf-8')) for p in OUT.glob('*-report.json')]
reports = [r for r in reports if r['status'].startswith('installed')]
guard = Image.open(OUT / 'guard.png').convert('RGBA')
floating = Image.new('RGBA', (256, 256))
floating.alpha_composite(guard, (0, -8))
guardless = {'stunned', 'jump-kick', 'jump-punch', 'special'}
returning = {'hit-high', 'light-punch', 'heavy-punch', 'eye-laser', 'special', 'low-kick', 'dash-forward', 'dash-back'}
for r in reports:
    action = r['action']
    path = DEST / f'{action}.png'
    assert hashlib.sha256(path.read_bytes()).hexdigest() == r['sha256'], action
    sheet = Image.open(path)
    assert sheet.mode == 'RGBA', action
    assert sheet.size == (1280, 256 * ((r['frames'] + 4) // 5)), action
    frames = []
    for i in range(sheet.width // 256 * (sheet.height // 256)):
        frame = sheet.crop((i % 5 * 256, i // 5 * 256, (i % 5 + 1) * 256, (i // 5 + 1) * 256))
        if i >= r['frames']:
            assert frame.getchannel('A').getbbox() is None, (action, i, 'unused cell')
            continue
        box = bounds(frame)
        assert box[0] >= 2 and box[1] >= 2 and box[2] <= 254 and box[3] <= 254, (action, i, box)
        # The approved guard itself tops out at alpha 254; preserve that alpha.
        minimum, maximum = frame.getchannel('A').getextrema()
        assert minimum == 0 and maximum >= 254, (action, i)
        frames.append(frame)
    if action not in guardless:
        assert frames[0].tobytes() == floating.tobytes(), (action, 'first guard')
    if action in returning:
        assert frames[-1].tobytes() == floating.tobytes(), (action, 'last guard')
    if action in {'crouch', 'block-high', 'block-low', 'special-charge'}:
        assert frames[-1].tobytes() != floating.tobytes(), (action, 'hold')
    if action == 'crouch':
        box = bounds(frames[-1])
        assert box[3] - box[1] <= 130, (action, 'deep crouch')
    if action in {'stunned', 'jump-kick', 'jump-punch'}:
        assert all(f.tobytes() != floating.tobytes() for f in frames), (action, 'guard flash')
assert guard.tobytes() == Image.open(DEST / 'guard-reference.png').convert('RGBA').tobytes()
specs = json.loads((OUT / 'action-specs.json').read_text(encoding='utf-8'))
for r in reports:
    spec = specs[r['action']]
    for source, target in [('frames', 'n'), ('fps', 'fps'), ('calibration', 'calibration'), ('scale', 'scale'), ('sourceCount', 'sourceCount'), ('mode', 'mode'), ('sourceOffset', 'sourceOffset')]:
        if source in r:
            spec[target] = r[source]
    if 'sourceCount' in r:
        spec['total'] = r['sourceCount']
(OUT / 'action-specs.json').write_text(json.dumps(specs, ensure_ascii=False, indent=2), encoding='utf-8')
result = {'installedActions': len(reports), 'bodyFrames': sum(r['frames'] for r in reports),
          'allInstalledHashesMatch': True, 'rgba': True, 'cells256': True, 'columns': 5,
          'marginsVerified': True, 'unusedCellsEmpty': True, 'canonicalGuardUnchanged': True,
          'heldStatesVerified': True, 'visualCombatTest': False,
          'pending': [a for a in specs if a not in {r['action'] for r in reports}]}
(OUT / 'validation.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
rebuild_review()
print(json.dumps(result))
