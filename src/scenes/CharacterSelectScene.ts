import * as Phaser from 'phaser';

import { AUDIO_KEYS, playAudioCue } from '../game/core/audio';
import { FIGHTER_CHARACTER_DEFINITIONS } from '../game/hero';
import { createSelectionCard, type SelectionCard } from '../game/ui';
import { SCENE_KEYS, type MatchMode } from '../game/types';
import { BaseScene } from './BaseScene';

interface CharacterSelectData {
  mode: MatchMode;
  stageId: string;
}

const P1_COLOR = 0x38bdf8;
const P2_COLOR = 0xf43f5e;
const CARD_WIDTH = 300;
const CARD_HEIGHT = 384;

// Temporary: only these fighters are selectable in the Play flow. The full
// roster (incl. the green boxer) remains available in the Fighter Playground.
const SELECTABLE_FIGHTER_IDS = ['red-brawler', 'jiujitsu-fighter'];
const SELECTABLE_ROSTER = FIGHTER_CHARACTER_DEFINITIONS.filter((character) =>
  SELECTABLE_FIGHTER_IDS.includes(character.id)
);

interface PlayerCursor {
  index: number;
  locked: boolean;
  outline: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
}

/**
 * Final step of the Play flow: pick fighters. In 1v1 both players drive their
 * own cursor (P1 = WASD, P2 = arrows) and cannot land on the other's pick. In
 * 1vCPU the player picks freely and the CPU then auto-selects a different
 * fighter. Each confirmation plays a lock-in flash before the match starts.
 */
export class CharacterSelectScene extends BaseScene {
  private mode: MatchMode = '1v1';
  private stageId = '';
  private cards: SelectionCard[] = [];
  private cardPositions: Array<{ x: number; y: number }> = [];
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
    this.cards = [];
    this.cardPositions = [];
    this.transitioning = false;

    this.markActiveScene(SCENE_KEYS.CharacterSelect);
    this.cameras.main.setBackgroundColor(0x020617);
    this.createHeading(
      'Select Fighter',
      this.mode === '1v1' ? 'P1 = WASD + Space   •   P2 = Arrows + Enter' : 'WASD / Arrows to choose • Enter to confirm'
    );

    this.buildCards();
    this.buildCursors();
    this.registerInput();

