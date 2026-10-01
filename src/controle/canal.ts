/**
 * O cano entre o celular e o jogo. Dois jeitos, mesmas mensagens:
 *
 * - Supabase Realtime (ADR 0005), quando o build tem `VITE_SUPABASE_URL` e
 *   `VITE_SUPABASE_ANON_KEY`. Passa pela internet: serve para o jogo
 *   hospedado e para qualquer rede.
 * - Relay do Vite (ADR 0004), sem as chaves. Só existe com o servidor do
 *   projeto rodando, na mesma rede.
 *
 * Quem usa o cano não sabe qual dos dois está do outro lado.
 */
import { CAMINHO_RELAY, ehJogador, type Jogador, type MensagemCelular } from './protocolo';

/** Lado do jogo: o que chega dos dois celulares. */
export interface EventosDoJogo {
  /** O jogo alcançou (ou perdeu) o meio do caminho. */
  noAr(noAr: boolean): void;
  /** Um celular entrou ou saiu da sala, como este jogador. */
  celular(jogador: Jogador, conectado: boolean): void;
  /** Pose, sem-pessoa ou recalibrar, já como objeto. */
  mensagem(mensagem: { t?: unknown; jogador?: unknown }): void;
}

/** Lado do celular. */
export interface EventosDoCelular {
  /** O celular está (ou deixou de estar) falando com o jogo. */
  conectado(conectado: boolean): void;
  /** Outro celular entrou como este jogador: este para de mandar. */
  expulso(): void;
}

export interface CanoDoCelular {
  enviar(mensagem: MensagemCelular): void;
}

export interface ChavesSupabase {
  url: string;
  chave: string;
}

export function chavesSupabase(): ChavesSupabase | null {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const chave = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  return url && chave ? { url, chave } : null;
}

/** Liga o lado do jogo. A sala só vale no Supabase. */
export async function abrirCanoDoJogo(sala: string, eventos: EventosDoJogo): Promise<void> {
  const chaves = chavesSupabase();
  if (chaves) {
    const { abrirJogoSupabase } = await import('./canalSupabase');
    abrirJogoSupabase(chaves, sala, eventos);
    return;
  }
  abrirJogoRelay(eventos);
}

/** Liga o lado do celular. Sem sala no endereço, o Supabase não tem onde entrar. */
export async function abrirCanoDoCelular(
  jogador: Jogador,
  sala: string | null,
  eventos: EventosDoCelular
): Promise<CanoDoCelular | null> {
  const chaves = chavesSupabase();
  if (chaves) {
    if (!sala) {
      return null;
    }
    const { abrirCelularSupabase } = await import('./canalSupabase');
    return abrirCelularSupabase(chaves, sala, jogador, eventos);
  }
  return abrirCelularRelay(jogador, eventos);
}

// Relay do Vite --------------------------------------------------------------

const RECONECTAR_JOGO_MS = 2000;
const RECONECTAR_CELULAR_MS = 1500;
/** Se a rede engasgar, descarta quadro em vez de acumular atraso. */
const LIMITE_FILA_BYTES = 32 * 1024;

function enderecoDoRelay(): string {
  const protocolo = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${protocolo}://${window.location.host}${CAMINHO_RELAY}`;
}

function abrirJogoRelay(eventos: EventosDoJogo): void {
  const socket = new WebSocket(enderecoDoRelay());
  socket.addEventListener('open', () => {
    eventos.noAr(true);
    socket.send(JSON.stringify({ t: 'ola', papel: 'jogo' }));
  });
  socket.addEventListener('message', (evento) => {
    if (typeof evento.data !== 'string') {
      return;
    }
    let mensagem: { t?: unknown; jogador?: unknown; conectado?: unknown };
    try {
      mensagem = JSON.parse(evento.data);
    } catch {
      return;
    }
    if (mensagem.t === 'celular' && ehJogador(mensagem.jogador)) {
      eventos.celular(mensagem.jogador, Boolean(mensagem.conectado));
      return;
    }
    eventos.mensagem(mensagem);
  });
  socket.addEventListener('close', () => {
    eventos.noAr(false);
    ([1, 2] as const).forEach((jogador) => eventos.celular(jogador, false));
    window.setTimeout(() => abrirJogoRelay(eventos), RECONECTAR_JOGO_MS);
  });
}

function abrirCelularRelay(jogador: Jogador, eventos: EventosDoCelular): CanoDoCelular {
  let socket: WebSocket | null = null;

  const conectar = (): void => {
    const ws = new WebSocket(enderecoDoRelay());
    socket = ws;
    ws.addEventListener('open', () => {
      ws.send(JSON.stringify({ t: 'ola', papel: 'celular', jogador }));
      eventos.conectado(true);
    });
    ws.addEventListener('close', (evento) => {
      socket = null;
      eventos.conectado(false);
      if (evento.code === 4000) {
        eventos.expulso();
        return;
      }
      window.setTimeout(conectar, RECONECTAR_CELULAR_MS);
    });
  };
  conectar();

  return {
    enviar(mensagem) {
      if (!socket || socket.readyState !== WebSocket.OPEN || socket.bufferedAmount > LIMITE_FILA_BYTES) {
        return;
      }
      socket.send(JSON.stringify(mensagem));
    }
  };
}
