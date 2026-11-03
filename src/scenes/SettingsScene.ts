import * as Phaser from 'phaser';

import { AUDIO_KEYS, playAudioCue } from '../game/core/audio';
import { createTextButton, type TextButton } from '../game/ui';
import { DEFAULT_SETTINGS } from '../game/settings';
import { COR_BORDA, COR_PAINEL, FONTE_TEXTO, TEXTO_CLARO } from '../game/estilo';
import { SCENE_KEYS, type GameSettings, type SceneKey } from '../game/types';
import { abrirFuncoesDosBotoes, controlesDeToqueAtivos } from '../toque/telaToque';
import { BaseScene } from './BaseScene';

/** Aberta pela pausa da Luta: volta para ela em vez de ir ao menu. */
export interface SettingsSceneData {
  voltarPara?: SceneKey;
}

/** Uma linha da tela: os botões dela e o que ←, → e Enter fazem nela. */
interface Linha {
  botoes: TextButton[];
  esquerda?: () => void;
  direita?: () => void;
  confirmar?: () => void;
}

export class SettingsScene extends BaseScene {
  private linhas: Linha[] = [];

  private selectedRow = 0;

  private voltarPara: SceneKey | null = null;

  constructor() {
    super(SCENE_KEYS.Settings);
  }

  init(data: SettingsSceneData): void {
    this.voltarPara = data?.voltarPara ?? null;
  }

