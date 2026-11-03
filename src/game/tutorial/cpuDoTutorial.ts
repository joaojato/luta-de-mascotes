import type { LeituraDaLuta } from '../cpu';
import type { FighterInput } from '../fighter';
import type { RoteiroDaCpu } from './roteiro';

/**
 * A CPU do tutorial faz exatamente o que o texto manda (João, 03/11/2026):
 * nada de sorteio, um comportamento por etapa. Sem Phaser, como a cpu.ts.
 */

/** Até onde ela anda para chegar no jogador, px de mundo entre os centros. */
const PERTO = 200;
/** Na guarda, chega um pouco mais perto para o golpe forte alcançar. */
const PERTO_DA_GUARDA = 230;
/** Pulando no lugar (João: 1,5 s entre um pulo e outro). */
const PULO_A_CADA_MS = 1500;
const PERTO_DO_PULO = 300;

const NEUTRO: FighterInput = {
  left: false, right: false, crouch: false, block: false, jump: false, light: false, heavy: false, special: false
};

export class CpuDoTutorial {
  /** Quando ela pousou do último pulo. */
  private pousouEm: number | null = null;
  private estavaNoAr = false;

  atualizar(roteiro: RoteiroDaCpu, l: LeituraDaLuta): FighterInput {
    const input: FighterInput = { ...NEUTRO };
    const t = l.tempoMs;
    const distancia = Math.abs(l.oponente.x - l.eu.x);
    const frente = l.oponente.x >= l.eu.x ? 'right' : 'left';

    if (this.estavaNoAr && !l.eu.noAr) this.pousouEm = t;
    this.estavaNoAr = l.eu.noAr;
    if (l.eu.atordoado || l.eu.noAr) return input;

    switch (roteiro) {
      case 'parada':
        break;
      case 'chegar':
        if (distancia > PERTO) input[frente] = true;
        break;
      case 'guarda-alta':
        if (distancia > PERTO_DA_GUARDA) input[frente] = true;
        else input.block = true;
        break;
      case 'pular':
        if (distancia > PERTO_DO_PULO) input[frente] = true;
        else if (this.pousouEm === null || t - this.pousouEm >= PULO_A_CADA_MS) {
          input.jump = true;
          // Sem pouso ainda: o próximo pulo espera a partir de agora.
          this.pousouEm = t;
        }
        break;
    }
    return input;
  }
}
