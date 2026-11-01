import { AUDIO_KEYS, playAudioCue } from '../game/core/audio';
import { GAME_TAGLINE, GAME_TITLE } from '../game/constants';
import { CONTORNO_TITULO, SOMBRA_TITULO, FONTE_TEXTO, FONTE_TITULO, TEXTO_CLARO, TEXTO_DESTAQUE } from '../game/estilo';
import { SCENE_KEYS } from '../game/types';
import { controlesDeToqueAtivos } from '../toque/telaToque';
import { BaseScene } from './BaseScene';

export class SplashScene extends BaseScene {
  private hasAdvanced = false;

  constructor() {
    super(SCENE_KEYS.Splash);
  }

  create(): void {
    this.markActiveScene(SCENE_KEYS.Splash);

    const camera = this.cameras.main;
    this.createBackdrop();

    if (!this.createLogo(camera.centerY - 50, 820)) {
      this.add
        .text(camera.centerX, camera.centerY - 40, GAME_TITLE.toUpperCase(), {
          color: TEXTO_DESTAQUE,
          fontFamily: FONTE_TITULO,
          fontSize: camera.width < camera.height ? '64px' : '96px',
          stroke: CONTORNO_TITULO,
          strokeThickness: 12
        })
        .setOrigin(0.5)
        .setShadow(0, 6, SOMBRA_TITULO, 0, true, true)
        .setDepth(2);
    }

    if (GAME_TAGLINE) {
      this.add
        .text(camera.centerX, camera.centerY + 110, GAME_TAGLINE, {
          color: TEXTO_CLARO,
          fontFamily: FONTE_TEXTO,
          fontSize: '22px',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 5
        })
        .setOrigin(0.5)
        .setDepth(2);
    }

    const chamada = this.add
      .text(camera.centerX, camera.height - 110, this.app.isMobileShell || controlesDeToqueAtivos() ? 'TOQUE NA TELA PARA COMEÇAR' : 'APERTE QUALQUER TECLA', {
        color: TEXTO_CLARO,
        fontFamily: FONTE_TITULO,
        fontSize: '28px',
        stroke: '#000000',
        strokeThickness: 5
      })
      .setOrigin(0.5)
      .setDepth(2);
    this.tweens.add({ targets: chamada, alpha: 0.25, duration: 650, yoyo: true, repeat: -1 });

    const advanceToMenu = (): void => {
      if (this.hasAdvanced) {
        return;
      }

      this.hasAdvanced = true;
      playAudioCue(this, AUDIO_KEYS.uiConfirm, this.app.settingsStore.getState());
      this.scene.start(SCENE_KEYS.MainMenu);
    };

    this.input.once('pointerup', advanceToMenu);
    this.input.keyboard?.once('keydown', advanceToMenu);
  }
}
