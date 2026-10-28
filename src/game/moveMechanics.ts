import type { GolpeId } from './golpes';

export interface FighterMoveConfig {
  jump?: JumpFramesConfig;
  /** Down + punch (soco forte): sheet and, optionally, a projectile. */
  heavy?: ProjectileMoveConfig;
  /** Kick button (chute básico): sheet and, optionally, a projectile (the Almirante's shot). */
  kick?: ProjectileMoveConfig;
  special?: ProjectileMoveConfig;
  /** Effect sheets (no hitbox) the moves reference by name, e.g. `"thermal"`. */
  effects?: Record<string, EffectSheetConfig>;
}

export interface EffectSheetConfig {
  file: string;
  frames: number;
  frameRate: number;
  /** -1 loops while the move needs it. */
  repeat?: number;
}

/** Ways out of a special (GDD): jump, duck, or jump while backing away. */
export type SpecialDodge = 'pulo' | 'agachar' | 'pulo-recuando';

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
  /** Projectile: rules tag (`tiro`, `onda`, `nuvem`, `cachimbo`); default `onda` for specials, `tiro` otherwise. */
  move?: string;
  /** Projectile drawn with an effect sheet from `effects`, centred `launchHeight` frame px above the ground. */
  visualEffect?: string;
  launchHeight?: number;
  /** Projectile arc: initial upward speed and gravity (px/s, px/s²); it ends when it falls to the ground. */
  launchVy?: number;
  gravity?: number;
  /** Projectile stops after this many px (a cloud that dissipates). */
  range?: number;
  /** Extra stun (ms) on a clean hit; a valid guard avoids it. */
  stunMs?: number;
  /** Special that skips the charge sheet (its own sheet already winds up). */
  skipCharge?: boolean;
  /** How the defender escapes (advance specials). */
  dodge?: SpecialDodge | string;
  /** No guard holds it. */
  unblockable?: boolean;
  /** Advance (`run`, `hop`, `meteor`): distance from the opponent where it stops and strikes. */
  reach?: number;
  /** `run`: sheet frames repeated while closing in, and the first strike frame. */
  loopFrames?: number[];
  /** `run`: separate sheet (action name) for the approach loop; without it the loop uses the special sheet. */
  approachAction?: string;
  /** `run`: the strike is a pounce: travels and lifts over these frames, landing `pounceReach` short of the target. */
  pounceFrames?: number[];
  pounceHeight?: number;
  pounceReach?: number;
  strikeFrame?: number;
  maxSeconds?: number;
  /** `hop`: frames during which it travels, lift height and the touchdown frame. */
  travelFrames?: number[];
  hopHeight?: number;
  landFrame?: number;
  /** `meteor`: rise, off-screen hold, diagonal dive and ground recovery. */
  riseFrames?: number[];
  riseSpeed?: number;
  holdFrame?: number;
  holdSeconds?: number;
  diveFrames?: number[];
  diveSeconds?: number;
  /** Effects (names from `effects`): during the charge, behind the dive, on contact, with the strike. */
  chargeEffect?: string;
  trailEffect?: string;
  hitEffect?: string;
  effect?: string;
  effectFrame?: number;
  /** Centre of `effect`, in sheet px forward of and above the feet; without it, the old spot near the ground. */
  effectAt?: { x: number; y: number };
}

/** Ground travel inside a normal strike (a slide): frames that move, distance in sheet px, closest it gets to the opponent. */
export interface StrikeTravel {
  /** First and last moving frame. */
  frames: number[];
  distance: number;
  reach?: number;
}

/** Sheet px a strike travels this step: `distance` spread evenly over its frames, nothing outside them. */
export function strikeTravelStep(travel: StrikeTravel, frame: number, frameRate: number, seconds: number): number {
  const [from, to] = travel.frames;
  if (frame < from || frame > to) {
    return 0;
  }
  return (travel.distance * frameRate * seconds) / (to - from + 1);
}

