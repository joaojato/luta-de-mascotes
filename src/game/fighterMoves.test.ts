import { describe, expect, it, vi } from 'vitest';
import type * as Phaser from 'phaser';
import type { AppContext } from './context';
import { Fighter, NEUTRAL_FIGHTER_INPUT } from './fighter';
import { createDefaultFighterPlaygroundState } from './fighterConfig';

vi.mock('phaser', () => ({
  Math: { Clamp: (v: number, min: number, max: number) => Math.max(min, Math.min(max, v)) },
  Geom: { Rectangle: class { constructor(public x: number, public y: number, public width: number, public height: number) {} } }
}));
vi.mock('./vfx', () => ({ spawnChargeAura: vi.fn() }));

function setup(characterId: string, facing: 1 | -1 = 1) {
  const events = new Map<string, () => void>();
  const delays: Array<() => void> = [];
  const visual = { x: 0, setDepth() { return this; }, destroy: vi.fn() };
  const effectVisual = { x:0, y:0, setDepth() {return this;}, setOrigin() {return this;},
    setScale() {return this;}, setFlipX() {return this;}, play() {return this;}, once() {return this;},
    setPosition(x: number, y: number) { this.x=x; this.y=y; return this; }, destroy:vi.fn() };
  const sprite = {
    x: 200, y: 500, displayWidth: 358.4, displayHeight: 358.4, originX: .5, originY: 255/256,
    flipX: false, frame: { name: 0 },
    anims: { currentAnim: {key: ''}, pause: vi.fn(), resume: vi.fn() },
    setOrigin(x: number, y: number) { this.originX=x; this.originY=y; return this; },
    setScale() { return this; }, setFlipX(v: boolean) { this.flipX=v; return this; }, setDepth() { return this; },
    setFrame(v: number) { this.frame.name=v; return this; },
    setPosition(x: number, y: number) { this.x=x; this.y=y; return this; },
    play(config: {key: string; startFrame?: number}) { this.anims.currentAnim.key=config.key; this.frame.name=config.startFrame ?? 0; return this; },
    stop() { return this; },
    once(event: string, callback: () => void) { events.set(event, callback); return this; },
    removeAllListeners(event?: string) { if (event) events.delete(event); else events.clear(); return this; },
    destroy() {}
  };
  const shadow = { x: 0, setAlpha() { return this; }, setDepth() { return this; }, setScale() { return this; }, destroy() {} };
  let spriteCalls = 0;
  const scene = { add: { sprite: (x: number) => {
    if (spriteCalls++ === 0) return sprite;
    effectVisual.x=x;
    return effectVisual;
  }, ellipse: () => shadow, rectangle: () => visual,
    graphics: () => ({ setDepth() { return this; }, clear() {} }) },
    time: { delayedCall: (_ms: number, fn: () => void) => delays.push(fn) } } as unknown as Phaser.Scene;
  const state = { fighterPlayground: createDefaultFighterPlaygroundState(), characterGym: { boundsOverrides: {} } };
  const app = { debugStore: { getState: () => state } } as unknown as AppContext;
  const fighter = new Fighter({scene, app, characterId, x:200, groundY:500, facing, minX:40, maxX:960});
  fighter.setFrozen(false);
  function complete(action: string) {
    const event = `animationcomplete-${characterId}-${action}`;
    const callback = events.get(event);
    events.delete(event);
    callback?.();
  }
  function special() {
    fighter.fillMeter();
    fighter.update(0, {...NEUTRAL_FIGHTER_INPUT, special:true});
    complete('special-charge');
    delays.splice(0).forEach(fn => fn());
  }
  return {fighter, sprite, special, complete, visual, effectVisual, delays};
}

