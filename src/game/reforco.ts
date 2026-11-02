import * as Phaser from 'phaser';

import { PLANO_DE_FUNDO } from './planoDeFundo';
import { caixaNoMundo, ladoDoReforco, passoAteOAlvo, sortearDisparo, type CaixaDeQuadro, type Escape } from './reforcoRota';

/**
 * NPC de Guarda que golpeia uma vez (docs/criador-de-personagem.md, bloco 5):
 * fica de guarda no plano de fundo (Regra do Fundo), assistindo à luta. Quando
 * o dono solta o especial, sai correndo pelo fundo para fora da tela, volta
 * já correndo dentro do campo, por trás do adversário, ataca uma vez e sai de
 * novo pelo mesmo lado; depois volta correndo pelo fundo e para no posto. Como
 * o Biriba, mira o ponto onde o adversário estava quando o especial saiu:
 * quem anda, pula ou recua a tempo escapa.
 *
 * Dois jeitos de atacar:
 * - golpe de perto (`chute`): o Guerreiro do Cartola (docs/guerreiro-npc-v1.md);
 * - `disparos` de longe: uma variante sorteada por chamado, cada uma com o
 *   jeito de escapar dela (pular, agachar). O Flecha Negra do Gremista
 *   (docs/flecha-negra-npc-v1.md). Nenhum dos dois se defende.
 *
 * Tudo vem do JSON (Regra do JSON). A arte é desenhada correndo para a
 * esquerda; `animacoes` diz qual efeito do mascote serve a cada fase, então
 * uma animação nova só troca o nome ali.
 */

export interface AnimacoesDoReforco {
  /** De guarda no fundo, de frente. */
  guarda: string;
  /** Correndo (no fundo e no campo). */
  corrida: string;
  /** O golpe de perto (sem `disparos`). */
  chute?: string;
  /**
   * Saindo do campo depois do golpe: começa virado como o golpe, vira e corre
   * para o lado oposto (padrão: a corrida). Ver `lacoDaVolta`.
   */
  volta?: string;
  /** Voltando pelo fundo até o posto (padrão: a corrida). Sempre volta pela direita, correndo para a esquerda. */
  retorno?: string;
  /**
   * Corrida que freia e termina na guarda de frente, sem deslocamento no
   * desenho: o motor desacelera até o posto durante ela (sem ela, chega
   * correndo e vai direto para a guarda).
   */
  parada?: string;
}

/** Um disparo de longe. A flecha sai uma vez, no quadro `soltura`. */
export interface DisparoDoReforco {
  nome: string;
  /** Efeito do disparo. */
  animacao: string;
  /** Efeito tocado antes (ajoelhar), do primeiro ao último quadro. */
  antes?: string;
  /** Efeito tocado depois, de trás para a frente (levantar), a partir de `depoisDe`. */
  depois?: string;
  /** Quadro do `depois` em que começa a volta (padrão: o último). */
  depoisDe?: number;
  /** Quadro do disparo em que a flecha sai. */
  soltura: number;
  /** Ponta da flecha na hora da soltura, em px de quadro (arte virada para a esquerda). */
  boca: { x: number; y: number };
  /** Como o adversário escapa: `pulo`, `agachar` (sem guarda que segure). */
  escapa: (Escape | string)[];
  /** Salto nos quadros `quadros` (primeiro e último), `altura` em px de quadro. */
  salto?: { altura: number; quadros: number[] };
  /** Peso no sorteio (padrão 1). */
  peso?: number;
}

export interface FlechaDoReforco {
  /** Efeito da flecha (um quadro, ponta para a esquerda). */
  efeito: string;
  /** px/s no mundo. */
  velocidade: number;
  /** Comprimento e altura da caixa de acerto, em px de quadro, a partir da ponta. */
  caixa: { largura: number; altura: number };
}

