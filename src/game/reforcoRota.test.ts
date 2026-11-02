import { describe, expect, it } from 'vitest';

import { caixaNoMundo, escapou, ladoDoReforco, passoAteOAlvo, sortearDisparo } from './reforcoRota';

const BOTA = { x: 136, y: 155, largura: 70, altura: 60 };
const ORIGEM = { x: 256, y: 296 };

describe('reforço: o Guerreiro do Cartola', () => {
  it('chuta o alvo na direção do dono', () => {
    // Cartola à esquerda do alvo: o Guerreiro entra pela direita e chuta para a esquerda.
    expect(ladoDoReforco(300, 800)).toBe(-1);
    expect(ladoDoReforco(900, 400)).toBe(1);
  });

  it('corre até o alcance sem passar do ponto, de qualquer lado', () => {
    expect(passoAteOAlvo(1200, 800, -1, 150, 100)).toEqual({ x: 1100, chegou: false });
    // Quadro longo: o passo de 146 px pararia além do ponto; fica no alcance.
    expect(passoAteOAlvo(1000, 800, -1, 150, 146)).toEqual({ x: 950, chegou: true });
    expect(passoAteOAlvo(500, 800, 1, 150, 100)).toEqual({ x: 600, chegou: false });
    expect(passoAteOAlvo(600, 800, 1, 150, 100)).toEqual({ x: 650, chegou: true });
  });

  it('se o alvo veio para perto, para onde está, sem recuar', () => {
    expect(passoAteOAlvo(900, 800, -1, 150, 100)).toEqual({ x: 900, chegou: true });
  });

  it('a caixa do chute fica na bota, à frente do pé de apoio, e espelha com o lado', () => {
    const esquerda = caixaNoMundo(1000, 600, 1, -1, BOTA, ORIGEM);
    expect(esquerda).toEqual({ x: 880, y: 459, largura: 70, altura: 60 });
    const direita = caixaNoMundo(1000, 600, 1, 1, BOTA, ORIGEM);
    expect(direita.x).toBe(1050);
    expect(direita.x + direita.largura).toBe(1120);
    expect(caixaNoMundo(1000, 600, 2, -1, BOTA, ORIGEM).largura).toBe(140);
  });

  it('sorteia o disparo pelo peso', () => {
    const disparos = [{ nome: 'reto' }, { nome: 'rasteiro' }, { nome: 'alto', peso: 2 }];
    expect(sortearDisparo(disparos, 0).nome).toBe('reto');
    expect(sortearDisparo(disparos, 0.3).nome).toBe('rasteiro');
    expect(sortearDisparo(disparos, 0.5).nome).toBe('alto');
    expect(sortearDisparo(disparos, 0.999).nome).toBe('alto');
  });

  // Flecha Negra (João, 02/11/2026): reta em pé, pula ou abaixa; rasteira,
  // só pulando; alta, só abaixando. Bloquear não adianta em nenhuma.
  it('cada flecha tem o seu jeito de escapar', () => {
    const emPe = { noAr: false, agachado: false };
    const pulando = { noAr: true, agachado: false };
    const agachado = { noAr: false, agachado: true };
    const reta = ['pulo', 'agachar'] as const;
    const rasteira = ['pulo'] as const;
    const alta = ['agachar'] as const;
    expect([emPe, pulando, agachado].map((d) => escapou(reta, d))).toEqual([false, true, true]);
    expect([emPe, pulando, agachado].map((d) => escapou(rasteira, d))).toEqual([false, true, false]);
    expect([emPe, pulando, agachado].map((d) => escapou(alta, d))).toEqual([false, false, true]);
    expect(escapou(undefined, pulando)).toBe(false);
  });
});
