import * as Phaser from 'phaser';

import { PLANO_DE_FUNDO } from './planoDeFundo';
import { caixaNoMundo, ladoDoReforco, passoAteOAlvo, type CaixaDeQuadro } from './reforcoRota';

/**
 * NPC de Guarda que golpeia uma vez (docs/criador-de-personagem.md, bloco 5):
 * fica de guarda no plano de fundo (Regra do Fundo), assistindo à luta. Quando
 * o dono solta o especial, sai correndo pelo fundo para fora da tela, volta
 * já correndo dentro do campo, por trás do adversário, dá um golpe só e sai de
 * novo pelo mesmo lado; depois volta correndo pelo fundo e para no posto. Como
 * o Biriba, golpeia o ponto onde o adversário estava quando o especial saiu:
 * quem anda, pula ou recua a tempo escapa. É o
 * Guerreiro do Cartola (docs/guerreiro-npc-v1.md).
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
  /** O golpe. */
  chute: string;
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
  /** Distância do pé de apoio ao centro do alvo quando freia, em px de quadro. */
  alcance: number;
  /** Quadro da corrida em que ele freia para golpear (padrão 4: o apoio no pé B). */
  quadroDeApoio?: number;
  /** Quadros do golpe em que a caixa vale (um contato só). */
  contato: number[];
  /**
   * Primeiro e último quadro da `volta` que repetem até ele sair da tela (a corrida); os de
   * antes são a virada, parado no lugar.
   */
  lacoDaVolta?: number[];
  /** Caixa do golpe em px de quadro, na arte virada para a esquerda. */
  caixa: CaixaDeQuadro;
  /** Pé de apoio na célula da arte, em px. */
  origem: { x: number; y: number };
  dano: number;
  /** Empurrão do golpe (como o `knockback` dos golpes do mascote). */
  empurrao: number;
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
}

type Estado = 'guarda' | 'saindo' | 'entrando' | 'freando' | 'golpeando' | 'voltando' | 'retornando' | 'parando';

/** No campo, na frente dos dois lutadores (5 e 8 na Luta): ele entra na briga. */
const PROFUNDIDADE_NO_CAMPO = 9;
/** Quanto passa da borda da vista para contar como fora da tela, em px de quadro. */
const FORA_DA_TELA = 130;

let proximaAssinatura = 950_000;

export class Reforco {
  // Montados no primeiro quadro com câmera (a Luta de verdade).
  private sprite!: Phaser.GameObjects.Sprite;
  private sombra!: Phaser.GameObjects.Ellipse;
  private montado = false;
  private estado: Estado = 'guarda';
  private x = 0;
  private posto = 0;
  /** Para onde o golpe empurra o alvo (na direção do dono); ele entra e sai pelo lado oposto. */
  private lado: 1 | -1 = -1;
  /**
   * Onde o adversário estava quando o especial saiu. Como o Biriba, ele golpeia
   * esse ponto, não o adversário: quem sai dali escapa.
   */
  private alvoX = 0;
  private assinatura = 0;
  private acertou = false;
  /** O efeito tocando agora (para saber se está na virada da volta). */
  private efeito = '';
  /** Freada até o posto: velocidade no começo e tempo decorrido. */
  private freada = { velocidade: 0, tempo: 0, duracao: 0 };

  constructor(
    private readonly dono: DonoDoReforco,
    private readonly cfg: ReforcoConfig
  ) {}

  /** De guarda no fundo: o especial pode chamar de novo. */
  get pronto(): boolean {
    return this.estado === 'guarda';
  }

