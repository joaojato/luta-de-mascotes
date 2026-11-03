import * as Phaser from 'phaser';

import { FIGHTING_UI_ATLAS_TEXTURE_KEY, getFightingUiAtlasFrame } from './fightingUiAtlas';
import { getCharacterDefinition } from './hero';
import { proximaSombra, type Sombra } from './sombraDaVida';
import { FONTE_TEXTO, FONTE_TITULO } from './estilo';
import { telaDe } from './nitidez';
import type { MatchMode } from './types';
import { HEALTH_WARN, HEALTH_DANGER } from './vidaFaixas';
import { agirNoPutometro, derrotaNoPutometro, faixaPutometro, novoPutometro, vidaNoPutometro, type AcaoDaTorcida } from './putometro';
import { PutometroVisual } from './putometroVisual';

const KEY = FIGHTING_UI_ATLAS_TEXTURE_KEY;

// Display sizing (screen pixels) for each atlas element.
const MARGEM = 20;
const TOP = 16;
const PORTRAIT_DISP = 96;
const HEALTH_DISP_W = 468;
const HEALTH_DISP_H = 88;
const NAME_DISP_W = 300;
const NAME_DISP_H = 33;
const TIMER_DISP_W = 96;
const TIMER_DISP_H = 94;
const PIP_DISP_H = 20;

// Special-meter bar (drawn below the win pips).
const METER_DISP_W = 280;
const METER_DISP_H = 12;
const METER_TRACK_COLOR = 0x0b1120;
const METER_FILL_COLOR = 0x38bdf8;
const METER_READY_COLOR = 0xfacc15;
// Cronômetro da `forma` (o maromba): ocupa a barra do especial, que fica vazia.
const FORMA_COLOR = 0xf97316;

// Health colour thresholds (fraction of max).
// Sombra do dano: o pedaço claro do que acabou de sair da barra.
const SOMBRA_COLOR = 0xfff1d6;
const SOMBRA_ALPHA = 0.9;

// Celular: o menu (40 px de tela no canto) pede uns 90 px de jogo de folga.
const MARGEM_COM_MENU = 92;
// Folga mínima entre cada barra de vida e o relógio.
const FOLGA_DO_RELOGIO = 8;

/**
 * HUD com o menu do celular no canto: margem larga dos dois lados e, se a tela
 * não comporta (16:9), o HUD inteiro encolhe até caber em vez de ficar por
 * baixo do botão. Devolve a largura em que o HUD é montado e a escala dele.
 * @param camWidth - Largura da câmera.
 */
export function encaixeComMenu(camWidth: number): { largura: number; escala: number } {
  const necessario = 2 * (MARGEM_COM_MENU + PORTRAIT_DISP + 6 + HEALTH_DISP_W) + TIMER_DISP_W + 2 * FOLGA_DO_RELOGIO;
  const escala = Math.min(1, camWidth / necessario);
  return { largura: camWidth / escala, escala };
}

// How far above its resting position the HUD starts before the intro slide.
const SLIDE_OFFSET = 170;

/** Geometry of a health-fill region in screen space, plus its drain anchor. */
interface FillGeometry {
  anchorX: number;
  topY: number;
  width: number;
  height: number;
  originX: 0 | 1;
}

/** Geometry of a special-meter fill region in screen space. */
interface MeterGeometry {
  anchorX: number;
  topY: number;
  width: number;
  height: number;
  originX: 0 | 1;
}

/** O cronômetro de uma `forma` como o lutador entrega (Fighter.formaHud). */
export interface FormaHud {
  fracao: number;
  segundos: number;
  piscando: boolean;
  rotulo: string;
}

export interface MatchHudConfig {
  mode: MatchMode;
  p1CharacterId: string;
  p2CharacterId: string;
  roundsToWin: number;
  depth: number;
  /** Abre espaço nos cantos de cima para o menu do celular (docs/mobile.md). */
  espacoParaMenu?: boolean;
}

/**
 * The in-match heads-up display built from the fighting UI atlas: portrait
 * frames, color-coded health bars, a centre timer, name plates, and round-win
 * pips. The whole HUD slides in and the health bars fill on round start; bars
 * recolor (green/yellow/red) and blink when low.
 */
