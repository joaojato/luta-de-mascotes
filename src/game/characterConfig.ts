import {
  CHARACTER_DEFINITIONS,
  getCharacterDefinition,
  getCharacterIdForAnimation,
  getCharacterAnimationDefinition,
  getHeroAnimationDefinition,
  resolveHeroBoundsFrame,
  type HeroBoundsFrame
} from './hero';
import type {
  CharacterBoundsKind,
  CharacterGymBoundsOverrides,
  CharacterGymDebugState,
  Rect
} from './types';

export interface CharacterGymConfigExport {
  version: number;
  savedAt: string;
  character: {
    id: string;
    gym: CharacterGymConfigState;
    animations: CharacterAnimationConfig[];
  };
  characters: Array<{
    id: string;
    label: string;
    role: 'player' | 'enemy';
    animations: CharacterAnimationConfig[];
  }>;
}

export interface CharacterGymConfigState {
  characterId: string;
  animationKey: string;
  frame: number;
  playbackSpeed: number;
  selectedBoundsKind: CharacterBoundsKind;
  boundsOverrides: CharacterGymBoundsOverrides;
}

export interface CharacterAnimationConfig {
  key: string;
  action: string;
  frameRate: number;
  repeat: number;
  frameWidth: number;
  frameHeight: number;
  frames: CharacterFrameBoundsConfig[];
}

export interface CharacterFrameBoundsConfig extends HeroBoundsFrame {}

export const CHARACTER_GYM_CONFIG_FILE = '/configs/character-gym.json';
export const CHARACTER_GYM_CONFIG_SAVE_TARGET = 'configs/character-gym.json';

export function buildCharacterGymConfigExport(characterGym: CharacterGymDebugState): CharacterGymConfigExport {
  const normalizedGym = normalizeCharacterGymConfigState(characterGym);

  return {
    version: 1,
    savedAt: new Date().toISOString(),
    character: {
      id: normalizedGym.characterId,
      gym: normalizedGym,
      animations: getCharacterDefinition(normalizedGym.characterId).animations.map((animation) => ({
        key: animation.key,
        action: animation.action,
        frameRate: animation.frameRate,
        repeat: animation.repeat,
        frameWidth: animation.sheet.frameWidth,
        frameHeight: animation.sheet.frameHeight,
        frames: animation.bounds.map((_, frame) =>
          cloneBoundsFrame(resolveHeroBoundsFrame(animation, frame, normalizedGym.boundsOverrides))
        )
      }))
    },
    characters: CHARACTER_DEFINITIONS.map((character) => ({
      id: character.id,
      label: character.label,
      role: character.role,
      animations: character.animations.map((animation) => ({
        key: animation.key,
        action: animation.action,
        frameRate: animation.frameRate,
        repeat: animation.repeat,
        frameWidth: animation.sheet.frameWidth,
        frameHeight: animation.sheet.frameHeight,
        frames: animation.bounds.map((_, frame) =>
          cloneBoundsFrame(resolveHeroBoundsFrame(animation, frame, normalizedGym.boundsOverrides))
        )
      }))
    }))
  };
}

export async function loadCharacterGymConfig(): Promise<CharacterGymConfigState | null> {
  try {
    const response = await fetch(CHARACTER_GYM_CONFIG_FILE, { cache: 'no-store' });

    if (!response.ok) {
      return null;
    }

    const config = (await response.json()) as Partial<CharacterGymConfigExport>;

    return normalizeCharacterGymConfigState(config.character?.gym);
  } catch {
    return null;
  }
}

export function mergeCharacterGymConfigState(
  current: CharacterGymDebugState,
  saved: CharacterGymConfigState | null
): CharacterGymDebugState {
  if (!saved) {
    return current;
  }

  const character = getCharacterDefinition(saved.characterId);
  const animation = getCharacterAnimationDefinition(character.id, saved.animationKey);

  return {
    ...current,
    characterId: character.id,
    animationKey: animation.key,
    frame: clampInt(saved.frame, 0, animation.sheet.frames - 1, 0),
    playbackSpeed: normalizePlaybackSpeed(saved.playbackSpeed),
    selectedBoundsKind: normalizeBoundsKind(saved.selectedBoundsKind),
    boundsOverrides: saved.boundsOverrides
  };
}

