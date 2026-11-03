import * as Phaser from 'phaser';

import { AUDIO_KEYS, playAudioCue } from '../game/core/audio';
import {
  atribuirTecla,
  carregarControles,
  COMANDOS_LUTA,
  CONTROLES_PADRAO,
  nomeDaTecla,
  salvarControles,
  TECLAS_RESERVADAS,
  type Controles,
  type Lado
} from '../game/controles';
import { COR_BORDA, COR_PAINEL, FONTE_TEXTO, FONTE_TITULO, TEXTO_APAGADO, TEXTO_CLARO, TEXTO_DESTAQUE } from '../game/estilo';
import { createTextButton, type TextButton } from '../game/ui';
import { SCENE_KEYS, type SceneKey } from '../game/types';
import { BaseScene } from './BaseScene';

/** Nome do KeyCodes do Phaser de cada código de tecla (o primeiro nome, quando há dois). */
const TECLA_POR_CODIGO = new Map<number, string>();
Object.entries(Phaser.Input.Keyboard.KeyCodes as Record<string, number>).forEach(([nome, codigo]) => {
  if (!TECLA_POR_CODIGO.has(codigo)) TECLA_POR_CODIGO.set(codigo, nome);
});
const TECLAS_VALIDAS = new Set(TECLA_POR_CODIGO.values());

const LADOS: Lado[] = ['p1', 'p2'];
/** A linha de baixo: restaurar e voltar. */
const LINHA_FINAL = COMANDOS_LUTA.length;

export interface BotoesSceneData {
  /** Repassado aos Ajustes na volta (a Luta pausada que os abriu). */
  voltarPara?: SceneKey | null;
}

/**
 * Ajustes ▸ Botões do teclado: remapeia cada comando da luta dos dois lados.
 * Enter (ou clique) num comando espera a tecla nova; tecla que já era de
 * outro comando troca com ele (atribuirTecla). Salva no navegador, no mesmo
 * lugar que a aba Botões da Academia, e a Luta relê ao voltar da pausa.
 */
export class BotoesScene extends BaseScene {
  private controles!: Controles;
  private botoes: TextButton[][] = [];
  private linha = 0;
  private coluna = 0;
  private esperando: { lado: Lado; indice: number } | null = null;
  private aviso!: Phaser.GameObjects.Text;
  private voltarPara: SceneKey | null = null;

  constructor() {
    super(SCENE_KEYS.Botoes);
  }

  init(data: BotoesSceneData): void {
    this.voltarPara = data?.voltarPara ?? null;
  }

  create(): void {
    this.markActiveScene(SCENE_KEYS.Botoes);
    this.createBackdrop();
    this.createHeading('Botões do teclado', '');
    this.controles = carregarControles(TECLAS_VALIDAS);
    this.esperando = null;
    this.linha = 0;
    this.coluna = 0;

    const { centerX } = this.tela;
    const largura = 400;
    const passo = 46;
    const topo = 168;
    this.add
      .rectangle(centerX, topo + (LINHA_FINAL * passo) / 2 + 2, 2 * largura + 100, LINHA_FINAL * passo + 120, COR_PAINEL, 0.85)
      .setStrokeStyle(2, COR_BORDA, 1);

    const xDo = (coluna: number): number => centerX + (coluna === 0 ? -1 : 1) * (largura / 2 + 16);
    LADOS.forEach((lado, coluna) => {
      this.add
        .text(xDo(coluna), topo - 42, lado.toUpperCase(), { color: TEXTO_DESTAQUE, fontFamily: FONTE_TITULO, fontSize: '28px' })
        .setOrigin(0.5);
    });

    this.botoes = COMANDOS_LUTA.map((_, linha) =>
      LADOS.map((lado, coluna) =>
        createTextButton(this, {
          x: xDo(coluna),
          y: topo + linha * passo,
          width: largura,
          height: 40,
          label: this.rotulo(lado, linha),
          fontSize: 20,
          onClick: () => this.confirmar(linha, coluna),
          onHover: () => this.escolher(linha, coluna)
        })
      )
    );
    const yFinal = topo + LINHA_FINAL * passo + 18;
    this.botoes.push(
      ['Restaurar padrão', 'Voltar aos Ajustes'].map((label, coluna) =>
        createTextButton(this, {
          x: xDo(coluna),
          y: yFinal,
          width: largura,
          height: 44,
          label,
          fontSize: 22,
          onClick: () => this.confirmar(LINHA_FINAL, coluna),
          onHover: () => this.escolher(LINHA_FINAL, coluna)
        })
      )
    );

    this.aviso = this.add
      .text(centerX, yFinal + 48, '', { color: TEXTO_CLARO, fontFamily: FONTE_TEXTO, fontSize: '16px', fontStyle: 'bold' })
      .setOrigin(0.5);
    this.add
      .text(centerX, yFinal + 74, 'Vale para a luta e para os botões da tela do celular.', {
        color: TEXTO_APAGADO,
        fontFamily: FONTE_TEXTO,
        fontSize: '13px'
      })
      .setOrigin(0.5);
    this.escolher(0, 0);

    const keyboard = this.input.keyboard;
    const navegar = (dl: number, dc: number) => () => {
      if (this.esperando) return;
      this.escolher(Phaser.Math.Wrap(this.linha + dl, 0, this.botoes.length), Phaser.Math.Wrap(this.coluna + dc, 0, 2));
    };
    for (const tecla of ['UP', 'W']) keyboard?.on(`keydown-${tecla}`, navegar(-1, 0));
    for (const tecla of ['DOWN', 'S']) keyboard?.on(`keydown-${tecla}`, navegar(1, 0));
    for (const tecla of ['LEFT', 'A']) keyboard?.on(`keydown-${tecla}`, navegar(0, -1));
    for (const tecla of ['RIGHT', 'D']) keyboard?.on(`keydown-${tecla}`, navegar(0, 1));
    for (const tecla of ['ENTER', 'SPACE']) {
      keyboard?.on(`keydown-${tecla}`, () => {
        if (!this.esperando) this.confirmar(this.linha, this.coluna);
      });
    }
    keyboard?.on('keydown-ESC', () => {
      if (!this.esperando) this.voltar();
    });

    // A tecla nova é pega antes do Phaser, na captura: assim Esc, setas e
    // Enter viram botão de luta (ou cancelam) sem navegar a tela.
    window.addEventListener('keydown', this.aoTeclar, true);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => window.removeEventListener('keydown', this.aoTeclar, true));

