import type * as Phaser from 'phaser';

import { playAudioCue } from './core/audio';
import type { GameSettings } from './types';

/**
 * O bloco `sons` do JSON do mascote troca o som geral de um evento pelo
 * próprio (Regra do Som): chave de outro som, ou `null` para calar.
 */
export type SonsDoLutador = Record<string, string | null>;

/**
 * Qual som toca num evento do lutador: o do JSON dele, se houver; senão o geral.
 * @param sons - O bloco `sons` do mascote.
 * @param evento - Nome do evento (`passo`, `chute`, `especial`...).
 * @param geral - O som que todo lutador tem nesse evento.
 */
export function somDoEvento(sons: SonsDoLutador | undefined, evento: string, geral: string | null): string | null {
  return sons && evento in sons ? sons[evento] : geral;
}

/**
 * Toca um som pela chave, sem quebrar onde não há áudio (testes, aba sem som).
 * @param scene - Cena que toca.
 * @param chave - Chave do som, ou `null` para não tocar nada.
 * @param settings - Ajustes de volume e mudo.
 * @param detune - Desvio de tom em cents (a dor varia a cada golpe).
 */
export function tocarSom(scene: Phaser.Scene, chave: string | null, settings: GameSettings, detune = 0): void {
  if (!chave || !scene.sound || !scene.cache?.audio) return;
  playAudioCue(scene, chave, settings, detune);
}

/** Sons soltos da torcida, um sorteado de tempos em tempos (docs/sons.md). */
export const TORCIDA_A_TOA = ['torcida-coro', 'torcida-uh', 'torcida-assobio', 'torcida-batucada', 'torcida-palmas'];

/**
 * Próximo som solto da torcida e quanto esperar até ele: nunca o mesmo duas
 * vezes seguidas, entre 5 e 11 segundos.
 * @param anterior - O último que tocou.
 * @param sorteio - Fonte de acaso (os testes passam uma fixa).
 */
export function proximaTorcida(anterior: string | null, sorteio: () => number = Math.random): { chave: string; ms: number } {
  const opcoes = TORCIDA_A_TOA.filter((chave) => chave !== anterior);
  return { chave: opcoes[Math.floor(sorteio() * opcoes.length)], ms: 5000 + sorteio() * 6000 };
}
