import type { GolpeId } from './golpes';
import type { EsquadraoConfig } from './esquadrao';
import type { ReforcoConfig } from './reforco';
import type { SoproConfig } from './sopro';
import type { FormaConfig } from './forma';
import type { AttackProfile } from './types';

export interface FighterMoveConfig {
  jump?: JumpFramesConfig;
  /** Down + punch (soco forte): sheet and, optionally, a projectile. */
  heavy?: ProjectileMoveConfig;
  /** Kick button (chute básico): sheet and, optionally, a projectile (the Almirante's shot). */
  kick?: ProjectileMoveConfig;
  /** Down + kick (chute baixo): sheet and, optionally, an effect (the Galo's talon). */
  lowKick?: ProjectileMoveConfig;
  special?: ProjectileMoveConfig;
  /** Own dash (the maromba runs faster); a missing side keeps the shared dash. */
  dash?: DashConfig;
  /** Effect sheets (no hitbox) the moves reference by name, e.g. `"thermal"`. */
  effects?: Record<string, EffectSheetConfig>;
}

export interface EffectSheetConfig {
  file: string;
  frames: number;
  frameRate: number;
  /** -1 loops while the move needs it. */
  repeat?: number;
  /** Cell size when it is not the fighter's 256×256 (a text banner, 768×256). */
  frameWidth?: number;
  frameHeight?: number;
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

/** What a carrier drops: an effect sheet that falls straight down and hits as a `queda`. */
export interface DropConfig {
  visualEffect: string;
  /** px/s² (default 1600). */
  gravity?: number;
  hitWidth?: number;
  hitHeight?: number;
  /** Effect played where it lands or hits (splash). */
  hitEffect?: string;
  /** Particles bursting on a hit, to make it obvious. */
  hitParticles?: ParticleBurst[];
  /** Falling on the head (still in the air) stuns this long, dizzy; a mine on the ground does not. */
  stunMs?: number;
  /** Landing without hitting, it stays on the ground as a mine: whoever steps on it takes `damageFactor` of the damage. */
  mine?: { seconds: number; damageFactor: number };
}

/** A burst of square pixels on a hit: falling bits (`gravity` > 0) or rising stink (< 0). */
export interface ParticleBurst {
  colors: string[];
  count?: number;
  /** px/s²; negative rises. Default 900. */
  gravity?: number;
  /** Keeps emitting for this long (a lingering stink) instead of one burst. */
  seconds?: number;
}

export interface ProjectileMoveConfig {
  action?: string;
  kind: string;
  /** `esquadrao`: aliados que atacam no lugar do mascote (src/game/esquadrao.ts). */
  esquadrao?: EsquadraoConfig;
  /** NPC de Guarda: sai do fundo no especial, golpeia uma vez e volta ao posto (src/game/reforco.ts). */
  reforco?: ReforcoConfig;
  /** `sopro`: sobe, paira e varre com um jato contínuo pela boca (src/game/sopro.ts). */
  sopro?: SoproConfig;
  /** `forma`: no fim do especial vira outro lutador (a forma dele) por um tempo (src/game/forma.ts). */
  forma?: FormaConfig;
  startFrame?: number;
  endFrame?: number;
  releaseFrame?: number;
  /**
   * Several shots in one action (the two pistols): one projectile per entry, at
   * its frame, from its own muzzle (frame px above the ground and ahead of the
   * fighter). Replaces `releaseFrame`.
   */
  releases?: ShotRelease[];
  speed?: number;
  visualFile?: string;
  visualFrames?: number;
  visualFrameRate?: number;
  visualScale?: number;
  /** Distance-based growth, capped after the configured travel distance. */
  growth?: { distance: number; sizeMultiplier: number; damageMultiplier: number; maxStunMs: number };
  hitWidth?: number;
  hitHeight?: number;
  persistOnHit?: boolean;
  /** Projectile: rules tag (`tiro`, `onda`, `nuvem`, `cachimbo`); default `onda` for specials, `tiro` otherwise. */
  move?: string;
  /** Projectile drawn with an effect sheet from `effects`, centred `launchHeight` frame px above the ground. */
  visualEffect?: string;
  launchHeight?: number;
  /** Frame px ahead of the fighter where the effect's centre starts (default 70); a wide jet starts at the mouth. */
  launchForward?: number;
  /** Projectile arc: initial upward speed and gravity (px/s, px/s²); it ends when it falls to the ground. */
  launchVy?: number;
  gravity?: number;
  /** `behind`: the projectile enters from off-screen behind the fighter and sails past them. */
  spawnFrom?: 'behind' | string;
  /** Projectile: `false` keeps the effect unmirrored when facing right (readable text). */
  mirror?: boolean;
  /**
   * Carrier (the Biriba on balloons): it hits no one; when it passes over
   * where the opponent stood the moment the move was called, it drops this.
   * While a carrier is on screen the move can't be called again.
   */
  drop?: DropConfig;
  /** Projectile stops after this many px (a cloud that dissipates). */
  range?: number;
  /** With `persistOnHit`: px it still drifts after the hit, over the target, its sheet stretched to fade there. */
  rangeAfterHit?: number;
  /** Extra stun (ms) on a clean hit; a valid guard avoids it. */
  stunMs?: number;
  /** Special that skips the charge sheet (its own sheet already winds up). */
  skipCharge?: boolean;
  /** How the defender escapes (advance specials). */
  dodge?: SpecialDodge | string;
  /** No guard holds it. */
  unblockable?: boolean;
  /** Advance special no hit interrupts: it only takes health; only the `dodge` escapes it (the Bira run). */
  imparavel?: boolean;
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
  /** Particles bursting where the projectile hits. */
  hitParticles?: ParticleBurst[];
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

/**
 * Sheet px a strike travels this step: each frame of the window moves an equal
 * share of `distance` over its own display time (`timing` may stretch it),
 * nothing outside the window.
 */
export function strikeTravelStep(travel: StrikeTravel, frame: number, frameMs: number, seconds: number): number {
  const [from, to] = travel.frames;
  if (frame < from || frame > to) {
    return 0;
  }
  return (travel.distance * seconds * 1000) / (frameMs * (to - from + 1));
}

/** A run of frames (first and last) shown for `ms` each, instead of the frame rate. */
export interface ShotRelease {
  frame: number;
  height?: number;
  forward?: number;
}

/** The shots an action lets go of, in order: `releases`, or the single `releaseFrame` (default 3). */
export function shotReleases(move: Pick<ProjectileMoveConfig, 'releases' | 'releaseFrame'>): ShotRelease[] {
  return move.releases?.length ? move.releases : [{ frame: move.releaseFrame ?? 3 }];
}

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
export type AttackMove = GolpeId | 'tiro' | 'onda' | 'nuvem' | 'cachimbo' | 'queda';

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
  cachimbo: ['alta', 'baixa'],
  // Falls from above (the Biriba's drop): no guard holds it, only leaving the spot.
  queda: []
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

/** Dash (GDD, 29/10/2026): two taps of the same direction within this window. */
export const DASH_DOUBLE_TAP_SECONDS = 0.3;
/** Dash travel in world px and its duration; the back dash is a shorter hop. */
export const DASH_FORWARD = { distance: 180, seconds: 0.28 };
export const DASH_BACK = { distance: 120, seconds: 0.22 };
export interface DashMove { distance: number; seconds: number }
export interface DashConfig { forward?: DashMove; back?: DashMove }

/** The fighter's own dash for that side, or the shared one. */
export function dashConfig(dash: DashConfig | undefined, forward: boolean): DashMove {
  return (forward ? dash?.forward : dash?.back) ?? (forward ? DASH_FORWARD : DASH_BACK);
}
/** A forward dash stops this far (world px, centre to centre) from the opponent instead of crossing through. */
export const DASH_STOP_GAP = 120;

/** Spots a double tap: fed the held direction (-1, 0, 1) every frame. */
export class DoubleTapDetector {
  private held = 0;
  private lastTap = { direction: 0, at: -Infinity };

