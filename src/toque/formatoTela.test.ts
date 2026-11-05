import {describe,expect,it} from 'vitest';
import {larguraFormato,proporcaoFormato} from './formatoTela';
describe('formatos da tela de jogo',()=>{
  it('altera a largura logica preservando altura e proporcoes dos personagens',()=>{
    expect(larguraFormato('auto',1558)).toBe(1558);
    expect(larguraFormato('4:3',1558)).toBe(960);
    expect(larguraFormato('16:9',1558)).toBe(1280);
    expect(larguraFormato('18:9',1558)).toBe(1440);
    expect(proporcaoFormato('4:3')).toBe(4/3);
  });
});
