import * as Phaser from 'phaser';

import { LOGO_IMAGE_ASSET } from '../game/assets';
import { getAppContext } from '../game/context';
import type { AppContext } from '../game/context';
import {
  CONTORNO_TITULO,
  SOMBRA_TITULO,
  COR_FUNDO,
  FONTE_TEXTO,
  FONTE_TITULO,
  TEXTO_APAGADO,
  TEXTO_CLARO,
  TEXTO_DESTAQUE
} from '../game/estilo';
import { getStageDefinition } from '../game/stageConfig';
import { SCENE_KEYS, type SceneKey } from '../game/types';

export abstract class BaseScene extends Phaser.Scene {
  protected get app(): AppContext {
    return getAppContext();
  }

  protected markActiveScene(sceneKey: SceneKey): void {
    this.app.debugStore.patchState({ activeScene: sceneKey });
  }

  /** Fundo das telas fora da luta: o estádio, escurecido, com vinheta em cima e embaixo. */
  protected createBackdrop(stageId = ''): void {
    const { width, height } = this.cameras.main;
    const stage = getStageDefinition(stageId);

    this.cameras.main.setBackgroundColor(COR_FUNDO);
    if (this.textures.exists(stage.key)) {
      const image = this.add.image(width / 2, height / 2, stage.key);
      image.setScale(Math.max(width / image.width, height / image.height));
      image.setTint(0x6b5a7a).setAlpha(0.45);
    }

    this.add.rectangle(width / 2, height / 2, width, height, COR_FUNDO, 0.55);
    // Vinheta em cima e embaixo, para o título e o rodapé lerem.
    this.add.rectangle(width / 2, 0, width, 220, COR_FUNDO, 0.85).setOrigin(0.5, 0);
    this.add.rectangle(width / 2, height, width, 120, COR_FUNDO, 0.9).setOrigin(0.5, 1);
  }

  /** Logo do jogo centrada em `y`, com até `maxWidth` de largura; sem a imagem, devolve false. */
  protected createLogo(y: number, maxWidth: number): boolean {
    if (!this.textures.exists(LOGO_IMAGE_ASSET.key)) {
      return false;
    }
    const { centerX, width } = this.cameras.main;
    const logo = this.add.image(centerX, y, LOGO_IMAGE_ASSET.key).setDepth(2);
    logo.setScale(Math.min(maxWidth, width - 32) / logo.width);
    return true;
  }

  protected createHeading(title: string, subtitle: string): void {
    const { centerX } = this.cameras.main;

    this.add
      .text(centerX, 54, title.toUpperCase(), {
        color: TEXTO_DESTAQUE,
        fontFamily: FONTE_TITULO,
        fontSize: '52px',
        stroke: CONTORNO_TITULO,
        strokeThickness: 8
      })
      .setOrigin(0.5)
      .setShadow(0, 5, SOMBRA_TITULO, 0, true, true);

    if (subtitle) {
      this.add
        .text(centerX, 102, subtitle, {
          color: TEXTO_CLARO,
          fontFamily: FONTE_TEXTO,
          fontSize: '18px',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 4
        })
        .setOrigin(0.5);
    }
  }

  protected createFooterHint(text: string): void {
    const { centerX, height } = this.cameras.main;

    this.add
      .text(centerX, height - 28, text, {
        color: TEXTO_APAGADO,
        fontFamily: FONTE_TEXTO,
        fontSize: '14px',
        fontStyle: 'bold'
      })
      .setOrigin(0.5)
      .setDepth(100);
  }

  protected goToMenu(): void {
    this.scene.start(SCENE_KEYS.MainMenu);
  }
}
