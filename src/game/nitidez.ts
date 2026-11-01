/**
 * Nitidez: o jogo pensa em 1280x720, mas desenha na resolução de verdade da
 * tela. Esticar um canvas de 1280x720 até um monitor maior (ou com zoom do
 * Windows) borrava as letras e serrilhava os contornos.
 *
 * Como: o canvas nasce `ESCALA` vezes maior, a câmera de cada cena dá zoom de
 * `ESCALA` a partir do canto (origem 0, 0, para o HUD preso à câmera não sair
 * do lugar) e todo texto é rasterizado na mesma escala. As cenas continuam
 * montando tudo em coordenadas de 1280x720: o tamanho lógico vem de
 * {@link telaDe}, nunca de `cameras.main.width`, que agora é o do canvas.
 */
import * as Phaser from 'phaser';

import { calcularEscala } from './escalaDeDesenho';

let escalaAtual = 1;

/** A escala decidida na criação do jogo (1 antes disso, e nos testes). */
export function escalaDeDesenho(): number {
  return escalaAtual;
}

/**
 * Decide a escala para o perfil, pelo monitor desta máquina.
 * @param larguraLogica - Largura do perfil.
 * @param alturaLogica - Altura do perfil.
 */
export function decidirEscala(larguraLogica: number, alturaLogica: number): number {
  const largura = Math.max(window.screen?.width ?? 0, window.innerWidth);
  const altura = Math.max(window.screen?.height ?? 0, window.innerHeight);
  // Deitado ou em pé, o lado maior do monitor casa com o lado maior do jogo.
  const deitado = larguraLogica >= alturaLogica;
  escalaAtual = calcularEscala(larguraLogica, alturaLogica, {
    largura: deitado ? Math.max(largura, altura) : Math.min(largura, altura),
    altura: deitado ? Math.min(largura, altura) : Math.max(largura, altura),
    dpr: window.devicePixelRatio || 1
  });
  return escalaAtual;
}

/** O tamanho lógico da tela da cena (1280x720 deitado), onde tudo se monta. */
export interface TelaLogica {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

/**
 * Tamanho lógico da cena: o do canvas dividido pela escala.
 * @param scene - Qualquer cena do jogo.
 */
export function telaDe(scene: Phaser.Scene): TelaLogica {
  const width = scene.scale.width / escalaAtual;
  const height = scene.scale.height / escalaAtual;
  return { width, height, centerX: width / 2, centerY: height / 2 };
}

/**
 * Liga a nitidez em todas as cenas: zoom da câmera principal a cada cena que
 * começa e texto rasterizado na escala assim que entra na cena.
 * @param game - O jogo recém-criado.
 */
export function instalarNitidez(game: Phaser.Game): void {
  const ligar = (): void => {
    for (const cena of game.scene.scenes) {
      const zoom = (): void => {
        cena.cameras.main.setOrigin(0, 0).setZoom(escalaAtual);
      };
      // A primeira cena já começou antes do READY.
      if (cena.sys.isActive()) zoom();
      cena.sys.events.on(Phaser.Scenes.Events.START, zoom);
      cena.sys.events.on(Phaser.Scenes.Events.ADDED_TO_SCENE, (objeto: Phaser.GameObjects.GameObject) => {
        if (objeto instanceof Phaser.GameObjects.Text && objeto.style.resolution < escalaAtual) {
          objeto.setResolution(escalaAtual);
        }
      });
    }
  };
  if (game.isBooted && game.scene.scenes.length > 0) {
    ligar();
  } else {
    game.events.once(Phaser.Core.Events.READY, ligar);
  }
}
