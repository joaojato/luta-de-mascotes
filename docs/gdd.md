# GDD: Luta de Mascotes

Documento de design. É a fonte da verdade sobre **o que** o jogo é. Golpe,
mascote ou tela que não está aqui não é construído. Vive junto com o código e
muda com ele.

## Conceito em uma frase

Dois mascotes de torcida se enfrentam num estádio, com a arquibancada gritando,
para decidir quem manda na cidade. Comédia de rivalidade, não violência.

## O que o jogo diz (a camada de Comunicação)

Rascunho para o João reescrever com a voz dele:

- A rivalidade de futebol no Brasil é teatro: exagero, provocação, orgulho de
  bairro. O jogo pega isso e transforma em luta de arcade, onde o exagero é a
  linguagem nativa.
- O mascote é a torcida em forma de personagem. Cada golpe especial vem de um
  hábito de torcida ou de um mito do clube, não de artes marciais.
- A torcida no fundo do cenário reage à luta. Ela é o coro grego.

Perguntas a responder antes da apresentação: qual rivalidade abre o jogo, e por
quê essa? O que muda quando um "vence"? Tem final, ou é ciclo eterno de clássico?

## Elenco

### Como escolher os dois da v1

Critério: contraste visual e de jogo. Um grande e um pequeno, um agressivo e um
de contra-golpe, uma rivalidade que o público do Rio entende sem explicação.

**Recomendação da Alure:** Urubu × Cartola (Fla-Flu). Contraste de silhueta
(bicho grande e de asa versus cavalheiro magro de cartola), rivalidade local, e
os dois rendem golpe especial óbvio. Decisão é do João.

### Candidatos (reinterpretados, ver Regra do Escudo)

| Mascote | Clube de origem | Arquétipo de luta | Semente de ultimate |
|---|---|---|---|
| Urubu | Flamengo | aéreo, pressão | mergulho do alto, rasante |
| Cartola | Fluminense | contra-golpe elegante | bengala como alcance, cartola que vira projétil |
| Almirante | Vasco | agarrão pesado | **caravela vindo junto de uma onda atropela o rival** (ideia do João, 17/09) |
| Manequinho | Botafogo | pequeno e irritante, trapaceiro | esguicho (manter cômico, não vulgar) |
| Galo | Atlético-MG | agressivo, curta distância | bicada em sequência, canto que atordoa |
| Saci | Internacional | teleporte, trapaça | redemoinho, some e aparece atrás |
| Mosqueteiro | Corinthians ou Grêmio | espada, alcance médio | estocada |
| Raposa | Cruzeiro | finta, esquiva | rasteira, ataque por trás |
| Baleia | Santos | gigante lento, dano alto | jato d'água, pulo sísmico |
| Vozão | Ceará | velho mestre, contra-golpe | bengalada, "no meu tempo" |

Se o João quiser outro clube na v1, entra aqui primeiro, com arquétipo e
semente de ultimate, antes de qualquer sprite.

### Ficha de mascote (uma por mascote, preencher ao criar)

```
Nome no jogo:
Slug (pasta e JSON):
Silhueta em uma frase (o que o distingue a 20 metros):
Arquétipo:
Vida / velocidade / peso (relativo: baixo, médio, alto):
Fala de entrada:
Fala de vitória:
Paleta (3 cores, sem o escudo):
```

## Golpes (catálogo, João, 27/10/2026)

Mesmo esqueleto para todos, muda só a animação e os números. Passa dos 4
golpes da Regra da v1 por pedido explícito do João. O catálogo vive em
`src/game/golpes.ts` e aparece na Academia (aba Golpes) com o que cada mascote
tem e o que falta. Golpe sem sheet própria aparece como "faltando"; quando há
um quebra-galho, a Academia diz qual sheet está sendo usada no lugar.

Dois botões de ataque, Soco e Chute; segurar Baixo muda o golpe (João,
27/10/2026). O antigo botão Forte virou o Chute.

| | Soco | Chute |
|---|---|---|
| Em pé | Soco rápido | Chute básico |
| Baixo + | Soco forte | Chute baixo |
| No ar | Soco no ar | Voadora |

