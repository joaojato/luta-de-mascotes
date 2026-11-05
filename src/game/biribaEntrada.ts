import { PAUSA_ANTES_DA_ENTRADA_MS } from './aberturaDaLuta';
export type BiribaAction = 'idle' | 'walk' | 'bark';

export const ENTRADA_BIRA = {
  duracao: 4200,
  chegada: PAUSA_ANTES_DA_ENTRADA_MS + 1500,
  carinho: PAUSA_ANTES_DA_ENTRADA_MS + 1650,
  volta: PAUSA_ANTES_DA_ENTRADA_MS + 2700,
  saiu: PAUSA_ANTES_DA_ENTRADA_MS + 4000
} as const;

/** Só existe na arena durante a entrada: chega, recebe carinho e vai embora. */
export function amostraEntradaBiriba(ms: number, lateral: number, contato: number): {
  x: number; visivel: boolean; acao: 'idle' | 'walk'; lado: 1 | -1
} {
  const lado: 1 | -1 = contato >= lateral ? 1 : -1;
  const t = Math.max(0, ms);
  if (t < PAUSA_ANTES_DA_ENTRADA_MS || t >= ENTRADA_BIRA.saiu) return { x: lateral, visivel: false, acao: 'idle', lado };
  if (t < ENTRADA_BIRA.chegada) {
    const p = (t - PAUSA_ANTES_DA_ENTRADA_MS) / (ENTRADA_BIRA.chegada - PAUSA_ANTES_DA_ENTRADA_MS);
    return { x: lateral + (contato - lateral) * p, visivel: true, acao: 'walk', lado };
  }
  if (t < ENTRADA_BIRA.volta) return { x: contato, visivel: true, acao: 'idle', lado };
  const p = (t - ENTRADA_BIRA.volta) / (ENTRADA_BIRA.saiu - ENTRADA_BIRA.volta);
  return { x: contato + (lateral - contato) * p, visivel: true, acao: 'walk', lado: lado === 1 ? -1 : 1 };
}

/** Trajeto dos balões: sobe ao entrar, oscila e ganha altura ao sair. */
export function alturaVooNpc(x: number, inicio: number, fim: number, baseY: number, segundos: number): number {
  const distancia = Math.max(1, Math.abs(fim - inicio));
  const progresso = Math.max(0, Math.min(1, Math.abs(x - inicio) / distancia));
  const entrada = Math.max(0, 1 - progresso / .18);
  const saida = Math.max(0, (progresso - .8) / .2);
  return baseY + entrada * entrada * 70 - saida * saida * 90 + Math.sin(segundos * 4) * 6;
}
