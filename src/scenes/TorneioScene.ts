import * as Phaser from 'phaser';

import { AUDIO_KEYS, playAudioCue } from '../game/core/audio';
import { IDS_SELECIONAVEIS } from '../game/elenco';
import { torneioDisponivel } from '../game/torneio';
import { carregarTorneio } from '../game/torneioSalvo';
import { createSelectionCard, createTextButton, preencherCartao, type SelectionCard, type TextButton } from '../game/ui';
import { SCENE_KEYS, type FormatoTorneio } from '../game/types';
import { BaseScene } from './BaseScene';

const ACCENT = 0xfacc15;

interface Opcao {
  titulo: string;
  texto: string;
  textura: string;
  disponivel: boolean;
}

/**
 * Torneios contra a CPU (João, 31/10/2026): primeiro o formato (mata-mata ou
 * pontos corridos), depois o tamanho (8 ou 16 times; o de 16 fica travado
 * enquanto o elenco não tiver 16). Com um torneio salvo, "Continuar torneio"
 * aparece em cima e volta à rodada em que ele parou.
 */
export class TorneioScene extends BaseScene {
  private etapa: 'formato' | 'tamanho' = 'formato';
  private formato: FormatoTorneio = 'mata-mata';
  private cards: SelectionCard[] = [];
  private continuar: TextButton | null = null;
  /** -1 é o botão "Continuar torneio"; 0 e 1 são os cartões. */
  private selecionado = 0;
  private opcoes: Opcao[] = [];

  constructor() {
    super(SCENE_KEYS.Torneio);
  }

  create(): void {
    this.etapa = 'formato';
    this.cards = [];
    this.continuar = null;

    this.markActiveScene(SCENE_KEYS.Torneio);
    this.createBackdrop();
    this.createHeading('Torneios', 'Você contra a CPU, até o título');
    this.registerInput();
    this.montarEtapa();
    this.createFooterHint(
      this.continuar
        ? '← → escolhe   •   ↑ continua o torneio salvo   •   Enter confirma   •   Esc volta'
        : '← → escolhe   •   Enter confirma   •   Esc volta'
    );

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.limpar());
  }

  private montarEtapa(): void {
    this.limpar();
    const elenco = IDS_SELECIONAVEIS.length;
    this.opcoes =
      this.etapa === 'formato'
        ? [
            { titulo: 'Mata-mata', texto: 'Chaveamento: quartas, semifinal e final. Perdeu, caiu.', textura: 'torneio-mata-mata', disponivel: true },
            { titulo: 'Pontos corridos', texto: 'Todos contra todos. Vitória por 2x0 vale 2 pontos, por 2x1 vale 1.', textura: 'torneio-pontos-corridos', disponivel: true }
          ]
        : ([8, 16] as const).map((tamanho) => ({
            titulo: `${tamanho} times`,
            texto: torneioDisponivel(tamanho, elenco)
              ? `Você e mais ${tamanho - 1} times sorteados.`
              : `Precisa de ${tamanho} lutadores (hoje ${elenco}).`,
            textura: '',
            disponivel: torneioDisponivel(tamanho, elenco)
          }));

    const { centerX, centerY } = this.cameras.main;
    const largura = 340;
    const altura = 330;
    const gap = 60;
    const inicio = centerX - (largura * 2 + gap) / 2 + largura / 2;
    this.opcoes.forEach((opcao, index) => {
      const ilustrado = Boolean(opcao.textura) && this.textures.exists(opcao.textura);
      const card = createSelectionCard(this, {
        x: inicio + index * (largura + gap),
        y: centerY + 40,
        width: largura,
        height: altura,
        title: '',
        subtitle: ilustrado ? opcao.texto : undefined,
        texture: ilustrado ? opcao.textura : undefined,
        imageMaxSize: largura - 20,
        imageOffsetY: -30,
        onHover: () => this.selecionar(index),
        onClick: () => this.confirmar(index)
      });
      if (!ilustrado) preencherCartao(this, card, { titulo: opcao.titulo, texto: opcao.texto, largura });
      card.setDimmed(!opcao.disponivel);
      this.cards.push(card);
    });

    const salvo = this.etapa === 'formato' ? carregarTorneio(IDS_SELECIONAVEIS) : null;
    if (salvo) {
      const formato = salvo.formato === 'mata-mata' ? 'mata-mata' : 'pontos corridos';
      this.continuar = createTextButton(this, {
        x: centerX,
        y: 150,
        width: 520,
        height: 50,
        label: `Continuar torneio (${formato})`,
        onClick: () => this.confirmar(-1),
        onHover: () => this.selecionar(-1)
      });
    }
    this.selecionar(salvo ? -1 : 0);
  }

  private limpar(): void {
    this.cards.forEach((card) => card.destroy());
    this.cards = [];
    this.continuar?.destroy();
    this.continuar = null;
  }

  private registerInput(): void {
    const keyboard = this.input.keyboard;
    if (!keyboard) {
      return;
    }
    const mover = (passo: number): void => {
      const proximo = this.selecionado < 0 ? 0 : Phaser.Math.Wrap(this.selecionado + passo, 0, this.cards.length);
      if (proximo !== this.selecionado) playAudioCue(this, 'ui-mover', this.app.settingsStore.getState());
      this.selecionar(proximo);
    };
    keyboard.on('keydown-LEFT', () => mover(-1));
    keyboard.on('keydown-A', () => mover(-1));
    keyboard.on('keydown-RIGHT', () => mover(1));
    keyboard.on('keydown-D', () => mover(1));
    const subir = (): void => {
      if (this.continuar) this.selecionar(-1);
    };
    keyboard.on('keydown-UP', subir);
    keyboard.on('keydown-W', subir);
    keyboard.on('keydown-DOWN', () => this.selecionado < 0 && this.selecionar(0));
    keyboard.on('keydown-S', () => this.selecionado < 0 && this.selecionar(0));
    keyboard.on('keydown-ENTER', () => this.confirmar(this.selecionado));
    keyboard.on('keydown-SPACE', () => this.confirmar(this.selecionado));
    keyboard.on('keydown-ESC', () => this.voltar());
    keyboard.on('keydown-BACKSPACE', () => this.voltar());
  }

  private selecionar(index: number): void {
    this.selecionado = index;
    this.cards.forEach((card, i) => card.setSelected(i === index, ACCENT));
    this.continuar?.setSelected(index === -1);
  }

  private confirmar(index: number): void {
    if (index === -1) {
      if (!this.continuar) return;
      playAudioCue(this, AUDIO_KEYS.uiConfirm, this.app.settingsStore.getState());
      this.scene.start(SCENE_KEYS.TorneioQuadro);
      return;
    }
    const opcao = this.opcoes[index];
    if (!opcao?.disponivel) return;
    this.selecionar(index);
    playAudioCue(this, AUDIO_KEYS.uiConfirm, this.app.settingsStore.getState());
    if (this.etapa === 'formato') {
      this.formato = index === 0 ? 'mata-mata' : 'pontos-corridos';
      this.etapa = 'tamanho';
      this.montarEtapa();
      return;
    }
    this.scene.start(SCENE_KEYS.Dificuldade, { destino: 'torneio', formato: this.formato, tamanho: index === 0 ? 8 : 16 });
  }

  private voltar(): void {
    if (this.etapa === 'tamanho') {
      this.etapa = 'formato';
      this.montarEtapa();
      return;
    }
    this.goToMenu();
  }
}
