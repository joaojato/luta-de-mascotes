import { EventEmitter } from 'node:events';
import type * as Phaser from 'phaser';
import { describe, expect, it, vi } from 'vitest';
vi.mock('phaser', () => ({ Scenes: { Events: { SHUTDOWN: 'shutdown' } } }));
import { criarCirculacaoTorcida, derrotaDaTorcida, reiniciarTorcida, vidaDaTorcida, type TorcedorNaCena } from './torcidaMovimentoCena';

class SpriteTeste {
  active = true; visible = true; x=0;y=0;
  anims = { currentAnim: null as { key: string } | null, pause() {}, resume() {} };
  setOrigin() { return this; }
  play(key: string) { this.anims.currentAnim={key}; return this; }
  setVisible(v: boolean) { this.visible=v; return this; }
  setPosition(x: number,y: number) { this.x=x;this.y=y;return this; }
  setScale() { return this; }
  setFlipX() { return this; }
  setData() { return this; }
  destroy() { this.active=false; }
}

function cenario(porLado=4,random?:()=>number) {
  const time={now:0};const events=new EventEmitter();
  const scene={time,events,make:{sprite:()=>new SpriteTeste()},sys:{updateList:{add(){}}}} as unknown as Phaser.Scene;
  const originais=Array.from({length:porLado*2},()=>new SpriteTeste());
  const extras=originais.map(()=>new SpriteTeste());
  const pessoas: TorcedorNaCena[]=originais.map((sprite,i)=>({
    x:i<porLado ? 450+i*3 : 1500+(i-porLado)*3,fileira:i%2,lado:i<porLado?0:1,tipo:i%10,camisa:0,
    sprite:sprite as unknown as Phaser.GameObjects.Sprite,extras:[extras[i] as unknown as Phaser.GameObjects.Sprite]
  }));
  let seed=1959;const sortear=random??(()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;});
  const controle=criarCirculacaoTorcida(scene,1,[{y:290,escala:.835,setor:'central'},{y:618,escala:1,setor:'central'}],pessoas,(_p,descer)=>({textura:descer?'descer':'andar',anim:descer?'descer':'andar'}),sortear);
  const avancar=(ms:number)=>{time.now+=ms;controle.atualizar();};
  return { scene,events,controle,originais,extras,avancar };
}

