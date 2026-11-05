import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {getCharacterDefinition} from './hero';
import {PAUSA_ANTES_DA_ENTRADA_MS,etapasDaAbertura} from './aberturaDaLuta';

describe('entrada do Urubu',()=>{
  it('sincroniza pouso sem ataque, pose imponente e guarda antes do 3',()=>{
    const entrada=getCharacterDefinition('urubu').animations.find(a=>a.action==='entrance')!;
    expect(entrada.entranceLandingFrame).toBe(5);
    expect(entrada.repeat).toBe(0);
    expect(entrada.bounds.every(f=>f.attack===null&&f.guard===null)).toBe(true);
    expect([entrada.sheet.frames,entrada.sheet.frameWidth,entrada.sheet.frameHeight]).toEqual([16,512,320]);
    const tempos=entrada.frameDurations!.map(ms=>ms+1000/entrada.frameRate);
    expect(PAUSA_ANTES_DA_ENTRADA_MS+tempos.slice(0,5).reduce((s,n)=>s+n,0)).toBe(1500);
    const fim=PAUSA_ANTES_DA_ENTRADA_MS+tempos.reduce((s,n)=>s+n,0);
    expect(fim).toBe(4100);
    expect(etapasDaAbertura(fim)[2].em).toBeGreaterThanOrEqual(fim+200);
    const png=readFileSync(`public${entrada.sheet.url}`);
    expect([png.readUInt32BE(16),png.readUInt32BE(20)]).toEqual([2560,1280]);
  });
});
