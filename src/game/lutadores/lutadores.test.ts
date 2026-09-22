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

    it('a skin usa o que tem e herda o resto da base', () => {
      const frente = LUTADORES.find((lutador) => lutador.id === 'urubu-frente') as
        | (typeof LUTADORES)[number] & { anchorFile?: string }
        | undefined;
      expect(frente?.anchorFile, 'âncora própria').toBe('anchor-w.png');
      const idle = frente?.actions.find((spec) => spec.action === 'idle');
      expect(idle?.file, 'idle herdado da base').toBe('../costas/idle.png');
    });
  });

  it('monta uma definição por JSON, na mesma ordem', () => {
    expect(LUTADOR_CHARACTERS.map((character) => character.id)).toEqual(LUTADORES.map((lutador) => lutador.id));
  });
});
