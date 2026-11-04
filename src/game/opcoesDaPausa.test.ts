import { describe, expect, it } from 'vitest';

import { opcoesDaPausa } from './opcoesDaPausa';

const nada = (): void => undefined;
const base = { continuar: nada, recomecar: nada, configuracoes: nada, sair: nada };

describe('opções da pausa', () => {
  it('troca de personagens fica entre Recomeçar e Configurações', () => {
    expect(opcoesDaPausa({ ...base, trocarPersonagens: nada }).map(({ rotulo }) => rotulo)).toEqual([
      'Continuar',
      'Recomeçar',
      'Trocar personagens',
      'Configurações',
      'Sair da partida'
    ]);
  });

  it('sem a ação (torneio, treino), a opção some', () => {
    expect(opcoesDaPausa(base).map(({ id }) => id)).not.toContain('trocarPersonagens');
    expect(opcoesDaPausa(base).map(({ id }) => id)).not.toContain('pularTutorial');
  });

  it('no tutorial, Pular tutorial vem logo depois de Continuar', () => {
    expect(opcoesDaPausa({ ...base, pularTutorial: nada }).map(({ rotulo }) => rotulo).slice(0, 3)).toEqual([
      'Continuar',
      'Pular tutorial',
      'Recomeçar'
    ]);
  });
});
