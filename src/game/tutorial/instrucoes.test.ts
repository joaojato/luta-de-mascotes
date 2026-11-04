import { describe, expect, it } from 'vitest';

import { CONTROLES_PADRAO } from '../controles';
import type { FighterInput } from '../fighter';
import { comandosApertados, INSTRUCOES, Instrucoes, type LadoNoQuadro } from './instrucoes';
import { textoDasDuasMaos, trocarMarcadores } from './teclas';

const NADA: FighterInput = { left: false, right: false, crouch: false, block: false, jump: false, light: false, heavy: false, special: false };
const lado = (input: Partial<FighterInput>, noAr = false): LadoNoQuadro => ({ input: { ...NADA, ...input }, noAr });
const parado = lado({});

describe('instruções do 1x1', () => {
  it('lê o golpe pela situação: de pé, abaixado ou no ar', () => {
    expect(comandosApertados(lado({ light: true }))).toEqual(['soco']);
    expect(comandosApertados(lado({ light: true, crouch: true }))).toEqual(['abaixar', 'soco-forte']);
    expect(comandosApertados(lado({ heavy: true, crouch: true }))).toEqual(['abaixar', 'chute-baixo']);
    expect(comandosApertados(lado({ light: true }, true))).toEqual(['soco-no-ar']);
    expect(comandosApertados(lado({ heavy: true }, true))).toEqual(['voadora']);
  });

  it('a etapa só passa quando os dois lados fizeram tudo, e depois de 1 s', () => {
    const instrucoes = new Instrucoes();
    instrucoes.quadro([lado({ left: true }), lado({ left: true })], 0.016);
    instrucoes.quadro([lado({ right: true }), parado], 0.016);
    expect(instrucoes.checklist(0).every((item) => item.feito)).toBe(true);
    expect(instrucoes.checklist(1).map((item) => item.feito)).toEqual([true, false]);
    instrucoes.quadro([parado, lado({ right: true })], 0.016);
    expect(instrucoes.etapa.id).toBe('andar');
    instrucoes.quadro([parado, parado], 0.6);
    expect(instrucoes.etapa.id).toBe('andar');
    instrucoes.quadro([parado, parado], 0.5);
    expect(instrucoes.etapa.id).toBe('pular');
    expect(instrucoes.checklist(0).every((item) => !item.feito)).toBe(true);
  });

  it('o que não é da etapa não conta para depois', () => {
    const instrucoes = new Instrucoes();
    instrucoes.quadro([lado({ jump: true }), lado({ jump: true })], 0.016);
    instrucoes.quadro([lado({ left: true }), lado({ left: true })], 0.016);
    instrucoes.quadro([lado({ right: true }), lado({ right: true })], 0.016);
    instrucoes.quadro([parado, parado], 1.1);
    expect(instrucoes.etapa.id).toBe('pular');
    expect(instrucoes.checklist(0)[0].feito).toBe(false);
  });

  it('percorre todas as etapas e acaba', () => {
    const instrucoes = new Instrucoes();
    const todos = (input: Partial<FighterInput>, noAr = false) => instrucoes.quadro([lado(input, noAr), lado(input, noAr)], 0.016);
    for (let i = 0; i < INSTRUCOES.length; i++) {
      todos({ left: true });
      todos({ right: true });
      todos({ jump: true });
      todos({ crouch: true });
      todos({ light: true });
      todos({ heavy: true });
      todos({ light: true, crouch: true });
      todos({ heavy: true, crouch: true });
      todos({ light: true }, true);
      todos({ heavy: true }, true);
      todos({ block: true });
      todos({ special: true });
      instrucoes.quadro([parado, parado], 1.1);
    }
    expect(instrucoes.acabou).toBe(true);
  });

  it('cada lado lê as próprias teclas, com o remapeamento', () => {
    const item = INSTRUCOES[2].itens[0].texto;
    expect(trocarMarcadores(item, { toque: false, botoes: CONTROLES_PADRAO.p1, olhando: 1 })).toBe('Soco "E"');
    expect(trocarMarcadores(item, { toque: false, botoes: CONTROLES_PADRAO.p2, olhando: -1 })).toBe('Soco "P"');
    expect(trocarMarcadores(item, { toque: false, botoes: { ...CONTROLES_PADRAO.p2, light: 'J' }, olhando: -1 })).toBe('Soco "J"');
  });
});

describe('nomes dos golpes e do menu nos textos', () => {
  const teclado = { toque: false as const, botoes: CONTROLES_PADRAO.p1, olhando: 1 as const };

  it('o golpe com o nome do mascote; sem nome no JSON, o do catálogo', () => {
    const nomes = { 'soco-rapido': 'Jab', 'chute-basico': 'Garrucha' };
    expect(trocarMarcadores('Acertar um golpe de {golpe:soco-rapido} {soco}', { ...teclado, nomes })).toBe('Acertar um golpe de Jab "E"');
    expect(trocarMarcadores('{golpe:chute-basico} {chute}', { ...teclado, nomes })).toBe('Garrucha "Q"');
    expect(trocarMarcadores('{golpe:voadora}', teclado)).toBe('Voadora');
  });

  it('o menu é o Esc no teclado e o botão de menu no celular', () => {
    expect(trocarMarcadores('({menu})', teclado)).toBe('("Esc")');
    const toque = { toque: true as const, preferencias: { cara: 'xbox' as const, nomes: false, opacidade: 1, funcoes: { cima: 'special' as const, direita: 'block' as const, baixo: 'light' as const, esquerda: 'heavy' as const } }, olhando: 1 as const };
    expect(trocarMarcadores('({menu})', toque)).toBe('(o botão de menu)');
  });
});

describe('fala das duas mãos', () => {
  it('as teclas da outra mão, cada uma igual à do P1', () => {
    expect(textoDasDuasMaos(CONTROLES_PADRAO.p1)).toBe('"I" = "Q" (chute), "O" = "E" (soco) e "P" = "C" (bloqueio)');
  });

  it('segue o remapeamento, e a extra que bate com uma tecla do P1 sai', () => {
    const botoes = { ...CONTROLES_PADRAO.p1, light: 'J', block: 'P' };
    expect(textoDasDuasMaos(botoes)).toBe('"I" = "Q" (chute) e "O" = "J" (soco)');
  });

  it('no celular não há teclado: o marcador some', () => {
    expect(trocarMarcadores('{duasMaos}', { toque: true, preferencias: { cara: 'xbox', nomes: false, opacidade: 1, funcoes: { cima: 'special', direita: 'block', baixo: 'light', esquerda: 'heavy' } }, olhando: 1 })).toBe('');
  });
});
