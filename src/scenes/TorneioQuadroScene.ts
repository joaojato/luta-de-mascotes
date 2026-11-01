import * as Phaser from 'phaser';

import { AUDIO_KEYS, playAudioCue } from '../game/core/audio';
import { IDS_SELECIONAVEIS } from '../game/elenco';
import { COR_BORDA, COR_P1, COR_PAINEL, FONTE_TEXTO, FONTE_TITULO, TEXTO_APAGADO, TEXTO_CLARO, TEXTO_DESTAQUE } from '../game/estilo';
import { getCharacterDefinition } from '../game/hero';
import { lutaDoJogador, nomeDaRodada, situacao, tabela, vencedor, type Situacao, type Torneio } from '../game/torneio';
import { apagarTorneio, carregarTorneio } from '../game/torneioSalvo';
import { coverCrop, createTextButton, type TextButton } from '../game/ui';
import { SCENE_KEYS } from '../game/types';
import { BaseScene } from './BaseScene';

const COR_JOGADOR_CSS = `#${COR_P1.toString(16).padStart(6, '0')}`;

/**
 * Entre uma luta e outra do torneio: o chaveamento (mata-mata) ou a tabela
 * (pontos corridos), com o caminho do jogador em destaque e a próxima luta.
 * No fim, a tela de campeão, de eliminado ou da posição final. Lê sempre o
 * torneio salvo no navegador (torneioSalvo.ts).
 */
export class TorneioQuadroScene extends BaseScene {
  private torneio!: Torneio;
  private botoes: TextButton[] = [];

  constructor() {
    super(SCENE_KEYS.TorneioQuadro);
  }

