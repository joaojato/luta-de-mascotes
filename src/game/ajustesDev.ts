/**
 * Ajustes de balanceamento feitos na Academia (aba Ajustes, modo dev): vida,
 * dano de cada golpe e tempo de carga do especial, por mascote. Ficam no
 * navegador por cima dos números do JSON; para valer para todo mundo, copiar
 * o valor para o `combat` do JSON do mascote.
 */
import type { FighterCombat } from './types';

export type AjustesCombate = Record<string, Partial<FighterCombat>>;

const CHAVE_STORAGE = 'luta-de-mascotes:ajustes';

/** Só números finitos sobrevivem; o resto some e o JSON volta a valer. */
export function sanitizarAjustes(raw: unknown): AjustesCombate {
  if (!raw || typeof raw !== 'object') {
    return {};
  }
  return Object.fromEntries(
    Object.entries(raw as Record<string, unknown>).map(([id, campos]) => [
      id,
      Object.fromEntries(
        Object.entries((campos ?? {}) as Record<string, unknown>).filter(
          ([, valor]) => typeof valor === 'number' && Number.isFinite(valor)
        )
      ) as Partial<FighterCombat>
    ])
  );
}

export function carregarAjustes(storage?: Storage): AjustesCombate {
  try {
    const raw = (storage ?? globalThis.localStorage)?.getItem(CHAVE_STORAGE);
    return sanitizarAjustes(raw ? JSON.parse(raw) : null);
  } catch {
    return {};
  }
}

export function salvarAjustes(ajustes: AjustesCombate, storage?: Storage): void {
  try {
    (storage ?? globalThis.localStorage)?.setItem(CHAVE_STORAGE, JSON.stringify(ajustes));
  } catch {
    // Sem armazenamento: o ajuste vale só até recarregar.
  }
}
