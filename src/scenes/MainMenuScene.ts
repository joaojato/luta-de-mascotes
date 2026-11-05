import * as Phaser from 'phaser';

import { AUDIO_KEYS, playAudioCue } from '../game/core/audio';
import { musica } from '../game/musica/tocador';
import { FERRAMENTAS_DE_DEV, GAME_TAGLINE, GAME_TITLE } from '../game/constants';
import { LOGO_IMAGE_ASSET } from '../game/assets';
import { layoutDoMenu, type LayoutDoMenu } from '../game/menuPrincipal';
import { createTextButton, type TextButton } from '../game/ui';
import { SCENE_KEYS } from '../game/types';
import { BaseScene } from './BaseScene';

interface MenuOption {
  label: string;
  action: () => void;
}

const LARGURA_DA_LOGO = 440;

export class MainMenuScene extends BaseScene {
  private selectedIndex = 0;

  private buttons: TextButton[] = [];

  private dividers: Phaser.GameObjects.Text[] = [];

  private options: MenuOption[] = [];

  constructor() {
    super(SCENE_KEYS.MainMenu);
  }

  create(): void {
    musica(this.game).tocar('menu');
    this.buttons = [];
    this.dividers = [];
    this.selectedIndex = 0;
    this.options = [];

    this.markActiveScene(SCENE_KEYS.MainMenu);
    this.createBackdrop();
    this.options = this.montarOpcoes();
    // Logo e botões num bloco só, centrado na altura da tela (menuPrincipal.ts).
    const layout = layoutDoMenu(this.tela.height, this.alturaDaLogo(), this.options.length);
    if (!this.createLogo(layout.logoY, LARGURA_DA_LOGO)) {
      this.createHeading(GAME_TITLE, GAME_TAGLINE);
    }

    this.renderMenu(layout);

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
    if (next !== this.selectedIndex) playAudioCue(this, 'ui-mover', this.app.settingsStore.getState());
    this.setSelection(next);
  }

  private setSelection(index: number): void {
    this.selectedIndex = index;
    this.buttons.forEach((button, buttonIndex) => {
      button.setSelected(buttonIndex === index);
    });
  }

  /** Altura da logo na tela (0 sem a imagem, e o título de texto entra no lugar). */
  private alturaDaLogo(): number {
    if (!this.textures.exists(LOGO_IMAGE_ASSET.key)) return 0;
    const frame = this.textures.getFrame(LOGO_IMAGE_ASSET.key);
    return (frame.height * Math.min(LARGURA_DA_LOGO, this.tela.width - 32)) / frame.width;
  }

  private montarOpcoes(): MenuOption[] {
    const playOption: MenuOption = { label: 'Pelada', action: () => this.scene.start(SCENE_KEYS.ModeSelect) };
    const tutorialOption: MenuOption = {
      label: 'Tutorial',
      action: () => this.scene.start(SCENE_KEYS.CharacterSelect, { mode: '1vcpu', stageId: 'estadio', tutorial: true })
    };
    const torneiosOption: MenuOption = { label: 'Torneios', action: () => this.scene.start(SCENE_KEYS.Torneio) };
    const museuOption: MenuOption = { label: 'Museu', action: () => this.scene.start(SCENE_KEYS.Museu) };
    const academiaOption: MenuOption = { label: 'Academia', action: () => this.scene.start(SCENE_KEYS.Academia) };
    const celularOption: MenuOption = { label: 'Celular', action: () => this.scene.start(SCENE_KEYS.Conectar) };
    const settingsOption: MenuOption = { label: 'Ajustes', action: () => this.scene.start(SCENE_KEYS.Settings) };
    return FERRAMENTAS_DE_DEV
      ? [playOption, tutorialOption, torneiosOption, museuOption, academiaOption, celularOption, settingsOption]
      : [playOption, tutorialOption, torneiosOption, museuOption, settingsOption];
  }

  private renderMenu(layout: LayoutDoMenu): void {
    this.clearButtons();
    let row = 0;

    const layoutButton = (option: MenuOption, optionIndex: number): void => {
      const button = createTextButton(this, {
        x: this.tela.centerX,
        y: layout.primeiroBotaoY + row * layout.espaco,
        width: 380,
        height: layout.alturaBotao,
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
