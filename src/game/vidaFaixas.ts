/** Limites compartilhados entre HUD e reacoes da torcida. */
export const HEALTH_WARN = 0.5;
export const HEALTH_DANGER = 0.25;
export function faixaDeVida(vida: number): 'verde' | 'amarela' | 'vermelha' {
  return vida > HEALTH_WARN ? 'verde' : vida > HEALTH_DANGER ? 'amarela' : 'vermelha';
}
