import type * as Phaser from 'phaser';
import type {Store} from '../game/store';
import type {GameSettings} from '../game/types';

/** Mede renderizacoes reais em janelas curtas, sem a media longa do loop. */
export function montarContadorDeFps(host:HTMLElement,settingsStore:Store<GameSettings>,jogo:()=>Phaser.Game|null):void {
  const caixa=document.createElement('div');caixa.className='contador-fps';
  caixa.setAttribute('aria-hidden','true');host.appendChild(caixa);
  let relogio:number|null=null,ligado:Phaser.Game|null=null,quadros=0,desde=performance.now();
  const contar=()=>{quadros++;};
  const desligar=()=>{ligado?.events.off('postrender',contar);ligado=null;quadros=0;};
  const medir=()=>{
    const atual=jogo(),agora=performance.now();
    if(atual!==ligado){desligar();ligado=atual;ligado?.events.on('postrender',contar);desde=agora;}
    if(!ligado){caixa.textContent='-- FPS';return;}
    if(ligado.isPaused){caixa.textContent='PAUSADO';quadros=0;desde=agora;return;}
    const tempo=agora-desde;
    caixa.textContent=tempo>0?`${Math.round(quadros*1000/tempo)} FPS`:'-- FPS';
    quadros=0;desde=agora;
  };
  settingsStore.subscribe(({mostrarFps})=>{
    caixa.hidden=!mostrarFps;
    if(mostrarFps && relogio===null){medir();relogio=window.setInterval(medir,500);}
    else if(!mostrarFps && relogio!==null){window.clearInterval(relogio);relogio=null;desligar();}
  });
}
