import {EventEmitter} from 'node:events';
import type * as Phaser from 'phaser';
import {describe,expect,it,vi} from 'vitest';
vi.mock('phaser',()=>({Scenes:{Events:{SHUTDOWN:'shutdown'}}}));
import {criarHumoresTorcida} from './torcidaHumorCena';
import type {TorcedorNaCena} from './torcidaMovimentoCena';
class Sprite {
  active=true;visible=true;x=0;y=0;angle=0;frame={name:0};data=new Map<string,unknown>();
  anims={currentAnim:null as {key:string}|null};
  play(arg:{key:string;startFrame:number}){this.anims.currentAnim={key:arg.key};this.frame.name=arg.startFrame;return this;}
  setOrigin(){return this;}setScale(){return this;}
  setDepth(){return this;}
  setData(k:string,v:unknown){this.data.set(k,v);return this;}
  setPosition(x:number,y:number){this.x=x;this.y=y;return this;}
  setAngle(angle:number){this.angle=angle;return this;}
  destroy(){this.active=false;}
}
describe('arremessos decorativos da torcida',()=>{
  it('reutiliza a arte preparada sem refazer texturas para cada atualizacao',()=>{
    const events=new EventEmitter(),time={now:1000};
    const scene={events,time,make:{sprite:()=>new Sprite()}} as unknown as Phaser.Scene;
    const p:TorcedorNaCena={x:459,fileira:0,lado:0,tipo:0,camisa:0,sprite:new Sprite() as unknown as Phaser.GameObjects.Sprite,extras:[]};
    const arte=vi.fn((_p:TorcedorNaCena,h:string)=>({textura:h,anim:h}));
    const controle=criarHumoresTorcida(scene,1,[{y:290,escala:.835}],[p],arte);
    events.emit('torcida-vida',.2,.9);
    for(let i=0;i<300;i++)controle.atualizar();
    expect(arte).toHaveBeenCalledTimes(1);
    events.emit('torcida-arremesso',p);controle.atualizar();expect(arte).toHaveBeenCalledTimes(2);
    time.now+=1000;for(let i=0;i<300;i++)controle.atualizar();expect(arte).toHaveBeenCalledTimes(2);
  });
  it('interrompe o gesto bravo quando o jogador recupera a vantagem',()=>{
    const events=new EventEmitter(),time={now:1000};
    const scene={events,time,make:{sprite:()=>new Sprite()}} as unknown as Phaser.Scene;
    const sprite=new Sprite();
    const p:TorcedorNaCena={x:459,fileira:0,lado:0,tipo:0,camisa:0,sprite:sprite as unknown as Phaser.GameObjects.Sprite,extras:[]};
    const controle=criarHumoresTorcida(scene,1,[{y:290,escala:.835}],[p],(_p,h)=>({textura:h,anim:h}),'copo');
    events.emit('torcida-vida',.2,.9);events.emit('torcida-arremesso',p);
    expect(sprite.anims.currentAnim?.key).toBe('brava');
    events.emit('torcida-vida',.9,.2);time.now+=334;controle.atualizar();
    expect(sprite.anims.currentAnim?.key).toBe('torcendo');
    expect(controle.sprites()).toHaveLength(0);
  });
  it('solta no quadro certo, nasce na mao e respeita intervalo e limpeza',()=>{
    const events=new EventEmitter(),time={now:1000};
    const scene={events,time,make:{sprite:(c:{x:number;y:number})=>new Sprite().setPosition(c.x,c.y)}} as unknown as Phaser.Scene;
    const original=new Sprite();
    const p:TorcedorNaCena={x:459,fileira:0,lado:0,tipo:0,camisa:0,sprite:original as unknown as Phaser.GameObjects.Sprite,extras:[]};
    const controle=criarHumoresTorcida(scene,1,[{y:290,escala:.835}],[p],(_p,h)=>({textura:h,anim:h}),'copo');
    events.emit('torcida-vida',.2,.9);controle.atualizar();
    original.frame.name=0;controle.atualizar();expect(controle.sprites()).toHaveLength(0);
    original.frame.name=2;time.now+=167;controle.atualizar();expect(controle.sprites()).toHaveLength(0);
    events.emit('torcida-arremesso',p);controle.atualizar();
    expect(original.anims.currentAnim?.key).toBe('brava');expect(original.frame.name).toBe(0);
    time.now+=334;controle.atualizar();expect(controle.sprites()).toHaveLength(1);
    expect(controle.sprites()[0].x).toBeGreaterThan(400);
    expect(controle.sprites()[0].y).toBeLessThan(290);
    for(let i=0;i<10;i++)controle.atualizar();expect(controle.sprites()).toHaveLength(1);
    time.now+=1500;controle.atualizar();
    expect(controle.sprites()[0].y).toBeGreaterThanOrEqual(760);
    expect(controle.sprites()[0].y).toBeLessThanOrEqual(820);
    time.now+=500;controle.atualizar();expect(controle.sprites()).toHaveLength(0);
    expect(original.anims.currentAnim?.key).toBe('irritada');
    original.visible=false;time.now+=10000;controle.atualizar();expect(controle.sprites()).toHaveLength(0);
    events.emit('torcida-reiniciar');expect(controle.sprites()).toHaveLength(0);
    events.emit('shutdown');expect(events.listenerCount('torcida-derrota')).toBe(0);
    expect(events.listenerCount('torcida-vida')).toBe(0);
    expect(events.listenerCount('torcida-arremesso')).toBe(0);
  });
});