| Golpe | Sheet (`action`) | Regra |
|---|---|---|
| Soco rápido | `light-punch` | dois socos por aperto, **um com cada mão** e giro de tronco no segundo (picos nos quadros 1 e 3, dois acertos), no modelo do Almirante; o Saci tem um jab rápido próprio, de um acerto; apertar de novo depois do segundo emenda outro par. Agachado passa por baixo. Bate na armadura do Soco forte sem interromper. |
| Soco forte | `heavy-punch` (quebra-galho: `heavy-kick`) | cruzado com giro, lento e potente; **quebra a defesa alta**. Aguenta Soco rápido sem parar (armadura). O do Bira é a patada. |
| Chute básico | `heavy-kick` | dano médio; qualquer guarda segura. O do Almirante é o tiro de garrucha (`moves.kick`). |
| Chute baixo | `low-kick` (quebra-galho: `heavy-kick`) | rente ao chão; **interrompe o Soco forte**; **quebra a defesa alta**. O do Almirante é o chute normal, por escolha do João. |
| Soco no ar | `jump-punch` (quebra-galho: `light-punch`) | um golpe por pulo. Pega quem está agachado. |
| Voadora | `jump-kick` (quebra-galho: `heavy-kick`) | mergulho em diagonal para a frente; **único golpe que quebra a defesa baixa**. |
| Especial | `special-charge` + `special` | próprio de cada mascote. |

Projéteis:

- **Tiro do Almirante** (o Chute dele): passa por cima de quem pula e por
  cima de quem agacha.
- **Caravela do Almirante** (especial): passa por baixo de quem pula;
  agachar não salva. Entra pela borda da tela atrás dele e passa por trás do
  corpo dele, como se saísse dele (`spawnFrom: "behind"`, velocidade 1000);
  ele segura a pose apontando por 0,7 s (João, 29/10/2026).

Defesa (João, 28/10/2026): a guarda em pé (Defender) só é quebrada pelo
Chute baixo e pelo Soco forte; a guarda agachada (Defender + Baixo) só pela
Voadora. Guarda em pé quebrada atordoa 0,3 s; guarda agachada quebrada, 0,6 s
(no lugar do atordoamento normal do golpe; o dano entra igual). Especial
imbloqueável continua passando por qualquer guarda, sem esse atordoamento.
Agachar sem guarda é esquiva do Soco rápido, do Tiro e do cachimbo do Saci.

Guarda perfeita (João, 29/10/2026): defender até 0,15 s antes de um golpe
**corpo a corpo** acertar. O defensor não é empurrado e o atacante fica
tonto 0,8 s, com a animação de tontura (`stunned`), brilho e faísca azul
(correção do João: antes era a reação curta por 0,4 s).
Vale parado ou saindo do dash. Não vale contra projétil (tiro, caravela,
cachimbo, Pó de Arroz: só bloqueia, senão o tiro viraria armadilha para quem
atira), nem contra especial imbloqueável, nem contra golpe que quebra aquela
guarda (aí a guarda quebra como sempre). A CPU não faz guarda perfeita.

Dash (João, 29/10/2026): dois toques no direcional em até 0,3 s (0,25 s
falhava em computador lento, que conta o tempo em quadros mais longos). Para a
frente, avança uns 180 px em 0,28 s; para trás, um recuo curto. Defender no
meio do dash para na hora e entra em guarda. Arte pedida ao Codex
(`dash-forward`, `dash-back`); sem ela, o andar faz as vezes.

Luta: 230 de vida para todos os lutadores, round de 99 segundos.

Ritmo (João, 28/10/2026, contra o spam de soco rápido):

- Soco rápido só emenda outro se encostou (acerto ou guarda); no vazio, a
  animação vai até o fim. Atordoa 200 ms, menos que o intervalo entre socos
  sem emenda (cerca de 286 ms): quem apanha tem brecha para defender ou
  responder.
- Dano padrão (escala de 29/10/2026, em fração dos 230 de vida): soco
  rápido 7 (3%), chute baixo 14 (6%), chute básico e voadora 18 (8%), soco
  forte 24 (10%), especial 34 (15%). Golpe lento rende mais que o rápido.
  Exceções: meteoro do Urubu 30 e Pó de Arroz 18, porque já atordoam 1,5 s;
  Almirante 9/21/19/38 e cachimbo do Saci 30. Cobrado por teste.
- Guarda empurra 60% do golpe. Contra a parede, quem recua é o atacante.
- Golpes que se encontram no mesmo quadro trocam: os dois levam.
- Regra do Corpo (CLAUDE.md): só o corpo apanha; o alcance do desenho é
  vantagem real.
