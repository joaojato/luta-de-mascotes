import {describe,expect,it} from 'vitest';
import {agirNoPutometro,derrotaNoPutometro,faixaPutometro,novoPutometro,RITMO_DA_BARRA,vidaNoPutometro} from './putometro';
describe('P*tometro por desempenho',()=>{
  it('especial acertado resgata ate a divisa verde/amarelo, inclusive com verde reduzido',()=>{
    const e=novoPutometro();e.valor[0]=.1;
    agirNoPutometro(e,0,'especial');expect(e.valor[0]).toBeCloseTo(2/3);
    e.verde[0]=1/6;e.valor[0]=.1;
    agirNoPutometro(e,0,'especial');expect(e.valor[0]).toBeCloseTo(5/6);
    expect(faixaPutometro(e,0)).toBe(3);
    e.valor[0]=.95;agirNoPutometro(e,0,'especial');expect(e.valor[0]).toBe(.95);
  });
  it('nao ganha pontos com tempo, vantagem de vida ou reinicio de round',()=>{
    const e=novoPutometro();agirNoPutometro(e,0,'dano',.1);const antes=e.valor[0];
    for(let i=0;i<1000;i++)vidaNoPutometro(e,.9,.1);
    vidaNoPutometro(e,1,1);expect(e.valor[0]).toBe(antes);
  });
  it('cada contato move o ponteiro e parry supera acerto e defesa simples',()=>{
    const ganho=(acao:'acerto'|'bloqueio'|'parry')=>{const e=novoPutometro();agirNoPutometro(e,0,acao,.1);return e.valor[0]-.7;};
    expect(ganho('acerto')).toBeGreaterThan(0);expect(ganho('bloqueio')).toBeGreaterThan(0);
    expect(ganho('parry')).toBeGreaterThan(ganho('acerto'));expect(ganho('parry')).toBeGreaterThan(ganho('bloqueio'));
    for(const acao of ['dano','barrado','sofreu-parry'] as const){const e=novoPutometro();agirNoPutometro(e,0,acao,.1);expect(e.valor[0]).toBeLessThan(.7);}
  });
  it('derrota disputada fica vermelha sem criar A Casa Caiu; surra cria e inicia na divisa',()=>{
    const e=novoPutometro();derrotaNoPutometro(e,0,false,.2);
    expect(e.verde[0]).toBe(1/3);expect(faixaPutometro(e,0)).toBe(1);
    derrotaNoPutometro(e,0,false,.9);expect(e.verde[0]).toBeCloseTo(2/9);
    expect(e.valor[0]).toBeCloseTo(1/3-e.verde[0]);expect(faixaPutometro(e,0)).toBe(0);
    const antes=e.valor[0];vidaNoPutometro(e,1,1);expect(e.valor[0]).toBe(antes);
    agirNoPutometro(e,0,'bloqueio');expect(faixaPutometro(e,0)).toBe(1);
  });
  it('virada por surra reduz metade do verde uma vez no round',()=>{
    const e=novoPutometro();vidaNoPutometro(e,.2,.9);vidaNoPutometro(e,.9,.2);
    expect(e.verde[1]).toBeCloseTo(1/6);
    vidaNoPutometro(e,.8,.1);vidaNoPutometro(e,.9,.2);expect(e.verde[1]).toBeCloseTo(1/6);
  });
  it('a torcida empurra a barra do especial: mais rapida no verde, mais lenta no vermelho e no preto',()=>{
    expect(RITMO_DA_BARRA[3]).toBeGreaterThan(RITMO_DA_BARRA[2]);
    expect(RITMO_DA_BARRA[2]).toBe(1);
    expect(RITMO_DA_BARRA[1]).toBeLessThan(1);
    expect(RITMO_DA_BARRA[0]).toBeLessThan(RITMO_DA_BARRA[1]);
  });
  it('congela no resultado final e coloca vencedor em festa',()=>{
    const e=novoPutometro();e.valor[0]=.1;derrotaNoPutometro(e,1,true,.8);
    expect(faixaPutometro(e,0)).toBe(3);
    agirNoPutometro(e,0,'dano',1);vidaNoPutometro(e,.1,.9);expect(e.valor[0]).toBe(1);
  });
});
