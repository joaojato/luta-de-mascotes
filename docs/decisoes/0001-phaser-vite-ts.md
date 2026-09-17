# ADR 0001: Phaser 4 + TypeScript + Vite como engine

**Data:** 2026-09-17
**Status:** aceito

## Contexto

Jogo de luta 2D para a matéria de Games da PUC, feito por vibecoding com
Claude Code. O João trabalha em VS Code, TypeScript e deploy na Vercel. A
janela real de trabalho é noite de dia útil e fim de semana, e o risco
declarado é a motivação cair em projeto longo. As duas referências que ele
aprovou (clone de Street Fighter do Chong-U, Food Fighters) são jogos de luta
em código próprio no navegador.

## Decisão

Phaser 4 com TypeScript e Vite, a partir do template oficial
`phaserjs/template-vite-ts`. O jogo roda no navegador e é entregue como link.

Na prática: sem editor de engine, tudo é código e JSON, que é o terreno onde o
Claude Code rende mais. `npm run dev` mostra o jogo, `npm run check` (typecheck
e build) é o portão antes de qualquer "terminei".

## Alternativas descartadas

- **Godot.** Engine completa e gratuita, mas exige aprender o editor e o
  agente edita arquivos de cena com menos segurança. Custo de entrada alto
  para a janela real do João.
- **Unity.** Pior que o Godot no mesmo critério, mais pesado, cenas em YAML
  hostis ao agente.
- **Ikemen GO (MUGEN).** O motor de luta pronto, personagem em arquivo de
  texto. Descartado porque a matéria e as referências apontam para código
  próprio, e o pipeline de sprite dele é antigo (formato SFF). Fica como
  saída de emergência se o Marco 1 não fechar.
- **Canvas puro sem framework.** Mais controle, mais código de infraestrutura
  (loop, input, sprite sheet, áudio) que o Phaser já dá.

## Consequências

- Adicionar mascote é JSON e sprites, não código (Regra do JSON).
- Não há editor visual: hitbox e animação são conferidas na cena `Academia`,
  que o próprio projeto constrói no Marco 0 e 2.
- Phaser 4 é recente. Se alguma API não bater com a documentação do Phaser 3
  que o agente lembra, a fonte é `https://docs.phaser.io`, não a memória.
- O `log.js` do template (telemetria para o Phaser) foi removido. Os scripts
  chamam o Vite direto.
