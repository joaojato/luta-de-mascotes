# Referências

O que inspirou o projeto e o que foi herdado de cada uma. Conferido em
17/09/2026.

## Clone de Street Fighter do Chong-U (Phaser + Cursor + Codex + Opus)

A referência principal. Jogo de luta completo feito só com IA: dois
personagens, golpe fraco e forte, bloqueio, barra de energia, especial por
personagem, rounds, seleção de personagem e CPU.

- Artigo no site do Phaser: https://phaser.io/news/2026/06/vibe-code-a-street-fighter-clone-with-phaser-cursor-and-codex
- Vídeo (YouTube): https://www.youtube.com/watch?v=en37mtF42eQ
- Recursos (sprites de exemplo, atlas de UI e os prompts usados, por cadastro
  de e-mail): https://www.vibegamedev.com/resources/vibe-fighter

**O que herdamos:** a ordem de construção (concept, extração do personagem,
sprites, gym de hitbox, combate, UI e especiais, CPU) e a ferramenta de sprite.

**O que não herdamos:** o código. O projeto completo fica atrás do clube pago
dele. Ferramentas dele que não usamos: Cursor (o João usa Claude Code) e Codex
(agente de código, não gera imagem).

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
