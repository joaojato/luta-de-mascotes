import * as Phaser from 'phaser';

import { AUDIO_KEYS, playAudioCue } from '../game/core/audio';
import { FIGHTER_CHARACTER_DEFINITIONS, findCharacterAnimationKeyByAction, type CharacterDefinition } from '../game/hero';
import { LUTADORES } from '../game/lutadores';
import { getStageDefinition } from '../game/stageConfig';
import { SCENE_KEYS, type MatchMode } from '../game/types';
import { BaseScene } from './BaseScene';

interface CharacterSelectData {
  mode: MatchMode;
  stageId: string;
}

const P1_COLOR = 0x38bdf8;
const P2_COLOR = 0xf43f5e;
const GOLD = 0xfacc15;
const TILE_SIZE = 116;
const TILE_GAP = 10;
const MAX_COLUMNS = 6;
const PREVIEW_BODY_HEIGHT = 250;

// Regra do JSON: quem entra na seleção é decidido no JSON do lutador
// (`selecionavel`), nunca por lista de ids aqui.
const SELECTABLE_ROSTER = FIGHTER_CHARACTER_DEFINITIONS.filter(
  (character) => LUTADORES.find((lutador) => lutador.id === character.id)?.selecionavel !== false
);

interface Tile {
  x: number;
  y: number;
  frame: Phaser.GameObjects.Rectangle;
  portrait: Phaser.GameObjects.Image | null;
  flash: Phaser.GameObjects.Rectangle;
}

interface PlayerCursor {
  index: number;
  locked: boolean;
  color: number;
  outline: Phaser.GameObjects.Rectangle;
  tag: Phaser.GameObjects.Text;
  preview: Phaser.GameObjects.Sprite;
  name: Phaser.GameObjects.Text;
  side: -1 | 1;
}

/**
 * Seleção no modelo Mortal Kombat: o elenco inteiro numa grade de quadrados
 * pequenos no centro, e cada jogador vê o lutador escolhido animado na sua
 * lateral. Em 1v1 cada jogador tem o próprio cursor (P1 = WASD, P2 = setas) e
 * os dois não podem parar no mesmo lutador. Em 1vCPU a CPU sorteia outro.
 */
export class CharacterSelectScene extends BaseScene {
  private mode: MatchMode = '1v1';
  private stageId = '';
  private tiles: Tile[] = [];
  private columns = 1;
  private p1!: PlayerCursor;
  private p2!: PlayerCursor;
  private transitioning = false;

  constructor() {
    super(SCENE_KEYS.CharacterSelect);
  }

  init(data: CharacterSelectData): void {
    this.mode = data?.mode ?? '1v1';
    this.stageId = data?.stageId ?? '';
  }

  create(): void {
    this.tiles = [];
    this.transitioning = false;

    this.markActiveScene(SCENE_KEYS.CharacterSelect);
    this.cameras.main.setBackgroundColor(0x05030a);

    this.buildBackdrop();
    this.buildTitle();
    this.buildGrid();
    this.p1 = this.createCursor('P1', P1_COLOR, 0, -1);
    this.p2 = this.createCursor(this.mode === '1v1' ? 'P2' : 'CPU', P2_COLOR, this.mode === '1v1' ? Math.min(1, this.tiles.length - 1) : 0, 1);

    if (this.mode === '1vcpu') {
      this.setCursorVisible(this.p2, false);
    }

    this.refreshCursor(this.p1);
    this.refreshCursor(this.p2);
    this.registerInput();

    this.createFooterHint(
      this.mode === '1v1'
        ? 'P1: WASD + Espaço   •   P2: Setas + Enter   •   Esc volta'
        : 'WASD ou Setas para escolher   •   Enter confirma   •   Esc volta'
    );
  }

  /** Fundo: o cenário escolhido, escurecido, com uma faixa de chão. */
  private buildBackdrop(): void {
    const { width, height } = this.cameras.main;
    const stage = getStageDefinition(this.stageId);

    if (this.textures.exists(stage.key)) {
      const image = this.add.image(width / 2, height / 2, stage.key);
      image.setScale(Math.max(width / image.width, height / image.height));
      image.setTint(0x6b5a7a).setAlpha(0.45);
    }

    this.add.rectangle(width / 2, height / 2, width, height, 0x05030a, 0.55);
    // Vinheta em cima e embaixo, para o título e o rodapé lerem.
    this.add.rectangle(width / 2, 0, width, 220, 0x05030a, 0.85).setOrigin(0.5, 0);
    this.add.rectangle(width / 2, height, width, 120, 0x05030a, 0.9).setOrigin(0.5, 1);
  }

