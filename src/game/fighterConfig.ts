import { FIGHTER_CHARACTER_DEFINITIONS, getCharacterDefinition } from './hero';
import { RED_BRAWLER_CHARACTER_ID } from './redBrawler';
import { GREEN_BOXER_CHARACTER_ID } from './greenBoxer';
import { JIUJITSU_FIGHTER_CHARACTER_ID } from './jiujitsuFighter';
import type {
  AttackKind,
  AttackProfile,
  FighterBoundsVisibility,
  FighterCombat,
  FighterPlaygroundDebugState,
  FighterStats
} from './types';

export const FIGHTER_PLAYGROUND_CONFIG_FILE = '/configs/fighter-playground.json';
export const FIGHTER_PLAYGROUND_CONFIG_SAVE_TARGET = 'configs/fighter-playground.json';

/**
 * Baseline movement/physics stats applied to any fighter without a bespoke
 * override. These mirror the playground's original tuning constants.
 */
export const DEFAULT_FIGHTER_STATS: FighterStats = {
  walkSpeed: 230,
  airDrift: 190,
  jump: 980,
  gravity: 2300,
  scale: 1.4
};

/**
 * Per-character starting balance. Tunable in the playground debug panel and
 * persisted to `public/configs/fighter-playground.json`.
 */
const FIGHTER_STAT_OVERRIDES: Record<string, Partial<FighterStats>> = {
  [RED_BRAWLER_CHARACTER_ID]: {},
  [GREEN_BOXER_CHARACTER_ID]: { walkSpeed: 250, jump: 1000 },
  [JIUJITSU_FIGHTER_CHARACTER_ID]: { walkSpeed: 240, airDrift: 210, jump: 1040 }
};

/**
 * Editable stat field metadata used to render the debug panel inputs and to
 * clamp values to sane ranges.
 */
export interface FighterStatField {
  id: keyof FighterStats;
  label: string;
  min: number;
  max: number;
  step: number;
}

export const FIGHTER_STAT_FIELDS: FighterStatField[] = [
  { id: 'walkSpeed', label: 'Walk speed', min: 40, max: 600, step: 5 },
  { id: 'airDrift', label: 'Air drift', min: 0, max: 600, step: 5 },
  { id: 'jump', label: 'Jump power', min: 200, max: 2000, step: 10 },
  { id: 'gravity', label: 'Gravity', min: 400, max: 5000, step: 25 },
  { id: 'scale', label: 'Scale', min: 0.5, max: 3, step: 0.05 }
];

/**
 * Baseline combat tuning applied to any fighter without a bespoke override.
 * The light attack ("high") is fast and light; the heavy attack ("low") hits
 * harder, pushes further, and stuns longer.
 */
export const DEFAULT_FIGHTER_COMBAT: FighterCombat = {
  maxHealth: 100,
  highDamage: 7,
  highKnockback: 180,
  highHitstun: 280,
  lowDamage: 12,
  lowKnockback: 340,
  lowHitstun: 440,
  specialDamage: 6,
  specialKnockback: 150,
  specialHitstun: 240
};

/**
 * Per-character combat balance. Tunable in the playground debug panel and
 * persisted alongside the movement stats.
 */
const FIGHTER_COMBAT_OVERRIDES: Record<string, Partial<FighterCombat>> = {
  [RED_BRAWLER_CHARACTER_ID]: { specialDamage: 7, specialKnockback: 170 },
  [GREEN_BOXER_CHARACTER_ID]: { highDamage: 9, highKnockback: 220, lowDamage: 10, lowKnockback: 300 },
  [JIUJITSU_FIGHTER_CHARACTER_ID]: {
    maxHealth: 110,
    highDamage: 6,
    lowDamage: 14,
    lowKnockback: 380,
    lowHitstun: 480,
    specialDamage: 5,
    specialHitstun: 220
  }
};

/**
 * Editable combat field metadata used to render the debug panel inputs and to
 * clamp values to sane ranges.
 */
export interface FighterCombatField {
  id: keyof FighterCombat;
  label: string;
  min: number;
  max: number;
  step: number;
}

export const FIGHTER_COMBAT_FIELDS: FighterCombatField[] = [
  { id: 'maxHealth', label: 'Max HP', min: 50, max: 300, step: 5 },
  { id: 'highDamage', label: 'High dmg', min: 1, max: 50, step: 1 },
  { id: 'highKnockback', label: 'High kb', min: 0, max: 800, step: 10 },
  { id: 'highHitstun', label: 'High stun', min: 0, max: 1200, step: 20 },
  { id: 'lowDamage', label: 'Low dmg', min: 1, max: 50, step: 1 },
  { id: 'lowKnockback', label: 'Low kb', min: 0, max: 800, step: 10 },
  { id: 'lowHitstun', label: 'Low stun', min: 0, max: 1200, step: 20 },
  { id: 'specialDamage', label: 'Special dmg', min: 1, max: 50, step: 1 },
  { id: 'specialKnockback', label: 'Special kb', min: 0, max: 800, step: 10 },
  { id: 'specialHitstun', label: 'Special stun', min: 0, max: 1200, step: 20 }
];

