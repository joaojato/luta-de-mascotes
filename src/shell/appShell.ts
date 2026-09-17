import * as Phaser from 'phaser';

import {
  buildBackgroundGymConfigExport,
  BACKGROUND_GYM_CONFIG_SAVE_TARGET,
  getBackgroundLayer,
  loadBackgroundGymConfig,
  normalizeBackgroundGymState
} from '../game/backgroundConfig';
import {
  buildCharacterGymConfigExport,
  CHARACTER_GYM_CONFIG_SAVE_TARGET,
  loadCharacterGymConfig,
  mergeCharacterGymConfigState
} from '../game/characterConfig';
import {
  buildDefaultFighterCombat,
  buildDefaultFighterStats,
  buildFighterPlaygroundConfigExport,
  clampFighterCombat,
  clampFighterStats,
  FIGHTER_BOUNDS_FIELDS,
  FIGHTER_COMBAT_FIELDS,
  FIGHTER_PLAYGROUND_CONFIG_SAVE_TARGET,
  FIGHTER_STAT_FIELDS,
  getFighterCombat,
  getFighterStats,
  loadFighterPlaygroundConfig,
  mergeFighterPlaygroundState
} from '../game/fighterConfig';
import {
  buildStarterGameConfigExport,
  createGameConfigStore,
  normalizeStarterGameConfig,
  STARTER_GAME_CONFIG_FILE,
  STARTER_GAME_CONFIG_SAVE_TARGET,
  type StarterGameConfig
} from '../game/core/config';
import { formatInputSnapshot } from '../game/core/input';
import { saveJsonToPublicAsset } from '../game/core/saveJson';
import { setAppContext, type AppContext } from '../game/context';
import { GAME_TAGLINE, GAME_TITLE } from '../game/constants';
import { createDebugStore } from '../game/debug';
import { createGame } from '../game/createGame';
import {
  CHARACTER_DEFINITIONS,
  FIGHTER_CHARACTER_DEFINITIONS,
  defaultHeroBoundsForActivation,
  getCharacterAnimationByAction,
  getCharacterAnimationDefinition,
  getCharacterDefinition,
  getHeroAnimationDefinition,
  resolveHeroBoundsFrame
} from '../game/hero';
import {
  buildLevelEditorLevelExport,
  getLevelEditorAssetOptions,
  getLevelEditorFramesForCategory,
  getLevelEditorLevelUrl,
  getLevelEditorLevelSaveTarget,
  hotspotLabel,
  isLevelEditorActorAssetId,
  isLevelEditorHotspotCategory,
  LEVEL_EDITOR_CATEGORIES,
  LEVEL_EDITOR_LEVEL_SAVE_TARGET,
  LEVEL_EDITOR_PLAYER_SPAWN_ID,
  loadLevelEditorLevel,
  normalizeLevelEditorDebugState
} from '../game/levelEditor';
import {
  buildTileGymConfigExport,
  loadTileGymConfig,
  normalizeTileGymState,
  resolveTileBoundsEdit,
  TILE_GYM_CONFIG_SAVE_TARGET
} from '../game/tileConfig';
import { getTileAtlasFrame, TILE_ATLAS_FRAMES, TILE_ATLAS_SIZE } from '../game/tileAtlas';
import { GAME_PROFILES, resolveStartupProfile } from '../game/profiles';
import {
  clampStagePanSpeed,
  clampStageScroll,
  getStageDefinition,
  STAGE_DEFINITIONS
} from '../game/stageConfig';
import { createSettingsStore } from '../game/settings';
import type { Store } from '../game/store';
import {
  SCENE_KEYS,
  type CharacterBoundsKind,
  type CharacterGymBoundsEdit,
  type CharacterGymDebugState,
  type BackgroundLayerConfig,
  type DebugState,
  type FighterBoundsVisibility,
  type FighterCombat,
  type FighterStats,
  type GameSettings,
  type GameProfile,
  type LevelEditorDebugState,
  type LevelEditorGizmoMode,
  type LevelEditorMode,
  type SceneKey,
  type StagePreviewDebugState,
  type TileBoundsKind,
  type TileGymBoundsEdit,
  type TileGymDebugState
} from '../game/types';
import { renderDebugPanels } from './debugPanels';

type LevelEditorObjectDefinition = LevelEditorDebugState['level']['objects'][number];

const EDITABLE_LEVEL_IDS = ['editor-playground'] as const;

