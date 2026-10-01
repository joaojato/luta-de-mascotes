/**
 * Lado do jogo do controle por celular. Uma conexão só com o cano
 * (`canal.ts`), que vive entre as cenas: a tela de conexão, a Luta e a
 * Academia leem daqui.
 */
import { NEUTRAL_FIGHTER_INPUT, type FighterInput } from '../game/fighter';
import { LeitorDeGestos, poseDoQuadro, type Pose } from './gestos';
import { abrirCanoDoJogo } from './canal';
import { ehJogador, ehSala, gerarSala, type Jogador } from './protocolo';

export interface SituacaoCelular {
  conectado: boolean;
  leitor: LeitorDeGestos;
  ultimaPose: Pose | null;
  /** Quadros por segundo que estão chegando do celular. */
  fps: number;
}

const CHAVE_SALA = 'luta-de-mascotes:sala';

/**
 * A sala fica guardada no navegador: recarregar a página do jogo não obriga
 * ninguém a escanear de novo.
 */
function salaGuardada(): string {
  try {
    const guardada = window.localStorage.getItem(CHAVE_SALA);
    if (ehSala(guardada)) {
      return guardada;
    }
    const nova = gerarSala();
    window.localStorage.setItem(CHAVE_SALA, nova);
    return nova;
  } catch {
    return gerarSala();
  }
}

class CelularNoJogo {
  private iniciado = false;
  private salaAtual: string | null = null;
  private conectadoAoRelay = false;
  private ultimaChegada: Record<Jogador, number> = { 1: 0, 2: 0 };

  readonly jogadores: Record<Jogador, SituacaoCelular> = {
    1: { conectado: false, leitor: new LeitorDeGestos(), ultimaPose: null, fps: 0 },
    2: { conectado: false, leitor: new LeitorDeGestos(), ultimaPose: null, fps: 0 }
  };

  /** Liga o cano até os celulares. Pode ser chamado várias vezes. */
  iniciar(): void {
    if (this.iniciado || typeof window === 'undefined') {
      return;
    }
    this.iniciado = true;
    void abrirCanoDoJogo(this.sala, {
      noAr: (noAr) => {
        this.conectadoAoRelay = noAr;
      },
      celular: (jogador, conectado) => this.receberCelular(jogador, conectado),
      mensagem: (mensagem) => this.receber(mensagem)
    });
  }

  /** Código que vai no QR code. */
  get sala(): string {
    this.salaAtual ??= salaGuardada();
    return this.salaAtual;
  }

  get relayNoAr(): boolean {
    return this.conectadoAoRelay;
  }

  /** Comandos do celular para este quadro. Neutro se não houver celular pronto. */
  input(jogador: Jogador): FighterInput {
    const situacao = this.jogadores[jogador];
    if (!situacao.conectado) {
      return { ...NEUTRAL_FIGHTER_INPUT };
    }
    return situacao.leitor.consumir();
  }

  private receberCelular(jogador: Jogador, conectado: boolean): void {
    if (conectado) {
      this.jogadores[jogador].conectado = true;
      this.jogadores[jogador].leitor.recalibrar();
    } else {
      this.marcarDesconectado(jogador);
    }
  }

  private receber(mensagem: { t?: unknown; jogador?: unknown }): void {
    if (!ehJogador(mensagem.jogador)) {
      return;
    }
    const jogador = mensagem.jogador;
    const situacao = this.jogadores[jogador];

    switch (mensagem.t) {
      case 'pose': {
        const pose = poseDoQuadro(mensagem as Parameters<typeof poseDoQuadro>[0]);
        situacao.conectado = true;
        situacao.ultimaPose = pose;
        situacao.leitor.atualizar(pose);
        this.medirFps(jogador);
        break;
      }
      case 'sem-pessoa':
        situacao.ultimaPose = null;
        situacao.leitor.semCorpo(Number((mensagem as { ts?: unknown }).ts) || 0);
        this.medirFps(jogador);
        break;
      case 'recalibrar':
        situacao.leitor.recalibrar();
        break;
      default:
        break;
    }
  }

  private medirFps(jogador: Jogador): void {
    const agora = performance.now();
    const intervalo = agora - this.ultimaChegada[jogador];
    this.ultimaChegada[jogador] = agora;
    if (intervalo > 0 && intervalo < 1000) {
      const situacao = this.jogadores[jogador];
      situacao.fps = situacao.fps ? situacao.fps * 0.9 + (1000 / intervalo) * 0.1 : 1000 / intervalo;
    }
  }

  private marcarDesconectado(jogador: Jogador): void {
    const situacao = this.jogadores[jogador];
    situacao.conectado = false;
    situacao.ultimaPose = null;
    situacao.fps = 0;
    situacao.leitor.recalibrar();
  }
}

export const celular = new CelularNoJogo();

/** Junta teclado e celular: qualquer um dos dois aciona o comando. */
export function juntarInputs(a: FighterInput, b: FighterInput): FighterInput {
  return {
    left: a.left || b.left,
    right: a.right || b.right,
    crouch: a.crouch || b.crouch,
    block: a.block || b.block,
    jump: a.jump || b.jump,
    light: a.light || b.light,
    heavy: a.heavy || b.heavy,
    special: a.special || b.special
  };
}

if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as unknown as { __CELULAR__?: CelularNoJogo }).__CELULAR__ = celular;
}
