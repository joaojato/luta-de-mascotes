import type { Dificuldade } from './cpu';

export const SCENE_KEYS = {
  Boot: 'BootScene',
  PrimeiraVez: 'PrimeiraVezScene',
  MainMenu: 'MainMenuScene',
  ModeSelect: 'ModeSelectScene',
  Dificuldade: 'DificuldadeScene',
  Torneio: 'TorneioScene',
  TorneioQuadro: 'TorneioQuadroScene',
  LevelSelect: 'LevelSelectScene',
  CharacterSelect: 'CharacterSelectScene',
  Match: 'MatchScene',
  Academia: 'AcademiaScene',
  Museu: 'MuseuScene',
  Conectar: 'ConectarScene',
  AssetCatalog: 'AssetCatalogScene',
  AnimationLab: 'AnimationLabScene',
  BackgroundTest: 'BackgroundTestScene',
  StagePreview: 'StagePreviewScene',
  FighterPlayground: 'FighterPlaygroundScene',
  TileGym: 'TileGymScene',
  LevelEditor: 'LevelEditorScene',
  Settings: 'SettingsScene',
  Botoes: 'BotoesScene'
} as const;

export type SceneKey = (typeof SCENE_KEYS)[keyof typeof SCENE_KEYS];

/**
 * Match modes selectable from the Play flow: local two-player versus, or a
 * single human player against a CPU-controlled opponent.
 */
export type MatchMode = '1v1' | '1vcpu';

/** Formatos de torneio: chaveamento eliminatório ou todos contra todos. */
export type FormatoTorneio = 'mata-mata' | 'pontos-corridos';

/** De onde a tela de dificuldade foi aberta, e para onde ela segue. */
export type DificuldadeData =
  | { destino: 'pelada' }
  | { destino: 'torneio'; formato: FormatoTorneio; tamanho: 8 | 16 };

/**
 * The accumulated selections produced by the Play flow (mode -> level ->
 * characters) and consumed by {@link SCENE_KEYS.Match}.
 */
export interface MatchConfig {
  mode: MatchMode;
  stageId: string;
  p1CharacterId: string;
  p2CharacterId: string;
  /** Luta do torneio salvo: a CPU usa a dificuldade dele e o fim volta ao chaveamento. */
  torneio?: true;
  /** Treino livre da Academia: sem relógio, sem fim, a vida volta a encher. */
  treino?: true;
  /** No treino: a CPU joga com o P2 (senão ele fica parado). */
  treinoCpu?: boolean;
  /** Tutorial (vem com `treino`): falas, checklist e a CPU roteirizada, sem o painel do treino. */
  tutorial?: true;
  /** Dificuldade desta luta, no lugar da dos ajustes (a luta que fecha o tutorial é no Fácil). */
  cpuDificuldade?: Dificuldade;
  /** A luta que fecha o tutorial: na tela de fim, R recomeça e confirmar leva ao menu. */
  depoisDoTutorial?: true;
  /** Instruções do 1x1 (vem com `treino`): os dois apertam cada comando e a luta começa. */
  instrucoes?: true;
}

export type GameProfile = 'landscape' | 'portrait';

