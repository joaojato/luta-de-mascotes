import { describe, expect, it } from 'vitest';

import { caixaNoMundo, ladoDoReforco, passoAteOAlvo } from './reforcoRota';

const BOTA = { x: 136, y: 155, largura: 70, altura: 60 };
const ORIGEM = { x: 256, y: 296 };

describe('reforço: o Guerreiro do Cartola', () => {
  it('chuta o alvo na direção do dono', () => {
    // Cartola à esquerda do alvo: o Guerreiro entra pela direita e chuta para a esquerda.
    expect(ladoDoReforco(300, 800)).toBe(-1);
    expect(ladoDoReforco(900, 400)).toBe(1);
  });

  it('corre até o alcance sem passar do ponto, de qualquer lado', () => {
    expect(passoAteOAlvo(1200, 800, -1, 150, 100)).toEqual({ x: 1100, chegou: false });
    // Quadro longo: o passo de 146 px pararia além do ponto; fica no alcance.
    expect(passoAteOAlvo(1000, 800, -1, 150, 146)).toEqual({ x: 950, chegou: true });
    expect(passoAteOAlvo(500, 800, 1, 150, 100)).toEqual({ x: 600, chegou: false });
    expect(passoAteOAlvo(600, 800, 1, 150, 100)).toEqual({ x: 650, chegou: true });
  });

  it('se o alvo veio para perto, para onde está, sem recuar', () => {
    expect(passoAteOAlvo(900, 800, -1, 150, 100)).toEqual({ x: 900, chegou: true });
  });

  it('a caixa do chute fica na bota, à frente do pé de apoio, e espelha com o lado', () => {
    const esquerda = caixaNoMundo(1000, 600, 1, -1, BOTA, ORIGEM);
    expect(esquerda).toEqual({ x: 880, y: 459, largura: 70, altura: 60 });
    const direita = caixaNoMundo(1000, 600, 1, 1, BOTA, ORIGEM);
    expect(direita.x).toBe(1050);
    expect(direita.x + direita.largura).toBe(1120);
    expect(caixaNoMundo(1000, 600, 2, -1, BOTA, ORIGEM).largura).toBe(140);
  });
});
