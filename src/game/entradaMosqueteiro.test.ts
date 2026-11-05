import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {getCharacterDefinition} from './hero';
import {etapasDaAbertura} from './aberturaDaLuta';

describe('entrada do Mosqueteiro Paulista',()=>{
  it('registra o preparo sem ataque e termina antes do 3',()=>{
    const entrada=getCharacterDefinition('mosqueteiro').animations.find(a=>a.action==='entrance')!;
    expect(entrada).toBeDefined();
    expect(entrada.sheet.url).toBe('/assets/lutadores/mosqueteiro/jogo-v1/entrada-v3/entrance.png');
    expect(entrada.sheet.frames).toBe(15);
    expect(entrada.repeat).toBe(0);
    expect(entrada.bounds.every(f=>f.attack===null&&f.guard===null)).toBe(true);
    const png=readFileSync(`public${entrada.sheet.url}`);
    expect([png.readUInt32BE(16),png.readUInt32BE(20)]).toEqual([512*5,384*3]);
    const ms=entrada.sheet.frames*1000/entrada.frameRate+entrada.frameDurations!.reduce((s,n)=>s+n,0);
    expect(ms).toBe(4000);
    const contagem=etapasDaAbertura(ms);
    expect(contagem[1].em).toBeLessThan(ms);
    expect(contagem[2].em).toBeGreaterThanOrEqual(ms+200);
  });
});
