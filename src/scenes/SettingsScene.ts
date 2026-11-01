import * as Phaser from 'phaser';

import { AUDIO_KEYS, playAudioCue } from '../game/core/audio';
import { createTextButton, type TextButton } from '../game/ui';
import { DEFAULT_SETTINGS } from '../game/settings';
import { COR_BORDA, COR_PAINEL, FONTE_TEXTO, TEXTO_CLARO } from '../game/estilo';
import { SCENE_KEYS, type SceneKey } from '../game/types';
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
  private sfxValue!: Phaser.GameObjects.Text;

  private musicValue!: Phaser.GameObjects.Text;

  private muteValue!: Phaser.GameObjects.Text;

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
    const quantas = painelDebug ? 6 : 5;
    const espaco = painelDebug ? 52 : 60;
    const buttonHeight = painelDebug ? 46 : 52;

    const centerX = this.tela.centerX;
    const centerY = this.tela.centerY;
    this.add
      .rectangle(centerX, centerY + (painelDebug ? 40 : 30), 560, painelDebug ? 460 : 440, COR_PAINEL, 0.85)
      .setStrokeStyle(2, COR_BORDA, 1);

    const valueStyle = {
      color: TEXTO_CLARO,
      fontFamily: FONTE_TEXTO,
      fontSize: '22px',
      fontStyle: 'bold'
    };

    this.sfxValue = this.add.text(centerX, centerY - 155, '', valueStyle).setOrigin(0.5);
    this.musicValue = this.add.text(centerX, centerY - 120, '', valueStyle).setOrigin(0.5);
    this.muteValue = this.add.text(centerX, centerY - 85, '', valueStyle).setOrigin(0.5);

    const wideButtonWidth = 340;
    const halfButtonWidth = 165;
    const botao = (linha: number, x: number, width: number, label: string, onClick: () => void): TextButton =>
      createTextButton(this, {
        x: centerX + x,
        y: centerY - 35 + linha * espaco,
        width,
        height: buttonHeight,
        label,
        onClick,
        onHover: () => this.setSelection(linha)
      });

    const efeitos = { esquerda: () => this.changeVolume('sfx', -0.1), direita: () => this.changeVolume('sfx', 0.1) };
    const musica = { esquerda: () => this.changeVolume('music', -0.1), direita: () => this.changeVolume('music', 0.1) };
    const mudo = () => this.toggleMute();
    const restaurar = () => this.app.settingsStore.setState(DEFAULT_SETTINGS);
    const voltar = () => this.voltar();

    this.linhas = [
      {
        ...efeitos,
        botoes: [
          botao(0, -88, halfButtonWidth, 'Efeitos −', efeitos.esquerda),
          botao(0, 88, halfButtonWidth, 'Efeitos +', efeitos.direita)
        ]
      },
      {
        ...musica,
        botoes: [
          botao(1, -88, halfButtonWidth, 'Música −', musica.esquerda),
          botao(1, 88, halfButtonWidth, 'Música +', musica.direita)
        ]
      },
      { esquerda: mudo, direita: mudo, confirmar: mudo, botoes: [botao(2, 0, wideButtonWidth, 'Ligar ou tirar o som', mudo)] },
      { confirmar: restaurar, botoes: [botao(3, 0, wideButtonWidth, 'Restaurar padrão', restaurar)] }
    ];

    // Só em dev: mostra ou esconde a gaveta do console de debug do lado.
    if (painelDebug) {
      let debugBotao: TextButton | null = null;
      const rotuloDebug = () => `Painel de debug: ${painelDebug.aberto() ? 'aberto' : 'fechado'}`;
      const alternarDebug = () => {
        painelDebug.alternar();
        playAudioCue(this, AUDIO_KEYS.uiConfirm, this.app.settingsStore.getState());
        debugBotao?.destroy();
        debugBotao = botao(4, 0, wideButtonWidth, rotuloDebug(), alternarDebug);
        this.linhas[4].botoes = [debugBotao];
        this.setSelection(this.selectedRow);
      };
      debugBotao = botao(4, 0, wideButtonWidth, rotuloDebug(), alternarDebug);
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
      this.sfxValue.setText(`Efeitos: ${Math.round(settings.sfxVolume * 100)}%`);
      this.musicValue.setText(`Música: ${Math.round(settings.musicVolume * 100)}%`);
      this.muteValue.setText(`Som: ${settings.muted ? 'mudo' : 'ligado'}`);
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

  private toggleMute(): void {
    const settings = this.app.settingsStore.getState();
    this.app.settingsStore.patchState({ muted: !settings.muted });
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
