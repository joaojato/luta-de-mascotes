import { ROTEIRO, type Etapa, type ItemDoChecklist, type Objetivo } from './roteiro';

/**
 * A máquina de etapas do tutorial, sem Phaser. A cena conta o que o jogador
 * fez (`quadro`, `golpe`); isto diz se há fala na tela (luta congelada), o
 * checklist da etapa e quando passar para a próxima.
 */

/** O jogador neste quadro. */
export interface QuadroDoJogador {
  esquerda: boolean;
  direita: boolean;
  noAr: boolean;
  agachado: boolean;
  /** Passo largo que começou neste quadro, em relação ao oponente. */
  dash: 'frente' | 'tras' | null;
}

/** Um golpe que encostou em alguém. */
export interface GolpeNaLuta {
  atacante: 'p1' | 'p2';
  /** O `AttackMove` do motor (`soco-rapido`, `voadora`...). */
  golpe: string;
  defendido: boolean;
  guardaQuebrada: boolean;
}

/** Tempo segurando a direção que conta como "andou". */
const ANDAR_SEGUNDOS = 0.3;

const SOCOS = ['soco-rapido', 'soco-forte'];
const CHUTES = ['chute-basico', 'chute-baixo', 'tiro'];
const NO_AR = ['soco-no-ar', 'voadora'];

export class Tutorial {
  private indice = 0;
  private fala = 0;
  private feitos = new Set<Objetivo>();
  private andou = { esquerda: 0, direita: 0 };
  /** Etapa em que se acabou de entrar, até a cena pegar (`tomarEtapaNova`). */
  private nova: Etapa | null;

  constructor(private readonly roteiro: Etapa[] = ROTEIRO) {
    this.nova = roteiro[0];
  }

  get etapa(): Etapa {
    return this.roteiro[this.indice];
  }

  /** A fala na tela, ou null com a luta solta. */
  get falaAtual(): string | null {
    return this.etapa.falas[this.fala] ?? null;
  }

  get congelado(): boolean {
    return this.falaAtual !== null;
  }

  /** Acabaram as falas da última etapa: é a hora da luta de verdade. */
  get acabou(): boolean {
    return Boolean(this.etapa.fim) && !this.congelado;
  }

  get checklist(): (ItemDoChecklist & { feito: boolean })[] {
    return this.etapa.checklist.map((item) => ({ ...item, feito: this.feitos.has(item.objetivo) }));
  }

  /** A etapa que acabou de começar, uma vez só (para a torcida e a luz). */
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
   * @param jogador - O que o jogador está fazendo agora.
   * @param segundos - Duração do quadro.
   */
  quadro(jogador: QuadroDoJogador, segundos: number): void {
    if (this.congelado) return;
    if (jogador.esquerda && !jogador.noAr) this.andou.esquerda += segundos;
    if (jogador.direita && !jogador.noAr) this.andou.direita += segundos;
    if (this.andou.esquerda >= ANDAR_SEGUNDOS) this.marcar('andar-esquerda');
    if (this.andou.direita >= ANDAR_SEGUNDOS) this.marcar('andar-direita');
    if (jogador.noAr) this.marcar('pular');
    if (jogador.agachado) this.marcar('abaixar');
    if (jogador.dash === 'frente') this.marcar('dash-frente');
    this.conferir();
  }

  golpe(golpe: GolpeNaLuta): void {
    if (this.congelado || golpe.atacante !== 'p1') return;
    if (!golpe.defendido && SOCOS.includes(golpe.golpe)) this.marcar('acertar-soco');
    if (!golpe.defendido && CHUTES.includes(golpe.golpe)) this.marcar('acertar-chute');
    if (golpe.guardaQuebrada) this.marcar('quebrar-guarda');
    if (NO_AR.includes(golpe.golpe)) this.marcar('acertar-no-ar');
    this.conferir();
  }

  /** Só conta o que a etapa atual pede: o que sobrou da anterior não adianta a próxima. */
  private marcar(objetivo: Objetivo): void {
    if (this.etapa.checklist.some((item) => item.objetivo === objetivo)) this.feitos.add(objetivo);
  }

  private conferir(): void {
    const { checklist } = this.etapa;
    if (checklist.length > 0 && checklist.every((item) => this.feitos.has(item.objetivo))) this.proxima();
  }

  private proxima(): void {
    if (this.indice >= this.roteiro.length - 1) return;
    this.indice += 1;
    this.fala = 0;
    this.feitos = new Set();
    this.andou = { esquerda: 0, direita: 0 };
    this.nova = this.etapa;
  }
}
