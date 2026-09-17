import type { ImageAsset, SpritesheetAsset } from './assets';
import type { CharacterDefinition, HeroAnimationDefinition, HeroBoundsFrame } from './hero';
import type { Rect } from './types';

const FRAME_WIDTH = 256;
const FRAME_HEIGHT = 256;
const SHEET_BASE = {
  kind: 'spritesheet' as const,
  frameWidth: FRAME_WIDTH,
  frameHeight: FRAME_HEIGHT,
  margin: 0,
  spacing: 0
};

const WEST_ANCHOR = { x: 0.5, y: 0.99609375 };
const WEST_ANCHOR_PIXELS = { x: 128, y: 255 };

const ASSET_ROOT = '/assets/lutadores/_amostra-red-brawler';

export const RED_BRAWLER_CHARACTER_ID = 'red-brawler';

export const RED_BRAWLER_ANIMATION_KEYS = {
  idle: 'red-brawler-idle',
  walkForward: 'red-brawler-walk-forward',
  walkBackward: 'red-brawler-walk-backward',
  crouch: 'red-brawler-crouch',
  jump: 'red-brawler-jump',
  blockHigh: 'red-brawler-block-high',
  blockLow: 'red-brawler-block-low',
  hitHigh: 'red-brawler-hit-high',
  lightPunch: 'red-brawler-light-punch',
  heavyKick: 'red-brawler-heavy-kick',
  specialCharge: 'red-brawler-special-charge',
  special: 'red-brawler-special',
  knockdown: 'red-brawler-knockdown'
} as const;

export const RED_BRAWLER_ANCHOR_ASSET: ImageAsset = {
  kind: 'image',
  key: 'red-brawler-anchor-w',
  url: `${ASSET_ROOT}/anchor-w.png`,
  width: 1024,
  height: 1024,
  usage: 'red-jacket brawler west-facing high-fidelity anchor'
};

export const RED_BRAWLER_PORTRAIT_ASSET: ImageAsset = {
  kind: 'image',
  key: 'red-brawler-portrait',
  url: `${ASSET_ROOT}/portrait.png`,
  width: 1254,
  height: 1254,
  usage: 'red brawler character-select portrait'
};

/**
 * Per-action authoring metadata: spritesheet key, file, frame count, playback
 * rate, a default visual bounding box, and optional attack-active frames.
 */
interface RedBrawlerActionSpec {
  key: string;
  action: string;
  label: string;
  file: string;
  frames: number;
  frameRate: number;
  repeat: number;
  defaultVisual: Rect;
  attack?: { frames: number[]; bounds: Rect };
  /** Multiple attack windows in one animation (specials); each lands its own hit. */
  attackSpans?: { frames: number[]; bounds: Rect }[];
  guard?: Rect;
}

const RED_BRAWLER_ACTIONS: RedBrawlerActionSpec[] = [
  {
    key: RED_BRAWLER_ANIMATION_KEYS.idle,
    action: 'idle',
    label: 'Idle',
    file: 'idle.png',
    frames: 12,
    frameRate: 8,
    repeat: -1,
    defaultVisual: rect(76, 28, 104, 204)
  },
  {
    key: RED_BRAWLER_ANIMATION_KEYS.walkForward,
    action: 'walk-forward',
    label: 'Walk Forward',
    file: 'walk-forward.png',
    frames: 8,
    frameRate: 8,
    repeat: -1,
    defaultVisual: rect(72, 28, 112, 204)
  },
  {
    key: RED_BRAWLER_ANIMATION_KEYS.walkBackward,
    action: 'walk-backward',
    label: 'Walk Backward',
    file: 'walk-backward.png',
    frames: 8,
    frameRate: 8,
    repeat: -1,
    defaultVisual: rect(72, 28, 112, 204)
  },
  {
    key: RED_BRAWLER_ANIMATION_KEYS.crouch,
    action: 'crouch',
    label: 'Crouch',
    file: 'crouch.png',
    frames: 5,
    frameRate: 10,
    repeat: 0,
    defaultVisual: rect(72, 104, 112, 126)
  },
  {
    key: RED_BRAWLER_ANIMATION_KEYS.jump,
    action: 'jump',
    label: 'Jump',
    file: 'jump.png',
    frames: 8,
    frameRate: 10,
    repeat: 0,
    defaultVisual: rect(70, 16, 116, 206)
  },
  {
    key: RED_BRAWLER_ANIMATION_KEYS.blockHigh,
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
    key: RED_BRAWLER_ANIMATION_KEYS.blockLow,
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
    key: RED_BRAWLER_ANIMATION_KEYS.hitHigh,
    action: 'hit-high',
    label: 'Hit High',
    file: 'hit-high.png',
    frames: 6,
    frameRate: 12,
    repeat: 0,
    defaultVisual: rect(72, 28, 112, 204)
  },
  {
    key: RED_BRAWLER_ANIMATION_KEYS.lightPunch,
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
    key: RED_BRAWLER_ANIMATION_KEYS.heavyKick,
    action: 'heavy-kick',
    label: 'Heavy Kick',
    file: 'heavy-kick.png',
    frames: 10,
    frameRate: 12,
    repeat: 0,
    defaultVisual: rect(48, 28, 152, 204),
    attack: { frames: [4, 5, 6], bounds: rect(10, 96, 100, 58) }
  },
  // Special "Cyclone Uppercut": a rising spinning uppercut. The charge is the
  // loaded wind-up; the execution rises through three rotating hits (the last is
  // the launching finisher). Attack spans skip the early load + a transitional
  // frame; refine bounds in the Character Gym.
  {
    key: RED_BRAWLER_ANIMATION_KEYS.specialCharge,
    action: 'special-charge',
    label: 'Special Charge',
    file: 'special-charge.png',
    frames: 5,
    frameRate: 14,
    repeat: 0,
    defaultVisual: rect(64, 80, 128, 150)
  },
  {
    key: RED_BRAWLER_ANIMATION_KEYS.special,
    action: 'special',
    label: 'Cyclone Uppercut',
    file: 'special.png',
    frames: 12,
    frameRate: 16,
    repeat: 0,
    defaultVisual: rect(36, 20, 184, 212),
    // Three rising hits. Each span is separated by an inactive frame so the hit
    // window re-opens (the engine re-arms a swing only on an inactive->active
    // transition); contiguous frames would otherwise register a single hit.
    // The finisher span is a single frame so it carries the "no frames after"
    // finisher flag.
    attackSpans: [
      { frames: [4, 5], bounds: rect(20, 80, 112, 110) },
      { frames: [7, 8], bounds: rect(20, 48, 112, 120) },
      { frames: [10], bounds: rect(20, 22, 112, 130) }
    ]
  },
  {
    key: RED_BRAWLER_ANIMATION_KEYS.knockdown,
    action: 'knockdown',
    label: 'Knockdown',
    file: 'knockdown.png',
    frames: 10,
    frameRate: 10,
    repeat: 0,
    defaultVisual: rect(40, 150, 176, 80)
  }
];

