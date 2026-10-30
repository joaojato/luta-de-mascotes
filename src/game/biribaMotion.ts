import { PLANO_DE_FUNDO } from './planoDeFundo';

export type BiribaAction = 'idle' | 'walk' | 'bark';

/** A spectator follows horizontally; he never shares a fighter's jumping Y. */
export class BiribaMotion {
  x = 0;
  facing: 1 | -1 = -1;
  action: BiribaAction = 'idle';
  private barkIn = 5;
  private barkLeft = 0;

  constructor(private readonly random: () => number = Math.random) {}

  reset(targetX: number, minX: number, maxX: number): void {
    this.x = Math.max(minX, Math.min(maxX, targetX));
    this.action = 'idle';
    this.barkLeft = 0;
    this.barkIn = 4 + this.random() * 3;
  }

  update(seconds: number, targetX: number, minX: number, maxX: number): void {
    const dt = Math.max(0, Math.min(seconds, 0.1));
    const target = Math.max(minX, Math.min(maxX, targetX));
    this.x = Math.max(minX, Math.min(maxX, this.x));
    const distance = target - this.x;
    if (this.barkLeft > 0) {
      this.barkLeft = Math.max(0, this.barkLeft - dt);
      this.action = 'bark';
      return;
    }
    this.barkIn -= dt;
    if (this.barkIn <= 0) {
      this.barkLeft = 0.9;
      this.barkIn = 6 + this.random() * 4;
      this.action = 'bark';
      return;
    }
    // Hysteresis prevents tiny target shifts from flickering walk/idle.
    const stoppingDistance = this.action === 'walk' ? 7 : 22;
    if (Math.abs(distance) > stoppingDistance) {
      this.facing = distance > 0 ? 1 : -1;
      const step = Math.min(Math.abs(distance), PLANO_DE_FUNDO.passo * dt);
      this.x += this.facing * step;
      this.action = 'walk';
    } else {
      this.action = 'idle';
    }
  }
}
