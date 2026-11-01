/**
 * O que a luta mostra a mais, ligado no painel lateral da Academia e do
 * treino: os pontos dentro da barra de vida (`150/150`) e o número de dano
 * de cada golpe perto de quem apanhou. Os dois desligados por padrão, salvos
 * no navegador, e a luta escuta a mudança na hora.
 */

export interface Exibicao {
  pontosNaVida: boolean;
  danoDosGolpes: boolean;
}

export const EXIBICAO_PADRAO: Exibicao = { pontosNaVida: false, danoDosGolpes: false };

const CHAVE = 'luta-de-mascotes:exibicao';

/** Campo que não for sim ou não volta ao padrão. */
export function lerExibicao(salvo: unknown): Exibicao {
  const obj = typeof salvo === 'object' && salvo !== null ? (salvo as Record<string, unknown>) : {};
  const sim = (campo: keyof Exibicao): boolean => (typeof obj[campo] === 'boolean' ? (obj[campo] as boolean) : EXIBICAO_PADRAO[campo]);
  return { pontosNaVida: sim('pontosNaVida'), danoDosGolpes: sim('danoDosGolpes') };
}

let atual: Exibicao | null = null;
const ouvintes = new Set<(exibicao: Exibicao) => void>();

export function exibicao(): Exibicao {
  if (!atual) {
    try {
      const texto = window.localStorage.getItem(CHAVE);
      atual = lerExibicao(texto ? JSON.parse(texto) : null);
    } catch {
      atual = { ...EXIBICAO_PADRAO };
    }
  }
  return atual;
}

export function mudarExibicao(mudanca: Partial<Exibicao>): Exibicao {
  atual = { ...exibicao(), ...mudanca };
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(atual));
  } catch {
    // Aba anônima: vale até recarregar.
  }
  ouvintes.forEach((ouvinte) => ouvinte(atual!));
  return atual;
}

export function aoMudarExibicao(ouvinte: (exibicao: Exibicao) => void): () => void {
  ouvintes.add(ouvinte);
  return () => ouvintes.delete(ouvinte);
}