export interface ReforcoConfig {
  animacoes: AnimacoesDoReforco;
  /** Onde fica de guarda: px de quadro atrás do dono (como o `posto` dos Gaviões). */
  posto: number;
  /** Tamanho em relação ao dono (padrão 1). */
  escala?: number;
  /** Velocidade da corrida no campo, px/s no mundo. */
  velocidade: number;
  /** Velocidade da corrida no fundo, px/s no mundo (padrão: a do campo). */
  velocidadeNoFundo?: number;
  /** Distância do pé de apoio ao ponto mirado quando para, em px de quadro. */
  alcance: number;
  /** Quadro da corrida em que ele freia para golpear de perto (padrão 4: o apoio no pé B). */
  quadroDeApoio?: number;
  /**
   * Para atirar: os primeiros quadros da `parada` (primeiro e último) servem
   * de freada no campo, sem virar de frente.
   */
  freadaNoCampo?: number[];
  /** Ao sair da guarda, começa pela `volta` neste quadro (a virada de frente); sem ele, sai já correndo. */
  saidaDaGuarda?: number;
  /** Quadros do golpe de perto em que a caixa vale (um contato só). */
  contato?: number[];
  /**
   * Primeiro e último quadro da `volta` que repetem até ele sair da tela (a corrida); os de
   * antes são a virada, parado no lugar.
   */
  lacoDaVolta?: number[];
  /** Caixa do golpe de perto em px de quadro, na arte virada para a esquerda. */
  caixa?: CaixaDeQuadro;
  /** Pé de apoio na célula da arte, em px. */
  origem: { x: number; y: number };
  /** Dano do golpe de perto ou de cada flecha. */
  dano: number;
  /** Empurrão do golpe (como o `knockback` dos golpes do mascote). */
  empurrao: number;
  /** Golpes de longe, um sorteado por chamado. Sem eles, o golpe é de perto (`chute`). */
  disparos?: DisparoDoReforco[];
  flecha?: FlechaDoReforco;
}

/** O que o reforço precisa do dono, sem depender da classe Fighter. */
export interface DonoDoReforco {
  readonly scene: Phaser.Scene;
  x(): number;
  /** A linha do pé dos lutadores (no campo). */
  chao(): number;
  /** A linha do pé no plano de fundo (Regra do Fundo, `chaoDoFundo`). */
  chaoDoFundo(): number;
  /** 1 olhando para a direita. */
  lado(): 1 | -1;
  escala(): number;
  /** O alvo agora; null quando não há. */
  alvo(): { x: number; caido: boolean } | null;
  /** Chave da animação de um efeito do mascote (`fx-<nome>`), se existir. */
  animacao(efeito: string): string | null;
}

export interface ContatoReforco {
  rect: Phaser.Geom.Rectangle;
  assinatura: number;
  lado: 1 | -1;
  /** Como escapa (só nas flechas); o golpe de perto não tem escape além de sair do lugar. */
  escapa?: (Escape | string)[];
}

type Estado =
  | 'guarda'
  | 'saindo'
  | 'entrando'
  | 'freando'
  | 'golpeando'
  | 'mirando'
  | 'disparando'
  | 'levantando'
  | 'voltando'
  | 'retornando'
  | 'parando';

interface Flecha {
  sprite: Phaser.GameObjects.Image;
  x: number;
  y: number;
  lado: 1 | -1;
  assinatura: number;
  escapa: (Escape | string)[];
}

/** No campo, na frente dos dois lutadores (5 e 8 na Luta): ele entra na briga. */
const PROFUNDIDADE_NO_CAMPO = 9;
/** Quanto passa da borda da vista para contar como fora da tela, em px de quadro. */
const FORA_DA_TELA = 130;
/** Atirando, para pelo menos tantos px de quadro dentro da tela. */
const DENTRO_DA_TELA = 90;

let proximaAssinatura = 950_000;

