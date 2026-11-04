/**
 * O aparo do tutorial como quick time event (João, 03/11/2026: "tem que ser
 * sincronizado, perfeito, para a pessoa não tomar o soco"). O anel manda: o
 * treino marca o instante do impacto, a CPU solta o soco rápido essa
 * antecedência antes, e o anel fecha quando o soco chega. Tudo no relógio da
 * luta (a câmera lenta atrasa os dois juntos). Sem Phaser.
 */

/** Do começo do anel ao impacto, ms de luta. */
export const ANEL_MS = 900;
/** Pausa entre uma tentativa e a próxima, ms de luta. */
const ENTRE_TENTATIVAS_MS = 1300;
/** Sem contato até este tempo depois do impacto: o soco não alcançou, tenta de novo. */
const SEM_CONTATO_MS = 450;

export type ResultadoDoAparo = 'certo' | 'cedo' | 'tarde';

export interface QuadroDoAparo {
  /** A CPU aperta o soco neste quadro. */
  socar: boolean;
  /** Quanto o anel já fechou, de 0 a 1; null sem anel na tela. */
  anel: number | null;
}

export class TreinoDeAparo {
  private inicio: number | null = null;
  private socou = false;
  private proximaEm = 0;
  private ultimo: { resultado: ResultadoDoAparo; em: number } | null = null;

  /**
   * @param relogio - Relógio da luta, ms.
   * @param pronto - CPU perto, livre e com o jogador no chão: pode começar uma tentativa.
   * @param antecedenciaMs - Do botão ao quadro em que o soco da CPU encosta.
   */
  quadro(relogio: number, pronto: boolean, antecedenciaMs: number): QuadroDoAparo {
    if (this.inicio === null) {
      if (!pronto || relogio < this.proximaEm) return { socar: false, anel: null };
      this.inicio = relogio;
      this.socou = false;
    }
    const impacto = this.inicio + ANEL_MS;
    if (relogio > impacto + SEM_CONTATO_MS) {
      // O soco não encostou (o jogador saiu do alcance): recomeça.
      this.inicio = null;
      this.proximaEm = relogio + ENTRE_TENTATIVAS_MS / 2;
      return { socar: false, anel: null };
    }
    const socar = !this.socou && relogio >= impacto - antecedenciaMs;
    if (socar) this.socou = true;
    return { socar, anel: Math.min(1, (relogio - this.inicio) / ANEL_MS) };
  }

  /** Quanto o anel já fechou (0 a 1) neste relógio, ou null sem anel. */
  anel(relogio: number): number | null {
    return this.inicio === null ? null : Math.min(1, Math.max(0, (relogio - this.inicio) / ANEL_MS));
  }

  /** O anel está na tela: a luta corre em câmera lenta. */
  get emAndamento(): boolean {
    return this.inicio !== null;
  }

  /**
   * O soco da CPU encostou.
   * @param relogio - Relógio da luta, ms.
   * @param defendido - A guarda segurou.
   * @param aparo - Segurou na hora do impacto.
   */
  contato(relogio: number, defendido: boolean, aparo: boolean): ResultadoDoAparo | null {
    if (this.inicio === null) return null;
    const resultado: ResultadoDoAparo = aparo ? 'certo' : defendido ? 'cedo' : 'tarde';
    this.inicio = null;
    this.proximaEm = relogio + ENTRE_TENTATIVAS_MS;
    this.ultimo = { resultado, em: relogio };
    return resultado;
  }

  /** O último resultado, para o aviso na tela. */
  get resultado(): { resultado: ResultadoDoAparo; em: number } | null {
    return this.ultimo;
  }
}

/** O que o aviso diz para cada resultado. */
export const AVISOS_DO_APARO: Record<ResultadoDoAparo, string> = {
  certo: 'NA HORA!',
  cedo: 'Cedo! Aperte na hora do impacto',
  tarde: 'Tarde! Aperte quando o anel fechar'
};
