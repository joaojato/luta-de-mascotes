import * as Phaser from 'phaser';

import { bandeirasDoClube, coresDoSinalizador, pintarChave, variantesDaCamisa, type TorcidaClube } from './torcida';

/**
 * Monta a torcida dividida na Luta (docs/torcida-dividida.md): fundo sem
 * gente, torcedores nas fileiras, bandeiras e sinalizadores. A metade da
 * esquerda veste o clube do P1, a da direita o do P2, pela posição na
 * pintura (não muda se os lutadores trocarem de lado).
 */

const PASTA = '/assets/cenarios/estadio/torcida';

export const TORCIDA_CHAVES = {
  dados: 'torcida-dados',
  fundo: 'torcida-arquibancada-vazia',
  torcedores: 'torcida-torcedores',
  bandeira: 'torcida-bandeira',
  fumaca: 'torcida-fumaca',
  sinalizador: 'torcida-sinalizador'
} as const;

/** Carregados no Boot; se faltarem, a Luta fica com a pintura antiga. */
export function carregarTorcida(scene: Phaser.Scene): void {
  if (!scene.cache.json.exists(TORCIDA_CHAVES.dados)) {
    scene.load.json(TORCIDA_CHAVES.dados, `${PASTA}/torcida.json`);
  }
  const imagens: [string, string][] = [
    [TORCIDA_CHAVES.fundo, 'arquibancada-vazia.png'],
    [TORCIDA_CHAVES.torcedores, 'torcedores.png'],
    [TORCIDA_CHAVES.bandeira, 'bandeira.png'],
    [TORCIDA_CHAVES.fumaca, 'fumaca.png'],
    [TORCIDA_CHAVES.sinalizador, 'sinalizador.png']
  ];
  imagens.forEach(([chave, arquivo]) => {
    if (!scene.textures.exists(chave)) {
      scene.load.image(chave, `${PASTA}/${arquivo}`);
    }
  });
}

interface Celula {
  largura: number;
  altura: number;
}

interface Folha {
  celula: Celula;
  quadros: number;
  /** Ponto da célula que encosta no lugar (mão, mastro, base da fumaça), de 0 a 1. */
  origem: { x: number; y: number };
}

export interface Fileira {
  /** `central`, `lateral-esquerda` ou `lateral-direita`. */
  setor?: string;
  y: number;
  xInicio: number;
  xFim: number;
  escala: number;
  passo: number;
}

export interface DadosTorcida {
  /** Onde a pintura se divide entre as duas torcidas, em pixels da pintura. */
  divisaoX: number;
  torcedores: Folha & { tipos: number };
  bandeira: Folha;
  fumaca: Folha;
  sinalizador: Folha;
  fileiras: Fileira[];
}

/** Aceita `[64, 80]`, `{largura, altura}` ou `{width, height}`. */
function lerCelula(raw: unknown): Celula | null {
  if (Array.isArray(raw) && raw.length === 2) {
    return { largura: Number(raw[0]), altura: Number(raw[1]) };
  }
  if (raw && typeof raw === 'object') {
    const r = raw as Record<string, unknown>;
    const largura = Number(r.largura ?? r.width ?? r.w);
    const altura = Number(r.altura ?? r.height ?? r.h);
    if (largura > 0 && altura > 0) return { largura, altura };
  }
  return null;
}

function lerFolha(raw: unknown): (Folha & { tipos: number }) | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const celula = lerCelula(r.celula ?? r.cell ?? { largura: r.celulaLargura, altura: r.celulaAltura });
  const quadros = Number(r.quadrosPorTipo ?? r.quadros ?? r.frames);
  if (!celula || !(quadros > 0)) return null;
  const tipos = Array.isArray(r.tipos) ? r.tipos.length : Number(r.tipos ?? r.linhas ?? 1);
  const ancora = r.ancora as { x?: unknown; y?: unknown } | undefined;
  const origem =
    ancora && Number.isFinite(Number(ancora.x)) && Number.isFinite(Number(ancora.y))
      ? { x: Number(ancora.x) / celula.largura, y: Number(ancora.y) / celula.altura }
      : { x: 0.5, y: 1 };
  return { celula, quadros, tipos, origem };
}

/**
 * Lê o `torcida.json` da entrega; `null` se faltar alguma peça.
 * @param raw - O JSON carregado.
 */
