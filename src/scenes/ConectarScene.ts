import * as Phaser from 'phaser';
import QRCode from 'qrcode';

import { celular } from '../controle/celularNoJogo';
import { PainelCelular } from '../controle/painelCelular';
import { CAMINHO_INFO, type InfoControle, type Jogador } from '../controle/protocolo';
import { SCENE_KEYS } from '../game/types';
import { BaseScene } from './BaseScene';

const ENDERECOS_LOCAIS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

const GUIA = [
  'Celular em pé na altura da cintura, a uns 2,5 m, pegando o corpo inteiro.',
  'Passo pro lado: anda  ·  guarda no rosto: defende  ·  soco: soco',
  'Joelho alto: chute  ·  pulo: pulo  ·  mãos pro alto: especial (pose de torcida)'
];

/**
 * Tela de conexão do controle por celular: um QR por jogador, o esqueleto que
 * cada celular está vendo e os comandos lidos, para testar antes de lutar.
 * O teclado continua valendo junto.
 */
export class ConectarScene extends BaseScene {
  private paineis: PainelCelular[] = [];

  constructor() {
    super(SCENE_KEYS.Conectar);
  }

  create(): void {
    this.paineis = [];
    this.markActiveScene(SCENE_KEYS.Conectar);
    this.cameras.main.setBackgroundColor(0x020617);
    this.createHeading('Controle pelo celular', 'Cada jogador escaneia o QR do seu lado');
    celular.iniciar();

    ([1, 2] as const).forEach((jogador) => {
      const cx = jogador === 1 ? 320 : 960;
      this.add
        .text(cx, 128, `P${jogador}`, { color: jogador === 1 ? '#38bdf8' : '#f87171', fontFamily: 'monospace', fontSize: '22px' })
        .setOrigin(0.5);
      this.paineis.push(
        new PainelCelular(this, jogador, { x: cx + 20, y: 150, largura: 180, altura: 230, comandos: true })
      );
    });

    GUIA.forEach((linha, i) => {
      this.add
        .text(this.cameras.main.centerX, 592 + i * 24, linha, { color: '#cbd5e1', fontFamily: 'monospace', fontSize: '15px' })
        .setOrigin(0.5);
    });
    this.createFooterHint('Enter: jogar  ·  R: calibrar de novo  ·  Esc: menu  (o teclado continua valendo)');

    void this.mostrarQrs();

    const keyboard = this.input.keyboard;
    keyboard?.on('keydown-ENTER', () => this.scene.start(SCENE_KEYS.ModeSelect));
    keyboard?.on('keydown-SPACE', () => this.scene.start(SCENE_KEYS.ModeSelect));
    keyboard?.on('keydown-R', () => ([1, 2] as const).forEach((j) => celular.jogadores[j].leitor.recalibrar()));
    keyboard?.on('keydown-ESC', () => this.goToMenu());
    keyboard?.on('keydown-BACKSPACE', () => this.goToMenu());

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.paineis.forEach((painel) => painel.destruir());
      this.paineis = [];
    });
  }

  update(): void {
    this.paineis.forEach((painel) => painel.atualizar());
    // Golpe lido aqui fica aqui: não pode vazar para o primeiro quadro da luta.
    celular.input(1);
    celular.input(2);
  }

  private async mostrarQrs(): Promise<void> {
    if (window.location.protocol !== 'https:') {
      this.aviso('A câmera do celular só abre em HTTPS.\nFeche o servidor e rode:  npm run dev:celular');
      return;
    }

    let host = window.location.hostname;
    if (ENDERECOS_LOCAIS.has(host)) {
      try {
        const resposta = await fetch(CAMINHO_INFO);
        const info = (await resposta.json()) as InfoControle;
        if (!info.ips.length) {
          throw new Error('sem IP');
        }
        host = info.ips[0];
        if (info.ips.length > 1) {
          this.add
            .text(this.cameras.main.centerX, 540, `QR não abre no celular? Troque o IP no endereço por: ${info.ips.slice(1).join('  ou  ')}`, {
              color: '#64748b',
              fontFamily: 'monospace',
              fontSize: '12px'
            })
            .setOrigin(0.5);
        }
      } catch {
        this.aviso('Não achei o IP desta máquina na rede.\nConecte o PC no Wi-Fi (ou no roteador do celular) e reabra esta tela.');
        return;
      }
    }

    const porta = window.location.port ? `:${window.location.port}` : '';
    await Promise.all(([1, 2] as const).map((jogador) => this.mostrarQr(jogador, `https://${host}${porta}/controle.html?j=${jogador}`)));
  }

  private async mostrarQr(jogador: Jogador, url: string): Promise<void> {
    const chave = `qr-celular-${jogador}`;
    const cx = jogador === 1 ? 320 : 960;
    const dados = await QRCode.toDataURL(url, { margin: 1, width: 200, color: { dark: '#020617', light: '#f8fafc' } });
    if (!this.scene.isActive()) {
      return;
    }
    if (this.textures.exists(chave)) {
      this.textures.remove(chave);
    }
    this.textures.once(`addtexture-${chave}`, () => {
      if (this.scene.isActive()) {
        this.add.image(cx - 120, 265, chave).setDisplaySize(200, 200);
      }
    });
    this.textures.addBase64(chave, dados);
    this.add
      .text(cx - 120, 375, url.replace('https://', ''), {
        color: '#94a3b8',
        fontFamily: 'monospace',
        fontSize: '11px',
        align: 'center',
        wordWrap: { width: 220, useAdvancedWrap: true }
      })
      .setOrigin(0.5, 0);
  }

  private aviso(texto: string): void {
    this.add
      .text(this.cameras.main.centerX, 290, texto, {
        color: '#fca5a5',
        backgroundColor: '#1f0a0a',
        fontFamily: 'monospace',
        fontSize: '18px',
        align: 'center',
        padding: { x: 16, y: 12 }
      })
      .setOrigin(0.5)
      .setDepth(50);
  }
}