/** A run of frames (first and last) shown for `ms` each, instead of the frame rate. */
export interface FrameTiming {
  frames: number[];
  ms: number;
}

/** Display time of each frame: fast wind-up, held contact, and the frame rate everywhere else. */
export function frameDurations(frameCount: number, frameRate: number, timing: FrameTiming[] | undefined): number[] {
  const durations = Array.from({ length: frameCount }, () => 1000 / frameRate);
  (timing ?? []).forEach(({ frames: [from, to], ms }) => {
    for (let frame = from; frame <= to && frame < frameCount; frame++) durations[frame] = ms;
  });
  return durations;
}

/** Specials that travel toward the opponent instead of playing in place. */
export const ADVANCE_KINDS = ['run', 'hop', 'meteor'];

/** Whether the defender escapes a special the way its JSON says (GDD, "Especiais"). */
export function specialDodged(
  dodge: SpecialDodge | undefined,
  defender: { airborne: boolean; ducking: boolean; movingAway: boolean }
): boolean {
  if (dodge === 'pulo') {
    return defender.airborne;
  }
  if (dodge === 'agachar') {
    return defender.ducking;
  }
  if (dodge === 'pulo-recuando') {
    return defender.airborne && defender.movingAway;
  }
  return false;
}

/** Where an advance stops: `reach` short of the target, never stepping backwards. */
export function advanceStop(from: number, target: number, reach: number): number {
  const dir = Math.sign(target - from) || 1;
  const stop = target - dir * reach;
  return dir > 0 ? Math.max(from, stop) : Math.min(from, stop);
}

/** Meteor dive start: above the screen, back along a 45 degree line that ends on the target. */
export function meteorDiveStart(targetX: number, groundY: number, topY: number, dir: 1 | -1): { x: number; y: number } {
  return { x: targetX - dir * (groundY - topY), y: topY };
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
export type AttackMove = GolpeId | 'tiro' | 'onda' | 'nuvem' | 'cachimbo';

/** Standing guard (`alta`) or crouching guard (`baixa`). */
export type GuardStance = 'alta' | 'baixa';

/** Which guard stops each move (João, 28/10): low kick and heavy punch break the high guard, only the flying kick breaks the low one. */
const GUARDS: Record<AttackMove, GuardStance[]> = {
  'soco-rapido': ['alta', 'baixa'],
  'soco-forte': ['baixa'],
  'chute-basico': ['alta', 'baixa'],
  'chute-baixo': ['baixa'],
  'soco-no-ar': ['alta', 'baixa'],
  voadora: ['alta'],
  especial: ['alta', 'baixa'],
  tiro: ['alta', 'baixa'],
  onda: ['alta', 'baixa'],
  nuvem: ['alta', 'baixa'],
  cachimbo: ['alta', 'baixa']
};

/** Share of the knockback a guarded hit still pushes: blocking a string moves you out of it. */
export const BLOCK_PUSHBACK = 0.6;

/** Stun on a broken guard, replacing the move's own hitstun. */
const GUARD_BREAK_STUN_MS: Record<GuardStance, number> = { alta: 300, baixa: 600 };

export function guardHolds(move: AttackMove, stance: GuardStance | null): boolean {
  return stance !== null && GUARDS[move].includes(stance);
}

/** Stun (ms) when `move` breaks the guard being held; null when there's no guard or it holds. */
export function guardBreakStunMs(move: AttackMove, stance: GuardStance | null): number | null {
  return stance !== null && !guardHolds(move, stance) ? GUARD_BREAK_STUN_MS[stance] : null;
}

/** Dodge by ducking: the quick punch, the shot and the pipe pass over a crouching defender. */
export function ducksUnder(move: AttackMove, ducking: boolean): boolean {
  return ducking && (move === 'soco-rapido' || move === 'tiro' || move === 'cachimbo');
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
