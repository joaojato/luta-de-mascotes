/**
 * Catálogo de golpes (GDD, "Golpes"): o mesmo esqueleto para todo mascote.
 * Cada golpe diz qual sheet procura e qual sheet serve de quebra-galho
 * enquanto a própria não existe. A Academia usa isto para mostrar o que cada
 * mascote tem e o que falta desenhar; o motor resolve as mesmas sheets.
 */
import type { CharacterDefinition } from './hero';

export type GolpeId =
  | 'soco-rapido'
  | 'soco-forte'
  | 'chute-basico'
  | 'chute-baixo'
  | 'soco-no-ar'
  | 'voadora'
  | 'especial';

export interface Golpe {
  id: GolpeId;
  nome: string;
  /** Como sai: botão (e situação). */
  comando: string;
  /** Sheets que valem como "tem", em ordem de preferência. */
  acoes: string[];
  /** Sheets usadas no lugar enquanto a própria falta. */
  quebraGalho: string[];
  regra: string;
}

export const GOLPES: Golpe[] = [
  {
    id: 'soco-rapido',
    nome: 'Rápido',
    comando: 'Rápido',
    acoes: ['light-punch'],
    quebraGalho: [],
    regra: 'emenda outro Rápido só se encostou; agachado passa por baixo'
  },
  {
    id: 'soco-forte',
    nome: 'Rápido Forte',
    comando: 'Agachar + Rápido',
    acoes: ['heavy-punch'],
    quebraGalho: ['heavy-kick'],
    regra: 'lento; quebra a defesa alta (atordoa 0,3 s); aguenta Rápido'
  },
  {
    id: 'chute-basico',
    nome: 'Bruto',
    comando: 'Bruto',
    acoes: ['heavy-kick'],
    quebraGalho: ['heavy-punch'],
    regra: 'dano médio; qualquer guarda segura'
  },
  {
    id: 'chute-baixo',
    nome: 'Bruto Baixo',
    comando: 'Agachar + Bruto',
    acoes: ['low-kick'],
    quebraGalho: ['heavy-kick', 'heavy-punch'],
    regra: 'interrompe o Rápido Forte; quebra a defesa alta (atordoa 0,3 s)'
  },
  {
    id: 'soco-no-ar',
    nome: 'Rápido Aéreo',
    comando: 'Rápido, no ar',
    acoes: ['jump-punch'],
    quebraGalho: ['light-punch'],
    regra: 'um golpe por pulo'
  },
  {
    id: 'voadora',
    nome: 'Bruto de Cima',
    comando: 'Bruto, no ar',
    acoes: ['jump-kick'],
    quebraGalho: ['heavy-kick', 'heavy-punch'],
    regra: 'mergulho em diagonal; único que quebra a defesa baixa (atordoa 0,6 s)'
  },
  {
    id: 'especial',
    nome: 'Especial',
    comando: 'Especial, barra cheia',
    acoes: ['special'],
    quebraGalho: [],
    regra: 'próprio de cada mascote'
  }
];

export type SituacaoGolpe = 'tem' | 'quebra-galho' | 'faltando';

export interface GolpeDoLutador {
  golpe: Golpe;
  situacao: SituacaoGolpe;
  /** Sheet que o jogo usa hoje (a própria ou o quebra-galho). */
  acao: string | null;
}

/**
 * O que um lutador tem de cada golpe do catálogo.
 * @param character - Lutador já montado a partir do JSON.
 */
export function golpesDoLutador(character: CharacterDefinition): GolpeDoLutador[] {
  const existe = (acao: string) => character.animations.some((animation) => animation.action === acao);

  return GOLPES.map((golpe) => {
    // O JSON pode trocar a sheet do soco forte ou do chute (o tiro do Almirante sai do chute).
    const doJson =
      golpe.id === 'soco-forte' ? character.moves?.heavy?.action
        : golpe.id === 'chute-basico' ? character.moves?.kick?.action
          : golpe.id === 'chute-baixo' ? character.moves?.lowKick?.action
          : undefined;
    const propria = [doJson, ...golpe.acoes].find((acao): acao is string => acao !== undefined && existe(acao));
    if (propria) {
      return { golpe, situacao: 'tem', acao: propria };
    }
    const substituta = golpe.quebraGalho.find(existe);
    return substituta
      ? { golpe, situacao: 'quebra-galho', acao: substituta }
      : { golpe, situacao: 'faltando', acao: null };
  });
}

export type AnimacaoDaAcademia = Omit<Golpe, 'id'> & { id: GolpeId | 'entrance' };
const INTRO_DA_ACADEMIA: AnimacaoDaAcademia = {
  id: 'entrance', nome: 'Intro', comando: 'Início da luta',
  acoes: ['entrance'], quebraGalho: [],
  regra: 'Entrada própria do mascote, antes de liberar o combate.'
};

/** Inventário de arte: intro não é golpe e nunca usa idle como substituta. */
export const ANIMACOES_DA_ACADEMIA: AnimacaoDaAcademia[] = [INTRO_DA_ACADEMIA, ...GOLPES];

