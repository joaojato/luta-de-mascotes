import * as Phaser from 'phaser';

const UI_BUTTON_SIZE = { width: 320, height: 60 };
const UI_PANEL_SIZE = { width: 520, height: 420 };
const PLAYER_SIZE = { width: 42, height: 54 };

export interface GeneratedTextureAsset {
  id: string;
  kind: 'generated-texture';
  width: number;
  height: number;
  usage: string;
}

export const GENERATED_TEXTURE_ASSETS: GeneratedTextureAsset[] = [
  generated('ui-button', UI_BUTTON_SIZE.width, UI_BUTTON_SIZE.height, 'menu button background'),
  generated('ui-button-active', UI_BUTTON_SIZE.width, UI_BUTTON_SIZE.height, 'selected menu button background'),
  generated('ui-panel', UI_PANEL_SIZE.width, UI_PANEL_SIZE.height, 'settings panel background'),
  generated('sample-actor', PLAYER_SIZE.width, PLAYER_SIZE.height, 'neutral starter actor'),
  generated('sample-platform', 180, 38, 'neutral starter platform tile'),
  generated('sample-pickup', 28, 28, 'neutral starter collectible'),
  generated('sample-exit', 70, 112, 'neutral starter level exit'),
  generated('sample-hazard', 56, 30, 'neutral starter hazard'),
  generated('sample-bg-sky', 1280, 720, 'generated sky/background layer'),
  generated('sample-bg-far', 1280, 720, 'generated far parallax layer'),
  generated('sample-bg-mid', 1280, 720, 'generated mid parallax layer')
];

function generated(
  id: string,
  width: number,
  height: number,
  usage: string
): GeneratedTextureAsset {
  return {
    id,
    kind: 'generated-texture',
    width,
    height,
    usage
  };
}

function generateRectangleTexture(
  scene: Phaser.Scene,
  key: string,
  width: number,
  height: number,
  fillColor: number,
  strokeColor = 0x0f172a
): void {
  if (scene.textures.exists(key)) {
    return;
  }

  const graphics = scene.add.graphics();

  graphics.fillStyle(fillColor, 1);
  graphics.fillRect(0, 0, width, height);
  graphics.lineStyle(3, strokeColor, 1);
  graphics.strokeRect(1.5, 1.5, width - 3, height - 3);
  graphics.generateTexture(key, width, height);
  graphics.destroy();
}

function generatePickupTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists('sample-pickup')) {
    return;
  }

  const graphics = scene.add.graphics();
  graphics.fillStyle(0xfacc15, 1);
  graphics.fillCircle(14, 14, 13);
  graphics.lineStyle(3, 0xfef3c7, 1);
  graphics.strokeCircle(14, 14, 11);
  graphics.generateTexture('sample-pickup', 28, 28);
  graphics.destroy();
}

function generateBackgroundTexture(
  scene: Phaser.Scene,
  key: string,
  baseColor: number,
  accentColor: number
): void {
  if (scene.textures.exists(key)) {
    return;
  }

  const graphics = scene.add.graphics();
  graphics.fillStyle(baseColor, 1);
  graphics.fillRect(0, 0, 1280, 720);

  for (let index = 0; index < 10; index += 1) {
    graphics.fillStyle(accentColor, 0.08 + index * 0.01);
    graphics.fillRect(index * 140 - 60, 380 + (index % 3) * 42, 260, 260);
  }

  graphics.generateTexture(key, 1280, 720);
  graphics.destroy();
}

export function registerGeneratedAssets(scene: Phaser.Scene): void {
  generateRectangleTexture(
    scene,
    'ui-button',
    UI_BUTTON_SIZE.width,
    UI_BUTTON_SIZE.height,
    0x1e293b,
    0x7dd3fc
  );
  generateRectangleTexture(
    scene,
    'ui-button-active',
    UI_BUTTON_SIZE.width,
    UI_BUTTON_SIZE.height,
    0x334155,
    0xf8fafc
  );
  generateRectangleTexture(
    scene,
    'ui-panel',
    UI_PANEL_SIZE.width,
    UI_PANEL_SIZE.height,
    0x111827,
    0x475569
  );
  generateRectangleTexture(
    scene,
    'sample-actor',
    PLAYER_SIZE.width,
    PLAYER_SIZE.height,
    0x38bdf8,
    0xe0f2fe
  );
  generateRectangleTexture(scene, 'sample-platform', 180, 38, 0x475569, 0x94a3b8);
  generateRectangleTexture(scene, 'sample-exit', 70, 112, 0x14532d, 0x86efac);
  generateRectangleTexture(scene, 'sample-hazard', 56, 30, 0x7f1d1d, 0xfca5a5);
  generatePickupTexture(scene);
  generateBackgroundTexture(scene, 'sample-bg-sky', 0x12263a, 0x38bdf8);
  generateBackgroundTexture(scene, 'sample-bg-far', 0x0f3a3a, 0x22c55e);
  generateBackgroundTexture(scene, 'sample-bg-mid', 0x172554, 0xfacc15);
}
