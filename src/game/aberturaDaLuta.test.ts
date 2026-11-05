import { describe, expect, it } from 'vitest';
import { etapasDaAbertura, PAUSA_ANTES_DA_ENTRADA_MS } from './aberturaDaLuta';

describe('abertura da luta', () => {
  it.each([3000, 3400, 4000])('acomoda a pausa inicial e a entrada de %i ms antes do 3', duracao => {
    const total = PAUSA_ANTES_DA_ENTRADA_MS + duracao;
    const etapas = etapasDaAbertura(total);
    const passoAnterior=Math.max(700,Math.ceil((total+200-900)/2));
    expect(etapas[1].em-etapas[0].em).toBe(passoAnterior/2);
    expect(etapas[2].em).toBeGreaterThanOrEqual(total + 200);
    expect(etapas[3].lutar).toBe(true);
  });
  it('conta 1, 2, 3 antes de liberar o combate, mesmo sem entrada própria', () => {
    expect(etapasDaAbertura(0)).toEqual([
      { em: 450, texto: '1', lutar: false },
      { em: 800, texto: '2', lutar: false },
      { em: 1150, texto: '3', lutar: false },
      { em: 1500, texto: 'Lutem!', lutar: true }
    ]);
  });
  it('conta durante a entrada e só mostra o 3 depois da pose final', () => {
    const etapas = etapasDaAbertura(4200);
    expect(etapas[0].em).toBe(2650);
    expect(etapas[1].em).toBeLessThan(4200);
    expect(etapas[2]).toEqual({ em: 4400, texto: '3', lutar: false });
    expect(etapas.at(-1)).toEqual({ em: 5275, texto: 'Lutem!', lutar: true });
    expect(etapas.filter(etapa => etapa.lutar)).toHaveLength(1);
  });
  it('encaixa os três segundos do Coxa no ROUND, 1 e 2', () => {
    expect(etapasDaAbertura(3000)).toEqual([
      { em: 2050, texto: '1', lutar: false },
      { em: 2625, texto: '2', lutar: false },
      { em: 3200, texto: '3', lutar: false },
      { em: 3775, texto: 'Lutem!', lutar: true }
    ]);
  });
});
