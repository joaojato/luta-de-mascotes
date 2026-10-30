import * as Phaser from 'phaser';

import type { AppContext } from './context';
import { FIGHTER_BOUNDS_FIELDS, getAttackProfile, getFighterCombat, getFighterStats } from './fighterConfig';
import {
  findCharacterAnimationKeyByAction,
  getCharacterAnimationDefinition,
  getCharacterDefinition,
  resolveHeroBoundsFrame,
  type CharacterDefinition,
  type HeroAnimationDefinition,
  type HeroBoundsFrame
} from './hero';
import { spawnChargeAura } from './vfx';
import { somDoEvento, tocarSom } from './sons';
import { Esquadrao } from './esquadrao';
import { acertoDoSopro, amostraDoSopro, direcaoDoSopro, type SoproConfig } from './sopro';
import {
  passedDropPoint,
  projectileGrowthProgress,
  dashPosition,
  jumpFlightFrame,
  jumpFrames,
  sweptInterval,
  ADVANCE_KINDS,
  BLOCK_PUSHBACK,
  advanceStop,
  DASH_BACK,
  DASH_FORWARD,
  DASH_STOP_GAP,
  DoubleTapDetector,
  meteorDiveStart,
  strikeTravelStep,
  type AttackMove,
  type SpecialDodge,
  type GuardStance,
  type JumpFrames,
  type DropConfig,
  type ParticleBurst,
  type ProjectileMoveConfig
} from './moveMechanics';
import type {
  AttackKind,
  AttackProfile,
  FighterBoundsVisibility,
  FighterCombat,
  FighterStats,
  Rect
} from './types';

/** Deceleration applied to knockback velocity, in px/s^2. */
const KNOCKBACK_FRICTION = 720;
/** Blockstun duration when an attack is guarded, in seconds. */
const BLOCKSTUN_SECONDS = 0.14;

/** Full meter value; a special requires (and consumes) a full bar. */
const METER_MAX = 100;
/** Meter gained by the attacker when a normal attack lands. */
const METER_GAIN_ON_HIT = 12;
/** Meter gained by the defender when taking a hit. */
const METER_GAIN_ON_TAKE = 7;
/** Meter gained by both sides on a blocked hit. */
const METER_GAIN_ON_BLOCK = 4;
/** A powder cloud is drawn above both fighters (they swap between depth 5 and 8), below the HUD. */
const CLOUD_DEPTH = 20;
/**
 * After the charge wind-up completes, the fighter holds the charged pose for this
 * long before the special executes — the "super freeze" that lets the charged
 * pose read before the move launches.
 */
const SUPER_FREEZE_MS = 360;
/** Each wind-up frame of a jump, still on the ground, lasts this long. */
const JUMP_WINDUP_FRAME_SECONDS = 0.05;
/** Recovery squat held after touchdown before the fighter can act again. */
const JUMP_LANDING_SECONDS = 0.1;
/** Flying kick: the dive forward and down the moment the kick comes out. */
const FLYING_KICK_SPEED_X = 380;
const FLYING_KICK_DROP = 300;
/** Minimum gap between two pain grunts (ms): a combo grunts once, not every hit. */
const PAIN_COOLDOWN_MS = 350;
/** Damage profile of each catalog move (Ajustes tab edits these per fighter). */
const ATTACK_KIND_OF: Record<AttackMove, AttackKind> = {
  'soco-rapido': 'high',
  'soco-no-ar': 'high',
  'soco-forte': 'low',
  'chute-basico': 'kick',
  voadora: 'kick',
  'chute-baixo': 'lowKick',
  especial: 'special',
  tiro: 'low',
  onda: 'special',
  nuvem: 'special',
  cachimbo: 'kick',
  queda: 'kick'
};

/**
 * A live attack from a fighter on its current animation frame: the world-space
 * attack rectangle, the resolved damage/knockback/hitstun profile, and a
 * per-swing signature so a single swing only connects once.
 */
export interface ActiveAttack {
  facing?: 1 | -1;
  /** Which move this is: decides guard, dodge and armor rules (moveMechanics). */
  move: AttackMove;
  /** Special only: how the defender escapes it, and whether guard is useless. */
  dodge?: SpecialDodge;
  unblockable?: boolean;
  /** A traveling shot (pipe, wave, powder cloud): only ever blocked, never perfect-guarded. */
  projectile?: boolean;
  rect: Phaser.Geom.Rectangle;
  profile: AttackProfile;
  signature: number;
  /** True when this is the final hit window of a special (the combo finisher). */
  finisher: boolean;
}

interface TravelingProjectile {
  x: number;
  previousX: number;
  y: number;
  /** Vertical speed and gravity of an arcing projectile (0 for a straight one). */
  vy: number;
  gravity: number;
  floorY: number;
  facing: 1 | -1;
  life: number;
  signature: number;
  speed: number;
  width: number;
  height: number;
  profile: AttackProfile;
  move: AttackMove;
  connected: boolean;
  persistOnHit: boolean;
  rangeAfterHit: number;
  growth?: ProjectileMoveConfig['growth'];
  travelled: number;
  initial: { width: number; height: number; scale: number; damage: number; stunMs: number };
  visual: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Sprite;
  /** Carrier (the Biriba on balloons): hits no one, drops `drop` over `targetX`. */
  carrier?: { drop: DropConfig; targetX: number; dropped: boolean };
  /** No guard holds it (what the carrier drops). */
  unblockable?: boolean;
  /** Effect where it lands or hits (splash). */
  hitEffect?: string;
  hitParticles?: ParticleBurst[];
  /** Turns into a ground mine on landing; `armed` once it has. */
  mine?: { seconds: number; damageFactor: number; armed: boolean };
}

/** Dizzy stars over the head: one effect for every fighter, not drawn in each sheet. */
const TONTURA_KEY = 'fx-tontura';

const BOUNDS_ALPHA_ACTIVE = 0.95;
const BOUNDS_ALPHA_INACTIVE = 0.28;

// Frame pixels between the anchor baseline (frame bottom, ~255) and the visible
// feet. Used to seat the ground shadow under the feet rather than the padded
// frame bottom, so fighters don't appear to float above their shadow.
const SHADOW_FOOT_OFFSET = 24;

const BOUNDS_COLORS: Record<keyof FighterBoundsVisibility, number> = Object.fromEntries(
  FIGHTER_BOUNDS_FIELDS.map((field) => [field.id, Number.parseInt(field.color.slice(1), 16)])
) as Record<keyof FighterBoundsVisibility, number>;

/**
 * A per-frame snapshot of a fighter's intent. Held inputs (`left`, `right`,
 * `crouch`, `block`) describe the current key state; edge inputs (`jump`,
 * `light`, `heavy`) are true only on the frame the action was triggered.
 */
export interface FighterInput {
  left: boolean;
  right: boolean;
  crouch: boolean;
  block: boolean;
  jump: boolean;
  light: boolean;
  heavy: boolean;
  special: boolean;
}

/** A neutral (no-op) input snapshot. */
export const NEUTRAL_FIGHTER_INPUT: FighterInput = {
  left: false,
  right: false,
  crouch: false,
  block: false,
  jump: false,
  light: false,
  heavy: false,
  special: false
};

interface FighterActionKeys {
  idle: string;
  walkForward: string;
  walkBackward: string;
  crouch: string;
  jump: string;
  blockHigh: string;
  blockLow: string;
  hitHigh: string;
  /** Dizzy loop for a long stun (`stunned`, or the hit reaction meanwhile). */
  stunned: string;
  lightPunch: string;
  /** Down + punch (`heavy-punch`; the JSON may pick another sheet, e.g. a shot). */
  heavyPunch: string;
  /** Kick button (`heavy-kick`). */
  kick: string;
  /** Down + kick (`low-kick`, or the kick meanwhile). */
  lowKick: string;
  /** Punch in the air (`jump-punch`, or the light punch meanwhile). */
  airLight: string;
  /** Kick in the air: the flying kick (`jump-kick`, or the kick meanwhile). */
  airKick: string;
  specialCharge: string;
  special: string;
  knockdown: string;
  /** Dash sheets (`dash-forward`, `dash-back`), or the walk meanwhile. */
  dashForward: string;
  dashBack: string;
}

/**
 * Construction options for a {@link Fighter}: which scene/character to build,
 * where it stands, which way it faces, and its horizontal movement bounds.
 */
export interface FighterOptions {
  scene: Phaser.Scene;
  app: AppContext;
  characterId: string;
  x: number;
  groundY: number;
  facing: 1 | -1;
  minX: number;
  maxX: number;
  depth?: number;
  /**
   * Invoked the moment a meter special begins (the charge wind-up). Hosts use it
   * to trigger the super cut-in cinematic.
   */
  onSpecialStart?: (fighter: Fighter) => void;
}

/**
 * A self-contained, input-driven fighter actor: sprite + ground shadow + a
 * grounded/airborne state machine. The host scene feeds it a {@link FighterInput}
 * each frame, so the same entity backs both human and CPU opponents. Movement
 * and physics stats are read from the persisted fighter balance.
 */
export class Fighter {
  private readonly scene: Phaser.Scene;
  private readonly app: AppContext;
  private readonly character: CharacterDefinition;
  private readonly actionKeys: FighterActionKeys;
  private facing: 1 | -1;
  private minX: number;
  private maxX: number;
  private projectileMinX: number;
  private projectileMaxX: number;
  private readonly groundY: number;

  private sprite!: Phaser.GameObjects.Sprite;
  private shadow!: Phaser.GameObjects.Ellipse;
  private boundsGraphics!: Phaser.GameObjects.Graphics;
  private depthBase = 5;
  private posX: number;
  private velocityY = 0;
  private jumpPhase: 'prepare' | 'air' | 'attack' | 'land' | null = null;
  private jumpClock = 0;
  private airAttackUsed = false;
  /** Advance special in progress (run / hop / meteor): phase and path. */
  private advance: {
    move: ProjectileMoveConfig;
    phase: 'run' | 'strike' | 'hop' | 'rise' | 'hold' | 'dive' | 'recover';
    clock: number;
    fromX: number;
    toX: number;
    fromY: number;
    dir: 1 | -1;
  } | null = null;
  private opponent: Fighter | null = null;

  /** Aliados do especial `esquadrao` (os Gaviões do Mosqueteiro), se o mascote tiver. */
  private esquadrao: Esquadrao | null = null;
  /** Especial `sopro` em andamento (o Dragão): fase, relógio, o jato e o ponto que encosta no oponente. */
  private sopro: {
    cfg: SoproConfig;
    fase: 'subida' | 'varredura' | 'descida';
    relogio: number;
    lado: 1 | -1;
    jato: Phaser.GameObjects.Sprite | null;
    contato: Phaser.Geom.Rectangle | null;
  } | null = null;
  private previousX = 0;
  private lastDx = 0;
  /** Effect sprites that live while a phase lasts (thermal column, dive trail). */
  private chargeFx: Phaser.GameObjects.Sprite | null = null;
  private trailFx: Phaser.GameObjects.Sprite | null = null;
  private lastAttackRect: Phaser.Geom.Rectangle | null = null;
  /** The catalog move being thrown (several moves may share one sheet). */
  private strike: AttackMove | null = null;
  /** Strike pressed during the jump wind-up, thrown as soon as the feet leave the ground. */
  private bufferedAirAttack: 'light' | 'heavy' | null = null;
  private diveVelX = 0;
  private specialClock = 0;
  private dashFrom = 0;
  private dashTo = 0;
  private previousSpecialX = 0;
  private shotReleased = false;
  private projectiles: TravelingProjectile[] = [];
  private grounded = true;
  private locked = false;
  private frozen = true;
  private currentAnimKey = '';
  private currentReverse = false;

  private maxHealth: number;
  private health: number;
  private hitstunTimer = 0;
  private stunIsBlock = false;
  private stunBlockLow = false;
  /** The current stun came from `stunMs` (powder, meteor): dizzy loop instead of the hit reaction. */
  private stunIsDizzy = false;
  /** Dizzy stars over the head (`fx-tontura`), created the first time it is needed. */
  private tontura: Phaser.GameObjects.Sprite | null = null;
  /** Where the opponent stood when a dropping move (the Biriba) was called. */
  private dropTargetX: number | null = null;
  /** Seconds walked since the last step sound. */
  private stepClock = 0;

