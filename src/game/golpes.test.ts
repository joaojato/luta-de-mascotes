import { describe, expect, it } from 'vitest';
import { GOLPES, golpesDoLutador, nomesDosBotoes } from './golpes';
import { LUTADORES } from './lutadores';
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

describe('nome do golpe no botão do celular', () => {
  it('muda com o lutador de pé, abaixado e no ar', () => {
    const saci = LUTADORES.find((l) => l.id === 'saci')!.nomes;
    expect(nomesDosBotoes(saci, 'pe')).toEqual({ light: 'Jab', heavy: 'Cachimbo', block: 'Defesa', special: 'Furacão' });
    expect(nomesDosBotoes(saci, 'abaixado')).toMatchObject({ light: 'Direto', heavy: 'Chute', block: 'Defesa baixa' });
    expect(nomesDosBotoes(saci, 'ar')).toMatchObject({ light: 'Soco aéreo', heavy: 'Voadora' });
  });

  it('sem nomes no JSON, cai no nome genérico', () => {
    expect(nomesDosBotoes(undefined, 'pe')).toEqual({ light: 'Soco', heavy: 'Chute', block: 'Defesa', special: 'Especial' });
  });

  it('todo lutador da seleção tem nome curto para cada golpe, que cabe no botão', () => {
    for (const lutador of LUTADORES.filter((l) => l.selecionavel !== false)) {
      for (const golpe of GOLPES) {
        const nome = lutador.nomes?.[golpe.id];
        expect(nome, `${lutador.id}: ${golpe.id}`).toBeTruthy();
        expect(nome!.length, `${lutador.id}: ${golpe.id}`).toBeLessThanOrEqual(11);
      }
    }
  });
});
