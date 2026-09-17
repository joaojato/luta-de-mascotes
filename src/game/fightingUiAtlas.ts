import * as Phaser from 'phaser';

import type { Rect } from './types';

export const FIGHTING_UI_ATLAS_TEXTURE_KEY = 'fighting-ui-atlas';
export const FIGHTING_UI_ATLAS_IMAGE_URL = '/assets/ui/fighting/fighting-ui-atlas-transparent.png';
export const FIGHTING_UI_ATLAS_MANIFEST_URL =
  '/assets/ui/fighting/fighting-ui-atlas-transparent.manifest.json';

export const FIGHTING_UI_ATLAS_SIZE = {
  width: 1254,
  height: 1254
} as const;

/**
 * A single sub-region of the fighting HUD atlas. Slots (fill/portrait/number/
 * text) are expressed in pixels relative to the frame's own top-left and act as
 * runtime placement guides for the dynamic content drawn over each frame.
 */
export interface FightingUiAtlasFrame {
  name: string;
  kind: string;
  bounds: Rect;
  state?: string;
  anchor?: { x: number; y: number };
  fillSlot?: Rect;
  portraitSocket?: Rect;
  numberSlot?: Rect;
  textSlot?: Rect;
}

export const FIGHTING_UI_ATLAS_FRAMES: readonly FightingUiAtlasFrame[] = [
  frame('health-frame-left', 'health-frame', 22, 76, 587, 110, {
    fillSlot: rect(47, 23, 490, 50),
    anchor: { x: 0, y: 0 }
  }),
  frame('health-frame-right', 'health-frame', 645, 76, 586, 110, {
    fillSlot: rect(49, 23, 490, 50),
    anchor: { x: 0, y: 0 }
  }),
  frame('portrait-frame-gold-left', 'portrait-frame', 21, 278, 223, 225, {
    portraitSocket: rect(31, 29, 163, 166),
    anchor: { x: 0.5, y: 0.5 }
  }),
  frame('portrait-frame-blue-left', 'portrait-frame', 268, 278, 223, 225, {
    portraitSocket: rect(29, 29, 166, 166),
    anchor: { x: 0.5, y: 0.5 }
  }),
  frame('timer-frame', 'timer-frame', 532, 306, 179, 176, {
    numberSlot: rect(42, 40, 95, 96),
    anchor: { x: 0.5, y: 0.5 }
  }),
  frame('portrait-frame-blue-right', 'portrait-frame', 749, 278, 225, 225, {
    portraitSocket: rect(30, 29, 166, 166),
    anchor: { x: 0.5, y: 0.5 }
  }),
  frame('portrait-frame-gold-right', 'portrait-frame', 1002, 278, 227, 225, {
    portraitSocket: rect(31, 29, 166, 166),
    anchor: { x: 0.5, y: 0.5 }
  }),
  frame('health-fill-green-left', 'health-fill', 38, 565, 331, 51, { state: 'healthy' }),
  frame('health-fill-green-right', 'health-fill', 385, 565, 321, 51, { state: 'healthy' }),
  frame('health-fill-yellow-left', 'health-fill', 38, 641, 331, 52, { state: 'warning' }),
  frame('health-fill-red-left', 'health-fill', 38, 718, 331, 52, { state: 'danger' }),
  frame('meter-pip-blue-1', 'meter-pip', 752, 560, 86, 56, { state: 'blue' }),
  frame('meter-pip-gold-1', 'meter-pip', 752, 637, 86, 56, { state: 'gold' }),
  frame('meter-pip-empty-1', 'meter-pip', 752, 714, 86, 57, { state: 'empty' }),
  frame('nameplate-gold-left', 'nameplate', 43, 825, 560, 61, {
    textSlot: rect(28, 12, 472, 35)
  }),
  frame('nameplate-gold-right', 'nameplate', 651, 825, 550, 61, {
    textSlot: rect(50, 12, 472, 35)
  }),
  frame('icon-hit-red', 'status-icon', 42, 1091, 100, 96, { anchor: { x: 0.5, y: 0.5 } }),
  frame('icon-hit-gold', 'status-icon', 162, 1091, 104, 96, { anchor: { x: 0.5, y: 0.5 } }),
  frame('icon-hit-blue', 'status-icon', 285, 1091, 98, 96, { anchor: { x: 0.5, y: 0.5 } }),
  frame('icon-heal', 'status-icon', 402, 1091, 100, 96, { anchor: { x: 0.5, y: 0.5 } }),
  frame('icon-shield-blue', 'status-icon', 522, 1091, 100, 96, { anchor: { x: 0.5, y: 0.5 } }),
  frame('icon-ko', 'status-icon', 874, 1091, 99, 96, { anchor: { x: 0.5, y: 0.5 } })
];

/**
 * Registers every atlas sub-frame on the loaded atlas texture so they can be
 * drawn with `scene.add.image(x, y, key, frameName)`.
 * @param scene - The scene whose texture manager owns the atlas image.
 */
export function registerFightingUiAtlasFrames(scene: Phaser.Scene): void {
  const texture = scene.textures.get(FIGHTING_UI_ATLAS_TEXTURE_KEY);

  FIGHTING_UI_ATLAS_FRAMES.forEach((atlasFrame) => {
    if (texture.has(atlasFrame.name)) {
      return;
    }

    texture.add(
      atlasFrame.name,
      0,
      atlasFrame.bounds.x,
      atlasFrame.bounds.y,
      atlasFrame.bounds.width,
      atlasFrame.bounds.height
    );
  });
}

/**
 * Resolves a frame's authoring metadata by name, falling back to the first frame.
 * @param name - The frame name to resolve.
 */
export function getFightingUiAtlasFrame(name: string): FightingUiAtlasFrame {
  return FIGHTING_UI_ATLAS_FRAMES.find((atlasFrame) => atlasFrame.name === name) ?? FIGHTING_UI_ATLAS_FRAMES[0];
}

function frame(
  name: string,
  kind: string,
  x: number,
  y: number,
  width: number,
  height: number,
  metadata: Omit<FightingUiAtlasFrame, 'name' | 'kind' | 'bounds'> = {}
): FightingUiAtlasFrame {
  return {
    name,
    kind,
    bounds: rect(x, y, width, height),
    ...metadata
  };
}

function rect(x: number, y: number, width: number, height: number): Rect {
  return { x, y, width, height };
}
