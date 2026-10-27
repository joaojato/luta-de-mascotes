import { describe, expect, it } from 'vitest';
import { golpesDoLutador } from './golpes';
import { getCharacterDefinition } from './hero';

function situacoes(id: string) {
  return Object.fromEntries(golpesDoLutador(getCharacterDefinition(id)).map((g) => [g.golpe.id, [g.situacao, g.acao]]));
}

describe('catálogo de golpes', () => {
  it('mostra o que o Urubu tem, o que usa de quebra-galho e o que falta', () => {
    const urubu = situacoes('urubu');
    expect(urubu['soco-rapido']).toEqual(['tem', 'light-punch']);
    expect(urubu['soco-forte']).toEqual(['quebra-galho', 'heavy-kick']);
    expect(urubu['chute-basico']).toEqual(['tem', 'heavy-kick']);
    expect(urubu['chute-baixo']).toEqual(['quebra-galho', 'heavy-kick']);
    expect(urubu['voadora']).toEqual(['quebra-galho', 'heavy-kick']);
    expect(urubu['soco-no-ar']).toEqual(['quebra-galho', 'light-punch']);
    expect(urubu['especial'][0]).toBe('tem');
  });
  it('usa a sheet do Forte que o JSON escolhe (tiro do Almirante)', () => {
    expect(situacoes('almirante')['soco-forte']).toEqual(['tem', 'heavy-punch']);
  });
});
