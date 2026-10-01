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

## Golpes da v1 (4 por mascote)

Mesmo esqueleto para todos, muda só a animação e os números.

| Golpe | Tecla P1 / P2 | Animação (Spriterrific) | Dano | Alcance |
|---|---|---|---|---|
| Soco fraco | J / numpad 1 | `light_attack` | baixo | curto |
| Soco forte | K / numpad 2 | `heavy_attack` | médio | curto |
| Chute | L / numpad 3 | custom `chute` (baseline `attack`) | médio | médio |
| Especial | frente + K | custom por mascote (baseline `attack` ou `jump`) | alto | depende |

Movimento: A/D anda, W pula, S agacha (P1); setas (P2). Bloqueio: segurar
para trás. Em v1 o bloqueio usa um quadro parado da animação de agachar ou de
parado, sem animação própria, para economizar crédito.

Números exatos (dano, frames de startup, active, recovery) ficam no JSON do
mascote, não aqui. Aqui é a intenção.

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