  /** When the last pain grunt played (scene ms): a combo doesn't grunt every hit. */
  private lastPainAt = -Infinity;
  /** Seconds the guard button has been held; null when released. */
  private guardHeld: number | null = null;
  /** Fighter clock (s) and the double tap that starts a dash. */
  private clock = 0;
  private readonly doubleTap = new DoubleTapDetector();
  private dashTap = 0;
  private dash: { dir: 1 | -1; elapsed: number; seconds: number; distance: number } | null = null;
  /** Where the opponent stands (from `faceToward`): a forward dash stops against it. */
  private opponentX: number | null = null;
  private knockbackVel = 0;
  /** The strike in progress touched the opponent (hit or guard): only then a quick punch chains. */
  private strikeLanded = false;
  private defeated = false;
  private attackId = 0;
  private attackConnected = true;
  // Multi-hit: each contiguous run of attack-active frames is one hit window.
  // When the attack box turns on after being off, a new window opens so the
  // swing can connect again — this is how a special lands several hits.
  private attackActiveLast = false;
  private meter = 0;
  private appliedScale = 0;
  private readonly hasSpecial: boolean;
  /** Crouch poses that duck under high strikes (only actions the sheet really has). */
  private readonly duckKeys: Set<string>;
  private readonly onSpecialStart?: (fighter: Fighter) => void;

  constructor(options: FighterOptions) {
    this.scene = options.scene;
    this.app = options.app;
    this.onSpecialStart = options.onSpecialStart;
    this.character = getCharacterDefinition(options.characterId);
    this.facing = options.facing;
    this.minX = options.minX;
    this.maxX = options.maxX;
    this.projectileMinX = options.minX;
    this.projectileMaxX = options.maxX;
    this.groundY = options.groundY;
    this.posX = Phaser.Math.Clamp(options.x, options.minX, options.maxX);
    this.actionKeys = this.resolveActionKeys();
    this.hasSpecial = findCharacterAnimationKeyByAction(this.character.id, 'special') !== null;
    this.duckKeys = new Set(
      ['crouch', 'block-low']
        .map((action) => findCharacterAnimationKeyByAction(this.character.id, action))
        .filter((key): key is string => key !== null)
    );
    this.maxHealth = this.combat().maxHealth;
    this.health = this.maxHealth;
    this.build(options.depth ?? 5);
  }

  /** The fighter's id. */
  get characterId(): string {
    return this.character.id;
  }

  /** The fighter's display label. */
  get label(): string {
    return this.character.label;
  }

  /** The fighter's current horizontal centre in world pixels. */
  get x(): number {
    return this.posX;
  }

  /** The direction the fighter is facing (+1 right, -1 left). */
  get facingDirection(): 1 | -1 {
    return this.facing;
  }

  /** The fighter's current health. */
  get health01(): number {
    return this.maxHealth > 0 ? Phaser.Math.Clamp(this.health / this.maxHealth, 0, 1) : 0;
  }

  /** Whether the fighter has been knocked out this round. */
  get isDefeated(): boolean {
    return this.defeated;
  }

  /** The other fighter: advance specials run toward it. */
  setOpponent(opponent: Fighter): void {
    this.opponent = opponent;
  }

  /** Whether the last step moved this fighter away from `x`. */
  isMovingAwayFrom(x: number): boolean {
    return this.lastDx !== 0 && Math.sign(this.lastDx) === Math.sign(this.posX - x);
  }

  /** How long the guard button has been held (perfect guard window); null when released. */
  get guardHeldSeconds(): number | null {
    return this.guardHeld;
  }

  /** Still reeling from a hit (hitstun or a powder stun), unable to act. */
  get isStunned(): boolean {
    return this.hitstunTimer > 0;
  }

  /** Whether the fighter is off the ground (projectiles pass under). */
  get isAirborne(): boolean {
    return !this.grounded;
  }

  /** The guard being held: standing (`alta`), crouching (`baixa`) or none. */
  get guardStance(): GuardStance | null {
    if (this.defeated) {
      return null;
    }
    if (this.currentAnimKey === this.actionKeys.blockLow && this.duckKeys.has(this.actionKeys.blockLow)) {
      return 'baixa';
    }
    return this.currentAnimKey === this.actionKeys.blockHigh ? 'alta' : null;
  }

  /** Mid heavy on the ground: the quick punch bounces off (armor). */
  get isInHeavy(): boolean {
    return this.grounded && this.locked && this.strike === 'soco-forte';
  }

  /** In the middle of a strike or a special (what the CPU reads as an attack coming). */
  get isAttacking(): boolean {
    if (this.defeated || !this.locked) return false;
    return this.strike !== null || this.currentAnimKey === this.actionKeys.specialCharge || this.currentAnimKey === this.actionKeys.special;
  }

  /** Something of his is flying at the other fighter: a shot, a drop, the allies of an esquadrão. */
  get hasThreatInFlight(): boolean {
    return this.projectiles.some((shot) => !shot.connected) || !(this.esquadrao?.pronto ?? true);
  }

  /** Pinned against a stage edge: the attacker is the one pushed back. */
  get atWall(): boolean {
    return this.posX <= this.minX + 1 || this.posX >= this.maxX - 1;
  }

  /**
   * Pushes the fighter without stunning it (the attacker recoiling off a
   * cornered defender).
   * @param velocity - Horizontal push in px/s; friction brings it to rest.
   */
  recoil(velocity: number): void {
    if (!this.defeated) this.knockbackVel = velocity;
  }

  /** Whether the fighter is crouching on the ground (with or without guard). */
  get isDucking(): boolean {
    return this.grounded && !this.defeated && this.duckKeys.has(this.currentAnimKey);
  }

  /** The fighter's special meter charge (0..1). */
  get meter01(): number {
    return METER_MAX > 0 ? Phaser.Math.Clamp(this.meter / METER_MAX, 0, 1) : 0;
  }

  /** Whether the special meter is full and a special can be performed. */
  get isMeterReady(): boolean {
    return this.hasSpecial && this.meter >= METER_MAX;
  }

  /**
   * Adds charge to the special meter (clamped to full). Called by the match when
   * this fighter deals, blocks, or takes a hit.
   * @param amount - Meter points to add.
   */
  gainMeter(amount: number): void {
    if (this.defeated) {
      return;
    }

    const wasFull = this.meter >= METER_MAX;
    this.meter = Phaser.Math.Clamp(this.meter + amount, 0, METER_MAX);
    if (!wasFull && this.meter >= METER_MAX && this.hasSpecial) this.som('especial-pronto', 'especial-pronto');
  }

  /**
   * Awards meter for landing an attack. Special moves grant no meter (so they
   * can't refill themselves); normal hits grant more than guarded ones.
   * @param blocked - Whether the attack was guarded by the defender.
   * @param isSpecial - Whether the attack was a special move.
   */
  registerOffense(blocked: boolean, isSpecial: boolean): void {
    if (isSpecial) {
      return;
    }

    this.gainMeter(blocked ? METER_GAIN_ON_BLOCK : METER_GAIN_ON_HIT);
  }

  /**
   * Awards meter for being struck. Taking a clean hit builds more than blocking.
   * @param blocked - Whether the incoming attack was guarded.
   */
  registerDefense(blocked: boolean): void {
    this.gainMeter(blocked ? METER_GAIN_ON_BLOCK : METER_GAIN_ON_TAKE);
  }

  /** Tops the special meter to full (used by the playground's debug fill toggle). */
  fillMeter(): void {
    this.meter = METER_MAX;
  }

  /**
   * Gradually restores health toward full without clearing hitstun/knockback,
   * so a training dummy visibly takes damage and then recovers between hits.
   * @param amount - Health points to restore this tick.
   */
  regenHealth(amount: number): void {
    if (!this.defeated) {
      this.health = Math.min(this.maxHealth, this.health + amount);
    }
  }

  /**
   * Live-updates the display scale (sprite + ground shadow) so playground scale
   * tuning is reflected without rebuilding the fighter.
   * @param scale - The desired display scale.
   */
  setVisualScale(scale: number): void {
    if (this.appliedScale === scale) {
      return;
    }

    this.appliedScale = scale;
    this.sprite.setScale(scale);
    this.shadow.setSize(Math.round(107 * scale), Math.round(24 * scale));
    this.shadow.y = this.groundY - SHADOW_FOOT_OFFSET * scale;
    this.updateShadow();
  }

  /**
   * Sets the base render depth, restacking the sprite, shadow, and bounds
   * overlay together. Used to bring the most recently active fighter in front.
   * @param base - The base depth for the sprite.
   */
  setDepthBase(base: number): void {
    if (this.depthBase === base) {
      return;
    }

    this.depthBase = base;
    this.applyDepths();
  }

  /**
   * Turns the fighter to face a target x (e.g. the opponent), flipping the
   * sprite and — via the shared transform — its bounds. Skipped while mid
   * one-shot action and within a small deadzone to avoid jitter on overlap.
   * @param targetX - The world x the fighter should face toward.
   */
  faceToward(targetX: number): void {
    this.opponentX = targetX;
    if (this.locked) {
      return;
    }

    const delta = targetX - this.posX;
    if (Math.abs(delta) < 12) {
      return;
    }

    const desired: 1 | -1 = delta >= 0 ? 1 : -1;
    if (desired !== this.facing) {
      this.facing = desired;
      this.sprite.setFlipX(this.facing === 1);
    }
  }

  /**
   * Freezes or unfreezes the fighter. While frozen it holds the idle pose and
   * ignores all input (used during the round intro).
   * @param frozen - Whether the fighter should be frozen.
   */
  setFrozen(frozen: boolean): void {
    if (frozen) this.clearProjectile();
    this.frozen = frozen;
  }

  /**
   * Updates the fighter's horizontal movement limits and immediately re-clamps
   * the current position into the new range. Used by the match camera to turn
   * the visible screen edges into walls (and the stage ends into corners).
   * @param minX - The leftmost centre the fighter may occupy, in world pixels.
   * @param maxX - The rightmost centre the fighter may occupy, in world pixels.
   */
  setHorizontalBounds(minX: number, maxX: number): void {
    this.minX = minX;
    this.maxX = Math.max(minX, maxX);
    this.posX = Phaser.Math.Clamp(this.posX, this.minX, this.maxX);
    this.sprite.x = this.posX;
    this.shadow.x = this.posX;
  }

  /** Projectiles traverse the stage, independently of the camera's fighter walls. */
  setProjectileBounds(minX: number, maxX: number): void {
    this.projectileMinX = minX;
    this.projectileMaxX = Math.max(minX, maxX);
  }

