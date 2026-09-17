import {
  getTileAtlasFrame,
  TILE_ATLAS_FRAMES,
  type TileAtlasFrame
} from './tileAtlas';
import {
  CHARACTER_DEFINITIONS,
  getCharacterAnimationByAction,
  isCharacterId
} from './hero';
import type {
  LevelEditorHotspotId,
  LevelEditorDebugState,
  LevelEditorGizmoMode,
  LevelEditorLevel,
  LevelEditorMode,
  LevelEditorObject,
  Rect
} from './types';
import {
  PLAYGROUND_METRICS,
  sourceToWorldScale,
  unitsToPx
} from './playgroundMetrics';

export interface LevelEditorCategory {
  id: string;
  label: string;
  kinds: string[];
  hotspotIds?: LevelEditorHotspotId[];
}

export interface LevelEditorAssetOption {
  id: string;
  label: string;
  kind: 'frame' | 'actor' | 'hotspot';
}

export interface LevelEditorLevelExport {
  version: number;
  savedAt: string;
  level: LevelEditorLevel;
}

export const LEVEL_EDITOR_HOTSPOT_CATEGORY_ID = 'hotspots';
export const LEVEL_EDITOR_PLAYER_SPAWN_ID = 'player-spawn' satisfies LevelEditorHotspotId;
export const LEVEL_EDITOR_LEVEL_FILE = '/assets/levels/editor-playground.json';
export const LEVEL_EDITOR_LEVEL_SAVE_TARGET = 'assets/levels/editor-playground.json';
export const LEVEL_EDITOR_LEVEL_FILES: Record<string, string> = {
  'editor-playground': LEVEL_EDITOR_LEVEL_FILE
};
export const LEVEL_EDITOR_WORLD_BOUNDS: Rect = { x: 0, y: 0, width: 1280, height: 720 };
export const LEVEL_EDITOR_DEFAULT_OBJECT_SCALE = sourceToWorldScale(
  PLAYGROUND_METRICS.questAtlasTileSourceHeightPx,
  unitsToPx(1)
);

export const LEVEL_EDITOR_CATEGORIES: readonly LevelEditorCategory[] = [
  { id: 'platforms', label: 'Platforms', kinds: ['whole-platform'] },
  { id: 'tiles', label: 'Tiles', kinds: ['repeatable-tile'] },
  { id: 'props', label: 'Props / Portals', kinds: ['prop', 'object', 'object-part'] },
  { id: 'hazards', label: 'Hazards', kinds: ['hazard'] },
  { id: 'collectibles', label: 'Collectibles', kinds: ['collectible'] },
  { id: 'actors', label: 'Actors', kinds: [] },
  {
    id: LEVEL_EDITOR_HOTSPOT_CATEGORY_ID,
    label: 'Hotspots',
    kinds: [],
    hotspotIds: [LEVEL_EDITOR_PLAYER_SPAWN_ID]
  }
];

export const DEFAULT_LEVEL_EDITOR_LEVEL: LevelEditorLevel = {
  version: 1,
  id: 'editor-playground',
  title: 'Editor Playground',
  width: LEVEL_EDITOR_WORLD_BOUNDS.width,
  height: LEVEL_EDITOR_WORLD_BOUNDS.height,
  bounds: { ...LEVEL_EDITOR_WORLD_BOUNDS },
  playerStart: { x: 142, y: 534 },
  objects: [
    object('ground-left', 'platform-long-grass-stone', 286, 564, 10),
    object('ground-right', 'platform-long-grass-stone', 1068, 564, 10),
    object('center-pillar', 'platform-two-by-two-pillar', 562, 564, 10),
    object('jump-step', 'platform-short-grass-stone', 612, 402, 10),
    object('upper-ledge', 'platform-medium-grass-stone', 815, 274, 10),
    object('right-ledge', 'platform-short-grass-stone', 1080, 388, 10),
    object('spike-strip', 'hazard-spike-strip', 792, 564, 18),
    object('coin', 'collectible-coin', 733, 333, 24),
    object('exit-portal', 'portal-exit-complete', 1190, 564, 12),
    object('grass-tuft', 'prop-grass-tuft', 440, 564, 16),
    object('flower', 'prop-flower', 516, 564, 16)
  ]
};

