/**
 * Botões da luta, um mapa por lado do teclado. Remapeáveis na Academia (aba
 * Botões), guardados no navegador e lidos pela Luta ao começar.
 *
 * Tecla é guardada pelo nome do `Phaser.Input.Keyboard.KeyCodes` (ex. `A`,
 * `COMMA`, `LEFT`), que é o que `keyboard.addKey` aceita.
 */

export type Lado = 'p1' | 'p2';

export type ComandoLuta = 'left' | 'right' | 'jump' | 'crouch' | 'block' | 'light' | 'heavy' | 'special';

export const COMANDOS_LUTA: { id: ComandoLuta; nome: string }[] = [
  { id: 'left', nome: 'Esquerda' },
  { id: 'right', nome: 'Direita' },
  { id: 'jump', nome: 'Pular' },
  { id: 'crouch', nome: 'Agachar (baixo)' },
  { id: 'block', nome: 'Defender' },
  { id: 'light', nome: 'Soco' },
  { id: 'heavy', nome: 'Chute' },
  { id: 'special', nome: 'Especial' }
];

export type MapaBotoes = Record<ComandoLuta, string>;
export type Controles = Record<Lado, MapaBotoes>;

export const CONTROLES_PADRAO: Controles = {
  p1: { left: 'A', right: 'D', jump: 'W', crouch: 'S', block: 'C', light: 'E', heavy: 'Q', special: 'SPACE' },
  // Espelho do P1 na mão direita (ABNT2): O K L Ç andam, I P ; atacam, Shift
  // direito é o especial. O Ç é a SEMICOLON do navegador e o ; a FORWARD_SLASH.
  p2: {
    left: 'K',
    right: 'SEMICOLON',
    jump: 'O',
    crouch: 'L',
    block: 'FORWARD_SLASH',
    light: 'P',
    heavy: 'I',
    special: 'SHIFT'
  }
};

/**
 * Sozinho no teclado (contra a CPU, torneio, treino), o P1 ganha I O P como
 * opção da outra mão, além do Q E C: I chuta e P soca como no P2, e o O, que
 * aí não anda, defende.
 */
export const EXTRA_SOZINHO: Partial<MapaBotoes> = { heavy: 'I', block: 'O', light: 'P' };

/** As teclas extras do modo sozinho que não batem com nenhuma tecla do P1. */
export function extrasSozinho(p1: MapaBotoes): Partial<MapaBotoes> {
  const usadas = new Set(Object.values(p1));
  return Object.fromEntries(Object.entries(EXTRA_SOZINHO).filter(([, tecla]) => !usadas.has(tecla!))) as Partial<MapaBotoes>;
}

/** Teclas da própria tela (sair, revanche) que não podem virar botão de luta. */
export const TECLAS_RESERVADAS = ['ESC', 'BACKSPACE', 'R', 'ENTER', 'TAB'];

// v2: o P2 mudou das setas para O K L Ç; o mapa antigo não vale mais.
const CHAVE_STORAGE = 'luta-de-mascotes:controles-v2';

/** Junta o salvo com o padrão: comando faltando ou tecla inválida volta ao padrão. */
export function sanitizarControles(raw: unknown, teclasValidas: ReadonlySet<string>): Controles {
  const salvo = (raw ?? {}) as Partial<Record<Lado, Partial<MapaBotoes>>>;
  const lado = (qual: Lado): MapaBotoes =>
    Object.fromEntries(
      COMANDOS_LUTA.map(({ id }) => {
        const tecla = salvo[qual]?.[id];
        const valida = typeof tecla === 'string' && teclasValidas.has(tecla) && !TECLAS_RESERVADAS.includes(tecla);
        return [id, valida ? tecla : CONTROLES_PADRAO[qual][id]];
      })
    ) as MapaBotoes;

  return { p1: lado('p1'), p2: lado('p2') };
}

export function carregarControles(teclasValidas: ReadonlySet<string>, storage?: Storage): Controles {
  try {
    const raw = (storage ?? window.localStorage).getItem(CHAVE_STORAGE);
    return sanitizarControles(raw ? JSON.parse(raw) : null, teclasValidas);
  } catch {
    return sanitizarControles(null, teclasValidas);
  }
}

export function salvarControles(controles: Controles, storage?: Storage): void {
  try {
    (storage ?? window.localStorage).setItem(CHAVE_STORAGE, JSON.stringify(controles));
  } catch {
    // Sem armazenamento (aba anônima): o remapeamento vale só até recarregar.
  }
}

/**
 * Põe uma tecla num comando. Se a tecla já era de outro comando (de qualquer
 * lado), os dois trocam de tecla, para nunca haver um botão com dois donos.
 */
export function atribuirTecla(controles: Controles, lado: Lado, comando: ComandoLuta, tecla: string): Controles {
  const novo: Controles = { p1: { ...controles.p1 }, p2: { ...controles.p2 } };
  const anterior = novo[lado][comando];

  (['p1', 'p2'] as Lado[]).forEach((outroLado) => {
    COMANDOS_LUTA.forEach(({ id }) => {
      if (novo[outroLado][id] === tecla) {
        novo[outroLado][id] = anterior;
      }
    });
  });
  novo[lado][comando] = tecla;

  return novo;
}

const NOMES_TECLA: Record<string, string> = {
  LEFT: '←',
  RIGHT: '→',
  UP: '↑',
  DOWN: '↓',
  COMMA: ',',
  PERIOD: '.',
  // Nomes do teclado ABNT2, o do João.
  FORWARD_SLASH: ';',
  BACK_SLASH: '\\',
  SEMICOLON: 'Ç',
  QUOTES: "'",
  OPEN_BRACKET: '[',
  CLOSED_BRACKET: ']',
  MINUS: '-',
  PLUS: '=',
  SPACE: 'Espaço',
  SHIFT: 'Shift',
  CTRL: 'Ctrl',
  ALT: 'Alt'
};

/** Nome curto para mostrar na tela. */
export function nomeDaTecla(tecla: string): string {
  if (NOMES_TECLA[tecla]) {
    return NOMES_TECLA[tecla];
  }
  if (tecla.startsWith('NUMPAD_')) {
    return `Num ${tecla.slice(7).toLowerCase()}`;
  }
  return tecla.length === 1 ? tecla : tecla.charAt(0) + tecla.slice(1).toLowerCase();
}

/** Legenda curta de um lado na luta, com as teclas que valem agora (remapeadas ou padrão). */
export function legendaDosBotoes(botoes: MapaBotoes): string {
  const acoes: [ComandoLuta, string][] = [['light', 'soco'], ['heavy', 'chute'], ['block', 'defende'], ['special', 'especial']];
  return acoes.map(([id, verbo]) => `${nomeDaTecla(botoes[id])} ${verbo}`).join(' · ');
}