  /**
   * The fighter's currently active attack (if any): present only while a strike
   * animation is on an attack-active frame and the swing hasn't connected yet.
   */
  getActiveAttack(): ActiveAttack | null {
    const contato = this.defeated ? null : this.esquadrao?.contato();
    if (contato) {
      const especial = this.character.moves?.special?.esquadrao;
      return {
        rect: contato.rect,
        // Contato baixo e curto. Os seguidores (sem guarda) atordoam pouco: o
        // oponente volta a andar e pular entre um e outro, e eles vão atrás.
        profile: { ...getAttackProfile(this.combat(), 'special'), damage: especial?.dano ?? 8, knockback: 40, hitstun: contato.bloqueavel ? 650 : 220 },
        signature: contato.assinatura, move: 'especial', finisher: contato.ultimo, facing: contato.lado,
        projectile: true, unblockable: !contato.bloqueavel
      };
    }
    if (this.sopro?.contato && !this.attackConnected && !this.defeated) {
      // O jato não tem guarda que segure: escapa quem foi para baixo do mascote.
      return {
        rect: this.sopro.contato, profile: getAttackProfile(this.combat(), 'special'), signature: this.attackId,
        move: 'especial', finisher: true, facing: this.sopro.lado, projectile: true, unblockable: true
      };
    }
    const shot = this.projectiles.find(projectile => !projectile.connected && !projectile.carrier);
    if (shot && !this.defeated) {
      const sweep = sweptInterval(shot.previousX, shot.x, shot.width/2);
      return { rect: new Phaser.Geom.Rectangle(sweep.x, shot.y-shot.height/2, sweep.width, shot.height),
        profile: shot.profile, signature: shot.signature, move: shot.move,
        finisher: shot.profile.kind === 'special', facing: shot.facing, projectile: true, unblockable: shot.unblockable };
    }
    if (this.currentAnimKey === this.actionKeys.special && this.character.moves?.special?.kind === 'projectile') {
      return null;
    }
    if (this.strikeMove()?.kind === 'projectile') return null;
    if (this.attackConnected || this.defeated) {
      return null;
    }

    const kind = this.currentAttackKind();
    if (kind === null) {
      return null;
    }

    const animation = this.currentAnimation();
    if (!animation) {
      return null;
    }

    const frame = this.resolvedFrame(animation);
    if (!frame?.attack) {
      return null;
    }

    const frameIndex = this.currentFrameIndex(animation);
    const finisher = kind === 'special' && !this.hasAttackFrameAfter(animation, frameIndex);

    const attackRect = this.frameRectToWorld(animation, frame.attack);
    this.lastAttackRect = attackRect;
    if (kind === 'special' && this.character.moves?.special?.kind === 'dash') {
      const sweep = sweptInterval(this.previousSpecialX, this.posX, attackRect.width/2);
      attackRect.x = sweep.x;
      attackRect.width = sweep.width;
    }
    return {
      rect: attackRect,
      profile: {
        ...getAttackProfile(this.combat(), kind),
        stunMs: kind === 'special' ? this.character.moves?.special?.stunMs : undefined
      },
      signature: this.attackId,
      finisher,
      move: this.currentMove(),
      dodge: kind === 'special' ? (this.character.moves?.special?.dodge as SpecialDodge | undefined) : undefined,
      unblockable: kind === 'special' && Boolean(this.character.moves?.special?.unblockable)
    };
  }

  /** Marks the current swing as having connected so it can't hit again. */
  markAttackConnected(signature?: number, blocked = false): void {
    if (signature !== undefined && this.esquadrao?.confirmar(signature, blocked)) return;
    const shot = this.projectiles.find(projectile => !projectile.connected && !projectile.carrier && (signature === undefined || projectile.signature === signature));
    if (shot) {
      shot.connected = true;
      if (shot.hitEffect) this.spawnEffect(shot.hitEffect, shot.x, shot.y + shot.height / 2);
      if (shot.hitParticles) this.burstParticles(shot.x, shot.y + shot.height / 2, shot.hitParticles);
      this.som('projetil-acerto', null);
      if (!shot.persistOnHit) {
        shot.visual.destroy();
        this.projectiles = this.projectiles.filter(projectile => projectile !== shot);
      } else if (shot.rangeAfterHit > 0) {
        // The cloud wraps the target: it drifts on and its remaining frames fade over that stretch.
        const drift = shot.rangeAfterHit / shot.speed;
        const anims = 'anims' in shot.visual ? shot.visual.anims : null;
        const left = anims?.currentAnim
          ? (anims.currentAnim.frames.length - (anims.currentFrame?.index ?? 1) + 1) / anims.currentAnim.frameRate
          : 0;
        if (anims && left > 0) anims.timeScale = left / drift;
        shot.life = Math.max(shot.life, drift);
      }
      return;
    }
    this.attackConnected = true;
    this.strikeLanded = true;
    const hitEffect = this.character.moves?.special?.hitEffect;
    if (hitEffect && this.currentAnimKey === this.actionKeys.special && this.lastAttackRect) {
      const center = Phaser.Geom.Rectangle.GetCenter(this.lastAttackRect);
      this.spawnEffect(hitEffect, center.x, center.y + this.lastAttackRect.height / 2);
    }
  }

  /**
   * Briefly tints the sprite to telegraph an impact (red for a clean hit, blue
   * for a guarded one).
   * @param blocked - Whether the hit was blocked.
   */
  flashHit(blocked: boolean): void {
    this.sprite.setTint(blocked ? 0x93c5fd : 0xff7a7a);
    this.scene.time.delayedCall(100, () => this.sprite?.clearTint());
  }

  /**
   * The fighter's current hurtbox in world space (the active frame's hit box,
   * falling back to its visual box), or null when unavailable.
   */
  getHurtRect(): Phaser.Geom.Rectangle | null {
    const animation = this.currentAnimation();
    if (!animation) {
      return null;
    }

    const frame = this.resolvedFrame(animation);
    const rect = frame?.hit ?? frame?.visual;

    return rect ? this.frameRectToWorld(animation, rect) : null;
  }

  /**
   * The fighter's active guard box in world space — the current frame's `guard`
   * rect, present only while a block pose is held (and the fighter isn't
   * defeated). An attack is blocked when its hitbox overlaps this rect; null
   * means the fighter isn't guarding and any connecting attack will hit.
   */
  getGuardRect(): Phaser.Geom.Rectangle | null {
    if (this.defeated) {
      return null;
    }

    const animation = this.currentAnimation();
    if (!animation) {
      return null;
    }

    const frame = this.resolvedFrame(animation);

    return frame?.guard ? this.frameRectToWorld(animation, frame.guard) : null;
  }

  /**
   * Applies a connected hit: blocked hits deal no damage and apply short
   * blockstun + light pushback; unblocked hits deal damage, hitstun, and
   * knockback, triggering a knockdown when health reaches zero.
   * @param profile - The attack profile that landed.
   * @param attackerFacing - The attacker's facing (push direction).
   * @param blocked - Whether the defender guarded the attack.
   * @param armored - The defender's heavy absorbs it: damage only, no interruption.
   */
  applyHit(profile: AttackProfile, attackerFacing: 1 | -1, blocked: boolean, armored = false): void {
    if (this.defeated) {
      return;
    }
    if (armored && !blocked && this.health > profile.damage) {
      this.health -= profile.damage;
      return;
    }
    this.diveVelX = 0;
    this.jumpPhase = null;
    this.sprite.anims.resume();
    // Hit mid-air during the sopro: the jet goes out and he falls.
    this.cancelarSopro();
    // Cancel pending action completion callbacks when a move is interrupted.
    this.sprite.removeAllListeners(`animationcomplete-${this.actionKeys.specialCharge}`);
    this.sprite.removeAllListeners(`animationcomplete-${this.actionKeys.special}`);
    this.removeStrikeListeners();
    this.strike = null;
    this.endAdvanceEffects();
    this.advance = null;
    this.dash = null;

    if (blocked) {
      this.knockbackVel = attackerFacing * profile.knockback * BLOCK_PUSHBACK;
      this.hitstunTimer = Math.max(this.hitstunTimer, BLOCKSTUN_SECONDS);
      this.stunIsBlock = true;
      this.stunBlockLow = this.currentAnimKey === this.actionKeys.blockLow;
      this.locked = false;
      return;
    }

    this.health = Math.max(0, this.health - profile.damage);
    this.knockbackVel = attackerFacing * profile.knockback;

    if (this.health <= 0) {
      this.somDeDor('dor-ko');
      this.defeated = true;
      this.locked = true;
      this.grounded = true;
      this.stunIsBlock = false;
      this.hitstunTimer = 0;
      this.playState(this.actionKeys.knockdown, false);
      // The body hits the floor a moment after the blow.
      this.scene.time?.delayedCall(280, () => this.som('queda', 'queda'));
      return;
    }

    this.somDeDor(profile.kind === 'high' ? 'dor' : 'dor-forte');
    this.stunIsBlock = false;
    this.stunIsDizzy = (profile.stunMs ?? 0) > profile.hitstun;
    this.locked = false;
    this.hitstunTimer = Math.max(profile.hitstun, profile.stunMs ?? 0) / 1000;
    this.currentAnimKey = '';
    if (this.stunIsDizzy) {
      this.playState(this.actionKeys.stunned, true);
      this.som('tontura', 'tontura');
    }
    else this.playState(this.actionKeys.hitHigh, false);
  }

  /**
   * Resets the fighter for a new round: restores health, repositions and faces,
   * clears combat state, and re-freezes until the round intro releases it.
   * @param x - The spawn x position.
   * @param facing - The spawn facing direction.
   */
  resetForRound(x: number, facing: 1 | -1): void {
    this.clearProjectile();
    this.esquadrao?.reset();
    this.cancelarSopro();
    this.jumpPhase = null;
    this.diveVelX = 0;
    this.strike = null;
    this.endAdvanceEffects();
    this.advance = null;
    this.sprite.anims.resume();
    this.posX = Phaser.Math.Clamp(x, this.minX, this.maxX);
    this.facing = facing;
    this.maxHealth = this.combat().maxHealth;
    this.health = this.maxHealth;
    this.velocityY = 0;
    this.grounded = true;
    this.locked = false;
    this.defeated = false;
    this.frozen = true;
    this.hitstunTimer = 0;
    this.stunIsBlock = false;
    this.stunBlockLow = false;
    this.stunIsDizzy = false;
    this.guardHeld = null;
    this.dash = null;
    this.knockbackVel = 0;
    this.attackConnected = true;
    this.attackActiveLast = false;
    this.meter = 0;
    this.currentAnimKey = '';
    this.currentReverse = false;

    this.sprite.setPosition(this.posX, this.groundY).setFlipX(this.facing === 1);
    this.playState(this.actionKeys.idle, true);
    this.updateShadow();
  }

  /**
   * Advances the fighter one frame.
   * @param seconds - Delta time in seconds.
   * @param input - The intent snapshot for this frame.
   */
  update(seconds: number, input: FighterInput): void {
    this.guardHeld = input.block ? (this.guardHeld === null ? 0 : this.guardHeld + seconds) : null;
    this.clock += seconds;
    this.dashTap = this.doubleTap.feed(this.horizontalDirection(input), this.clock);
    this.lastDx = this.posX - this.previousX;
    this.previousX = this.posX;
    if (!this.frozen) this.updateProjectile(seconds);
    this.esquadrao?.update(seconds);
    this.updateTontura();
    if (this.defeated) {
      this.playState(this.actionKeys.knockdown, false);
      this.applyKnockback(seconds);
      this.dropToGround(seconds);
      this.updateShadow();
      this.drawBoundsOverlay();
      return;
    }

    if (this.frozen) {
      this.playState(this.actionKeys.idle, true);
      this.drawBoundsOverlay();
      return;
    }

    if (this.hitstunTimer > 0) {
      this.hitstunTimer = Math.max(0, this.hitstunTimer - seconds);
      this.applyKnockback(seconds);
      this.dropToGround(seconds);
      this.playState(
        this.stunIsBlock
          ? this.stunBlockLow
            ? this.actionKeys.blockLow
            : this.actionKeys.blockHigh
          : this.stunIsDizzy
            ? this.actionKeys.stunned
            : this.actionKeys.hitHigh,
        this.stunIsDizzy && !this.stunIsBlock
      );
      this.updateShadow();

      if (this.hitstunTimer === 0) {
        this.currentAnimKey = '';
      }

      this.drawBoundsOverlay();
      return;
    }

    if (this.sopro) {
      this.updateSopro(seconds);
      this.drawBoundsOverlay();
      return;
    }

    if (this.jumpPhase === 'prepare' && (input.light || input.heavy)) {
      this.bufferedAirAttack = input.light ? 'light' : 'heavy';
    }
    const meterSeconds = this.combat().meterSeconds;
    if (meterSeconds > 0 && this.hasSpecial) {
      this.gainMeter((METER_MAX * seconds) / meterSeconds);
    }
    this.updateCustomJump(seconds);
    this.updateSpecialMotion(seconds);
    this.updateAdvance(seconds);
    this.updateStrikeTravel(seconds);
    if (this.grounded) this.applyKnockback(seconds);
    if (input.light && this.canChainJab()) {
      // Quick punch: pressing again after the hit frames throws the next one.
      this.sprite.removeAllListeners(`animationcomplete-${this.actionKeys.lightPunch}`);
      this.sprite.stop();
      this.startStrike('soco-rapido');
    }
    if (!this.grounded) {
      this.updateAirborne(seconds, input);
    } else if (!this.locked) {
      this.updateGrounded(seconds, input);
    }

    this.updateAttackWindow();
    this.drawBoundsOverlay();
  }

