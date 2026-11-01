import type { Dificuldade } from './cpu';
import { embaralhar } from './sorteio';
import type { FormatoTorneio } from './types';

/**
 * Regras dos torneios contra a CPU (docs/superpowers/specs/2026-10-31-torneios-design.md).
 * Mata-mata é chaveamento: perdeu, caiu. Pontos corridos é todos contra todos
 * em turno único: 2x0 vale 2, 2x1 vale 1, derrota vale 0. O jogador joga só as
 * lutas dele; as outras saem no sorteio. Não depende do Phaser.
 */

export type { FormatoTorneio };

/** Rounds do time `a` e do time `b`. Toda luta é melhor de 3: 2x0 ou 2x1. */
export type Placar = [number, number];

export interface Luta {
  a: string;
  b: string;
  placar: Placar | null;
}

export interface Torneio {
  versao: 1;
  formato: FormatoTorneio;
  tamanho: 8 | 16;
  dificuldade: Dificuldade;
  jogador: string;
  /** Os times na ordem do sorteio inicial (o último critério de desempate). */
  times: string[];
  /** Mata-mata: cresce rodada a rodada. Pontos corridos: todas desde o início. */
  rodadas: Luta[][];
  /** Igual a `rodadas.length` quando o torneio acabou para o jogador. */
  rodadaAtual: number;
}

export interface LinhaTabela {
  time: string;
  pontos: number;
  lutas: number;
  vitorias: number;
  derrotas: number;
  roundsPro: number;
  roundsContra: number;
}

export type Situacao =
  | { tipo: 'em-andamento' }
  | { tipo: 'campeao' }
  | { tipo: 'eliminado'; fase: string }
  | { tipo: 'posicao'; posicao: number };

export function torneioDisponivel(tamanho: 8 | 16, elenco: number): boolean {
  return elenco >= tamanho;
}

export function criarTorneio(
  formato: FormatoTorneio,
  tamanho: 8 | 16,
  jogador: string,
  elenco: string[],
  dificuldade: Dificuldade,
  aleatorio: () => number = Math.random
): Torneio {
  if (!elenco.includes(jogador) || !torneioDisponivel(tamanho, elenco.length)) {
    throw new Error(`Torneio de ${tamanho} precisa de ${tamanho} lutadores com ${jogador} entre eles (há ${elenco.length}).`);
  }
  const outros = embaralhar(elenco.filter((id) => id !== jogador), aleatorio).slice(0, tamanho - 1);
  const times = embaralhar([jogador, ...outros], aleatorio);
  const rodadas = formato === 'mata-mata' ? [emPares(times)] : todosContraTodos(times);
  return { versao: 1, formato, tamanho, dificuldade, jogador, times, rodadas, rodadaAtual: 0 };
}

/** A luta que o jogador joga agora, ou null se o torneio acabou para ele. */
export function lutaDoJogador(t: Torneio): Luta | null {
  if (situacao(t).tipo !== 'em-andamento') return null;
  return t.rodadas[t.rodadaAtual]?.find((l) => l.a === t.jogador || l.b === t.jogador) ?? null;
}

/**
 * Lança o placar do jogador (rounds dele, rounds do adversário), sorteia as
 * outras lutas da rodada e avança. Devolve um torneio novo.
 */
export function registrarLutaDoJogador(t: Torneio, placarDoJogador: Placar, aleatorio: () => number = Math.random): Torneio {
  const luta = lutaDoJogador(t);
  if (!luta) return t;
  const novo: Torneio = JSON.parse(JSON.stringify(t));
  const rodada = novo.rodadas[novo.rodadaAtual];
  rodada.forEach((l) => {
    if (l.a === luta.a && l.b === luta.b) {
      l.placar = l.a === t.jogador ? [placarDoJogador[0], placarDoJogador[1]] : [placarDoJogador[1], placarDoJogador[0]];
    } else if (!l.placar) {
      l.placar = placarSorteado(aleatorio);
    }
  });

  if (novo.formato === 'pontos-corridos') {
    novo.rodadaAtual += 1;
    return novo;
  }
  const venceu = vencedor(rodada.find((l) => l.a === t.jogador || l.b === t.jogador)!) === t.jogador;
  if (venceu && rodada.length > 1) {
    novo.rodadas.push(emPares(rodada.map(vencedor)));
    novo.rodadaAtual += 1;
  } else {
    // Campeão ou eliminado: acabou para o jogador.
    novo.rodadaAtual = novo.rodadas.length;
  }
  return novo;
}

