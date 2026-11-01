import * as Phaser from 'phaser';

import { AUDIO_KEYS, playAudioCue } from '../game/core/audio';
import { DIFICULDADES } from '../game/cpu';
import { createSelectionCard, preencherCartao, type SelectionCard } from '../game/ui';
import { SCENE_KEYS, type DificuldadeData } from '../game/types';
import { BaseScene } from './BaseScene';

const ACCENT = 0xf43f5e;
const MARCADORES = ['●○○', '●●○', '●●●'];

/**
 * Dificuldade da CPU numa tela própria, com três cartões que dizem o que a
 * CPU faz (João, 31/10/2026: ela não pode ficar escondida). A mesma tela
 * serve à Pelada (1 VS CPU) e ao Torneio. A escolha fica nos ajustes.
 */
export class DificuldadeScene extends BaseScene {
  private dados: DificuldadeData = { destino: 'pelada' };
  private cards: SelectionCard[] = [];
  private selectedIndex = 1;

  constructor() {
    super(SCENE_KEYS.Dificuldade);
  }

  init(data: DificuldadeData): void {
    this.dados = data?.destino ? data : { destino: 'pelada' };
  }

  create(): void {
    this.cards = [];
    const atual = DIFICULDADES.findIndex((d) => d.id === this.app.settingsStore.getState().cpuDificuldade);
    this.selectedIndex = atual >= 0 ? atual : 1;

    this.markActiveScene(SCENE_KEYS.Dificuldade);
    this.createBackdrop();
    this.createHeading('Escolha a dificuldade', this.dados.destino === 'pelada' ? 'Pelada contra a CPU' : 'Torneio contra a CPU');

    this.buildCards();
    this.registerInput();
    this.setSelection(this.selectedIndex);

    this.createFooterHint('← → escolhe   •   Enter ou Espaço confirma   •   Esc volta');

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.cards.forEach((card) => card.destroy());
      this.cards = [];
    });
  }

  private buildCards(): void {
    const { centerX, centerY } = this.cameras.main;
    const cardWidth = 300;
    const cardHeight = 360;
    const gap = 40;
    const startX = centerX - (cardWidth * 3 + gap * 2) / 2 + cardWidth / 2;

    DIFICULDADES.forEach((dificuldade, index) => {
      const textura = `dificuldade-${dificuldade.id}`;
      const ilustrado = this.textures.exists(textura);
      const card = createSelectionCard(this, {
        x: startX + index * (cardWidth + gap),
        y: centerY + 20,
        width: cardWidth,
        height: cardHeight,
        // A ilustração já traz o nome desenhado; o texto explica o nível.
        title: '',
        subtitle: ilustrado ? dificuldade.descricao : undefined,
        texture: ilustrado ? textura : undefined,
        imageMaxSize: cardWidth - 20,
        imageOffsetY: -30,
        onHover: () => this.setSelection(index),
        onClick: () => this.confirm(index)
      });
      if (!ilustrado) {
        preencherCartao(this, card, { titulo: dificuldade.nome, marcador: MARCADORES[index], texto: dificuldade.descricao, largura: cardWidth });
      }
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
    keyboard.on('keydown-ESC', () => this.voltar());
    keyboard.on('keydown-BACKSPACE', () => this.voltar());
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
    const estado = this.app.settingsStore.getState();
    this.app.settingsStore.setState({ ...estado, cpuDificuldade: DIFICULDADES[index].id });
    playAudioCue(this, AUDIO_KEYS.uiConfirm, estado);
    if (this.dados.destino === 'pelada') {
      this.scene.start(SCENE_KEYS.LevelSelect, { mode: '1vcpu' });
    } else {
      this.scene.start(SCENE_KEYS.CharacterSelect, {
        mode: '1vcpu',
        stageId: 'estadio',
        torneio: { formato: this.dados.formato, tamanho: this.dados.tamanho }
      });
    }
  }

  private voltar(): void {
    if (this.dados.destino === 'pelada') this.scene.start(SCENE_KEYS.ModeSelect);
    else this.scene.start(SCENE_KEYS.Torneio);
  }
}
