import { describe, expect, it } from 'vitest';

import { LUTADORES } from './lutadores';
import {
  brilhoDaChave,
  corDaFumaca,
  ESTAMPAS,
  estampaDaBandeira,
  indiceDaCor,
  pintarChave,
  TORCIDA_NEUTRA,
  torcidaValida,
  type TorcidaClube
} from './torcida';

const caixa = { x0: 0, y0: 0, x1: 23, y1: 23 };

describe('torcida dividida (docs/torcida-dividida.md)', () => {
  it('reconhece a cor chave magenta e a sombra dela, e só ela', () => {
    expect(brilhoDaChave(255, 0, 255)).toBe(1);
    expect(brilhoDaChave(0xb0, 0, 0xb0)).toBeCloseTo(0.69, 2);
    expect(brilhoDaChave(0x70, 0, 0x70)).toBeCloseTo(0.44, 2);
    expect(brilhoDaChave(200, 30, 60)).toBeNull(); // vermelho de camisa
    expect(brilhoDaChave(120, 120, 120)).toBeNull(); // cinza
    expect(brilhoDaChave(240, 180, 160)).toBeNull(); // pele
  });

  it('listras horizontais alternam de cima para baixo', () => {
    const fla: TorcidaClube = { estampa: 'listras-horizontais', cores: ['#B01010', '#181818'] };
    const coluna = Array.from({ length: 24 }, (_, y) => indiceDaCor(fla, 5, y, caixa));
    expect(new Set(coluna)).toEqual(new Set([0, 1]));
    expect(indiceDaCor(fla, 0, 3, caixa)).toBe(indiceDaCor(fla, 20, 3, caixa));
  });

  it('listras verticais alternam da esquerda para a direita; com três cores entra o filete', () => {
    const bota: TorcidaClube = { estampa: 'listras-verticais', cores: ['#181818', '#F0F0F0'] };
    const linha = Array.from({ length: 24 }, (_, x) => indiceDaCor(bota, x, 5, caixa));
    expect(new Set(linha)).toEqual(new Set([0, 1]));
    expect(indiceDaCor(bota, 3, 0, caixa)).toBe(indiceDaCor(bota, 3, 20, caixa));

    const flu: TorcidaClube = { estampa: 'listras-verticais', cores: ['#A80018', '#006048', '#F0F0F0'] };
    const linhaFlu = Array.from({ length: 24 }, (_, x) => indiceDaCor(flu, x, 5, caixa));
    expect(new Set(linhaFlu)).toEqual(new Set([0, 1, 2]));
  });

  it('a faixa diagonal desce do ombro direito da imagem ao quadril esquerdo', () => {
    const vasco: TorcidaClube = { estampa: 'faixa-diagonal', cores: ['#181818', '#ECECEC'] };
    expect(indiceDaCor(vasco, 23, 0, caixa)).toBe(1);
    expect(indiceDaCor(vasco, 0, 23, caixa)).toBe(1);
    expect(indiceDaCor(vasco, 0, 0, caixa)).toBe(0);
    expect(indiceDaCor(vasco, 23, 23, caixa)).toBe(0);
  });

  it('camisa lisa leva o detalhe na gola e, com terceira cor, na barra', () => {
    const bahia: TorcidaClube = { estampa: 'lisa', cores: ['#F0F0F0', '#1860D8', '#D81800'] };
    expect(indiceDaCor(bahia, 10, 0, caixa)).toBe(1);
    expect(indiceDaCor(bahia, 10, 12, caixa)).toBe(0);
    expect(indiceDaCor(bahia, 10, 23, caixa)).toBe(2);
    expect(estampaDaBandeira(bahia).estampa).toBe('listras-horizontais');
  });

  it('pinta só a chave, multiplica pela sombra e estampa cada célula pela própria camisa', () => {
    // Duas células 2x2 lado a lado: chave clara, chave escura, pele, transparente.
    const pixels = new Uint8ClampedArray([
      255, 0, 255, 255, 0x80, 0, 0x80, 255, 255, 0, 255, 255, 255, 0, 255, 255,
      240, 180, 160, 255, 0, 0, 0, 0, 255, 0, 255, 255, 255, 0, 255, 255
    ]);
    pintarChave(pixels, 4, 2, { largura: 2, altura: 2 }, { estampa: 'lisa', cores: ['#C83200'] });
    expect([...pixels.slice(0, 4)]).toEqual([0xc8, 0x32, 0, 255]);
    expect(pixels[4]).toBe(Math.round(0xc8 * (0x80 / 255)));
    expect([...pixels.slice(16, 20)]).toEqual([240, 180, 160, 255]);
    expect(pixels[23]).toBe(0);
    expect([...pixels.slice(28, 32)]).toEqual([0xc8, 0x32, 0, 255]);
  });

  it('fumaça usa a primeira cor viva; preto e branco solta fumaça clara', () => {
    expect(corDaFumaca({ estampa: 'listras-horizontais', cores: ['#B01010', '#181818'] })).toBe(0xb01010);
    expect(corDaFumaca({ estampa: 'faixa-diagonal', cores: ['#181818', '#ECECEC'] })).toBe(0xececec);
  });

  it('JSON inválido vira torcida neutra, nunca magenta', () => {
    expect(torcidaValida(undefined)).toBe(TORCIDA_NEUTRA);
    expect(torcidaValida({ estampa: 'xadrez', cores: ['#000000'] })).toBe(TORCIDA_NEUTRA);
    expect(torcidaValida({ estampa: 'lisa', cores: ['vermelho'] })).toBe(TORCIDA_NEUTRA);
  });

  it('todo lutador da seleção declara a própria torcida', () => {
    LUTADORES.filter((lutador) => lutador.selecionavel !== false).forEach((lutador) => {
      const torcida = lutador.torcida as TorcidaClube | undefined;
      expect(torcida, `${lutador.id} sem torcida`).toBeTruthy();
      expect(ESTAMPAS, `${lutador.id}`).toContain(torcida!.estampa);
      expect(torcidaValida(torcida), `${lutador.id}`).not.toBe(TORCIDA_NEUTRA);
    });
  });
});
