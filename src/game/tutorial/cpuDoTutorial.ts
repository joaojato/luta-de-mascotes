import type { LeituraDaLuta } from '../cpu';
import type { FighterInput } from '../fighter';
import type { GuardStance } from '../moveMechanics';
import { TreinoDeAparo } from './aparo';
import type { RoteiroDaCpu } from './roteiro';

/**
 * A CPU do tutorial faz exatamente o que o texto manda (João, 03/11/2026):
 * nada de sorteio, um comportamento por etapa. Sem Phaser, como a cpu.ts.
 */

/** A leitura da cpu.ts e a guarda do jogador, que o tutorial espera para quebrar. */
export interface LeituraDoTutorial extends LeituraDaLuta {
  guardaDoOponente: GuardStance | null;
  /** Ela está no meio de um golpe ou atordoada: não anda, e a distância parada não é encostar. */
  euOcupado: boolean;
}

/**
 * Até onde ela anda para chegar no jogador, px de mundo entre os centros:
 * perto o bastante para o soco rápido mais curto do elenco alcançar.
 */
const PERTO = 160;
/** Na guarda e nos golpes, chega um pouco mais perto para o golpe alcançar. */
const PERTO_DO_GOLPE = 180;
/** Pulando no lugar (João: 1,5 s entre um pulo e outro). */
const PULO_A_CADA_MS = 1500;
const PERTO_DO_PULO = 300;
const SOCO_A_CADA_MS = 1100;
const PESADO_A_CADA_MS = 1400;
/** De onde a voadora sai: o pulo para a frente cobre a distância e o chute desce no jogador. */
const DISTANCIA_DA_VOADORA = 330;
/** Do pulo ao chute, ms: perto do alto do pulo, para o mergulho pegar quem ficou. */
const CHUTE_NO_AR_MS = 220;
const VOADORA_A_CADA_MS = 2200;
/** Quanto tempo segura o baixo do golpe abaixado. */
const SEGURAR_BAIXO_MS = 120;
/**
 * Andando para a frente sem a distância diminuir este tempo, encostou no
 * jogador: o corpo largo (o casaco do Almirante) não deixa chegar mais perto,
 * e dali o golpe já alcança.
 */
const ENCOSTOU_MS = 150;
/** Mais longe que isto não é corpo nenhum: é o jogador recuando no mesmo passo. */
const ENCOSTOU_ATE = 260;

const NEUTRO: FighterInput = {
  left: false, right: false, crouch: false, block: false, jump: false, light: false, heavy: false, special: false
};

export class CpuDoTutorial {
  readonly aparo = new TreinoDeAparo();
  /** Quando ela pousou do último pulo. */
  private pousouEm: number | null = null;
  private estavaNoAr = false;
  private proximoGolpe = 0;
  private baixoAte = 0;
  /** Pesado da vez: soco forte e chute baixo se alternam. */
  private chuteDaVez = false;
  /** Voadora em andamento: quando pulou e se já chutou. */
  private voadora: { pulouEm: number; chutou: boolean } | null = null;
  /** A distância do quadro anterior, se ela tentou andar nele, e desde quando anda sem chegar. */
  private ultimaDistancia = Number.POSITIVE_INFINITY;
  private andouAntes = false;
  private travadaDesde: number | null = null;

  /** Pulou para a voadora e ainda não pousou. */
  get emVoadora(): boolean {
    return this.voadora !== null;
  }

