import type { StarterAudioAsset } from './core/audio';

/**
 * Sons do jogo (docs/sons.md): arquivos gravados e tratados por
 * `scripts/sons_gravados.py`, e os que sobraram sintetizados por
 * `scripts/sons.py`. O volume aqui é o relativo de cada som; o volume dos
 * Ajustes multiplica por cima.
 */
const SONS: [chave: string, volume: number, loop?: boolean][] = [
  ['ui-mover', 0.18], ['ui-travar', 0.35], ['plim', 0.4],
  ['round', 0.5], ['luta-comeca', 0.35], ['ko', 0.55], ['tempo-esgotado', 0.35],
  ['vitoria', 0.5], ['relogio', 0.3], ['especial-pronto', 0.3], ['especial-entrada', 0.5],
  ['passo', 0.12], ['pulo', 0.25], ['aterrissar', 0.3], ['dash', 0.3], ['queda', 0.55], ['tontura', 0.35],
  ['ar-leve', 0.22], ['ar-pesado', 0.3], ['impacto-leve', 0.45], ['impacto-pesado', 0.55], ['impacto-baixo', 0.5],
  ['impacto-especial', 0.65], ['defesa', 0.4], ['defesa-quebrada', 0.5], ['defesa-perfeita', 0.45],
  ['projetil-lancar', 0.3], ['especial-carga', 0.4],
  // Camada 5: de cada mascote (bloco `sons` do JSON).
  ['tiro-garrucha', 0.55], ['caravela', 0.5], ['sino-navio', 0.35],
  ['bicada', 0.4], ['asas', 0.4], ['termica', 0.35], ['meteoro', 0.55],
  ['cachimbo', 0.35], ['tornado', 0.45], ['po-de-arroz', 0.4],
  ['garra', 0.4], ['bote', 0.45], ['assobio-dedos', 0.3], ['coco', 0.45], ['latido', 0.45],
  ['giro', 0.35], ['ovo-arremesso', 0.3], ['ovo-quebra', 0.45], ['cacarejo', 0.35],
  ['laser', 0.4], ['corte', 0.35], ['bora-bahea', 0.55],
  ['mordida', 0.45], ['coice', 0.5], ['enjoo', 0.35], ['vomito', 0.45],
  // Entrega 3: latido do Biriba voando, mergulho e pouso do Urubu.
  ['latido-voo', 0.45], ['mergulho', 0.5], ['meteoro-pouso', 0.75],
  // Dor: geral e de cada bicho (eventos `dor`, `dor-forte`, `dor-ko`).
  ['dor', 0.4], ['dor-forte', 0.45], ['dor-ko', 0.5],
  ['dor-porco', 0.4], ['dor-forte-porco', 0.45], ['dor-galo', 0.35], ['dor-forte-galo', 0.4],
  ['dor-urubu', 0.4], ['dor-forte-urubu', 0.45], ['dor-cao', 0.35], ['dor-forte-cao', 0.4],
  // Torcida à toa: soltos por baixo da música, bem baixos (sem loop de fundo desde 03/11/2026).
  ['torcida-coro', 0.16], ['torcida-uh', 0.16], ['torcida-assobio', 0.1], ['torcida-batucada', 0.14],
  ['torcida-palmas', 0.12],
  // Acerto de cada mascote (eventos `acerto-*` de quem bate, 03/11/2026).
  ['acerto-leve-madeira', 0.45], ['acerto-pesado-madeira', 0.55], ['acerto-especial-canhao', 0.65],
  ['acerto-leve-pena', 0.45], ['acerto-pesado-pena', 0.55], ['acerto-leve-saci', 0.45], ['acerto-pesado-saci', 0.5],
  ['acerto-leve-bengala', 0.45], ['acerto-pesado-bengala', 0.55], ['acerto-leve-porco', 0.45],
  ['acerto-pesado-porco', 0.55], ['acerto-leve-espada', 0.45], ['acerto-pesado-espada', 0.55],
  ['acerto-leve-metal', 0.45], ['acerto-pesado-metal', 0.55], ['acerto-pesado-dragao', 0.55],
  ['acerto-leve-andador', 0.45], ['acerto-pesado-cabecada', 0.55], ['acerto-pesado-maromba', 0.6],
  ['tiro-mosquete', 0.6], ['fogo-cuspe', 0.45], ['fogo-sopro', 0.5], ['dor-dragao', 0.4], ['dor-forte-dragao', 0.45],
  ['lata', 0.4], ['arroto', 0.45]
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
