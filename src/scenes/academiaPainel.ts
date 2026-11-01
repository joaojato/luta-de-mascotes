import * as Phaser from 'phaser';

import {
  atribuirTecla,
  carregarControles,
  COMANDOS_LUTA,
  CONTROLES_PADRAO,
  nomeDaTecla,
  salvarControles,
  TECLAS_RESERVADAS,
  type ComandoLuta,
  type Controles,
  type Lado
} from '../game/controles';
import { exibicao, mudarExibicao, type Exibicao } from '../game/exibicao';
import { GOLPES, golpesDoLutador, type SituacaoGolpe } from '../game/golpes';
import { FIGHTER_CHARACTER_DEFINITIONS, getCharacterDefinition } from '../game/hero';
import { LUTADORES } from '../game/lutadores';
import type { FighterCombat } from '../game/types';

/**
 * Painel HTML da Academia, por cima do canvas: aba Golpes (o que cada mascote
 * tem e o que falta desenhar) e aba Botões (remapear cada lado do teclado).
 * HTML porque clique, tabela e captura de tecla saem de graça no DOM.
 */

type Aba = 'golpes' | 'botoes' | 'ajustes' | 'treino';

/** Números que a aba Ajustes deixa mexer (o resto continua no JSON e no shell de debug). */
const CAMPOS_AJUSTE: { id: keyof FighterCombat; nome: string; dica: string }[] = [
  { id: 'maxHealth', nome: 'Vida', dica: 'pontos de vida no começo do round' },
  { id: 'highDamage', nome: 'Soco rápido', dica: 'dano; vale também para o soco no ar' },
  { id: 'lowDamage', nome: 'Soco forte', dica: 'dano; vale também para o tiro' },
  { id: 'kickDamage', nome: 'Chute básico', dica: 'dano; vale também para a voadora' },
  { id: 'lowKickDamage', nome: 'Chute baixo', dica: 'dano' },
  { id: 'specialDamage', nome: 'Especial', dica: 'dano por acerto (o especial acerta várias vezes)' },
  { id: 'meterSeconds', nome: 'Especial enche em', dica: 'segundos de luta para a barra encher sozinha; 0 = só batendo e apanhando' }
];

const SIMBOLO: Record<SituacaoGolpe, string> = { tem: '✓', 'quebra-galho': '~', faltando: '✗' };
const COR: Record<SituacaoGolpe, string> = { tem: '#4ade80', 'quebra-galho': '#facc15', faltando: '#f87171' };

/** Mesmo filtro da Seleção: quem o JSON deixa entrar. */
const ELENCO = FIGHTER_CHARACTER_DEFINITIONS.filter(
  (character) => LUTADORES.find((lutador) => lutador.id === character.id)?.selecionavel !== false
);

const TECLA_POR_CODIGO = new Map<number, string>();
Object.entries(Phaser.Input.Keyboard.KeyCodes as Record<string, number>).forEach(([nome, codigo]) => {
  if (!TECLA_POR_CODIGO.has(codigo)) {
    TECLA_POR_CODIGO.set(codigo, nome);
  }
});
const TECLAS_VALIDAS = new Set(TECLA_POR_CODIGO.values());

export interface PainelAcademiaOpcoes {
  /** Clique numa célula da tabela: mostrar este golpe deste lutador. */
  onEscolher: (characterId: string, acao: string) => void;
  /** Números de combate valendo agora para o lutador. */
  lerCombate: (characterId: string) => FighterCombat;
  /** Grava um ajuste (vale na próxima luta e fica salvo no navegador). */
  ajustarCombate: (characterId: string, campo: keyof FighterCombat, valor: number) => void;
  /** Volta o lutador aos números do JSON. */
  restaurarCombate: (characterId: string) => void;
  /** Abre o treino livre (a Luta sem relógio nem fim). */
  abrirTreino: () => void;
}

