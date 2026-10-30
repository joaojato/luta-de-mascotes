/** Janela do mergulho do líder do esquadrão, em segundos desde o botão. */
export interface JanelaDoMergulho {
  segundos: number;
  adiantar: number;
  atrasar: number;
}

const PADRAO: JanelaDoMergulho = { segundos: 1, adiantar: 0.5, atrasar: 0.8 };

/**
 * Sorteia o momento do mergulho, uniforme entre `segundos - adiantar` e
 * `segundos + atrasar`: o oponente não decora a hora do ataque.
 */
export function sortearMergulho(janela: JanelaDoMergulho | undefined, aleatorio: () => number = Math.random): number {
  const { segundos, adiantar, atrasar } = janela ?? PADRAO;
  return Math.max(0, segundos - adiantar + aleatorio() * (adiantar + atrasar));
}
