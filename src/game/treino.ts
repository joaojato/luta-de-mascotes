/**
 * Treino livre da Academia: a vida de quem passou 2 s sem apanhar volta a
 * encher, como no modo treino do Street Fighter, e o lutador troca na hora.
 */

/** Quanto tempo sem apanhar até a vida começar a voltar. */
export const ESPERA_DA_VIDA_MS = 2000;
/** Fração da vida máxima que volta por segundo. */
export const VIDA_POR_SEGUNDO = 0.5;

/**
 * Pontos de vida que voltam neste quadro.
 * @param msSemApanhar - Tempo desde o último golpe que tirou vida.
 * @param vida - Vida agora.
 * @param maxima - Vida máxima.
 * @param segundos - Duração do quadro.
 */
export function vidaQueVolta(msSemApanhar: number, vida: number, maxima: number, segundos: number): number {
  if (msSemApanhar < ESPERA_DA_VIDA_MS || vida >= maxima || vida <= 0) return 0;
  return Math.min(maxima - vida, maxima * VIDA_POR_SEGUNDO * segundos);
}

/** O próximo (ou o anterior) da lista, dando a volta. */
export function proximoLutador(ids: readonly string[], atual: string, direcao: 1 | -1): string {
  const i = ids.indexOf(atual);
  return ids[(((i < 0 ? 0 : i) + direcao) % ids.length + ids.length) % ids.length];
}
