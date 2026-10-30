import * as Phaser from 'phaser';
import { sortearMergulho, type JanelaDoMergulho } from './mergulho';
import { PLANO_DE_FUNDO } from './planoDeFundo';

/**
 * Especial "esquadrão" (docs/criador-de-personagem.md, bloco 5): o mascote
 * chama aliados que ficam de prontidão no plano de fundo (Regra do Fundo,
 * src/game/planoDeFundo.ts), parados assistindo à luta. O líder decola, sai pelo
 * alto e mergulha no oponente; só se esse golpe acertar os seguidores atacam,
 * um por vez e de lados alternados, sem guarda que segure, teleguiados: o
 * oponente pode andar e pular, eles vão atrás. Errou ou foi
 * defendido: todos voltam ao posto. Tudo vem do JSON (Regra do JSON); a arte
 * de cada membro são efeitos `<nome>-idle`, `-takeoff`, `-flight`, `-strike`
 * e `-return` no bloco `effects`.
 */

export interface MembroEsquadrao {
  /** Prefixo dos efeitos do membro no JSON (`gaviao` → `gaviao-idle`...). */
  nome: string;
  /** Tamanho em relação ao dono. */
  escala?: number;
  /** Onde fica de prontidão no fundo: px de quadro atrás do dono. */
  posto: number;
}

export interface EsquadraoConfig {
  lider: MembroEsquadrao;
  seguidores: MembroEsquadrao[];
  /** Dano de cada contato (o do líder e o de cada seguidor). */
  dano: number;
  /** Caixa de acerto de cada membro, em px de quadro. */
  caixa?: { largura: number; altura: number };
  /** Altura do alvo acima do chão, em px de quadro (o peito). */
  alturaAlvo?: number;
  /**
   * Quando o líder mergulha, em segundos desde o botão: sorteado entre
   * `segundos - adiantar` e `segundos + atrasar`, para não ter hora certa.
   */
  mergulho?: JanelaDoMergulho;
}

/** O que o esquadrão precisa saber do dono, sem depender da classe Fighter. */
export interface DonoDoEsquadrao {
  readonly scene: Phaser.Scene;
  x(): number;
  chao(): number;
  /** 1 olhando para a direita. */
  lado(): 1 | -1;
  escala(): number;
  profundidade(): number;
  alvoX(): number | null;
  /** Corpo do oponente agora (pulando, agachado), para os teleguiados. */
  alvoCorpo(): Phaser.Geom.Rectangle | null;
  /** Chave da animação de um efeito do mascote (`fx-<nome>`), se existir. */
  animacao(efeito: string): string | null;
}

/** Um contato do esquadrão, no formato que a Luta entende. */
export interface ContatoEsquadrao {
  rect: Phaser.Geom.Rectangle;
  assinatura: number;
  bloqueavel: boolean;
  ultimo: boolean;
  lado: 1 | -1;
}

type Estado = 'posto' | 'decolando' | 'fora' | 'atacando' | 'saindo' | 'voltando';

interface Membro {
  cfg: MembroEsquadrao;
  sprite: Phaser.GameObjects.Sprite;
  estado: Estado;
  relogio: number;
  de: Phaser.Math.Vector2;
  para: Phaser.Math.Vector2;
  duracao: number;
  /** Contato liberado neste ataque (sai quando acerta ou passa). */
  ativo: boolean;
  assinatura: number;
  lado: 1 | -1;
  /** Lugar no fundo, marcado no começo do round: dali só sai para atacar. */
  fixo: Phaser.Math.Vector2;
  /** Escala no começo do ataque: quem sai do fundo cresce até o tamanho do lutador. */
  escalaInicial: number;
}

const SUBIDA_PX_S = 1500;
const SAIDA_PX_S = 1300;
const VOLTA_SEGUNDOS = 0.6;
/** Velocidade do mergulho do líder (antes 0,45 s fixos, cerca de 1850 px/s). */
const MERGULHO_PX_S = 2600;
const ATAQUE_LATERAL_PX_S = 1100;
/** Teleguiado que não alcança nisso (oponente caído, fim de round) desiste. */
const PERSEGUICAO_MAXIMA_S = 2.5;
const ESPERA_ENTRE_SEGUIDORES = 0.25;
/** Assinaturas próprias, longe das do dono, para a Luta não confundir os golpes. */
let proximaAssinatura = 900_000;

