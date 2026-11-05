import * as Phaser from 'phaser';

import { playAudioCue } from '../game/core/audio';
import { ELENCO_SELECIONAVEL, IDS_SELECIONAVEIS } from '../game/elenco';
import { findCharacterAnimationKeyByAction, type CharacterDefinition } from '../game/hero';
import { COR_DESTAQUE, COR_P1, COR_P2, FONTE_TEXTO, FONTE_TITULO, TEXTO_DESTAQUE } from '../game/estilo';
import { sortearIndice } from '../game/sorteio';
import { criarTorneio } from '../game/torneio';
import { salvarTorneio } from '../game/torneioSalvo';
import { LUTADORES } from '../game/lutadores';
import { escolherRival } from '../game/tutorial/rival';
import { instrucoesLigadas, salvarInstrucoes } from '../game/tutorial/primeiraVez';
import { bustoCrop } from '../game/ui';
import { SCENE_KEYS, type FormatoTorneio, type MatchMode } from '../game/types';
import { BaseScene } from './BaseScene';
import {MapaSelecao} from '../game/mapa/MapaSelecao';
import {corDoEstado,compararOrigem,estadoDoMapa,layoutSelecao} from '../game/mapa/selecaoBrasil';
import {TorcidaSelecao} from '../game/mapa/TorcidaSelecao';

interface CharacterSelectData {
  mode: MatchMode;
  stageId: string;
  /** Escolha do time de um torneio novo: só o jogador escolhe. */
  torneio?: { formato: FormatoTorneio; tamanho: 8 | 16 };
  /** Vindo da pausa da luta: os cursores começam nos mascotes que estavam lutando. */
  atuais?: { p1: string; p2: string };
  /** Tutorial: só o jogador escolhe; a CPU vem com o rival dele (tutorial/rival.ts). */
  tutorial?: true;
}

const P1_COLOR = COR_P1;
const P2_COLOR = COR_P2;
const GOLD = COR_DESTAQUE;
const PREVIEW_BODY_HEIGHT = 220;

const SELECTABLE_ROSTER = [...ELENCO_SELECIONAVEL].sort((a,b)=>compararOrigem(
  LUTADORES.find(l=>l.id===a.id)?.estado,LUTADORES.find(l=>l.id===b.id)?.estado,a.label,b.label,a.id,b.id
));
/** A última casa da grade é o "?": trava num lutador sorteado (João, 31/10/2026). */
const CASA_ALEATORIA = SELECTABLE_ROSTER.length;

interface Tile {
  x: number;
  y: number;
  frame: Phaser.GameObjects.Rectangle;
  portrait: Phaser.GameObjects.Image | Phaser.GameObjects.Text | null;
  flash: Phaser.GameObjects.Rectangle;
}

interface PlayerCursor {
  index: number;
  locked: boolean;
  color: number;
  outline: Phaser.GameObjects.Rectangle;
  tag: Phaser.GameObjects.Text;
  preview: Phaser.GameObjects.Sprite;
  name: Phaser.GameObjects.Text;
  origem: Phaser.GameObjects.Text;
  side: -1 | 1;
}

/**
 * Seleção arcade com globo focado no Brasil: estados e regiões no centro,
 * elenco numa grade inferior e lutadores animados nas laterais.
 * Em 1v1 cada jogador tem o próprio cursor (P1 = WASD, P2 = setas) e
 * os dois não podem parar no mesmo lutador. Em 1vCPU o jogador trava o dele e,
 * com o mesmo direcional, escolhe o adversário da CPU (João, 30/10/2026).
 */
