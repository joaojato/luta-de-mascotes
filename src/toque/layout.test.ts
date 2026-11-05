import { describe, expect, it } from 'vitest';

import {
  apagarLayout,
  arrastar,
  caixaEmPixels,
  carregarLayout,
  IDS_CONTROLE,
  juntarLayout,
  larguraDoJogo,
  layoutPadrao,
  layoutSemSobreposicao,
  redimensionar,
  salvarLayout,
  type Tela
} from './layout';

const IPHONE: Tela = { largura: 844, altura: 390, seguro: { topo: 0, direita: 47, baixo: 21, esquerda: 47 } };
const SE: Tela = { largura: 667, altura: 375, seguro: { topo: 0, direita: 0, baixo: 0, esquerda: 0 } };

describe('controles abaixo do jogo em pe',()=>{
  for(const [w,h] of [[320,568],[390,844],[430,932],[768,1024]]){
    it(`mantem os controles fora da imagem e sem sobreposicao em ${w}x${h}`,()=>{
      const tela:Tela={largura:w,altura:h,seguro:{topo:47,direita:0,esquerda:0,baixo:34}};
      const layout=layoutPadrao(tela),fimJogo=47+(h-47-34)/2;
      const caixas=IDS_CONTROLE.filter(id=>id!=='menu').map(id=>caixaEmPixels(layout[id],tela));
      for(const c of caixas){
        expect(c.topo).toBeGreaterThan(fimJogo);
        expect(c.esquerda).toBeGreaterThanOrEqual(0);
        expect(c.esquerda+c.lado).toBeLessThanOrEqual(w);
        expect(c.topo+c.lado).toBeLessThanOrEqual(h-34);
      }
      for(let i=0;i<caixas.length;i++)for(let j=i+1;j<caixas.length;j++){
        const a=caixas[i],b=caixas[j];
        expect(a.esquerda+a.lado+2<=b.esquerda || b.esquerda+b.lado+2<=a.esquerda || a.topo+a.lado+2<=b.topo || b.topo+b.lado+2<=a.topo).toBe(true);
      }
    });
  }
  it('guarda ajustes distintos para cada orientacao',()=>{
    const storage=memoria(),deitado=layoutPadrao(IPHONE),emPe={...deitado,baixo:{x:.8,y:.7,tamanho:.1}};
    salvarLayout(deitado,storage);salvarLayout(emPe,storage,true);
    expect(carregarLayout(storage)).toEqual(deitado);expect(carregarLayout(storage,true)).toEqual(emPe);
    apagarLayout(storage,true);expect(carregarLayout(storage)).toEqual(deitado);
  });
  it('todos os formatos preservam folga entre controles e o quadro do jogo',()=>{
    for(const proporcao of [4/3,16/9,18/9])for(const [w,h] of [[320,568],[390,844],[844,390],[667,375],[740,330]]){
      const tela:Tela={largura:w,altura:h,seguro:{topo:0,direita:0,esquerda:0,baixo:20}};
      expect(layoutSemSobreposicao(layoutPadrao(tela,proporcao),tela,proporcao)).toBe(true);
    }
  });
  it('rejeita ajustes que empilham botoes ou cobrem a imagem em pe',()=>{
    const tela:Tela={largura:390,altura:844,seguro:{topo:47,direita:0,esquerda:0,baixo:34}};
    const l=layoutPadrao(tela);
    expect(layoutSemSobreposicao({...l,cima:l.baixo},tela)).toBe(false);
    expect(layoutSemSobreposicao({...l,direcional:{...l.direcional,y:.1}},tela)).toBe(false);
  });
  it('deitado oferece botoes grandes sem sobreposicao em uma tela de celular',()=>{
    const l=layoutPadrao(IPHONE);
    expect(caixaEmPixels(l.baixo,IPHONE).lado).toBeGreaterThanOrEqual(76);
    expect(caixaEmPixels(l.direcional,IPHONE).lado).toBeGreaterThanOrEqual(180);
    expect(layoutSemSobreposicao(l,IPHONE)).toBe(true);
  });
});

function memoria(): Storage {
  const dados = new Map<string, string>();
  return {
    get length() {
      return dados.size;
    },
    clear: () => dados.clear(),
    getItem: (chave) => dados.get(chave) ?? null,
    key: (i) => [...dados.keys()][i] ?? null,
    removeItem: (chave) => void dados.delete(chave),
    setItem: (chave, valor) => void dados.set(chave, valor)
  };
}

