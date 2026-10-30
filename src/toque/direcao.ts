/**
 * Controle de toque (docs/mobile.md): a parte pura, sem DOM. O direcional e o
 * joystick viram as mesmas quatro direções do teclado do P1.
 */

export type Direcao = 'left' | 'right' | 'up' | 'down';

export type ModoDirecional = 'botoes' | 'joystick';

/**
 * Quais direções um ponto aperta, a partir do centro do controle. O círculo é
 * cortado em 8 fatias de 45°: as diagonais apertam duas direções (pular para
 * a frente, agachar recuando). Dentro da zona morta, nada.
 * @param dx - Distância do dedo ao centro, horizontal (positivo é direita).
 * @param dy - Distância vertical (positivo é para baixo, como na tela).
 * @param raio - Raio do controle.
 * @param zonaMorta - Fração do raio que não aperta nada.
 */
export function direcoesDoPonto(dx: number, dy: number, raio: number, zonaMorta: number): Direcao[] {
  if (Math.hypot(dx, dy) < raio * zonaMorta) {
    return [];
  }
  // 0 é direita, 2 é baixo, 4 é esquerda, 6 é cima.
  const fatia = (Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 8) % 8;
  const porFatia: Direcao[][] = [
    ['right'], ['right', 'down'], ['down'], ['left', 'down'],
    ['left'], ['left', 'up'], ['up'], ['right', 'up']
  ];
  return porFatia[fatia];
}

/**
 * O que mudou entre dois conjuntos de teclas apertadas: o que soltar e o que
 * apertar, nessa ordem (soltar antes evita direita e esquerda juntas).
 */
export function diferencaDeTeclas(antes: ReadonlySet<string>, agora: ReadonlySet<string>): { soltar: string[]; apertar: string[] } {
  return {
    soltar: [...antes].filter((tecla) => !agora.has(tecla)),
    apertar: [...agora].filter((tecla) => !antes.has(tecla))
  };
}

const CHAVE_MODO = 'luta-de-mascotes:toque-direcional';

export function carregarModo(storage?: Storage): ModoDirecional {
  try {
    return (storage ?? window.localStorage).getItem(CHAVE_MODO) === 'joystick' ? 'joystick' : 'botoes';
  } catch {
    return 'botoes';
  }
}

export function salvarModo(modo: ModoDirecional, storage?: Storage): void {
  try {
    (storage ?? window.localStorage).setItem(CHAVE_MODO, modo);
  } catch {
    // Aba anônima: vale até recarregar.
  }
}
