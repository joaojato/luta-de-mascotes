import {EventEmitter} from 'node:events';
import type * as Phaser from 'phaser';
import {afterEach,describe,expect,it,vi} from 'vitest';
import {createStore} from '../game/store';
import type {GameSettings} from '../game/types';
import {montarContadorDeFps} from './contadorFps';
afterEach(()=>vi.unstubAllGlobals());
describe('FPS renderizado',()=>{
  it('acompanha quedas reais, pausa e desligamento do contador',()=>{
    let agora=0,tick=()=>{};
    const caixa={className:'',textContent:'',hidden:false,setAttribute(){}};
    vi.stubGlobal('document',{createElement:()=>caixa});
    vi.stubGlobal('performance',{now:()=>agora});
    vi.stubGlobal('window',{setInterval:(fn:()=>void)=>{tick=fn;return 1;},clearInterval:vi.fn()});
    const game={events:new EventEmitter(),isPaused:false};
    const store=createStore({mostrarFps:true} as GameSettings);
    montarContadorDeFps({appendChild(){}} as unknown as HTMLElement,store,()=>game as unknown as Phaser.Game);
    for(let i=0;i<30;i++)game.events.emit('postrender');agora=500;tick();expect(caixa.textContent).toBe('60 FPS');
    for(let i=0;i<5;i++)game.events.emit('postrender');agora=1000;tick();expect(caixa.textContent).toBe('10 FPS');
    game.isPaused=true;agora=1500;tick();expect(caixa.textContent).toBe('PAUSADO');
    store.patchState({mostrarFps:false});expect(caixa.hidden).toBe(true);expect(game.events.listenerCount('postrender')).toBe(0);
    expect(window.clearInterval).toHaveBeenCalledTimes(1);
  });
});
