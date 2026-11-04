/**
 * Primeira visita (docs/superpowers/specs/2026-11-03-tutorial-design.md): sem
 * esta marca no navegador, a abertura pergunta do tutorial antes do menu. Aba
 * anônima ou cache limpo perguntam de novo.
 */

const CHAVE = 'luta-de-mascotes:tutorial-visto';

export function jaViuTutorial(storage?: Storage): boolean {
  try {
    return (storage ?? window.localStorage).getItem(CHAVE) !== null;
  } catch {
    // Sem armazenamento: não insiste a cada abertura.
    return true;
  }
}

export function marcarTutorialVisto(storage?: Storage): void {
  try {
    (storage ?? window.localStorage).setItem(CHAVE, '1');
  } catch {
    // Aba anônima: vale até recarregar.
  }
}

const CHAVE_INSTRUCOES = 'luta-de-mascotes:instrucoes-1x1';

/** A caixinha "Instruções" da Seleção do 1x1, como a pessoa deixou da última vez. */
export function instrucoesLigadas(storage?: Storage): boolean {
  try {
    return (storage ?? window.localStorage).getItem(CHAVE_INSTRUCOES) === '1';
  } catch {
    return false;
  }
}

export function salvarInstrucoes(ligadas: boolean, storage?: Storage): void {
  try {
    (storage ?? window.localStorage).setItem(CHAVE_INSTRUCOES, ligadas ? '1' : '0');
  } catch {
    // Aba anônima: vale até recarregar.
  }
}
