import * as Phaser from 'phaser';

import { carregarAjustes, salvarAjustes } from '../game/ajustesDev';
import { clampFighterCombat, DEFAULT_FIGHTER_COMBAT, FIGHTER_BOUNDS_FIELDS, getFighterCombat } from '../game/fighterConfig';
import { LUTADOR_COMBAT_OVERRIDES } from '../game/lutadores';
import { IDS_SELECIONAVEIS } from '../game/elenco';
import {
  CHARACTER_DEFINITIONS,
  resolveHeroBoundsFrame,
  type CharacterDefinition,
  type HeroAnimationDefinition
} from '../game/hero';
import { SCENE_KEYS, type FighterBoundsVisibility, type FighterCombat, type Rect } from '../game/types';
import { PainelAcademia } from './academiaPainel';
import { BaseScene } from './BaseScene';

/**
 * Academia (Regra da Academia): nenhum golpe entra na luta sem antes ser visto
 * aqui, quadro a quadro, com as boxes desenhadas por cima do sprite.
 *
 * Versão magra, de propósito: escolhe lutador e ação, toca ou avança quadro a
 * quadro, e desenha visual / collision / hit / attack / guard nas cores do
 * motor. O painel ao lado mostra o catálogo de golpes de cada mascote e
 * remapeia os botões da luta. O JSON do lutador é editado na mão.
 */

