/**
 * Lado do jogo do controle por celular. Uma conexão só com o relay, que vive
 * entre as cenas: a tela de conexão, a Luta e a Academia leem daqui.
 */
import { NEUTRAL_FIGHTER_INPUT, type FighterInput } from '../game/fighter';
import { LeitorDeGestos, poseDoQuadro, type Pose } from './gestos';
import { CAMINHO_RELAY, ehJogador, type Jogador } from './protocolo';

export interface SituacaoCelular {
  conectado: boolean;
  leitor: LeitorDeGestos;
  ultimaPose: Pose | null;
  /** Quadros por segundo que estão chegando do celular. */
  fps: number;
}

const RECONECTAR_MS = 2000;

class CelularNoJogo {
  private iniciado = false;
  private conectadoAoRelay = false;
  private ultimaChegada: Record<Jogador, number> = { 1: 0, 2: 0 };

  readonly jogadores: Record<Jogador, SituacaoCelular> = {
    1: { conectado: false, leitor: new LeitorDeGestos(), ultimaPose: null, fps: 0 },
    2: { conectado: false, leitor: new LeitorDeGestos(), ultimaPose: null, fps: 0 }
  };

  /** Liga a conexão com o relay. Pode ser chamado várias vezes. */
  iniciar(): void {
    if (this.iniciado || typeof window === 'undefined') {
      return;
    }
    this.iniciado = true;
    this.conectar();
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

  private conectar(): void {
    const protocolo = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const socket = new WebSocket(`${protocolo}://${window.location.host}${CAMINHO_RELAY}`);

    socket.addEventListener('open', () => {
      this.conectadoAoRelay = true;
      socket.send(JSON.stringify({ t: 'ola', papel: 'jogo' }));
    });
    socket.addEventListener('message', (evento) => this.receber(evento.data));
    socket.addEventListener('close', () => {
      this.conectadoAoRelay = false;
      ([1, 2] as const).forEach((j) => this.marcarDesconectado(j));
      window.setTimeout(() => this.conectar(), RECONECTAR_MS);
    });
  }

  private receber(dados: unknown): void {
    if (typeof dados !== 'string') {
      return;
    }
    let mensagem: { t?: unknown; jogador?: unknown; conectado?: unknown };
    try {
      mensagem = JSON.parse(dados);
    } catch {
      return;
    }
    if (!ehJogador(mensagem.jogador)) {
      return;
    }
    const jogador = mensagem.jogador;
    const situacao = this.jogadores[jogador];

    switch (mensagem.t) {
      case 'celular':
        if (mensagem.conectado) {
          situacao.conectado = true;
          situacao.leitor.recalibrar();
        } else {
          this.marcarDesconectado(jogador);
        }
        break;
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