export class CharacterSelectScene extends BaseScene {
  private mode: MatchMode = '1v1';
  private stageId = '';
  private torneio: CharacterSelectData['torneio'] | null = null;
  private atuais: CharacterSelectData['atuais'] | null = null;
  private tutorial = false;
  /** 1x1: a caixinha "Instruções" liga o mini tutorial antes da luta (João, 04/11/2026). */
  private instrucoes = false;
  private caixaInstrucoes: Phaser.GameObjects.Text | null = null;
  private tiles: Tile[] = [];
  private columns = 1;
  private tileSize=72;
  private mapa!:MapaSelecao;
  private torcidaFundo!:TorcidaSelecao;
  private p1!: PlayerCursor;
  private p2!: PlayerCursor;
  private transitioning = false;
  /** Em 1vCPU, a etapa: o lutador do jogador ou o adversário da CPU. */
  private etapa!: Phaser.GameObjects.Text;

  constructor() {
    super(SCENE_KEYS.CharacterSelect);
  }

  init(data: CharacterSelectData): void {
    this.mode = data?.mode ?? '1v1';
    this.stageId = data?.stageId ?? '';
    this.torneio = data?.torneio ?? null;
    this.atuais = data?.atuais ?? null;
    this.tutorial = data?.tutorial ?? false;
  }

  create(): void {
    this.tiles = [];
    this.transitioning = false;

    this.markActiveScene(SCENE_KEYS.CharacterSelect);
    this.torcidaFundo=new TorcidaSelecao(this,this.stageId,this.tela.width,this.tela.height);
    this.createHeading(this.torneio ? 'Escolha seu time' : 'Selecione seu lutador', '');
    const layout=layoutSelecao(this.tela.width,this.tela.height,SELECTABLE_ROSTER.length+1);
    this.mapa=new MapaSelecao(this,layout.mapaX,layout.mapaY);
    this.buildGrid();
    this.p1 = this.createCursor('P1', P1_COLOR, this.casaDe(this.atuais?.p1) ?? 0, -1);
    this.p2 = this.createCursor(
      this.mode === '1v1' ? 'P2' : 'CPU',
      P2_COLOR,
      this.mode === '1v1' ? (this.casaDe(this.atuais?.p2) ?? Math.min(1, this.tiles.length - 1)) : 0,
      1
    );

    if (this.mode === '1vcpu') {
      this.setCursorVisible(this.p2, false);
    }

    this.refreshCursor(this.p1);
    this.refreshCursor(this.p2);
    this.registerInput();

    this.etapa = this.add
      .text(this.tela.centerX, 112, '', { color: colorToCss(P1_COLOR), fontFamily: FONTE_TITULO, fontSize: '22px', stroke: '#000000', strokeThickness: 5 })
      .setOrigin(0.5)
      .setDepth(12);
    this.mostrarEtapa();

    this.montarCaixaInstrucoes();
    this.createFooterHint(
      this.mode === '1v1'
        ? 'P1: WASD + Espaço   •   P2: Setas + Enter   •   Tab instruções   •   Esc volta'
        : 'WASD ou Setas para escolher   •   Enter confirma   •   Esc volta um passo'
    );
  }

  /** Grade centralizada de quadrados com o retrato recortado de cada lutador, e o "?" no fim. */
  private buildGrid(): void {
    const { width, height } = this.tela;
    const roster: (CharacterDefinition | null)[] = [...SELECTABLE_ROSTER, null];
    const layout=layoutSelecao(width,height,roster.length);
    this.columns=layout.colunas;this.tileSize=layout.tamanho;

    roster.forEach((character, index) => {
      const row = Math.floor(index / this.columns);
      const col = index % this.columns;
      // A última linha incompleta fica centralizada, como na grade do MK.
      const inRow = Math.min(this.columns, roster.length - row * this.columns);
      const rowWidth = inRow * this.tileSize + (inRow - 1) * layout.gap;
      const x = width / 2 - rowWidth / 2 + this.tileSize / 2 + col * (this.tileSize + layout.gap);
      const y = layout.primeiroY + row * (this.tileSize + layout.gap);

      this.tiles.push(this.createTile(character, index, x, y));
    });
  }

