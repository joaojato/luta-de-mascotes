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

## O que o João faz, o que o agente faz (guia curto)

Você gera **uma imagem por mascote**, não quadros. Quem gera os quadros do
soco, do pulo e do resto é o Spriterrific, a partir dessa imagem única. Gerar
quadro a quadro num modelo de imagem é o plano C, e sai pior.

| Passo | Quem | Onde fica |
|---|---|---|
| 1. Ficha do mascote no GDD | João (com o agente) | `docs/gdd.md` |
| 2. Referência: 1 imagem, corpo inteiro, virado pra **esquerda** | João, no Nano Banana Pro ou GPT Image, com o prompt abaixo | `referencia/<slug>/referencia.png` (fora do git) |
| 3. Retrato: 1 imagem, busto, mesmo prompt de identidade | João, mesmo modelo | `referencia/<slug>/retrato.png` |
| 4. Sprite sheets de cada ação | Agente, via API do Spriterrific (`SPRITERRIFIC_API_KEY` no `.env`) | rodada bruta em `spriterrific-runs/`, sheet final em `public/assets/lutadores/<slug>/<acao>.png` |
| 5. JSON do mascote | Agente | `src/game/lutadores/<slug>.json` |
| 6. Conferir na Academia | João e agente | menu do jogo, opção Academia |

O que o motor precisa por mascote, dentro de `public/assets/lutadores/<slug>/`:
`anchor-w.png` (a referência que o Spriterrific devolve, 1024×1024),
`portrait.png` (retrato), e uma sheet por ação, células de **256×256** em
grade de 5 colunas, exatamente o que o Spriterrific exporta. O nome do
arquivo é livre; o JSON diz qual arquivo é qual ação.

### O prompt da referência

Este é o molde curto. O prompt longo que o João usa de fato, com o bloco
**REGRAS DO PROJETO** (direção, sem escudo, um personagem só, fundo verde),
está em `docs/prompt-referencia.md`. Anexar a imagem de partida e colar
inteiro.

Trocar só o que está entre colchetes. Uma imagem, sem variações, e gerar de
novo até a silhueta convencer a 20 metros.

