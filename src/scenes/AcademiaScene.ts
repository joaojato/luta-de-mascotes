import * as Phaser from 'phaser';

import { FIGHTER_BOUNDS_FIELDS } from '../game/fighterConfig';
import {
  CHARACTER_DEFINITIONS,
  resolveHeroBoundsFrame,
  type CharacterDefinition,
  type HeroAnimationDefinition
} from '../game/hero';
import { SCENE_KEYS, type FighterBoundsVisibility, type Rect } from '../game/types';
import { BaseScene } from './BaseScene';

/**
 * Academia (Regra da Academia): nenhum golpe entra na luta sem antes ser visto
 * aqui, quadro a quadro, com as boxes desenhadas por cima do sprite.
 *
 * Versão magra, de propósito: escolhe lutador e ação, toca ou avança quadro a
 * quadro, e desenha visual / collision / hit / attack / guard nas cores do
 * motor. Não edita nada. O JSON do lutador é editado na mão e o Vite recarrega.
 */

const FRAME_SIZE = 256;
const SPRITE_SCALE = 2;
const FLOOR_Y = 640;
const LEFT_COLUMN_X = 24;

const BOUNDS_COLORS: Record<keyof FighterBoundsVisibility, number> = Object.fromEntries(
  FIGHTER_BOUNDS_FIELDS.map((field) => [field.id, Number.parseInt(field.color.slice(1), 16)])
) as Record<keyof FighterBoundsVisibility, number>;

export class AcademiaScene extends BaseScene {
  private characterIndex = 0;
  private actionIndex = 0;
  private frame = 0;
  private playing = true;
  private showBounds: FighterBoundsVisibility = { visual: false, collision: true, hit: true, attack: true, guard: true };

  private sprite!: Phaser.GameObjects.Sprite;
  private boxes!: Phaser.GameObjects.Graphics;
  private infoText!: Phaser.GameObjects.Text;
  private actionListText!: Phaser.GameObjects.Text;
  private legendTexts: Phaser.GameObjects.Text[] = [];

  constructor() {
    super(SCENE_KEYS.Academia);
  }

  create(): void {
    this.markActiveScene(SCENE_KEYS.Academia);
    this.cameras.main.setBackgroundColor(0x0b1020);
    this.createHeading('Academia', 'quadro a quadro, com as boxes por cima');

    this.drawFloor();

    const character = this.character();
    this.sprite = this.add
      .sprite(this.cameras.main.centerX + 120, FLOOR_Y, character.animations[0].sheet.key, 0)
      .setOrigin(character.anchor.x, character.anchor.y)
      .setScale(SPRITE_SCALE);

    this.boxes = this.add.graphics().setDepth(10);

    this.infoText = this.add.text(LEFT_COLUMN_X, 120, '', {
      color: '#f8fafc',
      fontFamily: 'monospace',
      fontSize: '16px',
      lineSpacing: 6
    });

    this.actionListText = this.add.text(LEFT_COLUMN_X, 250, '', {
      color: '#94a3b8',
      fontFamily: 'monospace',
      fontSize: '14px',
      lineSpacing: 4
    });

    // Uma linha de legenda por tipo de box, na cor que o motor usa.
    this.legendTexts = FIGHTER_BOUNDS_FIELDS.map((field, index) =>
      this.add
        .text(this.cameras.main.width - 24, 120 + index * 22, '', {
          color: field.color,
          fontFamily: 'monospace',
          fontSize: '14px'
        })
        .setOrigin(1, 0)
    );

    this.registerKeys();
    this.playAction();

    this.createFooterHint(
      'A/D lutador • W/S ação • Espaço toca/pausa • , . quadro • R quadro 1 • 1-5 boxes • Esc menu'
    );
  }

  update(): void {
    if (this.playing) {
      const current = this.sprite.anims.currentFrame;
      if (current) {
        this.frame = current.index - 1;
      }
    }

    this.drawBoxes();
    this.renderTexts();
  }

  private character(): CharacterDefinition {
    return CHARACTER_DEFINITIONS[this.characterIndex];
  }

  private animation(): HeroAnimationDefinition {
    return this.character().animations[this.actionIndex];
  }

  private registerKeys(): void {
    const keyboard = this.input.keyboard;
    if (!keyboard) {
      throw new Error('AcademiaScene requires keyboard input');
    }

    keyboard.on('keydown-A', () => this.changeCharacter(-1));
    keyboard.on('keydown-LEFT', () => this.changeCharacter(-1));
    keyboard.on('keydown-D', () => this.changeCharacter(1));
    keyboard.on('keydown-RIGHT', () => this.changeCharacter(1));

    keyboard.on('keydown-W', () => this.changeAction(-1));
    keyboard.on('keydown-UP', () => this.changeAction(-1));
    keyboard.on('keydown-S', () => this.changeAction(1));
    keyboard.on('keydown-DOWN', () => this.changeAction(1));

    keyboard.on('keydown-SPACE', () => this.togglePlay());
    keyboard.on('keydown-COMMA', () => this.stepFrame(-1));
    keyboard.on('keydown-PERIOD', () => this.stepFrame(1));
    keyboard.on('keydown-R', () => this.stepFrame(-this.frame));

    FIGHTER_BOUNDS_FIELDS.forEach((field, index) => {
      keyboard.on(`keydown-${['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'][index]}`, () => {
        this.showBounds = { ...this.showBounds, [field.id]: !this.showBounds[field.id] };
      });
    });

    keyboard.on('keydown-ESC', () => this.goToMenu());
    keyboard.on('keydown-BACKSPACE', () => this.goToMenu());
  }

