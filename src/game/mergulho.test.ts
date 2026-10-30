import { describe, expect, it } from 'vitest';
import { sortearMergulho } from './mergulho';
import mosqueteiro from './lutadores/mosqueteiro.json';

describe('mergulho do líder do esquadrão sem hora certa (30/10/2026)', () => {
  const janela = { segundos: 1, adiantar: 0.5, atrasar: 0.8 };

  it('fica entre 0,5 s antes e 0,8 s depois do valor de referência', () => {
    expect(sortearMergulho(janela, () => 0)).toBeCloseTo(0.5);
    expect(sortearMergulho(janela, () => 0.999999)).toBeCloseTo(1.8);
    for (let i = 0; i < 500; i += 1) {
      const t = sortearMergulho(janela);
      expect(t).toBeGreaterThanOrEqual(0.5);
      expect(t).toBeLessThanOrEqual(1.8);
    }
  });

  it('varia de uma chamada para outra', () => {
    const sorteios = new Set(Array.from({ length: 20 }, () => sortearMergulho(janela).toFixed(3)));
    expect(sorteios.size).toBeGreaterThan(10);
  });

  it('o Mosqueteiro declara a janela no JSON', () => {
    expect(mosqueteiro.moves.special.esquadrao.mergulho).toEqual(janela);
  });
});