const SPRITE_SCALE = 2;
const FLOOR_Y = 640;
const LEFT_COLUMN_X = 24;
/** A lista de ações começa aqui e para antes do chão; o que não cabe rola com W/S. */
const LISTA_Y = 250;
const LINHA_DA_LISTA = 20;
const LINHAS_DA_LISTA = Math.floor((FLOOR_Y - 8 - LISTA_Y) / LINHA_DA_LISTA);

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
  private painel!: PainelAcademia;

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
      // Entre a lista de ações e o painel da direita, com folga dos dois lados.
      .sprite(this.tela.centerX - 80, FLOOR_Y, character.animations[0].sheet.key, 0)
      .setOrigin(character.anchor.x, character.anchor.y)
      .setScale(SPRITE_SCALE);

    this.boxes = this.add.graphics().setDepth(10);

    this.infoText = this.add.text(LEFT_COLUMN_X, 120, '', {
      color: '#f8fafc',
      fontFamily: 'monospace',
      fontSize: '16px',
      lineSpacing: 6
    });

    this.actionListText = this.add.text(LEFT_COLUMN_X, LISTA_Y, '', {
      color: '#94a3b8',
      fontFamily: 'monospace',
      fontSize: '14px',
      lineSpacing: 4
    });

    // Legenda das boxes numa fileira embaixo do chão, na cor que o motor usa.
    // No canto direito ela ficava escondida atrás do painel.
    this.legendTexts = FIGHTER_BOUNDS_FIELDS.map((field) =>
      this.add.text(LEFT_COLUMN_X, FLOOR_Y + 12, '', {
        color: field.color,
        fontFamily: 'monospace',
        fontSize: '14px'
      })
    );

    this.painel = new PainelAcademia({
      onEscolher: (characterId, acao) => this.showMove(characterId, acao),
      lerCombate: (characterId) => getFighterCombat(this.app.debugStore.getState().fighterPlayground, characterId),
      ajustarCombate: (characterId, campo, valor) => {
        const ajustes = carregarAjustes();
        ajustes[characterId] = { ...ajustes[characterId], [campo]: valor };
        salvarAjustes(ajustes);
        this.applyCombat(characterId, { ...LUTADOR_COMBAT_OVERRIDES[characterId], ...ajustes[characterId] });
      },
      restaurarCombate: (characterId) => {
        const ajustes = carregarAjustes();
        delete ajustes[characterId];
        salvarAjustes(ajustes);
        this.applyCombat(characterId, LUTADOR_COMBAT_OVERRIDES[characterId] ?? {});
      },
      abrirTreino: () => this.abrirTreino(),
      abrirTutorial: () => this.abrirTutorial()
    });
    this.painel.mostrarLutador(character.id);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.painel.destroy());

    this.registerKeys();
    this.playAction();

    this.createFooterHint(
      'A/D lutador • W/S ação • Espaço toca/pausa • , . quadro • R quadro 1 • 1-5 boxes • T treino • U tutorial • Tab painel • Esc menu'
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

    keyboard.on('keydown-TAB', (event: KeyboardEvent) => {
      event.preventDefault();
      this.painel.alternar();
    });

    keyboard.on('keydown-T', () => this.abrirTreino());
    keyboard.on('keydown-U', () => this.abrirTutorial());
    // No celular o A (Enter) também abre: a Academia não tem outro uso para ele.
    keyboard.on('keydown-ENTER', () => this.abrirTreino());

    keyboard.on('keydown-ESC', () => this.goToMenu());
    keyboard.on('keydown-BACKSPACE', () => this.goToMenu());
  }

  /** O tutorial de novo (João, 03/11/2026): começa pela escolha do mascote, e a CPU vem com o rival. */
  private abrirTutorial(): void {
    if (this.painel.capturando) return;
    this.scene.start(SCENE_KEYS.CharacterSelect, { mode: '1vcpu', stageId: 'estadio', tutorial: true });
  }

  /**
   * Treino livre: a própria Luta, sem relógio nem fim. O P1 é o lutador que
   * a Academia está mostrando (se ele entra na seleção); o P2, o seguinte.
   */
  private abrirTreino(): void {
    if (this.painel.capturando) return;
    const atual = this.character().id;
    const p1 = IDS_SELECIONAVEIS.includes(atual) ? atual : IDS_SELECIONAVEIS[0];
    const p2 = IDS_SELECIONAVEIS[(IDS_SELECIONAVEIS.indexOf(p1) + 1) % IDS_SELECIONAVEIS.length];
    this.scene.start(SCENE_KEYS.Match, { mode: '1vcpu', stageId: 'estadio', p1CharacterId: p1, p2CharacterId: p2, treino: true, treinoCpu: false });
  }

  /** Põe os números na store que a Luta lê (o JSON por baixo, o ajuste por cima). */
  private applyCombat(characterId: string, overrides: Partial<FighterCombat>): void {
    const playground = this.app.debugStore.getState().fighterPlayground;
    this.app.debugStore.patchState({
      fighterPlayground: {
        ...playground,
        combat: { ...playground.combat, [characterId]: clampFighterCombat({ ...DEFAULT_FIGHTER_COMBAT, ...overrides }) }
      }
    });
  }

  /** Clique na tabela de golpes: pula para o lutador e a sheet do golpe. */
  private showMove(characterId: string, action: string): void {
    const characterIndex = CHARACTER_DEFINITIONS.findIndex((candidate) => candidate.id === characterId);
    if (characterIndex < 0) {
      return;
    }
    this.characterIndex = characterIndex;
    this.actionIndex = Math.max(0, this.character().animations.findIndex((candidate) => candidate.action === action));
    this.sprite.setOrigin(this.character().anchor.x, this.character().anchor.y);
    this.painel.mostrarLutador(characterId);
    this.playAction();
  }

  private changeCharacter(direction: number): void {
    this.characterIndex = Phaser.Math.Wrap(this.characterIndex + direction, 0, CHARACTER_DEFINITIONS.length);
    this.actionIndex = 0;
    this.sprite.setOrigin(this.character().anchor.x, this.character().anchor.y);
    this.painel.mostrarLutador(this.character().id);
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
   * Converte um retângulo no espaço do quadro (256x256, ou a célula maior da
   * ação, virado para a esquerda) para a tela.
   */
  private frameRectToScreen(rect: Rect): Rect {
    const { anchor } = this.character();
    const { frameWidth, frameHeight } = this.animation().sheet;
    const left = this.sprite.x - anchor.x * frameWidth * SPRITE_SCALE;
    const top = this.sprite.y - anchor.y * frameHeight * SPRITE_SCALE;

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

    // Moldura do quadro inteiro, para o olho saber onde a célula termina.
    const { frameWidth, frameHeight } = animation.sheet;
    const frameRect = this.frameRectToScreen({ x: 0, y: 0, width: frameWidth, height: frameHeight });
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

    // Só as linhas que cabem acima do chão, com a ação escolhida no meio.
    const inicio = Phaser.Math.Clamp(
      this.actionIndex - Math.floor(LINHAS_DA_LISTA / 2),
      0,
      Math.max(0, character.animations.length - LINHAS_DA_LISTA)
    );
    this.actionListText.setText(
      character.animations
        .slice(inicio, inicio + LINHAS_DA_LISTA)
        .map((candidate, index) => `${inicio + index === this.actionIndex ? '>' : ' '} ${candidate.action}`)
    );

    // Um item depois do outro, pela largura de cada um.
    let x = LEFT_COLUMN_X;
    FIGHTER_BOUNDS_FIELDS.forEach((field, index) => {
      const legenda = this.legendTexts[index].setText(`${index + 1} ${this.showBounds[field.id] ? '■' : '□'} ${field.label}`);
      legenda.setX(x);
      x += legenda.width + 28;
    });
  }

  private drawFloor(): void {
    const floor = this.add.graphics();
    floor.lineStyle(2, 0x334155, 1);
    floor.lineBetween(0, FLOOR_Y, this.tela.width, FLOOR_Y);
  }
}
