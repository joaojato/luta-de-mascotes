import * as Phaser from 'phaser';

import { AUDIO_KEYS, playAudioCue } from '../game/core/audio';
import { createSelectionCard, type SelectionCard } from '../game/ui';
import { SCENE_KEYS, type MatchMode } from '../game/types';
import { controlesDeToqueAtivos } from '../toque/telaToque';
import { BaseScene } from './BaseScene';

interface ModeOption {
  mode: MatchMode;
  title: string;
  subtitle: string;
  texture: string;
}

const MODE_OPTIONS: ModeOption[] = [
  { mode: '1v1', title: '1 VS 1', subtitle: 'Dois jogadores, um teclado', texture: 'mode-card-1v1' },
  { mode: '1vcpu', title: '1 VS CPU', subtitle: 'Você escolhe, a CPU responde', texture: 'mode-card-1vcpu' }
];

/** No celular só há um par de mãos na tela: o 1 VS 1 fica para o teclado (docs/mobile.md). */
function opcoesDeModo(): ModeOption[] {
  return controlesDeToqueAtivos() ? MODE_OPTIONS.filter((option) => option.mode === '1vcpu') : MODE_OPTIONS;
}

const ACCENT = 0x38bdf8;

/**
 * First step of the Play flow: choose a local two-player match or a single
 * player versus CPU match. Forwards the chosen mode to the level select screen.
 */
export class ModeSelectScene extends BaseScene {
  private cards: SelectionCard[] = [];
  private selectedIndex = 0;

  constructor() {
    super(SCENE_KEYS.ModeSelect);
  }

  create(): void {
    this.cards = [];
    this.selectedIndex = 0;

    this.markActiveScene(SCENE_KEYS.ModeSelect);
    this.createBackdrop();
    this.createHeading('Escolha o modo', 'Como você quer jogar?');

    this.buildCards();
    this.registerInput();
    this.setSelection(0);

    this.createFooterHint('← → ou A/D para escolher   •   Enter ou Espaço confirma   •   Esc volta');

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.cards.forEach((card) => card.destroy());
      this.cards = [];
    });
  }

  private buildCards(): void {
    const { centerX, centerY } = this.cameras.main;
    const cardWidth = 380;
    const cardHeight = 390;
    const gap = 60;
    const opcoes = opcoesDeModo();
    const totalWidth = cardWidth * opcoes.length + gap * (opcoes.length - 1);
    const startX = centerX - totalWidth / 2 + cardWidth / 2;

    opcoes.forEach((option, index) => {
      const card = createSelectionCard(this, {
        x: startX + index * (cardWidth + gap),
        y: centerY + 10,
        width: cardWidth,
        height: cardHeight,
        // O cartão já traz o "1 VS 1" desenhado na arte.
        title: '',
        subtitle: option.subtitle,
        texture: option.texture,
        imageMaxSize: 352,
        imageOffsetY: -22,
        onHover: () => this.setSelection(index),
        onClick: () => this.confirm(index)
      });

      this.cards.push(card);
    });
  }

  private registerInput(): void {
    const keyboard = this.input.keyboard;
    if (!keyboard) {
      return;
    }

    keyboard.on('keydown-LEFT', () => this.moveSelection(-1));
    keyboard.on('keydown-A', () => this.moveSelection(-1));
    keyboard.on('keydown-RIGHT', () => this.moveSelection(1));
    keyboard.on('keydown-D', () => this.moveSelection(1));
    keyboard.on('keydown-ENTER', () => this.confirm(this.selectedIndex));
    keyboard.on('keydown-SPACE', () => this.confirm(this.selectedIndex));
    keyboard.on('keydown-ESC', () => this.goToMenu());
    keyboard.on('keydown-BACKSPACE', () => this.goToMenu());
  }

  private moveSelection(direction: number): void {
    const next = Phaser.Math.Wrap(this.selectedIndex + direction, 0, this.cards.length);
    if (next !== this.selectedIndex) playAudioCue(this, 'ui-mover', this.app.settingsStore.getState());
    this.setSelection(next);
  }

  private setSelection(index: number): void {
    this.selectedIndex = index;
    this.cards.forEach((card, cardIndex) => card.setSelected(cardIndex === index, ACCENT));
  }

  private confirm(index: number): void {
    this.setSelection(index);
    playAudioCue(this, AUDIO_KEYS.uiConfirm, this.app.settingsStore.getState());
    this.scene.start(SCENE_KEYS.LevelSelect, { mode: opcoesDeModo()[index].mode });
  }
}
