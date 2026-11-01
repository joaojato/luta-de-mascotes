/** A conta da escala de desenho (nitidez.ts), sem Phaser, para o teste rodar em Node. */

/** Acima disso o ganho não aparece e a placa de vídeo paga. */
const ESCALA_MAXIMA = 3;

/**
 * Quantos pixels de verdade cada pixel lógico ganha, medido pelo monitor
 * inteiro (não pela janela), para a janela maximizada depois também ficar nítida.
 * @param larguraLogica - Largura do perfil (1280 deitado).
 * @param alturaLogica - Altura do perfil (720 deitado).
 */
export function calcularEscala(
  larguraLogica: number,
  alturaLogica: number,
  tela: { largura: number; altura: number; dpr: number }
): number {
  const escala = Math.min((tela.largura * tela.dpr) / larguraLogica, (tela.altura * tela.dpr) / alturaLogica);
  return Math.round(Math.min(ESCALA_MAXIMA, Math.max(1, escala)) * 4) / 4;
}
