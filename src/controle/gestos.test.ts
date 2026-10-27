import { describe, expect, it } from 'vitest';

import { LeitorDeGestos, P, poseDoQuadro, type Ponto3, type PontoImg, type Pose } from './gestos';
import { PONTOS_POSE } from './protocolo';

// Corpo sintético de frente para a câmera, num vídeo em pé (aspecto já aplicado).
// Tronco (ombro ao quadril) = 0,25. A direita do jogador fica na esquerda da imagem.
const QUADRO_MS = 33;

interface Corpo {
  img: PontoImg[];
  mundo: Ponto3[];
}

function corpoEmPe(): Corpo {
  const img: PontoImg[] = Array.from({ length: PONTOS_POSE }, () => ({ x: 0.375, y: 0.5, v: 1 }));
  const mundo: Ponto3[] = Array.from({ length: PONTOS_POSE }, () => ({ x: 0, y: 0, z: 0 }));
  const poe = (i: number, x: number, y: number, mx: number, my: number, mz = 0): void => {
    img[i] = { x, y, v: 1 };
    mundo[i] = { x: mx, y: my, z: mz };
  };
  poe(P.nariz, 0.375, 0.2, 0, -0.65);
  poe(P.ombroE, 0.42, 0.3, 0.18, -0.5);
  poe(P.ombroD, 0.33, 0.3, -0.18, -0.5);
  poe(P.cotoveloE, 0.44, 0.42, 0.2, -0.25);
  poe(P.cotoveloD, 0.31, 0.42, -0.2, -0.25);
  // Braço solto, punho na altura do quadril.
  poe(P.pulsoE, 0.44, 0.53, 0.2, 0.05);
  poe(P.pulsoD, 0.31, 0.53, -0.2, 0.05);
  poe(P.quadrilE, 0.4, 0.55, 0.1, 0);
  poe(P.quadrilD, 0.35, 0.55, -0.1, 0);
  poe(P.joelhoE, 0.4, 0.77, 0.1, 0.45);
  poe(P.joelhoD, 0.35, 0.77, -0.1, 0.45);
  poe(P.tornozeloE, 0.4, 0.97, 0.1, 0.9);
  poe(P.tornozeloD, 0.35, 0.97, -0.1, 0.9);
  return { img, mundo };
}

function emGuarda(c: Corpo): Corpo {
  const novo = clonar(c);
  novo.img[P.pulsoE] = { x: 0.39, y: 0.24, v: 1 };
  novo.img[P.pulsoD] = { x: 0.36, y: 0.24, v: 1 };
  novo.mundo[P.pulsoE] = { x: 0.08, y: -0.6, z: -0.2 };
  novo.mundo[P.pulsoD] = { x: -0.08, y: -0.6, z: -0.2 };
  return novo;
}

/** Soco de direita na direção da câmera: quase nada muda na imagem, muito na pose 3D. */
function socoDeDireita(c: Corpo): Corpo {
  const novo = clonar(c);
  novo.img[P.pulsoD] = { x: 0.34, y: 0.3, v: 1 };
  novo.mundo[P.pulsoD] = { x: -0.15, y: -0.5, z: -0.55 };
  return novo;
}

function clonar(c: Corpo): Corpo {
  return { img: c.img.map((p) => ({ ...p })), mundo: c.mundo.map((p) => ({ ...p })) };
}

function mover(c: Corpo, dx: number, dy: number, indices?: number[]): Corpo {
  const novo = clonar(c);
  novo.img.forEach((p, i) => {
    if (!indices || indices.includes(i)) {
      p.x += dx;
      p.y += dy;
    }
  });
  return novo;
}

function misturar(a: Corpo, b: Corpo, t: number): Corpo {
  const lerp = (x: number, y: number): number => x + (y - x) * t;
  return {
    img: a.img.map((p, i) => ({ x: lerp(p.x, b.img[i].x), y: lerp(p.y, b.img[i].y), v: p.v })),
    mundo: a.mundo.map((p, i) => ({ x: lerp(p.x, b.mundo[i].x), y: lerp(p.y, b.mundo[i].y), z: lerp(p.z, b.mundo[i].z) }))
  };
}

class Cena {
  leitor = new LeitorDeGestos();
  ts = 0;
  /** Junta tudo o que disparou desde a última pergunta. */
  disparos: string[] = [];

  segurar(c: Corpo, ms: number): this {
    for (let t = 0; t < ms; t += QUADRO_MS) {
      this.quadro(c);
    }
    return this;
  }

  transicao(de: Corpo, para: Corpo, ms: number): this {
    const passos = Math.max(1, Math.round(ms / QUADRO_MS));
    for (let i = 1; i <= passos; i += 1) {
      this.quadro(misturar(de, para, i / passos));
    }
    return this;
  }

  quadro(c: Corpo): void {
    this.ts += QUADRO_MS;
    const pose: Pose = { ts: this.ts, img: c.img, mundo: c.mundo };
    this.leitor.atualizar(pose);
    const input = this.leitor.consumir();
    (['jump', 'light', 'heavy', 'special'] as const).forEach((k) => {
      if (input[k]) {
        this.disparos.push(k);
      }
    });
    this.ultimo = input;
  }

