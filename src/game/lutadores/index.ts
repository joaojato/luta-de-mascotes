import type { CharacterDefinition } from '../hero';
import { buildFighterCharacter, type FighterActionSpec } from '../fighterCharacter';
import type { FighterCombat, FighterStats } from '../types';

import urubu from './urubu.json';
import redBrawler from './red-brawler.json';
import greenBoxer from './green-boxer.json';
import jiujitsuFighter from './jiujitsu-fighter.json';

/**
 * Regra do JSON: lutador é dado, não classe. Um arquivo por mascote aqui
 * dentro, com as ações (sheet, quadros, fps, boxes) e os ajustes de stats e
 * combate. O motor nunca conhece um mascote pelo nome.
 */
export interface LutadorJson {
  id: string;
  label: string;
  /** Pasta pública das sheets, ex. `/assets/lutadores/urubu`. */
  assetRoot: string;
  anchorUsage?: string;
  /** Falso tira o lutador da tela de seleção (fica só na Academia). Padrão: verdadeiro. */
  selecionavel?: boolean;
  /**
   * Variantes visuais do mesmo mascote (roupa, modelo de desenho). Cada uma é
   * uma subpasta de `assetRoot`. A **primeira é a base**: é dela que vem todo
   * arquivo que as outras não declararem em `sobrescreve`. Serve para comparar
   * modelos lado a lado na Academia sem jogar o anterior fora.
   */
  skins?: LutadorSkin[];
  /** Sobrescreve `DEFAULT_FIGHTER_STATS` só nos campos presentes. */
  stats?: Partial<FighterStats>;
  /** Sobrescreve `DEFAULT_FIGHTER_COMBAT` só nos campos presentes. */
  combat?: Partial<FighterCombat>;
  actions: FighterActionSpec[];
}

/** Uma variante visual: subpasta de `assetRoot` e o que ela troca da base. */
export interface LutadorSkin {
  /** Sufixo do id (`urubu` + `-frente`). A base não ganha sufixo. */
  id: string;
  label: string;
  /** Subpasta dentro do `assetRoot` do lutador, ex. `frente`. */
  pasta: string;
  /**
   * Arquivos soltos que esta skin tem de verdade (`anchor-w.png`,
   * `portrait.png`). O que não estiver aqui vem da skin base.
   */
  sobrescreve?: string[];
  /**
   * Ações que esta skin tem próprias, com os números dela. Cada sheet tem
   * sua contagem de quadros e sua caixa, então não dá para compartilhar com
   * a base: o `idle` de um modelo pode ter 4 quadros e o do outro 10.
   * O que não estiver aqui é herdado da base, arquivo e números.
   */
  acoes?: Record<string, Partial<FighterActionSpec>>;
  /** Padrão: só a base entra na seleção; as outras ficam na Academia. */
  selecionavel?: boolean;
}

/**
 * Expande um lutador com `skins` em uma definição por skin. A base fica com o
 * id original; as outras ganham `-<skin>`. Arquivo herdado vira caminho
 * relativo para a pasta da base (`../costas/idle.png`), que o navegador e o
 * teste normalizam igual.
 * @param lutador - O JSON do mascote, com ou sem skins.
 */
function expandirSkins(lutador: LutadorJson): LutadorJson[] {
  const skins = lutador.skins;
  if (!skins || skins.length === 0) {
    return [lutador];
  }

  const [base, ...extras] = skins;
  const raizBase = `${lutador.assetRoot}/${base.pasta}`;

  const definicaoBase: LutadorJson = {
    ...lutador,
    assetRoot: raizBase,
    // A base é o mascote: na seleção ele aparece pelo nome, sem o modelo
    // entre parênteses. O sufixo fica só nas variantes, que vivem na Academia.
    label: lutador.label,
    selecionavel: base.selecionavel ?? lutador.selecionavel ?? true
  };

  const definicoesExtras = extras.map((skin) => {
    const tem = new Set(skin.sobrescreve ?? []);
    const daBase = (arquivo: string): string =>
      tem.has(arquivo) ? arquivo : `../${base.pasta}/${arquivo}`;

    return {
      ...lutador,
      id: `${lutador.id}-${skin.id}`,
      label: `${lutador.label} (${skin.label})`,
      assetRoot: `${lutador.assetRoot}/${skin.pasta}`,
      selecionavel: skin.selecionavel ?? false,
      actions: [
        ...lutador.actions.map((acao) => {
          const propria = skin.acoes?.[acao.action];
          // Ação própria traz os números dela e o arquivo na pasta da skin;
          // sem ela, herda tudo da base, inclusive o caminho.
          return propria
            ? { ...acao, ...propria, file: propria.file ?? `${acao.action}.png` }
            : { ...acao, file: `../${base.pasta}/${acao.file}` };
        }),
        // Ação que só esta skin tem: a sheet chegou para o modelo novo antes
        // de existir na base. Sem isto ela fica no JSON e nunca entra no jogo.
        ...Object.entries(skin.acoes ?? {})
          .filter(([nome]) => !lutador.actions.some((acao) => acao.action === nome))
          .map(
            ([nome, propria]) =>
              ({ ...propria, action: nome, file: propria.file ?? `${nome}.png` }) as FighterActionSpec
          )
      ],
      anchorFile: daBase('anchor-w.png'),
      portraitFile: daBase('portrait.png')
    } satisfies LutadorJson & { anchorFile: string; portraitFile: string };
  });

  return [definicaoBase, ...definicoesExtras];
}

/** Ordem de registro = ordem na seleção. O primeiro é o padrão dos debugs. */
export const LUTADORES: LutadorJson[] = [urubu, redBrawler, greenBoxer, jiujitsuFighter].flatMap(
  expandirSkins
);

export const LUTADOR_CHARACTERS: CharacterDefinition[] = LUTADORES.map(buildLutador);

export const LUTADOR_STAT_OVERRIDES: Record<string, Partial<FighterStats>> = Object.fromEntries(
  LUTADORES.map((lutador) => [lutador.id, lutador.stats ?? {}])
);

export const LUTADOR_COMBAT_OVERRIDES: Record<string, Partial<FighterCombat>> = Object.fromEntries(
  LUTADORES.map((lutador) => [lutador.id, lutador.combat ?? {}])
);

/**
 * Monta a definição completa de um lutador a partir do JSON.
 * @param lutador - O JSON já importado.
 */
export function buildLutador(lutador: LutadorJson): CharacterDefinition {
  const comArquivos = lutador as LutadorJson & { anchorFile?: string; portraitFile?: string };

  return buildFighterCharacter({
    id: lutador.id,
    label: lutador.label,
    assetRoot: lutador.assetRoot,
    anchorUsage: lutador.anchorUsage ?? `${lutador.label.toLowerCase()} west-facing anchor`,
    anchorFile: comArquivos.anchorFile,
    portraitFile: comArquivos.portraitFile,
    actions: lutador.actions
  });
}
