import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  ABERTURA_MINIMA_MS,
  blocosDaBarra,
  BLOCOS_DA_BARRA,
  duracaoDoMosaico,
  ESCALA_RETRO,
  LOGOS_DA_ABERTURA,
  logoDaVez,
  OLHAR_PARADO_MS,
  podeSairDaAbertura,
  posicoesDaAbertura,
  quadrosDaFolha,
  SAIDA_ANTES_DO_FIM_MS,
  sequenciaDoOlhar,
  SOM_DA_ABERTURA
} from './abertura';
import { SOM_ASSETS } from './sonsLista';

// A abertura mascara o carregamento e dá o crédito: Resenha Games, depois a
// PUC-Rio, em estilo retrô (João, 03/11/2026).
describe('abertura do jogo', () => {
  const [resenha, puc] = LOGOS_DA_ABERTURA;

  it('mostra a Resenha Games e depois a PUC-Rio', () => {
    expect(LOGOS_DA_ABERTURA.map((logo) => logo.chave)).toEqual(['abertura-resenha-games', 'abertura-puc-rio']);
    expect(logoDaVez(0)).toBe(0);
    expect(logoDaVez(resenha.tempoMs - 1)).toBe(0);
    expect(logoDaVez(resenha.tempoMs)).toBe(1);
  });

  // Carregando devagar, as duas se revezam até acabar (João, 03/11/2026).
  it('carregando devagar, volta à Resenha Games e segue trocando', () => {
    const ciclo = resenha.tempoMs + puc.tempoMs;
    expect(logoDaVez(ciclo)).toBe(0);
    expect(logoDaVez(ciclo + resenha.tempoMs + 10)).toBe(1);
    expect(logoDaVez(ciclo * 5)).toBe(0);
  });

  // Os olhos do controle da Resenha (João, 03/11/2026): começam olhando para
  // a esquerda, esperam um segundo, vão até a direita, voltam e travam.
  it('os olhos da Resenha vão até a direita, voltam e travam na esquerda', () => {
    const olhoNaEsquerda = resenha.quadros - 1;
    const sequencia = sequenciaDoOlhar(resenha);
    const quadros = sequencia.map((passo) => passo.frame);
    const direita = olhoNaEsquerda + resenha.olhar!.quadros;
    expect(quadros).toEqual([olhoNaEsquerda + 1, olhoNaEsquerda + 2, direita, olhoNaEsquerda + 2, olhoNaEsquerda + 1, olhoNaEsquerda]);
    expect(sequencia.find((passo) => passo.frame === direita)!.duration).toBe(OLHAR_PARADO_MS);
    expect(resenha.olhar!.esperaMs).toBe(1000);
    expect(sequenciaDoOlhar(puc)).toEqual([]);
  });

  it('o olhar inteiro cabe com folga antes de a logo se desfazer', () => {
    const olhar = sequenciaDoOlhar(resenha).reduce((total, passo) => total + passo.duration, 0);
    const travado = resenha.tempoMs - SAIDA_ANTES_DO_FIM_MS - duracaoDoMosaico(resenha) * 2 - resenha.olhar!.esperaMs - olhar;
    expect(travado).toBeGreaterThanOrEqual(500);
  });

  it('só sai depois de carregar tudo, mesmo que o tempo tenha passado', () => {
    expect(podeSairDaAbertura(ABERTURA_MINIMA_MS * 3, false, false)).toBe(false);
    expect(podeSairDaAbertura(ABERTURA_MINIMA_MS * 3, false, true)).toBe(false);
  });

  it('carregada, passa pelas duas logos, a não ser que o jogador pule', () => {
    expect(ABERTURA_MINIMA_MS).toBe(resenha.tempoMs + puc.tempoMs);
    expect(podeSairDaAbertura(ABERTURA_MINIMA_MS - 1, true, false)).toBe(false);
    expect(podeSairDaAbertura(ABERTURA_MINIMA_MS, true, false)).toBe(true);
    expect(podeSairDaAbertura(200, true, true)).toBe(true);
  });

  it('a barra enche de bloco em bloco, sem passar do total', () => {
    expect(blocosDaBarra(0)).toBe(0);
    expect(blocosDaBarra(0.5)).toBe(BLOCOS_DA_BARRA / 2);
    expect(blocosDaBarra(0.99)).toBe(BLOCOS_DA_BARRA - 1);
    expect(blocosDaBarra(1)).toBe(BLOCOS_DA_BARRA);
    expect(blocosDaBarra(1.3)).toBe(BLOCOS_DA_BARRA);
    expect(blocosDaBarra(-1)).toBe(0);
  });

  it('cada folha de logo tem os quadros do tamanho declarado', () => {
    for (const logo of LOGOS_DA_ABERTURA) {
      const png = readFileSync(resolve(__dirname, '../../public', logo.arquivo.replace(/^\//, '')));
      expect([png.readUInt32BE(16), png.readUInt32BE(20)], logo.arquivo).toEqual([logo.largura * quadrosDaFolha(logo), logo.altura]);
    }
  });

  // Plim quando a logo fica nítida (João, 03/11/2026), gerado como os outros sons.
  it('o plim da abertura é um som da lista do jogo', () => {
    expect(SOM_ASSETS.some((som) => som.key === SOM_DA_ABERTURA)).toBe(true);
  });

  // A logo é o que o olho mede: fica no meio exato da tela, em qualquer
  // proporção, e a barra vai embaixo dela (João, 03/11/2026).
  for (const [largura, altura] of [[1280, 720], [1558, 720], [1280, 1024]]) {
    it(`em ${largura}x${altura}, a logo fica no meio exato e a barra embaixo dela`, () => {
      const pos = posicoesDaAbertura({ width: largura, height: altura, centerX: largura / 2, centerY: altura / 2 });
      expect([pos.logoX, pos.logoY]).toEqual([largura / 2, altura / 2]);
      const baseDaLogo = altura / 2 + (Math.max(...LOGOS_DA_ABERTURA.map((l) => l.altura)) * ESCALA_RETRO) / 2;
      expect(pos.barraY).toBeGreaterThan(baseDaLogo);
      expect(pos.barraY + 30).toBeLessThan(altura);
    });
  }
});
