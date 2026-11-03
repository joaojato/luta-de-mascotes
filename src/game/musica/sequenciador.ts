import type { Instrumento, Tema } from './temas';

/**
 * A parte pura da música (docs/musica.md): andamento, camadas e o que toca em
 * cada passo. O tocador (`tocador.ts`) só agenda o que sai daqui.
 */

export const PASSOS_POR_COMPASSO = 16;
/** O ciclo dos temas: 8 compassos. */
export const COMPASSOS_POR_CICLO = 8;

/** Tensão a partir da qual cada camada entra (a 0 sempre toca). */
export const LIMIARES = [0, 0.2, 0.45, 0.7, 0.88];

/** Notas gravadas de cada instrumento (scripts/musica_amostras.py): uma a cada 3 semitons. */
export const NOTAS_GRAVADAS: Record<Instrumento, number[]> = {
  trompete: faixa(57, 84),
  acordeao: faixa(48, 78),
  baixo: faixa(28, 55),
  coro: faixa(48, 75)
};

/** Percussão gravada (scripts/musica_amostras.py). */
export const PERCUSSAO = [
  'bumbo', 'bumbo-2', 'caixa', 'caixa-aro', 'caixa-rufo', 'repique', 'repique-agudo', 'tamborim', 'prato',
  'prato-seco', 'cuica-aguda', 'cuica-grave', 'guiro-curto', 'guiro-longo', 'agogo-agudo', 'agogo-grave', 'apito',
  'palma', 'timbal', 'chocalho'
];

function faixa(de: number, ate: number): number[] {
  const notas: number[] = [];
  for (let midi = de; midi <= ate; midi += 3) notas.push(midi);
  return notas;
}

/** Um som a disparar num passo. */
export interface Disparo {
  /** Chave da amostra no cache de áudio (`mus-...`). */
  chave: string;
  /** Velocidade de leitura: afina a nota a partir da gravada mais perto. */
  taxa: number;
  ganho: number;
  /** Duração em passos (null: a amostra inteira, como na percussão). */
  passos: number | null;
}

/** Andamento em BPM: sobe em linha reta com a tensão. */
export function andamento(tema: Tema, tensao: number): number {
  const t = Math.min(1, Math.max(0, tensao));
  return tema.bpm[0] + (tema.bpm[1] - tema.bpm[0]) * t;
}

/** Quantas camadas acima da base estão tocando (0 a 4). */
export function nivel(tensao: number): number {
  return LIMIARES.filter((limiar) => tensao >= limiar).length - 1;
}

/** Duração de um passo em segundos. */
export function segundosPorPasso(bpm: number): number {
  return 60 / bpm / 4;
}

/**
 * A amostra gravada mais perto de uma nota e quanto acelerar para chegar nela.
 * @param instrumento - Qual instrumento.
 * @param midi - A nota pedida.
 */
export function amostraDaNota(instrumento: Instrumento, midi: number): { chave: string; taxa: number } {
  const gravadas = NOTAS_GRAVADAS[instrumento];
  const perto = gravadas.reduce((melhor, nota) => (Math.abs(nota - midi) < Math.abs(melhor - midi) ? nota : melhor));
  return { chave: `mus-${instrumento}-${perto}`, taxa: 2 ** ((midi - perto) / 12) };
}

/**
 * Tudo o que toca num passo de um compasso, com as camadas até o nível dado.
 * @param tema - O tema.
 * @param compasso - Compasso corrido desde o começo (o ciclo é de 8).
 * @param passo - Passo dentro do compasso (0 a 15).
 * @param ate - Nível de tensão: toca da camada 0 até esta.
 */
export function disparosDoPasso(tema: Tema, compasso: number, passo: number, ate: number): Disparo[] {
  const noCiclo = compasso % COMPASSOS_POR_CICLO;
  const disparos: Disparo[] = [];
  tema.camadas.slice(0, ate + 1).forEach((camada) => {
    camada.batidas.forEach((batida) => {
      if (batida.compassos && !batida.compassos.includes(noCiclo)) return;
      const letra = batida.padrao[passo];
      if (letra !== 'x' && letra !== 'o') return;
      const ganho = (batida.ganho ?? 1) * (letra === 'o' ? 0.5 : 1);
      disparos.push({ chave: `mus-${batida.amostra}`, taxa: 1, ganho, passos: null });
    });
    camada.frases.forEach((frase) => {
      frase.compassos[compasso % frase.compassos.length]
        .filter((nota) => nota.passo === passo)
        .forEach((nota) => {
          const { chave, taxa } = amostraDaNota(frase.instrumento, nota.midi);
          disparos.push({ chave, taxa, ganho: frase.ganho ?? 1, passos: nota.dur });
        });
    });
  });
  return disparos;
}

/**
 * Corte do filtro: com a tensão baixa a música vem abafada, como da
 * arquibancada do outro lado; com a tensão alta, abre inteira.
 */
export function corteDoFiltro(tensao: number): number {
  const t = Math.min(1, Math.max(0, tensao));
  return 1400 * (12000 / 1400) ** t;
}

/** Tensão da luta: o quanto o mais machucado dos dois já perdeu. */
export function tensaoDaLuta(vida1: number, vida2: number): number {
  return 1 - Math.max(0, Math.min(1, Math.min(vida1, vida2)));
}

/** Todas as chaves de amostra que a música usa, para o Boot carregar. */
export function chavesDaMusica(): { chave: string; arquivo: string }[] {
  const percussao = PERCUSSAO.map((nome) => ({ chave: `mus-${nome}`, arquivo: nome }));
  const notas = (Object.keys(NOTAS_GRAVADAS) as Instrumento[]).flatMap((instrumento) =>
    NOTAS_GRAVADAS[instrumento].map((midi) => ({ chave: `mus-${instrumento}-${midi}`, arquivo: `${instrumento}-${midi}` }))
  );
  return [...percussao, ...notas];
}
