import { describe, expect, it } from 'vitest';
import { carregarAjustes, salvarAjustes, sanitizarAjustes } from './ajustesDev';

function memoria(): Storage {
  const dados = new Map<string, string>();
  return {
    getItem: (k: string) => dados.get(k) ?? null,
    setItem: (k: string, v: string) => void dados.set(k, v),
    removeItem: (k: string) => void dados.delete(k),
    clear: () => dados.clear(),
    key: () => null,
    length: 0
  };
}

describe('ajustes da Academia', () => {
  it('guarda só números válidos por mascote', () => {
    expect(sanitizarAjustes({ urubu: { maxHealth: 150, highDamage: 'x', lowDamage: Infinity } })).toEqual({ urubu: { maxHealth: 150 } });
    expect(sanitizarAjustes('lixo')).toEqual({});
  });
  it('salva e carrega do armazenamento', () => {
    const storage = memoria();
    salvarAjustes({ saci: { meterSeconds: 20 } }, storage);
    expect(carregarAjustes(storage)).toEqual({ saci: { meterSeconds: 20 } });
  });
});