export class PainelAcademia {
  private readonly raiz: HTMLDivElement;
  private aba: Aba = 'golpes';
  private characterId = '';
  private controles: Controles = carregarControles(TECLAS_VALIDAS);
  private esperando: { lado: Lado; comando: ComandoLuta } | null = null;
  private aviso = '';
  private visivel = true;

  constructor(private readonly opcoes: PainelAcademiaOpcoes) {
    this.raiz = document.createElement('div');
    Object.assign(this.raiz.style, {
      position: 'fixed',
      top: '72px',
      right: '16px',
      width: 'min(440px, calc(100vw - 32px))',
      maxHeight: 'calc(100vh - 120px)',
      overflowY: 'auto',
      background: 'rgba(11, 16, 32, 0.94)',
      border: '1px solid #334155',
      borderRadius: '8px',
      padding: '12px',
      color: '#e2e8f0',
      font: '13px/1.4 monospace',
      zIndex: '20'
    } satisfies Partial<CSSStyleDeclaration>);
    this.raiz.addEventListener('click', (evento) => this.aoClicar(evento));
    this.raiz.addEventListener('change', (evento) => this.aoMudar(evento));
    document.body.appendChild(this.raiz);
    // Captura antes do Phaser: enquanto espera tecla, a Academia não reage.
    window.addEventListener('keydown', this.aoTeclar, true);
    this.render();
  }

  /** Lutador que a Academia está mostrando (destaca a linha na tabela). */
  mostrarLutador(characterId: string): void {
    this.characterId = characterId;
    this.render();
  }

  alternar(): void {
    this.visivel = !this.visivel;
    this.raiz.style.display = this.visivel ? 'block' : 'none';
  }

  /** Enquanto espera uma tecla, a cena não deve tratar atalhos. */
  get capturando(): boolean {
    return this.esperando !== null;
  }

  destroy(): void {
    window.removeEventListener('keydown', this.aoTeclar, true);
    this.raiz.remove();
  }

  private readonly aoTeclar = (evento: KeyboardEvent): void => {
    if (!this.esperando) {
      return;
    }
    evento.preventDefault();
    evento.stopImmediatePropagation();

    const tecla = TECLA_POR_CODIGO.get(evento.keyCode);
    if (tecla === 'ESC') {
      this.esperando = null;
      this.aviso = 'Cancelado.';
    } else if (!tecla || TECLAS_RESERVADAS.includes(tecla)) {
      this.aviso = `${evento.key} não pode ser botão de luta. Tente outra, ou Esc para cancelar.`;
    } else {
      const { lado, comando } = this.esperando;
      this.controles = atribuirTecla(this.controles, lado, comando, tecla);
      salvarControles(this.controles);
      this.esperando = null;
      this.aviso = 'Salvo. Vale na próxima luta.';
    }
    this.render();
  };

  private aoClicar(evento: MouseEvent): void {
    const alvo = (evento.target as HTMLElement).closest<HTMLElement>('[data-acao]');
    if (!alvo) {
      return;
    }
    const { acao, lado, comando, lutador, sheet } = alvo.dataset;

    if (acao === 'aba') {
      this.aba = alvo.dataset.aba as Aba;
      this.esperando = null;
      this.aviso = '';
    } else if (acao === 'tecla' && lado && comando) {
      this.esperando = { lado: lado as Lado, comando: comando as ComandoLuta };
      this.aviso = 'Aperte a tecla nova (Esc cancela).';
    } else if (acao === 'padrao') {
      this.controles = CONTROLES_PADRAO;
      salvarControles(this.controles);
      this.esperando = null;
      this.aviso = 'Botões de volta ao padrão.';
    } else if (acao === 'golpe' && lutador && sheet) {
      this.opcoes.onEscolher(lutador, sheet);
    } else if (acao === 'treino') {
      this.opcoes.abrirTreino();
      return;
    } else if (acao === 'restaurar') {
      this.opcoes.restaurarCombate(this.lutadorAtual());
      this.aviso = 'Números do JSON de volta.';
    }
    this.render();
  }

