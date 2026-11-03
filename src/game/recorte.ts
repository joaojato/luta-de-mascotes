/**
 * Recortes quadrados do retrato de um lutador, a partir do `rosto` do JSON
 * (centro em fração da largura e da altura, lado em fração da largura).
 * Modelo: o Mosqueteiro Paulista (João, 02/11/2026). Na seleção, o retrato
 * inteiro dele é o busto; no Museu, o quadrado do rosto é o close.
 */
export interface Rosto {
  x: number;
  y: number;
  lado: number;
}

export interface Recorte {
  x: number;
  y: number;
  lado: number;
}

/** No busto do modelo, o rosto ocupa esta fração do lado... */
const ROSTO_NO_BUSTO = 0.36;
/** ...e o centro dele fica nesta fração da largura e da altura do busto. */
const CENTRO_NO_BUSTO = { x: 0.36, y: 0.37 };

/** Encaixa um quadrado de `lado` com canto em (`x`, `y`) dentro do retrato. */
function dentro(largura: number, altura: number, x: number, y: number, lado: number): Recorte {
  const cabe = Math.min(lado, largura, altura);
  return {
    x: Math.min(Math.max(0, x), largura - cabe),
    y: Math.min(Math.max(0, y), altura - cabe),
    lado: cabe
  };
}

/** Close do rosto: o quadrado marcado no JSON (Museu, chave do mata-mata). */
export function recorteRosto(largura: number, altura: number, rosto: Rosto): Recorte {
  const lado = rosto.lado * largura;
  return dentro(largura, altura, rosto.x * largura - lado / 2, rosto.y * altura - lado / 2, lado);
}

/** Busto da seleção: o rosto no mesmo tamanho e no mesmo lugar do modelo. */
export function recorteBusto(largura: number, altura: number, rosto: Rosto): Recorte {
  const lado = (rosto.lado * largura) / ROSTO_NO_BUSTO;
  return dentro(
    largura,
    altura,
    rosto.x * largura - CENTRO_NO_BUSTO.x * lado,
    rosto.y * altura - CENTRO_NO_BUSTO.y * lado,
    lado
  );
}
