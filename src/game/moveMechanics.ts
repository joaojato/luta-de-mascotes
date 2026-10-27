import type { GolpeId } from './golpes';

export interface FighterMoveConfig {
  jump?: JumpFramesConfig;
  heavy?: ProjectileMoveConfig;
  special?: ProjectileMoveConfig;
}

/** Jump sheet layout; omitted fields follow the Urubu model (see {@link jumpFrames}). */
export interface JumpFramesConfig {
  takeoff?: number;
  airEnd?: number;
  land?: number;
}

export interface JumpFrames {
  /** First airborne frame; frames 1..takeoff-1 are the wind-up, still on the ground. */
  takeoff: number;
  /** Last airborne frame; the flight spreads takeoff..airEnd over the arc. */
  airEnd: number;
  /** Pose held on touchdown. */
  land: number;
}

export interface ProjectileMoveConfig {
  action?: string;
  kind: string;
  startFrame?: number;
  endFrame?: number;
  releaseFrame?: number;
  speed?: number;
  visualFile?: string;
  visualFrames?: number;
  visualFrameRate?: number;
  visualScale?: number;
  hitWidth?: number;
  hitHeight?: number;
  persistOnHit?: boolean;
}

/** Continuous traversal, including recovery frames after reaching the far edge. */
export function dashPosition(from: number, to: number, elapsed: number, start: number, end: number): number {
  const progress = Math.max(0, Math.min(1, (elapsed-start)/Math.max(.001, end-start)));
  return from+(to-from)*progress;
}

/**
 * Splits a jump sheet into wind-up, flight and touchdown. Default is the Urubu
 * model: 0 standing, 1-2 squat, 3..last airborne, squat again on landing.
 */
export function jumpFrames(frameCount: number, config: JumpFramesConfig = {}): JumpFrames {
  const last = Math.max(0, frameCount-1);
  const clamp = (value: number, min: number) => Math.max(min, Math.min(last, value));
  const takeoff = clamp(config.takeoff ?? 3, 0);
  return {
    takeoff,
    airEnd: clamp(config.airEnd ?? last, takeoff),
    land: clamp(config.land ?? takeoff-1, 0)
  };
}

/** Flight poses follow the physical arc rather than an unrelated animation clock. */
export function jumpFlightFrame(elapsed: number, duration: number, first: number, lastAir: number): number {
  const progress = Math.max(0, Math.min(1, elapsed/Math.max(.001, duration)));
  return Math.min(lastAir, first+Math.floor(progress*(lastAir-first+1)));
}

/** Which move a live hitbox belongs to (GDD, "Golpes"): heavy projectile = `tiro`, special projectile = `onda` (the caravel). */
export type AttackMove = GolpeId | 'tiro' | 'onda';

/** Standing guard (`alta`) or crouching guard (`baixa`). */
export type GuardStance = 'alta' | 'baixa';

/** Which guard stops each move: heavy punch breaks the low guard, low kick and flying kick break the high one. */
const GUARDS: Record<AttackMove, GuardStance[]> = {
  'soco-rapido': ['alta', 'baixa'],
  'soco-forte': ['alta'],
  'chute-basico': ['alta', 'baixa'],
  'chute-baixo': ['baixa'],
  'soco-no-ar': ['alta', 'baixa'],
  voadora: ['baixa'],
  especial: ['alta', 'baixa'],
  tiro: ['alta'],
  onda: ['alta']
};

export function guardHolds(move: AttackMove, stance: GuardStance | null): boolean {
  return stance !== null && GUARDS[move].includes(stance);
}

/** Dodge by ducking: the quick punch and the shot pass over a crouching defender. */
export function ducksUnder(move: AttackMove, ducking: boolean): boolean {
  return ducking && (move === 'soco-rapido' || move === 'tiro');
}

/** Projectiles travel under an airborne defender. */
export function jumpsOver(move: AttackMove, airborne: boolean): boolean {
  return airborne && (move === 'tiro' || move === 'onda');
}

/** A heavy punch in progress shrugs off the quick punch (armor); anything else interrupts it. */
export function armorAbsorbs(move: AttackMove, defenderInHeavy: boolean): boolean {
  return defenderInHeavy && move === 'soco-rapido';
}

/** Swept horizontal interval prevents fast bullets/dashes tunneling through hurtboxes. */
export function sweptInterval(previous: number, next: number, radius: number): { x: number; width: number } {
  return { x: Math.min(previous, next)-radius, width: Math.abs(next-previous)+radius*2 };
}
