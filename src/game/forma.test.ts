import { describe, expect, it } from 'vitest';

import { danoNaForma, RelogioDaForma } from './forma';

const MAROMBA = { lutador: 'coxa-maromba', segundos: 5, danoCausado: 1.25, danoRecebido: 0.75, rotulo: 'MAROMBA' };

describe('forma (especial que transforma por um tempo)', () => {
  it('começa cheia e esvazia em tempo real', () => {
    const relogio = new RelogioDaForma(MAROMBA);
    expect(relogio.fracao).toBe(1);
    expect(relogio.segundosRestantes).toBe(5);
    relogio.avancar(2.5);
    expect(relogio.fracao).toBeCloseTo(0.5);
    // O número do HUD arredonda para cima: 2,5 s ainda mostram 3.
    expect(relogio.segundosRestantes).toBe(3);
  });

  it('avisa uma vez só quando acaba', () => {
    const relogio = new RelogioDaForma(MAROMBA);
    expect(relogio.avancar(4.9)).toBe(false);
    expect(relogio.avancar(0.2)).toBe(true);
    expect(relogio.fracao).toBe(0);
    expect(relogio.avancar(1)).toBe(false);
  });

  it('pisca no último segundo e meio', () => {
    const relogio = new RelogioDaForma(MAROMBA);
    relogio.avancar(3.4);
    expect(relogio.piscando).toBe(false);
    relogio.avancar(0.2);
    expect(relogio.piscando).toBe(true);
  });

  it('bate mais forte e apanha menos, em dano inteiro', () => {
    expect(danoNaForma(24, MAROMBA.danoCausado)).toBe(30);
    expect(danoNaForma(18, MAROMBA.danoRecebido)).toBe(14);
    // Sem multiplicador, o dano não muda.
    expect(danoNaForma(7, undefined)).toBe(7);
  });
});
