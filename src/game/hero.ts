import type { CharacterBoundsKind, CharacterGymBoundsOverrides, Rect } from './types';
import type { ImageAsset, SpritesheetAsset } from './assets';
import { RED_BRAWLER_CHARACTER } from './redBrawler';
import { GREEN_BOXER_CHARACTER } from './greenBoxer';
import { JIUJITSU_FIGHTER_CHARACTER } from './jiujitsuFighter';

export interface HeroBoundsFrame {
  frame: number;
  visual: Rect;
  collision: Rect | null;
  hit: Rect | null;
  attack: Rect | null;
  /**
   * The region this pose protects while blocking. Authored on the block
   * animations (upper-body box on block-high, lower-body box on block-low) and
   * null elsewhere. An attack is blocked when its hitbox overlaps the
   * defender's active guard box.
   */
  guard: Rect | null;
}

export interface HeroAnimationDefinition {
  id: string;
  characterId: string;
  action: string;
  label: string;
  key: string;
  sheet: SpritesheetAsset;
  frameRate: number;
  repeat: number;
  bounds: HeroBoundsFrame[];
}

export interface CharacterDefinition {
  id: string;
  label: string;
  role: 'player' | 'enemy';
  anchor: { x: number; y: number };
  anchorPixels: { x: number; y: number };
  animations: HeroAnimationDefinition[];
  anchorAsset: ImageAsset;
  portrait: ImageAsset;
  assets: Array<ImageAsset | SpritesheetAsset>;
}

export const CHARACTER_DEFINITIONS: CharacterDefinition[] = [
  RED_BRAWLER_CHARACTER,
  GREEN_BOXER_CHARACTER,
  JIUJITSU_FIGHTER_CHARACTER
];

/**
 * Characters authored with the full fighter action set (they include a
 * `knockdown` action). These are the selectable roster in the Fighter
 * Playground; the Character Gym still lists every character.
 */
export const FIGHTER_CHARACTER_DEFINITIONS: CharacterDefinition[] = CHARACTER_DEFINITIONS.filter(
  (character) => character.animations.some((animation) => animation.action === 'knockdown')
);

/**
 * Resolve a fighter animation key by character + action name, returning null
 * when the character has no animation for that action.
 * @param characterId - The owning character id.
 * @param action - The action name (e.g. `heavy-kick`).
 */
export function findCharacterAnimationKeyByAction(characterId: string, action: string): string | null {
  const character = getCharacterDefinition(characterId);
  const animation = character.animations.find((candidate) => candidate.action === action);

  return animation ? animation.key : null;
}

export const CHARACTER_ANIMATIONS = CHARACTER_DEFINITIONS.flatMap((character) => character.animations);
export const CHARACTER_ASSETS = CHARACTER_DEFINITIONS.flatMap((character) => character.assets);
export const HERO_ASSETS = CHARACTER_ASSETS;

export function getHeroAnimationDefinition(animationKey: string): HeroAnimationDefinition {
  return CHARACTER_ANIMATIONS.find((animation) => animation.key === animationKey) ?? CHARACTER_ANIMATIONS[0];
}

export function getCharacterDefinition(characterId: string): CharacterDefinition {
  return CHARACTER_DEFINITIONS.find((character) => character.id === characterId) ?? CHARACTER_DEFINITIONS[0];
}

export function getCharacterAnimationDefinition(
  characterId: string,
  animationKey: string
): HeroAnimationDefinition {
  const character = getCharacterDefinition(characterId);

  return character.animations.find((animation) => animation.key === animationKey) ?? character.animations[0];
}

export function getCharacterAnimationByAction(characterId: string, action: string): HeroAnimationDefinition {
  const character = getCharacterDefinition(characterId);

  return character.animations.find((animation) => animation.action === action) ?? character.animations[0];
}

export function getCharacterIdForAnimation(animationKey: string): string {
  return getHeroAnimationDefinition(animationKey).characterId;
}

export function isCharacterId(value: unknown): value is string {
  return typeof value === 'string' && CHARACTER_DEFINITIONS.some((character) => character.id === value);
}

export function resolveHeroBoundsFrame(
  animation: HeroAnimationDefinition,
  frameIndex: number,
  overrides: CharacterGymBoundsOverrides
): HeroBoundsFrame {
  const clampedFrame = PhaserClamp(frameIndex, 0, animation.bounds.length - 1);
  const baseFrame = animation.bounds[clampedFrame] ?? animation.bounds[0];
  const frameOverrides = overrides[animation.key]?.[clampedFrame];

  if (!frameOverrides) {
    return baseFrame;
  }

  return {
    frame: clampedFrame,
    visual: frameOverrides.visual ? rectFromEdit(frameOverrides.visual) : baseFrame.visual,
    collision: resolveOptionalBounds('collision', baseFrame, frameOverrides),
    hit: resolveOptionalBounds('hit', baseFrame, frameOverrides),
    attack: resolveOptionalBounds('attack', baseFrame, frameOverrides),
    guard: resolveOptionalBounds('guard', baseFrame, frameOverrides)
  };
}

export function defaultHeroBoundsForActivation(frame: HeroBoundsFrame, kind: CharacterBoundsKind): Rect {
  const currentBounds = frame[kind];

  if (currentBounds) {
    return currentBounds;
  }

  if (kind === 'attack') {
    return rect(28, 86, 76, 48);
  }

  if (kind === 'guard') {
    return rect(64, 48, 128, 112);
  }

  return frame.visual;
}

function rect(x: number, y: number, width: number, height: number): Rect {
  return { x, y, width, height };
}

function rectFromEdit(edit: Rect): Rect {
  return rect(edit.x, edit.y, edit.width, edit.height);
}

function resolveOptionalBounds(
  kind: Exclude<CharacterBoundsKind, 'visual'>,
  baseFrame: HeroBoundsFrame,
  frameOverrides: Partial<Record<CharacterBoundsKind, Rect & { active: boolean }>>
): Rect | null {
  const override = frameOverrides[kind];

  if (!override) {
    return baseFrame[kind];
  }

  return override.active ? rectFromEdit(override) : null;
}

function PhaserClamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
