import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { createDefaultFighterPlaygroundState, getFighterCombat } from '../fighterConfig';
import { GOLPES } from '../golpes';
import { ADVANCE_KINDS } from '../moveMechanics';
import { expandirSkins, LUTADORES, LUTADOR_CHARACTERS, type LutadorJson } from './index';
import urubuJson from './urubu.json';

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
        // Especial de projétil acerta pela entidade lançada, não pelo corpo.
        const especialDeProjetil = lutador.moves?.special?.kind === 'projectile';
        lutador.actions.forEach((spec) => {
          const golpe = spec.action.startsWith('light-') || spec.action.startsWith('heavy-') || spec.action === 'low-kick' || spec.action === 'jump-punch';
          if (golpe || (spec.action === 'special' && !especialDeProjetil)) {
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
        const aereas = ['jump', 'jump-kick', 'jump-punch', 'special', 'knockdown'];

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

  // Regra do Corpo: no chão, só o corpo apanha. Braço, perna e bengala
  // esticados não são alvo; quem alcança mais longe ganha o alcance de fato.
  it('golpe e andar no chão apanham só no corpo do idle (Regra do Corpo)', () => {
    LUTADOR_CHARACTERS.forEach((personagem) => {
      const hit = (acao: string) => personagem.animations.find((a) => a.action === acao)?.bounds[0].hit;
      const corpo = hit('idle');
      ['light-punch', 'heavy-punch', 'heavy-kick', 'low-kick', 'walk-forward'].forEach((acao) => {
        if (hit(acao)) expect(hit(acao), `${personagem.id} ${acao}`).toEqual(corpo);
      });
      const voadora = personagem.animations.find((a) => a.action === 'jump-kick');
      if (voadora) expect(voadora.bounds[0].hit, `${personagem.id} voadora`).not.toEqual(corpo);
    });
  });

  // Regra do Passo: chute e soco forte de chão dão um passo para a frente. O
  // desenho do chute inclina o tronco para trás; parado, o lutador parecia recuar.
  it('chute e soco forte de chão andam para a frente (Regra do Passo)', () => {
    LUTADORES.forEach((lutador) => {
      lutador.actions
        .filter((spec) => ['heavy-punch', 'heavy-kick', 'low-kick'].includes(spec.action))
        .forEach((spec) => {
          expect(spec.travel?.distance ?? 0, `${lutador.id} ${spec.action}`).toBeGreaterThan(0);
          expect(spec.travel!.frames[1], `${lutador.id} ${spec.action}`).toBeLessThan(spec.frames);
        });
    });
  });

  // Regra do Criador: o questionário de personagem novo acompanha o motor. Ação,
  // golpe ou tipo de especial que entra no jogo entra em docs/criador-de-personagem.md.
  it('o criador de personagem cita toda ação, golpe do catálogo e tipo de especial', () => {
    const criador = readFileSync(resolve(PUBLIC_DIR, '../docs/criador-de-personagem.md'), 'utf8');
    const nomes = new Set<string>([
      ...LUTADORES.flatMap((lutador) => lutador.actions.map((spec) => spec.action)),
      ...GOLPES.flatMap((golpe) => [...golpe.acoes, ...golpe.quebraGalho]),
      ...ADVANCE_KINDS,
      ...LUTADORES.flatMap((lutador) =>
        Object.values(lutador.moves ?? {}).flatMap((move) =>
          move && typeof move === 'object' && 'kind' in move ? [String(move.kind)] : []
        )
      )
    ]);
    const faltando = [...nomes].filter((nome) => !criador.includes(`\`${nome}\``));
    expect(faltando, 'falta no docs/criador-de-personagem.md').toEqual([]);
  });

  // Escala de dano (GDD, 29/10/2026): golpe lento rende mais que o rápido, e o
  // especial, que leva a barra inteira, é o que mais tira. Especial que já
  // atordoa (Pó de Arroz) pode tirar menos, porque abre combo.
  it('dano segue a escala do GDD em fração da vida', () => {
    const estado = createDefaultFighterPlaygroundState();
    LUTADORES.forEach((lutador) => {
      const c = getFighterCombat(estado, lutador.id);
      const fracao = (dano: number) => dano / c.maxHealth;
      expect(fracao(c.highDamage), `${lutador.id} soco rápido`).toBeGreaterThanOrEqual(0.025);
      expect(fracao(c.highDamage), `${lutador.id} soco rápido`).toBeLessThanOrEqual(0.045);
      expect(c.highDamage, `${lutador.id}`).toBeLessThan(c.lowKickDamage);
      expect(c.lowKickDamage, `${lutador.id}`).toBeLessThan(c.kickDamage);
      expect(c.kickDamage, `${lutador.id}`).toBeLessThan(c.lowDamage);
      expect(fracao(c.lowDamage), `${lutador.id} soco forte`).toBeGreaterThanOrEqual(0.09);
      const atordoa = Boolean(lutador.moves?.special?.stunMs);
      expect(fracao(c.specialDamage), `${lutador.id} especial`).toBeGreaterThanOrEqual(atordoa ? 0.07 : 0.13);
    });
  });

  it('Bahia tem o conjunto completo sem reutilizar poses provisórias entre comandos', () => {
    const bahia = LUTADORES.find((lutador) => lutador.id === 'bahia')!;
    const completas = [
      ...ACOES_OBRIGATORIAS, 'dash-forward', 'dash-back', 'block-low', 'stunned',
      'heavy-punch', 'low-kick', 'jump-punch', 'jump-kick', 'eye-laser', 'special-charge', 'special'
    ];
    expect(bahia.actions.map((acao) => acao.action)).toEqual(expect.arrayContaining(completas));
    const folhas = completas.map((nome) => bahia.actions.find((acao) => acao.action === nome)!);
    expect(new Set(folhas.map((acao) => acao.file)).size).toBe(completas.length);
    folhas.forEach((acao) => {
      expect(acao.frames, `${acao.action}: ainda é uma pose parada`).toBeGreaterThanOrEqual(4);
      expect(acao.file).not.toBe('guard-reference.png');
    });
    expect(bahia.moves?.kick?.action).toBe('eye-laser');
    expect(bahia.moves?.special?.mirror).toBe(false);
    expect(bahia.moves?.effects?.bora.frameWidth).toBe(768);
  });

  it('Almirante registra todos os movimentos em sheets próprias', () => {
    const almirante = LUTADORES.find((lutador) => lutador.id === 'almirante');
    expect(almirante).toBeTruthy();
    expect(almirante!.selecionavel).toBe(true);
    const completas = [
      ...ACOES_OBRIGATORIAS, 'block-low', 'heavy-punch', 'heavy-kick', 'jump-kick', 'shot',
      'special-charge', 'special', 'stunned', 'dash-forward', 'dash-back', 'jump-punch'
    ];
    expect(almirante!.actions.map((acao) => acao.action).sort()).toEqual(completas.sort());
    expect(new Set(almirante!.actions.map((acao) => acao.file)).size).toBe(completas.length);
    expect(almirante!.assetRoot).toBe('/assets/lutadores/almirante/base');
    expect(almirante!.actions.every((acao) => !acao.file.includes('..'))).toBe(true);
  });

  describe('skins (variantes visuais do mesmo mascote)', () => {
    // Nada aqui cita pasta por nome: a base troca quando um modelo novo fica
    // pronto (a `frente` virou base em 22/09), e o teste não pode ir junto.
    // O elenco atual não tem mascote com duas skins (as variantes foram para
    // `arquivo/`), então a regra é cobrada num mascote de teste: o Urubu com
    // uma skin inventada, que herda quase tudo e traz uma ação só dela.
    const idleBase = urubuJson.actions.find((acao) => acao.action === 'idle')!;
    const fixture = {
      ...urubuJson,
      skins: [
        urubuJson.skins[0],
        {
          id: 'teste',
          label: 'Teste',
          pasta: 'teste',
          sobrescreve: ['portrait.png'],
          acoes: {
            idle: { ...idleBase, file: 'idle.png', frames: 2 },
            'so-na-skin': { ...idleBase, label: 'Só na skin', file: 'so-na-skin.png' }
          }
        }
      ]
    } as unknown as LutadorJson;
    const expandidos = expandirSkins(fixture);
    const mascote = expandidos[0];
    const [base, variante] = fixture.skins ?? [];
    const raiz = fixture.assetRoot;
    const expandida = expandidos[1] as LutadorJson & { anchorFile?: string; portraitFile?: string };

    it('o mascote entra na seleção só uma vez, pela base', () => {
      const selecionaveis = expandidos.filter((lutador) => lutador.selecionavel !== false);
      expect(selecionaveis.map((lutador) => lutador.id)).toEqual([mascote?.id]);
      expect(selecionaveis[0]?.label, 'a base aparece pelo nome do mascote').toBe(mascote?.label);
      expect(selecionaveis[0]?.assetRoot).toBe(`${raiz}/${base?.pasta}`);
    });

    it('a skin extra vira um lutador próprio, fora da seleção', () => {
      expect(expandida, `${mascote?.id}-${variante?.id} não foi registrado`).toBeTruthy();
      expect(expandida?.selecionavel).toBe(false);
      expect(expandida?.assetRoot).toBe(`${raiz}/${variante?.pasta}`);
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