/**
 * Debug bounds overlay metadata, shared by the playground panel (colour
 * swatches) and the scene renderer (stroke/fill colours).
 */
export interface FighterBoundsField {
  id: keyof FighterBoundsVisibility;
  label: string;
  color: string;
}

export const FIGHTER_BOUNDS_FIELDS: FighterBoundsField[] = [
  { id: 'visual', label: 'Visual', color: '#38bdf8' },
  { id: 'collision', label: 'Collision', color: '#facc15' },
  { id: 'hit', label: 'Hit', color: '#22c55e' },
  { id: 'attack', label: 'Attack', color: '#f43f5e' },
  { id: 'guard', label: 'Guard', color: '#a855f7' }
];

export interface FighterPlaygroundConfigExport {
  version: number;
  savedAt: string;
  characterId: string;
  reverseWalk: boolean;
  stats: Record<string, FighterStats>;
  combat: Record<string, FighterCombat>;
}

/**
 * Build the default per-character stats map for every selectable fighter.
 */
export function buildDefaultFighterStats(): Record<string, FighterStats> {
  const stats: Record<string, FighterStats> = {};

  FIGHTER_CHARACTER_DEFINITIONS.forEach((character) => {
    stats[character.id] = clampFighterStats({
      ...DEFAULT_FIGHTER_STATS,
      ...FIGHTER_STAT_OVERRIDES[character.id]
    });
  });

  return stats;
}

/**
 * Build the default per-character combat map for every selectable fighter.
 */
export function buildDefaultFighterCombat(): Record<string, FighterCombat> {
  const combat: Record<string, FighterCombat> = {};

  FIGHTER_CHARACTER_DEFINITIONS.forEach((character) => {
    combat[character.id] = clampFighterCombat({
      ...DEFAULT_FIGHTER_COMBAT,
      ...FIGHTER_COMBAT_OVERRIDES[character.id]
    });
  });

  return combat;
}

/**
 * Build the default Fighter Playground debug state (default selection + stats).
 */
export function createDefaultFighterPlaygroundState(): FighterPlaygroundDebugState {
  return {
    characterId: defaultFighterCharacterId(),
    stats: buildDefaultFighterStats(),
    combat: buildDefaultFighterCombat(),
    bounds: { visual: false, collision: false, hit: false, attack: false, guard: false },
    reverseWalk: false,
    fillSpecial: false,
    saveStatus: 'Loaded from public/configs/fighter-playground.json'
  };
}

/**
 * Resolve the stats for a character, falling back to defaults when absent.
 * @param state - The current playground debug state.
 * @param characterId - The character to resolve stats for.
 */
export function getFighterStats(
  state: FighterPlaygroundDebugState,
  characterId: string
): FighterStats {
  return state.stats[characterId] ?? clampFighterStats(DEFAULT_FIGHTER_STATS);
}

/**
 * Resolve the combat tuning for a character, falling back to defaults.
 * @param state - The current playground debug state.
 * @param characterId - The character to resolve combat for.
 */
export function getFighterCombat(
  state: FighterPlaygroundDebugState,
  characterId: string
): FighterCombat {
  return state.combat?.[characterId] ?? clampFighterCombat(DEFAULT_FIGHTER_COMBAT);
}

/**
 * Resolve a single attack's profile (damage/knockback/hitstun + guard height)
 * for the given attack button.
 * @param combat - The character's combat tuning.
 * @param kind - Which attack: `high` (light) or `low` (heavy).
 */
export function getAttackProfile(combat: FighterCombat, kind: AttackKind): AttackProfile {
  if (kind === 'high') {
    return {
      kind: 'high',
      height: 'high',
      damage: combat.highDamage,
      knockback: combat.highKnockback,
      hitstun: combat.highHitstun
    };
  }

  if (kind === 'special') {
    return {
      kind: 'special',
      height: 'high',
      damage: combat.specialDamage,
      knockback: combat.specialKnockback,
      hitstun: combat.specialHitstun
    };
  }

  return {
    kind: 'low',
    height: 'low',
    damage: combat.lowDamage,
    knockback: combat.lowKnockback,
    hitstun: combat.lowHitstun
  };
}

/**
 * Serialize the playground stats for persistence.
 * @param state - The current playground debug state.
 */
export function buildFighterPlaygroundConfigExport(
  state: FighterPlaygroundDebugState
): FighterPlaygroundConfigExport {
  return {
    version: 1,
    savedAt: new Date().toISOString(),
    characterId: normalizeFighterCharacterId(state.characterId),
    reverseWalk: Boolean(state.reverseWalk),
    stats: normalizeFighterStatsMap(state.stats),
    combat: normalizeFighterCombatMap(state.combat)
  };
}

