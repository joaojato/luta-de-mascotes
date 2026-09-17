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

| Mascote | Clube de origem | Arquétipo de luta | Semente de especial |
|---|---|---|---|
| Urubu | Flamengo | aéreo, pressão | mergulho do alto, rasante |
| Cartola | Fluminense | contra-golpe elegante | bengala como alcance, cartola que vira projétil |
| Almirante | Vasco | agarrão pesado | âncora, onda |
| Manequinho | Botafogo | pequeno e irritante, trapaceiro | esguicho (manter cômico, não vulgar) |
| Galo | Atlético-MG | agressivo, curta distância | bicada em sequência, canto que atordoa |
| Saci | Internacional | teleporte, trapaça | redemoinho, some e aparece atrás |
| Mosqueteiro | Corinthians ou Grêmio | espada, alcance médio | estocada |
| Raposa | Cruzeiro | finta, esquiva | rasteira, ataque por trás |
| Baleia | Santos | gigante lento, dano alto | jato d'água, pulo sísmico |
| Vozão | Ceará | velho mestre, contra-golpe | bengalada, "no meu tempo" |

Se o João quiser outro clube na v1, entra aqui primeiro, com arquétipo e
semente de especial, antes de qualquer sprite.

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

- CPU adversária.
- Modo história curto (três lutas com falas entre elas).
- Mais mascotes: entram só por JSON + sprites, ver Regra do JSON.
- Torcida reagindo ao placar (som e animação).
- Trilha por mascote (Suno).
