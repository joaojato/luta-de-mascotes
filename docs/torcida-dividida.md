# Torcida dividida (29/10/2026)

Atualização de 03/11/2026: a [circulação v4](torcida-circulacao-v4.md) adiciona saída por derrota e vida do vencedor. Ela prevalece sobre a regra histórica de não reagir à luta descrita abaixo.

Pedido do João: a arquibancada do Estádio se divide em duas torcidas. A
metade da esquerda veste o clube do P1, a da direita o do P2. Camisas,
bandeiras e fumaça de sinalizador seguem as cores e a estampa de cada clube.
Ele disse que só essa diferença de cores já resolve grande parte do que o
incomodava no cenário.

## O que é

- O lado é decidido na seleção: P1 à esquerda, P2 à direita. Não muda se os
  lutadores trocarem de posição durante a luta.
- Mesmo clube dos dois lados: a arquibancada inteira de uma cor.
- A torcida **não reage** à luta (acerto, K.O., quem está ganhando).
- Movimento contínuo e leve (balanço, braço para cima, pulinho), cada
  torcedor no próprio ritmo, para a arquibancada não ficar parada. Os quadros
  vêm já nesta arte; ligar o balanço é a segunda entrega do código.
- Fora: reação à luta, som, torcida nas telas de menu (os menus continuam
  com a pintura atual, `cenario.png`; decisão do Claude, reversível).
- Regra do Escudo: só cor e estampa. Nada de escudo, nome, patrocínio ou
  número em camisa, bandeira ou faixa.

## Cores e estampa de cada clube

Cores tiradas das sprites dos lutadores, para a torcida combinar com eles.
O preto do Galo é o da camisa dele, mais claro que o do Botafogo (correção
do João).

| Lutador | Clube | Estampa | Cores (base, depois as outras) |
|---|---|---|---|
| Urubu | Flamengo | `listras-horizontais` | `#B01010`, `#181818` |
| Almirante | Vasco | `faixa-diagonal` | `#181818`, `#ECECEC` (camisa preta, faixa branca) |
| Bira (Cachorro) | Botafogo | `listras-verticais` | `#181818`, `#F0F0F0` |
| Cartola | Fluminense | `listras-verticais` | `#A80018`, `#006048`, `#F0F0F0` (grená e verde, filete branco) |
| Galo | Atlético-MG | `listras-verticais` | `#403B3F`, `#F0F0F0` |
| Saci | Internacional | `lisa` | `#E81810`, `#F0F0F0` (detalhe) |
| Esquadrão | Bahia | `lisa` | `#F0F0F0`, `#1860D8`, `#D81800` (detalhes) |

Regras de cor (João, 29/10/2026):

- **Toda cor do clube aparece.** Cada metade mistura a estampa (6 em cada
  10 torcedores) com camisas lisas em cada cor do clube, gola na cor
  seguinte. O vermelho do Bahia sumia quando só existia num detalhe.
- **Detalhes seguem a mesma regra.** Bandeira na estampa e, para clube de
  três cores ou camisa lisa, em faixas com todas as cores.
- **Sinalizador coeso com o clube e nunca escuro.** As cores do clube com
  brilho de 35% ou mais, vivas primeiro; os sinalizadores de um lado
  revezam entre elas. Clube só de cores escuras solta fumaça branca.
- **Faz parte de todo lutador novo** (skill `lutador-novo`, etapa 5, e
  bloco 2.6 do criador).

No JSON de cada mascote (Regra do JSON):

```json
"torcida": { "estampa": "listras-horizontais", "cores": ["#B01010", "#181818"] }
```

Estampas: `lisa`, `listras-horizontais`, `listras-verticais`,
`faixa-diagonal`. A primeira cor é a camisa; a segunda é a listra ou a
faixa; a terceira, quando há, é o filete (Fluminense) ou o detalhe da gola
e da manga (Bahia, Inter). Estampa nova é trabalho de código, e entra no
`docs/criador-de-personagem.md` (Regra do Criador).

## Como funciona

A torcida deixa de ser parte da pintura. O estádio vira fundo sem gente, e
cada torcedor é uma figurinha separada, desenhada com a camisa numa **cor
chave** (magenta). Na hora da luta o jogo troca o magenta pela estampa do
clube daquele lado, respeitando a sombra do desenho: magenta claro vira a
cor clara da estampa, magenta escuro vira a mesma cor escurecida. A
estampa é calculada dentro de cada figurinha (listra a listra, faixa de um
ombro ao quadril oposto), então cada camisa sai inteira.

Decisões do Claude, para o código não depender de arte extra:

