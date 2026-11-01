import * as Phaser from 'phaser';

import { celular, juntarInputs } from '../controle/celularNoJogo';
import { PainelCelular } from '../controle/painelCelular';
import { Fighter, NEUTRAL_FIGHTER_INPUT, type FighterInput } from '../game/fighter';
import { getCharacterDefinition } from '../game/hero';
import { FERRAMENTAS_DE_DEV } from '../game/constants';
import { CONTORNO_TITULO, COR_FUNDO, FONTE_TITULO, SOMBRA_TITULO, TEXTO_CLARO, TEXTO_DESTAQUE } from '../game/estilo';
import { carregarControles, COMANDOS_LUTA, extrasSozinho, type ComandoLuta, type Controles, type Lado } from '../game/controles';
import { CpuLutador, DIFICULDADES, type Dificuldade } from '../game/cpu';
import { IDS_SELECIONAVEIS } from '../game/elenco';
import { proximoLutador, vidaQueVolta } from '../game/treino';
import { PainelTreino } from './treinoPainel';
import { registrarLutaDoJogador } from '../game/torneio';
import { carregarTorneio, salvarTorneio } from '../game/torneioSalvo';
import { MenuPausa } from '../game/menuPausa';
import { controlesDeToqueAtivos } from '../toque/telaToque';
import { publicarLuta } from '../toque/lutaNaTela';
import { nomesDosBotoes } from '../game/golpes';
import { MatchHud } from '../game/matchHud';
import { exibicao } from '../game/exibicao';
import { armorAbsorbs, BLOCK_PUSHBACK, ducksUnder, guardBreakStunMs, guardHolds, isPerfectGuard, jumpsOver, PERFECT_GUARD_STAGGER, specialDodged } from '../game/moveMechanics';
import { DEFAULT_GROUND_FRACTION, getStageDefinition } from '../game/stageConfig';
import { syncLoopingAudioAsset, stopAudioAsset } from '../game/core/audio';
import { proximaTorcida, tocarSom } from '../game/sons';
import { LUTADORES } from '../game/lutadores';
import { torcidaValida } from '../game/torcida';
import { montarTorcida } from '../game/torcidaCena';
import { BiribaCena } from '../game/biribaCena';
import { SCENE_KEYS, type MatchConfig } from '../game/types';
import { spawnHitSpark, type VfxColor } from '../game/vfx';
import { BaseScene } from './BaseScene';

const EDGE_MARGIN = 170;
const DEPTH_FRONT = 8;
const DEPTH_BACK = 5;

// Fraction of the gap from the screen centre each fighter occupies at spawn.
const SPAWN_OFFSET_FRACTION = 0.18;
// How quickly the camera eases toward the fighters' midpoint (0..1 per frame).
const CAMERA_LERP = 0.14;

const ROUNDS_TO_WIN = 2;
// Seconds on the round clock. When it expires the fighter with more health wins
// (a tie is a draw and replays the round).
const ROUND_SECONDS = 99;
const HUD_DEPTH = 100;
const BANNER_DEPTH = 200;
const OVERLAY_DEPTH = 300;

/** The match's high-level state, driving input gating and the HUD. */
type MatchPhase = 'intro' | 'fighting' | 'roundEnd' | 'matchOver';

/** Cada comando pode ter mais de uma tecla (o P1 sozinho soma I O P ao Q E C). */
type PlayerKeys = { lado: Lado; teclas: Record<ComandoLuta, Phaser.Input.Keyboard.Key[]> };

// Shift, Ctrl e Alt têm um código só para as duas pontas do teclado: cada
// lado só aceita a sua (o P2 é o Shift direito), para a mão do outro não
// soltar golpe sem querer.
const MODIFICADORES = new Set([16, 17, 18]);
const PONTA_DO_LADO: Record<Lado, number> = { p1: 1, p2: 2 };

/**
 * The versus match: two fighters spawn facing each other and fight a best-of-3
 * (first to {@link ROUNDS_TO_WIN} rounds). Each round runs a "ROUND n / FIGHT!"
 * intro, then live combat — attack boxes vs hurtboxes drive damage, hitstun,
 * knockback, and a knockdown on KO. When the match is decided a game-over
 * overlay offers a rematch or a return to the main menu. P1 is always human;
 * P2 is human in 1v1 or a simple CPU in 1vCPU.
 */
export class MatchScene extends BaseScene {
  private config: MatchConfig = {
    mode: '1v1',
    stageId: 'estadio',
    p1CharacterId: '',
    p2CharacterId: ''
  };

  private p1!: Fighter;
  private p2!: Fighter;
  private biribas: BiribaCena[] = [];
  private p1Keys!: PlayerKeys;
  private p2Keys!: PlayerKeys;
  private controles!: Controles;
  private cpu?: CpuLutador;
  /** Tela de pausa aberta (Esc): a luta para inteira por baixo. */
  private pausa: MenuPausa | null = null;
  private paineisCelular: { jogador: 1 | 2; painel: PainelCelular }[] = [];
  /** Treino livre: painel lateral, quando cada um apanhou por último, quem está levantando. */
  private painelTreino: PainelTreino | null = null;
  private ultimoGolpe = new Map<Fighter, { ms: number; vida: number }>();
  private levantando = new Set<Fighter>();

  private phase: MatchPhase = 'intro';
  private roundNumber = 1;
  private p1Wins = 0;
  private p2Wins = 0;

  private spawnX1 = 0;
  private spawnX2 = 0;

  private stageWorldWidth = 0;
  private maxScroll = 0;

