import { ROTEIRO, type Etapa, type ItemDoChecklist, type Objetivo, type RoteiroDaCpu } from './roteiro';

/**
 * A máquina de etapas do tutorial, sem Phaser. A cena conta o que acontece
 * (`quadro`, `golpe`); isto diz se há fala na tela (luta congelada), o
 * checklist da etapa, o que a CPU faz agora e quando passar para a próxima.
 */

/** A luta neste quadro, do ponto de vista do jogador. */
export interface QuadroDoJogador {
  esquerda: boolean;
  direita: boolean;
  noAr: boolean;
  agachado: boolean;
  /** Passo largo que começou neste quadro, em relação ao oponente. */
  dash: 'frente' | 'tras' | null;
  /** A CPU está no ar, ou numa voadora (do pulo ao pouso). */
  cpuNoAr?: boolean;
}

/** Um golpe que encostou em alguém. */
export interface GolpeNaLuta {
  atacante: 'p1' | 'p2';
  /** O `AttackMove` do motor (`soco-rapido`, `voadora`...). */
  golpe: string;
  defendido: boolean;
  guardaQuebrada: boolean;
  /** Defesa na hora do impacto (`isPerfectGuard`). */
  aparo?: boolean;
  /** Golpe de especial (qualquer tipo: corpo, tiro, queda). */
  especial?: boolean;
}

/** Tempo segurando a direção que conta como "andou". */
const ANDAR_SEGUNDOS = 0.3;
/**
 * Checklist completo: a luta segue solta este tanto, com tudo marcado, antes
 * da próxima fala (João, 03/11/2026: a pessoa precisa ver o que fez).
 */
export const RESPIRO_MS = 1000;

const SOCOS = ['soco-rapido', 'soco-forte'];
const CHUTES = ['chute-basico', 'chute-baixo', 'tiro'];
/** Só a guarda baixa segura estes: defendido é defendido abaixado. */
const PESADOS = ['soco-forte', 'chute-baixo'];

export class Tutorial {
  private indice = 0;
  private fala = 0;
  private feitos = new Map<Objetivo, number>();
  private andou = { esquerda: 0, direita: 0 };
  /** O gatilho da etapa já veio (ou ela não tem). */
  private disparou: boolean;
  /** Checklist completo: ms de luta solta que faltam para a próxima etapa. */
  private respiro: number | null = null;
  /** Passo largo para trás com a CPU no ar, até ela pousar sem acertar. */
  private desviando = false;
  private cpuNoAr = false;
  /** Etapa cujas falas acabaram de aparecer, até a cena pegar (`tomarEtapaNova`). */
  private nova: Etapa | null;

  constructor(private readonly roteiro: Etapa[] = ROTEIRO) {
    this.disparou = roteiro[0].gatilho === undefined;
    this.nova = this.disparou ? roteiro[0] : null;
  }

  get etapa(): Etapa {
    return this.roteiro[this.indice];
  }

  /** A fala na tela, ou null com a luta solta. */
  get falaAtual(): string | null {
    return this.disparou ? (this.etapa.falas[this.fala] ?? null) : null;
  }

  get congelado(): boolean {
    return this.falaAtual !== null;
  }

  /** A luta corre esperando o gatilho das falas. */
  get esperandoGatilho(): boolean {
    return !this.disparou;
  }

  /** O que a CPU faz agora: o da etapa, ou o de depois das falas. */
  get cpu(): RoteiroDaCpu {
    const depoisDasFalas = this.disparou && this.fala >= this.etapa.falas.length;
    return depoisDasFalas ? (this.etapa.cpuDepois ?? this.etapa.cpu) : this.etapa.cpu;
  }

  /** Acabaram as falas da última etapa: é a hora da luta de verdade. */
  get acabou(): boolean {
    return Boolean(this.etapa.fim) && this.disparou && !this.congelado;
  }

  get checklist(): (ItemDoChecklist & { feito: boolean; contagem: number })[] {
    return this.etapa.checklist.map((item) => {
      const contagem = this.feitos.get(item.objetivo) ?? 0;
      return { ...item, contagem, feito: contagem >= (item.vezes ?? 1) };
    });
  }

  /** A etapa cujas falas acabaram de aparecer, uma vez só (para a torcida e a luz). */
  tomarEtapaNova(): Etapa | null {
    const nova = this.nova;
    this.nova = null;
    return nova;
  }

