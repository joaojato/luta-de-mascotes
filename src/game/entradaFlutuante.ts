/** Voo de apresentação: sobe, sustenta a capa aberta e retorna à flutuação normal. */
export function alturaEntradaFlutuante(ms:number):number{
  const suave=(p:number)=>(1-Math.cos(Math.PI*Math.max(0,Math.min(1,p))))/2;
  if(ms<1350)return 80*suave((ms-500)/850);
  if(ms<2050)return 80;
  return 80*(1-suave((ms-2050)/1250));
}

/** Saltinho frustrado: só levanta durante as batidas de asas; bunda no piso no quadro14. */
export function alturaEntradaSaltinho(ms:number):number{
  const suave=(p:number)=>(1-Math.cos(Math.PI*Math.max(0,Math.min(1,p))))/2;
  if(ms<1200)return 40*suave((ms-885)/315);
  return 40*(1-suave((ms-1200)/595));
}
