// Opções da tela de pausa da Luta, fora do Phaser para o teste ler.

/** O que cada opção da pausa faz; a ordem aqui é a ordem na tela. */
export interface AcoesDaPausa {
  continuar: () => void;
  /** Tutorial e instruções do 1x1: pula direto para a luta de verdade. */
  pularTutorial?: () => void;
  recomecar: () => void;
  /** Volta à Seleção com o mesmo modo e estádio. Sem ela (torneio, treino), a opção some. */
  trocarPersonagens?: () => void;
  configuracoes: () => void;
  sair: () => void;
}

export interface OpcaoDaPausa {
  id: keyof AcoesDaPausa;
  rotulo: string;
}

export const OPCOES_DA_PAUSA: OpcaoDaPausa[] = [
  { id: 'continuar', rotulo: 'Continuar' },
  { id: 'pularTutorial', rotulo: 'Pular tutorial' },
  { id: 'recomecar', rotulo: 'Recomeçar' },
  { id: 'trocarPersonagens', rotulo: 'Trocar personagens' },
  { id: 'configuracoes', rotulo: 'Configurações' },
  { id: 'sair', rotulo: 'Sair da partida' }
];

/** As opções que esta luta oferece, na ordem da tela. */
export function opcoesDaPausa(acoes: AcoesDaPausa): OpcaoDaPausa[] {
  return OPCOES_DA_PAUSA.filter(({ id }) => acoes[id]);
}
