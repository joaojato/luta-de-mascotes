import { describe, expect, it } from 'vitest';
import { atribuirTecla, CONTROLES_PADRAO, legendaDosBotoes, nomeDaTecla, sanitizarControles } from './controles';

const VALIDAS = new Set(['A', 'B', 'C', 'D', 'E', 'Q', 'K', 'L', 'S', 'SPACE', 'W', 'H', 'R', 'LEFT', 'RIGHT', 'UP', 'DOWN', 'COMMA', 'PERIOD', 'FORWARD_SLASH']);

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
    const mesmoLado = atribuirTecla(CONTROLES_PADRAO, 'p1', 'light', 'Q');
    expect(mesmoLado.p1.light).toBe('Q');
    expect(mesmoLado.p1.heavy).toBe('E');
    const outroLado = atribuirTecla(CONTROLES_PADRAO, 'p1', 'special', 'L');
    expect(outroLado.p1.special).toBe('L');
    expect(outroLado.p2.special).toBe('SPACE');
    expect(CONTROLES_PADRAO.p1.light).toBe('E');
  });
  it('mostra nomes curtos', () => {
    expect(nomeDaTecla('COMMA')).toBe(',');
    expect(nomeDaTecla('LEFT')).toBe('←');
    expect(nomeDaTecla('A')).toBe('A');
    expect(nomeDaTecla('NUMPAD_ONE')).toBe('Num one');
  });
  it('legenda da luta mostra as teclas salvas, em português', () => {
    expect(legendaDosBotoes(CONTROLES_PADRAO.p1)).toBe('E soco · Q chute · C defende · Espaço especial');
    expect(legendaDosBotoes(CONTROLES_PADRAO.p2)).toBe(', soco · . chute · / defende · L especial');
    const remapeado = atribuirTecla(CONTROLES_PADRAO, 'p1', 'light', 'H');
    expect(legendaDosBotoes(remapeado.p1)).toContain('H soco');
  });
});
