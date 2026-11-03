import { describe, expect, it } from 'vitest';

import { resultadoPorKO, resultadoPorTempo } from './round';

// Empate não tem vencedor: o round recomeça até alguém ganhar (João, 03/11/2026).
describe('resultado do round', () => {
  it('quem fica de pé ganha o K.O.', () => {
    expect(resultadoPorKO(false, true)).toBe(1);
    expect(resultadoPorKO(true, false)).toBe(2);
    expect(resultadoPorKO(false, false)).toBeNull();
  });

  it('os dois caídos no mesmo quadro é empate, não vitória de um lado', () => {
    expect(resultadoPorKO(true, true)).toBe('empate');
  });

  it('no tempo esgotado ganha quem tem mais vida, e vida igual é empate', () => {
    expect(resultadoPorTempo(0.6, 0.4)).toBe(1);
    expect(resultadoPorTempo(0.4, 0.6)).toBe(2);
    expect(resultadoPorTempo(1, 1)).toBe('empate');
    expect(resultadoPorTempo(0.5, 0.5)).toBe('empate');
  });
});
