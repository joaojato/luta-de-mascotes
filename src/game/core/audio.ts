import * as Phaser from 'phaser';

import type { GameSettings } from '../types';

export type AudioCategory = 'music' | 'sfx';
type VolumeAdjustableSound = Phaser.Sound.BaseSound & {
  setVolume?: (value: number) => unknown;
  volume?: number;
};

export interface StarterAudioAsset {
  kind: 'audio';
  key: string;
  url: string;
  category: AudioCategory;
  durationSeconds?: number;
  volume: number;
  loop: boolean;
  usage: string;
}

export interface GeneratedAudioCue {
  kind: 'generated-audio';
  key: string;
  category: AudioCategory;
  frequency: number;
  durationSeconds: number;
  volume: number;
  usage: string;
}

export const AUDIO_KEYS = {
  uiConfirm: 'ui-confirm'
} as const;

export type AudioKey = (typeof AUDIO_KEYS)[keyof typeof AUDIO_KEYS];

export const STARTER_AUDIO_ASSETS: StarterAudioAsset[] = [
  audio(AUDIO_KEYS.uiConfirm, 'sfx', '/assets/audio/sfx/ui-confirm.mp3', 0.38, false, 'menu confirmation cue')
];
export const STARTER_AUDIO_CUES: GeneratedAudioCue[] = [
  cue('starter-jump', 'sfx', 380, 0.08, 0.34, 'generated jump cue'),
  cue('starter-pickup', 'sfx', 720, 0.1, 0.38, 'generated pickup cue'),
  cue('starter-complete', 'sfx', 520, 0.18, 0.42, 'generated level complete cue'),
  cue('starter-deny', 'sfx', 160, 0.12, 0.28, 'generated blocked/deny cue')
];

let audioContext: AudioContext | null = null;

export function getEffectiveVolume(
  assetVolume: number,
  category: AudioCategory,
  settings: GameSettings
): number {
  if (settings.muted) {
    return 0;
  }

  return assetVolume * (category === 'music' ? settings.musicVolume : settings.sfxVolume);
}

export function playAudioAsset(
  scene: Phaser.Scene,
  asset: StarterAudioAsset,
  settings: GameSettings
): void {
  if (scene.sound.locked || !scene.cache.audio.exists(asset.key)) {
    return;
  }

  const volume = getEffectiveVolume(asset.volume, asset.category, settings);

  if (volume <= 0) {
    return;
  }

  scene.sound.play(asset.key, {
    loop: asset.loop,
    volume
  });
}

export function playAudioCue(scene: Phaser.Scene, key: AudioKey | string, settings: GameSettings): void {
  const asset = STARTER_AUDIO_ASSETS.find((candidate) => candidate.key === key);

  if (asset) {
    playAudioAsset(scene, asset, settings);
    return;
  }

  playGeneratedAudioCue(key, settings);
}

export function stopAudioAsset(scene: Phaser.Scene, key: string): void {
  scene.sound.stopByKey(key);
}

export function syncLoopingAudioAsset(
  scene: Phaser.Scene,
  key: AudioKey | string,
  settings: GameSettings
): void {
  const asset = STARTER_AUDIO_ASSETS.find((candidate) => candidate.key === key);

  if (!asset || !asset.loop || scene.sound.locked || !scene.cache.audio.exists(asset.key)) {
    return;
  }

  const volume = getEffectiveVolume(asset.volume, asset.category, settings);
  const existingSounds = scene.sound.getAll<VolumeAdjustableSound>(asset.key);
  const isAlreadyPlaying = existingSounds.some((sound) => sound.isPlaying);

  existingSounds.forEach((sound) => {
    if (typeof sound.setVolume === 'function') {
      sound.setVolume(volume);
      return;
    }

    sound.volume = volume;
  });

  if (!isAlreadyPlaying && volume > 0) {
    scene.sound.play(asset.key, {
      loop: true,
      volume
    });
  }
}

export function playGeneratedAudioCue(
  key: string,
  settings: GameSettings,
  audioCtx: AudioContext = getAudioContext()
): void {
  const cueAsset = STARTER_AUDIO_CUES.find((candidate) => candidate.key === key);

  if (!cueAsset) {
    return;
  }

  const volume = getEffectiveVolume(cueAsset.volume, cueAsset.category, settings);

  if (volume <= 0) {
    return;
  }

  const oscillator = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const now = audioCtx.currentTime;

  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(cueAsset.frequency, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + cueAsset.durationSeconds);
  oscillator.connect(gain);
  gain.connect(audioCtx.destination);
  oscillator.start(now);
  oscillator.stop(now + cueAsset.durationSeconds + 0.02);
}

function cue(
  key: string,
  category: AudioCategory,
  frequency: number,
  durationSeconds: number,
  volume: number,
  usage: string
): GeneratedAudioCue {
  return {
    kind: 'generated-audio',
    key,
    category,
    frequency,
    durationSeconds,
    volume,
    usage
  };
}

function audio(
  key: AudioKey,
  category: AudioCategory,
  url: string,
  volume: number,
  loop: boolean,
  usage: string
): StarterAudioAsset {
  return {
    kind: 'audio',
    key,
    url,
    category,
    volume,
    loop,
    usage
  };
}

function getAudioContext(): AudioContext {
  audioContext ??= new AudioContext();
  return audioContext;
}
