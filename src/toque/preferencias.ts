/**
 * Como os botões de luta aparecem no celular (docs/mobile.md): cara de Xbox
 * (padrão) ou de PlayStation, o nome do golpe escrito ou não, e a opacidade
 * dos controles (para ver a luta por trás). Guardado no aparelho, como o
 * arranjo dos botões.
 */

export type Cara = 'xbox' | 'playstation';

export interface PreferenciasDosBotoes {
  cara: Cara;
  nomes: boolean;
  /** De 0 a 1; um dos degraus de {@link OPACIDADES}. */
  opacidade: number;
}

/** Os degraus que o item do menu percorre, do mais forte ao mais apagado. */
export const OPACIDADES = [1, 0.75, 0.5, 0.3] as const;

export const PREFERENCIAS_PADRAO: PreferenciasDosBotoes = { cara: 'xbox', nomes: false, opacidade: 1 };

/** O próximo degrau de opacidade (depois do mais apagado, volta ao cheio). */
export function proximaOpacidade(atual: number): number {
  const i = OPACIDADES.findIndex((degrau) => degrau === atual);
  return OPACIDADES[(i + 1) % OPACIDADES.length];
}

const CHAVE = 'luta-de-mascotes:toque-botoes';

/** Campo com lixo volta ao padrão, campo a campo. */
export function lerPreferencias(salvo: unknown): PreferenciasDosBotoes {
  const obj = typeof salvo === 'object' && salvo !== null ? (salvo as Record<string, unknown>) : {};
  return {
    cara: obj.cara === 'playstation' || obj.cara === 'xbox' ? obj.cara : PREFERENCIAS_PADRAO.cara,
    nomes: typeof obj.nomes === 'boolean' ? obj.nomes : PREFERENCIAS_PADRAO.nomes,
    opacidade: OPACIDADES.some((degrau) => degrau === obj.opacidade) ? (obj.opacidade as number) : PREFERENCIAS_PADRAO.opacidade
  };
}

export function carregarPreferencias(storage?: Storage): PreferenciasDosBotoes {
  try {
    const texto = (storage ?? window.localStorage).getItem(CHAVE);
    return lerPreferencias(texto ? JSON.parse(texto) : null);
  } catch {
    return { ...PREFERENCIAS_PADRAO };
  }
}

export function salvarPreferencias(preferencias: PreferenciasDosBotoes, storage?: Storage): void {
  try {
    (storage ?? window.localStorage).setItem(CHAVE, JSON.stringify(preferencias));
  } catch {
    // Aba anônima: vale até recarregar.
  }
}
