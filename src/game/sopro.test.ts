import { describe, expect, it } from 'vitest';
import { acertoDoSopro, amostraDoSopro, direcaoDoSopro, type SoproConfig } from './sopro';

const cfg: SoproConfig = {
  efeito: 'fire-beam',
  origemEfeito: [1000, 128],
  comprimentoEfeito: 920,
  boca: [[148, 259], [145, 251], [146, 249]],
  angulos: [30, 45, 60],
  altura: 200
};

describe('sopro do Dragão (30/10/2026)', () => {
  it('interpola boca e ângulo entre os quadros desenhados', () => {
    expect(amostraDoSopro(cfg, 0)).toEqual({ boca: { x: 148, y: 259 }, angulo: 30 });
    expect(amostraDoSopro(cfg, 1)).toEqual({ boca: { x: 146, y: 249 }, angulo: 60 });
    const meio = amostraDoSopro(cfg, 0.25);
    expect(meio.angulo).toBeCloseTo(37.5);
    expect(meio.boca.y).toBeCloseTo(255);
  });

  it('0 é para baixo, 90 para a frente, 180 para cima, para os dois lados', () => {
    const baixo = direcaoDoSopro(0, 1);
    expect(baixo.x).toBeCloseTo(0);
    expect(baixo.y).toBeCloseTo(1);
    expect(direcaoDoSopro(90, -1).x).toBeCloseTo(-1);
    expect(direcaoDoSopro(90, 1).x).toBeCloseTo(1);
    expect(direcaoDoSopro(180, 1).y).toBeCloseTo(-1);
  });

  it('acerta quem está na linha do jato, de qualquer altura', () => {
    const boca = { x: 500, y: 300 };
    const frente = direcaoDoSopro(90, 1);
    expect(acertoDoSopro(boca, frente, 1600, 40, { x: 900, y: 260, width: 100, height: 280 })).not.toBeNull();
    // No alto (pulando): o jato a 150 graus sobe até ele.
    const alto = direcaoDoSopro(150, 1);
    expect(acertoDoSopro(boca, alto, 1600, 40, { x: 700, y: -100, width: 80, height: 120 })).not.toBeNull();
  });

  it('a faixa embaixo do mascote fica livre: o jato começa à frente e para baixo', () => {
    const boca = { x: 500, y: 300 };
    const inicio = direcaoDoSopro(30, 1);
    // Oponente em pé logo embaixo (atrás da linha do jato): não acerta.
    expect(acertoDoSopro(boca, inicio, 1600, 40, { x: 380, y: 420, width: 90, height: 280 })).toBeNull();
    // Mais à frente, no chão onde o jato bate: acerta.
    expect(acertoDoSopro(boca, inicio, 1600, 40, { x: 600, y: 420, width: 90, height: 280 })).not.toBeNull();
  });
});