  /** Destroys the fighter's display objects. */
  destroy(): void {
    this.clearProjectile();
    this.esquadrao?.destroy();
    this.cancelarSopro();
    this.endAdvanceEffects();
    this.sprite?.removeAllListeners();
    this.sprite?.destroy();
    this.shadow?.destroy();
    this.boundsGraphics?.destroy();
    this.tontura?.destroy();
  }

  /**
   * Resolves the per-action animation keys for this character, falling back to
   * the first available animation for any missing action.
   */
  private resolveActionKeys(): FighterActionKeys {
    const key = (action: string): string =>
      findCharacterAnimationKeyByAction(this.character.id, action) ?? this.character.animations[0].key;
    // First sheet the character really has, in order of preference (catalog quebra-galhos).
    const find = (...actions: (string | undefined)[]): string | undefined =>
      actions
        .map((action) => (action ? findCharacterAnimationKeyByAction(this.character.id, action) : null))
        .find((found): found is string => found !== null);

    return {
      idle: key('idle'),
      walkForward: key('walk-forward'),
      walkBackward: key('walk-backward'),
      crouch: key('crouch'),
      jump: key('jump'),
      blockHigh: key('block-high'),
      blockLow: findCharacterAnimationKeyByAction(this.character.id, 'block-low') ?? key('block-high'),
      hitHigh: key('hit-high'),
      stunned: find('stunned', 'hit-high') ?? key('hit-high'),
      lightPunch: key('light-punch'),
      heavyPunch: find(this.character.moves?.heavy?.action, 'heavy-punch', 'heavy-kick') ?? key('light-punch'),
      kick: find(this.character.moves?.kick?.action, 'heavy-kick', 'heavy-punch') ?? key('light-punch'),
      lowKick: find('low-kick', 'heavy-kick', 'heavy-punch') ?? key('light-punch'),
      airLight: find('jump-punch') ?? key('light-punch'),
      airKick: find('jump-kick', 'heavy-kick', 'heavy-punch') ?? key('light-punch'),
      specialCharge: findCharacterAnimationKeyByAction(this.character.id, 'special-charge') ?? key('crouch'),
      special: findCharacterAnimationKeyByAction(this.character.id, 'special') ?? key('heavy-kick'),
      knockdown: key('knockdown'),
      dashForward: find('dash-forward') ?? key('walk-forward'),
      dashBack: find('dash-back') ?? key('walk-backward')
    };
  }

  /** Current persisted stats for this fighter. */
  private stats(): FighterStats {
    return getFighterStats(this.app.debugStore.getState().fighterPlayground, this.character.id);
  }

  /** Current persisted combat tuning for this fighter. */
  private combat(): FighterCombat {
    return getFighterCombat(this.app.debugStore.getState().fighterPlayground, this.character.id);
  }

  /**
   * The attack kind currently being thrown (`high` = light, `low` = heavy), or
   * null when the fighter isn't mid-strike.
   */
  private currentAttackKind(): AttackKind | null {
    if (!this.locked) {
      return null;
    }
    if (this.currentAnimKey === this.actionKeys.special) {
      return 'special';
    }

    return this.strike ? ATTACK_KIND_OF[this.strike] : null;
  }

  /** Which catalog move the current strike is (air and ground share sheets). */
  private currentMove(): AttackMove {
    return this.currentAnimKey === this.actionKeys.special ? 'especial' : (this.strike ?? 'soco-rapido');
  }

  /** A quick punch that touched the opponent, past its last hit frame, chains into the next one; a whiff plays to the end. */
  private canChainJab(): boolean {
    if (!this.grounded || !this.locked || this.strike !== 'soco-rapido' || !this.strikeLanded) {
      return false;
    }
    const animation = getCharacterAnimationDefinition(this.character.id, this.actionKeys.lightPunch);
    const lastHit = animation.bounds.reduce((last, frame) => (frame.attack ? frame.frame : last), -1);
    return lastHit >= 0 && this.currentFrameIndex(animation) > lastHit;
  }

  /** The fighter's active animation definition, or null when none is playing. */
  private currentAnimation(): HeroAnimationDefinition | null {
    const animKey = this.sprite.anims.currentAnim?.key ?? this.currentAnimKey;
    if (!animKey) {
      return null;
    }

    return getCharacterAnimationDefinition(this.character.id, animKey);
  }

  /**
   * Advances knockback: slides the fighter by the current knockback velocity and
   * decays it toward zero by friction.
   * @param seconds - Delta time in seconds.
   */
  private applyKnockback(seconds: number): void {
    if (this.knockbackVel === 0) {
      return;
    }

    this.posX = Phaser.Math.Clamp(this.posX + this.knockbackVel * seconds, this.minX, this.maxX);
    this.sprite.x = this.posX;

    const decay = KNOCKBACK_FRICTION * seconds;
    this.knockbackVel =
      this.knockbackVel > 0
        ? Math.max(0, this.knockbackVel - decay)
        : Math.min(0, this.knockbackVel + decay);
  }

  /**
   * Builds the sprite (feet-anchored, facing the opponent) and ground shadow.
   * @param depth - The display depth for the sprite (shadow renders just under).
   */
  private build(depth: number): void {
    const scale = this.stats().scale;
    this.appliedScale = scale;
    this.depthBase = depth;

    this.shadow = this.scene.add
      .ellipse(
        this.posX,
        this.groundY - SHADOW_FOOT_OFFSET * scale,
        Math.round(107 * scale),
        Math.round(24 * scale),
        0x000000,
        1
      )
      .setAlpha(0.32)
      .setDepth(depth - 1);

    this.sprite = this.scene.add
      .sprite(this.posX, this.groundY, this.actionKeys.idle, 0)
      .setOrigin(0.5, this.character.anchor.y)
      .setScale(scale)
      .setFlipX(this.facing === 1)
      .setDepth(depth);

    this.boundsGraphics = this.scene.add.graphics().setDepth(depth + 45);

    const especial = this.character.moves?.special;
    if (especial?.kind === 'esquadrao' && especial.esquadrao) {
      this.esquadrao = new Esquadrao({
        scene: this.scene,
        x: () => this.posX,
        chao: () => this.groundY,
        lado: () => this.facing,
        escala: () => this.appliedScale,
        profundidade: () => this.depthBase,
        alvoX: () => this.opponent?.x ?? null,
        alvoCorpo: () => this.opponent?.getHurtRect() ?? null,
        animacao: (efeito) => findCharacterAnimationKeyByAction(this.character.id, `fx-${efeito}`)
      }, especial.esquadrao);
    }

    this.playState(this.actionKeys.idle, true);
  }

  /** Restacks the sprite, shadow, and bounds overlay around the base depth. */
  private applyDepths(): void {
    this.shadow.setDepth(this.depthBase - 1);
    this.sprite.setDepth(this.depthBase);
    this.boundsGraphics.setDepth(this.depthBase + 45);
  }

  /**
   * Advances the jump arc, allows light air drift, and lands on the ground axis.
   * @param seconds - Delta time in seconds.
   * @param input - The intent snapshot for this frame.
   */
  private updateAirborne(seconds: number, input: FighterInput): void {
    const stats = this.stats();
    this.velocityY += stats.gravity * seconds;
    const airStrike = input.light ? 'light' : input.heavy ? 'heavy' : this.bufferedAirAttack;
    if (this.jumpPhase === 'air' && airStrike && !this.airAttackUsed) {
      this.bufferedAirAttack = null;
      this.startAirAttack(airStrike === 'light' ? 'soco-no-ar' : 'voadora');
    }
    if (this.jumpPhase === 'air' || this.jumpPhase === 'attack') {
      this.jumpClock += seconds;
    }
    if (this.jumpPhase === 'air') {
      this.sprite.setFrame(this.jumpAirFrame());
    }
    let nextY = this.sprite.y + this.velocityY * seconds;

    const drift = this.horizontalDirection(input);
    if (this.diveVelX !== 0) {
      this.posX = Phaser.Math.Clamp(this.posX + this.diveVelX * seconds, this.minX, this.maxX);
      this.sprite.x = this.posX;
    } else if (drift !== 0) {
      this.posX = Phaser.Math.Clamp(this.posX + drift * stats.airDrift * seconds, this.minX, this.maxX);
      this.sprite.x = this.posX;
    }

    if (nextY >= this.groundY) {
      nextY = this.groundY;
      this.velocityY = 0;
      this.grounded = true;
      if (this.jumpPhase === 'air' || this.jumpPhase === 'attack') {
        this.startLanding();
      }
      this.currentAnimKey = '';
      this.currentReverse = false;
    }

    this.sprite.y = nextY;
    this.updateShadow();
  }

  /**
   * Resolves grounded behaviour: one-shot actions first, then held block/crouch,
   * then walking, then idle.
   * @param seconds - Delta time in seconds.
   * @param input - The intent snapshot for this frame.
   */
  private updateGrounded(seconds: number, input: FighterInput): void {
    // Dash (GDD): a double tap. Guard or any button cancels it at once.
    const acting = input.block || input.light || input.heavy || input.special || input.jump;
    if (acting) {
      this.dash = null;
    } else if (this.dashTap !== 0 && !this.dash && !input.crouch) {
      this.startDash(this.dashTap === 1 ? 1 : -1);
    }
    if (this.dash) {
      this.updateDash(seconds);
      return;
    }
    if (input.special && this.isMeterReady && (this.esquadrao?.pronto ?? true)) {
      this.startSpecial();
      return;
    }
    if (input.jump) {
      this.startJump();
      return;
    }
    // Two attack buttons; holding down turns them into the heavy punch and the low kick.
    if (input.light) {
      this.startStrike(input.crouch ? 'soco-forte' : 'soco-rapido');
      return;
    }
    // A carrier (the Biriba) still crossing: the kick does not call another.
    if (input.heavy && (input.crouch || !this.carrierInFlight())) {
      this.startStrike(input.crouch ? 'chute-baixo' : 'chute-basico');
      return;
    }
    if (input.block) {
      this.playState(input.crouch ? this.actionKeys.blockLow : this.actionKeys.blockHigh, false);
      return;
    }
    if (input.crouch) {
      this.playState(this.actionKeys.crouch, false);
      return;
    }

    const direction = this.horizontalDirection(input);
    if (direction !== 0) {
      const stats = this.stats();
      this.posX = Phaser.Math.Clamp(this.posX + direction * stats.walkSpeed * seconds, this.minX, this.maxX);
      this.sprite.x = this.posX;
      this.updateShadow();
      this.playWalk(direction === this.facing);
      this.stepClock += seconds;
      if (this.stepClock >= 0.3) {
        this.stepClock = 0;
        this.som('passo', 'passo');
      }
      return;
    }

    this.playState(this.actionKeys.idle, true);
  }

  /** Starts a dash in world direction `dir`: forward when it points at the opponent. */
  private startDash(dir: 1 | -1): void {
    this.som('dash', 'dash');
    const forward = dir === this.facing;
    this.dash = { dir, elapsed: 0, ...(forward ? DASH_FORWARD : DASH_BACK) };
    const key = forward ? this.actionKeys.dashForward : this.actionKeys.dashBack;
    const ownSheet = key !== this.actionKeys.walkForward && key !== this.actionKeys.walkBackward;
    this.currentAnimKey = '';
    this.playState(key, !ownSheet);
  }

  /** Moves the dash at a constant speed until its distance is covered. */
  private updateDash(seconds: number): void {
    const dash = this.dash!;
    const step = Math.min(seconds, dash.seconds - dash.elapsed);
    dash.elapsed += seconds;
    let next = this.posX + (dash.dir * dash.distance * step) / dash.seconds;
    const stop = this.opponentX === null ? null : this.opponentX - dash.dir * DASH_STOP_GAP;
    const blocked = stop !== null && dash.dir * (this.opponentX! - this.posX) > 0 && dash.dir * (next - stop) > 0;
    if (blocked) {
      next = dash.dir * (this.posX - stop!) > 0 ? this.posX : stop!;
    }
    this.posX = Phaser.Math.Clamp(next, this.minX, this.maxX);
    this.sprite.x = this.posX;
    this.updateShadow();
    if (blocked || dash.elapsed >= dash.seconds) {
      this.dash = null;
      this.currentAnimKey = '';
    }
  }

  /**
   * Returns -1 for left, +1 for right, or 0 when neutral/opposed.
   * @param input - The intent snapshot for this frame.
   */
  private horizontalDirection(input: FighterInput): number {
    return (input.right ? 1 : 0) - (input.left ? 1 : 0);
  }

