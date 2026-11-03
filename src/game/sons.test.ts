import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { LUTADORES } from './lutadores';
import { proximaTorcida, somDoEvento, TORCIDA_A_TOA } from './sons';
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

  it('a torcida à toa nunca repete o mesmo som seguido e espera de 5 a 11 s', () => {
    const chaves = new Set(SOM_ASSETS.map((som) => som.key));
    TORCIDA_A_TOA.forEach((chave) => expect(chaves.has(chave), chave).toBe(true));
    let anterior: string | null = null;
    for (let i = 0; i < 200; i += 1) {
      const { chave, ms } = proximaTorcida(anterior);
      expect(chave).not.toBe(anterior);
      expect(ms).toBeGreaterThanOrEqual(5000);
      expect(ms).toBeLessThanOrEqual(11000);
      anterior = chave;
    }
  });

  it('todo som citado no JSON de um mascote existe', () => {
    const chaves = new Set(SOM_ASSETS.map((som) => som.key));
    LUTADORES.forEach((lutador) =>
      Object.entries(lutador.sons ?? {}).forEach(([evento, chave]) => {
        if (chave !== null) expect(chaves.has(chave), `${lutador.id} ${evento}: ${chave}`).toBe(true);
      })
    );
  });

  it('todo mascote tem pelo menos um acerto com som próprio (o golpe soa de quem bate)', () => {
    LUTADORES.forEach((lutador) => {
      const proprios = Object.entries(lutador.sons ?? {}).filter(([evento, chave]) => evento.startsWith('acerto-') && chave);
      expect(proprios.length, lutador.id).toBeGreaterThan(0);
    });
  });
});
