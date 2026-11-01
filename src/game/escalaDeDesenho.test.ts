import { describe, expect, it } from 'vitest';

import { calcularEscala } from './escalaDeDesenho';

describe('calcularEscala', () => {
  it('monitor 1920x1080 sem zoom desenha 1,5x', () => {
    expect(calcularEscala(1280, 720, { largura: 1920, altura: 1080, dpr: 1 })).toBe(1.5);
  });

  it('notebook com zoom de 125% do Windows conta os pixels de verdade', () => {
    expect(calcularEscala(1280, 720, { largura: 1536, altura: 864, dpr: 1.25 })).toBe(1.5);
  });

  it('tela menor que o jogo não desenha abaixo de 1x', () => {
    expect(calcularEscala(1280, 720, { largura: 1024, altura: 600, dpr: 1 })).toBe(1);
  });

  it('4K com zoom para em 3x', () => {
    expect(calcularEscala(1280, 720, { largura: 2560, altura: 1440, dpr: 2 })).toBe(3);
  });

  it('arredonda em quartos e respeita o lado mais apertado', () => {
    expect(calcularEscala(1280, 720, { largura: 2560, altura: 1080, dpr: 1 })).toBe(1.5);
  });
});