export class MatchHud {
  private readonly scene: Phaser.Scene;
  private readonly config: MatchHudConfig;
  private readonly root: Phaser.GameObjects.Container;

  private p1Fill!: Phaser.GameObjects.Image;
  private p2Fill!: Phaser.GameObjects.Image;
  private p1FillGeom!: FillGeometry;
  private p2FillGeom!: FillGeometry;
  private timerText!: Phaser.GameObjects.Text;
  private p1Pips: Phaser.GameObjects.Image[] = [];
  private p2Pips: Phaser.GameObjects.Image[] = [];

  private p1Meter!: Phaser.GameObjects.Rectangle;
  private p2Meter!: Phaser.GameObjects.Rectangle;
  private p1MeterGeom!: MeterGeometry;
  private p2MeterGeom!: MeterGeometry;
  private p1FormaText!: Phaser.GameObjects.Text;
  private p2FormaText!: Phaser.GameObjects.Text;
  private p1MeterReady = false;
  private p2MeterReady = false;
  private p1MeterGlow: Phaser.Tweens.Tween | null = null;
  private p2MeterGlow: Phaser.Tweens.Tween | null = null;

  private p1Frac = 1;
  private p2Frac = 1;
  private putometro=novoPutometro();
  private medidoresTorcida:PutometroVisual[]=[];
  private brilhoCantos!:Phaser.GameObjects.Graphics;
  private readonly vidaTorcida=(p1:number,p2:number):void=>{
    vidaNoPutometro(this.putometro,p1,p2);this.atualizarTorcida();
  };
  private readonly acaoTorcida=(lado:0|1,acao:AcaoDaTorcida,dano:number):void=>{
    agirNoPutometro(this.putometro,lado,acao,dano);this.atualizarTorcida();
  };
  private readonly derrotaTorcida=(lado:0|1,decisiva:boolean,vidaVencedor=1):void=>{
    derrotaNoPutometro(this.putometro,lado,decisiva,vidaVencedor);this.atualizarTorcida();
  };
  private readonly reinicioTorcida=():void=>{
    this.putometro=novoPutometro();this.atualizarTorcida();
  };
  /** Sombra do dano de cada lado (src/game/sombraDaVida.ts). */
  private p1Sombra!: Phaser.GameObjects.Rectangle;
  private p2Sombra!: Phaser.GameObjects.Rectangle;
  private sombras: Record<'left' | 'right', Sombra & { vidaAntes: number }> = {
    left: { fracao: 1, msParada: 0, vidaAntes: 1 },
    right: { fracao: 1, msParada: 0, vidaAntes: 1 }
  };
  /** `150/150` dentro de cada barra, ligado em Exibição (src/game/exibicao.ts). */
  private p1Pontos!: Phaser.GameObjects.Text;
  private p2Pontos!: Phaser.GameObjects.Text;
  private p1Blink: Phaser.Tweens.Tween | null = null;
  private p2Blink: Phaser.Tweens.Tween | null = null;

  /**
   * @param scene - The owning match scene.
   * @param config - Roster, mode, rounds, and render depth for the HUD.
   */
  constructor(scene: Phaser.Scene, config: MatchHudConfig) {
    this.scene = scene;
    this.config = config;
    this.root = scene.add.container(0, 0).setDepth(config.depth).setScrollFactor(0);
    this.brilhoCantos=scene.add.graphics().setDepth(config.depth-1).setScrollFactor(0);

    this.build();
    scene.events.on('torcida-vida',this.vidaTorcida);
    scene.events.on('torcida-acao',this.acaoTorcida);
    scene.events.on('torcida-derrota',this.derrotaTorcida);
    scene.events.on('torcida-reiniciar',this.reinicioTorcida);
    scene.events.on(Phaser.Scenes.Events.UPDATE, this.atualizarSombras, this);
  }

