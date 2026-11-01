import * as Phaser from 'phaser';

import { playAudioCue } from '../game/core/audio';
import { ELENCO_SELECIONAVEL, IDS_SELECIONAVEIS } from '../game/elenco';
import { findCharacterAnimationKeyByAction, type CharacterDefinition } from '../game/hero';
import { COR_DESTAQUE, COR_P1, COR_P2, FONTE_TEXTO, FONTE_TITULO, TEXTO_DESTAQUE } from '../game/estilo';
import { sortearIndice } from '../game/sorteio';
import { criarTorneio } from '../game/torneio';
import { salvarTorneio } from '../game/torneioSalvo';
import { coverCrop } from '../game/ui';
import { SCENE_KEYS, type FormatoTorneio, type MatchMode } from '../game/types';
import { BaseScene } from './BaseScene';

interface CharacterSelectData {
  mode: MatchMode;
  stageId: string;
  /** Escolha do time de um torneio novo: só o jogador escolhe. */
  torneio?: { formato: FormatoTorneio; tamanho: 8 | 16 };
}

const P1_COLOR = COR_P1;
const P2_COLOR = COR_P2;
const GOLD = COR_DESTAQUE;
const TILE_SIZE = 116;
const TILE_GAP = 10;
const MAX_COLUMNS = 6;
const PREVIEW_BODY_HEIGHT = 250;

const SELECTABLE_ROSTER = ELENCO_SELECIONAVEL;
/** A última casa da grade é o "?": trava num lutador sorteado (João, 31/10/2026). */
const CASA_ALEATORIA = SELECTABLE_ROSTER.length;

interface Tile {
  x: number;
  y: number;
  frame: Phaser.GameObjects.Rectangle;
  portrait: Phaser.GameObjects.Image | Phaser.GameObjects.Text | null;
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
 * os dois não podem parar no mesmo lutador. Em 1vCPU o jogador trava o dele e,
 * com o mesmo direcional, escolhe o adversário da CPU (João, 30/10/2026).
 */
export class CharacterSelectScene extends BaseScene {
  private mode: MatchMode = '1v1';
  private stageId = '';
  private torneio: CharacterSelectData['torneio'] | null = null;
  private tiles: Tile[] = [];
  private columns = 1;
  private p1!: PlayerCursor;
  private p2!: PlayerCursor;
  private transitioning = false;
  /** Em 1vCPU, a etapa: o lutador do jogador ou o adversário da CPU. */
  private etapa!: Phaser.GameObjects.Text;

  constructor() {
    super(SCENE_KEYS.CharacterSelect);
  }

  init(data: CharacterSelectData): void {
    this.mode = data?.mode ?? '1v1';
    this.stageId = data?.stageId ?? '';
    this.torneio = data?.torneio ?? null;
  }

  create(): void {
    this.tiles = [];
    this.transitioning = false;

    this.markActiveScene(SCENE_KEYS.CharacterSelect);
    this.createBackdrop(this.stageId);
    this.createHeading(this.torneio ? 'Escolha seu time' : 'Escolha seu lutador', '');
    this.buildGrid();
    this.p1 = this.createCursor('P1', P1_COLOR, 0, -1);
    this.p2 = this.createCursor(this.mode === '1v1' ? 'P2' : 'CPU', P2_COLOR, this.mode === '1v1' ? Math.min(1, this.tiles.length - 1) : 0, 1);

    if (this.mode === '1vcpu') {
      this.setCursorVisible(this.p2, false);
    }

    this.refreshCursor(this.p1);
    this.refreshCursor(this.p2);
    this.registerInput();

    this.etapa = this.add
      .text(this.tela.centerX, 118, '', { color: colorToCss(P1_COLOR), fontFamily: FONTE_TITULO, fontSize: '26px', stroke: '#000000', strokeThickness: 5 })
      .setOrigin(0.5)
      .setDepth(12);
    this.mostrarEtapa();

    this.createFooterHint(
      this.mode === '1v1'
        ? 'P1: WASD + Espaço   •   P2: Setas + Enter   •   Esc volta'
        : 'WASD ou Setas para escolher   •   Enter confirma   •   Esc volta um passo'
    );
  }

