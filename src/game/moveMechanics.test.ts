import { describe, expect, it } from 'vitest';
import { advanceStop, armorAbsorbs, dashPosition, ducksUnder, guardHolds, jumpFlightFrame, jumpFrames, jumpsOver, meteorDiveStart, specialDodged, sweptInterval } from './moveMechanics';

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
  it('guards: heavy breaks the crouching guard, low kick and flying kick break the standing one', () => {
    expect(guardHolds('soco-rapido', 'alta')).toBe(true);
    expect(guardHolds('soco-rapido', 'baixa')).toBe(true);
    expect(guardHolds('soco-forte', 'alta')).toBe(true);
    expect(guardHolds('soco-forte', 'baixa')).toBe(false);
    expect(guardHolds('chute-basico', 'alta')).toBe(true);
    expect(guardHolds('chute-basico', 'baixa')).toBe(true);
    expect(guardHolds('chute-baixo', 'baixa')).toBe(true);
    expect(guardHolds('chute-baixo', 'alta')).toBe(false);
    expect(guardHolds('voadora', 'alta')).toBe(false);
    expect(guardHolds('voadora', 'baixa')).toBe(true);
    expect(guardHolds('especial', null)).toBe(false);
  });
  it('ducks the quick punch and the shot; jumps over both projectiles', () => {
    expect(ducksUnder('soco-rapido', true)).toBe(true);
    expect(ducksUnder('tiro', true)).toBe(true);
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
    expect(meteorDiveStart(700, 600, 0, 1)).toEqual({ x: 100, y: 0 });
    expect(meteorDiveStart(700, 600, 0, -1)).toEqual({ x: 1300, y: 0 });
  });
  it('covers the complete path of a fast shot in either direction', () => {
    expect(sweptInterval(100, 300, 6)).toEqual({x:94, width:212});
    expect(sweptInterval(300, 100, 6)).toEqual({x:94, width:212});
  });
});
