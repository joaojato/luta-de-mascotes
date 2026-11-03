import { describe, expect, it } from 'vitest';

import { layoutDoMenu } from './menuPrincipal';

// O menu subia e deixava um vão embaixo (João, 03/11/2026): logo e botões
// formam um bloco centrado na altura da tela, com 4 opções ou com as 6 do dev.
describe('layout do menu principal', () => {
  for (const quantas of [4, 6]) {
    it(`com ${quantas} opções, o bloco fica no meio da tela`, () => {
      const l = layoutDoMenu(720, 147, quantas);
      const topo = l.logoY - 147 / 2;
      const ultimoBotao = l.primeiroBotaoY + (quantas - 1) * l.espaco + l.alturaBotao / 2;
      expect(topo).toBeCloseTo(720 - ultimoBotao);
    });

    it(`com ${quantas} opções, o primeiro botão fica abaixo da logo e o último acima do rodapé`, () => {
      const l = layoutDoMenu(720, 147, quantas);
      expect(l.primeiroBotaoY - l.alturaBotao / 2).toBeGreaterThan(l.logoY + 147 / 2);
      expect(l.primeiroBotaoY + (quantas - 1) * l.espaco + l.alturaBotao / 2).toBeLessThan(720 - 60);
    });
  }
});