  private createTile(character: CharacterDefinition | null, index: number, x: number, y: number): Tile {
    const uf=LUTADORES.find(l=>l.id===character?.id)?.estado;
    const cor=corDoEstado(uf);
    const frame = this.add
      .rectangle(x, y, this.tileSize, this.tileSize, 0x101b2b, 1)
      .setStrokeStyle(3, cor, 1)
      .setDepth(5);

    let portrait: Phaser.GameObjects.Image | Phaser.GameObjects.Text | null = null;
    if (!character) {
      portrait = this.add
        .text(x, y, '?', { color: TEXTO_DESTAQUE, fontFamily: FONTE_TITULO, fontSize: '54px', stroke: '#000000', strokeThickness: 8 })
        .setShadow(0, 4, '#f00000', 0, true, true)
        .setOrigin(0.5)
        .setDepth(6);
    } else if (this.textures.exists(character.portrait.key)) {
      portrait = this.add.image(x, y, character.portrait.key).setDepth(6);
      bustoCrop(portrait, this.tileSize - 6, x, y, LUTADORES.find((l) => l.id === character.id)?.rosto);
    }

    const flash = this.add.rectangle(x, y, this.tileSize, this.tileSize, 0xffffff, 0).setDepth(8);
    if(uf)this.add.text(x+this.tileSize/2-3,y+this.tileSize/2-3,uf,{fontFamily:FONTE_TEXTO,fontSize:'11px',fontStyle:'bold',color:colorToCss(cor),stroke:'#000000',strokeThickness:4}).setOrigin(1,1).setDepth(7);

    frame.setInteractive({ useHandCursor: true });
    frame.on('pointerover', () => this.hoverTile(index));
    frame.on('pointerdown', () => this.clickTile(index));

    return { x, y, frame, portrait, flash };
  }

  private createCursor(label: string, color: number, index: number, side: -1 | 1): PlayerCursor {
    const { width, height } = this.tela;
    const previewX = side === -1 ? width * 0.13 : width * 0.87;
    const floorY = layoutSelecao(width,height,SELECTABLE_ROSTER.length+1).previewY;

    this.add.ellipse(previewX, floorY, 170, 26, 0x000000, 0.5).setDepth(2);

    const preview = this.add.sprite(previewX, floorY, '__DEFAULT').setDepth(3);
    // Os sprites olham para a esquerda; o da esquerda vira para o centro.
    preview.setFlipX(side === -1);

    const name = this.add
      .text(previewX, floorY + 14, '', {
        color: colorToCss(color),
        fontFamily: FONTE_TITULO,
        fontSize: '27px',
        stroke: '#000000',
        strokeThickness: 6
      })
      .setOrigin(0.5, 0)
      .setDepth(4);

    const outline = this.add
      .rectangle(0, 0, this.tileSize + 4, this.tileSize + 4, color, 0)
      .setStrokeStyle(5, color, 1)
      .setDepth(10);

    const tag = this.add
      .text(0, 0, label, {
        color: '#05030a',
        backgroundColor: colorToCss(color),
        fontFamily: FONTE_TEXTO,
        fontSize: '15px',
        fontStyle: 'bold',
        padding: { x: 6, y: 2 }
      })
      .setOrigin(side === -1 ? 0 : 1, 0)
      .setDepth(11);

    const origem=this.add.text(previewX,floorY+46,'',{fontFamily:FONTE_TEXTO,fontSize:'14px',color:'#dbcfad',align:'center',stroke:'#050a18',strokeThickness:3}).setOrigin(.5,0).setDepth(4);
    return { index, locked: false, color, outline, tag, preview, name, origem, side };
  }

  private setCursorVisible(cursor: PlayerCursor, visible: boolean): void {
    cursor.outline.setVisible(visible);
    cursor.tag.setVisible(visible);
    cursor.preview.setVisible(visible);
    cursor.name.setText(visible ? cursor.name.text : '?');
    cursor.origem.setVisible(visible);
    this.atualizarMapa();
  }

