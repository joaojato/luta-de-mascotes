import type * as Phaser from 'phaser';

const CHAVE='luta-de-mascotes:diagnostico-sessao';
interface Registro {evento:string;momento:number;detalhe:string}
/** Historico tecnico local; nao transmite dados nem tenta recarregar a pagina. */
export function registrarEventoSessao(evento:string,detalhe='',storage?:Storage):void {
  try{
    const s=storage??window.sessionStorage;
    const anterior=JSON.parse(s.getItem(CHAVE)??'[]') as Registro[];
    const lista=Array.isArray(anterior)?anterior:[];
    s.setItem(CHAVE,JSON.stringify([...lista.slice(-19),{evento,momento:Date.now(),detalhe}]));
  }catch{/* Navegacao privada pode negar armazenamento. */}
}
export function instalarDiagnosticoSessao(game:Phaser.Game):void {
  const navegacao=performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming|undefined;
  const descartada=(document as Document & {wasDiscarded?:boolean}).wasDiscarded;
  registrarEventoSessao('jogo-criado',`navegacao=${navegacao?.type??'desconhecida'};descartada=${Boolean(descartada)}`);
  const perdido=()=>registrarEventoSessao('webgl-perdido');
  const restaurado=()=>registrarEventoSessao('webgl-restaurado');
  const saiu=(e:PageTransitionEvent)=>registrarEventoSessao('pagina-saindo',`cache=${e.persisted}`);
  const erro=()=>registrarEventoSessao('erro-javascript');
  const ligar=()=>{
    game.canvas.addEventListener('webglcontextlost',perdido);
    game.canvas.addEventListener('webglcontextrestored',restaurado);
    for(const cena of game.scene.scenes)cena.sys.events.on('start',()=>registrarEventoSessao('cena',cena.scene.key));
  };
  if(game.isBooted)ligar();else game.events.once('ready',ligar);
  window.addEventListener('pagehide',saiu);window.addEventListener('error',erro);window.addEventListener('unhandledrejection',erro);
  game.events.once('destroy',()=>{
    registrarEventoSessao('jogo-destruido');
    game.canvas?.removeEventListener('webglcontextlost',perdido);game.canvas?.removeEventListener('webglcontextrestored',restaurado);
    window.removeEventListener('pagehide',saiu);window.removeEventListener('error',erro);window.removeEventListener('unhandledrejection',erro);
  });
}