  /**
   * Plays a looping or hold animation, switching only when the state (key or
   * playback direction) changes.
   * @param animKey - The animation key to play.
   * @param loop - Whether the animation should loop.
   * @param reverse - Whether to play the animation in reverse.
   */
  private playState(animKey: string, loop: boolean, reverse = false): void {
    if (this.currentAnimKey === animKey && this.currentReverse === reverse) {
      return;
    }

    this.currentAnimKey = animKey;
    this.currentReverse = reverse;

    // ignoreIfPlaying must be false so a forward->reverse switch on the same
    // key (reverse walk) is applied; the guard above prevents per-frame restarts.
    const config: Phaser.Types.Animations.PlayAnimationConfig = { key: animKey, repeat: loop ? -1 : 0 };
    if (reverse) {
      this.sprite.playReverse(config, false);
    } else {
      this.sprite.play(config, false);
    }
  }

  /**
   * Plays the appropriate walk animation. Backward walking uses the dedicated
   * backward animation, or the forward animation played in reverse when the
   * persisted "use reverse walk anims" setting is enabled.
   * @param movingForward - Whether the fighter is walking in its facing direction.
   */
  private playWalk(movingForward: boolean): void {
    if (movingForward) {
      this.playState(this.actionKeys.walkForward, true);
      return;
    }

    const reverseWalk = this.app.debugStore.getState().fighterPlayground.reverseWalk;
    if (reverseWalk) {
      this.playState(this.actionKeys.walkForward, true, true);
      return;
    }

    this.playState(this.actionKeys.walkBackward, true);
  }

  /**
   * Plays a one-shot action that locks input until it completes, then returns
   * to idle.
   * @param animKey - The action animation key to play.
   */
  private startStrike(move: AttackMove): void {
    const sheet: Partial<Record<AttackMove, string>> = {
      'soco-rapido': this.actionKeys.lightPunch,
      'soco-forte': this.actionKeys.heavyPunch,
      'chute-basico': this.actionKeys.kick,
      'chute-baixo': this.actionKeys.lowKick
    };
    this.startOneShot(sheet[move] ?? this.actionKeys.lightPunch);
    this.strike = move;
    this.som(move === 'chute-basico' ? 'chute' : move, move === 'soco-rapido' ? 'ar-leve' : 'ar-pesado');
    const extra = this.strikeMove();
    // Where the opponent stands the moment the move is called: the drop falls there.
    if (extra?.drop) this.dropTargetX = this.opponent ? this.opponent.posX : (this.opponentX ?? this.posX);
    const effect = extra?.effect;
    if (effect) {
      const animation = getCharacterAnimationDefinition(this.character.id, sheet[move] ?? this.actionKeys.lightPunch);
      const attackId = this.attackId;
      const at = extra.effectAt;
      this.scene.time.delayedCall(((extra.effectFrame ?? 0) / animation.frameRate) * 1000, () => {
        if (this.attackId === attackId && this.strike === move) {
          // Effect sheets draw centred in a 256 cell and spawn from the bottom,
          // so the centre sits half a cell above the spawn point.
          const lift = at ? at.y - 128 : 20;
          this.spawnEffect(
            effect,
            this.posX + this.facing * (at?.x ?? 40) * this.appliedScale,
            this.groundY - lift * this.appliedScale
          );
        }
      });
    }
  }

  /**
   * Slides the fighter during a strike's `travel` frames, stopping `reach` short
   * of the opponent, and steps it back during its `recuo` frames.
   */
  private updateStrikeTravel(seconds: number): void {
    const animation = this.strike ? this.currentAnimation() : null;
    if (!animation) {
      return;
    }
    const frame = this.currentFrameIndex(animation);
    const frameMs = animation.frameDurations?.[frame] ?? 1000 / animation.frameRate;
    const back = (animation.recuo ?? []).reduce((total, recuo) => total + strikeTravelStep(recuo, frame, frameMs, seconds), 0);
    if (back > 0) {
      this.posX = Phaser.Math.Clamp(this.posX - this.facing * back * this.appliedScale, this.minX, this.maxX);
    }
    const travel = animation.travel;
    if (!travel) {
      return;
    }
    const step = strikeTravelStep(travel, frame, frameMs, seconds);
    if (step <= 0) {
      return;
    }
    let next = this.posX + this.facing * step * this.appliedScale;
    if (this.opponent && Math.sign(this.opponent.x - this.posX) === this.facing) {
      const stop = advanceStop(this.posX, this.opponent.x, (travel.reach ?? 70) * this.appliedScale);
      next = this.facing > 0 ? Math.min(next, stop) : Math.max(next, stop);
    }
    this.posX = Phaser.Math.Clamp(next, this.minX, this.maxX);
  }

  /**
   * Starts an advance special (run / hop / meteor): the sheet is driven frame by
   * frame while the fighter travels toward the opponent, like the jump.
   */
  private startAdvance(move: ProjectileMoveConfig): void {
    const target = this.opponent?.x ?? this.posX + this.facing * 300;
    const dir: 1 | -1 = Math.sign(target - this.posX) < 0 ? -1 : 1;
    this.facing = dir;
    this.sprite.setFlipX(dir === 1);
    this.sprite.play({ key: this.actionKeys.special, repeat: 0 }, true);
    this.sprite.anims.pause();
    const phase = move.kind === 'run' ? 'run' : move.kind === 'hop' ? 'hop' : 'rise';
    this.advance = {
      move,
      phase,
      clock: 0,
      fromX: this.posX,
      toX: advanceStop(this.posX, target, move.reach ?? 120),
      fromY: this.groundY,
      dir
    };
    if (phase !== 'rise') {
      this.chargeFx?.destroy();
      this.chargeFx = null;
    }
    const approach = phase === 'run' && move.approachAction
      ? findCharacterAnimationKeyByAction(this.character.id, move.approachAction)
      : null;
    if (approach) {
      this.sprite.play({ key: approach, repeat: 0 }, true);
      this.sprite.anims.pause();
    }
    this.sprite.setFrame(phase === 'run' ? (move.loopFrames?.[0] ?? 0) : 0);
  }

  /** Advances the travelling special one step; frames follow the path, not the clock. */
  private updateAdvance(seconds: number): void {
    const a = this.advance;
    if (!a) {
      return;
    }
    const move = a.move;
    const approach = a.phase === 'run' && move.approachAction
      ? findCharacterAnimationKeyByAction(this.character.id, move.approachAction)
      : null;
    const animation = getCharacterAnimationDefinition(this.character.id, approach ?? this.actionKeys.special);
    const fps = animation.frameRate;
    const last = animation.bounds.length - 1;
    a.clock += seconds;

    if (a.phase === 'run') {
      const [from, to] = move.loopFrames ?? [0, 0];
      this.sprite.setFrame(from + (Math.floor(a.clock * fps) % (to - from + 1)));
      const stop = this.opponent ? advanceStop(this.posX, this.opponent.x, move.reach ?? 120) : a.toX;
      const step = (move.speed ?? 500) * seconds;
      const next = Phaser.Math.Clamp(a.dir > 0 ? Math.min(stop, this.posX + step) : Math.max(stop, this.posX - step), this.minX, this.maxX);
      const blocked = next === this.posX;
      this.posX = next;
      if (blocked || next === stop || a.clock >= (move.maxSeconds ?? 1.2)) {
        a.phase = 'strike';
        a.clock = 0;
        // The pounce aims where the opponent is now; it doesn't follow a jump.
        a.fromX = this.posX;
        a.toX = this.opponent ? advanceStop(this.posX, this.opponent.x, move.pounceReach ?? 0) : this.posX;
        if (approach) {
          this.sprite.play({ key: this.actionKeys.special, repeat: 0 }, true);
          this.sprite.anims.pause();
        }
        this.sprite.setFrame(move.strikeFrame ?? 0);
      }
    } else if (a.phase === 'strike' || a.phase === 'recover') {
      const first = a.phase === 'strike' ? (move.strikeFrame ?? 0) : (move.diveFrames?.[1] ?? last - 3) + 1;
      const frame = first + Math.floor(a.clock * fps);
      if (frame > last) {
        this.finishAdvance();
        return;
      }
      this.sprite.setFrame(frame);
      if (a.phase === 'strike' && move.pounceFrames) {
        const [from, to] = move.pounceFrames;
        const leap = Phaser.Math.Clamp((a.clock - (from - first) / fps) / ((to - from) / fps), 0, 1);
        this.posX = Phaser.Math.Clamp(a.fromX + (a.toX - a.fromX) * leap, this.minX, this.maxX);
        this.sprite.y = this.groundY - (move.pounceHeight ?? 40) * Math.sin(Math.PI * leap);
      }
    } else if (a.phase === 'hop') {
      const frame = Math.floor(a.clock * fps);
      if (frame > last) {
        this.finishAdvance();
        return;
      }
      this.sprite.setFrame(frame);
      const [from, to] = move.travelFrames ?? [0, last];
      const travel = Phaser.Math.Clamp((a.clock - from / fps) / ((to - from + 1) / fps), 0, 1);
      this.posX = Phaser.Math.Clamp(a.fromX + (a.toX - a.fromX) * travel, this.minX, this.maxX);
      const lift = Phaser.Math.Clamp(a.clock / ((move.landFrame ?? last) / fps), 0, 1);
      this.sprite.y = this.groundY - (move.hopHeight ?? 40) * Math.sin(Math.PI * lift);
    } else if (a.phase === 'rise') {
      const [from, to] = move.riseFrames ?? [0, 0];
      this.sprite.setFrame(from + (Math.floor(a.clock * fps) % (to - from + 1)));
      this.sprite.y -= (move.riseSpeed ?? 1600) * seconds;
      if (this.sprite.y < this.cameraTop() - 20) {
        this.chargeFx?.destroy();
        this.chargeFx = null;
        a.phase = 'hold';
        a.clock = 0;
      }
    } else if (a.phase === 'hold') {
      this.sprite.setFrame(move.holdFrame ?? 0);
      // The impact point follows the opponent until the dive starts, then it is fixed.
      a.toX = Phaser.Math.Clamp(this.opponent?.x ?? a.toX, this.minX, this.maxX);
      if (a.clock >= (move.holdSeconds ?? 0.35)) {
        const dir: 1 | -1 = Math.sign(a.toX - a.fromX) < 0 ? -1 : 1;
        const start = meteorDiveStart(a.toX, this.groundY, this.cameraTop() - 20, dir);
        a.dir = dir;
        a.fromX = start.x;
        a.fromY = start.y;
        a.phase = 'dive';
        a.clock = 0;
        this.som('especial-mergulho', null);
        this.facing = dir;
        this.sprite.setFlipX(dir === 1);
        if (move.trailEffect) {
          // The trail streams behind the body, not over it.
          this.trailFx = this.spawnEffect(move.trailEffect, start.x, start.y)?.setDepth(this.depthBase - 0.5) ?? null;
        }
      }
    } else if (a.phase === 'dive') {
      const progress = Phaser.Math.Clamp(a.clock / (move.diveSeconds ?? 0.35), 0, 1);
      const [from, to] = move.diveFrames ?? [0, 0];
      this.sprite.setFrame(Math.min(to, from + Math.floor(progress * (to - from + 1))));
      // The drawing (and its hitbox) follows the 45 degree path from off-screen;
      // the position the camera reads stays inside the arena, so it doesn't jerk.
      const pathX = a.fromX + (a.toX - a.fromX) * progress;
      this.posX = Phaser.Math.Clamp(pathX, this.minX, this.maxX);
      this.sprite.y = a.fromY + (this.groundY - a.fromY) * progress;
      this.trailFx?.setPosition(pathX, this.sprite.y);
      if (progress < 1) {
        this.sprite.x = pathX;
        this.updateShadow();
        return;
      }
      {
        this.posX = Phaser.Math.Clamp(a.toX, this.minX, this.maxX);
        this.sprite.y = this.groundY;
        this.trailFx?.destroy();
        this.trailFx = null;
        this.som('especial-pouso', null);
        a.phase = 'recover';
        a.clock = 0;
      }
    }

    this.sprite.x = this.posX;
    this.updateShadow();
  }

