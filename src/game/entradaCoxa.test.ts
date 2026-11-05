import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import coxa from './lutadores/coxa.json';
import { buildFighterCharacter } from './fighterCharacter';

describe('entrada do Vovô Coxa', () => {
  const character = buildFighterCharacter(coxa);
  const entrance = character.animations.find(a => a.action === 'entrance')!;
  const idle = character.animations.find(a => a.action === 'idle')!;

  it('registra uma entrada sem dano, sem loop e com a mesma célula da guarda', () => {
    expect(entrance.repeat).toBe(0);
    expect(entrance.bounds.every(f => f.attack === null && f.guard === null)).toBe(true);
    expect([entrance.sheet.frameWidth, entrance.sheet.frameHeight]).toEqual([idle.sheet.frameWidth, idle.sheet.frameHeight]);
    const png = readFileSync(`public${entrance.sheet.url}`);
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([512 * 5, 320 * 3]);
  });

  it('dá tempo para a dor e a bebida e termina durante a contagem', () => {
    // Phaser soma duration de cada quadro ao período base de frameRate.
    const duracoes = entrance.frameDurations!.map(extra => extra + 1000 / entrance.frameRate);
    expect(duracoes).toEqual([250, 160, 200, 180, 350, 350, 180, 250, 450, 180, 200, 250]);
    expect(duracoes.reduce((s, ms) => s + ms, 0)).toBe(3000);
    expect(entrance.sheet.frames).toBe(12);
  });
});
