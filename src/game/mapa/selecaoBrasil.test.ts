import {describe,expect,it} from 'vitest';
import {ELENCO_SELECIONAVEL} from '../elenco';
import {LUTADORES} from '../lutadores';
import {UFS,regiaoDe} from '../tutorial/rival';
import {ESTADOS_BRASIL,REGIOES_MAPA,compararOrigem,corDoEstado,estadoDoMapa,layoutSelecao,pontoNoMapa} from './selecaoBrasil';
describe('selecao de lutadores no Brasil',()=>{
  it('cada UF tem tonalidade propria e a ordem agrupa os estados com Sudeste primeiro',()=>{
    expect(new Set(ESTADOS_BRASIL.map(e=>corDoEstado(e.uf))).size).toBe(27);
    const origens=ELENCO_SELECIONAVEL.map(l=>({id:l.id,nome:l.label,uf:LUTADORES.find(j=>j.id===l.id)?.estado}));
    origens.sort((a,b)=>compararOrigem(a.uf,b.uf,a.nome,b.nome,a.id,b.id));
    expect(origens.slice(0,4).map(e=>e.id)).toEqual(['urubu','almirante','cartola','cachorro']);
    const sudeste=[...new Set(origens.filter(e=>estadoDoMapa(e.uf)?.regiao==='Sudeste').map(e=>e.uf))];
    expect(sudeste).toEqual(['RJ','SP','MG']);
    expect(estadoDoMapa(origens[0].uf)?.regiao).toBe('Sudeste');
    const vistos=new Set<string>();let ultimo='';let saiuDoSudeste=false;
    for(const l of origens){
      if(l.uf!==ultimo){expect(vistos.has(l.uf!)).toBe(false);vistos.add(l.uf!);ultimo=l.uf!;}
      if(estadoDoMapa(l.uf)?.regiao!=='Sudeste')saiuDoSudeste=true;
      else expect(saiuDoSudeste).toBe(false);
    }
  });
  it('inclui as 27 UFs e as cinco regioes oficiais',()=>{
    expect(ESTADOS_BRASIL.map(e=>e.uf).sort()).toEqual([...UFS].sort());
    expect(new Set(ESTADOS_BRASIL.map(e=>e.regiao)).size).toBe(5);
    for(const e of ESTADOS_BRASIL)expect(REGIOES_MAPA.some(r=>r.nome===e.regiao)).toBe(true);
  });
  it('cada personagem selecionavel aponta para o estado declarado pelo clube',()=>{
    for(const lutador of ELENCO_SELECIONAVEL){
      const uf=LUTADORES.find(l=>l.id===lutador.id)?.estado;
      const estado=estadoDoMapa(uf);expect(estado,`${lutador.id}: UF ausente`).not.toBeNull();
      expect(regiaoDe(uf)).not.toBeNull();
    }
    expect(estadoDoMapa(undefined)).toBeNull();
  });
  it('todos os marcadores ficam dentro do globo',()=>{
    for(const e of ESTADOS_BRASIL){
      const p=pontoNoMapa(e.centro[0],e.centro[1]);
      expect(Math.hypot(p.x-220,p.y-200)).toBeLessThan(190);
    }
  });
  for(const largura of [960,1280,1440,1680])it(`grade cabe sem cruzar o globo ou o rodape em ${largura}px`,()=>{
    const n=ELENCO_SELECIONAVEL.length+1,l=layoutSelecao(largura,720,n);
    expect(l.colunas*l.tamanho+(l.colunas-1)*l.gap).toBeLessThan(largura-60);
    expect(l.primeiroY-l.tamanho/2).toBeGreaterThan(l.mapaY+190);
    const ultimo=l.primeiroY+Math.floor((n-1)/l.colunas)*(l.tamanho+l.gap)+l.tamanho/2;
    expect(ultimo).toBeLessThan(680);
  });
});
