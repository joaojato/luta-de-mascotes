/**
 * Controles na tela para jogar no celular deitado (docs/mobile.md).
 *
 * Os botões apertam as teclas do P1 (as mesmas do teclado), então menus,
 * seleção e luta funcionam sem código novo nas cenas: o direcional anda nos
 * menus e o Especial (Espaço) confirma.
 */
import * as Phaser from 'phaser';

import { carregarControles, type ComandoLuta } from '../game/controles';
import { carregarModo, diferencaDeTeclas, direcoesDoPonto, salvarModo, type Direcao, type ModoDirecional } from './direcao';

const KEY_CODES = Phaser.Input.Keyboard.KeyCodes as unknown as Record<string, number>;

/** Os controles de toque estão na tela (o modo 1 VS 1 some no celular). */
export function controlesDeToqueAtivos(): boolean {
  return typeof document !== 'undefined' && document.documentElement.classList.contains('com-toque');
}

/** Liga quando o aparelho tem toque como entrada principal, ou com `?toque=1`. */
export function querControlesDeToque(): boolean {
  const forcado = new URLSearchParams(window.location.search).get('toque');
  if (forcado === '1') return true;
  if (forcado === '0') return false;
  return window.matchMedia?.('(pointer: coarse)').matches ?? false;
}

function teclaEvento(tipo: 'keydown' | 'keyup', nome: string): void {
  const keyCode = KEY_CODES[nome];
  if (keyCode === undefined) return;
  const evento = new KeyboardEvent(tipo, { key: nome.length === 1 ? nome.toLowerCase() : nome, bubbles: true, cancelable: true });
  // O Phaser lê `keyCode`, que o construtor do evento não deixa preencher.
  Object.defineProperty(evento, 'keyCode', { get: () => keyCode });
  Object.defineProperty(evento, 'which', { get: () => keyCode });
  window.dispatchEvent(evento);
}

function vibrar(): void {
  try {
    navigator.vibrate?.(8);
  } catch {
    // Sem vibração (iPhone): segue calado.
  }
}

/** Pede tela cheia e tenta travar deitado (Android). No iPhone não existe para página. */
async function alternarTelaCheia(): Promise<void> {
  const doc = document as Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => void };
  const raiz = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => void };
  if (doc.fullscreenElement || doc.webkitFullscreenElement) {
    await (doc.exitFullscreen?.() ?? doc.webkitExitFullscreen?.());
    return;
  }
  try {
    await (raiz.requestFullscreen?.({ navigationUI: 'hide' }) ?? raiz.webkitRequestFullscreen?.());
    const orientacao = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
    await orientacao.lock?.('landscape').catch(() => undefined);
  } catch {
    // Recusado ou sem suporte: o aviso da tela cheia cobre esse caso.
  }
}

function telaCheiaExiste(): boolean {
  const raiz = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => void };
  return Boolean(raiz.requestFullscreen || raiz.webkitRequestFullscreen);
}

/**
 * Monta os controles por cima do jogo.
 * @param host - Elemento que recebe a camada (o shell do jogo).
 */
