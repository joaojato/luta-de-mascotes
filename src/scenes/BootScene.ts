import * as Phaser from 'phaser';

import { preloadStarterAssets, registerStarterAnimations } from '../game/assets';
import { registerGeneratedAssets } from '../game/generatedAssets';
import { registerFightingUiAtlasFrames } from '../game/fightingUiAtlas';
import { carregarTorcida } from '../game/torcidaCena';
import { carregarBiriba } from '../game/biribaCena';
import { CREDITO_DA_ABERTURA, larguraDaBarra, podeSairDaAbertura } from '../game/abertura';
import { COR_BORDA, COR_DESTAQUE, COR_FUNDO, CONTORNO_TITULO, FONTE_TEXTO, FONTE_TITULO, FONTES_DO_JOGO, SOMBRA_TITULO, TEXTO_APAGADO, TEXTO_DESTAQUE } from '../game/estilo';
import { SCENE_KEYS } from '../game/types';
import { BaseScene } from './BaseScene';

const LARGURA_DA_BARRA = 420;
const ALTURA_DA_BARRA = 10;

/**
 * Carrega o jogo atrás da abertura (src/game/abertura.ts): o crédito do grupo
 * aparece no meio da tela e a barra de carregamento enche embaixo dele.
 */
export class BootScene extends BaseScene {
  private inicio = 0;

  private carregou = false;

  private pulou = false;

  private saindo = false;

  private textos: Phaser.GameObjects.Text[] = [];

  private fontes: Promise<unknown> = Promise.resolve();

  constructor() {
    super(SCENE_KEYS.Boot);
  }

  preload(): void {
    this.inicio = this.time.now;
    this.carregou = false;
    this.pulou = false;
    this.saindo = false;
    // As fontes vêm junto com a arte: até 3 s, e o texto do canvas, que não se
    // redesenha sozinho quando a fonte chega, é redesenhado com elas.
    const limite = new Promise((resolver) => window.setTimeout(resolver, 3000));
    this.fontes = Promise.race([Promise.all(FONTES_DO_JOGO.map((fonte) => document.fonts.load(fonte))), limite])
      .catch(() => undefined)
      .then(() => this.textos.forEach((texto) => texto.updateText()));
    this.montarAbertura();
    preloadStarterAssets(this);
    carregarTorcida(this);
    carregarBiriba(this);
  }

  create(): void {
    this.markActiveScene(SCENE_KEYS.Boot);
    registerGeneratedAssets(this);
    registerFightingUiAtlasFrames(this);
    registerStarterAnimations(this);
    // O menu só abre com as fontes prontas.
    void this.fontes.then(() => {
      this.carregou = true;
    });
  }

  update(time: number): void {
    if (this.saindo || !podeSairDaAbertura(time - this.inicio, this.carregou, this.pulou)) return;
    this.saindo = true;
    this.cameras.main.fadeOut(350, 5, 3, 10);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start(SCENE_KEYS.MainMenu));
  }

  /** Crédito no meio, barra embaixo; tecla ou clique pula depois de carregar. */
  private montarAbertura(): void {
    const { centerX, centerY } = this.tela;
    this.cameras.main.setBackgroundColor(COR_FUNDO);

    const nomes = this.add
      .text(centerX, centerY - 30, CREDITO_DA_ABERTURA.nomes, {
        fontFamily: FONTE_TITULO,
        fontSize: '44px',
        fontStyle: '900',
        color: TEXTO_DESTAQUE,
        stroke: CONTORNO_TITULO,
        strokeThickness: 6,
        shadow: { offsetX: 4, offsetY: 4, color: SOMBRA_TITULO, fill: true, stroke: true }
      })
      .setOrigin(0.5)
      .setAlpha(0);
    const linha = this.add
      .text(centerX, centerY + 22, CREDITO_DA_ABERTURA.linha, {
        fontFamily: FONTE_TEXTO,
        fontSize: '22px',
        fontStyle: '500',
        color: TEXTO_APAGADO
      })
      .setOrigin(0.5)
      .setAlpha(0);
    this.textos = [nomes, linha];
    this.tweens.add({ targets: nomes, alpha: 1, y: nomes.y - 8, duration: 900, ease: 'Sine.easeOut' });
    this.tweens.add({ targets: linha, alpha: 1, duration: 700, delay: 600 });

    const yBarra = centerY + 150;
    this.add.rectangle(centerX, yBarra, LARGURA_DA_BARRA + 6, ALTURA_DA_BARRA + 6).setStrokeStyle(2, COR_BORDA, 1);
    const cheio = this.add
      .rectangle(centerX - LARGURA_DA_BARRA / 2, yBarra, 0, ALTURA_DA_BARRA, COR_DESTAQUE)
      .setOrigin(0, 0.5);
    const porcento = this.add
      .text(centerX, yBarra + 26, 'carregando 0%', { fontFamily: FONTE_TEXTO, fontSize: '16px', color: TEXTO_APAGADO })
      .setOrigin(0.5);
    this.textos.push(porcento);
    this.load.on(Phaser.Loader.Events.PROGRESS, (progresso: number) => {
      cheio.width = larguraDaBarra(progresso, LARGURA_DA_BARRA);
      porcento.setText(`carregando ${Math.round(progresso * 100)}%`);
    });
    this.load.once(Phaser.Loader.Events.COMPLETE, () => porcento.setText('pronto'));

    const pular = (): void => {
      this.pulou = true;
    };
    this.input.keyboard?.on('keydown', pular);
    this.input.on(Phaser.Input.Events.POINTER_DOWN, pular);
  }
}
