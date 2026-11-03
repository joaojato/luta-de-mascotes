import { faixaDeVida, HEALTH_DANGER, HEALTH_WARN } from './vidaFaixas';

export interface ReacaoTorcida {
  fracao: [number, number];
  derrotaContada: [boolean, boolean];
  perdeuParaVerde:[boolean,boolean];
  bonusUsado:[boolean,boolean];
  pressionado: 0 | 1 | null;
  ultimoPressionado: 0 | 1 | null;
  virada: boolean;
  proximoSorteio: number;
  sorteando:0|1|null;
  encerrada: boolean;
}
export interface RetiradaTorcida { lado: 0 | 1; fracao: number }
export function novaReacaoTorcida(): ReacaoTorcida {
  return { fracao: [0,0], derrotaContada: [false,false],perdeuParaVerde:[false,false],bonusUsado:[false,false],pressionado:null, ultimoPressionado:null, virada:false,proximoSorteio:0,sorteando:null,encerrada: false };
}

/** Vermelho 7%, verde 35%; amarelo interpola entre os limites reais do HUD. */
export function fracaoPorVidaVencedor(vida: number): number {
  if (vida <= HEALTH_DANGER) return .07;
  if (vida >= HEALTH_WARN) return .35;
  const t = Math.max(0, Math.min(1, (vida - HEALTH_DANGER) / (HEALTH_WARN - HEALTH_DANGER)));
  return .07 + .28 * t;
}

export function registrarDerrotaTorcida(estado: ReacaoTorcida, lado: 0 | 1, decisiva: boolean, vidaVencedor: number): RetiradaTorcida | null {
  if (estado.encerrada) return null;
  if (decisiva) {
    estado.encerrada = true;
    estado.pressionado=null;estado.virada=false;estado.sorteando=null;
    estado.fracao[lado] = 1;
    return { lado, fracao: 1 };
  }
  if (estado.derrotaContada[lado]) return null;
  estado.derrotaContada[lado] = true;
  estado.fracao[lado] = Math.min(1, estado.fracao[lado] + fracaoPorVidaVencedor(vidaVencedor));
  estado.perdeuParaVerde[lado]=faixaDeVida(vidaVencedor)==='verde';
  estado.perdeuParaVerde[lado===0?1:0]=false;
  estado.ultimoPressionado=lado;
  estado.pressionado=null;estado.virada=false;estado.proximoSorteio=0;estado.sorteando=null;
  return { lado, fracao: estado.fracao[lado] };
}

export interface EventoPressaoTorcida {
  lado:0|1|null;
  virada:boolean;
  chanceSaida:number;
  arremesso:boolean;
  saida:boolean;
  retirada:RetiradaTorcida|null;
}
export function ladoApanhando(vidas:[number,number]):0|1|null {
  if(vidas[0]>0 && faixaDeVida(vidas[0])==='vermelha' && faixaDeVida(vidas[1])==='verde')return 0;
  if(vidas[1]>0 && faixaDeVida(vidas[1])==='vermelha' && faixaDeVida(vidas[0])==='verde')return 1;
  return null;
}
/** Irritacao compartilhada pelas reacoes: cresce com a desvantagem de vida. */
export function intensidadeDaSurra(vida:number,vidaAdversario:number):number {
  const diferencaMinima=HEALTH_WARN-HEALTH_DANGER;
  return Math.max(0,Math.min(1,(vidaAdversario-vida-diferencaMinima)/(1-diferencaMinima)));
}
/** Quanto maior a vantagem de vida do adversario, maior a revolta: 10% a 50% por segundo. */
export function chanceArremessoPorVida(vida:number,vidaAdversario:number):number {
  if(ladoApanhando([vida,vidaAdversario])!==0)return 0;
  return .1+.4*intensidadeDaSurra(vida,vidaAdversario);
}
/** A saida tambem fica mais provavel com a surra, agravada por derrota anterior ou virada. */
export function chanceSaidaPorVida(vida:number,vidaAdversario:number,jaPerdeuRound=false,virada=false):number {
  if(vida<=0 || faixaDeVida(vidaAdversario)!=='verde')return 0;
  const vermelho=faixaDeVida(vida)==='vermelha';
  if(!vermelho && !(jaPerdeuRound && faixaDeVida(vida)==='amarela'))return 0;
  const intensidade=intensidadeDaSurra(vida,vidaAdversario);
  if(virada && vermelho)return .06+.34*intensidade;
  if(jaPerdeuRound)return .04+.26*intensidade;
  return .02+.18*intensidade;
}
/** Um sorteio por segundo do lado, nunca por quadro ou por pessoa. Sem recuperar atrasos em rajadas. */
export function avaliarPressaoTorcida(estado: ReacaoTorcida, vidas: [number, number], agora:number,sortear:()=>number=Math.random):EventoPressaoTorcida {
  const apanhando=estado.encerrada?null:ladoApanhando(vidas);
  if(apanhando!==estado.pressionado){
    estado.virada=apanhando!==null && estado.ultimoPressionado!==null && apanhando!==estado.ultimoPressionado;
    estado.pressionado=apanhando;
    if(apanhando!==null)estado.ultimoPressionado=apanhando;
  }
  let lado=apanhando;
  if(!estado.encerrada && lado===null)for(const p of [0,1] as const){
    const outro=p===0?1:0;
    if(estado.derrotaContada[p] && vidas[p]>0 && faixaDeVida(vidas[p])!=='verde' && faixaDeVida(vidas[outro])==='verde')lado=p;
  }
  if(lado!==estado.sorteando){estado.sorteando=lado;estado.proximoSorteio=agora+1000;}
  const chanceSaida=lado===null?0:chanceSaidaPorVida(vidas[lado],vidas[lado===0?1:0],estado.derrotaContada[lado],estado.virada);
  const evento:EventoPressaoTorcida={lado,virada:estado.virada,chanceSaida,arremesso:false,saida:false,retirada:null};
  if(apanhando!==null && estado.perdeuParaVerde[apanhando] && !estado.bonusUsado[apanhando]){
    estado.bonusUsado[apanhando]=true;estado.fracao[apanhando]=Math.min(1,estado.fracao[apanhando]+.35);
    evento.retirada={lado:apanhando,fracao:estado.fracao[apanhando]};
  }
  if(lado===null || agora<estado.proximoSorteio)return evento;
  estado.proximoSorteio=agora+1000;
  evento.arremesso=apanhando!==null && sortear()<chanceArremessoPorVida(vidas[apanhando],vidas[apanhando===0?1:0]);
  evento.saida=sortear()<chanceSaida;
  return evento;
}
