import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { getCharacterDefinition } from './hero';
import { etapasDaAbertura } from './aberturaDaLuta';

describe('entrada do Dragão', () => {
  it('carrega na skin selecionável, sem dano nem loop e sem mudar a célula', () => {
    const character = getCharacterDefinition('dragao');
    const entrada = character.animations.find(a => a.action === 'entrance')!;
    const idle = character.animations.find(a => a.action === 'idle')!;
    expect(entrada).toBeDefined();
    expect(entrada.repeat).toBe(0);
    expect(entrada.bounds.every(f => f.attack === null && f.guard === null)).toBe(true);
    expect([entrada.sheet.frameWidth, entrada.sheet.frameHeight]).toEqual([idle.sheet.frameWidth, idle.sheet.frameHeight]);
    expect(entrada.sheet.url).toBe('/assets/lutadores/dragao/jogo-v1/entrada-v1/entrance.png');
    const png = readFileSync(`public${entrada.sheet.url}`);
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([512 * 5, 384 * 4]);
    const duracao = entrada.sheet.frames * 1000 / entrada.frameRate + entrada.frameDurations!.reduce((s, ms) => s + ms, 0);
    expect(duracao).toBe(3400);
    const contagem = etapasDaAbertura(duracao);
    expect(contagem[0].em).toBeLessThan(duracao);
    expect(contagem[1].em).toBeLessThan(duracao);
    expect(contagem[2].em).toBeGreaterThanOrEqual(duracao + 200);
  });
});
