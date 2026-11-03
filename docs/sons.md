# Sons do jogo (29/10/2026)

Pedido do João: fazer os sons do jogo, do mais geral ao mais específico,
mapeando todos os possíveis a partir das animações. Primeiro os gerais e os
golpes de forma geral; depois os de cada mascote (tiro da garrucha, caravela
com água, etc.).

## Como são feitos

**Desde 03/11/2026, gravados** (ADR 0008): o João achou a síntese "muito
digitalizada" e os golpes "extremamente genéricos". `scripts/sons_gravados.py`
pega trechos de pacotes CC0 do OpenGameArt (baixados em
`referencia/sons-cc0/`, fora do git), empilha em camadas e trata com o
ffmpeg: grave reforçado, saturação e compressão, o peso sujo de Hotline
Miami. Todo som sai no mesmo volume percebido; o relativo fica em
`src/game/sonsLista.ts`.

Sobra sintetizado em `scripts/sons.py` (ADR 0007) só o que não tem gravação
boa: apitos de juiz, relógio, laser, a voz do porco e do galo, o coro e a
batucada da torcida. Esse script não grava por cima de chave que tem receita
gravada.

A música tem documento próprio: `docs/musica.md`.

- Som de arcade, curto e seco, que combina com o pixel art. Nada de
  realismo de filme.
- **Nada de desenho animado** (João, 30/10/2026): sem "boing", "piu-piu",
  apito fino descendo ou bolha que sobe de tom. Impacto grande é grave e
  estrondoso; bicho e gente soam por formantes (voz com tremor e sopro), não
  por tom limpo.
- Refazer um som é mudar um número no script e rodar de novo.
- Fala não sai de síntese. Grunhido de dor e latido sim, por formantes
  (`glote` + `vogal` no script). Se o grupo quiser falas (o "Bora Bahêa"
  gritado), o caminho é gravar com o celular.
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
`especial` (o especial sai; mergulho, bote, tornado), `especial-mergulho` e
`especial-pouso` (o especial de mergulho desce e bate no chão), `projetil` e
`projetil-especial` (algo é lançado), `projetil-acerto` (o lançado acerta ou
cai no chão), `dor` (golpe fraco entra), `dor-forte` (golpe forte ou
especial entra) e `dor-ko` (o golpe que derruba; sem som próprio, usa o
`dor-forte` do mascote). O latido do Biriba de cenário é a chave `latido`.

**O acerto é de quem bate** (03/11/2026): `acerto-leve`, `acerto-pesado`,
`acerto-baixo` e `acerto-especial` são eventos do atacante, e o bloco `sons`
dele troca o impacto geral pelo material do mascote. Todo mascote tem pelo
menos um acerto próprio (teste em `src/game/sons.test.ts`). Cada acerto sai
com o tom variando um pouco, para o combo não soar carimbado.

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
| `torcida-coro`, `torcida-uh`, `torcida-assobio`, `torcida-batucada`, `torcida-palmas` | um deles sorteado a cada 5 a 11 s, por cima do loop, sem seguir a luta | coro "ôôô", "uuuh" de quase-gol, assobios, surdo e caixa, palmas ritmadas |

### Camada 3: corpo (todos os lutadores)

