/**
 * O roteiro do tutorial como dado (docs/superpowers/specs/2026-11-03-tutorial-design.md,
 * seção 5). Cada etapa: o que a CPU faz, o que dispara as falas (na entrada,
 * ou depois de algo acontecer na luta), as falas que congelam a luta, o que a
 * torcida e a luz fazem quando elas aparecem, e o checklist que libera a
 * próxima. Os `{marcadores}` viram as teclas da pessoa (teclas.ts).
 */

export type Objetivo =
  | 'andar-esquerda'
  | 'andar-direita'
  | 'pular'
  | 'abaixar'
  | 'dash-frente'
  | 'acertar-soco'
  | 'acertar-chute'
  | 'quebrar-guarda-soco'
  | 'quebrar-guarda-chute'
  | 'acertar-soco-no-ar'
  | 'acertar-voadora'
  | 'aparar'
  | 'defender'
  | 'defender-agachado'
  | 'desviar-voadora'
  | 'acertar-especial';

/** O que a CPU faz na etapa (cpuDoTutorial.ts). */
export type RoteiroDaCpu =
  | 'parada'
  | 'chegar'
  | 'guarda-alta'
  | 'pular'
  | 'socos'
  | 'aparo'
  | 'soco-forte-na-guarda'
  | 'pesados'
  | 'voadora-na-guarda-baixa'
  | 'voadoras';

export type Foco = 'putometro' | 'barra';

/**
 * O que precisa acontecer na luta para as falas aparecerem: o jogador
 * apanhar ou a guarda dele quebrar. Sem gatilho, as falas vêm na entrada.
 */
export type Gatilho = 'apanhou' | 'guarda-quebrada';

export interface ItemDoChecklist {
  objetivo: Objetivo;
  texto: string;
  /** Quantas vezes (padrão: uma). */
  vezes?: number;
}

export interface Etapa {
  id: string;
  gatilho?: Gatilho;
  /** O que aparece no lugar do checklist enquanto o gatilho não vem. */
  dica?: string;
  falas: string[];
  checklist: ItemDoChecklist[];
  cpu: RoteiroDaCpu;
  /** O que a CPU passa a fazer depois das falas. */
  cpuDepois?: RoteiroDaCpu;
  /** O Putômetro do jogador vai a este ponto quando as falas aparecem. */
  putometro?: 'meio' | 'cheio' | 'vermelho';
  /** O foco de luz durante as falas. */
  foco?: Foco[];
  /** A barra do especial do jogador fica cheia durante a etapa. */
  barraCheia?: true;
  /** A última: as falas acabam e começa a luta de verdade. */
  fim?: true;
  /** Só no teclado (fala das teclas da outra mão): no celular a etapa sai do roteiro. */
  soTeclado?: true;
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
    // Cada golpe forte testado (João, 03/11/2026), não um ou outro.
    checklist: [
      { objetivo: 'quebrar-guarda-soco', texto: 'Quebrar a guarda com o soco forte {abaixar} + {soco}' },
      { objetivo: 'quebrar-guarda-chute', texto: 'Quebrar a guarda com o chute baixo {abaixar} + {chute}' }
    ],
    cpu: 'guarda-alta'
  },
  {
    id: 'no-ar',
    falas: ['Agora tente pulando ({pular}, e no ar {soco} ou {chute}).'],
    checklist: [
      // Pulando parado, o soco passa por cima de quem está em pé: pula na direção dele.
      { objetivo: 'acertar-soco-no-ar', texto: 'Soco no ar, pulando na direção dele {pular} + {soco}' },
      { objetivo: 'acertar-voadora', texto: 'Voadora {pular} + {chute}' }
    ],
    cpu: 'pular'
  },
  {
    // A CPU vem socando; a fala vem depois do primeiro soco que entra.
    id: 'apanhar',
    gatilho: 'apanhou',
    falas: ['P%#R@! A torcida não está gostando!'],
    checklist: [],
    cpu: 'socos',
    putometro: 'vermelho',
    foco: ['putometro']
  },
  {
    // Treino de aparo: o anel fecha na hora do impacto (aparo.ts).
    id: 'aparo',
    falas: ['Rápido! Bloqueie alguns golpes segurando {defesa}!'],
    checklist: [{ objetivo: 'aparar', texto: 'Defender na hora do impacto {defesa}' }],
    cpu: 'aparo'
  },
  {
    id: 'tontos',
    falas: ['Bloquear na hora do impacto deixa eles tontos! Continue com o {defesa}.'],
    checklist: [{ objetivo: 'defender', texto: 'Defender socos {defesa}', vezes: 3 }],
    cpu: 'parada',
    cpuDepois: 'socos'
  },
  {
    // A CPU espera a guarda em pé e solta o soco forte, que quebra.
    id: 'guarda-baixa',
    gatilho: 'guarda-quebrada',
    dica: 'Segure {defesa}',
    falas: ['Bloqueio de pé não aguenta golpes pesados.', 'Bloqueie abaixado ({abaixar} + {defesa}).'],
    checklist: [{ objetivo: 'defender-agachado', texto: 'Defender golpes pesados abaixado {abaixar} + {defesa}', vezes: 3 }],
    cpu: 'soco-forte-na-guarda',
    cpuDepois: 'pesados'
  },
  {
    // Com sucesso nas defesas, a voadora quebra a guarda baixa.
    id: 'voadora',
    gatilho: 'guarda-quebrada',
    dica: 'Continue abaixado defendendo {abaixar} + {defesa}',
    falas: ['Desvie da voadora com um passo largo ({tras} 2 vezes rápido).'],
    checklist: [{ objetivo: 'desviar-voadora', texto: 'Desviar da voadora {tras} {tras}' }],
    cpu: 'voadora-na-guarda-baixa',
    cpuDepois: 'voadoras'
  },
  {
    id: 'especial',
    falas: ['Vamo Virar! Aperte {especial}.'],
    checklist: [{ objetivo: 'acertar-especial', texto: 'Acertar o especial {especial}' }],
    cpu: 'parada',
    putometro: 'meio',
    barraCheia: true
  },
  {
    id: 'agora-sim',
    falas: ['Agora sim!'],
    checklist: [],
    cpu: 'parada',
    putometro: 'cheio',
    foco: ['putometro']
  },
  {
    id: 'torcida-especial',
    falas: ['Agradar a torcida faz seu Especial carregar mais rápido com o tempo!'],
    checklist: [],
    cpu: 'parada',
    foco: ['putometro', 'barra']
  },
  {
    // As teclas extras de quem joga sozinho no teclado (controles.ts, EXTRA_SOZINHO).
    id: 'duas-maos',
    falas: ['Se quiser usar as duas mãos para jogar:\n{duasMaos}.'],
    checklist: [],
    cpu: 'parada',
    soTeclado: true
  },
  {
    id: 'quebre-ele',
    falas: ['Chega de conversa! QUEBRE ELE!'],
    checklist: [],
    cpu: 'parada',
    fim: true
  }
];
