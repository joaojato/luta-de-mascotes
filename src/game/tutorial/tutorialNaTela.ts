import * as Phaser from 'phaser';

import { COR_FUNDO, COR_PAINEL, CONTORNO_TITULO, FONTE_TEXTO, FONTE_TITULO, TEXTO_APAGADO, TEXTO_CLARO, TEXTO_DESTAQUE } from '../estilo';
import { telaDe } from '../nitidez';

/**
 * O que o tutorial desenha por cima da luta: a fala (com a luta congelada), o
 * checklist da etapa e o foco de luz (a tela escurece e só o que importa
 * fica claro). Tudo preso à tela: cada objeto leva o próprio
 * `setScrollFactor(0)` (docs/licoes.md, 03/11/2026).
 */

const LARGURA_DA_FALA = 760;
const VERDE = '#86efac';

export interface ItemNaTela {
  texto: string;
  feito: boolean;
}

export class TutorialNaTela {
  private readonly escuro: Phaser.GameObjects.Graphics;
  private readonly caixa: Phaser.GameObjects.Rectangle;
  private readonly fala: Phaser.GameObjects.Text;
  private readonly dica: Phaser.GameObjects.Text;
  private readonly lista: Phaser.GameObjects.Text;
  private readonly fundoDaLista: Phaser.GameObjects.Rectangle;
  private readonly topoDaLista: number;

  /**
   * @param scene - A cena da luta.
   * @param depth - Acima do HUD, abaixo da pausa.
   * @param toque - Controles de toque: a dica fala em tocar, não em apertar.
   */
  constructor(private readonly scene: Phaser.Scene, depth: number, toque: boolean) {
    const tela = telaDe(scene);
    const fixo = <T extends Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.ScrollFactor & Phaser.GameObjects.Components.Depth>(o: T, d = depth) =>
      o.setScrollFactor(0).setDepth(d);

    this.escuro = fixo(scene.add.graphics());
    const y = tela.height * 0.42;
    this.caixa = fixo(scene.add.rectangle(tela.centerX, y, LARGURA_DA_FALA, 150, COR_PAINEL, 0.94).setStrokeStyle(3, 0xf8f0e6, 0.9), depth + 1);
    this.fala = fixo(
      scene.add
        .text(tela.centerX, y - 14, '', {
          color: TEXTO_DESTAQUE,
          fontFamily: FONTE_TITULO,
          fontSize: '40px',
          align: 'center',
          stroke: CONTORNO_TITULO,
          strokeThickness: 6,
          wordWrap: { width: LARGURA_DA_FALA - 60 }
        })
        .setOrigin(0.5),
      depth + 2
    );
    this.dica = fixo(
      scene.add
        .text(tela.centerX, y + 52, toque ? 'Toque na tela para continuar' : 'Aperte qualquer botão para continuar', {
          color: TEXTO_APAGADO,
          fontFamily: FONTE_TEXTO,
          fontSize: '20px'
        })
        .setOrigin(0.5),
      depth + 2
    );

    this.topoDaLista = 150;
    this.fundoDaLista = fixo(scene.add.rectangle(tela.centerX, this.topoDaLista, 10, 10, COR_FUNDO, 0.72).setOrigin(0.5, 0));
    this.lista = fixo(
      scene.add
        .text(tela.centerX, this.topoDaLista + 10, '', { color: TEXTO_CLARO, fontFamily: FONTE_TEXTO, fontSize: '24px', fontStyle: 'bold', lineSpacing: 6, align: 'left' })
        .setOrigin(0.5, 0),
      depth + 1
    );
    this.mostrarFala(null, []);
    this.mostrarChecklist([]);
  }

  /**
   * @param texto - A fala, já com as teclas; null tira a caixa.
   * @param focos - Áreas da tela que ficam claras (Putômetro, barra); vazio não escurece.
   */
  mostrarFala(texto: string | null, focos: Phaser.Geom.Rectangle[]): void {
    const visivel = texto !== null;
    [this.caixa, this.fala, this.dica].forEach((objeto) => objeto.setVisible(visivel));
    if (visivel) {
      this.fala.setText(texto);
      this.caixa.setSize(LARGURA_DA_FALA, Math.max(150, this.fala.height + 80));
      this.caixa.setDisplaySize(LARGURA_DA_FALA, Math.max(150, this.fala.height + 80));
      this.dica.setY(this.caixa.y + this.caixa.displayHeight / 2 - 26);
      this.fala.setY(this.dica.y - 26 - this.fala.height / 2);
    }
    this.desenharFoco(visivel ? focos : []);
  }

  mostrarChecklist(itens: ItemNaTela[]): void {
    const visivel = itens.length > 0;
    this.lista.setVisible(visivel);
    this.fundoDaLista.setVisible(visivel);
    if (!visivel) return;
    this.lista.setText(itens.map((item) => `${item.feito ? '✔' : '☐'}  ${item.texto}`).join('\n'));
    // Linha feita fica verde; a cor vale para o texto todo, então pinta pelo estado geral.
    this.lista.setColor(itens.every((item) => item.feito) ? VERDE : TEXTO_CLARO);
    this.fundoDaLista.setSize(this.lista.width + 40, this.lista.height + 20);
    this.fundoDaLista.setDisplaySize(this.lista.width + 40, this.lista.height + 20);
  }

  /** Escurece a tela inteira menos a caixa que cobre todos os focos, com um contorno claro. */
  private desenharFoco(focos: Phaser.Geom.Rectangle[]): void {
    const g = this.escuro.clear();
    if (focos.length === 0) return;
    const { width, height } = telaDe(this.scene);
    const uniao = focos.slice(1).reduce((a, b) => Phaser.Geom.Rectangle.Union(a, b), Phaser.Geom.Rectangle.Clone(focos[0]));
    const furo = Phaser.Geom.Rectangle.Inflate(uniao, 14, 14);
    const x0 = Math.max(0, furo.x);
    const y0 = Math.max(0, furo.y);
    const x1 = Math.min(width, furo.right);
    const y1 = Math.min(height, furo.bottom);
    g.fillStyle(0x000000, 0.72);
    g.fillRect(0, 0, width, y0);
    g.fillRect(0, y1, width, height - y1);
    g.fillRect(0, y0, x0, y1 - y0);
    g.fillRect(x1, y0, width - x1, y1 - y0);
    g.lineStyle(3, 0xfff1b8, 0.95).strokeRoundedRect(x0, y0, x1 - x0, y1 - y0, 10);
  }

  destroy(): void {
    [this.escuro, this.caixa, this.fala, this.dica, this.lista, this.fundoDaLista].forEach((objeto) => objeto.destroy());
  }
}