export interface Size {
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Rect extends Point, Size {}

export interface GameProfileConfig {
  id: GameProfile;
  label: string;
  width: number;
  height: number;
}

export interface GameSettings {
  sfxVolume: number;
  musicVolume: number;
  muted: boolean;
  /** Dificuldade da CPU no 1 VS CPU (escolhida na tela de modo). */
  cpuDificuldade: Dificuldade;
  /** Contador de quadros por segundo no canto da tela (Ajustes). */
  mostrarFps: boolean;
}

export interface InputSnapshot {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  run: boolean;
  jump: boolean;
  attack: boolean;
  confirm: boolean;
  cancel: boolean;
  pointerDown: boolean;
}

export interface PointerSnapshot {
  x: number;
  y: number;
}

export interface PerformanceSnapshot {
  fps: number;
  frameMs: number;
  worstFrameMs: number;
  heapUsedMb: number | null;
  heapLimitMb: number | null;
  objectCount: number;
}

export type CharacterBoundsKind = 'visual' | 'collision' | 'hit' | 'attack' | 'guard';

export interface CharacterGymBoundsEdit extends Rect {
  active: boolean;
}

export type CharacterGymBoundsOverrides = Record<
  string,
  Record<number, Partial<Record<CharacterBoundsKind, CharacterGymBoundsEdit>>>
>;

/** Character Gym on-canvas editing gizmo: translate (move) or scale (resize). */
export type CharacterGymGizmoMode = 'translate' | 'scale';

export interface CharacterGymDebugState {
  characterId: string;
  animationKey: string;
  paused: boolean;
  playbackSpeed: number;
  frame: number;
  selectedBoundsKind: CharacterBoundsKind;
  gizmoMode: CharacterGymGizmoMode;
  boundsOverrides: CharacterGymBoundsOverrides;
}

export interface FighterStats {
  walkSpeed: number;
  airDrift: number;
  jump: number;
  gravity: number;
  scale: number;
}

/** Which guard stops an attack: a high attack must be blocked standing, a low attack crouching. */
export type AttackHeight = 'high' | 'low';

/**
 * The attack source: the light button (`high`), the heavy button (`low`), the
 * low kick button (`lowKick`), or a meter-fuelled `special` move (multi-hit).
 */
export type AttackKind = 'high' | 'low' | 'kick' | 'lowKick' | 'special';

/**
 * Per-character combat tuning. The light attack button is the "high" attack and
 * the heavy attack button is the "low" attack; each carries its own damage,
 * knockback, and hitstun so characters can feel different. Persisted to and
 * adjustable from `public/configs/fighter-playground.json`.
 */
export interface FighterCombat {
  maxHealth: number;
  highDamage: number;
  highKnockback: number;
  highHitstun: number;
  lowDamage: number;
  lowKnockback: number;
  lowHitstun: number;
  /** Kick button (Chute básico, and the flying kick in the air). */
  kickDamage: number;
  kickKnockback: number;
  kickHitstun: number;
  /** Low kick (Chute baixo): quick, interrupts a heavy punch. */
  lowKickDamage: number;
  lowKickKnockback: number;
  lowKickHitstun: number;
  /** Per-hit damage of the meter special (a special lands several of these). */
  specialDamage: number;
  /** Per-hit pushback of the meter special. */
  specialKnockback: number;
  /** Per-hit hitstun (ms) of the meter special. */
  specialHitstun: number;
  /** Seconds of fighting for the special meter to fill on its own (0 = only hits fill it). */
  meterSeconds: number;
}

/** A resolved single-attack profile derived from {@link FighterCombat}. */
export interface AttackProfile {
  kind: AttackKind;
  height: AttackHeight;
  damage: number;
  knockback: number;
  hitstun: number;
  /** True for the final hit of a special: launches harder for a combo finish. */
  finisher?: boolean;
  /** Stun (ms) that replaces the hitstun when longer (e.g. a powder cloud). */
  stunMs?: number;
}

export interface FighterBoundsVisibility {
  visual: boolean;
  collision: boolean;
  hit: boolean;
  attack: boolean;
  guard: boolean;
}

export interface FighterPlaygroundDebugState {
  characterId: string;
  stats: Record<string, FighterStats>;
  combat: Record<string, FighterCombat>;
  bounds: FighterBoundsVisibility;
  /**
   * When true, backward walking plays the forward walk animation in reverse
   * instead of the character's dedicated backward-walk animation.
   */
  reverseWalk: boolean;
  /**
   * Debug toggle (playground only, not persisted): keeps the player's special
   * meter topped up so the special move can be tested on demand against the dummy.
   */
  fillSpecial: boolean;
  saveStatus: string;
}

export interface BackgroundLayerConfig {
  key: string;
  label: string;
  url: string;
  depth: number;
  visible: boolean;
  speedFactor: number;
  offsetX: number;
  offsetY: number;
  scale: number;
  alpha: number;
}

export interface BackgroundGymDebugState {
  selectedLayerKey: string;
  layers: BackgroundLayerConfig[];
}

export interface StagePreviewDebugState {
  stageId: string;
  scrollX: number;
  maxScroll: number;
  displayWidth: number;
  autoPan: boolean;
  panSpeed: number;
  showGuides: boolean;
}

export type TileBoundsKind = 'collision' | 'hit';

export interface TileGymBoundsEdit extends Rect {
  active: boolean;
}

export type TileGymBoundsOverrides = Record<
  string,
  Partial<Record<TileBoundsKind, TileGymBoundsEdit>>
>;

export interface TileGymDebugState {
  selectedFrameName: string;
  selectedBoundsKind: TileBoundsKind;
  boundsOverrides: TileGymBoundsOverrides;
}

export type LevelEditorMode = 'select' | 'place';
export type LevelEditorGizmoMode = 'free' | 'x' | 'y';

export interface LevelEditorObject {
  id: string;
  frameName: string;
  x: number;
  y: number;
  scale: number;
  depth: number;
}

export type LevelEditorHotspotId = 'player-spawn';

export interface LevelEditorLevel {
  version: number;
  id: string;
  title: string;
  width: number;
  height: number;
  bounds: Rect;
  playerStart: Point;
  objects: LevelEditorObject[];
}

export interface LevelEditorDebugState {
  selectedCategory: string;
  selectedFrameName: string;
  selectedObjectId: string | null;
  selectedHotspotId: LevelEditorHotspotId | null;
  mode: LevelEditorMode;
  gizmoMode: LevelEditorGizmoMode;
  snapEnabled: boolean;
  snapSize: number;
  cameraScrollX: number;
  saveStatus: string;
  level: LevelEditorLevel;
}

export interface DebugState {
  activeScene: SceneKey;
  paused: boolean;
  showWorldBounds: boolean;
  showVisualBounds: boolean;
  showCollisionBounds: boolean;
  showHitBounds: boolean;
  showAssetLabels: boolean;
  showPerformance: boolean;
  showTouchControls: boolean;
  worldBounds: Rect | null;
  activeLevelId: string;
  configSaveStatus: string;
  characterGym: CharacterGymDebugState;
  fighterPlayground: FighterPlaygroundDebugState;
  backgroundGym: BackgroundGymDebugState;
  stagePreview: StagePreviewDebugState;
  tileGym: TileGymDebugState;
  levelEditor: LevelEditorDebugState;
  pointer: PointerSnapshot;
  performance: PerformanceSnapshot;
  input: InputSnapshot;
}
