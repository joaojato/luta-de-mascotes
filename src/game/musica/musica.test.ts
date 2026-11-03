import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  amostraDaNota,
  andamento,
  chavesDaMusica,
  corteDoFiltro,
  disparosDoPasso,
  nivel,
  PASSOS_POR_COMPASSO,
  tensaoDaLuta
} from './sequenciador';
import { TEMAS, type Tema } from './temas';

const PUBLIC_DIR = resolve(__dirname, '../../../public');
const TODOS: Tema[] = Object.values(TEMAS);

/** Tudo o que um tema toca num ciclo inteiro, com todas as camadas. */
function cicloInteiro(tema: Tema) {
  const disparos = [];
  for (let compasso = 0; compasso < 8; compasso += 1) {
    for (let passo = 0; passo < PASSOS_POR_COMPASSO; passo += 1) {
      disparos.push(...disparosDoPasso(tema, compasso, passo, 4));
    }
  }
  return disparos;
}

describe('música (docs/musica.md)', () => {
  it('toda amostra da música tem o arquivo gerado', () => {
    chavesDaMusica().forEach(({ arquivo }) =>
      expect(existsSync(resolve(PUBLIC_DIR, `assets/audio/musica/${arquivo}.wav`)), arquivo).toBe(true)
    );
  });

  it('todo som que os temas tocam é uma amostra carregada', () => {
    const chaves = new Set(chavesDaMusica().map(({ chave }) => chave));
    TODOS.forEach((tema) => cicloInteiro(tema).forEach((d) => expect(chaves.has(d.chave), `${tema.id}: ${d.chave}`).toBe(true)));
  });

  it('nenhuma nota é esticada mais de um tom e meio a partir da gravada', () => {
    TODOS.forEach((tema) =>
      cicloInteiro(tema).forEach((d) => {
        expect(d.taxa).toBeGreaterThanOrEqual(2 ** (-1.5 / 12) - 1e-9);
        expect(d.taxa).toBeLessThanOrEqual(2 ** (1.5 / 12) + 1e-9);
      })
    );
  });

  it('padrões e notas cabem no compasso de 16 passos', () => {
    TODOS.forEach((tema) =>
      tema.camadas.forEach((camada) => {
        camada.batidas.forEach((b) => expect(b.padrao, `${tema.id} ${b.amostra}`).toMatch(/^[xo.]{16}$/));
        camada.frases.forEach((f) =>
          f.compassos.flat().forEach((nota) => {
            expect(nota.passo).toBeGreaterThanOrEqual(0);
            expect(nota.passo).toBeLessThan(PASSOS_POR_COMPASSO);
          })
        );
      })
    );
  });

  it('na luta, o andamento sobe de 96 a 140 com a tensão, sem nunca descer', () => {
    expect(andamento(TEMAS.luta, 0)).toBe(96);
    expect(andamento(TEMAS.luta, 1)).toBe(140);
    for (let t = 0; t < 1; t += 0.05) expect(andamento(TEMAS.luta, t + 0.05)).toBeGreaterThan(andamento(TEMAS.luta, t));
  });

  it('camadas entram com a tensão: o trompete só depois da metade da vida', () => {
    expect(nivel(0)).toBe(0);
    expect(nivel(0.5)).toBe(2);
    expect(nivel(1)).toBe(4);
    const temTrompete = (ate: number) =>
      Array.from({ length: 16 }, (_, passo) => disparosDoPasso(TEMAS.luta, 0, passo, ate)).flat().some((d) => d.chave.includes('trompete'));
    expect(temTrompete(nivel(0.1))).toBe(false);
    expect(temTrompete(nivel(0.6))).toBe(true);
  });

  it('a tensão é a vida perdida do mais machucado, e o filtro abre com ela', () => {
    expect(tensaoDaLuta(1, 1)).toBe(0);
    expect(tensaoDaLuta(1, 0.3)).toBeCloseTo(0.7);
    expect(tensaoDaLuta(0, 1)).toBe(1);
    expect(corteDoFiltro(1)).toBeGreaterThan(corteDoFiltro(0) * 5);
  });

  it('a nota pedida sai afinada da gravada mais perto', () => {
    expect(amostraDaNota('trompete', 69)).toEqual({ chave: 'mus-trompete-69', taxa: 1 });
    const { chave, taxa } = amostraDaNota('trompete', 70);
    expect(chave).toBe('mus-trompete-69');
    expect(taxa).toBeCloseTo(2 ** (1 / 12));
  });
});
