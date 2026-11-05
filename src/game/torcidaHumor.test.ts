import {describe,expect,it} from 'vitest';
import {CICLO_IRRITADA,humorPeloMedidor,humorDoTorcedor,humorPorResultado,humorPorVida,novoHumorTorcida} from './torcidaHumor';
describe('torcida quieta, comemorando e brava',()=>{
  it('amarelo alterna apoio e hesitacao em ritmos individuais, sem irritacao',()=>{
    const humores=new Set(Array.from({length:100},(_,seed)=>humorPeloMedidor(2,5000,seed*127)));
    expect([...humores].sort()).toEqual(['quieta','torcendo']);
    for(const seed of [1,137,801]){
      const aoLongoDoTempo=new Set(Array.from({length:200},(_,i)=>humorPeloMedidor(2,i*100,seed)));
      expect([...aoLongoDoTempo].sort()).toEqual(['quieta','torcendo']);
    }
  });
  it('reclamacao usa movimentos com copo na mao e nunca o quadro de arremesso',()=>{
    expect(new Set(CICLO_IRRITADA).size).toBeGreaterThan(1);
    expect(CICLO_IRRITADA).not.toContain(2);
    expect(CICLO_IRRITADA).not.toContain(3);
    expect(humorPeloMedidor(1,0,1)).toBe('irritada');
  });
  it('fica quieta a maior parte do tempo, com fases diferentes entre pessoas',()=>{
    const e=novoHumorTorcida();
    const tempos=Array.from({length:100},(_,i)=>humorDoTorcedor(e,0,i*100,0));
    expect(tempos.filter(h=>h==='quieta')).toHaveLength(70);
    expect(humorDoTorcedor(e,0,0,0)).not.toBe(humorDoTorcedor(e,0,0,8000));
  });
  it('derrotados ficam bravos e vencedores comemoram sem uniformizar toda a torcida',()=>{
    const e=novoHumorTorcida();humorPorResultado(e,0,false,1000);
    expect(humorDoTorcedor(e,0,2000,1)).toBe('irritada');
    expect(humorDoTorcedor(e,1,2000,1)).toBe('torcendo');
    expect(humorDoTorcedor(e,0,2000,5)).toBe('quieta');
    expect(humorDoTorcedor(e,0,30000,1)).not.toBe('brava');
  });
  it('a pressao por vida altera so o humor do lado que esta apanhando',()=>{
    const e=novoHumorTorcida();humorPorVida(e,.2,.8);
    expect(humorDoTorcedor(e,0,0,1)).toBe('irritada');
    expect(humorDoTorcedor(e,1,0,1)).toBe('torcendo');
    humorPorVida(e,1,1);expect(humorDoTorcedor(e,0,0,1)).toBe('quieta');
  });
  it('a torcida que vira comemora e a que sofre a virada fica irritada sem todos arremessarem',()=>{
    const e=novoHumorTorcida();humorPorVida(e,.2,.9);humorPorVida(e,1,1);humorPorVida(e,.9,.2);
    expect(humorDoTorcedor(e,0,1000,1)).toBe('torcendo');
    expect(humorDoTorcedor(e,1,1000,1)).toBe('irritada');
    humorPorVida(e,.9,.4);expect(e.viradaContra).toBe(null);
  });
  it('mantem toda a torcida feliz com round ganho e vantagem absoluta no seguinte',()=>{
    const e=novoHumorTorcida();humorPorResultado(e,1,false,1000);
    humorPorVida(e,1,1);
    for(let seed=0;seed<100;seed++)expect(humorDoTorcedor(e,0,20000,seed)).toBe('torcendo');
    humorPorVida(e,1,.01);
    for(let seed=0;seed<100;seed++)expect(humorDoTorcedor(e,0,30000,seed)).toBe('torcendo');
  });
  it('apaga a frustracao anterior assim que o lado passa a ganhar por vida',()=>{
    const e=novoHumorTorcida();humorPorResultado(e,0,false,1000);
    humorPorVida(e,.8,.7);
    for(let seed=0;seed<100;seed++)expect(humorDoTorcedor(e,0,2000,seed)).toBe('torcendo');
    expect(e.bravaAte[0]).toBe(0);
    humorPorVida(e,.2,.9);
    expect(humorDoTorcedor(e,0,3000,1)).toBe('irritada');
    expect(humorDoTorcedor(e,1,3000,1)).toBe('torcendo');
  });
});