export function createApp(root: HTMLElement): void {
  const searchParams = new URLSearchParams(window.location.search);
  const shellMode = searchParams.get('shell');
  const isGameShellForced = shellMode === 'game';
  const isMobileShell = shellMode === 'mobile';
  const isLocalDevHost = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
  const isDebugShell = !isGameShellForced && !isMobileShell && import.meta.env.DEV && isLocalDevHost;

  root.innerHTML = `
    <div class="app-shell${isDebugShell ? '' : ' app-shell--game-only'}" data-profile="landscape">
      ${isDebugShell ? `
        <header class="app-shell__header">
          <div class="app-shell__brand">
            <p class="eyebrow">PHASER 4 ▸ VITE ▸ TYPESCRIPT</p>
            <h1>${GAME_TITLE.toUpperCase()}</h1>
            ${GAME_TAGLINE ? `<p class="subtitle">${GAME_TAGLINE}</p>` : ''}
          </div>
          <div class="app-shell__header-action">
            <button id="play-toggle" class="shell-button" data-variant="primary" type="button">Play</button>
          </div>
          <div class="app-shell__status">
            <button id="profile-toggle" class="status-chip" type="button" title="Toggle layout">Landscape</button>
            <span id="scene-badge" class="status-chip" data-tone="muted">BootScene</span>
          </div>
        </header>
      ` : ''}
      <div class="app-shell__workspace">
        <section class="game-host">
          ${isDebugShell ? `
            <div class="game-host__bezel-label">
              <span>${GAME_TITLE.toUpperCase()} ▸ GAME</span>
              <span class="dots"><i></i><i></i><i></i></span>
            </div>
          ` : ''}
          <div id="game-root" class="game-root"></div>
        </section>
        ${isDebugShell ? `
          <aside id="debug-panel" class="debug-panel">
            <div class="debug-panel__header">
              <h2 class="debug-panel__title">Debug Console</h2>
              <button id="debug-collapse" class="shell-button" type="button">Collapse</button>
            </div>
            <div class="debug-panel__body">
              <div id="debug-controls" class="debug-panel__controls"></div>
            </div>
          </aside>
        ` : ''}
      </div>
      ${isDebugShell ? `
        <div id="play-toast" class="play-toast" role="status" aria-live="polite">
          Press ESC to leave play mode
        </div>
      ` : ''}
    </div>
  `;

  const appShell = root.querySelector<HTMLElement>('.app-shell');
  const gameRoot = root.querySelector<HTMLElement>('#game-root');
  const debugPanel = root.querySelector<HTMLElement>('#debug-panel');
  const debugControls = root.querySelector<HTMLElement>('#debug-controls');
  const collapseButton = root.querySelector<HTMLButtonElement>('#debug-collapse');
  const playToggle = root.querySelector<HTMLButtonElement>('#play-toggle');
  const playToast = root.querySelector<HTMLElement>('#play-toast');
  const profileToggle = root.querySelector<HTMLButtonElement>('#profile-toggle');
  const sceneBadge = root.querySelector<HTMLElement>('#scene-badge');

  if (!appShell || !gameRoot) {
    throw new Error('App shell failed to mount');
  }

  const settingsStore = createSettingsStore();
  const debugStore = createDebugStore();
  const gameConfigStore = createGameConfigStore();
  let currentProfile = resolveStartupProfile(window.location.search);
  let game: Phaser.Game | null = null;
  let playToastTimeout: number | null = null;

  const context: AppContext = {
    debugStore,
    settingsStore,
    gameConfigStore,
    isDebugShell,
    isMobileShell,
    getProfile: () => currentProfile
  };

  setAppContext(context);

  const loadEditorLevelIntoStore = async (levelId: string, updateActiveLevel: boolean): Promise<void> => {
    const levelUrl = getLevelEditorLevelUrl(levelId);
    const stateBeforeLoad = debugStore.getState();

    debugStore.patchState({
      levelEditor: normalizeLevelEditorDebugState({
        ...stateBeforeLoad.levelEditor,
        saveStatus: `Loading ${levelUrl}...`
      })
    });

    const savedLevel = await loadLevelEditorLevel(levelUrl);
    const state = debugStore.getState();

    if (!savedLevel) {
      debugStore.patchState({
        levelEditor: normalizeLevelEditorDebugState({
          ...state.levelEditor,
          saveStatus: `Could not load ${levelUrl}`
        })
      });
      return;
    }

    debugStore.patchState({
      ...(updateActiveLevel ? { activeLevelId: savedLevel.id } : {}),
      worldBounds: savedLevel.bounds,
      levelEditor: normalizeLevelEditorDebugState({
        ...state.levelEditor,
        level: savedLevel,
        selectedObjectId: savedLevel.objects[0]?.id ?? null,
        selectedHotspotId: null,
        cameraScrollX: savedLevel.bounds.x,
        saveStatus: `Loaded ${levelUrl}`
      })
    });
  };

  void loadStarterGameConfig().then((savedGameConfig) => {
    if (savedGameConfig) {
      gameConfigStore.setState(savedGameConfig);
    }
  });
  void loadCharacterGymConfig().then((savedCharacterGym) => {
    if (!savedCharacterGym) {
      return;
    }

    const state = debugStore.getState();
    debugStore.patchState({
      characterGym: mergeCharacterGymConfigState(state.characterGym, savedCharacterGym)
    });
  });
  void loadFighterPlaygroundConfig().then((savedFighterPlayground) => {
    if (!savedFighterPlayground) {
      return;
    }

    const state = debugStore.getState();
    debugStore.patchState({
      fighterPlayground: mergeFighterPlaygroundState(state.fighterPlayground, savedFighterPlayground)
    });
  });
  void loadBackgroundGymConfig().then((savedBackgroundGym) => {
    if (!savedBackgroundGym) {
      return;
    }

    debugStore.patchState({
      backgroundGym: normalizeBackgroundGymState(savedBackgroundGym)
    });
  });
  void loadTileGymConfig().then((savedTileGym) => {
    if (!savedTileGym) {
      return;
    }

    debugStore.patchState({
      tileGym: normalizeTileGymState(savedTileGym)
    });
  });
  void loadEditorLevelIntoStore('editor-playground', false);

  const showPlayToast = (): void => {
    if (!playToast) {
      return;
    }

    playToast.classList.add('is-visible');

    if (playToastTimeout !== null) {
      window.clearTimeout(playToastTimeout);
    }

    playToastTimeout = window.setTimeout(() => {
      playToast.classList.remove('is-visible');
      playToastTimeout = null;
    }, 2200);
  };

  const enterPlayMode = (): void => {
    if (!isDebugShell || !playToggle || appShell.classList.contains('is-play-mode')) {
      return;
    }

    appShell.classList.add('is-play-mode');
    playToggle.textContent = 'Playing';
    showPlayToast();
  };

  const exitPlayMode = (): void => {
    if (!isDebugShell || !playToggle || !playToast || !appShell.classList.contains('is-play-mode')) {
      return;
    }

    appShell.classList.remove('is-play-mode');
    playToggle.textContent = 'Play';
    playToast.classList.remove('is-visible');

    if (playToastTimeout !== null) {
      window.clearTimeout(playToastTimeout);
      playToastTimeout = null;
    }
  };

  const remountGame = (profile: GameProfile): void => {
    currentProfile = profile;
    const profileConfig = GAME_PROFILES[profile];

    if (profileToggle) {
      profileToggle.textContent = profileConfig.label;
    }

    appShell.dataset.profile = profile;
    game?.destroy(true, false);
    gameRoot.innerHTML = '';
    debugStore.patchState({
      activeScene: SCENE_KEYS.Boot,
      paused: false,
      worldBounds: null
    });
    game = createGame(gameRoot, profile);
  };

  if (isDebugShell) {
    if (
      !debugPanel ||
      !debugControls ||
      !collapseButton ||
      !playToggle ||
      !profileToggle ||
      !sceneBadge
    ) {
      throw new Error('Debug shell controls failed to mount');
    }

    debugControls.innerHTML = renderDebugPanels();
    installNumberDragAdjusters(debugControls);

    const panelSections = Array.from(debugControls.querySelectorAll<HTMLElement>('[data-panel]'));
    const pauseToggle = getElement<HTMLButtonElement>(debugControls, '#pause-toggle');
    const saveGameConfig = getElement<HTMLButtonElement>(debugControls, '#save-game-config');
    const configSaveStatus = getElement<HTMLElement>(debugControls, '#config-save-status');
    const showWorld = getElement<HTMLInputElement>(debugControls, '#show-world');
    const showVisualBounds = getElement<HTMLInputElement>(debugControls, '#show-visual-bounds');
    const showCollisionBounds = getElement<HTMLInputElement>(debugControls, '#show-collision-bounds');
    const showHitBounds = getElement<HTMLInputElement>(debugControls, '#show-hit-bounds');
    const showAssetLabels = getElement<HTMLInputElement>(debugControls, '#show-asset-labels');
    const showPerformance = getElement<HTMLInputElement>(debugControls, '#show-performance');
    const debugSfxVolume = getElement<HTMLInputElement>(debugControls, '#debug-sfx-volume');
    const debugSfxZero = getElement<HTMLButtonElement>(debugControls, '#debug-sfx-zero');
    const debugSfxReadout = getElement<HTMLElement>(debugControls, '#debug-sfx-readout');
    const debugMusicVolume = getElement<HTMLInputElement>(debugControls, '#debug-music-volume');
    const debugMusicZero = getElement<HTMLButtonElement>(debugControls, '#debug-music-zero');
    const debugMusicReadout = getElement<HTMLElement>(debugControls, '#debug-music-readout');
    const showTouchControls = getElement<HTMLInputElement>(debugControls, '#show-touch-controls');
    const configSpeed = getElement<HTMLInputElement>(debugControls, '#config-speed');
    const configJump = getElement<HTMLInputElement>(debugControls, '#config-jump');
    const configGravity = getElement<HTMLInputElement>(debugControls, '#config-gravity');
    const configScale = getElement<HTMLInputElement>(debugControls, '#config-scale');
    const sceneReadout = getElement<HTMLElement>(debugControls, '#scene-readout');
    const levelReadout = getElement<HTMLElement>(debugControls, '#level-readout');
    const pointerReadout = getElement<HTMLElement>(debugControls, '#pointer-readout');
    const inputReadout = getElement<HTMLElement>(debugControls, '#input-readout');
    const fpsReadout = getElement<HTMLElement>(debugControls, '#fps-readout');
    const frameMsReadout = getElement<HTMLElement>(debugControls, '#frame-ms-readout');
    const heapReadout = getElement<HTMLElement>(debugControls, '#heap-readout');
    const objectCountReadout = getElement<HTMLElement>(debugControls, '#object-count-readout');
    const characterSelect = getElement<HTMLSelectElement>(debugControls, '#character-select');
    const characterAnimation = getElement<HTMLSelectElement>(debugControls, '#character-animation');
    const characterFrameButtons = getElement<HTMLElement>(debugControls, '#character-frame-buttons');
    const characterPrevFrame = getElement<HTMLButtonElement>(debugControls, '#character-prev-frame');
    const characterPlayToggle = getElement<HTMLButtonElement>(debugControls, '#character-play-toggle');
    const characterNextFrame = getElement<HTMLButtonElement>(debugControls, '#character-next-frame');
    const characterSpeedButtons = getElement<HTMLElement>(debugControls, '#character-speed-buttons');
    const characterGizmoButtons = getElement<HTMLElement>(debugControls, '#character-gizmo-buttons');
    const characterBoundsKind = getElement<HTMLSelectElement>(debugControls, '#character-bounds-kind');
    const characterBoundsActive = getElement<HTMLInputElement>(debugControls, '#character-bounds-active');
    const characterBoundsCenterX = getElement<HTMLInputElement>(debugControls, '#character-bounds-center-x');
    const characterBoundsCenterY = getElement<HTMLInputElement>(debugControls, '#character-bounds-center-y');
    const characterBoundsWidth = getElement<HTMLInputElement>(debugControls, '#character-bounds-width');
    const characterBoundsHeight = getElement<HTMLInputElement>(debugControls, '#character-bounds-height');
    const characterSaveFrameBounds = getElement<HTMLButtonElement>(debugControls, '#character-save-frame-bounds');
    const characterApplyBoundsAllFrames = getElement<HTMLButtonElement>(
      debugControls,
      '#character-apply-bounds-all-frames'
    );
    const characterResetBounds = getElement<HTMLButtonElement>(debugControls, '#character-reset-bounds');
    const characterSaveAll = getElement<HTMLButtonElement>(debugControls, '#character-save-all');
    const characterSaveStatus = getElement<HTMLElement>(debugControls, '#character-save-status');
    const characterFrameReadout = getElement<HTMLElement>(debugControls, '#character-frame-readout');
    const characterActiveReadout = getElement<HTMLElement>(debugControls, '#character-active-readout');
    const fighterCharacter = getElement<HTMLSelectElement>(debugControls, '#fighter-character');
    const fighterStatInputs = new Map<keyof FighterStats, HTMLInputElement>(
      FIGHTER_STAT_FIELDS.map((field) => [
        field.id,
        getElement<HTMLInputElement>(debugControls, `#fighter-stat-${field.id}`)
      ])
    );
    const fighterCombatInputs = new Map<keyof FighterCombat, HTMLInputElement>(
      FIGHTER_COMBAT_FIELDS.map((field) => [
        field.id,
        getElement<HTMLInputElement>(debugControls, `#fighter-combat-${field.id}`)
      ])
    );
    const fighterResetStats = getElement<HTMLButtonElement>(debugControls, '#fighter-reset-stats');
    const fighterSaveStats = getElement<HTMLButtonElement>(debugControls, '#fighter-save-stats');
    const fighterSaveStatus = getElement<HTMLElement>(debugControls, '#fighter-save-status');
    const fighterReverseWalk = getElement<HTMLInputElement>(debugControls, '#fighter-reverse-walk');
    const fighterFillSpecial = getElement<HTMLInputElement>(debugControls, '#fighter-fill-special');
    const fighterBoundsAll = getElement<HTMLInputElement>(debugControls, '#fighter-bounds-all');
    const fighterBoundsInputs = new Map<keyof FighterBoundsVisibility, HTMLInputElement>(
      FIGHTER_BOUNDS_FIELDS.map((field) => [
        field.id,
        getElement<HTMLInputElement>(debugControls, `#fighter-bounds-${field.id}`)
      ])
    );
    const backgroundLayer = getElement<HTMLSelectElement>(debugControls, '#background-layer');
    const backgroundOffsetX = getElement<HTMLInputElement>(debugControls, '#background-offset-x');
    const backgroundOffsetY = getElement<HTMLInputElement>(debugControls, '#background-offset-y');
    const backgroundScale = getElement<HTMLInputElement>(debugControls, '#background-scale');
    const backgroundVisible = getElement<HTMLInputElement>(debugControls, '#background-visible');
    const backgroundSpeed = getElement<HTMLInputElement>(debugControls, '#background-speed');
    const backgroundAlpha = getElement<HTMLInputElement>(debugControls, '#background-alpha');
    const backgroundSaveLayer = getElement<HTMLButtonElement>(debugControls, '#background-save-layer');
    const backgroundSaveAll = getElement<HTMLButtonElement>(debugControls, '#background-save-all');
    const backgroundSaveStatus = getElement<HTMLElement>(debugControls, '#background-save-status');
    const stagePreviewStage = getElement<HTMLSelectElement>(debugControls, '#stage-preview-stage');
    const stagePreviewScroll = getElement<HTMLInputElement>(debugControls, '#stage-preview-scroll');
    const stagePreviewCenter = getElement<HTMLButtonElement>(debugControls, '#stage-preview-center');
    const stagePreviewAutoPan = getElement<HTMLInputElement>(debugControls, '#stage-preview-autopan');
    const stagePreviewSpeed = getElement<HTMLInputElement>(debugControls, '#stage-preview-speed');
    const stagePreviewGuides = getElement<HTMLInputElement>(debugControls, '#stage-preview-guides');
    const stagePreviewScrollReadout = getElement<HTMLElement>(debugControls, '#stage-preview-scroll-readout');
    const stagePreviewSourceReadout = getElement<HTMLElement>(debugControls, '#stage-preview-source-readout');
    const stagePreviewFittedReadout = getElement<HTMLElement>(debugControls, '#stage-preview-fitted-readout');
    const tileFrame = getElement<HTMLSelectElement>(debugControls, '#tile-frame');
    const tileBoundsKind = getElement<HTMLSelectElement>(debugControls, '#tile-bounds-kind');
    const tileBoundsActive = getElement<HTMLInputElement>(debugControls, '#tile-bounds-active');
    const tileBoundsCenterX = getElement<HTMLInputElement>(debugControls, '#tile-bounds-center-x');
    const tileBoundsCenterY = getElement<HTMLInputElement>(debugControls, '#tile-bounds-center-y');
    const tileBoundsWidth = getElement<HTMLInputElement>(debugControls, '#tile-bounds-width');
    const tileBoundsHeight = getElement<HTMLInputElement>(debugControls, '#tile-bounds-height');
    const tileSaveBounds = getElement<HTMLButtonElement>(debugControls, '#tile-save-bounds');
    const tileResetBounds = getElement<HTMLButtonElement>(debugControls, '#tile-reset-bounds');
    const tileSaveAll = getElement<HTMLButtonElement>(debugControls, '#tile-save-all');
    const tileSaveStatus = getElement<HTMLElement>(debugControls, '#tile-save-status');
    const tileKindReadout = getElement<HTMLElement>(debugControls, '#tile-kind-readout');
    const tileSizeReadout = getElement<HTMLElement>(debugControls, '#tile-size-readout');
    const levelEditorLevel = getElement<HTMLSelectElement>(debugControls, '#level-editor-level');
    const levelEditorCameraX = getElement<HTMLInputElement>(debugControls, '#level-editor-camera-x');
    const levelEditorCameraStart = getElement<HTMLButtonElement>(debugControls, '#level-editor-camera-start');
    const levelEditorCameraLeft = getElement<HTMLButtonElement>(debugControls, '#level-editor-camera-left');
    const levelEditorCameraRight = getElement<HTMLButtonElement>(debugControls, '#level-editor-camera-right');
    const levelEditorCameraEnd = getElement<HTMLButtonElement>(debugControls, '#level-editor-camera-end');
    const levelEditorCameraReadout = getElement<HTMLElement>(debugControls, '#level-editor-camera-readout');
    const levelEditorCategory = getElement<HTMLSelectElement>(debugControls, '#level-editor-category');
    const levelEditorAsset = getElement<HTMLSelectElement>(debugControls, '#level-editor-asset');
    const levelEditorAssetPreview = getElement<HTMLElement>(debugControls, '#level-editor-asset-preview');
    const levelEditorSelectMode = getElement<HTMLButtonElement>(debugControls, '#level-editor-select-mode');
    const levelEditorPlaceMode = getElement<HTMLButtonElement>(debugControls, '#level-editor-place-mode');
    const levelEditorGizmo = getElement<HTMLSelectElement>(debugControls, '#level-editor-gizmo');
    const levelEditorSnap = getElement<HTMLInputElement>(debugControls, '#level-editor-snap');
    const levelEditorSnapSize = getElement<HTMLInputElement>(debugControls, '#level-editor-snap-size');
    const levelEditorObjectX = getElement<HTMLInputElement>(debugControls, '#level-editor-object-x');
    const levelEditorObjectY = getElement<HTMLInputElement>(debugControls, '#level-editor-object-y');
    const levelEditorObjectScale = getElement<HTMLInputElement>(debugControls, '#level-editor-object-scale');
    const levelEditorObjectDepth = getElement<HTMLInputElement>(debugControls, '#level-editor-object-depth');
    const levelEditorDuplicate = getElement<HTMLButtonElement>(debugControls, '#level-editor-duplicate');
    const levelEditorDelete = getElement<HTMLButtonElement>(debugControls, '#level-editor-delete');
    const levelEditorSave = getElement<HTMLButtonElement>(debugControls, '#level-editor-save');
    const levelEditorSaveStatus = getElement<HTMLElement>(debugControls, '#level-editor-save-status');
    const levelEditorSelectedReadout = getElement<HTMLElement>(debugControls, '#level-editor-selected-readout');
    const levelEditorCountReadout = getElement<HTMLElement>(debugControls, '#level-editor-count-readout');

    characterSelect.innerHTML = CHARACTER_DEFINITIONS.map(
      (character) => `<option value="${character.id}">${character.label}</option>`
    ).join('');
    fighterCharacter.innerHTML = FIGHTER_CHARACTER_DEFINITIONS.map(
      (character) => `<option value="${character.id}">${character.label}</option>`
    ).join('');
    backgroundLayer.innerHTML = debugStore.getState().backgroundGym.layers.map(
      (layer) => `<option value="${layer.key}">${layer.label}</option>`
    ).join('');
    stagePreviewStage.innerHTML = STAGE_DEFINITIONS.map(
      (stage) => `<option value="${stage.id}">${stage.label}</option>`
    ).join('');
    levelEditorLevel.innerHTML = renderLevelEditorLevelOptions();
    tileFrame.innerHTML = TILE_ATLAS_FRAMES.map(
      (atlasFrame) => `<option value="${atlasFrame.name}">${atlasFrame.name}</option>`
    ).join('');
    levelEditorCategory.innerHTML = LEVEL_EDITOR_CATEGORIES.map(
      (category) => `<option value="${category.id}">${category.label}</option>`
    ).join('');

    pauseToggle.addEventListener('click', () => {
      debugStore.patchState({ paused: !debugStore.getState().paused });
    });
    showWorld.addEventListener('change', () => {
      debugStore.patchState({ showWorldBounds: showWorld.checked });
    });
    showVisualBounds.addEventListener('change', () => {
      debugStore.patchState({ showVisualBounds: showVisualBounds.checked });
    });
    showCollisionBounds.addEventListener('change', () => {
      debugStore.patchState({ showCollisionBounds: showCollisionBounds.checked });
    });
    showHitBounds.addEventListener('change', () => {
      debugStore.patchState({ showHitBounds: showHitBounds.checked });
    });
    showAssetLabels.addEventListener('change', () => {
      debugStore.patchState({ showAssetLabels: showAssetLabels.checked });
    });
    showPerformance.addEventListener('change', () => {
      debugStore.patchState({ showPerformance: showPerformance.checked });
    });
    debugSfxVolume.addEventListener('input', () => {
      settingsStore.patchState({ sfxVolume: readVolumeSliderValue(debugSfxVolume) });
    });
    debugSfxZero.addEventListener('click', () => {
      settingsStore.patchState({ sfxVolume: 0 });
    });
    debugMusicVolume.addEventListener('input', () => {
      settingsStore.patchState({ musicVolume: readVolumeSliderValue(debugMusicVolume) });
    });
    debugMusicZero.addEventListener('click', () => {
      settingsStore.patchState({ musicVolume: 0 });
    });
    showTouchControls.addEventListener('change', () => {
      debugStore.patchState({ showTouchControls: showTouchControls.checked });
    });
    characterSelect.addEventListener('change', () => {
      const character = getCharacterDefinition(characterSelect.value);
      const idle = getCharacterAnimationByAction(character.id, 'idle');

      patchCharacterGym(debugStore, (characterGym) => ({
        ...characterGym,
        characterId: character.id,
        animationKey: idle.key,
        frame: 0,
        paused: false
      }));
    });
    characterAnimation.addEventListener('change', () => {
      const animation = getHeroAnimationDefinition(characterAnimation.value);

      patchCharacterGym(debugStore, (characterGym) => ({
        ...characterGym,
        characterId: animation.characterId,
        animationKey: characterAnimation.value,
        frame: 0,
        paused: false
      }));
    });
    characterFrameButtons.addEventListener('click', (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-frame]');

      if (!button) {
        return;
      }

      patchCharacterGym(debugStore, (characterGym) => ({
        ...characterGym,
        frame: Number(button.dataset.frame ?? 0),
        paused: true
      }));
    });
    characterPrevFrame.addEventListener('click', () => {
      patchCharacterGym(debugStore, (characterGym) => {
        const animation = getCharacterAnimationDefinition(characterGym.characterId, characterGym.animationKey);

        return {
          ...characterGym,
          frame: wrapFrame(characterGym.frame - 1, animation.sheet.frames),
          paused: true
        };
      });
    });
    characterNextFrame.addEventListener('click', () => {
      patchCharacterGym(debugStore, (characterGym) => {
        const animation = getCharacterAnimationDefinition(characterGym.characterId, characterGym.animationKey);

        return {
          ...characterGym,
          frame: wrapFrame(characterGym.frame + 1, animation.sheet.frames),
          paused: true
        };
      });
    });
    characterPlayToggle.addEventListener('click', () => {
      patchCharacterGym(debugStore, (characterGym) => ({
        ...characterGym,
        paused: !characterGym.paused
      }));
    });
    characterSpeedButtons.addEventListener('click', (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-speed]');

      if (!button) {
        return;
      }

      patchCharacterGym(debugStore, (characterGym) => ({
        ...characterGym,
        playbackSpeed: Number(button.dataset.speed ?? 1)
      }));
    });
    characterGizmoButtons.addEventListener('click', (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-gizmo]');

      if (!button) {
        return;
      }

      patchCharacterGym(debugStore, (characterGym) => ({
        ...characterGym,
        gizmoMode: button.dataset.gizmo === 'scale' ? 'scale' : 'translate'
      }));
    });
    characterBoundsKind.addEventListener('change', () => {
      patchCharacterGym(debugStore, (characterGym) => ({
        ...characterGym,
        selectedBoundsKind: characterBoundsKind.value as CharacterBoundsKind
      }));
    });

    const updateSelectedBounds = (): void => {
      const edit = readSelectedBoundsEdit(debugStore.getState(), {
        active: characterBoundsActive,
        centerX: characterBoundsCenterX,
        centerY: characterBoundsCenterY,
        width: characterBoundsWidth,
        height: characterBoundsHeight
      });

      if (edit) {
        setCharacterBoundsOverride(debugStore, debugStore.getState().characterGym.selectedBoundsKind, edit);
      }
    };
    characterBoundsActive.addEventListener('change', () => {
      const state = debugStore.getState();
      const boundsKind = state.characterGym.selectedBoundsKind;
      const current = currentBoundsEdit(state.characterGym, boundsKind);

      setCharacterBoundsOverride(debugStore, boundsKind, {
        ...current,
        active: boundsKind === 'visual' ? true : characterBoundsActive.checked
      });
    });
    characterBoundsCenterX.addEventListener('input', updateSelectedBounds);
    characterBoundsCenterY.addEventListener('input', updateSelectedBounds);
    characterBoundsWidth.addEventListener('input', updateSelectedBounds);
    characterBoundsHeight.addEventListener('input', updateSelectedBounds);
    characterSaveFrameBounds.addEventListener('click', () => {
      const edit = readSelectedBoundsEdit(debugStore.getState(), {
        active: characterBoundsActive,
        centerX: characterBoundsCenterX,
        centerY: characterBoundsCenterY,
        width: characterBoundsWidth,
        height: characterBoundsHeight
      });

      if (!edit) {
        characterSaveStatus.textContent = 'Cannot save: bounds inputs are invalid';
        return;
      }

      setCharacterBoundsOverride(debugStore, debugStore.getState().characterGym.selectedBoundsKind, edit);
      characterSaveStatus.textContent = 'Saved selected bounds for this frame';
    });
    characterApplyBoundsAllFrames.addEventListener('click', () => {
      const state = debugStore.getState();
      const boundsKind = state.characterGym.selectedBoundsKind;
      const edit = readSelectedBoundsEdit(state, {
        active: characterBoundsActive,
        centerX: characterBoundsCenterX,
        centerY: characterBoundsCenterY,
        width: characterBoundsWidth,
        height: characterBoundsHeight
      });

      if (!edit) {
        characterSaveStatus.textContent = 'Cannot apply: bounds inputs are invalid';
        return;
      }

      applyCharacterBoundsToAllFrames(debugStore, boundsKind, edit);
      characterSaveStatus.textContent = `Applied ${boundsKind} bounds to all frames in this animation`;
    });
    characterResetBounds.addEventListener('click', () => {
      resetCharacterFrameBounds(debugStore);
      characterSaveStatus.textContent = 'Reset frame bounds to generated defaults';
    });
    characterSaveAll.addEventListener('click', async () => {
      characterSaveStatus.textContent = 'Saving public/configs/character-gym.json...';
      const result = await saveJsonToPublicAsset(
        CHARACTER_GYM_CONFIG_SAVE_TARGET,
        buildCharacterGymConfigExport(debugStore.getState().characterGym)
      );
      characterSaveStatus.textContent = result.ok
        ? 'Saved public/configs/character-gym.json'
        : result.error ?? 'Save failed';
    });
    fighterCharacter.addEventListener('change', () => {
      patchFighterPlayground(debugStore, (fighterPlayground) => ({
        ...fighterPlayground,
        characterId: fighterCharacter.value
      }));
    });

    const commitFighterStats = (): void => {
      const fighterPlayground = debugStore.getState().fighterPlayground;
      const characterId = fighterPlayground.characterId;
      const next: FighterStats = { ...getFighterStats(fighterPlayground, characterId) };

      FIGHTER_STAT_FIELDS.forEach((field) => {
        const input = fighterStatInputs.get(field.id);
        const value = input ? Number(input.value) : Number.NaN;

        if (Number.isFinite(value)) {
          next[field.id] = value;
        }
      });

      patchFighterPlayground(debugStore, (state) => ({
        ...state,
        stats: { ...state.stats, [characterId]: clampFighterStats(next) }
      }));
    };

    fighterStatInputs.forEach((input) => input.addEventListener('input', commitFighterStats));

    const commitFighterCombat = (): void => {
      const fighterPlayground = debugStore.getState().fighterPlayground;
      const characterId = fighterPlayground.characterId;
      const next: FighterCombat = { ...getFighterCombat(fighterPlayground, characterId) };

      FIGHTER_COMBAT_FIELDS.forEach((field) => {
        const input = fighterCombatInputs.get(field.id);
        const value = input ? Number(input.value) : Number.NaN;

        if (Number.isFinite(value)) {
          next[field.id] = value;
        }
      });

      patchFighterPlayground(debugStore, (state) => ({
        ...state,
        combat: { ...state.combat, [characterId]: clampFighterCombat(next) }
      }));
    };

    fighterCombatInputs.forEach((input) => input.addEventListener('input', commitFighterCombat));
    fighterResetStats.addEventListener('click', () => {
      const characterId = debugStore.getState().fighterPlayground.characterId;
      const defaults = buildDefaultFighterStats()[characterId] ?? clampFighterStats({});
      const combatDefaults = buildDefaultFighterCombat()[characterId] ?? clampFighterCombat({});

      patchFighterPlayground(debugStore, (state) => ({
        ...state,
        stats: { ...state.stats, [characterId]: defaults },
        combat: { ...state.combat, [characterId]: combatDefaults }
      }));
      fighterSaveStatus.textContent = 'Reset fighter to defaults (unsaved)';
    });
    fighterSaveStats.addEventListener('click', async () => {
      fighterSaveStatus.textContent = 'Saving public/configs/fighter-playground.json...';
      const result = await saveJsonToPublicAsset(
        FIGHTER_PLAYGROUND_CONFIG_SAVE_TARGET,
        buildFighterPlaygroundConfigExport(debugStore.getState().fighterPlayground)
      );
      fighterSaveStatus.textContent = result.ok
        ? 'Saved public/configs/fighter-playground.json'
        : result.error ?? 'Save failed';
    });
    fighterReverseWalk.addEventListener('change', () => {
      patchFighterPlayground(debugStore, (state) => ({
        ...state,
        reverseWalk: fighterReverseWalk.checked
      }));
    });
    fighterFillSpecial.addEventListener('change', () => {
      patchFighterPlayground(debugStore, (state) => ({
        ...state,
        fillSpecial: fighterFillSpecial.checked
      }));
    });
    fighterBoundsInputs.forEach((input, id) => {
      input.addEventListener('change', () => {
        patchFighterPlayground(debugStore, (state) => ({
          ...state,
          bounds: { ...state.bounds, [id]: input.checked }
        }));
      });
    });
    fighterBoundsAll.addEventListener('change', () => {
      const checked = fighterBoundsAll.checked;

      patchFighterPlayground(debugStore, (state) => ({
        ...state,
        bounds: Object.fromEntries(
          FIGHTER_BOUNDS_FIELDS.map((field) => [field.id, checked])
        ) as unknown as FighterBoundsVisibility
      }));
    });
    backgroundLayer.addEventListener('change', () => {
      patchBackgroundGym(debugStore, (backgroundGym) => ({
        ...backgroundGym,
        selectedLayerKey: backgroundLayer.value
      }));
    });

    const updateSelectedBackgroundLayer = (): void => {
      const edit = readSelectedBackgroundLayerEdit(debugStore.getState(), {
        offsetX: backgroundOffsetX,
        offsetY: backgroundOffsetY,
        scale: backgroundScale,
        visible: backgroundVisible,
        speed: backgroundSpeed,
        alpha: backgroundAlpha
      });

      if (!edit) {
        return;
      }

      setBackgroundLayerConfig(debugStore, edit);
    };

    backgroundOffsetX.addEventListener('input', updateSelectedBackgroundLayer);
    backgroundOffsetY.addEventListener('input', updateSelectedBackgroundLayer);
    backgroundScale.addEventListener('input', updateSelectedBackgroundLayer);
    backgroundVisible.addEventListener('change', updateSelectedBackgroundLayer);
    backgroundSpeed.addEventListener('input', updateSelectedBackgroundLayer);
    backgroundAlpha.addEventListener('input', updateSelectedBackgroundLayer);
    backgroundSaveLayer.addEventListener('click', () => {
      const edit = readSelectedBackgroundLayerEdit(debugStore.getState(), {
        offsetX: backgroundOffsetX,
        offsetY: backgroundOffsetY,
        scale: backgroundScale,
        visible: backgroundVisible,
        speed: backgroundSpeed,
        alpha: backgroundAlpha
      });

      if (!edit) {
        backgroundSaveStatus.textContent = 'Cannot save: layer inputs are invalid';
        return;
      }

      setBackgroundLayerConfig(debugStore, edit);
      backgroundSaveStatus.textContent = `Saved ${edit.label} layer in memory`;
    });
    backgroundSaveAll.addEventListener('click', async () => {
      backgroundSaveStatus.textContent = 'Saving public/configs/background-gym.json...';
      const result = await saveJsonToPublicAsset(
        BACKGROUND_GYM_CONFIG_SAVE_TARGET,
        buildBackgroundGymConfigExport(debugStore.getState().backgroundGym)
      );
      backgroundSaveStatus.textContent = result.ok
        ? 'Saved public/configs/background-gym.json'
        : result.error ?? 'Save failed';
    });
    stagePreviewStage.addEventListener('change', () => {
      patchStagePreview(debugStore, (stagePreview) => ({
        ...stagePreview,
        stageId: stagePreviewStage.value
      }));
    });
    stagePreviewScroll.addEventListener('input', () => {
      patchStagePreview(debugStore, (stagePreview) => ({
        ...stagePreview,
        scrollX: clampStageScroll(Number(stagePreviewScroll.value), stagePreview.maxScroll),
        autoPan: false
      }));
    });
    stagePreviewCenter.addEventListener('click', () => {
      patchStagePreview(debugStore, (stagePreview) => ({
        ...stagePreview,
        scrollX: stagePreview.maxScroll / 2,
        autoPan: false
      }));
    });
    stagePreviewAutoPan.addEventListener('change', () => {
      patchStagePreview(debugStore, (stagePreview) => ({
        ...stagePreview,
        autoPan: stagePreviewAutoPan.checked
      }));
    });
    stagePreviewSpeed.addEventListener('input', () => {
      patchStagePreview(debugStore, (stagePreview) => ({
        ...stagePreview,
        panSpeed: clampStagePanSpeed(Number(stagePreviewSpeed.value))
      }));
    });
    stagePreviewGuides.addEventListener('change', () => {
      patchStagePreview(debugStore, (stagePreview) => ({
        ...stagePreview,
        showGuides: stagePreviewGuides.checked
      }));
    });
    tileFrame.addEventListener('change', () => {
      patchTileGym(debugStore, (tileGym) => ({
        ...tileGym,
        selectedFrameName: tileFrame.value
      }));
    });
    tileBoundsKind.addEventListener('change', () => {
      patchTileGym(debugStore, (tileGym) => ({
        ...tileGym,
        selectedBoundsKind: tileBoundsKind.value as TileBoundsKind
      }));
    });

    const updateSelectedTileBounds = (): void => {
      const edit = readSelectedTileBoundsEdit(debugStore.getState(), {
        active: tileBoundsActive,
        centerX: tileBoundsCenterX,
        centerY: tileBoundsCenterY,
        width: tileBoundsWidth,
        height: tileBoundsHeight
      });

      if (edit) {
        setTileBoundsOverride(debugStore, debugStore.getState().tileGym.selectedBoundsKind, edit);
      }
    };

    tileBoundsActive.addEventListener('change', updateSelectedTileBounds);
    tileBoundsCenterX.addEventListener('input', updateSelectedTileBounds);
    tileBoundsCenterY.addEventListener('input', updateSelectedTileBounds);
    tileBoundsWidth.addEventListener('input', updateSelectedTileBounds);
    tileBoundsHeight.addEventListener('input', updateSelectedTileBounds);
    tileSaveBounds.addEventListener('click', () => {
      const edit = readSelectedTileBoundsEdit(debugStore.getState(), {
        active: tileBoundsActive,
        centerX: tileBoundsCenterX,
        centerY: tileBoundsCenterY,
        width: tileBoundsWidth,
        height: tileBoundsHeight
      });

      if (!edit) {
        tileSaveStatus.textContent = 'Cannot save: bounds inputs are invalid';
        return;
      }

      setTileBoundsOverride(debugStore, debugStore.getState().tileGym.selectedBoundsKind, edit);
      tileSaveStatus.textContent = 'Saved selected bounds in memory';
    });
    tileResetBounds.addEventListener('click', () => {
      resetTileBoundsOverride(debugStore);
      tileSaveStatus.textContent = 'Reset selected bounds to manifest defaults';
    });
    tileSaveAll.addEventListener('click', async () => {
      tileSaveStatus.textContent = 'Saving public/configs/tile-gym.json...';
      const result = await saveJsonToPublicAsset(
        TILE_GYM_CONFIG_SAVE_TARGET,
        buildTileGymConfigExport(debugStore.getState().tileGym)
      );
      tileSaveStatus.textContent = result.ok
        ? 'Saved public/configs/tile-gym.json'
        : result.error ?? 'Save failed';
    });
    levelEditorLevel.addEventListener('change', () => {
      void loadEditorLevelIntoStore(levelEditorLevel.value, true);
    });
    levelEditorCameraX.addEventListener('input', () => {
      setLevelEditorCameraScroll(debugStore, Number(levelEditorCameraX.value), currentProfile);
    });
    levelEditorCameraStart.addEventListener('click', () => {
      const range = levelEditorCameraRange(debugStore.getState().levelEditor, currentProfile);
      setLevelEditorCameraScroll(debugStore, range.min, currentProfile);
    });
    levelEditorCameraLeft.addEventListener('click', () => {
      const state = debugStore.getState().levelEditor;
      const step = Math.max(160, GAME_PROFILES[currentProfile].width * 0.45);
      setLevelEditorCameraScroll(debugStore, state.cameraScrollX - step, currentProfile);
    });
    levelEditorCameraRight.addEventListener('click', () => {
      const state = debugStore.getState().levelEditor;
      const step = Math.max(160, GAME_PROFILES[currentProfile].width * 0.45);
      setLevelEditorCameraScroll(debugStore, state.cameraScrollX + step, currentProfile);
    });
    levelEditorCameraEnd.addEventListener('click', () => {
      const range = levelEditorCameraRange(debugStore.getState().levelEditor, currentProfile);
      setLevelEditorCameraScroll(debugStore, range.max, currentProfile);
    });
    levelEditorCategory.addEventListener('change', () => {
      const options = getLevelEditorAssetOptions(levelEditorCategory.value);
      const frames = getLevelEditorFramesForCategory(levelEditorCategory.value);
      const isHotspotCategory = isLevelEditorHotspotCategory(levelEditorCategory.value);
      const selectedAssetId = options[0]?.id ?? frames[0]?.name;

      patchLevelEditor(debugStore, (levelEditor) => ({
        ...levelEditor,
        selectedCategory: levelEditorCategory.value,
        selectedFrameName: selectedAssetId ?? levelEditor.selectedFrameName,
        selectedObjectId: isHotspotCategory ? null : levelEditor.selectedObjectId,
        selectedHotspotId: isHotspotCategory ? LEVEL_EDITOR_PLAYER_SPAWN_ID : null,
        mode: isHotspotCategory ? 'place' : levelEditor.mode
      }));
    });
    levelEditorAsset.addEventListener('change', () => {
      if (levelEditorAsset.value === LEVEL_EDITOR_PLAYER_SPAWN_ID) {
        patchLevelEditor(debugStore, (levelEditor) => ({
          ...levelEditor,
          selectedHotspotId: LEVEL_EDITOR_PLAYER_SPAWN_ID,
          selectedObjectId: null
        }));
        return;
      }

      patchLevelEditor(debugStore, (levelEditor) => ({
        ...levelEditor,
        selectedFrameName: levelEditorAsset.value,
        selectedHotspotId: null
      }));
    });
    levelEditorSelectMode.addEventListener('click', () => {
      setLevelEditorMode(debugStore, 'select');
    });
    levelEditorPlaceMode.addEventListener('click', () => {
      setLevelEditorMode(debugStore, 'place');
    });
    levelEditorGizmo.addEventListener('change', () => {
      patchLevelEditor(debugStore, (levelEditor) => ({
        ...levelEditor,
        gizmoMode: levelEditorGizmo.value as LevelEditorGizmoMode
      }));
    });
    levelEditorSnap.addEventListener('change', () => {
      patchLevelEditor(debugStore, (levelEditor) => ({
        ...levelEditor,
        snapEnabled: levelEditorSnap.checked
      }));
    });
    levelEditorSnapSize.addEventListener('input', () => {
      patchLevelEditor(debugStore, (levelEditor) => ({
        ...levelEditor,
        snapSize: Number(levelEditorSnapSize.value)
      }));
    });

    const updateSelectedLevelEditorObject = (): void => {
      if (debugStore.getState().levelEditor.selectedHotspotId === LEVEL_EDITOR_PLAYER_SPAWN_ID) {
        const edit = readLevelEditorPositionEdit({
          x: levelEditorObjectX,
          y: levelEditorObjectY
        });

        if (!edit) {
          return;
        }

        patchLevelEditor(debugStore, (levelEditor) => ({
          ...levelEditor,
          selectedObjectId: null,
          selectedHotspotId: LEVEL_EDITOR_PLAYER_SPAWN_ID,
          level: {
            ...levelEditor.level,
            playerStart: edit
          }
        }));
        return;
      }

      const edit = readLevelEditorObjectEdit({
        x: levelEditorObjectX,
        y: levelEditorObjectY,
        scale: levelEditorObjectScale,
        depth: levelEditorObjectDepth
      });

      if (!edit) {
        return;
      }

      patchSelectedLevelEditorObject(debugStore, (objectDefinition) => ({
        ...objectDefinition,
        ...edit
      }));
    };

    levelEditorObjectX.addEventListener('input', updateSelectedLevelEditorObject);
    levelEditorObjectY.addEventListener('input', updateSelectedLevelEditorObject);
    levelEditorObjectScale.addEventListener('input', updateSelectedLevelEditorObject);
    levelEditorObjectDepth.addEventListener('input', updateSelectedLevelEditorObject);
    levelEditorDuplicate.addEventListener('click', () => {
      duplicateSelectedLevelEditorObject(debugStore);
    });
    levelEditorDelete.addEventListener('click', () => {
      deleteSelectedLevelEditorObject(debugStore);
    });
    levelEditorSave.addEventListener('click', async () => {
      const level = debugStore.getState().levelEditor.level;
      const saveTarget = getLevelEditorLevelSaveTarget(level.id) || LEVEL_EDITOR_LEVEL_SAVE_TARGET;

      setLevelEditorSaveStatus(debugStore, `Saving public/${saveTarget}...`);
      const result = await saveJsonToPublicAsset(
        saveTarget,
        buildLevelEditorLevelExport(level)
      );
      setLevelEditorSaveStatus(
        debugStore,
        result.ok ? `Saved public/${saveTarget}` : result.error ?? 'Save failed'
      );
    });

    const gameConfigInputs = {
      speed: configSpeed,
      jump: configJump,
      gravity: configGravity,
      scale: configScale
    };
    const syncConfigFromInputs = (): void => {
      const currentConfig = gameConfigStore.getState();

      gameConfigStore.setState(
        normalizeStarterGameConfig({
          ...currentConfig,
          playerSpeed: readConfigInputNumber(configSpeed, currentConfig.playerSpeed),
          jumpVelocity: readConfigInputNumber(configJump, currentConfig.jumpVelocity),
          gravity: readConfigInputNumber(configGravity, currentConfig.gravity),
          actorScale: readConfigInputNumber(configScale, currentConfig.actorScale)
        })
      );
    };
    const commitConfigInputs = (): void => {
      syncConfigFromInputs();
      syncGameConfigInputs(gameConfigStore.getState(), gameConfigInputs, true);
    };
    Object.values(gameConfigInputs).forEach((input) => {
      input.addEventListener('input', syncConfigFromInputs);
      input.addEventListener('change', commitConfigInputs);
      input.addEventListener('blur', commitConfigInputs);
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          input.blur();
        }
      });
    });

    saveGameConfig.addEventListener('click', async () => {
      debugStore.patchState({ configSaveStatus: 'Saving game-config.json...' });
      const result = await saveJsonToPublicAsset(
        STARTER_GAME_CONFIG_SAVE_TARGET,
        buildStarterGameConfigExport(gameConfigStore.getState())
      );
      debugStore.patchState({
        configSaveStatus: result.ok
          ? 'Saved public/assets/config/game-config.json'
          : result.error ?? 'Save failed'
      });
    });

    collapseButton.addEventListener('click', () => {
      debugPanel.classList.toggle('is-collapsed');
      collapseButton.textContent = debugPanel.classList.contains('is-collapsed') ? 'Expand' : 'Collapse';
    });
    playToggle.addEventListener('click', () => {
      if (appShell.classList.contains('is-play-mode')) {
        exitPlayMode();
      } else {
        enterPlayMode();
      }
    });
    profileToggle.addEventListener('click', () => {
      const next: GameProfile = currentProfile === 'landscape' ? 'portrait' : 'landscape';
      remountGame(next);
    });
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        exitPlayMode();
      }
    });

    let renderedCharacterAnimationOptionsKey = '';
    let renderedFrameSelectorKey = '';
    const syncCharacterGymPanel = (state: DebugState): void => {
      const characterGym = state.characterGym;
      const character = getCharacterDefinition(characterGym.characterId);
      const animation = getCharacterAnimationDefinition(character.id, characterGym.animationKey);
      const frame = Math.min(animation.sheet.frames - 1, Math.max(0, characterGym.frame));
      const frameSelectorKey = `${character.id}:${animation.key}:${animation.sheet.frames}`;
      const selectedBoundsKind = characterGym.selectedBoundsKind;
      const selectedBounds = currentBoundsEdit(characterGym, selectedBoundsKind);

      if (renderedCharacterAnimationOptionsKey !== character.id) {
        renderedCharacterAnimationOptionsKey = character.id;
        characterAnimation.innerHTML = character.animations.map(
          (candidate) => `<option value="${candidate.key}">${candidate.label}</option>`
        ).join('');
      }

      characterSelect.value = character.id;
      characterAnimation.value = animation.key;
      characterBoundsKind.value = selectedBoundsKind;
      characterPlayToggle.textContent = characterGym.paused ? 'Play' : 'Pause';
      characterFrameReadout.textContent = `${frame + 1} / ${animation.sheet.frames}`;
      characterActiveReadout.textContent = activeFramesText(characterGym, selectedBoundsKind);
      characterBoundsActive.checked = selectedBounds.active;
      characterBoundsActive.disabled = selectedBoundsKind === 'visual';
      characterBoundsCenterX.value = String(Math.round(selectedBounds.x + selectedBounds.width / 2));
      characterBoundsCenterY.value = String(Math.round(selectedBounds.y + selectedBounds.height / 2));
      characterBoundsWidth.value = String(Math.round(selectedBounds.width));
      characterBoundsHeight.value = String(Math.round(selectedBounds.height));

      characterSpeedButtons.querySelectorAll<HTMLButtonElement>('[data-speed]').forEach((button) => {
        button.classList.toggle('is-active', Number(button.dataset.speed) === characterGym.playbackSpeed);
      });
      characterGizmoButtons.querySelectorAll<HTMLButtonElement>('[data-gizmo]').forEach((button) => {
        button.classList.toggle('is-active', button.dataset.gizmo === characterGym.gizmoMode);
      });

      if (frameSelectorKey !== renderedFrameSelectorKey) {
        renderedFrameSelectorKey = frameSelectorKey;
        characterFrameButtons.innerHTML = Array.from({ length: animation.sheet.frames }, (_, index) => {
          const activeClass = index === frame ? ' is-active' : '';

          return `<button class="frame-chip${activeClass}" type="button" data-frame="${index}">${index + 1}</button>`;
        }).join('');
      } else {
        characterFrameButtons.querySelectorAll<HTMLButtonElement>('[data-frame]').forEach((button) => {
          button.classList.toggle('is-active', Number(button.dataset.frame) === frame);
        });
      }
    };
    const syncBackgroundGymPanel = (state: DebugState): void => {
      const selectedLayer = getBackgroundLayer(state.backgroundGym, state.backgroundGym.selectedLayerKey);

      backgroundLayer.value = selectedLayer.key;
      backgroundOffsetX.value = String(Math.round(selectedLayer.offsetX));
      backgroundOffsetY.value = String(Math.round(selectedLayer.offsetY));
      backgroundScale.value = String(Number(selectedLayer.scale.toFixed(2)));
      backgroundVisible.checked = selectedLayer.visible;
      backgroundSpeed.value = String(Number(selectedLayer.speedFactor.toFixed(2)));
      backgroundAlpha.value = String(Number(selectedLayer.alpha.toFixed(2)));
    };
    const syncFighterPlaygroundPanel = (state: DebugState): void => {
      const fighterPlayground = state.fighterPlayground;
      const stats = getFighterStats(fighterPlayground, fighterPlayground.characterId);

      fighterCharacter.value = fighterPlayground.characterId;

      FIGHTER_STAT_FIELDS.forEach((field) => {
        const input = fighterStatInputs.get(field.id);

        if (!input || document.activeElement === input) {
          return;
        }

        const value = stats[field.id];
        input.value = field.step < 1 ? String(Number(value.toFixed(2))) : String(Math.round(value));
      });

      const combat = getFighterCombat(fighterPlayground, fighterPlayground.characterId);
      FIGHTER_COMBAT_FIELDS.forEach((field) => {
        const input = fighterCombatInputs.get(field.id);

        if (!input || document.activeElement === input) {
          return;
        }

        input.value = String(Math.round(combat[field.id]));
      });

      if (document.activeElement !== fighterReverseWalk) {
        fighterReverseWalk.checked = fighterPlayground.reverseWalk;
      }

      if (document.activeElement !== fighterFillSpecial) {
        fighterFillSpecial.checked = fighterPlayground.fillSpecial;
      }

      const bounds = fighterPlayground.bounds;
      fighterBoundsInputs.forEach((input, id) => {
        input.checked = bounds[id];
      });

      const values = FIGHTER_BOUNDS_FIELDS.map((field) => bounds[field.id]);
      const allOn = values.every(Boolean);
      fighterBoundsAll.checked = allOn;
      fighterBoundsAll.indeterminate = !allOn && values.some(Boolean);
    };

    const syncStagePreviewPanel = (state: DebugState): void => {
      const stagePreview = state.stagePreview;
      const stage = getStageDefinition(stagePreview.stageId);
      const maxScroll = Math.round(stagePreview.maxScroll);
      const scrollX = Math.round(clampStageScroll(stagePreview.scrollX, stagePreview.maxScroll));
      const percent = maxScroll > 0 ? Math.round((scrollX / maxScroll) * 100) : 50;

      stagePreviewStage.value = stage.id;
      stagePreviewScroll.max = String(maxScroll);
      stagePreviewScroll.disabled = maxScroll <= 0;

      if (document.activeElement !== stagePreviewScroll) {
        stagePreviewScroll.value = String(scrollX);
      }

      stagePreviewAutoPan.checked = stagePreview.autoPan;

      if (document.activeElement !== stagePreviewSpeed) {
        stagePreviewSpeed.value = String(Math.round(stagePreview.panSpeed));
      }

      stagePreviewGuides.checked = stagePreview.showGuides;
      stagePreviewScrollReadout.textContent = `${scrollX} / ${maxScroll} (${percent}%)`;
      stagePreviewSourceReadout.textContent = `${stage.width}x${stage.height}`;
      stagePreviewFittedReadout.textContent = `${Math.round(stagePreview.displayWidth)}px wide`;
    };
    const syncTileGymPanel = (state: DebugState): void => {
      const tileGym = state.tileGym;
      const atlasFrame = getTileAtlasFrame(tileGym.selectedFrameName);
      const selectedBounds = resolveTileBoundsEdit(tileGym);

      tileFrame.value = atlasFrame.name;
      tileBoundsKind.value = tileGym.selectedBoundsKind;
      tileBoundsActive.checked = selectedBounds.active;
      tileBoundsCenterX.max = String(atlasFrame.bounds.width);
      tileBoundsCenterY.max = String(atlasFrame.bounds.height);
      tileBoundsWidth.max = String(atlasFrame.bounds.width);
      tileBoundsHeight.max = String(atlasFrame.bounds.height);
      tileBoundsCenterX.value = String(Math.round(selectedBounds.x + selectedBounds.width / 2));
      tileBoundsCenterY.value = String(Math.round(selectedBounds.y + selectedBounds.height / 2));
      tileBoundsWidth.value = String(Math.round(selectedBounds.width));
      tileBoundsHeight.value = String(Math.round(selectedBounds.height));
      tileKindReadout.textContent = atlasFrame.kind;
      tileSizeReadout.textContent = `${atlasFrame.bounds.width}x${atlasFrame.bounds.height}`;
    };
    let renderedLevelEditorCategory = '';
    const syncLevelEditorPanel = (state: DebugState): void => {
      const levelEditor = state.levelEditor;
      const selectedObject = levelEditor.level.objects.find((objectDefinition) => {
        return objectDefinition.id === levelEditor.selectedObjectId;
      });
      const selectedSpawn = levelEditor.selectedHotspotId === LEVEL_EDITOR_PLAYER_SPAWN_ID;
      const selectedIsActor = isLevelEditorActorAssetId(levelEditor.selectedFrameName);

      levelEditorLevel.value = EDITABLE_LEVEL_IDS.includes(levelEditor.level.id as (typeof EDITABLE_LEVEL_IDS)[number])
        ? levelEditor.level.id
        : 'editor-playground';
      syncLevelEditorCameraControls(levelEditor, currentProfile, {
        input: levelEditorCameraX,
        readout: levelEditorCameraReadout,
        start: levelEditorCameraStart,
        left: levelEditorCameraLeft,
        right: levelEditorCameraRight,
        end: levelEditorCameraEnd
      });
      levelEditorCategory.value = levelEditor.selectedCategory;
      levelEditorGizmo.value = levelEditor.gizmoMode;
      levelEditorSnap.checked = levelEditor.snapEnabled;
      levelEditorSnapSize.value = String(Math.round(levelEditor.snapSize));
      levelEditorSelectMode.classList.toggle('is-active', levelEditor.mode === 'select');
      levelEditorPlaceMode.classList.toggle('is-active', levelEditor.mode === 'place');
      levelEditorSaveStatus.textContent = levelEditor.saveStatus;
      levelEditorSelectedReadout.textContent = selectedSpawn
        ? LEVEL_EDITOR_PLAYER_SPAWN_ID
        : selectedObject?.id ?? '-';
      levelEditorCountReadout.textContent = String(levelEditor.level.objects.length);

      if (renderedLevelEditorCategory !== levelEditor.selectedCategory) {
        renderedLevelEditorCategory = levelEditor.selectedCategory;
        levelEditorAsset.innerHTML = renderLevelEditorAssetOptions(levelEditor.selectedCategory);
      }

      levelEditorAsset.value = selectedSpawn ? LEVEL_EDITOR_PLAYER_SPAWN_ID : levelEditor.selectedFrameName;
      if (selectedSpawn || isLevelEditorHotspotCategory(levelEditor.selectedCategory)) {
        applyHotspotPreview(levelEditorAssetPreview, LEVEL_EDITOR_PLAYER_SPAWN_ID);
      } else if (selectedIsActor) {
        applyCharacterPreview(levelEditorAssetPreview, getCharacterDefinition(levelEditor.selectedFrameName));
      } else {
        const atlasFrame = getTileAtlasFrame(levelEditor.selectedFrameName);
        applyAtlasPreview(levelEditorAssetPreview, atlasFrame);
      }
      setLevelEditorObjectInputsEnabled(Boolean(selectedObject) || selectedSpawn, selectedSpawn, {
        x: levelEditorObjectX,
        y: levelEditorObjectY,
        scale: levelEditorObjectScale,
        depth: levelEditorObjectDepth,
        duplicate: levelEditorDuplicate,
        deleteButton: levelEditorDelete
      });

      if (selectedSpawn) {
        levelEditorObjectX.value = String(Math.round(levelEditor.level.playerStart.x));
        levelEditorObjectY.value = String(Math.round(levelEditor.level.playerStart.y));
        levelEditorObjectScale.value = '';
        levelEditorObjectDepth.value = '';
        return;
      }

      if (!selectedObject) {
        levelEditorObjectX.value = '';
        levelEditorObjectY.value = '';
        levelEditorObjectScale.value = '';
        levelEditorObjectDepth.value = '';
        return;
      }

      levelEditorObjectX.value = String(Math.round(selectedObject.x));
      levelEditorObjectY.value = String(Math.round(selectedObject.y));
      levelEditorObjectScale.value = String(Number(selectedObject.scale.toFixed(2)));
      levelEditorObjectDepth.value = String(Math.round(selectedObject.depth));
    };

    debugStore.subscribe((state) => {
      syncContextualDebugPanels(panelSections, state.activeScene);
      sceneBadge.textContent = state.activeScene;
      sceneReadout.textContent = state.activeScene;
      levelReadout.textContent = state.activeLevelId;
      showWorld.checked = state.showWorldBounds;
      showVisualBounds.checked = state.showVisualBounds;
      showCollisionBounds.checked = state.showCollisionBounds;
      showHitBounds.checked = state.showHitBounds;
      showAssetLabels.checked = state.showAssetLabels;
      showPerformance.checked = state.showPerformance;
      showTouchControls.checked = state.showTouchControls;
      pauseToggle.textContent = state.paused ? 'Resume' : 'Pause';
      pointerReadout.textContent = `${Math.round(state.pointer.x)}, ${Math.round(state.pointer.y)}`;
      inputReadout.textContent = formatInputSnapshot(state.input);
      fpsReadout.textContent = formatPerformanceNumber(state.performance.fps, 0);
      frameMsReadout.textContent = `${formatPerformanceNumber(state.performance.frameMs, 2)} ms`;
      heapReadout.textContent = formatHeapReadout(state.performance.heapUsedMb, state.performance.heapLimitMb);
      objectCountReadout.textContent = String(state.performance.objectCount);
      configSaveStatus.textContent = state.configSaveStatus;

      if (state.activeScene === SCENE_KEYS.AnimationLab) {
        syncCharacterGymPanel(state);
      } else if (
        state.activeScene === SCENE_KEYS.FighterPlayground ||
        state.activeScene === SCENE_KEYS.Match
      ) {
        syncFighterPlaygroundPanel(state);
      } else if (state.activeScene === SCENE_KEYS.BackgroundTest) {
        syncBackgroundGymPanel(state);
      } else if (state.activeScene === SCENE_KEYS.StagePreview) {
        syncStagePreviewPanel(state);
      } else if (state.activeScene === SCENE_KEYS.TileGym) {
        syncTileGymPanel(state);
      } else if (state.activeScene === SCENE_KEYS.LevelEditor) {
        syncLevelEditorPanel(state);
      }
    });
    gameConfigStore.subscribe((config) => {
      syncGameConfigInputs(config, gameConfigInputs);
    });
    settingsStore.subscribe((settings) => {
      syncAudioDebugControls(settings, {
        sfxVolume: debugSfxVolume,
        sfxReadout: debugSfxReadout,
        musicVolume: debugMusicVolume,
        musicReadout: debugMusicReadout
      });
    });
  }

  remountGame(currentProfile);
}

