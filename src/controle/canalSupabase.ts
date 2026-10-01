/**
 * Cano pelo Supabase Realtime (ADR 0005). Um canal por jogador na sala; o
 * jogo e o celular se veem pela presença e a pose vai por broadcast.
 *
 * Cota do plano gratuito: 100 eventos por segundo no projeto, e cada pose
 * conta duas vezes (o celular manda, o jogo recebe). Com dois celulares, 20
 * poses por segundo cada fica dentro. Os gestos medem tempo, não quadro, e
 * aguentam a taxa menor.
 */
import { createClient, type RealtimeChannel, type SupabaseClient } from '@supabase/supabase-js';

import type { CanoDoCelular, ChavesSupabase, EventosDoCelular, EventosDoJogo } from './canal';
import { nomeDoCanal, type Jogador, type MensagemCelular } from './protocolo';

export const INTERVALO_POSE_MS = 50;
const EVENTO = 'm';
const CHAVE_JOGO = 'jogo';

interface MetaPresenca {
  papel?: unknown;
  desde?: unknown;
}

type EstadoPresenca = Record<string, MetaPresenca[]>;

/** Algum celular está na sala deste jogador. */
export function temCelular(estado: EstadoPresenca): boolean {
  return Object.values(estado).some((metas) => metas.some((meta) => meta.papel === 'celular'));
}

/** O jogo está na sala. */
export function temJogo(estado: EstadoPresenca): boolean {
  return Object.values(estado).some((metas) => metas.some((meta) => meta.papel === CHAVE_JOGO));
}

/** Outro celular entrou depois deste, como o mesmo jogador: vale o mais novo. */
export function chegouCelularMaisNovo(estado: EstadoPresenca, eu: string, desde: number): boolean {
  return Object.entries(estado).some(
    ([chave, metas]) =>
      chave !== eu && metas.some((meta) => meta.papel === 'celular' && typeof meta.desde === 'number' && meta.desde > desde)
  );
}

/** Pose sai no máximo a cada INTERVALO_POSE_MS; o resto das mensagens passa sempre. */
export function devePassar(mensagem: MensagemCelular, agora: number, ultimaPose: number): boolean {
  return mensagem.t !== 'pose' || agora - ultimaPose >= INTERVALO_POSE_MS;
}

let cliente: SupabaseClient | null = null;

function obterCliente(chaves: ChavesSupabase): SupabaseClient {
  cliente ??= createClient(chaves.url, chaves.chave, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
  });
  return cliente;
}

function canal(chaves: ChavesSupabase, nome: string, chavePresenca: string): RealtimeChannel {
  return obterCliente(chaves).channel(nome, {
    config: { broadcast: { self: false, ack: false }, presence: { key: chavePresenca } }
  });
}

export function abrirJogoSupabase(chaves: ChavesSupabase, sala: string, eventos: EventosDoJogo): void {
  const noAr: Record<Jogador, boolean> = { 1: false, 2: false };
  const comCelular: Record<Jogador, boolean> = { 1: false, 2: false };

  ([1, 2] as const).forEach((jogador) => {
    const ch = canal(chaves, nomeDoCanal(sala, jogador), CHAVE_JOGO);
    ch.on('broadcast', { event: EVENTO }, ({ payload }) => {
      // O canal é do jogador: mensagem dizendo ser do outro não passa.
      if (payload && typeof payload === 'object' && (payload as { jogador?: unknown }).jogador === jogador) {
        eventos.mensagem(payload as { t?: unknown; jogador?: unknown });
      }
    });
    ch.on('presence', { event: 'sync' }, () => {
      const agora = temCelular(ch.presenceState<MetaPresenca>());
      // A presença sincroniza várias vezes; só a virada conta (ela recalibra).
      if (agora !== comCelular[jogador]) {
        comCelular[jogador] = agora;
        eventos.celular(jogador, agora);
      }
    });
    ch.subscribe((status) => {
      noAr[jogador] = status === 'SUBSCRIBED';
      if (noAr[jogador]) {
        void ch.track({ papel: CHAVE_JOGO, desde: Date.now() });
      }
      eventos.noAr(noAr[1] && noAr[2]);
    });
  });
}

export function abrirCelularSupabase(
  chaves: ChavesSupabase,
  sala: string,
  jogador: Jogador,
  eventos: EventosDoCelular
): CanoDoCelular {
  const eu = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
  const desde = Date.now();
  const ch = canal(chaves, nomeDoCanal(sala, jogador), eu);
  let dentro = false;
  let expulso = false;
  let ultimaPose = 0;
  let falandoComJogo = false;

  const avisar = (): void => {
    const agora = dentro && !expulso && temJogo(ch.presenceState<MetaPresenca>());
    if (agora !== falandoComJogo) {
      falandoComJogo = agora;
      eventos.conectado(agora);
    }
  };

  ch.on('presence', { event: 'sync' }, () => {
    if (!expulso && chegouCelularMaisNovo(ch.presenceState<MetaPresenca>(), eu, desde)) {
      expulso = true;
      avisar();
      void ch.untrack().finally(() => void obterCliente(chaves).removeChannel(ch));
      eventos.expulso();
      return;
    }
    avisar();
  });
  ch.subscribe((status) => {
    dentro = status === 'SUBSCRIBED';
    if (dentro && !expulso) {
      void ch.track({ papel: 'celular', desde });
    }
    avisar();
  });

  return {
    enviar(mensagem) {
      // Fora do canal o cliente cairia para HTTP, um pedido por quadro; e sem
      // o jogo na sala, cada pose só gastaria cota.
      if (!falandoComJogo) {
        return;
      }
      const agora = performance.now();
      if (!devePassar(mensagem, agora, ultimaPose)) {
        return;
      }
      if (mensagem.t === 'pose') {
        ultimaPose = agora;
      }
      void ch.send({ type: 'broadcast', event: EVENTO, payload: mensagem });
    }
  };
}