    this.createFooterHint('Esc to go back');

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.cards.forEach((card) => card.destroy());
      this.cards = [];
    });
  }

  private buildCards(): void {
    const { centerX, centerY } = this.cameras.main;
    const roster = SELECTABLE_ROSTER;
    const gap = 48;
    const totalWidth = CARD_WIDTH * roster.length + gap * (roster.length - 1);
    const startX = centerX - totalWidth / 2 + CARD_WIDTH / 2;
    const y = centerY + 24;

    roster.forEach((character, index) => {
      const x = startX + index * (CARD_WIDTH + gap);
      this.cardPositions.push({ x, y });

      const card = createSelectionCard(this, {
        x,
        y,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        title: character.label,
        texture: this.textures.exists(character.portrait.key) ? character.portrait.key : undefined,
        imageMaxSize: CARD_WIDTH - 36,
        imageOffsetY: -34,
        onHover: () => this.hoverCard(index),
        onClick: () => this.clickCard(index)
      });

      this.cards.push(card);
    });
  }

  private buildCursors(): void {
    this.p1 = this.createCursor('P1', P1_COLOR, 0);
    const p2Start = this.mode === '1v1' ? Math.min(1, this.cards.length - 1) : 0;
    this.p2 = this.createCursor('P2', P2_COLOR, p2Start);

    if (this.mode === '1vcpu') {
      this.p2.outline.setVisible(false);
      this.p2.label.setVisible(false);
    }

    this.refreshCursor(this.p1);
    this.refreshCursor(this.p2);
  }

  private createCursor(label: string, color: number, index: number): PlayerCursor {
    const outline = this.add
      .rectangle(0, 0, CARD_WIDTH + 16, CARD_HEIGHT + 16, color, 0)
      .setStrokeStyle(4, color, 1)
      .setDepth(20);

    const text = this.add
      .text(0, 0, label, {
        color: '#020617',
        backgroundColor: colorToCss(color),
        fontFamily: 'monospace',
        fontSize: '16px',
        padding: { x: 8, y: 3 }
      })
      .setOrigin(0.5)
      .setDepth(21);

    return { index, locked: false, outline, label: text };
  }

  private refreshCursor(cursor: PlayerCursor): void {
    const position = this.cardPositions[cursor.index];
    if (!position) {
      return;
    }

    cursor.outline.setPosition(position.x, position.y);
    cursor.outline.setStrokeStyle(cursor.locked ? 7 : 4, cursor.outline.strokeColor, 1);
    cursor.label.setPosition(position.x, position.y - CARD_HEIGHT / 2 - 18);
  }

  private registerInput(): void {
    const keyboard = this.input.keyboard;
    if (!keyboard) {
      return;
    }

    if (this.mode === '1v1') {
      keyboard.on('keydown-A', () => this.movePlayer(this.p1, -1));
      keyboard.on('keydown-D', () => this.movePlayer(this.p1, 1));
      keyboard.on('keydown-LEFT', () => this.movePlayer(this.p2, -1));
      keyboard.on('keydown-RIGHT', () => this.movePlayer(this.p2, 1));
      keyboard.on('keydown-SPACE', () => this.confirmPlayer(this.p1));
      keyboard.on('keydown-F', () => this.confirmPlayer(this.p1));
      keyboard.on('keydown-ENTER', () => this.confirmPlayer(this.p2));
    } else {
      const moveLeft = (): void => this.movePlayer(this.p1, -1);
      const moveRight = (): void => this.movePlayer(this.p1, 1);
      keyboard.on('keydown-A', moveLeft);
      keyboard.on('keydown-LEFT', moveLeft);
      keyboard.on('keydown-D', moveRight);
      keyboard.on('keydown-RIGHT', moveRight);
      keyboard.on('keydown-SPACE', () => this.confirmPlayer(this.p1));
      keyboard.on('keydown-F', () => this.confirmPlayer(this.p1));
      keyboard.on('keydown-ENTER', () => this.confirmPlayer(this.p1));
    }

    keyboard.on('keydown-ESC', () => this.goBack());
    keyboard.on('keydown-BACKSPACE', () => this.goBack());
  }

  /**
   * Moves a player's cursor by one step. The two players can never select the
   * same fighter: when a move would land on the other player's card the cursor
   * hops over it if a free card exists, otherwise (e.g. only two fighters) the
   * two players simply swap picks.
   * @param cursor - The player cursor to move.
   * @param direction - -1 for left, +1 for right.
   */
  private movePlayer(cursor: PlayerCursor, direction: number): void {
    if (this.transitioning || cursor.locked) {
      return;
    }

    const count = this.cards.length;
    const other = this.otherCursor(cursor);
    let next = Phaser.Math.Wrap(cursor.index + direction, 0, count);

    if (this.mode === '1v1' && next === other.index) {
      const skip = Phaser.Math.Wrap(next + direction, 0, count);

      if (skip !== cursor.index) {
        next = skip;
      } else if (!other.locked) {
        other.index = cursor.index;
        cursor.index = next;
        this.refreshCursor(cursor);
        this.refreshCursor(other);
        return;
      } else {
        return;
      }
    }

    cursor.index = next;
    this.refreshCursor(cursor);
  }

  private otherCursor(cursor: PlayerCursor): PlayerCursor {
    return cursor === this.p1 ? this.p2 : this.p1;
  }

  private hoverCard(index: number): void {
    if (this.transitioning || this.mode !== '1vcpu' || this.p1.locked) {
      return;
    }

    this.p1.index = index;
    this.refreshCursor(this.p1);
  }

  private clickCard(index: number): void {
    if (this.transitioning) {
      return;
    }

    if (this.mode === '1vcpu') {
      this.p1.index = index;
      this.refreshCursor(this.p1);
      this.confirmPlayer(this.p1);
    }
  }

  /**
   * Locks a player's current pick with a flash. In 1v1 the match starts once
   * both players have locked; in 1vCPU locking the player triggers the CPU pick.
   * @param cursor - The player cursor confirming its selection.
   */
  private confirmPlayer(cursor: PlayerCursor): void {
    if (this.transitioning || cursor.locked) {
      return;
    }

    cursor.locked = true;
    this.refreshCursor(cursor);
    playAudioCue(this, AUDIO_KEYS.uiConfirm, this.app.settingsStore.getState());

    this.cards[cursor.index].flashLock(() => {
      if (this.mode === '1vcpu') {
        this.runCpuSelection();
        return;
      }

      if (this.p1.locked && this.p2.locked) {
        this.startMatch();
      }
    });
  }

  private runCpuSelection(): void {
    if (this.transitioning) {
      return;
    }

    this.transitioning = true;

    const choices = this.cards.map((_, index) => index).filter((index) => index !== this.p1.index);
    const cpuIndex = choices.length > 0 ? Phaser.Math.RND.pick(choices) : this.p1.index;

    this.p2.index = cpuIndex;
    this.p2.outline.setVisible(true);
    this.p2.label.setVisible(true);
    this.p2.label.setText('CPU');
    this.refreshCursor(this.p2);

    this.time.delayedCall(450, () => {
      this.p2.locked = true;
      this.refreshCursor(this.p2);
      playAudioCue(this, AUDIO_KEYS.uiConfirm, this.app.settingsStore.getState());
      this.cards[cpuIndex].flashLock(() => this.startMatch());
    });
  }

  private startMatch(): void {
    if (this.transitioning && this.mode === '1v1') {
      return;
    }

    this.transitioning = true;
    const roster = SELECTABLE_ROSTER;

    this.scene.start(SCENE_KEYS.Match, {
      mode: this.mode,
      stageId: this.stageId,
      p1CharacterId: roster[this.p1.index].id,
      p2CharacterId: roster[this.p2.index].id
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
 * Convert a 24-bit colour integer to a CSS hex string.
 * @param color - The colour as 0xRRGGBB.
 */
function colorToCss(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}