  create(): void {
    this.markActiveScene(SCENE_KEYS.Settings);
    this.createBackdrop();
    this.createHeading('Ajustes', '');

    const painelDebug = this.app.painelDebug;
    const quantas = painelDebug ? 8 : 7;
    const espaco = painelDebug ? 48 : 52;
    const buttonHeight = painelDebug ? 40 : 44;
    const topo = this.tela.centerY - 160;

    const centerX = this.tela.centerX;
    const altura = (quantas - 1) * espaco + buttonHeight + 48;
    this.add
      .rectangle(centerX, topo + ((quantas - 1) * espaco) / 2, 560, altura, COR_PAINEL, 0.85)
      .setStrokeStyle(2, COR_BORDA, 1);

    const wideButtonWidth = 340;
    const botao = (linha: number, x: number, width: number, label: string, onClick: () => void): TextButton =>
      createTextButton(this, {
        x: centerX + x,
        y: topo + linha * espaco,
        width,
        height: buttonHeight,
        label,
        onClick,
        onHover: () => this.setSelection(linha)
      });
    // Linha de volume: − e + nas pontas, o valor no meio.
    const valor = (linha: number): Phaser.GameObjects.Text =>
      this.add
        .text(centerX, topo + linha * espaco, '', { color: TEXTO_CLARO, fontFamily: FONTE_TEXTO, fontSize: '22px', fontStyle: 'bold' })
        .setOrigin(0.5);

    const efeitos = { esquerda: () => this.changeVolume('sfx', -0.1), direita: () => this.changeVolume('sfx', 0.1) };
    const musica = { esquerda: () => this.changeVolume('music', -0.1), direita: () => this.changeVolume('music', 0.1) };
    const mudo = () => this.alternar('muted');
    const fps = () => this.alternar('mostrarFps');
    const restaurar = () => this.app.settingsStore.setState(DEFAULT_SETTINGS);
    const voltar = () => this.voltar();
    // No celular, os botões da tela; no computador, as teclas.
    const toque = controlesDeToqueAtivos();
    const botoes = toque
      ? () => abrirFuncoesDosBotoes()
      : () => this.scene.start(SCENE_KEYS.Botoes, { voltarPara: this.voltarPara });

    const valorEfeitos = valor(0);
    const valorMusica = valor(1);
    const botaoSom = botao(2, 0, wideButtonWidth, '', mudo);
    const botaoFps = botao(3, 0, wideButtonWidth, '', fps);
    this.linhas = [
      { ...efeitos, botoes: [botao(0, -175, 90, '−', efeitos.esquerda), botao(0, 175, 90, '+', efeitos.direita)] },
      { ...musica, botoes: [botao(1, -175, 90, '−', musica.esquerda), botao(1, 175, 90, '+', musica.direita)] },
      { esquerda: mudo, direita: mudo, confirmar: mudo, botoes: [botaoSom] },
      { esquerda: fps, direita: fps, confirmar: fps, botoes: [botaoFps] },
      { confirmar: botoes, botoes: [botao(4, 0, wideButtonWidth, toque ? 'Botões do celular' : 'Botões do teclado', botoes)] },
      { confirmar: restaurar, botoes: [botao(5, 0, wideButtonWidth, 'Restaurar padrão', restaurar)] }
    ];

    // Só em dev: mostra ou esconde a gaveta do console de debug do lado.
    if (painelDebug) {
      const rotuloDebug = () => `Painel de debug: ${painelDebug.aberto() ? 'aberto' : 'fechado'}`;
      const alternarDebug = () => {
        painelDebug.alternar();
        playAudioCue(this, AUDIO_KEYS.uiConfirm, this.app.settingsStore.getState());
        debugBotao.setLabel(rotuloDebug());
      };
      const debugBotao = botao(6, 0, wideButtonWidth, rotuloDebug(), alternarDebug);
      this.linhas.push({ esquerda: alternarDebug, direita: alternarDebug, confirmar: alternarDebug, botoes: [debugBotao] });
    }

    const rotuloVoltar = this.voltarPara ? 'Voltar à pausa' : 'Voltar ao menu';
    this.linhas.push({ confirmar: voltar, botoes: [botao(quantas - 1, 0, wideButtonWidth, rotuloVoltar, voltar)] });

    this.setSelection(0);

    this.input.keyboard?.on('keydown-UP', () => this.moveSelection(-1));
    this.input.keyboard?.on('keydown-W', () => this.moveSelection(-1));
    this.input.keyboard?.on('keydown-DOWN', () => this.moveSelection(1));
    this.input.keyboard?.on('keydown-S', () => this.moveSelection(1));
    this.input.keyboard?.on('keydown-LEFT', () => this.linhas[this.selectedRow].esquerda?.());
    this.input.keyboard?.on('keydown-RIGHT', () => this.linhas[this.selectedRow].direita?.());
    // A tecla que fecha os Ajustes não chega à Luta que volta no mesmo quadro.
    const confirmar = (event: KeyboardEvent) => {
      event.stopPropagation();
      this.linhas[this.selectedRow].confirmar?.();
    };
    this.input.keyboard?.on('keydown-ESC', (event: KeyboardEvent) => {
      event.stopPropagation();
      voltar();
    });
    this.input.keyboard?.on('keydown-ENTER', confirmar);
    this.input.keyboard?.on('keydown-SPACE', confirmar);

    const unsubscribe = this.app.settingsStore.subscribe((settings) => {
      valorEfeitos.setText(`Efeitos: ${Math.round(settings.sfxVolume * 100)}%`);
      valorMusica.setText(`Música: ${Math.round(settings.musicVolume * 100)}%`);
      botaoSom.setLabel(`Som: ${settings.muted ? 'mudo' : 'ligado'}`);
      botaoFps.setLabel(`FPS na tela: ${settings.mostrarFps ? 'ligado' : 'desligado'}`);
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, unsubscribe);

    this.createFooterHint('↑ ↓ escolhe   •   ← → ajusta   •   Enter confirma   •   Esc volta');
  }

  /** Sai dos Ajustes: para a cena que abriu (a Luta pausada) ou para o menu. */
  private voltar(): void {
    if (!this.voltarPara) {
      this.goToMenu();
      return;
    }
    this.scene.resume(this.voltarPara);
    this.scene.stop();
  }

  private changeVolume(kind: 'sfx' | 'music', delta: number): void {
    const current = this.app.settingsStore.getState();
    const key = kind === 'sfx' ? 'sfxVolume' : 'musicVolume';
    const nextVolume = Math.max(0, Math.min(1, current[key] + delta));

    this.app.settingsStore.patchState({ [key]: Number(nextVolume.toFixed(2)) });
    playAudioCue(this, AUDIO_KEYS.uiConfirm, this.app.settingsStore.getState());
  }

  /** Liga ou desliga um ajuste de sim ou não. */
  private alternar(chave: 'muted' | 'mostrarFps'): void {
    const settings: GameSettings = this.app.settingsStore.getState();
    this.app.settingsStore.patchState({ [chave]: !settings[chave] });
    playAudioCue(this, AUDIO_KEYS.uiConfirm, this.app.settingsStore.getState());
  }

  private moveSelection(direction: number): void {
    const nextIndex = Phaser.Math.Wrap(this.selectedRow + direction, 0, this.linhas.length);
    this.setSelection(nextIndex);
  }

  private setSelection(index: number): void {
    this.selectedRow = index;
    this.linhas.forEach((linha, i) => linha.botoes.forEach((botao) => botao.setSelected(i === index)));
  }
}