- Regra do Passo (João, 29/10/2026): chute e soco forte de chão avançam um
  pouco. Chute anda 47 a 64 px da sheet (a inclinação do tronco mais ~15),
  soco forte 25 a 40. O passo para a 70 px do oponente e soma ao alcance.
- Golpe longo pode ter `timing` no JSON: preparação rápida e quadro de
  contato segurado. Bengalada do Cartola sai aos ~370 ms e acerta por
  ~250 ms; varredura acerta nos quadros 8 a 11; giro do Galo sai aos ~400 ms.

Botões são remapeáveis por lado do teclado na Academia (aba Botões) e valem
na luta. Números exatos (dano, vida, carga do especial) ficam no JSON do
mascote e podem ser testados na aba Ajustes da Academia. Aqui é a intenção.

## Golpes próprios por mascote (v3, 27/10/2026)

Onde o mascote foge do esqueleto (arte do Codex em `docs/golpes-personalizados-v3.md`):

| Mascote | Chute | Baixo + Soco | Baixo + Chute | Especial |
|---|---|---|---|---|
| Urubu | bicada que fecha e puxa (`beak-pull`) | cruzado | chute clássico | meteoro |
| Almirante | tiro de garrucha (projétil reto) | cruzado | chute normal | caravela |
| Saci | troca e arremessa o cachimbo: projétil em parábola longa, na altura da cabeça, cai no chão; qualquer guarda segura; agachar desvia | soco forte original | chute de mãos | tornado |
| Cartola | chute normal | bengalada | varredura de bengala (só a guarda baixa segura) | Pó de Arroz: nuvem curta que atordoa 1,5 s (vítima tonta, `stunned`); qualquer guarda evita; sem animação de preparação; ao acertar, a nuvem segue 220 px e se desfaz por cima do oponente, na frente dos dois |
| Bira | chute normal | patada com garras | carrinho: desliza até perto do adversário, só a guarda baixa segura | galope e bote |
| Galo | chute giratório com rastro de garras | cruzado | chute frontal | bicada em voo |

## Especiais de avanço (27/10/2026)

Arte do Codex, mecânica no motor por tipo, configurada em `moves.special`
do JSON (Regra do JSON: o motor não conhece mascote).

| Mascote | Tipo (`kind`) | O que faz | Como escapar (`dodge`) |
|---|---|---|---|
| Urubu: meteoro | `meteor` | Térmica sobe, ele sai pelo alto da tela, o ponto de impacto segue o oponente até o mergulho começar e então trava; mergulho a 45 graus. Nenhuma guarda segura. Acerto atordoa 1,5 s, como o Pó de Arroz (vítima tonta, `stunned`). | Só pulando enquanto recua (`pulo-recuando`). |
| Galo: bicada | `hop` | Voo baixo até 110 px do oponente, bicada na altura da cabeça, pouso. | Agachar (`agachar`). |
| Bira: bote | `run` | Galope aos saltos (sheet própria, `approachAction`) até 230 px do oponente; bote com salto real até 90 px dele, mordida no ar uma vez; efeito de mandíbula só no contato. | Pular (`pulo`). |
| Saci: tornado | `dash` | Atravessa a tela girando, a uns 1000 px/s; só o funil de baixo acerta (João, 29/10/2026: antes a caixa ia até a cintura e não dava para pular). | Pular (`pulo`): quem está no ar quando ele passa escapa. Pular na carga é cedo demais (pousa antes). |

O soco forte do Bira é a patada, com o efeito de garras no quadro 3.
Especiais de avanço acertam uma vez: dano 34 por padrão (escala de 29/10/2026).

Especial: a barra enche batendo, apanhando e também sozinha com o tempo de
luta (`meterSeconds`, padrão 45 s; 0 desliga). Decisão do Claude para dar
sentido ao "tempo para carregar a habilidade" pedido pelo João.

## Controle pelo corpo (João, 01/10/2026)

Além do teclado, cada jogador pode jogar com o corpo: escaneia o QR code da
tela "Celular", apoia o celular em pé na altura da cintura, a uns 2,5 m, e
luta na frente dele. O teclado continua valendo junto. Técnica em
`docs/decisoes/0004-controle-celular.md`; limites em `src/controle/gestos.ts`.

