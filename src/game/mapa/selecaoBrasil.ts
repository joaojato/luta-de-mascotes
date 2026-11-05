import dados from './brasil-estados.json';
export const ESTADOS_BRASIL=dados.estados;
export const REGIOES_MAPA=[
  {nome:'Norte',cor:0x32725f,rotulo:'NORTE',posicao:[-62,-4]},
  {nome:'Nordeste',cor:0xa78b43,rotulo:'NORDESTE',posicao:[-41.5,-7.5]},
  {nome:'Centro-Oeste',cor:0x98634d,rotulo:'CENTRO-\nOESTE',posicao:[-55.5,-15.5]},
  {nome:'Sudeste',cor:0x726397,rotulo:'SUDESTE',posicao:[-43.5,-21]},
  {nome:'Sul',cor:0x417f9b,rotulo:'SUL',posicao:[-52.5,-28.5]}
] as const;
export function estadoDoMapa(uf:string|undefined){return ESTADOS_BRASIL.find(e=>e.uf===uf)??null;}
export const ORDEM_REGIOES=['Sudeste','Sul','Nordeste','Centro-Oeste','Norte'];
/** Tonalidades por UF, preservando a familia de cores de cada regiao. */
export function corDoEstado(uf:string|undefined):number {
  const e=estadoDoMapa(uf);if(!e)return 0x64748b;
  const base=REGIOES_MAPA.find(r=>r.nome===e.regiao)!.cor;
  const grupo=ESTADOS_BRASIL.filter(s=>s.regiao===e.regiao).map(s=>s.uf).sort();
  const indice=grupo.indexOf(e.uf),fator=.78+indice*.085;
  const canal=(shift:number)=>Math.min(255,Math.round(((base>>shift)&255)*fator));
  return (canal(16)<<16)|(canal(8)<<8)|canal(0);
}
export const ORDEM_CARIOCAS=['urubu','almirante','cartola','cachorro'];
export function compararOrigem(ufA:string|undefined,ufB:string|undefined,nomeA='',nomeB='',idA='',idB=''):number {
  const a=estadoDoMapa(ufA),b=estadoDoMapa(ufB);
  const ordemUF=(uf:string|undefined)=>['RJ','SP','MG','ES'].indexOf(uf??'');
  const ordemCarioca=(id:string)=>{const i=ORDEM_CARIOCAS.indexOf(id);return i<0?99:i;};
  return (a?ORDEM_REGIOES.indexOf(a.regiao):99)-(b?ORDEM_REGIOES.indexOf(b.regiao):99)
    ||(a?.regiao==='Sudeste' && b?.regiao==='Sudeste'?ordemUF(ufA)-ordemUF(ufB):(ufA??'ZZ').localeCompare(ufB??'ZZ'))
    ||(ufA==='RJ' && ufB==='RJ'?ordemCarioca(idA)-ordemCarioca(idB):0)||nomeA.localeCompare(nomeB,'pt-BR');
}
/** Brasil ampliado no centro do globo; latitude cresce para cima. */
export function pontoNoMapa(lon:number,lat:number):{x:number;y:number}{
  return {x:220+(lon+54)*8,y:200+(-14-lat)*8};
}
export function layoutSelecao(largura:number,altura:number,quantidade:number){
  const tamanho=largura<1100?64:72,gap=8;
  const colunas=Math.min(10,quantidade,Math.max(1,Math.floor((largura-80)/(tamanho+gap))));
  const linhas=Math.ceil(quantidade/colunas),alturaGrade=linhas*tamanho+(linhas-1)*gap;
  return {tamanho,gap,colunas,primeiroY:altura-58-alturaGrade+tamanho/2,mapaX:largura/2,mapaY:294,previewY:416};
}
