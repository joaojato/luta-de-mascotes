import { extrasSozinho, nomeDaTecla, type ComandoLuta, type MapaBotoes } from '../controles';
import { nomeDoGolpe, type GolpeId } from '../golpes';
import { NOMES_DOS_BOTOES, POSICOES_DO_BOTAO, type FuncaoDoBotao, type PreferenciasDosBotoes } from '../../toque/preferencias';

/**
 * As teclas dos textos do tutorial (João, 03/11/2026): sempre as que a pessoa
 * usa, remapeadas no teclado ou na cara e na função de cada botão do celular.
 * O roteiro escreve marcadores (`{soco}`) e isto troca na hora da fala.
 */

/** Os nomes curtos dos golpes do mascote (`nomes` do JSON), para `{golpe:soco-rapido}`. */
type NomesDosGolpes = Partial<Record<GolpeId, string>>;

export type ContextoDasTeclas =
  | { toque: false; botoes: MapaBotoes; olhando: 1 | -1; nomes?: NomesDosGolpes }
  | { toque: true; preferencias: PreferenciasDosBotoes; olhando: 1 | -1; nomes?: NomesDosGolpes };

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

/** O que cada tecla extra faz, na ordem da fala: I, O, P (João, 04/11/2026). */
const DUAS_MAOS: { comando: 'light' | 'heavy' | 'block'; nome: string }[] = [
  { comando: 'heavy', nome: 'chute' },
  { comando: 'light', nome: 'soco' },
  { comando: 'block', nome: 'bloqueio' }
];

/**
 * As teclas da outra mão de quem joga sozinho, cada uma igual à do P1:
 * `"I" = "Q" (chute), "O" = "E" (soco) e "P" = "C" (bloqueio)`. A que bate
 * com uma tecla remapeada do P1 não existe e sai da frase.
 * @param botoes - As teclas do P1.
 */
export function textoDasDuasMaos(botoes: MapaBotoes): string {
  const extras = extrasSozinho(botoes);
  const partes = DUAS_MAOS.filter(({ comando }) => extras[comando]).map(
    ({ comando, nome }) => `"${nomeDaTecla(extras[comando]!)}" = "${nomeDaTecla(botoes[comando])}" (${nome})`
  );
  return partes.length > 1 ? `${partes.slice(0, -1).join(', ')} e ${partes[partes.length - 1]}` : (partes[0] ?? '');
}

/**
 * @param texto - Fala ou item do checklist com `{marcador}`.
 * @param contexto - Teclado ou celular, e para onde o jogador olha agora.
 */
export function trocarMarcadores(texto: string, contexto: ContextoDasTeclas): string {
  return texto.replace(/\{([\w:-]+)\}/g, (inteiro, nome: string) => {
    if (nome === 'duasMaos') return contexto.toque ? '' : textoDasDuasMaos(contexto.botoes);
    // O menu da luta: Esc no teclado, o botão de menu no celular.
    if (nome === 'menu') return contexto.toque ? 'o botão de menu' : `"${nomeDaTecla('ESC')}"`;
    if (nome.startsWith('golpe:')) return nomeDoGolpe(contexto.nomes, nome.slice(6) as GolpeId);
    const comando = comandoDo(nome as Marcador, contexto.olhando);
    return comando ? nomeDo(comando, contexto) : inteiro;
  });
}