export class Esquadrao {
  private readonly membros: Membro[];
  private fase: 'pronto' | 'lider' | 'seguidores' | 'volta' = 'pronto';
  private acertou = false;
  private mergulhou = false;
  private seguidorDaVez = -1;
  private espera = 0;
  /** Tempo desde o botão e o momento sorteado do mergulho do líder. */
  private tempoDoLider = 0;
  private momentoDoMergulho = 0;

  constructor(
    private readonly dono: DonoDoEsquadrao,
    private readonly cfg: EsquadraoConfig,
    private readonly aleatorio: () => number = Math.random
  ) {
    this.membros = [cfg.lider, ...cfg.seguidores].map((membro) => {
      const chave = dono.animacao(`${membro.nome}-idle`) ?? '__MISSING';
      const sprite = dono.scene.add.sprite(0, 0, chave).setOrigin(0.5, 1).setVisible(chave !== '__MISSING');
      return {
        cfg: membro, sprite, estado: 'posto' as Estado, relogio: 0,
        de: new Phaser.Math.Vector2(), para: new Phaser.Math.Vector2(), duracao: 0,
        ativo: false, assinatura: 0, lado: 1 as 1 | -1, fixo: new Phaser.Math.Vector2(), escalaInicial: 1
      };
    });
    this.reset();
  }

  /** O especial pode ser chamado de novo (ninguém no ar). */
  get pronto(): boolean {
    return this.fase === 'pronto';
  }

  /** O dono chamou: o líder decola. */
  atacar(): void {
    if (!this.pronto || this.dono.alvoX() === null) return;
    this.fase = 'lider';
    this.acertou = false;
    this.mergulhou = false;
    this.tempoDoLider = 0;
    this.momentoDoMergulho = sortearMergulho(this.cfg.mergulho, this.aleatorio);
    this.decolar(this.membros[0]);
  }

  /**
   * A Luta confirmou o contato. Defendido não conta como acerto: o líder
   * defendido não chama os seguidores.
   */
  confirmar(assinatura: number, defendido = false): boolean {
    const membro = this.membros.find((m) => m.ativo && m.assinatura === assinatura);
    if (!membro) return false;
    membro.ativo = false;
    if (membro === this.membros[0]) this.acertou = !defendido;
    this.sair(membro);
    return true;
  }

  /** O contato ativo agora, se houver. */
  contato(): ContatoEsquadrao | null {
    const membro = this.membros.find((m) => m.ativo);
    if (!membro) return null;
    const escala = this.dono.escala() * (membro.cfg.escala ?? 1);
    const largura = (this.cfg.caixa?.largura ?? 90) * escala;
    const altura = (this.cfg.caixa?.altura ?? 90) * escala;
    // O sprite tem origem no pé; a caixa fica no meio do corpo, um pouco à frente.
    const cx = membro.sprite.x + membro.lado * largura * 0.3;
    const cy = membro.sprite.y - (membro.sprite.displayHeight * 0.45);
    const ultimo = membro !== this.membros[0] && membro === this.membros[this.membros.length - 1];
    return {
      rect: new Phaser.Geom.Rectangle(cx - largura / 2, cy - altura / 2, largura, altura),
      assinatura: membro.assinatura,
      bloqueavel: membro === this.membros[0],
      ultimo,
      lado: membro.lado
    };
  }

