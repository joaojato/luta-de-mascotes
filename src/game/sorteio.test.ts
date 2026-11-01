import { describe, expect, it } from 'vitest';
import { embaralhar, sortearIndice } from './sorteio';

describe('sorteio (31/10/2026)', () => {
  it('sorteia qualquer índice menos o excluído', () => {
    const vistos = new Set<number>();
    for (let r = 0; r < 100; r += 1) vistos.add(sortearIndice(10, [3], () => r / 100));
    expect(vistos.has(3)).toBe(false);
    expect([...vistos].sort((a, b) => a - b)).toEqual([0, 1, 2, 4, 5, 6, 7, 8, 9]);
  });

  it('embaralha uma cópia com os mesmos itens', () => {
    const lista = ['a', 'b', 'c', 'd', 'e'];
    let semente = 7;
    const aleatorio = () => ((semente = (semente * 16807) % 2147483647) / 2147483647);
    const misturada = embaralhar(lista, aleatorio);
    expect([...misturada].sort()).toEqual(lista);
    expect(lista).toEqual(['a', 'b', 'c', 'd', 'e']);
  });
});
