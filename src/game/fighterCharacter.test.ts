import { describe, expect, it } from 'vitest';
import { buildFighterCharacter } from './fighterCharacter';

describe('ações com asas em células largas', () => {
  const character = buildFighterCharacter({
    id: 'wide-fixture', label: 'Wide', assetRoot: '/fixtures', anchorUsage: 'test',
    actions: [
      { action: 'idle', label: 'Idle', file: 'idle.png', frames: 1, frameRate: 8, repeat: -1,
        defaultVisual: { x: 66, y: 28, width: 123, height: 200 } },
      { action: 'heavy-punch', label: 'Wings', file: 'wings.png', frameWidth: 640,
        frames: 4, frameRate: 12, repeat: 0,
        defaultVisual: { x: 80, y: 28, width: 480, height: 200 },
        attack: { frames: [1], bounds: { x: 80, y: 85, width: 480, height: 55 } } }
    ]
  });
  const idle = character.animations.find((a) => a.action === 'idle')!;
  const wings = character.animations.find((a) => a.action === 'heavy-punch')!;

  it('carrega a asa inteira sem mudar a altura ou escala da célula', () => {
    expect(wings.sheet.frameWidth).toBe(640);
    expect(wings.sheet.frameHeight).toBe(idle.sheet.frameHeight);
  });

  it('mantém o corpo no mesmo lugar ao mudar largura e deixa só o golpe alcançar longe', () => {
    const body = idle.bounds[0].hit!;
    const wideBody = wings.bounds[0].hit!;
    expect({ ...wideBody, x: wideBody.x - (640 - 256) / 2 }).toEqual(body);
    const collision = wings.bounds[0].collision!;
    expect(Math.abs(collision.x + collision.width / 2 - 640 / 2)).toBeLessThanOrEqual(0.5);
    expect(wings.bounds[1].attack!.width).toBeGreaterThan(wideBody.width * 2);
    expect(wings.bounds.slice(2).every((f) => f.attack === null)).toBe(true);
  });
});
