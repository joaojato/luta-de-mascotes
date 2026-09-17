import type { ImageAsset } from './assets';
import type { StagePreviewDebugState } from './types';

/**
 * A full-frame fighting-stage background candidate. Stages are single images
 * (not parallax layers) used by the Stage Preview gym to evaluate framing.
 */
export interface StageDefinition {
  id: string;
  label: string;
  key: string;
  url: string;
  width: number;
  height: number;
}

/**
 * The computed placement of a stage when fit to a viewport: vertical-fit scale,
 * resulting on-screen size, and how far it can scroll horizontally.
 */
export interface StageLayout {
  scale: number;
  displayWidth: number;
  displayHeight: number;
  maxScroll: number;
}

export const STAGE_PREVIEW_DEFAULT_PAN_SPEED = 140;
export const STAGE_PREVIEW_MIN_PAN_SPEED = 20;
export const STAGE_PREVIEW_MAX_PAN_SPEED = 600;

const STAGE_ASSET_ROOT = '/assets/backgrounds';

export const STAGE_DEFINITIONS: StageDefinition[] = [
  {
    id: 'rooftop-twilight',
    label: 'Rooftop Twilight',
    key: 'rooftop-twilight-stage',
    url: `${STAGE_ASSET_ROOT}/rooftop-twilight-stage.png`,
    width: 1774,
    height: 887
  },
  {
    id: 'rooftop-sunset',
    label: 'Rooftop Sunset',
    key: 'rooftop-sunset-stage',
    url: `${STAGE_ASSET_ROOT}/rooftop-sunset-stage.png`,
    width: 2048,
    height: 768
  }
];

export const STAGE_IMAGE_ASSETS: ImageAsset[] = STAGE_DEFINITIONS.map((stage) => ({
  kind: 'image',
  key: stage.key,
  url: stage.url,
  width: stage.width,
  height: stage.height,
  usage: `${stage.label.toLowerCase()} fighting-stage background candidate`
}));

export const DEFAULT_STAGE_PREVIEW_STATE: StagePreviewDebugState = {
  stageId: STAGE_DEFINITIONS[0].id,
  scrollX: 0,
  maxScroll: 0,
  displayWidth: 0,
  autoPan: false,
  panSpeed: STAGE_PREVIEW_DEFAULT_PAN_SPEED,
  showGuides: true
};

/**
 * Resolves a stage definition by id, falling back to the first stage when the
 * id is unknown.
 * @param stageId - The stage identifier to resolve.
 * @returns The matching {@link StageDefinition} or the first stage.
 */
export function getStageDefinition(stageId: string): StageDefinition {
  return STAGE_DEFINITIONS.find((stage) => stage.id === stageId) ?? STAGE_DEFINITIONS[0];
}

/**
 * Computes how a stage is placed when fit to the viewport height and centered,
 * including the horizontal scroll range produced by the overflow.
 * @param stageId - The stage to lay out.
 * @param viewportWidth - The game viewport width in pixels.
 * @param viewportHeight - The game viewport height in pixels.
 * @returns The {@link StageLayout} for the stage at this viewport size.
 */
export function getStageLayout(
  stageId: string,
  viewportWidth: number,
  viewportHeight: number
): StageLayout {
  const stage = getStageDefinition(stageId);
  const scale = viewportHeight / stage.height;
  const displayWidth = stage.width * scale;

  return {
    scale,
    displayWidth,
    displayHeight: viewportHeight,
    maxScroll: Math.max(0, displayWidth - viewportWidth)
  };
}

/**
 * Clamps a horizontal scroll value to the valid range for a layout.
 * @param value - The desired scroll position in pixels.
 * @param maxScroll - The maximum scroll for the current stage layout.
 * @returns The clamped scroll position.
 */
export function clampStageScroll(value: number, maxScroll: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(0, maxScroll), Math.max(0, value));
}

/**
 * Clamps a pan speed to the supported range.
 * @param value - The desired pan speed in pixels/second.
 * @returns The clamped pan speed.
 */
export function clampStagePanSpeed(value: number): number {
  if (!Number.isFinite(value)) {
    return STAGE_PREVIEW_DEFAULT_PAN_SPEED;
  }

  return Math.min(STAGE_PREVIEW_MAX_PAN_SPEED, Math.max(STAGE_PREVIEW_MIN_PAN_SPEED, Math.round(value)));
}
