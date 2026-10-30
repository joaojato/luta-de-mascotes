# Criador de personagem

Questionário para pôr um mascote novo no jogo. Quando o João disser "faz um
personagem", "bota o Bahia" ou parecido, o agente **não começa desenhando
nem escrevendo JSON**: devolve estas perguntas (skill `lutador-novo`,
etapa 0), recebe as respostas e só então preenche a ficha do GDD e o pedido
de arte ao Codex.

Este arquivo acompanha o motor. **Regra do Criador:** toda ação, golpe, tipo
de especial ou mecânica nova que mude o que um mascote precisa entra aqui no
mesmo commit que entra no jogo. Um teste em
`src/game/lutadores/lutadores.test.ts` falha se uma ação usada por algum
lutador, uma sheet do catálogo de golpes ou um `kind` de especial não
aparecer neste arquivo.

## Como perguntar

- Uma mensagem só, com os blocos numerados, para o João responder pelo
  número ("3.2: bengalada").
- Onde existe padrão, sugerir o padrão e perguntar se muda ("Chute básico:
  chute frontal comum, ou tem algo dele?"). Resposta curta vale.
- O que o João não souber agora fica marcado como aberto na ficha. Não
  inventar golpe para preencher buraco.
- Sem escudo, nome oficial de clube ou patrocínio em nada (Regra do Escudo).

## 1. Quem é

1. Qual clube e qual mascote real? Como ele aparece na torcida hoje?
2. Nome no jogo e slug (minúsculo, sem acento: `urubu`, `bahia`).
3. Em uma frase: qual a atitude dele? (Mascote aqui tem atitude de torcida,
   nada de fofura corporativa.)
4. Rival natural no elenco atual (Urubu, Almirante, Saci, Cartola, Bira, Galo)?
5. Fala de entrada e fala de vitória.

## 2. Como ele se parece

1. Silhueta: o que distingue ele a 20 metros?
2. Paleta: três cores, sem o escudo.
3. Roupa e acessório (camisa sem escudo, bengala, cachimbo, capa...).
4. Tem imagem de referência? Onde está? (vai para `referencia/<slug>/`)
5. Algo que ele **não** pode parecer?
6. Torcida (`torcida` no JSON, regras em `docs/torcida-dividida.md`):
   **todas** as cores do clube, não só as duas principais (o Bahia é branco,
   azul **e** vermelho), tiradas da sprite dele e não da camisa oficial, a
   primeira sendo a da camisa; e a estampa: `lisa`, `listras-horizontais`,
   `listras-verticais` ou `faixa-diagonal`. Toda cor vira camisa lisa de
   parte da torcida e entra na bandeira; as que não forem escuras viram
   sinalizador. Conferir na Luta que cada cor aparece.

## 3. Como ele luta

1. Arquétipo: pressão de perto, distância (tiro), pesado e lento, rápido e
   esquivo, ou outro?
2. Velocidade de andar comparada ao Urubu: mais lento, igual ou mais rápido?
3. A vida é 230 para todos; o dano segue a escala do GDD. Algum golpe dele
   deveria fugir da escala, e por quê?

## 4. Golpes (um por botão)

Para cada linha: como ele faz esse golpe? Se for o padrão, basta dizer "padrão".

| # | Golpe | Comando | Sheet | Padrão do jogo | Pergunta |
|---|---|---|---|---|---|
| 4.1 | Soco rápido | Soco | `light-punch` | jab, uma mão de cada vez | Mão, bico, bengala? |
| 4.2 | Soco forte | Baixo + Soco | `heavy-punch` | cruzado; quebra a defesa alta | Qual o golpe pesado de perto dele? |
| 4.3 | Chute básico | Chute | `heavy-kick` | chute frontal | Chute comum ou algo dele (giro, bicada)? |
| 4.4 | Chute baixo | Baixo + Chute | `low-kick` | varre rente ao chão; quebra a defesa alta | Rasteira, carrinho, varredura? |
| 4.5 | Soco no ar | Soco, no ar | `jump-punch` | soco para baixo no pulo | Algo diferente no ar? |
| 4.6 | Voadora | Chute, no ar | `jump-kick` | mergulho em diagonal; quebra a defesa baixa | Pé, garra, bengala? |

Soco forte, chute básico e chute baixo dão um passo para a frente (Regra do
Passo, `travel` no JSON). Pergunta: o golpe dele avança mais que o normal,
como o carrinho do Bira, ou fica no lugar (golpe de longe, tiro)?

Golpe próprio no lugar de um padrão (já existem: bicada do Urubu
`beak-pull`, cachimbo do Saci `pipe-throw`, tiro do Almirante `shot`, giro
do Galo `spin-kick` (hoje no chute baixo), laser dos olhos do Esquadrão
`eye-laser`, ovo do Galo `egg-throw`, chamado do Biriba do Bira
`summon-biriba`, mordida e coice de costas do Porco, que usam as sheets
`heavy-punch` e `low-kick`): ele tem algum? No lugar de qual botão? Golpe próprio no
chute baixo usa `lowKick` no JSON, como o `kick` usa no chute.

Golpe que **chama alguém** (o Biriba): o chamado é a sheet do lutador; quem
vem atravessa o campo como projétil que não acerta (`spawnFrom: "behind"`)
e solta o que cai (`drop`) sobre onde o oponente estava no momento do
chamado. O que cai é o golpe `queda`: nenhuma guarda segura, só sair do
lugar. Enquanto quem veio está atravessando, o golpe não sai de novo.

## 5. Especial

1. O que o especial faz, numa cena? (É a assinatura do mascote: tem que
   dizer quem ele é, como a caravela do Almirante ou o meteoro do Urubu.)
2. Qual destes tipos chega mais perto? O motor já sabe fazer:

   | `kind` | Como funciona | Exemplo |
   |---|---|---|
   | `projectile` | solta algo que viaja (tiro, onda, nuvem, objeto em arco) | caravela, cachimbo, Pó de Arroz |
   | `run` | corre até o oponente e ataca | bote do Bira |
   | `hop` | voo ou salto baixo até o oponente | bicada do Galo |
   | `meteor` | sai da tela e cai em diagonal | meteoro do Urubu |
   | `dash` | avança em linha atravessando a tela | tornado do Saci |
   | `strike` | golpe parado, no lugar | (padrão de golpe comum) |
   | `esquadrao` | chama aliados que ficam de prontidão atrás dele: o líder sai pelo alto e mergulha; só se acertar, os outros atacam um por vez de lados alternados, sem guarda que segure | Gaviões da Fiel do Mosqueteiro |

   Se nenhum serve, é mecânica nova no motor: vira conversa à parte antes
   do mascote.
3. Como o oponente escapa? Pular (`pulo`), agachar (`agachar`), pular
   recuando (`pulo-recuando`) ou defender normalmente?
4. Dá para defender, ou é imbloqueável?
5. Atordoa quem leva? (Pó de Arroz e meteoro deixam tonto 1,5 s.)
6. Tem preparação própria (`special-charge`) ou já sai direto? O golpe em si
   é a sheet `special`. Especial que corre pode ter uma sheet só para a
   aproximação (`special-run`, o galope do Bira).
7. Efeitos separados do corpo (nuvem, rastro, coluna de ar, mandíbula)?
8. Se solta algo: sai da mão dele, ou entra pela borda da tela atrás dele e
   passa por ele (`spawnFrom`, como a caravela do Almirante)? Ele segura
   alguma pose enquanto isso (`timing` por quadro)?
9. O efeito tem texto (como o "Bora Bahêa" do Esquadrão)? Texto não pode
   espelhar quando ele vira de lado (`mirror: false` no projétil), e efeito
   mais largo que 256 px declara a célula (`frameWidth`, `frameHeight`).
11. O efeito é largo e sai de um ponto do corpo (o jato de vômito do Porco
    sai da boca)? `launchForward` diz quanto à frente nasce o centro dele.
10. O projétil quebra ou respinga no acerto e no chão (`hitEffect`, como o
    ovo do Galo e o cocô do Biriba)? Solta partículas no acerto
    (`hitParticles`: cores, quantidade, se caem ou sobem, se ficam saindo
    por um tempo)? O que cai fica no chão como mina (`mine`: segundos e
    fração do dano)?

## 6. Movimento e reações

Todo mascote tem estas animações. Perguntar só se existe algo próprio:
"anda de um jeito diferente?", "apanha de um jeito dele?" (o Saci pula numa
perna só, por exemplo).

| Sheet | O que é | Quadros sugeridos | Observação |
|---|---|---|---|
| `idle` | guarda parada | 4 a 6 | é a régua de escala e de chão de tudo |
| `walk-forward` | anda para a frente | 6 a 8 | |
| `walk-backward` | anda para trás | 6 a 8 | |
| `crouch` | agacha | 2 a 4 | |
| `jump` | pulo | 6 a 8 | sobe, topo e cai |
| `block-high` | defesa em pé | 2 a 4 | também é a pose da guarda perfeita |
| `block-low` | defesa agachada | 2 a 4 | |
| `hit-high` | reação curta a golpe | 4 a 6 | |
| `stunned` | tonto, em loop | 4 | atordoamento longo (Pó de Arroz, meteoro) e quem toma guarda perfeita. **Só o corpo**: estrelas e espirais são do jogo (`fx-tontura`), desenhadas pelo motor acima da cabeça |
| `knockdown` | derrubado | 8 a 10 | |
| `dash-forward` | dash para a frente | 5 | corpo parado no eixo; quem move é o motor |
| `dash-back` | dash para trás | 4 | saltinho com guarda alta |

E ainda: retrato (`portrait.png`, busto) e âncora (`anchor-w.png`).

## 6b. Sons

Todo mascote nasce com os sons gerais (`docs/sons.md`). Perguntar só o que
é dele: o golpe próprio tem som próprio (tiro, ovo, latido)? O especial
soa como o quê? Ele anda sem passo (paira)? Se é bicho, como ele grita de
dor (`dor` e `dor-forte`: grunhido, grasnido, ganido)? Gente usa a dor
geral. Entra no bloco `sons` do JSON (Regra do Som) e, se o som não existe,
em `scripts/sons.py`. Nada de som de desenho animado.

## 7. O que sai do questionário

1. **Ficha** em `docs/gdd.md` (molde "Ficha de mascote"), com as respostas.
2. **Pedido de arte** em `docs/pedidos-codex.md`, uma seção para o mascote,
   seguindo `docs/producao-personagens.md`: uma geração por ação, partindo
   da guarda aprovada; nunca um atlas com vários mascotes.
3. Só depois da arte: o JSON em `src/game/lutadores/<slug>.json`, conferido
   na Academia (Regra da Academia).

Ordem de prioridade da arte, para o mascote jogar cedo: `idle`, andar,
`hit-high`, `knockdown`, soco rápido e chute básico. O resto entra com
quebra-galho (catálogo de golpes) até a sheet própria chegar.

## Histórico deste arquivo

- 29/10/2026: criado. Inclui tontura (`stunned`), voadora, soco no ar, dash
  e guarda perfeita.
- 29/10/2026: passo à frente no soco forte e nos chutes (Regra do Passo).
- 29/10/2026: laser dos olhos (`eye-laser`) e efeito com texto que não
  espelha, com célula própria (Esquadrão).
- 29/10/2026: torcida dividida, cores e estampa por mascote.
- 29/10/2026: torcida com todas as cores do clube (camisas lisas, bandeira, sinalizador).
- 29/10/2026: golpe que chama alguém (`drop`, `queda`), `lowKick`, `hitEffect` de projétil e tontura como partícula do jogo.
- 30/10/2026: som de dor por mascote (`dor`, `dor-forte`, `dor-ko`).
- 30/10/2026: especial `esquadrao` (aliados que atacam no lugar do mascote; arte de cada aliado em efeitos `<nome>-idle`, `-takeoff`, `-flight`, `-strike`, `-return`).