export function createDefaultLevelEditorDebugState(): LevelEditorDebugState {
  return {
    selectedCategory: LEVEL_EDITOR_CATEGORIES[0].id,
    selectedFrameName: getLevelEditorFramesForCategory(LEVEL_EDITOR_CATEGORIES[0].id)[0]?.name
      ?? TILE_ATLAS_FRAMES[0].name,
    selectedObjectId: DEFAULT_LEVEL_EDITOR_LEVEL.objects[0]?.id ?? null,
    selectedHotspotId: null,
    mode: 'select',
    gizmoMode: 'free',
    snapEnabled: true,
    snapSize: 16,
    cameraScrollX: 0,
    saveStatus: `Loaded from ${LEVEL_EDITOR_LEVEL_FILE}`,
    level: cloneLevel(DEFAULT_LEVEL_EDITOR_LEVEL)
  };
}

export function getLevelEditorLevelUrl(levelId: string): string {
  return LEVEL_EDITOR_LEVEL_FILES[levelId] ?? LEVEL_EDITOR_LEVEL_FILE;
}

export function getLevelEditorLevelSaveTarget(levelId: string): string {
  const levelUrl = getLevelEditorLevelUrl(levelId);

  return levelUrl.startsWith('/') ? levelUrl.slice(1) : levelUrl;
}

export async function loadLevelEditorLevel(levelUrl = LEVEL_EDITOR_LEVEL_FILE): Promise<LevelEditorLevel | null> {
  try {
    const response = await fetch(levelUrl, { cache: 'no-store' });

    if (!response.ok) {
      return null;
    }

    const config = (await response.json()) as Partial<LevelEditorLevelExport>;

    return normalizeLevelEditorLevel(config.level ?? config);
  } catch {
    return null;
  }
}

export function buildLevelEditorLevelExport(level: LevelEditorLevel): LevelEditorLevelExport {
  return {
    version: 1,
    savedAt: new Date().toISOString(),
    level: normalizeLevelEditorLevel(level)
  };
}

export function normalizeLevelEditorDebugState(
  value: Partial<LevelEditorDebugState> | null | undefined
): LevelEditorDebugState {
  const fallback = createDefaultLevelEditorDebugState();
  const selectedCategory = isLevelEditorCategoryId(value?.selectedCategory)
    ? value.selectedCategory
    : fallback.selectedCategory;
  const selectedFrameName = normalizeSelectedFrame(selectedCategory, value?.selectedFrameName);
  const level = normalizeLevelEditorLevel(value?.level);
  const selectedHotspotId = normalizeSelectedHotspotId(value?.selectedHotspotId);
  const selectedObjectId = selectedHotspotId
    ? null
    : normalizeSelectedObjectId(value?.selectedObjectId, level);

  return {
    selectedCategory,
    selectedFrameName,
    selectedObjectId,
    selectedHotspotId,
    mode: isLevelEditorMode(value?.mode) ? value.mode : fallback.mode,
    gizmoMode: isLevelEditorGizmoMode(value?.gizmoMode) ? value.gizmoMode : fallback.gizmoMode,
    snapEnabled: typeof value?.snapEnabled === 'boolean' ? value.snapEnabled : fallback.snapEnabled,
    snapSize: clampNumber(value?.snapSize, 1, 256, fallback.snapSize),
    cameraScrollX: clampNumber(value?.cameraScrollX, level.bounds.x, level.bounds.x + level.bounds.width, fallback.cameraScrollX),
    saveStatus: typeof value?.saveStatus === 'string' ? value.saveStatus : fallback.saveStatus,
    level
  };
}

export function normalizeLevelEditorLevel(
  value: Partial<LevelEditorLevel> | null | undefined
): LevelEditorLevel {
  const fallback = DEFAULT_LEVEL_EDITOR_LEVEL;
  const objects = Array.isArray(value?.objects)
    ? value.objects
        .map((objectDefinition, index) => normalizeObject(objectDefinition, fallback.objects[index], index))
        .filter(isLevelEditorObject)
    : fallback.objects.map((objectDefinition) => ({ ...objectDefinition }));

  return {
    version: 1,
    id: nonEmptyString(value?.id, fallback.id),
    title: nonEmptyString(value?.title, fallback.title),
    width: Math.round(clampNumber(value?.width, 640, 20000, fallback.width)),
    height: Math.round(clampNumber(value?.height, 360, 4000, fallback.height)),
    bounds: normalizeRect(value?.bounds, fallback.bounds),
    playerStart: {
      x: Math.round(clampNumber(value?.playerStart?.x, 0, 50000, fallback.playerStart.x)),
      y: Math.round(clampNumber(value?.playerStart?.y, 0, 10000, fallback.playerStart.y))
    },
    objects
  };
}