describe('fighter move integration', () => {
  it('keeps Saci grounded during preparation, follows the flight arc and lands', () => {
    const {fighter, sprite} = setup('saci');
    fighter.update(0, {...NEUTRAL_FIGHTER_INPUT, jump:true});
    fighter.update(.03, NEUTRAL_FIGHTER_INPUT);
    expect(sprite.y).toBe(500);
    fighter.update(.03, NEUTRAL_FIGHTER_INPUT);
    expect(sprite.y).toBeLessThan(500);
    expect(sprite.frame.name).toBeGreaterThanOrEqual(2);
    for (let i=0; i<80; i++) {
      fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
      if (sprite.y < 500) expect(sprite.frame.name).toBeLessThanOrEqual(4);
    }
    expect(sprite.y).toBe(500);
    expect(sprite.anims.currentAnim.key).toBe('saci-idle');
  });
  it('squats only on the ground and never replays the wind-up in the air (Urubu model)', () => {
    const {fighter, sprite} = setup('urubu');
    fighter.update(0, {...NEUTRAL_FIGHTER_INPUT, jump:true});
    expect(sprite.anims.currentAnim.key).toBe('urubu-jump');
    fighter.update(.06, NEUTRAL_FIGHTER_INPUT);
    expect(sprite.y).toBe(500);
    expect(sprite.frame.name).toBe(2);
    fighter.update(.05, NEUTRAL_FIGHTER_INPUT);
    expect(sprite.y).toBeLessThan(500);
    let previous = 3;
    while (sprite.y < 500) {
      expect(sprite.frame.name).toBeGreaterThanOrEqual(previous);
      previous = sprite.frame.name;
      fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
    }
    expect(previous).toBe(7);
    expect(sprite.frame.name).toBe(2);
    fighter.update(.12, NEUTRAL_FIGHTER_INPUT);
    fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
    expect(sprite.anims.currentAnim.key).toBe('urubu-idle');
  });
  it('throws one strike per jump that reaches a crouching defender, then lands', () => {
    const {fighter, sprite, complete} = setup('urubu');
    fighter.update(0, {...NEUTRAL_FIGHTER_INPUT, jump:true});
    fighter.update(.11, NEUTRAL_FIGHTER_INPUT);
    fighter.update(1/60, {...NEUTRAL_FIGHTER_INPUT, heavy:true});
    expect(sprite.anims.currentAnim.key).toBe('urubu-heavy-kick');
    expect(sprite.frame.name).toBe(3);
    const before = fighter.x;
    const kick = fighter.getActiveAttack()!;
    expect(kick.move).toBe('voadora');
    expect(kick.profile.kind).toBe('kick');
    fighter.update(.05, NEUTRAL_FIGHTER_INPUT);
    expect(fighter.x).toBeGreaterThan(before + 15);
    complete('heavy-kick');
    expect(sprite.anims.currentAnim.key).toBe('urubu-jump');
    fighter.update(1/60, {...NEUTRAL_FIGHTER_INPUT, light:true});
    expect(sprite.anims.currentAnim.key).toBe('urubu-jump');
    for (let i=0; i<90; i++) fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
    expect(sprite.y).toBe(500);
    expect(sprite.anims.currentAnim.key).toBe('urubu-idle');
  });
  it('ducks while crouching or crouch-blocking, and stands up when released', () => {
    const {fighter} = setup('urubu');
    fighter.update(1/60, {...NEUTRAL_FIGHTER_INPUT, crouch:true});
    expect(fighter.isDucking).toBe(true);
    fighter.update(1/60, {...NEUTRAL_FIGHTER_INPUT, crouch:true, block:true});
    expect(fighter.isDucking).toBe(true);
    fighter.update(1/60, {...NEUTRAL_FIGHTER_INPUT, block:true});
    expect(fighter.isDucking).toBe(false);
    fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
    expect(fighter.isDucking).toBe(false);
  });
  it('chains quick punches after the hit frames, never during them', () => {
    const {fighter, sprite} = setup('urubu');
    fighter.update(0, {...NEUTRAL_FIGHTER_INPUT, light:true});
    sprite.frame.name = 1;
    const first = fighter.getActiveAttack()!;
    expect(first.move).toBe('soco-rapido');
    sprite.frame.name = 3;
    fighter.update(0, {...NEUTRAL_FIGHTER_INPUT, light:true});
    expect(fighter.getActiveAttack()!.signature).toBe(first.signature);
    sprite.frame.name = 4;
    fighter.update(0, {...NEUTRAL_FIGHTER_INPUT, light:true});
    sprite.frame.name = 1;
    expect(fighter.getActiveAttack()!.signature).toBeGreaterThan(first.signature);
  });
  it('keeps the heavy punch going under quick punches (armor) and reports the guard held', () => {
    const {fighter, sprite} = setup('urubu');
    fighter.update(0, {...NEUTRAL_FIGHTER_INPUT, light:true, crouch:true});
    expect(fighter.isInHeavy).toBe(true);
    const health = fighter.health01;
    fighter.applyHit({kind:'high', height:'high', damage:5, knockback:100, hitstun:300}, -1, false, true);
    expect(fighter.health01).toBeLessThan(health);
    expect(sprite.anims.currentAnim.key).toBe('urubu-heavy-punch');
    expect(fighter.isInHeavy).toBe(true);
    const guard = setup('urubu').fighter;
    guard.update(1/60, {...NEUTRAL_FIGHTER_INPUT, block:true});
    expect(guard.guardStance).toBe('alta');
    guard.update(1/60, {...NEUTRAL_FIGHTER_INPUT, block:true, crouch:true});
    expect(guard.guardStance).toBe('baixa');
  });
  it('keeps a strike pressed during the jump wind-up and throws it on takeoff', () => {
    const {fighter, sprite} = setup('urubu');
    fighter.update(0, {...NEUTRAL_FIGHTER_INPUT, jump:true});
    fighter.update(.02, {...NEUTRAL_FIGHTER_INPUT, heavy:true});
    expect(sprite.anims.currentAnim.key).toBe('urubu-jump');
    fighter.update(.1, NEUTRAL_FIGHTER_INPUT);
    expect(sprite.anims.currentAnim.key).toBe('urubu-heavy-kick');
  });
  it('turns the two attack buttons into four moves with down held', () => {
    const cases: [Partial<typeof NEUTRAL_FIGHTER_INPUT>, string, string][] = [
      [{light:true}, 'soco-rapido', 'urubu-light-punch'],
      [{light:true, crouch:true}, 'soco-forte', 'urubu-heavy-punch'],
      [{heavy:true}, 'chute-basico', 'urubu-heavy-kick'],
      [{heavy:true, crouch:true}, 'chute-baixo', 'urubu-heavy-kick']
    ];
    for (const [input, move, sheet] of cases) {
      const {fighter, sprite} = setup('urubu');
      fighter.update(0, {...NEUTRAL_FIGHTER_INPUT, ...input});
      expect(sprite.anims.currentAnim.key).toBe(sheet);
      sprite.frame.name = move === 'soco-rapido' ? 1 : move === 'soco-forte' ? 2 : 4;
      expect(fighter.getActiveAttack()?.move).toBe(move);
    }
    const saci = setup('saci');
    saci.fighter.update(0, {...NEUTRAL_FIGHTER_INPUT, light:true, crouch:true});
    expect(saci.sprite.anims.currentAnim.key).toBe('saci-heavy-punch');
  });
  it('falls back to the ground when struck in the air', () => {
    const {fighter, sprite} = setup('urubu');
    fighter.update(0, {...NEUTRAL_FIGHTER_INPUT, jump:true});
    fighter.update(.11, NEUTRAL_FIGHTER_INPUT);
    fighter.update(.1, NEUTRAL_FIGHTER_INPUT);
    expect(sprite.y).toBeLessThan(500);
    fighter.applyHit({kind:'high', height:'high', damage:5, knockback:0, hitstun:3000}, -1, false);
    for (let i=0; i<60; i++) fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
    expect(sprite.y).toBe(500);
  });
  it('moves Saci continuously to either far boundary during the tornado', () => {
    for (const facing of [1, -1] as const) {
      const {fighter, special} = setup('saci', facing);
      special();
      fighter.update(.1, NEUTRAL_FIGHTER_INPUT);
      expect(fighter.x).toBe(200);
      fighter.update(.2, NEUTRAL_FIGHTER_INPUT);
      expect(fighter.x).toBeGreaterThan(40);
      expect(fighter.x).toBeLessThan(960);
      fighter.update(.3, NEUTRAL_FIGHTER_INPUT);
      expect(fighter.x).toBe(facing === 1 ? 960 : 40);
    }
  });
  it('releases one traveling shot, retains it after recovery, keeps its direction and consumes it on impact', () => {
    const {fighter, sprite, complete, visual} = setup('almirante');
    fighter.update(0, {...NEUTRAL_FIGHTER_INPUT, heavy:true});
    expect(sprite.anims.currentAnim.key).toBe('almirante-shot');
    expect(fighter.meter01).toBeLessThan(.01);
    fighter.update(.2, NEUTRAL_FIGHTER_INPUT);
    expect(fighter.getActiveAttack()).toBeNull();
    fighter.update(.06, NEUTRAL_FIGHTER_INPUT);
    const initial = fighter.getActiveAttack()!;
    expect(initial.facing).toBe(1);
    expect(initial.move).toBe('tiro');
    complete('shot');
    fighter.faceToward(40);
    fighter.update(.1, NEUTRAL_FIGHTER_INPUT);
    const moving = fighter.getActiveAttack()!;
    expect(moving.rect.x+moving.rect.width).toBeGreaterThan(initial.rect.x+initial.rect.width);
    expect(moving.facing).toBe(1);
    fighter.markAttackConnected();
    expect(fighter.getActiveAttack()).toBeNull();
    expect(visual.destroy).toHaveBeenCalledOnce();
  });
  it('clears a shot on round reset and cancels a special interrupted during its freeze', () => {
    const first = setup('almirante');
    first.fighter.update(0, {...NEUTRAL_FIGHTER_INPUT, heavy:true});
    first.fighter.update(.3, NEUTRAL_FIGHTER_INPUT);
    first.fighter.resetForRound(200, 1);
    expect(first.fighter.getActiveAttack()).toBeNull();
    expect(first.visual.destroy).toHaveBeenCalledOnce();
    const second = setup('saci');
    second.fighter.fillMeter();
    second.fighter.update(0, {...NEUTRAL_FIGHTER_INPUT, special:true});
    second.complete('special-charge');
    second.fighter.applyHit({kind:'high', height:'high', damage:5, knockback:0, hitstun:100}, 1, false);
    second.delays.forEach(fn => fn());
    expect(second.sprite.anims.currentAnim.key).toBe('saci-hit-high');
  });
  it('launches an animated caravel wave, keeps crossing after a hit and removes it beyond the arena', () => {
    const {fighter, special, complete, effectVisual} = setup('almirante');
    fighter.setProjectileBounds(0, 2600);
    special();
    fighter.update(.11, NEUTRAL_FIGHTER_INPUT);
    const wave = fighter.getActiveAttack()!;
    expect(wave.profile.kind).toBe('special');
    expect(wave.move).toBe('onda');
    expect(wave.rect.height).toBe(220);
    expect(fighter.meter01).toBeLessThan(.01);
    complete('special');
    fighter.markAttackConnected(wave.signature);
    expect(fighter.getActiveAttack()).toBeNull();
    const before = effectVisual.x;
    fighter.update(.1, NEUTRAL_FIGHTER_INPUT);
    expect(effectVisual.x).toBeGreaterThan(before);
    expect(effectVisual.destroy).not.toHaveBeenCalled();
    fighter.update(2, NEUTRAL_FIGHTER_INPUT);
    expect(effectVisual.x).toBeGreaterThan(960);
    expect(effectVisual.destroy).not.toHaveBeenCalled();
    fighter.update(4, NEUTRAL_FIGHTER_INPUT);
    expect(effectVisual.destroy).toHaveBeenCalledOnce();
  });
});

