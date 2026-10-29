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

export const UI_IMAGE_ASSETS: ImageAsset[] = [
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

/** Logo do jogo (várzea, Codex, 29/10/2026): abertura e menu. */
export const LOGO_IMAGE_ASSET: ImageAsset = {
  kind: 'image',
  key: 'logo',
  url: '/assets/branding/luta-de-mascotes-logo.png',
  width: 1200,
  height: 400,
  usage: 'logo Luta de Mascotes na abertura e no menu'
};

/** Effects of the game itself, the same for every fighter (docs/biriba-ovo-tontura.md). */
export const FX_ASSETS: SpritesheetAsset[] = [
  { kind: 'spritesheet', key: 'fx-tontura', url: '/assets/fx/tontura.png', frameWidth: 128, frameHeight: 64, frames: 8 }
];

export const STARTER_ASSETS: StarterAsset[] = [
  ...CHARACTER_ASSETS,
  ...FX_ASSETS,
  ...STAGE_IMAGE_ASSETS,
  ...MODE_CARD_IMAGE_ASSETS,
  LOGO_IMAGE_ASSET,
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
      frames: scene.anims
        .generateFrameNumbers(animation.sheet.key, { start: 0, end: animation.sheet.frames - 1 })
        .map((frame, index) =>
          animation.frameDurations ? { ...frame, duration: animation.frameDurations[index] } : frame
        ),
      frameRate: animation.frameRate,
      repeat: animation.repeat
    });
  });
}
