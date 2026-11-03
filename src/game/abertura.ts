/**
 * Abertura do jogo (João, 03/11/2026): a logo da Resenha Games, a
 * desenvolvedora, e depois a da PUC-Rio, em estilo retrô de console de 16
 * bits, enquanto tudo carrega com a barra de blocos embaixo. Mascara o
 * carregamento e serve de crédito. Cada logo entra pelo mosaico (do pixel
 * grosso ao fino) e sai por ele ao contrário, e as duas se revezam enquanto
 * o jogo não terminou de carregar; as folhas saem de
 * `scripts/abertura_logos.py`. Na Resenha, os olhos do controle olham para a
 * esquerda, esperam um segundo, vão até a direita, voltam e travam.
 */

import type { TelaLogica } from './nitidez';

export interface LogoDaAbertura {
  chave: string;
  arquivo: string;
  /** Quadro da folha, em pixels da arte (o jogo amplia por ESCALA_RETRO). */
  largura: number;
  altura: number;
  /** Quadros do mosaico; o último é a logo pronta. */
  quadros: number;
  /** Tom do plim quando ela fica nítida, em cents. */
  tomDoPlim: number;
  /** Quanto ela fica na tela, da entrada à saída do mosaico. */
  tempoMs: number;
  /** Olhos que se mexem depois do mosaico: quadros na folha depois dele. */
  olhar?: OlharDaLogo;
}

export interface OlharDaLogo {
  /** Quadros do olho indo para a direita; o último do mosaico é o olho na esquerda. */
  quadros: number;
  /** Quanto o olho fica parado na esquerda antes de ir. */
  esperaMs: number;
}

export const LOGOS_DA_ABERTURA: LogoDaAbertura[] = [
  {
    chave: 'abertura-resenha-games',
    arquivo: '/assets/abertura/resenha-games.png',
    largura: 176,
    altura: 120,
    quadros: 6,
    tomDoPlim: 0,
    // Mais tempo que a PUC: cabe o segundo parado, a ida e volta e o olho travado.
    tempoMs: 3700,
    olhar: { quadros: 3, esperaMs: 1000 }
  },
  { chave: 'abertura-puc-rio', arquivo: '/assets/abertura/puc-rio.png', largura: 80, altura: 120, quadros: 6, tomDoPlim: -500, tempoMs: 2400 }
];

/** Ritmo do mosaico, na entrada e na saída. */
export const QUADROS_POR_SEGUNDO_DO_MOSAICO = 12;

/** A logo começa a se desfazer este tanto antes do fim do tempo dela. */
export const SAIDA_ANTES_DO_FIM_MS = 150;

/** Cada passo do olho de um lado para o outro. */
export const PASSO_DO_OLHAR_MS = 55;

/** Quanto o olho fica na direita antes de voltar. */
export const OLHAR_PARADO_MS = 450;

/** Quadros da folha: o mosaico e, se houver, o olhar. */
export function quadrosDaFolha(logo: LogoDaAbertura): number {
  return logo.quadros + (logo.olhar?.quadros ?? 0);
}

export function duracaoDoMosaico(logo: LogoDaAbertura): number {
  return (logo.quadros / QUADROS_POR_SEGUNDO_DO_MOSAICO) * 1000;
}

/**
 * O olhar quadro a quadro: do olho na esquerda vai até a direita, para um
 * pouco, volta e termina na esquerda, onde trava. Sem olhar, vazio.
 */
export function sequenciaDoOlhar(logo: LogoDaAbertura): { frame: number; duration: number }[] {
  if (!logo.olhar) return [];
  const esquerda = logo.quadros - 1;
  const n = logo.olhar.quadros;
  const ida = Array.from({ length: n }, (_, i) => ({ frame: esquerda + i + 1, duration: i === n - 1 ? OLHAR_PARADO_MS : PASSO_DO_OLHAR_MS }));
  const volta = Array.from({ length: n }, (_, i) => ({ frame: esquerda + n - 1 - i, duration: PASSO_DO_OLHAR_MS }));
  return [...ida, ...volta];
}

/** O plim de console quando cada logo fica nítida (`scripts/sons.py`, docs/sons.md). */
export const SOM_DA_ABERTURA = 'plim';

/** Cada pixel da arte vira um quadrado de 3 na tela, sem suavizar. */
export const ESCALA_RETRO = 3;

/** A abertura passa por todas as logos antes de abrir o menu. */
export const ABERTURA_MINIMA_MS = LOGOS_DA_ABERTURA.reduce((total, logo) => total + logo.tempoMs, 0);

/** Blocos da barra de carregamento. */
export const BLOCOS_DA_BARRA = 20;

/** Qual logo está na tela; carregando devagar, elas se revezam até acabar. */
export function logoDaVez(decorridoMs: number): number {
  let resto = Math.max(0, decorridoMs) % ABERTURA_MINIMA_MS;
  for (const [i, logo] of LOGOS_DA_ABERTURA.entries()) {
    if (resto < logo.tempoMs) return i;
    resto -= logo.tempoMs;
  }
  return 0;
}

/**
 * A abertura sai quando tudo carregou e as logos passaram, ou antes disso se
 * o jogador pulou (tecla ou clique). Sem carregar, não sai.
 */
export function podeSairDaAbertura(decorridoMs: number, carregou: boolean, pulou: boolean): boolean {
  return carregou && (pulou || decorridoMs >= ABERTURA_MINIMA_MS);
}

/**
 * Onde a logo e a barra ficam. A logo é o que o olho mede: fica no meio exato
 * da tela, em qualquer proporção; a barra vai no vão entre ela e o rodapé.
 */
export function posicoesDaAbertura(tela: TelaLogica): { logoX: number; logoY: number; barraY: number } {
  const meiaAltura = (Math.max(...LOGOS_DA_ABERTURA.map((logo) => logo.altura)) * ESCALA_RETRO) / 2;
  const baseDaLogo = tela.centerY + meiaAltura;
  return { logoX: tela.centerX, logoY: tela.centerY, barraY: baseDaLogo + (tela.height - baseDaLogo) * 0.35 };
}

/** Blocos acesos da barra para um progresso de 0 a 1 (só cheia no fim). */
export function blocosDaBarra(progresso: number): number {
  return Math.floor(Math.min(1, Math.max(0, progresso)) * BLOCOS_DA_BARRA);
}