  private finishAdvance(): void {
    this.endAdvanceEffects();
    this.advance = null;
    this.sprite.y = this.groundY;
    this.locked = false;
    this.currentAnimKey = '';
    this.sprite.anims.resume();
    this.playState(this.actionKeys.idle, true);
  }

  private endAdvanceEffects(): void {
    this.chargeFx?.destroy();
    this.trailFx?.destroy();
    this.chargeFx = null;
    this.trailFx = null;
  }

  /**
   * Especial `sopro`: segura o último quadro da carga subindo até a altura do
   * JSON, varre com o jato pela sheet `special` e desce com `special-return`.
   * O lado fica travado: cruzar por baixo não vira o jato.
   */
  private iniciarSopro(cfg: SoproConfig): void {
    this.chargeFx?.destroy();
    this.chargeFx = null;
    this.sopro = { cfg, fase: 'subida', relogio: 0, lado: this.facing, jato: null, contato: null };
    this.currentAnimKey = this.actionKeys.specialCharge;
    this.sprite.anims.pause();
  }

  private updateSopro(seconds: number): void {
    const s = this.sopro!;
    s.relogio += seconds;
    const altura = s.cfg.altura * this.appliedScale;
    if (s.fase === 'subida') {
      const t = Phaser.Math.Clamp(s.relogio / (s.cfg.subidaSegundos ?? 0.3), 0, 1);
      this.sprite.y = this.groundY - altura * (1 - (1 - t) * (1 - t));
      if (t >= 1) {
        // Só sopra na altura segura.
        s.fase = 'varredura';
        s.relogio = 0;
        this.currentAnimKey = this.actionKeys.special;
        this.sprite.play({ key: this.actionKeys.special, repeat: 0 }, true);
        const chave = findCharacterAnimationKeyByAction(this.character.id, `fx-${s.cfg.efeito}`);
        if (chave) {
          const quadro = this.scene.textures.get(chave).get(0);
          s.jato = this.scene.add.sprite(0, 0, chave, 0)
            .setOrigin(s.cfg.origemEfeito[0] / quadro.width, s.cfg.origemEfeito[1] / quadro.height)
            .setDepth(this.depthBase - 0.5)
            .play(chave);
        }
        this.som('especial', null);
      }
    } else if (s.fase === 'varredura') {
      const animation = this.currentAnimation();
      const total = animation ? animation.bounds.length / animation.frameRate : 1.2;
      const progresso = s.relogio / total;
      const { boca, angulo } = amostraDoSopro(s.cfg, progresso);
      // Boca do quadro para o mundo: a célula gira no pé de baixo (âncora) e vira com o lado.
      const pivoX = (animation?.sheet.frameWidth ?? 512) / 2;
      const pivoY = (animation?.sheet.frameHeight ?? 384) * this.character.anchor.y;
      const origem = new Phaser.Math.Vector2(
        this.posX - s.lado * (boca.x - pivoX) * this.appliedScale,
        this.sprite.y + (boca.y - pivoY) * this.appliedScale
      );
      const direcao = direcaoDoSopro(angulo, s.lado);
      const alcance = s.cfg.alcance ?? 1600;
      s.jato
        ?.setPosition(origem.x, origem.y)
        .setRotation(Math.atan2(direcao.y, direcao.x) - Math.PI)
        .setScale(alcance / s.cfg.comprimentoEfeito, this.appliedScale)
        .setFlipY(s.lado === 1);
      const corpo = this.opponent?.getHurtRect();
      const espessura = (s.cfg.espessura ?? 36) * this.appliedScale;
      const ponto = corpo ? acertoDoSopro(origem, direcao, alcance, espessura, corpo) : null;
      s.contato = ponto ? new Phaser.Geom.Rectangle(ponto.x - espessura / 2, ponto.y - espessura / 2, espessura, espessura) : null;
      if (progresso >= 1) {
        // Desliga o fogo antes de descer.
        s.jato?.destroy();
        s.jato = null;
        s.contato = null;
        s.fase = 'descida';
        s.relogio = 0;
        const retorno = findCharacterAnimationKeyByAction(this.character.id, 'special-return');
        if (retorno) {
          this.currentAnimKey = retorno;
          this.sprite.play({ key: retorno, repeat: 0 }, true);
        }
      }
    } else {
      // special-return: quadros 0 a 2 no ar, toca o chão no 3.
      const descer = 3 / (this.currentAnimation()?.frameRate ?? 12);
      const t = Phaser.Math.Clamp(s.relogio / descer, 0, 1);
      this.sprite.y = this.groundY - altura * (1 - t * t);
      if (s.relogio >= descer && !this.sprite.anims.isPlaying) {
        this.sprite.y = this.groundY;
        this.sopro = null;
        this.locked = false;
        this.currentAnimKey = '';
        this.playState(this.actionKeys.idle, true);
      }
    }
    this.sprite.x = this.posX;
    this.updateShadow();
  }

  /** Apaga o jato e solta o mascote (apanhou no ar, fim de round): a queda é a da gravidade. */
  private cancelarSopro(): void {
    if (!this.sopro) return;
    this.sopro.jato?.destroy();
    this.sopro = null;
  }

  /** Top edge of what the camera shows, in world space (meteor leaves above it). */
  private cameraTop(): number {
    return this.scene.cameras?.main?.worldView?.y ?? 0;
  }

  /**
   * Plays a named effect sheet from the JSON (`moves.effects`) at a world point,
   * feet-anchored and mirrored like the fighter. One-shot effects remove themselves.
   */
  /**
   * Plays the sound of an event (docs/sons.md): the fighter's own from its
   * JSON `sons` block, or the general one every fighter has.
   * @param evento - Event name (`passo`, `chute`, `especial`...).
   * @param geral - The general sound key for this event.
   */
  private som(evento: string, geral: string | null, detune = 0): void {
    const settings = this.app.settingsStore?.getState();
    if (settings) tocarSom(this.scene, somDoEvento(this.character.sons, evento, geral), settings, detune);
  }

  /**
   * Grunhido de dor quando o golpe entra. Golpe fraco é `dor`, o resto é
   * `dor-forte`; o tom varia um pouco a cada vez e um combo não grita a
   * cada quadro.
   */
  private somDeDor(evento: 'dor' | 'dor-forte' | 'dor-ko'): void {
    const agora = this.scene.time?.now ?? 0;
    if (evento !== 'dor-ko' && agora - this.lastPainAt < PAIN_COOLDOWN_MS) return;
    this.lastPainAt = agora;
    // O KO sem som próprio usa o `dor-forte` do mascote, se ele tiver.
    const sons = this.character.sons;
    const usado = evento === 'dor-ko' && sons && !('dor-ko' in sons) && 'dor-forte' in sons ? 'dor-forte' : evento;
    this.som(usado, evento, (Math.random() - 0.5) * 300);
  }

  private spawnEffect(name: string, x: number, y: number, mirror = true): Phaser.GameObjects.Sprite | null {
    const key = findCharacterAnimationKeyByAction(this.character.id, `fx-${name}`);
    if (!key) {
      return null;
    }
    const effect = this.scene.add
      .sprite(x, y, key, 0)
      .setOrigin(0.5, 1)
      .setScale(this.appliedScale)
      .setFlipX(mirror && this.facing === 1)
      .setDepth(this.depthBase + 2);
    effect.play(key);
    effect.once('animationcomplete', () => effect.destroy());
    return effect;
  }

  private startOneShot(animKey: string): void {
    this.strike = null;
    this.specialClock = 0;
    this.shotReleased = false;
    this.locked = true;
    this.currentAnimKey = animKey;
    this.currentReverse = false;
    this.attackId += 1;
    this.attackConnected = false;
    this.strikeLanded = false;
    this.sprite.play({ key: animKey, repeat: 0 }, true);
    this.sprite.once(`animationcomplete-${animKey}`, () => {
      this.locked = false;
      this.currentAnimKey = '';
      this.strike = null;

      if (this.grounded) {
        this.playState(this.actionKeys.idle, true);
      }
    });
  }

  /** JSON extras of the strike in progress (projectile, effect), when it has any. */
  private strikeMove(): ProjectileMoveConfig | undefined {
    const moves = this.character.moves;
    return this.strike === 'soco-forte' ? moves?.heavy
      : this.strike === 'chute-basico' ? moves?.kick
      : this.strike === 'chute-baixo' ? moves?.lowKick
      : undefined;
  }

  /** Drops pending "back to idle" callbacks of an interrupted strike. */
  private removeStrikeListeners(): void {
    new Set([
      this.actionKeys.lightPunch,
      this.actionKeys.heavyPunch,
      this.actionKeys.kick,
      this.actionKeys.lowKick,
      this.actionKeys.airLight,
      this.actionKeys.airKick
    ]).forEach((key) => this.sprite.removeAllListeners(`animationcomplete-${key}`));
  }

  /**
   * Performs the meter special: consumes the full meter, plays the charge
   * (wind-up) animation, then chains into the multi-hit execution animation, and
   * finally returns to idle. The execution's attack-active spans each open a new
   * hit window so the move lands a combo.
   */
  private startSpecial(): void {
    this.strike = null;
    this.locked = true;
    this.meter = 0;
    this.currentReverse = false;
    this.attackConnected = true;
    this.attackActiveLast = false;

    this.onSpecialStart?.(this);
    this.som('carga', 'especial-carga');
    spawnChargeAura(this.scene, this.sprite.x, this.sprite.y - this.sprite.displayHeight * 0.45);
    const chargeEffect = this.character.moves?.special?.chargeEffect;
    if (chargeEffect) {
      this.chargeFx = this.spawnEffect(chargeEffect, this.posX, this.groundY, false);
    }

    this.currentAnimKey = this.actionKeys.specialCharge;
    if (this.character.moves?.special?.skipCharge) {
      // The special sheet already winds up: hold the guard through the cut-in, then go.
      this.scene.time.delayedCall(SUPER_FREEZE_MS, () => {
        if (!this.defeated && this.locked && this.currentAnimKey === this.actionKeys.specialCharge) {
          this.executeSpecial();
        }
      });
      return;
    }
    this.sprite.play({ key: this.actionKeys.specialCharge, repeat: 0 }, true);
    this.sprite.once(`animationcomplete-${this.actionKeys.specialCharge}`, () => {
      if (this.defeated) {
        return;
      }

      // Super freeze: hold the charged pose so the cut-in cinematic peaks before
      // the move launches.
      this.scene.time.delayedCall(SUPER_FREEZE_MS, () => {
        if (!this.defeated && this.locked && this.currentAnimKey === this.actionKeys.specialCharge) {
          this.executeSpecial();
        }
      });
    });
  }

  /**
   * Launches the multi-hit special execution animation after the charge/super
   * freeze, then returns to idle. Each attack-active span opens a fresh hit
   * window so the move lands a combo.
   */
  private executeSpecial(): void {
    // The special itself (the dive, the pounce, the tornado); projectile ones sound at the release.
    this.som('especial', null);
    this.specialClock = 0;
    this.shotReleased = false;
    this.dashFrom = this.posX;
    this.previousSpecialX = this.posX;
    this.dashTo = this.facing === 1 ? this.maxX : this.minX;
    this.currentAnimKey = this.actionKeys.special;
    this.attackId += 1;
    this.attackConnected = false;
    this.attackActiveLast = false;
    const move = this.character.moves?.special;
    // Esquadrão: o mascote dá o sinal (a sheet do especial) e os aliados atacam.
    this.esquadrao?.atacar();
    if (move && ADVANCE_KINDS.includes(move.kind)) {
      this.startAdvance(move);
      return;
    }
    if (move?.kind === 'sopro' && move.sopro) {
      this.iniciarSopro(move.sopro);
      return;
    }
    this.chargeFx?.destroy();
    this.chargeFx = null;
    this.sprite.play({ key: this.actionKeys.special, repeat: 0 }, true);
    this.sprite.once(`animationcomplete-${this.actionKeys.special}`, () => {
      this.locked = false;
      this.currentAnimKey = '';

      if (this.grounded) {
        this.playState(this.actionKeys.idle, true);
      }
    });
  }

