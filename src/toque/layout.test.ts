import { describe, expect, it } from 'vitest';

import {
  apagarLayout,
  arrastar,
  caixaEmPixels,
  carregarLayout,
  IDS_CONTROLE,
  juntarLayout,
  larguraDoJogo,
  layoutPadrao,
  redimensionar,
  salvarLayout,
  type Tela
} from './layout';

const IPHONE: Tela = { largura: 844, altura: 390, seguro: { topo: 0, direita: 47, baixo: 21, esquerda: 47 } };
const SE: Tela = { largura: 667, altura: 375, seguro: { topo: 0, direita: 0, baixo: 0, esquerda: 0 } };

function memoria(): Storage {
  const dados = new Map<string, string>();
  return {
    get length() {
      return dados.size;
    },
    clear: () => dados.clear(),
    getItem: (chave) => dados.get(chave) ?? null,
    key: (i) => [...dados.keys()][i] ?? null,
    removeItem: (chave) => void dados.delete(chave),
    setItem: (chave, valor) => void dados.set(chave, valor)
  };
}

describe('layout de fábrica', () => {
  it.each([IPHONE, SE])('cabe inteiro na tela, fora do notch e da barra de início', (tela) => {
    const layout = layoutPadrao(tela);
    for (const id of IDS_CONTROLE) {
      const caixa = caixaEmPixels(layout[id], tela);
      expect(caixa.esquerda).toBeGreaterThanOrEqual(tela.seguro.esquerda);
      expect(caixa.esquerda + caixa.lado).toBeLessThanOrEqual(tela.largura - tela.seguro.direita);
      expect(caixa.topo + caixa.lado).toBeLessThanOrEqual(tela.altura - tela.seguro.baixo);
    }
  });

  it('põe os quatro botões no losango', () => {
    const l = layoutPadrao(IPHONE);
    expect(l.cima.y).toBeLessThan(l.direita.y);
    expect(l.baixo.y).toBeGreaterThan(l.direita.y);
    expect(l.esquerda.x).toBeLessThan(l.cima.x);
    expect(l.direita.x).toBeGreaterThan(l.cima.x);
    expect(l.cima.x).toBeCloseTo(l.baixo.x);
  });

  it('nenhum botão do losango encosta no outro', () => {
    const l = layoutPadrao(IPHONE);
    const [t, c, x, q] = (['cima', 'direita', 'baixo', 'esquerda'] as const).map((id) => caixaEmPixels(l[id], IPHONE));
    const centro = (k: { esquerda: number; topo: number; lado: number }) => [k.esquerda + k.lado / 2, k.topo + k.lado / 2];
    for (const [a, b] of [[t, c], [c, x], [x, q], [q, t]]) {
      const [ax, ay] = centro(a);
      const [bx, by] = centro(b);
      expect(Math.hypot(ax - bx, ay - by)).toBeGreaterThan(a.lado);
    }
  });
});

describe('editar', () => {
  it('arrastar não deixa o controle sair da tela', () => {
    const inicio = layoutPadrao(IPHONE).direcional;
    const caixa = caixaEmPixels(arrastar(inicio, -5000, 5000, IPHONE), IPHONE);
    expect(caixa.esquerda).toBe(0);
    expect(caixa.topo + caixa.lado).toBe(IPHONE.altura);
  });

  it('o tamanho tem piso e teto', () => {
    const botao = layoutPadrao(IPHONE).baixo;
    expect(redimensionar(botao, 0.001).tamanho).toBe(0.07);
    expect(redimensionar(botao, 1000).tamanho).toBe(0.6);
  });

  it('salva, recarrega e volta ao de fábrica', () => {
    const storage = memoria();
    const padrao = layoutPadrao(IPHONE);
    const movido = { ...padrao, baixo: { x: 0.5, y: 0.5, tamanho: 0.2 } };
    salvarLayout(movido, storage);
    expect(juntarLayout(padrao, carregarLayout(storage)).baixo).toEqual({ x: 0.5, y: 0.5, tamanho: 0.2 });
    apagarLayout(storage);
    expect(juntarLayout(padrao, carregarLayout(storage))).toEqual(padrao);
  });

  it('salvo com lixo cai no de fábrica, controle a controle', () => {
    const padrao = layoutPadrao(IPHONE);
    const juntado = juntarLayout(padrao, { baixo: { x: 'a', y: 1, tamanho: 1 }, direita: { x: 0.9, y: 0.4, tamanho: 0.15 } });
    expect(juntado.baixo).toEqual(padrao.baixo);
    expect(juntado.direita).toEqual({ x: 0.9, y: 0.4, tamanho: 0.15 });
    expect(juntarLayout(padrao, 'quebrado')).toEqual(padrao);
  });
});

describe('largura do jogo', () => {
  it('enche a tela do celular comprido mantendo a altura de 720', () => {
    expect(larguraDoJogo(844, 390)).toBe(1558);
  });

  it('16:9 e tablet ficam no 1280', () => {
    expect(larguraDoJogo(667, 375)).toBe(1280);
    expect(larguraDoJogo(1180, 820)).toBe(1280);
  });

  it('nunca passa da largura do estádio', () => {
    expect(larguraDoJogo(1000, 300)).toBe(1680);
  });

  it('tela sem tamanho ainda (antes do primeiro desenho) fica no 1280', () => {
    expect(larguraDoJogo(0, 0)).toBe(1280);
  });
});
