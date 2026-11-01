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
  as outras 7 ações obrigatórias apontam para o idle como placeholder.
  Cenário "Estádio" na tela de escolha, em duas camadas (céu fixo e
  arquibancada que anda), arte do João no Nano Banana. A skin `frente`
  (modelo novo, gerada pelo Codex) fechou as 13 ações do motor em 22/09 e
  virou a base: na seleção há um Urubu só, e o modelo de perfil ficou como
  variante de Academia. Falta: conferir as 13 na Academia, retrato de
  verdade, torcida animada (fora da v1), decisão da ADR 0002.
- [ ] Arte do Almirante (09/10/2026): 14 ações e 102 quadros, retrato e
  âncora gerados com as poses do Green Boxer; chute complementar do Red
  Brawler. JSON registrado na Academia, prévia animada e prancha de poses.
  Check com 80 testes aprovado. Almirante liberado na seleção por pedido
  do João. Revisão visual continua possível na Academia; Marco 2 permanece aberto.
- [ ] Cartola e Cachorro (27/10/2026): pacotes de arte dos amigos entram
  jogáveis na seleção, 11 ações cada, especial provisório no molde do Green
  Boxer. Testado em luta no navegador. Falta: conferir na Academia, ficha
  completa no GDD, redesenho do soco forte e da reação do Cartola.
- [x] Fora de ordem, por ordem do João (01/10/2026): **controle pelo
  corpo**. O celular vira câmera por QR code, lê o corpo com MediaPipe e
  manda para o jogo no PC; teclado continua valendo. Testado com celular
  simulado: o Urubu anda, defende, soca, chuta e tira vida da CPU. Falta o
  teste com celular e gente de verdade (`npm run dev:celular`, menu Celular).
- [ ] Golpes e Academia (27/10/2026): catálogo de golpes com regras de
  guarda, esquiva e armadura; voadora, soco no ar, chute baixo (sem sheet
  ainda); Academia com abas Golpes, Botões e Ajustes. Falta: mecânica dos
  especiais novos do Codex (meteoro do Urubu, bicada do Galo, Bira) e as
  sheets `low-kick`, `jump-kick`, `jump-punch`.
- [ ] Marco 3 = v1
- [ ] Marco 4 (se sobrar tempo)
- [ ] Tarefa futura, pedida pelo João em 27/10/2026: **redesenhar os
  especiais do Urubu e de todos no mesmo molde** (Cartola, Cachorro, Galo).
  Hoje são genéricos e não fazem nada de próprio; cada um precisa de uma
  mecânica que diga quem é o mascote, como a caravela do Almirante e o
  tornado do Saci.
- [x] Build para a Vercel (29/10/2026): publicado em
  https://luta-de-mascotes.vercel.app, só Jogar e Ajustes. Academia e
  Celular ficam no `npm run dev` (`FERRAMENTAS_DE_DEV`). Público antes da
  autorização do Chong-U (ADR 0006). Republicar: `npx vercel build --prod`
  e `npx vercel deploy --prebuilt --prod`, os dois com
  `--global-config ~/.vercel-pessoal`. Falta: mensagem ao Chong-U e
  conectar o GitHub na Vercel para deploy a cada push.
- [ ] Esquadrão, o Bahia (29/10/2026): na seleção com corte de mão aberta,
  laser dos olhos, Bora Bahêa que cresce com a distância e o corpo da v12
  (idle, andar, defesas, pulo, apanhar, tonto, queda). Falta: dash, chute
  baixo, soco no ar e voadora (Codex produzindo), retrato, nome final.
- [x] Torcida dividida (29/10/2026): arquibancada da Luta com a metade do
  P1 e a do P2 nas cores e estampas dos clubes (camisas, bandeiras,
  fumaça), cada torcedor balançando no próprio ritmo. Arte do Codex,
  contrato em `docs/torcida-dividida.md`. Os menus seguem com a pintura antiga.
- [ ] Porco (29/10/2026): na seleção com a arte do Codex (mordida, coice,
  vômito). Falta: `stunned`, `knockdown`, retrato, corrida antes do coice
  (motor), falas e rival.
- [x] **Pelada e Torneios** (31/10/2026, pedido do João): menu com Pelada
  (o amistoso de antes) e Torneios; dificuldade numa tela própria, com
  Fácil bem mais burra e Difícil bem mais esperta; casa "?" na seleção;
  mata-mata e pontos corridos de 8 contra a CPU (16 travado até haver 16
  lutadores), salvos no navegador. Falta: arte dos cartões e do troféu
  (pedido ao Codex), teste no celular.
- [ ] **Versão jogável no celular** (pedida em 29/10, feita em 30/10/2026):
  deitado, sem rolagem, tela cheia, setas ou joystick à esquerda e soco,
  chute, bloqueio e especial à direita; só 1 VS CPU no toque. Contrato em
  `docs/mobile.md`. Testado no iPhone pelo João; rodada 2 (31/10/2026)
  corrigiu tela cheia com HUD visível, losango do PlayStation, lupa e zoom
  do iPhone, menu hambúrguer e botões ajustáveis; rodada 3 (01/11/2026)
  trocou para Xbox por padrão (PlayStation no menu), A confirma e B volta
  nos menus, nome do golpe da vez e opacidade dos controles. Falta: o João
  confirmar as rodadas 2 e 3 no iPhone (depende de publicar).
- [ ] **Treino livre** (01/11/2026): Academia, tecla T. Luta sem relógio e
  sem fim, vida volta 2 s depois do último golpe, troca de P1 e P2 na hora,
  CPU liga e desliga. Testado no navegador. Falta: o João jogar.
- [ ] Tarefa futura, pedida pelo João em 29/10/2026: **multiplayer** (dois
  jogadores em máquinas diferentes). A luta com celular como câmera não
  pareceu funcionar na prática; o caminho de multiplayer será estudado à
  parte.

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
6. Ideia do João (29/10/2026): **carga diferente por especial**. Hoje toda
   barra enche no mesmo tempo; especial mais forte demoraria mais.
7. Ideia do João (29/10/2026): **Bahia com o Super-Homem** como mascote
   lutador (a base de arte já foi escolhida, ver `docs/revisao-golpes-v2.md`).
8. Ideia do João (29/10/2026): **museu dos mascotes**, uma tela com a
   história de cada mascote (origem, clube, curiosidades).

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
