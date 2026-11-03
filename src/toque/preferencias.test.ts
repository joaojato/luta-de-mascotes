import { describe, expect, it } from 'vitest';

import { FUNCOES_PADRAO, lerPreferencias, PREFERENCIAS_PADRAO, proximaOpacidade, trocarFuncao } from './preferencias';

describe('preferências dos botões do celular', () => {
  it('padrão é Xbox, sem nome de golpe, controles opacos', () => {
    expect(PREFERENCIAS_PADRAO).toEqual({ cara: 'xbox', nomes: false, opacidade: 1, funcoes: FUNCOES_PADRAO });
    expect(lerPreferencias(null)).toEqual(PREFERENCIAS_PADRAO);
  });

  it('guarda PlayStation e nomes ligados; lixo volta ao padrão campo a campo', () => {
    const padrao = FUNCOES_PADRAO;
    expect(lerPreferencias({ cara: 'playstation', nomes: true, opacidade: 0.5 })).toEqual({ cara: 'playstation', nomes: true, opacidade: 0.5, funcoes: padrao });
    expect(lerPreferencias({ cara: 'nintendo', nomes: true })).toEqual({ cara: 'xbox', nomes: true, opacidade: 1, funcoes: padrao });
    expect(lerPreferencias({ cara: 'playstation', nomes: 'sim', opacidade: 0.01 })).toEqual({ cara: 'playstation', nomes: false, opacidade: 1, funcoes: padrao });
  });

  it('cada botão troca de golpe só entre os do celular, e quem tinha o golpe fica com o antigo', () => {
    // Baixo (A / ✕) era soco: vira chute, e a esquerda (X / ▢), que chutava, passa a socar.
    const trocado = trocarFuncao(FUNCOES_PADRAO, 'baixo');
    expect(trocado).toEqual({ cima: 'special', direita: 'block', baixo: 'heavy', esquerda: 'light' });
    // Quatro trocas no mesmo botão passam pelos quatro golpes e voltam.
    let funcoes = FUNCOES_PADRAO;
    const vistos = new Set<string>();
    for (let i = 0; i < 4; i++) {
      funcoes = trocarFuncao(funcoes, 'cima');
      vistos.add(funcoes.cima);
      expect(new Set(Object.values(funcoes)).size).toBe(4);
    }
    expect(vistos.size).toBe(4);
    expect(lerPreferencias({ funcoes: trocado }).funcoes).toEqual(trocado);
    // Losango com golpe repetido, faltando, ou com pulo (que é do direcional): volta ao de fábrica.
    expect(lerPreferencias({ funcoes: { ...trocado, cima: 'heavy' } }).funcoes).toEqual(FUNCOES_PADRAO);
    expect(lerPreferencias({ funcoes: { ...trocado, cima: 'jump' } }).funcoes).toEqual(FUNCOES_PADRAO);
  });

  it('opacidade anda em degraus e dá a volta', () => {
    expect([1, 0.75, 0.5, 0.3].map(proximaOpacidade)).toEqual([0.75, 0.5, 0.3, 1]);
  });
});