export function normalizeCharacterGymConfigState(
  value: Partial<CharacterGymConfigState> | null | undefined
): CharacterGymConfigState {
  const inferredCharacterId = typeof value?.characterId === 'string'
    ? value.characterId
    : getCharacterIdForAnimation(value?.animationKey ?? '');
  const character = getCharacterDefinition(inferredCharacterId);
  const animation = getCharacterAnimationDefinition(character.id, value?.animationKey ?? '');

  return {
    characterId: character.id,
    animationKey: animation.key,
    frame: clampInt(value?.frame, 0, animation.sheet.frames - 1, 0),
    playbackSpeed: normalizePlaybackSpeed(value?.playbackSpeed),
    selectedBoundsKind: normalizeBoundsKind(value?.selectedBoundsKind),
    boundsOverrides: normalizeBoundsOverrides(value?.boundsOverrides)
  };
}

function normalizeBoundsOverrides(value: unknown): CharacterGymBoundsOverrides {
  if (!value || typeof value !== 'object') {
    return {};
  }

  const normalized: CharacterGymBoundsOverrides = {};

  Object.entries(value as Record<string, unknown>).forEach(([animationKey, frames]) => {
    const animation = getHeroAnimationDefinition(animationKey);

    if (animation.key !== animationKey || !frames || typeof frames !== 'object') {
      return;
    }

    Object.entries(frames as Record<string, unknown>).forEach(([frameKey, boundsByKind]) => {
      const frame = Number(frameKey);

      if (!Number.isInteger(frame) || frame < 0 || frame >= animation.sheet.frames) {
        return;
      }

      const normalizedBounds = normalizeBoundsByKind(boundsByKind);

      if (Object.keys(normalizedBounds).length === 0) {
        return;
      }

      normalized[animationKey] ??= {};
      normalized[animationKey][frame] = normalizedBounds;
    });
  });

  return normalized;
}

function normalizeBoundsByKind(value: unknown): Partial<Record<CharacterBoundsKind, Rect & { active: boolean }>> {
  if (!value || typeof value !== 'object') {
    return {};
  }

  const normalized: Partial<Record<CharacterBoundsKind, Rect & { active: boolean }>> = {};

  (['visual', 'collision', 'hit', 'attack', 'guard'] as CharacterBoundsKind[]).forEach((kind) => {
    const edit = (value as Partial<Record<CharacterBoundsKind, unknown>>)[kind];

    if (!edit || typeof edit !== 'object') {
      return;
    }

    const candidate = edit as Partial<Rect & { active: boolean }>;
    const rect = normalizeRect(candidate);

    if (!rect) {
      return;
    }

    normalized[kind] = {
      ...rect,
      active: kind === 'visual' ? true : candidate.active === true
    };
  });

  return normalized;
}

function normalizeRect(value: Partial<Rect>): Rect | null {
  const x = clampInt(value.x, 0, 255, 0);
  const y = clampInt(value.y, 0, 255, 0);
  const width = clampInt(value.width, 1, 256, 1);
  const height = clampInt(value.height, 1, 256, 1);

  return {
    x,
    y,
    width: Math.min(width, 256 - x),
    height: Math.min(height, 256 - y)
  };
}

function cloneBoundsFrame(frame: HeroBoundsFrame): CharacterFrameBoundsConfig {
  return {
    frame: frame.frame,
    visual: cloneRect(frame.visual),
    collision: frame.collision ? cloneRect(frame.collision) : null,
    hit: frame.hit ? cloneRect(frame.hit) : null,
    attack: frame.attack ? cloneRect(frame.attack) : null,
    guard: frame.guard ? cloneRect(frame.guard) : null
  };
}

function cloneRect(rect: Rect): Rect {
  return {
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height
  };
}

function normalizePlaybackSpeed(value: unknown): number {
  return value === 0.5 || value === 2 ? value : 1;
}

function normalizeBoundsKind(value: unknown): CharacterBoundsKind {
  return value === 'visual' || value === 'collision' || value === 'hit' || value === 'attack'
    ? value
    : 'collision';
}

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.round(Math.min(max, Math.max(min, value)));
}