  /** Constructs every HUD element into the root container. */
  private build(): void {
    const largura = telaDe(this.scene).width;
    const encaixe = this.config.espacoParaMenu ? encaixeComMenu(largura) : null;
    const camWidth = encaixe?.largura ?? largura;
    const pad = encaixe ? MARGEM_COM_MENU : MARGEM;
    this.root.setScale(encaixe?.escala ?? 1);

    // --- Player 1 (left) ---
    const p1HealthX = pad + PORTRAIT_DISP + 6;
    const healthY = TOP + 8;
    this.buildHealth('left', p1HealthX, healthY);
    this.buildPortrait('portrait-frame-gold-left', this.config.p1CharacterId, pad + PORTRAIT_DISP / 2, true);
    const p1Edge = this.p1FillGeom.anchorX;
    this.buildNameplate('nameplate-gold-left', this.config.p1CharacterId, p1Edge, healthY, false);
    const pipsY = healthY + HEALTH_DISP_H + NAME_DISP_H + 8;
    this.p1Pips = this.buildPips(p1Edge, pipsY, false);

    // --- Player 2 (right) ---
    const p2HealthX = camWidth - pad - PORTRAIT_DISP - 6 - HEALTH_DISP_W;
    this.buildHealth('right', p2HealthX, healthY);
    this.buildPortrait('portrait-frame-blue-right', this.config.p2CharacterId, camWidth - pad - PORTRAIT_DISP / 2, false);
    const p2Edge = this.p2FillGeom.anchorX;
    this.buildNameplate('nameplate-gold-right', this.config.p2CharacterId, p2Edge - HEALTH_DISP_W, healthY, true);
    this.p2Pips = this.buildPips(p2Edge, pipsY, true);

    // --- Special meters (below the win pips) ---
    const meterY = pipsY + PIP_DISP_H + 8;
    this.buildMeter('left', p1Edge, meterY);
    this.buildMeter('right', p2Edge, meterY);
    this.buildTorcida(pad,healthY + HEALTH_DISP_H + 2,p1Edge-pad-8,meterY+METER_DISP_H);
    this.buildTorcida(p2Edge+8,healthY + HEALTH_DISP_H + 2,camWidth-pad-p2Edge-8,meterY+METER_DISP_H);

    // --- Timer (centre) ---
    this.buildTimer(camWidth / 2);

    this.applyHealth(1, 1);
    this.setMeter(0, 0);
    this.updateWins(0, 0);
    this.atualizarTorcida();
  }

  /** Arco abaixo do retrato, preservando o espaco reservado ao HUD principal. */
  private buildTorcida(x:number,y:number,largura:number,fim:number):void {
    this.medidoresTorcida.push(new PutometroVisual(this.scene,this.root,x,y,largura-4,Math.max(fim-y,largura*.9+26),this.medidoresTorcida.length===0));
  }

  private atualizarTorcida(delta=16):void {
    const g=this.brilhoCantos.clear(),tela=telaDe(this.scene);
    const w=tela.width*.4,h=tela.height*.82;
    const pulso=.8+.2*Math.sin(this.scene.time.now*Math.PI/700);
    this.medidoresTorcida.forEach((medidor,lado)=>{
      medidor.atualizar(this.putometro,lado as 0|1,delta);
      const faixa=faixaPutometro(this.putometro,lado as 0|1);
      this.scene.events.emit('torcida-medidor',lado,faixa);
      if(faixa>1)return;
      const cor=0xef1528;
      for(let x=0;x<32;x++)for(let y=0;y<24;y++){
        const distancia=Math.sqrt((x/32)**2+(y/24)**2);
        const intensidade=Math.max(0,1-distancia);
        const alpha=Math.pow(intensidade,1.25)*(faixa===0?.95:.4)*pulso;
        const px=lado===0?x*w/32:tela.width-(x+1)*w/32,py=y*h/24;
        g.fillStyle(cor,alpha).fillRect(px,py,w/32+1,h/24+1);
        if(faixa===0){
          const vinheta=Math.pow(intensidade,3)*.5;
          g.fillStyle(0x120006,vinheta).fillRect(px,py,w/32+1,h/24+1);
        }
      }
    });
  }