  private hud!: MatchHud;
  private banner!: Phaser.GameObjects.Text;
  private roundTimeMs = ROUND_SECONDS * 1000;
  private overlay: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super(SCENE_KEYS.Match);
  }

  init(data: MatchConfig): void {
    if (data) {
      this.config = data;
    }
  }

  create(): void {
    this.cpu = undefined;
    this.phase = 'intro';
    this.roundNumber = 1;
    this.p1Wins = 0;
    this.p2Wins = 0;
    this.biribas = [];
    this.overlay = [];

    this.markActiveScene(SCENE_KEYS.Match);
    this.cameras.main.setBackgroundColor(0x05070d);

    this.buildStage();
    this.spawnFighters();
    this.registerKeys();
    this.createPaineisCelular();

    this.hud = new MatchHud(this, {
      mode: this.config.mode,
      p1CharacterId: this.config.p1CharacterId,
      p2CharacterId: this.config.p2CharacterId,
      roundsToWin: ROUNDS_TO_WIN,
      depth: HUD_DEPTH,
      espacoParaMenu: controlesDeToqueAtivos()
    });
    this.hud.slideIn();

    this.banner = this.add
      .text(this.tela.centerX, this.tela.centerY - 40, '', {
        color: TEXTO_DESTAQUE,
        fontFamily: FONTE_TITULO,
        fontSize: '84px',
        stroke: CONTORNO_TITULO,
        strokeThickness: 10
      })
      .setShadow(0, 6, SOMBRA_TITULO, 0, true, true)
      .setOrigin(0.5)
      .setDepth(BANNER_DEPTH)
      .setScrollFactor(0)
      .setAlpha(0);

    this.cpu = this.novaCpu();
    this.pausa = null;
    this.ultimoGolpe = new Map();
    this.levantando = new Set();
    this.painelTreino = this.config.treino ? this.montarPainelTreino() : null;

    this.startRound();
    syncLoopingAudioAsset(this, 'torcida', this.app.settingsStore.getState());
    this.agendarTorcida(null);

    // Volta dos Ajustes abertos pela pausa.
    const aoVoltar = (): void => this.markActiveScene(SCENE_KEYS.Match);
    this.events.on(Phaser.Scenes.Events.RESUME, aoVoltar);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.events.off(Phaser.Scenes.Events.RESUME, aoVoltar);
      this.fecharPausa();
      stopAudioAsset(this, 'torcida');
      this.p1?.destroy();
      this.p2?.destroy();
      this.biribas.forEach((biriba) => biriba.destroy());
      this.biribas = [];
      this.hud?.destroy();
      this.paineisCelular.forEach(({ painel }) => painel.destruir());
      this.paineisCelular = [];
      publicarLuta(null);
      this.painelTreino?.destroy();
      this.painelTreino = null;
    });
  }

  /**
   * Per-frame loop: feeds both fighters their input (only while fighting),
   * keeps them facing each other, resolves hits, checks for a KO, and redraws
   * the HUD.
   * @param time - Phaser clock time in ms.
   * @param delta - Milliseconds since the previous frame.
   */
  update(time: number, delta: number): void {
    if (this.pausa) {
      return;
    }
    const seconds = delta / 1000;
    const fighting = this.phase === 'fighting';

    // O celular é lido todo quadro, mesmo fora da luta, para golpe da
    // introdução não sair atrasado quando o round começa.
    const p1Celular = celular.input(1);
    const p2Celular = celular.input(2);
    const p1Input = fighting ? juntarInputs(this.readKeys(this.p1Keys), p1Celular) : { ...NEUTRAL_FIGHTER_INPUT };
    const p2Input = fighting
      ? this.cpu
        ? this.cpu.atualizar(this.leituraDaCpu(time))
        : this.config.treino
          ? { ...NEUTRAL_FIGHTER_INPUT }
          : juntarInputs(this.readKeys(this.p2Keys), p2Celular)
      : { ...NEUTRAL_FIGHTER_INPUT };
    this.updatePaineisCelular();

    this.p1.faceToward(this.p2.x);
    this.p2.faceToward(this.p1.x);

    if (fighting) {
      if (isActing(p1Input)) {
        this.p1.setDepthBase(DEPTH_FRONT);
        this.p2.setDepthBase(DEPTH_BACK);
      } else if (isActing(p2Input)) {
        this.p2.setDepthBase(DEPTH_FRONT);
        this.p1.setDepthBase(DEPTH_BACK);
      }
    }

    this.p1.update(seconds, p1Input);
    this.p2.update(seconds, p2Input);
    this.publicarBotoesDaTela(p1Input);

    this.updateCamera(false);
    this.biribas.forEach((biriba) => biriba.update(seconds));

    if (fighting) {
      this.resolveCombat();
      this.checkForKnockout();

      if (this.phase === 'fighting') {
        if (this.config.treino) this.atualizarTreino(time, seconds);
        else this.tickRoundTimer(delta);
        this.hud.applyHealth(this.p1.health01, this.p2.health01);
      }
    }
    const pontos = (lutador: Fighter): [number, number] => [lutador.healthPoints, lutador.maxHealthPoints];
    this.hud.setPontos(exibicao().pontosNaVida ? pontos(this.p1) : null, exibicao().pontosNaVida ? pontos(this.p2) : null);

    this.hud.setMeter(this.p1.meter01, this.p2.meter01);
    this.hud.setForma(this.p1.formaHud, this.p2.formaHud);
    this.hud.setTime(this.config.treino ? null : Math.ceil(this.roundTimeMs / 1000));
    this.hud.updateWins(this.p1Wins, this.p2Wins);
  }

  /**
   * Checks both directions for a connecting hit and applies damage/block this
   * frame. A swing only lands once thanks to the attacker's connect flag.
   * Both sides are judged before either hit lands: two strikes that meet on
   * the same frame trade, instead of player 1 always winning.
   */
  private resolveCombat(): void {
    const first = this.prepareHit(this.p1, this.p2);
    const second = this.prepareHit(this.p2, this.p1);
    first?.();
    second?.();
  }

  /**
   * Judges a single attacker -> defender interaction for the current frame and
   * returns how to apply it, or null when nothing connects.
   * Blocking is purely geometric: the hit is guarded when the attack box
   * overlaps the defender's active guard box (from its block pose).
   * @param attacker - The fighter whose attack box is tested.
   * @param defender - The fighter whose hurtbox is tested.
   */
  private prepareHit(attacker: Fighter, defender: Fighter): (() => void) | null {
    if (defender.isDefeated) {
      return null;
    }

    const attack = attacker.getActiveAttack();
    if (!attack) {
      return null;
    }

    const hurt = defender.getHurtRect();
    if (!hurt || !Phaser.Geom.Intersects.RectangleToRectangle(attack.rect, hurt)) {
      return null;
    }

    // Ducked or jumped over: the swing stays live and can still land later.
    if (ducksUnder(attack.move, defender.isDucking) || jumpsOver(attack.move, defender.isAirborne)) {
      return null;
    }
    const escape = { airborne: defender.isAirborne, ducking: defender.isDucking, movingAway: defender.isMovingAwayFrom(attacker.x) };
    if (specialDodged(attack.dodge, escape)) {
      return null;
    }

    // Guard rules per move (GDD, "Golpes"): the low kick and the heavy break
    // the standing guard; only the flying kick breaks the crouching one.
    const blocked = !attack.unblockable && guardHolds(attack.move, defender.guardStance);
    const breakStunMs = attack.unblockable ? null : guardBreakStunMs(attack.move, defender.guardStance);
    const armored = armorAbsorbs(attack.move, defender.isInHeavy, defender.isImparavel);
    const isSpecial = attack.profile.kind === 'special';
    const finisher = attack.finisher && !blocked;

    // The combo finisher launches harder and stuns longer than a regular hit.
    const struck = finisher
      ? { ...attack.profile, knockback: attack.profile.knockback * 1.9, hitstun: attack.profile.hitstun * 1.4 }
      : attack.profile;
    // A broken guard stuns for a fixed time (0.3 s standing, 0.6 s crouching).
    const profile = breakStunMs === null ? struck : { ...struck, hitstun: breakStunMs, stunMs: undefined };
    const facing = attack.facing ?? attacker.facingDirection;
    const cornered = attack.facing === undefined && defender.atWall;
    // Perfect guard (GDD): melee only, and the CPU never does it.
    const isCpu = this.cpu !== undefined && defender === this.p2;
    const perfect = !isCpu && isPerfectGuard(blocked, Boolean(attack.projectile), defender.guardHeldSeconds);

    return () => {
      const vidaAntes = defender.healthPoints;
      defender.applyHit(perfect ? { ...profile, knockback: 0 } : profile, facing, blocked, armored);
      this.mostrarDano(hurt, vidaAntes - defender.healthPoints, blocked ? profile.damage : null);
      defender.flashHit(blocked);
      attacker.markAttackConnected(attack.signature, blocked);
      attacker.registerOffense(blocked, isSpecial);
      defender.registerDefense(blocked);
      if (perfect) {
        // The attacker is left dizzy: no damage, no push.
        attacker.applyHit(PERFECT_GUARD_STAGGER, facing === 1 ? -1 : 1, false);
      } else if (cornered && !armored) {
        // A cornered defender can't slide back, so the attacker gets the push.
        attacker.recoil(-facing * profile.knockback * (blocked ? BLOCK_PUSHBACK : 1));
      }

      this.spawnHitFx(attack.rect, hurt, blocked, isSpecial, finisher, perfect);
      this.som(
        perfect ? 'defesa-perfeita'
          : blocked ? 'defesa'
          : breakStunMs !== null ? 'defesa-quebrada'
          : isSpecial ? 'impacto-especial'
          : attack.move === 'soco-rapido' || attack.move === 'soco-no-ar' ? 'impacto-leve'
          : attack.move === 'chute-baixo' ? 'impacto-baixo'
          : 'impacto-pesado'
      );
    };
  }

  /**
   * Número de dano subindo de cima de quem apanhou (Exibição, "Dano dos
   * golpes"). Defendido não tira vida: mostra entre parênteses, em azul, o
   * que o golpe tiraria.
   * @param hurt - A caixa de quem apanhou, no mundo.
   * @param tirou - Vida que saiu de fato.
   * @param defendido - O dano do golpe, quando foi defendido; senão null.
   */
  private mostrarDano(hurt: Phaser.Geom.Rectangle, tirou: number, defendido: number | null): void {
    if (!exibicao().danoDosGolpes || (tirou <= 0 && defendido === null)) return;
    const texto = defendido !== null && tirou <= 0 ? `(${Math.round(defendido)})` : String(Math.round(tirou));
    const x = hurt.centerX + Phaser.Math.Between(-18, 18);
    const numero = this.add
      .text(x, hurt.top - 10, texto, {
        color: defendido !== null && tirou <= 0 ? '#7dd3fc' : '#fca5a5',
        fontFamily: FONTE_TITULO,
        fontSize: '34px',
        stroke: CONTORNO_TITULO,
        strokeThickness: 6
      })
      .setOrigin(0.5, 1)
      .setDepth(BANNER_DEPTH - 1);
    this.tweens.add({ targets: numero, y: numero.y - 70, alpha: 0, duration: 900, ease: 'Cubic.Out', onComplete: () => numero.destroy() });
  }

  /**
   * Spawns the impact spark and camera shake for a connecting hit, scaled up for
   * special hits and the combo finisher.
   * @param attackRect - The attacker's attack box (world space).
   * @param hurtRect - The defender's hurtbox (world space).
   * @param blocked - Whether the hit was guarded.
   * @param isSpecial - Whether the attack was a special move.
   * @param finisher - Whether this is the special's finishing hit.
   * @param perfect - Whether the guard was perfect: bigger blue spark and a flash.
   */
  private spawnHitFx(
    attackRect: Phaser.Geom.Rectangle,
    hurtRect: Phaser.Geom.Rectangle,
    blocked: boolean,
    isSpecial: boolean,
    finisher: boolean,
    perfect = false
  ): void {
    const sparkX = (Phaser.Geom.Rectangle.GetCenter(attackRect).x + Phaser.Geom.Rectangle.GetCenter(hurtRect).x) / 2;
    const sparkY = (Phaser.Geom.Rectangle.GetCenter(attackRect).y + Phaser.Geom.Rectangle.GetCenter(hurtRect).y) / 2;

    const color: VfxColor = blocked ? 'blue' : finisher ? 'gold' : 'red';
    const sparkScale = perfect ? 1.6 : finisher ? 1.7 : isSpecial ? 1.1 : 0.9;
    spawnHitSpark(this, sparkX, sparkY, color, sparkScale);

    if (perfect) {
      this.cameras.main.flash(90, 120, 190, 255);
      this.cameras.main.shake(90, 0.004);
    } else if (finisher) {
      this.cameras.main.shake(220, 0.012);
    } else if (isSpecial) {
      this.cameras.main.shake(blocked ? 60 : 90, blocked ? 0.003 : 0.005);
    } else {
      this.cameras.main.shake(blocked ? 60 : 120, blocked ? 0.003 : 0.006);
    }
  }

  /** Ends the round when either fighter is knocked out. */
  private checkForKnockout(): void {
    if (this.config.treino) {
      this.levantarNoTreino();
      return;
    }
    if (this.p1.isDefeated) {
      this.endRound(2);
    } else if (this.p2.isDefeated) {
      this.endRound(1);
    }
  }

  /**
   * Counts the round clock down while fighting. When it reaches zero the round
   * is decided on remaining health (a tie replays the round as a draw).
   * @param delta - Milliseconds since the previous frame.
   */
  private tickRoundTimer(delta: number): void {
    const antes = Math.ceil(this.roundTimeMs / 1000);
    this.roundTimeMs = Math.max(0, this.roundTimeMs - delta);
    const agora = Math.ceil(this.roundTimeMs / 1000);
    // Tique a cada um dos últimos 5 segundos.
    if (agora < antes && agora >= 1 && agora <= 5) this.som('relogio');

    if (this.roundTimeMs <= 0) {
      this.resolveTimeOut();
    }
  }

  /** Decides a timed-out round by comparing remaining health. */
  private resolveTimeOut(): void {
    const p1 = this.p1.health01;
    const p2 = this.p2.health01;

    if (p1 > p2) {
      this.endRound(1, 'TEMPO ESGOTADO', TEXTO_DESTAQUE);
    } else if (p2 > p1) {
      this.endRound(2, 'TEMPO ESGOTADO', TEXTO_DESTAQUE);
    } else {
      this.drawRound();
    }
  }

  /** Handles a drawn round (timeout with equal health): replays the round. */
  private drawRound(): void {
    if (this.phase !== 'fighting') {
      return;
    }

    this.phase = 'roundEnd';
    this.som('tempo-esgotado');
    this.showBanner('EMPATE', TEXTO_CLARO, 1.1);
    this.time.delayedCall(1100, () => this.startRound());
  }

  /**
   * Places the chosen stage fit to the viewport height, anchored at world x=0,
   * and sets up the scrollable world. A stage with `sky` gets that image
   * behind it, stretched to the viewport and fixed to the camera. The stage's on-screen width becomes the
   * world width; the camera is bounded to it so it can scroll horizontally and
   * stop at the stage ends (producing corners).
   */
  private buildStage(): void {
    const cam = this.tela;
    const stage = getStageDefinition(this.config.stageId);
    const source = this.textures.get(stage.key).getSourceImage();
    const scale = cam.height / (source.height || stage.height);
    this.stageWorldWidth = (source.width || stage.width) * scale;
    this.maxScroll = Math.max(0, this.stageWorldWidth - cam.width);

    if (stage.sky && this.textures.exists(stage.sky.key)) {
      this.add
        .image(0, 0, stage.sky.key)
        .setOrigin(0, 0)
        .setDisplaySize(cam.width, cam.height)
        .setScrollFactor(0)
        .setDepth(-1);
    }

    // Torcida dividida: metade esquerda veste o clube do P1, a direita o do
    // P2. Sem a arte carregada, fica a pintura antiga.
    const clube = (id: string) => ({ id, clube: torcidaValida(LUTADORES.find((l) => l.id === id)?.torcida) });
    const temTorcida =
      stage.id === 'estadio' &&
      montarTorcida(this, scale, clube(this.config.p1CharacterId), clube(this.config.p2CharacterId), 0);
    if (!temTorcida) {
      this.add.image(0, 0, stage.key).setOrigin(0, 0).setScale(scale).setDepth(0);
    }
    // Sem setBounds: a trava das pontas é do updateCamera, e a do Phaser
    // supõe zoom pelo centro (aqui o zoom é pelo canto, nitidez.ts).
  }

  /** Plays a match sound with the current volume settings (docs/sons.md). */
  private som(chave: string): void {
    tocarSom(this, chave, this.app.settingsStore.getState());
  }

  /**
   * The crowd makes noise on its own (chant, "uuuh", whistles, drums, claps)
   * every few seconds, over the loop. It doesn't follow the fight.
   * @param anterior - The last one, so the same never plays twice in a row.
   */
  private agendarTorcida(anterior: string | null): void {
    const { chave, ms } = proximaTorcida(anterior);
    this.time.delayedCall(ms, () => {
      this.som(chave);
      this.agendarTorcida(chave);
    });
  }

  /** Spawns P1 (left, facing right) and P2 (right, facing left). */
  private spawnFighters(): void {
    const cam = this.tela;
    const stage = getStageDefinition(this.config.stageId);
    const groundY = Math.round(cam.height * (stage.groundFraction ?? DEFAULT_GROUND_FRACTION));
    const minX = EDGE_MARGIN;
    const maxX = this.stageWorldWidth - EDGE_MARGIN;
    const center = this.stageWorldWidth / 2;
    this.spawnX1 = Math.round(center - cam.width * SPAWN_OFFSET_FRACTION);
    this.spawnX2 = Math.round(center + cam.width * SPAWN_OFFSET_FRACTION);

    this.p1 = new Fighter({
      scene: this,
      app: this.app,
      characterId: this.config.p1CharacterId,
      x: this.spawnX1,
      groundY,
      facing: 1,
      minX,
      maxX,
      depth: DEPTH_FRONT,
      onSpecialStart: () => this.som('especial-entrada')
    });

    this.p2 = new Fighter({
      scene: this,
      app: this.app,
      characterId: this.config.p2CharacterId,
      x: this.spawnX2,
      groundY,
      facing: -1,
      minX,
      maxX,
      depth: DEPTH_BACK,
      onSpecialStart: () => this.som('especial-entrada')
    });
    this.p1.setOpponent(this.p2);
    this.p2.setOpponent(this.p1);
    if (this.p1.characterId === 'cachorro') {
      this.biribas.push(new BiribaCena(this, this.p1, groundY, -130, () => this.som('latido')));
    }
    if (this.p2.characterId === 'cachorro') {
      this.biribas.push(new BiribaCena(this, this.p2, groundY, 130, () => this.som('latido')));
    }
  }

  /**
   * Group-camera tracking: scrolls horizontally to keep both fighters framed
   * around their midpoint, clamped to the stage ends (so it stops at corners),
   * then turns the visible screen edges into movement walls for both fighters.
   * This is what produces the "camera locks until one fighter relents" feel —
   * neither fighter can walk off-screen, so they can only separate as far as the
   * screen is wide.
   * @param snap - When true, jumps to the target scroll instantly (round start)
   *   instead of easing toward it.
   */
  private updateCamera(snap: boolean): void {
    const cam = this.cameras.main;
    const viewWidth = this.tela.width;
    const midpoint = (this.p1.x + this.p2.x) / 2;
    const targetScroll = Phaser.Math.Clamp(midpoint - viewWidth / 2, 0, this.maxScroll);
    const scrollX = snap ? targetScroll : Phaser.Math.Linear(cam.scrollX, targetScroll, CAMERA_LERP);

    cam.setScroll(scrollX, 0);

    const leftWall = scrollX + EDGE_MARGIN;
    const rightWall = scrollX + viewWidth - EDGE_MARGIN;
    this.p1.setHorizontalBounds(leftWall, rightWall);
    this.p2.setHorizontalBounds(leftWall, rightWall);
    this.p1.setProjectileBounds(0, this.stageWorldWidth);
    this.p2.setProjectileBounds(0, this.stageWorldWidth);
  }

  /** Registers the two keyboard control schemes plus the menu shortcut. */
  private registerKeys(): void {
    const keyboard = this.input.keyboard;
    if (!keyboard) {
      throw new Error('MatchScene requires keyboard input');
    }

    // Botões remapeados na Academia (aba Botões); sem nada salvo, o padrão.
    const codes = Phaser.Input.Keyboard.KeyCodes as Record<string, number>;
    const controles = carregarControles(new Set(Object.keys(codes)));
    this.controles = controles;
    // Sozinho no teclado (o P2 não é gente no teclado), o P1 ganha I O P.
    const extras = this.config.mode === '1v1' ? {} : extrasSozinho(controles.p1);
    const teclas = (lado: Lado): PlayerKeys => ({
      lado,
      teclas: Object.fromEntries(
        COMANDOS_LUTA.map(({ id }) => {
          const nomes = [controles[lado][id], ...(lado === 'p1' && extras[id] ? [extras[id]!] : [])];
          return [id, nomes.map((nome) => keyboard.addKey(codes[nome]))];
        })
      ) as PlayerKeys['teclas']
    });
    this.p1Keys = teclas('p1');
    this.p2Keys = teclas('p2');

    // Tab não faz nada na luta; a captura só impede o navegador de pular o foco.
    keyboard.addCapture('TAB');
    // Esc pausa e despausa. Só na tela de fim ele leva ao menu, como diz o botão.
    keyboard.on('keydown-ESC', () => {
      if (this.phase === 'matchOver') this.goToMenu();
      else this.alternarPausa();
    });
    keyboard.on('keydown-R', () => {
      // No torneio não há revanche: o resultado vale.
      if (this.phase === 'matchOver' && !this.config.torneio) {
        this.rematch();
      }
    });
    // Enter no fim: segue o torneio, ou revanche (o A / ✕ do celular aperta Enter).
    keyboard.on('keydown-ENTER', () => {
      if (this.phase !== 'matchOver') return;
      if (this.config.torneio) this.continuarTorneio();
      else this.rematch();
    });
  }

  /**
   * Reads a control scheme into a fighter input snapshot. Held keys map to held
   * inputs; jump/light/heavy use edge detection so they fire once per press.
   * @param keys - The player's resolved keys.
   */
  private readKeys(keys: PlayerKeys): FighterInput {
    const ponta = PONTA_DO_LADO[keys.lado];
    const doLado = (key: Phaser.Input.Keyboard.Key): boolean => !MODIFICADORES.has(key.keyCode) || key.location === ponta;
    const segurada = (comando: ComandoLuta): boolean => keys.teclas[comando].some((key) => key.isDown && doLado(key));
    // Todas as teclas passam pelo JustDown (ele consome o aperto), depois junta.
    const apertada = (comando: ComandoLuta): boolean =>
      keys.teclas[comando].map((key) => Phaser.Input.Keyboard.JustDown(key) && doLado(key)).some(Boolean);
    return {
      left: segurada('left'),
      right: segurada('right'),
      crouch: segurada('crouch'),
      block: segurada('block'),
      jump: apertada('jump'),
      light: apertada('light'),
      heavy: apertada('heavy'),
      special: apertada('special')
    };
  }

  /** Esqueleto de cada celular num canto da tela, só enquanto ele estiver conectado. */
  private createPaineisCelular(): void {
    // No build publicado não há relay nem tela de conexão: nada a ligar.
    if (!FERRAMENTAS_DE_DEV) {
      return;
    }
    celular.iniciar();
    const { width } = this.tela;
    const jogadores: (1 | 2)[] = this.config.mode === '1vcpu' ? [1] : [1, 2];
    this.paineisCelular = jogadores.map((jogador) => ({
      jogador,
      painel: new PainelCelular(this, jogador, {
        x: jogador === 1 ? 16 : width - 16 - 100,
        y: 500,
        largura: 100,
        altura: 140,
        comandos: false,
        depth: HUD_DEPTH
      })
    }));
  }

  private updatePaineisCelular(): void {
    this.paineisCelular.forEach(({ jogador, painel }) => {
      const conectado = celular.jogadores[jogador].conectado;
      painel.setVisivel(conectado);
      if (conectado) {
        painel.atualizar();
      }
    });
  }

  /** CPU do 1 VS CPU, na dificuldade escolhida na tela de dificuldade. */
  private novaCpu(): CpuLutador | undefined {
    if (this.config.treino && !this.config.treinoCpu) return undefined;
    return this.config.mode === '1vcpu' ? new CpuLutador(this.dificuldadeDaCpu()) : undefined;
  }

  /** No torneio vale a dificuldade com que ele começou; fora dele, a dos ajustes. */
  private dificuldadeDaCpu(): Dificuldade {
    const torneio = this.config.torneio ? carregarTorneio(IDS_SELECIONAVEIS) : null;
    return torneio?.dificuldade ?? this.app.settingsStore.getState().cpuDificuldade;
  }

  /** Lança o placar da luta no torneio salvo e volta ao chaveamento ou à tabela. */
  private continuarTorneio(): void {
    if (this.phase !== 'matchOver') {
      return;
    }
    this.phase = 'intro';
    const torneio = carregarTorneio(IDS_SELECIONAVEIS);
    if (torneio) {
      salvarTorneio(registrarLutaDoJogador(torneio, [this.p1Wins, this.p2Wins]));
    }
    this.scene.start(SCENE_KEYS.TorneioQuadro);
  }

  /**
   * Conta aos botões do celular o golpe que cada um solta agora (de pé,
   * abaixado, no ar). Partida acabada: nada, e os botões viram OK e Voltar.
   * @param input - O que o P1 está apertando neste quadro.
   */
  private publicarBotoesDaTela(input: FighterInput): void {
    if (!controlesDeToqueAtivos()) return;
    if (this.phase === 'matchOver') {
      publicarLuta(null);
      return;
    }
    const estado = this.p1.isAirborne ? 'ar' : input.crouch ? 'abaixado' : 'pe';
    const nomes = LUTADORES.find((lutador) => lutador.id === this.p1.characterId)?.nomes;
    publicarLuta({ nomes: nomesDosBotoes(nomes, estado), especialPronto: this.p1.isMeterReady && !this.p1.isAirborne });
  }

  /**
   * Treino livre: quem passou 2 s sem perder vida volta a encher, aos poucos.
   * @param time - Relógio da cena, em ms.
   * @param seconds - Duração do quadro.
   */
  private atualizarTreino(time: number, seconds: number): void {
    for (const lutador of [this.p1, this.p2]) {
      const antes = this.ultimoGolpe.get(lutador);
      if (!antes || lutador.healthPoints < antes.vida) {
        this.ultimoGolpe.set(lutador, { ms: time, vida: lutador.healthPoints });
        continue;
      }
      lutador.regenHealth(vidaQueVolta(time - antes.ms, lutador.healthPoints, lutador.maxHealthPoints, seconds));
      antes.vida = lutador.healthPoints;
    }
  }

  /** No treino ninguém perde: quem cai levanta com a vida cheia, onde estava. */
  private levantarNoTreino(): void {
    for (const lutador of [this.p1, this.p2]) {
      if (!lutador.isDefeated || this.levantando.has(lutador)) continue;
      this.levantando.add(lutador);
      this.time.delayedCall(1400, () => {
        this.levantando.delete(lutador);
        lutador.resetForRound(lutador.x, lutador.facingDirection);
        lutador.setFrozen(false);
        this.ultimoGolpe.delete(lutador);
      });
    }
  }

  /** Painel lateral do treino, com os atalhos 1, 2 e 3. */
  private montarPainelTreino(): PainelTreino {
    const trocar = (lado: 'p1' | 'p2', direcao: 1 | -1): void => {
      const chave = lado === 'p1' ? 'p1CharacterId' : 'p2CharacterId';
      this.scene.restart({ ...this.config, [chave]: proximoLutador(IDS_SELECIONAVEIS, this.config[chave], direcao) });
    };
    const alternarCpu = (): void => {
      this.config = { ...this.config, treinoCpu: !this.config.treinoCpu };
      this.cpu = this.novaCpu();
      this.painelTreino?.destroy();
      this.painelTreino = this.montarPainelTreino();
    };
    const keyboard = this.input.keyboard;
    if (keyboard && !this.atalhosDoTreino) {
      this.atalhosDoTreino = true;
      keyboard.on('keydown-ONE', () => trocar('p1', 1));
      keyboard.on('keydown-TWO', () => trocar('p2', 1));
      keyboard.on('keydown-THREE', () => alternarCpu());
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        this.atalhosDoTreino = false;
      });
    }
    return new PainelTreino({
      p1: this.config.p1CharacterId,
      p2: this.config.p2CharacterId,
      cpu: Boolean(this.config.treinoCpu),
      recolhido: this.painelTreino?.estaRecolhido ?? controlesDeToqueAtivos(),
      trocar,
      alternarCpu,
      sair: () => this.scene.start(SCENE_KEYS.Academia),
      dentro: this.app.painelDebug?.slot
    });
  }

  private atalhosDoTreino = false;

  /** O que a CPU (P2) enxerga da luta neste quadro. */
  private leituraDaCpu(time: number) {
    const eu = this.p2;
    const oponente = this.p1;
    return {
      tempoMs: time,
      eu: {
        x: eu.x,
        noAr: eu.isAirborne,
        atordoado: eu.isStunned,
        barraCheia: eu.isMeterReady,
        chuteDeLonge: getCharacterDefinition(eu.characterId).moves?.kick?.kind === 'projectile'
      },
      oponente: {
        x: oponente.x,
        noAr: oponente.isAirborne,
        atordoado: oponente.isStunned,
        atacando: oponente.isAttacking,
        projetil: oponente.hasThreatInFlight,
        caido: oponente.isDefeated
      }
    };
  }

  /** Fecha a pausa e solta a luta. Tecla apertada no menu não vira golpe depois. */
  private fecharPausa(): void {
    if (!this.pausa) {
      return;
    }
    this.pausa.destroy();
    this.pausa = null;
    this.input.keyboard?.resetKeys();
    this.anims.resumeAll();
    this.tweens.resumeAll();
    this.time.paused = false;
    this.sound.resumeAll();
  }

  /** Esc abre e fecha a pausa: teclas, golpes de cada mascote, comandos e as opções. */
  private alternarPausa(): void {
    if (this.pausa) {
      this.fecharPausa();
      return;
    }
    if (this.phase === 'matchOver') {
      return;
    }
    const toque = controlesDeToqueAtivos();
    const cpu = this.config.mode === '1vcpu';
    const dificuldade = DIFICULDADES.find((d) => d.id === this.dificuldadeDaCpu())?.nome;
    this.pausa = new MenuPausa(
      this,
      [
        {
          titulo: 'P1',
          personagemId: this.config.p1CharacterId,
          botoes: toque ? null : this.controles.p1,
          extras: this.config.mode === '1v1' ? undefined : extrasSozinho(this.controles.p1)
        },
        { titulo: cpu ? `CPU (${dificuldade})` : 'P2', personagemId: this.config.p2CharacterId, botoes: cpu ? null : this.controles.p2 }
      ],
      OVERLAY_DEPTH + 10,
      {
        continuar: () => this.fecharPausa(),
        recomecar: () => {
          this.fecharPausa();
          this.scene.restart(this.config);
        },
        // Os Ajustes abrem por cima da luta parada e devolvem para a pausa.
        configuracoes: () => {
          this.scene.launch(SCENE_KEYS.Settings, { voltarPara: SCENE_KEYS.Match });
          this.scene.pause();
        },
        sair: () => {
          this.fecharPausa();
          // No treino, sair é voltar à Academia.
          if (this.config.treino) this.scene.start(SCENE_KEYS.Academia);
          else this.goToMenu();
        }
      }
    );
    this.anims.pauseAll();
    this.tweens.pauseAll();
    this.time.paused = true;
    this.sound.pauseAll();
  }

  /** Resets both fighters to their corners and runs the round intro. */
  private startRound(): void {
    this.phase = 'intro';
    this.roundTimeMs = ROUND_SECONDS * 1000;

    const fullMin = EDGE_MARGIN;
    const fullMax = this.stageWorldWidth - EDGE_MARGIN;
    this.p1.setHorizontalBounds(fullMin, fullMax);
    this.p2.setHorizontalBounds(fullMin, fullMax);

    this.p1.resetForRound(this.spawnX1, 1);
    this.p2.resetForRound(this.spawnX2, -1);
    this.p1.setDepthBase(DEPTH_FRONT);
    this.p2.setDepthBase(DEPTH_BACK);
    this.updateCamera(true);
    this.biribas.forEach((biriba) => biriba.reset());
    this.hud.animateFill();
    this.hud.updateWins(this.p1Wins, this.p2Wins);

    this.showBanner(this.config.treino ? 'TREINO' : `ROUND ${this.roundNumber}`, '#f8fafc');
    this.som('round');

    this.time.delayedCall(900, () => {
      if (this.phase !== 'intro') {
        return;
      }

      this.showBanner('FIGHT!', TEXTO_DESTAQUE, 1.15);
      this.som('luta-comeca');
      this.phase = 'fighting';
      this.p1.setFrozen(false);
      this.p2.setFrozen(false);

      this.time.delayedCall(650, () => this.hideBanner());
    });
  }

  /**
   * Concludes the current round, tallies the win, and either advances to the
   * next round or ends the match.
   * @param winner - Which player won (1 or 2).
   * @param bannerText - The banner to show (defaults to a knockout).
   * @param bannerColor - The banner colour.
   */
  private endRound(winner: 1 | 2, bannerText = 'K.O.', bannerColor = '#f43f5e'): void {
    if (this.phase !== 'fighting') {
      return;
    }

    this.phase = 'roundEnd';

    if (winner === 1) {
      this.p1Wins += 1;
    } else {
      this.p2Wins += 1;
    }

    const winnerName =
      winner === 1
        ? `P1 ${getCharacterDefinition(this.config.p1CharacterId).label}`
        : `${this.config.mode === '1vcpu' ? 'CPU' : 'P2'} ${getCharacterDefinition(this.config.p2CharacterId).label}`;
    this.showBanner(bannerText, bannerColor, 1.2);
    this.som(bannerText === 'K.O.' ? 'ko' : 'tempo-esgotado');

    this.time.delayedCall(1100, () => {
      const matchOver = this.p1Wins >= ROUNDS_TO_WIN || this.p2Wins >= ROUNDS_TO_WIN;

      if (matchOver) {
        this.endMatch(winnerName);
      } else {
        this.roundNumber += 1;
        this.startRound();
      }
    });
  }

  /**
   * Shows the game-over overlay with the match winner and rematch / menu options.
   * @param winnerName - The display name of the match winner.
   */
  private endMatch(winnerName: string): void {
    this.phase = 'matchOver';
    this.hideBanner();
    this.som('vitoria');

    const { centerX, centerY, width, height } = this.tela;

    const dim = this.add
      .rectangle(centerX, centerY, width, height, COR_FUNDO, 0.66)
      .setDepth(OVERLAY_DEPTH)
      .setScrollFactor(0);

    const title = this.add
      .text(centerX, centerY - 90, `${winnerName.toUpperCase()} VENCE!`, {
        color: TEXTO_DESTAQUE,
        fontFamily: FONTE_TITULO,
        fontSize: '56px',
        stroke: CONTORNO_TITULO,
        strokeThickness: 8,
        align: 'center'
      })
      .setShadow(0, 5, SOMBRA_TITULO, 0, true, true)
      .setOrigin(0.5)
      .setDepth(OVERLAY_DEPTH)
      .setScrollFactor(0);

    const score = this.add
      .text(centerX, centerY - 30, `${this.p1Wins} - ${this.p2Wins}`, {
        color: TEXTO_CLARO,
        fontFamily: FONTE_TITULO,
        fontSize: '32px',
        stroke: CONTORNO_TITULO,
        strokeThickness: 5
      })
      .setOrigin(0.5)
      .setDepth(OVERLAY_DEPTH)
      .setScrollFactor(0);

    const rematch = this.config.torneio
      ? this.makeOverlayButton(centerX, centerY + 40, 'CONTINUAR  (Enter)', () => this.continuarTorneio())
      : this.makeOverlayButton(centerX, centerY + 40, 'REVANCHE  (R / Enter)', () => this.rematch());
    const menu = this.makeOverlayButton(centerX, centerY + 96, 'MENU  (Esc)', () => this.goToMenu());

    this.overlay = [dim, title, score, rematch, menu];
  }

  /**
   * Builds a clickable overlay button with hover feedback.
   * @param x - Centre x.
   * @param y - Centre y.
   * @param label - Button text.
   * @param onClick - Click handler.
   */
  private makeOverlayButton(x: number, y: number, label: string, onClick: () => void): Phaser.GameObjects.Text {
    const button = this.add
      .text(x, y, label, {
        color: TEXTO_CLARO,
        fontFamily: FONTE_TITULO,
        fontSize: '26px',
        backgroundColor: 'rgba(11, 7, 22, 0.9)',
        padding: { x: 22, y: 10 }
      })
      .setOrigin(0.5)
      .setDepth(OVERLAY_DEPTH)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });

    button.on('pointerover', () => button.setColor(TEXTO_DESTAQUE).setBackgroundColor('rgba(42, 7, 7, 0.92)'));
    button.on('pointerout', () => button.setColor(TEXTO_CLARO).setBackgroundColor('rgba(11, 7, 22, 0.9)'));
    button.on('pointerdown', onClick);

    return button;
  }

  /** Restarts the match from round 1 with the same configuration. */
  private rematch(): void {
    this.overlay.forEach((object) => object.destroy());
    this.overlay = [];
    this.roundNumber = 1;
    this.p1Wins = 0;
    this.p2Wins = 0;
    this.cpu = this.novaCpu();
    this.startRound();
  }

  /**
   * Shows the centre banner with a short pop-in tween.
   * @param text - The banner text.
   * @param color - The text colour.
   * @param peakScale - The scale to settle at (default 1).
   */
  private showBanner(text: string, color: string, peakScale = 1): void {
    this.banner.setText(text).setColor(color).setScale(0.6).setAlpha(0);
    this.tweens.add({ targets: this.banner, alpha: 1, scale: peakScale, duration: 260, ease: 'Back.Out' });
  }

  /** Fades the centre banner out. */
  private hideBanner(): void {
    this.tweens.add({ targets: this.banner, alpha: 0, duration: 300 });
  }
}

/**
 * Whether an input represents the fighter actively doing something (moving,
 * jumping, or attacking) this frame — used to decide who draws in front.
 * @param input - The fighter input snapshot to test.
 */
function isActing(input: FighterInput): boolean {
  return input.left || input.right || input.jump || input.light || input.heavy;
}