  update(segundos: number): void {
    this.membros.forEach((membro) => this.atualizarMembro(membro, segundos));

    if (this.fase === 'lider') {
      const lider = this.membros[0];
      this.tempoDoLider += segundos;
      // Mergulha na hora sorteada: do alto se já saiu da tela, ou de onde estiver
      // no ar se a hora chegou antes (nunca do chão).
      const noAr = lider.estado === 'fora' || (lider.estado === 'decolando' && lider.sprite.y < this.posto(lider).y - 40);
      if (noAr && !this.mergulhou && this.tempoDoLider >= this.momentoDoMergulho) {
        this.mergulhou = true;
        this.mergulhar(lider);
      } else if (lider.estado === 'fora' && this.mergulhou) {
        // Voltou a sair pelo alto depois do mergulho: acertou chama a turma, errou volta.
        if (this.acertou) this.comecarSeguidores();
        else this.voltarTodos();
      }
    } else if (this.fase === 'seguidores') {
      const atual = this.membros[this.seguidorDaVez];
      if (atual && atual.estado !== 'atacando') {
        this.espera -= segundos;
        const ultimo = this.seguidorDaVez >= this.membros.length - 1;
        if (this.espera <= 0 && !ultimo) this.proximoSeguidor();
        else if (ultimo && this.membros.slice(1).every((m) => m.estado === 'fora')) this.voltarTodos();
      }
    } else if (this.fase === 'volta' && this.membros.every((m) => m.estado === 'posto')) {
      this.fase = 'pronto';
    }
  }

  /** Fim de round ou revanche: todos no posto, nada no ar. */
  reset(): void {
    this.fase = 'pronto';
    this.acertou = false;
    this.mergulhou = false;
    this.seguidorDaVez = -1;
    const postos = this.postos();
    this.membros.forEach((membro, i) => {
      membro.ativo = false;
      membro.fixo.copy(postos[i]);
      this.irAoPosto(membro);
    });
  }

  destroy(): void {
    this.membros.forEach((membro) => membro.sprite.destroy());
  }

  // ---------------------------------------------------------------- estados

  /**
   * Onde cada um fica no fundo no começo do round: atrás do dono, no chão do
   * plano de fundo. O grupo inteiro se desloca para caber na câmera, sem
   * perder o espaçamento. Depois disso ficam parados; não seguem o dono.
   */
  private postos(): Phaser.Math.Vector2[] {
    const escala = this.dono.escala();
    const y = this.dono.chao() - PLANO_DE_FUNDO.recuo;
    const xs = this.membros.map((m) => this.dono.x() - this.dono.lado() * m.cfg.posto * escala * PLANO_DE_FUNDO.escala);
    const vista = this.dono.scene.cameras?.main?.worldView;
    if (vista && vista.width > 0) {
      // Metade do desenho, não da célula (a célula tem folga transparente).
      const meia = this.membros.map((m) => m.sprite.width * this.escalaNoFundo(m) * 0.3);
      const esquerda = Math.min(...xs.map((x, i) => x - meia[i]));
      const direita = Math.max(...xs.map((x, i) => x + meia[i]));
      const min = vista.x + PLANO_DE_FUNDO.margem;
      const max = vista.right - PLANO_DE_FUNDO.margem;
      const desvio = esquerda < min ? min - esquerda : direita > max ? max - direita : 0;
      return xs.map((x) => new Phaser.Math.Vector2(x + desvio, y));
    }
    return xs.map((x) => new Phaser.Math.Vector2(x, y));
  }

  private posto(membro: Membro): Phaser.Math.Vector2 {
    return membro.fixo;
  }

  /** Parado no fundo, vira para onde a luta está (o meio entre os dois). */
  private olharParaALuta(membro: Membro): void {
    const alvo = this.dono.alvoX();
    const meio = alvo === null ? this.dono.x() : (this.dono.x() + alvo) / 2;
    if (Math.abs(meio - membro.sprite.x) > 30) membro.sprite.setFlipX(meio > membro.sprite.x);
  }

  private escalaNoFundo(membro: Membro): number {
    return this.dono.escala() * (membro.cfg.escala ?? 1) * PLANO_DE_FUNDO.escala;
  }

  private tocar(membro: Membro, acao: string): void {
    const chave = this.dono.animacao(`${membro.cfg.nome}-${acao}`);
    if (chave && membro.sprite.anims.currentAnim?.key !== chave) membro.sprite.play(chave);
  }

  private irAoPosto(membro: Membro): void {
    const p = this.posto(membro);
    membro.estado = 'posto';
    membro.sprite.setPosition(p.x, p.y).setVisible(true);
    this.olharParaALuta(membro);
    this.tocar(membro, 'idle');
  }

  private decolar(membro: Membro): void {
    membro.estado = 'decolando';
    membro.relogio = 0;
    this.tocar(membro, 'takeoff');
  }