  ultimo = this.leitor.consumir();

  tirarDisparos(): string[] {
    const d = this.disparos;
    this.disparos = [];
    return d;
  }
}

const EM_PE = corpoEmPe();

function calibrada(corpo = EM_PE): Cena {
  const cena = new Cena().segurar(corpo, 1200);
  expect(cena.leitor.estado).toBe('pronto');
  cena.tirarDisparos();
  return cena;
}

describe('calibração', () => {
  it('calibra depois de um segundo parado e fica neutro', () => {
    const cena = new Cena().segurar(EM_PE, 500);
    expect(cena.leitor.estado).toBe('calibrando');
    cena.segurar(EM_PE, 700);
    expect(cena.leitor.estado).toBe('pronto');
    expect(cena.ultimo).toEqual({
      left: false, right: false, crouch: false, block: false,
      jump: false, light: false, heavy: false, special: false
    });
    expect(cena.tirarDisparos()).toEqual([]);
  });

  it('não calibra enquanto o jogador anda de um lado para o outro', () => {
    const cena = new Cena();
    for (let i = 0; i < 20; i += 1) {
      cena.segurar(mover(EM_PE, i % 2 ? 0.06 : -0.06, 0), 100);
    }
    expect(cena.leitor.estado).toBe('calibrando');
  });

  it('sem tronco visível fica sem corpo e solta tudo', () => {
    const cena = calibrada();
    cena.segurar(mover(EM_PE, -0.12, 0), 100);
    expect(cena.ultimo.right).toBe(true);
    const escondido = clonar(EM_PE);
    escondido.img[P.quadrilE].v = 0.1;
    cena.segurar(escondido, 100);
    expect(cena.leitor.estado).toBe('sem-corpo');
    expect(cena.ultimo.right).toBe(false);
  });

  it('some por mais de 1,5 s e calibra de novo ao voltar', () => {
    const cena = calibrada();
    for (let i = 0; i < 60; i += 1) {
      cena.ts += QUADRO_MS;
      cena.leitor.semCorpo(cena.ts);
    }
    cena.segurar(EM_PE, 100);
    expect(cena.leitor.estado).toBe('calibrando');
  });
});

describe('movimento', () => {
  it('passo para a direita do jogador anda para a direita', () => {
    const cena = calibrada().segurar(mover(EM_PE, -0.12, 0), 100);
    expect(cena.ultimo.right).toBe(true);
    expect(cena.ultimo.left).toBe(false);
  });

  it('passo para a esquerda anda para a esquerda, e voltar ao centro para', () => {
    const cena = calibrada().segurar(mover(EM_PE, 0.12, 0), 100);
    expect(cena.ultimo.left).toBe(true);
    cena.segurar(EM_PE, 100);
    expect(cena.ultimo.left).toBe(false);
  });

  it('balanço pequeno não anda', () => {
    const cena = calibrada().segurar(mover(EM_PE, 0.04, 0), 200);
    expect(cena.ultimo.left).toBe(false);
    expect(cena.ultimo.right).toBe(false);
  });

  it('agachar segura o agachado e não vira chute', () => {
    const agachado = mover(mover(EM_PE, 0, 0.12, [P.nariz, P.ombroE, P.ombroD, P.cotoveloE, P.cotoveloD, P.pulsoE, P.pulsoD]), 0, 0.1, [P.quadrilE, P.quadrilD]);
    const cena = calibrada().transicao(EM_PE, agachado, 200).segurar(agachado, 200);
    expect(cena.ultimo.crouch).toBe(true);
    expect(cena.tirarDisparos()).not.toContain('heavy');
  });

  // Perto ou longe da câmera, tudo cresce ou encolhe em torno da linha do
  // horizonte, que fica na altura do celular.
  const aDistancia = (fator: number, horizonte: number): Corpo => {
    const novo = clonar(EM_PE);
    novo.img.forEach((p) => {
      p.x = 0.375 + (p.x - 0.375) * fator;
      p.y = horizonte + (p.y - horizonte) * fator;
    });
    return novo;
  };

  it('celular na cintura: chegar perto ou se afastar não pula nem agacha', () => {
    const perto = aDistancia(1.3, 0.55);
    const longe = aDistancia(0.75, 0.55);
    const cena = calibrada().transicao(EM_PE, perto, 500).segurar(perto, 200);
    expect(cena.ultimo.crouch).toBe(false);
    cena.transicao(perto, longe, 800).segurar(longe, 200);
    expect(cena.ultimo.crouch).toBe(false);
    expect(cena.tirarDisparos()).toEqual([]);
  });

  it('celular baixo: chegar perto sobe o corpo na tela, mas não vira pulo', () => {
    const perto = aDistancia(1.3, 0.9);
    const cena = calibrada().transicao(EM_PE, perto, 500).segurar(perto, 200);
    expect(cena.tirarDisparos()).not.toContain('jump');
  });

  it('pular dispara um pulo só, e de novo depois de voltar ao chão', () => {
    const noAr = mover(EM_PE, 0, -0.06);
    const cena = calibrada().transicao(EM_PE, noAr, 130).segurar(noAr, 200);
    expect(cena.tirarDisparos()).toEqual(['jump']);
    cena.transicao(noAr, EM_PE, 130).segurar(EM_PE, 100);
    cena.transicao(EM_PE, noAr, 130).segurar(noAr, 100);
    expect(cena.tirarDisparos()).toEqual(['jump']);
  });
});

