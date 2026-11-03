/**
 * Abertura do jogo (João, 03/11/2026): a assinatura de quem fez o jogo
 * aparece enquanto tudo carrega, com a barra de carregamento embaixo. Mascara
 * o carregamento e serve de crédito. Hoje é texto (os nomes do grupo); a
 * animação da logo da desenvolvedora entra no lugar dele em `BootScene`.
 */

/** Quanto a abertura fica, no mínimo, para o crédito ser lido. */
export const ABERTURA_MINIMA_MS = 2600;

/** Quem assina a abertura, até a logo chegar (docs/briefing.md, o grupo). */
export const CREDITO_DA_ABERTURA = { nomes: 'JOÃO · RICARDO · LUCAS · RODRIGO · NANI', linha: 'apresentam' };

/**
 * A abertura sai quando tudo carregou e o crédito ficou o tempo dele, ou
 * antes disso se o jogador pulou (tecla ou clique). Sem carregar, não sai.
 */
export function podeSairDaAbertura(decorridoMs: number, carregou: boolean, pulou: boolean): boolean {
  return carregou && (pulou || decorridoMs >= ABERTURA_MINIMA_MS);
}

/** Largura do preenchimento da barra para um progresso de 0 a 1. */
export function larguraDaBarra(progresso: number, largura: number): number {
  return Math.min(1, Math.max(0, progresso)) * largura;
}