  /**
   * Builds one side's special-meter track and its fill bar.
   * @param side - Which side the meter belongs to.
   * @param edgeX - The outer-edge anchor x in screen pixels.
   * @param topY - The bar's top y in screen pixels.
   */
  private buildMeter(side: 'left' | 'right', edgeX: number, topY: number): void {
    const originX: 0 | 1 = side === 'left' ? 0 : 1;
    const geometry: MeterGeometry = { anchorX: edgeX, topY, width: METER_DISP_W, height: METER_DISP_H, originX };

    const track = this.scene.add
      .rectangle(edgeX, topY, METER_DISP_W, METER_DISP_H, METER_TRACK_COLOR, 0.85)
      .setOrigin(originX, 0)
      .setStrokeStyle(1, 0x1e293b, 1);
    this.root.add(track);

    const fill = this.scene.add
      .rectangle(edgeX, topY, METER_DISP_W, METER_DISP_H, METER_FILL_COLOR, 1)
      .setOrigin(originX, 0);
    this.root.add(fill);

    // Rótulo da forma na ponta de dentro da barra, virado para o relógio.
    const inner = side === 'left' ? edgeX + METER_DISP_W + 8 : edgeX - METER_DISP_W - 8;
    const label = this.scene.add
      .text(inner, topY + METER_DISP_H / 2, '', {
        color: '#fdba74',
        fontFamily: FONTE_TEXTO,
        fontSize: '18px',
        fontStyle: 'bold',
        stroke: '#0b1120',
        strokeThickness: 4
      })
      .setOrigin(side === 'left' ? 0 : 1, 0.5)
      .setVisible(false);
    this.root.add(label);

    if (side === 'left') {
      this.p1Meter = fill;
      this.p1MeterGeom = geometry;
      this.p1FormaText = label;
    } else {
      this.p2Meter = fill;
      this.p2MeterGeom = geometry;
      this.p2FormaText = label;
    }
  }

  /**
   * Builds one side's health frame and its drainable fill underneath.
   * @param side - Which side this bar belongs to.
   * @param frameX - Frame top-left x in screen pixels.
   * @param frameY - Frame top-left y in screen pixels.
   */
  private buildHealth(side: 'left' | 'right', frameX: number, frameY: number): void {
    const frameName = side === 'left' ? 'health-frame-left' : 'health-frame-right';
    const meta = getFightingUiAtlasFrame(frameName);
    const slot = meta.fillSlot ?? meta.bounds;
    const sx = HEALTH_DISP_W / meta.bounds.width;
    const sy = HEALTH_DISP_H / meta.bounds.height;

    const slotLeft = frameX + slot.x * sx;
    const slotTop = frameY + slot.y * sy;
    const slotWidth = slot.width * sx;
    const slotHeight = slot.height * sy;

    const geometry: FillGeometry =
      side === 'left'
        ? { anchorX: slotLeft, topY: slotTop, width: slotWidth, height: slotHeight, originX: 0 }
        : { anchorX: slotLeft + slotWidth, topY: slotTop, width: slotWidth, height: slotHeight, originX: 1 };

    // Vida perdida: o vão da moldura de rua é transparente, então o fundo escuro vem daqui.
    const track = this.scene.add
      .rectangle(slotLeft, slotTop, slotWidth, slotHeight, 0x111114, 0.92)
      .setOrigin(0, 0);
    this.root.add(track);

    // Entre o fundo e a barra: aparece só onde a barra já desceu.
    const sombra = this.scene.add
      .rectangle(geometry.anchorX, geometry.topY, geometry.width, geometry.height, SOMBRA_COLOR, SOMBRA_ALPHA)
      .setOrigin(geometry.originX, 0);
    this.root.add(sombra);

    const fill = this.scene.add
      .image(geometry.anchorX, geometry.topY, KEY, 'health-fill-green-left')
      .setOrigin(geometry.originX, 0);
    this.root.add(fill);

    const frame = this.scene.add
      .image(frameX, frameY, KEY, frameName)
      .setOrigin(0, 0)
      .setDisplaySize(HEALTH_DISP_W, HEALTH_DISP_H);
    this.root.add(frame);

    const pontos = this.scene.add
      .text(slotLeft + slotWidth / 2, slotTop + slotHeight / 2, '', {
        color: '#f8fafc',
        fontFamily: FONTE_TEXTO,
        fontSize: `${Math.round(Math.min(22, slotHeight * 0.7))}px`,
        fontStyle: 'bold',
        stroke: '#0b1120',
        strokeThickness: 4
      })
      .setOrigin(0.5)
      .setVisible(false);
    this.root.add(pontos);

    if (side === 'left') {
      this.p1Fill = fill;
      this.p1FillGeom = geometry;
      this.p1Pontos = pontos;
      this.p1Sombra = sombra;
    } else {
      this.p2Fill = fill;
      this.p2FillGeom = geometry;
      this.p2Pontos = pontos;
      this.p2Sombra = sombra;
    }
  }

