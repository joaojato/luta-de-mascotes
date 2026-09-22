# Roteiro de construção

Marcos em ordem. Cada um termina com algo que **roda no navegador** ao fim de
uma janela real (Regra do Fim de Semana). A ordem vinha do tutorial do Chong-U
(concept, sprites, gym, combate, UI e especiais, CPU). Em 17/09/2026 o João
decidiu **partir do código público do Vibe Fighter** em vez de construir o
motor com retângulos. Combate, rounds, HUD, especiais, seleção e CPU já vêm
prontos; o que falta é o que é nosso: mascotes, cenário brasileiro, Academia
e a Regra do JSON.

Estimativa contra a janela real do João (noite de dia útil com fadiga, ou fim
de semana), nunca contra horas teóricas. Se um marco não fechar na janela,
ele é quebrado em dois, não esticado.

## Estado atual

- [x] Terreno preparado (17/09/2026): template Phaser 4 + Vite + TS, contrato,
  docs, skills. `npm run check` passando.
- [x] Marco 0 (17/09/2026): Vibe Fighter do Chong-U rodando no nosso repo com
  título próprio, sprites de amostra em `_amostra-*`, `npm run check` verde
  (typecheck + 8 testes + build), fluxo inteiro verificado com prints.
- [x] Marco 1 (17/09/2026): os três lutadores de amostra vêm de
  `src/game/lutadores/*.json` (teste de ida e volta provou definição
  idêntica à do TS, depois apagado junto com o TS); cena `Academia` no menu
  com scrub de quadro e boxes; 17 testes cobram a Regra do JSON. Poda do
  starter de RPG **não feita** (custa mais que uma noite pelo tamanho do
  shell de debug); fica para quando atrapalhar.
- [ ] Marco 2, em andamento (22/09/2026): Urubu na seleção e na Academia com
  `idle` e `light-punch` reais do Spriterrific (420 dos 500 créditos grátis);
  as outras 7 ações obrigatórias apontam para o idle como placeholder. Falta:
  demais golpes (teste do Gemini com as sheets do Urubu como referência),
  retrato de verdade, cenário em camadas, decisão da ADR 0002.
- [ ] Marco 3 = v1
- [ ] Marco 4 (se sobrar tempo)

Atualizar esta lista ao fechar cada marco. É a primeira coisa que o agente lê
na sessão.

## Marco 0: base herdada rodando (fechado em 17/09/2026)

**Rodou:** splash, menu, modo (1v1 ou 1vCPU), cenário, seleção com retratos,
"Round 1... Fight!", luta com HUD, timer, melhor de 3, bloqueio geométrico,
especial com barra de meter. Dois jogadores no mesmo teclado (P1 WASD + F/G/V
+ C, P2 setas + , . L + /).

- Template Phaser apagado, código e assets do Vibe Fighter copiados.
- Sprites dos três lutadores de amostra em
  `public/assets/lutadores/_amostra-*`, GIFs de preview descartados.
- `package.json` próprio, `npm run check` = typecheck + vitest + build.
- `vitest` ignora `referencia/` e `spriterrific-runs/`.

## Marco 1: fazer o motor ser nosso (fechado em 17/09/2026)

**Rodou:** o mesmo jogo, com os três lutadores de amostra vindo de JSON e a
Academia no menu (A/D lutador, W/S ação, Espaço toca/pausa, `,` `.` quadro,
R volta ao quadro 1, 1 a 5 ligam as boxes). Poda ficou pendente.

**Roda no fim (critério original):** o mesmo jogo, mas um lutador de amostra vem de
`src/game/lutadores/<slug>.json` em vez de TS, e a cena `Academia` toca as
ações dele quadro a quadro com hit/hurt/guard box desenhadas.

- **Regra do JSON.** Extrair a lista de ações de um lutador (a forma de
  `greenBoxer.ts` é dado puro: ação, arquivo, quadros, fps, retângulos) para
  JSON, e um carregador que chama `buildFighterCharacter`. Um lutador por vez,
  jogo rodando entre cada um. Os três de amostra viram JSON até o fim do marco.
