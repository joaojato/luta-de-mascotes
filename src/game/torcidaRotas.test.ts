import { describe, expect, it } from 'vitest';
import {readFileSync} from 'node:fs';
const dados=JSON.parse(readFileSync(new URL('../../public/assets/cenarios/estadio/torcida/torcida.json',import.meta.url),'utf-8'));
import { avancarPercurso, iniciarPercurso, MAPA_TORCIDA, quantidadeParaSair, rotaDeSaida } from './torcidaRotas';

describe('torcida sai pelas escadas antes do nivel zero', () => {
  it('todas as fileiras e ambas as metades chegam ao nivel 0 antes da saida', () => {
    for (const fila of dados.fileiras) {
      for (const x of [fila.xInicio, fila.xFim]) {
        const rota = rotaDeSaida({ x, y: fila.y, escala: fila.escala, setor: fila.setor });
        expect(rota[1].y).toBe(rota[0].y);
        for (let i = 1; i < rota.length; i++) {
          expect(rota[i].nivel).toBeLessThanOrEqual(rota[i-1].nivel);
          expect(rota[i].y).toBeGreaterThanOrEqual(rota[i-1].y);
          if (rota[i].etapa === 'saida') expect(rota[i-1].nivel).toBe(0);
        }
        expect(rota.at(-1)?.nivel).toBe(0);
        expect(rota.at(-1)?.y).toBe(MAPA_TORCIDA.chaoZero);
      }
    }
  });
  it('a escada central acompanha a abertura da pintura e nao cruza os assentos', () => {
    const rota = rotaDeSaida({ x: 700, y: 290, escala: .835, setor: 'central' });
    const escada = rota.filter((p) => p.etapa === 'escada');
    expect(escada).toHaveLength(12);
    escada.forEach((p, i) => expect(p.x).toBeLessThan(i ? escada[i-1].x : rota[1].x));
  });
  it('continua simulando a descida externa mesmo depois que o lateral sai do enquadramento', () => {
    const estado = iniciarPercurso(rotaDeSaida({ x: 20, y: 292, escala: .65, setor: 'lateral-esquerda' }));
    avancarPercurso(estado, 3);
    expect(estado.ponto.x).toBeLessThan(0);
    expect(estado.concluido).toBe(false);
    expect(estado.ponto.nivel).toBeGreaterThan(0);
    avancarPercurso(estado, 1000);
    expect(estado.concluido).toBe(true);
    expect(estado.ponto.nivel).toBe(0);
  });
  it('tempo fracionado e acumulado percorrem a mesma rota, sem teletransporte', () => {
    const rota = rotaDeSaida({ x: 1750, y: 340, escala: .855, setor: 'central' });
    const a = iniciarPercurso(rota), b = iniciarPercurso(rota);
    avancarPercurso(a, 4);
    for (let i=0;i<40;i++) avancarPercurso(b, .1);
    expect(a.ponto.x).toBeCloseTo(b.ponto.x, 5);
    expect(a.ponto.y).toBeCloseTo(b.ponto.y, 5);
    expect(a.concluido).toBe(false);
  });
  it('primeira derrota esvazia parte; a decisiva esvazia tudo', () => {
    expect(quantidadeParaSair(350, false, .07)).toBe(25);
    expect(quantidadeParaSair(350, false, .35)).toBe(123);
    expect(quantidadeParaSair(350, true)).toBe(350);
    expect(quantidadeParaSair(0, false)).toBe(0);
  });
});