  private refreshCursor(cursor: PlayerCursor): void {
    const tile = this.tiles[cursor.index];
    if (!tile) {
      return;
    }

    const half = this.tileSize / 2;
    cursor.outline.setPosition(tile.x, tile.y);
    cursor.outline.setStrokeStyle(cursor.locked ? 7 : 5, cursor.locked ? GOLD : cursor.color, 1);
    cursor.tag.setPosition(cursor.side === -1 ? tile.x - half - 2 : tile.x + half + 2, tile.y - half - 22);

    this.tiles.forEach((candidate, index) => {
      const chosen = index === this.p1?.index || (index === this.p2?.index && this.p2.outline.visible);
      candidate.portrait?.setAlpha(chosen ? 1 : 0.55);
    });

    if (cursor.outline.visible) {
      this.showPreview(cursor);
    }
    this.atualizarMapa();
  }

  private atualizarMapa():void {
    if(!this.p1 || !this.p2)return;
    this.mapa.marcar([this.p1,this.p2].map((cursor,i)=>({
      uf:LUTADORES.find(l=>l.id===SELECTABLE_ROSTER[cursor.index]?.id)?.estado,
      cor:cursor.color,nome:i===0?'P1':this.mode==='1vcpu'?'CPU':'P2',visivel:cursor.outline.visible
    })));
    this.torcidaFundo.atualizar(SELECTABLE_ROSTER[this.p1.index]?.id,
      this.p2.outline.visible?SELECTABLE_ROSTER[this.p2.index]?.id:undefined);
  }

  /** Mostra o lutador do cursor parado em guarda, na escala da lateral. */
  private showPreview(cursor: PlayerCursor, action = 'idle'): void {
    const character = SELECTABLE_ROSTER[cursor.index];
    // No "?" ninguém aparece na lateral até o sorteio.
    cursor.preview.setVisible(Boolean(character));
    if (!character) {
      cursor.name.setText('?');
      cursor.origem.setText('SORTEIO · BRASIL');
      return;
    }
    const estado=estadoDoMapa(LUTADORES.find(l=>l.id===character.id)?.estado);
    cursor.origem.setText(estado?`${estado.nome.toUpperCase()} · ${estado.uf}`:'BRASIL');
    const key = findCharacterAnimationKeyByAction(character.id, action);
    const idleKey = findCharacterAnimationKeyByAction(character.id, 'idle');
    const base=character.animations.find((animation) => animation.key === idleKey);
    const visual = base?.bounds[0]?.visual;

    cursor.preview.setOrigin(0.5,visual && base?(visual.y+visual.height)/base.sheet.frameHeight:character.anchor.y);
    cursor.preview.setScale(visual && visual.height > 0 ? PREVIEW_BODY_HEIGHT / visual.height : 1);
    cursor.name.setText(character.label.toUpperCase());
    cursor.name.setScale(Math.min(1,(this.tela.width*.25-24)/Math.max(1,cursor.name.width)));

    if (!key) {
      return;
    }

    cursor.preview.play({ key, repeat: action === 'idle' ? -1 : 0 });
    if (action !== 'idle' && idleKey) {
      cursor.preview.once(`animationcomplete-${key}`, () => cursor.preview.play({ key: idleKey, repeat: -1 }));
    }
  }

