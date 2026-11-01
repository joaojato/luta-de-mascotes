import { describe, expect, it } from 'vitest';
import {
  criarTorneio,
  lutaDoJogador,
  nomeDaRodada,
  pontosDaLuta,
  registrarLutaDoJogador,
  situacao,
  tabela,
  torneioDisponivel,
  type Torneio
} from './torneio';

const ELENCO = ['urubu', 'almirante', 'saci', 'cartola', 'cachorro', 'galo', 'bahia', 'porco', 'mosqueteiro', 'dragao'];

function semente(n = 1): () => number {
  let s = n;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

/** Joga as lutas do jogador com o placar dado até o torneio acabar ou `vezes` lutas. */
function jogar(t: Torneio, placar: [number, number], vezes = 99, aleatorio = semente(5)): Torneio {
  let atual = t;
  for (let i = 0; i < vezes && lutaDoJogador(atual); i += 1) atual = registrarLutaDoJogador(atual, placar, aleatorio);
  return atual;
}

describe('torneio (31/10/2026)', () => {
  it('cria 8 times sem repetir, com o jogador', () => {
    const t = criarTorneio('mata-mata', 8, 'urubu', ELENCO, 'medio', semente());
    expect(t.times).toHaveLength(8);
    expect(new Set(t.times).size).toBe(8);
    expect(t.times).toContain('urubu');
    expect(t.times.every((id) => ELENCO.includes(id))).toBe(true);
  });

  it('recusa elenco pequeno', () => {
    expect(() => criarTorneio('mata-mata', 16, 'urubu', ELENCO, 'medio', semente())).toThrow();
  });

  it('pontos: 2x0 vale 2, 2x1 vale 1, derrota 0', () => {
    expect(pontosDaLuta([2, 0])).toBe(2);
    expect(pontosDaLuta([2, 1])).toBe(1);
    expect(pontosDaLuta([1, 2])).toBe(0);
    expect(pontosDaLuta([0, 2])).toBe(0);
  });

  it('pontos corridos: 7 rodadas de 4 lutas, cada par uma vez', () => {
    const t = criarTorneio('pontos-corridos', 8, 'urubu', ELENCO, 'medio', semente());
    expect(t.rodadas).toHaveLength(7);
    t.rodadas.forEach((rodada) => {
      expect(rodada).toHaveLength(4);
      expect(new Set(rodada.flatMap((l) => [l.a, l.b])).size).toBe(8);
    });
    const pares = t.rodadas.flat().map((l) => [l.a, l.b].sort().join('-'));
    expect(new Set(pares).size).toBe(28);
  });

  it('mata-mata de 8: quartas, semi, final e campeão', () => {
    const t = criarTorneio('mata-mata', 8, 'urubu', ELENCO, 'medio', semente());
    expect(nomeDaRodada(t, 0)).toBe('Quartas');
    expect(nomeDaRodada(t, 1)).toBe('Semifinal');
    expect(nomeDaRodada(t, 2)).toBe('Final');
    const fim = jogar(t, [2, 1]);
    expect(fim.rodadas.map((r) => r.length)).toEqual([4, 2, 1]);
    expect(situacao(fim)).toEqual({ tipo: 'campeao' });
    expect(lutaDoJogador(fim)).toBeNull();
  });

  it('mata-mata: perdeu nas quartas, eliminado nas Quartas', () => {
    const t = criarTorneio('mata-mata', 8, 'urubu', ELENCO, 'medio', semente());
    const fim = registrarLutaDoJogador(t, [0, 2], semente(3));
    expect(situacao(fim)).toEqual({ tipo: 'eliminado', fase: 'Quartas' });
    expect(lutaDoJogador(fim)).toBeNull();
  });

  it('placares sorteados são 2x0 ou 2x1', () => {
    const fim = jogar(criarTorneio('pontos-corridos', 8, 'urubu', ELENCO, 'medio', semente()), [2, 0]);
    fim.rodadas.flat().forEach((l) => {
      expect(l.placar).not.toBeNull();
      const [a, b] = l.placar!;
      expect([a, b].sort().join('x')).toMatch(/^(0x2|1x2)$/);
    });
  });

  it('tabela desempata por saldo de rounds', () => {
    const t: Torneio = {
      versao: 1, formato: 'pontos-corridos', tamanho: 8, dificuldade: 'medio', jogador: 'a',
      times: ['a', 'b', 'c', 'd'], rodadaAtual: 1,
      rodadas: [[
        { a: 'a', b: 'c', placar: [2, 1] },
        { a: 'b', b: 'd', placar: [2, 1] },
        { a: 'c', b: 'd', placar: [0, 2] },
        { a: 'a', b: 'd', placar: [1, 2] },
        { a: 'b', b: 'c', placar: [1, 2] }
      ]]
    };
    // a: 1 ponto, rounds 3-3; b: 1 ponto, 3-3; c: 1 ponto, 3-5; d: 3 pontos. c fica atrás de a pelo saldo.
    const linhas = tabela(t);
    expect(linhas[0].time).toBe('d');
    expect(linhas[0].pontos).toBe(3);
    const c = linhas.find((l) => l.time === 'c')!;
    expect(c.pontos).toBe(1);
    expect(c.roundsPro - c.roundsContra).toBe(-2);
    expect(linhas.findIndex((l) => l.time === 'c')).toBeGreaterThan(linhas.findIndex((l) => l.time === 'a'));
  });

  it('pontos corridos: perder não elimina e no fim dá a posição', () => {
    const t = criarTorneio('pontos-corridos', 8, 'urubu', ELENCO, 'medio', semente());
    const fim = jogar(t, [0, 2]);
    expect(fim.rodadaAtual).toBe(7);
    const s = situacao(fim);
    expect(s.tipo).toBe('posicao');
    if (s.tipo === 'posicao') expect(s.posicao).toBe(tabela(fim).findIndex((l) => l.time === 'urubu') + 1);
    expect(nomeDaRodada(t, 2)).toBe('Rodada 3 de 7');
  });

  it('16 times só com 16 no elenco', () => {
    expect(torneioDisponivel(16, 10)).toBe(false);
    expect(torneioDisponivel(16, 16)).toBe(true);
    expect(torneioDisponivel(8, 10)).toBe(true);
  });
});
