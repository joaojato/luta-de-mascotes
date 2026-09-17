import { createStore, type Store } from '../store';

export interface StarterGameConfig {
  playerSpeed: number;
  jumpVelocity: number;
  gravity: number;
  actorScale: number;
  cameraLead: number;
  pickupGoal: number;
}

export const STARTER_GAME_CONFIG_FILE = '/assets/config/game-config.json';
export const STARTER_GAME_CONFIG_SAVE_TARGET = 'assets/config/game-config.json';

export const DEFAULT_STARTER_GAME_CONFIG: StarterGameConfig = {
  playerSpeed: 250,
  jumpVelocity: 610,
  gravity: 1500,
  actorScale: 1,
  cameraLead: 0.34,
  pickupGoal: 2
};

export function createGameConfigStore(): Store<StarterGameConfig> {
  return createStore<StarterGameConfig>({ ...DEFAULT_STARTER_GAME_CONFIG });
}

export function normalizeStarterGameConfig(
  value: Partial<StarterGameConfig> | null | undefined
): StarterGameConfig {
  return {
    playerSpeed: clampNumber(value?.playerSpeed, 80, 720, DEFAULT_STARTER_GAME_CONFIG.playerSpeed),
    jumpVelocity: clampNumber(
      value?.jumpVelocity,
      120,
      1200,
      DEFAULT_STARTER_GAME_CONFIG.jumpVelocity
    ),
    gravity: clampNumber(value?.gravity, 200, 3600, DEFAULT_STARTER_GAME_CONFIG.gravity),
    actorScale: clampNumber(value?.actorScale, 0.4, 2.5, DEFAULT_STARTER_GAME_CONFIG.actorScale),
    cameraLead: clampNumber(value?.cameraLead, 0, 0.75, DEFAULT_STARTER_GAME_CONFIG.cameraLead),
    pickupGoal: Math.round(
      clampNumber(value?.pickupGoal, 0, 99, DEFAULT_STARTER_GAME_CONFIG.pickupGoal)
    )
  };
}

export function buildStarterGameConfigExport(config: StarterGameConfig): {
  version: number;
  savedAt: string;
  gameConfig: StarterGameConfig;
} {
  return {
    version: 1,
    savedAt: new Date().toISOString(),
    gameConfig: normalizeStarterGameConfig(config)
  };
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, value));
}