describe('special meter', () => {
  it('fills on its own over the configured fight time', () => {
    const {fighter} = setup('urubu');
    for (let i = 0; i < 44; i++) fighter.update(1, NEUTRAL_FIGHTER_INPUT);
    expect(fighter.isMeterReady).toBe(false);
    fighter.update(1.5, NEUTRAL_FIGHTER_INPUT);
    expect(fighter.isMeterReady).toBe(true);
  });
});

describe('advance specials', () => {
  function opponent(x: number) {
    return { x, isAirborne: false } as unknown as Fighter;
  }
  function charged(characterId: string, foe: Fighter) {
    const ctx = setup(characterId);
    ctx.fighter.setOpponent(foe);
    ctx.special();
    return ctx;
  }

  it('Bira gallops until in reach, then pounces and bites once in the air (jump escapes)', () => {
    const foe = opponent(800);
    const {fighter, sprite} = charged('cachorro', foe);
    expect(sprite.anims.currentAnim.key).toBe('cachorro-special-run');
    expect(fighter.getActiveAttack()).toBeNull();
    for (let i = 0; i < 120 && sprite.anims.currentAnim.key === 'cachorro-special-run'; i++) {
      fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
      expect(fighter.getActiveAttack()).toBeNull();
    }
    expect(fighter.x).toBe(800 - 230);
    let bite = null as ReturnType<Fighter['getActiveAttack']>;
    let highest = 500;
    for (let i = 0; i < 40 && !bite; i++) {
      fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
      highest = Math.min(highest, sprite.y);
      bite = fighter.getActiveAttack();
    }
    expect(bite?.dodge).toBe('pulo');
    expect(highest).toBeLessThan(470);
    for (let i = 0; i < 60; i++) fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
    expect(sprite.anims.currentAnim.key).toBe('cachorro-idle');
  });

  it('Galo hops low toward the head, lands, and the peck is ducked', () => {
    const {fighter, sprite} = charged('galo', opponent(600));
    let highest = 500;
    let peck = null as ReturnType<Fighter['getActiveAttack']>;
    for (let i = 0; i < 60; i++) {
      fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
      highest = Math.min(highest, sprite.y);
      peck = peck ?? fighter.getActiveAttack();
    }
    expect(highest).toBeLessThan(470);
    expect(highest).toBeGreaterThan(440);
    expect(fighter.x).toBe(600 - 110);
    expect(peck?.dodge).toBe('agachar');
    expect(sprite.y).toBe(500);
  });

  it('Urubu leaves the screen, locks the target when the dive starts and hits there', () => {
    const foe = opponent(650);
    const {fighter, sprite} = charged('urubu', foe);
    for (let i = 0; i < 40 && sprite.y > -20; i++) fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
    expect(sprite.y).toBeLessThan(-20);
    (foe as unknown as {x: number}).x = 800;
    for (let i = 0; i < 26; i++) fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
    (foe as unknown as {x: number}).x = 400;
    let meteor = null as ReturnType<Fighter['getActiveAttack']>;
    for (let i = 0; i < 30 && sprite.y < 500; i++) {
      fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
      meteor = meteor ?? fighter.getActiveAttack();
    }
    expect(sprite.y).toBe(500);
    expect(fighter.x).toBe(800);
    expect(meteor?.unblockable).toBe(true);
    expect(meteor?.dodge).toBe('pulo-recuando');
    for (let i = 0; i < 20; i++) fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
    expect(sprite.anims.currentAnim.key).toBe('urubu-idle');
  });
});
