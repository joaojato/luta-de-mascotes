import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { inflateSync } from 'node:zlib';

import { describe, expect, it } from 'vitest';

import { LUTADORES } from './lutadores';
import {
  bandeirasDoClube,
  brilhoDaChave,
  corHex,
  coresDoSinalizador,
  ESTAMPAS,
  indiceDaCor,
  pintarChave,
  TORCIDA_NEUTRA,
  variantesDaCamisa,
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
    expect(bandeirasDoClube(bahia)).toEqual([{ estampa: 'listras-horizontais', cores: bahia.cores }]);
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

  it('cada cor do clube ganha uma camisa lisa, com a gola na cor seguinte', () => {
    const bahia: TorcidaClube = { estampa: 'lisa', cores: ['#F0F0F0', '#1860D8', '#D81800'] };
    const camisas = variantesDaCamisa(bahia);
    expect(camisas[0]).toBe(bahia);
    expect(camisas.slice(1).map((c) => c.cores[0])).toEqual(bahia.cores);
    expect(camisas[3]).toEqual({ estampa: 'lisa', cores: ['#D81800', '#F0F0F0'] });
  });

  it('sinalizador: cores vivas do clube, depois as claras, nunca escura', () => {
    expect(coresDoSinalizador({ estampa: 'listras-horizontais', cores: ['#B01010', '#181818'] })).toEqual([0xb01010]);
    expect(coresDoSinalizador({ estampa: 'faixa-diagonal', cores: ['#181818', '#ECECEC'] })).toEqual([0xececec]);
    expect(coresDoSinalizador({ estampa: 'lisa', cores: ['#F0F0F0', '#1860D8', '#D81800'] })).toEqual([0x1860d8, 0xd81800, 0xf0f0f0]);
    expect(coresDoSinalizador({ estampa: 'lisa', cores: ['#181818'] })).toEqual([0xf0f0f0]);
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

  it('toda cor de todo clube aparece numa camisa, e nenhum sinalizador é escuro', () => {
    LUTADORES.filter((lutador) => lutador.selecionavel !== false).forEach((lutador) => {
      const clube = torcidaValida(lutador.torcida);
      const lisas = variantesDaCamisa(clube).map((camisa) => camisa.cores[0]);
      clube.cores.forEach((cor) => expect(lisas, `${lutador.id} ${cor}`).toContain(cor));
      const bandeiras = bandeirasDoClube(clube).flatMap((bandeira) => bandeira.cores);
      clube.cores.forEach((cor) => expect(bandeiras, `${lutador.id} bandeira ${cor}`).toContain(cor));
      coresDoSinalizador(clube).forEach((cor) => {
        expect(Math.max(cor >> 16, (cor >> 8) & 255, cor & 255), `${lutador.id} sinalizador escuro`).toBeGreaterThanOrEqual(0.35 * 255);
        expect(clube.cores.map(corHex).map(([r, g, b]) => (r << 16) | (g << 8) | b).concat(0xf0f0f0), `${lutador.id}`).toContain(cor);
      });
    });
  });
});

/** Lê um PNG RGBA de 8 bits (o que o Pillow salva) sem dependência nova. */
function lerPng(arquivo: string): { largura: number; altura: number; pixels: Uint8Array } {
  const dados = readFileSync(arquivo);
  const largura = dados.readUInt32BE(16);
  const altura = dados.readUInt32BE(20);
  expect(`${dados[24]}/${dados[25]}`, `${arquivo} precisa ser RGBA de 8 bits`).toBe('8/6');
  const partes: Buffer[] = [];
  for (let i = 8; i < dados.length; ) {
    const tamanho = dados.readUInt32BE(i);
    if (dados.toString('ascii', i + 4, i + 8) === 'IDAT') partes.push(dados.subarray(i + 8, i + 8 + tamanho));
    i += tamanho + 12;
  }
  const cru = inflateSync(Buffer.concat(partes));
  const linha = largura * 4;
  const pixels = new Uint8Array(linha * altura);
  for (let y = 0; y < altura; y += 1) {
    const filtro = cru[y * (linha + 1)];
    for (let x = 0; x < linha; x += 1) {
      const v = cru[y * (linha + 1) + 1 + x];
      const a = x >= 4 ? pixels[y * linha + x - 4] : 0;
      const b = y > 0 ? pixels[(y - 1) * linha + x] : 0;
      const c = x >= 4 && y > 0 ? pixels[(y - 1) * linha + x - 4] : 0;
      const p = a + b - c;
      const paeth = Math.abs(p - a) <= Math.abs(p - b) && Math.abs(p - a) <= Math.abs(p - c) ? a : Math.abs(p - b) <= Math.abs(p - c) ? b : c;
      const previsto = [0, a, b, (a + b) >> 1, paeth][filtro];
      pixels[y * linha + x] = (v + previsto) & 0xff;
    }
  }
  return { largura, altura, pixels };
}

describe('atlas da torcida que a Luta carrega', () => {
  const pasta = resolve(__dirname, '../../public/assets/cenarios/estadio/torcida');
  const dados = JSON.parse(readFileSync(resolve(pasta, 'torcida.json'), 'utf8'));
  const arquivo: string = dados.folhas.torcedores.arquivo;

  it('é o mesmo no torcida.json e no carregamento da cena', () => {
    expect(readFileSync(resolve(__dirname, 'torcidaCena.ts'), 'utf8')).toContain(`[TORCIDA_CHAVES.torcedores, '${arquivo}']`);
  });

  // A cor do clube só existe onde há camisa em cor chave: atlas sem magenta
  // deixa a arquibancada inteira sem as cores dos mascotes (03/11/2026).
  it('tem camisa em cor chave em todo torcedor', () => {
    const { largura, altura, pixels } = lerPng(resolve(pasta, arquivo));
    const { celulaLargura: cl, celulaAltura: ca } = dados.folhas.torcedores;
    for (let cy = 0; cy < altura; cy += ca) {
      for (let cx = 0; cx < largura; cx += cl) {
        let chave = 0;
        for (let y = cy; y < cy + ca; y += 1) {
          for (let x = cx; x < cx + cl; x += 1) {
            const i = (y * largura + x) * 4;
            if (pixels[i + 3] > 0 && brilhoDaChave(pixels[i], pixels[i + 1], pixels[i + 2]) !== null) chave += 1;
          }
        }
        expect(chave, `${arquivo}: célula na coluna ${cx / cl}, fileira ${cy / ca}`).toBeGreaterThan(50);
      }
    }
  });
});
