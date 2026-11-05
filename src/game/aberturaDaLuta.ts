/** Primeiro quadro visível antes do movimento, para a pessoa se situar. */
export const PAUSA_ANTES_DA_ENTRADA_MS = 500;

/** Tempo da contagem, em ms. O combate só começa na última etapa. */
export function etapasDaAbertura(entradaMs: number): { em: number; texto: string; lutar: boolean }[] {
  // Intervalos com metade da duração anterior. A intro começa no ROUND;
  // o 1 entra mais tarde para manter o 3 após a pose final, sem cortá-la.
  const passoAnterior = Math.max(700, Math.ceil((entradaMs + 200 - 900) / 2));
  const passo = passoAnterior / 2;
  const inicio = Math.max(450, entradaMs + 200 - 2 * passo);
  return ['1', '2', '3', 'Lutem!'].map((texto, i) => ({
    em: inicio + i * passo,
    texto,
    lutar: i === 3
  }));
}
