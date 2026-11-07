/**
 * Golpe `mina` (os cacos da Raposa, docs/gdd.md): no quadro do JSON o golpe
 * deixa uma mina no chão à frente dos pés. Quem pisa toma o dano uma vez e a
 * mina some. Com `acumula`, a mina que cai sobre uma simples vira dupla (mais
 * dano, relógio novo); sobre uma dupla nasce outra simples. Sem limite de
 * minas. Aqui só a regra, sem Phaser, para o teste conferir.
 */

export interface MinaConfig {
  /** Quanto a mina simples fica no chão. */
  segundos: number;
  /** Dano de quem pisa na simples. */
  dano: number;
  /** Largura da caixa no chão, em px do quadro; duas minas se tocam quando os centros ficam a menos disso. */
  largura: number;
  /** Altura da caixa no chão, em px do quadro (padrão 24). */
  altura?: number;
  /** Onde a mina nasce, em px do quadro à frente dos pés (padrão 70). */
  avanco?: number;
  /** Quadro da sheet em que a mina cai (padrão 3). */
  quadro?: number;
  /** A segunda mina no mesmo lugar: o dano e o relógio da dupla. */
  acumula?: { segundos: number; dano: number };
  /** Linha do chão dentro da célula do efeito (px da célula): o pé dos cacos; sem ela, o centro. */
  chao?: number;
  /** Efeitos (nomes de `effects`) da simples e da dupla; sem a dupla, a simples maior. */
  efeito?: string;
  efeitoDuplo?: string;
}

/** O que a regra precisa saber de uma mina que já está no chão. */
export interface MinaNoChao {
  x: number;
  nivel: 1 | 2;
}

export type Deposito =
  | { tipo: 'nova'; mina: MinaNoChao & { dano: number; segundos: number } }
  | { tipo: 'dobrou'; indice: number; dano: number; segundos: number };

/**
 * Decide o que a mina que cai em `x` faz com as que já estão no chão.
 * @param minas - As minas do mesmo dono no chão.
 * @param x - Onde a nova cai (mesma unidade de `largura`).
 * @param config - A mina do JSON.
 * @returns Uma mina nova, ou qual simples virou dupla.
 */
export function depositarMina(minas: readonly MinaNoChao[], x: number, config: MinaConfig): Deposito {
  if (config.acumula) {
    let indice = -1;
    minas.forEach((mina, i) => {
      const perto = Math.abs(mina.x - x) < config.largura;
      if (mina.nivel === 1 && perto && (indice < 0 || Math.abs(mina.x - x) < Math.abs(minas[indice].x - x))) indice = i;
    });
    if (indice >= 0) return { tipo: 'dobrou', indice, dano: config.acumula.dano, segundos: config.acumula.segundos };
  }
  return { tipo: 'nova', mina: { x, nivel: 1, dano: config.dano, segundos: config.segundos } };
}
