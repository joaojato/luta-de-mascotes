import { describe, expect, it } from 'vitest';
import { projectileGrowthProgress, advanceStop, armorAbsorbs, DoubleTapDetector, isPerfectGuard, PERFECT_GUARD_SECONDS, dashPosition, ducksUnder, frameDurations, guardBreakStunMs, guardHolds, jumpFlightFrame, jumpFrames, jumpsOver, meteorDiveStart, specialDodged, strikeTravelStep, sweptInterval } from './moveMechanics';

describe('special traversal and flight timing', () => {
  it('holds the charge position, traverses continuously and stays at the destination during recovery', () => {
    expect(dashPosition(100, 900, .1, .2, .6)).toBe(100);
    expect(dashPosition(100, 900, .4, .2, .6)).toBeCloseTo(500);
    expect(dashPosition(100, 900, 1, .2, .6)).toBe(900);
    expect(dashPosition(900, 100, .4, .2, .6)).toBeCloseTo(500);
  });
  it('spreads the flight frames over the whole arc, reaching the last airborne frame', () => {
    expect(jumpFlightFrame(0, .8, 2, 4)).toBe(2);
    expect(jumpFlightFrame(.4, .8, 2, 4)).toBe(3);
    expect(jumpFlightFrame(.75, .8, 2, 4)).toBe(4);
    expect(jumpFlightFrame(1, .8, 2, 4)).toBe(4);
  });
  it('splits a jump sheet in the Urubu model unless the fighter says otherwise', () => {
    expect(jumpFrames(8)).toEqual({takeoff:3, airEnd:7, land:2});
    expect(jumpFrames(6, {takeoff:2, airEnd:4, land:5})).toEqual({takeoff:2, airEnd:4, land:5});
    expect(jumpFrames(2)).toEqual({takeoff:1, airEnd:1, land:0});
  });
  it('guards: low kick and heavy punch break the standing guard, only the flying kick breaks the crouching one', () => {
    const moves = ['soco-rapido', 'soco-forte', 'chute-basico', 'chute-baixo', 'soco-no-ar', 'voadora', 'especial', 'tiro', 'onda', 'nuvem', 'cachimbo'] as const;
    for (const move of moves) {
      expect(guardHolds(move, 'alta')).toBe(move !== 'chute-baixo' && move !== 'soco-forte');
      expect(guardHolds(move, 'baixa')).toBe(move !== 'voadora');
    }
    expect(guardHolds('especial', null)).toBe(false);
  });
  it('times each frame: listed ranges get their own ms, the rest follow the frame rate', () => {
    expect(frameDurations(6, 10, undefined)).toEqual([100, 100, 100, 100, 100, 100]);
    expect(frameDurations(6, 10, [{ frames: [0, 2], ms: 40 }, { frames: [3, 3], ms: 150 }])).toEqual([40, 40, 40, 150, 100, 100]);
  });
  it('stuns a broken standing guard for 0.3 s and a broken crouching guard for 0.6 s', () => {
    expect(guardBreakStunMs('chute-baixo', 'alta')).toBe(300);
    expect(guardBreakStunMs('soco-forte', 'alta')).toBe(300);
    expect(guardBreakStunMs('voadora', 'baixa')).toBe(600);
    expect(guardBreakStunMs('voadora', 'alta')).toBeNull();
    expect(guardBreakStunMs('soco-forte', 'baixa')).toBeNull();
    expect(guardBreakStunMs('chute-baixo', null)).toBeNull();
  });
  it('ducks the quick punch, the shot and the pipe; jumps over both projectiles', () => {
    expect(ducksUnder('soco-rapido', true)).toBe(true);
    expect(ducksUnder('tiro', true)).toBe(true);
    expect(ducksUnder('cachimbo', true)).toBe(true);
    expect(ducksUnder('cachimbo', false)).toBe(false);
    expect(ducksUnder('onda', true)).toBe(false);
    expect(ducksUnder('soco-no-ar', true)).toBe(false);
    expect(ducksUnder('soco-rapido', false)).toBe(false);
    expect(jumpsOver('tiro', true)).toBe(true);
    expect(jumpsOver('onda', true)).toBe(true);
    expect(jumpsOver('soco-rapido', true)).toBe(false);
    expect(jumpsOver('tiro', false)).toBe(false);
  });
  it('lets a heavy absorb only the quick punch', () => {
    expect(armorAbsorbs('soco-rapido', true)).toBe(true);
    expect(armorAbsorbs('chute-baixo', true)).toBe(false);
    expect(armorAbsorbs('soco-rapido', false)).toBe(false);
  });
  it('escapes each special only the way its JSON says', () => {
    const parado = { airborne: false, ducking: false, movingAway: false };
    expect(specialDodged('pulo', { ...parado, airborne: true })).toBe(true);
    expect(specialDodged('pulo', { ...parado, ducking: true })).toBe(false);
    expect(specialDodged('agachar', { ...parado, ducking: true })).toBe(true);
    expect(specialDodged('agachar', { ...parado, airborne: true })).toBe(false);
    expect(specialDodged('pulo-recuando', { ...parado, airborne: true })).toBe(false);
    expect(specialDodged('pulo-recuando', { ...parado, movingAway: true })).toBe(false);
    expect(specialDodged('pulo-recuando', { airborne: true, ducking: false, movingAway: true })).toBe(true);
    expect(specialDodged(undefined, { airborne: true, ducking: true, movingAway: true })).toBe(false);
  });
  it('stops an advance short of the target and never steps back', () => {
    expect(advanceStop(100, 600, 120)).toBe(480);
    expect(advanceStop(600, 100, 120)).toBe(220);
    expect(advanceStop(500, 560, 120)).toBe(500);
  });

  it('spreads a strike slide over its frames only', () => {
    const slide = { frames: [4, 8], distance: 100 };
    expect(strikeTravelStep(slide, 3, 14, 1 / 14)).toBe(0);
    expect(strikeTravelStep(slide, 9, 14, 1 / 14)).toBe(0);
    // Five moving frames at 14 FPS: one frame's time moves a fifth of the distance.
    expect(strikeTravelStep(slide, 4, 14, 1 / 14)).toBeCloseTo(20);
    expect(strikeTravelStep(slide, 8, 14, 1 / 14)).toBeCloseTo(20);
    expect(meteorDiveStart(700, 600, 0, 1)).toEqual({ x: 100, y: 0 });
    expect(meteorDiveStart(700, 600, 0, -1)).toEqual({ x: 1300, y: 0 });
  });
  it('covers the complete path of a fast shot in either direction', () => {
    expect(sweptInterval(100, 300, 6)).toEqual({x:94, width:212});
    expect(sweptInterval(300, 100, 6)).toEqual({x:94, width:212});
  });
});

