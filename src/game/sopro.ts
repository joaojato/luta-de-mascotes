/**
 * Especial `sopro` (o do Dragão, docs/dragao-animacoes-v1.md): o mascote sobe
 * até pairar, solta um jato contínuo pela boca e varre do chão à frente até o
 * alto, e desce. O jato acerta tudo na linha dele, de qualquer altura; a faixa
 * embaixo do mascote fica livre, e fugir é avançar para ela. Tudo vem do JSON
 * (Regra do JSON). Aqui só a geometria, sem Phaser, para o teste conferir.
 *
 * Ângulo: 0 aponta para baixo e cresce na direção do oponente (90 é reto para
 * a frente, 180 é para cima).
 */

export interface SoproConfig {
  /** Efeito do jato em `effects` (desenhado apontando para a esquerda). */
  efeito: string;
  /** Ponto da célula do efeito que fica na boca. */
  origemEfeito: number[];
  /** Comprimento desenhado do jato na célula do efeito, px. */
  comprimentoEfeito: number;
  /** Boca em cada quadro da sheet `special`, px da célula do corpo. */
  boca: number[][];
  /** Ângulo do jato em cada quadro da sheet `special`, graus. */
  angulos: number[];
  /** Quanto sobe antes de soprar, px de quadro. */
  altura: number;
  subidaSegundos?: number;
  /** Grossura do jato que acerta, px de quadro. */
  espessura?: number;
  /** Até onde o jato vai, px de mundo (a arena inteira). */
  alcance?: number;
}

export interface Ponto {
  x: number;
  y: number;
}

/** Boca e ângulo num ponto da varredura (0 a 1), entre os quadros desenhados. */
export function amostraDoSopro(cfg: SoproConfig, progresso: number): { boca: Ponto; angulo: number } {
  const ultimo = Math.min(cfg.boca.length, cfg.angulos.length) - 1;
  const f = Math.max(0, Math.min(1, progresso)) * ultimo;
  const i = Math.min(Math.floor(f), ultimo - 1);
  const t = f - i;
  const mistura = (a: number, b: number) => a + (b - a) * t;
  return {
    boca: { x: mistura(cfg.boca[i][0], cfg.boca[i + 1][0]), y: mistura(cfg.boca[i][1], cfg.boca[i + 1][1]) },
    angulo: mistura(cfg.angulos[i], cfg.angulos[i + 1])
  };
}

/** Direção do jato na tela (y para baixo); `lado` 1 é olhando para a direita. */
export function direcaoDoSopro(anguloGraus: number, lado: 1 | -1): Ponto {
  const theta = (anguloGraus * Math.PI) / 180;
  return { x: lado * Math.sin(theta), y: Math.cos(theta) };
}

/**
 * Primeiro ponto do jato, a partir da boca, que encosta no retângulo do alvo
 * (contando a grossura). Null quando o jato passa sem tocar.
 */
export function acertoDoSopro(
  boca: Ponto,
  direcao: Ponto,
  comprimento: number,
  espessura: number,
  alvo: { x: number; y: number; width: number; height: number }
): Ponto | null {
  const margem = espessura / 2;
  const passo = Math.max(4, margem);
  for (let d = 0; d <= comprimento; d += passo) {
    const x = boca.x + direcao.x * d;
    const y = boca.y + direcao.y * d;
    if (x >= alvo.x - margem && x <= alvo.x + alvo.width + margem && y >= alvo.y - margem && y <= alvo.y + alvo.height + margem) {
      return { x, y };
    }
  }
  return null;
}
