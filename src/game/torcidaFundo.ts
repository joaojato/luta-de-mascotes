import type { Textures } from 'phaser';

export const QUADRO_ESTADIO_INTEIRO = '__BASE';
export const QUADRO_FRENTE_ESTADIO = 'torcida-frente-circulacao-v4';

/** Texture.add troca firstFrame ao registrar o primeiro recorte. O fundo continua sendo uma imagem inteira entre lutas. */
export function prepararFrenteEstadio(textura: Textures.Texture, topo: number): string {
  const fonte = textura.getSourceImage(QUADRO_ESTADIO_INTEIRO);
  if (!textura.has(QUADRO_FRENTE_ESTADIO)) {
    textura.add(QUADRO_FRENTE_ESTADIO, 0, 0, topo, fonte.width, fonte.height - topo);
  }
  // Corrige tambem texturas ja reaproveitadas de uma luta anterior com o recorte como padrao.
  textura.firstFrame = QUADRO_ESTADIO_INTEIRO;
  return QUADRO_FRENTE_ESTADIO;
}
