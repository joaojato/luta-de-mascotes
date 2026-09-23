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

      // Regra da Régua do Idle: o mascote não cresce nem encolhe de uma ação
      // para a outra, e o pé cai sempre na mesma linha. O `idle` é a régua.
      // Quem sai do chão pode subir, mas ninguém afunda no piso.
      it('toda ação pisa na linha do idle (Regra da Régua)', () => {
        const idle = lutador.actions.find((spec) => spec.action === 'idle');
        const chao = (idle?.defaultVisual.y ?? 0) + (idle?.defaultVisual.height ?? 0);
        const aereas = ['jump', 'special', 'knockdown'];

        lutador.actions.forEach((spec) => {
          const linha = spec.defaultVisual.y + spec.defaultVisual.height;
          expect(linha, `${spec.action}: afundou ${linha - chao}px no chão`).toBeLessThanOrEqual(
            chao + 2
          );
          if (!aereas.includes(spec.action)) {
            expect(linha, `${spec.action}: pé fora da linha do idle`).toBeGreaterThanOrEqual(
              chao - 2
            );
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
    // Nada aqui cita pasta por nome: a base troca quando um modelo novo fica
    // pronto (a `frente` virou base em 22/09), e o teste não pode ir junto.
    const mascote = LUTADORES.find((lutador) => lutador.id === 'urubu');
    const [base, variante] = mascote?.skins ?? [];
    const expandida = LUTADORES.find(
      (lutador) => lutador.id === `urubu-${variante?.id}`
    ) as (typeof LUTADORES)[number] & { anchorFile?: string; portraitFile?: string };

    it('o mascote entra na seleção só uma vez, pela base', () => {
      const selecionaveis = LUTADORES.filter(
        (lutador) => lutador.id.startsWith('urubu') && lutador.selecionavel !== false
      );
      expect(selecionaveis.map((lutador) => lutador.id)).toEqual(['urubu']);
      expect(selecionaveis[0]?.label, 'a base aparece pelo nome do mascote').toBe(mascote?.label);
      expect(selecionaveis[0]?.assetRoot).toBe(`/assets/lutadores/urubu/${base?.pasta}`);
    });

    it('a skin extra vira um lutador próprio, fora da seleção', () => {
      expect(expandida, `urubu-${variante?.id} não foi registrado`).toBeTruthy();
      expect(expandida?.selecionavel).toBe(false);
      expect(expandida?.assetRoot).toBe(`/assets/lutadores/urubu/${variante?.pasta}`);
      expect(expandida?.label).toContain(variante?.label ?? '');
    });

    // A regra, não um arquivo específico: a lista de ações próprias cresce a
    // cada sheet nova, e o teste não pode quebrar por isso.
    it('o que a skin declara vem dela, o resto vem da base', () => {
      const arquivos = new Set(variante?.sobrescreve ?? []);
      const proprias = variante?.acoes ?? {};
      expect(Object.keys(proprias).length, 'a skin precisa ter ação própria').toBeGreaterThan(0);

      const conferirArquivo = (caminho: string | undefined, nome: string): void => {
        expect(caminho, `${nome} sem caminho`).toBe(
          arquivos.has(nome) ? nome : `../${base?.pasta}/${nome}`
        );
      };

      conferirArquivo(expandida?.anchorFile, 'anchor-w.png');
      conferirArquivo(expandida?.portraitFile, 'portrait.png');

      expandida?.actions.forEach((spec) => {
        const propria = proprias[spec.action];
        const naBase = mascote?.actions.find((outra) => outra.action === spec.action);
        if (propria) {
          expect(spec.file, `${spec.action} é próprio da skin`).not.toContain('../');
          expect(spec.frames, `${spec.action} usa os quadros da skin`).toBe(propria.frames);
        } else {
          expect(spec.file, `${spec.action} é herdado`).toBe(`../${base?.pasta}/${naBase?.file}`);
          expect(spec.frames, `${spec.action} usa os quadros da base`).toBe(naBase?.frames);
        }
      });
    });

    // A sheet chega para o modelo novo antes de existir na base. Se a ação
    // só entrar pela lista da base, ela fica no JSON e nunca vira animação.
    it('ação que só a skin tem entra na lista da skin', () => {
      const naSkin = expandida?.actions.map((spec) => spec.action) ?? [];

      Object.keys(variante?.acoes ?? {})
        .filter((nome) => !mascote?.actions.some((acao) => acao.action === nome))
        .forEach((nome) => expect(naSkin, `${nome} não chegou no motor`).toContain(nome));
    });
  });

  it('monta uma definição por JSON, na mesma ordem', () => {
    expect(LUTADOR_CHARACTERS.map((character) => character.id)).toEqual(LUTADORES.map((lutador) => lutador.id));
  });
});
