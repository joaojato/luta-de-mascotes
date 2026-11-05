import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {amostraEntradaCaravela,geometriaCaravela,ENTRADA_CARAVELA,quadroDaFase} from './entradaCaravela';
import {getCharacterDefinition} from './hero';
import {etapasDaAbertura} from './aberturaDaLuta';

describe('desembarque do Almirante',()=>{
  it('espelha a proa e a trajetória nos dois cantos, em diferentes escalas',()=>{
    for(const escala of [.8,1.4,2]){
      const esquerda=geometriaCaravela(0,400,600,escala,1);
      const direita=geometriaCaravela(1600,1200,600,escala,-1);
      // O centro da proa permanece fora da câmera: nunca revela o navio inteiro.
      expect(esquerda.proaX).toBeLessThan(0);
      expect(direita.proaX).toBeGreaterThan(1600);
      for(const ms of [0,500,1000,2000,2300,3200,3650,4450,5000]){
        const a=amostraEntradaCaravela(ms,esquerda,400),b=amostraEntradaCaravela(ms,direita,1200);
        expect(a.x+b.x).toBeCloseTo(1600);
        expect(a.y).toBe(b.y);
      }
      expect(amostraEntradaCaravela(500,esquerda,400).y).toBe(600-150*escala);
      expect(amostraEntradaCaravela(0,esquerda,400).chegada).toBe(1);
      expect(amostraEntradaCaravela(500,esquerda,400).chegada).toBe(0);
      expect(amostraEntradaCaravela(3650,esquerda,400)).toMatchObject({x:400,y:600,retirada:0});
      expect(amostraEntradaCaravela(4450,esquerda,400)).toMatchObject({visivel:false,retirada:1});
    }
  });
  it('anda três quadros inteiramente no piso antes de parar e preserva o tempo da finalização',()=>{
    const a=getCharacterDefinition('almirante').animations.find(a=>a.action==='entrance')!;
    const movimento=getCharacterDefinition('almirante').animations.find(a=>a.action==='entrance-walk')!;
    expect(a.entranceGangplank).toBe(true);
    expect(a.repeat).toBe(0);
    expect(a.bounds.every(f=>!f.attack&&!f.guard)).toBe(true);
    const tempos=a.frameDurations!.map(n=>n+1000/a.frameRate);
    expect(tempos).toEqual([200,250,400,150]);
    expect(movimento.repeat).toBe(-1);
    const passos=movimento.bounds.map((_,i)=>1000/movimento.frameRate+(movimento.frameDurations?.[i]??0));
    expect(passos).toEqual(Array(6).fill(150));
    const inicio=(i:number)=>500+i*150;
    expect(ENTRADA_CARAVELA.rampaFim-500).toBe(1800);
    expect(inicio(12)).toBe(ENTRADA_CARAVELA.rampaFim);
    expect(inicio(18)).toBe(ENTRADA_CARAVELA.piso);
    expect(inicio(21)).toBe(ENTRADA_CARAVELA.parada);
    for(const lado of [1,-1]as const){
      const g=geometriaCaravela(lado===1?0:1600,lado===1?400:1200,600,1.4,lado);
      const alvo=lado===1?400:1200;
      for(const i of [18,19,20]){
        const pose=amostraEntradaCaravela(inicio(i),g,alvo);
        expect(pose.y).toBe(600);
        // A silhueta tem margem traseira menor que80px nativos.
        expect(lado*(pose.x-g.fimX)).toBeGreaterThanOrEqual(80*1.4-1e-8);
        expect(lado*(alvo-pose.x)).toBeGreaterThan(0);
        expect(pose.retirada).toBe(0);
        expect(pose.fase).toBe('movimento');
      }
    }
    expect(ENTRADA_CARAVELA.parada+tempos.reduce((s,n)=>s+n,0)).toBe(ENTRADA_CARAVELA.fim);
    expect(etapasDaAbertura(ENTRADA_CARAVELA.fim)[2].em).toBeGreaterThan(ENTRADA_CARAVELA.fim);
    const png=readFileSync(`public${a.sheet.url}`);
    expect([png.readUInt32BE(16),png.readUInt32BE(20)]).toEqual([2560,320]);
    const andando=readFileSync(`public${movimento.sheet.url}`);
    expect([andando.readUInt32BE(16),andando.readUInt32BE(20)]).toEqual([2560,640]);
    const g=geometriaCaravela(0,400,600,1,1);
    for(const ms of [650,800,950,1100,1250,1400,3200,3500]){
      const pose=amostraEntradaCaravela(ms,g,400);
      expect(pose.fase).toBe('movimento');
      expect(quadroDaFase(pose.tempoDaFase,passos,true)).toBe(Math.floor((ms-500)/150)%6);
    }
    expect(amostraEntradaCaravela(3650,g,400)).toMatchObject({x:400,y:600,fase:'parado',tempoDaFase:0});
    expect(quadroDaFase(200,tempos,false)).toBe(1);
    expect(quadroDaFase(450,tempos,false)).toBe(2);
    expect(quadroDaFase(10000,tempos,false)).toBe(3);
  });
});