Antes de lutar, ficar 1 s parado de frente: é a calibração. Toda medida é
relativa a essa postura, então não importa a altura do jogador.

| Comando | Gesto | Observação |
|---|---|---|
| Andar | passo para o lado e ficar lá; voltar ao centro para | é posição, não passada |
| Agachar | agachar de verdade | o motor ainda não usa agachar na luta |
| Pular | pular de verdade | |
| Defender | guarda de boxe, punhos no rosto, **parado** | andando de guarda, anda |
| Soco | soco de qualquer braço, de frente ou de lado | |
| Chute | joelho alto, ou pé acima do joelho da outra perna | |
| Especial | **pose de torcida**: as duas mãos acima da cabeça por um instante | precisa da barra cheia, como no teclado |

A pose de torcida é decisão de Comunicação: o jogador comemora como
arquibancada para soltar o golpe do mascote.

## Ultimates (ideia do João, 17/09/2026)

Cada mascote tem **um ataque especial grande, o ultimate, que vem de algo do
mascote ou do clube**: símbolo do escudo, mito da torcida, apelido, hábito. É
a regra de design mais importante do jogo, porque é onde a camada de
Comunicação vira mecânica: o clube não aparece no escudo, aparece no golpe.

Exemplo canônico, dele: **Vasco. Uma caravela vem junto de uma onda e
atropela o personagem rival.**

O que isso implica:

- Ultimate é diferente do "especial" da tabela de golpes da v1. O especial é o
  quarto golpe comum, curto, sem cena. O ultimate é grande, dura uns 3
  segundos, para a luta e tem cena.
- **Medidor**: uma barra de torcida embaixo da vida, que enche com golpe dado
  e golpe tomado. Cheia, libera o ultimate (comando: baixo, frente + K, ou
  uma tecla dedicada; decidir na Academia). Um ultimate por round, no máximo.
- **Como se constrói, e por que é barato**: o ultimate é um **efeito em camada
  sobre o cenário**, não uma animação nova do mascote. A caravela e a onda
  são sprites próprios que atravessam a tela; o rival toca o `knockdown` que
  já existe; o mascote fica num quadro de "invocação" (pode ser o primeiro
  quadro do `heavy_attack` congelado, com brilho). Tremor de tela, flash e
  som de torcida fecham a cena. Nada disso passa pelo Spriterrific: a
  caravela e a onda saem de um modelo de imagem único, em duas ou três poses.
- Cada ultimate ganha uma ficha curta aqui antes de existir:

```
Mascote:
Nome do ultimate (como a torcida chamaria):
O que aparece na tela, em uma frase:
De onde vem (símbolo, mito, apelido):
Dano (fração da vida): 
Assets novos (sprites de efeito, sons):
```

Sementes já na tabela de candidatos. Fica na v1? Ver roteiro: abre o Marco 4,
logo depois de a v1 rodar de ponta a ponta. Se o João quiser antecipar, é
mais barato que um mascote novo.

## Cenário da v1

Um estádio do Rio genérico, hora do jogo à noite, três camadas: céu com
refletor, arquibancada (torcida animada em loop de 2 quadros), gramado onde a
luta acontece. Sem placa de patrocínio legível.

## Telas da v1

1. Título (nome do jogo, "aperte qualquer tecla").
2. Seleção de mascote (retrato, nome, dois cursores).
3. Luta (barras de vida, timer 99, contador de rounds, "Round 1, Fight!",
   "K.O.").
4. Vitória (retrato do vencedor, fala de vitória, "de novo?").

## Fora da v1 (parqueado, não descartado)

- Ultimates com medidor (ver seção acima). Primeiro item do Marco 4.
- CPU adversária.
- Modo história curto (três lutas com falas entre elas).
- Mais mascotes: entram só por JSON + sprites, ver Regra do JSON.
- Torcida reagindo ao placar (som e animação).
- Trilha por mascote (Suno).


## Almirante: conjunto de sprites (09/10/2026)

Pedido do João: todos os movimentos a partir do Green Boxer, respeitando as
correções do Urubu. Modelo visual: referência já existente do Almirante, com
chapéu preto, barba castanha, casaco naval preto com ombreiras prateadas e
forro vermelho, colete e calça cinza, botas pretas com punhos vermelhos.
Sem corvo, cruzes, escudos, armas ou texto.

