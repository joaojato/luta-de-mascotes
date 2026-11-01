import { describe, expect, it } from 'vitest';
import { CpuLutador, DIFICULDADES, type Dificuldade, type LeituraDaLuta } from './cpu';

function leitura(tempoMs: number, distancia: number, extra: Partial<LeituraDaLuta['oponente']> = {}, eu: Partial<LeituraDaLuta['eu']> = {}): LeituraDaLuta {
  return {
    tempoMs,
    eu: { x: 1000, noAr: false, atordoado: false, barraCheia: false, chuteDeLonge: false, ...eu },
    oponente: { x: 1000 - distancia, noAr: false, atordoado: false, atacando: false, projetil: false, caido: false, ...extra }
  };
}

/** Roda a CPU por `segundos` a 60 quadros e conta os golpes que ela soltou. */
function golpesEm(dificuldade: Dificuldade, segundos: number, distancia: number): number {
  let semente = 1;
  const aleatorio = () => ((semente = (semente * 16807) % 2147483647) / 2147483647);
  const cpu = new CpuLutador(dificuldade, aleatorio);
  let golpes = 0;
  for (let q = 0; q < segundos * 60; q += 1) {
    const input = cpu.atualizar(leitura(q * (1000 / 60), distancia));
    if (input.light || input.heavy) golpes += 1;
  }
  return golpes;
}

describe('CPU do 1 VS CPU (30/10/2026)', () => {
  it('longe, anda na direção do oponente', () => {
    const cpu = new CpuLutador('medio', () => 0.99);
    const input = cpu.atualizar(leitura(0, 700));
    // O oponente está à esquerda (x menor).
    expect(input.left).toBe(true);
    expect(input.right).toBe(false);
  });

  it('perto, ataca de verdade', () => {
    expect(golpesEm('medio', 10, 200)).toBeGreaterThan(8);
  });

  it('o difícil ataca mais que o fácil', () => {
    expect(golpesEm('dificil', 10, 200)).toBeGreaterThan(golpesEm('facil', 10, 200) * 1.5);
  });

  it('defende o golpe que vem, só depois do tempo de reação', () => {
    const cpu = new CpuLutador('dificil', () => 0);
    expect(cpu.atualizar(leitura(0, 200, { atacando: true })).block).toBe(false);
    expect(cpu.atualizar(leitura(100, 200, { atacando: true })).block).toBe(false);
    expect(cpu.atualizar(leitura(160, 200, { atacando: true })).block).toBe(true);
  });

  it('usa o especial com a barra cheia', () => {
    const cpu = new CpuLutador('medio', () => 0);
    expect(cpu.atualizar(leitura(0, 300, {}, { barraCheia: true })).special).toBe(true);
  });

  it('atira de longe quando o chute é tiro', () => {
    const cpu = new CpuLutador('dificil', () => 0);
    expect(cpu.atualizar(leitura(0, 800, {}, { chuteDeLonge: true })).heavy).toBe(true);
  });

  it('não faz nada com o oponente caído', () => {
    const cpu = new CpuLutador('dificil', () => 0);
    const input = cpu.atualizar(leitura(0, 200, { caido: true }));
    expect(Object.values(input).some(Boolean)).toBe(false);
  });

  it('cada dificuldade explica o que a CPU faz (31/10/2026)', () => {
    expect(DIFICULDADES.map((d) => d.id)).toEqual(['facil', 'medio', 'dificil']);
    expect(DIFICULDADES.every((d) => d.descricao.length > 20)).toBe(true);
  });

  it('o fácil ataca bem menos (31/10/2026)', () => {
    expect(golpesEm('facil', 20, 200)).toBeLessThanOrEqual(6);
  });

  it('o médio continua igual', () => {
    expect(golpesEm('medio', 10, 200)).toBe(15);
  });

  it('o fácil às vezes faz bobagem em vez de avançar', () => {
    const cpu = new CpuLutador('facil', () => 0.1);
    const input = cpu.atualizar(leitura(0, 700));
    expect(input.left).toBe(false);
    expect(input.right || input.light || input.heavy).toBe(true);
  });

  it('o difícil defende agachado golpe de chão e em pé golpe aéreo', () => {
    const chao = new CpuLutador('dificil', () => 0);
    chao.atualizar(leitura(0, 200, { atacando: true }));
    const baixo = chao.atualizar(leitura(200, 200, { atacando: true }));
    expect(baixo.block && baixo.crouch).toBe(true);
    const ar = new CpuLutador('dificil', () => 0);
    ar.atualizar(leitura(0, 200, { atacando: true, noAr: true }));
    const alto = ar.atualizar(leitura(200, 200, { atacando: true, noAr: true }));
    expect(alto.block).toBe(true);
    expect(alto.crouch).toBe(false);
  });

  it('o difícil pune quando o golpe do oponente termina perto', () => {
    const cpu = new CpuLutador('dificil', () => 0);
    cpu.atualizar(leitura(0, 200, { atacando: true }));
    cpu.atualizar(leitura(200, 200, { atacando: true }));
    const input = cpu.atualizar(leitura(300, 200));
    expect(input.light || input.heavy).toBe(true);
  });

  it('o difícil guarda o especial para a hora certa', () => {
    const calmo = new CpuLutador('dificil', () => 0);
    expect(calmo.atualizar(leitura(0, 300, {}, { barraCheia: true })).special).toBe(false);
    const tonto = new CpuLutador('dificil', () => 0);
    expect(tonto.atualizar(leitura(0, 200, { atordoado: true }, { barraCheia: true })).special).toBe(true);
  });

  it('o difícil corta o pulo do oponente', () => {
    const cpu = new CpuLutador('dificil', () => 0);
    expect(cpu.atualizar(leitura(0, 250, { noAr: true })).heavy).toBe(true);
  });
});