  private mergulhar(membro: Membro): void {
    const alvo = this.alvo();
    if (!alvo) {
      this.voltarTodos();
      return;
    }
    // Entra pelo alto, do lado do dono, em diagonal até o peito do oponente;
    // ainda subindo, parte de onde está.
    const lado: 1 | -1 = this.dono.x() <= alvo.x ? 1 : -1;
    const subindo = membro.estado === 'decolando';
    if (subindo) membro.de.set(membro.sprite.x, membro.sprite.y);
    else membro.de.set(alvo.x - lado * 320 * this.dono.escala(), this.topoDaTela() - 40);
    const escalaFinal = this.dono.escala() * (membro.cfg.escala ?? 1);
    membro.para.set(alvo.x, alvo.y + escalaFinal * membro.sprite.height * 0.45);
    this.comecarAtaque(membro, lado, membro.de.distance(membro.para) / MERGULHO_PX_S);
    membro.escalaInicial = subindo ? this.escalaNoFundo(membro) : escalaFinal;
  }

  private comecarSeguidores(): void {
    this.fase = 'seguidores';
    this.seguidorDaVez = 0;
    this.espera = 0.35;
    this.membros.slice(1).forEach((membro) => this.decolar(membro));
  }

  private proximoSeguidor(): void {
    this.seguidorDaVez += 1;
    const membro = this.membros[this.seguidorDaVez];
    const alvo = this.alvo();
    if (!membro || !alvo) {
      this.voltarTodos();
      return;
    }
    // Lados alternados, começando pelo lado oposto ao dono.
    const ladoDoDono: 1 | -1 = this.dono.x() <= alvo.x ? 1 : -1;
    const lado = (this.seguidorDaVez % 2 === 1 ? -ladoDoDono : ladoDoDono) as 1 | -1;
    const distancia = 520 * this.dono.escala();
    membro.de.set(alvo.x - lado * distancia, alvo.y + membro.sprite.displayHeight * 0.4);
    membro.para.set(alvo.x + lado * 60 * this.dono.escala(), alvo.y + membro.sprite.displayHeight * 0.45);
    this.comecarAtaque(membro, lado, membro.de.distance(membro.para) / ATAQUE_LATERAL_PX_S);
    this.espera = ESPERA_ENTRE_SEGUIDORES;
  }

  private comecarAtaque(membro: Membro, lado: 1 | -1, duracao: number): void {
    membro.estado = 'atacando';
    membro.relogio = 0;
    membro.duracao = Math.max(0.15, duracao);
    membro.lado = lado;
    membro.ativo = true;
    membro.escalaInicial = this.dono.escala() * (membro.cfg.escala ?? 1);
    membro.assinatura = proximaAssinatura++;
    membro.sprite.setVisible(true).setPosition(membro.de.x, membro.de.y).setFlipX(lado === 1);
    this.tocar(membro, 'flight');
  }

  private sair(membro: Membro): void {
    membro.estado = 'saindo';
    membro.relogio = 0;
    membro.ativo = false;
  }

  private voltarTodos(): void {
    this.fase = 'volta';
    this.membros.forEach((membro) => {
      if (membro.estado === 'posto') return;
      membro.ativo = false;
      membro.estado = 'voltando';
      membro.relogio = 0;
      const p = this.posto(membro);
      membro.de.set(p.x, this.topoDaTela() - 40);
      membro.sprite.setVisible(true).setPosition(membro.de.x, membro.de.y);
      this.olharParaALuta(membro);
      this.tocar(membro, 'return');
    });
  }

