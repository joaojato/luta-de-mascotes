import {readFileSync} from 'node:fs';
import {describe,expect,it} from 'vitest';
import cadeiras from './torcidaDados/cadeiras-camadas-v5.json';
import humores from './torcidaDados/humores-v5.json';
import circulacao from './torcidaDados/circulacao-v4.json';

describe('dados importaveis da torcida',()=>{
  for(const [arquivo,dados] of Object.entries({'cadeiras-camadas-v5.json':cadeiras,'humores-v5.json':humores,'circulacao-v4.json':circulacao})){
    it(`mantem ${arquivo} alinhado ao manifesto publico de arte`,()=>{
      const original=JSON.parse(readFileSync(new URL(`../../public/assets/cenarios/estadio/torcida/${arquivo}`,import.meta.url),'utf-8'));
      expect(dados).toEqual(original);
    });
  }
});
