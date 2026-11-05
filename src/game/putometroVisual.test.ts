import type * as Phaser from 'phaser';
import {describe,expect,it,vi} from 'vitest';
import {PutometroVisual} from './putometroVisual';
import {agirNoPutometro,novoPutometro} from './putometro';
describe('custo do medidor parado',()=>{
  it('mantem o desenho pronto e so redesenha quando o ponteiro ou estado muda',()=>{
    const clear=vi.fn();
    const graphics:unknown=new Proxy({}, {get:(_t,key)=>key==='clear'?()=>{clear();return graphics;}:()=>graphics});
    const text={width:110,displayHeight:18,style:{color:''},setOrigin(){return this;},setText(){return this;},setScale(){return this;},setColor(c:string){this.style.color=c;return this;}};
    const root={add(){},setAlpha(){return this;},setScale(){return this;}};
    const scene={add:{container:()=>root,graphics:()=>graphics,text:()=>text},tweens:{add:()=>({stop(){}})}} as unknown as Phaser.Scene;
    const medidor=new PutometroVisual(scene,root as unknown as Phaser.GameObjects.Container,0,0,120,140);
    const e=novoPutometro();for(let i=0;i<300;i++)medidor.atualizar(e,0,16);
    expect(clear).toHaveBeenCalledTimes(1);
    agirNoPutometro(e,0,'dano',.1);medidor.atualizar(e,0,16);expect(clear).toHaveBeenCalledTimes(2);
  });
});
