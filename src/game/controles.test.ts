import { describe, expect, it } from 'vitest';
import { atribuirTecla, CONTROLES_PADRAO, extrasSozinho, legendaDosBotoes, nomeDaTecla, sanitizarControles } from './controles';

const VALIDAS = new Set(['A', 'B', 'C', 'D', 'E', 'Q', 'K', 'L', 'S', 'SPACE', 'W', 'H', 'R', 'LEFT', 'RIGHT', 'UP', 'DOWN', 'COMMA', 'PERIOD', 'FORWARD_SLASH', 'O', 'I', 'P', 'SEMICOLON', 'SHIFT']);

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
    const outroLado = atribuirTecla(CONTROLES_PADRAO, 'p1', 'special', 'SHIFT');
    expect(outroLado.p1.special).toBe('SHIFT');
    expect(outroLado.p2.special).toBe('SPACE');
    expect(CONTROLES_PADRAO.p1.light).toBe('E');
  });
  it('mostra nomes curtos', () => {
    expect(nomeDaTecla('COMMA')).toBe(',');
    // ABNT2: o Ç e o ; ficam onde o teclado americano tem ; e /.
    expect(nomeDaTecla('SEMICOLON')).toBe('Ç');
    expect(nomeDaTecla('FORWARD_SLASH')).toBe(';');
    expect(nomeDaTecla('LEFT')).toBe('←');
    expect(nomeDaTecla('A')).toBe('A');
    expect(nomeDaTecla('NUMPAD_ONE')).toBe('Num one');
  });
  it('legenda da luta mostra as teclas salvas, em português', () => {
    expect(legendaDosBotoes(CONTROLES_PADRAO.p1)).toBe('E Rápido · Q Bruto · C defende · Espaço especial');
    expect(legendaDosBotoes(CONTROLES_PADRAO.p2)).toBe('P Rápido · I Bruto · ; defende · Shift especial');
    const remapeado = atribuirTecla(CONTROLES_PADRAO, 'p1', 'light', 'H');
    expect(legendaDosBotoes(remapeado.p1)).toContain('H Rápido');
  });
  it('P2 é o espelho do P1 na mão direita: O K L Ç, I P ; e Shift', () => {
    expect(CONTROLES_PADRAO.p1).toEqual({ left: 'A', right: 'D', jump: 'W', crouch: 'S', block: 'C', light: 'E', heavy: 'Q', special: 'SPACE' });
    expect(CONTROLES_PADRAO.p2).toEqual({ left: 'K', right: 'SEMICOLON', jump: 'O', crouch: 'L', block: 'FORWARD_SLASH', light: 'P', heavy: 'I', special: 'SHIFT' });
  });
  it('sozinho, I O P somam ao Q E C na mesma ordem, sem roubar tecla já usada', () => {
    expect(extrasSozinho(CONTROLES_PADRAO.p1)).toEqual({ heavy: 'I', light: 'O', block: 'P' });
    const comI = atribuirTecla(CONTROLES_PADRAO, 'p1', 'jump', 'I');
    expect(extrasSozinho(comI.p1)).toEqual({ light: 'O', block: 'P' });
  });
});