  private buildTitle(): void {
    const { centerX } = this.cameras.main;

    this.add
      .text(centerX, 54, 'ESCOLHA SEU LUTADOR', {
        color: '#facc15',
        fontFamily: 'Impact, "Arial Black", sans-serif',
        fontSize: '52px',
        stroke: '#7c2d12',
        strokeThickness: 8
      })
      .setOrigin(0.5)
      .setShadow(0, 4, '#000000', 0, true, true);
  }

  /** Grade centralizada de quadrados com o retrato recortado de cada lutador. */
  private buildGrid(): void {
    const { width, height } = this.cameras.main;
    const roster = SELECTABLE_ROSTER;
    const sideRoom = Math.max(180, width * 0.24);
    const fit = Math.floor((width - sideRoom * 2 + TILE_GAP) / (TILE_SIZE + TILE_GAP));
    this.columns = Phaser.Math.Clamp(Math.min(fit, roster.length), 1, MAX_COLUMNS);

    const rows = Math.ceil(roster.length / this.columns);
    const gridHeight = rows * TILE_SIZE + (rows - 1) * TILE_GAP;
    const top = height * 0.5 - gridHeight / 2 + TILE_SIZE / 2;

    roster.forEach((character, index) => {
      const row = Math.floor(index / this.columns);
      const col = index % this.columns;
      // A última linha incompleta fica centralizada, como na grade do MK.
      const inRow = Math.min(this.columns, roster.length - row * this.columns);
      const rowWidth = inRow * TILE_SIZE + (inRow - 1) * TILE_GAP;
      const x = width / 2 - rowWidth / 2 + TILE_SIZE / 2 + col * (TILE_SIZE + TILE_GAP);
      const y = top + row * (TILE_SIZE + TILE_GAP);

      this.tiles.push(this.createTile(character, index, x, y));
    });
  }

  private createTile(character: CharacterDefinition, index: number, x: number, y: number): Tile {
    const frame = this.add
      .rectangle(x, y, TILE_SIZE, TILE_SIZE, 0x1e1b2e, 1)
      .setStrokeStyle(3, 0x4c4566, 1)
      .setDepth(5);

    let portrait: Phaser.GameObjects.Image | null = null;
    if (this.textures.exists(character.portrait.key)) {
      portrait = this.add.image(x, y, character.portrait.key).setDepth(6);
      coverCrop(portrait, TILE_SIZE - 6, x, y);
    }

    const flash = this.add.rectangle(x, y, TILE_SIZE, TILE_SIZE, 0xffffff, 0).setDepth(8);

    frame.setInteractive({ useHandCursor: true });
    frame.on('pointerover', () => this.hoverTile(index));
    frame.on('pointerdown', () => this.clickTile(index));

    return { x, y, frame, portrait, flash };
  }

  private createCursor(label: string, color: number, index: number, side: -1 | 1): PlayerCursor {
    const { width, height } = this.cameras.main;
    const previewX = side === -1 ? width * 0.13 : width * 0.87;
    const floorY = height * 0.5 + PREVIEW_BODY_HEIGHT / 2 + 30;

    this.add.ellipse(previewX, floorY, 170, 26, 0x000000, 0.5).setDepth(2);

    const preview = this.add.sprite(previewX, floorY, '__DEFAULT').setDepth(3);
    // Os sprites olham para a esquerda; o da esquerda vira para o centro.
    preview.setFlipX(side === -1);

    const name = this.add
      .text(previewX, floorY + 34, '', {
        color: colorToCss(color),
        fontFamily: 'Impact, "Arial Black", sans-serif',
        fontSize: '30px',
        stroke: '#000000',
        strokeThickness: 6
      })
      .setOrigin(0.5, 0)
      .setDepth(4);

    const outline = this.add
      .rectangle(0, 0, TILE_SIZE + 4, TILE_SIZE + 4, color, 0)
      .setStrokeStyle(5, color, 1)
      .setDepth(10);

    const tag = this.add
      .text(0, 0, label, {
        color: '#05030a',
        backgroundColor: colorToCss(color),
        fontFamily: 'monospace',
        fontSize: '14px',
        fontStyle: 'bold',
        padding: { x: 6, y: 2 }
      })
      .setOrigin(side === -1 ? 0 : 1, 0)
      .setDepth(11);

    return { index, locked: false, color, outline, tag, preview, name, side };
  }

  private setCursorVisible(cursor: PlayerCursor, visible: boolean): void {
    cursor.outline.setVisible(visible);
    cursor.tag.setVisible(visible);
    cursor.preview.setVisible(visible);
    cursor.name.setText(visible ? cursor.name.text : '?');
  }