export function animacoesDaAcademia(character: CharacterDefinition): {
  animacao: AnimacaoDaAcademia; situacao: SituacaoGolpe; acao: string | null; descricao: string
}[] {
  const descricao = (acao: string | null): string => character.animations.find(a => a.action === acao)?.label ?? '';
  const entrada = character.animations.find(a => a.action === 'entrance');
  return [
    { animacao: INTRO_DA_ACADEMIA, situacao: entrada ? 'tem' : 'faltando', acao: entrada?.action ?? null, descricao: entrada?.label ?? '' },
    ...golpesDoLutador(character).map(({golpe, situacao, acao}) => ({animacao: golpe, situacao, acao, descricao: descricao(acao)}))
  ];
}

/** Como o lutador está agora: decide qual golpe cada botão solta. */
export type EstadoDoLutador = 'pe' | 'abaixado' | 'ar';

export interface NomesDosBotoes {
  light: string;
  heavy: string;
  block: string;
  special: string;
}

/** Nomes dos comandos. Os nomes próprios do JSON descrevem o movimento,
 * mas não substituem estes nomes nos botões e nas instruções. */
export const NOMES_DOS_ATAQUES: Record<GolpeId, string> = {
  'soco-rapido': 'Rápido',
  'soco-forte': 'Rápido Forte',
  'chute-basico': 'Bruto',
  'chute-baixo': 'Bruto Baixo',
  'soco-no-ar': 'Rápido Aéreo',
  voadora: 'Bruto de Cima',
  especial: 'Especial'
};

/** Qual golpe cada botão de ataque solta em cada estado (fighter.ts, updateGrounded e updateAirborne). */
const GOLPE_DO_BOTAO: Record<EstadoDoLutador, { light: GolpeId; heavy: GolpeId }> = {
  pe: { light: 'soco-rapido', heavy: 'chute-basico' },
  abaixado: { light: 'soco-forte', heavy: 'chute-baixo' },
  ar: { light: 'soco-no-ar', heavy: 'voadora' }
};

/**
 * Nome próprio do movimento, para descrever sua animação; não é o nome do botão.
 * @param nomes - O campo `nomes` do JSON do lutador (pode faltar).
 * @param id - O golpe.
 */
export function nomeDoGolpe(nomes: Partial<Record<GolpeId, string>> | undefined, id: GolpeId): string {
  return nomes?.[id] ?? NOMES_DOS_ATAQUES[id];
}

/** O que a pausa lê do JSON do lutador para listar os golpes. */
export interface LutadorDaPausa {
  actions: { action: string; label?: string }[];
  moves?: { heavy?: { action?: string }; kick?: { action?: string }; lowKick?: { action?: string }; special?: { action?: string } };
}

/**
 * Os golpes do mascote na pausa, com o nome da sheet que o motor toca de
 * verdade: a do JSON, a própria do catálogo ou o quebra-galho. O Almirante
 * não tem `low-kick` e o baixo + chute dele é o chute forte; antes a linha
 * sumia e ele parecia não ter chute (João, 04/11/2026).
 * @param lutador - O JSON do mascote.
 */
export function golpesNaPausa(lutador: LutadorDaPausa): string[] {
  const label = (acao: string | undefined) => lutador.actions.find((a) => a.action === acao)?.label;
  const existe = (acao: string | undefined) => acao !== undefined && lutador.actions.some((a) => a.action === acao);
  const doCatalogo = (id: GolpeId, doJson?: string): string | undefined => {
    const golpe = GOLPES.find((g) => g.id === id)!;
    return label([doJson, ...golpe.acoes, ...golpe.quebraGalho].find(existe));
  };
  const { moves } = lutador;
  const linhas: [string, string | undefined][] = [
    [NOMES_DOS_ATAQUES['soco-rapido'], doCatalogo('soco-rapido')],
    [NOMES_DOS_ATAQUES['soco-forte'], doCatalogo('soco-forte', moves?.heavy?.action)],
    [NOMES_DOS_ATAQUES['chute-basico'], doCatalogo('chute-basico', moves?.kick?.action)],
    [NOMES_DOS_ATAQUES['chute-baixo'], doCatalogo('chute-baixo', moves?.lowKick?.action)],
    [NOMES_DOS_ATAQUES['soco-no-ar'], doCatalogo('soco-no-ar')],
    [NOMES_DOS_ATAQUES.voadora, doCatalogo('voadora')],
    ['Especial', label(moves?.special?.action ?? 'special')]
  ];
  return linhas.filter(([, nome]) => nome).map(([botao, nome]) => `${botao}: ${nome}`);
}

/**
 * Nome do comando em cada postura; nomes próprios só personalizam o especial.
 * @param nomes - O campo `nomes` do JSON do lutador (pode faltar).
 * @param estado - De pé, abaixado ou no ar.
 */
export function nomesDosBotoes(nomes: Partial<Record<GolpeId, string>> | undefined, estado: EstadoDoLutador): NomesDosBotoes {
  const nome = (id: GolpeId): string => id === 'especial' ? nomeDoGolpe(nomes, id) : NOMES_DOS_ATAQUES[id];
  const { light, heavy } = GOLPE_DO_BOTAO[estado];
  return {
    light: nome(light),
    heavy: nome(heavy),
    block: estado === 'abaixado' ? 'Defesa baixa' : 'Defesa',
    special: nome('especial')
  };
}
