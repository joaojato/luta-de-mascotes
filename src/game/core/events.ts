export const GAME_EVENTS = {
  levelCompleted: 'starter:level-completed',
  pickupCollected: 'starter:pickup-collected',
  progressChanged: 'starter:progress-changed',
  settingsChanged: 'starter:settings-changed'
} as const;

export type GameEventName = (typeof GAME_EVENTS)[keyof typeof GAME_EVENTS];
