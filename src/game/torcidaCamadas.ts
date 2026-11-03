import { MAPA_TORCIDA, type PontoTorcida } from './torcidaRotas';

/** Camada estrutural da fileira; a perna nao promove o NPC para a fileira de baixo. */
export function camadaDaFileira(y: number): number {
  let indice=0;
  MAPA_TORCIDA.niveis.forEach((n,i)=>{
    if(Math.abs(n.fileiraY-y)<Math.abs(MAPA_TORCIDA.niveis[indice].fileiraY-y)) indice=i;
  });
  return indice;
}
export function camadaDoPercurso(ponto: PontoTorcida, fileiraOrigemY: number): number {
  if(ponto.etapa==='fileira') return camadaDaFileira(fileiraOrigemY);
  if(ponto.etapa==='saida') return 13;
  return Math.max(0,Math.min(12,12-ponto.nivel));
}

/** Cada cadeira e cada pessoa da fileira inferior passam por cima da circulacao superior, mesmo se a cadeira estiver vazia. */
export function comporCamadasTorcida<T>(cadeiras: (T | undefined)[], fixos: T[], moveis: T[], camada: (item:T)=>number): T[] {
  const grupos=Array.from({length:14},()=>[] as T[]);
  for(const item of [...fixos,...moveis]) grupos[Math.max(0,Math.min(13,camada(item)))].push(item);
  return grupos.flatMap((pessoas,i)=>cadeiras[i] ? [cadeiras[i]!,...pessoas] : pessoas);
}