| Chave | Quando toca | Como soa |
|---|---|---|
| `passo` | a cada passo andando (o Esquadrão paira: `null`) | tum leve de chuteira |
| `pulo` | sai do chão | sopro subindo |
| `aterrissar` | volta ao chão | baque curto |
| `dash` | dash para a frente ou para trás | sopro rápido |
| `queda` | cai derrotado | baque pesado no chão |
| `tontura` | começa a tontura longa | zumbido no ouvido e vento indo e voltando |
| `dor` | golpe fraco entra (o tom varia a cada vez; um combo grita uma vez a cada 0,35 s) | grunhido curto "uh" |
| `dor-forte` | golpe forte ou especial entra | grunhido "aargh" |
| `dor-ko` | o golpe que derruba | gemido longo descendo |

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
| Urubu | especial (subida) | `meteoro` | ar grave puxado para cima |
| Urubu | especial-mergulho | `mergulho` | ronco de ar que engrossa até o chão |
| Urubu | especial-pouso | `meteoro-pouso` | estrondo grave, chão tremendo, cascalho |
| Urubu | dor, dor-forte | `dor-urubu`, `dor-forte-urubu` | chiado de urubu e grasnido rouco |
| Saci | chute (cachimbo) | `cachimbo` | assobio girando |
| Saci | especial | `tornado` | redemoinho de vento |
| Cartola | especial | `po-de-arroz` | "puf" de nuvem com brilho |
| Bira | soco forte (garra) | `garra` | arranhão |
| Bira | especial (bote) | `bote` | galope e mordida |
| Bira | chute (chama o Biriba) | `assobio-dedos` | assobio com dois dedos |
| Bira | cocô cai | `coco` | "splat" com respingos |
| Bira | chama o Biriba (projétil) | `latido-voo` | "au... au-au" atravessando a tela |
| Bira | dor, dor-forte | `dor-cao`, `dor-forte-cao` | ganido curto; ganido e choro |
| Biriba de cenário | late | `latido` | dois latidos roucos |
| Galo | chute baixo (giro) | `giro` | sopro girando |
| Galo | chute (ovo) | `ovo-arremesso` | arremesso |
| Galo | ovo quebra | `ovo-quebra` | casca estalando e gema |
| Galo | especial (bicada) | `cacarejo` | dois "có" secos e um grito rouco |
| Galo | dor, dor-forte | `dor-galo`, `dor-forte-galo` | grasnido; grasnido com bater de asas |
| Esquadrão | chute (laser) | `laser` | feixe queimando com zumbido grave |
| Esquadrão | soco forte (corte) | `corte` | corte no ar |
| Esquadrão | especial | `bora-bahea` | estrondo de grito (sem voz) |
| Esquadrão | passo | `null` | paira, sem passo |
| Porco | soco forte (mordida) | `mordida` | mastigada |
| Porco | chute baixo (coice) | `coice` | coice grave |
| Porco | carga (enjoo) | `enjoo` | barriga roncando e gorgolejo |
| Porco | especial | `vomito` | jato líquido e respingo no chão |
| Porco | dor, dor-forte | `dor-porco`, `dor-forte-porco` | grunhido de porco, simples e duplo |

## Entregas

1. **Camadas 1 a 4** (gerais e golpes de forma geral): feita em
   30/10/2026, 28 sons ligados no motor e nas cenas.
2. **Camada 5**, mascote por mascote: feita em 30/10/2026, 26 sons e o
   bloco `sons` nos oito JSONs. Na tabela acima, onde diz "chute (tiro)" o
   evento real é `projetil` (o som sai quando o tiro sai, não quando o braço
   se mexe); o mapeamento exato está em cada JSON.

3. **Voz, latido, pouso e torcida à toa** (pedido do João, 30/10/2026):
   feita em 30/10/2026. Dor de todo lutador e dos bichos, latido refeito e
   latindo em voo, pouso do Urubu estrondoso (o meteoro antigo tinha um
   apito de 2600 Hz descendo, "muito fino"), torcida fazendo barulho
   sozinha, e revisão do que soava desenho animado (tontura, bicada,
   cachimbo, cacarejo, laser, enjoo, vômito, cocô, especial pronto).

4. **Gravados e com dono** (pedido do João, 03/11/2026): feita em
   03/11/2026. Base de efeitos trocada por gravação CC0 tratada (78 sons) e
   acerto de cada mascote:

   | Mascote | Material do acerto | Próprios novos |
   |---|---|---|
   | Almirante | madeira de navio; especial com canhão | garrucha de pólvora negra, caravela batendo, sino |
   | Urubu | pena (bater de asa) | corvo de verdade na dor |
   | Saci | estalo leve e rápido | |
   | Cartola | bengala de madeira | |
   | Bira | mordida no especial | latido e choro de cachorro de verdade |
   | Galo | pena | |
   | Esquadrão | armadura (metal) | |
   | Porco | carne pesada e molhada | |
   | Mosqueteiros | aço de espada | mosquete grave do Paulista |
   | Dragão | pancada com rugido | fogo no cuspe e no sopro, rugido na dor |
   | Vovô Coxa | andador de alumínio, cabeçada | lata, arroto no especial |
   | Vovô Maromba | pancada com metal | |

Cada entrega roda `npm run check` e é ouvida no navegador antes do commit.
