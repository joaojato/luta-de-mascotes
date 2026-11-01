import { describe, expect, it } from 'vitest';

import { proximaSombra, SOMBRA_ESPERA_MS, type Sombra } from './sombraDaVida';

/** Roda a sombra quadro a quadro com a vida parada em `vida`. */
function rodar(sombra: Sombra, vida: number, ms: number): Sombra {
  let atual = sombra;
  for (let t = 0; t < ms; t += 16) atual = proximaSombra(atual, vida, vida, 0.016);
  return atual;
}

describe('sombra do dano na barra de vida', () => {
  it('fica no lugar do que se perdeu e só escorre depois da espera', () => {
    const golpe = proximaSombra({ fracao: 1, msParada: 0 }, 0.7, 1, 0.016);
    expect(golpe.fracao).toBe(1);
    expect(rodar(golpe, 0.7, SOMBRA_ESPERA_MS - 50).fracao).toBe(1);
    const escorrendo = rodar(golpe, 0.7, SOMBRA_ESPERA_MS + 200);
    expect(escorrendo.fracao).toBeLessThan(1);
    expect(escorrendo.fracao).toBeGreaterThan(0.7);
    expect(rodar(golpe, 0.7, SOMBRA_ESPERA_MS + 1000).fracao).toBe(0.7);
  });

  it('golpe em sequência segura a sombra de novo', () => {
    let sombra = rodar(proximaSombra({ fracao: 1, msParada: 0 }, 0.8, 1, 0.016), 0.8, 500);
    sombra = proximaSombra(sombra, 0.6, 0.8, 0.016);
    expect(sombra).toEqual({ fracao: 1, msParada: 0 });
  });

  it('vida subindo leva a sombra junto', () => {
    expect(proximaSombra({ fracao: 0.4, msParada: 300 }, 0.9, 0.4, 0.016)).toEqual({ fracao: 0.9, msParada: 0 });
  });
});
