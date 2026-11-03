import mapa from '../../public/assets/cenarios/estadio/torcida/circulacao-v4.json';

export { mapa as MAPA_TORCIDA };
export type EtapaTorcida = 'fileira' | 'escada' | 'saida';
export interface PontoTorcida {
  x: number;
  y: number;
  nivel: number;
  escala: number;
  etapa: EtapaTorcida;
}
export type CorredorTorcida = 0 | 1 | 2;
export interface OrigemTorcida { x: number; y: number; escala: number; setor?: string; corredor?: CorredorTorcida; desvio?: number; variarCorredor?: boolean }

function misturarNumero(valor:number):number {
  let n=valor>>>0;n^=n>>>16;n=Math.imul(n,0x7feb352d);n^=n>>>15;n=Math.imul(n,0x846ca68b);return (n^(n>>>16))>>>0;
}
/** Sorteio uniforme de pessoas, sem ordenar por posicao, fileira ou tipo. */
export function embaralharPessoas<T>(pessoas:T[],sortear:()=>number):T[] {
  const resultado=[...pessoas];
  for(let i=resultado.length-1;i>0;i--){const j=Math.min(i,Math.floor(sortear()*(i+1)));[resultado[i],resultado[j]]=[resultado[j],resultado[i]];}
  return resultado;
}

/** Tres faixas dentro da escada pintada, com pequena variacao individual, nunca tres filas identicas. */
export function perfilDeCirculacao(x: number, fileira: number, tipo: number): { corredor: CorredorTorcida; desvio: number; velocidade: number; atraso: number } {
  const hash = misturarNumero(Math.imul(Math.floor(x),73856093) ^ Math.imul(fileira+1,19349663) ^ Math.imul(tipo+1,83492791));
  return { corredor: (hash % 3) as CorredorTorcida, desvio: (((hash >>> 8) % 101) / 100 - .5) * 5,
    velocidade: 65 * (.75 + ((hash >>> 16) % 101) / 100 * .55), atraso: 200 + hash % 1600 };
}

/** Fileira usa quadril; rota usa pes. Cada nivel vem da pintura, nao de uma grade uniforme. */
export function rotaDeSaida(origem: OrigemTorcida): PontoTorcida[] {
  const inicio = mapa.niveis.reduce((a, b) => Math.abs(b.fileiraY - origem.y) < Math.abs(a.fileiraY - origem.y) ? b : a);
  const esquerda = origem.x < mapa.largura / 2;
  const lateral = origem.setor === 'lateral-esquerda' || origem.setor === 'lateral-direita';
  const deslocamento = (n: typeof inicio): number => {
    const grupo=Math.floor((inicio.nivel-n.nivel)/2);
    const corredor=origem.variarCorredor && grupo>0
      ? misturarNumero(Math.floor(origem.x*100)^Math.imul(grupo,19349663)^(origem.corredor??1))%3
      : (origem.corredor??1);
    return (corredor-1)*(12+(12-n.nivel)*1.2)+(origem.desvio??0);
  };
  const xEscada = (n: typeof inicio): number => lateral
    ? (esquerda ? mapa.escadaExternaEsquerdaX : mapa.escadaExternaDireitaX) + deslocamento(n)
    : (esquerda ? n.escadaEsquerdaX : mapa.largura - n.escadaEsquerdaX) + deslocamento(n);
  const escala = (n: typeof inicio): number => lateral ? origem.escala + (inicio.nivel - n.nivel) * 0.012 : n.escala;
  const rota: PontoTorcida[] = [
    { x: origem.x, y: inicio.peY, nivel: inicio.nivel, escala: origem.escala, etapa: 'fileira' },
    { x: xEscada(inicio), y: inicio.peY, nivel: inicio.nivel, escala: origem.escala, etapa: 'fileira' }
  ];
  for (const n of mapa.niveis.filter((n) => n.nivel < inicio.nivel)) {
    rota.push({ x: xEscada(n), y: n.peY, nivel: n.nivel, escala: escala(n), etapa: 'escada' });
  }
  rota.push({ x: esquerda ? mapa.saidaEsquerdaX : mapa.saidaDireitaX, y: mapa.chaoZero, nivel: 0, escala: escala(mapa.niveis[12]), etapa: 'saida' });
  return rota;
}

export interface PercursoTorcida {
  rota: PontoTorcida[];
  trecho: number;
  ponto: PontoTorcida;
  concluido: boolean;
}
export function iniciarPercurso(rota: PontoTorcida[]): PercursoTorcida {
  if (rota.length < 2) throw new Error('Rota da torcida precisa de inicio e destino.');
  return { rota, trecho: 1, ponto: { ...rota[0] }, concluido: false };
}

/** Consome o tempo restante ao mudar de trecho; nunca remove um NPC em andar alto. */
export function avancarPercurso(estado: PercursoTorcida, segundos: number, velocidade = 65): void {
  let tempo = Math.max(0, segundos);
  while (tempo > 0 && !estado.concluido) {
    const alvo = estado.rota[estado.trecho];
    const dx = alvo.x - estado.ponto.x;
    const dy = alvo.y - estado.ponto.y;
    const distancia = Math.hypot(dx, dy);
    const origem = estado.rota[estado.trecho - 1];
    const rapidez = velocidade * (alvo.etapa === 'escada' ? 0.55 : 1) * (origem.escala + alvo.escala) / 2;
    if (!(rapidez > 0)) return;
    const fracao = distancia === 0 ? 1 : Math.min(1, rapidez * tempo / distancia);
    estado.ponto = {
      x: estado.ponto.x + dx * fracao,
      y: estado.ponto.y + dy * fracao,
      escala: estado.ponto.escala + (alvo.escala - estado.ponto.escala) * fracao,
      nivel: fracao === 1 ? alvo.nivel : estado.ponto.nivel,
      etapa: alvo.etapa
    };
    tempo -= distancia * fracao / rapidez;
    if (fracao < 1) break;
    estado.trecho += 1;
    if (estado.trecho === estado.rota.length) estado.concluido = estado.ponto.nivel === 0;
  }
}

/** Percentual da torcida inicial, incluindo quem ja foi encaminhado a saida. */
export function quantidadeParaSair(total: number, final: boolean, fracao = .35): number {
  return final ? total : Math.max(0, Math.ceil(total * Math.max(0, Math.min(1, fracao)) - 1e-9));
}
