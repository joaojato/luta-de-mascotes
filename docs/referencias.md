# Referências

O que inspirou o projeto e o que foi herdado de cada uma. Conferido em
17/09/2026.

## Vibe Fighter do Chong-U (Phaser 4 + Cursor + Codex + Opus)

A referência principal, e desde 17/09/2026 **a base do nosso código**
(`docs/decisoes/0003-base-chong-u.md`). Jogo de luta completo feito só com
IA: três personagens, golpe fraco e forte, bloqueio geométrico por guard box,
hitstun, melhor de 3 com timer, HUD por atlas, especial com medidor e cut-in,
seleção de personagem, 1v1 no mesmo teclado e 1vCPU.

- Repositório (público, **sem licença declarada**):
  https://github.com/chongdashu/vibe-fighter
- Artigo no site do Phaser: https://phaser.io/news/2026/06/vibe-code-a-street-fighter-clone-with-phaser-cursor-and-codex
- Vídeo (YouTube): https://www.youtube.com/watch?v=en37mtF42eQ
- Página do pacote (mesmo conteúdo do repo mais `prompts.pdf`, por cadastro
  de e-mail, grátis): https://www.vibegamedev.com/resources/vibe-fighter
- Cópia local do ZIP e do clone: `referencia/chong-u/`, fora do git.

**O que veio no pacote público:** código do jogo principal (Phaser 4.0.0,
Vite 8, TS 6, vitest), três lutadores com sprite sheets, retratos, atlas de
UI, dois cenários de rooftop, e `prompts.pdf` com a receita de prompts
(transcrita em `docs/pipeline-arte.md`).

**O que ficou atrás do clube pago:** Character Gym (autoria de hitbox com
gizmo), Fighter Playground, Stage Preview e o branch `start` do tutorial. As
chaves dessas cenas existem em `src/game/types.ts`, mas os arquivos não. A
nossa Academia substitui o gym, na versão magra.

**Sobre Cursor:** foi só o editor. Os prompts de build são texto e rodam no
Claude Code. O repositório mais novo dele (`phaserjs-oakwoods`, MIT) já usa
`.claude/skills/`. Codex foi usado como agente de imagem (`$imagegen`, GPT
Image), não como gerador de código.

## phaserjs-oakwoods (mesmo autor, MIT)

Platformer pequeno em Phaser 3 + TS + Vite, vibe-coded. Clonado em
`referencia/chong-u/oakwoods/` pelo que ensina de método, não pelo código:

- https://github.com/chongdashu/phaserjs-oakwoods
- Skills `phaser-gamedev` e `playwright-testing` em `.claude/skills/`, com
  referências separadas por tema (arcade physics, spritesheets, performance,
  redução de flake em teste de canvas). Vale copiar `phaser-gamedev` para cá
  quando o Marco 1 pedir; decidir lendo.
- `prompts/` com os dois prompts que geraram o projeto, e `plans/` com o
  plano que o agente escreveu antes de codar. Mesmo método nosso.

## Spriterrific (ferramenta de sprite do mesmo autor)

Gera personagem e animações consistentes a partir de texto ou imagem de
referência, exporta sprite sheet, e é feito para agente: tem skill oficial
para Claude Code.

- Site: https://spriterrific.com
- Skills (MIT): https://github.com/chongdashu/spriterrific-skills
- App e chave de API: https://app.spriterrific.com
- 500 créditos grátis no cadastro. Preço por ação está na própria skill.

A skill `spriterrific-api` desta pasta é uma cópia do repositório acima
(versão 1.3.2). Atualizar de lá quando fizer sentido.

## Phantom Nexus ("DIY MUGEN" com Claude Code)

Motor de luta 2D feito com Claude Code onde personagem, golpe, cenário e CPU
entram por JSON externo. 20 personagens, 10 cenários. Stack Java/LibGDX, que
não usamos.

- https://note.com/git_yamazaki/n/n704c9a4a9b2d?hl=en

**O que herdamos:** a Regra do JSON. Lutador é dado, não classe.

## Food Fighters (Abraham Toledo)

Luta 2D feita com Claude, com demo e código aberto, segundo o que o João viu.
A Alure não encontrou o link em 17/09/2026. **João: colar o link aqui** e
anotar o que vale herdar (se for Phaser, comparar a estrutura de pastas).

- Link:
- Stack:
- Vale herdar:

## Caminhos considerados e não escolhidos

- **Ikemen GO** (motor open-source de luta, sucessor do MUGEN). Motor pronto,
  personagem em arquivos de texto. Não escolhido porque a matéria e as
  referências que o João gostou apontam para código próprio no navegador, e
  o pipeline de sprite dele é antigo. Fica como saída de emergência se o
  Marco 1 não fechar.
- **Godot**. Engine de verdade, mas exige o editor e o agente edita cenas com
  menos segurança. Unity, mesma coisa, pior.
- **PixelLab** (pixellab.ai). Plano B de sprite, pixel art em grade real com
  MCP. Entra se o mixels do Spriterrific não agradar no Marco 2.

## Phaser 4

- Documentação: https://docs.phaser.io
- Template usado como base: https://github.com/phaserjs/template-vite-ts
  (MIT). Removido dele: `log.js` (telemetria que avisa o Phaser a cada
  `npm run dev`), screenshot e README.
