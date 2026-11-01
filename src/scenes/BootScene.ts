import { preloadStarterAssets, registerStarterAnimations } from '../game/assets';
import { registerGeneratedAssets } from '../game/generatedAssets';
import { registerFightingUiAtlasFrames } from '../game/fightingUiAtlas';
import { carregarTorcida } from '../game/torcidaCena';
import { carregarBiriba } from '../game/biribaCena';
import { FONTES_DO_JOGO } from '../game/estilo';
import { SCENE_KEYS } from '../game/types';
import { BaseScene } from './BaseScene';

export class BootScene extends BaseScene {
  constructor() {
    super(SCENE_KEYS.Boot);
  }

  preload(): void {
    preloadStarterAssets(this);
    carregarTorcida(this);
    carregarBiriba(this);
  }

  create(): void {
    this.markActiveScene(SCENE_KEYS.Boot);
    registerGeneratedAssets(this);
    registerFightingUiAtlasFrames(this);
    registerStarterAnimations(this);
    // Direto para o menu, sem "aperte qualquer tecla". Espera as fontes (o
    // texto do canvas não se redesenha quando a fonte chega), até 3 s.
    const fontes = Promise.all(FONTES_DO_JOGO.map((fonte) => document.fonts.load(fonte)));
    const limite = new Promise((resolver) => window.setTimeout(resolver, 3000));
    void Promise.race([fontes, limite])
      .catch(() => undefined)
      .then(() => this.scene.start(SCENE_KEYS.MainMenu));
  }
}