describe('guarda perfeita (GDD, 29/10/2026)', () => {
  it('vale só para golpe corpo a corpo defendido logo depois de apertar a defesa', () => {
    expect(isPerfectGuard(true, false, 0)).toBe(true);
    expect(isPerfectGuard(true, false, PERFECT_GUARD_SECONDS)).toBe(true);
    expect(isPerfectGuard(true, false, PERFECT_GUARD_SECONDS + 0.01)).toBe(false);
    expect(isPerfectGuard(true, false, null)).toBe(false);
  });
  it('só é perfeita a guarda que segura aquele golpe (João, 29/10/2026)', () => {
    // Soco forte e chute baixo quebram a defesa em pé; voadora quebra a agachada.
    expect(isPerfectGuard(guardHolds('soco-forte', 'alta'), false, 0)).toBe(false);
    expect(isPerfectGuard(guardHolds('chute-baixo', 'alta'), false, 0)).toBe(false);
    expect(isPerfectGuard(guardHolds('voadora', 'baixa'), false, 0)).toBe(false);
    // Na guarda que segura, o mesmo golpe pode ser defendido perfeito.
    expect(isPerfectGuard(guardHolds('soco-forte', 'baixa'), false, 0)).toBe(true);
    expect(isPerfectGuard(guardHolds('voadora', 'alta'), false, 0)).toBe(true);
  });
  it('projétil e guarda que não segurou nunca são perfeitos', () => {
    expect(isPerfectGuard(true, true, 0)).toBe(false);
    expect(isPerfectGuard(false, false, 0)).toBe(false);
  });
});

describe('dash por toque duplo (GDD, 29/10/2026)', () => {
  it('dois toques na mesma direção em até 0,3 s viram dash nessa direção', () => {
    const toque = new DoubleTapDetector();
    expect(toque.feed(1, 0)).toBe(0);
    expect(toque.feed(0, .05)).toBe(0);
    expect(toque.feed(1, .15)).toBe(1);
    // O terceiro toque não emenda outro dash sozinho.
    expect(toque.feed(0, .2)).toBe(0);
    expect(toque.feed(1, .3)).toBe(0);
  });
  it('segurar, demorar ou trocar de lado não é dash', () => {
    const segurando = new DoubleTapDetector();
    [0, .05, .1, .2].forEach((t) => expect(segurando.feed(-1, t)).toBe(0));
    const lento = new DoubleTapDetector();
    lento.feed(1, 0); lento.feed(0, .1);
    expect(lento.feed(1, .45)).toBe(0);
    const trocou = new DoubleTapDetector();
    trocou.feed(1, 0); trocou.feed(0, .05);
    expect(trocou.feed(-1, .1)).toBe(0);
  });
});

describe('distance-based projectile growth', () => {
  it('starts small, grows equally in both directions and caps at the maximum', () => {
    expect(projectileGrowthProgress(0, 700)).toBe(0);
    expect(projectileGrowthProgress(350, 700)).toBe(.5);
    expect(projectileGrowthProgress(-350, 700)).toBe(.5);
    expect(projectileGrowthProgress(700, 700)).toBe(1);
    expect(projectileGrowthProgress(1400, 700)).toBe(1);
  });
});