  private changeCharacter(direction: number): void {
    this.characterIndex = Phaser.Math.Wrap(this.characterIndex + direction, 0, CHARACTER_DEFINITIONS.length);
    this.actionIndex = 0;
    this.sprite.setOrigin(this.character().anchor.x, this.character().anchor.y);
    this.playAction();
  }

  private changeAction(direction: number): void {
    this.actionIndex = Phaser.Math.Wrap(this.actionIndex + direction, 0, this.character().animations.length);
    this.playAction();
  }

  private playAction(): void {
    this.frame = 0;
    if (this.playing) {
      this.sprite.play({ key: this.animation().key, repeat: -1 }, true);
    } else {
      this.showFrame();
    }
  }

  private togglePlay(): void {
    this.playing = !this.playing;
    if (this.playing) {
      this.sprite.play({ key: this.animation().key, repeat: -1 }, true);
    } else {
      this.sprite.anims.stop();
      this.showFrame();
    }
  }

  private stepFrame(direction: number): void {
    if (this.playing) {
      this.playing = false;
      this.sprite.anims.stop();
    }

    this.frame = Phaser.Math.Wrap(this.frame + direction, 0, this.animation().bounds.length);
    this.showFrame();
  }

  private showFrame(): void {
    this.sprite.setTexture(this.animation().sheet.key, this.frame);
  }

  /**
   * Converte um retângulo no espaço do quadro (256x256, virado para a
   * esquerda, como o Spriterrific entrega) para a tela.
   */
  private frameRectToScreen(rect: Rect): Rect {
    const { anchor } = this.character();
    const left = this.sprite.x - anchor.x * FRAME_SIZE * SPRITE_SCALE;
    const top = this.sprite.y - anchor.y * FRAME_SIZE * SPRITE_SCALE;

    return {
      x: left + rect.x * SPRITE_SCALE,
      y: top + rect.y * SPRITE_SCALE,
      width: rect.width * SPRITE_SCALE,
      height: rect.height * SPRITE_SCALE
    };
  }

  private drawBoxes(): void {
    this.boxes.clear();

    const animation = this.animation();
    const boundsFrame = resolveHeroBoundsFrame(animation, this.frame, {});

    // Moldura do quadro inteiro, para o olho saber onde o 256x256 termina.
    const frameRect = this.frameRectToScreen({ x: 0, y: 0, width: FRAME_SIZE, height: FRAME_SIZE });
    this.boxes.lineStyle(1, 0x334155, 0.8);
    this.boxes.strokeRect(frameRect.x, frameRect.y, frameRect.width, frameRect.height);

    FIGHTER_BOUNDS_FIELDS.forEach((field) => {
      if (!this.showBounds[field.id]) {
        return;
      }

      const rect = boundsFrame[field.id];
      if (!rect) {
        return;
      }

      const screen = this.frameRectToScreen(rect);
      const color = BOUNDS_COLORS[field.id];
      this.boxes.fillStyle(color, 0.16);
      this.boxes.fillRect(screen.x, screen.y, screen.width, screen.height);
      this.boxes.lineStyle(2, color, 0.95);
      this.boxes.strokeRect(screen.x, screen.y, screen.width, screen.height);
    });
  }

  private renderTexts(): void {
    const character = this.character();
    const animation = this.animation();
    const boundsFrame = resolveHeroBoundsFrame(animation, this.frame, {});
    const activeAttack = boundsFrame.attack ? 'ATIVO' : 'inativo';
    const activeGuard = boundsFrame.guard ? 'guarda' : '';

    this.infoText.setText([
      `Lutador: ${character.label}  (${this.characterIndex + 1}/${CHARACTER_DEFINITIONS.length})`,
      `Ação:    ${animation.action}  ${animation.frameRate} fps  ${animation.repeat === -1 ? 'loop' : 'uma vez'}`,
      `Quadro:  ${this.frame + 1}/${animation.bounds.length}  ${this.playing ? '▶' : '❚❚'}  ataque ${activeAttack} ${activeGuard}`
    ]);

    this.actionListText.setText(
      character.animations.map((candidate, index) => `${index === this.actionIndex ? '>' : ' '} ${candidate.action}`)
    );

    FIGHTER_BOUNDS_FIELDS.forEach((field, index) => {
      this.legendTexts[index].setText(`${index + 1} ${this.showBounds[field.id] ? '■' : '□'} ${field.label}`);
    });
  }

  private drawFloor(): void {
    const floor = this.add.graphics();
    floor.lineStyle(2, 0x334155, 1);
    floor.lineBetween(0, FLOOR_Y, this.cameras.main.width, FLOOR_Y);
  }
}
