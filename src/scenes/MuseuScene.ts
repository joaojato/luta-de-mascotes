import * as Phaser from 'phaser';

import { playAudioCue } from '../game/core/audio';
import { ELENCO_SELECIONAVEL } from '../game/elenco';
import {
  COR_BORDA,
  COR_DESTAQUE,
  COR_PAINEL,
  CONTORNO_TITULO,
  FONTE_TEXTO,
  FONTE_TITULO,
  SOMBRA_TITULO,
  TEXTO_APAGADO,
  TEXTO_CLARO,
  TEXTO_DESTAQUE
} from '../game/estilo';
import { findCharacterAnimationKeyByAction } from '../game/hero';
import { LUTADORES } from '../game/lutadores';
import { rostoCrop } from '../game/ui';
import { SCENE_KEYS } from '../game/types';
import { BaseScene } from './BaseScene';

const ALTURA_DO_CORPO = 300;
const ROSTO = 60;
const ROSTO_GAP = 8;
const PAINEL = { x: 560, y: 140, largura: 660, altura: 440 };
const MARGEM_TEXTO = 30;
const COR_ROTULO = '#f87171';

interface Rosto {
  moldura: Phaser.GameObjects.Rectangle;
  imagem: Phaser.GameObjects.Image | null;
}

/**
 * Museu (João, 02/11/2026): um mascote por vez, em guarda à esquerda, com a
 * ficha à direita (apelido, quem é no jogo, de onde veio) e os rostos do
 * elenco embaixo para trocar. O texto mora no bloco `museu` do JSON de cada
 * lutador (Regra do JSON); quem ainda não tem ficha aparece como em preparo.
 */
export class MuseuScene extends BaseScene {
  private indice = 0;
  private corpo!: Phaser.GameObjects.Sprite;
  private nome!: Phaser.GameObjects.Text;
  private apelido!: Phaser.GameObjects.Text;
  private rotuloQuem!: Phaser.GameObjects.Text;
  private descricao!: Phaser.GameObjects.Text;
  private rotuloOrigem!: Phaser.GameObjects.Text;
  private historia!: Phaser.GameObjects.Text;
  private rostos: Rosto[] = [];

  constructor() {
    super(SCENE_KEYS.Museu);
  }

  create(): void {
    this.indice = 0;
    this.rostos = [];
    this.markActiveScene(SCENE_KEYS.Museu);
    this.createBackdrop();
    this.createHeading('Museu', 'Quem são os mascotes e de onde eles vieram');

    // Palco: o mascote em guarda, virado para a ficha.
    const chao = 520;
    this.add.ellipse(300, chao, 220, 32, 0x000000, 0.5).setDepth(2);
    this.corpo = this.add.sprite(300, chao, '__DEFAULT').setDepth(3).setFlipX(true);

    // Ficha.
    this.add
      .rectangle(PAINEL.x, PAINEL.y, PAINEL.largura, PAINEL.altura, COR_PAINEL, 0.88)
      .setOrigin(0, 0)
      .setStrokeStyle(2, COR_BORDA, 1);
    const x = PAINEL.x + MARGEM_TEXTO;
    const largura = PAINEL.largura - MARGEM_TEXTO * 2;
    this.nome = this.add
      .text(x, PAINEL.y + 20, '', { color: TEXTO_DESTAQUE, fontFamily: FONTE_TITULO, fontSize: '46px', stroke: CONTORNO_TITULO, strokeThickness: 6 })
      .setShadow(0, 4, SOMBRA_TITULO, 0, true, true);
    this.apelido = this.add
      .text(x, 0, '', { color: TEXTO_APAGADO, fontFamily: FONTE_TEXTO, fontSize: '20px', fontStyle: 'italic' })
      .setWordWrapWidth(largura);
    const rotulo = (texto: string) =>
      this.add.text(x, 0, texto, { color: COR_ROTULO, fontFamily: FONTE_TITULO, fontSize: '20px', stroke: CONTORNO_TITULO, strokeThickness: 3 });
    const corrido = () =>
      this.add
        .text(x, 0, '', { color: TEXTO_CLARO, fontFamily: FONTE_TEXTO, fontSize: '18px', lineSpacing: 5 })
        .setWordWrapWidth(largura);
    this.rotuloQuem = rotulo('QUEM É');
    this.descricao = corrido();
    this.rotuloOrigem = rotulo('DE ONDE VEIO');
    this.historia = corrido();

    this.criarRostos();
    this.mostrar(0);

    const teclado = this.input.keyboard;
    for (const tecla of ['LEFT', 'A']) teclado?.on(`keydown-${tecla}`, () => this.mover(-1));
    for (const tecla of ['RIGHT', 'D']) teclado?.on(`keydown-${tecla}`, () => this.mover(1));
    for (const tecla of ['ESC', 'BACKSPACE']) teclado?.on(`keydown-${tecla}`, () => this.goToMenu());

    this.createFooterHint('← → escolhe o mascote   •   clique num rosto   •   Esc volta');
  }