describe('layout de fábrica', () => {
  it.each([IPHONE, SE])('cabe inteiro na tela, fora do notch e da barra de início', (tela) => {
    const layout = layoutPadrao(tela);
    for (const id of IDS_CONTROLE) {
      const caixa = caixaEmPixels(layout[id], tela);
      expect(caixa.esquerda).toBeGreaterThanOrEqual(tela.seguro.esquerda);
      expect(caixa.esquerda + caixa.lado).toBeLessThanOrEqual(tela.largura - tela.seguro.direita);
      expect(caixa.topo + caixa.lado).toBeLessThanOrEqual(tela.altura - tela.seguro.baixo);
    }
  });

  it('põe os quatro botões no losango', () => {
    const l = layoutPadrao(IPHONE);
    expect(l.cima.y).toBeLessThan(l.direita.y);
    expect(l.baixo.y).toBeGreaterThan(l.direita.y);
    expect(l.esquerda.x).toBeLessThan(l.cima.x);
    expect(l.direita.x).toBeGreaterThan(l.cima.x);
    expect(l.cima.x).toBeCloseTo(l.baixo.x);
  });

  it('nenhum botão do losango encosta no outro', () => {
    const l = layoutPadrao(IPHONE);
    const [t, c, x, q] = (['cima', 'direita', 'baixo', 'esquerda'] as const).map((id) => caixaEmPixels(l[id], IPHONE));
    const centro = (k: { esquerda: number; topo: number; lado: number }) => [k.esquerda + k.lado / 2, k.topo + k.lado / 2];
    for (const [a, b] of [[t, c], [c, x], [x, q], [q, t]]) {
      const [ax, ay] = centro(a);
      const [bx, by] = centro(b);
      expect(Math.hypot(ax - bx, ay - by)).toBeGreaterThan(a.lado);
    }
  });
});

describe('editar', () => {
  it('arrastar não deixa o controle sair da tela', () => {
    const inicio = layoutPadrao(IPHONE).direcional;
    const caixa = caixaEmPixels(arrastar(inicio, -5000, 5000, IPHONE), IPHONE);
    expect(caixa.esquerda).toBe(0);
    expect(caixa.topo + caixa.lado).toBe(IPHONE.altura);
  });

  it('o tamanho tem piso e teto', () => {
    const botao = layoutPadrao(IPHONE).baixo;
    expect(redimensionar(botao, 0.001).tamanho).toBe(0.07);
    expect(redimensionar(botao, 1000).tamanho).toBe(0.6);
  });

  it('salva, recarrega e volta ao de fábrica', () => {
    const storage = memoria();
    const padrao = layoutPadrao(IPHONE);
    const movido = { ...padrao, baixo: { x: 0.5, y: 0.5, tamanho: 0.2 } };
    salvarLayout(movido, storage);
    expect(juntarLayout(padrao, carregarLayout(storage)).baixo).toEqual({ x: 0.5, y: 0.5, tamanho: 0.2 });
    apagarLayout(storage);
    expect(juntarLayout(padrao, carregarLayout(storage))).toEqual(padrao);
  });

  it('salvo com lixo cai no de fábrica, controle a controle', () => {
    const padrao = layoutPadrao(IPHONE);
    const juntado = juntarLayout(padrao, { baixo: { x: 'a', y: 1, tamanho: 1 }, direita: { x: 0.9, y: 0.4, tamanho: 0.15 } });
    expect(juntado.baixo).toEqual(padrao.baixo);
    expect(juntado.direita).toEqual({ x: 0.9, y: 0.4, tamanho: 0.15 });
    expect(juntarLayout(padrao, 'quebrado')).toEqual(padrao);
  });
});

describe('largura do jogo', () => {
  it('enche a tela do celular comprido mantendo a altura de 720', () => {
    expect(larguraDoJogo(844, 390)).toBe(1558);
  });

  it('16:9 e tablet ficam no 1280', () => {
    expect(larguraDoJogo(667, 375)).toBe(1280);
    expect(larguraDoJogo(1180, 820)).toBe(1280);
  });

  it('nunca passa da largura do estádio', () => {
    expect(larguraDoJogo(1000, 300)).toBe(1680);
  });

  it('tela sem tamanho ainda (antes do primeiro desenho) fica no 1280', () => {
    expect(larguraDoJogo(0, 0)).toBe(1280);
  });
});