export class Reforco {
  // Montados no primeiro quadro com câmera (a Luta de verdade).
  private sprite!: Phaser.GameObjects.Sprite;
  private sombra!: Phaser.GameObjects.Ellipse;
  private montado = false;
  private estado: Estado = 'guarda';
  private x = 0;
  /** Altura do salto agora, em px de quadro (o disparo alto). */
  private elevacao = 0;
  private posto = 0;
  /** Para onde o golpe empurra o alvo (na direção do dono); ele entra e sai pelo lado oposto. */
  private lado: 1 | -1 = -1;
  /**
   * Onde o adversário estava quando o especial saiu. Como o Biriba, ele mira
   * esse ponto, não o adversário: quem sai dali escapa.
   */
  private alvoX = 0;
  private assinatura = 0;
  private acertou = false;
  /** O efeito tocando agora (para saber se está na virada da volta). */
  private efeito = '';
  /** Freada até o posto: velocidade no começo e tempo decorrido. */
  private freada = { velocidade: 0, tempo: 0, duracao: 0 };
  /** O disparo sorteado neste chamado, e se a flecha já saiu. */
  private disparo: DisparoDoReforco | null = null;
  private soltou = false;
  private flechas: Flecha[] = [];

  constructor(
    private readonly dono: DonoDoReforco,
    private readonly cfg: ReforcoConfig,
    private readonly aleatorio: () => number = Math.random
  ) {}

  /** De guarda no fundo e sem flecha no ar: o especial pode chamar de novo. */
  get pronto(): boolean {
    return this.estado === 'guarda' && this.flechas.length === 0;
  }

  /** O dono soltou o especial: sai do fundo para buscar o adversário. */
  chamar(): void {
    const alvo = this.dono.alvo();
    if (!this.montado || this.estado !== 'guarda' || !alvo) return;
    this.lado = ladoDoReforco(this.dono.x(), alvo.x);
    this.alvoX = alvo.x;
    this.acertou = false;
    this.soltou = false;
    // Sorteado uma vez por chamado (contrato do Flecha Negra).
    this.disparo = this.cfg.disparos?.length ? sortearDisparo(this.cfg.disparos, this.aleatorio()) : null;
    this.estado = 'saindo';
    const volta = this.cfg.animacoes.volta;
    if (volta && this.cfg.saidaDaGuarda !== undefined && this.tocar(volta, this.lado, this.cfg.saidaDaGuarda)) return;
    this.tocar(this.cfg.animacoes.corrida, this.saida());
  }

  update(seconds: number): void {
    if (!this.montado) {
      if (!this.dono.scene.cameras?.main) return;
      this.montar();
    }
    const alvo = this.dono.alvo();
    const fora = FORA_DA_TELA * this.escala();
    const vista = this.vista();
    // A borda por onde ele entra e sai: o lado oposto ao dono, atrás do alvo.
    const borda = this.lado === -1 ? vista.direita + fora : vista.esquerda - fora;
    this.moverFlechas(seconds, vista);

    switch (this.estado) {
      case 'saindo':
        if (!this.virando()) this.correr(this.saida(), this.velocidadeNoFundo(), seconds);
        if (this.passou(borda, this.saida())) {
          // Fora da tela: volta já correndo dentro do campo.
          this.estado = 'entrando';
          this.x = borda;
          this.tocar(this.cfg.animacoes.corrida, this.lado);
        }
        break;
      case 'entrando':
      case 'freando': {
        if (!alvo || alvo.caido) {
          this.sairDoCampo();
          break;
        }
        if (this.disparo) {
          this.entrarParaAtirar(seconds, vista);
          break;
        }
        const passo = passoAteOAlvo(this.x, this.alvoX, this.lado, this.cfg.alcance * this.escala(), this.cfg.velocidade * seconds);
        this.x = passo.x;
        if (passo.chegou) this.estado = 'freando';
        if (this.estado === 'freando' && this.quadro() === (this.cfg.quadroDeApoio ?? 4)) this.golpear();
        break;
      }
      case 'disparando':
        this.elevacao = this.alturaDoSalto();
        if (!this.soltou && this.disparo && this.quadro() >= this.disparo.soltura) this.soltarFlecha();
        break;
      case 'voltando':
        // Na virada (começo da volta) fica no lugar; depois corre para a borda.
        if (!this.virando()) this.correr(this.saida(), this.cfg.velocidade, seconds);
        if (this.passou(borda, this.saida())) this.retornar(vista.direita + fora);
        break;
      case 'retornando': {
        const falta = this.x - this.posto;
        const duracao = this.duracao(this.cfg.animacoes.parada);
        // Começa a frear quando a distância cabe na freada (velocidade caindo até zero).
        if (duracao > 0 && falta <= (this.velocidadeNoFundo() * duracao) / 2) {
          this.estado = 'parando';
          this.freada = { velocidade: Math.min(this.velocidadeNoFundo(), (2 * Math.max(0, falta)) / duracao), tempo: 0, duracao };
          this.tocar(this.cfg.animacoes.parada!, -1);
          break;
        }
        this.correr(-1, this.velocidadeNoFundo(), seconds);
        if (this.passou(this.posto, -1)) {
          this.x = this.posto;
          this.ficarDeGuarda();
        }
        break;
      }
      case 'parando': {
        this.freada.tempo += seconds;
        const velocidade = this.freada.velocidade * Math.max(0, 1 - this.freada.tempo / this.freada.duracao);
        this.x = Math.max(this.posto, this.x - velocidade * seconds);
        break;
      }
      default:
        break;
    }
    this.posicionar();
  }