  private aoMudar(evento: Event): void {
    const exibir = (evento.target as HTMLInputElement).dataset.exibir as keyof Exibicao | undefined;
    if (exibir) {
      mudarExibicao({ [exibir]: (evento.target as HTMLInputElement).checked });
      this.aviso = 'Salvo. Vale em toda luta.';
      this.render();
      return;
    }
    const campo = (evento.target as HTMLInputElement).dataset.campo as keyof FighterCombat | undefined;
    const valor = Number((evento.target as HTMLInputElement).value);
    if (!campo || !Number.isFinite(valor)) {
      return;
    }
    this.opcoes.ajustarCombate(this.lutadorAtual(), campo, valor);
    this.aviso = 'Salvo. Vale na próxima luta.';
    this.render();
  }

  private lutadorAtual(): string {
    return this.characterId || ELENCO[0].id;
  }

  private render(): void {
    const aba = (id: Aba, nome: string) =>
      `<button data-acao="aba" data-aba="${id}" style="${estiloBotao(this.aba === id)}">${nome}</button>`;

    this.raiz.innerHTML = `
      <div style="display:flex;gap:6px;margin-bottom:10px">
        ${aba('golpes', 'Golpes')}${aba('botoes', 'Botões')}${aba('ajustes', 'Ajustes')}${aba('treino', 'Treino')}
        <span style="margin-left:auto;color:#64748b;align-self:center">Tab esconde</span>
      </div>
      ${this.aba === 'golpes' ? this.htmlGolpes() : this.aba === 'botoes' ? this.htmlBotoes() : this.aba === 'ajustes' ? this.htmlAjustes() : this.htmlTreino()}
      ${this.aviso ? `<p style="color:#facc15;margin:10px 0 0">${this.aviso}</p>` : ''}
    `;
  }

  private htmlGolpes(): string {
    const cabecalho = GOLPES.map((golpe) => `<th title="${golpe.regra}" style="padding:2px 4px">${golpe.nome}</th>`).join('');
    const linhas = ELENCO.map((character) => {
      const celulas = golpesDoLutador(character)
        .map(({ golpe, situacao, acao }) => {
          const dica = `${golpe.nome}: ${situacao}${acao ? ` (sheet ${acao})` : ''}`;
          const clicavel = acao ? `data-acao="golpe" data-lutador="${character.id}" data-sheet="${acao}"` : '';
          return `<td ${clicavel} title="${dica}" style="text-align:center;color:${COR[situacao]};cursor:${acao ? 'pointer' : 'default'}">${SIMBOLO[situacao]}</td>`;
        })
        .join('');
      const atual = character.id === this.characterId;
      return `<tr style="background:${atual ? '#1e293b' : 'transparent'}"><td style="padding:2px 4px">${character.label}</td>${celulas}</tr>`;
    }).join('');

    const atual = getCharacterDefinition(this.characterId || ELENCO[0].id);
    const detalhe = golpesDoLutador(atual)
      .map(
        ({ golpe, situacao, acao }) =>
          `<li><span style="color:${COR[situacao]}">${SIMBOLO[situacao]}</span> <b>${golpe.nome}</b> · ${golpe.comando}` +
          ` · ${situacao === 'faltando' ? 'falta desenhar' : situacao === 'quebra-galho' ? `usando ${acao}` : acao}` +
          `<br><span style="color:#94a3b8">${golpe.regra}</span></li>`
      )
      .join('');

    return `
      <div style="overflow-x:auto">
        <table style="border-collapse:collapse;font-size:12px;width:100%">
          <tr><th></th>${cabecalho}</tr>${linhas}
        </table>
      </div>
      <p style="color:#94a3b8;margin:6px 0">✓ tem · ~ quebra-galho · ✗ falta. Clique para ver o golpe.</p>
      <h4 style="margin:10px 0 4px">${atual.label}</h4>
      <ul style="margin:0;padding-left:18px">${detalhe}</ul>
    `;
  }