  /**
   * Builds a portrait frame with the character portrait seated in its socket.
   * Portraits are authored facing left (canonical); the left (P1) socket flips
   * its portrait so both players face inward toward the centre of the screen.
   * @param frameName - The portrait frame atlas name.
   * @param characterId - The character whose portrait is shown.
   * @param centerX - Frame centre x in screen pixels.
   * @param faceRight - When true, flips the portrait to face right (the P1 socket).
   */
  private buildPortrait(frameName: string, characterId: string, centerX: number, faceRight: boolean): void {
    const meta = getFightingUiAtlasFrame(frameName);
    const centerY = TOP + PORTRAIT_DISP / 2;
    const sx = PORTRAIT_DISP / meta.bounds.width;
    const sy = PORTRAIT_DISP / meta.bounds.height;
    const socket = meta.portraitSocket ?? meta.bounds;

    const frameLeft = centerX - PORTRAIT_DISP / 2;
    const frameTop = centerY - PORTRAIT_DISP / 2;
    const socketCx = frameLeft + (socket.x + socket.width / 2) * sx;
    const socketCy = frameTop + (socket.y + socket.height / 2) * sy;

    // Mesmo motivo da barra: o vão do retrato é transparente na moldura de rua.
    this.root.add(
      this.scene.add.rectangle(socketCx, socketCy, socket.width * sx, socket.height * sy, 0x111114, 0.92)
    );

    const portraitKey = getCharacterDefinition(characterId).portrait.key;
    if (this.scene.textures.exists(portraitKey)) {
      const portrait = this.scene.add
        .image(socketCx, socketCy, portraitKey)
        .setDisplaySize(socket.width * sx, socket.height * sy)
        .setFlipX(faceRight);
      this.root.add(portrait);
    }

    const frame = this.scene.add.image(centerX, centerY, KEY, frameName).setDisplaySize(PORTRAIT_DISP, PORTRAIT_DISP);
    this.root.add(frame);
  }

