---
name: lutador-novo
description: Pipeline completo para colocar um mascote novo no jogo, do briefing ao JSON validado na cena Academia. Usar sempre que o João pedir um mascote, lutador ou personagem novo, ou disser "bota o Urubu", "faz o Cartola", "próximo mascote".
---

# Lutador novo

Um mascote entra no jogo por **dados**, nunca por código no motor (Regra do
JSON). Esta skill é a ordem fixa. Pular etapa gera sprite genérico ou hitbox
errada, e as duas coisas custam crédito e fim de semana.

Antes de começar, ler `docs/gdd.md` e `docs/pipeline-arte.md`. O porquê de
cada passo está lá; aqui está só o como.

## Etapa 1: ficha no GDD

Se o mascote não tem ficha preenchida em `docs/gdd.md` (nome, slug, silhueta,
arquétipo, stats relativos, falas, paleta), preencher **com o João**, não
sozinho. Silhueta e paleta são as duas coisas que o prompt de arte mais
precisa. Sem ficha, parar aqui.

Slug: minúsculo, sem acento, com hífen (`urubu`, `cartola`, `vozao`).

## Etapa 2: referência

1. Montar o prompt da referência a partir da ficha, com o molde de
   `docs/pipeline-arte.md` (corpo inteiro, perfil, virado para a direita,
   guarda de luta, fundo verde chapado, sem texto, sem escudo).
2. Entregar o prompt ao João para ele gerar no Nano Banana Pro ou GPT Image.
   O agente não gera essa imagem.
3. Ele salva em `referencia/<slug>/referencia.png` (fora do git). Conferir que
   o arquivo existe antes de seguir.
4. A skill `spriterrific-api` precisa de uma URL pública para
   `sourceImageUrl`. Perguntar ao João como ele quer hospedar (o upload do
   próprio app do Spriterrific serve). Nunca subir a imagem para um serviço
   sem dizer qual.

## Etapa 3: estimar créditos e pedir ok

Calcular com a tabela da skill `spriterrific-api` e dizer o número antes de
enfileirar qualquer coisa:

- Job de personagem a partir de imagem, só `idle`: 60 + 100 = 160.
- Cada ação avulsa: 100.
- Conjunto da v1: `idle`, `walk_forward`, `jump`, `crouch`, `light_attack`,
  `heavy_attack`, custom `chute`, custom `especial-<slug>`, `hurt`,
  `knockdown`. Total aproximado: **1.060 créditos**.

Se o saldo não cobre, propor o subconjunto (`idle`, `walk_forward`,
`light_attack`, `hurt` primeiro) e esperar o João dizer sim. Registrar o
gasto no diário ao final.

## Etapa 4: jobs no Spriterrific

Seguir a skill `spriterrific-api`. Regras deste projeto por cima dela:

- Preset `high-fidelity-v1`, `pixelSnap` desligado (decisão da ADR 0002).
- `direction: "e"` no job de personagem. Todo mundo vira para a direita; o
  P2 é espelhado no Phaser.
- **`idle` sozinho** no job de personagem, com a receita de congelamento da
  skill. Cada ação de movimento em job separado, com `actionContext` curto
  (até 130 caracteres) e específico do golpe.
- Ação custom (`chute`, `especial-<slug>`) sempre com baseline (`attack` ou
  `jump`) e `actionContext` descrevendo o golpe da ficha.
- Mascote verde: `chroma: "#FF00FF"` no job de personagem.
- Um job por vez, olhar o resultado, depois o próximo. Não enfileirar dez de
  uma vez: o primeiro erro ensina os outros nove.

## Etapa 5: curadoria

Para cada ação, abrir o GIF de preview ampliado e conferir pés, tronco e mãos.
Se um quadro saiu errado, usar o frame picker (0 crédito) antes de gerar de
novo. Se a ação inteira saiu errada, anotar no diário o que saiu errado e por
quê antes de repetir com contexto ajustado.

## Etapa 6: assets no lugar

- Sprite sheet e manifest de cada ação em
  `public/assets/lutadores/<slug>/<acao>.png` e `<acao>.json`.
- Retrato (busto) em `public/assets/lutadores/<slug>/retrato.png`, gerado
  pelo João no mesmo modelo da referência, mesma identidade.
- Rodada bruta continua em `spriterrific-runs/`. Nunca copiar a pasta inteira
  para `public/`.

## Etapa 7: JSON do mascote

Criar `src/game/lutadores/<slug>.json` seguindo o formato do JSON de
retângulo (`_retangulo.json`) e dos mascotes já existentes. Campos mínimos:
nome, slug, stats, e por ação: arquivo, tamanho do quadro, quantidade de
quadros, fps, âncora, hurtbox por quadro e, nos golpes, hitbox por quadro
ativo, dano, startup, active, recovery.

Primeira passagem dos números: copiar do mascote anterior e ajustar pela
ficha (mais pesado = mais dano, menos velocidade). Refinar na Academia.

## Etapa 8: Academia, e só então a luta

Abrir `npm run dev`, cena `Academia`, carregar o mascote, passar ação por
ação quadro a quadro com hitbox desenhada. Ajustar o JSON até cada golpe
acertar onde parece acertar. Só depois disso registrar o mascote na tela de
seleção.

## Critério de pronto

- `npm run check` passa, saída mostrada.
- Mascote aparece na seleção e luta contra outro (mascote ou retângulo) sem
  erro no console.
- Ficha do GDD completa, diário com créditos gastos e o que saiu errado.
- Commit e push feitos (skill `fechar-sessao`).
