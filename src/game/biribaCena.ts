import * as Phaser from 'phaser';
import { amostraEntradaBiriba, ENTRADA_BIRA, type BiribaAction } from './biribaEntrada';
import type { Fighter } from './fighter';
import { telaDe } from './nitidez';

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

/** NPC temporário da entrada. No combate, o mesmo Biriba só vem no chamado dos balões. */
export class BiribaCena {
  private readonly sprite: Phaser.GameObjects.Sprite;
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private renderedAction?: BiribaAction;
  private relogio: number | null = null;
  private lateral = 0;
  private contato = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly bira: Fighter,
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
    // Na intro, as patas e os pés compartilham o piso desenhado da arena.
    const apoio = bira.ancoraDoAcompanhante;
    this.shadow = scene.add.ellipse(bira.x, apoio.piso - 2, 48, 8, 0x000000, 0.2).setDepth(apoio.profundidade - 1);
    this.sprite = scene.add.sprite(bira.x, apoio.piso, 'biriba-idle')
      .setOrigin(0.5, 232 / 256)
      .setScale(apoio.escala * .3)
      .setDepth(apoio.profundidade);
    this.reset();
  }

  reset(): void {
    this.relogio = null;
    this.renderedAction = undefined;
    this.sprite.setVisible(false);
    this.shadow.setVisible(false);
  }

  iniciarEntrada(): number {
    const cam = this.scene.cameras.main;
    const apoio = this.bira.ancoraDoAcompanhante;
    const lado = this.bira.facingDirection;
    this.lateral = lado === 1 ? cam.scrollX - 100 : cam.scrollX + telaDe(this.scene).width + 100;
    this.contato = apoio.x - lado * 62 * apoio.escala;
    this.sprite.setY(apoio.piso).setScale(apoio.escala * .3).setDepth(apoio.profundidade);
    this.shadow.setY(apoio.piso - 2).setDepth(apoio.profundidade - 1);
    this.relogio = 0;
    this.renderedAction = undefined;
    this.render();
    return ENTRADA_BIRA.saiu;
  }

  update(seconds: number): void {
    if (this.relogio === null) return;
    this.relogio += Math.max(0, seconds) * 1000;
    this.render();
    if (this.relogio >= ENTRADA_BIRA.saiu) this.relogio = null;
  }

  destroy(): void {
    this.sprite.destroy();
    this.shadow.destroy();
  }

  private render(): void {
    const pose = amostraEntradaBiriba(this.relogio ?? ENTRADA_BIRA.saiu, this.lateral, this.contato);
    this.sprite.setVisible(pose.visivel);
    this.shadow.setVisible(pose.visivel);
    this.sprite.setX(Math.round(pose.x)).setFlipX(pose.lado === 1);
    if (this.renderedAction !== pose.acao) {
      this.sprite.play(`biriba-${pose.acao}`);
      this.renderedAction = pose.acao;
    }
    this.shadow.setX(this.sprite.x);
  }
}
