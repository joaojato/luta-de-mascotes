import * as Phaser from 'phaser';

import { AUDIO_KEYS, playAudioCue } from '../game/core/audio';
import { FERRAMENTAS_DE_DEV, GAME_TAGLINE, GAME_TITLE } from '../game/constants';
import { createTextButton, type TextButton } from '../game/ui';
import { SCENE_KEYS } from '../game/types';
import { BaseScene } from './BaseScene';

interface MenuOption {
  label: string;
  action: () => void;
}

export class MainMenuScene extends BaseScene {
  private selectedIndex = 0;

  private buttons: TextButton[] = [];

  private dividers: Phaser.GameObjects.Text[] = [];

  private options: MenuOption[] = [];

  constructor() {
    super(SCENE_KEYS.MainMenu);
  }

  create(): void {
    this.buttons = [];
    this.dividers = [];
    this.selectedIndex = 0;
    this.options = [];

    this.markActiveScene(SCENE_KEYS.MainMenu);
    this.createBackdrop();
    if (!this.createLogo(108, 440)) {
      this.createHeading(GAME_TITLE, GAME_TAGLINE);
    }

    this.renderMenu();

    const keyUp = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    const keyDown = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    const keyW = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    const keyS = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    const keyEnter = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    const keySpace = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    keyUp?.on('down', () => this.moveSelection(-1));
    keyW?.on('down', () => this.moveSelection(-1));
    keyDown?.on('down', () => this.moveSelection(1));
    keyS?.on('down', () => this.moveSelection(1));
    keyEnter?.on('down', () => this.confirmOption(this.options[this.selectedIndex]));
    keySpace?.on('down', () => this.confirmOption(this.options[this.selectedIndex]));

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.clearButtons();
      this.selectedIndex = 0;
      this.options = [];
    });

    this.createFooterHint('Setas ou W/S para escolher   •   Enter ou Espaço confirma');
  }

  private moveSelection(direction: number): void {
    const next = Phaser.Math.Wrap(this.selectedIndex + direction, 0, this.buttons.length);
    this.setSelection(next);
  }

  private setSelection(index: number): void {
    this.selectedIndex = index;
    this.buttons.forEach((button, buttonIndex) => {
      button.setSelected(buttonIndex === index);
    });
  }

  private renderMenu(): void {
    this.clearButtons();

    const playOption: MenuOption = { label: 'Jogar', action: () => this.scene.start(SCENE_KEYS.ModeSelect) };
    const academiaOption: MenuOption = { label: 'Academia', action: () => this.scene.start(SCENE_KEYS.Academia) };
    const celularOption: MenuOption = { label: 'Celular', action: () => this.scene.start(SCENE_KEYS.Conectar) };
    const settingsOption: MenuOption = { label: 'Ajustes', action: () => this.scene.start(SCENE_KEYS.Settings) };
    this.options = FERRAMENTAS_DE_DEV
      ? [playOption, academiaOption, celularOption, settingsOption]
      : [playOption, settingsOption];

    const spacing = 72;
    const startY = this.cameras.main.centerY - (spacing * (this.options.length - 1)) / 2 + 20;
    let row = 0;

    const layoutButton = (option: MenuOption, optionIndex: number): void => {
      const button = createTextButton(this, {
        x: this.cameras.main.centerX,
        y: startY + row * spacing,
        width: 380,
        height: 58,
        label: option.label,
        onClick: () => this.confirmOption(option),
        onHover: () => this.setSelection(optionIndex)
      });

      this.buttons.push(button);
      row += 1;
    };

    this.options.forEach(layoutButton);

    this.setSelection(0);
  }


  private clearButtons(): void {
    this.buttons.forEach((button) => {
      button.destroy();
    });
    this.buttons = [];
    this.dividers.forEach((divider) => {
      divider.destroy();
    });
    this.dividers = [];
  }

  private confirmOption(option?: MenuOption): void {
    if (!option) {
      return;
    }

    playAudioCue(this, AUDIO_KEYS.uiConfirm, this.app.settingsStore.getState());
    option.action();
  }
}