  private refreshCursor(cursor: PlayerCursor): void {
    const tile = this.tiles[cursor.index];
    if (!tile) {
      return;
    }

    const half = TILE_SIZE / 2;
    cursor.outline.setPosition(tile.x, tile.y);
    cursor.outline.setStrokeStyle(cursor.locked ? 7 : 5, cursor.locked ? GOLD : cursor.color, 1);
    cursor.tag.setPosition(cursor.side === -1 ? tile.x - half - 2 : tile.x + half + 2, tile.y - half - 22);

    this.tiles.forEach((candidate, index) => {
      const chosen = index === this.p1?.index || (index === this.p2?.index && this.p2.outline.visible);
      candidate.portrait?.setAlpha(chosen ? 1 : 0.55);
    });

    if (cursor.preview.visible) {
      this.showPreview(cursor);
    }
  }

  /** Mostra o lutador do cursor parado em guarda, na escala da lateral. */
  private showPreview(cursor: PlayerCursor, action = 'idle'): void {
    const character = SELECTABLE_ROSTER[cursor.index];
    const key = findCharacterAnimationKeyByAction(character.id, action);
    const idleKey = findCharacterAnimationKeyByAction(character.id, 'idle');
    const visual = character.animations.find((animation) => animation.key === idleKey)?.bounds[0]?.visual;

    cursor.preview.setOrigin(0.5, character.anchor.y);
    cursor.preview.setScale(visual && visual.height > 0 ? PREVIEW_BODY_HEIGHT / visual.height : 1);
    cursor.name.setText(character.label.toUpperCase());

    if (!key) {
      return;
    }

    cursor.preview.play({ key, repeat: action === 'idle' ? -1 : 0 });
    if (action !== 'idle' && idleKey) {
      cursor.preview.once(`animationcomplete-${key}`, () => cursor.preview.play({ key: idleKey, repeat: -1 }));
    }
  }

  private registerInput(): void {
    const keyboard = this.input.keyboard;
    if (!keyboard) {
      return;
    }

    if (this.mode === '1v1') {
      keyboard.on('keydown-A', () => this.movePlayer(this.p1, -1, 0));
      keyboard.on('keydown-D', () => this.movePlayer(this.p1, 1, 0));
      keyboard.on('keydown-W', () => this.movePlayer(this.p1, 0, -1));
      keyboard.on('keydown-S', () => this.movePlayer(this.p1, 0, 1));
      keyboard.on('keydown-LEFT', () => this.movePlayer(this.p2, -1, 0));
      keyboard.on('keydown-RIGHT', () => this.movePlayer(this.p2, 1, 0));
      keyboard.on('keydown-UP', () => this.movePlayer(this.p2, 0, -1));
      keyboard.on('keydown-DOWN', () => this.movePlayer(this.p2, 0, 1));
      keyboard.on('keydown-SPACE', () => this.confirmPlayer(this.p1));
      keyboard.on('keydown-F', () => this.confirmPlayer(this.p1));
      keyboard.on('keydown-ENTER', () => this.confirmPlayer(this.p2));
    } else {
      const bind = (keys: string[], dx: number, dy: number): void =>
        keys.forEach((key) => keyboard.on(`keydown-${key}`, () => this.movePlayer(this.p1, dx, dy)));
      bind(['A', 'LEFT'], -1, 0);
      bind(['D', 'RIGHT'], 1, 0);
      bind(['W', 'UP'], 0, -1);
      bind(['S', 'DOWN'], 0, 1);
      keyboard.on('keydown-SPACE', () => this.confirmPlayer(this.p1));
      keyboard.on('keydown-F', () => this.confirmPlayer(this.p1));
      keyboard.on('keydown-ENTER', () => this.confirmPlayer(this.p1));
    }

    keyboard.on('keydown-ESC', () => this.goBack());
    keyboard.on('keydown-BACKSPACE', () => this.goBack());
  }

  /**
   * Anda um passo na grade. Na horizontal dá a volta na linha; na vertical,
   * se a linha de destino for mais curta, para no último quadro dela. Em 1v1
   * o cursor pula o quadro do outro jogador; sem saída, não anda.
   */
  private movePlayer(cursor: PlayerCursor, dx: number, dy: number): void {
    if (this.transitioning || cursor.locked) {
      return;
    }

    const blocked = this.mode === '1v1' ? this.otherCursor(cursor).index : -1;
    let next = this.step(cursor.index, dx, dy);
    if (next === blocked) {
      next = this.step(next, dx, dy);
    }
    if (next === cursor.index || next === blocked) {
      return;
    }

    cursor.index = next;
    this.refreshCursor(cursor);
  }

