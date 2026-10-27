/**
 * Gesto vira comando. Recebe os pontos do MediaPipe Pose, calibra a postura
 * em pé do jogador e devolve um `FighterInput` por quadro do jogo.
 *
 * Toda distância é medida em "troncos" (ombro ao quadril na calibração), para
 * não depender de quão longe o jogador está do celular. A exceção é o soco,
 * que também olha a pose 3D do MediaPipe, em metros, porque soco de frente
 * para a câmera quase não muda nada na imagem 2D.
 *
 * Ajuste fino mora em LIMITES. Tabela de gestos: docs/gdd.md.
 */
import type { FighterInput } from '../game/fighter';
import { PONTOS_POSE, type QuadroPose } from './protocolo';

export interface PontoImg {
  /** Já multiplicado pelo aspecto do vídeo: mesma escala do eixo y. */
  x: number;
  y: number;
  v: number;
}

export interface Ponto3 {
  x: number;
  y: number;
  z: number;
}

export interface Pose {
  ts: number;
  img: PontoImg[];
  mundo: Ponto3[] | null;
  /** Largura dividida pela altura do vídeo. Só o desenho usa. */
  aspecto?: number;
}

// Índices do MediaPipe Pose. "Esquerdo" é o lado esquerdo do jogador.
export const P = {
  nariz: 0,
  ombroE: 11,
  ombroD: 12,
  cotoveloE: 13,
  cotoveloD: 14,
  pulsoE: 15,
  pulsoD: 16,
  quadrilE: 23,
  quadrilD: 24,
  joelhoE: 25,
  joelhoD: 26,
  tornozeloE: 27,
  tornozeloD: 28
} as const;

/** Limites dos gestos. Em troncos, salvo onde diz metros ou ms. */
export const LIMITES = {
  calibracaoMs: 1000,
  /** Quanto o quadril pode tremer durante a calibração. */
  calibracaoTremor: 0.08,
  /** Sumiu da câmera por mais que isso: calibra de novo quando voltar. */
  perdaParaRecalibrarMs: 1500,
  visibilidade: 0.5,

  /** Passo para o lado: liga e desliga em pontos diferentes para não piscar. */
  passoLiga: 0.35,
  passoDesliga: 0.2,
  agachaLiga: 0.35,
  agachaDesliga: 0.2,
  puloLiga: 0.18,
  puloRearma: 0.08,
  /**
   * Andar para perto ou para longe da câmera também sobe e desce o corpo na
   * imagem, mas muda o tamanho do tronco; pulo e agachamento não. Fora desta
   * faixa de escala, pulo e agachar não valem.
   */
  escalaTolerancia: 0.1,

  socoJanelaMs: 250,
  /** Pose 3D, em metros: punho longe do ombro e afastou rápido. */
  socoExt3: 0.42,
  socoSubida3: 0.14,
  /** Imagem 2D, em troncos: o mesmo para soco de lado. */
  socoExt2: 1.0,
  socoSubida2: 0.35,
  /** Soco sai na altura do ombro: abaixo disso é braço caindo, acima é braço subindo. */
  socoAbaixoOmbro: 0.4,
  socoAcimaOmbro: 0.35,
  /** O mesmo na pose 3D, em metros. */
  socoAbaixoOmbro3: 0.25,
  socoAcimaOmbro3: 0.2,
  socoIntervaloMs: 150,

  chuteJoelho: 0.45,
  chuteApoio: 0.7,
  chuteRearma: 0.6,

  /** Medido no vídeo de teste: em guarda, o punho fica até 0,27 tronco abaixo do ombro. */
  guardaAbaixoOmbro: 0.35,
  guardaLargura: 0.55,
  /** Na guarda um punho esconde o outro; o de trás chega com visibilidade ~0,4. */
  guardaVisibilidade: 0.3,
  /** Metros: punho perto do ombro, braço dobrado. */
  guardaExt3: 0.38,

  torcidaAcimaNariz: 0.25,
  torcidaSeguraMs: 300,

  /** Quanto tempo um golpe fica aceso no painel. */
  marcaMs: 350
};

export type Comando = keyof FighterInput;

export const COMANDOS: Comando[] = ['left', 'right', 'crouch', 'jump', 'block', 'light', 'heavy', 'special'];

export type EstadoLeitor = 'sem-corpo' | 'calibrando' | 'pronto';

interface Calibracao {
  quadrilX: number;
  quadrilY: number;
  ombroY: number;
  tronco: number;
}

interface Amostra {
  ts: number;
  quadrilX: number;
  quadrilY: number;
  ombroY: number;
}

interface Medida {
  ts: number;
  e3: number;
  e2: number;
}

interface Braco {
  ombro: number;
  pulso: number;
  historico: Medida[];
  disparoTs: number;
}