  /** Returns the direction of a double tap completed this frame, or 0. */
  feed(direction: number, now: number): number {
    const pressed = direction !== 0 && direction !== this.held;
    this.held = direction;
    if (!pressed) {
      return 0;
    }
    const double = this.lastTap.direction === direction && now - this.lastTap.at <= DASH_DOUBLE_TAP_SECONDS;
    // A completed double tap starts over: a third tap needs a fourth.
    this.lastTap = double ? { direction: 0, at: -Infinity } : { direction, at: now };
    return double ? direction : 0;
  }
}

/** Perfect guard (GDD, 29/10/2026): the guard was pressed at most this long before the hit landed. */
export const PERFECT_GUARD_SECONDS = 0.15;
/** How long a perfect guard leaves the attacker dizzy (João, 29/10/2026: the `stunned` loop, 0.8 s). */
export const PERFECT_GUARD_STUN_MS = 800;
/** What the attacker takes on a perfect guard: no damage, no push, the dizzy loop for {@link PERFECT_GUARD_STUN_MS}. */
export const PERFECT_GUARD_STAGGER: AttackProfile = {
  kind: 'high',
  height: 'high',
  damage: 0,
  knockback: 0,
  hitstun: 0,
  stunMs: PERFECT_GUARD_STUN_MS
};

/**
 * A guard that holds a melee hit right after being pressed is perfect. Projectiles
 * are only ever blocked: stunning a shooter across the screen would make shooting a trap.
 * @param blocked - The guard held this hit.
 * @param projectile - The hit is a projectile.
 * @param guardHeldSeconds - How long the guard has been held; null when it isn't.
 */
export function isPerfectGuard(blocked: boolean, projectile: boolean, guardHeldSeconds: number | null): boolean {
  return blocked && !projectile && guardHeldSeconds !== null && guardHeldSeconds <= PERFECT_GUARD_SECONDS;
}

/** Dodge by ducking: the quick punch, the shot and the pipe pass over a crouching defender. */
export function ducksUnder(move: AttackMove, ducking: boolean): boolean {
  return ducking && (move === 'soco-rapido' || move === 'tiro' || move === 'cachimbo');
}

/** Projectiles travel under an airborne defender. */
export function jumpsOver(move: AttackMove, airborne: boolean): boolean {
  return airborne && (move === 'tiro' || move === 'onda');
}

/**
 * A heavy punch in progress shrugs off the quick punch (armor); anything else
 * interrupts it. An unstoppable special shrugs off every hit.
 */
export function armorAbsorbs(move: AttackMove, defenderInHeavy: boolean, defenderImparavel = false): boolean {
  return defenderImparavel || (defenderInHeavy && move === 'soco-rapido');
}

/** Swept horizontal interval prevents fast bullets/dashes tunneling through hurtboxes. */
export function sweptInterval(previous: number, next: number, radius: number): { x: number; width: number } {
  return { x: Math.min(previous, next)-radius, width: Math.abs(next-previous)+radius*2 };
}

/** Bounded growth based on distance actually travelled, independent of facing. */
export function projectileGrowthProgress(distance: number, maximum: number): number {
  return Math.max(0, Math.min(1, Math.abs(distance) / Math.max(1, maximum)));
}

/**
 * A carrier crossing the stage reached the drop point this frame.
 * @param previousX - Where it was last frame.
 * @param x - Where it is now.
 * @param targetX - Where the opponent stood when the move was called.
 * @param facing - Direction it flies (1 right, -1 left).
 */
export function passedDropPoint(previousX: number, x: number, targetX: number, facing: 1 | -1): boolean {
  return facing * (previousX - targetX) < 0 && facing * (x - targetX) >= 0;
}