  private step(index: number, dx: number, dy: number): number {
    const count = this.tiles.length;
    if (dx !== 0) {
      return Phaser.Math.Wrap(index + dx, 0, count);
    }

    const rows = Math.ceil(count / this.columns);
    const row = Phaser.Math.Wrap(Math.floor(index / this.columns) + dy, 0, rows);
    const col = index % this.columns;
    return Math.min(row * this.columns + col, count - 1);
  }

  private otherCursor(cursor: PlayerCursor): PlayerCursor {
    return cursor === this.p1 ? this.p2 : this.p1;
  }

  private hoverTile(index: number): void {
    if (this.transitioning || this.mode !== '1vcpu' || this.p1.locked || this.p1.index === index) {
      return;
    }

    this.p1.index = index;
    this.refreshCursor(this.p1);
  }

  private clickTile(index: number): void {
    if (this.transitioning || this.mode !== '1vcpu') {
      return;
    }

    this.p1.index = index;
    this.refreshCursor(this.p1);
    this.confirmPlayer(this.p1);
  }

  /**
   * Trava a escolha: borda dourada, piscada no quadro e o lutador da lateral
   * solta um soco. Em 1v1 a luta começa quando os dois travam; em 1vCPU,
   * travar o jogador dispara o sorteio da CPU.
   */
  private confirmPlayer(cursor: PlayerCursor): void {
    if (this.transitioning || cursor.locked) {
      return;
    }

    cursor.locked = true;
    this.refreshCursor(cursor);
    this.showPreview(cursor, 'light-punch');
    playAudioCue(this, AUDIO_KEYS.uiConfirm, this.app.settingsStore.getState());

    this.flashTile(cursor.index, () => {
      if (this.mode === '1vcpu') {
        this.runCpuSelection();
        return;
      }

      if (this.p1.locked && this.p2.locked) {
        this.startMatch();
      }
    });
  }

  private flashTile(index: number, onComplete: () => void): void {
    this.tweens.add({
      targets: this.tiles[index].flash,
      alpha: { from: 0, to: 0.8 },
      duration: 80,
      yoyo: true,
      repeat: 2,
      onComplete
    });
  }

  private runCpuSelection(): void {
    if (this.transitioning) {
      return;
    }

    this.transitioning = true;

    const choices = this.tiles.map((_, index) => index).filter((index) => index !== this.p1.index);
    const cpuIndex = choices.length > 0 ? Phaser.Math.RND.pick(choices) : this.p1.index;

    this.p2.index = cpuIndex;
    this.setCursorVisible(this.p2, true);
    this.refreshCursor(this.p2);

    this.time.delayedCall(450, () => {
      this.p2.locked = true;
      this.refreshCursor(this.p2);
      this.showPreview(this.p2, 'light-punch');
      playAudioCue(this, AUDIO_KEYS.uiConfirm, this.app.settingsStore.getState());
      this.flashTile(cpuIndex, () => this.time.delayedCall(350, () => this.startMatch()));
    });
  }

  private startMatch(): void {
    if (this.transitioning && this.mode === '1v1') {
      return;
    }

    this.transitioning = true;

    this.scene.start(SCENE_KEYS.Match, {
      mode: this.mode,
      stageId: this.stageId,
      p1CharacterId: SELECTABLE_ROSTER[this.p1.index].id,
      p2CharacterId: SELECTABLE_ROSTER[this.p2.index].id
    });
  }

  private goBack(): void {
    if (this.transitioning) {
      return;
    }

    this.scene.start(SCENE_KEYS.LevelSelect, { mode: this.mode });
  }
}

/**
 * Escala a imagem para cobrir um quadrado e recorta o excesso, mantendo o topo
 * (onde fica a cara) quando o retrato é mais alto que largo.
 */
function coverCrop(image: Phaser.GameObjects.Image, size: number, x: number, y: number): void {
  const scale = size / Math.min(image.width, image.height);
  const cropWidth = size / scale;
  const cropHeight = size / scale;
  const cropX = (image.width - cropWidth) / 2;
  const cropY = image.height > image.width ? 0 : (image.height - cropHeight) / 2;

  image.setScale(scale);
  image.setCrop(cropX, cropY, cropWidth, cropHeight);
  // Com crop, o centro visível sai do centro da textura; reposiciona.
  image.setPosition(x - (cropX + cropWidth / 2 - image.width / 2) * scale, y - (cropY + cropHeight / 2 - image.height / 2) * scale);
}

/**
 * Converte uma cor 0xRRGGBB em string CSS.
 * @param color - A cor como 0xRRGGBB.
 */
function colorToCss(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}
