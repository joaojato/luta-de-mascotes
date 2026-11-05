import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {getCharacterDefinition} from './hero';
import {ENTRADA_BIRA} from './biribaEntrada';
import {PAUSA_ANTES_DA_ENTRADA_MS,etapasDaAbertura} from './aberturaDaLuta';

describe('encontro do Bira com o Biriba',()=>{
  it('sincroniza chegada, carinho, volta, giro e contagem',()=>{
    const entrada=getCharacterDefinition('cachorro').animations.find(a=>a.action==='entrance')!;
    expect(entrada.entranceReverseFacing).toBe(true);
    expect(entrada.repeat).toBe(0);
    expect(entrada.bounds.every(f=>f.attack===null&&f.guard===null)).toBe(true);
    const tempos=entrada.frameDurations!.map(ms=>ms+1000/entrada.frameRate);
    const inicio=(frame:number)=>PAUSA_ANTES_DA_ENTRADA_MS+tempos.slice(0,frame).reduce((s,n)=>s+n,0);
    expect(inicio(5)).toBe(ENTRADA_BIRA.carinho);
    expect(inicio(9)).toBe(ENTRADA_BIRA.volta);
    expect(ENTRADA_BIRA.chegada).toBeLessThan(inicio(5));
    expect(ENTRADA_BIRA.saiu).toBeLessThan(inicio(15));
    expect(tempos.reduce((s,n)=>s+n,0)).toBe(ENTRADA_BIRA.duracao);
    const contagem=etapasDaAbertura(ENTRADA_BIRA.duracao+PAUSA_ANTES_DA_ENTRADA_MS);
    expect(contagem[2].em).toBeGreaterThan(ENTRADA_BIRA.saiu);
    const png=readFileSync(`public${entrada.sheet.url}`);
    expect([png.readUInt32BE(16),png.readUInt32BE(20)]).toEqual([512*5,320*4]);
  });
});
