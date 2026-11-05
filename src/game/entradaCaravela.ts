import {PAUSA_ANTES_DA_ENTRADA_MS} from './aberturaDaLuta';

export const ENTRADA_CARAVELA={rampaFim:2300,piso:3200,parada:3650,retiradaFim:4450,fim:4650} as const;
const limitar=(n:number)=>Math.max(0,Math.min(1,n));

/** Geometria espelhada da proa cortada pela câmera e da prancha até o lutador. */
export function geometriaCaravela(borda:number,alvoX:number,piso:number,escala:number,lado:1|-1){
  const inicioX=borda+lado*15*escala;
  // Deixa espaço para caminhar inteiro fora da prancha antes de parar.
  const fimX=alvoX-lado*120*escala;
  return {inicioX,inicioY:piso-150*escala,fimX,fimY:piso,
    proaX:borda-lado*50*escala,proaY:piso-94*escala};
}

export function amostraEntradaCaravela(ms:number,g:ReturnType<typeof geometriaCaravela>,alvoX:number){
  const p=limitar((ms-PAUSA_ANTES_DA_ENTRADA_MS)/(ENTRADA_CARAVELA.rampaFim-PAUSA_ANTES_DA_ENTRADA_MS));
  const passo=limitar((ms-ENTRADA_CARAVELA.rampaFim)/(ENTRADA_CARAVELA.parada-ENTRADA_CARAVELA.rampaFim));
  const retirada=limitar((ms-ENTRADA_CARAVELA.parada)/(ENTRADA_CARAVELA.retiradaFim-ENTRADA_CARAVELA.parada));
  const chegada=1-limitar(ms/PAUSA_ANTES_DA_ENTRADA_MS);
  return {x:g.inicioX+(g.fimX-g.inicioX)*p+(alvoX-g.fimX)*passo,
    y:g.inicioY+(g.fimY-g.inicioY)*p,chegada,retirada,visivel:ms<ENTRADA_CARAVELA.retiradaFim,
    fase:ms<ENTRADA_CARAVELA.parada?'movimento' as const:'parado' as const,
    tempoDaFase:Math.max(0,ms-(ms<ENTRADA_CARAVELA.parada?PAUSA_ANTES_DA_ENTRADA_MS:ENTRADA_CARAVELA.parada))};
}

/** Um relógio dirige deslocamento e poses, evitando deslizar com a pose parada. */
export function quadroDaFase(tempo:number,duracoes:number[],repetir:boolean):number{
  const total=duracoes.reduce((s,n)=>s+n,0);
  let restante=repetir?Math.max(0,tempo)%total:Math.max(0,tempo);
  for(let i=0;i<duracoes.length;i++){
    if(restante<duracoes[i])return i;
    restante-=duracoes[i];
  }
  return duracoes.length-1;
}
