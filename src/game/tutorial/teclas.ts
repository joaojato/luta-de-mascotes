import { nomeDaTecla, type ComandoLuta, type MapaBotoes } from '../controles';
import { NOMES_DOS_BOTOES, POSICOES_DO_BOTAO, type FuncaoDoBotao, type PreferenciasDosBotoes } from '../../toque/preferencias';

/**
 * As teclas dos textos do tutorial (João, 03/11/2026): sempre as que a pessoa
 * usa, remapeadas no teclado ou na cara e na função de cada botão do celular.
 * O roteiro escreve marcadores (`{soco}`) e isto troca na hora da fala.
 */

export type ContextoDasTeclas =
  | { toque: false; botoes: MapaBotoes; olhando: 1 | -1 }
  | { toque: true; preferencias: PreferenciasDosBotoes; olhando: 1 | -1 };

type Marcador = 'esquerda' | 'direita' | 'frente' | 'tras' | 'pular' | 'abaixar' | 'soco' | 'chute' | 'defesa' | 'especial';

const DIRECOES: Partial<Record<Marcador, ComandoLuta>> = { esquerda: 'left', direita: 'right', pular: 'jump', abaixar: 'crouch' };
const GOLPES: Partial<Record<Marcador, FuncaoDoBotao>> = { soco: 'light', chute: 'heavy', defesa: 'block', especial: 'special' };
const SETAS: Partial<Record<ComandoLuta, string>> = { left: '←', right: '→', jump: '↑', crouch: '↓' };

function comandoDo(marcador: Marcador, olhando: 1 | -1): ComandoLuta | undefined {
  if (marcador === 'frente') return olhando === 1 ? 'right' : 'left';
  if (marcador === 'tras') return olhando === 1 ? 'left' : 'right';
  return DIRECOES[marcador] ?? GOLPES[marcador];
}

/** O nome que aparece para um comando, entre aspas como no roteiro do João. */
function nomeDo(comando: ComandoLuta, contexto: ContextoDasTeclas): string {
  if (!contexto.toque) return `"${nomeDaTecla(contexto.botoes[comando])}"`;
  const seta = SETAS[comando];
  if (seta) return `"direcional ${seta}"`;
  const { cara, funcoes } = contexto.preferencias;
  const posicao = POSICOES_DO_BOTAO.find((p) => funcoes[p] === comando);
  return posicao ? `"${NOMES_DOS_BOTOES[cara][posicao]}"` : `"${comando}"`;
}

/**
 * @param texto - Fala ou item do checklist com `{marcador}`.
 * @param contexto - Teclado ou celular, e para onde o jogador olha agora.
 */
export function trocarMarcadores(texto: string, contexto: ContextoDasTeclas): string {
  return texto.replace(/\{(\w+)\}/g, (inteiro, nome: string) => {
    const comando = comandoDo(nome as Marcador, contexto.olhando);
    return comando ? nomeDo(comando, contexto) : inteiro;
  });
}