  /**
   * Builds a name plate beneath a health bar with the character's name.
   * @param frameName - The nameplate atlas frame.
   * @param characterId - The character whose name is shown.
   * @param healthX - The health frame's top-left x (for alignment).
   * @param healthY - The health frame's top-left y.
   * @param rightAligned - When true, the plate hugs the bar's right edge.
   */
  private buildNameplate(
    frameName: string,
    characterId: string,
    healthX: number,
    healthY: number,
    rightAligned: boolean
  ): void {
    const meta = getFightingUiAtlasFrame(frameName);
    const plateX = rightAligned ? healthX + HEALTH_DISP_W - NAME_DISP_W : healthX;
    const plateY = healthY + HEALTH_DISP_H + 2;

    const plate = this.scene.add
      .image(plateX, plateY, KEY, frameName)
      .setOrigin(0, 0)
      .setDisplaySize(NAME_DISP_W, NAME_DISP_H);
    this.root.add(plate);

    const sx = NAME_DISP_W / meta.bounds.width;
    const sy = NAME_DISP_H / meta.bounds.height;
    const slot = meta.textSlot ?? meta.bounds;
    const textCx = plateX + (slot.x + slot.width / 2) * sx;
    const textCy = plateY + (slot.y + slot.height / 2) * sy;

    const name = getCharacterDefinition(characterId).label.toUpperCase();
    const label = this.scene.add
      .text(textCx, textCy, name, {
        color: '#fdf6e3',
        fontFamily: FONTE_TITULO,
        fontSize: '19px',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);
    this.root.add(label);
  }

  /**
   * Builds the round-win pip row for one side.
   * @param edgeX - The anchor x (outer edge of the row).
   * @param y - The row's top y.
   * @param rightAligned - When true, pips grow leftward from `edgeX`.
   * @returns The created pip images, outermost first.
   */
  private buildPips(edgeX: number, y: number, rightAligned: boolean): Phaser.GameObjects.Image[] {
    const meta = getFightingUiAtlasFrame('meter-pip-empty-1');
    const pipWidth = (PIP_DISP_H * meta.bounds.width) / meta.bounds.height;
    const gap = 6;
    const pips: Phaser.GameObjects.Image[] = [];

    for (let index = 0; index < this.config.roundsToWin; index += 1) {
      const offset = index * (pipWidth + gap);
      const x = rightAligned ? edgeX - offset : edgeX + offset;
      const pip = this.scene.add
        .image(x, y, KEY, 'meter-pip-empty-1')
        .setOrigin(rightAligned ? 1 : 0, 0)
        .setDisplaySize(pipWidth, PIP_DISP_H);
      this.root.add(pip);
      pips.push(pip);
    }

    return pips;
  }

  /**
   * Builds the centre timer frame and its number text.
   * @param centerX - The frame centre x in screen pixels.
   */
  private buildTimer(centerX: number): void {
    const meta = getFightingUiAtlasFrame('timer-frame');
    const centerY = TOP + TIMER_DISP_H / 2;
    const frame = this.scene.add.image(centerX, centerY, KEY, 'timer-frame').setDisplaySize(TIMER_DISP_W, TIMER_DISP_H);
    this.root.add(frame);

    const sx = TIMER_DISP_W / meta.bounds.width;
    const sy = TIMER_DISP_H / meta.bounds.height;
    const slot = meta.numberSlot ?? meta.bounds;
    const numberCx = centerX - TIMER_DISP_W / 2 + (slot.x + slot.width / 2) * sx;
    const numberCy = centerY - TIMER_DISP_H / 2 + (slot.y + slot.height / 2) * sy;

    this.timerText = this.scene.add
      .text(numberCx, numberCy, '0', {
        color: '#f8fafc',
        fontFamily: FONTE_TITULO,
        fontSize: '42px',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);
    this.root.add(this.timerText);
  }

  /**
   * Sets both health bars to the given fractions (color + width + blink).
   * @param p1Frac - Player 1's health fraction (0..1).
   * @param p2Frac - Player 2's health fraction (0..1).
   */
  applyHealth(p1Frac: number, p2Frac: number): void {
    this.p1Frac = Phaser.Math.Clamp(p1Frac, 0, 1);
    this.p2Frac = Phaser.Math.Clamp(p2Frac, 0, 1);
    this.renderFill('left');
    this.renderFill('right');
  }

  /**
   * Escreve os pontos de vida dentro das barras (`150/150`), ou esconde.
   * @param p1 - Vida agora e máxima do jogador 1; null esconde as duas.
   * @param p2 - A do jogador 2.
   */
  setPontos(p1: [number, number] | null, p2: [number, number] | null): void {
    const escrever = (texto: Phaser.GameObjects.Text, pontos: [number, number] | null): void => {
      texto.setVisible(pontos !== null);
      if (pontos) texto.setText(`${Math.ceil(pontos[0])}/${Math.round(pontos[1])}`);
    };
    escrever(this.p1Pontos, p1);
    escrever(this.p2Pontos, p2);
  }

  /**
   * Sets both special meters to the given fractions, recolouring and pulsing
   * the bar when it is full (ready to fire).
   * @param p1Frac - Player 1's meter fraction (0..1).
   * @param p2Frac - Player 2's meter fraction (0..1).
   */
  setMeter(p1Frac: number, p2Frac: number): void {
    this.renderMeter('left', Phaser.Math.Clamp(p1Frac, 0, 1));
    this.renderMeter('right', Phaser.Math.Clamp(p2Frac, 0, 1));
  }

  /**
   * Mostra o cronômetro da `forma` no lugar da barra do especial de quem está
   * transformado: laranja, esvaziando, com o rótulo e os segundos que faltam.
   * Chamar depois de {@link setMeter}, que ele sobrepõe.
   * @param p1 - O cronômetro do jogador 1, ou null quando está normal.
   * @param p2 - O do jogador 2.
   */
  setForma(p1: FormaHud | null, p2: FormaHud | null): void {
    this.renderForma('left', p1);
    this.renderForma('right', p2);
  }

  private renderForma(side: 'left' | 'right', forma: FormaHud | null): void {
    const label = side === 'left' ? this.p1FormaText : this.p2FormaText;
    label.setVisible(forma !== null);
    if (!forma) return;

    const fill = side === 'left' ? this.p1Meter : this.p2Meter;
    const geometry = side === 'left' ? this.p1MeterGeom : this.p2MeterGeom;
    // Pisca no fim sem tween: some a cada 120 ms pelo relógio da cena.
    const apagado = forma.piscando && Math.floor(this.scene.time.now / 120) % 2 === 1;
    fill.setDisplaySize(Math.max(0, geometry.width * forma.fracao), geometry.height);
    fill.setFillStyle(FORMA_COLOR, 1).setAlpha(apagado ? 0.3 : 1).setVisible(forma.fracao > 0);
    label.setText(`${forma.rotulo} ${forma.segundos}`.trim()).setAlpha(apagado ? 0.4 : 1);
  }

  /**
   * Renders one side's meter: width by fraction, colour + glow when full.
   * @param side - Which meter to render.
   * @param frac - The meter fraction (0..1).
   */
  private renderMeter(side: 'left' | 'right', frac: number): void {
    const fill = side === 'left' ? this.p1Meter : this.p2Meter;
    const geometry = side === 'left' ? this.p1MeterGeom : this.p2MeterGeom;
    const ready = frac >= 1;

    fill.setDisplaySize(Math.max(0, geometry.width * frac), geometry.height);
    fill.setFillStyle(ready ? METER_READY_COLOR : METER_FILL_COLOR, 1);
    // O cronômetro da forma pode ter deixado a barra apagada no meio da piscada.
    if (!ready) fill.setAlpha(1);
    fill.setVisible(frac > 0);
    this.setMeterGlow(side, ready);
  }

  /**
   * Starts or stops the "ready" pulse on a full meter bar.
   * @param side - Which meter to manage.
   * @param active - Whether the bar should be pulsing.
   */
  private setMeterGlow(side: 'left' | 'right', active: boolean): void {
    const wasReady = side === 'left' ? this.p1MeterReady : this.p2MeterReady;
    if (active === wasReady) {
      return;
    }

    if (side === 'left') {
      this.p1MeterReady = active;
    } else {
      this.p2MeterReady = active;
    }

    const fill = side === 'left' ? this.p1Meter : this.p2Meter;
    const existing = side === 'left' ? this.p1MeterGlow : this.p2MeterGlow;

    if (active) {
      const tween = this.scene.tweens.add({
        targets: fill,
        alpha: 0.45,
        duration: 320,
        yoyo: true,
        repeat: -1
      });

      if (side === 'left') {
        this.p1MeterGlow = tween;
      } else {
        this.p2MeterGlow = tween;
      }

      return;
    }

    existing?.stop();
    fill.setAlpha(1);

    if (side === 'left') {
      this.p1MeterGlow = null;
    } else {
      this.p2MeterGlow = null;
    }
  }

  /**
   * Updates the timer readout and its low-time colour.
   * @param seconds - Whole seconds remaining.
   */
  setTime(seconds: number | null): void {
    // Sem relógio (treino livre): dois traços.
    if (seconds === null) {
      this.timerText.setText('--').setColor('#f8fafc');
      return;
    }
    this.timerText.setText(String(Math.max(0, seconds))).setColor(seconds <= 10 ? '#f87171' : '#f8fafc');
  }

  /**
   * Lights up won-round pips for both players.
   * @param p1Wins - Player 1's round wins.
   * @param p2Wins - Player 2's round wins.
   */
  updateWins(p1Wins: number, p2Wins: number): void {
    this.p1Pips.forEach((pip, index) => pip.setFrame(index < p1Wins ? 'meter-pip-gold-1' : 'meter-pip-empty-1'));
    this.p2Pips.forEach((pip, index) => pip.setFrame(index < p2Wins ? 'meter-pip-gold-1' : 'meter-pip-empty-1'));
  }

  /** Slides the HUD down into place from above (match start). */
  slideIn(): void {
    this.root.y = -SLIDE_OFFSET;
    this.scene.tweens.add({ targets: this.root, y: 0, duration: 900, ease: 'Back.Out' });
  }

  /**
   * Animates both health bars filling from empty to full (round start). The
   * recolor passes through red -> yellow -> green as they fill.
   */
  animateFill(): void {
    this.scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 950,
      ease: 'Cubic.Out',
      onUpdate: (tween) => {
        const value = tween.getValue() ?? 0;
        this.applyHealth(value, value);
      },
      onComplete: () => this.applyHealth(1, 1)
    });
  }

