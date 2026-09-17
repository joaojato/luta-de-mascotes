import * as Phaser from 'phaser';

import type { InputSnapshot } from '../types';

export interface ActionKeys {
  cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  keys: Partial<
    Record<
      'W' | 'A' | 'S' | 'D' | 'SPACE' | 'ENTER' | 'ESC' | 'SHIFT' | 'Z' | 'X',
      Phaser.Input.Keyboard.Key
    >
  >;
}

export function createActionKeys(scene: Phaser.Scene): ActionKeys {
  return {
    cursors: scene.input.keyboard?.createCursorKeys(),
    keys: {
      W: scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      SPACE: scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      ENTER: scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
      ESC: scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
      SHIFT: scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
      Z: scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
      X: scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.X)
    }
  };
}

export function readActionInput(scene: Phaser.Scene, actionKeys: ActionKeys): InputSnapshot {
  return {
    up: Boolean(actionKeys.cursors?.up.isDown || actionKeys.keys.W?.isDown),
    down: Boolean(actionKeys.cursors?.down.isDown || actionKeys.keys.S?.isDown),
    left: Boolean(actionKeys.cursors?.left.isDown || actionKeys.keys.A?.isDown),
    right: Boolean(actionKeys.cursors?.right.isDown || actionKeys.keys.D?.isDown),
    run: Boolean(actionKeys.keys.SHIFT?.isDown),
    jump: Boolean(actionKeys.cursors?.up.isDown || actionKeys.cursors?.space.isDown || actionKeys.keys.X?.isDown),
    attack: Boolean(actionKeys.keys.Z?.isDown),
    confirm: Boolean(actionKeys.keys.ENTER?.isDown),
    cancel: Boolean(actionKeys.keys.ESC?.isDown),
    pointerDown: scene.input.activePointer.isDown
  };
}

export function emptyInputSnapshot(): InputSnapshot {
  return {
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
  };
}

export function mergeInputSnapshots(...inputs: InputSnapshot[]): InputSnapshot {
  return inputs.reduce<InputSnapshot>(
    (merged, input) => ({
      up: merged.up || input.up,
      down: merged.down || input.down,
      left: merged.left || input.left,
      right: merged.right || input.right,
      run: merged.run || input.run,
      jump: merged.jump || input.jump,
      attack: merged.attack || input.attack,
      confirm: merged.confirm || input.confirm,
      cancel: merged.cancel || input.cancel,
      pointerDown: merged.pointerDown || input.pointerDown
    }),
    emptyInputSnapshot()
  );
}

export function formatInputSnapshot(input: InputSnapshot): string {
  const activeInputs = [
    input.up ? 'up' : '',
    input.down ? 'down' : '',
    input.left ? 'left' : '',
    input.right ? 'right' : '',
    input.run ? 'run' : '',
    input.jump ? 'jump' : '',
    input.attack ? 'attack' : '',
    input.confirm ? 'confirm' : '',
    input.cancel ? 'cancel' : '',
    input.pointerDown ? 'pointer' : ''
  ].filter(Boolean);

  return activeInputs.length > 0 ? activeInputs.join(' + ') : 'idle';
}
