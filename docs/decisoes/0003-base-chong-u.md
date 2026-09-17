# ADR 0003: Vibe Fighter do Chong-U como base do código

**Data:** 2026-09-17
**Status:** aceito

## Contexto

O roteiro original previa construir o motor de luta do zero, com retângulos
(Marco 0 e 1, duas janelas de trabalho), antes de qualquer arte. No mesmo dia
em que o terreno ficou pronto, o João pediu para clonar o jogo de luta do
Chong-U, que os docs davam como "clube pago". Conferido: o jogo principal é
**público** em `github.com/chongdashu/vibe-fighter` (também distribuído como
ZIP por cadastro de e-mail), **sem arquivo de licença**. Só os gyms de
desenvolvimento e o tutorial ficam atrás do clube.

O que o pacote público tem: Phaser 4.0.0 (mesma versão do nosso terreno),
Vite 8, TypeScript 6, vitest; três lutadores com sprite sheets, retratos e
config por ação em TS; combate com hit/hurt/guard box por quadro; melhor de
3 com timer; HUD por atlas; especial com medidor e cut-in; seleção de
personagem; dois jogadores no mesmo teclado e modo contra CPU. `npm run build`
e os 8 testes passaram como veio.

O risco real do projeto não é técnico, é motivação. Ver uma luta rodando na
primeira noite pesa mais que a pureza de um motor próprio.

## Decisão

**O código do Vibe Fighter vira a base do Luta de Mascotes.** O template
Phaser foi apagado e substituído por `src/`, `public/`, `index.html`,
`tsconfig.json`, `vite.config.ts` e `package.json` dele, com nome, título,
`npm run check` e exclusão de `referencia/` nos testes como ajustes nossos.

Na prática:

- Os assets herdados (três lutadores, dois rooftops, atlas de UI, cartões de
  modo) são **placeholder**. Lutadores ficam em
  `public/assets/lutadores/_amostra-<nome>/`; o prefixo marca o que sai.
- O repositório permanece **privado** enquanto houver asset `_amostra` em
  uso. Link público só depois de tudo trocado (Marco 3).
- O motor é **reorganizado aos poucos** para as regras do contrato (JSON por
  lutador, Academia), nunca reescrito.
- A ordem de construção dele continua sendo a referência de método. Os
  prompts que ele usou estão em `docs/pipeline-arte.md`.

## Alternativas descartadas

- **Motor próprio com retângulos (plano original).** Duas janelas de
  trabalho para chegar onde o pacote já está, com mais chance de a
  motivação cair antes do primeiro mascote. Descartado pelo João em
  17/09/2026, com o trade-off de licença apresentado.
- **Usar só como referência de leitura, sem copiar código.** Era a
  recomendação do agente, por causa da licença ausente. Descartado pelo
  João: o ganho de tempo vale mais para um trabalho acadêmico privado.
- **Portar para o nosso shell (Vite 6, TS 5.7, `vite/config.*.mjs`).**
  Custaria noites e não mostraria nada na tela. O shell dele é mais novo e o
  código foi feito contra ele.
- **Ikemen GO ou outro motor pronto.** Continua como saída de emergência,
  mas agora há um motor Phaser rodando, então a chance de precisar caiu.

## Consequências

- Marco 0 fechou no mesmo dia. Marco 1 muda de "luta feia com retângulos"
  para "fazer o motor ser nosso": lutador em JSON e Academia magra.
- **Zona cinza de licença.** Sem arquivo de licença, o padrão é "todos os
  direitos reservados". Mitigação: repo privado, assets dele trocados antes
  de publicar, crédito ao autor no README, e o projeto é acadêmico sem fim
  comercial. Se um dia o jogo for publicado com parte do código dele, pedir
  autorização ou reescrever os módulos centrais.
- O código tem resto do starter de RPG (`levelEditor.ts`, `tileAtlas.ts`,
  `tileConfig.ts`, `public/assets/tiles/`, `levels/`) e um shell de debug
  HTML de 2.360 linhas que referencia cenas de gym que não vieram. Poda no
  Marco 1, se sair sem quebrar.
- Nomes de arquivo, cena e ação ficam em inglês (`MatchScene`, `light-punch`).
  Traduzir seria churn sem valor. O contrato traz o mapa de nomes.
- Dependências novas: `vitest` (testes, já vinham 8), `@types/node` (o
  `vite.config.ts` usa `node:fs` para o salvador de JSON do painel de debug).
  Justificadas por esta ADR, não por ADR própria.
- A CPU, que estava fora da v1, veio de brinde. Fica.
