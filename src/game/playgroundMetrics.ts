import type { Rect } from './types';

export const PLAYGROUND_UNIT_PX = 64;

export const PLAYGROUND_METRICS = {
  unitPx: PLAYGROUND_UNIT_PX,
  questAtlasTileSourceHeightPx: 88,
  heroTargetVisualHeightUnits: 2.25,
  walkSpeedUnitsPerSecond: 3.65,
  runSpeedUnitsPerSecond: 5.75,
  jumpSpeedUnitsPerSecond: 11.85,
  gravityUnitsPerSecondSquared: 29.7
} as const;

export function unitsToPx(units: number): number {
  return units * PLAYGROUND_METRICS.unitPx;
}

export function sourceToWorldScale(sourcePx: number, targetWorldPx: number): number {
  return targetWorldPx / sourcePx;
}

export function scaleRect(rectangle: Rect, scale: number): Rect {
  return {
    x: rectangle.x * scale,
    y: rectangle.y * scale,
    width: rectangle.width * scale,
    height: rectangle.height * scale
  };
}