  /** O que pode acertar agora: a flecha no ar, ou o golpe de perto nos quadros de contato. */
  contato(): ContatoReforco | null {
    const flecha = this.flechas[0];
    if (flecha) {
      const caixa = this.cfg.flecha!.caixa;
      const escala = this.escala();
      const largura = caixa.largura * escala;
      const altura = caixa.altura * escala;
      // A flecha voa para `lado`; a caixa vai da ponta para trás.
      const esquerda = flecha.lado === -1 ? flecha.x : flecha.x - largura;
      return {
        rect: new Phaser.Geom.Rectangle(esquerda, flecha.y - altura / 2, largura, altura),
        assinatura: flecha.assinatura,
        lado: flecha.lado,
        escapa: flecha.escapa
      };
    }
    if (this.estado !== 'golpeando' || this.acertou || !this.cfg.caixa || !this.cfg.contato?.includes(this.quadro())) return null;
    const caixa = caixaNoMundo(this.x, this.dono.chao(), this.escala(), this.lado, this.cfg.caixa, this.cfg.origem);
    return {
      rect: new Phaser.Geom.Rectangle(caixa.x, caixa.y, caixa.largura, caixa.altura),
      assinatura: this.assinatura,
      lado: this.lado
    };
  }

  /** A Luta avisa que o golpe pegou: era deste reforço? A flecha que acerta some. */
  confirmar(assinatura: number): boolean {
    const flecha = this.flechas.find((f) => f.assinatura === assinatura);
    if (flecha) {
      flecha.sprite.destroy();
      this.flechas = this.flechas.filter((f) => f !== flecha);
      return true;
    }
    if (this.estado !== 'golpeando' || assinatura !== this.assinatura) return false;
    this.acertou = true;
    return true;
  }

  /** Round novo: de volta ao posto, atrás do dono, sem flecha no ar. */
  reset(): void {
    this.flechas.forEach((flecha) => flecha.sprite.destroy());
    this.flechas = [];
    if (!this.montado) return;
    this.posto = this.calcularPosto();
    this.x = this.posto;
    this.elevacao = 0;
    this.ficarDeGuarda();
    this.posicionar();
  }

  destroy(): void {
    this.flechas.forEach((flecha) => flecha.sprite.destroy());
    this.flechas = [];
    if (!this.montado) return;
    this.sprite.destroy();
    this.sombra.destroy();
  }

