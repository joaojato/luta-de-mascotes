/**
 * O que a Luta conta aos botões da tela (docs/mobile.md): o nome do golpe que
 * cada botão solta agora e se o especial pode sair. Sem luta (menus, fim da
 * partida), `null`: aí o botão de baixo confirma e o da direita volta.
 */
import type { NomesDosBotoes } from '../game/golpes';

export interface LutaNaTela {
  nomes: NomesDosBotoes;
  especialPronto: boolean;
}

let atual: LutaNaTela | null = null;
let chave = 'null';
const ouvintes = new Set<(luta: LutaNaTela | null) => void>();

/** Chamada todo quadro pela Luta; só avisa quando algo mudou. */
export function publicarLuta(luta: LutaNaTela | null): void {
  const nova = JSON.stringify(luta);
  if (nova === chave) return;
  chave = nova;
  atual = luta;
  ouvintes.forEach((ouvinte) => ouvinte(luta));
}

export function lutaNaTela(): LutaNaTela | null {
  return atual;
}

export function aoMudarLuta(ouvinte: (luta: LutaNaTela | null) => void): () => void {
  ouvintes.add(ouvinte);
  return () => ouvintes.delete(ouvinte);
}