  private registerInput(): void {
    const keyboard = this.input.keyboard;
    if (!keyboard) {
      return;
    }

    if (this.mode === '1v1') {
      keyboard.on('keydown-A', () => this.movePlayer(this.p1, -1, 0));
      keyboard.on('keydown-D', () => this.movePlayer(this.p1, 1, 0));
      keyboard.on('keydown-W', () => this.movePlayer(this.p1, 0, -1));
      keyboard.on('keydown-S', () => this.movePlayer(this.p1, 0, 1));
      // P2: O K L Ç (o padrão da luta) ou as setas; Enter ou Shift direito confirmam.
      const p2 = (keys: string[], dx: number, dy: number): void =>
        keys.forEach((key) => keyboard.on(`keydown-${key}`, () => this.movePlayer(this.p2, dx, dy)));
      p2(['LEFT', 'K'], -1, 0);
      p2(['RIGHT', 'SEMICOLON'], 1, 0);
      p2(['UP', 'O'], 0, -1);
      p2(['DOWN', 'L'], 0, 1);
      keyboard.on('keydown-SHIFT', (event: KeyboardEvent) => {
        if (event.location === 2) this.confirmPlayer(this.p2);
      });
      keyboard.on('keydown-SPACE', () => this.confirmPlayer(this.p1));
      keyboard.on('keydown-F', () => this.confirmPlayer(this.p1));
      keyboard.on('keydown-ENTER', () => this.confirmPlayer(this.p2));
    } else {
      // Um direcional só: primeiro escolhe o próprio lutador, depois o da CPU.
      const bind = (keys: string[], dx: number, dy: number): void =>
        keys.forEach((key) => keyboard.on(`keydown-${key}`, () => this.movePlayer(this.cursorDaVez(), dx, dy)));
      bind(['A', 'LEFT'], -1, 0);
      bind(['D', 'RIGHT'], 1, 0);
      bind(['W', 'UP'], 0, -1);
      bind(['S', 'DOWN'], 0, 1);
      keyboard.on('keydown-SPACE', () => this.confirmPlayer(this.cursorDaVez()));
      keyboard.on('keydown-F', () => this.confirmPlayer(this.cursorDaVez()));
      keyboard.on('keydown-ENTER', () => this.confirmPlayer(this.cursorDaVez()));
    }

    keyboard.on('keydown-ESC', () => this.goBack());
    keyboard.on('keydown-BACKSPACE', () => this.goBack());
  }

  /**
   * Anda um passo na grade. Na horizontal dá a volta na linha; na vertical,
   * se a linha de destino for mais curta, para no último quadro dela. Em 1v1
   * o cursor pula o quadro do outro jogador; sem saída, não anda.
   */
  private movePlayer(cursor: PlayerCursor, dx: number, dy: number): void {
    if (this.transitioning || cursor.locked) {
      return;
    }

    // Ninguém para no lutador do outro (em 1vCPU, a CPU não repete o do jogador); no "?" cabem os dois.
    const blocked = this.lutadorBloqueado(cursor);
    let next = this.step(cursor.index, dx, dy);
    if (next === blocked) {
      next = this.step(next, dx, dy);
    }
    if (next === cursor.index || next === blocked) {
      return;
    }

    cursor.index = next;
    this.refreshCursor(cursor);
    playAudioCue(this, 'ui-mover', this.app.settingsStore.getState());
  }

  private step(index: number, dx: number, dy: number): number {
    const count = this.tiles.length;
    if (dx !== 0) {
      return Phaser.Math.Wrap(index + dx, 0, count);
    }

    const rows = Math.ceil(count / this.columns);
    const row = Phaser.Math.Wrap(Math.floor(index / this.columns) + dy, 0, rows);
    const col = index % this.columns;
    return Math.min(row * this.columns + col, count - 1);
  }

  private otherCursor(cursor: PlayerCursor): PlayerCursor {
    return cursor === this.p1 ? this.p2 : this.p1;
  }

  /** O lutador em que este cursor não pode parar nem cair no sorteio (-1 se nenhum). */
  private lutadorBloqueado(cursor: PlayerCursor): number {
    const outro = this.otherCursor(cursor).index;
    const proibido = this.mode === '1v1' || cursor === this.p2;
    return proibido && outro !== CASA_ALEATORIA ? outro : -1;
  }

  /** Em 1vCPU: o cursor do jogador até ele travar, depois o da CPU. */
  private cursorDaVez(): PlayerCursor {
    return this.mode === '1vcpu' && this.p1.locked ? this.p2 : this.p1;
  }

  private mostrarEtapa(): void {
    if (this.mode !== '1vcpu') {
      this.etapa.setVisible(false);
      return;
    }
    const cpu = this.p1.locked && !this.torneio;
    const rival = this.tutorial && this.p2.locked ? `Seu rival: ${SELECTABLE_ROSTER[this.p2.index].label}` : null;
    this.etapa.setText(rival ?? (this.torneio ? 'Os adversários saem no sorteio' : this.tutorial ? 'Tutorial: escolha o seu lutador' : cpu ? 'Agora escolha o adversário (CPU)' : 'Escolha o seu lutador')).setColor(colorToCss(cpu ? P2_COLOR : P1_COLOR));
  }

