/**
 * Regra do Fundo: NPC que acompanha um lutador (o Biriba do Bira, os Gaviões
 * do Mosqueteiro) vive num plano só dele, atrás dos dois lutadores e na frente
 * da torcida. Anda junto com o dono, mas nunca no mesmo chão nem na mesma
 * camada. Só sai do fundo quando ataca.
 */
export const PLANO_DE_FUNDO = {
  /** Abaixo dos lutadores (5 e 8 na Luta, sombras 4 e 7) e acima da torcida (0). */
  profundidade: 3,
  /** O pé fica tantos px acima do chão dos lutadores: mais alto é mais longe. */
  recuo: 60,
  /** Quem foi desenhado no tamanho do lutador encolhe para parecer longe. */
  escala: 0.6,
  /** Distância mínima da borda da câmera. */
  margem: 68,
  /** Velocidade de quem anda atrás do dono, px/s. */
  passo: 340
} as const;
