/**
 * Os dois temas do jogo como dado (docs/musica.md). Melodias nossas, no
 * espírito do samba de arquibancada e da cumbia de hinchada; nada copiado.
 *
 * Um compasso tem 16 passos (semicolcheias em 4/4). Padrão de batida é uma
 * string de 16 letras: `x` bate, `o` bate fraco, `.` cala.
 */

export type Instrumento = 'trompete' | 'acordeao' | 'baixo' | 'coro';

export interface Batida {
  /** Chave da amostra em `public/assets/audio/musica/` (sem `mus-`). */
  amostra: string;
  padrao: string;
  ganho?: number;
  /** Só nestes compassos do ciclo de 8 (sem: em todos). */
  compassos?: number[];
}

export interface Nota {
  passo: number;
  midi: number;
  /** Duração em passos. */
  dur: number;
}

export interface Frase {
  instrumento: Instrumento;
  /** Um compasso por item; a frase dá a volta quando acaba. */
  compassos: Nota[][];
  ganho?: number;
}

export interface Camada {
  batidas: Batida[];
  frases: Frase[];
}

export interface Tema {
  id: 'menu' | 'luta';
  /** Andamento com a tensão em 0 e em 1. */
  bpm: [number, number];
  /** Tensão fixa (o menu não tem luta para medir). */
  tensaoFixa?: number;
  /** `camadas[n]` entra quando o nível de tensão chega a n. */
  camadas: Camada[];
}

interface Acorde {
  /** Nota do baixo. */
  raiz: number;
  /** Notas do acordeão. */
  notas: number[];
}

const n = (passo: number, midi: number, dur: number): Nota => ({ passo, midi, dur });

/** Baixo e acordeão seguem os acordes: o desenho rítmico é de cada tema. */
function acompanhar(acordes: Acorde[], baixo: [number, number, number][], acordeao: [number, number][]): Frase[] {
  return [
    {
      instrumento: 'baixo',
      ganho: 0.9,
      compassos: acordes.map(({ raiz }) => baixo.map(([passo, intervalo, dur]) => n(passo, raiz + intervalo, dur)))
    },
    {
      instrumento: 'acordeao',
      ganho: 0.32,
      compassos: acordes.map(({ notas }) => acordeao.flatMap(([passo, dur]) => notas.map((midi) => n(passo, midi, dur))))
    }
  ];
}

/** Coro de "ôôô": dobra uma oitava abaixo as notas longas da melodia. */
function coroDaMelodia(melodia: Nota[][]): Nota[][] {
  return melodia.map((compasso) => compasso.filter((nota) => nota.dur >= 4).map((nota) => n(nota.passo, nota.midi - 12, nota.dur)));
}

// ------------------------------------------------------------------ luta
// Cumbia de hinchada em lá menor, cadência andaluza: Am, G, F, E.

const ACORDES_LUTA: Acorde[] = [
  { raiz: 33, notas: [57, 60, 64] },
  { raiz: 31, notas: [55, 59, 62] },
  { raiz: 29, notas: [53, 57, 60] },
  { raiz: 28, notas: [52, 56, 59] }
];

const MELODIA_LUTA: Nota[][] = [
  [n(0, 69, 3), n(3, 72, 1), n(4, 76, 4), n(8, 74, 2), n(10, 72, 2), n(12, 71, 2), n(14, 72, 2)],
  [n(0, 71, 3), n(3, 69, 1), n(4, 67, 4), n(8, 71, 2), n(10, 74, 6)],
  [n(0, 72, 3), n(3, 69, 1), n(4, 65, 4), n(8, 69, 2), n(10, 72, 2), n(12, 77, 4)],
  [n(0, 76, 6), n(6, 74, 2), n(8, 72, 2), n(10, 71, 2), n(12, 68, 4)],
  [n(0, 76, 2), n(2, 76, 2), n(4, 76, 2), n(6, 74, 2), n(8, 72, 4), n(12, 69, 4)],
  [n(0, 74, 2), n(2, 74, 2), n(4, 74, 2), n(6, 72, 2), n(8, 71, 4), n(12, 67, 4)],
  [n(0, 72, 2), n(2, 72, 2), n(4, 72, 2), n(6, 69, 2), n(8, 65, 4), n(12, 69, 4)],
  [n(0, 71, 4), n(4, 68, 4), n(8, 71, 4), n(12, 76, 4)]
];

/** Coro da luta: o acorde inteiro em mínimas, a arquibancada segurando o "ôôô". */
const CORO_LUTA: Nota[][] = [[57, 64], [55, 62], [53, 60], [56, 64]].map((par) =>
  [0, 8].flatMap((passo) => par.map((midi) => n(passo, midi, 8)))
);

