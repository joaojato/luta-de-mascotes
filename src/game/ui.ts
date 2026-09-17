import * as Phaser from 'phaser';

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
  const background = scene.add.image(config.x, config.y, 'ui-button');
  const label = scene.add.text(config.x, config.y, config.label, {
    color: '#e2e8f0',
    fontFamily: 'monospace',
    fontSize: '22px'
  });

  background.setDisplaySize(config.width, config.height);
  background.setInteractive({ useHandCursor: true });
  label.setOrigin(0.5);

  const group = scene.add.container(0, 0, [background, label]);

  const setSelected = (selected: boolean): void => {
    background.setTexture(selected ? 'ui-button-active' : 'ui-button');
    label.setColor(selected ? '#f8fafc' : '#e2e8f0');
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

const CARD_BASE_STROKE = 0x334155;

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
    .rectangle(0, 0, config.width, config.height, 0x0f172a, 0.92)
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
    .text(0, titleY, config.title, {
      color: '#f8fafc',
      fontFamily: 'monospace',
      fontSize: '20px',
      align: 'center'
    })
    .setOrigin(0.5);
  children.push(title);

  if (config.subtitle) {
    const subtitle = scene.add
      .text(0, subtitleY, config.subtitle, {
        color: '#94a3b8',
        fontFamily: 'monospace',
        fontSize: '13px',
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
    title.setColor(selected ? '#ffffff' : '#f8fafc');
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
