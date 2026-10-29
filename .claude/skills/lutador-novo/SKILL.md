---
name: lutador-novo
description: Pipeline completo para colocar um mascote novo no jogo, do questionário ao JSON validado na cena Academia. Usar sempre que o João pedir um mascote, lutador ou personagem novo, ou disser "bota o Bahia", "faz o Cartola", "próximo mascote", "cria um personagem".
---

# Lutador novo

Um mascote entra no jogo por **dados**, nunca por código no motor (Regra do
JSON). Esta skill é a ordem fixa. Pular etapa gera sprite genérico ou hitbox
errada, e as duas coisas custam fim de semana.

## Etapa 0: questionário (antes de qualquer outra coisa)

Ler `docs/criador-de-personagem.md` e devolver ao João as perguntas dele,
numa mensagem só, em blocos numerados. Não desenhar, não escrever JSON e não
pedir arte antes das respostas. Onde existe padrão, sugerir o padrão e
perguntar se muda. O que ele não souber fica marcado como aberto.

Se a resposta pedir algo que o motor não sabe fazer (tipo de especial novo,
mecânica nova), parar e tratar isso como conversa à parte: é motor, não
mascote.

## Etapa 1: ficha no GDD

Preencher a ficha em `docs/gdd.md` (molde "Ficha de mascote") com as
respostas, e a linha do mascote nas tabelas de golpes próprios e de
especiais, quando houver. Slug: minúsculo, sem acento, com hífen.

## Etapa 2: pedido de arte ao Codex

Escrever uma seção nova em `docs/pedidos-codex.md` para o mascote, com as
sheets da lista do questionário (bloco 6 e os golpes dos blocos 4 e 5), na
ordem de prioridade dele: `idle`, andar, `hit-high`, `knockdown`, soco
rápido, chute básico; o resto depois. Apontar `docs/producao-personagens.md`
(uma geração por ação, partindo da guarda aprovada, nunca atlas com vários
mascotes) e `docs/mascotes/padrao-artistico.md`.

Formato de toda sheet: células 256×256, 5 colunas, virado para a esquerda,
fundo transparente, mesma escala e mesmo pé no chão do `idle`.

Alternativa: o Spriterrific (skill `spriterrific-api`). Só com o João
pedindo, e sempre estimando os créditos e dizendo o número antes de
enfileirar.

## Etapa 3: integrar o que chegou

Integrar só o que o Codex publicou em `public/` com guia em `docs/`; fonte
em `output/` não é entrega (lição de 29/10/2026). Sheet fora de escala entra
por `npm run sprite -- escalar` e `firmar`, nunca à mão (Regras da Régua e do
Eixo).

Criar `src/game/lutadores/<slug>.json` copiando o mascote mais parecido e
ajustando pela ficha: por ação, `action`, `file`, `frames`, `frameRate`,
`repeat`, `defaultVisual`; nos golpes, `attack` ou `attackSpans`; nas
defesas, `guard`; o especial em `moves.special`. Dano segue a escala do GDD
(o teste cobra). Registrar em `src/game/lutadores/index.ts`. Ação que ainda
não tem sheet usa o quebra-galho do catálogo de golpes.

## Etapa 4: Academia, e só então a luta

`npm run dev`, cena Academia: passar ação por ação quadro a quadro com as
caixas desenhadas, ajustar o JSON até cada golpe acertar onde parece
acertar (Regra do Corpo: só o corpo apanha; a caixa de acerto vai até onde o
desenho vai). Depois, uma luta contra outro mascote.

## Critério de pronto

- `npm run check` passa, saída mostrada.
- Mascote na seleção, luta sem erro no console.
- Ficha do GDD completa; diário com o que saiu errado.
- Se o mascote trouxe ação, golpe ou tipo de especial novo, ele entrou em
  `docs/criador-de-personagem.md` (Regra do Criador, cobrada por teste).
- Commit e push feitos (skill `fechar-sessao`).
