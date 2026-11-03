import { describe, expect, it } from 'vitest';

import { ABERTURA_MINIMA_MS, larguraDaBarra, podeSairDaAbertura } from './abertura';

// A abertura mascara o carregamento e mostra os créditos (João, 03/11/2026).
describe('abertura do jogo', () => {
  it('só sai depois de carregar tudo, mesmo que o tempo tenha passado', () => {
    expect(podeSairDaAbertura(ABERTURA_MINIMA_MS * 3, false, false)).toBe(false);
    expect(podeSairDaAbertura(ABERTURA_MINIMA_MS * 3, false, true)).toBe(false);
  });

  it('carregada, fica o tempo dos créditos, a não ser que o jogador pule', () => {
    expect(podeSairDaAbertura(ABERTURA_MINIMA_MS - 1, true, false)).toBe(false);
    expect(podeSairDaAbertura(ABERTURA_MINIMA_MS, true, false)).toBe(true);
    expect(podeSairDaAbertura(200, true, true)).toBe(true);
  });

  it('a barra acompanha o progresso e não passa da moldura', () => {
    expect(larguraDaBarra(0, 400)).toBe(0);
    expect(larguraDaBarra(0.5, 400)).toBe(200);
    expect(larguraDaBarra(1.3, 400)).toBe(400);
    expect(larguraDaBarra(-1, 400)).toBe(0);
  });
});
