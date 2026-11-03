/**
 * Controles na tela para jogar no celular deitado (docs/mobile.md).
 *
 * Os botões apertam as teclas do P1 (as mesmas do teclado), então menus,
 * seleção e luta funcionam sem código novo nas cenas. Fora da luta o botão
 * de baixo (A / ✕) aperta Enter e o da direita (B / ○) aperta Esc: confirma
 * e volta, como em console.
 */
import * as Phaser from 'phaser';

import { carregarControles, type ComandoLuta } from '../game/controles';
import { aoMudarLuta, lutaNaTela, type LutaNaTela } from './lutaNaTela';
import { carregarPreferencias, proximaOpacidade, salvarPreferencias, type Cara } from './preferencias';
import { carregarModo, diferencaDeTeclas, direcoesDoPonto, salvarModo, type Direcao, type ModoDirecional } from './direcao';
import {
  apagarLayout,
  arrastar,
  caixaEmPixels,
  carregarLayout,
  IDS_CONTROLE,
  juntarLayout,
  layoutPadrao,
  lerMexidos,
  redimensionar,
  salvarLayout,
  type IdControle,
  type Layout,
  type Tela
} from './layout';

const KEY_CODES = Phaser.Input.Keyboard.KeyCodes as unknown as Record<string, number>;

/** O que a camada pede ao jogo: parar tudo enquanto o menu está aberto. */
export interface JogoPausavel {
  pausar(): void;
  retomar(): void;
}

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

/** Aberto pelo ícone da Tela de Início: já está sem barra, o item de tela cheia sai do menu. */
function abertoComoApp(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true || ['fullscreen', 'standalone'].some((modo) => window.matchMedia?.(`(display-mode: ${modo})`).matches);
}

// Símbolos desenhados, nunca texto: o iPhone trata texto segurado como seleção
// (lupa e zoom), e ◀ ▶ viram emoji em alguns aparelhos.
const SETA = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M5 1.5 9 8H1z"/></svg>';
// As letras do Xbox também são traço, pelo mesmo motivo.
type PosicaoDoBotao = 'cima' | 'direita' | 'baixo' | 'esquerda';
const CARAS: Record<Cara, Record<PosicaoDoBotao, { simbolo: string; nome: string }>> = {
  xbox: {
    cima: { simbolo: '<path d="M12 9 20 20 28 9M20 20v11"/>', nome: 'Y' },
    direita: { simbolo: '<path d="M14 9v22M14 9h7a5.5 5.5 0 0 1 0 11h-7M14 20h8a5.5 5.5 0 0 1 0 11h-8"/>', nome: 'B' },
    baixo: { simbolo: '<path d="M12 31 20 9 28 31M15 23h10"/>', nome: 'A' },
    esquerda: { simbolo: '<path d="M12 9 28 31M28 9 12 31"/>', nome: 'X' }
  },
  playstation: {
    cima: { simbolo: '<path d="M20 6 34 31H6z"/>', nome: 'Triângulo' },
    direita: { simbolo: '<circle cx="20" cy="20" r="13"/>', nome: 'Bola' },
    baixo: { simbolo: '<path d="M8 8 32 32M32 8 8 32"/>', nome: 'Xis' },
    esquerda: { simbolo: '<rect x="8" y="8" width="24" height="24"/>', nome: 'Quadrado' }
  }
};

/**
 * O comando de cada lugar do losango, igual nas duas caras (docs/mobile.md),
 * e a tecla que ele aperta fora da luta, nos menus.
 */
const BOTOES: { id: PosicaoDoBotao; comando: ComandoLuta; noMenu?: { tecla: string; nome: string } }[] = [
  { id: 'cima', comando: 'special' },
  { id: 'direita', comando: 'block', noMenu: { tecla: 'ESC', nome: 'Voltar' } },
  { id: 'baixo', comando: 'light', noMenu: { tecla: 'ENTER', nome: 'OK' } },
  { id: 'esquerda', comando: 'heavy' }
];

/**
 * Monta os controles por cima do jogo.
 * @param host - Elemento que recebe a camada (o shell do jogo).
 * @param jogo - Pausa o jogo com o menu aberto.
 */