export function getLevelEditorAssetOptions(categoryId: string): LevelEditorAssetOption[] {
  const category = LEVEL_EDITOR_CATEGORIES.find((candidate) => candidate.id === categoryId);

  if (!category) {
    return TILE_ATLAS_FRAMES.map((atlasFrame) => ({
      id: atlasFrame.name,
      label: atlasFrame.name,
      kind: 'frame'
    }));
  }

  return [
    ...(category.id === 'actors'
      ? CHARACTER_DEFINITIONS.map((character) => ({
          id: character.id,
          label: character.label,
          kind: 'actor' as const
        }))
      : []),
    ...TILE_ATLAS_FRAMES
      .filter((atlasFrame) => category.kinds.includes(atlasFrame.kind))
      .map((atlasFrame) => ({
        id: atlasFrame.name,
        label: atlasFrame.name,
        kind: 'frame' as const
      })),
    ...(category.hotspotIds ?? []).map((hotspotId) => ({
      id: hotspotId,
      label: hotspotLabel(hotspotId),
      kind: 'hotspot' as const
    }))
  ];
}

export function getLevelEditorFramesForCategory(categoryId: string): TileAtlasFrame[] {
  const category = LEVEL_EDITOR_CATEGORIES.find((candidate) => candidate.id === categoryId);

  if (!category) {
    return [...TILE_ATLAS_FRAMES];
  }

  return TILE_ATLAS_FRAMES.filter((atlasFrame) => category.kinds.includes(atlasFrame.kind));
}

export function isLevelEditorHotspotCategory(categoryId: string): boolean {
  return categoryId === LEVEL_EDITOR_HOTSPOT_CATEGORY_ID;
}

export function hotspotLabel(hotspotId: LevelEditorHotspotId): string {
  if (hotspotId === LEVEL_EDITOR_PLAYER_SPAWN_ID) {
    return 'Player Spawn';
  }

  return hotspotId;
}

export function getLevelEditorCategoryForFrame(frameName: string): LevelEditorCategory {
  if (isCharacterId(frameName)) {
    return LEVEL_EDITOR_CATEGORIES.find((category) => category.id === 'actors') ?? LEVEL_EDITOR_CATEGORIES[0];
  }

  const atlasFrame = getTileAtlasFrame(frameName);

  return (
    LEVEL_EDITOR_CATEGORIES.find((category) => category.kinds.includes(atlasFrame.kind)) ??
    LEVEL_EDITOR_CATEGORIES[0]
  );
}

export function createLevelEditorObject(frameName: string, x: number, y: number): LevelEditorObject {
  if (isCharacterId(frameName)) {
    return {
      id: `${frameName}-${Date.now().toString(36)}`,
      frameName,
      x: Math.round(x),
      y: Math.round(y),
      scale: defaultScaleForAsset(frameName),
      depth: 22
    };
  }

  const atlasFrame = getTileAtlasFrame(frameName);

  return {
    id: `${atlasFrame.name}-${Date.now().toString(36)}`,
    frameName: atlasFrame.name,
    x: Math.round(x),
    y: Math.round(y),
    scale: LEVEL_EDITOR_DEFAULT_OBJECT_SCALE,
    depth: defaultDepthForFrame(atlasFrame)
  };
}

export function defaultDepthForFrame(atlasFrame: TileAtlasFrame): number {
  if (atlasFrame.kind === 'collectible') {
    return 24;
  }

  if (atlasFrame.kind === 'hazard') {
    return 18;
  }

  if (atlasFrame.kind === 'prop') {
    return 16;
  }

  if (atlasFrame.kind === 'object' || atlasFrame.kind === 'object-part') {
    return 12;
  }

  if (atlasFrame.kind === 'actor-reference') {
    return 22;
  }

  return 10;
}

function object(
  id: string,
  frameName: string,
  x: number,
  y: number,
  depth: number,
  scale = LEVEL_EDITOR_DEFAULT_OBJECT_SCALE
): LevelEditorObject {
  return {
    id,
    frameName,
    x,
    y,
    scale,
    depth
  };
}

function cloneLevel(level: LevelEditorLevel): LevelEditorLevel {
  return {
    ...level,
    bounds: { ...level.bounds },
    playerStart: { ...level.playerStart },
    objects: level.objects.map((objectDefinition) => ({ ...objectDefinition }))
  };
}

