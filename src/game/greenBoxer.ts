import type { CharacterDefinition } from './hero';
import { buildFighterCharacter, rect, type FighterActionSpec } from './fighterCharacter';

export const GREEN_BOXER_CHARACTER_ID = 'green-boxer';

const GREEN_BOXER_ACTIONS: FighterActionSpec[] = [
  {
    action: 'idle',
    label: 'Idle',
    file: 'idle.png',
    frames: 12,
    frameRate: 8,
    repeat: -1,
    defaultVisual: rect(76, 28, 104, 204)
  },
  {
    action: 'walk-forward',
    label: 'Walk Forward',
    file: 'walk-forward.png',
    frames: 8,
    frameRate: 8,
    repeat: -1,
    defaultVisual: rect(72, 28, 112, 204)
  },
  {
    action: 'walk-backward',
    label: 'Walk Backward',
    file: 'walk-backward.png',
    frames: 8,
    frameRate: 8,
    repeat: -1,
    defaultVisual: rect(72, 28, 112, 204)
  },
  {
    action: 'crouch',
    label: 'Crouch',
    file: 'crouch.png',
    frames: 5,
    frameRate: 10,
    repeat: 0,
    defaultVisual: rect(72, 104, 112, 126)
  },
  {
    action: 'jump',
    label: 'Jump',
    file: 'jump.png',
    frames: 8,
    frameRate: 10,
    repeat: 0,
    defaultVisual: rect(70, 16, 116, 206)
  },
  {
    action: 'block-high',
    label: 'Block High',
    file: 'block-high.png',
    frames: 4,
    frameRate: 10,
    repeat: 0,
    defaultVisual: rect(76, 28, 104, 204),
    guard: rect(60, 44, 136, 116)
  },
  {
    action: 'block-low',
    label: 'Block Low',
    file: 'block-low.png',
    frames: 4,
    frameRate: 10,
    repeat: 0,
    defaultVisual: rect(72, 104, 112, 126),
    guard: rect(60, 110, 136, 120)
  },
  {
    action: 'hit-high',
    label: 'Hit High',
    file: 'hit-high.png',
    frames: 6,
    frameRate: 12,
    repeat: 0,
    defaultVisual: rect(72, 28, 112, 204)
  },
  {
    action: 'light-punch',
    label: 'Light Punch',
    file: 'light-punch.png',
    frames: 6,
    frameRate: 14,
    repeat: 0,
    defaultVisual: rect(60, 28, 128, 204),
    attack: { frames: [2, 3], bounds: rect(18, 84, 84, 46) }
  },
  {
    action: 'heavy-punch',
    label: 'Heavy Punch',
    file: 'heavy-punch.png',
    frames: 8,
    frameRate: 12,
    repeat: 0,
    defaultVisual: rect(52, 28, 148, 204),
    attack: { frames: [3, 4, 5], bounds: rect(14, 80, 92, 52) }
  },
  // Placeholder special "Rush Combo": reuses the crouch sheet for the wind-up
  // and the heavy punch sheet for the multi-hit flurry until bespoke art exists.
  {
    action: 'special-charge',
    label: 'Special Charge',
    file: 'crouch.png',
    frames: 5,
    frameRate: 14,
    repeat: 0,
    defaultVisual: rect(72, 104, 112, 126)
  },
  {
    action: 'special',
    label: 'Rush Combo',
    file: 'heavy-punch.png',
    frames: 8,
    frameRate: 16,
    repeat: 0,
    defaultVisual: rect(44, 28, 168, 204),
    attackSpans: [
      { frames: [1, 2], bounds: rect(10, 74, 110, 78) },
      { frames: [3, 4], bounds: rect(10, 74, 110, 78) },
      { frames: [5, 6], bounds: rect(10, 74, 110, 78) }
    ]
  },
  {
    action: 'knockdown',
    label: 'Knockdown',
    file: 'knockdown.png',
    frames: 10,
    frameRate: 10,
    repeat: 0,
    defaultVisual: rect(40, 150, 176, 80)
  }
];

export const GREEN_BOXER_CHARACTER: CharacterDefinition = buildFighterCharacter({
  id: GREEN_BOXER_CHARACTER_ID,
  label: 'Green Boxer',
  assetRoot: '/assets/lutadores/_amostra-green-boxer',
  anchorUsage: 'green boxer west-facing high-fidelity anchor',
  actions: GREEN_BOXER_ACTIONS
});