  /** O dono soltou o especial: sai do fundo para buscar o adversário. */
  chamar(): void {
    const alvo = this.dono.alvo();
    if (!this.montado || this.estado !== 'guarda' || !alvo) return;
    this.lado = ladoDoReforco(this.dono.x(), alvo.x);
    this.alvoX = alvo.x;
    this.acertou = false;
    this.estado = 'saindo';
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

    switch (this.estado) {
      case 'saindo':
        this.correr(this.saida(), this.velocidadeNoFundo(), seconds);
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
        const passo = passoAteOAlvo(this.x, this.alvoX, this.lado, this.cfg.alcance * this.escala(), this.cfg.velocidade * seconds);
        this.x = passo.x;
        if (passo.chegou) this.estado = 'freando';
        if (this.estado === 'freando' && this.quadro() === (this.cfg.quadroDeApoio ?? 4)) this.golpear();
        break;
      }
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

  /** O golpe, nos quadros de contato, até acertar uma vez. */
  contato(): ContatoReforco | null {
    if (this.estado !== 'golpeando' || this.acertou || !this.cfg.contato.includes(this.quadro())) return null;
    const caixa = caixaNoMundo(this.x, this.dono.chao(), this.escala(), this.lado, this.cfg.caixa, this.cfg.origem);
    return {
      rect: new Phaser.Geom.Rectangle(caixa.x, caixa.y, caixa.largura, caixa.altura),
      assinatura: this.assinatura,
      lado: this.lado
    };
  }

  /** A Luta avisa que o golpe pegou: era deste reforço? */
  confirmar(assinatura: number): boolean {
    if (this.estado !== 'golpeando' || assinatura !== this.assinatura) return false;
    this.acertou = true;
    return true;
  }

  /** Round novo: de volta ao posto, atrás do dono. */
  reset(): void {
    if (!this.montado) return;
    this.posto = this.calcularPosto();
    this.x = this.posto;
    this.ficarDeGuarda();
    this.posicionar();
  }

  destroy(): void {
    if (!this.montado) return;
    this.sprite.destroy();
    this.sombra.destroy();
  }

  private montar(): void {
    this.montado = true;
    this.sprite = this.dono.scene.add.sprite(0, 0, this.dono.animacao(this.cfg.animacoes.guarda) ?? '__MISSING');
    this.sombra = this.dono.scene.add.ellipse(0, 0, 120, 22, 0x000000, 0.3);
    this.sprite.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      if (this.estado === 'golpeando') this.sairDoCampo();
      else if (this.estado === 'parando') {
        this.x = this.posto;
        this.ficarDeGuarda();
      } else if (this.estado === 'voltando' && this.efeito === this.cfg.animacoes.volta) this.tocarLacoDaVolta();
    });
    this.reset();
  }

  /** A corrida da volta (os quadros de `lacoDaVolta`) repete até ele sair da tela. */
  private tocarLacoDaVolta(): void {
    const chave = this.cfg.animacoes.volta ? this.dono.animacao(this.cfg.animacoes.volta) : null;
    const laco = this.cfg.lacoDaVolta;
    const base = chave ? this.dono.scene.anims.get(chave) : null;
    if (!chave || !laco || !base) {
      this.tocar(this.cfg.animacoes.corrida, this.saida());
      return;
    }
    const chaveDoLaco = `${chave}-laco`;
    if (!this.dono.scene.anims.exists(chaveDoLaco)) {
      this.dono.scene.anims.create({
        key: chaveDoLaco,
        frames: base.frames.slice(laco[0], laco[1] + 1).map((quadro) => ({ key: quadro.textureKey, frame: quadro.textureFrame })),
        frameRate: base.frameRate,
        repeat: -1
      });
    }
    this.sprite.play(chaveDoLaco, true);
    this.efeito = `${this.cfg.animacoes.volta}-laco`;
  }

  /** Ainda nos quadros da virada, antes da corrida da volta. */
  private virando(): boolean {
    return this.efeito === this.cfg.animacoes.volta && this.quadro() < (this.cfg.lacoDaVolta?.[0] ?? 0);
  }

  /**
   * Fora do campo: volta pelo fundo até o posto. Sempre entra pela direita,
   * correndo para a esquerda, para a freada terminar na guarda de frente
   * sem espelhar (espelhada, a lança trocaria de mão).
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
    if (!this.tocar(this.cfg.animacoes.chute, this.lado)) this.sairDoCampo();
  }

  private sairDoCampo(): void {
    this.estado = 'voltando';
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
   * esquerda; para a direita, espelha).
   */
  private tocar(efeito: string, direcao: 1 | -1): boolean {
    const chave = this.dono.animacao(efeito);
    if (!chave) return false;
    this.sprite.play(chave, true).setFlipX(direcao === 1);
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
    this.sprite.setPosition(this.x, chao).setScale(escala).setDepth(profundidade);
    this.sombra.setPosition(this.x, chao).setScale(escala).setDepth(profundidade - 1);
  }
}
