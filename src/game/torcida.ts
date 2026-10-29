/**
 * Torcida dividida (docs/torcida-dividida.md): cada metade da arquibancada
 * veste o clube de um lutador. A arte vem com a camisa e o pano da bandeira
 * numa cor chave (magenta); aqui o magenta vira a estampa do clube, dentro de
 * cada célula da folha, respeitando a sombra do desenho.
 *
 * Funções puras sobre os pixels (RGBA), para o teste não depender do Phaser.
 */

export const ESTAMPAS = ['lisa', 'listras-horizontais', 'listras-verticais', 'faixa-diagonal'] as const;

export type Estampa = (typeof ESTAMPAS)[number];

/** O que o JSON do mascote declara: estampa e cores (a primeira é a camisa). */
export interface TorcidaClube {
  estampa: Estampa;
  cores: string[];
}

/** Sem clube declarado: camisa cinza lisa, para a arquibancada nunca sair magenta. */
export const TORCIDA_NEUTRA: TorcidaClube = { estampa: 'lisa', cores: ['#8A8A8A'] };

type Rgb = [number, number, number];

/** Caixa da camisa dentro da célula, em pixels, bordas inclusas. */
interface Caixa {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** Pixel art em blocos de 2 px: listra e filete andam de 2 em 2. */
const BLOCO = 2;

/**
 * Lê `#RRGGBB`.
 * @param hex - Cor no formato do JSON.
 */
export function corHex(hex: string): Rgb {
  const valor = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!valor) {
    throw new Error(`cor inválida na torcida: ${hex}`);
  }
  const n = parseInt(valor[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * Confere o que o JSON trouxe; o que não servir vira a torcida neutra.
 * @param raw - O campo `torcida` do lutador, como veio.
 */
export function torcidaValida(raw: unknown): TorcidaClube {
  if (!raw || typeof raw !== 'object') {
    return TORCIDA_NEUTRA;
  }
  const { estampa, cores } = raw as Partial<TorcidaClube>;
  const coresOk =
    Array.isArray(cores) && cores.length > 0 && cores.every((cor) => typeof cor === 'string' && /^#[0-9a-f]{6}$/i.test(cor));
  if (!ESTAMPAS.includes(estampa as Estampa) || !coresOk) {
    return TORCIDA_NEUTRA;
  }
  return { estampa: estampa as Estampa, cores: cores as string[] };
}

/**
 * A cor chave é magenta: matiz 300°, vermelho e azul iguais, verde quase zero.
 * Devolve o brilho (0 a 1) que vira a sombra da estampa, ou `null`.
 * @param r - Vermelho.
 * @param g - Verde.
 * @param b - Azul.
 */
export function brilhoDaChave(r: number, g: number, b: number): number | null {
  const topo = Math.max(r, b);
  if (topo < 60 || Math.abs(r - b) > topo * 0.12 + 6 || g > topo * 0.2) {
    return null;
  }
  return topo / 255;
}

/**
 * Qual das cores do clube vai num pixel da camisa.
 * @param clube - Estampa e cores.
 * @param x - Coluna dentro da célula.
 * @param y - Linha dentro da célula.
 * @param caixa - Caixa da camisa naquela célula.
 */
export function indiceDaCor(clube: TorcidaClube, x: number, y: number, caixa: Caixa): number {
  const total = clube.cores.length;
  const largura = caixa.x1 - caixa.x0 + 1;
  const altura = caixa.y1 - caixa.y0 + 1;
  const listra = (tamanho: number): number => Math.max(BLOCO, Math.round(tamanho / 6 / BLOCO) * BLOCO);

  switch (clube.estampa) {
    case 'listras-horizontais': {
      const passo = listra(altura);
      return Math.floor((y - caixa.y0) / passo) % 2 === 0 ? 0 : Math.min(1, total - 1);
    }
    case 'listras-verticais': {
      const passo = listra(largura);
      const dx = x - caixa.x0;
      if (total < 3) {
        return Math.floor(dx / passo) % 2 === 0 ? 0 : Math.min(1, total - 1);
      }
      // Três cores (Fluminense): listra base, filete, listra da segunda cor, filete.
      const ciclo = 2 * passo + 2 * BLOCO;
      const pos = dx % ciclo;
      if (pos < passo) return 0;
      if (pos < passo + BLOCO) return 2;
      if (pos < 2 * passo + BLOCO) return 1;
      return 2;
    }
    case 'faixa-diagonal': {
      // Do ombro esquerdo de quem veste (direita da imagem) ao quadril oposto.
      const u = (x - caixa.x0) / Math.max(1, largura - 1);
      const v = (y - caixa.y0) / Math.max(1, altura - 1);
      return Math.abs(1 - u - v) < 0.2 ? Math.min(1, total - 1) : 0;
    }
    case 'lisa':
    default: {
      // Detalhe: gola na segunda cor; com terceira, a barra.
      if (total >= 2 && y < caixa.y0 + BLOCO) return 1;
      if (total >= 3 && y > caixa.y1 - BLOCO) return 2;
      return 0;
    }
  }
}

/**
 * As camisas de um lado da arquibancada: a estampa do clube e uma camisa
 * lisa em cada cor dele, com a gola na cor seguinte. Assim toda cor do time
 * aparece (o vermelho do Bahia sumia quando só estava na barra).
 * @param clube - Estampa e cores.
 */
export function variantesDaCamisa(clube: TorcidaClube): TorcidaClube[] {
  const lisas = clube.cores.map((cor, i) => ({
    estampa: 'lisa' as const,
    cores: clube.cores.length > 1 ? [cor, clube.cores[(i + 1) % clube.cores.length]] : [cor]
  }));
  return [clube, ...lisas];
}

/**
 * Bandeiras: a da estampa da camisa e uma em faixas com todas as cores do
 * clube. Camisa lisa já vira faixas, então sobra uma só.
 * @param clube - Estampa e cores.
 */
export function bandeirasDoClube(clube: TorcidaClube): TorcidaClube[] {
  const faixas: TorcidaClube = { estampa: 'listras-horizontais', cores: clube.cores };
  if (clube.estampa === 'lisa' || clube.cores.length < 2) {
    return [clube.cores.length < 2 ? clube : faixas];
  }
  return clube.cores.length > 2 ? [clube, faixas] : [clube];
}

/**
 * Troca a cor chave pela estampa, célula a célula, em cima dos pixels RGBA.
 * @param pixels - Dados da folha inteira (`ImageData.data`), alterados no lugar.
 * @param largura - Largura da folha em pixels.
 * @param altura - Altura da folha em pixels.
 * @param celula - Tamanho da célula (cada figura ganha a própria estampa).
 * @param clube - Estampa e cores.
 */
export function pintarChave(
  pixels: Uint8ClampedArray,
  largura: number,
  altura: number,
  celula: { largura: number; altura: number },
  clube: TorcidaClube
): void {
  const cores = clube.cores.map(corHex);
  for (let cy = 0; cy + celula.altura <= altura; cy += celula.altura) {
    for (let cx = 0; cx + celula.largura <= largura; cx += celula.largura) {
      const brilhos = new Map<number, number>();
      let caixa: Caixa | null = null;
      for (let y = cy; y < cy + celula.altura; y += 1) {
        for (let x = cx; x < cx + celula.largura; x += 1) {
          const i = (y * largura + x) * 4;
          if (pixels[i + 3] === 0) continue;
          const brilho = brilhoDaChave(pixels[i], pixels[i + 1], pixels[i + 2]);
          if (brilho === null) continue;
          brilhos.set(i, brilho);
          const lx = x - cx;
          const ly = y - cy;
          caixa = caixa
            ? { x0: Math.min(caixa.x0, lx), y0: Math.min(caixa.y0, ly), x1: Math.max(caixa.x1, lx), y1: Math.max(caixa.y1, ly) }
            : { x0: lx, y0: ly, x1: lx, y1: ly };
        }
      }
      if (!caixa) continue;
      brilhos.forEach((brilho, i) => {
        const p = i / 4;
        const [r, g, b] = cores[indiceDaCor(clube, (p % largura) - cx, Math.floor(p / largura) - cy, caixa!)];
        pixels[i] = Math.round(r * brilho);
        pixels[i + 1] = Math.round(g * brilho);
        pixels[i + 2] = Math.round(b * brilho);
      });
    }
  }
}

/**
 * Cores do sinalizador: as do clube que fazem sentido em fumaça, vivas
 * primeiro e depois as claras. Cor escura (brilho abaixo de 35%) nunca vira
 * fumaça: sinalizador preto não existe e some no céu da noite. Clube só de
 * cores escuras solta fumaça branca.
 * @param clube - Estampa e cores.
 */
export function coresDoSinalizador(clube: TorcidaClube): number[] {
  const rgb = clube.cores.map(corHex);
  const brilho = ([r, g, b]: Rgb): number => Math.max(r, g, b) / 255;
  const saturacao = ([r, g, b]: Rgb): number => (Math.max(r, g, b) - Math.min(r, g, b)) / Math.max(1, Math.max(r, g, b));
  const acesas = rgb.filter((cor) => brilho(cor) >= 0.35);
  const ordem = [...acesas.filter((cor) => saturacao(cor) > 0.4), ...acesas.filter((cor) => saturacao(cor) <= 0.4)];
  const cores = ordem.map(([r, g, b]) => (r << 16) | (g << 8) | b);
  return cores.length > 0 ? cores : [0xf0f0f0];
}
