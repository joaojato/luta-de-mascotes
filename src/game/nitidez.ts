/**
 * Nitidez: o jogo pensa em 1280x720, mas desenha na resolução de verdade da
 * área onde aparece. Esticar um canvas de 1280x720 até um monitor maior (ou
 * com zoom do Windows) borrava as letras; um canvas maior que a área, reduzido
 * pelo navegador, serrilhava tudo.
 *
 * Como: o canvas nasce do tamanho exato da área em pixels de verdade
 * (`escala` vezes o tamanho lógico), a câmera de cada cena dá zoom de `escala`
 * a partir do canto (origem 0, 0, para o HUD preso à câmera não sair do
 * lugar) e todo texto é rasterizado na mesma escala. Quando a janela muda de
 * tamanho, a escala acompanha. As cenas continuam montando tudo em
 * coordenadas de 1280x720: o tamanho lógico vem de {@link telaDe}, nunca de
 * `cameras.main.width`, que é o do canvas.
 */
import * as Phaser from 'phaser';

import { calcularEscala } from './escalaDeDesenho';

let escalaAtual = 1;

/** A escala em uso (1 antes de o jogo nascer, e nos testes). */
export function escalaDeDesenho(): number {
  return escalaAtual;
}

/**
 * Escala para a área do elemento onde o canvas mora.
 * @param larguraLogica - Largura lógica do jogo.
 * @param alturaLogica - Altura lógica do jogo.
 * @param area - O elemento pai do canvas.
 */
function escalaPara(larguraLogica: number, alturaLogica: number, area: HTMLElement): number {
  return calcularEscala(larguraLogica, alturaLogica, {
    largura: area.clientWidth || window.innerWidth,
    altura: area.clientHeight || window.innerHeight,
    dpr: window.devicePixelRatio || 1
  });
}

/**
 * Decide a escala na criação do jogo e devolve o tamanho do canvas.
 * @param larguraLogica - Largura do perfil.
 * @param alturaLogica - Altura do perfil.
 * @param area - O elemento pai do canvas.
 */
export function decidirEscala(larguraLogica: number, alturaLogica: number, area: HTMLElement): { width: number; height: number } {
  escalaAtual = escalaPara(larguraLogica, alturaLogica, area);
  return { width: Math.round(larguraLogica * escalaAtual), height: Math.round(alturaLogica * escalaAtual) };
}

/** O tamanho lógico da tela da cena (1280x720 deitado), onde tudo se monta. */
export interface TelaLogica {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

/**
 * Tamanho lógico da cena: o do canvas dividido pela escala (o canvas é
 * arredondado em pixel inteiro, então o lógico volta arredondado também).
 * @param scene - Qualquer cena do jogo.
 */
export function telaDe(scene: Phaser.Scene): TelaLogica {
  const width = Math.round(scene.scale.width / escalaAtual);
  const height = Math.round(scene.scale.height / escalaAtual);
  return { width, height, centerX: width / 2, centerY: height / 2 };
}

/**
 * Liga a nitidez: zoom da câmera principal a cada cena que começa, texto
 * rasterizado na escala assim que entra na cena, e nova escala quando a área
 * do jogo muda de tamanho (texto já criado fica na escala antiga até a
 * próxima tela).
 * @param game - O jogo recém-criado.
 * @param area - O elemento pai do canvas.
 */
export function instalarNitidez(game: Phaser.Game, area: HTMLElement): void {
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

  let espera: number | undefined;
  const reajustar = (): void => {
    if (!game.isBooted || !game.canvas) return;
    // O Phaser guarda a medida da área e só a renova no próprio ritmo: medir agora.
    game.scale.getParentBounds();
    const larguraLogica = Math.round(game.scale.width / escalaAtual);
    const alturaLogica = Math.round(game.scale.height / escalaAtual);
    const nova = escalaPara(larguraLogica, alturaLogica, area);
    if (Math.abs(nova - escalaAtual) < 0.01) {
      // Mesma escala, área nova: só reencaixa o canvas nela.
      game.scale.refresh();
      return;
    }
    escalaAtual = nova;
    const width = Math.round(larguraLogica * nova);
    const height = Math.round(alturaLogica * nova);
    game.scale.setGameSize(width, height);
    // Só as cenas rodando (ou pausadas por baixo dos Ajustes) têm câmera agora.
    for (const cena of game.scene.scenes) {
      if (cena.sys.isActive() || cena.sys.isPaused()) cena.cameras.main?.setSize(width, height).setOrigin(0, 0).setZoom(nova);
    }
  };
  const aoMudar = (): void => {
    window.clearTimeout(espera);
    espera = window.setTimeout(reajustar, 150);
  };
  // A área muda com a janela e também com a gaveta de debug empurrando o jogo.
  const observador = new ResizeObserver(aoMudar);
  observador.observe(area);
  game.events.once(Phaser.Core.Events.DESTROY, () => {
    observador.disconnect();
    window.clearTimeout(espera);
  });
}
