import * as Phaser from 'phaser';

import { getAppContext } from '../context';
import type { GameSettings } from '../types';
import {
  andamento,
  corteDoFiltro,
  disparosDoPasso,
  nivel,
  PASSOS_POR_COMPASSO,
  segundosPorPasso
} from './sequenciador';
import { TEMAS, type Tema } from './temas';

/** Quanto à frente o tocador agenda as notas (s), e de quanto em quanto olha (ms). */
const ANTECEDENCIA = 0.15;
const INTERVALO_MS = 25;
/** Volume da música com o ajuste "Música" em 100%: fica por baixo dos efeitos. */
const VOLUME_BASE = 0.55;
/** Quanto a tensão anda em direção ao alvo a cada passo: sobe e desce sem degrau. */
const SUAVIDADE = 0.12;

/**
 * A música do jogo (docs/musica.md), montada nota a nota no Web Audio do
 * Phaser. Uma só para o jogo inteiro: passa de cena em cena sem cortar. O
 * andamento muda a cada passo; as camadas, só na virada do compasso.
 */
export class Tocador {
  private readonly ctx: AudioContext;
  private readonly saida: GainNode;
  private readonly filtro: BiquadFilterNode;
  private tema: Tema | null = null;
  private relogio: number | null = null;
  private proximo = 0;
  private passo = 0;
  private compasso = 0;
  private camadas = 0;
  private tensao = 0;
  private alvo = 0;
  private pausada = false;
  private volume = 0;

  constructor(
    private readonly game: Phaser.Game,
    manager: Phaser.Sound.WebAudioSoundManager
  ) {
    this.ctx = manager.context;
    this.filtro = this.ctx.createBiquadFilter();
    this.filtro.type = 'lowpass';
    this.filtro.Q.value = 0.7;
    this.saida = this.ctx.createGain();
    this.saida.gain.value = 0;
    this.filtro.connect(this.saida);
    this.saida.connect(manager.destination);
    getAppContext().settingsStore.subscribe((ajustes) => this.ajustarVolume(ajustes));
  }

  /** Toca um tema do começo; se ele já está tocando, não faz nada. */
  tocar(id: Tema['id']): void {
    if (this.tema?.id === id && this.relogio !== null) return;
    this.tema = TEMAS[id];
    this.tensao = this.alvo = this.tema.tensaoFixa ?? 0;
    this.passo = 0;
    this.compasso = 0;
    this.camadas = nivel(this.tensao);
    this.proximo = this.ctx.currentTime + 0.05;
    this.filtro.frequency.setValueAtTime(corteDoFiltro(this.tensao), this.ctx.currentTime);
    this.pausada = false;
    this.ajustarVolume(getAppContext().settingsStore.getState());
    if (this.relogio === null) this.relogio = window.setInterval(() => this.agendar(), INTERVALO_MS);
  }

  /** Tensão da luta, de 0 a 1: a música chega nela aos poucos. */
  definirTensao(tensao: number): void {
    if (this.tema?.tensaoFixa === undefined) this.alvo = Math.min(1, Math.max(0, tensao));
  }

  /**
   * Para a música. Com `pancada`, fecha com bumbo, caixa e prato juntos (o K.O.).
   * @param pancada - Se fecha com a batida final.
   */
  parar(pancada = false): void {
    if (this.relogio !== null) window.clearInterval(this.relogio);
    this.relogio = null;
    if (pancada && this.ctx.state === 'running') {
      const agora = this.ctx.currentTime + 0.02;
      this.filtro.frequency.setTargetAtTime(12000, agora, 0.01);
      ['mus-bumbo', 'mus-bumbo-2', 'mus-caixa-aro', 'mus-prato'].forEach((chave) => this.disparar(chave, agora, 1, 1, null));
    }
    this.tema = null;
  }

  /** Pausa da luta: a música some e volta de onde estava. */
  pausar(pausada: boolean): void {
    this.pausada = pausada;
    this.proximo = this.ctx.currentTime + 0.05;
    this.ajustarVolume(getAppContext().settingsStore.getState());
  }

  private ajustarVolume(ajustes: GameSettings): void {
    this.volume = ajustes.muted || this.pausada ? 0 : ajustes.musicVolume * VOLUME_BASE;
    this.saida.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.08);
  }

  /** Agenda os passos que caem dentro da antecedência. */
  private agendar(): void {
    const tema = this.tema;
    if (!tema) return;
    // Áudio travado (antes do primeiro toque) ou pausado: segura o relógio no presente.
    if (this.ctx.state !== 'running' || this.pausada) {
      this.proximo = this.ctx.currentTime + 0.05;
      return;
    }
    while (this.proximo < this.ctx.currentTime + ANTECEDENCIA) {
      this.tensao += (this.alvo - this.tensao) * SUAVIDADE;
      if (this.passo === 0) this.camadas = nivel(this.tensao);
      const passo = segundosPorPasso(andamento(tema, this.tensao));
      this.filtro.frequency.setTargetAtTime(corteDoFiltro(this.tensao), this.proximo, 0.2);
      disparosDoPasso(tema, this.compasso, this.passo, this.camadas).forEach((d) => {
        // Gente tocando, não máquina: um fio de atraso e de força diferente a cada batida.
        const quando = this.proximo + Math.random() * 0.006;
        this.disparar(d.chave, quando, d.taxa, d.ganho * (0.9 + Math.random() * 0.2), d.passos === null ? null : d.passos * passo);
      });
      this.proximo += passo;
      this.passo += 1;
      if (this.passo === PASSOS_POR_COMPASSO) {
        this.passo = 0;
        this.compasso += 1;
      }
    }
  }

  private disparar(chave: string, quando: number, taxa: number, ganho: number, segundos: number | null): void {
    const buffer = this.game.cache.audio.get(chave) as AudioBuffer | undefined;
    if (!(buffer instanceof AudioBuffer)) return;
    const fonte = this.ctx.createBufferSource();
    fonte.buffer = buffer;
    fonte.playbackRate.value = taxa;
    const volume = this.ctx.createGain();
    volume.gain.setValueAtTime(ganho, quando);
    fonte.connect(volume).connect(this.filtro);
    fonte.start(quando);
    if (segundos !== null) {
      // Solta a nota no fim da duração, com uma cauda curta (sem estalo).
      volume.gain.setTargetAtTime(0, quando + segundos, 0.04);
      fonte.stop(quando + segundos + 0.3);
    }
  }
}

/** Faz nada: jogo sem Web Audio (teste, navegador antigo). */
const SEM_SOM = { tocar() {}, definirTensao() {}, parar() {}, pausar() {} };

let tocador: Tocador | null = null;

/** A música do jogo. A primeira chamada monta o tocador. */
export function musica(game: Phaser.Game): Pick<Tocador, 'tocar' | 'definirTensao' | 'parar' | 'pausar'> {
  if (tocador) return tocador;
  if (!(game.sound instanceof Phaser.Sound.WebAudioSoundManager)) return SEM_SOM;
  tocador = new Tocador(game, game.sound);
  return tocador;
}
