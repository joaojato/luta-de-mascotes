import { describe, expect, it } from 'vitest';
import { atribuirTecla, CONTROLES_PADRAO, nomeDaTecla, sanitizarControles } from './controles';

const VALIDAS = new Set(['A', 'B', 'C', 'D', 'F', 'G', 'K', 'L', 'S', 'V', 'W', 'H', 'R', 'LEFT', 'RIGHT', 'UP', 'DOWN', 'COMMA', 'PERIOD', 'FORWARD_SLASH']);

describe('botões da luta', () => {
  it('volta ao padrão o que falta, é inválido ou reservado', () => {
    const controles = sanitizarControles({ p1: { light: 'H', heavy: 'R', jump: 'XYZ' } }, VALIDAS);
    expect(controles.p1.light).toBe('H');
    expect(controles.p1.heavy).toBe(CONTROLES_PADRAO.p1.heavy);
    expect(controles.p1.jump).toBe(CONTROLES_PADRAO.p1.jump);
    expect(controles.p2).toEqual(CONTROLES_PADRAO.p2);
    expect(sanitizarControles('lixo', VALIDAS)).toEqual(CONTROLES_PADRAO);
  });
  it('troca as teclas quando a nova já tinha dono, inclusive do outro lado', () => {
    const mesmoLado = atribuirTecla(CONTROLES_PADRAO, 'p1', 'light', 'G');
    expect(mesmoLado.p1.light).toBe('G');
    expect(mesmoLado.p1.heavy).toBe('F');
    const outroLado = atribuirTecla(CONTROLES_PADRAO, 'p1', 'lowKick', 'L');
    expect(outroLado.p1.lowKick).toBe('L');
    expect(outroLado.p2.special).toBe('B');
    expect(CONTROLES_PADRAO.p1.light).toBe('F');
  });
  it('mostra nomes curtos', () => {
    expect(nomeDaTecla('COMMA')).toBe(',');
    expect(nomeDaTecla('LEFT')).toBe('←');
    expect(nomeDaTecla('A')).toBe('A');
    expect(nomeDaTecla('NUMPAD_ONE')).toBe('Num one');
  });
});
