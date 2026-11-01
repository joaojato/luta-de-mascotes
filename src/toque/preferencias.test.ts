import { describe, expect, it } from 'vitest';

import { lerPreferencias, PREFERENCIAS_PADRAO } from './preferencias';

describe('preferências dos botões do celular', () => {
  it('padrão é Xbox, sem nome de golpe', () => {
    expect(PREFERENCIAS_PADRAO).toEqual({ cara: 'xbox', nomes: false });
    expect(lerPreferencias(null)).toEqual(PREFERENCIAS_PADRAO);
  });

  it('guarda PlayStation e nomes ligados; lixo volta ao padrão campo a campo', () => {
    expect(lerPreferencias({ cara: 'playstation', nomes: true })).toEqual({ cara: 'playstation', nomes: true });
    expect(lerPreferencias({ cara: 'nintendo', nomes: true })).toEqual({ cara: 'xbox', nomes: true });
    expect(lerPreferencias({ cara: 'playstation', nomes: 'sim' })).toEqual({ cara: 'playstation', nomes: false });
  });
});