describe('defesa e golpes', () => {
  it('guarda no rosto bloqueia', () => {
    const guarda = emGuarda(EM_PE);
    const cena = calibrada().transicao(EM_PE, guarda, 200).segurar(guarda, 200);
    expect(cena.ultimo.block).toBe(true);
    expect(cena.tirarDisparos()).toEqual([]);
  });

  it('andando de guarda anda, sem bloquear', () => {
    const guarda = emGuarda(EM_PE);
    const cena = calibrada(guarda).segurar(mover(guarda, -0.12, 0), 200);
    expect(cena.ultimo.right).toBe(true);
    expect(cena.ultimo.block).toBe(false);
  });

  it('guarda com um punho escondido atrás do outro ainda bloqueia', () => {
    // Números do vídeo de teste: punho de trás com visibilidade 0,38, abaixo da linha do ombro.
    const guarda = emGuarda(EM_PE);
    guarda.img[P.pulsoE] = { x: 0.38, y: 0.35, v: 0.38 };
    guarda.img[P.pulsoD] = { x: 0.37, y: 0.34, v: 0.97 };
    const cena = calibrada().transicao(EM_PE, guarda, 200).segurar(guarda, 200);
    expect(cena.ultimo.block).toBe(true);
    expect(cena.tirarDisparos()).toEqual([]);
  });

  it('parado com os braços soltos não soca', () => {
    const cena = calibrada().segurar(EM_PE, 1000);
    expect(cena.tirarDisparos()).toEqual([]);
  });

  it('soco de frente para a câmera sai uma vez, e de novo depois de recolher', () => {
    const guarda = emGuarda(EM_PE);
    const soco = socoDeDireita(guarda);
    const cena = calibrada(guarda);
    cena.transicao(guarda, soco, 100).segurar(soco, 300);
    expect(cena.tirarDisparos()).toEqual(['light']);
    expect(cena.ultimo.block).toBe(false);

    cena.transicao(soco, guarda, 150).segurar(guarda, 100);
    cena.transicao(guarda, soco, 100);
    expect(cena.tirarDisparos()).toEqual(['light']);
  });

  it('baixar a guarda não vira soco', () => {
    const guarda = emGuarda(EM_PE);
    const cena = calibrada(guarda).transicao(guarda, EM_PE, 150).segurar(EM_PE, 200);
    expect(cena.tirarDisparos()).toEqual([]);
  });

  it('joelho alto chuta uma vez, e de novo depois de baixar a perna', () => {
    const chute = clonar(EM_PE);
    chute.img[P.joelhoE] = { x: 0.42, y: 0.6, v: 1 };
    chute.img[P.tornozeloE] = { x: 0.44, y: 0.78, v: 1 };
    const cena = calibrada().transicao(EM_PE, chute, 130).segurar(chute, 300);
    expect(cena.tirarDisparos()).toEqual(['heavy']);
    cena.transicao(chute, EM_PE, 130).segurar(EM_PE, 100).transicao(EM_PE, chute, 130);
    expect(cena.tirarDisparos()).toEqual(['heavy']);
  });

  it('pose de torcida solta o especial depois de segurar as mãos no alto', () => {
    const torcida = clonar(EM_PE);
    torcida.img[P.pulsoE] = { x: 0.5, y: 0.08, v: 1 };
    torcida.img[P.pulsoD] = { x: 0.25, y: 0.08, v: 1 };
    torcida.mundo[P.pulsoE] = { x: 0.35, y: -1.1, z: 0 };
    torcida.mundo[P.pulsoD] = { x: -0.35, y: -1.1, z: 0 };
    const cena = calibrada().transicao(EM_PE, torcida, 130).segurar(torcida, 150);
    expect(cena.tirarDisparos()).toEqual([]);
    cena.segurar(torcida, 400);
    expect(cena.tirarDisparos()).toEqual(['special']);
  });
});

describe('poseDoQuadro', () => {
  it('aplica o aspecto no x e lê a pose 3D', () => {
    const img = Array.from({ length: PONTOS_POSE * 3 }, (_, i) => (i % 3 === 2 ? 1 : 0.5));
    const mundo = Array.from({ length: PONTOS_POSE * 3 }, () => 0.1);
    const pose = poseDoQuadro({ t: 'pose', jogador: 1, ts: 10, aspecto: 0.75, img, mundo });
    expect(pose.img[0]).toEqual({ x: 0.375, y: 0.5, v: 1 });
    expect(pose.mundo?.[32]).toEqual({ x: 0.1, y: 0.1, z: 0.1 });
    expect(poseDoQuadro({ t: 'pose', jogador: 1, ts: 10, aspecto: 1, img, mundo: [] }).mundo).toBeNull();
  });
});
