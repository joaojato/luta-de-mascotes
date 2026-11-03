import { describe, expect, it } from 'vitest';
import { avaliarPressaoTorcida, chanceArremessoPorVida, chanceSaidaPorVida, fracaoPorVidaVencedor, novaReacaoTorcida, registrarDerrotaTorcida } from './torcidaReacao';
import { faixaDeVida } from './vidaFaixas';
import { quantidadeParaSair } from './torcidaRotas';

describe('a torcida reage ao estrago e usa as mesmas faixas do HUD',()=>{
  it('vermelho ate 25%, amarelo ate 50%, verde acima de 50%',()=>{
    expect(faixaDeVida(.25)).toBe('vermelha');
    expect(faixaDeVida(.25001)).toBe('amarela');
    expect(faixaDeVida(.5)).toBe('amarela');
    expect(faixaDeVida(.50001)).toBe('verde');
  });
  it('vencedor no vermelho retira 7%; no verde 35%; amarelo e gradual',()=>{
    expect(fracaoPorVidaVencedor(.1)).toBe(.07);
    expect(fracaoPorVidaVencedor(.25)).toBe(.07);
    expect(fracaoPorVidaVencedor(.8)).toBe(.35);
    expect(fracaoPorVidaVencedor(.375)).toBeCloseTo(.21);
    expect(quantidadeParaSair(100,false,fracaoPorVidaVencedor(.8))).toBe(35);
    expect(quantidadeParaSair(20,false,fracaoPorVidaVencedor(.8))).toBe(7);
  });
  it('derrota verde seguida de nova pressao soma 35 pontos sobre o publico inicial, uma vez',()=>{
    const estado=novaReacaoTorcida();
    expect(registrarDerrotaTorcida(estado,0,false,.9)).toEqual({lado:0,fracao:.35});
    expect(avaliarPressaoTorcida(estado,[1,1],0).retirada).toBe(null);
    expect(avaliarPressaoTorcida(estado,[.25,.8],100).retirada).toEqual({lado:0,fracao:.7});
    expect(avaliarPressaoTorcida(estado,[.1,.8],200).retirada).toBe(null);
    expect(estado.fracao).toEqual([.7,0]);
  });
  it('nao dispara parcela extra sem derrota verde previa, nem com adversario amarelo, nem no KO',()=>{
    const estado=novaReacaoTorcida();
    registrarDerrotaTorcida(estado,1,false,.2);
    expect(avaliarPressaoTorcida(estado,[.9,.1],0).retirada).toBe(null);
    const verde=novaReacaoTorcida();registrarDerrotaTorcida(verde,1,false,.9);
    expect(avaliarPressaoTorcida(verde,[.5,.1],0).retirada).toBe(null);
    expect(avaliarPressaoTorcida(verde,[.9,0],100).retirada).toBe(null);
    expect(avaliarPressaoTorcida(verde,[.9,.1],200).retirada).toEqual({lado:1,fracao:.7});
  });
  it('quem se recupera vencendo o round nao continua em crise por causa da derrota anterior',()=>{
    const estado=novaReacaoTorcida();registrarDerrotaTorcida(estado,0,false,.9);
    registrarDerrotaTorcida(estado,1,false,.8);
    expect(avaliarPressaoTorcida(estado,[.1,.9],0).retirada).toBe(null);
  });
  it('derrota decisiva manda todo o restante embora e nao atinge o lado vencedor',()=>{
    const estado=novaReacaoTorcida();registrarDerrotaTorcida(estado,0,false,.8);
    expect(registrarDerrotaTorcida(estado,0,true,.1)).toEqual({lado:0,fracao:1});
    expect(estado.fracao).toEqual([1,0]);
    expect(avaliarPressaoTorcida(estado,[.1,.9],10000).retirada).toBe(null);
    expect(registrarDerrotaTorcida(estado,1,false,.9)).toBe(null);
  });
  it('sorteia uma vez por segundo por lado, sem multiplicar por quadros',()=>{
    const estado=novaReacaoTorcida();let sorteios=0;
    const random=()=>{sorteios++;return 0;};
    avaliarPressaoTorcida(estado,[.2,.9],0,random);
    for(let i=1;i<1000;i++)avaliarPressaoTorcida(estado,[.2,.9],i,random);
    expect(sorteios).toBe(0);
    const e=avaliarPressaoTorcida(estado,[.2,.9],1000,random);
    expect(e.chanceSaida).toBeCloseTo(chanceSaidaPorVida(.2,.9));expect(e.arremesso).toBe(true);expect(e.saida).toBe(true);
    expect(sorteios).toBe(2);
    avaliarPressaoTorcida(estado,[.2,.9],100000,random);expect(sorteios).toBe(4);
  });
  it('depois de perder round, a saida progressiva comeca no amarelo, sem arremessos nessa faixa',()=>{
    const estado=novaReacaoTorcida();registrarDerrotaTorcida(estado,0,false,.9);
    const inicio=avaliarPressaoTorcida(estado,[.4,.9],0,()=>0);
    expect(inicio.chanceSaida).toBeCloseTo(chanceSaidaPorVida(.4,.9,true));expect(inicio.retirada).toBe(null);
    const e=avaliarPressaoTorcida(estado,[.4,.9],1000,()=>0);
    expect(e.saida).toBe(true);expect(e.arremesso).toBe(false);expect(e.retirada).toBe(null);
    const vermelho=avaliarPressaoTorcida(estado,[.2,.9],1100,()=>1);
    expect(vermelho.retirada).toEqual({lado:0,fracao:.7});
  });
  it('a virada troca o lado afetado e agrava a saida apenas ate acabar a condicao',()=>{
    const estado=novaReacaoTorcida();avaliarPressaoTorcida(estado,[.2,.9],0,()=>1);
    avaliarPressaoTorcida(estado,[1,1],1000,()=>1);
    const virada=avaliarPressaoTorcida(estado,[.9,.2],2000,()=>1);
    expect(virada.lado).toBe(1);expect(virada.virada).toBe(true);expect(virada.chanceSaida).toBeCloseTo(chanceSaidaPorVida(.2,.9,false,true));
    avaliarPressaoTorcida(estado,[.9,.4],3000,()=>0);
    const novo=avaliarPressaoTorcida(estado,[.9,.2],4000,()=>1);
    expect(novo.virada).toBe(false);expect(novo.chanceSaida).toBeCloseTo(chanceSaidaPorVida(.2,.9));
  });
  it('nao sorteia sem condicao, no KO ou depois da derrota final',()=>{
    const estado=novaReacaoTorcida();let sorteios=0;const random=()=>{sorteios++;return 0;};
    avaliarPressaoTorcida(estado,[.4,.9],0,random);
    avaliarPressaoTorcida(estado,[.2,.5],2000,random);
    avaliarPressaoTorcida(estado,[0,.9],4000,random);
    registrarDerrotaTorcida(estado,0,true,.9);
    avaliarPressaoTorcida(estado,[.2,.9],6000,random);
    expect(sorteios).toBe(0);
  });
  it('aplica a chance de saida progressiva real em cada contexto',()=>{
    for(const contexto of ['normal','round','virada']){
      const e=novaReacaoTorcida();
      if(contexto==='round')registrarDerrotaTorcida(e,0,false,.2);
      if(contexto==='virada'){avaliarPressaoTorcida(e,[.9,.2],0,()=>1);avaliarPressaoTorcida(e,[1,1],1000,()=>1);}
      avaliarPressaoTorcida(e,[.2,.9],2000,()=>1);
      const chance=chanceSaidaPorVida(.2,.9,contexto==='round',contexto==='virada');
      let valores=[.5,chance-1e-8];
      const sim=avaliarPressaoTorcida(e,[.2,.9],3000,()=>valores.shift()!);
      expect(sim.chanceSaida).toBe(chance);expect(sim.saida).toBe(true);
      valores=[.5,chance+1e-8];
      expect(avaliarPressaoTorcida(e,[.2,.9],4000,()=>valores.shift()!).saida).toBe(false);
    }
  });
  it('a surra aumenta as duas reacoes, sem quedas de probabilidade em nenhum contexto',()=>{
    const vidas=[.25,.2,.15,.1,.05,.001];
    for(const [perdeu,virada] of [[false,false],[true,false],[false,true]]){
      let anterior=-1;
      for(const vida of vidas){
        const chance=chanceSaidaPorVida(vida,.95,perdeu,virada);
        expect(chance).toBeGreaterThan(anterior);anterior=chance;
      }
    }
    expect(chanceSaidaPorVida(.1,.95)).toBeGreaterThan(chanceSaidaPorVida(.1,.6));
    for(const vida of vidas){
      const normal=chanceSaidaPorVida(vida,.95),perdeu=chanceSaidaPorVida(vida,.95,true),virou=chanceSaidaPorVida(vida,.95,false,true);
      expect(perdeu).toBeGreaterThan(normal);expect(virou).toBeGreaterThan(perdeu);
    }
  });
  it('com o mesmo sorteio alguem passa a sair quando a surra piora',()=>{
    const e=novaReacaoTorcida();avaliarPressaoTorcida(e,[.25,.6],0,()=>1);
    expect(avaliarPressaoTorcida(e,[.25,.6],1000,()=>.1).saida).toBe(false);
    expect(avaliarPressaoTorcida(e,[.05,.95],2000,()=>.1).saida).toBe(true);
  });
  it('a saida comeca mais cedo apos derrota e continua bloqueada fora das condicoes ou no KO',()=>{
    expect(chanceSaidaPorVida(.4,.9)).toBe(0);
    expect(chanceSaidaPorVida(.4,.9,true)).toBeGreaterThan(0);
    expect(chanceSaidaPorVida(.1,.5,true,true)).toBe(0);
    expect(chanceSaidaPorVida(0,1,true,true)).toBe(0);
  });
  it('aplica a chance progressiva no sorteio real do arremesso',()=>{
    const e=novaReacaoTorcida();avaliarPressaoTorcida(e,[.2,.9],0,()=>1);
    const chance=chanceArremessoPorVida(.2,.9);
    expect(avaliarPressaoTorcida(e,[.2,.9],1000,()=>chance-1e-8).arremesso).toBe(true);
    expect(avaliarPressaoTorcida(e,[.2,.9],2000,()=>chance+1e-8).arremesso).toBe(false);
    // Mesmo sorteio passa a disparar quando a surra piora.
    expect(avaliarPressaoTorcida(e,[.25,.6],3000,()=>.3).arremesso).toBe(false);
    expect(avaliarPressaoTorcida(e,[.05,.95],4000,()=>.3).arremesso).toBe(true);
  });
  it('aumenta a chance conforme a propria vida cai ou o adversario preserva mais vida',()=>{
    const queda=[.25,.2,.15,.1,.05,.001].map(vida=>chanceArremessoPorVida(vida,.95));
    for(let i=1;i<queda.length;i++)expect(queda[i]).toBeGreaterThan(queda[i-1]);
    expect(chanceArremessoPorVida(.1,.95)).toBeGreaterThan(chanceArremessoPorVida(.1,.6));
    expect(chanceArremessoPorVida(.25,.50001)).toBeCloseTo(.1,4);
    expect(chanceArremessoPorVida(.001,1)).toBeCloseTo(.5,2);
    expect(queda.every(p=>p>=.1 && p<=.5)).toBe(true);
  });
  it('nao permite arremesso no amarelo, contra adversario sem vida verde ou no KO',()=>{
    expect(chanceArremessoPorVida(.4,.9)).toBe(0);
    expect(chanceArremessoPorVida(.2,.5)).toBe(0);
    expect(chanceArremessoPorVida(0,1)).toBe(0);
  });
});