  /** Fecha a fala da tela. Sem fala nem checklist, a etapa já passou. */
  continuar(): void {
    if (!this.congelado) return;
    this.fala += 1;
    if (!this.congelado && this.etapa.checklist.length === 0 && !this.etapa.fim) this.proxima();
  }

  /**
   * @param jogador - O que o jogador (e a CPU no ar) está fazendo agora.
   * @param segundos - Duração do quadro.
   */
  quadro(jogador: QuadroDoJogador, segundos: number): void {
    if (this.congelado) return;
    const pousou = this.cpuNoAr && !jogador.cpuNoAr;
    this.cpuNoAr = Boolean(jogador.cpuNoAr);
    if (this.respiro !== null) {
      this.respiro -= segundos * 1000;
      if (this.respiro <= 0) this.proxima();
      return;
    }
    if (!this.disparou) return;
    if (jogador.esquerda && !jogador.noAr) this.andou.esquerda += segundos;
    if (jogador.direita && !jogador.noAr) this.andou.direita += segundos;
    if (this.andou.esquerda >= ANDAR_SEGUNDOS) this.marcar('andar-esquerda');
    if (this.andou.direita >= ANDAR_SEGUNDOS) this.marcar('andar-direita');
    if (jogador.noAr) this.marcar('pular');
    if (jogador.agachado) this.marcar('abaixar');
    if (jogador.dash === 'frente') this.marcar('dash-frente');
    // Desviar da voadora: passo largo para trás com ela no ar, e ela pousa sem acertar.
    if (jogador.dash === 'tras' && this.cpuNoAr) this.desviando = true;
    if (pousou) {
      if (this.desviando) this.marcar('desviar-voadora');
      this.desviando = false;
    }
    this.conferir();
  }

  golpe(golpe: GolpeNaLuta): void {
    if (this.congelado || this.respiro !== null) return;
    if (!this.disparou) {
      const { gatilho } = this.etapa;
      const apanhou = golpe.atacante === 'p2' && !golpe.defendido;
      const quebrou = golpe.atacante === 'p2' && golpe.guardaQuebrada;
      if ((gatilho === 'apanhou' && apanhou) || (gatilho === 'guarda-quebrada' && quebrou)) this.disparar();
      return;
    }
    if (golpe.atacante === 'p2') {
      if (golpe.golpe === 'voadora') this.desviando = false;
      if (golpe.aparo) this.marcar('aparar');
      if (golpe.defendido) this.marcar('defender');
      if (golpe.defendido && PESADOS.includes(golpe.golpe)) this.marcar('defender-agachado');
    } else {
      if (!golpe.defendido && SOCOS.includes(golpe.golpe)) this.marcar('acertar-soco');
      if (!golpe.defendido && CHUTES.includes(golpe.golpe)) this.marcar('acertar-chute');
      if (golpe.guardaQuebrada && golpe.golpe === 'soco-forte') this.marcar('quebrar-guarda-soco');
      if (golpe.guardaQuebrada && golpe.golpe === 'chute-baixo') this.marcar('quebrar-guarda-chute');
      if (golpe.golpe === 'soco-no-ar') this.marcar('acertar-soco-no-ar');
      if (golpe.golpe === 'voadora') this.marcar('acertar-voadora');
      if (golpe.especial && !golpe.defendido) this.marcar('acertar-especial');
    }
    this.conferir();
  }

  /** Só conta o que a etapa atual pede: o que sobrou da anterior não adianta a próxima. */
  private marcar(objetivo: Objetivo): void {
    if (this.etapa.checklist.some((item) => item.objetivo === objetivo)) this.feitos.set(objetivo, (this.feitos.get(objetivo) ?? 0) + 1);
  }

  private conferir(): void {
    const lista = this.checklist;
    if (lista.length > 0 && lista.every((item) => item.feito)) this.respiro = RESPIRO_MS;
  }

  private disparar(): void {
    this.disparou = true;
    this.nova = this.etapa;
  }

  private proxima(): void {
    if (this.indice >= this.roteiro.length - 1) return;
    this.indice += 1;
    this.fala = 0;
    this.feitos = new Map();
    this.andou = { esquerda: 0, direita: 0 };
    this.respiro = null;
    this.desviando = false;
    this.disparou = false;
    if (this.etapa.gatilho === undefined) this.disparar();
  }
}