- O "detalhe" da camisa lisa é a gola: as 2 fileiras de pixels mais altas
  da camisa na segunda cor; com terceira cor (Bahia), a barra, as 2 mais
  baixas, na terceira.
- A divisão entre as metades é o meio do cenário (x = 1024): fileira que
  cruza o meio troca de torcida ali.
- Torcedores, bandeiras e fumaça andam junto com o cenário na câmera, como
  se fossem parte da pintura.

Bandeira: o pano vem na mesma cor chave e recebe a mesma estampa. Clube de
camisa lisa ganha bandeira em faixas horizontais com todas as suas cores
(decisão do Claude).
Sinalizador: a fumaça vem em cinza claro e o jogo tinge com a cor base do
clube; a chama fica como está.

## Arte (Codex)

Seguir `docs/producao-personagens.md` no que vale para cenário: uma geração
por peça, conferir cada quadro, entregar em `public/` com guia em `docs/`.
Estilo do `cenario.png` atual: pixel art em blocos de 2 px, contorno
escuro, luz de estádio à noite. Torcedor de rua, nada de cassino, dourado
ou metálico (Anti-referência e `docs/identidade-ui-v1.md`).

Tudo em `public/assets/cenarios/estadio/torcida/`:

1. **`arquibancada-vazia.png`**: 2048×869, o `cenario.png` sem nenhuma
   pessoa, bandeira, faixa ou fumaça na arquibancada central e nas duas
   laterais; degraus e cadeiras vazios no lugar. Fora dessas áreas
   (refletores, cobertura, alambrado, placas azul e vermelha, gramado),
   pixel idêntico ao original.
2. **`torcedores.png`**: folha de torcedores, células de 64×80, fundo
   transparente. Uma linha por tipo, quatro colunas de movimento:
   `0` parado olhando o campo, `1` braços para cima, `2` pulinho (corpo 4 a
   6 px acima), `3` braço girando ou punho cerrado. Pelo menos 10 tipos
   variados: homens, mulheres, criança, idoso, gordinho, tons de pele e
   cabelos diferentes, boné e sem boné. Figura da cabeça ao quadril (a
   fileira da frente esconde as pernas), quadril na base da célula, no
   tamanho das pessoas do `cenario.png` (cabeça com uns 20 px de largura).
   **Camisa em magenta puro**: só tons de matiz 300° e saturação 100%
   (`#FF00FF` no claro, `#B000B0`, `#700070` na sombra), bordas duras, nada
   mais na figura pode ter esse matiz. Calça, pele, cabelo e boné em cores
   normais.
3. **`bandeira.png`**: bandeira grande tremulando, 6 quadros em loop,
   células de 128×128, mastro em madeira, pano em magenta como a camisa,
   ponta do mastro embaixo na célula (é onde a mão do torcedor segura).
4. **`fumaca.png`**: fumaça de sinalizador subindo, 8 quadros em loop,
   células de 128×192, só cinza claro a branco (o jogo tinge), base da
   fumaça embaixo no centro. Mais **`sinalizador.png`**: a chama na ponta,
   4 quadros, células de 32×32, cor de chama normal (não é tingida).
5. **`torcida.json`**: tamanhos das células e quadros de cada folha, e as
   **fileiras**: para cada degrau visível da `arquibancada-vazia.png`, a
   linha onde fica o quadril (`y`), de onde a onde vai (`xInicio`,
   `xFim`), a escala da figura naquela fileira (`escala`, 1 na frente, um
   pouco menor no fundo e nas laterais) e o espaçamento entre torcedores
   (`passo`). Medir na imagem, não chutar.
6. **`docs/torcida-v1.md`**: guia da entrega, com as medidas, o que foi
   conferido e prévias em `output/torcida-v1/`.

## Código (Claude, depois da arte)

1. `torcida` no `LutadorJson` e nos sete JSONs, com teste: todo lutador
   jogável declara estampa conhecida e cores válidas.
2. `src/game/torcida.ts`: troca da cor chave pela estampa (função pura,
   testada por estampa) e montagem das texturas de cada lado no começo da
   luta.
3. Na Luta: fundo vazio, torcedores nas fileiras (metade de cada lado pela
   coordenada x, sorteio de tipo com semente fixa para a torcida não mudar
   de uma luta para a outra), bandeiras e sinalizadores espalhados.
4. Segunda entrega: balanço com fase e ritmo diferentes por torcedor,
   bandeira e fumaça em loop.

Pronto quando: Flamengo x Vasco mostra metade rubro-negra listrada e metade
preta com faixa branca, bandeiras e fumaça idem; `npm run check` verde;
desempenho da luta igual ao de hoje.