export function lerDadosTorcida(raw: unknown): DadosTorcida | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const folhas = (r.folhas ?? r) as Record<string, unknown>;
  const torcedores = lerFolha(folhas.torcedores);
  const bandeira = lerFolha(folhas.bandeira);
  const fumaca = lerFolha(folhas.fumaca);
  const sinalizador = lerFolha(folhas.sinalizador);
  const fileiras = Array.isArray(r.fileiras)
    ? (r.fileiras as Record<string, unknown>[])
        .map((f) => ({
          setor: typeof f.setor === 'string' ? f.setor : 'central',
          y: Number(f.y),
          xInicio: Number(f.xInicio),
          xFim: Number(f.xFim),
          escala: Number(f.escala ?? 1),
          passo: Number(f.passo)
        }))
        .filter((f) => [f.y, f.xInicio, f.xFim, f.escala, f.passo].every(Number.isFinite) && f.passo > 0)
    : [];
  if (!torcedores || !bandeira || !fumaca || !sinalizador || fileiras.length === 0) return null;
  const cenario = r.cenario as { divisaoX?: unknown; largura?: unknown } | undefined;
  const divisaoX = Number(cenario?.divisaoX ?? Number(cenario?.largura) / 2);
  return { divisaoX: Number.isFinite(divisaoX) ? divisaoX : 1024, torcedores, bandeira, fumaca, sinalizador, fileiras };
}

