import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { LUTADORES } from './lutadores';
import { somDoEvento } from './sons';
import { SOM_ASSETS } from './sonsLista';

const PUBLIC_DIR = resolve(__dirname, '../../public');

describe('sons (docs/sons.md, Regra do Som)', () => {
  it('todo som da lista tem o arquivo gerado', () => {
    SOM_ASSETS.forEach((som) => expect(existsSync(resolve(PUBLIC_DIR, `.${som.url}`)), som.url).toBe(true));
  });

  it('o JSON do mascote troca o som geral, e null cala', () => {
    expect(somDoEvento(undefined, 'chute', 'ar-pesado')).toBe('ar-pesado');
    expect(somDoEvento({ chute: 'tiro-garrucha' }, 'chute', 'ar-pesado')).toBe('tiro-garrucha');
    expect(somDoEvento({ passo: null }, 'passo', 'passo')).toBeNull();
    expect(somDoEvento({ chute: 'tiro-garrucha' }, 'pulo', 'pulo')).toBe('pulo');
  });

  it('todo som citado no JSON de um mascote existe', () => {
    const chaves = new Set(SOM_ASSETS.map((som) => som.key));
    LUTADORES.forEach((lutador) =>
      Object.entries(lutador.sons ?? {}).forEach(([evento, chave]) => {
        if (chave !== null) expect(chaves.has(chave), `${lutador.id} ${evento}: ${chave}`).toBe(true);
      })
    );
  });
});