  /** Grade centralizada de quadrados com o retrato recortado de cada lutador, e o "?" no fim. */
  private buildGrid(): void {
    const { width, height } = this.tela;
    const roster: (CharacterDefinition | null)[] = [...SELECTABLE_ROSTER, null];
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

  private createTile(character: CharacterDefinition | null, index: number, x: number, y: number): Tile {
    const frame = this.add
      .rectangle(x, y, TILE_SIZE, TILE_SIZE, 0x1e1b2e, 1)
      .setStrokeStyle(3, 0x4c4566, 1)
      .setDepth(5);

    let portrait: Phaser.GameObjects.Image | Phaser.GameObjects.Text | null = null;
    if (!character) {
      portrait = this.add
        .text(x, y, '?', { color: TEXTO_DESTAQUE, fontFamily: FONTE_TITULO, fontSize: '84px', stroke: '#000000', strokeThickness: 8 })
        .setShadow(0, 4, '#f00000', 0, true, true)
        .setOrigin(0.5)
        .setDepth(6);
    } else if (this.textures.exists(character.portrait.key)) {
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
    const { width, height } = this.tela;
    const previewX = side === -1 ? width * 0.13 : width * 0.87;
    const floorY = height * 0.5 + PREVIEW_BODY_HEIGHT / 2 + 30;

    this.add.ellipse(previewX, floorY, 170, 26, 0x000000, 0.5).setDepth(2);

    const preview = this.add.sprite(previewX, floorY, '__DEFAULT').setDepth(3);
    // Os sprites olham para a esquerda; o da esquerda vira para o centro.
    preview.setFlipX(side === -1);

    const name = this.add
      .text(previewX, floorY + 34, '', {
        color: colorToCss(color),
        fontFamily: FONTE_TITULO,
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
        fontFamily: FONTE_TEXTO,
        fontSize: '15px',
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

    if (cursor.outline.visible) {
      this.showPreview(cursor);
    }
  }

  /** Mostra o lutador do cursor parado em guarda, na escala da lateral. */
  private showPreview(cursor: PlayerCursor, action = 'idle'): void {
    const character = SELECTABLE_ROSTER[cursor.index];
    // No "?" ninguém aparece na lateral até o sorteio.
    cursor.preview.setVisible(Boolean(character));
    if (!character) {
      cursor.name.setText('?');
      return;
    }
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
      // P2: O K L Ç (o padrão da luta) ou as setas; Enter ou Shift direito confirmam.
      const p2 = (keys: string[], dx: number, dy: number): void =>
        keys.forEach((key) => keyboard.on(`keydown-${key}`, () => this.movePlayer(this.p2, dx, dy)));
      p2(['LEFT', 'K'], -1, 0);
      p2(['RIGHT', 'SEMICOLON'], 1, 0);
      p2(['UP', 'O'], 0, -1);
      p2(['DOWN', 'L'], 0, 1);
      keyboard.on('keydown-SHIFT', (event: KeyboardEvent) => {
        if (event.location === 2) this.confirmPlayer(this.p2);
      });
      keyboard.on('keydown-SPACE', () => this.confirmPlayer(this.p1));
      keyboard.on('keydown-F', () => this.confirmPlayer(this.p1));
      keyboard.on('keydown-ENTER', () => this.confirmPlayer(this.p2));
    } else {
      // Um direcional só: primeiro escolhe o próprio lutador, depois o da CPU.
      const bind = (keys: string[], dx: number, dy: number): void =>
        keys.forEach((key) => keyboard.on(`keydown-${key}`, () => this.movePlayer(this.cursorDaVez(), dx, dy)));
      bind(['A', 'LEFT'], -1, 0);
      bind(['D', 'RIGHT'], 1, 0);
      bind(['W', 'UP'], 0, -1);
      bind(['S', 'DOWN'], 0, 1);
      keyboard.on('keydown-SPACE', () => this.confirmPlayer(this.cursorDaVez()));
      keyboard.on('keydown-F', () => this.confirmPlayer(this.cursorDaVez()));
      keyboard.on('keydown-ENTER', () => this.confirmPlayer(this.cursorDaVez()));
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

    // Ninguém para no lutador do outro (em 1vCPU, a CPU não repete o do jogador); no "?" cabem os dois.
    const blocked = this.lutadorBloqueado(cursor);
    let next = this.step(cursor.index, dx, dy);
    if (next === blocked) {
      next = this.step(next, dx, dy);
    }
    if (next === cursor.index || next === blocked) {
      return;
    }

    cursor.index = next;
    this.refreshCursor(cursor);
    playAudioCue(this, 'ui-mover', this.app.settingsStore.getState());
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

  /** O lutador em que este cursor não pode parar nem cair no sorteio (-1 se nenhum). */
  private lutadorBloqueado(cursor: PlayerCursor): number {
    const outro = this.otherCursor(cursor).index;
    const proibido = this.mode === '1v1' || cursor === this.p2;
    return proibido && outro !== CASA_ALEATORIA ? outro : -1;
  }

  /** Em 1vCPU: o cursor do jogador até ele travar, depois o da CPU. */
  private cursorDaVez(): PlayerCursor {
    return this.mode === '1vcpu' && this.p1.locked ? this.p2 : this.p1;
  }

  private mostrarEtapa(): void {
    if (this.mode !== '1vcpu') {
      this.etapa.setVisible(false);
      return;
    }
    const cpu = this.p1.locked && !this.torneio;
    this.etapa.setText(this.torneio ? 'Os adversários saem no sorteio' : cpu ? 'Agora escolha o adversário (CPU)' : 'Escolha o seu lutador').setColor(colorToCss(cpu ? P2_COLOR : P1_COLOR));
  }

  private hoverTile(index: number): void {
    const cursor = this.cursorDaVez();
    if (this.transitioning || this.mode !== '1vcpu' || cursor.locked || cursor.index === index || index === this.lutadorBloqueado(cursor)) {
      return;
    }

    cursor.index = index;
    this.refreshCursor(cursor);
  }

  private clickTile(index: number): void {
    const cursor = this.cursorDaVez();
    if (this.transitioning || this.mode !== '1vcpu' || index === this.lutadorBloqueado(cursor)) {
      return;
    }

    cursor.index = index;
    this.refreshCursor(cursor);
    this.confirmPlayer(cursor);
  }

  /**
   * Trava a escolha: borda dourada, piscada no quadro e o lutador da lateral
   * solta um soco. Em 1v1 a luta começa quando os dois travam; em 1vCPU,
   * travar o jogador abre a escolha do adversário, e travar este começa a luta.
   */
  private confirmPlayer(cursor: PlayerCursor): void {
    if (this.transitioning || cursor.locked) {
      return;
    }

    if (cursor.index === CASA_ALEATORIA) {
      const bloqueado = this.lutadorBloqueado(cursor);
      cursor.index = sortearIndice(SELECTABLE_ROSTER.length, bloqueado >= 0 ? [bloqueado] : []);
    }
    cursor.locked = true;
    this.refreshCursor(cursor);
    this.showPreview(cursor, 'light-punch');
    playAudioCue(this, 'ui-travar', this.app.settingsStore.getState());

    if (this.mode === '1vcpu' && cursor === this.p1 && !this.torneio) {
      this.abrirEscolhaDaCpu();
    }

    this.flashTile(cursor.index, () => {
      if (this.torneio) {
        this.time.delayedCall(250, () => this.comecarTorneio());
        return;
      }
      if (this.mode === '1vcpu') {
        if (cursor === this.p2) this.time.delayedCall(250, () => this.startMatch());
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

  /** O cursor da CPU aparece no primeiro lutador livre e passa a andar com o direcional. */
  private abrirEscolhaDaCpu(): void {
    const livre = this.tiles.findIndex((_, index) => index !== this.p1.index);
    this.p2.index = livre >= 0 ? livre : this.p1.index;
    this.p2.locked = false;
    this.setCursorVisible(this.p2, true);
    this.refreshCursor(this.p2);
    this.mostrarEtapa();
  }

  private startMatch(): void {
    if (this.transitioning) {
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

  /** Sorteia os outros times com a dificuldade escolhida, salva e abre o chaveamento ou a tabela. */
  private comecarTorneio(): void {
    if (this.transitioning || !this.torneio) {
      return;
    }
    this.transitioning = true;
    const { formato, tamanho } = this.torneio;
    const jogador = SELECTABLE_ROSTER[this.p1.index].id;
    salvarTorneio(criarTorneio(formato, tamanho, jogador, IDS_SELECIONAVEIS, this.app.settingsStore.getState().cpuDificuldade));
    this.scene.start(SCENE_KEYS.TorneioQuadro);
  }

  private goBack(): void {
    if (this.transitioning) {
      return;
    }
    if (this.torneio) {
      this.scene.start(SCENE_KEYS.Dificuldade, { destino: 'torneio', ...this.torneio });
      return;
    }
    // Escolhendo o adversário: Esc destrava o próprio lutador em vez de sair.
    if (this.mode === '1vcpu' && this.p1.locked && !this.p2.locked) {
      this.p1.locked = false;
      this.setCursorVisible(this.p2, false);
      this.refreshCursor(this.p1);
      this.refreshCursor(this.p2);
      this.mostrarEtapa();
      return;
    }

    this.scene.start(SCENE_KEYS.LevelSelect, { mode: this.mode });
  }
}

/**
 * Converte uma cor 0xRRGGBB em string CSS.
 * @param color - A cor como 0xRRGGBB.
 */
function colorToCss(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}