  private hoverTile(index: number): void {
    const cursor = this.cursorDaVez();
    if (this.transitioning || this.mode !== '1vcpu' || cursor.locked || cursor.index === index || index === this.lutadorBloqueado(cursor)) {
      return;
    }

    cursor.index = index;
    this.refreshCursor(cursor);
  }

  private clickTile(index: number): void {
    const cursor = this.cursorDaVez();
    if (this.transitioning || this.mode !== '1vcpu' || index === this.lutadorBloqueado(cursor)) {
      return;
    }

    cursor.index = index;
    this.refreshCursor(cursor);
    this.confirmPlayer(cursor);
  }

  /**
   * Trava a escolha: borda dourada, piscada no quadro e o lutador da lateral
   * solta um soco. Em 1v1 a luta começa quando os dois travam; em 1vCPU,
   * travar o jogador abre a escolha do adversário, e travar este começa a luta.
   */
  private confirmPlayer(cursor: PlayerCursor): void {
    if (this.transitioning || cursor.locked) {
      return;
    }

    if (cursor.index === CASA_ALEATORIA) {
      const bloqueado = this.lutadorBloqueado(cursor);
      cursor.index = sortearIndice(SELECTABLE_ROSTER.length, bloqueado >= 0 ? [bloqueado] : []);
    }
    cursor.locked = true;
    this.refreshCursor(cursor);
    this.showPreview(cursor, 'light-punch');
    playAudioCue(this, 'ui-travar', this.app.settingsStore.getState());

    if (this.mode === '1vcpu' && cursor === this.p1 && this.tutorial) {
      this.travarRival();
    } else if (this.mode === '1vcpu' && cursor === this.p1 && !this.torneio) {
      this.abrirEscolhaDaCpu();
    }

    this.flashTile(cursor.index, () => {
      if (this.torneio) {
        this.time.delayedCall(250, () => this.comecarTorneio());
        return;
      }
      if (this.tutorial) {
        // Dá tempo de ver quem é o rival antes da luta.
        this.time.delayedCall(1100, () => this.startMatch());
        return;
      }
      if (this.mode === '1vcpu') {
        if (cursor === this.p2) this.time.delayedCall(250, () => this.startMatch());
        return;
      }

      if (this.p1.locked && this.p2.locked) {
        this.startMatch();
      }
    });
  }

  private flashTile(index: number, onComplete: () => void): void {
    this.tweens.add({
      targets: this.tiles[index].flash,
      alpha: { from: 0, to: 0.8 },
      duration: 80,
      yoyo: true,
      repeat: 2,
      onComplete
    });
  }

  /** Casa da grade de um mascote, ou null se ele não está na seleção. */
  private casaDe(id: string | undefined): number | null {
    const indice = SELECTABLE_ROSTER.findIndex((lutador) => lutador.id === id);
    return indice >= 0 ? indice : null;
  }

  /**
   * O cursor da CPU aparece no adversário da luta anterior (vindo da pausa) ou
   * no primeiro lutador livre, e passa a andar com o direcional.
   */
  private abrirEscolhaDaCpu(): void {
    const anterior = this.casaDe(this.atuais?.p2);
    const livre = anterior !== null && anterior !== this.p1.index ? anterior : this.tiles.findIndex((_, index) => index !== this.p1.index);
    this.p2.index = livre >= 0 ? livre : this.p1.index;
    this.p2.locked = false;
    this.setCursorVisible(this.p2, true);
    this.refreshCursor(this.p2);
    this.mostrarEtapa();
  }

