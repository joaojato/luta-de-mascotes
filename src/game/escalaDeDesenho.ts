/** A conta da escala de desenho (nitidez.ts), sem Phaser, para o teste rodar em Node. */

/** Acima disso o ganho não aparece e a placa de vídeo paga. */
const ESCALA_MAXIMA = 3;
/** Janela pequena (lado a lado com o editor) também casa pixel com pixel. */
const ESCALA_MINIMA = 0.5;

/**
 * Quantos pixels de verdade cada pixel lógico ganha na área onde o jogo
 * aparece. É a escala do FIT vezes o zoom do sistema: o canvas sai do tamanho
 * exato da área, um pixel do canvas para um pixel da tela, sem o navegador
 * esticar nem encolher a imagem.
 * @param larguraLogica - Largura lógica do jogo (1280 deitado).
 * @param alturaLogica - Altura lógica do jogo (720 deitado).
 * @param area - A área do jogo em pixels de CSS e o zoom do sistema (devicePixelRatio).
 */
export function calcularEscala(
  larguraLogica: number,
  alturaLogica: number,
  area: { largura: number; altura: number; dpr: number }
): number {
  const escala = Math.min((area.largura * area.dpr) / larguraLogica, (area.altura * area.dpr) / alturaLogica);
  return Math.min(ESCALA_MAXIMA, Math.max(ESCALA_MINIMA, escala));
}
