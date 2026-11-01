import type { FighterInput } from './fighter';

/**
 * CPU do 1 VS CPU (docs/cpu.md). Lê a luta a cada quadro (distância, golpe do
 * oponente, projétil no ar, barra cheia) e decide como um jogador: chega
 * perto, ataca com mistura de golpes, defende quando o oponente bate, pune
 * quem ficou tonto e usa o especial. A dificuldade só muda os números: tempo
 * de reação, frequência de ataque, chance de defender e de usar o especial.
 * Não depende do Phaser: o teste chama `atualizar` com uma leitura montada.
 */

export type Dificuldade = 'facil' | 'medio' | 'dificil';

/** Nome e o que a CPU faz, como aparecem nos cartões da tela de dificuldade. */
export const DIFICULDADES: { id: Dificuldade; nome: string; descricao: string }[] = [
  { id: 'facil', nome: 'Fácil', descricao: 'A CPU demora para reagir e quase não defende. Para aprender os golpes.' },
  { id: 'medio', nome: 'Médio', descricao: 'Defende metade dos golpes e pune erro. Luta de igual para igual.' },
  { id: 'dificil', nome: 'Difícil', descricao: 'Lê seus golpes, defende quase tudo e não perdoa. Para quem já sabe jogar.' }
];

export interface PerfilCpu {
  /** Tempo até perceber o que o oponente fez, ms. */
  reacaoMs: number;
  /** Pausa mínima entre um golpe e o próximo, ms. */
  intervaloAtaqueMs: number;
  /** Chance de defender um golpe ou projétil que vem. */
  defesa: number;
  /** Chance, a cada decisão, de soltar o especial com a barra cheia. */
  especial: number;
  /** Chance de atacar quando está no alcance (o resto é esperar ou recuar). */
  agressividade: number;
  /** Chance de punir o oponente tonto. */
  punicao: number;
}

export const PERFIS: Record<Dificuldade, PerfilCpu> = {
  facil: { reacaoMs: 520, intervaloAtaqueMs: 950, defesa: 0.2, especial: 0.08, agressividade: 0.45, punicao: 0.3 },
  medio: { reacaoMs: 300, intervaloAtaqueMs: 520, defesa: 0.5, especial: 0.3, agressividade: 0.7, punicao: 0.7 },
  dificil: { reacaoMs: 150, intervaloAtaqueMs: 260, defesa: 0.8, especial: 0.6, agressividade: 0.9, punicao: 1 }
};

/** O que a CPU enxerga da luta neste quadro. */
export interface LeituraDaLuta {
  tempoMs: number;
  eu: {
    x: number;
    noAr: boolean;
    atordoado: boolean;
    barraCheia: boolean;
    /** O chute dele é tiro (atira de longe). */
    chuteDeLonge: boolean;
  };
  oponente: {
    x: number;
    noAr: boolean;
    atordoado: boolean;
    /** Está no meio de um golpe. */
    atacando: boolean;
    /** Tem tiro ou coisa caindo vindo. */
    projetil: boolean;
    caido: boolean;
  };
}

/** Distância entre os centros, px de mundo. */
const PERTO = 250;
const MEIO = 460;

const NEUTRO: FighterInput = {
  left: false, right: false, crouch: false, block: false, jump: false, light: false, heavy: false, special: false
};

export class CpuLutador {
  private readonly perfil: PerfilCpu;
  /** Segura defesa, agachar ou andar até este instante. */
  private segurarAte = 0;
  private segurando: Partial<FighterInput> = {};
  private proximoAtaque = 0;
  private proximaDecisao = 0;
  /** Quando o oponente começou o golpe que a CPU ainda vai perceber. */
  private viuAtaqueEm: number | null = null;

  constructor(dificuldade: Dificuldade = 'medio', private readonly aleatorio: () => number = Math.random) {
    this.perfil = PERFIS[dificuldade];
  }

