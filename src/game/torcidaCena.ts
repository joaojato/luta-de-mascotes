import * as Phaser from 'phaser';

import { bandeirasDoClube, coresDoSinalizador, pintarChave, variantesDaCamisa, type TorcidaClube } from './torcida';
import { criarCirculacaoTorcida, type TorcedorNaCena } from './torcidaMovimentoCena';
import { MAPA_TORCIDA } from './torcidaRotas';
import { camadaDaFileira, comporCamadasTorcida } from './torcidaCamadas';
import cadeiras from '../../public/assets/cenarios/estadio/torcida/cadeiras-camadas-v5.json';
import humores from '../../public/assets/cenarios/estadio/torcida/humores-v5.json';
import { criarHumoresTorcida } from './torcidaHumorCena';
import { prepararFrenteEstadio, QUADRO_ESTADIO_INTEIRO } from './torcidaFundo';

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
  sinalizador: 'torcida-sinalizador',
  camisaNaMao: 'torcida-camisa-na-mao',
  andar: 'torcida-andar-v4',
  descer: 'torcida-descer-v4',
  andarBase: 'torcida-andar-v4-base',
  descerBase: 'torcida-descer-v4-base',
  cadeiras: 'torcida-cadeiras-camadas-v5',
  quieta:'torcida-quieta-v5-camisa',brava:'torcida-brava-v5-camisa',
  quietaBase:'torcida-quieta-v5-base',bravaBase:'torcida-brava-v5-base',copo:'torcida-copo-v5'
} as const;

/** Peças que a torcida dispensa: sem elas a arquibancada sai igual, só sem o destaque. */
const OPCIONAIS: string[] = [TORCIDA_CHAVES.dados, TORCIDA_CHAVES.camisaNaMao,
  TORCIDA_CHAVES.andar, TORCIDA_CHAVES.descer, TORCIDA_CHAVES.andarBase, TORCIDA_CHAVES.descerBase, TORCIDA_CHAVES.cadeiras,
  TORCIDA_CHAVES.quieta,TORCIDA_CHAVES.brava,TORCIDA_CHAVES.quietaBase,TORCIDA_CHAVES.bravaBase,TORCIDA_CHAVES.copo];

