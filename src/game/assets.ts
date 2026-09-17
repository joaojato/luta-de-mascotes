import * as Phaser from 'phaser';

import {
  STARTER_AUDIO_ASSETS,
  STARTER_AUDIO_CUES,
  type GeneratedAudioCue,
  type StarterAudioAsset
} from './core/audio';
import { GENERATED_TEXTURE_ASSETS, type GeneratedTextureAsset } from './generatedAssets';
import { CHARACTER_ANIMATIONS, CHARACTER_ASSETS } from './hero';
import { STAGE_IMAGE_ASSETS } from './stageConfig';
import { TILE_ATLAS_IMAGE_URL, TILE_ATLAS_TEXTURE_KEY, TILE_ATLAS_SIZE } from './tileAtlas';
import {
  QUEST_UI_ATLAS_IMAGE_URL,
  QUEST_UI_ATLAS_SIZE,
  QUEST_UI_ATLAS_TEXTURE_KEY
} from './uiAtlas';
import {
  FIGHTING_UI_ATLAS_IMAGE_URL,
  FIGHTING_UI_ATLAS_SIZE,
  FIGHTING_UI_ATLAS_TEXTURE_KEY
} from './fightingUiAtlas';

export interface ImageAsset {
  kind: 'image';
  key: string;
  url: string;
  width?: number;
  height?: number;
  usage?: string;
}

export interface AtlasAsset {
  kind: 'atlas';
  key: string;
  url: string;
  atlasUrl: string;
  width?: number;
  height?: number;
  usage?: string;
}

export interface SpritesheetAsset {
  kind: 'spritesheet';
  key: string;
  url: string;
  frameWidth: number;
  frameHeight: number;
  frames: number;
  margin?: number;
  spacing?: number;
}

export interface AudioAsset {
  kind: 'audio';
  key: string;
  url: string;
  category?: 'music' | 'sfx';
  durationSeconds?: number;
  volume?: number;
  loop?: boolean;
  usage?: string;
}

export interface BackgroundLayerAsset {
  key: string;
  label: string;
  speed: number;
  tileOffsetY: number;
}

export type StarterAsset = ImageAsset | SpritesheetAsset | AtlasAsset | AudioAsset;

export const TILE_IMAGE_ASSETS: ImageAsset[] = [
  {
    kind: 'image',
    key: TILE_ATLAS_TEXTURE_KEY,
    url: TILE_ATLAS_IMAGE_URL,
    width: TILE_ATLAS_SIZE.width,
    height: TILE_ATLAS_SIZE.height,
    usage: 'quest platformer tile and object atlas'
  }
];

export const UI_IMAGE_ASSETS: ImageAsset[] = [
  {
    kind: 'image',
    key: QUEST_UI_ATLAS_TEXTURE_KEY,
    url: QUEST_UI_ATLAS_IMAGE_URL,
    width: QUEST_UI_ATLAS_SIZE.width,
    height: QUEST_UI_ATLAS_SIZE.height,
    usage: 'quest HUD portraits, health bars, coin counters, and game status icons'
  },
  {
    kind: 'image',
    key: FIGHTING_UI_ATLAS_TEXTURE_KEY,
    url: FIGHTING_UI_ATLAS_IMAGE_URL,
    width: FIGHTING_UI_ATLAS_SIZE.width,
    height: FIGHTING_UI_ATLAS_SIZE.height,
    usage: 'fighting HUD health bars, portrait frames, timer, meter pips, and status icons'
  }
];

export const MODE_CARD_IMAGE_ASSETS: ImageAsset[] = [
  {
    kind: 'image',
    key: 'mode-card-1v1',
    url: '/assets/mode-cards/mode-1v1-card.png',
    width: 1330,
    height: 1182,
    usage: 'mode select card art for local 1 vs 1'
  },
  {
    kind: 'image',
    key: 'mode-card-1vcpu',
    url: '/assets/mode-cards/mode-1vcpu-card.png',
    width: 1392,
    height: 1130,
    usage: 'mode select card art for player versus CPU'
  }
];

export const STARTER_ASSETS: StarterAsset[] = [
  ...CHARACTER_ASSETS,
  ...STAGE_IMAGE_ASSETS,
  ...MODE_CARD_IMAGE_ASSETS,
  ...TILE_IMAGE_ASSETS,
  ...UI_IMAGE_ASSETS,
  ...STARTER_AUDIO_ASSETS
];

export const SAMPLE_BACKGROUND_LAYERS: BackgroundLayerAsset[] = [
  { key: 'sample-bg-sky', label: 'Sky', speed: 4, tileOffsetY: 0 },
  { key: 'sample-bg-far', label: 'Far', speed: 14, tileOffsetY: 30 },
  { key: 'sample-bg-mid', label: 'Mid', speed: 28, tileOffsetY: 80 }
];

export const ASSET_CATALOG: Array<
  StarterAsset | StarterAudioAsset | GeneratedAudioCue | GeneratedTextureAsset
> = [
  ...STARTER_ASSETS,
  ...STARTER_AUDIO_CUES,
  ...GENERATED_TEXTURE_ASSETS
];

export function preloadStarterAssets(scene: Phaser.Scene, assets: StarterAsset[] = STARTER_ASSETS): void {
  assets.forEach((asset) => {
    if (asset.kind === 'image') {
      if (!scene.textures.exists(asset.key)) {
        scene.load.image(asset.key, asset.url);
      }

      return;
    }

    if (asset.kind === 'spritesheet') {
      if (!scene.textures.exists(asset.key)) {
        scene.load.spritesheet(asset.key, asset.url, {
          frameWidth: asset.frameWidth,
          frameHeight: asset.frameHeight,
          startFrame: 0,
          endFrame: asset.frames - 1,
          margin: asset.margin ?? 0,
          spacing: asset.spacing ?? 0
        });
      }

      return;
    }

    if (asset.kind === 'atlas') {
      if (!scene.textures.exists(asset.key)) {
        scene.load.atlas(asset.key, asset.url, asset.atlasUrl);
      }

      return;
    }

    if (!scene.cache.audio.exists(asset.key)) {
      scene.load.audio(asset.key, asset.url);
    }
  });
}

export function registerStarterAnimations(scene: Phaser.Scene): void {
  CHARACTER_ANIMATIONS.forEach((animation) => {
    if (scene.anims.exists(animation.key)) {
      return;
    }

    scene.anims.create({
      key: animation.key,
      frames: scene.anims.generateFrameNumbers(animation.sheet.key, {
        start: 0,
        end: animation.sheet.frames - 1
      }),
      frameRate: animation.frameRate,
      repeat: animation.repeat
    });
  });
}