/** Sorteio com semente fixa: a mesma torcida em toda luta. */
function sorteio(semente: number): () => number {
  let s = semente >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * Copia uma folha para uma textura nova, com a cor chave trocada pela
 * estampa (ou sem troca), e numera os quadros célula a célula.
 */
function texturaFatiada(
  scene: Phaser.Scene,
  origem: string,
  destino: string,
  celula: Celula,
  clube: TorcidaClube | null
): string {
  if (scene.textures.exists(destino)) return destino;
  const imagem = scene.textures.get(origem).getSourceImage() as HTMLImageElement;
  const textura = scene.textures.createCanvas(destino, imagem.width, imagem.height);
  if (!textura) return origem;
  const contexto = textura.context;
  contexto.drawImage(imagem, 0, 0);
  if (clube) {
    const dados = contexto.getImageData(0, 0, imagem.width, imagem.height);
    pintarChave(dados.data, imagem.width, imagem.height, celula, clube);
    contexto.putImageData(dados, 0, 0);
  }
  const colunas = Math.floor(imagem.width / celula.largura);
  const linhas = Math.floor(imagem.height / celula.altura);
  for (let i = 0; i < colunas * linhas; i += 1) {
    textura.add(i, 0, (i % colunas) * celula.largura, Math.floor(i / colunas) * celula.altura, celula.largura, celula.altura);
  }
  textura.refresh();
  return destino;
}

function animacao(scene: Phaser.Scene, chave: string, textura: string, quadros: number[], fps: number): string {
  if (!scene.anims.exists(chave)) {
    scene.anims.create({
      key: chave,
      frames: quadros.map((frame) => ({ key: textura, frame })),
      frameRate: fps,
      repeat: -1
    });
  }
  return chave;
}

export interface LadoDaTorcida {
  /** Id do lutador: as texturas pintadas ficam guardadas por ele. */
  id: string;
  clube: TorcidaClube;
}

/** Balanço do torcedor: parado, braços, parado, pulinho, punho. */
const BALANCO = [0, 1, 0, 2, 0, 3];

/**
 * Desenha a arquibancada dividida. Devolve falso se a arte não estiver
 * carregada, e aí a Luta usa a pintura antiga.
 * @param scene - A Luta.
 * @param escala - Escala do cenário na tela (altura da tela / altura da pintura).
 * @param p1 - Clube da metade esquerda.
 * @param p2 - Clube da metade direita.
 * @param profundidade - Profundidade do fundo; a torcida fica logo acima.
 */
export function montarTorcida(
  scene: Phaser.Scene,
  escala: number,
  p1: LadoDaTorcida,
  p2: LadoDaTorcida,
  profundidade: number
): boolean {
  const dados = lerDadosTorcida(scene.cache.json.get(TORCIDA_CHAVES.dados));
  const temArte = Object.values(TORCIDA_CHAVES).every(
    (chave) => chave === TORCIDA_CHAVES.dados || scene.textures.exists(chave)
  );
  if (!dados || !temArte) return false;

  const meio = dados.divisaoX;
  scene.add.image(0, 0, TORCIDA_CHAVES.fundo).setOrigin(0, 0).setScale(escala).setDepth(profundidade);

  // Uma folha pintada por camisa do clube (estampa e as lisas) e por
  // bandeira; ficam guardadas pelo id do lutador para as próximas lutas.
  const lados = [p1, p2].map((lado) => {
    const camisas = variantesDaCamisa(lado.clube).map((camisa, i) =>
      texturaFatiada(scene, TORCIDA_CHAVES.torcedores, `torcida-torcedores-${lado.id}-${i}`, dados.torcedores.celula, camisa)
    );
    const bandeiras = bandeirasDoClube(lado.clube).map((bandeira, i) => {
      const textura = texturaFatiada(scene, TORCIDA_CHAVES.bandeira, `torcida-bandeira-${lado.id}-${i}`, dados.bandeira.celula, bandeira);
      return { textura, anim: animacao(scene, `${textura}-tremula`, textura, [...Array(dados.bandeira.quadros).keys()], 8) };
    });
    return {
      lado,
      camisas,
      bandeiras,
      sinalizador: coresDoSinalizador(lado.clube),
      animTipo: (camisa: number, tipo: number) =>
        animacao(
          scene,
          `${camisas[camisa]}-tipo${tipo}`,
          camisas[camisa],
          BALANCO.map((q) => tipo * dados.torcedores.quadros + Math.min(q, dados.torcedores.quadros - 1)),
          3
        )
    };
  });
  // Seis em cada dez com a estampa do clube, o resto de camisa lisa numa das cores dele.
  const sortearCamisa = (total: number): number => (total < 2 || sortear() < 0.6 ? 0 : 1 + Math.floor(sortear() * (total - 1)));
  const fumaca = texturaFatiada(scene, TORCIDA_CHAVES.fumaca, 'torcida-fumaca-quadros', dados.fumaca.celula, null);
  const chama = texturaFatiada(scene, TORCIDA_CHAVES.sinalizador, 'torcida-sinalizador-quadros', dados.sinalizador.celula, null);
  const animFumaca = animacao(scene, `${fumaca}-sobe`, fumaca, [...Array(dados.fumaca.quadros).keys()], 8);
  const animChama = animacao(scene, `${chama}-queima`, chama, [...Array(dados.sinalizador.quadros).keys()], 12);

  const sortear = sorteio(1959);
  // Do fundo para a frente: cada fileira cobre a de trás.
  const fileiras = [...dados.fileiras].sort((a, b) => a.y - b.y);
  // Por fileira: bandeira atrás das pessoas (a mão esconde o mastro), as
  // pessoas, e na frente delas o sinalizador.
  const camadas = fileiras.map(() => ({ atras: [] as Phaser.GameObjects.Sprite[], gente: [] as Phaser.GameObjects.Sprite[], frente: [] as Phaser.GameObjects.Sprite[] }));
  const criar = (
    indice: number,
    x: number,
    y: number,
    textura: string,
    origem: { x: number; y: number },
    anim: string,
    inicio: number,
    ritmo = 1
  ): Phaser.GameObjects.Sprite => {
    // Fora da tela: só animam, quem aparece é a imagem redesenhada abaixo.
    const sprite = scene.make
      .sprite({ x: x * escala, y: y * escala, key: textura }, false)
      .setOrigin(origem.x, origem.y)
      .setScale(escala * fileiras[indice].escala);
    sprite.play({ key: anim, startFrame: inicio });
    sprite.anims.timeScale = ritmo;
    scene.sys.updateList.add(sprite);
    return sprite;
  };

  const pes = { x: 0.5, y: 1 };
  const posicoes: { x: number; fileira: number; lado: 0 | 1 }[] = [];
  fileiras.forEach((fileira, indice) => {
    const passo = fileira.passo * fileira.escala;
    for (let x = fileira.xInicio + passo / 2; x <= fileira.xFim; x += passo) {
      const px = x + (sortear() - 0.5) * passo * 0.3;
      const ladoIndice: 0 | 1 = px < meio ? 0 : 1;
      const lado = lados[ladoIndice];
      const camisa = sortearCamisa(lado.camisas.length);
      const tipo = Math.floor(sortear() * dados.torcedores.tipos);
      const inicio = Math.floor(sortear() * BALANCO.length);
      const ritmo = 0.7 + sortear() * 0.6;
      camadas[indice].gente.push(criar(indice, px, fileira.y, lado.camisas[camisa], pes, lado.animTipo(camisa, tipo), inicio, ritmo));
      if (fileira.setor === 'central') posicoes.push({ x: px, fileira: indice, lado: ladoIndice });
    }
  });

  // Bandeiras e sinalizadores só na arquibancada central (as laterais saem
  // da câmera), espalhados pela largura de cada metade.
  const centrais = [...new Set(posicoes.map((p) => p.fileira))].sort((a, b) => a - b);
  const usados = new Set<(typeof posicoes)[number]>();
  const espalhar = (ladoIndice: 0 | 1, quantos: number, faixa: [number, number]) => {
    const doLado = posicoes.filter((p) => p.lado === ladoIndice);
    if (doLado.length === 0 || centrais.length === 0) return [];
    const xs = doLado.map((p) => p.x);
    const [xMin, xMax] = [Math.min(...xs), Math.max(...xs)];
    return Array.from({ length: quantos }, (_, k) => {
      const t = (k + 0.5) / quantos;
      const fileira = centrais[Math.round((faixa[0] + (faixa[1] - faixa[0]) * t) * (centrais.length - 1))];
      const alvo = xMin + (xMax - xMin) * t;
      const escolhido = doLado
        .filter((p) => p.fileira === fileira && !usados.has(p))
        .sort((a, b) => Math.abs(a.x - alvo) - Math.abs(b.x - alvo))[0];
      if (escolhido) usados.add(escolhido);
      return escolhido;
    }).filter((p): p is (typeof posicoes)[number] => Boolean(p));
  };

  const celula = dados.torcedores.celula;
  ([0, 1] as const).forEach((ladoIndice) => {
    const lado = lados[ladoIndice];
    espalhar(ladoIndice, 3, [0.1, 0.5]).forEach((p, k) => {
      const f = fileiras[p.fileira];
      const bandeira = lado.bandeiras[k % lado.bandeiras.length];
      camadas[p.fileira].atras.push(
        criar(p.fileira, p.x, f.y - celula.altura * 0.55 * f.escala, bandeira.textura, dados.bandeira.origem, bandeira.anim, Math.floor(sortear() * dados.bandeira.quadros))
      );
    });
    espalhar(ladoIndice, 3, [0.35, 0.75]).forEach((p, k) => {
      const f = fileiras[p.fileira];
      const mao = { x: p.x + celula.largura * 0.2 * f.escala, y: f.y - celula.altura * 0.85 * f.escala };
      const topoDaChama = mao.y - dados.sinalizador.celula.altura * 0.75 * f.escala;
      const fumacaSprite = criar(p.fileira, mao.x, topoDaChama, fumaca, dados.fumaca.origem, animFumaca, Math.floor(sortear() * dados.fumaca.quadros));
      fumacaSprite.setTint(lado.sinalizador[k % lado.sinalizador.length]).setAlpha(0.85);
      camadas[p.fileira].frente.push(fumacaSprite, criar(p.fileira, mao.x, mao.y, chama, dados.sinalizador.origem, animChama, 0));
    });
  });

  // Uma imagem só para a torcida inteira, redesenhada dez vezes por segundo
  // (o balanço roda a 3, a bandeira e a fumaça a 8): setecentas figuras
  // desenhadas uma a uma, todo quadro, derrubavam o ritmo da Luta.
  const fundo = scene.textures.get(TORCIDA_CHAVES.fundo).getSourceImage();
  const imagem = scene.add
    .renderTexture(0, 0, Math.ceil(fundo.width * escala), Math.ceil(fundo.height * escala))
    .setOrigin(0, 0)
    .setDepth(profundidade + 0.1);
  const ordem = camadas.flatMap((camada) => [...camada.atras, ...camada.gente, ...camada.frente]);
  const redesenhar = (): void => {
    imagem.clear();
    imagem.draw(ordem);
    imagem.render();
  };
  redesenhar();
  const relogio = scene.time.addEvent({ delay: 100, loop: true, callback: redesenhar });
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    relogio.remove();
    ordem.forEach((sprite) => sprite.destroy());
  });

  return true;
}
