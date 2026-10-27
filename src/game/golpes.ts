/**
 * Catálogo de golpes (GDD, "Golpes"): o mesmo esqueleto para todo mascote.
 * Cada golpe diz qual sheet procura e qual sheet serve de quebra-galho
 * enquanto a própria não existe. A Academia usa isto para mostrar o que cada
 * mascote tem e o que falta desenhar; o motor resolve as mesmas sheets.
 */
import type { CharacterDefinition } from './hero';

export type GolpeId = 'soco-rapido' | 'golpe-forte' | 'chute-baixo' | 'soco-no-ar' | 'voadora' | 'especial';

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
    regra: 'emenda outro soco; agachado passa por baixo'
  },
  {
    id: 'golpe-forte',
    nome: 'Golpe forte',
    comando: 'Forte',
    acoes: ['heavy-kick', 'heavy-punch'],
    quebraGalho: [],
    regra: 'lento; quebra a defesa baixa; aguenta soco rápido'
  },
  {
    id: 'chute-baixo',
    nome: 'Chute baixo',
    comando: 'Chute baixo',
    acoes: ['low-kick'],
    quebraGalho: [],
    regra: 'interrompe o golpe forte'
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
    comando: 'Forte, no ar',
    acoes: ['jump-kick'],
    quebraGalho: ['heavy-kick', 'heavy-punch'],
    regra: 'mergulho em diagonal; quebra a defesa alta'
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
    // O JSON pode trocar a sheet do Forte (o tiro do Almirante sai do soco forte).
    const doJson = golpe.id === 'golpe-forte' ? character.moves?.heavy?.action : undefined;
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
