import * as Phaser from 'phaser';

import type { Rect } from './types';

export const QUEST_UI_ATLAS_TEXTURE_KEY = 'quest-ui-atlas';
export const QUEST_UI_ATLAS_IMAGE_URL = '/assets/ui/quest/ui-atlas-transparent.png';
export const QUEST_UI_ATLAS_MANIFEST_URL = '/assets/ui/quest/ui-atlas-transparent.manifest.json';

export interface QuestUiAtlasFrame {
  name: string;
  kind: string;
  bounds: Rect;
  state?: string;
  anchor?: { x: number; y: number };
  portraitSocket?: Rect;
  fillSlot?: Rect;
  coinSocket?: Rect;
  numberSlot?: Rect;
}

export const QUEST_UI_ATLAS_SIZE = {
  width: 1536,
  height: 1024
} as const;

export const QUEST_UI_ATLAS_FRAMES: readonly QuestUiAtlasFrame[] = [
  frame('portrait-player-healthy', 'portrait', 95, 49, 263, 270, {
    state: 'healthy',
    anchor: { x: 0.5, y: 0.5 }
  }),
  frame('portrait-player-hurt', 'portrait', 417, 49, 265, 270, {
    state: 'hurt',
    anchor: { x: 0.5, y: 0.5 }
  }),
  frame('portrait-player-worn-out', 'portrait', 738, 50, 265, 271, {
    state: 'low-health',
    anchor: { x: 0.5, y: 0.5 }
  }),
  frame('portrait-player-defeated', 'portrait', 1061, 50, 264, 270, {
    state: 'defeated',
    anchor: { x: 0.5, y: 0.5 }
  }),
  frame('hud-health-frame', 'hud-frame', 82, 356, 816, 202, {
    portraitSocket: rect(20, 28, 170, 156),
    fillSlot: rect(207, 70, 620, 82),
    anchor: { x: 0, y: 0 }
  }),
  frame('health-fill-green', 'health-fill', 975, 376, 427, 49, {
    state: 'healthy'
  }),
  frame('health-fill-yellow', 'health-fill', 975, 441, 426, 51, {
    state: 'warning'
  }),
  frame('health-fill-red', 'health-fill', 975, 507, 426, 51, {
    state: 'danger'
  }),
  frame('health-fill-empty', 'health-fill', 975, 573, 427, 50, {
    state: 'empty'
  }),
  frame('hud-coin-counter-frame', 'hud-frame', 452, 596, 434, 177, {
    coinSocket: rect(24, 26, 120, 120),
    numberSlot: rect(146, 52, 238, 74),
    anchor: { x: 0, y: 0 }
  }),
  frame('collectible-coin-sparkle', 'collectible-ui', 282, 607, 118, 151, {
    anchor: { x: 0.5, y: 0.5 }
  }),
  frame('collectible-coin-large', 'collectible-ui', 97, 627, 122, 124, {
    anchor: { x: 0.5, y: 0.5 }
  }),
  frame('collectible-coin-medallion', 'collectible-ui', 959, 654, 122, 126, {
    anchor: { x: 0.5, y: 0.5 }
  }),
  frame('icon-damage-flash', 'icon', 531, 825, 147, 133, {
    anchor: { x: 0.5, y: 0.5 }
  }),
  frame('icon-lock', 'icon', 962, 827, 104, 132, {
    anchor: { x: 0.5, y: 0.5 }
  }),
  frame('icon-check', 'icon', 1148, 832, 125, 127, {
    anchor: { x: 0.5, y: 0.5 }
  }),
  frame('icon-heal-plus', 'icon', 757, 840, 107, 110, {
    anchor: { x: 0.5, y: 0.5 }
  }),
  frame('icon-heart-empty', 'icon', 334, 841, 125, 111, {
    anchor: { x: 0.5, y: 0.5 }
  }),
  frame('icon-heart-full', 'icon', 152, 842, 119, 104, {
    anchor: { x: 0.5, y: 0.5 }
  })
];

export function registerQuestUiAtlasFrames(scene: Phaser.Scene): void {
  const texture = scene.textures.get(QUEST_UI_ATLAS_TEXTURE_KEY);

  QUEST_UI_ATLAS_FRAMES.forEach((atlasFrame) => {
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

export function getQuestUiAtlasFrame(name: string): QuestUiAtlasFrame {
  return QUEST_UI_ATLAS_FRAMES.find((atlasFrame) => atlasFrame.name === name) ?? QUEST_UI_ATLAS_FRAMES[0];
}

function frame(
  name: string,
  kind: string,
  x: number,
  y: number,
  width: number,
  height: number,
  metadata: Omit<QuestUiAtlasFrame, 'name' | 'kind' | 'bounds'> = {}
): QuestUiAtlasFrame {
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
