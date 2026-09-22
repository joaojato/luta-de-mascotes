import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { LUTADORES, LUTADOR_CHARACTERS } from './index';

// Ações que o motor resolve pelo nome sem fallback (ver `resolveActionKeys`
// em fighter.ts). Um lutador sem uma delas quebra na luta. As outras
// (`block-low`, `heavy-*`, `special-charge`, `special`) caem num substituto.
const ACOES_OBRIGATORIAS = [
  'idle',
  'walk-forward',
  'walk-backward',
  'crouch',
  'jump',
  'block-high',
  'hit-high',
  'light-punch',
  'knockdown'
];

const PUBLIC_DIR = resolve(__dirname, '../../../public');

describe('registro de lutadores (Regra do JSON)', () => {
  it('tem pelo menos um lutador e ids únicos', () => {
    expect(LUTADORES.length).toBeGreaterThan(0);
    expect(new Set(LUTADORES.map((lutador) => lutador.id)).size).toBe(LUTADORES.length);
  });

  LUTADORES.forEach((lutador) => {
    describe(lutador.id, () => {
      const acoes = lutador.actions.map((spec) => spec.action);

      it('tem as ações que o motor exige', () => {
        ACOES_OBRIGATORIAS.forEach((acao) => expect(acoes, `falta ${acao}`).toContain(acao));
      });

      it('não repete ação', () => {
        expect(new Set(acoes).size).toBe(acoes.length);
      });

      it('quadros de ataque e guarda cabem na animação', () => {
        lutador.actions.forEach((spec) => {
          const janelas = [spec.attack, ...(spec.attackSpans ?? [])].filter(Boolean);
          janelas.forEach((janela) => {
            janela!.frames.forEach((frame) => {
              expect(frame, `${spec.action}: quadro ${frame}`).toBeGreaterThanOrEqual(0);
              expect(frame, `${spec.action}: quadro ${frame}`).toBeLessThan(spec.frames);
            });
          });
          expect(spec.frames, `${spec.action}: frames`).toBeGreaterThan(0);
          expect(spec.frameRate, `${spec.action}: frameRate`).toBeGreaterThan(0);
        });
      });

      it('golpes têm hitbox e bloqueios têm guard box', () => {
        lutador.actions.forEach((spec) => {
          if (spec.action.startsWith('light-') || spec.action.startsWith('heavy-') || spec.action === 'special') {
            expect(spec.attack ?? spec.attackSpans, `${spec.action} sem attack`).toBeTruthy();
          }
          if (spec.action.startsWith('block-')) {
            expect(spec.guard, `${spec.action} sem guard`).toBeTruthy();
          }
        });
      });

      it('todas as sheets, o âncora e o retrato existem em public/', () => {
        const pasta = resolve(PUBLIC_DIR, `.${lutador.assetRoot}`);
        // Skin herdada aponta para a pasta da base (`../costas/idle.png`);
        // `resolve` normaliza igual ao navegador.
        const comArquivos = lutador as typeof lutador & { anchorFile?: string; portraitFile?: string };
        [
          comArquivos.anchorFile ?? 'anchor-w.png',
          comArquivos.portraitFile ?? 'portrait.png',
          ...lutador.actions.map((spec) => spec.file)
        ].forEach((arquivo) => {
          expect(existsSync(resolve(pasta, arquivo)), `${lutador.assetRoot}/${arquivo}`).toBe(true);
        });
      });
    });
  });

  describe('skins (variantes visuais do mesmo mascote)', () => {
    it('a skin extra vira um lutador próprio, fora da seleção', () => {
      const frente = LUTADORES.find((lutador) => lutador.id === 'urubu-frente');
      expect(frente, 'urubu-frente não foi registrado').toBeTruthy();
      expect(frente?.selecionavel).toBe(false);
      expect(frente?.assetRoot).toBe('/assets/lutadores/urubu/frente');
    });

    // A regra, não um arquivo específico: a lista `sobrescreve` cresce a cada
    // sheet nova, e o teste não pode quebrar por isso.
    it('arquivo em `sobrescreve` vem da skin, o resto vem da base', () => {
      const urubu = LUTADORES.find((lutador) => lutador.id === 'urubu');
      const frente = LUTADORES.find((lutador) => lutador.id === 'urubu-frente') as
        | (typeof LUTADORES)[number] & { anchorFile?: string; portraitFile?: string }
        | undefined;
      const skin = urubu?.skins?.find((variante) => variante.pasta === 'frente');
      const proprios = new Set(skin?.sobrescreve ?? []);
      expect(proprios.size, 'a skin precisa declarar o que tem').toBeGreaterThan(0);

      const conferir = (arquivo: string | undefined, nome: string): void => {
        expect(arquivo, `${nome} sem caminho`).toBeTruthy();
        if (proprios.has(nome)) {
          expect(arquivo, `${nome} é próprio`).toBe(nome);
        } else {
          expect(arquivo, `${nome} é herdado`).toBe(`../costas/${nome}`);
        }
      };

      conferir(frente?.anchorFile, 'anchor-w.png');
      conferir(frente?.portraitFile, 'portrait.png');
      frente?.actions.forEach((spec) => {
        const nome = spec.file.split('/').pop() as string;
        conferir(spec.file, nome);
      });
    });
  });

  it('monta uma definição por JSON, na mesma ordem', () => {
    expect(LUTADOR_CHARACTERS.map((character) => character.id)).toEqual(LUTADORES.map((lutador) => lutador.id));
  });
});
