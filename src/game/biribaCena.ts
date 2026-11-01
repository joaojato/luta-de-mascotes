import * as Phaser from 'phaser';
import { BiribaMotion, type BiribaAction } from './biribaMotion';
import type { Fighter } from './fighter';
import { telaDe } from './nitidez';
import { PLANO_DE_FUNDO } from './planoDeFundo';

const PASTA = '/assets/cenarios/biriba';
const ACOES: Record<BiribaAction, { frames: number; fps: number }> = {
  idle: { frames: 4, fps: 6 },
  walk: { frames: 4, fps: 8 },
  bark: { frames: 6, fps: 10 }
};

export function carregarBiriba(scene: Phaser.Scene): void {
  for (const action of Object.keys(ACOES) as BiribaAction[]) {
    scene.load.spritesheet(`biriba-${action}`, `${PASTA}/${action}.png`, {
      frameWidth: 256,
      frameHeight: 256,
      endFrame: ACOES[action].frames - 1
    });
  }
}

/** Visual-only spectator: no physics body, hitboxes, audio, or combat callbacks. */
export class BiribaCena {
  private readonly motion = new BiribaMotion();
  private readonly sprite: Phaser.GameObjects.Sprite;
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private renderedAction?: BiribaAction;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly bira: Fighter,
    groundY: number,
    private readonly offsetX: number,
    /** Toca o latido (som da Luta, que tem os ajustes de volume). */
    private readonly latir: () => void = () => {}
  ) {
    for (const action of Object.keys(ACOES) as BiribaAction[]) {
      const key = `biriba-${action}`;
      scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
      if (!scene.anims.exists(key)) {
        scene.anims.create({
          key,
          frames: scene.anims.generateFrameNumbers(key, { start: 0, end: ACOES[action].frames - 1 }),
          frameRate: ACOES[action].fps,
          repeat: action === 'bark' ? 0 : -1
        });
      }
    }
    // Fighters have transparent space below their drawn feet; place the dog
    // behind the visible contact line, rather than behind the logical origin.
    const y = groundY - PLANO_DE_FUNDO.recuo;
    this.shadow = scene.add.ellipse(bira.x, y - 2, 76, 12, 0x000000, 0.2).setDepth(PLANO_DE_FUNDO.profundidade - 1);
    this.sprite = scene.add.sprite(bira.x, y, 'biriba-idle')
      .setOrigin(0.5, 232 / 256)
      .setScale(0.5)
      .setDepth(PLANO_DE_FUNDO.profundidade);
    this.reset();
  }

  reset(): void {
    const cam = this.scene.cameras.main;
    const m = PLANO_DE_FUNDO.margem;
    const largura = telaDe(this.scene).width;
    this.motion.reset(this.bira.x + this.offsetX, cam.scrollX + m, cam.scrollX + largura - m);
    this.motion.facing = this.bira.facingDirection;
    this.renderedAction = undefined;
    this.render();
  }

  update(seconds: number): void {
    const cam = this.scene.cameras.main;
    const m = PLANO_DE_FUNDO.margem;
    const largura = telaDe(this.scene).width;
    this.motion.update(seconds, this.bira.x + this.offsetX, cam.scrollX + m, cam.scrollX + largura - m);
    this.render();
  }

  destroy(): void {
    this.sprite.destroy();
    this.shadow.destroy();
  }

  private render(): void {
    // He is the one flying on the balloons (the kick): off the sideline meanwhile.
    const voando = this.bira.carrierAloft;
    this.sprite.setVisible(!voando);
    this.shadow.setVisible(!voando);
    this.sprite.setX(Math.round(this.motion.x)).setFlipX(this.motion.facing === 1);
    if (this.renderedAction !== this.motion.action) {
      if (this.motion.action === 'bark' && !voando) this.latir();
      this.sprite.play(`biriba-${this.motion.action}`);
      this.renderedAction = this.motion.action;
    }
    this.shadow.setX(this.sprite.x);
  }
}
