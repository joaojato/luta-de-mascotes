/**
 * Posição da logo e dos botões do menu principal (João, 03/11/2026): os dois
 * formam um bloco centrado na altura da tela, seja qual for o número de
 * opções. Antes a logo ficava presa no alto e sobrava um vão embaixo.
 */
export interface LayoutDoMenu {
  /** Centro da logo. */
  logoY: number;
  /** Centro do primeiro botão. */
  primeiroBotaoY: number;
  /** Distância entre os centros de dois botões. */
  espaco: number;
  alturaBotao: number;
}

/** Vão entre a base da logo e o topo do primeiro botão. */
const VAO_DA_LOGO = 40;

/**
 * @param alturaTela - Altura lógica da tela.
 * @param alturaLogo - Altura da logo na tela.
 * @param quantas - Quantas opções o menu tem (seis, em dev, apertam um pouco).
 */
export function layoutDoMenu(alturaTela: number, alturaLogo: number, quantas: number): LayoutDoMenu {
  const espaco = quantas > 5 ? 64 : 72;
  const alturaBotao = quantas > 5 ? 52 : 58;
  const bloco = alturaLogo + VAO_DA_LOGO + (quantas - 1) * espaco + alturaBotao;
  const topo = (alturaTela - bloco) / 2;
  return {
    logoY: topo + alturaLogo / 2,
    primeiroBotaoY: topo + alturaLogo + VAO_DA_LOGO + alturaBotao / 2,
    espaco,
    alturaBotao
  };
}
