import type { CharacterDefinition } from '../hero';
import { buildFighterCharacter, type FighterActionSpec } from '../fighterCharacter';
import type { FighterCombat, FighterStats } from '../types';

import redBrawler from './red-brawler.json';
import greenBoxer from './green-boxer.json';
import jiujitsuFighter from './jiujitsu-fighter.json';

/**
 * Regra do JSON: lutador é dado, não classe. Um arquivo por mascote aqui
 * dentro, com as ações (sheet, quadros, fps, boxes) e os ajustes de stats e
 * combate. O motor nunca conhece um mascote pelo nome.
 */
export interface LutadorJson {
  id: string;
  label: string;
  /** Pasta pública das sheets, ex. `/assets/lutadores/urubu`. */
  assetRoot: string;
  anchorUsage?: string;
  /** Sobrescreve `DEFAULT_FIGHTER_STATS` só nos campos presentes. */
  stats?: Partial<FighterStats>;
  /** Sobrescreve `DEFAULT_FIGHTER_COMBAT` só nos campos presentes. */
  combat?: Partial<FighterCombat>;
  actions: FighterActionSpec[];
}

/** Ordem de registro = ordem na seleção. O primeiro é o padrão dos debugs. */
export const LUTADORES: LutadorJson[] = [redBrawler, greenBoxer, jiujitsuFighter];

export const LUTADOR_CHARACTERS: CharacterDefinition[] = LUTADORES.map(buildLutador);

export const LUTADOR_STAT_OVERRIDES: Record<string, Partial<FighterStats>> = Object.fromEntries(
  LUTADORES.map((lutador) => [lutador.id, lutador.stats ?? {}])
);

export const LUTADOR_COMBAT_OVERRIDES: Record<string, Partial<FighterCombat>> = Object.fromEntries(
  LUTADORES.map((lutador) => [lutador.id, lutador.combat ?? {}])
);

/**
 * Monta a definição completa de um lutador a partir do JSON.
 * @param lutador - O JSON já importado.
 */
export function buildLutador(lutador: LutadorJson): CharacterDefinition {
  return buildFighterCharacter({
    id: lutador.id,
    label: lutador.label,
    assetRoot: lutador.assetRoot,
    anchorUsage: lutador.anchorUsage ?? `${lutador.label.toLowerCase()} west-facing anchor`,
    actions: lutador.actions
  });
}
