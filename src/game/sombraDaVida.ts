/**
 * Sombra do dano na barra de vida: a barra cai na hora, mas um pedaço claro
 * fica no lugar do que se perdeu e só escorre depois, para o jogador ver o
 * tamanho do estrago. Golpe em sequência segura a sombra até o combo acabar.
 */

/** Quanto tempo a sombra fica parada depois do último golpe. */
export const SOMBRA_ESPERA_MS = 600;
/** Velocidade com que ela escorre, em fração da barra por segundo. */
export const SOMBRA_POR_SEGUNDO = 0.6;

export interface Sombra {
  /** Onde a sombra está, de 0 a 1. */
  fracao: number;
  /** Tempo desde a última queda da vida. */
  msParada: number;
}

/**
 * A sombra no quadro seguinte.
 * @param sombra - A sombra agora.
 * @param vida - A vida agora, de 0 a 1.
 * @param vidaAntes - A vida no quadro anterior.
 * @param segundos - Duração do quadro.
 */
export function proximaSombra(sombra: Sombra, vida: number, vidaAntes: number, segundos: number): Sombra {
  // Vida subindo (começo do round, treino enchendo): a sombra vai junto.
  if (vida >= sombra.fracao) return { fracao: vida, msParada: 0 };
  // Golpe novo: segura a sombra de novo.
  if (vida < vidaAntes) return { fracao: sombra.fracao, msParada: 0 };
  const msParada = sombra.msParada + segundos * 1000;
  if (msParada < SOMBRA_ESPERA_MS) return { fracao: sombra.fracao, msParada };
  return { fracao: Math.max(vida, sombra.fracao - SOMBRA_POR_SEGUNDO * segundos), msParada };
}
