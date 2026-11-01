/**
 * Como os botões de luta aparecem no celular (docs/mobile.md): cara de Xbox
 * (padrão) ou de PlayStation, e o nome do golpe escrito ou não. Guardado no
 * aparelho, como o arranjo dos botões.
 */

export type Cara = 'xbox' | 'playstation';

export interface PreferenciasDosBotoes {
  cara: Cara;
  nomes: boolean;
}

export const PREFERENCIAS_PADRAO: PreferenciasDosBotoes = { cara: 'xbox', nomes: false };

const CHAVE = 'luta-de-mascotes:toque-botoes';

/** Campo com lixo volta ao padrão, campo a campo. */
export function lerPreferencias(salvo: unknown): PreferenciasDosBotoes {
  const obj = typeof salvo === 'object' && salvo !== null ? (salvo as Record<string, unknown>) : {};
  return {
    cara: obj.cara === 'playstation' || obj.cara === 'xbox' ? obj.cara : PREFERENCIAS_PADRAO.cara,
    nomes: typeof obj.nomes === 'boolean' ? obj.nomes : PREFERENCIAS_PADRAO.nomes
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