export function montarControlesDeToque(host: HTMLElement): void {
  const codes = new Set(Object.keys(KEY_CODES));
  const p1 = carregarControles(codes).p1;
  const teclaDe = (comando: ComandoLuta): string => p1[comando];
  const teclaDaDirecao: Record<Direcao, string> = {
    left: teclaDe('left'),
    right: teclaDe('right'),
    up: teclaDe('jump'),
    down: teclaDe('crouch')
  };

  let modo: ModoDirecional = carregarModo();

  const camada = document.createElement('div');
  camada.className = 'toque';
  camada.innerHTML = `
    <div class="toque__topo">
      <button class="toque__mini" data-tecla="ESC" type="button" aria-label="Voltar">◀</button>
      <button class="toque__mini" data-acao="tela-cheia" type="button" aria-label="Tela cheia">⛶</button>
      <button class="toque__mini" data-acao="modo" type="button" aria-label="Trocar setas e joystick"></button>
    </div>
    <div class="toque__esquerda">
      <div class="toque__direcional" data-modo="botoes">
        <span class="toque__seta toque__seta--cima">▲</span>
        <span class="toque__seta toque__seta--baixo">▼</span>
        <span class="toque__seta toque__seta--esq">◀</span>
        <span class="toque__seta toque__seta--dir">▶</span>
        <span class="toque__pino"></span>
      </div>
    </div>
    <div class="toque__direita">
      <button class="toque__botao toque__botao--chute" data-comando="heavy" type="button">Chute</button>
      <button class="toque__botao toque__botao--soco" data-comando="light" type="button">Soco</button>
      <button class="toque__botao toque__botao--bloqueio" data-comando="block" type="button">Bloq.</button>
      <button class="toque__botao toque__botao--especial" data-comando="special" type="button">Especial</button>
    </div>
    <div class="toque__girar"><p>Gire o celular<br>para jogar deitado</p></div>
    <div class="toque__aviso" hidden><p>Neste celular a página não abre em tela cheia.<br>
      No Safari: Compartilhar ▸ Adicionar à Tela de Início, e abra pelo ícone.</p></div>
  `;
  host.appendChild(camada);

  const direcional = camada.querySelector<HTMLElement>('.toque__direcional')!;
  const pino = camada.querySelector<HTMLElement>('.toque__pino')!;
  const botaoModo = camada.querySelector<HTMLButtonElement>('[data-acao="modo"]')!;
  const aviso = camada.querySelector<HTMLElement>('.toque__aviso')!;

  const mostrarModo = (): void => {
    direcional.dataset.modo = modo;
    botaoModo.textContent = modo === 'botoes' ? '✚' : '◎';
  };
  mostrarModo();

  // ---------------------------------------------------------------- direcional
  let dedo: number | null = null;
  let apertadas = new Set<string>();

  const aplicar = (agora: Set<string>): void => {
    const { soltar, apertar } = diferencaDeTeclas(apertadas, agora);
    soltar.forEach((tecla) => teclaEvento('keyup', tecla));
    apertar.forEach((tecla) => teclaEvento('keydown', tecla));
    if (apertar.length > 0) vibrar();
    apertadas = agora;
    camada.querySelectorAll<HTMLElement>('.toque__seta').forEach((seta) => seta.classList.remove('is-on'));
    agora.forEach((tecla) => {
      const direcao = (Object.keys(teclaDaDirecao) as Direcao[]).find((d) => teclaDaDirecao[d] === tecla);
      const classe = { up: 'cima', down: 'baixo', left: 'esq', right: 'dir' }[direcao ?? 'up'];
      camada.querySelector(`.toque__seta--${classe}`)?.classList.add('is-on');
    });
  };

  const mover = (evento: PointerEvent): void => {
    const caixa = direcional.getBoundingClientRect();
    const raio = caixa.width / 2;
    let dx = evento.clientX - (caixa.left + raio);
    let dy = evento.clientY - (caixa.top + raio);
    // Setas: qualquer toque fora do miolo vale. Joystick: precisa empurrar mais.
    const direcoes = direcoesDoPonto(dx, dy, raio, modo === 'botoes' ? 0.18 : 0.35);
    aplicar(new Set(direcoes.map((d) => teclaDaDirecao[d])));
    if (modo === 'joystick') {
      const distancia = Math.hypot(dx, dy);
      const limite = raio * 0.55;
      if (distancia > limite) {
        dx = (dx / distancia) * limite;
        dy = (dy / distancia) * limite;
      }
      pino.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    }
  };

  const soltarDirecional = (evento: PointerEvent): void => {
    if (evento.pointerId !== dedo) return;
    dedo = null;
    aplicar(new Set());
    pino.style.transform = 'translate(-50%, -50%)';
  };

  direcional.addEventListener('pointerdown', (evento) => {
    evento.preventDefault();
    dedo = evento.pointerId;
    try {
      direcional.setPointerCapture(evento.pointerId);
    } catch {
      // Evento sintético (teste): sem captura, segue.
    }
    mover(evento);
  });
  direcional.addEventListener('pointermove', (evento) => {
    if (evento.pointerId === dedo) mover(evento);
  });
  direcional.addEventListener('pointerup', soltarDirecional);
  direcional.addEventListener('pointercancel', soltarDirecional);

  // ---------------------------------------------------------------- botões
  const ligarBotao = (botao: HTMLElement, tecla: string): void => {
    let dono: number | null = null;
    const soltar = (evento: PointerEvent): void => {
      if (evento.pointerId !== dono) return;
      dono = null;
      botao.classList.remove('is-on');
      teclaEvento('keyup', tecla);
    };
    botao.addEventListener('pointerdown', (evento) => {
      evento.preventDefault();
      if (dono !== null) return;
      dono = evento.pointerId;
      try {
        botao.setPointerCapture(evento.pointerId);
      } catch {
        // Evento sintético (teste).
      }
      botao.classList.add('is-on');
      vibrar();
      teclaEvento('keydown', tecla);
    });
    botao.addEventListener('pointerup', soltar);
    botao.addEventListener('pointercancel', soltar);
  };

  camada.querySelectorAll<HTMLElement>('[data-comando]').forEach((botao) => {
    ligarBotao(botao, teclaDe(botao.dataset.comando as ComandoLuta));
  });
  camada.querySelectorAll<HTMLElement>('[data-tecla]').forEach((botao) => {
    ligarBotao(botao, botao.dataset.tecla!);
  });

  botaoModo.addEventListener('click', () => {
    modo = modo === 'botoes' ? 'joystick' : 'botoes';
    salvarModo(modo);
    mostrarModo();
  });

  camada.querySelector('[data-acao="tela-cheia"]')!.addEventListener('click', () => {
    if (telaCheiaExiste()) {
      void alternarTelaCheia();
    } else {
      aviso.hidden = false;
      window.setTimeout(() => {
        aviso.hidden = true;
      }, 5000);
    }
  });

  // Toque longo não abre menu do navegador em cima dos botões.
  camada.addEventListener('contextmenu', (evento) => evento.preventDefault());
  document.documentElement.classList.add('com-toque');
}