  /** Fileira com o rosto de cada mascote do elenco, embaixo, para escolher com o mouse. */
  private criarRostos(): void {
    const total = ELENCO_SELECIONAVEL.length;
    const larguraTotal = total * ROSTO + (total - 1) * ROSTO_GAP;
    const inicio = this.tela.centerX - larguraTotal / 2 + ROSTO / 2;
    const y = 630;
    ELENCO_SELECIONAVEL.forEach((personagem, i) => {
      const cx = inicio + i * (ROSTO + ROSTO_GAP);
      const moldura = this.add.rectangle(cx, y, ROSTO, ROSTO, 0x1e1b2e, 1).setStrokeStyle(2, 0x4c4566, 1).setDepth(5);
      let imagem: Phaser.GameObjects.Image | null = null;
      if (this.textures.exists(personagem.portrait.key)) {
        imagem = this.add.image(cx, y, personagem.portrait.key).setDepth(6);
        rostoCrop(imagem, ROSTO - 4, cx, y, LUTADORES.find((l) => l.id === personagem.id)?.rosto);
      }
      moldura.setInteractive({ useHandCursor: true });
      moldura.on('pointerdown', () => this.escolher(i));
      this.rostos.push({ moldura, imagem });
    });
  }

  private mover(direcao: number): void {
    this.escolher(Phaser.Math.Wrap(this.indice + direcao, 0, ELENCO_SELECIONAVEL.length));
  }

  private escolher(indice: number): void {
    if (indice === this.indice) return;
    playAudioCue(this, 'ui-mover', this.app.settingsStore.getState());
    this.mostrar(indice);
  }

  /** Põe o mascote do índice no palco e a ficha dele no painel. */
  private mostrar(indice: number): void {
    this.indice = indice;
    const personagem = ELENCO_SELECIONAVEL[indice];
    const ficha = LUTADORES.find((l) => l.id === personagem.id)?.museu;

    const guarda = findCharacterAnimationKeyByAction(personagem.id, 'idle');
    const visual = personagem.animations.find((a) => a.key === guarda)?.bounds[0]?.visual;
    this.corpo.setOrigin(0.5, personagem.anchor.y);
    this.corpo.setScale(visual && visual.height > 0 ? ALTURA_DO_CORPO / visual.height : 1);
    if (guarda) this.corpo.play({ key: guarda, repeat: -1 });

    // Cada bloco desce conforme a altura do de cima: texto longo empurra o resto.
    this.nome.setText(personagem.label.toUpperCase());
    this.apelido.setText(ficha?.apelido ?? '').setY(this.nome.y + this.nome.height + 4);
    this.rotuloQuem.setY(this.apelido.y + this.apelido.height + 22);
    this.descricao.setText(ficha?.descricao ?? 'Ficha em preparo.').setY(this.rotuloQuem.y + this.rotuloQuem.height + 6);
    this.rotuloOrigem.setY(this.descricao.y + this.descricao.height + 22).setVisible(Boolean(ficha));
    this.historia.setText(ficha?.historia ?? '').setY(this.rotuloOrigem.y + this.rotuloOrigem.height + 6);

    this.rostos.forEach(({ moldura, imagem }, i) => {
      const escolhido = i === indice;
      moldura.setStrokeStyle(escolhido ? 3 : 2, escolhido ? COR_DESTAQUE : 0x4c4566, 1);
      imagem?.setAlpha(escolhido ? 1 : 0.55);
    });
  }
}