  atualizar(l: LeituraDaLuta): FighterInput {
    const input: FighterInput = { ...NEUTRO };
    const t = l.tempoMs;
    const lado = Math.sign(l.oponente.x - l.eu.x) || 1;
    const distancia = Math.abs(l.oponente.x - l.eu.x);
    const frente = lado > 0 ? 'right' : 'left';
    const tras = lado > 0 ? 'left' : 'right';

    if (l.oponente.caido || l.eu.atordoado) {
      this.segurarAte = 0;
      return input;
    }

    // Ameaça: golpe de perto ou projétil. Percebe depois do tempo de reação.
    const ameaca = (l.oponente.atacando && distancia < PERTO * 1.5) || l.oponente.projetil;
    if (ameaca && this.viuAtaqueEm === null) this.viuAtaqueEm = t;
    if (!ameaca) this.viuAtaqueEm = null;
    // A defesa corta o que estiver segurando (andar, recuar).
    if (this.viuAtaqueEm !== null && t - this.viuAtaqueEm >= this.perfil.reacaoMs) {
      this.viuAtaqueEm = Number.POSITIVE_INFINITY; // decide uma vez por golpe
      if (this.aleatorio() < this.perfil.defesa) {
        // Projétil de longe: às vezes pula por cima em vez de defender.
        if (l.oponente.projetil && distancia > PERTO && this.aleatorio() < 0.35) {
          input.jump = true;
          input[frente] = true;
          return input;
        }
        this.segurar(t, 380, { block: true }, input);
        return input;
      }
    }

    // Ainda segurando o que decidiu (defesa, andar, agachar).
    if (t < this.segurarAte) {
      Object.assign(input, this.segurando);
      return input;
    }
    if (t < this.proximaDecisao || l.eu.noAr) return input;
    this.proximaDecisao = t + this.perfil.reacaoMs * 0.5;

    // Barra cheia: especial.
    if (l.eu.barraCheia && distancia < MEIO * 1.3 && this.aleatorio() < this.perfil.especial) {
      input.special = true;
      return input;
    }

    // Oponente tonto ou caindo do pulo: pune com o golpe mais forte de perto.
    if (l.oponente.atordoado && distancia < PERTO * 1.1 && t >= this.proximoAtaque) {
      if (this.aleatorio() < this.perfil.punicao) {
        this.atacar(t, input, this.aleatorio() < 0.5 ? 'cotovelo' : 'chute');
        return input;
      }
    }

    if (distancia <= PERTO) {
      if (t >= this.proximoAtaque && this.aleatorio() < this.perfil.agressividade) {
        const r = this.aleatorio();
        this.atacar(t, input, r < 0.4 ? 'soco' : r < 0.6 ? 'cotovelo' : r < 0.8 ? 'baixo' : 'chute');
        return input;
      }
      // Sem atacar: recua um pouco ou fica de guarda.
      if (this.aleatorio() < 0.4) this.segurar(t, 250, { [tras]: true }, input);
      else this.segurar(t, 220, { block: true }, input);
      return input;
    }

    if (distancia <= MEIO) {
      // Meia distância: entra andando, às vezes de pulo, ou atira se o chute for tiro.
      if (l.eu.chuteDeLonge && t >= this.proximoAtaque && this.aleatorio() < this.perfil.agressividade * 0.5) {
        this.atacar(t, input, 'chute');
        return input;
      }
      if (this.aleatorio() < 0.15 * this.perfil.agressividade) {
        input.jump = true;
        input[frente] = true;
        return input;
      }
      this.segurar(t, 260, { [frente]: true }, input);
      return input;
    }

    // Longe: atira ou avança.
    if (l.eu.chuteDeLonge && t >= this.proximoAtaque && this.aleatorio() < this.perfil.agressividade * 0.35) {
      this.atacar(t, input, 'chute');
      return input;
    }
    this.segurar(t, 400, { [frente]: true }, input);
    return input;
  }

  /** Segura as entradas por `ms`, já valendo neste quadro. */
  private segurar(t: number, ms: number, entradas: Partial<FighterInput>, input?: FighterInput): void {
    this.segurarAte = t + ms;
    this.segurando = entradas;
    if (input) Object.assign(input, entradas);
  }

  /** Golpes de chão: soco, cotovelo (baixo + soco), baixo (baixo + chute) e chute. */
  private atacar(t: number, input: FighterInput, golpe: 'soco' | 'cotovelo' | 'baixo' | 'chute'): void {
    this.proximoAtaque = t + this.perfil.intervaloAtaqueMs;
    if (golpe === 'soco') input.light = true;
    if (golpe === 'chute') input.heavy = true;
    if (golpe === 'cotovelo' || golpe === 'baixo') {
      // Agachar e apertar no mesmo quadro: o motor lê baixo + botão.
      input.crouch = true;
      if (golpe === 'cotovelo') input.light = true;
      else input.heavy = true;
      this.segurar(t, 120, { crouch: true });
    }
  }
}