export const RED_BRAWLER_SPRITESHEETS: SpritesheetAsset[] = RED_BRAWLER_ACTIONS.map((spec) =>
  sheet(spec.key, `${ASSET_ROOT}/${spec.file}`, spec.frames)
);

export const RED_BRAWLER_ANIMATIONS: HeroAnimationDefinition[] = RED_BRAWLER_ACTIONS.map((spec) =>
  makeAnimation(spec)
);

export const RED_BRAWLER_CHARACTER: CharacterDefinition = {
  id: RED_BRAWLER_CHARACTER_ID,
  label: 'Red Brawler',
  role: 'player',
  anchor: WEST_ANCHOR,
  anchorPixels: WEST_ANCHOR_PIXELS,
  animations: RED_BRAWLER_ANIMATIONS,
  anchorAsset: RED_BRAWLER_ANCHOR_ASSET,
  portrait: RED_BRAWLER_PORTRAIT_ASSET,
  assets: [RED_BRAWLER_ANCHOR_ASSET, RED_BRAWLER_PORTRAIT_ASSET, ...RED_BRAWLER_SPRITESHEETS]
};

/**
 * Build a spritesheet asset descriptor with the shared 256x256 frame layout.
 */
function sheet(key: string, url: string, frames: number): SpritesheetAsset {
  return {
    ...SHEET_BASE,
    key,
    url,
    frames
  };
}

/**
 * Build a hero animation definition from an action spec, deriving placeholder
 * collision/hit boxes from the default visual box and seeding attack boxes on
 * the spec's active frames. Per-frame bounds are meant to be refined in the
 * Character Gym.
 */
function makeAnimation(spec: RedBrawlerActionSpec): HeroAnimationDefinition {
  const attackByFrame = new Map<number, Rect>();

  if (spec.attack) {
    spec.attack.frames.forEach((frame) => attackByFrame.set(frame, spec.attack!.bounds));
  }

  (spec.attackSpans ?? []).forEach((span) => {
    span.frames.forEach((frame) => attackByFrame.set(frame, span.bounds));
  });

  const bounds: HeroBoundsFrame[] = Array.from({ length: spec.frames }, (_, frame) => ({
    frame,
    visual: { ...spec.defaultVisual },
    collision: collisionBounds(spec.defaultVisual),
    hit: hitBounds(spec.defaultVisual),
    attack: attackByFrame.get(frame) ?? null,
    guard: spec.guard ? { ...spec.guard } : null
  }));

  return {
    id: spec.key,
    characterId: RED_BRAWLER_CHARACTER_ID,
    action: spec.action,
    label: spec.label,
    key: spec.key,
    sheet: requireSheet(spec.key),
    frameRate: spec.frameRate,
    repeat: spec.repeat,
    bounds
  };
}

/**
 * Look up the spritesheet descriptor for an animation key, throwing if missing.
 */
function requireSheet(key: string): SpritesheetAsset {
  const found = RED_BRAWLER_SPRITESHEETS.find((candidate) => candidate.key === key);

  if (!found) {
    throw new Error(`Missing red-brawler spritesheet metadata for ${key}`);
  }

  return found;
}

/**
 * Derive a centered collision box from a visual box, anchored to the feet.
 */
function collisionBounds(visual: Rect): Rect {
  const width = Math.min(58, Math.max(34, Math.round(visual.width * 0.46)));
  const height = Math.max(74, Math.round(visual.height * 0.82));

  return {
    x: Math.round(128 - width / 2),
    y: Math.round(230 - height),
    width,
    height
  };
}

/**
 * Derive a slightly padded hurtbox from a visual box.
 */
function hitBounds(visual: Rect): Rect {
  return {
    x: Math.max(0, visual.x - 4),
    y: Math.max(0, visual.y + 2),
    width: Math.min(FRAME_WIDTH, visual.width + 8),
    height: Math.min(FRAME_HEIGHT, visual.height)
  };
}

/**
 * Construct a rectangle literal.
 */
function rect(x: number, y: number, width: number, height: number): Rect {
  return { x, y, width, height };
}