  /**
   * Opens a fresh hit window each time the attack box turns on after being off,
   * so a single animation with several attack-active spans connects once per
   * span (multi-hit specials). Single-span normal attacks are unaffected.
   */
  private updateAttackWindow(): void {
    const active = this.isAttackActiveFrame();

    if (active && !this.attackActiveLast) {
      this.attackConnected = false;
    }

    this.attackActiveLast = active;
  }

  /**
   * Whether the current animation frame has an attack box (independent of
   * whether the current swing has already connected).
   */
  private isAttackActiveFrame(): boolean {
    if (this.currentAttackKind() === null) {
      return false;
    }

    const animation = this.currentAnimation();
    if (!animation) {
      return false;
    }

    return Boolean(this.resolvedFrame(animation).attack);
  }

  /**
   * Whether any frame after the given index in the animation still has an attack
   * box — used to detect the final hit window of a special (the finisher).
   * @param animation - The active animation.
   * @param frameIndex - The current frame index.
   */
  private hasAttackFrameAfter(animation: HeroAnimationDefinition, frameIndex: number): boolean {
    return animation.bounds.some((frame) => frame.frame > frameIndex && frame.attack !== null);
  }

  /**
   * Starts a jump in three phases: a short wind-up squat on the ground, the
   * flight (sheet frames follow the physical arc, so the drawing never "jumps"
   * a second time), and a recovery squat on touchdown.
   */
  private startJump(): void {
    this.som('pulo', 'pulo');
    const frames = this.jumpFrames();
    this.jumpPhase = 'prepare';
    this.jumpClock = 0;
    this.airAttackUsed = false;
    this.bufferedAirAttack = null;
    this.locked = true;
    this.currentAnimKey = this.actionKeys.jump;
    this.currentReverse = false;
    this.showJumpFrame(Math.min(1, frames.takeoff));
    if (frames.takeoff <= 1) {
      this.launchJump();
    }
  }

  /** Advances the grounded jump phases: the wind-up and the landing recovery. */
  private updateCustomJump(seconds: number): void {
    if (this.jumpPhase === 'prepare') {
      this.jumpClock += seconds;
      const frame = 1 + Math.floor(this.jumpClock / JUMP_WINDUP_FRAME_SECONDS);
      if (frame >= this.jumpFrames().takeoff) {
        this.launchJump();
      } else {
        this.sprite.setFrame(frame);
      }
      return;
    }
    if (this.jumpPhase !== 'land') return;
    this.jumpClock -= seconds;
    if (this.jumpClock > 0) return;
    this.jumpPhase = null;
    this.locked = false;
    this.currentAnimKey = '';
    this.sprite.anims.resume();
  }

  /** Leaves the ground: physics takes over and the flight frames begin. */
  private launchJump(): void {
    this.jumpPhase = 'air';
    this.jumpClock = 0;
    this.grounded = false;
    this.velocityY = -Math.abs(this.stats().jump);
    this.sprite.setFrame(this.jumpFrames().takeoff);
  }

  /** One strike per jump: plays the attack mid-air, then returns to the flight pose. */
  private startAirAttack(move: 'soco-no-ar' | 'voadora'): void {
    const animKey = move === 'voadora' ? this.actionKeys.airKick : this.actionKeys.airLight;
    this.jumpPhase = 'attack';
    this.airAttackUsed = true;
    this.strike = move;
    this.som(move, move === 'soco-no-ar' ? 'ar-leve' : 'ar-pesado');
    this.currentAnimKey = animKey;
    this.attackId += 1;
    this.attackConnected = false;
    this.attackActiveLast = false;
    let startFrame = 0;
    if (move === 'voadora') {
      // Flying kick: dives forward-down and comes out already on the kick frame.
      this.diveVelX = this.facing * FLYING_KICK_SPEED_X;
      // On the way up the jump keeps rising; past the apex the kick dives.
      if (this.velocityY > 0) {
        this.velocityY = Math.max(this.velocityY, FLYING_KICK_DROP);
      }
      const animation = getCharacterAnimationDefinition(this.character.id, animKey);
      startFrame = Math.max(0, animation.bounds.findIndex((frame) => frame.attack !== null));
    }
    this.sprite.play({ key: animKey, repeat: 0, startFrame }, true);
    this.sprite.once(`animationcomplete-${animKey}`, () => {
      if (this.jumpPhase !== 'attack') return;
      this.diveVelX = 0;
      this.strike = null;
      this.jumpPhase = 'air';
      this.currentAnimKey = this.actionKeys.jump;
      this.showJumpFrame(this.jumpAirFrame());
    });
  }

  /** Touchdown: cancels an unfinished air strike and holds the landing squat. */
  private startLanding(): void {
    this.som('aterrissar', 'aterrissar');
    this.diveVelX = 0;
    this.strike = null;
    this.removeStrikeListeners();
    this.showJumpFrame(this.jumpFrames().land);
    this.jumpPhase = 'land';
    this.jumpClock = JUMP_LANDING_SECONDS;
    this.locked = true;
  }

  /** Gravity for a fighter who lost control in the air (hitstun or KO). */
  private dropToGround(seconds: number): void {
    if (this.sprite.y >= this.groundY) return;
    this.velocityY += this.stats().gravity * seconds;
    this.sprite.y = Math.min(this.groundY, this.sprite.y + this.velocityY * seconds);
    if (this.sprite.y >= this.groundY) {
      this.velocityY = 0;
      this.grounded = true;
    }
    this.updateShadow();
  }

  /** Freezes the jump sheet on one frame (the jump is driven by hand, not by the clock). */
  private showJumpFrame(frame: number): void {
    if (this.sprite.anims.currentAnim?.key !== this.actionKeys.jump) {
      this.sprite.play({ key: this.actionKeys.jump, repeat: 0 }, true);
    }
    this.sprite.anims.pause();
    this.sprite.setFrame(frame);
  }

  /** The flight frame matching the current point of the jump arc. */
  private jumpAirFrame(): number {
    const stats = this.stats();
    const frames = this.jumpFrames();
    return jumpFlightFrame(this.jumpClock, (2 * Math.abs(stats.jump)) / stats.gravity, frames.takeoff, frames.airEnd);
  }

  private jumpFrames(): JumpFrames {
    const animation = getCharacterAnimationDefinition(this.character.id, this.actionKeys.jump);
    return jumpFrames(animation.bounds.length, this.character.moves?.jump);
  }

  private updateSpecialMotion(seconds: number): void {
    const isSpecial = this.currentAnimKey === this.actionKeys.special;
    const move = isSpecial ? this.character.moves?.special
      : this.strikeMove();
    if (!move || !this.locked) return;
    this.specialClock += seconds;
    const animation = this.currentAnimation();
    if (!animation) return;
    if (move.kind === 'dash') {
      this.previousSpecialX = this.posX;
      this.posX = Phaser.Math.Clamp(dashPosition(this.dashFrom, this.dashTo, this.specialClock,
        (move.startFrame ?? 2)/animation.frameRate, (move.endFrame ?? 6)/animation.frameRate), this.minX, this.maxX);
      this.sprite.x = this.posX;
      this.updateShadow();
    } else if (move.kind === 'projectile' && !this.shotReleased && this.specialClock >= (move.releaseFrame ?? 3)/animation.frameRate) {
      this.shotReleased = true;
      this.spawnProjectile(move, isSpecial ? 'special' : ATTACK_KIND_OF[this.strike ?? 'soco-forte']);
    }
  }

  private spawnProjectile(move: ProjectileMoveConfig, kind: AttackKind): void {
    this.som(kind === 'special' ? 'projetil-especial' : 'projetil', 'projetil-lancar');
    const width = move.hitWidth ?? 12;
    const height = move.hitHeight ?? 12;
    const speed = move.speed ?? 900;
    const effectKey = move.visualEffect
      ? findCharacterAnimationKeyByAction(this.character.id, `fx-${move.visualEffect}`)
      : null;
    let x: number;
    let y: number;
    let visual: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Sprite;
    const fromBehind = move.spawnFrom === 'behind';
    if (effectKey) {
      // Effect-sheet projectile (pipe, powder cloud): centred at hand height;
      // from behind (the Biriba), it enters at the camera edge behind him.
      x = fromBehind ? this.behindEdgeX(width / 2) : this.posX + this.facing * (move.launchForward ?? 70) * this.appliedScale;
      y = this.groundY - (move.launchHeight ?? 110) * this.appliedScale;
      visual = this.scene.add.sprite(x, y, effectKey, 0)
        .setOrigin(.5, .5).setScale(move.visualScale ?? this.appliedScale).setFlipX(move.mirror !== false && this.facing === 1)
        .setDepth(move.move === 'nuvem' ? CLOUD_DEPTH : this.depthBase+2).play(effectKey);
    } else {
      x = this.posX+this.facing*(move.visualFile ? width/2+20 : 90*this.appliedScale);
      if (fromBehind) {
        // Enters from off-screen behind the fighter and sails past them: it comes out of him.
        x = this.behindEdgeX(width / 2);
      }
      const baseline = this.groundY-24*this.appliedScale;
      y = move.visualFile ? baseline-height/2 : this.groundY-175*this.appliedScale;
      visual = move.visualFile
        ? this.scene.add.sprite(x, baseline, `${this.character.id}-special-effect`, 0)
          .setOrigin(.5, 1).setScale(move.visualScale ?? 2).setFlipX(this.facing === 1)
          .setDepth(fromBehind ? this.depthBase - 0.5 : this.depthBase+2).play(`${this.character.id}-special-effect`)
        : this.scene.add.rectangle(x, y, 14, 5, 0xffdf8a).setDepth(this.depthBase+1);
    }
    const life = move.range !== undefined ? move.range / speed
      : move.visualFile || fromBehind ? (this.projectileMaxX-this.projectileMinX+width+512)/speed+1 : 2;
    this.projectiles.push({x, previousX:x, y, vy: -(move.launchVy ?? 0), gravity: move.gravity ?? 0,
      floorY: this.groundY - 24 * this.appliedScale, facing:this.facing, life,
      signature:this.attackId, visual, width, height, speed,
      profile:{...getAttackProfile(this.combat(), kind), height:'high', stunMs: move.stunMs}, connected:false,
      move: (move.move as AttackMove | undefined) ?? (kind === 'special' ? 'onda' : 'tiro'),
      persistOnHit:move.persistOnHit ?? false, rangeAfterHit: move.rangeAfterHit ?? 0,
      growth: move.growth, travelled: 0,
      initial: { width, height, scale: visual.scaleX,
        damage: getAttackProfile(this.combat(), kind).damage, stunMs: move.stunMs ?? 0 },
      carrier: move.drop ? { drop: move.drop, targetX: this.dropTargetX ?? this.posX, dropped: false } : undefined,
      hitEffect: move.hitEffect, hitParticles: move.hitParticles});
  }

  /** World x at the camera edge behind the fighter, `half` past it (off-screen). */
  private behindEdgeX(half: number): number {
    const view = this.scene.cameras?.main?.worldView;
    const edge = this.facing === 1 ? (view?.x ?? this.projectileMinX) : (view?.right ?? this.projectileMaxX);
    return edge - this.facing * half;
  }

  /** Who it called (the Biriba on balloons) is still crossing the stage. */
  get carrierAloft(): boolean {
    return this.carrierInFlight();
  }

  /** A carrier (the Biriba) is still crossing the stage. */
  private carrierInFlight(): boolean {
    return this.projectiles.some(shot => shot.carrier);
  }

  /** What the carrier lets go of: it falls straight down where the opponent stood. */
  private dropFrom(carrier: TravelingProjectile & { carrier: NonNullable<TravelingProjectile['carrier']> }): TravelingProjectile {
    const drop = carrier.carrier.drop;
    const width = drop.hitWidth ?? 40;
    const height = drop.hitHeight ?? 40;
    const x = carrier.carrier.targetX;
    const y = carrier.y + 40 * this.appliedScale;
    const key = findCharacterAnimationKeyByAction(this.character.id, `fx-${drop.visualEffect}`);
    const visual = key
      ? this.scene.add.sprite(x, y, key, 0).setOrigin(.5, .5).setScale(this.appliedScale).setDepth(this.depthBase + 2).play(key)
      : this.scene.add.rectangle(x, y, width, height, 0x6b4423).setDepth(this.depthBase + 2);
    const profile = { ...getAttackProfile(this.combat(), 'kick'), height: 'high' as const, stunMs: drop.stunMs };
    // Lands on the drawn floor (where the shadows sit), so a mine is under the feet.
    return { x, previousX: x, y, vy: 0, gravity: drop.gravity ?? 1600, floorY: this.groundY - SHADOW_FOOT_OFFSET * this.appliedScale - height / 2,
      facing: carrier.facing, life: 5, signature: carrier.signature, visual, width, height, speed: 0,
      profile, connected: false, move: 'queda', persistOnHit: false, rangeAfterHit: 0, travelled: 0,
      initial: { width, height, scale: visual.scaleX, damage: profile.damage, stunMs: 0 },
      unblockable: true, hitEffect: drop.hitEffect, hitParticles: drop.hitParticles,
      mine: drop.mine ? { ...drop.mine, armed: false } : undefined };
  }