- Slug: `almirante`; skin inicial: `base` (casaco naval).
- Silhueta: chapéu largo, ombreiras e casaco comprido aberto sobre pernas fortes.
- Paleta: preto, cinza/prata e vermelho.
- Arquétipo existente: agarrão pesado. Esta entrega adapta as ações do Green
  Boxer; agarrão e ultimate da caravela continuam no planejamento do GDD.
- Stats e combate: base do Green Boxer para comparar as animações.
- Falas de entrada e vitória: ainda não definidas.
- Ações: idle, andar para frente e para trás, agachar, saltar, defesa alta e
  baixa, reação ao golpe, soco leve, soco forte, chute forte, preparação do
  especial, especial e queda. O chute complementa o conjunto do Green Boxer,
  que só possui soco forte. Especial: sequência de socos, como o modelo base.
- Conferência: células de 256×256, cinco colunas, régua do idle, chão comum,
  ausência de fragmentos vizinhos e inspeção na Academia antes da seleção.

## Cartola e Cachorro: pacotes de arte (27/10/2026)

Os dois chegaram como pacote de arte pronto (só PNG, sem JSON), com o mesmo
conjunto de ações do Green Boxer. Entram jogáveis, com números de partida
medidos na própria arte; a ficha completa (arquétipo, falas, stats próprios)
continua em aberto com o João.

- **Cartola.** Slug `cartola`, skin base "Fraque bordô". Cartola preta,
  cabelo alaranjado, fraque bordô, gravata verde lisa, calça verde listrada,
  sapato preto. Silhueta: magro, cartola alta e cauda do fraque. Arquétipo do
  GDD: contra-golpe elegante (ainda não refletido nos números).
- **Cachorro.** Slug `cachorro`, skin base "Listrado". Cão de focinho longo e
  orelha em pé, camisa listrada preta e branca, short preto, meião, luva de
  luta. Silhueta: tronco e braços grandes, pernas curtas. Clube de origem,
  arquétipo e falas: a definir com o João (não está na tabela de candidatos).
- **Ações** (as 11 do pacote): guarda, andar para frente e para trás,
  agachar, saltar, defesa alta e baixa, reação ao golpe, soco leve, soco
  forte, queda. Especial provisório no molde do Green Boxer: `special-charge`
  usa o agachar e `special` usa o soco forte em três golpes. Sem chute.
- **Stats e combate:** os do Green Boxer, como o Almirante, para comparar.
- **Provisórios declarados pelo próprio pacote do Cartola:** soco forte,
  reação ao golpe e queda. A queda foi substituída na v02 por uma desenhada
  de verdade; soco forte e reação continuam pedindo redesenho.

## Esquadrão (Bahia): ficha (29/10/2026)

Entrou jogável por pedido do João ("só põe no jogo"), com quebra-galho onde
ainda não há sheet. Decisões de arte e golpes em `docs/mascotes/bahia.md`.

```
Nome no jogo: Esquadrão (provisório; "Super-Homem" é personagem da DC, Regra do Escudo)
Slug (pasta e JSON): bahia
Silhueta em uma frase: herói de capa vermelha pairando, botas penduradas, topete
Arquétipo: luta de longe (laser e grito), aberto para confirmar
Vida / velocidade / peso: padrão / padrão / padrão (em aberto)
Fala de entrada: em aberto
Fala de vitória: em aberto
Paleta (3 cores, sem o escudo): azul, vermelho, branco
```

| Botão | Golpe | Sheet hoje |
|---|---|---|
| Soco | dois jabs alternados | `light-punch.png` (v12) |
| Baixo + Soco | corte de mão aberta, de cima para baixo | `heavy-punch.png`, passo de 20 px |
| Chute | laser dos olhos (`eye-laser`), projétil `tiro`, sai na altura dos olhos | `heavy-kick.png` + `eye-laser-projectile.png` |
| Baixo + Chute, voadora, soco no ar | quebra-galho do catálogo (corte de mão aberta) | em aberto |
| Especial | **Bora Bahêa**: grito vira projétil de texto (`onda`), some no acerto, pular escapa, defesa segura, tonto 1 s, dano 25 (11%) | `special-charge.png`, `special.png` (grito segurado 0,4 s) + `bora-bahea-projectile.png` sem espelhar |

