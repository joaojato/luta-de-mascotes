/**
 * Quem a CPU escolhe no tutorial (João, 03/11/2026): o clássico declarado no
 * JSON (`rival`), senão alguém do mesmo estado, senão da mesma região do
 * Brasil, senão sorteio. Nunca o mesmo mascote do jogador.
 */

export type Regiao = 'norte' | 'nordeste' | 'centro-oeste' | 'sudeste' | 'sul';

/** Dado do país, não do mascote: cada UF na sua região. */
const REGIOES: Record<Regiao, string[]> = {
  norte: ['AC', 'AP', 'AM', 'PA', 'RO', 'RR', 'TO'],
  nordeste: ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'],
  'centro-oeste': ['DF', 'GO', 'MT', 'MS'],
  sudeste: ['ES', 'MG', 'RJ', 'SP'],
  sul: ['PR', 'RS', 'SC']
};

export const UFS: readonly string[] = Object.values(REGIOES).flat();

export function regiaoDe(uf: string | undefined): Regiao | null {
  const achada = (Object.keys(REGIOES) as Regiao[]).find((regiao) => uf !== undefined && REGIOES[regiao].includes(uf));
  return achada ?? null;
}

export interface OrigemDoLutador {
  id: string;
  estado?: string;
  rival?: string;
}

/**
 * @param jogador - Id do mascote do jogador.
 * @param elenco - Quem pode ser escolhido (a seleção), com estado e rival do JSON.
 * @param aleatorio - Sorteio entre os empatados, de 0 a 1.
 */
export function escolherRival(jogador: string, elenco: OrigemDoLutador[], aleatorio: () => number = Math.random): string {
  const eu = elenco.find(({ id }) => id === jogador);
  const outros = elenco.filter(({ id }) => id !== jogador);
  const sortear = (lista: OrigemDoLutador[]) => lista[Math.min(lista.length - 1, Math.floor(aleatorio() * lista.length))].id;

  const classico = outros.find(({ id }) => id === eu?.rival);
  if (classico) return classico.id;

  const mesmoEstado = outros.filter(({ estado }) => estado !== undefined && estado === eu?.estado);
  if (mesmoEstado.length > 0) return sortear(mesmoEstado);

  const regiao = regiaoDe(eu?.estado);
  const mesmaRegiao = outros.filter(({ estado }) => regiao !== null && regiaoDe(estado) === regiao);
  if (mesmaRegiao.length > 0) return sortear(mesmaRegiao);

  return outros.length > 0 ? sortear(outros) : jogador;
}
