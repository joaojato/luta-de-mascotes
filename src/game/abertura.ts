/**
 * Abertura do jogo (João, 03/11/2026): a logo da Resenha Games, a
 * desenvolvedora, e depois a da PUC-Rio, em estilo retrô de console de 16
 * bits, enquanto tudo carrega com a barra de blocos embaixo. Mascara o
 * carregamento e serve de crédito. Cada logo entra pelo mosaico (do pixel
 * grosso ao fino) e sai por ele ao contrário; as folhas saem de
 * `scripts/abertura_logos.py`.
 */

export interface LogoDaAbertura {
  chave: string;
  arquivo: string;
  /** Quadro da folha, em pixels da arte (o jogo amplia por ESCALA_RETRO). */
  largura: number;
  altura: number;
  /** Quadros do mosaico; o último é a logo pronta. */
  quadros: number;
}

export const LOGOS_DA_ABERTURA: LogoDaAbertura[] = [
  { chave: 'abertura-resenha-games', arquivo: '/assets/abertura/resenha-games.png', largura: 176, altura: 120, quadros: 6 },
  { chave: 'abertura-puc-rio', arquivo: '/assets/abertura/puc-rio.png', largura: 80, altura: 120, quadros: 6 }
];

/** Cada pixel da arte vira um quadrado de 3 na tela, sem suavizar. */
export const ESCALA_RETRO = 3;

/** Quanto cada logo fica na tela, da entrada à saída do mosaico. */
export const TEMPO_POR_LOGO_MS = 2400;

/** A abertura passa por todas as logos antes de abrir o menu. */
export const ABERTURA_MINIMA_MS = TEMPO_POR_LOGO_MS * LOGOS_DA_ABERTURA.length;

/** Blocos da barra de carregamento. */
export const BLOCOS_DA_BARRA = 20;

/** Qual logo está na tela; carregando devagar, a última fica até acabar. */
export function logoDaVez(decorridoMs: number): number {
  return Math.min(LOGOS_DA_ABERTURA.length - 1, Math.floor(Math.max(0, decorridoMs) / TEMPO_POR_LOGO_MS));
}

/**
 * A abertura sai quando tudo carregou e as logos passaram, ou antes disso se
 * o jogador pulou (tecla ou clique). Sem carregar, não sai.
 */
export function podeSairDaAbertura(decorridoMs: number, carregou: boolean, pulou: boolean): boolean {
  return carregou && (pulou || decorridoMs >= ABERTURA_MINIMA_MS);
}

/** Blocos acesos da barra para um progresso de 0 a 1 (só cheia no fim). */
export function blocosDaBarra(progresso: number): number {
  return Math.floor(Math.min(1, Math.max(0, progresso)) * BLOCOS_DA_BARRA);
}