Corpo da v12 do Codex ligado em 29/10/2026: `idle`, andar, agachar, pulo,
defesas alta e baixa, apanhar, tonto e queda (termina deitado). Ainda faltam
`dash-forward`, `dash-back`, `low-kick`, `jump-punch` e `jump-kick` (em
produção) e o retrato próprio; retrato e âncora seguem recortes da guarda.
O texto do Bora Bahêa cresce com a distância (`growth`: 1,8× em 700 px, dano
até 1,6× e tontura de 1 s até 1,8 s).

## Porco (Palmeiras): ficha (29/10/2026)

Entrou jogável por pedido do João ("Coloca o porco"), com a arte da sessão do
Codex (`docs/porco-animacoes-v1.md`, skin `terno-v1`).

```
Nome no jogo: Porco
Slug (pasta e JSON): porco
Silhueta em uma frase: javali verde de terno rasgado, presas de marfim, calção branco
Arquétipo: pressão de perto (mordida, coice, vômito à queima-roupa)
Vida / velocidade / peso: padrão / igual ao Urubu / padrão
Fala de entrada: em aberto
Fala de vitória: em aberto
Paleta (3 cores, sem o escudo): verde, verde-escuro, branco
Rival: em aberto
```

| Botão | Golpe | Sheet |
|---|---|---|
| Soco | dois socos alternados | `light-punch.png` |
| Baixo + Soco | mordida (abre e fecha a mandíbula, tronco avança) | `heavy-punch.png` |
| Chute | chute padrão | `heavy-kick.png` |
| Baixo + Chute | coice de costas com passo largo (a corrida antes dele, `low-kick-run.png`, fica para quando o motor tiver corrida fora do especial) | `low-kick.png` |
| Especial | vômito verde: jato que sai da boca, anda 240 px e se desfaz; defesa segura, pular e agachar não escapam, tonto 1 s, dano 18 (8%) | `special-charge.png`, `special.png` + `vomit-jet.png` |

Torcida: camisas verdes ou brancas (João). `stunned` e `knockdown` ainda em
produção; a queda usa a reação de apanhar e a tontura cai no padrão do motor.
Retrato e âncora são recortes provisórios da guarda.

## Mosqueteiro (Corinthians): ficha (30/10/2026)

Entrou jogável pelo vigia de lutador novo, com a arte do Codex
(`docs/mosqueteiro-animacoes-v1.md`). A entrega bruta vem em células
640×320 e fica fora do git (`base-v1/`); o jogo usa a conversão para
512×256 em `jogo-v1/` (`scripts/celula_codex.py`, escala 0,92). As reações
(`hit-high`, `stunned`, `knockdown`) foram pedidas ao Codex à parte, porque
o plano dele não as tinha.

```
Nome no jogo: Mosqueteiro
Slug (pasta e JSON): mosqueteiro
Silhueta em uma frase: mosqueteiro de risca de giz preta, chapéu largo com pluma vinho, espada fina e mosquete nas costas
Arquétipo: alcance de espada e tiro lento e forte
Vida / velocidade / peso: padrão / padrão / padrão
Fala de entrada: em aberto
Fala de vitória: em aberto
Paleta (3 cores, sem o escudo): preto, branco, vinho
Rival: em aberto
```

| Botão | Golpe | Sheet |
|---|---|---|
| Soco | duas estocadas com a mesma espada (dois acertos separados) | `light-punch.png` |
| Baixo + Soco | cotovelada que sai do agachamento e termina em pé | `heavy-punch.png` |
| Chute | tiro de mosquete: embainha, mira, dispara no quadro 9, desembainha (26 de dano) | `shot.png` |
| Baixo + Chute | estocada baixa, abaixado durante o contato | `low-kick.png` |
| Especial | Gaviões da Fiel (tipo `esquadrao`): o Gavião mergulha do alto; só se acertar sem defesa, os três Gaviõezinhos (gorro, boné, boina) atacam um por vez de lados alternados, sem guarda que segure; 8 de dano cada contato. O mergulho sai numa hora sorteada entre 0,5 s e 1,8 s depois do botão. Fora do especial, os quatro andam atrás dele no fundo | `special-charge.png` + `gavioes/*` |

Torcida: listras verticais preto e branco, como a risca de giz.
Retrato e âncora são recortes da guarda.
