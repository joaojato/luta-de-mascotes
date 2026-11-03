import { describe,expect,it } from 'vitest';
import { camadaDaFileira,camadaDoPercurso,comporCamadasTorcida } from './torcidaCamadas';
import { embaralharPessoas,MAPA_TORCIDA,perfilDeCirculacao,rotaDeSaida } from './torcidaRotas';

describe('estrutura da arquibancada',()=>{
  it('uma perna que chega a fileira inferior continua atras da cadeira e da pessoa dessa fileira',()=>{
    const cadeira0={nome:'cadeira-alta',camada:0},cadeira1={nome:'cadeira-baixa',camada:1};
    const pessoa0={nome:'pessoa-alta',camada:0},pessoa1={nome:'pessoa-baixa',camada:1};
    const andando={nome:'andando-em-cima',camada:camadaDoPercurso({x:500,y:307,nivel:12,escala:.835,etapa:'fileira'},290)};
    const ordem=comporCamadasTorcida([cadeira0,cadeira1],[pessoa0,pessoa1],[andando],p=>p.camada);
    expect(ordem.indexOf(andando)).toBeLessThan(ordem.indexOf(cadeira1));
    expect(ordem.indexOf(andando)).toBeLessThan(ordem.indexOf(pessoa1));
    const vazia=comporCamadasTorcida([cadeira0,cadeira1],[pessoa0],[andando],p=>p.camada);
    expect(vazia.indexOf(andando)).toBeLessThan(vazia.indexOf(cadeira1));
  });
  it('centrais e laterais no mesmo patamar compartilham camada, e o corredor fica na frente',()=>{
    expect(camadaDaFileira(290)).toBe(camadaDaFileira(292));
    expect(camadaDaFileira(468)).toBe(camadaDaFileira(470));
    expect(camadaDoPercurso({x:147,y:623,nivel:0,escala:1,etapa:'saida'},290)).toBe(13);
  });
  it('tres corredores distintos seguem a escada sem cortar assentos',()=>{
    const rotas=([0,1,2] as const).map(corredor=>rotaDeSaida({x:650,y:290,escala:.835,setor:'central',corredor}));
    expect(new Set(rotas.map(r=>r[1].x)).size).toBe(3);
    rotas.forEach(r=>r.slice(1,-1).forEach(p=>{
      const centro=MAPA_TORCIDA.niveis.find(n=>n.nivel===p.nivel)!.escadaEsquerdaX;
      expect(Math.abs(p.x-centro)).toBeLessThanOrEqual(27);
      expect(p.y).toBeLessThanOrEqual(623);
    }));
  });
  it('a massa usa as tres faixas e varia a largada e a velocidade',()=>{
    const perfis=Array.from({length:100},(_,i)=>perfilDeCirculacao(400+i*3,i%39,i%10));
    expect(new Set(perfis.map(p=>p.corredor))).toEqual(new Set([0,1,2]));
    expect(new Set(perfis.map(p=>p.atraso)).size).toBeGreaterThan(30);
    expect(new Set(perfis.map(p=>p.velocidade)).size).toBeGreaterThan(30);
    expect(perfis.every(p=>Math.abs(p.desvio)<=2.5)).toBe(true);
  });
  it('sorteia pessoas espalhadas entre fileiras, sem retirar uma sequencia de assentos',()=>{
    let seed=1959;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    const pessoas=Array.from({length:390},(_,i)=>({fileira:Math.floor(i/10),assento:i%10}));
    const escolhidos=embaralharPessoas(pessoas,random).slice(0,137);
    expect(new Set(escolhidos.map(p=>p.fileira)).size).toBeGreaterThan(30);
    expect(new Set(escolhidos.map(p=>p.assento)).size).toBe(10);
    expect(escolhidos.some((p,i)=>i>0 && p.fileira<escolhidos[i-1].fileira)).toBe(true);
  });
  it('pode mudar entre os tres corredores ao descer, sem ultrapassar a largura da escada',()=>{
    const rota=rotaDeSaida({x:650,y:290,escala:.835,setor:'central',corredor:0,variarCorredor:true});
    const laterais=rota.slice(1,-1).map(p=>p.x-MAPA_TORCIDA.niveis.find(n=>n.nivel===p.nivel)!.escadaEsquerdaX);
    expect(laterais.some(x=>x<0)).toBe(true);
    expect(laterais.some(x=>x>=0)).toBe(true);
    expect(laterais.every(x=>Math.abs(x)<=27)).toBe(true);
  });
});