type Segurado = 'left' | 'right' | 'crouch' | 'block';

/** Converte a mensagem do celular para a pose com x e y na mesma escala. */
export function poseDoQuadro(quadro: QuadroPose): Pose {
  const img: PontoImg[] = [];
  for (let i = 0; i < PONTOS_POSE; i += 1) {
    img.push({ x: quadro.img[i * 3] * quadro.aspecto, y: quadro.img[i * 3 + 1], v: quadro.img[i * 3 + 2] });
  }
  let mundo: Ponto3[] | null = null;
  if (quadro.mundo.length === PONTOS_POSE * 3) {
    mundo = [];
    for (let i = 0; i < PONTOS_POSE; i += 1) {
      mundo.push({ x: quadro.mundo[i * 3], y: quadro.mundo[i * 3 + 1], z: quadro.mundo[i * 3 + 2] });
    }
  }
  return { ts: quadro.ts, img, mundo, aspecto: quadro.aspecto };
}

const meio = (a: PontoImg, b: PontoImg): PontoImg => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, v: Math.min(a.v, b.v) });
const dist2 = (a: PontoImg, b: PontoImg): number => Math.hypot(a.x - b.x, a.y - b.y);
const dist3 = (a: Ponto3, b: Ponto3): number => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

export class LeitorDeGestos {
  private calibracao: Calibracao | null = null;
  private amostras: Amostra[] = [];
  private perdidoDesde: number | null = null;
  private corpoVisivel = false;
  private ultimoTs = 0;

  private segurados: Record<Segurado, boolean> = { left: false, right: false, crouch: false, block: false };
  private pendentes = new Set<Comando>();
  private marcas: Partial<Record<Comando, number>> = {};

  private bracos: Braco[] = this.novosBracos();
  private puloArmado = true;
  private chuteArmado = true;
  private torcidaDesde: number | null = null;
  private torcidaArmada = true;

  get estado(): EstadoLeitor {
    if (!this.corpoVisivel) {
      return 'sem-corpo';
    }
    return this.calibracao ? 'pronto' : 'calibrando';
  }

  /** De 0 a 1 enquanto calibra. */
  get progresso(): number {
    if (this.calibracao) {
      return 1;
    }
    if (this.amostras.length < 2) {
      return 0;
    }
    const span = this.amostras[this.amostras.length - 1].ts - this.amostras[0].ts;
    return Math.min(1, span / LIMITES.calibracaoMs);
  }

  recalibrar(): void {
    this.calibracao = null;
    this.amostras = [];
    this.soltarTudo();
  }

  /** O celular avisou que não achou ninguém no quadro. */
  semCorpo(ts: number): void {
    this.ultimoTs = ts;
    this.corpoVisivel = false;
    this.soltarTudo();
    this.amostras = [];
    this.perdidoDesde ??= ts;
    if (this.calibracao && ts - this.perdidoDesde > LIMITES.perdaParaRecalibrarMs) {
      this.calibracao = null;
    }
  }

  atualizar(pose: Pose): void {
    const { img } = pose;
    const tronco = [P.ombroE, P.ombroD, P.quadrilE, P.quadrilD];
    if (tronco.some((i) => !img[i] || img[i].v < LIMITES.visibilidade)) {
      this.semCorpo(pose.ts);
      return;
    }

    this.ultimoTs = pose.ts;
    this.corpoVisivel = true;
    this.perdidoDesde = null;

    if (!this.calibracao) {
      this.calibrar(pose);
      return;
    }
    this.ler(pose, this.calibracao);
  }

  /** Comandos deste quadro do jogo. Golpes saem uma vez só e são consumidos aqui. */
  consumir(): FighterInput {
    const input: FighterInput = {
      ...this.segurados,
      jump: this.pendentes.has('jump'),
      light: this.pendentes.has('light'),
      heavy: this.pendentes.has('heavy'),
      special: this.pendentes.has('special')
    };
    this.pendentes.clear();
    return input;
  }

  /** O que acender no painel: segurados agora e golpes recentes. */
  ativos(): Comando[] {
    return COMANDOS.filter((comando) => {
      if (comando in this.segurados && this.segurados[comando as Segurado]) {
        return true;
      }
      const marca = this.marcas[comando];
      return marca !== undefined && this.ultimoTs - marca < LIMITES.marcaMs;
    });
  }

