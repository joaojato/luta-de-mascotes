# Prompts do cenário

Duas imagens para o cenário da v1 (GDD: estádio do Rio genérico, noite,
torcida como coro grego). O motor empilha as duas: o **céu fica parado** e o
**cenário anda** com a câmera, que segue os lutadores.

O que o motor faz com cada uma:

| Imagem | Proporção | Como o motor usa | Onde salvar |
|---|---|---|---|
| A. Céu | 16:9 (ex. 1920×1080) | esticada para a tela inteira, não rola | `public/assets/cenarios/estadio/ceu.png` |
| B. Cenário | 21:9 (ex. 2048×880) | ajustada a 720 de altura; o que passar de 1280 de largura vira rolagem | `public/assets/cenarios/estadio/cenario.png` |

Regras que valem para as duas, e que o modelo esquece se não estiverem no
prompt: **o chão fica a 82% da altura** (é onde os pés dos lutadores
encostam), nada de texto legível, nada de escudo ou patrocínio (Regra do
Escudo), e o estilo tem de casar com o sprite do Urubu (anexar
`public/assets/lutadores/urubu/anchor-w.png` como referência de estilo).

Gerar no Nano Banana Pro, que aceita 21:9. Se for no GPT Image (só vai até
3:2, 1536×1024), gerar a B nesse tamanho e avisar: eu corto o topo verde para
chegar em 2:1, o que não perde nada porque o topo é o céu, que sai mesmo.

Na B, a área do céu vem em **verde chapado #00FF00**. O recorte é meu, por
script; não pedir transparência ao modelo, ele não entrega direito.

---

## A. Céu (camada fixa)

Anexar: `anchor-w.png` do Urubu (estilo).

> Night sky above a Brazilian football stadium, seen from inside the stadium
> at pitch level, 16:9. Only sky and what is far away: deep blue-black
> gradient, a few stars, thin haze lit from below by stadium floodlights,
> the tops of two floodlight towers entering from the left and right edges
> with their lamp arrays glowing warm white, and a faint dark silhouette of
> tropical hills on the horizon. No stadium structure, no stands, no crowd,
> no ground: this layer sits behind everything else. High fidelity pixel
> art, 32-bit arcade fighting game background, same pixel density and
> outline style as the attached character sprite. Bold flat colors, clean
> shapes, no photo realism, no blur, no lens flare. Absolutely no text, no
> letters, no logos, no badges.

## B. Cenário (camada que anda)

Anexar: `anchor-w.png` do Urubu (estilo) e
`public/assets/backgrounds/rooftop-sunset-stage.png` (só para o enquadramento:
"the ground line and the framing like this reference, not the content").

> Wide fighting game stage inside a Brazilian football stadium at night,
> 21:9, side view at pitch level, framed like the attached stage reference.
> Layout from bottom to top: the bottom 18% of the image is the pitch, a flat
> strip of green grass with a white chalk sideline running the full width;
> the horizontal ground line where fighters stand is exactly at 82% of the
> image height. Above it, filling the middle of the image, the stands: a
> tall, steep concrete terrace packed with a roaring crowd, arms up, waving
> plain flags and drums, a few red flares and smoke, security fence with
> advertising boards along the pitch edge that are plain colored panels with
> no readable words. Stadium floodlights glare from above. The crowd wears
> mixed colors, mostly white, grey and dark, with scattered red, black and
> white accents; no single club colors dominate. Everything above the top
> edge of the stands and roof is a flat solid green background (#00FF00),
> about the top 22% of the image, so the sky can be keyed out. The stands
> must be complete at both the left and right edges, no cut-off objects.
> High fidelity pixel art, 32-bit arcade fighting game stage, same pixel
> density and outline style as the attached character sprite, bold flat
> colors, strong dark outlines, no photo realism, no blur. Absolutely no
> text, no letters, no numbers, no logos, no crests, no sponsor names, no
> flags with symbols. No characters in the foreground: the fighters are
> drawn by the game.

---

## Depois de gerar

1. Salvar as duas em `public/assets/cenarios/estadio/` com os nomes da tabela.
2. Me avisar. Eu recorto o verde da B (script, `#00FF00` vira transparente),
   registro o cenário em `src/game/stageConfig.ts` e ele aparece na tela
   `Select Stage` ao lado dos dois rooftops de amostra.
3. Conferir na luta: o céu parado, a arquibancada andando, os pés no gramado.
   Se o chão não bater, o ajuste é o número `groundFraction` no registro do
   cenário (`src/game/stageConfig.ts`), não corte de imagem nem geração
   nova. Atenção: os sprites têm uns 27 px de margem abaixo dos pés na
   célula de 256, então o pé visível fica ~43 px acima do ponto de chão.

## Iteração que costuma ser necessária

- Chão fora do lugar: corrigir com `groundFraction`, não por prompt.
- Texto ou escudo apareceu em placa ou bandeira: pedir edição curta sobre a
  imagem gerada, só com a mudança ("remove the letters on the boards, keep
  everything else"), como já aprendido com a referência dos mascotes.
- Torcida parada demais: para a v1 é aceitável; loop de 2 quadros fica para
  depois.