/** Pontos de uma luta pelo placar do próprio time: 2x0 vale 2, 2x1 vale 1, derrota 0. */
export function pontosDaLuta(placarDoTime: Placar): number {
  const [meu, dele] = placarDoTime;
  if (meu <= dele) return 0;
  return dele === 0 ? 2 : 1;
}

/** Tabela ordenada: pontos, saldo de rounds, rounds pró, confronto direto, ordem do sorteio. */
export function tabela(t: Torneio): LinhaTabela[] {
  const linhas = new Map<string, LinhaTabela>(
    t.times.map((time) => [time, { time, pontos: 0, lutas: 0, vitorias: 0, derrotas: 0, roundsPro: 0, roundsContra: 0 }])
  );
  const jogadas = t.rodadas.flat().filter((l): l is Luta & { placar: Placar } => l.placar !== null);
  jogadas.forEach((l) => {
    lancar(linhas.get(l.a), l.placar);
    lancar(linhas.get(l.b), [l.placar[1], l.placar[0]]);
  });
  const confronto = (x: string, y: string): number => {
    const l = jogadas.find((j) => (j.a === x && j.b === y) || (j.a === y && j.b === x));
    if (!l) return 0;
    return vencedor(l) === x ? -1 : 1;
  };
  return [...linhas.values()].sort(
    (x, y) =>
      y.pontos - x.pontos ||
      y.roundsPro - y.roundsContra - (x.roundsPro - x.roundsContra) ||
      y.roundsPro - x.roundsPro ||
      confronto(x.time, y.time) ||
      t.times.indexOf(x.time) - t.times.indexOf(y.time)
  );
}

export function situacao(t: Torneio): Situacao {
  if (t.formato === 'mata-mata') {
    const queda = t.rodadas.findIndex((rodada) =>
      rodada.some((l) => l.placar && (l.a === t.jogador || l.b === t.jogador) && vencedor(l) !== t.jogador)
    );
    if (queda >= 0) return { tipo: 'eliminado', fase: nomeDaRodada(t, queda) };
    return t.rodadaAtual >= t.rodadas.length ? { tipo: 'campeao' } : { tipo: 'em-andamento' };
  }
  if (t.rodadaAtual < t.rodadas.length) return { tipo: 'em-andamento' };
  const posicao = tabela(t).findIndex((l) => l.time === t.jogador) + 1;
  return posicao === 1 ? { tipo: 'campeao' } : { tipo: 'posicao', posicao };
}

export function nomeDaRodada(t: Torneio, rodada: number): string {
  if (t.formato === 'pontos-corridos') return `Rodada ${rodada + 1} de ${t.tamanho - 1}`;
  const lutas = t.tamanho / 2 ** (rodada + 1);
  return lutas >= 8 ? 'Oitavas' : lutas === 4 ? 'Quartas' : lutas === 2 ? 'Semifinal' : 'Final';
}

/** Quem venceu uma luta já jogada. */
export function vencedor(l: Luta): string {
  return l.placar && l.placar[0] > l.placar[1] ? l.a : l.b;
}

function emPares(times: string[]): Luta[] {
  const lutas: Luta[] = [];
  for (let i = 0; i + 1 < times.length; i += 2) lutas.push({ a: times[i], b: times[i + 1], placar: null });
  return lutas;
}

/** Método do círculo: o primeiro fica parado e os outros giram; n - 1 rodadas, cada par uma vez. */
function todosContraTodos(times: string[]): Luta[][] {
  const n = times.length;
  let roda = [...times];
  const rodadas: Luta[][] = [];
  for (let r = 0; r < n - 1; r += 1) {
    rodadas.push(Array.from({ length: n / 2 }, (_, i) => ({ a: roda[i], b: roda[n - 1 - i], placar: null })));
    roda = [roda[0], roda[n - 1], ...roda.slice(1, n - 1)];
  }
  return rodadas;
}

/** Luta entre duas CPUs: 50% para cada lado, e 2x0 ou 2x1 com 50% cada. */
function placarSorteado(aleatorio: () => number): Placar {
  const perdedor = aleatorio() < 0.5 ? 0 : 1;
  return aleatorio() < 0.5 ? [2, perdedor] : [perdedor, 2];
}

function lancar(linha: LinhaTabela | undefined, placar: Placar): void {
  if (!linha) return;
  linha.lutas += 1;
  linha.roundsPro += placar[0];
  linha.roundsContra += placar[1];
  linha.pontos += pontosDaLuta(placar);
  if (placar[0] > placar[1]) linha.vitorias += 1;
  else linha.derrotas += 1;
}
