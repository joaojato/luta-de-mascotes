import { describe, expect, it } from 'vitest';
import { criarTorneio, registrarLutaDoJogador } from './torneio';
import { apagarTorneio, CHAVE_TORNEIO, carregarTorneio, salvarTorneio } from './torneioSalvo';

const ELENCO = ['urubu', 'almirante', 'saci', 'cartola', 'cachorro', 'galo', 'bahia', 'porco', 'mosqueteiro', 'dragao'];

function memoria(): Storage {
  const dados = new Map<string, string>();
  return {
    get length() { return dados.size; },
    clear: () => dados.clear(),
    getItem: (k: string) => dados.get(k) ?? null,
    key: (i: number) => [...dados.keys()][i] ?? null,
    removeItem: (k: string) => { dados.delete(k); },
    setItem: (k: string, v: string) => { dados.set(k, v); }
  };
}

function semente(n = 1): () => number {
  let s = n;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

describe('torneio salvo no navegador (31/10/2026)', () => {
  it('ida e volta igual', () => {
    const storage = memoria();
    const t = criarTorneio('mata-mata', 8, 'urubu', ELENCO, 'dificil', semente());
    salvarTorneio(t, storage);
    expect(carregarTorneio(ELENCO, storage)).toEqual(t);
  });

  it('time que saiu do elenco invalida o salvo', () => {
    const storage = memoria();
    salvarTorneio(criarTorneio('pontos-corridos', 8, 'urubu', ELENCO, 'medio', semente()), storage);
    expect(carregarTorneio(ELENCO.filter((id) => id !== 'urubu'), storage)).toBeNull();
  });

  it('JSON quebrado ou de outra versão devolve null', () => {
    const storage = memoria();
    storage.setItem(CHAVE_TORNEIO, '{quebrado');
    expect(carregarTorneio(ELENCO, storage)).toBeNull();
    storage.setItem(CHAVE_TORNEIO, JSON.stringify({ versao: 2 }));
    expect(carregarTorneio(ELENCO, storage)).toBeNull();
  });

  it('navegador que recusa gravar não quebra o jogo: o torneio segue na memória da página', () => {
    const storage = memoria();
    storage.setItem = () => { throw new Error('QuotaExceededError'); };
    const t = criarTorneio('mata-mata', 8, 'urubu', ELENCO, 'medio', semente());
    expect(() => salvarTorneio(t, storage)).not.toThrow();
    expect(carregarTorneio(ELENCO, storage)).toEqual(t);
    apagarTorneio(storage);
  });

  it('recarregar no meio volta à mesma rodada', () => {
    const storage = memoria();
    let t = criarTorneio('pontos-corridos', 8, 'urubu', ELENCO, 'medio', semente());
    t = registrarLutaDoJogador(t, [2, 1], semente(2));
    t = registrarLutaDoJogador(t, [0, 2], semente(3));
    salvarTorneio(t, storage);
    const volta = carregarTorneio(ELENCO, storage)!;
    expect(volta.rodadaAtual).toBe(2);
    expect(volta.rodadas).toEqual(t.rodadas);
  });

  it('apagar some com o salvo', () => {
    const storage = memoria();
    salvarTorneio(criarTorneio('mata-mata', 8, 'urubu', ELENCO, 'medio', semente()), storage);
    apagarTorneio(storage);
    expect(carregarTorneio(ELENCO, storage)).toBeNull();
  });
});
