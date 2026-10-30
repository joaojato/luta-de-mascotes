import * as Phaser from 'phaser';

/**
 * Especial "esquadrão" (docs/criador-de-personagem.md, bloco 5): o mascote
 * chama aliados que ficam de prontidão atrás dele. O líder decola, sai pelo
 * alto e mergulha no oponente; só se esse golpe acertar os seguidores atacam,
 * um por vez e de lados alternados, sem guarda que segure. Errou ou foi
 * defendido: todos voltam ao posto. Tudo vem do JSON (Regra do JSON); a arte
 * de cada membro são efeitos `<nome>-idle`, `-takeoff`, `-flight`, `-strike`
 * e `-return` no bloco `effects`.
 */

export interface MembroEsquadrao {
  /** Prefixo dos efeitos do membro no JSON (`gaviao` → `gaviao-idle`...). */
  nome: string;
  /** Tamanho em relação ao dono. */
  escala?: number;
  /** Onde fica de prontidão: px de quadro atrás do dono. */
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
}

const SUBIDA_PX_S = 1500;
const SAIDA_PX_S = 1300;
const VOLTA_SEGUNDOS = 0.6;
const MERGULHO_SEGUNDOS = 0.45;
const ATAQUE_LATERAL_PX_S = 1100;
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

  constructor(private readonly dono: DonoDoEsquadrao, private readonly cfg: EsquadraoConfig) {
    this.membros = [cfg.lider, ...cfg.seguidores].map((membro) => {
      const chave = dono.animacao(`${membro.nome}-idle`) ?? '__MISSING';
      const sprite = dono.scene.add.sprite(0, 0, chave).setOrigin(0.5, 1).setVisible(chave !== '__MISSING');
      return {
        cfg: membro, sprite, estado: 'posto' as Estado, relogio: 0,
        de: new Phaser.Math.Vector2(), para: new Phaser.Math.Vector2(), duracao: 0,
        ativo: false, assinatura: 0, lado: 1 as 1 | -1
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
      if (lider.estado === 'fora' && !this.mergulhou && lider.relogio > 0.3) {
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
    this.membros.forEach((membro) => {
      membro.ativo = false;
      this.irAoPosto(membro);
    });
  }

  destroy(): void {
    this.membros.forEach((membro) => membro.sprite.destroy());
  }

  // ---------------------------------------------------------------- estados

  private posto(membro: Membro): Phaser.Math.Vector2 {
    const escala = this.dono.escala();
    return new Phaser.Math.Vector2(this.dono.x() - this.dono.lado() * membro.cfg.posto * escala, this.dono.chao());
  }

  private tocar(membro: Membro, acao: string): void {
    const chave = this.dono.animacao(`${membro.cfg.nome}-${acao}`);
    if (chave && membro.sprite.anims.currentAnim?.key !== chave) membro.sprite.play(chave);
  }

  private irAoPosto(membro: Membro): void {
    const p = this.posto(membro);
    membro.estado = 'posto';
    membro.sprite.setPosition(p.x, p.y).setVisible(true).setFlipX(this.dono.lado() === 1);
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
    // Entra pelo alto, do lado do dono, em diagonal até o peito do oponente.
    const lado: 1 | -1 = this.dono.x() <= alvo.x ? 1 : -1;
    membro.de.set(alvo.x - lado * 320 * this.dono.escala(), this.topoDaTela() - 40);
    membro.para.set(alvo.x, alvo.y + membro.sprite.displayHeight * 0.45);
    this.comecarAtaque(membro, lado, MERGULHO_SEGUNDOS);
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
      membro.sprite.setVisible(true).setPosition(membro.de.x, membro.de.y).setFlipX(this.dono.lado() === 1);
      this.tocar(membro, 'return');
    });
  }

  private atualizarMembro(membro: Membro, segundos: number): void {
    membro.relogio += segundos;
    membro.sprite.setDepth(this.dono.profundidade() + (membro.estado === 'posto' ? -1 : 2));
    membro.sprite.setScale(this.dono.escala() * (membro.cfg.escala ?? 1));

    switch (membro.estado) {
      case 'posto': {
        // Segue o dono devagar, como quem acompanha de longe.
        const p = this.posto(membro);
        membro.sprite.x += (p.x - membro.sprite.x) * Math.min(1, segundos * 3);
        membro.sprite.y = p.y;
        membro.sprite.setFlipX(this.dono.lado() === 1);
        break;
      }
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
        const t = Math.min(1, membro.relogio / membro.duracao);
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
        const p = this.posto(membro);
        membro.sprite.setPosition(p.x, membro.de.y + (p.y - membro.de.y) * (1 - (1 - t) * (1 - t)));
        if (t >= 1) this.irAoPosto(membro);
        break;
      }
    }
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
