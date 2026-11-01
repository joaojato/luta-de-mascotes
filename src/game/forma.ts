/**
 * Especial `forma` (o maromba do Vovô Coxa, docs/gdd.md): o golpe acerta como
 * um especial comum e, no fim da sheet, o mascote vira outro lutador registrado (a forma dele) por
 * alguns segundos, batendo e apanhando diferente. O cronômetro aparece no HUD
 * para os dois jogadores saberem quanto falta. Tudo vem do JSON (Regra do
 * JSON); aqui só o relógio e a conta do dano, sem Phaser, para o teste conferir.
 */

export interface FormaConfig {
  /** Id do lutador registrado em que ele vira (`coxa-maromba`, fora da seleção). */
  lutador: string;
  /** Quanto tempo dura, contado do fim da transformação. */
  segundos: number;
  /** Multiplica o dano que ele causa enquanto transformado (padrão 1). */
  danoCausado?: number;
  /** Multiplica o dano que ele recebe enquanto transformado (padrão 1). */
  danoRecebido?: number;
  /** Texto ao lado do cronômetro no HUD. */
  rotulo?: string;
}

/** Quanto antes do fim o cronômetro começa a piscar. */
const AVISO_SEGUNDOS = 1.5;

/** O tempo que falta da forma; o dono dele troca de volta quando acaba. */
export class RelogioDaForma {
  private restante: number;

  constructor(private readonly config: FormaConfig) {
    this.restante = config.segundos;
  }

  /**
   * Desconta o tempo do quadro.
   * @param segundos - Tempo do quadro.
   * @returns Verdadeiro só no quadro em que a forma acaba.
   */
  avancar(segundos: number): boolean {
    if (this.restante <= 0) return false;
    this.restante = Math.max(0, this.restante - segundos);
    return this.restante === 0;
  }

  /** De 1 (acabou de virar) a 0 (acabou). */
  get fracao(): number {
    return this.config.segundos > 0 ? this.restante / this.config.segundos : 0;
  }

  /** Segundos inteiros para o HUD, arredondando para cima. */
  get segundosRestantes(): number {
    return Math.ceil(this.restante);
  }

  /** Perto do fim: o HUD pisca para avisar. */
  get piscando(): boolean {
    return this.restante > 0 && this.restante <= AVISO_SEGUNDOS;
  }
}

/**
 * Dano com o multiplicador da forma, inteiro como todo dano do jogo.
 * @param dano - O dano do golpe.
 * @param fator - `danoCausado` ou `danoRecebido`; sem ele, nada muda.
 */
export function danoNaForma(dano: number, fator: number | undefined): number {
  return fator === undefined ? dano : Math.round(dano * fator);
}
