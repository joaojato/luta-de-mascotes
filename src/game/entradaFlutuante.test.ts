import {expect,it} from 'vitest';
import {alturaEntradaFlutuante,alturaEntradaSaltinho} from './entradaFlutuante';
it('aguarda a pose inicial, sobe, sustenta e volta sem atravessar a altura normal',()=>{
  expect([0,500,1350,2050,3300,3650].map(alturaEntradaFlutuante)).toEqual([0,0,80,80,0,0]);
  expect(alturaEntradaFlutuante(900)).toBeGreaterThan(0);
  expect(alturaEntradaFlutuante(2800)).toBeGreaterThan(0);
});
it('saltinho termina exatamente no impacto sentado, sem levantar durante a recuperação',()=>{
  expect([0,500,885,1200,1795,2100,2705].map(alturaEntradaSaltinho)).toEqual([0,0,0,40,0,0,0]);
  expect(alturaEntradaSaltinho(1500)).toBeGreaterThan(0);
});