  /** Lands as a mine: sits on the ground, weaker, and goes away after `seconds` (blinking at the end). */
  private armMine(shot: TravelingProjectile & { mine: NonNullable<TravelingProjectile['mine']> }): void {
    shot.mine.armed = true;
    shot.gravity = 0;
    shot.vy = 0;
    shot.y = shot.floorY;
    shot.visual.y = shot.y;
    shot.life = shot.mine.seconds;
    // On the ground it is only a mine: weaker, and no head-hit stun.
    shot.profile = { ...shot.profile, damage: shot.profile.damage * shot.mine.damageFactor, stunMs: undefined };
    if ('anims' in shot.visual) shot.visual.anims.pause();
    this.scene.tweens?.add({ targets: shot.visual, alpha: 0.25, duration: 120, yoyo: true, repeat: 3,
      delay: Math.max(0, shot.mine.seconds - 1) * 1000 });
  }

  /** Square pixels bursting from a hit (poop bits, stink), on top of the splash. */
  private burstParticles(x: number, y: number, bursts: ParticleBurst[]): void {
    const add = this.scene.add as Partial<Phaser.GameObjects.GameObjectFactory> | undefined;
    if (!add?.particles || !this.scene.textures) return;
    if (!this.scene.textures.exists('fx-pixel')) {
      const pixel = this.scene.make.graphics({ x: 0, y: 0 }, false);
      pixel.fillStyle(0xffffff, 1).fillRect(0, 0, 4, 4);
      pixel.generateTexture('fx-pixel', 4, 4);
      pixel.destroy();
    }
    bursts.forEach((burst) => {
      const rises = (burst.gravity ?? 900) < 0;
      const emitter = this.scene.add.particles(x, y, 'fx-pixel', {
        speed: rises ? { min: 30, max: 110 } : { min: 160, max: 420 },
        angle: rises ? { min: 240, max: 300 } : { min: 200, max: 340 },
        gravityY: burst.gravity ?? 900,
        lifespan: rises ? { min: 700, max: 1200 } : { min: 550, max: 900 },
        scale: { start: (rises ? 3.2 : 2.6) * this.appliedScale, end: this.appliedScale },
        alpha: { start: 1, end: rises ? 0 : 0.6 },
        tint: burst.colors.map((cor) => parseInt(cor.replace('#', ''), 16)),
        emitting: false
      }).setDepth(this.depthBase + 3);
      emitter.explode(burst.count ?? 16);
      const seconds = burst.seconds ?? 0;
      if (seconds > 0) {
        // A lingering stink: a few more every 60 ms for `seconds`.
        emitter.setFrequency(60, 2);
        emitter.start();
        this.scene.time.delayedCall(seconds * 1000, () => emitter.stop());
      }
      this.scene.time.delayedCall(seconds * 1000 + 1400, () => emitter.destroy());
    });
  }

  private updateProjectile(seconds: number): void {
    const dropped: TravelingProjectile[] = [];
    this.projectiles = this.projectiles.filter(shot => {
    shot.previousX = shot.x;
    shot.x += shot.facing*shot.speed*seconds;
    if (shot.carrier && !shot.carrier.dropped && passedDropPoint(shot.previousX, shot.x, shot.carrier.targetX, shot.facing)) {
      shot.carrier.dropped = true;
      dropped.push(this.dropFrom(shot as TravelingProjectile & { carrier: NonNullable<TravelingProjectile['carrier']> }));
    }
    shot.travelled += Math.abs(shot.x - shot.previousX);
    if (shot.growth) {
      const progress = projectileGrowthProgress(shot.travelled, shot.growth.distance);
      const size = 1 + progress * (shot.growth.sizeMultiplier - 1);
      shot.width = shot.initial.width * size;
      shot.height = shot.initial.height * size;
      shot.visual.setScale(shot.initial.scale * size);
      shot.profile.damage = shot.initial.damage * (1 + progress * (shot.growth.damageMultiplier - 1));
      shot.profile.stunMs = shot.initial.stunMs + progress * (shot.growth.maxStunMs - shot.initial.stunMs);
    }
    // Arcing projectiles (the pipe) rise, fall and end on the ground.
    shot.vy += shot.gravity*seconds;
    shot.y += shot.vy*seconds;
    shot.life -= seconds;
    shot.visual.x = shot.x;
    shot.visual.y = shot.gravity > 0 ? shot.y : shot.visual.y;
    const landed = shot.gravity > 0 && shot.y >= shot.floorY;
    if (landed && shot.hitEffect) this.spawnEffect(shot.hitEffect, shot.x, shot.y + shot.height / 2);
    if (landed) this.som('projetil-acerto', null);
    if (landed && shot.mine && !shot.mine.armed) {
      this.armMine(shot as TravelingProjectile & { mine: NonNullable<TravelingProjectile['mine']> });
      return true;
    }
    if (landed || shot.life <= 0 || shot.x+shot.width/2 < this.projectileMinX-100 || shot.x-shot.width/2 > this.projectileMaxX+100 || this.defeated) {
      shot.visual.destroy();
      return false;
    }
    return true;
    });
    this.projectiles.push(...dropped);
  }

  /** Stars over the head while dizzy, at the top of the `stunned` drawing. */
  private updateTontura(): void {
    const tonto = !this.defeated && this.hitstunTimer > 0 && this.stunIsDizzy && !this.stunIsBlock;
    if (!tonto) {
      this.tontura?.setVisible(false);
      return;
    }
    if (!this.tontura) {
      if (!this.scene.textures?.exists(TONTURA_KEY)) return;
      if (!this.scene.anims.exists(TONTURA_KEY)) {
        this.scene.anims.create({ key: TONTURA_KEY, frames: this.scene.anims.generateFrameNumbers(TONTURA_KEY, {}), frameRate: 10, repeat: -1 });
      }
      this.tontura = this.scene.add.sprite(0, 0, TONTURA_KEY, 0).setOrigin(.5, .5).play(TONTURA_KEY);
    }
    const animation = getCharacterAnimationDefinition(this.character.id, this.actionKeys.stunned);
    const visual = animation.bounds[0]?.visual;
    if (!visual) return;
    const rect = this.frameRectToWorld(animation, visual);
    this.tontura
      .setPosition(rect.centerX, rect.y + 4 * this.appliedScale)
      .setScale(this.appliedScale * 0.8)
      .setDepth(this.depthBase + 1)
      .setVisible(true);
  }

  private clearProjectile(): void {
    this.projectiles.forEach(shot => shot.visual.destroy());
    this.projectiles = [];
  }

  /**
   * Redraws the enabled debug bounds (visual/collision/hit/attack) for the
   * fighter's current animation frame, driven by `debugStore.fighterPlayground.
   * bounds`. Boxes active on the current frame draw solid; boxes only active on
   * other frames draw faint using a representative rect.
   */
  private drawBoundsOverlay(): void {
    this.boundsGraphics.clear();

    const bounds = this.app.debugStore.getState().fighterPlayground.bounds;
    if (FIGHTER_BOUNDS_FIELDS.every((field) => !bounds[field.id])) {
      return;
    }

    const animKey = this.sprite.anims.currentAnim?.key ?? this.currentAnimKey;
    if (!animKey) {
      return;
    }

    const animation = getCharacterAnimationDefinition(this.character.id, animKey);
    if (animation.bounds.length === 0) {
      return;
    }

    const boundsFrame = this.resolvedFrame(animation);

    FIGHTER_BOUNDS_FIELDS.forEach((field) => {
      if (!bounds[field.id]) {
        return;
      }

      const active = boundsFrame[field.id];
      const rect = active ?? this.representativeBoundsRect(animation, field.id);
      if (!rect) {
        return;
      }

      this.strokeBoundsRect(animation, rect, BOUNDS_COLORS[field.id], active ? BOUNDS_ALPHA_ACTIVE : BOUNDS_ALPHA_INACTIVE);
    });
  }

  /**
   * Finds the first frame that defines the given bounds kind, used as a faint
   * placeholder on frames where that kind is inactive.
   * @param animation - The animation whose frames are scanned.
   * @param kind - The bounds kind to look up.
   */
  private representativeBoundsRect(
    animation: HeroAnimationDefinition,
    kind: keyof FighterBoundsVisibility
  ): Rect | null {
    for (const frame of animation.bounds) {
      const rect = frame[kind];
      if (rect) {
        return rect;
      }
    }

    return null;
  }

  /**
   * Strokes (and faintly fills) a frame-local rect in world space, accounting
   * for the fighter's origin, scale, and horizontal flip.
   * @param animation - The active animation (for frame dimensions).
   * @param rect - The frame-local rect to draw.
   * @param color - Stroke/fill colour.
   * @param alpha - Stroke alpha (fill uses a fraction of it).
   */
  private strokeBoundsRect(animation: HeroAnimationDefinition, rect: Rect, color: number, alpha: number): void {
    const world = this.frameRectToWorld(animation, rect);

    this.boundsGraphics.fillStyle(color, alpha * 0.18);
    this.boundsGraphics.fillRect(world.x, world.y, world.width, world.height);
    this.boundsGraphics.lineStyle(2, color, alpha);
    this.boundsGraphics.strokeRect(world.x, world.y, world.width, world.height);
  }

  /**
   * Converts a frame-local rect to a world-space rectangle, accounting for the
   * sprite's origin, scale, and horizontal flip.
   * @param animation - The active animation (for frame dimensions).
   * @param rect - The frame-local rect to convert.
   */
  private frameRectToWorld(animation: HeroAnimationDefinition, rect: Rect): Phaser.Geom.Rectangle {
    const frameWidth = animation.sheet.frameWidth;
    const left = this.sprite.x - this.sprite.displayWidth * this.sprite.originX;
    const top = this.sprite.y - this.sprite.displayHeight * this.sprite.originY;
    const scaleX = this.sprite.displayWidth / frameWidth;
    const scaleY = this.sprite.displayHeight / animation.sheet.frameHeight;
    const localX = this.sprite.flipX ? frameWidth - (rect.x + rect.width) : rect.x;

    return new Phaser.Geom.Rectangle(left + localX * scaleX, top + rect.y * scaleY, rect.width * scaleX, rect.height * scaleY);
  }

  /**
   * Resolves the current frame's bounds with the persisted Character Gym
   * overrides applied, so authored hit/attack/guard boxes drive live combat
   * (not just the gym preview).
   * @param animation - The active animation.
   */
  private resolvedFrame(animation: HeroAnimationDefinition): HeroBoundsFrame {
    const overrides = this.app.debugStore.getState().characterGym.boundsOverrides;

    return resolveHeroBoundsFrame(animation, this.currentFrameIndex(animation), overrides);
  }

  /**
   * Resolves the sprite's current animation frame index, clamped to range.
   * @param animation - The active animation.
   */
  private currentFrameIndex(animation: HeroAnimationDefinition): number {
    const frameName = Number(this.sprite.frame.name);
    const lastFrame = animation.sheet.frames - 1;

    if (Number.isFinite(frameName)) {
      return Phaser.Math.Clamp(frameName, 0, lastFrame);
    }

    return 0;
  }

  /** Keeps the ground shadow under the fighter and shrinks it as they rise. */
  private updateShadow(): void {
    const airborneLift = Phaser.Math.Clamp((this.groundY - this.sprite.y) / 220, 0, 1);

    this.shadow.x = this.posX;
    this.shadow.setScale(1 - airborneLift * 0.45);
    this.shadow.setAlpha(0.32 - airborneLift * 0.18);
  }
}