/**
 * Fetch the persisted playground config, returning null when unavailable.
 */
export async function loadFighterPlaygroundConfig(): Promise<Partial<FighterPlaygroundConfigExport> | null> {
  try {
    const response = await fetch(FIGHTER_PLAYGROUND_CONFIG_FILE, { cache: 'no-store' });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as Partial<FighterPlaygroundConfigExport>;
  } catch {
    return null;
  }
}

/**
 * Merge a persisted config into the current playground state, keeping defaults
 * for any missing characters or fields.
 * @param current - The current playground debug state.
 * @param saved - The persisted config (may be partial or null).
 */
export function mergeFighterPlaygroundState(
  current: FighterPlaygroundDebugState,
  saved: Partial<FighterPlaygroundConfigExport> | null
): FighterPlaygroundDebugState {
  if (!saved) {
    return current;
  }

  const mergedStats: Record<string, FighterStats> = { ...current.stats };

  if (saved.stats && typeof saved.stats === 'object') {
    FIGHTER_CHARACTER_DEFINITIONS.forEach((character) => {
      const savedStats = saved.stats?.[character.id];

      if (savedStats) {
        mergedStats[character.id] = clampFighterStats({
          ...mergedStats[character.id],
          ...savedStats
        });
      }
    });
  }

  const mergedCombat: Record<string, FighterCombat> = { ...current.combat };

  if (saved.combat && typeof saved.combat === 'object') {
    FIGHTER_CHARACTER_DEFINITIONS.forEach((character) => {
      const savedCombat = saved.combat?.[character.id];

      if (savedCombat) {
        mergedCombat[character.id] = clampFighterCombat({
          ...mergedCombat[character.id],
          ...savedCombat
        });
      }
    });
  }

  return {
    ...current,
    characterId: normalizeFighterCharacterId(saved.characterId ?? current.characterId),
    reverseWalk: typeof saved.reverseWalk === 'boolean' ? saved.reverseWalk : current.reverseWalk,
    stats: mergedStats,
    combat: mergedCombat
  };
}

/**
 * Clamp a stats object to the configured field ranges, filling missing fields.
 * @param value - Partial stats to clamp.
 */
export function clampFighterStats(value: Partial<FighterStats>): FighterStats {
  const result = {} as FighterStats;

  FIGHTER_STAT_FIELDS.forEach((field) => {
    result[field.id] = clamp(value[field.id], field.min, field.max, DEFAULT_FIGHTER_STATS[field.id]);
  });

  return result;
}

/**
 * Clamp a combat object to the configured field ranges, filling missing fields.
 * @param value - Partial combat tuning to clamp.
 */
export function clampFighterCombat(value: Partial<FighterCombat>): FighterCombat {
  const result = {} as FighterCombat;

  FIGHTER_COMBAT_FIELDS.forEach((field) => {
    result[field.id] = clamp(value[field.id], field.min, field.max, DEFAULT_FIGHTER_COMBAT[field.id]);
  });

  return result;
}

/**
 * Default selectable fighter (first fighter in the roster, preferring the red brawler).
 */
export function defaultFighterCharacterId(): string {
  const preferred = FIGHTER_CHARACTER_DEFINITIONS.find(
    (character) => character.id === RED_BRAWLER_CHARACTER_ID
  );

  return preferred?.id ?? FIGHTER_CHARACTER_DEFINITIONS[0]?.id ?? RED_BRAWLER_CHARACTER_ID;
}

function normalizeFighterCharacterId(value: unknown): string {
  if (typeof value === 'string' && FIGHTER_CHARACTER_DEFINITIONS.some((character) => character.id === value)) {
    return getCharacterDefinition(value).id;
  }

  return defaultFighterCharacterId();
}

function normalizeFighterStatsMap(value: unknown): Record<string, FighterStats> {
  const stats: Record<string, FighterStats> = {};

  FIGHTER_CHARACTER_DEFINITIONS.forEach((character) => {
    const candidate = (value as Record<string, Partial<FighterStats>> | undefined)?.[character.id];
    stats[character.id] = clampFighterStats({
      ...DEFAULT_FIGHTER_STATS,
      ...FIGHTER_STAT_OVERRIDES[character.id],
      ...candidate
    });
  });

  return stats;
}

function normalizeFighterCombatMap(value: unknown): Record<string, FighterCombat> {
  const combat: Record<string, FighterCombat> = {};

  FIGHTER_CHARACTER_DEFINITIONS.forEach((character) => {
    const candidate = (value as Record<string, Partial<FighterCombat>> | undefined)?.[character.id];
    combat[character.id] = clampFighterCombat({
      ...DEFAULT_FIGHTER_COMBAT,
      ...FIGHTER_COMBAT_OVERRIDES[character.id],
      ...candidate
    });
  });

  return combat;
}

function clamp(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, value));
}
