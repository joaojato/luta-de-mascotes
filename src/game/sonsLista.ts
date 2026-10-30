import type { StarterAudioAsset } from './core/audio';

/**
 * Sons do jogo (docs/sons.md): arquivos gerados por `scripts/sons.py`. O
 * volume aqui é o relativo de cada som; o volume dos Ajustes multiplica por
 * cima.
 */
const SONS: [chave: string, volume: number, loop?: boolean][] = [
  ['ui-mover', 0.18], ['ui-travar', 0.35],
  ['torcida', 0.1, true], ['round', 0.5], ['luta-comeca', 0.35], ['ko', 0.55], ['tempo-esgotado', 0.35],
  ['vitoria', 0.5], ['relogio', 0.3], ['especial-pronto', 0.3], ['especial-entrada', 0.5],
  ['passo', 0.12], ['pulo', 0.25], ['aterrissar', 0.3], ['dash', 0.3], ['queda', 0.55], ['tontura', 0.35],
  ['ar-leve', 0.22], ['ar-pesado', 0.3], ['impacto-leve', 0.45], ['impacto-pesado', 0.55], ['impacto-baixo', 0.5],
  ['impacto-especial', 0.65], ['defesa', 0.4], ['defesa-quebrada', 0.5], ['defesa-perfeita', 0.45],
  ['projetil-lancar', 0.3], ['especial-carga', 0.4]
];

export const SOM_ASSETS: StarterAudioAsset[] = SONS.map(([chave, volume, loop]) => ({
  kind: 'audio',
  key: chave,
  url: `/assets/audio/sfx/${chave}.wav`,
  category: 'sfx',
  volume,
  loop: Boolean(loop),
  usage: `som ${chave} (docs/sons.md)`
}));
