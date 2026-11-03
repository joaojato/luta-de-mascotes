import { describe, expect, it } from 'vitest';

import type { LeituraDaLuta } from '../cpu';
import { CpuDoTutorial } from './cpuDoTutorial';
import { ROTEIRO } from './roteiro';
import { Tutorial, type QuadroDoJogador } from './tutorial';

const PARADO: QuadroDoJogador = { esquerda: false, direita: false, noAr: false, agachado: false, dash: null };

/** Fecha as falas na tela (e as da etapa só de fala que vier depois). */
function lerFalas(tutorial: Tutorial): void {
  for (let i = 0; i < 50 && tutorial.congelado; i++) tutorial.continuar();
}

/** Faz um pouco de tudo, uma coisa por quadro, como o jogador faria. */
function fazerTudo(tutorial: Tutorial): void {
  tutorial.quadro({ ...PARADO, esquerda: true }, 1);
  tutorial.quadro({ ...PARADO, direita: true }, 1);
  tutorial.quadro({ ...PARADO, noAr: true }, 0.1);
  tutorial.quadro({ ...PARADO, agachado: true }, 0.1);
  tutorial.quadro({ ...PARADO, dash: 'frente' }, 0.1);
  const golpe = (g: string, guardaQuebrada = false) => tutorial.golpe({ atacante: 'p1', golpe: g, defendido: false, guardaQuebrada });
  golpe('soco-rapido');
  golpe('chute-basico');
  golpe('soco-forte', true);
  golpe('voadora');
}

describe('etapas do tutorial', () => {
  it('começa congelado na primeira fala e avisa a etapa nova uma vez', () => {
    const tutorial = new Tutorial();
    expect(tutorial.congelado).toBe(true);
    expect(tutorial.falaAtual).toContain('{esquerda}');
    expect(tutorial.tomarEtapaNova()?.id).toBe('andar');
    expect(tutorial.tomarEtapaNova()).toBeNull();
  });

  it('com a fala na tela, nada que o jogador faz conta', () => {
    const tutorial = new Tutorial();
    tutorial.quadro({ ...PARADO, esquerda: true }, 1);
    lerFalas(tutorial);
    expect(tutorial.checklist.every((item) => !item.feito)).toBe(true);
  });

  it('o checklist libera a próxima etapa só quando tudo foi feito', () => {
    const tutorial = new Tutorial();
    lerFalas(tutorial);
    tutorial.quadro({ ...PARADO, esquerda: true }, 0.4);
    expect(tutorial.etapa.id).toBe('andar');
    expect(tutorial.checklist.map((item) => item.feito)).toEqual([true, false]);
    // Toque rápido não conta como andar.
    tutorial.quadro({ ...PARADO, direita: true }, 0.1);
    expect(tutorial.etapa.id).toBe('andar');
    tutorial.quadro({ ...PARADO, direita: true }, 0.25);
    expect(tutorial.etapa.id).toBe('pular');
    expect(tutorial.congelado).toBe(true);
  });

  it('percorre o roteiro inteiro até o QUEBRE ELE', () => {
    const tutorial = new Tutorial();
    const ids: string[] = [];
    for (let i = 0; i < 200 && !tutorial.acabou; i++) {
      const nova = tutorial.tomarEtapaNova();
      if (nova) ids.push(nova.id);
      if (tutorial.congelado) tutorial.continuar();
      else fazerTudo(tutorial);
    }
    expect(tutorial.acabou).toBe(true);
    expect(ids).toEqual(ROTEIRO.map((etapa) => etapa.id));
  });

  it('golpe defendido não conta como acerto, e golpe da CPU não conta nada', () => {
    const tutorial = new Tutorial();
    for (let i = 0; i < 50 && tutorial.etapa.id !== 'bater'; i++) {
      lerFalas(tutorial);
      tutorial.quadro({ ...PARADO, esquerda: true }, 1);
      tutorial.quadro({ ...PARADO, direita: true }, 1);
      tutorial.quadro({ ...PARADO, noAr: true, agachado: true, dash: 'frente' }, 0.1);
    }
    lerFalas(tutorial);
    tutorial.golpe({ atacante: 'p1', golpe: 'soco-rapido', defendido: true, guardaQuebrada: false });
    tutorial.golpe({ atacante: 'p2', golpe: 'chute-basico', defendido: false, guardaQuebrada: false });
    expect(tutorial.checklist.every((item) => !item.feito)).toBe(true);
  });

  it('etapa só de fala passa ao fechar a fala, com a torcida e a luz dela', () => {
    const tutorial = new Tutorial();
    for (let i = 0; i < 50 && tutorial.etapa.id !== 'que-show'; i++) {
      lerFalas(tutorial);
      fazerTudo(tutorial);
    }
    tutorial.tomarEtapaNova();
    expect(tutorial.etapa.putometro).toBe('cheio');
    expect(tutorial.etapa.foco).toEqual(['putometro']);
    tutorial.continuar();
    expect(tutorial.tomarEtapaNova()?.id).toBe('quebrar-guarda');
    expect(tutorial.congelado).toBe(true);
  });
});

describe('CPU do tutorial', () => {
  const leitura = (eu: number, oponente: number, tempoMs = 0, noAr = false): LeituraDaLuta => ({
    tempoMs,
    eu: { x: eu, noAr, atordoado: false, barraCheia: false, chuteDeLonge: false },
    oponente: { x: oponente, noAr: false, atordoado: false, atacando: false, projetil: false, caido: false }
  });

  it('parada não faz nada; chegar anda até perto e para', () => {
    const cpu = new CpuDoTutorial();
    expect(Object.values(cpu.atualizar('parada', leitura(800, 300))).some(Boolean)).toBe(false);
    expect(cpu.atualizar('chegar', leitura(800, 300)).left).toBe(true);
    expect(cpu.atualizar('chegar', leitura(450, 300)).left).toBe(false);
  });

  it('guarda alta: chega e segura a defesa em pé', () => {
    const cpu = new CpuDoTutorial();
    expect(cpu.atualizar('guarda-alta', leitura(800, 300)).left).toBe(true);
    const perto = cpu.atualizar('guarda-alta', leitura(480, 300));
    expect(perto.block).toBe(true);
    expect(perto.crouch).toBe(false);
  });

  it('pula no lugar com 1,5 s entre o pouso e o próximo pulo', () => {
    const cpu = new CpuDoTutorial();
    expect(cpu.atualizar('pular', leitura(500, 300, 0)).jump).toBe(true);
    cpu.atualizar('pular', leitura(500, 300, 100, true));
    expect(cpu.atualizar('pular', leitura(500, 300, 900)).jump).toBe(false);
    expect(cpu.atualizar('pular', leitura(500, 300, 2300)).jump).toBe(false);
    expect(cpu.atualizar('pular', leitura(500, 300, 2400)).jump).toBe(true);
  });
});
