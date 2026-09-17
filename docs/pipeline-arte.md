# Pipeline de arte

Como cada asset nasce, com qual ferramenta, e o que é limitação conhecida.
Arte é o gargalo deste projeto, não o código. Este documento existe para
ninguém redescobrir isso do zero.

## Direção de arte em cinco linhas

- Personagem grande na tela (uns 40% da altura), proporção heroica, pose
  exagerada. É Street Fighter, não Mario.
- Pixel art de alta fidelidade, sem grade rígida. O modo "mixels" do
  Spriterrific. Resultado lembra SF Alpha e King of Fighters, não SF2.
- Cenário em camadas, com torcida viva ao fundo. O estádio precisa ser
  reconhecível como estádio brasileiro sem escrever nome nenhum.
- Paleta por mascote: três cores fortes, nunca o escudo.
- Interface arcade: barra de vida grossa, fonte de placar, "K.O." grande.

## Limitação conhecida, declarada pela própria ferramenta

A skill oficial do Spriterrific avisa: **o estilo "16-bit arcade clássico"
(humanoide detalhado em grade nativa de 100 a 140 px, o SF2 literal) ainda
não é servido.** O melhor resultado hoje é o modo mixels. Se o João quiser o
SF2 pixel-perfeito, o caminho é o plano B (PixelLab), e mesmo lá o resultado é
pixel art indie, não Capcom 1991. Aceitar isso cedo evita frustração no Marco 2.

## Ferramentas e para que serve cada uma

| Etapa | Ferramenta | Por quê |
|---|---|---|
| Referência do mascote (imagem única) | Nano Banana Pro (Gemini) ou GPT Image (ChatGPT) | Imagem única, onde esses modelos são fortes. Nano Banana segura identidade em edições ("mesmo mascote, agora de perfil"). |
| Sprite sheet animada | **Spriterrific** (skill `spriterrific-api`) | Único caminho que resolve consistência do personagem ao longo de dezenas de quadros. Tem skill oficial pro Claude Code. |
| Plano B de sprite | PixelLab (pixellab.ai, tem MCP) | Pixel art em grade real, esqueleto, 4/8 direções. Usar se o mixels não agradar. |
| Limpeza de quadro, sheet manual | Aseprite (pago, uns 20 dólares) ou LibreSprite (grátis) | Tirar sujeira de chroma, ajustar âncora, montar sheet quando a automática falhar. |
| Cenário | Nano Banana Pro ou GPT Image, em 3 camadas | Imagem única por camada. Pedir fundo, arquibancada e gramado separados, com fundo verde nos dois primeiros. |
| Retrato de seleção e vitória | Mesmo modelo da referência, mesmo prompt de identidade | Busto, olhando pra câmera, expressão de provocação. |
| Efeitos sonoros | jsfxr (grátis, retrô, instantâneo) ou ElevenLabs Sound Effects | jsfxr cobre soco, pulo, K.O. em cinco minutos. |
| Trilha | Suno | Hino de torcida em chiptune. Fora da v1. |
| Vozes ("Round 1", grito de golpe) | ElevenLabs | Fora da v1. |

## Pipeline de um mascote, passo a passo

A skill `lutador-novo` executa isto. Aqui está o porquê de cada passo.

1. **Ficha no GDD primeiro.** Nome, silhueta, arquétipo, especial, paleta.
   Sem ficha, o prompt sai genérico e o sprite sai genérico.
2. **Referência.** Uma imagem, corpo inteiro, de perfil, virado para a
   **direita** (`e` no Spriterrific), pose de guarda de luta, fundo verde
   chapado, sem texto, sem escudo. Salvar em `referencia/<slug>/` (fora do git).
   Prompt base:
   > full body 2D fighting game character, side view facing right, fighting
   > stance, [descrição do mascote], bold colors [paleta], flat green
   > background, no text, no logo, no crest, high fidelity pixel art
3. **Job de personagem** no Spriterrific com `sourceImageUrl` (a referência),
   `direction: "e"`, preset `high-fidelity-v1`, e **só** a ação `idle`.
   Idle vai sozinho no job porque o contexto de movimento contamina o parado
   (a skill explica: o boneco "anda no lugar").
4. **Jobs de ação**, um por animação, referenciando o job de personagem:
   `walk_forward`, `jump`, `crouch`, `light_attack`, `heavy_attack`, custom
   `chute` (baseline `attack`), custom `especial-<slug>` (baseline `attack`
   ou `jump`), `hurt`, `knockdown`. Andar para trás é o `walk_forward`
   tocado de trás pra frente, como o SF2 fazia. Levantar (`get_up`) e
   bloqueio ficam pra v1.1.
5. **Curadoria.** Ver cada GIF ampliado, pés e tronco. Se um quadro saiu
   errado, usar o frame picker (custa 0 crédito) antes de gerar de novo.
6. **Asset final** em `public/assets/lutadores/<slug>/<acao>.png`, com o
   manifest de frames ao lado. A rodada inteira fica em `spriterrific-runs/`,
   fora do git.
7. **JSON do mascote** em `src/game/lutadores/<slug>.json`: frames por ação,
   fps, âncora, hitbox e hurtbox por golpe, dano, stats.
8. **Academia.** Abrir a cena, tocar cada ação quadro a quadro com hitbox
   desenhada. Só depois disso o mascote entra na tela de seleção.

### Custo em créditos (do preço publicado na skill)

- Job de personagem a partir de imagem: 60 + 100 por ação.
- Job de ação avulso: 100.
- Mascote da v1 com `idle` + 9 ações: **cerca de 1.060 créditos.**
- Os 500 grátis do cadastro dão `idle` + 4 ações de um mascote: o suficiente
  para validar o estilo antes de comprar crédito. Fazer isso primeiro.

### Armadilhas conhecidas

- **Mascote verde** (Periquito, Porco do Palmeiras, Coxa, Goiás): mudar o
  chroma para `#FF00FF` no job de personagem, senão o recorte come o bicho.
- **Contexto de ação curto**: até uns 130 caracteres. Mais que isso estoura o
  limite do modelo de vídeo e o job falha (é reembolsado, mas perde tempo).
- **Idle que anda**: dar a lista completa de congelamento ("pés colados, sem
  passo, sem balanço de braço, só respiração"). Está na skill.
- **Direção**: gerar todo mundo virado para a direita. O P2 é o mesmo sprite
  espelhado pelo Phaser (`flipX`). Assimetria (bengala na mão direita vira
  esquerda) é aceitável, SF2 fazia igual.

## Cenário, passo a passo

1. Três imagens no Nano Banana Pro ou GPT Image, mesma paleta e hora do dia:
   céu com refletores (1920×1080), arquibancada com torcida (fundo verde,
   duas versões com braços em posição diferente para o loop), gramado com
   linha lateral (fundo verde).
2. Recortar o verde, salvar em `public/assets/cenarios/<slug>/`.
3. Parallax leve no Phaser: céu parado, arquibancada 0,3, gramado 1,0.

## Anti-referência visual

Ver `CLAUDE.md`. Em resumo: nada de sangue, nada de dourado de cassino, nada
de fofura corporativa, nada de texto embaralhado de IA no cenário.