  /** Removes the HUD and stops its tweens. */
  destroy(): void {
    this.scene.events.off('torcida-vida',this.vidaTorcida);
    this.scene.events.off('torcida-acao',this.acaoTorcida);
    this.medidoresTorcida.forEach(m=>m.destruir());
    this.brilhoCantos.destroy();
    this.scene.events.off('torcida-derrota',this.derrotaTorcida);
    this.scene.events.off('torcida-reiniciar',this.reinicioTorcida);
    this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.atualizarSombras, this);
    this.p1Blink?.stop();
    this.p2Blink?.stop();
    this.p1MeterGlow?.stop();
    this.p2MeterGlow?.stop();
    this.root.destroy(true);
  }

  /**
   * Renders one side's fill: width by fraction, frame by colour, plus low-health
   * blink management.
   * @param side - Which bar to render.
   */
  private renderFill(side: 'left' | 'right'): void {
    const frac = side === 'left' ? this.p1Frac : this.p2Frac;
    const fill = side === 'left' ? this.p1Fill : this.p2Fill;
    const geometry = side === 'left' ? this.p1FillGeom : this.p2FillGeom;

    fill.setFrame(colorFrame(frac));
    fill.setDisplaySize(Math.max(1, geometry.width * frac), geometry.height);
    fill.setVisible(frac > 0);

    const blinking = frac > 0 && frac <= HEALTH_DANGER;
    this.setBlink(side, blinking);
  }

  /**
   * A cada quadro, a sombra do dano segue a vida com atraso: parada logo
   * depois do golpe, escorrendo em seguida. Com a luta pausada, para junto.
   * @param _time - Relógio da cena.
   * @param delta - Milissegundos desde o quadro anterior.
   */
  private atualizarSombras(_time: number, delta: number): void {
    if (this.scene.time.paused) return;
    this.atualizarTorcida(delta);
    (['left', 'right'] as const).forEach((side) => {
      const vida = side === 'left' ? this.p1Frac : this.p2Frac;
      const antes = this.sombras[side];
      const proxima = proximaSombra(antes, vida, antes.vidaAntes, delta / 1000);
      this.sombras[side] = { ...proxima, vidaAntes: vida };
      const geometry = side === 'left' ? this.p1FillGeom : this.p2FillGeom;
      const sombra = side === 'left' ? this.p1Sombra : this.p2Sombra;
      sombra.setSize(Math.max(1, geometry.width * proxima.fracao), geometry.height);
      sombra.setVisible(proxima.fracao > vida);
    });
  }

  /**
   * Starts or stops the low-health blink for one side.
   * @param side - Which bar to manage.
   * @param active - Whether the bar should be blinking.
   */
  private setBlink(side: 'left' | 'right', active: boolean): void {
    const fill = side === 'left' ? this.p1Fill : this.p2Fill;
    const existing = side === 'left' ? this.p1Blink : this.p2Blink;

    if (active) {
      if (existing) {
        return;
      }

      const tween = this.scene.tweens.add({
        targets: fill,
        alpha: 0.3,
        duration: 220,
        yoyo: true,
        repeat: -1
      });

      if (side === 'left') {
        this.p1Blink = tween;
      } else {
        this.p2Blink = tween;
      }

      return;
    }

    if (existing) {
      existing.stop();
      fill.setAlpha(1);

      if (side === 'left') {
        this.p1Blink = null;
      } else {
        this.p2Blink = null;
      }
    }
  }
}

/**
 * Picks the health-fill atlas frame for a given fraction. The left-side colour
 * frames are reused for both players (the right side only ships a green fill).
 * @param frac - Health fraction (0..1).
 */
function colorFrame(frac: number): string {
  if (frac > HEALTH_WARN) {
    return 'health-fill-green-left';
  }

  if (frac > HEALTH_DANGER) {
    return 'health-fill-yellow-left';
  }

  return 'health-fill-red-left';
}
