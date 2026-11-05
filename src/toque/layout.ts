/**
 * Onde fica cada controle de toque e de que tamanho (docs/mobile.md). A parte
 * pura, sem DOM: a camada (telaToque.ts) só mede a tela e pinta.
 *
 * Posição e tamanho são guardados em fração da tela, não em pixel: o mesmo
 * arranjo serve com e sem a barra do navegador, e depois de girar o aparelho.
 */

/** Os quatro botões de luta pelo lugar no losango; a cara (Xbox ou PlayStation) muda por cima. */
export type IdControle = 'menu' | 'direcional' | 'cima' | 'direita' | 'baixo' | 'esquerda';

export const IDS_CONTROLE: readonly IdControle[] = ['menu', 'direcional', 'cima', 'direita', 'baixo', 'esquerda'];

/** Centro em fração da largura (`x`) e da altura (`y`); `tamanho` em fração da altura. */
export interface Posicao {
  x: number;
  y: number;
  tamanho: number;
}

export type Layout = Record<IdControle, Posicao>;

/** A área da camada, em pixels de CSS, e as bordas que o notch e a barra de início comem. */
export interface Tela {
  largura: number;
  altura: number;
  seguro: { topo: number; direita: number; baixo: number; esquerda: number };
}

export interface Caixa {
  esquerda: number;
  topo: number;
  lado: number;
}

const TAMANHO_MINIMO = 0.07;
const TAMANHO_MAXIMO = 0.6;

const limitar = (valor: number, minimo: number, maximo: number): number => Math.min(maximo, Math.max(minimo, valor));

/**
 * O arranjo de fábrica: menu no canto de cima à esquerda, direcional embaixo
 * à esquerda, e à direita o losango de quatro botões, como num controle.
 */
export function layoutPadrao(tela: Tela,_proporcaoJogo=16/9): Layout {
  const { largura: w, altura: h, seguro } = tela;
  const emFracao = (cx: number, cy: number, lado: number): Posicao => ({ x: cx / w, y: cy / h, tamanho: lado / h });

  if(h>w){
    const util=w-seguro.esquerda-seguro.direita;
    const metade=seguro.topo+(h-seguro.topo-seguro.baixo)/2;
    const inicio=metade+16;
    const fim=h-seguro.baixo-12;
    const disponivel=Math.max(0,fim-inicio);
    const direcional=Math.min(util*.39,disponivel*.65,172);
    const losango=Math.min(util*.44,disponivel*.75,200);
    const botao=losango*.32,braco=losango*.35;
    const cy=inicio+disponivel*.52;
    const lx=w-seguro.direita-12-losango/2;
    return {
      menu:emFracao(seguro.esquerda+26,seguro.topo+26,36),
      direcional:emFracao(seguro.esquerda+12+direcional/2,cy,direcional),
      cima:emFracao(lx,cy-braco,botao),direita:emFracao(lx+braco,cy,botao),
      baixo:emFracao(lx,cy+braco,botao),esquerda:emFracao(lx-braco,cy,botao)
    };
  }

  const menu = 40;
  const direcional = Math.min(h * 0.5, 190);
  const losango = Math.min(h * 0.5, 220);
  const botao = losango * 0.4;
  const braco = losango * 0.42;
  const lx = w - seguro.direita - 12 - losango * .62;
  const ly = h - seguro.baixo - 8 - losango * .62;

  return {
    menu: emFracao(seguro.esquerda + 10 + menu / 2, seguro.topo + 10 + menu / 2, menu),
    direcional: emFracao(seguro.esquerda + 16 + direcional / 2, h - seguro.baixo - 12 - direcional / 2, direcional),
    cima: emFracao(lx, ly - braco, botao),
    direita: emFracao(lx + braco, ly, botao),
    baixo: emFracao(lx, ly + braco, botao),
    esquerda: emFracao(lx - braco, ly, botao)
  };
}

/** Inclui a caixa de toque inteira e uma folga; nao apenas o circulo pintado. */
export function layoutSemSobreposicao(layout:Layout,tela:Tela,_proporcao=16/9):boolean {
  const caixas=IDS_CONTROLE.map(id=>({id,...caixaEmPixels(layout[id],tela)}));
  for(const c of caixas){
    if(c.esquerda<tela.seguro.esquerda || c.topo<tela.seguro.topo || c.esquerda+c.lado>tela.largura-tela.seguro.direita+.01 || c.topo+c.lado>tela.altura-tela.seguro.baixo+.01)return false;
    if(c.id!=='menu' && tela.altura>tela.largura && c.topo<tela.seguro.topo+(tela.altura-tela.seguro.topo-tela.seguro.baixo)/2+8)return false;
  }
  for(let i=0;i<caixas.length;i++)for(let j=i+1;j<caixas.length;j++){
    const a=caixas[i],b=caixas[j];
    if(!(a.esquerda+a.lado+2<=b.esquerda || b.esquerda+b.lado+2<=a.esquerda || a.topo+a.lado+2<=b.topo || b.topo+b.lado+2<=a.topo))return false;
  }
  return true;
}