  private calibrar(pose: Pose): void {
    const { img } = pose;
    const ombro = meio(img[P.ombroE], img[P.ombroD]);
    const quadril = meio(img[P.quadrilE], img[P.quadrilD]);
    this.amostras.push({ ts: pose.ts, quadrilX: quadril.x, quadrilY: quadril.y, ombroY: ombro.y });
    // Descarta a mais velha só se as outras ainda cobrem o segundo inteiro.
    while (this.amostras.length > 2 && pose.ts - this.amostras[1].ts >= LIMITES.calibracaoMs) {
      this.amostras.shift();
    }

    if (this.progresso < 1) {
      return;
    }

    const n = this.amostras.length;
    const media = (f: (a: Amostra) => number): number => this.amostras.reduce((s, a) => s + f(a), 0) / n;
    const quadrilX = media((a) => a.quadrilX);
    const quadrilY = media((a) => a.quadrilY);
    const ombroY = media((a) => a.ombroY);
    const troncoMedio = quadrilY - ombroY;
    if (troncoMedio <= 0.02) {
      return;
    }

    const tremor = Math.max(
      ...this.amostras.map((a) => Math.max(Math.abs(a.quadrilX - quadrilX), Math.abs(a.quadrilY - quadrilY)))
    );
    if (tremor > LIMITES.calibracaoTremor * troncoMedio) {
      // Ainda mexendo: descarta a amostra mais velha e continua esperando.
      this.amostras.shift();
      return;
    }

    this.calibracao = { quadrilX, quadrilY, ombroY, tronco: troncoMedio };
    this.amostras = [];
    this.bracos = this.novosBracos();
    this.puloArmado = true;
    this.chuteArmado = true;
    this.torcidaArmada = true;
    this.torcidaDesde = null;
  }

  private ler(pose: Pose, cal: Calibracao): void {
    const { img, mundo, ts } = pose;
    const T = cal.tronco;
    const visivel = (i: number): boolean => img[i].v >= LIMITES.visibilidade;
    const ombro = meio(img[P.ombroE], img[P.ombroD]);
    const quadril = meio(img[P.quadrilE], img[P.quadrilD]);
    const nariz = visivel(P.nariz) ? img[P.nariz] : { x: ombro.x, y: ombro.y - 0.3 * T, v: 1 };

    // Passo para o lado. A câmera olha o jogador de frente, então a direita
    // dele aparece na esquerda da imagem.
    const dx = quadril.x - cal.quadrilX;
    this.segurados.right = dx < -(this.segurados.right ? LIMITES.passoDesliga : LIMITES.passoLiga) * T;
    this.segurados.left = dx > (this.segurados.left ? LIMITES.passoDesliga : LIMITES.passoLiga) * T;

    // Agachar encurta o tronco na imagem (o corpo dobra), então só o "ficou
    // maior" denuncia que o jogador chegou perto da câmera.
    const escala = (quadril.y - ombro.y) / T;
    const mesmaDistancia = Math.abs(escala - 1) <= LIMITES.escalaTolerancia;
    const naoChegouPerto = escala <= 1 + LIMITES.escalaTolerancia;

    const desceu = ombro.y - cal.ombroY;
    this.segurados.crouch =
      naoChegouPerto && desceu > (this.segurados.crouch ? LIMITES.agachaDesliga : LIMITES.agachaLiga) * T;

    const subiu = cal.quadrilY - quadril.y;
    if (this.puloArmado && mesmaDistancia && subiu > LIMITES.puloLiga * T) {
      this.disparar('jump', ts);
      this.puloArmado = false;
    } else if (!this.puloArmado && subiu < LIMITES.puloRearma * T) {
      this.puloArmado = true;
    }

    // Pose de torcida: as duas mãos acima da cabeça, seguradas um instante.
    const maosAcima =
      visivel(P.pulsoE) &&
      visivel(P.pulsoD) &&
      img[P.pulsoE].y < nariz.y - LIMITES.torcidaAcimaNariz * T &&
      img[P.pulsoD].y < nariz.y - LIMITES.torcidaAcimaNariz * T;
    if (maosAcima) {
      this.torcidaDesde ??= ts;
      if (this.torcidaArmada && ts - this.torcidaDesde >= LIMITES.torcidaSeguraMs) {
        this.disparar('special', ts);
        this.torcidaArmada = false;
      }
    } else {
      this.torcidaDesde = null;
      this.torcidaArmada = true;
    }

    // Guarda de boxe: os dois punhos na altura do rosto, perto dele, braço dobrado.
    const naGuarda = (pulso: number, ombroLado: number): boolean => {
      if (img[pulso].v < LIMITES.guardaVisibilidade) {
        return false;
      }
      const p = img[pulso];
      const alturaOk = p.y < img[ombroLado].y + LIMITES.guardaAbaixoOmbro * T && p.y > nariz.y - LIMITES.torcidaAcimaNariz * T;
      const pertoDoRosto = Math.abs(p.x - nariz.x) < LIMITES.guardaLargura * T;
      const dobrado = mundo ? dist3(mundo[pulso], mundo[ombroLado]) < LIMITES.guardaExt3 : true;
      return alturaOk && pertoDoRosto && dobrado;
    };
    // Quem joga com o corpo fica de guarda o tempo todo. No motor, bloquear
    // trava o passo; então guarda só defende parado, e andando de guarda anda.
    const andando = this.segurados.left || this.segurados.right;
    this.segurados.block = !andando && naGuarda(P.pulsoE, P.ombroE) && naGuarda(P.pulsoD, P.ombroD);

    for (const braco of this.bracos) {
      this.lerSoco(braco, pose, T);
    }

    this.lerChute(img, quadril, T);
  }

