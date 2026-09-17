import { describe, expect, it } from 'vitest';

import { DEFAULT_STARTER_GAME_CONFIG, normalizeStarterGameConfig } from './config';

describe('normalizeStarterGameConfig', () => {
  it('keeps valid tuning values', () => {
    expect(
      normalizeStarterGameConfig({
        playerSpeed: 320,
        jumpVelocity: 700,
        gravity: 1800,
        actorScale: 1.2,
        cameraLead: 0.4,
        pickupGoal: 3
      })
    ).toEqual({
      playerSpeed: 320,
      jumpVelocity: 700,
      gravity: 1800,
      actorScale: 1.2,
      cameraLead: 0.4,
      pickupGoal: 3
    });
  });

  it('clamps out-of-range tuning values', () => {
    expect(
      normalizeStarterGameConfig({
        playerSpeed: 9999,
        jumpVelocity: -1,
        gravity: 99,
        actorScale: 9,
        cameraLead: 9,
        pickupGoal: 2.6
      })
    ).toEqual({
      ...DEFAULT_STARTER_GAME_CONFIG,
      playerSpeed: 720,
      jumpVelocity: 120,
      gravity: 200,
      actorScale: 2.5,
      cameraLead: 0.75,
      pickupGoal: 3
    });
  });
});
