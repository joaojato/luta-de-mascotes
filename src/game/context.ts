import type { Store } from './store';
import type { StarterGameConfig } from './core/config';
import type { DebugState, GameProfile, GameSettings } from './types';

export interface AppContext {
  debugStore: Store<DebugState>;
  settingsStore: Store<GameSettings>;
  gameConfigStore: Store<StarterGameConfig>;
  isDebugShell: boolean;
  isMobileShell: boolean;
  getProfile(): GameProfile;
}

let activeContext: AppContext | null = null;

export function setAppContext(context: AppContext): void {
  activeContext = context;
}

export function getAppContext(): AppContext {
  if (!activeContext) {
    throw new Error('App context has not been initialized');
  }

  return activeContext;
}