  private lerSoco(braco: Braco, pose: Pose, T: number): void {
    const { img, mundo, ts } = pose;
    const pulso = img[braco.pulso];
    const ombro = img[braco.ombro];
    if (pulso.v < LIMITES.visibilidade) {
      braco.historico = [];
      return;
    }

    const medida: Medida = {
      ts,
      e2: dist2(pulso, ombro) / T,
      e3: mundo ? dist3(mundo[braco.pulso], mundo[braco.ombro]) : Number.NaN
    };
    braco.historico.push(medida);
    while (braco.historico.length > 1 && ts - braco.historico[0].ts > LIMITES.socoJanelaMs) {
      braco.historico.shift();
    }

    const alturaImg = pulso.y < ombro.y + LIMITES.socoAbaixoOmbro * T && pulso.y > ombro.y - LIMITES.socoAcimaOmbro * T;
    const altura3 =
      !mundo ||
      (mundo[braco.pulso].y < mundo[braco.ombro].y + LIMITES.socoAbaixoOmbro3 &&
        mundo[braco.pulso].y > mundo[braco.ombro].y - LIMITES.socoAcimaOmbro3);
    if (!alturaImg || !altura3 || ts - braco.disparoTs < LIMITES.socoIntervaloMs) {
      return;
    }

    const min2 = Math.min(...braco.historico.map((m) => m.e2));
    const min3 = Math.min(...braco.historico.map((m) => m.e3));
    const pelo3d = medida.e3 >= LIMITES.socoExt3 && medida.e3 - min3 >= LIMITES.socoSubida3;
    const pelo2d = medida.e2 >= LIMITES.socoExt2 && medida.e2 - min2 >= LIMITES.socoSubida2;
    if (pelo3d || pelo2d) {
      this.disparar('light', ts);
      braco.disparoTs = ts;
      // Zera a janela: o próximo soco precisa recolher e esticar de novo.
      braco.historico = [medida];
    }
  }

  private lerChute(img: PontoImg[], quadril: PontoImg, T: number): void {
    const pernas = [
      { joelho: P.joelhoE, tornozelo: P.tornozeloE, outroJoelho: P.joelhoD },
      { joelho: P.joelhoD, tornozelo: P.tornozeloD, outroJoelho: P.joelhoE }
    ];
    const visivel = (i: number): boolean => img[i].v >= LIMITES.visibilidade;
    if (!visivel(P.joelhoE) || !visivel(P.joelhoD)) {
      return;
    }

    const abaixoDoQuadril = (i: number): number => img[i].y - quadril.y;
    if (!this.chuteArmado) {
      if (abaixoDoQuadril(P.joelhoE) > LIMITES.chuteRearma * T && abaixoDoQuadril(P.joelhoD) > LIMITES.chuteRearma * T) {
        this.chuteArmado = true;
      }
      return;
    }
    if (this.segurados.crouch) {
      return;
    }

    for (const perna of pernas) {
      const joelhoAlto = abaixoDoQuadril(perna.joelho) < LIMITES.chuteJoelho * T;
      const peAlto = visivel(perna.tornozelo) && img[perna.tornozelo].y < img[perna.outroJoelho].y;
      const apoio = abaixoDoQuadril(perna.outroJoelho) > LIMITES.chuteApoio * T;
      if ((joelhoAlto || peAlto) && apoio) {
        this.disparar('heavy', this.ultimoTs);
        this.chuteArmado = false;
        return;
      }
    }
  }

  private disparar(comando: Comando, ts: number): void {
    this.pendentes.add(comando);
    this.marcas[comando] = ts;
  }

  private soltarTudo(): void {
    this.segurados = { left: false, right: false, crouch: false, block: false };
    this.bracos.forEach((braco) => {
      braco.historico = [];
    });
    this.torcidaDesde = null;
  }

  private novosBracos(): Braco[] {
    return [
      { ombro: P.ombroE, pulso: P.pulsoE, historico: [], disparoTs: -Infinity },
      { ombro: P.ombroD, pulso: P.pulsoD, historico: [], disparoTs: -Infinity }
    ];
  }
}
