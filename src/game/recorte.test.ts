import { describe, expect, it } from 'vitest';
import { recorteBusto, recorteRosto } from './recorte';

// O Mosqueteiro Paulista é o modelo (João, 02/11/2026): o retrato inteiro é o
// busto dele na seleção, e o quadrado do rosto é o close do Museu.
const MOSQUETEIRO = { x: 0.36, y: 0.37, lado: 0.36 };

describe('recorte dos retratos', () => {
  it('o busto do modelo é o retrato inteiro dele', () => {
    const busto = recorteBusto(1040, 1040, MOSQUETEIRO);
    expect(busto.x).toBeCloseTo(0);
    expect(busto.y).toBeCloseTo(0);
    expect(busto.lado).toBeCloseTo(1040);
  });

  it('qualquer busto põe o rosto no mesmo tamanho e lugar do modelo', () => {
    const rosto = { x: 0.44, y: 0.38, lado: 0.25 };
    const busto = recorteBusto(1254, 1254, rosto);
    expect((rosto.lado * 1254) / busto.lado).toBeCloseTo(0.36);
    expect((rosto.x * 1254 - busto.x) / busto.lado).toBeCloseTo(0.36);
    expect((rosto.y * 1254 - busto.y) / busto.lado).toBeCloseTo(0.37);
  });

  it('o busto não sai do retrato: encosta na borda e encolhe se faltar imagem', () => {
    const naBorda = recorteBusto(1040, 1040, { x: 0.19, y: 0.33, lado: 0.34 });
    expect(naBorda.x).toBe(0);
    const estreito = recorteBusto(282, 383, { x: 0.45, y: 0.19, lado: 0.4 });
    expect(estreito.lado).toBeLessThanOrEqual(282);
    expect(estreito.x).toBeGreaterThanOrEqual(0);
    expect(estreito.y).toBeGreaterThanOrEqual(0);
    expect(estreito.y + estreito.lado).toBeLessThanOrEqual(383);
  });

  it('o close do rosto é o quadrado marcado, dentro do retrato', () => {
    const close = recorteRosto(1040, 1040, MOSQUETEIRO);
    expect(close.x).toBeCloseTo(187.2);
    expect(close.y).toBeCloseTo(197.6);
    expect(close.lado).toBeCloseTo(374.4);
    const topo = recorteRosto(1040, 1040, { x: 0.3, y: 0.05, lado: 0.4 });
    expect(topo.y).toBe(0);
  });
});