    this.createFooterHint('↑ ↓ ← → escolhe   •   Enter troca a tecla   •   Esc volta');
  }

  private readonly aoTeclar = (evento: KeyboardEvent): void => {
    if (!this.esperando) return;
    evento.preventDefault();
    evento.stopImmediatePropagation();
    const { lado, indice } = this.esperando;
    const tecla = TECLA_POR_CODIGO.get(evento.keyCode);
    if (tecla === 'ESC') {
      this.aviso.setText('Cancelado.');
    } else if (!tecla || TECLAS_RESERVADAS.includes(tecla)) {
      this.aviso.setText(`${evento.key} não pode ser botão de luta. Tente outra, ou Esc para cancelar.`);
      return;
    } else {
      this.controles = atribuirTecla(this.controles, lado, COMANDOS_LUTA[indice].id, tecla);
      salvarControles(this.controles);
      playAudioCue(this, AUDIO_KEYS.uiConfirm, this.app.settingsStore.getState());
      this.aviso.setText(`${COMANDOS_LUTA[indice].nome} do ${lado.toUpperCase()}: ${nomeDaTecla(tecla)}. Salvo.`);
    }
    this.esperando = null;
    this.atualizarRotulos();
  };

  private rotulo(lado: Lado, indice: number): string {
    const { id, nome } = COMANDOS_LUTA[indice];
    return `${nome}: ${nomeDaTecla(this.controles[lado][id])}`;
  }

  private atualizarRotulos(): void {
    COMANDOS_LUTA.forEach((_, linha) => LADOS.forEach((lado, coluna) => this.botoes[linha][coluna].setLabel(this.rotulo(lado, linha))));
  }

  private escolher(linha: number, coluna: number): void {
    this.linha = linha;
    this.coluna = coluna;
    this.botoes.forEach((fileira, l) => fileira.forEach((botao, c) => botao.setSelected(l === linha && c === coluna)));
  }

  private confirmar(linha: number, coluna: number): void {
    if (this.esperando) return;
    this.escolher(linha, coluna);
    playAudioCue(this, AUDIO_KEYS.uiConfirm, this.app.settingsStore.getState());
    if (linha < LINHA_FINAL) {
      this.esperando = { lado: LADOS[coluna], indice: linha };
      this.botoes[linha][coluna].setLabel(`${COMANDOS_LUTA[linha].nome}: aperte a tecla…`);
      this.aviso.setText('Aperte a tecla nova (Esc cancela).');
    } else if (coluna === 0) {
      this.controles = CONTROLES_PADRAO;
      salvarControles(this.controles);
      this.atualizarRotulos();
      this.aviso.setText('Botões de volta ao padrão.');
    } else {
      this.voltar();
    }
  }

  private voltar(): void {
    this.scene.start(SCENE_KEYS.Settings, { voltarPara: this.voltarPara ?? undefined });
  }
}
