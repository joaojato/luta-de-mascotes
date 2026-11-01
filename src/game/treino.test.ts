import { describe, expect, it } from 'vitest';

import { proximoLutador, vidaQueVolta } from './treino';

describe('treino livre', () => {
  it('a vida só volta depois de 2 s sem apanhar', () => {
    expect(vidaQueVolta(1999, 50, 150, 0.1)).toBe(0);
    expect(vidaQueVolta(2000, 50, 150, 0.1)).toBeCloseTo(7.5);
  });

  it('nunca passa da vida máxima e não levanta quem caiu', () => {
    expect(vidaQueVolta(5000, 148, 150, 0.1)).toBe(2);
    expect(vidaQueVolta(5000, 150, 150, 0.1)).toBe(0);
    expect(vidaQueVolta(5000, 0, 150, 0.1)).toBe(0);
  });

  it('troca de lutador dando a volta na lista', () => {
    const ids = ['urubu', 'galo', 'saci'];
    expect(proximoLutador(ids, 'saci', 1)).toBe('urubu');
    expect(proximoLutador(ids, 'urubu', -1)).toBe('saci');
    expect(proximoLutador(ids, 'galo', 1)).toBe('saci');
  });
});
