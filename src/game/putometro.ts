import { HEALTH_DANGER, HEALTH_WARN } from './vidaFaixas';

export type AcaoDaTorcida = 'acerto'|'especial'|'dano'|'bloqueio'|'parry'|'barrado'|'sofreu-parry';
export interface Putometro {
  valor:[number,number]; verde:[number,number]; vidas:[number,number];
  ultimoSurra:0|1|null; viradaNoRound:boolean; encerrado:boolean;
}
export const novoPutometro=():Putometro=>({valor:[.7,.7],verde:[1/3,1/3],vidas:[1,1],ultimoSurra:null,viradaNoRound:false,encerrado:false});
const limitar=(v:number)=>Math.max(0,Math.min(1,v));
export function agirNoPutometro(e:Putometro,lado:0|1,acao:AcaoDaTorcida,dano=0):void {
  if(e.encerrado)return;
  if(acao==='especial'){
    e.valor[lado]=Math.max(e.valor[lado],1-e.verde[lado]);
    return;
  }
  const mudanca={acerto:.035+Math.min(.06,dano*.25),dano:-(.045+Math.min(.1,dano*.6)),bloqueio:.025,parry:.12,barrado:-.018,'sofreu-parry':-.075}[acao];
  e.valor[lado]=limitar(e.valor[lado]+mudanca);
}
/** Vida apenas identifica surras/viradas: nunca recupera o ponteiro sozinha. */
export function vidaNoPutometro(e:Putometro,p1:number,p2:number):void {
  if(e.encerrado)return;
  if(p1===1 && p2===1 && (e.vidas[0]<1 || e.vidas[1]<1))e.viradaNoRound=false;
  e.vidas=[p1,p2];
  const lado=p1<=HEALTH_DANGER && p2>HEALTH_WARN?0:p2<=HEALTH_DANGER && p1>HEALTH_WARN?1:null;
  if(lado===null)return;
  if(e.ultimoSurra!==null && e.ultimoSurra!==lado && !e.viradaNoRound){
    e.verde[lado]*=.5;e.viradaNoRound=true;
  }
  e.ultimoSurra=lado;
}
export function derrotaNoPutometro(e:Putometro,lado:0|1,decisiva:boolean,vidaVencedor:number):void {
  if(e.encerrado)return;
  const surra=vidaVencedor>HEALTH_WARN;
  if(surra)e.verde[lado]*=2/3;
  e.valor[lado]=surra?1/3-e.verde[lado]:(2/3-e.verde[lado])/2;
  e.viradaNoRound=false;
  if(decisiva){e.encerrado=true;e.valor[lado===0?1:0]=1;}
}
export function faixaPutometro(e:Putometro,lado:0|1):0|1|2|3 {
  const v=e.valor[lado],preto=1/3-e.verde[lado];
  return preto>0 && v<=preto+1e-7?0:v<1/3?1:v<1-e.verde[lado]?2:3;
}
export const LEGENDAS_PUTOMETRO=['A Casa Caiu!','VAI T%M@ N* C#!','Vamo Virar!','Que Show!'];