describe('saidas da torcida por resultado',()=>{
  it('na derrota final 90% levantam imediatamente e os ultimos 10% apos 1,5 s',()=>{
    const c=cenario(100);derrotaDaTorcida(c.scene,0,true);
    expect(c.originais.slice(0,100).filter(s=>s.visible)).toHaveLength(10);
    expect(c.originais.slice(100).every(s=>s.visible)).toBe(true);
    c.avancar(1499);expect(c.originais.slice(0,100).filter(s=>s.visible)).toHaveLength(10);
    c.avancar(1);expect(c.originais.slice(0,100).filter(s=>s.visible)).toHaveLength(0);
    for(let i=0;i<2500;i++)c.avancar(100);
    expect(c.controle.sprites()).toHaveLength(0);
  });
  it('recalcula os 10% sobre quem continuava sentado e antecipa saidas pendentes',()=>{
    const c=cenario(100);derrotaDaTorcida(c.scene,0,false,.9);c.avancar(10000);
    derrotaDaTorcida(c.scene,0,true);
    expect(c.originais.slice(0,100).filter(s=>s.visible)).toHaveLength(7);
    c.avancar(1500);expect(c.originais.slice(0,100).filter(s=>s.visible)).toHaveLength(0);
  });
  it('os escolhidos saem individualmente ao longo do tempo, em vez de largar todos juntos',()=>{
    const c=cenario(100);derrotaDaTorcida(c.scene,0,false,.9);c.avancar(1000);
    const inicio=c.originais.slice(0,100).filter(s=>!s.visible).length;
    expect(inicio).toBeLessThan(35);
    c.avancar(10000);
    expect(c.originais.slice(0,100).filter(s=>!s.visible)).toHaveLength(35);
  });
  it('mantem os 35% extras separados das saidas individuais de quem ja perdeu round',()=>{
    const apertado=cenario(100);derrotaDaTorcida(apertado.scene,0,false,.2);apertado.avancar(5000);
    expect(apertado.originais.slice(0,100).filter(s=>!s.visible)).toHaveLength(7);
    const dominio=cenario(100,()=>0);derrotaDaTorcida(dominio.scene,0,false,.9);dominio.avancar(10000);
    expect(dominio.originais.slice(0,100).filter(s=>!s.visible)).toHaveLength(35);
    vidaDaTorcida(dominio.scene,.4,.9);dominio.avancar(1000);
    for(let i=0;i<10;i++)vidaDaTorcida(dominio.scene,.4,.9);
    dominio.avancar(100);expect(dominio.originais.slice(0,100).filter(s=>!s.visible)).toHaveLength(36);
    vidaDaTorcida(dominio.scene,.2,.9);dominio.avancar(10000);
    expect(dominio.originais.slice(0,100).filter(s=>!s.visible)).toHaveLength(71);
    expect(dominio.originais.slice(100).every(s=>s.visible)).toBe(true);
  });
  it('primeira derrota afeta so parte do lado perdedor e evento repetido nao retira mais gente',()=>{
    const c=cenario();derrotaDaTorcida(c.scene,0,false);c.avancar(2500);
    expect(c.originais.slice(0,4).filter(s=>!s.visible)).toHaveLength(2);
    expect(c.originais.slice(4).every(s=>s.visible)).toBe(true);
    derrotaDaTorcida(c.scene,0,false);c.avancar(1000);
    expect(c.originais.slice(0,4).filter(s=>!s.visible)).toHaveLength(2);
    expect(c.extras.slice(0,4).filter(s=>!s.visible)).toHaveLength(2);
  });
  it('derrota decisiva libera perdedores e mantem todos os vencedores',()=>{
    const c=cenario(10);derrotaDaTorcida(c.scene,1,false);c.avancar(2500);
    derrotaDaTorcida(c.scene,1,true);c.avancar(2500);
    expect(c.originais.slice(10).every(s=>!s.visible)).toBe(true);
    for(let i=0;i<1500;i++) c.avancar(100);
    expect(c.controle.sprites()).toHaveLength(0);
    expect(c.originais.slice(0,10).every(s=>s.visible)).toBe(true);
  });
  it('cancela saidas em andamento do vencedor e nao manda os restantes embora',()=>{
    const c=cenario(100);derrotaDaTorcida(c.scene,0,false,1);c.avancar(10000);
    derrotaDaTorcida(c.scene,1,true,1);c.avancar(45000);
    expect(c.originais.slice(0,100).filter(s=>s.visible)).toHaveLength(100);
    expect(c.originais.slice(100).filter(s=>s.visible)).toHaveLength(0);
    derrotaDaTorcida(c.scene,1,true,1);c.avancar(45000);
    expect(c.originais.slice(0,100).filter(s=>s.visible)).toHaveLength(100);
  });
  it('revanche cancela saidas pendentes, restaura pessoas e aderecos e remove ouvintes ao encerrar',()=>{
    const c=cenario();derrotaDaTorcida(c.scene,0,true);c.avancar(400);
    reiniciarTorcida(c.scene);c.avancar(1000);
    expect(c.originais.every(s=>s.visible)).toBe(true);
    expect(c.extras.every(s=>s.visible)).toBe(true);
    expect(c.controle.sprites()).toHaveLength(0);
    c.events.emit('shutdown');
    expect(c.events.listenerCount('torcida-derrota')).toBe(0);
    expect(c.events.listenerCount('torcida-reiniciar')).toBe(0);
    expect(c.events.listenerCount('torcida-vida')).toBe(0);
  });
});