- **Academia.** O gym do Chong-U ficou fora do pacote público. Construir a
  versão magra: escolher lutador e ação, scrub de quadro, boxes desenhadas,
  frame ativo em destaque. Sem gizmo, sem salvar em arquivo: o JSON é editado
  na mão e a Academia só mostra. O código de debug já existente em
  `src/shell/` e `src/game/characterConfig.ts` pode ajudar ou atrapalhar;
  decidir lendo, não supondo.
- **Poda.** Apagar o que é resto do starter de RPG (`levelEditor.ts`,
  `tileAtlas.ts`, `tileConfig.ts`, `public/assets/tiles/`, `levels/`,
  `ui/quest/`) se sair sem quebrar o shell de debug. Se custar mais que uma
  noite, deixar e registrar.
- Mapear os 4 golpes do GDD (fraco, forte, chute, especial) nas ações que o
  motor já tem (`light-*`, `heavy-*`, `special`). Chute é `heavy-kick` ou
  ação custom. Nomes em `docs/gdd.md`.

## Marco 2: primeiro mascote de verdade (um fim de semana)

**Roda no fim:** o mascote 1 lutando contra um retângulo, no cenário 1.

- Ficha do mascote no GDD, referência, Spriterrific (usar os 500 créditos
  grátis aqui: `idle` + 4 ações, para validar o estilo antes de comprar).
- Skill `lutador-novo` de ponta a ponta. A primeira passagem vai revelar o que
  falta na skill; corrigir a skill, não contornar.
- As ações do mascote seguem os nomes que o motor já entende (`idle`,
  `walk-forward`, `walk-backward`, `crouch`, `jump`, `block-high`,
  `block-low`, `hit-high`, `light-*`, `heavy-*`, `special-charge`, `special`,
  `knockdown`). O Spriterrific gera com o nome que quisermos; o JSON traduz.
- Cenário em três camadas com parallax, no lugar do rooftop de amostra.
- Decisão ao fim deste marco, registrada em `docs/decisoes/`: o mixels
  agradou, ou vai para o plano B (PixelLab)?

## Marco 3: v1 (um fim de semana)

**Roda no fim:** a v1 do GDD. Dois mascotes, seleção de personagem, retratos,
barras estilizadas, falas de entrada e vitória, link publicado.

- Mascote 2 pela skill (agora já com crédito comprado).
- Telas de título, seleção e vitória com a nossa identidade (o motor já tem
  todas; é troca de texto, cor e retrato).
- HUD: trocar o atlas de UI de amostra por um nosso (mesmo formato, chroma
  magenta, ver prompts em `docs/pipeline-arte.md`).
- **Zero pasta `_amostra` em uso.** Só então deploy na Vercel ou GitHub
  Pages, com link que abre no celular.
- Diário e lições em dia: é o material da apresentação.

## Marco 4: se sobrar tempo

Em ordem de valor para a matéria, não de dificuldade:

1. **Ultimates** com medidor de torcida, um por mascote, como efeito em camada
   sobre o cenário (ver GDD). É a ideia que o João mais quer e a que mais
   comunica; barata porque não passa pelo Spriterrific. O motor herdado já
   tem medidor, `special-charge`, `special` multi-hit e cut-in de super
   (`src/game/superCutIn.ts`): o ultimate nasce em cima disso.
2. Torcida reagindo (som de vaia e grito conforme quem está ganhando).
3. Modo história curto: três lutas com uma fala entre elas.
4. Terceiro mascote, só por JSON + sprites, para provar a Regra do JSON.
5. Ajustar a CPU herdada ao mascote (ela já existe; é balanceamento).

## Calendário sugerido (ajustar quando o prazo entrar no briefing)

Contando a partir do fim de semana de 20/09/2026, um marco por janela:

| Janela | Marco |
|---|---|
| 17/09 (feito) | Marco 0 |
| fim de semana 20 e 21/09 | Marco 1 |
| fim de semana 27 e 28/09 | Marco 2 |
| fim de semana 4 e 5/10 | Marco 3, v1 no ar |
| outubro em diante | Marco 4 e apresentação |

Folga até 14/12 é grande de propósito. O risco não é o calendário, é parar
no meio. Por isso cada marco fecha com algo jogável e commit.
