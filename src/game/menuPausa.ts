import * as Phaser from 'phaser';

import { getAppContext } from './context';
import { AUDIO_KEYS, playAudioCue } from './core/audio';
import { COMANDOS_LUTA, nomeDaTecla, type MapaBotoes } from './controles';
import {
  CONTORNO_TITULO,
  COR_FUNDO,
  FONTE_TEXTO,
  FONTE_TITULO,
  SOMBRA_TITULO,
  TEXTO_APAGADO,
  TEXTO_CLARO,
  TEXTO_DESTAQUE
} from './estilo';
import { LUTADORES } from './lutadores';
import { createTextButton, type TextButton } from './ui';
import { controlesDeToqueAtivos } from '../toque/telaToque';

/** Um lado da pausa: quem joga, com que teclas (null: CPU ou celular). */
export interface LadoDaPausa {
  titulo: string;
  personagemId: string;
  botoes: MapaBotoes | null;
  /** Teclas a mais do mesmo lado (o P1 sozinho: I O P). */
  extras?: Partial<MapaBotoes>;
}

/** Comandos que valem para todo mascote (docs/gdd.md, "Golpes"). */
const COMANDOS_GERAIS = [
  'Baixo + Soco: soco forte (quebra a defesa em pé)',
  'Baixo + Chute: chute baixo',
  'Soco ou Chute no ar: golpe aéreo (a voadora quebra a defesa agachada)',
  'Defender segurando; agachado defende embaixo',
  'Defender bem na hora do golpe: guarda perfeita (atacante fica tonto)',
  'Dois toques para a frente ou para trás: dash',
  'Especial: com a barra azul cheia'
];

/** Nome de cada golpe do mascote, tirado do JSON dele (Regra do JSON). */
export function golpesDoMascote(personagemId: string): string[] {
  const lutador = LUTADORES.find((l) => l.id === personagemId);
  if (!lutador) return [];
  const label = (acao: string | undefined) => lutador.actions.find((a) => a.action === acao)?.label;
  const moves = lutador.moves as { kick?: { action?: string }; lowKick?: { action?: string }; special?: { action?: string } } | undefined;
  const linhas: [string, string | undefined][] = [
    ['Soco', label('light-punch')],
    ['Baixo + Soco', label('heavy-punch')],
    ['Chute', label(moves?.kick?.action ?? 'heavy-kick')],
    ['Baixo + Chute', label(moves?.lowKick?.action ?? 'low-kick')],
    ['Especial', label(moves?.special?.action ?? 'special')]
  ];
  return linhas.filter(([, nome]) => nome).map(([botao, nome]) => `${botao}: ${nome}`);
}

/** O que cada opção da pausa faz; a ordem aqui é a ordem na tela. */
export interface AcoesDaPausa {
  continuar: () => void;
  recomecar: () => void;
  configuracoes: () => void;
  sair: () => void;
}

export const OPCOES_DA_PAUSA: { id: keyof AcoesDaPausa; rotulo: string }[] = [
  { id: 'continuar', rotulo: 'Continuar' },
  { id: 'recomecar', rotulo: 'Recomeçar' },
  { id: 'configuracoes', rotulo: 'Configurações' },
  { id: 'sair', rotulo: 'Sair da partida' }
];

/**
 * Tela de pausa da Luta (Esc): teclas de cada lado, golpes de cada mascote, os
 * comandos gerais e as quatro opções embaixo. Setas ou WASD escolhem, Enter ou
 * Espaço confirmam; o Esc de fechar é da Luta. Fica por cima de tudo e não
 * depende do estado da luta.
 */
