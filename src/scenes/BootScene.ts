import { preloadStarterAssets, registerStarterAnimations } from '../game/assets';
import { registerGeneratedAssets } from '../game/generatedAssets';
import { registerFightingUiAtlasFrames } from '../game/fightingUiAtlas';
import { carregarTorcida } from '../game/torcidaCena';
import { carregarBiriba } from '../game/biribaCena';
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
    this.scene.start(SCENE_KEYS.Splash);
  }
}
