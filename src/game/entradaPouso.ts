import { PAUSA_ANTES_DA_ENTRADA_MS } from './aberturaDaLuta';

/** Descida da entrada, independente de dano/física do especial. */
export function amostraPousoEntrada(ms: number, impactoMs: number, origemY: number, pisoY: number): { y: number; pousou: boolean } {
  const p = Math.max(0, Math.min(1, (ms - PAUSA_ANTES_DA_ENTRADA_MS) / Math.max(1, impactoMs - PAUSA_ANTES_DA_ENTRADA_MS)));
  return { y: origemY + (pisoY - origemY) * p * p, pousou: p >= 1 };
}
