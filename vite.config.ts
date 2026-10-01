import { defineConfig } from 'vitest/config';
import basicSsl from '@vitejs/plugin-basic-ssl';
import type { Plugin, PreviewServer, ViteDevServer } from 'vite';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';

import { CAMINHO_INFO } from './src/controle/protocolo';
import { infoControle, pendurarRelay } from './src/controle/relay';

const PUBLIC_ROOT = resolve(import.meta.dirname, 'public');
const SAVE_TARGETS = new Set([
  'assets/config/game-config.json',
  'assets/config/input-map.json',
  'assets/config/actor-bounds.json',
  'assets/config/object-metadata.json',
  'assets/config/background-layer-offsets.json',
  'assets/levels/index.json',
  'assets/levels/level-1.json',
  'assets/levels/level-2.json',
  'assets/levels/level-3.json',
  'assets/levels/editor-playground.json',
  'configs/character-gym.json',
  'configs/background-gym.json',
  'configs/tile-gym.json',
  'configs/fighter-playground.json'
]);

function readRequestBody(request: IncomingMessage): Promise<string> {
  return new Promise((resolveBody, reject) => {
    let body = '';

    request.setEncoding('utf8');
    request.on('data', (chunk) => {
      body += chunk;
    });
    request.on('end', () => resolveBody(body));
    request.on('error', reject);
  });
}

function sendJson(response: ServerResponse, statusCode: number, payload: object): void {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json');
  response.end(JSON.stringify(payload));
}

function resolveSaveTarget(target: unknown): string | null {
  if (typeof target !== 'string' || !SAVE_TARGETS.has(target)) {
    return null;
  }

  const outputPath = resolve(PUBLIC_ROOT, target);

  return outputPath.startsWith(PUBLIC_ROOT) ? outputPath : null;
}

/**
 * Controle por celular: o relay que repassa a pose do celular para o jogo e o
 * endereço que diz o IP da máquina na rede, para montar o QR code.
 */
function controleCelular(): Plugin {
  const instalar = (server: ViteDevServer | PreviewServer): void => {
    server.middlewares.use(CAMINHO_INFO, (_request, response) => sendJson(response, 200, infoControle()));
    if (server.httpServer) {
      pendurarRelay(server.httpServer);
    }
  };
  return { name: 'controle-celular', configureServer: instalar, configurePreviewServer: instalar };
}

export default defineConfig(({ mode }) => ({
  plugins: [
    controleCelular(),
    // A câmera do celular só abre em HTTPS. `npm run dev:celular` liga um
    // certificado próprio; o celular avisa uma vez e segue.
    ...(mode === 'celular' ? [basicSsl()] : []),
    {
      name: 'starter-debug-json-writer',
      configureServer(server) {
        server.middlewares.use('/__debug/save-json', async (request, response, next) => {
          if (request.method !== 'PUT' && request.method !== 'POST') {
            next();
            return;
          }

          try {
            const body = await readRequestBody(request);
            const parsed = JSON.parse(body) as { target?: unknown; payload?: unknown };
            const outputPath = resolveSaveTarget(parsed.target);

            if (!outputPath) {
              sendJson(response, 400, { ok: false, error: 'Target is not allowlisted' });
              return;
            }

            if (!parsed.payload || typeof parsed.payload !== 'object') {
              sendJson(response, 400, { ok: false, error: 'Expected object payload' });
              return;
            }

            await mkdir(dirname(outputPath), { recursive: true });
            await writeFile(outputPath, `${JSON.stringify(parsed.payload, null, 2)}\n`);
            sendJson(response, 200, { ok: true, path: outputPath });
          } catch (error) {
            sendJson(response, 500, {
              ok: false,
              error: error instanceof Error ? error.message : 'Unknown save error'
            });
          }
        });
      }
    }
  ],
  server: {
    host: '0.0.0.0',
    port: 5173
  },
  build: {
    rolldownOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        controle: resolve(import.meta.dirname, 'controle.html')
      }
    }
  },
  test: {
    // Material bruto e referências ficam fora do git e fora da suíte.
    exclude: ['**/node_modules/**', '**/dist/**', 'referencia/**', 'spriterrific-runs/**', 'Fight_Detection/**']
  }
}));
