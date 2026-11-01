import type { FighterInput } from './fighter';

/**
 * CPU do 1 VS CPU (docs/cpu.md). Lê a luta a cada quadro (distância, golpe do
 * oponente, projétil no ar, barra cheia) e decide como um jogador: chega
 * perto, ataca com mistura de golpes, defende quando o oponente bate, pune
 * quem ficou tonto e usa o especial. A dificuldade muda os números (reação,
 * frequência de ataque, defesa, especial) e liga comportamentos que o Médio
 * não tem: o Fácil faz bobagem, o Difícil agacha na guarda certa, pune o
 * golpe que terminou, corta pulo e guarda o especial para a hora (31/10/2026).
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
  /** Chance, a cada decisão, de uma bobagem: soco no ar ou recuar sem motivo. */
  erro: number;
  /** Defende agachado contra golpe de chão (a guarda baixa segura todos) e em pé contra o aéreo. */
  guardaCerta: boolean;
  /** Chance de bater assim que o golpe do oponente termina perto (errou ou foi defendido). */
  punirRecuperacao: number;
  /** Chance de chutar o oponente que pula perto. */
  antiAereo: number;
  /** Só solta o especial com o oponente tonto ou saindo de um golpe, perto. */
  especialNaHora: boolean;
}

const SEM_EXTRAS = { erro: 0, guardaCerta: false, punirRecuperacao: 0, antiAereo: 0, especialNaHora: false };

export const PERFIS: Record<Dificuldade, PerfilCpu> = {
  facil: { reacaoMs: 800, intervaloAtaqueMs: 1600, defesa: 0.08, especial: 0.03, agressividade: 0.3, punicao: 0.1, ...SEM_EXTRAS, erro: 0.35 },
  medio: { reacaoMs: 300, intervaloAtaqueMs: 520, defesa: 0.5, especial: 0.3, agressividade: 0.7, punicao: 0.7, ...SEM_EXTRAS },
  dificil: {
    reacaoMs: 110, intervaloAtaqueMs: 220, defesa: 0.9, especial: 0.8, agressividade: 0.85, punicao: 1,
    erro: 0, guardaCerta: true, punirRecuperacao: 0.9, antiAereo: 0.7, especialNaHora: true
  }
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
  /** O oponente estava no meio de um golpe no quadro anterior. */
  private oponenteAtacava = false;

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

    // O golpe do oponente acabou de terminar: a janela de punição.
    const recuperando = this.oponenteAtacava && !l.oponente.atacando;
    this.oponenteAtacava = l.oponente.atacando;

    if (l.oponente.caido || l.eu.atordoado) {
      this.segurarAte = 0;
      return input;
    }

    if (recuperando && !l.eu.noAr && distancia <= PERTO * 1.1 && this.chance(this.perfil.punirRecuperacao)) {
      this.segurarAte = 0;
      this.viuAtaqueEm = null;
      this.atacar(t, input, this.aleatorio() < 0.5 ? 'cotovelo' : 'chute');
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
        // A guarda baixa segura todo golpe de chão; só a voadora passa por ela.
        const agachar = this.perfil.guardaCerta && !l.oponente.noAr;
        this.segurar(t, 380, agachar ? { block: true, crouch: true } : { block: true }, input);
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

    // Fácil: às vezes uma bobagem no lugar da decisão certa (soco no ar de longe, ou recuar).
    if (this.chance(this.perfil.erro)) {
      if (distancia > PERTO && this.aleatorio() < 0.5) this.atacar(t, input, 'soco');
      else this.segurar(t, 500, { [tras]: true }, input);
      return input;
    }

    // Barra cheia: especial (o Difícil espera o oponente vulnerável e perto).
    const hora = this.perfil.especialNaHora ? (l.oponente.atordoado || recuperando) && distancia < PERTO * 1.3 : distancia < MEIO * 1.3;
    if (l.eu.barraCheia && hora && this.aleatorio() < this.perfil.especial) {
      input.special = true;
      return input;
    }

    // Oponente pulando perto: chuta antes de ele cair em cima.
    if (l.oponente.noAr && distancia < PERTO * 1.3 && t >= this.proximoAtaque && this.chance(this.perfil.antiAereo)) {
      this.atacar(t, input, 'chute');
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

  /** Sorteia só quando o comportamento está ligado: o Médio não gasta sorteio com o que não tem. */
  private chance(p: number): boolean {
    return p > 0 && this.aleatorio() < p;
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