  private atualizarMembro(membro: Membro, segundos: number): void {
    membro.relogio += segundos;
    // Só quem ataca sai do fundo e passa na frente dos lutadores.
    const noFundo = membro.estado === 'posto' || membro.estado === 'decolando' || membro.estado === 'voltando';
    membro.sprite.setDepth(noFundo ? PLANO_DE_FUNDO.profundidade : this.dono.profundidade() + 2);
    membro.sprite.setScale(noFundo ? this.escalaNoFundo(membro) : this.dono.escala() * (membro.cfg.escala ?? 1));

    switch (membro.estado) {
      case 'posto':
        // Parados no lugar, só assistindo (o Biriba é quem acompanha o dono).
        membro.sprite.setPosition(membro.fixo.x, membro.fixo.y);
        this.olharParaALuta(membro);
        break;
      case 'decolando': {
        const takeoff = membro.sprite.anims.currentAnim;
        const preparo = takeoff ? (takeoff.frames.length / takeoff.frameRate) * 0.5 : 0.25;
        if (membro.relogio > preparo) membro.sprite.y -= SUBIDA_PX_S * segundos;
        if (membro.sprite.y < this.topoDaTela() - 20) {
          membro.estado = 'fora';
          membro.relogio = 0;
          membro.sprite.setVisible(false);
        }
        break;
      }
      case 'fora':
        break;
      case 'atacando': {
        if (membro !== this.membros[0]) {
          this.perseguir(membro, segundos);
          break;
        }
        const t = Math.min(1, membro.relogio / membro.duracao);
        const escalaFinal = this.dono.escala() * (membro.cfg.escala ?? 1);
        membro.sprite.setScale(membro.escalaInicial + (escalaFinal - membro.escalaInicial) * t);
        membro.sprite.setPosition(
          membro.de.x + (membro.para.x - membro.de.x) * t,
          membro.de.y + (membro.para.y - membro.de.y) * t
        );
        if (t > 0.55) this.tocar(membro, 'strike');
        // Passou sem acertar: errou e vai embora pelo alto.
        if (t >= 1) this.sair(membro);
        break;
      }
      case 'saindo': {
        membro.sprite.y -= SAIDA_PX_S * segundos;
        membro.sprite.x += membro.lado * SAIDA_PX_S * 0.4 * segundos;
        if (membro.relogio > 0.12) this.tocar(membro, 'flight');
        if (membro.sprite.y < this.topoDaTela() - 20) {
          membro.estado = 'fora';
          membro.relogio = 0;
          membro.sprite.setVisible(false);
        }
        break;
      }
      case 'voltando': {
        const t = Math.min(1, membro.relogio / VOLTA_SEGUNDOS);
        const p = membro.fixo;
        membro.sprite.setPosition(p.x, membro.de.y + (p.y - membro.de.y) * (1 - (1 - t) * (1 - t)));
        if (t >= 1) this.irAoPosto(membro);
        break;
      }
    }
  }

  /**
   * Seguidor teleguiado: voa a passo constante para o corpo do oponente onde
   * ele estiver agora, vira se o oponente passar por cima e só sai quando a
   * Luta confirma o contato.
   */
  private perseguir(membro: Membro, segundos: number): void {
    const corpo = this.dono.alvoCorpo();
    if (!corpo || membro.relogio > PERSEGUICAO_MAXIMA_S) {
      this.sair(membro);
      return;
    }
    membro.sprite.setScale(this.dono.escala() * (membro.cfg.escala ?? 1));
    // A caixa do membro fica no meio do corpo dele (ver contato()): mira esse ponto no centro do oponente.
    const alvo = new Phaser.Math.Vector2(corpo.centerX, corpo.centerY + membro.sprite.displayHeight * 0.45);
    const atual = new Phaser.Math.Vector2(membro.sprite.x, membro.sprite.y);
    const distancia = atual.distance(alvo);
    const passo = Math.min(distancia, ATAQUE_LATERAL_PX_S * segundos);
    if (distancia > 0) atual.add(alvo.clone().subtract(atual).scale(passo / distancia));
    membro.sprite.setPosition(atual.x, atual.y);
    if (Math.abs(alvo.x - atual.x) > 4) {
      membro.lado = alvo.x > atual.x ? 1 : -1;
      membro.sprite.setFlipX(membro.lado === 1);
    }
    if (distancia < 160 * this.dono.escala()) this.tocar(membro, 'strike');
  }

  private alvo(): Phaser.Math.Vector2 | null {
    const x = this.dono.alvoX();
    if (x === null) return null;
    return new Phaser.Math.Vector2(x, this.dono.chao() - (this.cfg.alturaAlvo ?? 110) * this.dono.escala());
  }

  private topoDaTela(): number {
    return this.dono.scene.cameras?.main?.worldView?.y ?? 0;
  }
}