/** A caixa em pixels, sempre inteira dentro da tela. */
export function caixaEmPixels(posicao: Posicao, tela: Tela): Caixa {
  const lado = Math.min(posicao.tamanho * tela.altura, tela.altura, tela.largura);
  const cx = limitar(posicao.x * tela.largura, lado / 2, tela.largura - lado / 2);
  const cy = limitar(posicao.y * tela.altura, lado / 2, tela.altura - lado / 2);
  return { esquerda: cx - lado / 2, topo: cy - lado / 2, lado };
}

/** Arrasta o controle `dx`, `dy` pixels a partir de `inicio`, sem deixar sair da tela. */
export function arrastar(inicio: Posicao, dx: number, dy: number, tela: Tela): Posicao {
  const lado = Math.min(inicio.tamanho * tela.altura, tela.altura, tela.largura);
  const cx = limitar(inicio.x * tela.largura + dx, lado / 2, tela.largura - lado / 2);
  const cy = limitar(inicio.y * tela.altura + dy, lado / 2, tela.altura - lado / 2);
  return { x: cx / tela.largura, y: cy / tela.altura, tamanho: inicio.tamanho };
}

/** Aumenta ou diminui pelo `fator`, dentro dos limites (nem sumir, nem cobrir a luta). */
export function redimensionar(posicao: Posicao, fator: number): Posicao {
  return { ...posicao, tamanho: limitar(posicao.tamanho * fator, TAMANHO_MINIMO, TAMANHO_MAXIMO) };
}

function posicaoValida(valor: unknown): valor is Posicao {
  if (typeof valor !== 'object' || valor === null) return false;
  const { x, y, tamanho } = valor as Record<string, unknown>;
  return [x, y, tamanho].every((n) => typeof n === 'number' && Number.isFinite(n)) && (tamanho as number) > 0;
}

/** Só os controles que o jogador mexeu e que vieram inteiros. Lixo no salvo é ignorado. */
export function lerMexidos(salvo: unknown): Partial<Layout> {
  const mexidos: Partial<Layout> = {};
  if (typeof salvo !== 'object' || salvo === null) return mexidos;
  for (const id of IDS_CONTROLE) {
    const item = (salvo as Record<string, unknown>)[id];
    if (posicaoValida(item)) {
      mexidos[id] = { x: limitar(item.x, 0, 1), y: limitar(item.y, 0, 1), tamanho: limitar(item.tamanho, TAMANHO_MINIMO, TAMANHO_MAXIMO) };
    }
  }
  return mexidos;
}

/** O de fábrica, trocado controle a controle pelo que o jogador salvou. */
export function juntarLayout(padrao: Layout, salvo: unknown): Layout {
  return { ...padrao, ...lerMexidos(salvo) };
}

// Guardado no aparelho (localStorage), que é o "cookie" de página: fica até o
// jogador limpar os dados do site. Safari e o ícone na Tela de Início têm
// gavetas separadas no iPhone.
const CHAVE_LAYOUT = 'luta-de-mascotes:toque-layout';

export function carregarLayout(storage?: Storage,retrato=false): unknown {
  try {
    const texto = (storage ?? window.localStorage).getItem(CHAVE_LAYOUT+(retrato?':retrato':''));
    return texto ? JSON.parse(texto) : null;
  } catch {
    return null;
  }
}

export function salvarLayout(layout: Partial<Layout>, storage?: Storage,retrato=false): void {
  try {
    (storage ?? window.localStorage).setItem(CHAVE_LAYOUT+(retrato?':retrato':''), JSON.stringify(layout));
  } catch {
    // Aba anônima ou armazenamento cheio: vale até recarregar.
  }
}

export function apagarLayout(storage?: Storage,retrato=false): void {
  try {
    (storage ?? window.localStorage).removeItem(CHAVE_LAYOUT+(retrato?':retrato':''));
  } catch {
    // Idem.
  }
}

/** Largura e altura do jogo no celular. */
export const ALTURA_DO_JOGO = 720;
export const LARGURA_MINIMA_DO_JOGO = 1280;
// O estádio tem 2048 × 869: na altura de 720 ele mede 1697 de largura. Mais
// largo que isso, sobraria um buraco ao lado do cenário.
export const LARGURA_MAXIMA_DO_JOGO = 1680;

/**
 * Largura do jogo para encher uma tela desta proporção sem cortar nada: a
 * altura fica em 720 e o que sobra dos lados vira estádio. Tela mais quadrada
 * que 16:9 (tablet) fica no 1280 com faixa em cima e embaixo; mais comprida
 * que o estádio, faixa nos lados.
 */
export function larguraDoJogo(larguraTela: number, alturaTela: number): number {
  if (!(larguraTela > 0 && alturaTela > 0)) return LARGURA_MINIMA_DO_JOGO;
  return Math.floor(limitar((ALTURA_DO_JOGO * larguraTela) / alturaTela, LARGURA_MINIMA_DO_JOGO, LARGURA_MAXIMA_DO_JOGO));
}
