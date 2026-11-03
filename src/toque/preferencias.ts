/**
 * Como os botões de luta aparecem no celular (docs/mobile.md): cara de Xbox
 * (padrão) ou de PlayStation, o nome do golpe escrito ou não, a opacidade
 * dos controles (para ver a luta por trás) e o golpe de cada botão. Guardado
 * no aparelho, como o arranjo dos botões.
 */

export type Cara = 'xbox' | 'playstation';

/** Os quatro botões de luta pelo lugar no losango. */
export type PosicaoDoBotao = 'cima' | 'direita' | 'baixo' | 'esquerda';

export const POSICOES_DO_BOTAO: readonly PosicaoDoBotao[] = ['cima', 'direita', 'baixo', 'esquerda'];

/** O que um botão de luta do celular pode fazer: só os golpes (andar, pular e agachar são do direcional). */
export type FuncaoDoBotao = 'light' | 'heavy' | 'block' | 'special';

export const FUNCOES_DO_BOTAO: { id: FuncaoDoBotao; nome: string }[] = [
  { id: 'light', nome: 'Soco' },
  { id: 'heavy', nome: 'Chute' },
  { id: 'block', nome: 'Defender' },
  { id: 'special', nome: 'Especial' }
];

export type FuncoesDosBotoes = Record<PosicaoDoBotao, FuncaoDoBotao>;

/** O losango de fábrica, igual nas duas caras (docs/mobile.md). */
export const FUNCOES_PADRAO: FuncoesDosBotoes = { cima: 'special', direita: 'block', baixo: 'light', esquerda: 'heavy' };

export interface PreferenciasDosBotoes {
  cara: Cara;
  nomes: boolean;
  /** De 0 a 1; um dos degraus de {@link OPACIDADES}. */
  opacidade: number;
  /** O golpe de cada botão (João, 03/11/2026: remapear dentro do que o celular tem). */
  funcoes: FuncoesDosBotoes;
}

/**
 * Passa o botão para o próximo golpe da lista. Quem tinha esse golpe fica com
 * o antigo deste: nunca dois botões com o mesmo golpe nem golpe sem botão.
 */
export function trocarFuncao(funcoes: FuncoesDosBotoes, posicao: PosicaoDoBotao): FuncoesDosBotoes {
  const atual = funcoes[posicao];
  const i = FUNCOES_DO_BOTAO.findIndex(({ id }) => id === atual);
  const proxima = FUNCOES_DO_BOTAO[(i + 1) % FUNCOES_DO_BOTAO.length].id;
  const dono = POSICOES_DO_BOTAO.find((outra) => funcoes[outra] === proxima)!;
  return { ...funcoes, [dono]: atual, [posicao]: proxima };
}

/** Só vale um losango com os quatro golpes, um em cada botão; senão, o de fábrica. */
function lerFuncoes(salvo: unknown): FuncoesDosBotoes {
  const obj = typeof salvo === 'object' && salvo !== null ? (salvo as Record<string, unknown>) : {};
  const valores = POSICOES_DO_BOTAO.map((posicao) => obj[posicao]);
  const completo = FUNCOES_DO_BOTAO.every(({ id }) => valores.includes(id));
  return completo ? (Object.fromEntries(POSICOES_DO_BOTAO.map((p) => [p, obj[p]])) as FuncoesDosBotoes) : { ...FUNCOES_PADRAO };
}

/** Os degraus que o item do menu percorre, do mais forte ao mais apagado. */
export const OPACIDADES = [1, 0.75, 0.5, 0.3] as const;

export const PREFERENCIAS_PADRAO: PreferenciasDosBotoes = { cara: 'xbox', nomes: false, opacidade: 1, funcoes: FUNCOES_PADRAO };

/** O próximo degrau de opacidade (depois do mais apagado, volta ao cheio). */
export function proximaOpacidade(atual: number): number {
  const i = OPACIDADES.findIndex((degrau) => degrau === atual);
  return OPACIDADES[(i + 1) % OPACIDADES.length];
}

const CHAVE = 'luta-de-mascotes:toque-botoes';

/** Campo com lixo volta ao padrão, campo a campo. */
export function lerPreferencias(salvo: unknown): PreferenciasDosBotoes {
  const obj = typeof salvo === 'object' && salvo !== null ? (salvo as Record<string, unknown>) : {};
  return {
    cara: obj.cara === 'playstation' || obj.cara === 'xbox' ? obj.cara : PREFERENCIAS_PADRAO.cara,
    nomes: typeof obj.nomes === 'boolean' ? obj.nomes : PREFERENCIAS_PADRAO.nomes,
    opacidade: OPACIDADES.some((degrau) => degrau === obj.opacidade) ? (obj.opacidade as number) : PREFERENCIAS_PADRAO.opacidade,
    funcoes: lerFuncoes(obj.funcoes)
  };
}

export function carregarPreferencias(storage?: Storage): PreferenciasDosBotoes {
  try {
    const texto = (storage ?? window.localStorage).getItem(CHAVE);
    return lerPreferencias(texto ? JSON.parse(texto) : null);
  } catch {
    return { ...PREFERENCIAS_PADRAO, funcoes: { ...FUNCOES_PADRAO } };
  }
}

export function salvarPreferencias(preferencias: PreferenciasDosBotoes, storage?: Storage): void {
  try {
    (storage ?? window.localStorage).setItem(CHAVE, JSON.stringify(preferencias));
  } catch {
    // Aba anônima: vale até recarregar.
  }
}
