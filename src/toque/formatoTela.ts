export const FORMATOS_TELA=['auto','4:3','16:9','18:9'] as const;
export type FormatoTela=typeof FORMATOS_TELA[number];
const CHAVE='luta-de-mascotes:formato-tela';
let atual:FormatoTela='auto';
export const POSICOES_TELA=['meio','topo','centro'] as const;
export type PosicaoTela=typeof POSICOES_TELA[number];
let posicao:PosicaoTela='meio';
export function posicaoTela():PosicaoTela{return posicao;}
export function alinhamentoTela(p:PosicaoTela):string{return p==='meio'?'flex-end':p==='topo'?'flex-start':'center';}
export function escolherPosicaoTela(p:PosicaoTela):void {
  posicao=p;document.documentElement.style.setProperty('--alinhamento-tela-vertical',alinhamentoTela(p));
  try{window.localStorage.setItem(CHAVE+':posicao',p);}catch{/* Vale nesta sessao. */}
  window.dispatchEvent(new Event('resize'));
}
export function proporcaoFormato(formato:FormatoTela):number|null {
  if(formato==='auto')return null;
  const [w,h]=formato.split(':').map(Number);return w/h;
}
export function larguraFormato(formato:FormatoTela,automatica:number):number {
  const proporcao=proporcaoFormato(formato);return proporcao===null?automatica:Math.round(proporcao*720);
}
export function formatoTela():FormatoTela{return atual;}
export function escolherFormato(formato:FormatoTela):void {
  atual=formato;
  document.documentElement.style.setProperty('--formato-tela',String(proporcaoFormato(formato)??100));
  try{window.localStorage.setItem(CHAVE,formato);}catch{/* Vale nesta sessao. */}
  window.dispatchEvent(new Event('formato-tela'));
}
export function carregarFormatoTela():void {
  try{
    const salvo=window.localStorage.getItem(CHAVE);
    if(FORMATOS_TELA.includes(salvo as FormatoTela))atual=salvo as FormatoTela;
    const salva=window.localStorage.getItem(CHAVE+':posicao');
    if(POSICOES_TELA.includes(salva as PosicaoTela))posicao=salva as PosicaoTela;
  }catch{/* Padrao automatico. */}
  document.documentElement.style.setProperty('--formato-tela',String(proporcaoFormato(atual)??100));
  document.documentElement.style.setProperty('--alinhamento-tela-vertical',alinhamentoTela(posicao));
}