  /** Tutorial: a CPU trava sozinha no rival do mascote do jogador. */
  private travarRival(): void {
    const elenco = SELECTABLE_ROSTER.map(({ id }) => {
      const json = LUTADORES.find((lutador) => lutador.id === id);
      return { id, estado: json?.estado, rival: json?.rival };
    });
    const rival = escolherRival(SELECTABLE_ROSTER[this.p1.index].id, elenco);
    this.p2.index = this.casaDe(rival) ?? this.p1.index;
    this.p2.locked = true;
    this.setCursorVisible(this.p2, true);
    this.refreshCursor(this.p2);
    this.showPreview(this.p2, 'light-punch');
    this.mostrarEtapa();
  }

  /** A caixinha "Instruções", só no 1x1: clique ou Tab liga e desliga, e fica lembrada. */
  private montarCaixaInstrucoes(): void {
    this.caixaInstrucoes = null;
    if (this.mode !== '1v1' || this.torneio) return;
    this.instrucoes = instrucoesLigadas();
    const { centerX, height } = this.tela;
    const caixa = this.add
      .text(centerX, height - 66, '', { color: TEXTO_DESTAQUE, fontFamily: FONTE_TEXTO, fontSize: '22px', fontStyle: 'bold', backgroundColor: 'rgba(11, 7, 22, 0.85)', padding: { x: 14, y: 6 } })
      .setOrigin(0.5)
      .setDepth(12)
      .setInteractive({ useHandCursor: true });
    this.caixaInstrucoes = caixa;
    const alternar = (): void => {
      if (this.transitioning) return;
      this.instrucoes = !this.instrucoes;
      salvarInstrucoes(this.instrucoes);
      this.desenharCaixaInstrucoes();
    };
    caixa.on('pointerdown', alternar);
    this.input.keyboard?.addCapture('TAB');
    this.input.keyboard?.on('keydown-TAB', alternar);
    this.desenharCaixaInstrucoes();
  }

  private desenharCaixaInstrucoes(): void {
    this.caixaInstrucoes?.setText(`${this.instrucoes ? '☑' : '☐'}  Instruções`);
  }

  private startMatch(): void {
    if (this.transitioning) {
      return;
    }

    this.transitioning = true;

    this.scene.start(SCENE_KEYS.Match, {
      mode: this.mode,
      stageId: this.stageId,
      p1CharacterId: SELECTABLE_ROSTER[this.p1.index].id,
      p2CharacterId: SELECTABLE_ROSTER[this.p2.index].id,
      ...(this.tutorial ? { treino: true, tutorial: true } : {}),
      ...(this.mode === '1v1' && this.instrucoes ? { treino: true, instrucoes: true } : {})
    });
  }

  /** Sorteia os outros times com a dificuldade escolhida, salva e abre o chaveamento ou a tabela. */
  private comecarTorneio(): void {
    if (this.transitioning || !this.torneio) {
      return;
    }
    this.transitioning = true;
    const { formato, tamanho } = this.torneio;
    const jogador = SELECTABLE_ROSTER[this.p1.index].id;
    salvarTorneio(criarTorneio(formato, tamanho, jogador, IDS_SELECIONAVEIS, this.app.settingsStore.getState().cpuDificuldade));
    this.scene.start(SCENE_KEYS.TorneioQuadro);
  }

  private goBack(): void {
    if (this.transitioning) {
      return;
    }
    if (this.torneio) {
      this.scene.start(SCENE_KEYS.Dificuldade, { destino: 'torneio', ...this.torneio });
      return;
    }
    if (this.tutorial) {
      this.scene.start(SCENE_KEYS.MainMenu);
      return;
    }
    // Escolhendo o adversário: Esc destrava o próprio lutador em vez de sair.
    if (this.mode === '1vcpu' && this.p1.locked && !this.p2.locked) {
      this.p1.locked = false;
      this.setCursorVisible(this.p2, false);
      this.refreshCursor(this.p1);
      this.refreshCursor(this.p2);
      this.mostrarEtapa();
      return;
    }

    this.scene.start(SCENE_KEYS.LevelSelect, { mode: this.mode });
  }
}

/**
 * Converte uma cor 0xRRGGBB em string CSS.
 * @param color - A cor como 0xRRGGBB.
 */
function colorToCss(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}
