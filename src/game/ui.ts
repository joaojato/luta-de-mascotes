import * as Phaser from 'phaser';

import { COR_BORDA, COR_DESTAQUE, COR_PAINEL, FONTE_TEXTO, FONTE_TITULO, TEXTO_APAGADO, TEXTO_CLARO, TEXTO_DESTAQUE } from './estilo';

export interface TextButton {
  group: Phaser.GameObjects.Container;
  setSelected(selected: boolean): void;
  destroy(): void;
}

interface TextButtonConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  onClick(): void;
  onHover?(): void;
}

export function createTextButton(scene: Phaser.Scene, config: TextButtonConfig): TextButton {
  const background = scene.add.rectangle(config.x, config.y, config.width, config.height, COR_PAINEL, 0.82);
  const label = scene.add.text(config.x, config.y, config.label.toUpperCase(), {
    color: TEXTO_CLARO,
    fontFamily: FONTE_TITULO,
    fontSize: '26px',
    stroke: '#000000',
    strokeThickness: 4
  });

  background.setInteractive({ useHandCursor: true });
  label.setOrigin(0.5);

  const group = scene.add.container(0, 0, [background, label]);

  const setSelected = (selected: boolean): void => {
    background.setStrokeStyle(selected ? 3 : 2, selected ? COR_DESTAQUE : COR_BORDA, 1);
    background.setFillStyle(selected ? 0x2a0707 : COR_PAINEL, selected ? 0.92 : 0.82);
    label.setColor(selected ? TEXTO_DESTAQUE : TEXTO_CLARO);
  };

  background.on('pointerover', () => {
    config.onHover?.();
  });
  background.on('pointerdown', () => {
    config.onClick();
  });

  setSelected(false);

  return {
    group,
    setSelected,
    destroy: () => {
      group.destroy(true);
    }
  };
}

export interface SelectionCard {
  container: Phaser.GameObjects.Container;
  setSelected(selected: boolean, accent?: number): void;
  setDimmed(dimmed: boolean): void;
  flashLock(onComplete: () => void): void;
  destroy(): void;
}

export interface SelectionCardConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  subtitle?: string;
  texture?: string;
  /** Max width/height (px) for the card image; defaults to fitting the card. */
  imageMaxSize?: number;
  /** Vertical offset of the image centre from the card centre. */
  imageOffsetY?: number;
  onClick?: () => void;
  onHover?: () => void;
}

const CARD_BASE_STROKE = COR_BORDA;

/**
 * Create a selectable card: a framed panel with an optional image, a title and
 * subtitle, plus selection highlighting and a lock-in flash. Used by the level
 * and character select screens.
 * @param scene - The owning scene.
 * @param config - Card geometry, labels, optional image, and callbacks.
 * @returns A {@link SelectionCard} handle.
 */
export function createSelectionCard(scene: Phaser.Scene, config: SelectionCardConfig): SelectionCard {
  const background = scene.add
    .rectangle(0, 0, config.width, config.height, COR_PAINEL, 0.88)
    .setStrokeStyle(2, CARD_BASE_STROKE, 1);

  const children: Phaser.GameObjects.GameObject[] = [background];

  if (config.texture) {
    const image = scene.add.image(0, config.imageOffsetY ?? -18, config.texture).setOrigin(0.5);
    const maxSize = config.imageMaxSize ?? Math.min(config.width - 24, config.height - 80);
    const sourceSize = Math.max(image.width, image.height) || maxSize;
    image.setScale(maxSize / sourceSize);
    children.push(image);
  }

  const subtitleY = config.height / 2 - 20;
  const titleY = config.subtitle ? subtitleY - 26 : subtitleY;

  const title = scene.add
    .text(0, titleY, config.title.toUpperCase(), {
      color: TEXTO_CLARO,
      fontFamily: FONTE_TITULO,
      fontSize: '26px',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 4
    })
    .setOrigin(0.5);
  children.push(title);

  if (config.subtitle) {
    const subtitle = scene.add
      .text(0, subtitleY, config.subtitle, {
        color: TEXTO_APAGADO,
        fontFamily: FONTE_TEXTO,
        fontSize: '15px',
        fontStyle: 'bold',
        align: 'center'
      })
      .setOrigin(0.5);
    children.push(subtitle);
  }

  const flash = scene.add
    .rectangle(0, 0, config.width, config.height, 0xffffff, 0)
    .setOrigin(0.5);
  children.push(flash);

  const container = scene.add.container(config.x, config.y, children);

  background.setInteractive({ useHandCursor: true });
  background.on('pointerover', () => config.onHover?.());
  background.on('pointerdown', () => config.onClick?.());

  const setSelected = (selected: boolean, accent: number = 0x38bdf8): void => {
    background.setStrokeStyle(selected ? 4 : 2, selected ? accent : CARD_BASE_STROKE, 1);
    container.setScale(selected ? 1.05 : 1);
    title.setColor(selected ? TEXTO_DESTAQUE : TEXTO_CLARO);
  };

  const setDimmed = (dimmed: boolean): void => {
    container.setAlpha(dimmed ? 0.4 : 1);
  };

  const flashLock = (onComplete: () => void): void => {
    scene.tweens.add({
      targets: flash,
      alpha: { from: 0, to: 0.85 },
      duration: 90,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        flash.setAlpha(0);
        onComplete();
      }
    });
  };

  setSelected(false);

  return {
    container,
    setSelected,
    setDimmed,
    flashLock,
    destroy: () => {
      container.destroy(true);
    }
  };
}
