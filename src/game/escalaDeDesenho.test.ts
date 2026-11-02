import { describe, expect, it } from 'vitest';

import { calcularEscala } from './escalaDeDesenho';

describe('calcularEscala', () => {
  it('tela cheia 1920x1080 sem zoom desenha 1,5x', () => {
    expect(calcularEscala(1280, 720, { largura: 1920, altura: 1080, dpr: 1 })).toBe(1.5);
  });

  it('notebook com zoom de 125% do Windows: pixel do canvas casa com pixel da tela', () => {
    // Área 1536x730 de CSS: o FIT dá 1297,8x730, que são 1622x912 pixels de verdade.
    expect(calcularEscala(1280, 720, { largura: 1536, altura: 730, dpr: 1.25 })).toBeCloseTo(912.5 / 720, 5);
  });

  it('janela menor que o jogo desenha menor, ainda pixel com pixel', () => {
    expect(calcularEscala(1280, 720, { largura: 960, altura: 600, dpr: 1 })).toBe(0.75);
  });

  it('não desce de 0,5x', () => {
    expect(calcularEscala(1280, 720, { largura: 300, altura: 200, dpr: 1 })).toBe(0.5);
  });

  it('4K com zoom para em 3x', () => {
    expect(calcularEscala(1280, 720, { largura: 2560, altura: 1440, dpr: 2 })).toBe(3);
  });

  it('respeita o lado mais apertado', () => {
    expect(calcularEscala(1280, 720, { largura: 2560, altura: 1080, dpr: 1 })).toBe(1.5);
  });
});
