import { FIGHTER_CHARACTER_DEFINITIONS } from './hero';
import { LUTADORES } from './lutadores';

// Regra do JSON: quem entra na seleção e nos torneios é decidido no JSON do
// lutador (`selecionavel`), nunca por lista de ids aqui.
export const ELENCO_SELECIONAVEL = FIGHTER_CHARACTER_DEFINITIONS.filter(
  (character) => LUTADORES.find((lutador) => lutador.id === character.id)?.selecionavel !== false
);

export const IDS_SELECIONAVEIS = ELENCO_SELECIONAVEL.map((character) => character.id);
