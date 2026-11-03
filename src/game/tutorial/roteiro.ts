/**
 * O roteiro do tutorial como dado (docs/superpowers/specs/2026-11-03-tutorial-design.md,
 * seção 5). Cada etapa: o que a torcida e a luz fazem ao entrar, as falas que
 * congelam a luta, o que a CPU faz e o checklist que libera a próxima. Os
 * `{marcadores}` viram as teclas da pessoa (teclas.ts).
 */

export type Objetivo =
  | 'andar-esquerda'
  | 'andar-direita'
  | 'pular'
  | 'abaixar'
  | 'dash-frente'
  | 'acertar-soco'
  | 'acertar-chute'
  | 'quebrar-guarda'
  | 'acertar-no-ar';

/** O que a CPU faz na etapa (cpuDoTutorial.ts). */
export type RoteiroDaCpu = 'parada' | 'chegar' | 'guarda-alta' | 'pular';

export type Foco = 'putometro' | 'barra';

export interface ItemDoChecklist {
  objetivo: Objetivo;
  texto: string;
}

export interface Etapa {
  id: string;
  falas: string[];
  checklist: ItemDoChecklist[];
  cpu: RoteiroDaCpu;
  /** O Putômetro do jogador vai a este ponto ao entrar na etapa. */
  putometro?: 'meio' | 'cheio' | 'vermelho';
  /** O foco de luz durante as falas. */
  foco?: Foco[];
  /** A última: as falas acabam e começa a luta de verdade. */
  fim?: true;
}

export const ROTEIRO: Etapa[] = [
  {
    id: 'andar',
    falas: ['Se movimente com {esquerda} e {direita}.'],
    checklist: [
      { objetivo: 'andar-esquerda', texto: 'Andar para a esquerda {esquerda}' },
      { objetivo: 'andar-direita', texto: 'Andar para a direita {direita}' }
    ],
    cpu: 'parada',
    // O jogo começa no verde: no amarelo, a subida do "Que Show!" aparece.
    putometro: 'meio'
  },
  {
    id: 'pular',
    falas: ['Pule com {pular} e abaixe-se com {abaixar}.'],
    checklist: [
      { objetivo: 'pular', texto: 'Pular {pular}' },
      { objetivo: 'abaixar', texto: 'Abaixar {abaixar}' }
    ],
    cpu: 'parada'
  },
  {
    id: 'dash',
    falas: ['Pra cima dele! ({frente} 2 vezes rápido)'],
    checklist: [{ objetivo: 'dash-frente', texto: 'Passo largo para a frente {frente} {frente}' }],
    cpu: 'parada'
  },
  {
    id: 'bater',
    falas: ['Experimente bater com {soco} ou {chute}.'],
    checklist: [
      { objetivo: 'acertar-soco', texto: 'Acertar um soco {soco}' },
      { objetivo: 'acertar-chute', texto: 'Acertar um chute {chute}' }
    ],
    cpu: 'chegar'
  },
  {
    id: 'que-show',
    falas: ['Que Show! A torcida se animou!'],
    checklist: [],
    cpu: 'parada',
    putometro: 'cheio',
    foco: ['putometro']
  },
  {
    id: 'quebrar-guarda',
    falas: ['Agora derrube essa guarda com golpes fortes! ({abaixar} + {soco} ou {abaixar} + {chute})'],
    checklist: [{ objetivo: 'quebrar-guarda', texto: 'Quebrar a guarda {abaixar} + {soco} / {chute}' }],
    cpu: 'guarda-alta'
  },
  {
    id: 'no-ar',
    falas: ['Agora tente pulando ({pular}, e no ar {soco} ou {chute}).'],
    checklist: [{ objetivo: 'acertar-no-ar', texto: 'Acertar um golpe no ar {pular} + {soco} / {chute}' }],
    cpu: 'pular'
  },
  {
    id: 'quebre-ele',
    falas: ['Chega de conversa! QUEBRE ELE!'],
    checklist: [],
    cpu: 'parada',
    fim: true
  }
];