export function montarControlesDeToque(host: HTMLElement, jogo: JogoPausavel): void {
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
  let editando = false;

  const camada = document.createElement('div');
  camada.className = 'toque';
  camada.innerHTML = `
    <div class="toque__seguro" aria-hidden="true"></div>
    <button class="toque__controle toque__menu" data-id="menu" type="button" aria-label="Menu">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
    </button>
    <div class="toque__controle toque__direcional" data-id="direcional" data-modo="botoes">
      <span class="toque__seta toque__seta--cima">${SETA}</span>
      <span class="toque__seta toque__seta--baixo">${SETA}</span>
      <span class="toque__seta toque__seta--esq">${SETA}</span>
      <span class="toque__seta toque__seta--dir">${SETA}</span>
      <span class="toque__pino"></span>
    </div>
    ${BOTOES.map(
      ({ id, comando }) => `
    <button class="toque__controle toque__botao toque__botao--${id}" data-id="${id}" data-comando="${comando}" type="button">
      <svg viewBox="0 0 40 40" aria-hidden="true"></svg>
      <span class="toque__nome"></span>
    </button>`
    ).join('')}
    <div class="toque__painel" hidden>
      <div class="toque__caixa" data-tela="principal" role="dialog" aria-label="Menu">
        <button class="toque__item" data-acao="continuar" type="button">Continuar</button>
        <button class="toque__item" data-acao="voltar" type="button">Voltar / sair da luta</button>
        <button class="toque__item" data-acao="tela-cheia" type="button">Tela cheia</button>
        <button class="toque__item" data-acao="abrir-controles" type="button">Controles</button>
      </div>
      <div class="toque__caixa" data-tela="controles" role="dialog" aria-label="Controles" hidden>
        <p class="toque__titulo">Controles</p>
        <button class="toque__item" data-acao="modo" type="button"></button>
        <button class="toque__item" data-acao="cara" type="button"></button>
        <button class="toque__item" data-acao="nomes" type="button"></button>
        <button class="toque__item" data-acao="opacidade" type="button"></button>
        <button class="toque__item" data-acao="editar" type="button">Ajustar botões</button>
        <button class="toque__item toque__item--forte" data-acao="fechar-controles" type="button">Voltar</button>
      </div>
    </div>
    <div class="toque__editor" hidden>
      <p>Arraste para mover. Toque num botão e use − e + para o tamanho.</p>
      <div class="toque__ferramentas">
        <button class="toque__item" data-acao="menor" type="button" aria-label="Menor">−</button>
        <button class="toque__item" data-acao="maior" type="button" aria-label="Maior">+</button>
        <button class="toque__item" data-acao="restaurar" type="button">Restaurar</button>
        <button class="toque__item toque__item--forte" data-acao="pronto" type="button">Pronto</button>
      </div>
    </div>
    <div class="toque__girar"><p>Gire o celular<br>para jogar deitado</p></div>
    <div class="toque__aviso" hidden><p>Neste celular a página não abre em tela cheia.<br>
      No Safari: Compartilhar ▸ Adicionar à Tela de Início, e abra pelo ícone.</p></div>
  `;
  host.appendChild(camada);

  const pegar = <T extends HTMLElement>(seletor: string): T => camada.querySelector<T>(seletor)!;
  const seguro = pegar('.toque__seguro');
  const direcional = pegar('.toque__direcional');
  const pino = pegar('.toque__pino');
  const painel = pegar('.toque__painel');
  const editor = pegar('.toque__editor');
  const aviso = pegar('.toque__aviso');
  const itemModo = pegar<HTMLButtonElement>('[data-acao="modo"]');
  const itemTelaCheia = pegar<HTMLButtonElement>('[data-acao="tela-cheia"]');
  const controles = Object.fromEntries(
    IDS_CONTROLE.map((id) => [id, pegar(`[data-id="${id}"]`)])
  ) as Record<IdControle, HTMLElement>;

  const mostrarModo = (): void => {
    direcional.dataset.modo = modo;
    itemModo.textContent = modo === 'botoes' ? 'Direcional: setas (trocar para joystick)' : 'Direcional: joystick (trocar para setas)';
  };
  mostrarModo();
  itemTelaCheia.hidden = abertoComoApp();

  // ---------------------------------------------------------------- cara e nomes
  let preferencias = carregarPreferencias();
  const itemCara = pegar<HTMLButtonElement>('[data-acao="cara"]');
  const itemNomes = pegar<HTMLButtonElement>('[data-acao="nomes"]');
  const itemOpacidade = pegar<HTMLButtonElement>('[data-acao="opacidade"]');

  const mostrarNomes = (luta: LutaNaTela | null): void => {
    for (const { id, comando, noMenu } of BOTOES) {
      const botao = controles[id];
      const nome = luta ? luta.nomes[comando as keyof LutaNaTela['nomes']] : (noMenu?.nome ?? '');
      botao.querySelector('.toque__nome')!.textContent = nome;
      botao.setAttribute('aria-label', [CARAS[preferencias.cara][id].nome, nome].filter(Boolean).join(': '));
    }
    // O especial apaga enquanto não pode sair (barra vazia ou no ar).
    controles.cima.classList.toggle('is-apagado', luta !== null && !luta.especialPronto);
  };

  const mostrarPreferencias = (): void => {
    camada.dataset.cara = preferencias.cara;
    camada.classList.toggle('com-nomes', preferencias.nomes);
    for (const { id } of BOTOES) {
      controles[id].querySelector('svg')!.innerHTML = CARAS[preferencias.cara][id].simbolo;
    }
    itemCara.textContent = preferencias.cara === 'xbox' ? 'Botões: Xbox (trocar para PlayStation)' : 'Botões: PlayStation (trocar para Xbox)';
    itemNomes.textContent = preferencias.nomes ? 'Nomes dos golpes: mostrando (esconder)' : 'Nomes dos golpes: escondidos (mostrar)';
    camada.style.setProperty('--toque-opacidade', String(preferencias.opacidade));
    itemOpacidade.textContent = `Opacidade dos controles: ${Math.round(preferencias.opacidade * 100)}% (trocar)`;
    mostrarNomes(lutaNaTela());
  };
  mostrarPreferencias();
  aoMudarLuta(mostrarNomes);

  // ---------------------------------------------------------------- posição
  const medir = (): Tela => {
    const estilo = getComputedStyle(seguro);
    return {
      largura: camada.clientWidth,
      altura: camada.clientHeight,
      seguro: {
        topo: parseFloat(estilo.paddingTop) || 0,
        direita: parseFloat(estilo.paddingRight) || 0,
        baixo: parseFloat(estilo.paddingBottom) || 0,
        esquerda: parseFloat(estilo.paddingLeft) || 0
      }
    };
  };

  // Só o que o jogador mexeu fica salvo; o resto segue o de fábrica de cada tela.
  let mexidos = lerMexidos(carregarLayout());
  const layoutAtual = (tela: Tela): Layout => juntarLayout(layoutPadrao(tela), mexidos);

  const posicionar = (): void => {
    const tela = medir();
    if (tela.largura === 0 || tela.altura === 0) return;
    const layout = layoutAtual(tela);
    for (const id of IDS_CONTROLE) {
      const { esquerda, topo, lado } = caixaEmPixels(layout[id], tela);
      const estilo = controles[id].style;
      estilo.left = `${esquerda}px`;
      estilo.top = `${topo}px`;
      estilo.width = `${lado}px`;
      estilo.height = `${lado}px`;
      estilo.setProperty('--lado', `${lado}px`);
    }
  };
  posicionar();
  // O iPhone termina de girar depois do evento: mede de novo logo em seguida.
  const reposicionar = (): void => {
    posicionar();
    window.setTimeout(posicionar, 350);
  };
  window.addEventListener('resize', reposicionar);
  window.addEventListener('orientationchange', reposicionar);

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

  const soltarDirecional = (): void => {
    dedo = null;
    aplicar(new Set());
    pino.style.transform = 'translate(-50%, -50%)';
  };

  const capturar = (alvo: HTMLElement, evento: PointerEvent): void => {
    try {
      alvo.setPointerCapture(evento.pointerId);
    } catch {
      // Evento sintético (teste): sem captura, segue.
    }
  };

  direcional.addEventListener('pointerdown', (evento) => {
    evento.preventDefault();
    if (editando) return;
    dedo = evento.pointerId;
    capturar(direcional, evento);
    mover(evento);
  });
  direcional.addEventListener('pointermove', (evento) => {
    if (evento.pointerId === dedo) mover(evento);
  });
  const fimDirecional = (evento: PointerEvent): void => {
    if (evento.pointerId === dedo) soltarDirecional();
  };
  direcional.addEventListener('pointerup', fimDirecional);
  direcional.addEventListener('pointercancel', fimDirecional);

  // ---------------------------------------------------------------- botões
  const soltadores: (() => void)[] = [soltarDirecional];

  for (const { id, comando, noMenu } of BOTOES) {
    const botao = controles[id];
    let dono: number | null = null;
    // A tecla é escolhida no aperto e a mesma é solta, mesmo se a luta acabar no meio.
    let tecla = teclaDe(comando);
    const largar = (): void => {
      if (dono === null) return;
      dono = null;
      botao.classList.remove('is-on');
      teclaEvento('keyup', tecla);
    };
    soltadores.push(largar);
    botao.addEventListener('pointerdown', (evento) => {
      evento.preventDefault();
      if (editando || dono !== null) return;
      dono = evento.pointerId;
      capturar(botao, evento);
      botao.classList.add('is-on');
      vibrar();
      tecla = lutaNaTela() === null && noMenu ? noMenu.tecla : teclaDe(comando);
      teclaEvento('keydown', tecla);
    });
    const fim = (evento: PointerEvent): void => {
      if (evento.pointerId === dono) largar();
    };
    botao.addEventListener('pointerup', fim);
    botao.addEventListener('pointercancel', fim);
  }

  /** Nada fica apertado quando o jogo para (menu aberto, app em segundo plano). */
  const soltarTudo = (): void => soltadores.forEach((soltar) => soltar());
  document.addEventListener('visibilitychange', soltarTudo);

  // O iPhone ignora o `user-scalable=no`: segurar o dedo abre a lupa de texto,
  // dois toques dão zoom e a pinça amplia a página. Cancelar o toque cru nos
  // controles de luta (os eventos de ponteiro seguem chegando) corta os três.
  const semGestoDoNavegador = (evento: Event): void => {
    if (evento.cancelable) evento.preventDefault();
  };
  [direcional, ...camada.querySelectorAll<HTMLElement>('[data-comando]')].forEach((alvo) => {
    for (const tipo of ['touchstart', 'touchmove', 'touchend'] as const) {
      alvo.addEventListener(tipo, semGestoDoNavegador, { passive: false });
    }
  });
  for (const tipo of ['gesturestart', 'gesturechange', 'dblclick', 'selectstart'] as const) {
    document.addEventListener(tipo, semGestoDoNavegador, { passive: false });
  }
  // Toque longo não abre menu do navegador em cima dos botões.
  camada.addEventListener('contextmenu', semGestoDoNavegador);

  // ---------------------------------------------------------------- menu
  // As opções de controle ficam num menu próprio, aberto por Controles (João, 03/11/2026).
  const mostrarTela = (tela: 'principal' | 'controles'): void => {
    painel.querySelectorAll<HTMLElement>('[data-tela]').forEach((caixa) => {
      caixa.hidden = caixa.dataset.tela !== tela;
    });
  };
  const abrirMenu = (): void => {
    soltarTudo();
    jogo.pausar();
    mostrarTela('principal');
    painel.hidden = false;
  };
  const fecharMenu = (): void => {
    painel.hidden = true;
    jogo.retomar();
  };

  controles.menu.addEventListener('click', () => {
    if (!editando) abrirMenu();
  });
  painel.addEventListener('click', (evento) => {
    if (evento.target === painel) fecharMenu();
  });

  const acoes: Record<string, () => void> = {
    continuar: fecharMenu,
    'abrir-controles': () => mostrarTela('controles'),
    'fechar-controles': () => mostrarTela('principal'),
    voltar: () => {
      fecharMenu();
      teclaEvento('keydown', 'ESC');
      teclaEvento('keyup', 'ESC');
    },
    'tela-cheia': () => {
      fecharMenu();
      if (telaCheiaExiste()) {
        void alternarTelaCheia();
      } else {
        aviso.hidden = false;
        window.setTimeout(() => {
          aviso.hidden = true;
        }, 5000);
      }
    },
    modo: () => {
      modo = modo === 'botoes' ? 'joystick' : 'botoes';
      salvarModo(modo);
      mostrarModo();
    },
    cara: () => {
      preferencias = { ...preferencias, cara: preferencias.cara === 'xbox' ? 'playstation' : 'xbox' };
      salvarPreferencias(preferencias);
      mostrarPreferencias();
    },
    nomes: () => {
      preferencias = { ...preferencias, nomes: !preferencias.nomes };
      salvarPreferencias(preferencias);
      mostrarPreferencias();
    },
    opacidade: () => {
      preferencias = { ...preferencias, opacidade: proximaOpacidade(preferencias.opacidade) };
      salvarPreferencias(preferencias);
      mostrarPreferencias();
    },
    editar: () => {
      painel.hidden = true;
      comecarEdicao();
    },
    menor: () => mudarTamanho(1 / 1.12),
    maior: () => mudarTamanho(1.12),
    restaurar: () => {
      mexidos = {};
      apagarLayout();
      posicionar();
    },
    pronto: () => {
      terminarEdicao();
      jogo.retomar();
    }
  };
  camada.querySelectorAll<HTMLElement>('[data-acao]').forEach((item) => {
    item.addEventListener('click', () => acoes[item.dataset.acao!]?.());
  });

  // ---------------------------------------------------------------- edição
  let selecionado: IdControle = 'baixo';
  let arraste: { id: IdControle; dedo: number; x: number; y: number } | null = null;

  const marcarSelecionado = (): void => {
    for (const id of IDS_CONTROLE) controles[id].classList.toggle('is-selecionado', id === selecionado);
  };

  const guardar = (id: IdControle, posicao: Layout[IdControle]): void => {
    mexidos = { ...mexidos, [id]: posicao };
    salvarLayout(mexidos);
    posicionar();
  };

  function mudarTamanho(fator: number): void {
    guardar(selecionado, redimensionar(layoutAtual(medir())[selecionado], fator));
  }

  function comecarEdicao(): void {
    editando = true;
    camada.classList.add('is-editando');
    editor.hidden = false;
    marcarSelecionado();
  }

  function terminarEdicao(): void {
    editando = false;
    arraste = null;
    camada.classList.remove('is-editando');
    editor.hidden = true;
  }

  for (const id of IDS_CONTROLE) {
    const alvo = controles[id];
    // Em captura: chega antes do clique do menu e do aperto de tecla.
    alvo.addEventListener(
      'pointerdown',
      (evento) => {
        if (!editando) return;
        evento.preventDefault();
        evento.stopPropagation();
        selecionado = id;
        marcarSelecionado();
        arraste = { id, dedo: evento.pointerId, x: evento.clientX, y: evento.clientY };
        capturar(alvo, evento);
      },
      true
    );
    alvo.addEventListener('pointermove', (evento) => {
      if (!editando || !arraste || arraste.dedo !== evento.pointerId) return;
      const tela = medir();
      const inicio = layoutAtual(tela)[arraste.id];
      const movido = arrastar(inicio, evento.clientX - arraste.x, evento.clientY - arraste.y, tela);
      arraste = { ...arraste, x: evento.clientX, y: evento.clientY };
      guardar(arraste.id, movido);
    });
    const fim = (evento: PointerEvent): void => {
      if (arraste?.dedo === evento.pointerId) arraste = null;
    };
    alvo.addEventListener('pointerup', fim);
    alvo.addEventListener('pointercancel', fim);
  }

  document.documentElement.classList.add('com-toque');
}
