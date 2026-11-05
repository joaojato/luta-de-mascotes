import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import type * as Phaser from 'phaser';
import {describe,expect,it,vi} from 'vitest';
import {liberarArteTorcida,quadrosCompartilhados} from './torcidaMemoria';
const require=createRequire(import.meta.url);
const Texture=require(resolve(__dirname,'../../node_modules/phaser/src/textures/Texture.js'));
describe('memoria da torcida entre partidas',()=>{
  it('reutiliza a folha original sem copiar pixels nem acumular quadros',()=>{
    const textura=Object.create(Texture.prototype) as Phaser.Textures.Texture;
    Object.assign(textura,{key:'torcida-base',frames:{},source:[{width:512,height:560,image:{width:512,height:560}}],firstFrame:'__BASE',frameTotal:0});
    textura.add('__BASE',0,0,0,512,560);
    for(let i=0;i<30;i++)expect(quadrosCompartilhados(textura,64,112)).toBe('torcida-base');
    expect(textura.frameTotal).toBe(41);
    expect(textura.get(0).width).toBe(64);expect(textura.get(0).height).toBe(112);
    expect(textura.get('__BASE').width).toBe(512);
    expect(textura.get(39).cutY).toBe(448);
    textura.remove('0');textura.add(0,0,0,0,512,560);
    quadrosCompartilhados(textura,64,112);
    expect(textura.get(0).width).toBe(64);expect(textura.get(0).height).toBe(112);
  });
  it('libera variantes e suas animacoes ao fim da partida, preservando as fontes',()=>{
    const vivas=new Set(['original','clube-a','clube-b']),anims=new Set(['base-idle','a-idle','b-andar']);
    const scene={textures:{remove:vi.fn((key:string)=>vivas.delete(key))},anims:{getAnimsFromTexture:(key:string)=>key==='clube-a'?['a-idle']:['b-andar'],remove:vi.fn((key:string)=>anims.delete(key))}} as unknown as Phaser.Scene;
    const temporarias=new Set(['clube-a','clube-b']);liberarArteTorcida(scene,temporarias);
    expect([...vivas]).toEqual(['original']);expect([...anims]).toEqual(['base-idle']);expect(temporarias.size).toBe(0);
    liberarArteTorcida(scene,temporarias);expect(scene.textures.remove).toHaveBeenCalledTimes(2);
  });
});
