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
 */
export function tocarSom(scene: Phaser.Scene, chave: string | null, settings: GameSettings): void {
  if (!chave || !scene.sound || !scene.cache?.audio) return;
  playAudioCue(scene, chave, settings);
}
