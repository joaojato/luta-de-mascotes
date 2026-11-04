import type { FighterInput } from '../fighter';
import { RESPIRO_MS } from './tutorial';

/**
 * Instruções do 1x1 (João, 04/11/2026): o mini tutorial da caixinha
 * "Instruções" na Seleção. Sem historinha nem CPU: cada etapa mostra os
 * comandos dos dois lados e passa quando os dois apertaram tudo, sem
 * precisar acertar. No fim, a luta começa de verdade. Sem Phaser.
 */

export type Comando1x1 =
  | 'esquerda'
  | 'direita'
  | 'pular'
  | 'abaixar'
  | 'soco'
  | 'chute'
  | 'soco-forte'
  | 'chute-baixo'
  | 'soco-no-ar'
  | 'voadora'
  | 'defesa'
  | 'especial';

export interface EtapaDasInstrucoes {
  id: string;
  titulo: string;
  itens: { comando: Comando1x1; texto: string }[];
}

/** Os `{marcadores}` viram as teclas e os nomes dos golpes de cada lado (teclas.ts). */
export const INSTRUCOES: EtapaDasInstrucoes[] = [
  {
    id: 'andar',
    titulo: 'Andar',
    itens: [
      { comando: 'esquerda', texto: 'Esquerda {esquerda}' },
      { comando: 'direita', texto: 'Direita {direita}' }
    ]
  },
  {
    id: 'pular',
    titulo: 'Pular e abaixar',
    itens: [
      { comando: 'pular', texto: 'Pular {pular}' },
      { comando: 'abaixar', texto: 'Abaixar {abaixar}' }
    ]
  },
  {
    id: 'bater',
    titulo: 'Soco e chute',
    itens: [
      { comando: 'soco', texto: '{golpe:soco-rapido} {soco}' },
      { comando: 'chute', texto: '{golpe:chute-basico} {chute}' }
    ]
  },
  {
    id: 'abaixado',
    titulo: 'Golpes abaixado (segurando o baixo)',
    itens: [
      { comando: 'soco-forte', texto: '{golpe:soco-forte} {abaixar} + {soco}' },
      { comando: 'chute-baixo', texto: '{golpe:chute-baixo} {abaixar} + {chute}' }
    ]
  },
  {
    id: 'no-ar',
    titulo: 'Golpes no ar',
    itens: [
      { comando: 'soco-no-ar', texto: '{golpe:soco-no-ar} {pular}, {soco}' },
      { comando: 'voadora', texto: '{golpe:voadora} {pular}, {chute}' }
    ]
  },
  {
    id: 'defesa',
    titulo: 'Defesa e especial',
    itens: [
      { comando: 'defesa', texto: 'Defender {defesa}' },
      { comando: 'especial', texto: '{golpe:especial} {especial} (com a barra cheia)' }
    ]
  }
];

/** Um lado neste quadro: o que apertou e se está no ar. */
export interface LadoNoQuadro {
  input: FighterInput;
  noAr: boolean;
}

/** Os comandos que este quadro apertou. Botão de golpe vale um quadro (o motor só lê a borda). */
export function comandosApertados({ input, noAr }: LadoNoQuadro): Comando1x1[] {
  const golpe = (botao: boolean, chao: Comando1x1, abaixado: Comando1x1, ar: Comando1x1): Comando1x1[] =>
    !botao ? [] : noAr ? [ar] : input.crouch ? [abaixado] : [chao];
  return [
    ...(input.left ? (['esquerda'] as const) : []),
    ...(input.right ? (['direita'] as const) : []),
    ...(input.jump ? (['pular'] as const) : []),
    ...(input.crouch && !noAr ? (['abaixar'] as const) : []),
    ...golpe(input.light, 'soco', 'soco-forte', 'soco-no-ar'),
    ...golpe(input.heavy, 'chute', 'chute-baixo', 'voadora'),
    ...(input.block ? (['defesa'] as const) : []),
    ...(input.special ? (['especial'] as const) : [])
  ];
}

/** O balão do fim, antes da luta (João, 04/11/2026). */
export const FALA_FINAL_DAS_INSTRUCOES = 'Abra o menu para revisar os golpes ({menu}).';

export class Instrucoes {
  private indice = 0;
  private feitos: [Set<Comando1x1>, Set<Comando1x1>] = [new Set(), new Set()];
  /** Os dois terminaram: ms que faltam para a próxima etapa. */
  private respiro: number | null = null;
  private terminou = false;

  constructor(private readonly etapas: EtapaDasInstrucoes[] = INSTRUCOES) {}

  get etapa(): EtapaDasInstrucoes {
    return this.etapas[this.indice];
  }

  /** Todas as etapas feitas pelos dois: a luta de verdade começa. */
  get acabou(): boolean {
    return this.terminou;
  }

  /** @param lado - 0 é o P1, 1 o P2. */
  checklist(lado: 0 | 1): { comando: Comando1x1; texto: string; feito: boolean }[] {
    return this.etapa.itens.map((item) => ({ ...item, feito: this.feitos[lado].has(item.comando) }));
  }

  /**
   * @param lados - P1 e P2 neste quadro.
   * @param segundos - Duração do quadro.
   */
  quadro(lados: [LadoNoQuadro, LadoNoQuadro], segundos: number): void {
    if (this.terminou) return;
    if (this.respiro !== null) {
      this.respiro -= segundos * 1000;
      if (this.respiro <= 0) this.proxima();
      return;
    }
    const pedidos = new Set(this.etapa.itens.map(({ comando }) => comando));
    lados.forEach((lado, i) => comandosApertados(lado).filter((c) => pedidos.has(c)).forEach((c) => this.feitos[i].add(c)));
    const completo = (i: 0 | 1) => this.etapa.itens.every(({ comando }) => this.feitos[i].has(comando));
    if (completo(0) && completo(1)) this.respiro = RESPIRO_MS;
  }

  private proxima(): void {
    this.respiro = null;
    this.feitos = [new Set(), new Set()];
    if (this.indice >= this.etapas.length - 1) this.terminou = true;
    else this.indice += 1;
  }
}