  create(): void {
    this.botoes = [];
    const salvo = carregarTorneio(IDS_SELECIONAVEIS);
    if (!salvo) {
      this.goToMenu();
      return;
    }
    this.torneio = salvo;
    const fim = situacao(salvo);

    this.markActiveScene(SCENE_KEYS.TorneioQuadro);
    this.createBackdrop();
    this.createHeading(
      salvo.formato === 'mata-mata' ? 'Mata-mata' : 'Pontos corridos',
      fim.tipo === 'em-andamento' ? nomeDaRodada(salvo, salvo.rodadaAtual) : 'Fim do torneio'
    );

    if (salvo.formato === 'mata-mata') this.desenharChave();
    else this.desenharTabela();

    if (fim.tipo === 'em-andamento') this.mostrarProximaLuta();
    else this.mostrarFim(fim);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.botoes.forEach((botao) => botao.destroy());
      this.botoes = [];
    });
  }

  /** Colunas por rodada, cada luta alimentando a de cima; a última coluna é o campeão. */
  private desenharChave(): void {
    const t = this.torneio;
    const rodadas = Math.log2(t.tamanho);
    const colunas = rodadas + 1;
    const { width } = this.cameras.main;
    const margem = 50;
    const largura = Math.min(220, (width - margem * 2) / colunas - 20);
    const topo = 125;
    const altura = 470;
    const caixa = Math.min(46, (altura / t.tamanho) * 0.82);

    let ys = Array.from({ length: t.tamanho }, (_, i) => topo + (i + 0.5) * (altura / t.tamanho));
    for (let r = 0; r <= rodadas; r += 1) {
      const x = margem + largura / 2 + r * ((width - margem * 2 - largura) / rodadas);
      const rodada = t.rodadas[r];
      const anterior = t.rodadas[r - 1];
      ys.forEach((y, slot) => {
        let time: string | null = null;
        let placar: number | null = null;
        let perdeu = false;
        if (rodada) {
          const luta = rodada[Math.floor(slot / 2)];
          time = slot % 2 === 0 ? luta.a : luta.b;
          if (luta.placar) {
            placar = luta.placar[slot % 2];
            perdeu = vencedor(luta) !== time;
          }
        } else if (r === rodadas && anterior?.[0]?.placar) {
          time = vencedor(anterior[0]);
        }
        if (r === rodadas) {
          this.add.text(x, y - caixa / 2 - 18, 'CAMPEÃO', { color: TEXTO_DESTAQUE, fontFamily: FONTE_TITULO, fontSize: '18px' }).setOrigin(0.5);
        }
        this.caixaDeTime(x, y, largura, caixa, time, placar, perdeu);
      });
      ys = ys.reduce<number[]>((pares, y, i) => (i % 2 === 1 ? [...pares, (ys[i - 1] + y) / 2] : pares), []);
    }
  }

  private caixaDeTime(x: number, y: number, largura: number, altura: number, time: string | null, placar: number | null, perdeu: boolean): void {
    const jogador = time === this.torneio.jogador;
    this.add
      .rectangle(x, y, largura, altura, COR_PAINEL, 0.9)
      .setStrokeStyle(jogador ? 4 : 2, jogador ? COR_P1 : COR_BORDA, 1)
      .setAlpha(perdeu ? 0.45 : 1);
    if (!time) {
      this.add.text(x, y, '?', { color: TEXTO_APAGADO, fontFamily: FONTE_TITULO, fontSize: `${Math.round(altura * 0.6)}px` }).setOrigin(0.5);
      return;
    }
    const lutador = getCharacterDefinition(time);
    const lado = altura - 6;
    const xRetrato = x - largura / 2 + 3 + lado / 2;
    if (this.textures.exists(lutador.portrait.key)) {
      coverCrop(this.add.image(xRetrato, y, lutador.portrait.key).setAlpha(perdeu ? 0.45 : 1), lado, xRetrato, y);
    }
    this.add
      .text(xRetrato + lado / 2 + 8, y, lutador.label.toUpperCase(), {
        color: jogador ? COR_JOGADOR_CSS : TEXTO_CLARO,
        fontFamily: FONTE_TITULO,
        fontSize: `${Math.round(Math.min(22, altura * 0.48))}px`
      })
      .setOrigin(0, 0.5)
      .setAlpha(perdeu ? 0.45 : 1);
    if (placar !== null) {
      this.add
        .text(x + largura / 2 - 10, y, String(placar), { color: TEXTO_DESTAQUE, fontFamily: FONTE_TITULO, fontSize: `${Math.round(Math.min(26, altura * 0.55))}px` })
        .setOrigin(1, 0.5);
    }
  }

  /** Tabela à esquerda; à direita, os resultados da última rodada jogada. */
  private desenharTabela(): void {
    const t = this.torneio;
    const linhas = tabela(t);
    const topo = 130;
    const alturaLinha = Math.min(50, 450 / linhas.length);
    const fonte = `${Math.round(Math.min(22, alturaLinha * 0.5))}px`;
    const colunas: [string, number][] = [['P', 520], ['J', 575], ['V', 625], ['D', 675], ['SR', 735]];
    const cabecalho = { color: TEXTO_APAGADO, fontFamily: FONTE_TEXTO, fontSize: '15px', fontStyle: 'bold' };
    colunas.forEach(([nome, x]) => this.add.text(x, topo, nome, cabecalho).setOrigin(0.5));

    linhas.forEach((linha, i) => {
      const y = topo + 30 + i * alturaLinha;
      const jogador = linha.time === t.jogador;
      this.add
        .rectangle(430, y, 720, alturaLinha - 4, COR_PAINEL, 0.88)
        .setStrokeStyle(jogador ? 3 : 1, jogador ? COR_P1 : COR_BORDA, 1);
      const estilo = { color: jogador ? COR_JOGADOR_CSS : TEXTO_CLARO, fontFamily: FONTE_TITULO, fontSize: fonte };
      this.add.text(95, y, `${i + 1}º`, estilo).setOrigin(0.5);
      const lutador = getCharacterDefinition(linha.time);
      const lado = alturaLinha - 10;
      if (this.textures.exists(lutador.portrait.key)) coverCrop(this.add.image(140, y, lutador.portrait.key), lado, 140, y);
      this.add.text(140 + lado / 2 + 10, y, lutador.label.toUpperCase(), estilo).setOrigin(0, 0.5);
      const saldo = linha.roundsPro - linha.roundsContra;
      const valores = [linha.pontos, linha.lutas, linha.vitorias, linha.derrotas, saldo > 0 ? `+${saldo}` : saldo];
      colunas.forEach(([, x], c) => this.add.text(x, y, String(valores[c]), { ...estilo, color: c === 0 ? TEXTO_DESTAQUE : estilo.color }).setOrigin(0.5));
    });

    const ultima = t.rodadas[t.rodadaAtual - 1];
    if (!ultima) return;
    const x = 1010;
    this.add.text(x, topo, `${nomeDaRodada(t, t.rodadaAtual - 1).toUpperCase()}`, { color: TEXTO_DESTAQUE, fontFamily: FONTE_TITULO, fontSize: '20px' }).setOrigin(0.5);
    ultima.forEach((luta, i) => {
      const [a, b] = luta.placar ?? [0, 0];
      const doJogador = luta.a === t.jogador || luta.b === t.jogador;
      this.add
        .text(x, topo + 40 + i * 34, `${getCharacterDefinition(luta.a).label}  ${a} x ${b}  ${getCharacterDefinition(luta.b).label}`, {
          color: doJogador ? COR_JOGADOR_CSS : TEXTO_CLARO,
          fontFamily: FONTE_TEXTO,
          fontSize: '17px',
          fontStyle: 'bold'
        })
        .setOrigin(0.5);
    });
  }

  private mostrarProximaLuta(): void {
    const luta = lutaDoJogador(this.torneio)!;
    const adversario = luta.a === this.torneio.jogador ? luta.b : luta.a;
    const { centerX, height } = this.cameras.main;
    this.add
      .text(centerX, height - 112, `${getCharacterDefinition(this.torneio.jogador).label.toUpperCase()}  x  ${getCharacterDefinition(adversario).label.toUpperCase()}`, {
        color: TEXTO_DESTAQUE,
        fontFamily: FONTE_TITULO,
        fontSize: '30px',
        stroke: '#000000',
        strokeThickness: 6
      })
      .setOrigin(0.5);
    const jogar = (): void => {
      playAudioCue(this, AUDIO_KEYS.uiConfirm, this.app.settingsStore.getState());
      this.scene.start(SCENE_KEYS.Match, {
        mode: '1vcpu',
        stageId: 'estadio',
        p1CharacterId: this.torneio.jogador,
        p2CharacterId: adversario,
        torneio: true
      });
    };
    const botao = createTextButton(this, { x: centerX, y: height - 58, width: 320, height: 54, label: 'Jogar  (Enter)', onClick: jogar });
    botao.setSelected(true);
    this.botoes.push(botao);
    this.teclas(jogar);
  }

  /** O torneio acabou para o jogador: resultado, e o salvo some. */
  private mostrarFim(fim: Situacao): void {
    apagarTorneio();
    const { centerX, height } = this.cameras.main;
    const texto = textoDoFim(fim);
    if (fim.tipo === 'campeao' && this.textures.exists('trofeu')) {
      this.add.image(centerX - 250, height - 105, 'trofeu').setDisplaySize(90, 90);
    }
    this.add
      .text(centerX, height - 112, texto, {
        color: TEXTO_DESTAQUE,
        fontFamily: FONTE_TITULO,
        fontSize: '42px',
        stroke: '#000000',
        strokeThickness: 7
      })
      .setShadow(0, 5, '#f00000', 0, true, true)
      .setOrigin(0.5);
    const deNovo = (): void => {
      playAudioCue(this, AUDIO_KEYS.uiConfirm, this.app.settingsStore.getState());
      this.scene.start(SCENE_KEYS.CharacterSelect, {
        mode: '1vcpu',
        stageId: 'estadio',
        torneio: { formato: this.torneio.formato, tamanho: this.torneio.tamanho }
      });
    };
    const botao = createTextButton(this, { x: centerX - 170, y: height - 52, width: 300, height: 50, label: 'Jogar de novo  (Enter)', onClick: deNovo });
    botao.setSelected(true);
    this.botoes.push(botao);
    this.botoes.push(createTextButton(this, { x: centerX + 170, y: height - 52, width: 300, height: 50, label: 'Menu  (Esc)', onClick: () => this.goToMenu() }));
    this.teclas(deNovo);
  }

  private teclas(confirmar: () => void): void {
    const keyboard = this.input.keyboard;
    if (!keyboard) return;
    keyboard.on('keydown-ENTER', confirmar);
    keyboard.on('keydown-SPACE', confirmar);
    keyboard.on('keydown-ESC', () => this.goToMenu());
    keyboard.on('keydown-BACKSPACE', () => this.goToMenu());
  }
}

const QUEDA: Record<string, string> = {
  Oitavas: 'ELIMINADO NAS OITAVAS',
  Quartas: 'ELIMINADO NAS QUARTAS',
  Semifinal: 'ELIMINADO NA SEMIFINAL',
  Final: 'VICE-CAMPEÃO'
};

function textoDoFim(fim: Situacao): string {
  if (fim.tipo === 'campeao') return 'CAMPEÃO!';
  if (fim.tipo === 'eliminado') return QUEDA[fim.fase] ?? 'ELIMINADO';
  if (fim.tipo === 'posicao') return `TERMINOU EM ${fim.posicao}º`;
  return '';
}
