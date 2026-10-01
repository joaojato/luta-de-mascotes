/**
 * Mensagens trocadas entre o celular (câmera), o relay do Vite e o jogo.
 * O celular só lê a pose e manda os pontos crus; quem traduz em comando é o
 * jogo (`gestos.ts`), para o ajuste ficar visível na tela grande.
 */

export const CAMINHO_RELAY = '/relay';
export const CAMINHO_INFO = '/__controle/info';

export type Jogador = 1 | 2;

/** Quantidade de pontos do MediaPipe Pose. */
export const PONTOS_POSE = 33;

export interface QuadroPose {
  t: 'pose';
  jogador: Jogador;
  /** Relógio do celular, em ms. Serve para velocidade, nunca para comparar com o PC. */
  ts: number;
  /** Largura dividida pela altura do vídeo, para as distâncias ficarem iguais nos dois eixos. */
  aspecto: number;
  /** 33 x (x, y, visibilidade), x e y de 0 a 1 na imagem. */
  img: number[];
  /** 33 x (x, y, z) em metros, com origem no quadril. Vazio se o modelo não deu. */
  mundo: number[];
}

export type MensagemCelular =
  | { t: 'ola'; papel: 'celular'; jogador: Jogador }
  | QuadroPose
  | { t: 'sem-pessoa'; jogador: Jogador; ts: number }
  | { t: 'recalibrar'; jogador: Jogador };

export type MensagemJogo = { t: 'ola'; papel: 'jogo' };

/** O que o relay conta ao jogo, além de repassar as mensagens do celular. */
export type MensagemRelay = { t: 'celular'; jogador: Jogador; conectado: boolean };

export interface InfoControle {
  /** IPs da máquina na rede local, o melhor primeiro. */
  ips: string[];
}

export function ehJogador(valor: unknown): valor is Jogador {
  return valor === 1 || valor === 2;
}
