import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {getCharacterDefinition} from './hero';
import {etapasDaAbertura,PAUSA_ANTES_DA_ENTRADA_MS} from './aberturaDaLuta';

describe('intros próprias dos personagens restantes',()=>{
  it.each(['saci','cartola','galo','porco','bahia','mosqueteiro-gremio'])('%s termina na guarda sem ataque, antes do 3',id=>{
    const char=getCharacterDefinition(id);
    const a=char.animations.find(a=>a.action==='entrance')!;
    const idle=char.animations.find(a=>a.action==='idle')!;
    expect(a).toBeDefined();
    expect(a.repeat).toBe(0);
    expect(a.bounds.every(f=>f.attack===null&&f.guard===null)).toBe(true);
    const quadros=['saci','cartola','galo','mosqueteiro-gremio'].includes(id)?24:12;
    expect(a.sheet.frames).toBe(quadros);
    const alturaDoPiso=(b:typeof a)=>b.bounds[0].visual.y+b.bounds[0].visual.height-b.sheet.frameHeight;
    expect(alturaDoPiso(a)).toBe(alturaDoPiso(idle));
    const duracao=a.sheet.frames*1000/a.frameRate+a.frameDurations!.reduce((s,n)=>s+n,0);
    expect(duracao).toBe(quadros===24?2205:3150);
    expect(etapasDaAbertura(PAUSA_ANTES_DA_ENTRADA_MS+duracao)[2].em).toBeGreaterThanOrEqual(PAUSA_ANTES_DA_ENTRADA_MS+duracao+200);
    const png=readFileSync(`public${a.sheet.url}`);
    expect([png.readUInt32BE(16),png.readUInt32BE(20)]).toEqual([5*a.sheet.frameWidth,Math.ceil(quadros/5)*a.sheet.frameHeight]);
  });
  it('impacto sentado do Galo continua sincronizado com o piso aos1795ms',()=>{
    const a=getCharacterDefinition('galo').animations.find(a=>a.action==='entrance')!;
    const antesDoImpacto=14*1000/a.frameRate+a.frameDurations!.slice(0,14).reduce((s,n)=>s+n,0);
    expect(PAUSA_ANTES_DA_ENTRADA_MS+antesDoImpacto).toBe(1795);
  });
});
