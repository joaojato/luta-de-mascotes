/**
 * Quem leva o round. Empate não tem vencedor: a Luta recomeça o mesmo round
 * até alguém ganhar (João, 03/11/2026).
 */
export type ResultadoDoRound = 1 | 2 | 'empate';

/** K.O.: quem fica de pé ganha; os dois caídos no mesmo quadro é empate. Ninguém caído, null. */
export function resultadoPorKO(p1Caiu: boolean, p2Caiu: boolean): ResultadoDoRound | null {
  if (p1Caiu && p2Caiu) return 'empate';
  if (p2Caiu) return 1;
  if (p1Caiu) return 2;
  return null;
}

/** Tempo esgotado: ganha quem tem mais vida (fração da vida máxima); vida igual é empate. */
export function resultadoPorTempo(vida1: number, vida2: number): ResultadoDoRound {
  if (vida1 > vida2) return 1;
  if (vida2 > vida1) return 2;
  return 'empate';
}
