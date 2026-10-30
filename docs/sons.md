# Sons do jogo (29/10/2026)

Pedido do João: fazer os sons do jogo, do mais geral ao mais específico,
mapeando todos os possíveis a partir das animações. Primeiro os gerais e os
golpes de forma geral; depois os de cada mascote (tiro da garrucha, caravela
com água, etc.).

## Como são feitos

Sintetizados em Python, só com a biblioteca padrão, como o apito que já
existe (`scripts/apito.py`). Um script, `scripts/sons.py`, gera todos os
WAV em `public/assets/audio/sfx/`. Decisão em
`docs/decisoes/0007-sons-sintetizados.md`.

- Som de arcade, curto e seco, que combina com o pixel art. Nada de
  realismo de filme.
- Refazer um som é mudar um número no script e rodar de novo.
- Sem voz: grito e fala não saem bem de síntese. Se o grupo quiser vozes
  (o "Bora Bahêa", o grunhido do Porco), o caminho é gravar com o celular;
  fica fora desta leva.
- Se um som específico não convencer sintetizado (água, madeira), a
  alternativa é um pacote CC0 (domínio público, como os do Kenney), sempre
  perguntando antes.

## Regra do Som

Lutador não tem código de som. O motor toca o som **geral** de cada
evento, e o JSON do mascote pode trocá-lo pelo **específico** num bloco
`sons` (evento → chave do som, ou `null` para calar):

```json
"sons": { "projetil": "tiro-garrucha", "projetil-especial": "caravela", "passo": null }
```

Eventos que o JSON pode trocar: `passo`, `pulo`, `aterrissar`, `dash`,
`queda`, `tontura`, `soco-rapido`, `soco-forte`, `chute`, `chute-baixo`,
`soco-no-ar`, `voadora` (começo do golpe), `carga` (preparação do especial),
`especial` (o especial sai; mergulho, bote, tornado), `projetil` e
`projetil-especial` (algo é lançado), `projetil-acerto` (o lançado acerta ou
cai no chão). O latido do Biriba de cenário é a chave `latido`.

Mascote novo nasce com todos os sons gerais. Trocar um som é dado.

## Mapa, do geral ao específico

Volume relativo, para o som não brigar com a luta: interface baixo, golpe
médio, especial e K.O. alto, torcida bem baixa por baixo de tudo.

### Camada 1: interface (menus)

| Chave | Quando toca | Como soa |
|---|---|---|
| `ui-mover` | o cursor muda de opção, em qualquer menu e na seleção | tique curto e seco |
| `ui-confirmar` | confirma (já existe: `apito.wav`) | apito de juiz curto |
| `ui-travar` | jogador trava o lutador na seleção | batida grave e apito curto |

### Camada 2: partida

| Chave | Quando toca | Como soa |
|---|---|---|
| `torcida` | fundo da luta inteira, em loop | multidão, bem baixa |
| `round` | aparece "ROUND N" | surdo de bateria de torcida, duas batidas |
| `luta-comeca` | aparece "FIGHT!" | apito longo de juiz |
| `ko` | alguém cai sem vida | apito longo descendo e um bumbo |
| `tempo-esgotado` | o relógio zera | dois apitos curtos |
| `vitoria` | fim da partida | rojão subindo e estourando |
| `relogio` | cada um dos últimos 5 segundos | tique de relógio |
| `especial-pronto` | a barra de especial enche | brilho subindo |
| `especial-entrada` | entrada do especial (o retrato na tela) | "shing" com batida |

### Camada 3: corpo (todos os lutadores)

| Chave | Quando toca | Como soa |
|---|---|---|
| `passo` | a cada passo andando (o Esquadrão paira: `null`) | tum leve de chuteira |
| `pulo` | sai do chão | sopro subindo |
| `aterrissar` | volta ao chão | baque curto |
| `dash` | dash para a frente ou para trás | sopro rápido |
| `queda` | cai derrotado | baque pesado no chão |
| `tontura` | começa a tontura longa | "piu-piu" de passarinho girando |

### Camada 4: golpes (catálogo, todos os lutadores)

| Chave | Quando toca | Como soa |
|---|---|---|
| `ar-leve` | começa soco rápido ou soco no ar | sopro curto e agudo |
| `ar-pesado` | começa soco forte, chute, chute baixo ou voadora | sopro grave e mais longo |
| `impacto-leve` | soco rápido ou soco no ar acerta | tapa seco |
| `impacto-pesado` | soco forte, chute ou voadora acerta | soco grave com estalo |
| `impacto-baixo` | chute baixo acerta | rasteira: baque com arrasto |
| `impacto-especial` | especial acerta | pancada grande com eco |
| `defesa` | golpe bloqueado | baque abafado |
| `defesa-quebrada` | guarda quebrada | estalo seco |
| `defesa-perfeita` | guarda perfeita | "ting" claro |
| `projetil-lancar` | qualquer projétil sai | arremesso |
| `especial-carga` | preparação do especial | zumbido subindo |

### Camada 5: de cada mascote (bloco `sons` do JSON)

| Mascote | Evento | Chave | Como soa |
|---|---|---|---|
| Almirante | chute (tiro) | `tiro-garrucha` | estampido de pólvora com eco |
| Almirante | especial | `caravela` | madeira rangendo e onda crescendo |
| Almirante | carga | `sino-navio` | sino de navio |
| Urubu | chute (bicada) | `bicada` | estalo de bico |
| Urubu | soco forte (asas) | `asas` | bater de asas |
| Urubu | carga | `termica` | vento subindo |
| Urubu | especial (mergulho) | `meteoro` | assobio descendo e explosão |
| Saci | chute (cachimbo) | `cachimbo` | assobio girando |
| Saci | especial | `tornado` | redemoinho de vento |
| Cartola | especial | `po-de-arroz` | "puf" de nuvem com brilho |
| Bira | soco forte (garra) | `garra` | arranhão |
| Bira | especial (bote) | `bote` | galope e mordida |
| Bira | chute (chama o Biriba) | `assobio-dedos` | assobio com dois dedos |
| Bira | cocô cai | `coco` | assobio curto e "splat" |
| Biriba de cenário | late | `latido` | latido curto |
| Galo | chute baixo (giro) | `giro` | sopro girando |
| Galo | chute (ovo) | `ovo-arremesso` | arremesso |
| Galo | ovo quebra | `ovo-quebra` | casca estalando e gema |
| Galo | especial (bicada) | `cacarejo` | cacarejo curto |
| Esquadrão | chute (laser) | `laser` | "zap" de laser |
| Esquadrão | soco forte (corte) | `corte` | corte no ar |
| Esquadrão | especial | `bora-bahea` | estrondo de grito (sem voz) |
| Esquadrão | passo | `null` | paira, sem passo |
| Porco | soco forte (mordida) | `mordida` | mastigada |
| Porco | chute baixo (coice) | `coice` | coice grave |
| Porco | carga (enjoo) | `enjoo` | borbulho |
| Porco | especial | `vomito` | jato líquido |

## Entregas

1. **Camadas 1 a 4** (gerais e golpes de forma geral): feita em
   30/10/2026, 28 sons ligados no motor e nas cenas.
2. **Camada 5**, mascote por mascote: feita em 30/10/2026, 26 sons e o
   bloco `sons` nos oito JSONs. Na tabela acima, onde diz "chute (tiro)" o
   evento real é `projetil` (o som sai quando o tiro sai, não quando o braço
   se mexe); o mapeamento exato está em cada JSON.

Cada entrega roda `npm run check` e é ouvida no navegador antes do commit.
