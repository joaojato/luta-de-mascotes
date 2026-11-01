import { aoMudarExibicao, exibicao, mudarExibicao, type Exibicao } from '../game/exibicao';
import { getCharacterDefinition } from '../game/hero';

/**
 * Painel lateral do treino livre (docs/superpowers/specs/2026-11-01-controles-e-treino-design.md):
 * troca o P1 e o P2 na hora, liga e desliga a CPU, e as opções de exibição.
 * HTML por cima do canvas, como o painel da Academia: clique e toque saem
 * de graça no DOM. Recolhe num botão pequeno (Tab, ou o − no celular).
 */

export interface PainelTreinoOpcoes {
  p1: string;
  p2: string;
  cpu: boolean;
  recolhido: boolean;
  trocar: (lado: 'p1' | 'p2', direcao: 1 | -1) => void;
  alternarCpu: () => void;
  sair: () => void;
}

const OPCOES_EXIBICAO: { campo: keyof Exibicao; nome: string }[] = [
  { campo: 'pontosNaVida', nome: 'Pontos na barra de vida' },
  { campo: 'danoDosGolpes', nome: 'Dano de cada golpe' }
];

export class PainelTreino {
  private readonly raiz: HTMLDivElement;
  private recolhido: boolean;
  private readonly desligar: () => void;

  constructor(private readonly opcoes: PainelTreinoOpcoes) {
    this.recolhido = opcoes.recolhido;
    this.raiz = document.createElement('div');
    Object.assign(this.raiz.style, {
      position: 'fixed',
      top: '215px',
      right: '16px',
      width: 'min(300px, calc(100vw - 32px))',
      maxHeight: 'calc(100vh - 235px)',
      overflowY: 'auto',
      background: 'rgba(11, 16, 32, 0.92)',
      border: '1px solid #334155',
      borderRadius: '8px',
      padding: '10px',
      color: '#e2e8f0',
      font: '13px/1.4 monospace',
      zIndex: '25',
      userSelect: 'none'
    } satisfies Partial<CSSStyleDeclaration>);
    this.raiz.addEventListener('click', (evento) => this.aoClicar(evento));
    this.raiz.addEventListener('change', (evento) => {
      const campo = (evento.target as HTMLInputElement).dataset.exibir as keyof Exibicao | undefined;
      if (campo) mudarExibicao({ [campo]: (evento.target as HTMLInputElement).checked });
    });
    document.body.appendChild(this.raiz);
    this.desligar = aoMudarExibicao(() => this.render());
    this.render();
  }

  alternar(): void {
    this.recolhido = !this.recolhido;
    this.render();
  }

  get estaRecolhido(): boolean {
    return this.recolhido;
  }

  destroy(): void {
    this.desligar();
    this.raiz.remove();
  }

  private aoClicar(evento: MouseEvent): void {
    const alvo = (evento.target as HTMLElement).closest<HTMLElement>('[data-acao]');
    if (!alvo) return;
    const { acao, lado, direcao } = alvo.dataset;
    if (acao === 'trocar' && (lado === 'p1' || lado === 'p2')) this.opcoes.trocar(lado, direcao === '-1' ? -1 : 1);
    else if (acao === 'cpu') this.opcoes.alternarCpu();
    else if (acao === 'sair') this.opcoes.sair();
    else if (acao === 'recolher') this.alternar();
  }

  private render(): void {
    if (this.recolhido) {
      Object.assign(this.raiz.style, { width: 'auto', padding: '6px' });
      this.raiz.innerHTML = `<button data-acao="recolher" style="${estiloBotao(false)}">Treino ▸</button>`;
      return;
    }
    Object.assign(this.raiz.style, { width: 'min(300px, calc(100vw - 32px))', padding: '10px' });
    const lado = (id: 'p1' | 'p2', titulo: string, personagem: string, atalho: string) => `
      <div style="display:flex;align-items:center;gap:6px;margin:4px 0">
        <span style="width:28px;color:#94a3b8">${titulo}</span>
        <button data-acao="trocar" data-lado="${id}" data-direcao="-1" style="${estiloBotao(false)}">◀</button>
        <b style="flex:1;text-align:center">${getCharacterDefinition(personagem).label}</b>
        <button data-acao="trocar" data-lado="${id}" data-direcao="1" style="${estiloBotao(false)}">▶</button>
        <span style="color:#64748b">${atalho}</span>
      </div>`;
    const atual = exibicao();
    const caixas = OPCOES_EXIBICAO.map(
      ({ campo, nome }) =>
        `<label style="display:flex;gap:8px;align-items:center;margin:4px 0;cursor:pointer"><input type="checkbox" data-exibir="${campo}" ${atual[campo] ? 'checked' : ''} /> ${nome}</label>`
    ).join('');
    this.raiz.innerHTML = `
      <div style="display:flex;align-items:center;margin-bottom:6px">
        <b>Treino livre</b>
        <button data-acao="recolher" style="${estiloBotao(false)};margin-left:auto" title="Tab">−</button>
      </div>
      ${lado('p1', 'P1', this.opcoes.p1, '1')}
      ${lado('p2', 'P2', this.opcoes.p2, '2')}
      <button data-acao="cpu" style="${estiloBotao(this.opcoes.cpu)};width:100%;margin:6px 0">
        CPU do P2: ${this.opcoes.cpu ? 'ligada' : 'desligada (fica parado)'} · 3
      </button>
      ${caixas}
      <p style="color:#94a3b8;margin:6px 0">Sem relógio e sem fim. A vida volta a encher 2 s depois do último golpe.</p>
      <button data-acao="sair" style="${estiloBotao(false)};width:100%">Voltar à Academia · Esc</button>
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
