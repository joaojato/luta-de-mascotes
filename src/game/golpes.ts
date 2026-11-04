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
    nome: 'Soco rápido',
    comando: 'Soco',
    acoes: ['light-punch'],
    quebraGalho: [],
    regra: 'emenda outro soco só se encostou; agachado passa por baixo'
  },
  {
    id: 'soco-forte',
    nome: 'Soco forte',
    comando: 'Baixo + Soco',
    acoes: ['heavy-punch'],
    quebraGalho: ['heavy-kick'],
    regra: 'lento; quebra a defesa alta (atordoa 0,3 s); aguenta soco rápido'
  },
  {
    id: 'chute-basico',
    nome: 'Chute básico',
    comando: 'Chute',
    acoes: ['heavy-kick'],
    quebraGalho: ['heavy-punch'],
    regra: 'dano médio; qualquer guarda segura'
  },
  {
    id: 'chute-baixo',
    nome: 'Chute baixo',
    comando: 'Baixo + Chute',
    acoes: ['low-kick'],
    quebraGalho: ['heavy-kick', 'heavy-punch'],
    regra: 'interrompe o soco forte; quebra a defesa alta (atordoa 0,3 s)'
  },
  {
    id: 'soco-no-ar',
    nome: 'Soco no ar',
    comando: 'Soco, no ar',
    acoes: ['jump-punch'],
    quebraGalho: ['light-punch'],
    regra: 'um golpe por pulo'
  },
  {
    id: 'voadora',
    nome: 'Voadora',
    comando: 'Chute, no ar',
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

/** Como o lutador está agora: decide qual golpe cada botão solta. */
export type EstadoDoLutador = 'pe' | 'abaixado' | 'ar';

export interface NomesDosBotoes {
  light: string;
  heavy: string;
  block: string;
  special: string;
}

/** Quando o JSON não tem `nomes`: o nome do catálogo, curto. */
const NOME_GENERICO: Record<GolpeId, string> = {
  'soco-rapido': 'Soco',
  'soco-forte': 'Soco forte',
  'chute-basico': 'Chute',
  'chute-baixo': 'Rasteira',
  'soco-no-ar': 'Soco aéreo',
  voadora: 'Voadora',
  especial: 'Especial'
};

/** Qual golpe cada botão de ataque solta em cada estado (fighter.ts, updateGrounded e updateAirborne). */
const GOLPE_DO_BOTAO: Record<EstadoDoLutador, { light: GolpeId; heavy: GolpeId }> = {
  pe: { light: 'soco-rapido', heavy: 'chute-basico' },
  abaixado: { light: 'soco-forte', heavy: 'chute-baixo' },
  ar: { light: 'soco-no-ar', heavy: 'voadora' }
};

/**
 * O nome curto de um golpe do mascote (o do botão do celular), ou o do catálogo.
 * @param nomes - O campo `nomes` do JSON do lutador (pode faltar).
 * @param id - O golpe.
 */
export function nomeDoGolpe(nomes: Partial<Record<GolpeId, string>> | undefined, id: GolpeId): string {
  return nomes?.[id] ?? NOME_GENERICO[id];
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
    ['Soco', doCatalogo('soco-rapido')],
    ['Baixo + Soco', doCatalogo('soco-forte', moves?.heavy?.action)],
    ['Chute', doCatalogo('chute-basico', moves?.kick?.action)],
    ['Baixo + Chute', doCatalogo('chute-baixo', moves?.lowKick?.action)],
    ['Especial', label(moves?.special?.action ?? 'special')]
  ];
  return linhas.filter(([, nome]) => nome).map(([botao, nome]) => `${botao}: ${nome}`);
}

/**
 * O nome do golpe que cada botão solta agora, para escrever no botão do celular.
 * @param nomes - O campo `nomes` do JSON do lutador (pode faltar).
 * @param estado - De pé, abaixado ou no ar.
 */
export function nomesDosBotoes(nomes: Partial<Record<GolpeId, string>> | undefined, estado: EstadoDoLutador): NomesDosBotoes {
  const nome = (id: GolpeId): string => nomeDoGolpe(nomes, id);
  const { light, heavy } = GOLPE_DO_BOTAO[estado];
  return {
    light: nome(light),
    heavy: nome(heavy),
    block: estado === 'abaixado' ? 'Defesa baixa' : 'Defesa',
    special: nome('especial')
  };
}
