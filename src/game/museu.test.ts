import { describe, expect, it } from 'vitest';

import { LUTADORES } from './lutadores';

// Regra do Escudo: a ficha fala da torcida e da cidade, nunca do nome oficial do clube.
const CLUBES = ['Flamengo', 'Fluminense', 'Vasco', 'Botafogo', 'Internacional', 'Atlético', 'Corinthians', 'Palmeiras', 'Coritiba', 'Grêmio', 'Cruzeiro', 'Santos'];

describe('Museu', () => {
  const comFicha = LUTADORES.filter((lutador) => lutador.museu);

  it('as fichas existem e têm apelido, quem é e de onde veio', () => {
    expect(comFicha.length).toBeGreaterThanOrEqual(11);
    comFicha.forEach(({ id, museu }) => {
      expect(museu!.apelido.trim(), `${id} apelido`).not.toBe('');
      expect(museu!.descricao.trim(), `${id} descricao`).not.toBe('');
      expect(museu!.historia.trim(), `${id} historia`).not.toBe('');
    });
  });

  it('sem travessão e sem nome oficial de clube (Regra do Escudo)', () => {
    comFicha.forEach(({ id, museu }) => {
      const texto = `${museu!.apelido} ${museu!.descricao} ${museu!.historia}`;
      expect(texto, `${id} travessão`).not.toMatch(/[–—]/);
      CLUBES.forEach((clube) => expect(texto.toLowerCase(), `${id} cita ${clube}`).not.toContain(clube.toLowerCase()));
    });
  });
});
