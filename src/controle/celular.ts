/**
 * Página do celular (controle.html): abre a câmera, roda o MediaPipe Pose e
 * manda os pontos para o jogo pelo relay. Não interpreta gesto nenhum.
 */
import { FilesetResolver, PoseLandmarker, type PoseLandmarkerResult } from '@mediapipe/tasks-vision';

import { CAMINHO_RELAY, type Jogador, type MensagemCelular } from './protocolo';

// Mesma versão do package.json: o wasm precisa casar com o código JS.
const WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm';
const MODELO =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';
const RECONECTAR_MS = 1500;
/** Se a rede engasgar, descarta quadro em vez de acumular atraso. */
const LIMITE_FILA_BYTES = 32 * 1024;
const SEM_PESSOA_MS = 100;

const OSSOS: [number, number][] = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24],
  [23, 24], [23, 25], [25, 27], [24, 26], [26, 28]
];

const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;
const titulo = $<HTMLHeadingElement>('titulo');
const status = $<HTMLDivElement>('status');
const palco = $<HTMLDivElement>('palco');
const video = $<HTMLVideoElement>('video');
const tela = $<HTMLCanvasElement>('tela');
const dica = $<HTMLDivElement>('dica');
const botaoLigar = $<HTMLButtonElement>('ligar');
const botaoTrocar = $<HTMLButtonElement>('trocar');
const botaoCalibrar = $<HTMLButtonElement>('calibrar');

const jogador: Jogador = new URLSearchParams(window.location.search).get('j') === '2' ? 2 : 1;
const corJogador = jogador === 1 ? '#38bdf8' : '#f87171';
document.documentElement.style.setProperty('--cor', corJogador);
titulo.textContent = `Controle P${jogador}`;

let socket: WebSocket | null = null;
let conectado = false;
let landmarker: PoseLandmarker | null = null;
let fluxo: MediaStream | null = null;
let camera: 'user' | 'environment' = 'user';
let rodando = false;
let ultimoTempoVideo = -1;
let ultimoSemPessoa = 0;
let fps = 0;
let ultimoQuadro = 0;
let travaTela: { release(): Promise<void> } | null = null;
let mensagemFixa = '';

function mostrar(texto: string, erro = false): void {
  status.textContent = texto;
  status.classList.toggle('erro', erro);
}

function atualizarStatus(): void {
  if (mensagemFixa) {
    return;
  }
  const rede = conectado ? 'conectado ao jogo' : 'procurando o jogo...';
  mostrar(rodando ? `${rede} · ${Math.round(fps)} fps` : rede);
}

function enviar(mensagem: MensagemCelular): void {
  if (!socket || socket.readyState !== WebSocket.OPEN || socket.bufferedAmount > LIMITE_FILA_BYTES) {
    return;
  }
  socket.send(JSON.stringify(mensagem));
}

function conectar(): void {
  const protocolo = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const ws = new WebSocket(`${protocolo}://${window.location.host}${CAMINHO_RELAY}`);
  socket = ws;
  ws.addEventListener('open', () => {
    conectado = true;
    ws.send(JSON.stringify({ t: 'ola', papel: 'celular', jogador }));
    atualizarStatus();
  });
  ws.addEventListener('close', (evento) => {
    conectado = false;
    socket = null;
    if (evento.code === 4000) {
      mensagemFixa = 'Outro celular entrou como este jogador.';
      mostrar(mensagemFixa, true);
      return;
    }
    atualizarStatus();
    window.setTimeout(conectar, RECONECTAR_MS);
  });
}

async function criarLandmarker(): Promise<PoseLandmarker> {
  const vision = await FilesetResolver.forVisionTasks(WASM);
  const opcoes = (delegate: 'GPU' | 'CPU') => ({
    baseOptions: { modelAssetPath: MODELO, delegate },
    runningMode: 'VIDEO' as const,
    numPoses: 1,
    minPoseDetectionConfidence: 0.5,
    minPosePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5
  });
  try {
    return await PoseLandmarker.createFromOptions(vision, opcoes('GPU'));
  } catch {
    return PoseLandmarker.createFromOptions(vision, opcoes('CPU'));
  }
}

async function abrirCamera(): Promise<void> {
  fluxo?.getTracks().forEach((trilha) => trilha.stop());
  fluxo = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { facingMode: camera, width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30 } }
  });
  video.srcObject = fluxo;
  await video.play();
  palco.classList.toggle('espelho', camera === 'user');
  ultimoTempoVideo = -1;
}

