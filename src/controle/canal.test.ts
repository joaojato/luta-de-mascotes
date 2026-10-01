import { describe, expect, it } from 'vitest';

import { chegouCelularMaisNovo, devePassar, INTERVALO_POSE_MS, temCelular, temJogo } from './canalSupabase';
import { ehSala, gerarSala, nomeDoCanal, type QuadroPose } from './protocolo';

const pose: QuadroPose = { t: 'pose', jogador: 1, ts: 0, aspecto: 1, img: [], mundo: [] };

describe('sala do controle (ADR 0005)', () => {
  it('gera código que passa na própria checagem', () => {
    for (let i = 0; i < 50; i += 1) {
      expect(ehSala(gerarSala())).toBe(true);
    }
    expect(ehSala(gerarSala(() => 0.999999))).toBe(true);
  });

  it('recusa sala vazia, curta ou com caractere de fora', () => {
    expect(ehSala(null)).toBe(false);
    expect(ehSala('')).toBe(false);
    expect(ehSala('abc')).toBe(false);
    expect(ehSala('abc-12')).toBe(false);
    expect(ehSala('ABCDEF')).toBe(false);
  });

  it('cada jogador tem o seu canal na sala', () => {
    expect(nomeDoCanal('k7m2qx', 1)).not.toBe(nomeDoCanal('k7m2qx', 2));
    expect(nomeDoCanal('k7m2qx', 1)).toBe(nomeDoCanal('k7m2qx', 1));
  });
});

describe('presença no Supabase', () => {
  it('vê o celular e o jogo pelo papel', () => {
    const estado = { jogo: [{ papel: 'jogo', desde: 1 }], abc: [{ papel: 'celular', desde: 2 }] };
    expect(temCelular(estado)).toBe(true);
    expect(temJogo(estado)).toBe(true);
    expect(temCelular({ jogo: [{ papel: 'jogo' }] })).toBe(false);
    expect(temJogo({ abc: [{ papel: 'celular' }] })).toBe(false);
  });

  it('vale o celular que entrou por último', () => {
    const estado = { velho: [{ papel: 'celular', desde: 100 }], novo: [{ papel: 'celular', desde: 200 }] };
    expect(chegouCelularMaisNovo(estado, 'velho', 100)).toBe(true);
    expect(chegouCelularMaisNovo(estado, 'novo', 200)).toBe(false);
  });

  it('o jogo na sala não expulsa o celular', () => {
    expect(chegouCelularMaisNovo({ jogo: [{ papel: 'jogo', desde: 999 }] }, 'eu', 1)).toBe(false);
  });
});

describe('cota de mensagens', () => {
  it('segura pose que chega antes do intervalo', () => {
    expect(devePassar(pose, 1000, 1000 - INTERVALO_POSE_MS + 1)).toBe(false);
    expect(devePassar(pose, 1000, 1000 - INTERVALO_POSE_MS)).toBe(true);
  });

  it('nunca segura recalibrar nem sem-pessoa', () => {
    expect(devePassar({ t: 'recalibrar', jogador: 1 }, 1000, 999)).toBe(true);
    expect(devePassar({ t: 'sem-pessoa', jogador: 1, ts: 0 }, 1000, 999)).toBe(true);
  });

  it('dois celulares a toda velocidade cabem nos 100 eventos/s do plano gratuito', () => {
    const posesPorSegundo = 1000 / INTERVALO_POSE_MS;
    // Cada pose conta duas vezes: sai do celular e chega no jogo.
    expect(2 * posesPorSegundo * 2).toBeLessThanOrEqual(100);
  });
});
