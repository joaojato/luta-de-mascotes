import { describe, expect, it } from 'vitest';

import { carregarModo, diferencaDeTeclas, direcoesDoPonto, salvarModo } from './direcao';

describe('controle de toque (docs/mobile.md)', () => {
  it('cada fatia de 45° aperta a direção certa, diagonal aperta duas', () => {
    expect(direcoesDoPonto(50, 0, 60, 0.25)).toEqual(['right']);
    expect(direcoesDoPonto(-50, 0, 60, 0.25)).toEqual(['left']);
    expect(direcoesDoPonto(0, -50, 60, 0.25)).toEqual(['up']);
    expect(direcoesDoPonto(0, 50, 60, 0.25)).toEqual(['down']);
    expect(direcoesDoPonto(35, -35, 60, 0.25)).toEqual(['right', 'up']);
    expect(direcoesDoPonto(-35, 35, 60, 0.25)).toEqual(['left', 'down']);
  });

  it('a zona morta não aperta nada', () => {
    expect(direcoesDoPonto(10, 5, 60, 0.25)).toEqual([]);
  });

  it('a diferença solta o que saiu e aperta o que entrou', () => {
    expect(diferencaDeTeclas(new Set(['A', 'W']), new Set(['W', 'D']))).toEqual({ soltar: ['A'], apertar: ['D'] });
  });

  it('o modo escolhido fica guardado, e o padrão são os botões', () => {
    const guardado = new Map<string, string>();
    const storage = {
      getItem: (k: string) => guardado.get(k) ?? null,
      setItem: (k: string, v: string) => void guardado.set(k, v)
    } as unknown as Storage;
    expect(carregarModo(storage)).toBe('botoes');
    salvarModo('joystick', storage);
    expect(carregarModo(storage)).toBe('joystick');
  });
});
