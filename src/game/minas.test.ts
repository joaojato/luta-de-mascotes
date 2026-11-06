import { describe, expect, it } from 'vitest';
import { depositarMina, type MinaConfig } from './minas';

// Cacos da Raposa (docs/gdd.md, 06/11/2026): 12 de dano por 5 s; garrafa sobre
// uma simples vira dupla (18, 7 s); sobre uma dupla nasce outra simples.
const CACOS: MinaConfig = { segundos: 5, dano: 12, largura: 60, acumula: { segundos: 7, dano: 18 } };

describe('depositarMina', () => {
  it('sem mina por perto, nasce uma simples', () => {
    expect(depositarMina([], 300, CACOS)).toEqual({ tipo: 'nova', mina: { x: 300, nivel: 1, dano: 12, segundos: 5 } });
  });

  it('sobre uma simples, ela vira dupla com o relógio de volta a 7 s', () => {
    const minas = [{ x: 310, nivel: 1 as const }];
    expect(depositarMina(minas, 300, CACOS)).toEqual({ tipo: 'dobrou', indice: 0, dano: 18, segundos: 7 });
  });

  it('sobre uma dupla, nasce uma simples nova e a dupla fica como estava', () => {
    const minas = [{ x: 300, nivel: 2 as const }];
    expect(depositarMina(minas, 300, CACOS)).toEqual({ tipo: 'nova', mina: { x: 300, nivel: 1, dano: 12, segundos: 5 } });
  });

  it('longe das outras, nasce uma simples: não há limite de minas', () => {
    const minas = [{ x: 100, nivel: 1 as const }, { x: 700, nivel: 2 as const }];
    expect(depositarMina(minas, 400, CACOS).tipo).toBe('nova');
  });

  it('entre duas simples, dobra a mais próxima', () => {
    const minas = [{ x: 250, nivel: 1 as const }, { x: 320, nivel: 1 as const }];
    expect(depositarMina(minas, 300, CACOS)).toMatchObject({ tipo: 'dobrou', indice: 1 });
  });

  it('sem `acumula` no JSON, cada garrafa é uma mina nova', () => {
    const { acumula: _, ...sem } = CACOS;
    expect(depositarMina([{ x: 300, nivel: 1 }], 300, sem).tipo).toBe('nova');
  });
});