  /** Treino livre e o que a luta mostra a mais (vale também no treino e nas lutas de verdade). */
  private htmlTreino(): string {
    const atual = exibicao();
    const caixa = (campo: keyof Exibicao, nome: string, dica: string) =>
      `<label title="${dica}" style="display:flex;gap:8px;align-items:center;margin:4px 0;cursor:pointer"><input type="checkbox" data-exibir="${campo}" ${atual[campo] ? 'checked' : ''} /> ${nome}</label>`;
    return `
      <button data-acao="treino" style="${estiloBotao(true)};width:100%">Abrir treino livre (T)</button>
      <p style="color:#94a3b8;margin:6px 0 10px">1 x 1 sem relógio e sem fim. A vida volta a encher 2 s depois do último golpe. Troque o P1 e o P2 e ligue a CPU no painel do treino.</p>
      <h4 style="margin:0 0 4px">Mostrar na luta</h4>
      ${caixa('pontosNaVida', 'Pontos na barra de vida (150/150)', 'escreve a vida que sobra dentro da barra')}
      ${caixa('danoDosGolpes', 'Dano de cada golpe', 'número subindo de quem apanhou; defendido, entre parênteses')}
    `;
  }

  private htmlAjustes(): string {
    const id = this.lutadorAtual();
    const combate = this.opcoes.lerCombate(id);
    const linhas = CAMPOS_AJUSTE.map(
      ({ id: campo, nome, dica }) =>
        `<tr title="${dica}"><td style="padding:3px 6px">${nome}</td><td><input data-campo="${campo}" type="number" min="0" step="1" value="${combate[campo]}" style="width:80px;font:inherit;background:#1e293b;color:#f8fafc;border:1px solid #475569;border-radius:4px;padding:3px 6px" /></td><td style="color:#94a3b8">${campo === 'meterSeconds' ? 's' : ''}</td></tr>`
    ).join('');

    return `
      <p style="margin:0 0 6px">Modo dev · <b>${getCharacterDefinition(id).label}</b> (troque com A/D)</p>
      <table style="border-collapse:collapse">${linhas}</table>
      <p style="color:#94a3b8;margin:8px 0">Fica salvo neste navegador por cima do JSON. Para valer para todo mundo, passe o número para o <code>combat</code> do JSON do mascote.</p>
      <button data-acao="restaurar" style="${estiloBotao(false)}">Voltar ao JSON</button>
    `;
  }

  private htmlBotoes(): string {
    const celula = (lado: Lado, comando: ComandoLuta) => {
      const esperando = this.esperando?.lado === lado && this.esperando.comando === comando;
      return `<td><button data-acao="tecla" data-lado="${lado}" data-comando="${comando}" style="${estiloBotao(esperando)};min-width:72px">${
        esperando ? '...' : nomeDaTecla(this.controles[lado][comando])
      }</button></td>`;
    };
    const linhas = COMANDOS_LUTA.map(
      ({ id, nome }) => `<tr><td style="padding:3px 6px">${nome}</td>${celula('p1', id)}${celula('p2', id)}</tr>`
    ).join('');

    return `
      <table style="border-collapse:collapse">
        <tr><th></th><th>P1 (esquerda)</th><th>P2 (direita)</th></tr>${linhas}
      </table>
      <p style="color:#94a3b8;margin:8px 0">Clique e aperte a tecla. Tecla já usada troca de lugar.</p>
      <button data-acao="padrao" style="${estiloBotao(false)}">Restaurar padrão</button>
    `;
  }
}

function estiloBotao(ativo: boolean): string {
  return [
    'font:inherit',
    'padding:4px 10px',
    'border-radius:4px',
    'cursor:pointer',
    `border:1px solid ${ativo ? '#facc15' : '#475569'}`,
    `background:${ativo ? '#422006' : '#1e293b'}`,
    'color:#f8fafc'
  ].join(';');
}
