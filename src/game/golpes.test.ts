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
    expect(urubu['soco-forte']).toEqual(['tem', 'heavy-punch']);
    expect(urubu['chute-basico']).toEqual(['tem', 'beak-pull']);
    expect(urubu['chute-baixo']).toEqual(['tem', 'low-kick']);
    expect(urubu['voadora']).toEqual(['tem', 'jump-kick']);
    expect(urubu['soco-no-ar']).toEqual(['tem', 'jump-punch']);
    expect(urubu['especial'][0]).toBe('tem');
  });
  it('usa a sheet do Forte que o JSON escolhe (tiro do Almirante)', () => {
    expect(situacoes('almirante')['soco-forte']).toEqual(['tem', 'heavy-punch']);
    expect(situacoes('almirante')['chute-basico']).toEqual(['tem', 'shot']);
    expect(situacoes('almirante')['chute-baixo']).toEqual(['quebra-galho', 'heavy-kick']);
  });
});
