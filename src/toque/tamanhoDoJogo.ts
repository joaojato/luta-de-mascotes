/**
 * No celular, o jogo enche a tela em vez de ficar com faixas pretas
 * (docs/mobile.md): a altura fica em 720 e a largura acompanha a proporção
 * da tela. As cenas já se montam pela largura da câmera, então o estádio
 * mostra mais dos lados e o HUD vai para as bordas.
 */
import * as Phaser from 'phaser';

import { escalaDeDesenho } from '../game/nitidez';
import { ALTURA_DO_JOGO, larguraDoJogo } from './layout';

/**
 * Mede a tela a cada cena que abre e ajusta a largura do jogo. Só na
 * abertura: no meio da luta o HUD já está montado, e uma mudança (a barra do
 * Safari aparecendo) fica com faixa fina até a próxima cena.
 * @param game - O jogo.
 * @param parent - O elemento onde o canvas mora (a área segura da tela).
 */
export function acompanharProporcaoDaTela(game: Phaser.Game, parent: HTMLElement): void {
  const ajustar = (): void => {
    // Em pixels de canvas: a largura lógica vezes a escala de desenho (nitidez.ts).
    const escala = escalaDeDesenho();
    const largura = Math.round(larguraDoJogo(parent.clientWidth, parent.clientHeight) * escala);
    const altura = Math.round(ALTURA_DO_JOGO * escala);
    if (game.scale.width !== largura || game.scale.height !== altura) {
      game.scale.setGameSize(largura, altura);
    }
  };
  const ligar = (): void => {
    ajustar();
    for (const cena of game.scene.scenes) {
      cena.sys.events.on(Phaser.Scenes.Events.START, ajustar);
    }
  };
  if (game.isBooted && game.scene.scenes.length > 0) {
    ligar();
  } else {
    game.events.once(Phaser.Core.Events.READY, ligar);
  }
}
