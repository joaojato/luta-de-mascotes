import { describe, expect, it, vi } from 'vitest';

import { aoMudarLuta, lutaNaTela, publicarLuta } from './lutaNaTela';

const LUTA = { nomes: { light: 'Jab', heavy: 'Chute', block: 'Defesa', special: 'Furacão' }, especialPronto: false };

describe('ponte da luta com os botões da tela', () => {
  it('só avisa quando muda', () => {
    const ouvinte = vi.fn();
    const desligar = aoMudarLuta(ouvinte);
    publicarLuta(LUTA);
    publicarLuta({ ...LUTA, nomes: { ...LUTA.nomes } });
    expect(ouvinte).toHaveBeenCalledTimes(1);
    publicarLuta({ ...LUTA, especialPronto: true });
    publicarLuta(null);
    expect(ouvinte).toHaveBeenCalledTimes(3);
    expect(lutaNaTela()).toBeNull();
    desligar();
  });
});
