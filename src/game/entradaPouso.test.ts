import {describe,expect,it} from 'vitest';
import {amostraPousoEntrada} from './entradaPouso';
describe('pouso da entrada',()=>{
  it('espera o primeiro quadro, desce acelerando e não atravessa o piso',()=>{
    expect(amostraPousoEntrada(0,1500,-80,600)).toEqual({y:-80,pousou:false});
    expect(amostraPousoEntrada(500,1500,-80,600)).toEqual({y:-80,pousou:false});
    expect(amostraPousoEntrada(1000,1500,-80,600)).toEqual({y:90,pousou:false});
    expect(amostraPousoEntrada(1500,1500,-80,600)).toEqual({y:600,pousou:true});
    expect(amostraPousoEntrada(9000,1500,-80,600)).toEqual({y:600,pousou:true});
  });
});
