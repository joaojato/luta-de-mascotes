import * as Phaser from 'phaser';

import { FIGHTING_UI_ATLAS_TEXTURE_KEY } from './fightingUiAtlas';

/** Render depth for combat VFX: above fighters, below the HUD. */
const VFX_DEPTH = 90;

/** Tint/spark colour keyed to the kind of impact. */
export type VfxColor = 'red' | 'gold' | 'blue';

const SPARK_FRAME: Record<VfxColor, string> = {
  red: 'icon-hit-red',
  gold: 'icon-hit-gold',
  blue: 'icon-hit-blue'
};

const FLASH_TINT: Record<VfxColor, number> = {
  red: 0xff5a5a,
  gold: 0xffd24a,
  blue: 0x7ec8ff
};

/**
 * Spawns a short-lived hit spark (an atlas impact icon) at a contact point that
 * pops in, scales up, and fades out. Used when an attack connects.
 * @param scene - The owning scene.
 * @param x - World x of the contact point.
 * @param y - World y of the contact point.
 * @param color - Spark colour (red clean hit, blue blocked, gold finisher).
 * @param scale - Peak display scale of the spark (default 1).
 */
export function spawnHitSpark(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color: VfxColor = 'red',
  scale = 1
): void {
  const frame = SPARK_FRAME[color];
  if (!scene.textures.exists(FIGHTING_UI_ATLAS_TEXTURE_KEY)) {
    spawnImpactFlash(scene, x, y, color, 40 * scale);
    return;
  }

  const spark = scene.add
    .image(x, y, FIGHTING_UI_ATLAS_TEXTURE_KEY, frame)
    .setDepth(VFX_DEPTH)
    .setScrollFactor(1)
    .setScale(0.2 * scale)
    .setAngle(Phaser.Math.Between(-30, 30))
    .setAlpha(1);

  scene.tweens.add({
    targets: spark,
    scale: scale,
    alpha: 0,
    duration: 220,
    ease: 'Cubic.Out',
    onComplete: () => spark.destroy()
  });

  spawnImpactFlash(scene, x, y, color, 34 * scale);
}

/**
 * Spawns an expanding ring flash at a point that fades as it grows.
 * @param scene - The owning scene.
 * @param x - World x of the flash centre.
 * @param y - World y of the flash centre.
 * @param color - Flash tint.
 * @param radius - Peak radius in world pixels.
 */
export function spawnImpactFlash(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color: VfxColor,
  radius = 40
): void {
  const ring = scene.add
    .circle(x, y, radius * 0.3, FLASH_TINT[color], 0.55)
    .setDepth(VFX_DEPTH - 1)
    .setScrollFactor(1);

  scene.tweens.add({
    targets: ring,
    scale: 2.4,
    alpha: 0,
    duration: 260,
    ease: 'Cubic.Out',
    onComplete: () => ring.destroy()
  });
}

/**
 * Spawns a special-move charge burst around a fighter: concentric rings that
 * expand outward and fade, telegraphing the wind-up before the move executes.
 * @param scene - The owning scene.
 * @param x - World x of the fighter's centre.
 * @param y - World y of the fighter's centre (roughly mid-body).
 * @param color - Aura colour.
 */
export function spawnChargeAura(scene: Phaser.Scene, x: number, y: number, color: VfxColor = 'gold'): void {
  for (let index = 0; index < 3; index += 1) {
    const ring = scene.add
      .circle(x, y, 18, FLASH_TINT[color], 0)
      .setStrokeStyle(4, FLASH_TINT[color], 0.9)
      .setDepth(VFX_DEPTH - 1)
      .setScrollFactor(1)
      .setScale(1.6);

    scene.tweens.add({
      targets: ring,
      scale: 0.2,
      alpha: 0,
      delay: index * 120,
      duration: 420,
      ease: 'Sine.In',
      onComplete: () => ring.destroy()
    });
  }
}
