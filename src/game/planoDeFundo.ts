/**
 * Regra do Fundo: NPC de um lutador (o Biriba do Bira, os Gaviões do
 * Mosqueteiro, o Guerreiro do Cartola), o NPC de Guarda, vive num plano só
 * dele, atrás dos dois lutadores e na frente da torcida, nunca no mesmo chão
 * nem na mesma camada. Só sai do fundo quando ataca. Se anda junto com o dono
 * é do NPC: os Gaviões e o Guerreiro ficam parados assistindo. Exceção
 * posterior: Biriba só entra temporariamente na arena, para a intro ou nos
 * balões quando chamado; não acompanha mais o Bira no fundo.
 *
 * Todos pisam na mesma linha, {@link chaoDoFundo}, com o pé desenhado (não a
 * base da célula) em cima dela: fora do campo, entre a placa e a linha lateral.
 */
export const PLANO_DE_FUNDO = {
  /** Abaixo dos lutadores (5 e 8 na Luta, sombras 4 e 7) e acima da torcida (0). */
  profundidade: 3,
  /**
   * O pé fica tantos px acima do `groundY` da luta: mais alto é mais longe.
   * 89 põe o pé em y 602 no estádio (chão 691), fora do campo, onde ficava
   * antes de o chão da luta descer para dentro do gramado.
   */
  recuo: 89,
  /** Quem foi desenhado no tamanho do lutador encolhe para parecer longe. */
  escala: 0.6,
  /** Distância mínima da borda da câmera. */
  margem: 68,
  /** Velocidade de quem anda atrás do dono, px/s. */
  passo: 340
} as const;

/**
 * A linha onde todo NPC de Guarda pisa no fundo (o pé desenhado, não a base
 * da célula). Uma linha só para todos: ninguém flutua nem afunda em relação
 * aos outros.
 * @param groundY - O `groundY` da luta.
 */
export function chaoDoFundo(groundY: number): number {
  return groundY - PLANO_DE_FUNDO.recuo;
}
