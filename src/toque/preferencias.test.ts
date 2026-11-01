import { describe, expect, it } from 'vitest';

import { lerPreferencias, PREFERENCIAS_PADRAO, proximaOpacidade } from './preferencias';

describe('preferências dos botões do celular', () => {
  it('padrão é Xbox, sem nome de golpe, controles opacos', () => {
    expect(PREFERENCIAS_PADRAO).toEqual({ cara: 'xbox', nomes: false, opacidade: 1 });
    expect(lerPreferencias(null)).toEqual(PREFERENCIAS_PADRAO);
  });

  it('guarda PlayStation e nomes ligados; lixo volta ao padrão campo a campo', () => {
    expect(lerPreferencias({ cara: 'playstation', nomes: true, opacidade: 0.5 })).toEqual({ cara: 'playstation', nomes: true, opacidade: 0.5 });
    expect(lerPreferencias({ cara: 'nintendo', nomes: true })).toEqual({ cara: 'xbox', nomes: true, opacidade: 1 });
    expect(lerPreferencias({ cara: 'playstation', nomes: 'sim', opacidade: 0.01 })).toEqual({ cara: 'playstation', nomes: false, opacidade: 1 });
  });

  it('opacidade anda em degraus e dá a volta', () => {
    expect([1, 0.75, 0.5, 0.3].map(proximaOpacidade)).toEqual([0.75, 0.5, 0.3, 1]);
  });
});
