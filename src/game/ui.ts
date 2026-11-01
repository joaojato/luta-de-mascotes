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
  /** Tamanho do rótulo em px (padrão 26). */
  fontSize?: number;
  onClick(): void;
  onHover?(): void;
}

export function createTextButton(scene: Phaser.Scene, config: TextButtonConfig): TextButton {
  const background = scene.add.rectangle(config.x, config.y, config.width, config.height, COR_PAINEL, 0.82);
  const label = scene.add.text(config.x, config.y, config.label.toUpperCase(), {
    color: TEXTO_CLARO,
    fontFamily: FONTE_TITULO,
    fontSize: `${config.fontSize ?? 26}px`,
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

/**
 * Cartão provisório enquanto a ilustração não chega: título grande com a
 * sombra vermelha dos letreiros, um marcador opcional e o texto quebrado em
 * linhas. Vai por cima de um cartão criado sem título nem imagem.
 */
export function preencherCartao(
  scene: Phaser.Scene,
  card: SelectionCard,
  conteudo: { titulo: string; marcador?: string; texto: string; largura: number }
): void {
  const titulo = scene.add
    .text(0, -70, conteudo.titulo.toUpperCase(), {
      color: TEXTO_CLARO,
      fontFamily: FONTE_TITULO,
      fontSize: '44px',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 6
    })
    .setShadow(0, 4, '#f00000', 0, true, true)
    .setOrigin(0.5);
  const objetos: Phaser.GameObjects.GameObject[] = [titulo];
  if (conteudo.marcador) {
    objetos.push(
      scene.add
        .text(0, -130, conteudo.marcador, { color: TEXTO_DESTAQUE, fontFamily: FONTE_TEXTO, fontSize: '30px' })
        .setOrigin(0.5)
    );
  }
  objetos.push(
    scene.add
      .text(0, 10, conteudo.texto, {
        color: TEXTO_APAGADO,
        fontFamily: FONTE_TEXTO,
        fontSize: '17px',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: conteudo.largura - 40 }
      })
      .setOrigin(0.5, 0)
  );
  // Abaixo do brilho da trava (último filho), por cima do fundo.
  card.container.addAt(objetos, card.container.length - 1);
}

/**
 * Escala a imagem para cobrir um quadrado e recorta o excesso, mantendo o topo
 * (onde fica a cara) quando o retrato é mais alto que largo.
 */
export function coverCrop(image: Phaser.GameObjects.Image, size: number, x: number, y: number): void {
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
 * Close do rosto: recorta do retrato o quadrado marcado em `rosto` no JSON
 * do lutador e o escala para `size`. Sem a marcação, cai no {@link coverCrop}.
 */
export function rostoCrop(
  image: Phaser.GameObjects.Image,
  size: number,
  x: number,
  y: number,
  rosto: { x: number; y: number; lado: number } | undefined
): void {
  if (!rosto) {
    coverCrop(image, size, x, y);
    return;
  }
  const lado = Math.min(rosto.lado * image.width, image.width, image.height);
  const cropX = Phaser.Math.Clamp(rosto.x * image.width - lado / 2, 0, image.width - lado);
  const cropY = Phaser.Math.Clamp(rosto.y * image.height - lado / 2, 0, image.height - lado);
  const scale = size / lado;

  image.setScale(scale);
  image.setCrop(cropX, cropY, lado, lado);
  image.setPosition(x - (cropX + lado / 2 - image.width / 2) * scale, y - (cropY + lado / 2 - image.height / 2) * scale);
}