> Full body 2D fighting game character, side view **facing left**, fighting
> stance with guard up, feet apart, weight on the back foot. The character is
> [descrição do mascote em uma frase: bicho ou figura, corpo, roupa, o que ele
> segura]. Exaggerated proportions like a Street Fighter Alpha fighter: big
> hands, strong silhouette, expressive face with attitude. Bold flat colors
> [as 3 cores da paleta], high fidelity pixel art with clean outlines. Whole
> body visible, centered, generous padding, flat solid green background
> (#00FF00). No text, no logo, no crest, no badge, no sponsor, no shadow on
> the ground.

Exemplo preenchido, Almirante (Vasco reinterpretado):

> Full body 2D fighting game character, side view facing left, fighting
> stance with guard up, feet apart, weight on the back foot. The character is
> a burly old sea admiral with a thick white beard, a long black naval coat
> with red trim over a white and black striped shirt, a captain's cap, heavy
> boots, one fist wrapped in anchor chain. Exaggerated proportions like a
> Street Fighter Alpha fighter: big hands, strong silhouette, expressive
> face with attitude. Bold flat colors black, white and deep red, high
> fidelity pixel art with clean outlines. Whole body visible, centered,
> generous padding, flat solid green background (#00FF00). No text, no
> logo, no crest, no badge, no sponsor, no shadow on the ground.

Retrato: mesma descrição do personagem, trocando o começo por "Stylized
bust portrait of [...], looking slightly past the camera with a taunting
grin, three-quarter view, dark simple background" e tirando a parte de pose
e fundo verde. Salvar quadrado (1254×1254 é o que o motor usa, mas qualquer
quadrado serve).

### O que os 500 créditos grátis compram

Um mascote **lutando** já com o cadastro grátis. O JSON pode apontar várias
ações para a mesma sheet enquanto ela não existe.

- Job de personagem com `idle` (60 + 100) e mais 3 ações: `walk_forward`,
  `light_attack`, `hurt`. Total **460 créditos**.
- No JSON: `walk-backward` usa a sheet de `walk-forward` (o motor sabe tocar
  ao contrário), `crouch`, `jump`, `block-high` e `knockdown` usam `idle.png`
  até existirem. Feio, mas roda, e valida o estilo antes de comprar.
- Comprando crédito, completar: `jump`, `crouch`, `block` (custom),
  `heavy_attack`, `knockdown`, `special` (custom). Mais 600 créditos. Total
  por mascote completo: **cerca de 1.060**.

## Pipeline de um mascote, passo a passo

A skill `lutador-novo` executa isto. Aqui está o porquê de cada passo.

1. **Ficha no GDD primeiro.** Nome, silhueta, arquétipo, especial, paleta.
   Sem ficha, o prompt sai genérico e o sprite sai genérico.
2. **Referência.** Uma imagem, corpo inteiro, de perfil, virado para a
   **esquerda** (`w` no Spriterrific, que é o padrão dele e o que o motor
   herdado espera: o `anchor-w.png` dos lutadores de amostra veio daí), pose
   de guarda de luta, fundo verde chapado, sem texto, sem escudo. Salvar em
   `referencia/<slug>/` (fora do git). Prompt completo na seção acima.
3. **Job de personagem** no Spriterrific com `sourceImageUrl` (a referência),
   `direction: "w"`, preset `high-fidelity-v1`, e **só** a ação `idle`.
   Idle vai sozinho no job porque o contexto de movimento contamina o parado
   (a skill explica: o boneco "anda no lugar").
4. **Jobs de ação**, um por animação, referenciando o job de personagem:
   `walk_forward`, `jump`, `crouch`, `light_attack`, `heavy_attack`, custom
   `bloqueio` (baseline `idle`, guarda alta), custom `especial-<slug>`
   (baseline `attack` ou `jump`), `hurt`, `knockdown`. Andar para trás é o
   `walk_forward` tocado de trás pra frente (`reverseWalk` no motor). No
   JSON, os nomes de ação são os do motor: `idle`, `walk-forward`,
   `walk-backward`, `crouch`, `jump`, `block-high`, `block-low`, `hit-high`,
   `light-punch`, `heavy-kick` ou `heavy-punch`, `special-charge`,
   `special`, `knockdown`.
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
- Os 500 grátis do cadastro dão `idle` + 3 ações de um mascote (460), e o
  JSON cobre o resto com placeholder: o suficiente para ver o mascote
  lutando e validar o estilo antes de comprar crédito. Fazer isso primeiro.

### Armadilhas conhecidas

- **Mascote verde** (Periquito, Porco do Palmeiras, Coxa, Goiás): mudar o
  chroma para `#FF00FF` no job de personagem, senão o recorte come o bicho.
- **Contexto de ação curto**: até uns 130 caracteres. Mais que isso estoura o
  limite do modelo de vídeo e o job falha (é reembolsado, mas perde tempo).
- **Idle que anda**: dar a lista completa de congelamento ("pés colados, sem
  passo, sem balanço de braço, só respiração"). Está na skill.
- **Direção**: gerar todo mundo virado para a **esquerda** (`w`). O motor
  espelha com `flipX` quando o lutador olha para a direita. Assimetria
  (bengala na mão direita vira esquerda) é aceitável, SF2 fazia igual.

## Prompts que funcionaram pro Chong-U (de `prompts.pdf`, 17/09/2026)

Ele usou Codex com `$imagegen` (GPT Image) para tudo que é imagem única, e o
Spriterrific para as sheets. A ordem e os prompts, traduzidos e resumidos,
porque a ordem é o que vale:

1. **Mockups de conceito.** "Crie 4 mockups de conceito para este jogo de
   luta 2D. Foco em estilo de arte e clima, nada complexo. Devem ser
   reconhecíveis como jogo tipo Street Fighter, mais pixel art de SNES que
   quadrinho em alta resolução. 4 versões diferentes." Escolher um e travar
   a direção antes de qualquer outro asset.
2. **Camadas de parallax.** "O cenário X é o escolhido. Separe em PNGs com
   transparência para empilhar: longe (céu), médio (prédios), principal (o
   chão da luta) e perto (na frente dos lutadores). Gere cada um
   individualmente." Correção que ele precisou: "a camada principal não vai
   de ponta a ponta, vai emendar com buraco. Regenere em largura total."
3. **Referência do personagem.** "Crie uma imagem de referência limpa, corpo
   inteiro, de um personagem original de jogo de luta em pixel art era SNES,
   inspirado no lutador da esquerda do mockup: [descrição física e roupa em
   uma frase]. Isolado, de 3/4 virado de lado em pose de luta, centralizado
   com margem generosa, sem cenário, sem HUD, sem oponente. Personagem
   original, sem logos, sem texto."
4. **Retratos de seleção.** "Retrato estilizado de cada personagem a partir
   da referência. Enquadre do busto à cabeça em pose marcante. Mesmo estilo
   SNES, só mais fidelidade por ser retrato."
5. **Atlas de UI.** "Gere um atlas de UI: barra de vida (com área
   transparente para o preenchimento dinâmico) e uma base de retrato onde
   cada personagem encaixa. Use fundo chroma **magenta #ff00ff** nas áreas
   transparentes para recortar localmente." Em paralelo, "atlas de props
   animados do cenário: torcida, vents, luzes, vapor".

O que muda pra nós: a referência é de **mascote**, não de humano; o estilo é
mixels do Spriterrific, não SNES; e o atlas de UI segue o formato do que já
está em `public/assets/ui/fighting/` (mesmo manifest, mesmo chroma), para o
HUD não precisar de código novo.

## Dois comandos, do pedido à Academia (desde 22/09/2026)

O trabalho braçal em volta da geração está automatizado. O que continua
sendo humano é só gerar a imagem no chat, onde o ChatGPT tem ido bem.

```
npm run sprite -- pedido urubu heavy-kick --aguardar --skin frente
```

Com `--aguardar`, o comando copia o prompt, abre a pasta das imagens, abre
o ChatGPT numa conversa nova e **fica esperando**. Sobra para o João: colar
(Ctrl+V), arrastar as duas imagens, e salvar o resultado onde quiser. Assim
que um PNG novo cair em Downloads ou na Área de Trabalho, o comando alinha,
grava na pasta da skin e atualiza o JSON sozinho. `--minutos N` muda o
tempo de espera (padrão 15).

Sem `--aguardar`, ele só monta o pedido:

```
npm run sprite -- pedido urubu heavy-kick
```

Monta `referencia/pedidos/urubu-heavy-kick/` com:

| Arquivo | O que é |
|---|---|
| `prompt.txt` | prompt inteiro, com a descrição travada do mascote |
| `1-personagem.png` | o modelo oficial (`referencia/<slug>/modelo-oficial.png`) |
| `2-movimento.png` | a mesma ação num lutador que já está no jogo, ampliada |

No chat: anexa as duas imagens **nessa ordem** e cola o `prompt.txt`. O
prompt diz que a imagem 1 é quem o personagem é e a imagem 2 é só como o
corpo se move, e proíbe copiar roupa, cor, rosto e proporção da imagem 2.

```
npm run sprite -- entrega urubu heavy-kick ~/Downloads/resultado.png
```

Alinha à grade pela escala do lutador de amostra (o mesmo de onde saiu a
referência de movimento), escreve em
`public/assets/lutadores/<slug>/<skin>/<acao>.png`, atualiza o JSON
(`frames`, `frameRate`, `repeat`, `defaultVisual`) e acrescenta o arquivo
em `sobrescreve` da skin. Rodar de novo com o mesmo arquivo não muda nada.

Opções: `--skin frente` manda para outra skin, `--quadros N` muda quantos
quadros pedir, `--fps N` força a cadência.

**O que o comando não faz:** golpe precisa de `attack` (quais quadros
acertam e onde), que é julgamento visual e sai na Academia. O comando avisa
quando a ação é golpe.

**A descrição travada do mascote** fica em `docs/mascotes/<slug>.md`, entre
as marcas `DESCRICAO:INICIO` e `DESCRICAO:FIM`. Mudou o modelo oficial,
muda ali, e todo prompt seguinte já sai certo.

**Por que não dirigir o ChatGPT por robô de navegador:** daria para
automatizar também o colar e o anexar com Playwright, mas os termos de uso
da OpenAI proíbem acesso automatizado à interface, e a conta é a dele. O
`--aguardar` chega perto disso sem esse risco.

**Spriterrific não entra neste caminho.** A arte vem do chat que o João já
paga, o movimento vem de um lutador que já está no jogo, e a escala vem
desse mesmo lutador. A pasta `costas/` do Urubu só existe porque modelo
antigo vira skin, nunca é apagado; ela não é usada para gerar nada.

## Sheet pelo Gemini (caminho de custo zero, desde 22/09/2026)

O `block-high` do Urubu foi a prova: 4 quadros no mesmo estilo do
Spriterrific, gerados no Gemini com o anchor e a sheet do idle como
referência. Só a imagem na pasta **não faz nada**: o motor lê o JSON, e o
JSON dizia `idle.png`. São três passos, sempre:

1. **Gerar** no Gemini anexando o **modelo oficial** do mascote
   (`referencia/<slug>/modelo-oficial.png`) e, quando já houver, a sheet do
   `idle` (escala e linha dos pés). Salvar em
   `referencia/<slug>/<acao>-gemini.png` (fora do git).

   **A ordem importa: o `idle` vem primeiro.** O script alinha tudo pela
   sheet do idle, então trocar o idle depois obriga a realinhar o resto.

   Molde do prompt, trocando só o que está entre colchetes:

   > Using the attached character as the exact and only reference for the
   > character design, generate a 2D fighting game sprite sheet row for the
   > action "[ação]". [N] frames in a single horizontal row, evenly spaced,
   > each frame showing the full body with the feet on the same baseline.
   > The character faces **left** in every frame. [descrição do movimento em
   > uma frase: o que o corpo faz do primeiro ao último quadro]. Keep the
   > exact same character design, colors, proportions, outline style and
   > pixel density as the reference: same bird head, same red and black
   > striped shirt, same white shorts, same striped socks. Transparent
   > background. No text, no logos, no crest, no ground shadow, no motion
   > lines, no extra characters.

   Quadros por ação, o que costuma bastar: `idle` 4, `walk-forward` 6,
   `light-punch` 6, `heavy-kick` 6, `block-high` 4, `hit-high` 4, `crouch` 3,
   `jump` 5, `knockdown` 6, `special` 8.

   Fundo: transparente é o ideal. **Fundo branco também serve**, o script
   remove a partir das bordas sem comer o calção branco. Verde chapado só é
   obrigatório para o Spriterrific.
2. **Alinhar** à grade do motor (256×256, 5 colunas, pés na linha do idle):
   ```
   python scripts/alinhar-sheet.py referencia/<slug>/<acao>-gemini.png public/assets/lutadores/<slug>/<acao>.png --ref public/assets/lutadores/<slug>/idle.png
   ```
   O script imprime `frames` e `defaultVisual` prontos para o JSON.
3. **Registrar** em `src/game/lutadores/<slug>.json`: na ação, trocar `file`,
   `frames`, `frameRate` (10 para golpe e bloqueio, 8 para andar) e
   `defaultVisual` pelos valores impressos; golpe ganha `attack` (quadros
   ativos e caixa), bloqueio ganha `guard`. Conferir na Academia.

O João pode fazer os três sozinho. Se preferir, gera, salva em
`referencia/<slug>/` e avisa o agente, que faz o 2 e o 3 e mostra a Academia.

## Skins: testar modelos de roupa sem perder o anterior

Cada modelo visual do mascote é uma subpasta de
`public/assets/lutadores/<slug>/`, declarada em `skins` no JSON do lutador:

```json
"skins": [
  { "id": "costas", "label": "perfil", "pasta": "costas" },
  { "id": "frente", "label": "3/4 de frente", "pasta": "frente",
    "sobrescreve": ["anchor-w.png", "portrait.png"] }
]
```

- A **primeira é a base** e precisa ter todos os arquivos.
- As outras listam em `sobrescreve` só o que têm; o resto vem da base.
- A base mantém o id do mascote (`urubu`); as outras ganham sufixo
  (`urubu-frente`) e ficam fora da seleção, aparecendo na Academia.

**Para mover uma sheet nova para a skin**: salvar o PNG alinhado em
`public/assets/lutadores/<slug>/<skin>/<acao>.png` e acrescentar o nome do
arquivo em `sobrescreve`. Uma linha, e a Academia já mostra a diferença
apertando A/D.

**Quando a skin nova ficar completa**, trocar a ordem das skins no JSON: a
que estiver completa vira a primeira (a base), e a antiga passa a listar os
arquivos dela em `sobrescreve`.

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