function getElement<T extends HTMLElement>(root: HTMLElement, selector: string): T {
  const element = root.querySelector<T>(selector);

  if (!element) {
    throw new Error(`Missing debug control: ${selector}`);
  }

  return element;
}

function readVolumeSliderValue(input: HTMLInputElement): number {
  return Number(clampUnit(readNumberInputValue(input, 0)).toFixed(2));
}

function syncAudioDebugControls(
  settings: GameSettings,
  controls: {
    sfxVolume: HTMLInputElement;
    sfxReadout: HTMLElement;
    musicVolume: HTMLInputElement;
    musicReadout: HTMLElement;
  }
): void {
  controls.sfxVolume.value = String(settings.sfxVolume);
  controls.sfxReadout.textContent = `${Math.round(settings.sfxVolume * 100)}%`;
  controls.musicVolume.value = String(settings.musicVolume);
  controls.musicReadout.textContent = `${Math.round(settings.musicVolume * 100)}%`;
}

const NUMBER_DRAG_PIXELS_PER_STEP = 6;

function installNumberDragAdjusters(root: HTMLElement): void {
  root.querySelectorAll<HTMLElement>('.number-row > span').forEach((label) => {
    const input = label.parentElement?.querySelector<HTMLInputElement>('input[type="number"]');

    if (!input) {
      return;
    }

    label.classList.add('number-row__drag-label');
    label.title = 'Drag left/right to adjust';
    let suppressNextClick = false;

    label.addEventListener('click', (event) => {
      if (!suppressNextClick) {
        return;
      }

      event.preventDefault();
      suppressNextClick = false;
    });

    label.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || input.disabled) {
        return;
      }

      event.preventDefault();
      const startValue = readNumberInputValue(input, 0);
      const step = readNumberInputStep(input);
      const startX = event.clientX;
      let lastValue = startValue;
      let moved = false;

      input.focus();
      label.classList.add('is-dragging');
      document.body.classList.add('is-number-dragging');

      const handlePointerMove = (moveEvent: PointerEvent): void => {
        if (moveEvent.pointerId !== event.pointerId) {
          return;
        }

        const steps = Math.round((moveEvent.clientX - startX) / NUMBER_DRAG_PIXELS_PER_STEP);
        const scale = moveEvent.shiftKey ? 10 : 1;
        const nextValue = clampNumberInputValue(input, startValue + steps * step * scale);

        if (Math.abs(moveEvent.clientX - startX) > 2) {
          moved = true;
        }

        if (nextValue === lastValue) {
          return;
        }

        lastValue = nextValue;
        input.value = formatNumberInputValue(nextValue, step);
        input.dispatchEvent(new Event('input', { bubbles: true }));
      };

      const handlePointerEnd = (endEvent: PointerEvent): void => {
        if (endEvent.pointerId !== event.pointerId) {
          return;
        }

        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerEnd);
        window.removeEventListener('pointercancel', handlePointerEnd);
        label.classList.remove('is-dragging');
        document.body.classList.remove('is-number-dragging');

        if (moved) {
          suppressNextClick = true;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerEnd);
      window.addEventListener('pointercancel', handlePointerEnd);
    });
  });
}