function normalizeSelectedFrame(categoryId: string, frameName: unknown): string {
  if (isLevelEditorHotspotCategory(categoryId)) {
    return DEFAULT_LEVEL_EDITOR_LEVEL.objects[0]?.frameName ?? TILE_ATLAS_FRAMES[0].name;
  }

  const frames = getLevelEditorFramesForCategory(categoryId);

  if (categoryId === 'actors' && typeof frameName === 'string' && isCharacterId(frameName)) {
    return frameName;
  }

  if (typeof frameName === 'string' && frames.some((atlasFrame) => atlasFrame.name === frameName)) {
    return frameName;
  }

  return categoryId === 'actors' ? CHARACTER_DEFINITIONS[0].id : frames[0]?.name ?? TILE_ATLAS_FRAMES[0].name;
}

function normalizeSelectedObjectId(value: unknown, level: LevelEditorLevel): string | null {
  if (value === null) {
    return null;
  }

  if (typeof value === 'string' && level.objects.some((objectDefinition) => objectDefinition.id === value)) {
    return value;
  }

  return level.objects[0]?.id ?? null;
}

function normalizeSelectedHotspotId(value: unknown): LevelEditorHotspotId | null {
  return value === LEVEL_EDITOR_PLAYER_SPAWN_ID ? value : null;
}

function normalizeObject(
  value: Partial<LevelEditorObject> | null | undefined,
  fallback: LevelEditorObject | undefined,
  index: number
): LevelEditorObject | null {
  if (!value || typeof value !== 'object') {
    return fallback ? { ...fallback } : null;
  }

  const frameName = isLevelEditorAssetId(value.frameName)
    ? value.frameName
    : fallback?.frameName ?? TILE_ATLAS_FRAMES[0].name;
  const depthFallback = isCharacterId(frameName) ? 22 : defaultDepthForFrame(getTileAtlasFrame(frameName));

  return {
    id: nonEmptyString(value.id, fallback?.id ?? `${frameName}-${index + 1}`),
    frameName,
    x: Math.round(clampNumber(value.x, -2000, 50000, fallback?.x ?? 0)),
    y: Math.round(clampNumber(value.y, -2000, 10000, fallback?.y ?? 0)),
    scale: clampNumber(value.scale, 0.1, 8, fallback?.scale ?? defaultScaleForAsset(frameName)),
    depth: Math.round(clampNumber(value.depth, -100, 500, fallback?.depth ?? depthFallback))
  };
}

function normalizeRect(value: Partial<Rect> | null | undefined, fallback: Rect): Rect {
  return {
    x: Math.round(clampNumber(value?.x, -2000, 50000, fallback.x)),
    y: Math.round(clampNumber(value?.y, -2000, 10000, fallback.y)),
    width: Math.round(clampNumber(value?.width, 1, 50000, fallback.width)),
    height: Math.round(clampNumber(value?.height, 1, 10000, fallback.height))
  };
}

function isTileFrameName(value: unknown): value is string {
  return typeof value === 'string' && TILE_ATLAS_FRAMES.some((atlasFrame) => atlasFrame.name === value);
}

export function isLevelEditorActorAssetId(value: unknown): value is string {
  return isCharacterId(value);
}

function isLevelEditorAssetId(value: unknown): value is string {
  return isTileFrameName(value) || isLevelEditorActorAssetId(value);
}

function isLevelEditorObject(value: LevelEditorObject | null): value is LevelEditorObject {
  return value !== null;
}

function isLevelEditorCategoryId(value: unknown): value is string {
  return typeof value === 'string' && LEVEL_EDITOR_CATEGORIES.some((category) => category.id === value);
}

function isLevelEditorMode(value: unknown): value is LevelEditorMode {
  return value === 'select' || value === 'place';
}

function isLevelEditorGizmoMode(value: unknown): value is LevelEditorGizmoMode {
  return value === 'free' || value === 'x' || value === 'y';
}

function nonEmptyString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, value));
}

function defaultScaleForAsset(assetId: string): number {
  if (!isCharacterId(assetId)) {
    return LEVEL_EDITOR_DEFAULT_OBJECT_SCALE;
  }

  const idle = getCharacterAnimationByAction(assetId, 'idle');
  const visualHeight = idle.bounds[0]?.visual.height ?? idle.sheet.frameHeight;

  return sourceToWorldScale(visualHeight, unitsToPx(PLAYGROUND_METRICS.heroTargetVisualHeightUnits));
}
