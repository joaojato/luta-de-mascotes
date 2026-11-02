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

/** Como o adversário escapa de um ataque do reforço, além de sair do lugar. */
export type Escape = 'pulo' | 'agachar';

/**
 * Sorteia um disparo pelo peso de cada um (padrão 1).
 * @param disparos - As variantes do JSON.
 * @param sorte - Número entre 0 (inclusive) e 1 (exclusive).
 */
export function sortearDisparo<T extends { peso?: number }>(disparos: T[], sorte: number): T {
  const total = disparos.reduce((soma, d) => soma + (d.peso ?? 1), 0);
  let resto = sorte * total;
  for (const disparo of disparos) {
    resto -= disparo.peso ?? 1;
    if (resto < 0) return disparo;
  }
  return disparos[disparos.length - 1];
}

/**
 * O adversário escapou deste ataque pelo jeito que estava? Pulando escapa
 * de quem tem `pulo`; agachado, de quem tem `agachar`. Ataque sem escape
 * só se evita saindo do lugar.
 */
export function escapou(escapa: readonly (Escape | string)[] | undefined, defensor: { noAr: boolean; agachado: boolean }): boolean {
  if (!escapa) return false;
  return (escapa.includes('pulo') && defensor.noAr) || (escapa.includes('agachar') && defensor.agachado);
}
