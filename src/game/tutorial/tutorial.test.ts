import { describe, expect, it } from 'vitest';

import { CONTROLES_PADRAO } from '../controles';
import { FUNCOES_PADRAO, PREFERENCIAS_PADRAO } from '../../toque/preferencias';
import { jaViuTutorial, marcarTutorialVisto } from './primeiraVez';
import { escolherRival, regiaoDe } from './rival';
import { trocarMarcadores } from './teclas';

/** Storage de mentira, igual ao do navegador no que importa. */
function memoria(): Storage {
  const dados = new Map<string, string>();
  return {
    get length() {
      return dados.size;
    },
    clear: () => dados.clear(),
    getItem: (chave) => dados.get(chave) ?? null,
    key: (i) => [...dados.keys()][i] ?? null,
    removeItem: (chave) => void dados.delete(chave),
    setItem: (chave, valor) => void dados.set(chave, valor)
  };
}

describe('primeira visita', () => {
  it('sem marca é a primeira vez; depois de marcar, não é mais', () => {
    const storage = memoria();
    expect(jaViuTutorial(storage)).toBe(false);
    marcarTutorialVisto(storage);
    expect(jaViuTutorial(storage)).toBe(true);
  });
});

describe('rival da CPU no tutorial', () => {
  const elenco = [
    { id: 'urubu', estado: 'RJ', rival: 'almirante' },
    { id: 'almirante', estado: 'RJ', rival: 'urubu' },
    { id: 'cartola', estado: 'RJ', rival: 'urubu' },
    { id: 'porco', estado: 'SP' },
    { id: 'galo', estado: 'MG' },
    { id: 'saci', estado: 'RS' },
    { id: 'coxa', estado: 'PR' },
    { id: 'bahia', estado: 'BA' }
  ];
  const primeiro = () => 0;

  it('pega o clássico declarado', () => {
    expect(escolherRival('urubu', elenco, primeiro)).toBe('almirante');
    expect(escolherRival('cartola', elenco, primeiro)).toBe('urubu');
  });

  it('sem clássico, alguém do mesmo estado; depois da mesma região', () => {
    const semRival = elenco.map(({ id, estado }) => ({ id, estado }));
    expect(['almirante', 'cartola']).toContain(escolherRival('urubu', semRival, primeiro));
    // Galo (MG) não tem ninguém de MG: sai alguém do Sudeste.
    expect(['urubu', 'almirante', 'cartola', 'porco']).toContain(escolherRival('galo', elenco, primeiro));
    expect(['saci']).toContain(escolherRival('coxa', elenco, primeiro));
  });

  it('sozinho na região, sorteia entre os outros e nunca repete o jogador', () => {
    const sorteado = escolherRival('bahia', elenco, () => 0.99);
    expect(sorteado).not.toBe('bahia');
    expect(elenco.map(({ id }) => id)).toContain(sorteado);
  });

  it('clássico que não está no elenco não vale', () => {
    expect(escolherRival('urubu', [{ id: 'urubu', estado: 'RJ', rival: 'ninguem' }, { id: 'porco', estado: 'SP' }], primeiro)).toBe('porco');
  });

  it('região de cada UF', () => {
    expect(regiaoDe('RJ')).toBe('sudeste');
    expect(regiaoDe('RS')).toBe('sul');
    expect(regiaoDe('BA')).toBe('nordeste');
    expect(regiaoDe('GO')).toBe('centro-oeste');
    expect(regiaoDe('AM')).toBe('norte');
    expect(regiaoDe('XX')).toBeNull();
  });
});

describe('teclas nos textos do tutorial', () => {
  const teclado = { toque: false as const, botoes: CONTROLES_PADRAO.p1, olhando: 1 as const };

  it('troca cada marcador pela tecla salva', () => {
    expect(trocarMarcadores('Se movimente com {esquerda} e {direita}.', teclado)).toBe('Se movimente com "A" e "D".');
    expect(trocarMarcadores('Aperte {especial}', teclado)).toBe('Aperte "Espaço"');
  });

  it('usa o remapeamento', () => {
    const botoes = { ...CONTROLES_PADRAO.p1, light: 'J', left: 'LEFT' };
    expect(trocarMarcadores('{soco} e {esquerda}', { ...teclado, botoes })).toBe('"J" e "←"');
  });

  it('frente e trás dependem de para onde o jogador olha', () => {
    expect(trocarMarcadores('{frente} {tras}', teclado)).toBe('"D" "A"');
    expect(trocarMarcadores('{frente} {tras}', { ...teclado, olhando: -1 })).toBe('"A" "D"');
  });

  it('no celular, direcional e o nome do botão de cada golpe na cara escolhida', () => {
    const toque = { toque: true as const, preferencias: PREFERENCIAS_PADRAO, olhando: 1 as const };
    expect(trocarMarcadores('{esquerda} {pular} {soco} {especial}', toque)).toBe('"direcional ←" "direcional ↑" "A" "Y"');
    const ps = { ...toque, preferencias: { ...PREFERENCIAS_PADRAO, cara: 'playstation' as const, funcoes: { ...FUNCOES_PADRAO, baixo: 'heavy' as const, esquerda: 'light' as const } } };
    expect(trocarMarcadores('{soco} {chute} {defesa}', ps)).toBe('"Quadrado" "Xis" "Bola"');
  });

  it('marcador desconhecido fica como está', () => {
    expect(trocarMarcadores('{nada}', teclado)).toBe('{nada}');
  });
});
