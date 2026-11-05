import {describe,expect,it} from 'vitest';
import {amostraEntradaBiriba,alturaVooNpc,ENTRADA_BIRA} from './biribaEntrada';

describe('Biriba como NPC temporário',()=>{
  it.each([[-100,300],[1380,900]])('vem da lateral %i, espera o carinho e retorna à mesma lateral', (lateral,contato)=>{
    expect(amostraEntradaBiriba(0,lateral,contato).visivel).toBe(false);
    const indo=amostraEntradaBiriba(1250,lateral,contato);
    expect(indo.x).toBe((lateral+contato)/2);
    expect(indo.acao).toBe('walk');
    const esperando=amostraEntradaBiriba(ENTRADA_BIRA.carinho,lateral,contato);
    expect(esperando).toMatchObject({x:contato,acao:'idle',visivel:true});
    const voltando=amostraEntradaBiriba(3850,lateral,contato);
    expect(voltando.x).toBe((lateral+contato)/2);
    expect(voltando.acao).toBe('walk');
    expect(voltando.lado).toBe(-indo.lado);
    expect(amostraEntradaBiriba(ENTRADA_BIRA.saiu,lateral,contato).visivel).toBe(false);
    expect(amostraEntradaBiriba(60000,lateral,contato).visivel).toBe(false);
  });
  it('balões entram de baixo, atravessam e saem ganhando altura nos dois lados',()=>{
    for(const [inicio,fim] of [[-100,1380],[1380,-100]]) {
      expect(alturaVooNpc(inicio,inicio,fim,200,0)).toBe(270);
      expect(alturaVooNpc((inicio+fim)/2,inicio,fim,200,0)).toBe(200);
      expect(alturaVooNpc(fim,inicio,fim,200,0)).toBeCloseTo(110);
      expect(Math.abs(alturaVooNpc((inicio+fim)/2,inicio,fim,200,1)-200)).toBeLessThanOrEqual(6);
    }
  });
});
