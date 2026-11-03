import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import type { Textures } from 'phaser';
import { describe, expect, it } from 'vitest';
import { prepararFrenteEstadio, QUADRO_ESTADIO_INTEIRO, QUADRO_FRENTE_ESTADIO } from './torcidaFundo';

// Classe real do Phaser, sem Game/DOM/GPU. Somente a fonte de pixels e substituida por suas medidas.
const require = createRequire(import.meta.url);
const Texture = require(resolve(__dirname, '../../node_modules/phaser/src/textures/Texture.js')) as { prototype: Textures.Texture };
function texturaEstadio(): Textures.Texture {
  const textura = Object.create(Texture.prototype) as Textures.Texture;
  Object.assign(textura, { frames: {}, source: [{ width: 2048, height: 869, image: { width: 2048, height: 869 } }], firstFrame: '__BASE', frameTotal: 0 });
  textura.add('__BASE', 0, 0, 0, 2048, 869);
  return textura;
}

describe('fundo inteiro ao reutilizar o estadio entre lutas', () => {
  it('reproduz a regressao: primeiro recorte muda o frame implicito do Phaser', () => {
    const textura = texturaEstadio();
    expect(textura.get().height).toBe(869);
    textura.add(QUADRO_FRENTE_ESTADIO, 0, 0, 624, 2048, 245);
    expect(textura.get().name).toBe(QUADRO_FRENTE_ESTADIO);
    expect(textura.get().height).toBe(245);
  });

  it('mantem fundo e recorte corretos em duas lutas com a mesma textura', () => {
    const textura = texturaEstadio();
    for (let luta = 0; luta < 2; luta++) {
      const frente = prepararFrenteEstadio(textura, 624);
      expect(textura.get().name).toBe(QUADRO_ESTADIO_INTEIRO);
      expect(textura.get().height).toBe(869);
      expect(textura.get(frente).cutY).toBe(624);
      expect(textura.get(frente).height).toBe(245);
      expect(textura.get(QUADRO_ESTADIO_INTEIRO).cutY).toBe(0);
    }
  });

  it('recupera o cache que ja ficou com o alambrado como quadro padrao', () => {
    const textura = texturaEstadio();
    textura.add(QUADRO_FRENTE_ESTADIO, 0, 0, 624, 2048, 245);
    const total = textura.frameTotal;
    prepararFrenteEstadio(textura, 624);
    expect(textura.frameTotal).toBe(total);
    expect(textura.firstFrame).toBe(QUADRO_ESTADIO_INTEIRO);
    expect(textura.get().height).toBe(869);
  });
});
