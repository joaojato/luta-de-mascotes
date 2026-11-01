/**
 * Conta do reforço (src/game/reforco.ts), sem Phaser: de que lado ele vem,
 * onde larga, quando chegou e onde fica a bota no mundo. A arte do reforço é
 * desenhada correndo e chutando para a esquerda.
 */

export interface CaixaDeQuadro {
  x: number;
  y: number;
  largura: number;
  altura: number;
}

/**
 * Para onde o reforço corre e chuta: na direção do dono, empurrando o alvo
 * para cima dele. -1 é para a esquerda, como a arte foi desenhada. Ele entra e
 * sai do campo pelo lado oposto, atrás do alvo.
 */
export function ladoDoReforco(donoX: number, alvoX: number): 1 | -1 {
  return donoX <= alvoX ? -1 : 1;
}

/**
 * Um passo da corrida até ficar a `alcance` px (no mundo) do alvo. Nunca passa
 * do ponto, mesmo com quadro longo, e nunca recua: se o alvo veio para perto,
 * fica onde está.
 */
export function passoAteOAlvo(x: number, alvoX: number, lado: 1 | -1, alcance: number, passo: number): { x: number; chegou: boolean } {
  const parada = alvoX - lado * alcance;
  const falta = (parada - x) * lado;
  if (falta <= passo) return { x: falta > 0 ? parada : x, chegou: true };
  return { x: x + lado * passo, chegou: false };
}

/**
 * A caixa da bota no mundo. `caixa` e `origem` em px de quadro da arte
 * (virada para a esquerda); `origem` é o pé de apoio, que fica em (`x`, `chao`).
 */
export function caixaNoMundo(
  x: number,
  chao: number,
  escala: number,
  lado: 1 | -1,
  caixa: CaixaDeQuadro,
  origem: { x: number; y: number }
): CaixaDeQuadro {
  const dx = caixa.x - origem.x;
  const esquerda = lado === -1 ? x + dx * escala : x - (dx + caixa.largura) * escala;
  return { x: esquerda, y: chao + (caixa.y - origem.y) * escala, largura: caixa.largura * escala, altura: caixa.altura * escala };
}
