import {
  defaultTileBounds,
  getTileAtlasFrame,
  TILE_ATLAS_FRAMES
} from './tileAtlas';
import type {
  Rect,
  TileBoundsKind,
  TileGymBoundsEdit,
  TileGymBoundsOverrides,
  TileGymDebugState
} from './types';

export const TILE_GYM_CONFIG_FILE = '/configs/tile-gym.json';
export const TILE_GYM_CONFIG_SAVE_TARGET = 'configs/tile-gym.json';

export interface TileGymConfigExport {
  version: number;
  savedAt: string;
  tileGym: {
    atlas: 'gameplay-atlas';
    selectedFrameName: string;
    selectedBoundsKind: TileBoundsKind;
    boundsOverrides: TileGymBoundsOverrides;
  };
}

export const DEFAULT_TILE_GYM_STATE: TileGymDebugState = {
  selectedFrameName: TILE_ATLAS_FRAMES[0].name,
  selectedBoundsKind: 'collision',
  boundsOverrides: {}
};

export async function loadTileGymConfig(): Promise<TileGymDebugState | null> {
  try {
    const response = await fetch(TILE_GYM_CONFIG_FILE, { cache: 'no-store' });

    if (!response.ok) {
      return null;
    }

    const config = (await response.json()) as Partial<TileGymConfigExport>;

    return normalizeTileGymState(config.tileGym);
  } catch {
    return null;
  }
}

export function buildTileGymConfigExport(tileGym: TileGymDebugState): TileGymConfigExport {
  const normalized = normalizeTileGymState(tileGym);

  return {
    version: 1,
    savedAt: new Date().toISOString(),
    tileGym: {
      atlas: 'gameplay-atlas',
      selectedFrameName: normalized.selectedFrameName,
      selectedBoundsKind: normalized.selectedBoundsKind,
      boundsOverrides: normalized.boundsOverrides
    }
  };
}

export function normalizeTileGymState(
  value: Partial<TileGymDebugState> | null | undefined
): TileGymDebugState {
  return {
    selectedFrameName: isTileFrameName(value?.selectedFrameName)
      ? value.selectedFrameName
      : DEFAULT_TILE_GYM_STATE.selectedFrameName,
    selectedBoundsKind: isTileBoundsKind(value?.selectedBoundsKind)
      ? value.selectedBoundsKind
      : DEFAULT_TILE_GYM_STATE.selectedBoundsKind,
    boundsOverrides: normalizeBoundsOverrides(value?.boundsOverrides)
  };
}

export function resolveTileBoundsEdit(
  tileGym: TileGymDebugState,
  boundsKind: TileBoundsKind = tileGym.selectedBoundsKind
): TileGymBoundsEdit {
  const atlasFrame = getTileAtlasFrame(tileGym.selectedFrameName);
  const override = tileGym.boundsOverrides[atlasFrame.name]?.[boundsKind];
  const fallback = defaultTileBounds(atlasFrame, boundsKind) ?? centeredFallbackBounds(atlasFrame.bounds);

  return {
    active: override?.active ?? Boolean(defaultTileBounds(atlasFrame, boundsKind)),
    ...(override ?? fallback)
  };
}

function normalizeBoundsOverrides(value: unknown): TileGymBoundsOverrides {
  if (!value || typeof value !== 'object') {
    return {};
  }

  const output: TileGymBoundsOverrides = {};
  const entries = Object.entries(value as Record<string, unknown>);

  entries.forEach(([frameName, frameOverrides]) => {
    if (!isTileFrameName(frameName) || !frameOverrides || typeof frameOverrides !== 'object') {
      return;
    }

    const normalizedFrameOverrides: Partial<Record<TileBoundsKind, TileGymBoundsEdit>> = {};

    (['collision', 'hit'] as const).forEach((boundsKind) => {
      const edit = (frameOverrides as Partial<Record<TileBoundsKind, unknown>>)[boundsKind];
      const normalized = normalizeBoundsEdit(frameName, edit);

      if (normalized) {
        normalizedFrameOverrides[boundsKind] = normalized;
      }
    });

    if (Object.keys(normalizedFrameOverrides).length > 0) {
      output[frameName] = normalizedFrameOverrides;
    }
  });

  return output;
}

function normalizeBoundsEdit(frameName: string, value: unknown): TileGymBoundsEdit | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const atlasFrame = getTileAtlasFrame(frameName);
  const maybeEdit = value as Partial<TileGymBoundsEdit>;
  const active = typeof maybeEdit.active === 'boolean' ? maybeEdit.active : true;
  const width = clampNumber(maybeEdit.width, 1, atlasFrame.bounds.width, atlasFrame.bounds.width);
  const height = clampNumber(maybeEdit.height, 1, atlasFrame.bounds.height, atlasFrame.bounds.height);
  const x = clampNumber(maybeEdit.x, 0, atlasFrame.bounds.width - width, 0);
  const y = clampNumber(maybeEdit.y, 0, atlasFrame.bounds.height - height, 0);

  return {
    active,
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(width),
    height: Math.round(height)
  };
}

function centeredFallbackBounds(frameBounds: Rect): Rect {
  const width = Math.max(1, Math.round(frameBounds.width * 0.6));
  const height = Math.max(1, Math.round(frameBounds.height * 0.6));

  return {
    x: Math.round((frameBounds.width - width) / 2),
    y: Math.round((frameBounds.height - height) / 2),
    width,
    height
  };
}

function isTileFrameName(value: unknown): value is string {
  return typeof value === 'string' && TILE_ATLAS_FRAMES.some((atlasFrame) => atlasFrame.name === value);
}

function isTileBoundsKind(value: unknown): value is TileBoundsKind {
  return value === 'collision' || value === 'hit';
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, value));
}
