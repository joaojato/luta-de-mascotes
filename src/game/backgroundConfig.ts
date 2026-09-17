import type { BackgroundGymDebugState, BackgroundLayerConfig } from './types';

export const BACKGROUND_GYM_CONFIG_FILE = '/configs/background-gym.json';
export const BACKGROUND_GYM_CONFIG_SAVE_TARGET = 'configs/background-gym.json';
export const BACKGROUND_BASE_SCROLL_SPEED = 24;

export const BACKGROUND_LAYER_KEYS = ['rooftop-twilight-stage'] as const;

export type BackgroundLayerKey = (typeof BACKGROUND_LAYER_KEYS)[number];

export interface BackgroundGymConfigExport {
  version: number;
  savedAt: string;
  background: {
    id: 'rooftop-parallax';
    selectedLayerKey: BackgroundLayerKey;
    layers: BackgroundLayerConfig[];
  };
}

export const DEFAULT_BACKGROUND_LAYERS: BackgroundLayerConfig[] = [
  {
    key: 'rooftop-twilight-stage',
    label: 'Rooftop',
    url: '/assets/backgrounds/rooftop-twilight-stage.png',
    depth: 0,
    visible: true,
    speedFactor: 0.5,
    offsetX: 0,
    offsetY: 0,
    scale: 1,
    alpha: 1
  }
];

export const DEFAULT_BACKGROUND_GYM_STATE: BackgroundGymDebugState = {
  selectedLayerKey: 'rooftop-twilight-stage',
  layers: DEFAULT_BACKGROUND_LAYERS.map((layer) => ({ ...layer }))
};

export function buildBackgroundGymConfigExport(
  backgroundGym: BackgroundGymDebugState
): BackgroundGymConfigExport {
  const normalized = normalizeBackgroundGymState(backgroundGym);

  return {
    version: 1,
    savedAt: new Date().toISOString(),
    background: {
      id: 'rooftop-parallax',
      selectedLayerKey: isBackgroundLayerKey(normalized.selectedLayerKey)
        ? normalized.selectedLayerKey
        : 'rooftop-twilight-stage',
      layers: normalized.layers
    }
  };
}

export async function loadBackgroundGymConfig(): Promise<BackgroundGymDebugState | null> {
  try {
    const response = await fetch(BACKGROUND_GYM_CONFIG_FILE, { cache: 'no-store' });

    if (!response.ok) {
      return null;
    }

    const config = (await response.json()) as Partial<BackgroundGymConfigExport>;

    return normalizeBackgroundGymState({
      selectedLayerKey: config.background?.selectedLayerKey,
      layers: config.background?.layers
    });
  } catch {
    return null;
  }
}

export function normalizeBackgroundGymState(
  value: Partial<BackgroundGymDebugState> | null | undefined
): BackgroundGymDebugState {
  const layerByKey = new Map<string, Partial<BackgroundLayerConfig>>();

  value?.layers?.forEach((layer) => {
    layerByKey.set(layer.key, layer);
  });

  const layers = DEFAULT_BACKGROUND_LAYERS.map((fallback) => normalizeLayer(layerByKey.get(fallback.key), fallback));
  const selectedLayerKey = isBackgroundLayerKey(value?.selectedLayerKey)
    ? value.selectedLayerKey
    : DEFAULT_BACKGROUND_GYM_STATE.selectedLayerKey;

  return {
    selectedLayerKey,
    layers
  };
}

export function getBackgroundLayer(
  backgroundGym: BackgroundGymDebugState,
  layerKey: string
): BackgroundLayerConfig {
  return (
    backgroundGym.layers.find((layer) => layer.key === layerKey) ??
    backgroundGym.layers[0] ??
    DEFAULT_BACKGROUND_LAYERS[0]
  );
}

function normalizeLayer(
  value: Partial<BackgroundLayerConfig> | undefined,
  fallback: BackgroundLayerConfig
): BackgroundLayerConfig {
  const legacySpeed = (value as { speed?: unknown } | undefined)?.speed;

  return {
    ...fallback,
    visible: typeof value?.visible === 'boolean' ? value.visible : fallback.visible,
    speedFactor: clampNumber(
      value?.speedFactor ?? legacySpeedFactor(legacySpeed),
      -4,
      4,
      fallback.speedFactor
    ),
    offsetX: clampNumber(value?.offsetX, -1280, 1280, fallback.offsetX),
    offsetY: clampNumber(value?.offsetY, -720, 720, fallback.offsetY),
    scale: clampNumber(value?.scale, 0.25, 3, fallback.scale),
    alpha: clampNumber(value?.alpha, 0, 1, fallback.alpha)
  };
}

function legacySpeedFactor(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value)
    ? value / BACKGROUND_BASE_SCROLL_SPEED
    : undefined;
}

function isBackgroundLayerKey(value: unknown): value is BackgroundLayerKey {
  return typeof value === 'string' && BACKGROUND_LAYER_KEYS.includes(value as BackgroundLayerKey);
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, value));
}