export const TEMA_LUTA: Tema = {
  id: 'luta',
  bpm: [96, 140],
  camadas: [
    // 0: a cumbia de base. Bombo, güiro, baixo e acordeão no contratempo.
    {
      batidas: [
        { amostra: 'bumbo', padrao: 'x.......x.......' },
        { amostra: 'guiro-longo', padrao: 'x...x...x...x...', ganho: 0.45 },
        { amostra: 'guiro-curto', padrao: '..xx..xx..xx..xx', ganho: 0.35 }
      ],
      frases: acompanhar(ACORDES_LUTA, [[0, 0, 3], [4, 7, 2], [8, 0, 3], [12, 7, 2]], [[2, 1.5], [6, 1.5], [10, 1.5], [14, 1.5]])
    },
    // 1: a caixa chega com o chocalho.
    {
      batidas: [
        { amostra: 'caixa', padrao: '..o.x.o...o.x.o.', ganho: 0.6 },
        { amostra: 'chocalho', padrao: 'xoxoxoxoxoxoxoxo', ganho: 0.3 }
      ],
      frases: []
    },
    // 2: o trompete puxa o canto; prato abre cada volta.
    {
      batidas: [{ amostra: 'prato', padrao: 'x...............', ganho: 0.4, compassos: [0, 4] }],
      frases: [{ instrumento: 'trompete', compassos: MELODIA_LUTA, ganho: 0.55 }]
    },
    // 3: a arquibancada canta junto, repique dobrando.
    {
      batidas: [{ amostra: 'repique', padrao: 'x.ox.ox.x.ox.oxo', ganho: 0.45 }],
      frases: [{ instrumento: 'coro', compassos: CORO_LUTA, ganho: 0.3 }]
    },
    // 4: tudo em cima. Rufo, bombo dobrado, agogô e o apito.
    {
      batidas: [
        { amostra: 'caixa-rufo', padrao: 'oooooooooooooooo', ganho: 0.25 },
        { amostra: 'bumbo-2', padrao: '......x.......x.', ganho: 0.8 },
        { amostra: 'agogo-agudo', padrao: 'x..x..x.....x...', ganho: 0.35 },
        { amostra: 'agogo-grave', padrao: '........x.x.....', ganho: 0.35 },
        { amostra: 'apito', padrao: 'x...x...x.x.x...', ganho: 0.3, compassos: [7] }
      ],
      frases: [
        {
          instrumento: 'baixo',
          ganho: 0.6,
          compassos: ACORDES_LUTA.map(({ raiz }) => [n(14, raiz + 12, 2)])
        }
      ]
    }
  ]
};

// ------------------------------------------------------------------ menu
// Samba de arquibancada em dó maior: C, A7, Dm, G7.

const ACORDES_MENU: Acorde[] = [
  { raiz: 36, notas: [60, 64, 67] },
  { raiz: 33, notas: [57, 61, 64, 67] },
  { raiz: 38, notas: [57, 62, 65] },
  { raiz: 31, notas: [55, 59, 62, 65] }
];

const MELODIA_MENU: Nota[][] = [
  [n(0, 76, 2), n(2, 79, 2), n(4, 76, 4), n(8, 72, 2), n(10, 74, 2), n(12, 76, 4)],
  [n(0, 73, 2), n(2, 76, 2), n(4, 81, 4), n(8, 79, 2), n(10, 76, 2), n(12, 73, 4)],
  [n(0, 74, 2), n(2, 77, 2), n(4, 81, 4), n(8, 77, 2), n(10, 76, 2), n(12, 74, 4)],
  [n(0, 71, 2), n(2, 74, 2), n(4, 77, 2), n(6, 76, 2), n(8, 74, 4), n(12, 67, 4)],
  [n(0, 79, 4), n(4, 76, 4), n(8, 72, 4), n(12, 76, 4)],
  [n(0, 81, 4), n(4, 79, 2), n(6, 76, 2), n(8, 73, 4), n(12, 69, 4)],
  [n(0, 77, 4), n(4, 76, 2), n(6, 74, 2), n(8, 69, 4), n(12, 74, 4)],
  [n(0, 74, 2), n(2, 76, 2), n(4, 77, 2), n(6, 74, 2), n(8, 71, 4), n(12, 67, 4)]
];

export const TEMA_MENU: Tema = {
  id: 'menu',
  bpm: [104, 104],
  tensaoFixa: 1,
  camadas: [
    // 0: a bateria. Surdo de resposta no 1, de primeira no 2; caixa, chocalho, tamborim.
    {
      batidas: [
        { amostra: 'bumbo-2', padrao: 'x.......x.......', ganho: 0.7 },
        { amostra: 'bumbo', padrao: '....x.......x...' },
        { amostra: 'caixa', padrao: 'xooxoxooxooxoxox', ganho: 0.35 },
        { amostra: 'chocalho', padrao: 'xoxoxoxoxoxoxoxo', ganho: 0.3 },
        { amostra: 'tamborim', padrao: 'x.xx.x.xx.xx.x.x', ganho: 0.4 }
      ],
      frases: acompanhar(ACORDES_MENU, [[0, 0, 3], [6, 7, 2], [8, 0, 3], [12, 7, 1], [14, 12, 2]], [[0, 1], [3, 1], [6, 1], [10, 1], [12, 1]])
    },
    // 1: agogô, cuíca e repique.
    {
      batidas: [
        { amostra: 'agogo-agudo', padrao: 'x..x..x.........', ganho: 0.3 },
        { amostra: 'agogo-grave', padrao: '........x.x.x...', ganho: 0.3 },
        { amostra: 'cuica-aguda', padrao: '......x.......x.', ganho: 0.35 },
        { amostra: 'cuica-grave', padrao: '.......x.......x', ganho: 0.35 },
        { amostra: 'repique', padrao: 'x.......x..x.x..', ganho: 0.35 }
      ],
      frases: []
    },
    // 2: trompete, coro e o apito do mestre chamando a volta.
    {
      batidas: [
        { amostra: 'prato', padrao: 'x...............', ganho: 0.35, compassos: [0] },
        { amostra: 'apito', padrao: 'x.x.x...........', ganho: 0.3, compassos: [7] }
      ],
      frases: [
        { instrumento: 'trompete', compassos: MELODIA_MENU, ganho: 0.5 },
        { instrumento: 'coro', compassos: coroDaMelodia(MELODIA_MENU), ganho: 0.28 }
      ]
    }
  ]
};

export const TEMAS = { menu: TEMA_MENU, luta: TEMA_LUTA } as const;
