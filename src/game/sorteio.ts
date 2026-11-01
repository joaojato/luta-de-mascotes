/**
 * Sorteios do jogo (lutador ?, times do torneio, chaveamento). O sorteador é
 * injetável para o teste repetir o mesmo resultado.
 */

/** Um índice em [0, total) fora de `excluir`. */
export function sortearIndice(total: number, excluir: number[], aleatorio: () => number = Math.random): number {
  const livres = Array.from({ length: total }, (_, i) => i).filter((i) => !excluir.includes(i));
  return livres[Math.min(livres.length - 1, Math.floor(aleatorio() * livres.length))];
}

/** Cópia embaralhada (Fisher-Yates); a lista original não muda. */
export function embaralhar<T>(lista: T[], aleatorio: () => number = Math.random): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.min(i, Math.floor(aleatorio() * (i + 1)));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}