export class MenuPausa {
  private readonly objetos: Phaser.GameObjects.GameObject[] = [];
  private readonly botoes: TextButton[] = [];
  private readonly teclas: [string, () => void][] = [];
  private escolhida = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    lados: LadoDaPausa[],
    profundidade: number,
    private readonly acoes: AcoesDaPausa
  ) {
    const { centerX, width, height } = scene.cameras.main;
    const fixo = <T extends Phaser.GameObjects.Components.ScrollFactor & Phaser.GameObjects.Components.Depth>(o: T): T => {
      o.setScrollFactor(0).setDepth(profundidade);
      this.objetos.push(o as unknown as Phaser.GameObjects.GameObject);
      return o;
    };
    const texto = (x: number, y: number, conteudo: string, tamanho: number, cor = TEXTO_CLARO) =>
      fixo(scene.add.text(x, y, conteudo, { color: cor, fontFamily: FONTE_TEXTO, fontSize: `${tamanho}px`, lineSpacing: 4 }));

    fixo(scene.add.rectangle(centerX, height / 2, width, height, COR_FUNDO, 0.88).setInteractive());
    fixo(
      scene.add
        .text(centerX, 52, 'PAUSA', { color: TEXTO_DESTAQUE, fontFamily: FONTE_TITULO, fontSize: '54px', stroke: CONTORNO_TITULO, strokeThickness: 8 })
        .setShadow(0, 5, SOMBRA_TITULO, 0, true, true)
        .setOrigin(0.5)
    );

    // Uma coluna por lado: teclas e golpes do mascote.
    const larguraColuna = Math.min(380, (width - 120) / 3);
    lados.forEach((lado, i) => {
      const x = 60 + i * (larguraColuna + 30);
      const nome = LUTADORES.find((l) => l.id === lado.personagemId)?.label ?? lado.personagemId;
      texto(x, 104, `${lado.titulo}: ${nome}`, 22, TEXTO_DESTAQUE);
      const teclas = lado.botoes
        ? COMANDOS_LUTA.map(({ id, nome: comando }) => {
            const extra = lado.extras?.[id];
            return `${comando}: ${nomeDaTecla(lado.botoes![id])}${extra ? ` / ${nomeDaTecla(extra)}` : ''}`;
          })
        : [lado.titulo.startsWith('CPU') ? 'Controlado pelo computador' : 'Botões da tela'];
      texto(x, 140, teclas.join('\n'), 16);
      texto(x, 140 + teclas.length * 22 + 18, ['Golpes', ...golpesDoMascote(lado.personagemId)].join('\n'), 16).setWordWrapWidth(larguraColuna);
    });

    const xGeral = 60 + 2 * (larguraColuna + 30);
    texto(xGeral, 104, 'Comandos', 22, TEXTO_DESTAQUE);
    texto(xGeral, 140, COMANDOS_GERAIS.join('\n'), 16).setWordWrapWidth(width - xGeral - 40);

    // As quatro opções numa fileira embaixo (duas por linha na tela em pé).
    const porLinha = width >= 1000 ? OPCOES_DA_PAUSA.length : 2;
    const largura = Math.min(280, (width - 40) / porLinha - 16);
    const linhas = Math.ceil(OPCOES_DA_PAUSA.length / porLinha);
    OPCOES_DA_PAUSA.forEach(({ rotulo }, i) => {
      const coluna = i % porLinha;
      const linha = Math.floor(i / porLinha);
      const botao = createTextButton(scene, {
        x: centerX + (coluna - (porLinha - 1) / 2) * (largura + 16),
        y: height - 84 - (linhas - 1 - linha) * 68,
        width: largura,
        height: 54,
        label: rotulo,
        fontSize: 22,
        onClick: () => this.confirmar(i),
        onHover: () => this.escolher(i)
      });
      botao.group.setScrollFactor(0, 0, true).setDepth(profundidade);
      this.botoes.push(botao);
    });
    if (!controlesDeToqueAtivos()) {
      texto(centerX, height - 32, '← → escolhe   •   Enter confirma   •   Esc continua', 14, TEXTO_APAGADO).setOrigin(0.5);
    }
    this.escolher(0);

    const keyboard = scene.input.keyboard;
    const ligar = (evento: string, fazer: () => void): void => {
      keyboard?.on(evento, fazer);
      this.teclas.push([evento, fazer]);
    };
    for (const tecla of ['LEFT', 'UP', 'A', 'W']) ligar(`keydown-${tecla}`, () => this.mover(-1));
    for (const tecla of ['RIGHT', 'DOWN', 'D', 'S']) ligar(`keydown-${tecla}`, () => this.mover(1));
    for (const tecla of ['ENTER', 'SPACE']) ligar(`keydown-${tecla}`, () => this.confirmar(this.escolhida));
  }

  private mover(direcao: number): void {
    const proxima = Phaser.Math.Wrap(this.escolhida + direcao, 0, this.botoes.length);
    if (proxima !== this.escolhida) playAudioCue(this.scene, 'ui-mover', getAppContext().settingsStore.getState());
    this.escolher(proxima);
  }

  private escolher(indice: number): void {
    this.escolhida = indice;
    this.botoes.forEach((botao, i) => botao.setSelected(i === indice));
  }

  private confirmar(indice: number): void {
    playAudioCue(this.scene, AUDIO_KEYS.uiConfirm, getAppContext().settingsStore.getState());
    this.acoes[OPCOES_DA_PAUSA[indice].id]();
  }

  destroy(): void {
    const keyboard = this.scene.input.keyboard;
    this.teclas.forEach(([evento, fazer]) => keyboard?.off(evento, fazer));
    this.botoes.forEach((botao) => botao.destroy());
    this.objetos.forEach((o) => o.destroy());
  }
}
