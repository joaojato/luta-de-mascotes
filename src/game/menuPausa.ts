import * as Phaser from 'phaser';

import { COMANDOS_LUTA, nomeDaTecla, type MapaBotoes } from './controles';
import { CONTORNO_TITULO, COR_FUNDO, FONTE_TEXTO, FONTE_TITULO, SOMBRA_TITULO, TEXTO_CLARO, TEXTO_DESTAQUE } from './estilo';
import { LUTADORES } from './lutadores';

/** Um lado da pausa: quem joga, com que teclas (null: CPU ou celular). */
export interface LadoDaPausa {
  titulo: string;
  personagemId: string;
  botoes: MapaBotoes | null;
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

/**
 * Tela de pausa da Luta (Tab): teclas de cada lado, golpes de cada mascote e
 * os comandos gerais. Fica por cima de tudo e não depende do estado da luta.
 */
export class MenuPausa {
  private readonly objetos: Phaser.GameObjects.GameObject[] = [];

  constructor(
    scene: Phaser.Scene,
    lados: LadoDaPausa[],
    profundidade: number,
    acoes: { continuar: () => void; menu: () => void }
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
        ? COMANDOS_LUTA.map(({ id, nome: comando }) => `${comando}: ${nomeDaTecla(lado.botoes![id])}`)
        : [lado.titulo.startsWith('CPU') ? 'Controlado pelo computador' : 'Botões da tela'];
      texto(x, 140, teclas.join('\n'), 16);
      texto(x, 140 + teclas.length * 22 + 18, ['Golpes', ...golpesDoMascote(lado.personagemId)].join('\n'), 16).setWordWrapWidth(larguraColuna);
    });

    const xGeral = 60 + 2 * (larguraColuna + 30);
    texto(xGeral, 104, 'Comandos', 22, TEXTO_DESTAQUE);
    texto(xGeral, 140, COMANDOS_GERAIS.join('\n'), 16).setWordWrapWidth(width - xGeral - 40);

    const botao = (x: number, rotulo: string, aoClicar: () => void) => {
      const b = fixo(
        scene.add
          .text(x, height - 64, rotulo, { color: TEXTO_CLARO, fontFamily: FONTE_TITULO, fontSize: '26px', backgroundColor: 'rgba(11, 7, 22, 0.9)', padding: { x: 22, y: 10 } })
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: true })
      );
      b.on('pointerover', () => b.setColor(TEXTO_DESTAQUE));
      b.on('pointerout', () => b.setColor(TEXTO_CLARO));
      b.on('pointerdown', aoClicar);
    };
    botao(centerX - 170, 'CONTINUAR  (Tab)', acoes.continuar);
    botao(centerX + 170, 'MENU  (Esc)', acoes.menu);
  }

  destroy(): void {
    this.objetos.forEach((o) => o.destroy());
  }
}
