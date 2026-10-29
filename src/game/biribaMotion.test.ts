import { describe, expect, it } from 'vitest';
import { BiribaMotion } from './biribaMotion';

describe('Biriba acompanha o Bira', () => {
  it('anda para os dois lados sem ultrapassar o destino nem os limites', () => {
    const dog = new BiribaMotion(() => 0);
    dog.reset(100, 50, 400);
    dog.update(0.1, 120, 50, 400);
    expect(dog.action).toBe('idle');
    dog.update(0.1, 500, 50, 400);
    expect(dog.x).toBe(134);
    expect(dog.facing).toBe(1);
    for (let i = 0; i < 10; i++) dog.update(0.1, 500, 50, 400);
    expect(dog.x).toBe(400);
    dog.update(0.1, -300, 50, 400);
    expect(dog.facing).toBe(-1);
    expect(dog.x).toBe(366);
  });

  it('para para latir e depois volta a acompanhar, sem deslocar durante o latido', () => {
    const dog = new BiribaMotion(() => 0);
    dog.reset(100, 0, 800);
    for (let i = 0; i < 41; i++) dog.update(0.1, 100, 0, 800);
    expect(dog.action).toBe('bark');
    const start = dog.x;
    for (let i = 0; i < 5; i++) dog.update(0.1, 700, 0, 800);
    expect(dog.x).toBe(start);
    for (let i = 0; i < 8; i++) dog.update(0.1, 700, 0, 800);
    expect(dog.action).toBe('walk');
    expect(dog.x).toBeGreaterThan(start);
  });

  it('reinicia com o round e limita saltos de tempo', () => {
    const dog = new BiribaMotion(() => 0);
    dog.reset(-20, 50, 400);
    expect(dog.x).toBe(50);
    dog.update(5, 400, 50, 400);
    expect(dog.x).toBe(84);
    dog.reset(300, 50, 400);
    expect(dog.x).toBe(300);
    expect(dog.action).toBe('idle');
  });
});