/** Carregados no Boot; se faltarem, a Luta fica com a pintura antiga. */
export function carregarTorcida(scene: Phaser.Scene): void {
  if (!scene.cache.json.exists(TORCIDA_CHAVES.dados)) {
    scene.load.json(TORCIDA_CHAVES.dados, `${PASTA}/torcida.json`);
  }
  const imagens: [string, string][] = [
    [TORCIDA_CHAVES.fundo, 'arquibancada-vazia.png'],
    [TORCIDA_CHAVES.torcedores, 'torcedores-comemoracao-v3-camisa.png'],
    [TORCIDA_CHAVES.bandeira, 'bandeira.png'],
    [TORCIDA_CHAVES.fumaca, 'fumaca.png'],
    [TORCIDA_CHAVES.sinalizador, 'sinalizador.png'],
    [TORCIDA_CHAVES.camisaNaMao, 'torcedor-camisa-na-mao.png'],
    [TORCIDA_CHAVES.andar, 'torcida-andar-v4-camisa.png'],
    [TORCIDA_CHAVES.descer, 'torcida-descer-v4-camisa.png'],
    [TORCIDA_CHAVES.andarBase, 'torcida-andar-v4.png'],
    [TORCIDA_CHAVES.descerBase, 'torcida-descer-v4.png'],
    [TORCIDA_CHAVES.cadeiras, 'cadeiras-camadas-v5.png'],
    [TORCIDA_CHAVES.quieta, 'torcida-quieta-v5-camisa.png'],
    [TORCIDA_CHAVES.brava, 'torcida-brava-v5-camisa.png'],
    [TORCIDA_CHAVES.quietaBase, 'torcida-quieta-v5.png'],
    [TORCIDA_CHAVES.bravaBase, 'torcida-brava-v5.png'],
    [TORCIDA_CHAVES.copo, 'torcida-copo-v5.png']
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
  /** Torcedor sem camisa rodando a do clube na mão; `porLado` em cada metade. */
  camisaNaMao: (Folha & { porLado: number }) | null;
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
  const folhaCamisaNaMao = lerFolha(folhas.camisaNaMao);
  const porLado = Number((folhas.camisaNaMao as Record<string, unknown> | undefined)?.porLado ?? 3);
  const camisaNaMao = folhaCamisaNaMao && porLado > 0 ? { ...folhaCamisaNaMao, porLado } : null;
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
  return { divisaoX: Number.isFinite(divisaoX) ? divisaoX : 1024, torcedores, bandeira, fumaca, sinalizador, camisaNaMao, fileiras };
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

/** Comemoração coletiva: preparação, pulo em V e punhos alternados. */
const BALANCO = [0, 1, 2, 3];

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
    (chave) => OPCIONAIS.includes(chave) || scene.textures.exists(chave)
  );
  if (!dados || !temArte) return false;

  const meio = dados.divisaoX;
  scene.add.image(0, 0, TORCIDA_CHAVES.fundo, QUADRO_ESTADIO_INTEIRO).setOrigin(0, 0).setScale(escala).setDepth(profundidade);

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
          6
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
    sprite.setData('torcidaChao', fileiras[indice].y + 20 * fileiras[indice].escala);
    sprite.setData('torcidaCamada',camadaDaFileira(fileiras[indice].y));
    return sprite;
  };

  const pes = { x: 0.5, y: 1 };
  const todos: TorcedorNaCena[] = [];
  const posicoes: TorcedorNaCena[] = [];
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
      const sprite = criar(indice, px, fileira.y, lado.camisas[camisa], pes, lado.animTipo(camisa, tipo), inicio, ritmo);
      camadas[indice].gente.push(sprite);
      const pessoa: TorcedorNaCena = { x: px, fileira: indice, lado: ladoIndice, sprite, tipo, camisa, extras: [] };
      todos.push(pessoa);
      if (fileira.setor === 'central') posicoes.push(pessoa);
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
      const sprite = criar(p.fileira, p.x, f.y - celula.altura * 0.55 * f.escala, bandeira.textura, dados.bandeira.origem, bandeira.anim, Math.floor(sortear() * dados.bandeira.quadros));
      camadas[p.fileira].atras.push(sprite);
      p.extras.push(sprite);
    });
    espalhar(ladoIndice, 3, [0.35, 0.75]).forEach((p, k) => {
      const f = fileiras[p.fileira];
      const mao = { x: p.x + celula.largura * 0.2 * f.escala, y: f.y - celula.altura * 0.85 * f.escala };
      const topoDaChama = mao.y - dados.sinalizador.celula.altura * 0.75 * f.escala;
      const fumacaSprite = criar(p.fileira, mao.x, topoDaChama, fumaca, dados.fumaca.origem, animFumaca, Math.floor(sortear() * dados.fumaca.quadros));
      fumacaSprite.setTint(lado.sinalizador[k % lado.sinalizador.length]).setAlpha(0.85);
      const chamaSprite = criar(p.fileira, mao.x, mao.y, chama, dados.sinalizador.origem, animChama, 0);
      camadas[p.fileira].frente.push(fumacaSprite, chamaSprite);
      p.extras.push(fumacaSprite, chamaSprite);
    });
  });

  // Quem tirou a camisa e roda a do clube na mão: toma o lugar de alguns
  // torcedores da arquibancada central, espalhados pela metade de cada lado.
  const camisaNaMao = dados.camisaNaMao;
  if (camisaNaMao && scene.textures.exists(TORCIDA_CHAVES.camisaNaMao)) {
    ([0, 1] as const).forEach((ladoIndice) => {
      const lado = lados[ladoIndice];
      const textura = texturaFatiada(scene, TORCIDA_CHAVES.camisaNaMao, `torcida-camisa-na-mao-${lado.lado.id}`, camisaNaMao.celula, lado.lado.clube);
      const anim = animacao(scene, `${textura}-roda`, textura, [...Array(camisaNaMao.quadros).keys()], 6);
      espalhar(ladoIndice, camisaNaMao.porLado, [0.2, 0.9]).forEach((p) => {
        const gente = camadas[p.fileira].gente;
        gente.splice(gente.indexOf(p.sprite), 1);
        p.sprite.destroy();
        p.sprite = criar(p.fileira, p.x, fileiras[p.fileira].y, textura, pes, anim, Math.floor(sortear() * camisaNaMao.quadros));
        p.semCamisa = true;
        p.tipo = 0;
        gente.push(p.sprite);
      });
    });
  }

  // Uma imagem só para a torcida inteira, redesenhada dez vezes por segundo
  // (o balanço roda a 3, a bandeira e a fumaça a 8): setecentas figuras
  // desenhadas uma a uma, todo quadro, derrubavam o ritmo da Luta.
  const fundo = scene.textures.get(TORCIDA_CHAVES.fundo).getSourceImage(QUADRO_ESTADIO_INTEIRO);
  const imagem = scene.add
    .renderTexture(0, 0, Math.ceil(fundo.width * escala), Math.ceil(fundo.height * escala))
    .setOrigin(0, 0)
    .setDepth(profundidade + 0.1);
  const ordem = camadas.flatMap((camada) => [...camada.atras, ...camada.gente, ...camada.frente]);
  const camadasCadeiras: Phaser.GameObjects.Sprite[]=[];
  if(scene.textures.exists(TORCIDA_CHAVES.cadeiras)) {
    const textura=scene.textures.get(TORCIDA_CHAVES.cadeiras);
    cadeiras.camadas.forEach((c)=>{
      const frame=`patamar-${c.indice}`;
      if(!textura.has(frame)) textura.add(frame,0,0,c.topo,cadeiras.largura,c.base-c.topo+1);
      camadasCadeiras.push(scene.make.sprite({x:0,y:c.topo*escala,key:TORCIDA_CHAVES.cadeiras,frame},false).setOrigin(0,0).setScale(escala));
    });
  }
  const temMovimento = [TORCIDA_CHAVES.andar, TORCIDA_CHAVES.descer, TORCIDA_CHAVES.andarBase, TORCIDA_CHAVES.descerBase]
    .every((key) => scene.textures.exists(key));
  const circulacao = temMovimento ? criarCirculacaoTorcida(scene, escala, fileiras, todos, (pessoa, descer) => {
    const folha = descer ? MAPA_TORCIDA.descer : MAPA_TORCIDA.andar;
    const chave = descer
      ? (pessoa.semCamisa ? TORCIDA_CHAVES.descerBase : TORCIDA_CHAVES.descer)
      : (pessoa.semCamisa ? TORCIDA_CHAVES.andarBase : TORCIDA_CHAVES.andar);
    const clube = pessoa.semCamisa ? null : variantesDaCamisa(lados[pessoa.lado].lado.clube)[pessoa.camisa];
    const textura = texturaFatiada(scene, chave, `${chave}-${lados[pessoa.lado].lado.id}-${pessoa.camisa}`, { largura: 64, altura: 112 }, clube);
    const quadros = Array.from({ length: folha.quadrosPorTipo }, (_, q) => pessoa.tipo * folha.quadrosPorTipo + q);
    return { textura, anim: animacao(scene, `${textura}-tipo${pessoa.tipo}`, textura, quadros, folha.fps) };
  }) : null;
  const festejos=new Map(todos.map(p=>[p,{textura:p.sprite.texture.key,anim:p.sprite.anims.currentAnim!.key}]));
  const temHumores=[TORCIDA_CHAVES.quieta,TORCIDA_CHAVES.brava,TORCIDA_CHAVES.quietaBase,TORCIDA_CHAVES.bravaBase].every(key=>scene.textures.exists(key));
  const humor=temHumores?criarHumoresTorcida(scene,escala,fileiras,todos,(p,h)=>{
    if(h==='torcendo')return festejos.get(p)!;
    const folha=humores[h==='irritada'?'brava':h];
    const chave=h==='quieta'?(p.semCamisa?TORCIDA_CHAVES.quietaBase:TORCIDA_CHAVES.quieta):(p.semCamisa?TORCIDA_CHAVES.bravaBase:TORCIDA_CHAVES.brava);
    const clube=p.semCamisa?null:variantesDaCamisa(lados[p.lado].lado.clube)[p.camisa];
    const textura=texturaFatiada(scene,chave,`${chave}-${lados[p.lado].lado.id}-${p.camisa}`,{largura:64,altura:80},clube);
    const quadros=h==='irritada'?[p.tipo*4+3]:Array.from({length:4},(_,q)=>p.tipo*4+q);
    return {textura,anim:animacao(scene,`${textura}-${h}-tipo${p.tipo}`,textura,quadros,h==='irritada'?1:folha.fps)};
  },scene.textures.exists(TORCIDA_CHAVES.copo)?TORCIDA_CHAVES.copo:undefined,profundidade+.3):null;
  // A frente pintada volta por cima: pessoas circulam atras do alambrado, nunca no gramado.
  const texturaFundo = scene.textures.get(TORCIDA_CHAVES.fundo);
  const frente = prepararFrenteEstadio(texturaFundo, MAPA_TORCIDA.oclusaoFrenteY);
  scene.add.image(0, MAPA_TORCIDA.oclusaoFrenteY * escala, TORCIDA_CHAVES.fundo, frente)
    .setOrigin(0, 0).setScale(escala).setDepth(profundidade + .2);
  const redesenhar = (): void => {
    circulacao?.atualizar();
    humor?.atualizar();
    imagem.clear();
    const fixos=ordem.filter((s)=>s.active && s.visible);
    const moveis=(circulacao?.sprites() ?? []).filter((s)=>s.active && s.visible);
    moveis.sort((a,b)=>Number(a.getData('torcidaChao'))-Number(b.getData('torcidaChao')));
    const visiveis=comporCamadasTorcida(camadasCadeiras,fixos,moveis,s=>Number(s.getData('torcidaCamada')));
    imagem.draw(visiveis);
    imagem.render();
  };
  redesenhar();
  const relogio = scene.time.addEvent({ delay: 100, loop: true, callback: redesenhar });
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    relogio.remove();
    ordem.forEach((sprite) => sprite.destroy());
    camadasCadeiras.forEach((sprite)=>sprite.destroy());
  });

  return true;
}
