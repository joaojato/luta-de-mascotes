import * as Phaser from 'phaser';

import type { Rect, TileBoundsKind } from './types';

export const TILE_ATLAS_TEXTURE_KEY = 'quest-tiles-atlas';
export const TILE_ATLAS_IMAGE_URL = '/assets/tiles/quest/atlas-transparent.png';
export const TILE_ATLAS_MANIFEST_URL = '/assets/tiles/quest/atlas-transparent.manifest.json';

export interface TileAtlasFrame {
  name: string;
  kind: string;
  bounds: Rect;
  collision?: Rect;
  trigger?: Rect;
  visualBounds?: Rect;
  anchor?: { x: number; y: number };
  tileable?: { x: boolean; y: boolean };
}

export const TILE_ATLAS_SIZE = {
  width: 1536,
  height: 1024
} as const;

export const TILE_ATLAS_FRAMES: readonly TileAtlasFrame[] = [
  frame('platform-long-grass-stone', 'whole-platform', 69, 94, 510, 87, {
    collision: rect(0, 30, 510, 50),
    anchor: { x: 0.5, y: 1 }
  }),
  frame('platform-medium-grass-stone', 'whole-platform', 662, 94, 304, 87, {
    collision: rect(0, 30, 304, 50),
    anchor: { x: 0.5, y: 1 }
  }),
  frame('platform-short-grass-stone', 'whole-platform', 1052, 94, 165, 87, {
    collision: rect(0, 30, 165, 50),
    anchor: { x: 0.5, y: 1 }
  }),
  frame('platform-floating-ledge', 'whole-platform', 1311, 94, 137, 94, {
    collision: rect(0, 22, 137, 44),
    anchor: { x: 0.5, y: 1 }
  }),
  frame('platform-two-by-two-pillar', 'whole-platform', 79, 246, 157, 163, {
    collision: rect(0, 0, 157, 150),
    anchor: { x: 0.5, y: 1 }
  }),
  frame('platform-single-wide-block', 'whole-platform', 351, 285, 136, 124, {
    collision: rect(0, 28, 136, 88),
    anchor: { x: 0.5, y: 1 }
  }),
  frame('tile-grass-stone-two-block', 'repeatable-tile', 738, 320, 152, 88, {
    collision: rect(0, 0, 152, 88),
    tileable: { x: true, y: false }
  }),
  frame('tile-grass-stone-center', 'repeatable-tile', 571, 321, 99, 88, {
    collision: rect(0, 0, 99, 88),
    tileable: { x: true, y: false }
  }),
  frame('tile-grass-stone-single', 'repeatable-tile', 959, 321, 99, 88, {
    collision: rect(0, 0, 99, 88),
    tileable: { x: true, y: false }
  }),
  frame('tile-square-stone', 'repeatable-tile', 1122, 321, 95, 88, {
    collision: rect(0, 0, 95, 88),
    tileable: { x: true, y: true }
  }),
  frame('portal-exit-complete', 'object', 1252, 395, 202, 250, {
    trigger: rect(47, 78, 104, 158),
    anchor: { x: 0.5, y: 1 }
  }),
  frame('collectible-coin', 'collectible', 785, 510, 89, 90, {
    trigger: rect(0, 0, 89, 90),
    anchor: { x: 0.5, y: 0.5 }
  }),
  frame('hazard-spike-strip', 'hazard', 936, 520, 262, 76, {
    collision: rect(8, 12, 246, 54),
    trigger: rect(8, 12, 246, 54),
    anchor: { x: 0.5, y: 1 }
  }),
  frame('tile-stone-side-face', 'repeatable-tile', 355, 529, 159, 60, {
    collision: rect(0, 0, 159, 60),
    tileable: { x: true, y: false }
  }),
  frame('tile-grass-top-strip', 'repeatable-tile', 77, 536, 213, 39, {
    collision: rect(0, 0, 213, 39),
    tileable: { x: true, y: false }
  }),
  frame('tile-underside-shadow', 'repeatable-tile', 575, 536, 144, 55, {
    collision: rect(0, 0, 144, 55),
    tileable: { x: true, y: false }
  }),
  frame('portal-arch-top', 'object-part', 89, 635, 189, 91),
  frame('portal-left-side', 'object-part', 384, 642, 72, 150, {
    collision: rect(0, 0, 72, 150)
  }),
  frame('portal-right-side', 'object-part', 571, 642, 74, 150, {
    collision: rect(0, 0, 74, 150)
  }),
  frame('prop-bush-clump', 'prop', 1096, 713, 147, 77, {
    anchor: { x: 0.5, y: 1 }
  }),
  frame('prop-flower', 'prop', 922, 721, 76, 67, {
    anchor: { x: 0.5, y: 1 }
  }),
  frame('prop-grass-tuft', 'prop', 746, 722, 84, 66, {
    anchor: { x: 0.5, y: 1 }
  }),
  frame('actor-player-idle-reference', 'actor-reference', 106, 756, 107, 193, {
    anchor: { x: 0.5, y: 1 },
    visualBounds: rect(0, 0, 107, 193),
    collision: rect(26, 52, 56, 132)
  })
];

export function registerTileAtlasFrames(scene: Phaser.Scene): void {
  const texture = scene.textures.get(TILE_ATLAS_TEXTURE_KEY);

  TILE_ATLAS_FRAMES.forEach((atlasFrame) => {
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

export function getTileAtlasFrame(name: string): TileAtlasFrame {
  return TILE_ATLAS_FRAMES.find((atlasFrame) => atlasFrame.name === name) ?? TILE_ATLAS_FRAMES[0];
}

export function defaultTileBounds(
  atlasFrame: TileAtlasFrame,
  boundsKind: TileBoundsKind
): Rect | null {
  if (boundsKind === 'collision') {
    return atlasFrame.collision ?? inferredCollisionBounds(atlasFrame);
  }

  return atlasFrame.trigger ?? inferredHitBounds(atlasFrame);
}

function inferredCollisionBounds(atlasFrame: TileAtlasFrame): Rect | null {
  if (atlasFrame.kind === 'repeatable-tile' || atlasFrame.kind === 'whole-platform') {
    return rect(0, 0, atlasFrame.bounds.width, atlasFrame.bounds.height);
  }

  return null;
}

function inferredHitBounds(atlasFrame: TileAtlasFrame): Rect | null {
  if (atlasFrame.kind === 'collectible' || atlasFrame.kind === 'hazard') {
    return rect(0, 0, atlasFrame.bounds.width, atlasFrame.bounds.height);
  }

  return null;
}

function frame(
  name: string,
  kind: string,
  x: number,
  y: number,
  width: number,
  height: number,
  metadata: Omit<TileAtlasFrame, 'name' | 'kind' | 'bounds'> = {}
): TileAtlasFrame {
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
