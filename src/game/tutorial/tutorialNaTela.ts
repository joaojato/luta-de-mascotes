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
  private readonly anel: Phaser.GameObjects.Graphics;
  private readonly teclaDoAnel: Phaser.GameObjects.Text;
  private readonly aviso: Phaser.GameObjects.Text;
  /** Instruções do 1x1: o título da etapa e uma lista de cada lado. */
  private titulo: Phaser.GameObjects.Text | null = null;
  private listasDosLados: { texto: Phaser.GameObjects.Text; fundo: Phaser.GameObjects.Rectangle }[] = [];
  private readonly depth: number;

  /**
   * @param scene - A cena da luta.
   * @param depth - Acima do HUD, abaixo da pausa.
   * @param toque - Controles de toque: a dica fala em tocar, não em apertar.
   */
  constructor(private readonly scene: Phaser.Scene, depth: number, toque: boolean) {
    const tela = telaDe(scene);
    this.depth = depth;
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
    // O anel do aparo vive no mundo, em volta do jogador.
    this.anel = scene.add.graphics().setDepth(depth - 1);
    this.teclaDoAnel = scene.add
      .text(0, 0, '', { color: TEXTO_DESTAQUE, fontFamily: FONTE_TITULO, fontSize: '34px', stroke: CONTORNO_TITULO, strokeThickness: 6 })
      .setOrigin(0.5)
      .setDepth(depth - 1)
      .setVisible(false);
    this.aviso = fixo(
      scene.add
        .text(tela.centerX, tela.height * 0.3, '', { color: TEXTO_DESTAQUE, fontFamily: FONTE_TITULO, fontSize: '44px', stroke: CONTORNO_TITULO, strokeThickness: 8 })
        .setOrigin(0.5)
        .setAlpha(0),
      depth + 1
    );
    this.mostrarFala(null, []);
    this.mostrarChecklist([]);
  }

  /**
   * O anel do aparo: fecha do largo até o alvo no instante do impacto. No
   * fim (a janela do aparo) o alvo acende.
   * @param x - Centro, no mundo.
   * @param y - Centro, no mundo.
   * @param progresso - De 0 a 1; null apaga.
   * @param tecla - A tecla de defesa, no meio.
   * @param janela - A fração final do anel em que apertar vale.
   */
  desenharAnel(x: number, y: number, progresso: number | null, tecla: string, janela: number): void {
    const g = this.anel.clear();
    this.teclaDoAnel.setVisible(progresso !== null);
    if (progresso === null) return;
    const alvo = 52;
    const raio = alvo + (1 - progresso) * 150;
    const naJanela = progresso >= 1 - janela;
    g.lineStyle(6, naJanela ? 0xfacc15 : 0xf8f0e6, naJanela ? 1 : 0.55).strokeCircle(x, y, alvo);
    g.lineStyle(5, 0xf8f0e6, 0.95).strokeCircle(x, y, raio);
    this.teclaDoAnel.setPosition(x, y).setText(tecla).setColor(naJanela ? '#facc15' : TEXTO_DESTAQUE);
  }

  /**
   * Instruções do 1x1: o título da etapa no meio e o checklist de cada
   * jogador do lado dele, com as teclas dele.
   * @param titulo - O nome da etapa.
   * @param lados - P1 e P2, cada um com os itens já com as teclas.
   */
  mostrarDuasListas(titulo: string, lados: [ItemNaTela[], ItemNaTela[]]): void {
    const tela = telaDe(this.scene);
    if (!this.titulo) {
      this.titulo = this.scene.add
        .text(tela.centerX, 150, '', { color: TEXTO_DESTAQUE, fontFamily: FONTE_TITULO, fontSize: '34px', stroke: CONTORNO_TITULO, strokeThickness: 6 })
        .setOrigin(0.5, 0)
        .setScrollFactor(0)
        .setDepth(this.depth + 1);
      this.listasDosLados = [0.27, 0.73].map((fracao) => ({
        fundo: this.scene.add.rectangle(tela.width * fracao, 200, 10, 10, COR_FUNDO, 0.72).setOrigin(0.5, 0).setScrollFactor(0).setDepth(this.depth),
        texto: this.scene.add
          .text(tela.width * fracao, 210, '', { color: TEXTO_CLARO, fontFamily: FONTE_TEXTO, fontSize: '22px', fontStyle: 'bold', lineSpacing: 6 })
          .setOrigin(0.5, 0)
          .setScrollFactor(0)
          .setDepth(this.depth + 1)
      }));
    }
    this.titulo.setText(titulo);
    this.listasDosLados.forEach(({ texto, fundo }, i) => {
      const itens = lados[i];
      texto.setText([`P${i + 1}`, ...itens.map((item) => `${item.feito ? '✔' : '☐'}  ${item.texto}`)].join('\n'));
      texto.setColor(itens.every((item) => item.feito) ? VERDE : TEXTO_CLARO);
      fundo.setSize(texto.width + 36, texto.height + 20).setDisplaySize(texto.width + 36, texto.height + 20);
    });
  }

  /** Um aviso curto no alto (o resultado do aparo), que some sozinho. */
  mostrarAviso(texto: string, cor: string): void {
    this.scene.tweens.killTweensOf(this.aviso);
    this.aviso.setText(texto).setColor(cor).setAlpha(1).setScale(0.8);
    this.scene.tweens.add({ targets: this.aviso, scale: 1, duration: 160, ease: 'Back.Out' });
    this.scene.tweens.add({ targets: this.aviso, alpha: 0, delay: 900, duration: 400 });
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
    [this.escuro, this.caixa, this.fala, this.dica, this.lista, this.fundoDaLista, this.anel, this.teclaDoAnel, this.aviso].forEach((objeto) => objeto.destroy());
    this.titulo?.destroy();
    this.listasDosLados.forEach(({ texto, fundo }) => {
      texto.destroy();
      fundo.destroy();
    });
  }
}
