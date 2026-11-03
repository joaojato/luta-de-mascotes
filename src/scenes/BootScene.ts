import * as Phaser from 'phaser';

import { preloadStarterAssets, registerStarterAnimations } from '../game/assets';
import { registerGeneratedAssets } from '../game/generatedAssets';
import { registerFightingUiAtlasFrames } from '../game/fightingUiAtlas';
import { carregarTorcida } from '../game/torcidaCena';
import { carregarBiriba } from '../game/biribaCena';
import {
  blocosDaBarra,
  BLOCOS_DA_BARRA,
  duracaoDoMosaico,
  ESCALA_RETRO,
  LOGOS_DA_ABERTURA,
  logoDaVez,
  podeSairDaAbertura,
  posicoesDaAbertura,
  QUADROS_POR_SEGUNDO_DO_MOSAICO,
  SAIDA_ANTES_DO_FIM_MS,
  sequenciaDoOlhar,
  SOM_DA_ABERTURA
} from '../game/abertura';
import { tocarSom } from '../game/sons';
import { SOM_ASSETS } from '../game/sonsLista';
import { COR_FUNDO, FONTE_TEXTO, FONTES_DO_JOGO, TEXTO_APAGADO } from '../game/estilo';
import { SCENE_KEYS } from '../game/types';
import { jaViuTutorial } from '../game/tutorial/primeiraVez';
import { BaseScene } from './BaseScene';

/** Roxo da logo da Resenha Games: a barra acende nele. */
const COR_DO_BLOCO = 0xa269dd;
const COR_DO_BLOCO_APAGADO = 0x231628;
const LADO_DO_BLOCO = 18;
const VAO_DO_BLOCO = 4;

/**
 * Carrega o jogo atrás da abertura retrô (src/game/abertura.ts): a logo da
 * Resenha Games e depois a da PUC-Rio entram e saem pelo mosaico, com linhas
 * de TV de tubo por cima e a barra de blocos embaixo.
 */
export class BootScene extends BaseScene {
  private inicio = 0;

  private carregou = false;

  private pulou = false;

  private saindo = false;

  private fontes: Promise<unknown> = Promise.resolve();

  private logo!: Phaser.GameObjects.Sprite;

  private logoNaTela = -1;

  private desfazendo = false;

  private textos: Phaser.GameObjects.Text[] = [];

  constructor() {
    // As logos vêm antes do resto (o `pack` carrega antes do preload): a
    // abertura aparece enquanto o jogo carrega por trás dela.
    const files: Phaser.Types.Loader.FileTypes.SpriteSheetFileConfig[] = LOGOS_DA_ABERTURA.map((logo) => ({
      type: 'spritesheet',
      key: logo.chave,
      url: logo.arquivo,
      frameConfig: { frameWidth: logo.largura, frameHeight: logo.altura }
    }));
    // O plim também vem antes: o resto dos sons ainda está carregando quando a primeira logo fica nítida.
    const plim = SOM_ASSETS.find((som) => som.key === SOM_DA_ABERTURA);
    const som = plim ? [{ type: 'audio', key: plim.key, url: plim.url }] : [];
    super({ key: SCENE_KEYS.Boot, pack: { files: [...files, ...som] } as unknown as Phaser.Types.Scenes.SettingsConfig['pack'] });
  }

  /**
   * O resto carrega já com a cena rodando: no preload o Phaser não anda as
   * animações nem chama o update, e a abertura ficaria parada.
   */
  create(): void {
    this.markActiveScene(SCENE_KEYS.Boot);
    this.inicio = this.time.now;
    this.carregou = false;
    this.pulou = false;
    this.saindo = false;
    this.logoNaTela = -1;
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
    this.load.once(Phaser.Loader.Events.COMPLETE, () => {
      registerGeneratedAssets(this);
      registerFightingUiAtlasFrames(this);
      registerStarterAnimations(this);
      // O menu só abre com as fontes prontas.
      void this.fontes.then(() => {
        this.carregou = true;
      });
    });
    this.load.start();
  }

  update(time: number): void {
    if (this.saindo) return;
    const decorrido = time - this.inicio;
    if (podeSairDaAbertura(decorrido, this.carregou, this.pulou)) {
      this.sair();
      return;
    }
    const vez = logoDaVez(decorrido);
    if (vez !== this.logoNaTela) this.mostrarLogo(vez);
  }

