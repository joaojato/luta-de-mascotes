import * as Phaser from 'phaser';

import { AUDIO_KEYS, playAudioCue } from '../game/core/audio';
import { marcarTutorialVisto } from '../game/tutorial/primeiraVez';
import { createSelectionCard, preencherCartao, type SelectionCard } from '../game/ui';
import { SCENE_KEYS } from '../game/types';
import { BaseScene } from './BaseScene';

const ACCENT = 0xf43f5e;

const OPCOES = [
  { titulo: 'Aprender a jogar', marcador: '▶', texto: 'Escolha seu mascote e treine cada golpe contra o rival, com a CPU fazendo o que o tutorial pede.' },
  { titulo: 'Pular', marcador: '»', texto: 'Ir direto para o menu. Você pode abrir o Tutorial pelo menu principal depois.' }
];

/**
 * Primeira visita (docs/superpowers/specs/2026-11-03-tutorial-design.md): antes
 * de qualquer menu, pergunta do tutorial. As duas respostas gravam a marca, e
 * a pergunta não volta neste navegador.
 */
export class PrimeiraVezScene extends BaseScene {
  private cards: SelectionCard[] = [];
  private selectedIndex = 0;
  private saindo = false;

  constructor() {
    super(SCENE_KEYS.PrimeiraVez);
  }

  create(): void {
    this.cards = [];
    this.selectedIndex = 0;
    this.saindo = false;
    this.markActiveScene(SCENE_KEYS.PrimeiraVez);
    this.createBackdrop();
    this.createHeading('Primeira vez por aqui?', 'Quer aprender a jogar antes de entrar no estádio?');
    this.buildCards();
    this.registerInput();
    this.setSelection(0);
    this.createFooterHint('← → escolhe   •   Enter ou Espaço confirma');

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.cards.forEach((card) => card.destroy());
      this.cards = [];
    });
  }

  private buildCards(): void {
    const { centerX, centerY } = this.tela;
    const cardWidth = 320;
    const cardHeight = 300;
    const gap = 48;
    const startX = centerX - (cardWidth * 2 + gap) / 2 + cardWidth / 2;

    OPCOES.forEach((opcao, index) => {
      const card = createSelectionCard(this, {
        x: startX + index * (cardWidth + gap),
        y: centerY + 30,
        width: cardWidth,
        height: cardHeight,
        title: '',
        onHover: () => this.setSelection(index),
        onClick: () => this.confirm(index)
      });
      preencherCartao(this, card, { titulo: opcao.titulo, marcador: opcao.marcador, texto: opcao.texto, largura: cardWidth });
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
    // Voltar aqui é pular: não há tela antes desta.
    keyboard.on('keydown-ESC', () => this.confirm(1));
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
    if (this.saindo) return;
    this.saindo = true;
    this.setSelection(index);
    marcarTutorialVisto();
    playAudioCue(this, AUDIO_KEYS.uiConfirm, this.app.settingsStore.getState());
    if (index === 0) this.scene.start(SCENE_KEYS.CharacterSelect, { mode: '1vcpu', stageId: 'estadio', tutorial: true });
    else this.scene.start(SCENE_KEYS.MainMenu);
  }
}
