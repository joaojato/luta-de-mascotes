import * as Phaser from 'phaser';

import { decidirEscala, instalarNitidez } from './nitidez';
import { GAME_PROFILES } from './profiles';
import type { GameProfile } from './types';
import { BootScene } from '../scenes/BootScene';
import { MainMenuScene } from '../scenes/MainMenuScene';
import { ModeSelectScene } from '../scenes/ModeSelectScene';
import { DificuldadeScene } from '../scenes/DificuldadeScene';
import { TorneioScene } from '../scenes/TorneioScene';
import { TorneioQuadroScene } from '../scenes/TorneioQuadroScene';
import { LevelSelectScene } from '../scenes/LevelSelectScene';
import { CharacterSelectScene } from '../scenes/CharacterSelectScene';
import { MatchScene } from '../scenes/MatchScene';
import { AcademiaScene } from '../scenes/AcademiaScene';
import { ConectarScene } from '../scenes/ConectarScene';
import { SettingsScene } from '../scenes/SettingsScene';

export function createGame(parent: HTMLElement, profile: GameProfile): Phaser.Game {
  const config = GAME_PROFILES[profile];
  // Canvas na resolução da área do jogo; as cenas seguem em 1280x720 (nitidez.ts).
  const canvas = decidirEscala(config.width, config.height, parent);

  const game = new Phaser.Game({
    type: Phaser.WEBGL,
    parent,
    width: canvas.width,
    height: canvas.height,
    backgroundColor: '#020617',
    transparent: true,
    roundPixels: false,
    // A arte é pixel art ampliada ~2x: pixel nítido, só a borda entre eles
    // suavizada. O filtro linear de antes borrava tudo.
    render: {
      smoothPixelArt: true
    },
    // Avoid Phaser's default 120-frame delta cooldown making startup gameplay run in slow motion.
    fps: {
      target: 60,
      panicMax: 0,
      deltaHistory: 1
    },
    // Quem centraliza é o CSS (.game-root é flex). Centralizar aqui também
    // somava as duas margens e empurrava o jogo para a direita.
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.NO_CENTER
    },
    physics: {
      default: 'arcade',
      arcade: {
        debug: false
      }
    },
    scene: [
      BootScene,
      MainMenuScene,
      ModeSelectScene,
      DificuldadeScene,
      TorneioScene,
      TorneioQuadroScene,
      LevelSelectScene,
      CharacterSelectScene,
      MatchScene,
      AcademiaScene,
      ConectarScene,
      SettingsScene
    ]
  });

  instalarNitidez(game, parent);
  guardKeyboardWhileEditing(game);

  if (import.meta.env.DEV) {
    (window as unknown as { __PHASER_GAME__?: Phaser.Game }).__PHASER_GAME__ = game;
  }

  return game;
}

/**
 * Prevents keystrokes typed into DOM form controls (e.g. the debug sidebar
 * inputs) from reaching the game. While an editable element is focused the
 * Phaser keyboard manager is disabled, which both stops scenes from reacting to
 * those keys and lets the browser handle them normally (arrows, space, etc.).
 * Listeners are cleaned up when the game is destroyed.
 * @param game - The Phaser game instance to guard.
 */
function guardKeyboardWhileEditing(game: Phaser.Game): void {
  const syncKeyboardEnabled = (): void => {
    const keyboard = game.input?.keyboard;

    if (!keyboard) {
      return;
    }

    keyboard.enabled = !isEditableElement(document.activeElement);
  };

  // focusout fires before document.activeElement settles, so defer the read.
  const handleFocusChange = (): void => {
    window.setTimeout(syncKeyboardEnabled, 0);
  };

  // Phaser calls preventDefault() on canvas pointer-downs, which stops the
  // browser from blurring a focused debug input. Without this, clicking the
  // canvas after editing a field would leave the field focused and the game
  // keyboard disabled. Explicitly release editing focus on canvas clicks.
  const handlePointerDown = (event: Event): void => {
    if (!(event.target instanceof HTMLCanvasElement)) {
      return;
    }

    const active = document.activeElement;
    if (isEditableElement(active)) {
      (active as HTMLElement).blur();
    }

    syncKeyboardEnabled();
  };

  document.addEventListener('focusin', handleFocusChange);
  document.addEventListener('focusout', handleFocusChange);
  document.addEventListener('pointerdown', handlePointerDown, true);

  game.events.once(Phaser.Core.Events.DESTROY, () => {
    document.removeEventListener('focusin', handleFocusChange);
    document.removeEventListener('focusout', handleFocusChange);
    document.removeEventListener('pointerdown', handlePointerDown, true);
  });
}

/**
 * Returns true when the given element accepts text/keyboard editing (input,
 * textarea, select, or any contenteditable host).
 * @param element - The element to test (typically `document.activeElement`).
 */
function isEditableElement(element: Element | null): boolean {
  if (!element) {
    return false;
  }

  const tagName = element.tagName;

  return (
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    tagName === 'SELECT' ||
    (element as HTMLElement).isContentEditable
  );
}