async function manterTelaAcesa(): Promise<void> {
  try {
    const wakeLock = (navigator as Navigator & { wakeLock?: { request(tipo: 'screen'): Promise<{ release(): Promise<void> }> } }).wakeLock;
    travaTela = (await wakeLock?.request('screen')) ?? null;
  } catch {
    travaTela = null;
  }
}

async function ligar(): Promise<void> {
  if (!navigator.mediaDevices?.getUserMedia) {
    mensagemFixa = 'A câmera só abre em HTTPS. Abra pelo QR code do jogo.';
    mostrar(mensagemFixa, true);
    return;
  }
  botaoLigar.disabled = true;
  try {
    mostrar('Abrindo a câmera...');
    await abrirCamera();
    if (!landmarker) {
      mostrar('Carregando o leitor de corpo (só na primeira vez)...');
      landmarker = await criarLandmarker();
    }
  } catch (erro) {
    botaoLigar.disabled = false;
    mostrar(`Não deu para ligar: ${erro instanceof Error ? erro.message : String(erro)}`, true);
    return;
  }
  dica.style.display = 'none';
  botaoLigar.textContent = 'Câmera ligada';
  botaoTrocar.disabled = false;
  botaoCalibrar.disabled = false;
  void manterTelaAcesa();
  if (!rodando) {
    rodando = true;
    requestAnimationFrame(quadro);
  }
}

function arred(valor: number, casas: number): number {
  const fator = 10 ** casas;
  return Math.round(valor * fator) / fator;
}

function quadro(): void {
  requestAnimationFrame(quadro);
  if (!landmarker || video.readyState < 2 || video.currentTime === ultimoTempoVideo) {
    return;
  }
  ultimoTempoVideo = video.currentTime;
  const ts = performance.now();
  const resultado = landmarker.detectForVideo(video, ts);
  medirFps(ts);
  desenhar(resultado);

  const pontos = resultado.landmarks[0];
  if (!pontos) {
    if (ts - ultimoSemPessoa > SEM_PESSOA_MS) {
      ultimoSemPessoa = ts;
      enviar({ t: 'sem-pessoa', jogador, ts });
    }
    return;
  }
  const img = pontos.flatMap((p) => [arred(p.x, 4), arred(p.y, 4), arred(p.visibility ?? 1, 2)]);
  const mundo = (resultado.worldLandmarks[0] ?? []).flatMap((p) => [arred(p.x, 3), arred(p.y, 3), arred(p.z, 3)]);
  enviar({ t: 'pose', jogador, ts, aspecto: video.videoWidth / video.videoHeight, img, mundo });
}

function medirFps(ts: number): void {
  const intervalo = ts - ultimoQuadro;
  ultimoQuadro = ts;
  if (intervalo > 0 && intervalo < 1000) {
    fps = fps ? fps * 0.9 + (1000 / intervalo) * 0.1 : 1000 / intervalo;
  }
}

function desenhar(resultado: PoseLandmarkerResult): void {
  const largura = video.videoWidth;
  const altura = video.videoHeight;
  if (tela.width !== largura || tela.height !== altura) {
    tela.width = largura;
    tela.height = altura;
  }
  const ctx = tela.getContext('2d');
  if (!ctx) {
    return;
  }
  ctx.clearRect(0, 0, largura, altura);
  const pontos = resultado.landmarks[0];
  if (!pontos) {
    return;
  }
  ctx.strokeStyle = corJogador;
  ctx.lineWidth = Math.max(3, largura / 120);
  ctx.beginPath();
  for (const [a, b] of OSSOS) {
    if ((pontos[a].visibility ?? 1) < 0.5 || (pontos[b].visibility ?? 1) < 0.5) {
      continue;
    }
    ctx.moveTo(pontos[a].x * largura, pontos[a].y * altura);
    ctx.lineTo(pontos[b].x * largura, pontos[b].y * altura);
  }
  ctx.stroke();
}

botaoLigar.addEventListener('click', () => void ligar());
botaoTrocar.addEventListener('click', async () => {
  camera = camera === 'user' ? 'environment' : 'user';
  try {
    await abrirCamera();
  } catch (erro) {
    mostrar(`Não deu para trocar: ${erro instanceof Error ? erro.message : String(erro)}`, true);
  }
});
botaoCalibrar.addEventListener('click', () => enviar({ t: 'recalibrar', jogador }));
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && rodando && !travaTela) {
    void manterTelaAcesa();
  }
  if (document.visibilityState === 'hidden') {
    travaTela = null;
  }
});
window.setInterval(atualizarStatus, 500);

conectar();
