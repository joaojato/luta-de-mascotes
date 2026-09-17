import { createStore, type Store } from './store';
import { DEFAULT_BACKGROUND_GYM_STATE } from './backgroundConfig';
import { createDefaultFighterPlaygroundState } from './fighterConfig';
import { RED_BRAWLER_ANIMATION_KEYS, RED_BRAWLER_CHARACTER_ID } from './redBrawler';
import { createDefaultLevelEditorDebugState } from './levelEditor';
import { DEFAULT_STAGE_PREVIEW_STATE } from './stageConfig';
import { DEFAULT_TILE_GYM_STATE } from './tileConfig';
import { SCENE_KEYS, type DebugState } from './types';

export const DEFAULT_DEBUG_STATE: DebugState = {
  activeScene: SCENE_KEYS.Boot,
  paused: false,
  showWorldBounds: false,
  showVisualBounds: false,
  showCollisionBounds: false,
  showHitBounds: false,
  showAssetLabels: false,
  showPerformance: false,
  showTouchControls: false,
  worldBounds: null,
  activeLevelId: 'level-1',
  configSaveStatus: 'Not saved this session',
  characterGym: {
    characterId: RED_BRAWLER_CHARACTER_ID,
    animationKey: RED_BRAWLER_ANIMATION_KEYS.idle,
    paused: false,
    playbackSpeed: 1,
    frame: 0,
    selectedBoundsKind: 'collision',
    gizmoMode: 'translate',
    boundsOverrides: {}
  },
  fighterPlayground: createDefaultFighterPlaygroundState(),
  backgroundGym: {
    selectedLayerKey: DEFAULT_BACKGROUND_GYM_STATE.selectedLayerKey,
    layers: DEFAULT_BACKGROUND_GYM_STATE.layers.map((layer) => ({ ...layer }))
  },
  stagePreview: { ...DEFAULT_STAGE_PREVIEW_STATE },
  tileGym: {
    selectedFrameName: DEFAULT_TILE_GYM_STATE.selectedFrameName,
    selectedBoundsKind: DEFAULT_TILE_GYM_STATE.selectedBoundsKind,
    boundsOverrides: {}
  },
  levelEditor: createDefaultLevelEditorDebugState(),
  pointer: { x: 0, y: 0 },
  performance: {
    fps: 0,
    frameMs: 0,
    worstFrameMs: 0,
    heapUsedMb: null,
    heapLimitMb: null,
    objectCount: 0
  },
  input: {
    up: false,
    down: false,
    left: false,
    right: false,
    run: false,
    jump: false,
    attack: false,
    confirm: false,
    cancel: false,
    pointerDown: false
  }
};

export function createDebugStore(): Store<DebugState> {
  return createStore<DebugState>(DEFAULT_DEBUG_STATE);
}
