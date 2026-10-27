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
import {
  dashPosition,
  jumpFlightFrame,
  jumpFrames,
  sweptInterval,
  type AttackMove,
  type GuardStance,
  type JumpFrames,
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
/**
 * After the charge wind-up completes, the fighter holds the charged pose for this
 * long before the special executes — the "super freeze" that lets the cut-in
 * cinematic land before the move launches.
 */
const SUPER_FREEZE_MS = 360;
/** Each wind-up frame of a jump, still on the ground, lasts this long. */
const JUMP_WINDUP_FRAME_SECONDS = 0.05;
/** Recovery squat held after touchdown before the fighter can act again. */
const JUMP_LANDING_SECONDS = 0.1;
/** Flying kick: the dive forward and down the moment the kick comes out. */
const FLYING_KICK_SPEED_X = 380;
const FLYING_KICK_DROP = 300;

/**
 * A live attack from a fighter on its current animation frame: the world-space
 * attack rectangle, the resolved damage/knockback/hitstun profile, and a
 * per-swing signature so a single swing only connects once.
 */
export interface ActiveAttack {
  facing?: 1 | -1;
  /** Which move this is: decides guard, dodge and armor rules (moveMechanics). */
  move: AttackMove;
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
  visual: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Sprite;
}

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
  lowKick: boolean;
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
  lowKick: false,
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
  lightPunch: string;
  heavy: string;
  /** Low kick button; null while the sheet is missing (the button does nothing). */
  lowKick: string | null;
  /** Light button in the air (`jump-punch`, or the light punch meanwhile). */
  airLight: string;
  /** Heavy button in the air: the flying kick (`jump-kick`, or a heavy kick meanwhile). */
  airHeavy: string;
  specialCharge: string;
  special: string;
  knockdown: string;
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
  private knockbackVel = 0;
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
    return this.grounded && this.locked && this.currentAnimKey === this.actionKeys.heavy;
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

    this.meter = Phaser.Math.Clamp(this.meter + amount, 0, METER_MAX);
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
    const shot = this.projectiles.find(projectile => !projectile.connected);
    if (shot && !this.defeated) {
      const sweep = sweptInterval(shot.previousX, shot.x, shot.width/2);
      return { rect: new Phaser.Geom.Rectangle(sweep.x, shot.y-shot.height/2, sweep.width, shot.height),
        profile: shot.profile, signature: shot.signature, move: shot.move,
        finisher: shot.profile.kind === 'special', facing: shot.facing };
    }
    if (this.currentAnimKey === this.actionKeys.special && this.character.moves?.special?.kind === 'projectile') {
      return null;
    }
    if (this.currentAnimKey === this.actionKeys.heavy && this.character.moves?.heavy?.kind === 'projectile') return null;
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
    if (kind === 'special' && this.character.moves?.special?.kind === 'dash') {
      const sweep = sweptInterval(this.previousSpecialX, this.posX, attackRect.width/2);
      attackRect.x = sweep.x;
      attackRect.width = sweep.width;
    }
    return {
      rect: attackRect,
      profile: getAttackProfile(this.combat(), kind),
      signature: this.attackId,
      finisher,
      move: this.currentMove()
    };
  }

  /** Marks the current swing as having connected so it can't hit again. */
  markAttackConnected(signature?: number): void {
    const shot = this.projectiles.find(projectile => !projectile.connected && (signature === undefined || projectile.signature === signature));
    if (shot) {
      shot.connected = true;
      if (!shot.persistOnHit) {
        shot.visual.destroy();
        this.projectiles = this.projectiles.filter(projectile => projectile !== shot);
      }
      return;
    }
    this.attackConnected = true;
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
    // Cancel pending action completion callbacks when a move is interrupted.
    this.sprite.removeAllListeners(`animationcomplete-${this.actionKeys.specialCharge}`);
    this.sprite.removeAllListeners(`animationcomplete-${this.actionKeys.special}`);
    this.sprite.removeAllListeners(`animationcomplete-${this.actionKeys.lightPunch}`);
    this.sprite.removeAllListeners(`animationcomplete-${this.actionKeys.heavy}`);
    this.sprite.removeAllListeners(`animationcomplete-${this.actionKeys.airHeavy}`);
    this.sprite.removeAllListeners(`animationcomplete-${this.actionKeys.airLight}`);
    if (this.actionKeys.lowKick) {
      this.sprite.removeAllListeners(`animationcomplete-${this.actionKeys.lowKick}`);
    }

    if (blocked) {
      this.knockbackVel = attackerFacing * profile.knockback * 0.35;
      this.hitstunTimer = Math.max(this.hitstunTimer, BLOCKSTUN_SECONDS);
      this.stunIsBlock = true;
      this.stunBlockLow = this.currentAnimKey === this.actionKeys.blockLow;
      this.locked = false;
      return;
    }

    this.health = Math.max(0, this.health - profile.damage);
    this.knockbackVel = attackerFacing * profile.knockback;

    if (this.health <= 0) {
      this.defeated = true;
      this.locked = true;
      this.grounded = true;
      this.stunIsBlock = false;
      this.hitstunTimer = 0;
      this.playState(this.actionKeys.knockdown, false);
      return;
    }

    this.stunIsBlock = false;
    this.locked = false;
    this.hitstunTimer = profile.hitstun / 1000;
    this.currentAnimKey = '';
    this.playState(this.actionKeys.hitHigh, false);
  }

  /**
   * Resets the fighter for a new round: restores health, repositions and faces,
   * clears combat state, and re-freezes until the round intro releases it.
   * @param x - The spawn x position.
   * @param facing - The spawn facing direction.
   */
  resetForRound(x: number, facing: 1 | -1): void {
    this.clearProjectile();
    this.jumpPhase = null;
    this.diveVelX = 0;
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
    if (!this.frozen) this.updateProjectile(seconds);
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
          : this.actionKeys.hitHigh,
        false
      );
      this.updateShadow();

      if (this.hitstunTimer === 0) {
        this.currentAnimKey = '';
      }

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
    if (input.light && this.canChainJab()) {
      // Quick punch: pressing again after the hit frames throws the next one.
      this.sprite.removeAllListeners(`animationcomplete-${this.actionKeys.lightPunch}`);
      this.sprite.stop();
      this.startOneShot(this.actionKeys.lightPunch);
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
    this.sprite?.removeAllListeners();
    this.sprite?.destroy();
    this.shadow?.destroy();
    this.boundsGraphics?.destroy();
  }

  /**
   * Resolves the per-action animation keys for this character, falling back to
   * the first available animation for any missing action.
   */
  private resolveActionKeys(): FighterActionKeys {
    const key = (action: string): string =>
      findCharacterAnimationKeyByAction(this.character.id, action) ?? this.character.animations[0].key;

    return {
      idle: key('idle'),
      walkForward: key('walk-forward'),
      walkBackward: key('walk-backward'),
      crouch: key('crouch'),
      jump: key('jump'),
      blockHigh: key('block-high'),
      blockLow: findCharacterAnimationKeyByAction(this.character.id, 'block-low') ?? key('block-high'),
      hitHigh: key('hit-high'),
      lightPunch: key('light-punch'),
      heavy:
        (this.character.moves?.heavy?.action ? key(this.character.moves.heavy.action) : undefined) ??
        findCharacterAnimationKeyByAction(this.character.id, 'heavy-kick') ??
        findCharacterAnimationKeyByAction(this.character.id, 'heavy-punch') ??
        key('light-punch'),
      lowKick: findCharacterAnimationKeyByAction(this.character.id, 'low-kick'),
      airLight: findCharacterAnimationKeyByAction(this.character.id, 'jump-punch') ?? key('light-punch'),
      airHeavy:
        findCharacterAnimationKeyByAction(this.character.id, 'jump-kick') ??
        findCharacterAnimationKeyByAction(this.character.id, 'heavy-kick') ??
        findCharacterAnimationKeyByAction(this.character.id, 'heavy-punch') ??
        key('light-punch'),
      specialCharge: findCharacterAnimationKeyByAction(this.character.id, 'special-charge') ?? key('crouch'),
      special: findCharacterAnimationKeyByAction(this.character.id, 'special') ?? key('heavy-kick'),
      knockdown: key('knockdown')
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
    if (this.currentAnimKey === this.actionKeys.lightPunch || this.currentAnimKey === this.actionKeys.airLight) {
      return 'high';
    }
    if (this.actionKeys.lowKick !== null && this.currentAnimKey === this.actionKeys.lowKick) {
      return 'lowKick';
    }
    if (this.currentAnimKey === this.actionKeys.heavy || this.currentAnimKey === this.actionKeys.airHeavy) {
      return 'low';
    }
    if (this.currentAnimKey === this.actionKeys.special) {
      return 'special';
    }

    return null;
  }

  /** Which catalog move the current strike is (air and ground share sheets). */
  private currentMove(): AttackMove {
    const key = this.currentAnimKey;
    if (key === this.actionKeys.special) {
      return 'especial';
    }
    if (key === this.actionKeys.lowKick) {
      return 'chute-baixo';
    }
    if (!this.grounded) {
      return key === this.actionKeys.airHeavy ? 'voadora' : 'soco-no-ar';
    }
    return key === this.actionKeys.heavy ? 'golpe-forte' : 'soco-rapido';
  }

  /** A quick punch past its last hit frame can be chained into the next one. */
  private canChainJab(): boolean {
    if (!this.grounded || !this.locked || this.currentAnimKey !== this.actionKeys.lightPunch) {
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
      this.startAirAttack(airStrike === 'light' ? this.actionKeys.airLight : this.actionKeys.airHeavy);
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
    if (input.special && this.isMeterReady) {
      this.startSpecial();
      return;
    }
    if (input.jump) {
      this.startJump();
      return;
    }
    if (input.light) {
      this.startOneShot(this.actionKeys.lightPunch);
      return;
    }
    if (input.heavy) {
      this.startOneShot(this.actionKeys.heavy);
      return;
    }
    if (input.lowKick && this.actionKeys.lowKick) {
      this.startOneShot(this.actionKeys.lowKick);
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
      return;
    }

    this.playState(this.actionKeys.idle, true);
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
  private startOneShot(animKey: string): void {
    this.specialClock = 0;
    this.shotReleased = false;
    this.locked = true;
    this.currentAnimKey = animKey;
    this.currentReverse = false;
    this.attackId += 1;
    this.attackConnected = false;
    this.sprite.play({ key: animKey, repeat: 0 }, true);
    this.sprite.once(`animationcomplete-${animKey}`, () => {
      this.locked = false;
      this.currentAnimKey = '';

      if (this.grounded) {
        this.playState(this.actionKeys.idle, true);
      }
    });
  }

  /**
   * Performs the meter special: consumes the full meter, plays the charge
   * (wind-up) animation, then chains into the multi-hit execution animation, and
   * finally returns to idle. The execution's attack-active spans each open a new
   * hit window so the move lands a combo.
   */
  private startSpecial(): void {
    this.locked = true;
    this.meter = 0;
    this.currentReverse = false;
    this.attackConnected = true;
    this.attackActiveLast = false;

    this.onSpecialStart?.(this);
    spawnChargeAura(this.scene, this.sprite.x, this.sprite.y - this.sprite.displayHeight * 0.45);

    this.currentAnimKey = this.actionKeys.specialCharge;
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
    this.specialClock = 0;
    this.shotReleased = false;
    this.dashFrom = this.posX;
    this.previousSpecialX = this.posX;
    this.dashTo = this.facing === 1 ? this.maxX : this.minX;
    this.currentAnimKey = this.actionKeys.special;
    this.attackId += 1;
    this.attackConnected = false;
    this.attackActiveLast = false;
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
  private startAirAttack(animKey: string): void {
    this.jumpPhase = 'attack';
    this.airAttackUsed = true;
    this.currentAnimKey = animKey;
    this.attackId += 1;
    this.attackConnected = false;
    this.attackActiveLast = false;
    let startFrame = 0;
    if (animKey === this.actionKeys.airHeavy) {
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
      this.jumpPhase = 'air';
      this.currentAnimKey = this.actionKeys.jump;
      this.showJumpFrame(this.jumpAirFrame());
    });
  }

  /** Touchdown: cancels an unfinished air strike and holds the landing squat. */
  private startLanding(): void {
    this.diveVelX = 0;
    this.sprite.removeAllListeners(`animationcomplete-${this.actionKeys.airLight}`);
    this.sprite.removeAllListeners(`animationcomplete-${this.actionKeys.airHeavy}`);
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
      : this.currentAnimKey === this.actionKeys.heavy ? this.character.moves?.heavy : undefined;
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
      this.spawnProjectile(move, isSpecial ? 'special' : 'low');
    }
  }

  private spawnProjectile(move: ProjectileMoveConfig, kind: AttackKind): void {
    const width = move.hitWidth ?? 12;
    const height = move.hitHeight ?? 12;
    const x = this.posX+this.facing*(move.visualFile ? width/2+20 : 90*this.appliedScale);
    const baseline = this.groundY-24*this.appliedScale;
    const y = move.visualFile ? baseline-height/2 : this.groundY-175*this.appliedScale;
    const visual = move.visualFile
      ? this.scene.add.sprite(x, baseline, `${this.character.id}-special-effect`, 0)
        .setOrigin(.5, 1).setScale(move.visualScale ?? 2).setFlipX(this.facing === 1)
        .setDepth(this.depthBase+2).play(`${this.character.id}-special-effect`)
      : this.scene.add.rectangle(x, y, 14, 5, 0xffdf8a).setDepth(this.depthBase+1);
    const life = move.visualFile ? (this.projectileMaxX-this.projectileMinX+width)/(move.speed ?? 900)+1 : 2;
    this.projectiles.push({x, previousX:x, y, facing:this.facing, life,
      signature:this.attackId, visual, width, height, speed:move.speed ?? 900,
      profile:{...getAttackProfile(this.combat(), kind), height:'high'}, connected:false,
      move: kind === 'special' ? 'onda' : 'tiro',
      persistOnHit:move.persistOnHit ?? false});
  }

  private updateProjectile(seconds: number): void {
    this.projectiles = this.projectiles.filter(shot => {
    shot.previousX = shot.x;
    shot.x += shot.facing*shot.speed*seconds;
    shot.life -= seconds;
    shot.visual.x = shot.x;
    if (shot.life <= 0 || shot.x+shot.width/2 < this.projectileMinX-100 || shot.x-shot.width/2 > this.projectileMaxX+100 || this.defeated) {
      shot.visual.destroy();
      return false;
    }
    return true;
    });
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
