import { DIFICULDADES } from './cpu';
import type { Luta, Torneio } from './torneio';

/**
 * O torneio em andamento fica no localStorage do navegador, salvo depois de
 * cada luta: recarregar a página e "Continuar torneio" volta à mesma rodada.
 * Vale só naquele navegador e aparelho. Navegador que recusa gravar (aba
 * anônima, cota) só perde o salvamento; o torneio roda igual.
 */

export const CHAVE_TORNEIO = 'luta-de-mascotes-torneio';

export function salvarTorneio(t: Torneio, storage?: Storage): void {
  try {
    armazem(storage)?.setItem(CHAVE_TORNEIO, JSON.stringify(t));
  } catch {
    // Sem salvamento: o torneio segue só na memória desta página.
  }
}

/** O torneio salvo, ou null se não há, se está quebrado ou se tem time fora do elenco atual. */
export function carregarTorneio(elenco: string[], storage?: Storage): Torneio | null {
  try {
    const bruto = armazem(storage)?.getItem(CHAVE_TORNEIO);
    if (!bruto) return null;
    const t = JSON.parse(bruto) as Torneio;
    return valido(t, elenco) ? t : null;
  } catch {
    return null;
  }
}

export function apagarTorneio(storage?: Storage): void {
  try {
    armazem(storage)?.removeItem(CHAVE_TORNEIO);
  } catch {
    // Nada a apagar onde não dá para gravar.
  }
}

/** Alguns navegadores lançam erro só de tocar no localStorage. */
function armazem(storage?: Storage): Storage | null {
  if (storage) return storage;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function valido(t: Torneio, elenco: string[]): boolean {
  const ehLuta = (l: Luta): boolean =>
    typeof l?.a === 'string' &&
    typeof l?.b === 'string' &&
    (l.placar === null || (Array.isArray(l.placar) && l.placar.length === 2 && l.placar.every((n) => typeof n === 'number')));
  return (
    t?.versao === 1 &&
    (t.formato === 'mata-mata' || t.formato === 'pontos-corridos') &&
    (t.tamanho === 8 || t.tamanho === 16) &&
    DIFICULDADES.some((d) => d.id === t.dificuldade) &&
    Array.isArray(t.times) &&
    t.times.length === t.tamanho &&
    t.times.every((id) => elenco.includes(id)) &&
    t.times.includes(t.jogador) &&
    Array.isArray(t.rodadas) &&
    t.rodadas.every((r) => Array.isArray(r) && r.every(ehLuta)) &&
    Number.isInteger(t.rodadaAtual) &&
    t.rodadaAtual >= 0 &&
    t.rodadaAtual <= t.rodadas.length
  );
}
