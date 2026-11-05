import {describe,expect,it,vi} from 'vitest';
import type * as Phaser from 'phaser';
import type {Fighter} from './fighter';
import {BiribaCena} from './biribaCena';
vi.mock('phaser',()=>({Textures:{FilterMode:{NEAREST:0}}}));
vi.mock('./nitidez',()=>({telaDe:()=>({width:1280})}));

describe('Biriba não permanece no cenário',()=>{
  it('fica oculto fora da entrada, caminha até o Bira e volta sem reaparecer',()=>{
    const objeto=()=>({visible:true,x:0,y:0,flipX:false,play:vi.fn(),destroy:vi.fn(),
      setVisible(v:boolean){this.visible=v;return this;},setX(v:number){this.x=v;return this;},setY(v:number){this.y=v;return this;},
      setFlipX(v:boolean){this.flipX=v;return this;},setOrigin(){return this;},setScale(){return this;},setDepth(){return this;}});
    const sprite=objeto(),shadow=objeto();
    const scene={cameras:{main:{scrollX:0}},textures:{get:()=>({setFilter(){}})},anims:{exists:()=>true},
      add:{sprite:()=>sprite,ellipse:()=>shadow}} as unknown as Phaser.Scene;
    const bira={facingDirection:1,ancoraDoAcompanhante:{x:400,piso:500,escala:1.4,profundidade:7}} as Fighter;
    const npc=new BiribaCena(scene,bira);
    expect(sprite.visible).toBe(false);
    npc.update(10);expect(sprite.visible).toBe(false);
    npc.iniciarEntrada();npc.update(.5);expect(sprite.visible).toBe(true);
    npc.update(1.5);expect(sprite.x).toBe(Math.round(400-62*1.4));expect(sprite.play).toHaveBeenLastCalledWith('biriba-idle');
    npc.update(1.2);expect(sprite.flipX).toBe(false);expect(sprite.play).toHaveBeenLastCalledWith('biriba-walk');
    npc.update(1.3);expect(sprite.visible).toBe(false);expect(shadow.visible).toBe(false);
    npc.update(20);expect(sprite.visible).toBe(false);
    npc.reset();npc.update(1);expect(sprite.visible).toBe(false);
    npc.destroy();expect(sprite.destroy).toHaveBeenCalledOnce();
  });
});