function readNumberInputValue(input: HTMLInputElement, fallback: number): number {
  return Number.isFinite(input.valueAsNumber) ? input.valueAsNumber : fallback;
}

function readNumberInputStep(input: HTMLInputElement): number {
  if (!input.step || input.step === 'any') {
    return 1;
  }

  const step = Number(input.step);

  return Number.isFinite(step) && step > 0 ? step : 1;
}

function clampNumberInputValue(input: HTMLInputElement, value: number): number {
  const min = input.min === '' ? -Infinity : Number(input.min);
  const max = input.max === '' ? Infinity : Number(input.max);

  return Math.min(
    Number.isFinite(max) ? max : Infinity,
    Math.max(Number.isFinite(min) ? min : -Infinity, value)
  );
}

function clampUnit(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function formatNumberInputValue(value: number, step: number): string {
  const decimals = decimalPlaces(step);

  return decimals > 0 ? Number(value.toFixed(decimals)).toString() : String(Math.round(value));
}

function decimalPlaces(value: number): number {
  const normalized = value.toString().toLowerCase();

  if (!normalized.includes('e')) {
    return normalized.split('.')[1]?.length ?? 0;
  }

  const [, exponent] = normalized.split('e-');
  return exponent ? Number(exponent) : 0;
}

async function loadStarterGameConfig(): Promise<ReturnType<typeof normalizeStarterGameConfig> | null> {
  try {
    const response = await fetch(STARTER_GAME_CONFIG_FILE, { cache: 'no-store' });

    if (!response.ok) {
      return null;
    }

    const config = (await response.json()) as { gameConfig?: unknown };

    return normalizeStarterGameConfig(
      (config.gameConfig ?? config) as Partial<ReturnType<typeof normalizeStarterGameConfig>>
    );
  } catch {
    return null;
  }
}

function readConfigInputNumber(input: HTMLInputElement, fallback: number): number {
  return Number.isFinite(input.valueAsNumber) ? input.valueAsNumber : fallback;
}

function syncGameConfigInputs(
  config: StarterGameConfig,
  inputs: {
    speed: HTMLInputElement;
    jump: HTMLInputElement;
    gravity: HTMLInputElement;
    scale: HTMLInputElement;
  },
  force = false
): void {
  setConfigInputValue(inputs.speed, String(Math.round(config.playerSpeed)), force);
  setConfigInputValue(inputs.jump, String(Math.round(config.jumpVelocity)), force);
  setConfigInputValue(inputs.gravity, String(Math.round(config.gravity)), force);
  setConfigInputValue(inputs.scale, String(Number(config.actorScale.toFixed(2))), force);
}

function setConfigInputValue(input: HTMLInputElement, value: string, force: boolean): void {
  if (!force && document.activeElement === input) {
    return;
  }

  input.value = value;
}

function formatPerformanceNumber(value: number, fractionDigits: number): string {
  return Number.isFinite(value) && value > 0 ? value.toFixed(fractionDigits) : '-';
}

function formatHeapReadout(usedMb: number | null, limitMb: number | null): string {
  if (usedMb === null) {
    return '-';
  }

  return limitMb === null
    ? `${usedMb.toFixed(1)} MB`
    : `${usedMb.toFixed(1)} / ${limitMb.toFixed(0)} MB`;
}

function renderLevelEditorAssetOptions(categoryId: string): string {
  return getLevelEditorAssetOptions(categoryId).map((option) => {
    return `<option value="${option.id}">${option.label}</option>`;
  }).join('');
}

function renderLevelEditorLevelOptions(): string {
  return EDITABLE_LEVEL_IDS.map(
    (levelId) => `<option value="${levelId}">Editor Playground</option>`
  ).join('');
}

function applyAtlasPreview(
  previewElement: HTMLElement,
  atlasFrame: ReturnType<typeof getTileAtlasFrame>
): void {
  const maxWidth = 188;
  const maxHeight = 86;
  const scale = Math.min(
    1.4,
    maxWidth / atlasFrame.bounds.width,
    maxHeight / atlasFrame.bounds.height
  );

  previewElement.classList.remove('is-hotspot');
  previewElement.textContent = '';
  previewElement.style.backgroundImage = '';
  previewElement.style.width = `${Math.round(atlasFrame.bounds.width * scale)}px`;
  previewElement.style.height = `${Math.round(atlasFrame.bounds.height * scale)}px`;
  previewElement.style.backgroundSize = `${Math.round(TILE_ATLAS_SIZE.width * scale)}px ${Math.round(TILE_ATLAS_SIZE.height * scale)}px`;
  previewElement.style.backgroundPosition = `-${Math.round(atlasFrame.bounds.x * scale)}px -${Math.round(atlasFrame.bounds.y * scale)}px`;
}

function applyCharacterPreview(
  previewElement: HTMLElement,
  character: ReturnType<typeof getCharacterDefinition>
): void {
  const animation = getCharacterAnimationByAction(character.id, 'idle');
  const maxSize = 92;
  const scale = Math.min(1, maxSize / animation.sheet.frameWidth, maxSize / animation.sheet.frameHeight);

  previewElement.classList.remove('is-hotspot');
  previewElement.textContent = '';
  previewElement.style.backgroundImage = `url('${animation.sheet.url}')`;
  previewElement.style.width = `${Math.round(animation.sheet.frameWidth * scale)}px`;
  previewElement.style.height = `${Math.round(animation.sheet.frameHeight * scale)}px`;
  previewElement.style.backgroundSize = `${Math.round(animation.sheet.frameWidth * 5 * scale)}px auto`;
  previewElement.style.backgroundPosition = '0 0';
}

function applyHotspotPreview(previewElement: HTMLElement, hotspotId: typeof LEVEL_EDITOR_PLAYER_SPAWN_ID): void {
  previewElement.classList.add('is-hotspot');
  previewElement.textContent = hotspotLabel(hotspotId);
  previewElement.style.backgroundImage = 'none';
  previewElement.style.backgroundSize = '';
  previewElement.style.backgroundPosition = '';
}

function setLevelEditorObjectInputsEnabled(
  enabled: boolean,
  selectedHotspot: boolean,
  controls: {
    x: HTMLInputElement;
    y: HTMLInputElement;
    scale: HTMLInputElement;
    depth: HTMLInputElement;
    duplicate: HTMLButtonElement;
    deleteButton: HTMLButtonElement;
  }
): void {
  controls.x.disabled = !enabled;
  controls.y.disabled = !enabled;
  controls.scale.disabled = !enabled || selectedHotspot;
  controls.depth.disabled = !enabled || selectedHotspot;
  controls.duplicate.disabled = !enabled || selectedHotspot;
  controls.deleteButton.disabled = !enabled || selectedHotspot;
}

function readLevelEditorPositionEdit(inputs: {
  x: HTMLInputElement;
  y: HTMLInputElement;
}): { x: number; y: number } | null {
  const x = Number(inputs.x.value);
  const y = Number(inputs.y.value);

  if (![x, y].every(Number.isFinite)) {
    return null;
  }

  return {
    x: Math.round(x),
    y: Math.round(y)
  };
}

function readLevelEditorObjectEdit(inputs: {
  x: HTMLInputElement;
  y: HTMLInputElement;
  scale: HTMLInputElement;
  depth: HTMLInputElement;
}): Pick<LevelEditorObjectDefinition, 'x' | 'y' | 'scale' | 'depth'> | null {
  const x = Number(inputs.x.value);
  const y = Number(inputs.y.value);
  const scale = Number(inputs.scale.value);
  const depth = Number(inputs.depth.value);

  if (![x, y, scale, depth].every(Number.isFinite)) {
    return null;
  }

  return {
    x: Math.round(x),
    y: Math.round(y),
    scale,
    depth: Math.round(depth)
  };
}

function snapLevelEditorValue(levelEditor: LevelEditorDebugState, value: number): number {
  if (!levelEditor.snapEnabled) {
    return Math.round(value);
  }

  return Math.round(value / levelEditor.snapSize) * levelEditor.snapSize;
}

function levelEditorCameraRange(
  levelEditor: LevelEditorDebugState,
  profile: GameProfile
): { min: number; max: number } {
  const bounds = levelEditor.level.bounds;
  const cameraWidth = GAME_PROFILES[profile].width;
  const min = Math.round(bounds.x);
  const max = Math.round(Math.max(bounds.x, bounds.x + bounds.width - cameraWidth));

  return { min, max };
}

function clampLevelEditorCameraScroll(
  levelEditor: LevelEditorDebugState,
  value: number,
  profile: GameProfile
): number {
  const range = levelEditorCameraRange(levelEditor, profile);

  return Math.round(Math.min(range.max, Math.max(range.min, value)));
}

function syncLevelEditorCameraControls(
  levelEditor: LevelEditorDebugState,
  profile: GameProfile,
  controls: {
    input: HTMLInputElement;
    readout: HTMLElement;
    start: HTMLButtonElement;
    left: HTMLButtonElement;
    right: HTMLButtonElement;
    end: HTMLButtonElement;
  }
): void {
  const range = levelEditorCameraRange(levelEditor, profile);
  const value = clampLevelEditorCameraScroll(levelEditor, levelEditor.cameraScrollX, profile);
  const canScroll = range.max > range.min;

  controls.input.min = String(range.min);
  controls.input.max = String(range.max);
  controls.input.value = String(value);
  controls.input.disabled = !canScroll;
  controls.start.disabled = !canScroll || value <= range.min;
  controls.left.disabled = !canScroll || value <= range.min;
  controls.right.disabled = !canScroll || value >= range.max;
  controls.end.disabled = !canScroll || value >= range.max;
  controls.readout.textContent = canScroll
    ? `Camera ${value} / ${range.max}`
    : 'Camera 0 / 0';
}

function patchCharacterGym(
  debugStore: Store<DebugState>,
  update: (characterGym: CharacterGymDebugState) => CharacterGymDebugState
): void {
  const state = debugStore.getState();
  debugStore.patchState({ characterGym: update(state.characterGym) });
}

function patchBackgroundGym(
  debugStore: Store<DebugState>,
  update: (backgroundGym: DebugState['backgroundGym']) => DebugState['backgroundGym']
): void {
  const state = debugStore.getState();
  debugStore.patchState({ backgroundGym: normalizeBackgroundGymState(update(state.backgroundGym)) });
}

function patchFighterPlayground(
  debugStore: Store<DebugState>,
  update: (fighterPlayground: DebugState['fighterPlayground']) => DebugState['fighterPlayground']
): void {
  const state = debugStore.getState();
  debugStore.patchState({ fighterPlayground: update(state.fighterPlayground) });
}

function patchStagePreview(
  debugStore: Store<DebugState>,
  update: (stagePreview: StagePreviewDebugState) => StagePreviewDebugState
): void {
  const state = debugStore.getState();
  debugStore.patchState({ stagePreview: update(state.stagePreview) });
}

function setBackgroundLayerConfig(
  debugStore: Store<DebugState>,
  edit: BackgroundLayerConfig
): void {
  patchBackgroundGym(debugStore, (backgroundGym) => ({
    ...backgroundGym,
    layers: backgroundGym.layers.map((layer) => (layer.key === edit.key ? edit : layer))
  }));
}

function patchTileGym(
  debugStore: Store<DebugState>,
  update: (tileGym: TileGymDebugState) => TileGymDebugState
): void {
  const state = debugStore.getState();
  debugStore.patchState({ tileGym: normalizeTileGymState(update(state.tileGym)) });
}

function patchLevelEditor(
  debugStore: Store<DebugState>,
  update: (levelEditor: LevelEditorDebugState) => LevelEditorDebugState
): void {
  const state = debugStore.getState();
  debugStore.patchState({ levelEditor: normalizeLevelEditorDebugState(update(state.levelEditor)) });
}

function setLevelEditorCameraScroll(
  debugStore: Store<DebugState>,
  value: number,
  profile: GameProfile
): void {
  patchLevelEditor(debugStore, (levelEditor) => ({
    ...levelEditor,
    cameraScrollX: clampLevelEditorCameraScroll(levelEditor, value, profile)
  }));
}

function setLevelEditorMode(debugStore: Store<DebugState>, mode: LevelEditorMode): void {
  patchLevelEditor(debugStore, (levelEditor) => ({
    ...levelEditor,
    mode
  }));
}

function patchSelectedLevelEditorObject(
  debugStore: Store<DebugState>,
  update: (objectDefinition: LevelEditorObjectDefinition) => LevelEditorObjectDefinition
): void {
  const state = debugStore.getState();
  const selectedObjectId = state.levelEditor.selectedObjectId;

  if (!selectedObjectId) {
    return;
  }

  patchLevelEditor(debugStore, (levelEditor) => ({
    ...levelEditor,
    level: {
      ...levelEditor.level,
      objects: levelEditor.level.objects.map((objectDefinition) => {
        return objectDefinition.id === selectedObjectId ? update(objectDefinition) : objectDefinition;
      })
    }
  }));
}

function duplicateSelectedLevelEditorObject(debugStore: Store<DebugState>): void {
  const state = debugStore.getState();
  const levelEditor = state.levelEditor;
  const selected = levelEditor.level.objects.find((objectDefinition) => {
    return objectDefinition.id === levelEditor.selectedObjectId;
  });

  if (!selected) {
    return;
  }

  const offset = levelEditor.snapEnabled ? levelEditor.snapSize : 24;
  const duplicate = {
    ...selected,
    id: `${selected.frameName}-${Date.now().toString(36)}`,
    x: snapLevelEditorValue(levelEditor, selected.x + offset),
    y: snapLevelEditorValue(levelEditor, selected.y - offset)
  };

  patchLevelEditor(debugStore, (current) => ({
    ...current,
    selectedObjectId: duplicate.id,
    level: {
      ...current.level,
      objects: [...current.level.objects, duplicate]
    }
  }));
}

function deleteSelectedLevelEditorObject(debugStore: Store<DebugState>): void {
  const state = debugStore.getState();
  const selectedObjectId = state.levelEditor.selectedObjectId;

  if (!selectedObjectId) {
    return;
  }

  patchLevelEditor(debugStore, (levelEditor) => ({
    ...levelEditor,
    selectedObjectId: null,
    level: {
      ...levelEditor.level,
      objects: levelEditor.level.objects.filter((objectDefinition) => {
        return objectDefinition.id !== selectedObjectId;
      })
    }
  }));
}

function setLevelEditorSaveStatus(debugStore: Store<DebugState>, saveStatus: string): void {
  patchLevelEditor(debugStore, (levelEditor) => ({
    ...levelEditor,
    saveStatus
  }));
}

function setTileBoundsOverride(
  debugStore: Store<DebugState>,
  boundsKind: TileBoundsKind,
  edit: TileGymBoundsEdit
): void {
  patchTileGym(debugStore, (tileGym) => {
    const frameOverrides = tileGym.boundsOverrides[tileGym.selectedFrameName] ?? {};

    return {
      ...tileGym,
      boundsOverrides: {
        ...tileGym.boundsOverrides,
        [tileGym.selectedFrameName]: {
          ...frameOverrides,
          [boundsKind]: edit
        }
      }
    };
  });
}

function resetTileBoundsOverride(debugStore: Store<DebugState>): void {
  const state = debugStore.getState();
  const tileGym = state.tileGym;
  const frameOverrides = tileGym.boundsOverrides[tileGym.selectedFrameName];

  if (!frameOverrides?.[tileGym.selectedBoundsKind]) {
    return;
  }

  const nextFrameOverrides = { ...frameOverrides };
  delete nextFrameOverrides[tileGym.selectedBoundsKind];

  const nextBoundsOverrides = { ...tileGym.boundsOverrides };

  if (Object.keys(nextFrameOverrides).length === 0) {
    delete nextBoundsOverrides[tileGym.selectedFrameName];
  } else {
    nextBoundsOverrides[tileGym.selectedFrameName] = nextFrameOverrides;
  }

  debugStore.patchState({
    tileGym: {
      ...tileGym,
      boundsOverrides: nextBoundsOverrides
    }
  });
}

function readSelectedTileBoundsEdit(
  state: DebugState,
  inputs: {
    active: HTMLInputElement;
    centerX: HTMLInputElement;
    centerY: HTMLInputElement;
    width: HTMLInputElement;
    height: HTMLInputElement;
  }
): TileGymBoundsEdit | null {
  const atlasFrame = getTileAtlasFrame(state.tileGym.selectedFrameName);
  const centerX = Number(inputs.centerX.value);
  const centerY = Number(inputs.centerY.value);
  const width = Number(inputs.width.value);
  const height = Number(inputs.height.value);

  if (![centerX, centerY, width, height].every(Number.isFinite)) {
    return null;
  }

  const maxWidth = atlasFrame.bounds.width;
  const maxHeight = atlasFrame.bounds.height;
  const clampedWidth = Math.max(1, Math.min(maxWidth, Math.round(width)));
  const clampedHeight = Math.max(1, Math.min(maxHeight, Math.round(height)));
  const x = Math.max(0, Math.min(maxWidth - clampedWidth, Math.round(centerX - clampedWidth / 2)));
  const y = Math.max(0, Math.min(maxHeight - clampedHeight, Math.round(centerY - clampedHeight / 2)));

  return {
    active: inputs.active.checked,
    x,
    y,
    width: Math.min(clampedWidth, maxWidth - x),
    height: Math.min(clampedHeight, maxHeight - y)
  };
}

function readSelectedBackgroundLayerEdit(
  state: DebugState,
  inputs: {
    offsetX: HTMLInputElement;
    offsetY: HTMLInputElement;
    scale: HTMLInputElement;
    visible: HTMLInputElement;
    speed: HTMLInputElement;
    alpha: HTMLInputElement;
  }
): BackgroundLayerConfig | null {
  const selectedLayer = getBackgroundLayer(state.backgroundGym, state.backgroundGym.selectedLayerKey);
  const offsetX = Number(inputs.offsetX.value);
  const offsetY = Number(inputs.offsetY.value);
  const scale = Number(inputs.scale.value);
  const speed = Number(inputs.speed.value);
  const alpha = Number(inputs.alpha.value);

  if (![offsetX, offsetY, scale, speed, alpha].every(Number.isFinite)) {
    return null;
  }

  return {
    ...selectedLayer,
    offsetX: Math.round(Math.min(1280, Math.max(-1280, offsetX))),
    offsetY: Math.round(Math.min(720, Math.max(-720, offsetY))),
    scale: Math.min(3, Math.max(0.25, Number(scale.toFixed(2)))),
    visible: inputs.visible.checked,
    speedFactor: Math.min(4, Math.max(-4, Number(speed.toFixed(2)))),
    alpha: Math.min(1, Math.max(0, Number(alpha.toFixed(2))))
  };
}

function syncContextualDebugPanels(panelSections: HTMLElement[], scene: SceneKey): void {
  panelSections.forEach((panel) => {
    panel.classList.toggle('is-hidden', !isDebugPanelVisible(panel.dataset.panel ?? '', scene));
  });
}

function isDebugPanelVisible(panelId: string, scene: SceneKey): boolean {
  if (panelId === 'metrics' || panelId === 'audio') {
    return true;
  }

  if (scene === SCENE_KEYS.AnimationLab) {
    return panelId === 'character-gym';
  }

  if (scene === SCENE_KEYS.BackgroundTest) {
    return panelId === 'background-gym';
  }

  if (scene === SCENE_KEYS.StagePreview) {
    return panelId === 'stage-preview';
  }

  if (scene === SCENE_KEYS.FighterPlayground || scene === SCENE_KEYS.Match) {
    return panelId === 'fighter-playground';
  }

  if (scene === SCENE_KEYS.TileGym) {
    return panelId === 'tile-gym';
  }

  if (scene === SCENE_KEYS.LevelEditor) {
    return panelId === 'overlays' || panelId === 'level-editor';
  }

  return false;
}

function setCharacterBoundsOverride(
  debugStore: Store<DebugState>,
  boundsKind: CharacterBoundsKind,
  edit: CharacterGymBoundsEdit
): void {
  const state = debugStore.getState();
  const characterGym = state.characterGym;
  const animationOverrides = characterGym.boundsOverrides[characterGym.animationKey] ?? {};
  const frameOverrides = animationOverrides[characterGym.frame] ?? {};

  debugStore.patchState({
    characterGym: {
      ...characterGym,
      boundsOverrides: {
        ...characterGym.boundsOverrides,
        [characterGym.animationKey]: {
          ...animationOverrides,
          [characterGym.frame]: {
            ...frameOverrides,
            [boundsKind]: edit
          }
        }
      }
    }
  });
}

function applyCharacterBoundsToAllFrames(
  debugStore: Store<DebugState>,
  boundsKind: CharacterBoundsKind,
  edit: CharacterGymBoundsEdit
): void {
  const state = debugStore.getState();
  const characterGym = state.characterGym;
  const animation = getCharacterAnimationDefinition(characterGym.characterId, characterGym.animationKey);
  const animationOverrides = characterGym.boundsOverrides[characterGym.animationKey] ?? {};
  const nextAnimationOverrides = { ...animationOverrides };

  for (let frame = 0; frame < animation.sheet.frames; frame += 1) {
    nextAnimationOverrides[frame] = {
      ...nextAnimationOverrides[frame],
      [boundsKind]: { ...edit }
    };
  }

  debugStore.patchState({
    characterGym: {
      ...characterGym,
      boundsOverrides: {
        ...characterGym.boundsOverrides,
        [characterGym.animationKey]: nextAnimationOverrides
      }
    }
  });
}

function resetCharacterFrameBounds(debugStore: Store<DebugState>): void {
  const state = debugStore.getState();
  const characterGym = state.characterGym;
  const animationOverrides = characterGym.boundsOverrides[characterGym.animationKey];

  if (!animationOverrides?.[characterGym.frame]) {
    return;
  }

  const nextAnimationOverrides = { ...animationOverrides };
  delete nextAnimationOverrides[characterGym.frame];

  debugStore.patchState({
    characterGym: {
      ...characterGym,
      boundsOverrides: {
        ...characterGym.boundsOverrides,
        [characterGym.animationKey]: nextAnimationOverrides
      }
    }
  });
}

function readSelectedBoundsEdit(
  state: DebugState,
  inputs: {
    active: HTMLInputElement;
    centerX: HTMLInputElement;
    centerY: HTMLInputElement;
    width: HTMLInputElement;
    height: HTMLInputElement;
  }
): CharacterGymBoundsEdit | null {
  const boundsKind = state.characterGym.selectedBoundsKind;
  const animation = getCharacterAnimationDefinition(state.characterGym.characterId, state.characterGym.animationKey);
  const centerX = Number(inputs.centerX.value);
  const centerY = Number(inputs.centerY.value);
  const width = Number(inputs.width.value);
  const height = Number(inputs.height.value);

  if (![centerX, centerY, width, height].every(Number.isFinite)) {
    return null;
  }

  const maxWidth = animation.sheet.frameWidth;
  const maxHeight = animation.sheet.frameHeight;
  const clampedWidth = Math.max(1, Math.min(maxWidth, Math.round(width)));
  const clampedHeight = Math.max(1, Math.min(maxHeight, Math.round(height)));
  const x = Math.max(0, Math.min(maxWidth - 1, Math.round(centerX - clampedWidth / 2)));
  const y = Math.max(0, Math.min(maxHeight - 1, Math.round(centerY - clampedHeight / 2)));

  return {
    active: boundsKind === 'visual' ? true : inputs.active.checked,
    x,
    y,
    width: Math.min(clampedWidth, maxWidth - x),
    height: Math.min(clampedHeight, maxHeight - y)
  };
}

function currentBoundsEdit(
  characterGym: CharacterGymDebugState,
  boundsKind: CharacterBoundsKind
): CharacterGymBoundsEdit {
  const animation = getCharacterAnimationDefinition(characterGym.characterId, characterGym.animationKey);
  const resolvedFrame = resolveHeroBoundsFrame(animation, characterGym.frame, characterGym.boundsOverrides);
  const override = characterGym.boundsOverrides[animation.key]?.[characterGym.frame]?.[boundsKind];
  const bounds = override ?? resolvedFrame[boundsKind] ?? defaultHeroBoundsForActivation(resolvedFrame, boundsKind);

  return {
    active: boundsKind === 'visual' ? true : override?.active ?? Boolean(resolvedFrame[boundsKind]),
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height
  };
}

function activeFramesText(characterGym: CharacterGymDebugState, boundsKind: CharacterBoundsKind): string {
  const animation = getCharacterAnimationDefinition(characterGym.characterId, characterGym.animationKey);
  const frames = animation.bounds
    .map((_, frame) => frame)
    .filter((frame) => resolveHeroBoundsFrame(animation, frame, characterGym.boundsOverrides)[boundsKind]);

  if (frames.length === 0) {
    return 'none';
  }

  return compactFrameRanges(frames);
}

function compactFrameRanges(frames: number[]): string {
  const ranges: string[] = [];
  let start = frames[0];
  let previous = frames[0];

  for (let index = 1; index <= frames.length; index += 1) {
    const frame = frames[index];

    if (frame === previous + 1) {
      previous = frame;
      continue;
    }

    ranges.push(start === previous ? `${start + 1}` : `${start + 1}-${previous + 1}`);
    start = frame;
    previous = frame;
  }

  return ranges.join(', ');
}

function wrapFrame(frame: number, frameCount: number): number {
  return ((frame % frameCount) + frameCount) % frameCount;
}
