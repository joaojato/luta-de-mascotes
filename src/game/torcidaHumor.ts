import {ladoApanhando} from './torcidaReacao';
export type HumorTorcida = 'quieta' | 'torcendo' | 'irritada' | 'brava';
export interface HumorDaArquibancada {
  bravaAte: [number,number];
  festaAte: [number,number];
  pressao: [boolean,boolean];
  ultimoPressionado:0|1|null;
  viradaContra:0|1|null;
  rounds: [number,number];
  vantagem:0|1|null;
}
export function novoHumorTorcida(): HumorDaArquibancada {
  return {bravaAte:[0,0],festaAte:[0,0],pressao:[false,false],ultimoPressionado:null,viradaContra:null,rounds:[0,0],vantagem:null};
}
export function humorPorResultado(estado:HumorDaArquibancada,perdedor:0|1,decisiva:boolean,agora:number):void {
  const vencedor=perdedor===0?1:0;
  estado.rounds[vencedor]++;
  estado.vantagem=vencedor;
  estado.bravaAte[perdedor]=agora+(decisiva?30000:18000);
  estado.festaAte[perdedor]=0;
  estado.bravaAte[vencedor]=0;
  estado.festaAte[vencedor]=agora+10000;
  estado.pressao=[false,false];
  estado.ultimoPressionado=perdedor;estado.viradaContra=null;
}
export function humorPorVida(estado:HumorDaArquibancada,p1:number,p2:number):void {
  // A vantagem atual prevalece sobre a frustracao guardada de um round anterior.
  estado.vantagem=p1>p2?0:p2>p1?1:estado.rounds[0]>estado.rounds[1]?0:estado.rounds[1]>estado.rounds[0]?1:null;
  if(estado.vantagem!==null)estado.bravaAte[estado.vantagem]=0;
  const lado=ladoApanhando([p1,p2]);
  const antes=estado.pressao[0]?0:estado.pressao[1]?1:null;
  if(lado!==antes){
    estado.viradaContra=lado!==null && estado.ultimoPressionado!==null && lado!==estado.ultimoPressionado?lado:null;
    if(estado.viradaContra!==null){estado.bravaAte=[0,0];estado.festaAte=[0,0];}
    if(lado!==null)estado.ultimoPressionado=lado;
  }
  estado.pressao=[lado===0,lado===1];
}
/** Predomina a espera tranquila; fases individuais evitam um coro sincronizado. */
export function humorDoTorcedor(estado:HumorDaArquibancada,lado:0|1,agora:number,semente:number):HumorTorcida {
  if(estado.vantagem===lado)return 'torcendo';
  if(estado.viradaContra!==null)return lado===estado.viradaContra?'irritada':'torcendo';
  if(estado.bravaAte[lado]>agora || estado.pressao[lado]) return semente%5===0?'quieta':'irritada';
  if(estado.festaAte[lado]>agora) return semente%5===0?'quieta':'torcendo';
  return Math.floor((agora+semente%10000)/1000)%10<7?'quieta':'torcendo';
}
export function sementeDoTorcedor(x:number,fileira:number,tipo:number):number {
  return (Math.imul(Math.floor(x),31)+fileira*137+tipo*17)>>>0;
}