  private montar(): void {
    this.montado = true;
    this.sprite = this.dono.scene.add.sprite(0, 0, this.dono.animacao(this.cfg.animacoes.guarda) ?? '__MISSING');
    this.sombra = this.dono.scene.add.ellipse(0, 0, 120, 22, 0x000000, 0.3);
    this.sprite.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => this.aoTerminarAnimacao());
    this.reset();
  }

  private aoTerminarAnimacao(): void {
    switch (this.estado) {
      case 'golpeando':
        this.sairDoCampo();
        break;
      case 'freando':
        // Freou (para atirar): começa o disparo.
        if (this.disparo) this.mirar();
        break;
      case 'mirando':
        this.atirar();
        break;
      case 'disparando':
        this.elevacao = 0;
        // O estado muda antes de tocar: o fim de uma animação pode chegar dentro da própria chamada.
        this.estado = 'levantando';
        if (!(this.disparo?.depois && this.tocar(this.disparo.depois, this.lado, this.disparo.depoisDe, true))) this.sairDoCampo();
        break;
      case 'levantando':
        this.sairDoCampo();
        break;
      case 'parando':
        this.x = this.posto;
        this.ficarDeGuarda();
        break;
      case 'saindo':
      case 'voltando':
        if (this.efeito === this.cfg.animacoes.volta) this.tocarLacoDaVolta();
        break;
      default:
        break;
    }
  }

  /**
   * Para atirar: corre até o ponto de disparo (o alcance antes do ponto
   * mirado, sem passar da tela) e freia com o começo da `parada`.
   */
  private entrarParaAtirar(seconds: number, vista: { esquerda: number; direita: number }): void {
    if (this.estado === 'freando') return;
    const dentro = DENTRO_DA_TELA * this.escala();
    // Nunca para fora da tela: se o ponto ficaria fora, para logo dentro da borda.
    const limite = this.lado === -1 ? vista.direita - dentro : vista.esquerda + dentro;
    const alcanceNaTela = Math.min(this.cfg.alcance * this.escala(), Math.abs(limite - this.alvoX));
    const passo = passoAteOAlvo(this.x, this.alvoX, this.lado, alcanceNaTela, this.cfg.velocidade * seconds);
    this.x = passo.x;
    if (!passo.chegou) return;
    this.estado = 'freando';
    const parada = this.cfg.animacoes.parada;
    const quadros = this.cfg.freadaNoCampo;
    if (!(parada && quadros && this.tocarQuadros(parada, quadros, false, this.lado))) this.mirar();
  }

  private mirar(): void {
    const disparo = this.disparo!;
    if (disparo.antes && this.tocar(disparo.antes, this.lado)) {
      this.estado = 'mirando';
      return;
    }
    this.atirar();
  }

  private atirar(): void {
    this.estado = 'disparando';
    this.soltou = false;
    if (!this.tocar(this.disparo!.animacao, this.lado)) this.sairDoCampo();
  }

  /** A flecha sai da boca do arco, uma por chamado, na direção do dono. */
  private soltarFlecha(): void {
    this.soltou = true;
    const flecha = this.cfg.flecha;
    const disparo = this.disparo!;
    const chave = flecha ? this.dono.animacao(flecha.efeito) : null;
    if (!flecha || !chave) return;
    const escala = this.escala();
    // A arte olha para a esquerda: virado para a direita, o desvio da boca espelha.
    const x = this.x - this.lado * (disparo.boca.x - this.cfg.origem.x) * escala;
    const y = this.dono.chao() + (disparo.boca.y - this.cfg.origem.y - this.elevacao) * escala;
    const sprite = this.dono.scene.add
      .image(x, y, chave)
      .setOrigin(this.lado === -1 ? 0 : 1, 0.5)
      .setScale(escala)
      .setFlipX(this.lado === 1)
      .setDepth(PROFUNDIDADE_NO_CAMPO + 1);
    this.flechas.push({ sprite, x, y, lado: this.lado, assinatura: proximaAssinatura++, escapa: disparo.escapa });
  }

  /** A flecha voa reto até sair da tela. */
  private moverFlechas(seconds: number, vista: { esquerda: number; direita: number }): void {
    const velocidade = this.cfg.flecha?.velocidade ?? 0;
    this.flechas = this.flechas.filter((flecha) => {
      flecha.x += flecha.lado * velocidade * seconds;
      flecha.sprite.setPosition(flecha.x, flecha.y);
      const saiu = flecha.lado === -1 ? flecha.x < vista.esquerda - 200 : flecha.x > vista.direita + 200;
      if (saiu) flecha.sprite.destroy();
      return !saiu;
    });
  }

  /** Altura do salto no quadro atual do disparo, em px de quadro (meia parábola entre os quadros do salto). */
  private alturaDoSalto(): number {
    const salto = this.disparo?.salto;
    if (!salto) return 0;
    const [de, ate] = salto.quadros;
    const total = this.sprite.anims.currentAnim?.frames.length ?? 1;
    const agora = (this.sprite.anims.getProgress() ?? 0) * (total - 1);
    if (agora < de || agora > ate + 1) return 0;
    return salto.altura * Math.sin((Math.PI * (agora - de)) / (ate + 1 - de));
  }

  /** A corrida da volta (os quadros de `lacoDaVolta`) repete até ele sair da tela. */
  private tocarLacoDaVolta(): void {
    const volta = this.cfg.animacoes.volta;
    const laco = this.cfg.lacoDaVolta;
    // A volta foi desenhada virando para correr para a direita: espelha quando o golpe é para a direita.
    if (!volta || !laco || !this.tocarQuadros(volta, laco, true, this.lado)) this.tocar(this.cfg.animacoes.corrida, this.saida());
  }

  /** Toca só os quadros `quadros` (primeiro e último) de um efeito, uma vez ou repetindo. */
  private tocarQuadros(efeito: string, quadros: number[], repetir: boolean, direcao: 1 | -1): boolean {
    const chave = this.dono.animacao(efeito);
    const base = chave ? this.dono.scene.anims.get(chave) : null;
    if (!chave || !base) return false;
    const chaveNova = `${chave}-${quadros[0]}-${quadros[1]}${repetir ? '-laco' : ''}`;
    if (!this.dono.scene.anims.exists(chaveNova)) {
      this.dono.scene.anims.create({
        key: chaveNova,
        frames: base.frames.slice(quadros[0], quadros[1] + 1).map((quadro) => ({ key: quadro.textureKey, frame: quadro.textureFrame })),
        frameRate: base.frameRate,
        repeat: repetir ? -1 : 0
      });
    }
    this.sprite.play(chaveNova, true).setFlipX(direcao === 1);
    this.efeito = `${efeito}-${quadros[0]}-${quadros[1]}`;
    return true;
  }

  /** Ainda nos quadros da virada, antes da corrida da volta. */
  private virando(): boolean {
    return this.efeito === this.cfg.animacoes.volta && this.quadro() < (this.cfg.lacoDaVolta?.[0] ?? 0);
  }

  /**
   * Fora do campo: volta pelo fundo até o posto. Sempre entra pela direita,
   * correndo para a esquerda, para a freada terminar na guarda de frente
   * sem espelhar (espelhada, a arma trocaria de mão).
   */
  private retornar(largada: number): void {
    this.estado = 'retornando';
    this.x = Math.max(largada, this.posto);
    this.tocar(this.cfg.animacoes.retorno ?? this.cfg.animacoes.corrida, -1);
  }

  /** Duração de um efeito em segundos (0 se não existe). */
  private duracao(efeito: string | undefined): number {
    const chave = efeito ? this.dono.animacao(efeito) : null;
    const animacao = chave ? this.dono.scene.anims.get(chave) : null;
    return animacao ? animacao.duration / 1000 : 0;
  }

  /**
   * O que aparece na tela, em coordenadas do mundo. A câmera pode dar zoom a
   * partir do canto, então a largura visível é a do canvas dividida pelo zoom.
   */
  private vista(): { esquerda: number; direita: number } {
    const cam = this.dono.scene.cameras.main;
    return { esquerda: cam.scrollX, direita: cam.scrollX + cam.width / (cam.zoom || 1) };
  }

  /**
   * O posto no começo do round: atrás do dono, no chão do plano de fundo,
   * dentro da câmera. Depois disso fica parado; não segue o dono.
   */
  private calcularPosto(): number {
    const x = this.dono.x() - this.dono.lado() * this.cfg.posto * this.escala() * PLANO_DE_FUNDO.escala;
    const { esquerda, direita } = this.vista();
    if (direita <= esquerda) return x;
    const meia = 80 * this.escala() * PLANO_DE_FUNDO.escala;
    return Phaser.Math.Clamp(x, esquerda + PLANO_DE_FUNDO.margem + meia, direita - PLANO_DE_FUNDO.margem - meia);
  }

  private ficarDeGuarda(): void {
    this.estado = 'guarda';
    // A guarda é de frente: sem espelhar.
    this.tocar(this.cfg.animacoes.guarda, -1);
  }

  private golpear(): void {
    this.estado = 'golpeando';
    this.assinatura = proximaAssinatura++;
    if (!(this.cfg.animacoes.chute && this.tocar(this.cfg.animacoes.chute, this.lado))) this.sairDoCampo();
  }

  private sairDoCampo(): void {
    this.estado = 'voltando';
    this.elevacao = 0;
    // A volta começa virada como o golpe; sem ela, a corrida já virada para a saída.
    if (!(this.cfg.animacoes.volta && this.tocar(this.cfg.animacoes.volta, this.lado))) this.tocar(this.cfg.animacoes.corrida, this.saida());
  }

  /** Para onde ele sai: o contrário do golpe, de volta pelo lado de onde veio. */
  private saida(): 1 | -1 {
    return this.lado === 1 ? -1 : 1;
  }

  private correr(direcao: 1 | -1, velocidade: number, seconds: number): void {
    this.x += direcao * velocidade * seconds;
  }

  /** Já chegou ou passou de `ponto`, andando na `direcao`. */
  private passou(ponto: number, direcao: 1 | -1): boolean {
    return direcao === 1 ? this.x >= ponto : this.x <= ponto;
  }

  /**
   * Toca um efeito do mascote virado para `direcao` (a arte olha para a
   * esquerda; para a direita, espelha), a partir de `quadro`, de trás para a
   * frente se `aoContrario`.
   */
  private tocar(efeito: string, direcao: 1 | -1, quadro?: number, aoContrario = false): boolean {
    const chave = this.dono.animacao(efeito);
    if (!chave) return false;
    // De trás para a frente começa no último quadro, salvo outro pedido.
    if (aoContrario) this.sprite.playReverse({ key: chave, startFrame: quadro ?? (this.dono.scene.anims.get(chave).frames.length - 1) }, true);
    else this.sprite.play({ key: chave, startFrame: quadro ?? 0 }, true);
    this.sprite.setFlipX(direcao === 1);
    this.sprite.setOrigin(this.cfg.origem.x / this.sprite.frame.width, this.cfg.origem.y / this.sprite.frame.height);
    this.efeito = efeito;
    return true;
  }

  private noFundo(): boolean {
    return this.estado === 'guarda' || this.estado === 'saindo' || this.estado === 'retornando' || this.estado === 'parando';
  }

  private quadro(): number {
    return (this.sprite.anims.currentFrame?.index ?? 1) - 1;
  }

  private escala(): number {
    return this.dono.escala() * (this.cfg.escala ?? 1);
  }

  private velocidadeNoFundo(): number {
    return this.cfg.velocidadeNoFundo ?? this.cfg.velocidade;
  }

  /** No fundo: menor, com o pé mais alto e atrás dos lutadores (Regra do Fundo). No campo: no chão da luta. */
  private posicionar(): void {
    const fundo = this.noFundo();
    const escala = this.escala() * (fundo ? PLANO_DE_FUNDO.escala : 1);
    const chao = fundo ? this.dono.chaoDoFundo() : this.dono.chao();
    const profundidade = fundo ? PLANO_DE_FUNDO.profundidade : PROFUNDIDADE_NO_CAMPO;
    this.sprite.setPosition(this.x, chao - this.elevacao * escala).setScale(escala).setDepth(profundidade);
    this.sombra.setPosition(this.x, chao).setScale(escala).setDepth(profundidade - 1);
  }
}
