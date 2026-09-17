import { STORAGE_KEY } from './constants';
import { createStore, type Store } from './store';
import type { GameSettings } from './types';

export const DEFAULT_SETTINGS: GameSettings = {
  sfxVolume: 0.8,
  musicVolume: 0.55,
  muted: false
};

export function sanitizeSettings(raw: unknown): GameSettings {
  const candidate = raw as Partial<GameSettings> | null;
  const legacyVolume = typeof (candidate as { volume?: unknown } | null)?.volume === 'number'
    ? (candidate as { volume: number }).volume
    : undefined;

  return {
    sfxVolume: normalizeVolume(candidate?.sfxVolume, legacyVolume ?? DEFAULT_SETTINGS.sfxVolume),
    musicVolume: normalizeVolume(candidate?.musicVolume, legacyVolume ?? DEFAULT_SETTINGS.musicVolume),
    muted: typeof candidate?.muted === 'boolean' ? candidate.muted : DEFAULT_SETTINGS.muted
  };
}

export function loadSettings(storage: Storage = window.localStorage): GameSettings {
  try {
    const raw = storage.getItem(STORAGE_KEY);

    if (!raw) {
      return DEFAULT_SETTINGS;
    }

    return sanitizeSettings(JSON.parse(raw));
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: GameSettings, storage: Storage = window.localStorage): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function createSettingsStore(storage: Storage = window.localStorage): Store<GameSettings> {
  const store = createStore<GameSettings>(loadSettings(storage));

  store.subscribe((settings) => {
    saveSettings(settings, storage);
  });

  return store;
}

function normalizeVolume(value: unknown, fallback: number): number {
  return typeof value === 'number' && value >= 0 && value <= 1 ? value : fallback;
}
