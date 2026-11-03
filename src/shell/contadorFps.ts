import type * as Phaser from 'phaser';

import type { Store } from '../game/store';
import type { GameSettings } from '../game/types';

/**
 * Contador de quadros por segundo no canto de cima à direita, por cima de
 * qualquer tela. Liga e desliga em Ajustes ▸ FPS na tela; lê o laço do Phaser
 * duas vezes por segundo, para o número não tremer.
 */
export function montarContadorDeFps(host: HTMLElement, settingsStore: Store<GameSettings>, jogo: () => Phaser.Game | null): void {
  const caixa = document.createElement('div');
  caixa.className = 'contador-fps';
  caixa.setAttribute('aria-hidden', 'true');
  host.appendChild(caixa);

  let relogio: number | null = null;
  const medir = (): void => {
    const fps = jogo()?.loop.actualFps;
    caixa.textContent = fps ? `${Math.round(fps)} FPS` : '-- FPS';
  };

  settingsStore.subscribe(({ mostrarFps }) => {
    caixa.hidden = !mostrarFps;
    if (mostrarFps && relogio === null) {
      medir();
      relogio = window.setInterval(medir, 500);
    } else if (!mostrarFps && relogio !== null) {
      window.clearInterval(relogio);
      relogio = null;
    }
  });
}
