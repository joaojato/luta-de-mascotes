/**
 * Relay do controle por celular. Roda dentro do servidor do Vite (dev e
 * preview): o celular e o jogo se conectam no mesmo endereço, e o relay
 * repassa a pose do celular para o jogo. Nada sai da rede local.
 */
import type { IncomingMessage, Server } from 'node:http';
import type { Http2SecureServer } from 'node:http2';
import { networkInterfaces } from 'node:os';
import type { Duplex } from 'node:stream';
import { WebSocketServer, type WebSocket } from 'ws';

import {
  CAMINHO_RELAY,
  ehJogador,
  type InfoControle,
  type Jogador,
  type MensagemRelay
} from './protocolo';

type ServidorHttp = Server | Http2SecureServer;

const ADAPTADOR_VIRTUAL = /vEthernet|VirtualBox|VMware|WSL|Hyper-V|Loopback|Tailscale|ZeroTier|Bluetooth/i;
const ADAPTADOR_PREFERIDO = /Wi-?Fi|WLAN|wlan|Ethernet|^en\d|^eth\d/i;

/** IPv4 da máquina na rede local, Wi-Fi e cabo antes de adaptador virtual. */
export function ipsDaRede(): string[] {
  const candidatos: { ip: string; nota: number }[] = [];
  for (const [nome, enderecos] of Object.entries(networkInterfaces())) {
    for (const endereco of enderecos ?? []) {
      if (endereco.family !== 'IPv4' || endereco.internal) {
        continue;
      }
      const nota = ADAPTADOR_VIRTUAL.test(nome) ? 0 : ADAPTADOR_PREFERIDO.test(nome) ? 2 : 1;
      candidatos.push({ ip: endereco.address, nota });
    }
  }
  return candidatos.sort((a, b) => b.nota - a.nota).map((c) => c.ip);
}

export function infoControle(): InfoControle {
  return { ips: ipsDaRede() };
}

export interface Relay {
  fechar(): void;
}

/**
 * Pendura o relay no servidor HTTP. O HMR do Vite usa o mesmo servidor, mas só
 * atende upgrade com o protocolo dele, então os dois convivem.
 */
export function pendurarRelay(servidor: ServidorHttp): Relay {
  const wss = new WebSocketServer({ noServer: true });
  const jogos = new Set<WebSocket>();
  const celulares = new Map<Jogador, WebSocket>();

  const avisarJogos = (mensagem: MensagemRelay): void => {
    const texto = JSON.stringify(mensagem);
    jogos.forEach((jogo) => jogo.send(texto));
  };

  wss.on('connection', (socket) => {
    let jogador: Jogador | null = null;

    socket.on('message', (dados) => {
      const texto = dados.toString();
      let mensagem: { t?: unknown; papel?: unknown; jogador?: unknown };
      try {
        mensagem = JSON.parse(texto);
      } catch {
        return;
      }

      if (mensagem.t === 'ola' && mensagem.papel === 'jogo') {
        jogos.add(socket);
        celulares.forEach((_, j) => socket.send(JSON.stringify({ t: 'celular', jogador: j, conectado: true })));
        return;
      }

      if (mensagem.t === 'ola' && mensagem.papel === 'celular' && ehJogador(mensagem.jogador)) {
        // Celular novo no mesmo lugar derruba o anterior: vale quem escaneou por último.
        const anterior = celulares.get(mensagem.jogador);
        if (anterior && anterior !== socket) {
          anterior.close(4000, 'outro celular entrou como este jogador');
        }
        jogador = mensagem.jogador;
        celulares.set(jogador, socket);
        avisarJogos({ t: 'celular', jogador, conectado: true });
        return;
      }

      // Pose, sem-pessoa e recalibrar: só repassa, e só de quem se apresentou.
      if (jogador !== null && mensagem.jogador === jogador) {
        jogos.forEach((jogo) => jogo.send(texto));
      }
    });

    socket.on('close', () => {
      jogos.delete(socket);
      if (jogador !== null && celulares.get(jogador) === socket) {
        celulares.delete(jogador);
        avisarJogos({ t: 'celular', jogador, conectado: false });
      }
    });
  });

  const aoUpgrade = (requisicao: IncomingMessage, socket: Duplex, cabeca: Buffer): void => {
    const caminho = new URL(requisicao.url ?? '/', 'http://x').pathname;
    if (caminho !== CAMINHO_RELAY) {
      return;
    }
    wss.handleUpgrade(requisicao, socket, cabeca, (ws) => wss.emit('connection', ws, requisicao));
  };

  servidor.on('upgrade', aoUpgrade);

  return {
    fechar() {
      servidor.off('upgrade', aoUpgrade);
      wss.clients.forEach((cliente) => cliente.terminate());
      wss.close();
    }
  };
}
