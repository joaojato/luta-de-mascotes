import * as Phaser from 'phaser';

import type { Rect } from '../types';

export function strokeRect(
  graphics: Phaser.GameObjects.Graphics,
  rect: Rect,
  color: number,
  alpha = 0.9
): void {
  graphics.lineStyle(2, color, alpha);
  graphics.strokeRect(rect.x, rect.y, rect.width, rect.height);
}

export function objectBounds(object: Phaser.GameObjects.Components.GetBounds): Rect {
  const bounds = object.getBounds();

  return {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height
  };
}