  /**
   * @param roteiro - O que a etapa manda fazer agora.
   * @param l - A luta, no relógio do tutorial (a câmera lenta atrasa ele).
   * @param antecedenciaMs - Do botão ao contato do soco rápido dela (para o aparo).
   */
  atualizar(roteiro: RoteiroDaCpu, l: LeituraDoTutorial, antecedenciaMs = 80): FighterInput {
    const input: FighterInput = { ...NEUTRO };
    const t = l.tempoMs;
    const distancia = Math.abs(l.oponente.x - l.eu.x);
    const frente = l.oponente.x >= l.eu.x ? 'right' : 'left';

    if (this.estavaNoAr && !l.eu.noAr) {
      this.pousouEm = t;
      this.voadora = null;
    }
    this.estavaNoAr = l.eu.noAr;
    if (t < this.baixoAte) input.crouch = true;
    if (l.eu.atordoado) return input;
    if (l.eu.noAr) {
      // No ar só a voadora decide alguma coisa: segura para a frente (no ar
      // a direção vale quadro a quadro) e chuta perto do alto do pulo.
      if (this.voadora) input[frente] = true;
      if (this.voadora && !this.voadora.chutou && t - this.voadora.pulouEm >= CHUTE_NO_AR_MS) {
        this.voadora.chutou = true;
        input.heavy = true;
      }
      return input;
    }
    // Tentou andar e a distância não diminuiu: encostou no corpo do jogador.
    // Parada (ou com a luta congelada) a distância também não muda, e não conta.
    const travou = this.andouAntes && !l.euOcupado && distancia <= ENCOSTOU_ATE && distancia >= this.ultimaDistancia - 0.5;
    if (!travou) this.travadaDesde = null;
    else if (this.travadaDesde === null) this.travadaDesde = t;
    this.ultimaDistancia = distancia;
    this.andouAntes = false;
    const encostou = this.travadaDesde !== null && t - this.travadaDesde >= ENCOSTOU_MS;
    const chegar = (ate: number): boolean => {
      if (distancia <= ate || encostou) return false;
      input[frente] = true;
      this.andouAntes = true;
      return true;
    };

    switch (roteiro) {
      case 'parada':
        break;
      case 'chegar':
        chegar(PERTO);
        break;
      case 'guarda-alta':
        // Perto como nos golpes dela: o chute baixo do jogador precisa alcançar.
        if (!chegar(PERTO_DO_GOLPE)) input.block = true;
        break;
      case 'pular':
        if (chegar(PERTO_DO_PULO)) break;
        if (this.pousouEm === null || t - this.pousouEm >= PULO_A_CADA_MS) {
          input.jump = true;
          // Sem pouso ainda: o próximo pulo espera a partir de agora.
          this.pousouEm = t;
        }
        break;
      case 'socos':
        if (chegar(PERTO_DO_GOLPE) || t < this.proximoGolpe) break;
        input.light = true;
        this.proximoGolpe = t + SOCO_A_CADA_MS;
        break;
      case 'aparo': {
        if (chegar(PERTO_DO_GOLPE) && !this.aparo.emAndamento) break;
        const quadro = this.aparo.quadro(t, !l.oponente.noAr && (distancia <= PERTO_DO_GOLPE + 20 || encostou), antecedenciaMs);
        if (quadro.socar) input.light = true;
        break;
      }
      case 'soco-forte-na-guarda':
        // Espera a guarda em pé, que o soco forte quebra.
        if (chegar(PERTO_DO_GOLPE) || t < this.proximoGolpe || l.guardaDoOponente !== 'alta') break;
        this.golpeAbaixado(t, input, false);
        break;
      case 'pesados':
        if (chegar(PERTO_DO_GOLPE) || t < this.proximoGolpe) break;
        this.golpeAbaixado(t, input, this.chuteDaVez);
        this.chuteDaVez = !this.chuteDaVez;
        break;
      case 'voadora-na-guarda-baixa':
        // Espera a guarda baixa, que só a voadora quebra.
        if (l.guardaDoOponente !== 'baixa') {
          chegar(DISTANCIA_DA_VOADORA);
          break;
        }
        this.pularNaVoadora(t, input, distancia, frente, l);
        break;
      case 'voadoras':
        this.pularNaVoadora(t, input, distancia, frente, l);
        break;
    }
    return input;
  }

  /** Soco forte (baixo + soco) ou chute baixo (baixo + chute): o motor lê baixo e botão no mesmo quadro. */
  private golpeAbaixado(t: number, input: FighterInput, chute: boolean): void {
    input.crouch = true;
    if (chute) input.heavy = true;
    else input.light = true;
    this.baixoAte = t + SEGURAR_BAIXO_MS;
    this.proximoGolpe = t + PESADO_A_CADA_MS;
  }

  /** Chega na distância da voadora e pula para a frente; o chute sai no ar (atualizar). */
  private pularNaVoadora(t: number, input: FighterInput, distancia: number, frente: 'left' | 'right', l: LeituraDaLuta): void {
    if (distancia > DISTANCIA_DA_VOADORA + 30) {
      input[frente] = true;
      return;
    }
    // Perto demais, o pulo passaria por cima: recua até a distância.
    if (distancia < DISTANCIA_DA_VOADORA - 60) {
      input[frente === 'right' ? 'left' : 'right'] = true;
      return;
    }
    // Espera o jogador se recuperar do golpe anterior: ele precisa poder desviar.
    if (t < this.proximoGolpe || l.oponente.atordoado || l.oponente.caido) return;
    input.jump = true;
    input[frente] = true;
    this.voadora = { pulouEm: t, chutou: false };
    this.proximoGolpe = t + VOADORA_A_CADA_MS;
  }
}
