import { describe, expect, it } from 'vitest';

import { EXIBICAO_PADRAO, lerExibicao } from './exibicao';

describe('exibição da luta', () => {
  it('pontos na vida e dano dos golpes começam desligados', () => {
    expect(EXIBICAO_PADRAO).toEqual({ pontosNaVida: false, danoDosGolpes: false });
    expect(lerExibicao(null)).toEqual(EXIBICAO_PADRAO);
  });

  it('guarda o que foi ligado; lixo volta ao padrão campo a campo', () => {
    expect(lerExibicao({ pontosNaVida: true, danoDosGolpes: true })).toEqual({ pontosNaVida: true, danoDosGolpes: true });
    expect(lerExibicao({ pontosNaVida: 'sim', danoDosGolpes: true })).toEqual({ pontosNaVida: false, danoDosGolpes: true });
  });
});