  /** Logo no meio, linhas de TV por cima, barra de blocos embaixo. */
  private montarAbertura(): void {
    const { width, height, centerX } = this.tela;
    const posicoes = posicoesDaAbertura(this.tela);
    this.cameras.main.setBackgroundColor(COR_FUNDO);

    for (const logo of LOGOS_DA_ABERTURA) {
      const { chave, quadros } = logo;
      // Pixel arte: ampliada sem suavizar.
      this.textures.get(chave).setFilter(Phaser.Textures.FilterMode.NEAREST);
      if (!this.anims.exists(`${chave}-mosaico`)) {
        this.anims.create({
          key: `${chave}-mosaico`,
          frames: this.anims.generateFrameNumbers(chave, { start: 0, end: quadros - 1 }),
          frameRate: QUADROS_POR_SEGUNDO_DO_MOSAICO
        });
      }
      const olhar = sequenciaDoOlhar(logo);
      if (olhar.length && !this.anims.exists(`${chave}-olhar`)) {
        this.anims.create({ key: `${chave}-olhar`, frames: olhar.map(({ frame, duration }) => ({ key: chave, frame, duration })) });
      }
    }
    // A logo no meio exato da tela; a barra embaixo dela.
    this.logo = this.add.sprite(posicoes.logoX, posicoes.logoY, LOGOS_DA_ABERTURA[0].chave, 0).setScale(ESCALA_RETRO).setVisible(false);

    const larguraDaBarra = BLOCOS_DA_BARRA * (LADO_DO_BLOCO + VAO_DO_BLOCO) - VAO_DO_BLOCO;
    const yBarra = posicoes.barraY;
    const blocos = Array.from({ length: BLOCOS_DA_BARRA }, (_, i) =>
      this.add
        .rectangle(centerX - larguraDaBarra / 2 + i * (LADO_DO_BLOCO + VAO_DO_BLOCO), yBarra, LADO_DO_BLOCO, LADO_DO_BLOCO / 2, COR_DO_BLOCO_APAGADO)
        .setOrigin(0, 0.5)
    );
    const porcento = this.add
      .text(centerX, yBarra + 24, 'CARREGANDO 0%', { fontFamily: FONTE_TEXTO, fontSize: '16px', fontStyle: '700', color: TEXTO_APAGADO })
      .setOrigin(0.5);
    this.textos = [porcento];
    this.load.on(Phaser.Loader.Events.PROGRESS, (progresso: number) => {
      const acesos = blocosDaBarra(progresso);
      blocos.forEach((bloco, i) => bloco.setFillStyle(i < acesos ? COR_DO_BLOCO : COR_DO_BLOCO_APAGADO));
      porcento.setText(`CARREGANDO ${Math.round(progresso * 100)}%`);
    });
    this.load.once(Phaser.Loader.Events.COMPLETE, () => porcento.setText('PRONTO'));

    // Linhas de TV de tubo por cima de tudo.
    const linhas = this.add.graphics().setDepth(10);
    linhas.fillStyle(0x000000, 0.28);
    for (let y = 0; y < height; y += 3) linhas.fillRect(0, y, width, 1);

    const pular = (): void => {
      this.pulou = true;
    };
    this.input.keyboard?.on('keydown', pular);
    this.input.on(Phaser.Input.Events.POINTER_DOWN, pular);
  }

  /** A logo da vez entra pelo mosaico; antes da troca, a anterior sai por ele. */
  private mostrarLogo(vez: number): void {
    this.logoNaTela = vez;
    const { chave } = LOGOS_DA_ABERTURA[vez];
    // Plim quando o mosaico acaba e a logo fica nítida. O navegador trava o
    // som até a primeira tecla ou clique na página: aí ele sai mudo.
    this.logo.off(Phaser.Animations.Events.ANIMATION_COMPLETE);
    const logo = LOGOS_DA_ABERTURA[vez];
    const aindaNaTela = (): boolean => this.logoNaTela === vez && !this.desfazendo && !this.saindo;
    this.logo.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      if (!aindaNaTela()) return;
      tocarSom(this, SOM_DA_ABERTURA, this.app.settingsStore.getState(), logo.tomDoPlim);
      // Os olhos ficam na esquerda, esperam, vão até a direita e voltam.
      if (logo.olhar) {
        this.time.delayedCall(logo.olhar.esperaMs, () => {
          if (aindaNaTela()) this.logo.play(`${chave}-olhar`);
        });
      }
    });
    this.desfazendo = false;
    this.logo.setVisible(true).setTexture(chave, 0).play(`${chave}-mosaico`);
    const saida = logo.tempoMs - duracaoDoMosaico(logo) - SAIDA_ANTES_DO_FIM_MS;
    this.time.delayedCall(saida, () => {
      if (this.logoNaTela === vez && !this.saindo) this.desfazer(vez);
    });
  }

  /** A logo se desfaz pelo mosaico e some. */
  private desfazer(vez: number): void {
    this.desfazendo = true;
    this.logo.off(Phaser.Animations.Events.ANIMATION_COMPLETE);
    this.logo.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => this.logo.setVisible(false));
    this.logo.playReverse(`${LOGOS_DA_ABERTURA[vez].chave}-mosaico`);
  }

  /** A logo na tela (se houver) sai pelo mosaico e o menu abre. */
  private sair(): void {
    this.saindo = true;
    const vez = Math.max(0, this.logoNaTela);
    const naTela = this.logo.visible;
    if (naTela && !this.desfazendo) this.desfazer(vez);
    this.time.delayedCall(naTela ? duracaoDoMosaico(LOGOS_DA_ABERTURA[vez]) + 120 : 120, () => this.scene.start(jaViuTutorial() ? SCENE_KEYS.MainMenu : SCENE_KEYS.PrimeiraVez));
  }
}
