/**
 * Espelho do controle por celular: o esqueleto que o celular está vendo e os
 * comandos que o jogo leu. Sem isso o jogador não sabe por que o mascote não
 * socou.
 */
import * as Phaser from 'phaser';

import { celular } from './celularNoJogo';
import { COMANDOS, P, type Comando } from './gestos';
import type { Jogador } from './protocolo';

const ROTULOS: Record<Comando, string> = {
  left: 'ESQ',
  right: 'DIR',
  crouch: 'AGACHA',
  jump: 'PULO',
  block: 'GUARDA',
  light: 'SOCO',
  heavy: 'CHUTE',
  special: 'TORCIDA'
};

const OSSOS: [number, number][] = [
  [P.ombroE, P.ombroD],
  [P.ombroE, P.cotoveloE],
  [P.cotoveloE, P.pulsoE],
  [P.ombroD, P.cotoveloD],
  [P.cotoveloD, P.pulsoD],
  [P.ombroE, P.quadrilE],
  [P.ombroD, P.quadrilD],
  [P.quadrilE, P.quadrilD],
  [P.quadrilE, P.joelhoE],
  [P.joelhoE, P.tornozeloE],
  [P.quadrilD, P.joelhoD],
  [P.joelhoD, P.tornozeloD]
];

const COR_JOGADOR: Record<Jogador, number> = { 1: 0x38bdf8, 2: 0xf87171 };
const COR_ACESO = 0xfacc15;
const COR_APAGADO = 0x1e293b;

export interface OpcoesPainel {
  x: number;
  y: number;
  largura: number;
  altura: number;
  /** Mostra os oito comandos em botões embaixo do esqueleto. */
  comandos: boolean;
  depth?: number;
}

export class PainelCelular {
  private readonly grafico: Phaser.GameObjects.Graphics;
  private readonly status: Phaser.GameObjects.Text;
  private readonly rotulos: Phaser.GameObjects.Text[] = [];

  constructor(
    cena: Phaser.Scene,
    private readonly jogador: Jogador,
    private readonly opcoes: OpcoesPainel
  ) {
    const depth = opcoes.depth ?? 10;
    this.grafico = cena.add.graphics().setScrollFactor(0).setDepth(depth);
    this.status = cena.add
      .text(opcoes.x + opcoes.largura / 2, opcoes.y + opcoes.altura + 6, '', {
        color: '#e2e8f0',
        fontFamily: 'monospace',
        fontSize: opcoes.comandos ? '15px' : '11px',
        align: 'center'
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(depth + 1);

    if (opcoes.comandos) {
      COMANDOS.forEach((comando, i) => {
        const { cx, cy } = this.posicaoBotao(i);
        this.rotulos.push(
          cena.add
            .text(cx, cy, ROTULOS[comando], { color: '#f8fafc', fontFamily: 'monospace', fontSize: '13px' })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(depth + 1)
        );
      });
    }
  }

  atualizar(): void {
    const { x, y, largura, altura, comandos } = this.opcoes;
    const situacao = celular.jogadores[this.jogador];
    const g = this.grafico;
    g.clear();

    g.fillStyle(0x020617, 0.75);
    g.fillRect(x, y, largura, altura);
    g.lineStyle(2, situacao.conectado ? COR_JOGADOR[this.jogador] : 0x334155, 1);
    g.strokeRect(x, y, largura, altura);

    const ativos = new Set(situacao.leitor.ativos());
    this.desenharEsqueleto();

    if (comandos) {
      COMANDOS.forEach((comando, i) => {
        const { cx, cy, w, h } = this.posicaoBotao(i);
        g.fillStyle(ativos.has(comando) ? COR_ACESO : COR_APAGADO, 1);
        g.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, 6);
        this.rotulos[i].setColor(ativos.has(comando) ? '#020617' : '#94a3b8');
      });
    }

    this.status.setText(this.textoStatus(comandos ? '' : [...ativos].map((c) => ROTULOS[c]).join(' ')));
  }

  setVisivel(visivel: boolean): void {
    this.grafico.setVisible(visivel);
    this.status.setVisible(visivel);
    this.rotulos.forEach((r) => r.setVisible(visivel));
  }

  destruir(): void {
    this.grafico.destroy();
    this.status.destroy();
    this.rotulos.forEach((r) => r.destroy());
  }

  private textoStatus(ativosCompacto: string): string {
    const prefixo = `P${this.jogador} `;
    if (!celular.relayNoAr) {
      return `${prefixo}sem servidor do controle`;
    }
    const situacao = celular.jogadores[this.jogador];
    if (!situacao.conectado) {
      return `${prefixo}aguardando celular`;
    }
    const leitor = situacao.leitor;
    switch (leitor.estado) {
      case 'sem-corpo':
        return `${prefixo}corpo fora da câmera`;
      case 'calibrando':
        return `${prefixo}fique parado de frente ${Math.round(leitor.progresso * 100)}%`;
      default:
        return ativosCompacto ? `${prefixo}${ativosCompacto}` : `${prefixo}pronto · ${Math.round(situacao.fps)} fps`;
    }
  }

  private desenharEsqueleto(): void {
    const pose = celular.jogadores[this.jogador].ultimaPose;
    if (!pose) {
      return;
    }
    const { x, y, largura, altura } = this.opcoes;
    // Os x da pose vão de 0 ao aspecto do vídeo; os y, de 0 a 1.
    const aspecto = pose.aspecto ?? 1;
    const escala = Math.min(largura / aspecto, altura) * 0.95;
    const ox = x + (largura - aspecto * escala) / 2;
    const oy = y + (altura - escala) / 2;
    // Espelhado: o jogador levanta a mão direita e vê a mão da direita subir.
    const tela = (i: number): { px: number; py: number; ok: boolean } => {
      const p = pose.img[i];
      return { px: ox + (aspecto - p.x) * escala, py: oy + p.y * escala, ok: p.v >= 0.5 };
    };

    const g = this.grafico;
    g.lineStyle(3, COR_JOGADOR[this.jogador], 1);
    for (const [a, b] of OSSOS) {
      const pa = tela(a);
      const pb = tela(b);
      if (pa.ok && pb.ok) {
        g.lineBetween(pa.px, pa.py, pb.px, pb.py);
      }
    }
    const nariz = tela(P.nariz);
    if (nariz.ok) {
      g.fillStyle(COR_JOGADOR[this.jogador], 1);
      g.fillCircle(nariz.px, nariz.py, Math.max(4, escala * 0.04));
    }
  }

  private posicaoBotao(i: number): { cx: number; cy: number; w: number; h: number } {
    const { x, y, largura, altura } = this.opcoes;
    const porLinha = 4;
    const w = 86;
    const h = 28;
    const espaco = 8;
    const totalLinha = porLinha * w + (porLinha - 1) * espaco;
    const inicio = x + largura / 2 - totalLinha / 2;
    const coluna = i % porLinha;
    const linha = Math.floor(i / porLinha);
    return {
      cx: inicio + coluna * (w + espaco) + w / 2,
      cy: y + altura + 44 + linha * (h + espaco),
      w,
      h
    };
  }
}
