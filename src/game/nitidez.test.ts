import {EventEmitter} from 'node:events';
import {afterEach,describe,expect,it,vi} from 'vitest';
import type * as Phaser from 'phaser';
vi.mock('phaser',()=>({Scenes:{START:1,RUNNING:5,Events:{START:'start',ADDED_TO_SCENE:'added'}},Core:{Events:{READY:'ready',DESTROY:'destroy'}},GameObjects:{Text:class{}}}));
import {decidirEscala,instalarNitidez,telaDe} from './nitidez';
import {escolherFormato} from '../toque/formatoTela';

afterEach(()=>vi.unstubAllGlobals());
describe('redimensionamento mobile sem reiniciar a partida',()=>{
  it('mantem a geometria e restaura canvas e camera apos girar varias vezes',()=>{
    const eventos=new EventEmitter(),janela=new EventEmitter(),visual=new EventEmitter();
    vi.stubGlobal('document',{documentElement:{classList:{contains:()=>true},style:{setProperty:vi.fn()}}});
    vi.stubGlobal('window',{innerWidth:844,innerHeight:390,devicePixelRatio:2,matchMedia:()=>({matches:false}),
      addEventListener:janela.on.bind(janela),removeEventListener:janela.off.bind(janela),dispatchEvent:(e:Event)=>janela.emit(e.type),
      visualViewport:{addEventListener:visual.on.bind(visual),removeEventListener:visual.off.bind(visual)}});
    vi.stubGlobal('requestAnimationFrame',(fn:()=>void)=>{fn();return 1;});vi.stubGlobal('cancelAnimationFrame',()=>{});
    vi.stubGlobal('ResizeObserver',class{observe(){}disconnect(){}});
    const area={clientWidth:844,clientHeight:390,style:{setProperty:vi.fn()}} as unknown as HTMLElement;
    const inicial=decidirEscala(1280,720,area);
    const camera={setSize:vi.fn().mockReturnThis(),setOrigin:vi.fn().mockReturnThis(),setZoom:vi.fn().mockReturnThis()};
    const cena={scene:{key:'MatchScene'},events:new EventEmitter(),sys:{events:new EventEmitter(),isActive:()=>true,isPaused:()=>false},cameras:{main:camera}};
    const scale={width:inicial.width,height:inicial.height,getParentBounds:vi.fn(),refresh:vi.fn(),setGameSize(w:number,h:number){this.width=w;this.height=h;}};
    const game={isBooted:true,canvas:{},scale,events:eventos,scene:{scenes:[cena]}} as unknown as Phaser.Game;
    instalarNitidez(game,area);
    const antes={width:scale.width,height:scale.height},logico=telaDe({scale} as unknown as Phaser.Scene);
    for(let i=0;i<5;i++){
      Object.assign(area,{clientWidth:390,clientHeight:390*720/logico.width});visual.emit('resize');
      expect(telaDe({scale} as unknown as Phaser.Scene)).toEqual(logico);
      Object.assign(area,{clientWidth:844,clientHeight:390});janela.emit('resize');
      expect({width:scale.width,height:scale.height}).toEqual(antes);
      expect(camera.setSize).toHaveBeenLastCalledWith(antes.width,antes.height);
    }
    const reflow=vi.fn();cena.events.on('tela-logica-alterada',reflow);
    escolherFormato('4:3');expect(telaDe({scale} as unknown as Phaser.Scene).width).toBe(960);expect(reflow).toHaveBeenCalledTimes(1);
    escolherFormato('16:9');expect(telaDe({scale} as unknown as Phaser.Scene).width).toBe(1280);
    escolherFormato('auto');
    eventos.emit('destroy');expect(janela.listenerCount('resize')).toBe(0);expect(visual.listenerCount('resize')).toBe(0);
  });
});
