# Modo tutorial (03/11/2026)

A seção 1 é o roteiro do João, guardado como ele escreveu. As seções seguintes
são o desenho para construir: o que foi decidido na conversa (marcado
"João") e as decisões de quem constrói (marcadas "decisão do agente"), que o
João pode trocar.

## 1. Roteiro do João (texto original, 03/11/2026)

> Precisamos adicionar um modo tutorial, é possível verificar se a pessoa já
> acessou antes o jogo pelos cookies? se for a primeira vez aparece uma tela
> perguntando de tutorial antes de qualquer menu. A pessoa então escolhe o
> personagem dela contra a CPU (Interessante a cpu pegar um rival do time, ou
> alguém da mesma região do Brasil) e a CPU tem que fazer exatamente o que o
> tutorial manda.
>
> Importante as teclas que aparecerem sempre estarem de acordo com as teclas
> player definiu no remapeamento de teclas/mobile. Aqui vai um roteiro para o
> tutorial, mas precisa ser adaptado com as teclas (Controle do mobile
> incluso)
>
> A cada texto "-" o jogo pausa (tempo congela)
>
> Checklist para o que o player fez, com isso desbloqueia a próxima etapa do
> tutoial:
>
> - Se movimente com "A, esquerda" "D, direita".
>
> - Pule com "W" abaixe-se com "S"
>
> - Pra cima dele! (D, 2 vezes rápido)
>
> CPU caminha até o player
>
> - Experimente bater com "Q" ou "E".
>
> \*P\*tometro enche no máximo
> "Foco de luz no P\*tometro"
> - Que Show! A torcida se animou!
>
> CPU bloqueia em pé
>
> - Agora derrube essa guarda com golpes fortes! ("Q + (segurando) S" "E +
>   (segurando) S)
>
> CPU fica pulando (mas com delay de 1,5s entre cada pulo)
>
> - Agora tente pulando ("Q + (no ar, W)" "E + (no ar, W)")
>
> CPU difere socos leves
>
> \* P\*tometro desaba no vermelho
> (Foco de luz no P\*tometro)
> - P%#R@! A torcida não está Gostando!
>
> (Treino de Aparo)
> - Rápido! Bloqueie alguns golpes segurando "C"!
>
> CPU difere socos leves e fica estunado
>
> - Bloquear na hora do impacto deixa eles tontos! Continue com o C
>
> CPU difere mais socos leves (Apenas para mostrar a defesa de golpes, sem
> aparo)
>
> CPU difere um soco abaixado (quebrando a defesa)
>
> - Bloqueio de pé não aguenta golpes pesados
> - Bloqueie abaixado ("S" + "C")
>
> CPU difere golpes pesados
>
> \*Com sucesso das defesas
>
> CPU dá uma voadora e quebra a defesa baixa
>
> - Desvie da voadora com um passo largo (A, 2 vezes rápido)
>
> CPU para de se mexer
>
> - Vamo Virar! Aperte "espaço"
>
> Player acerta o especial, medidor sobe
>
> \* Foco de Luz no P\*tometro
>
> - Agora sim!
>
> \* Mantendo o foco de luz no P\*tometro, adicione um foco na barra de ult
>   carergando
>
> - Agradar a torcida faz seu Especial carregar mais rápido com o tempo!
>
> - Chega de conversa! QUEBRE ELE!
>
> CPU no modo fácil

## 2. Para que serve

Quem abre o jogo pela primeira vez (colega de turma, banca da CTN1423) não
sabe que existe dash, aparo, guarda baixa e Putômetro. O tutorial ensina
cada mecânica fazendo, com a CPU servindo de boneco que faz exatamente o
que o texto pede, e termina numa luta de verdade contra a CPU no fácil.

Sucesso: alguém que nunca jogou sai do tutorial sabendo andar, dar dash,
quebrar guarda, atacar no ar, aparar, defender agachado, desviar da
voadora e soltar o especial, com as teclas que ele mesmo vai usar.

Fora do escopo: ensinar o especial próprio de cada mascote, ensinar o
controle pelo corpo (celular como câmera), remodelar a Academia.

Fracasso mesmo funcionando: texto mostrando tecla errada (a padrão quando a
pessoa remapeou, ou tecla de teclado no celular), etapa que trava sem a
pessoa entender o que falta, CPU que faz outra coisa que não a pedida.

## 3. Fluxo

1. **Primeira visita (João).** O jogo grava `luta-de-mascotes:tutorial-visto`
   no `localStorage`, como já faz com controles e ajustes. Sem a marca, a
   abertura leva para a tela **"Primeira vez?"** em vez do menu: "Aprender a
   jogar" ou "Pular". As duas gravam a marca. Aba anônima ou cache limpo
   mostram de novo (aceito).
2. **Seleção.** "Aprender a jogar" abre a Seleção no modo tutorial: a
   pessoa escolhe só o próprio mascote; a CPU vem sozinha pela regra do
   rival (seção 6). Estádio fixo.
3. **Tutorial.** A luta abre no modo tutorial (seção 4), por baixo igual ao
   treino livre: sem relógio, sem round, vida que volta, ninguém perde.
   O painel de dev do treino **não aparece** (decisão do agente; a Academia
   é "muito dev" e vai ser remodelada depois, João).
4. **"Chega de conversa! QUEBRE ELE!"** reinicia a cena como luta normal 1
   VS CPU, os mesmos dois mascotes, CPU no **Fácil** (João), com rounds,
   relógio e tela de fim.
5. **Voltar depois (João).** O tutorial fica na Academia, ao lado do Treino
   livre (tecla U, ou o botão na aba Treino do painel). Decisão do agente: também no menu principal não, para não somar
   botão no menu; se o João quiser, vira item do menu depois.
6. Pausa (Esc ou o botão de menu do celular) funciona como na luta; "Sair"
   volta ao menu principal e "Recomeçar" refaz o tutorial do início. Um
   "Pular tutorial" na pausa fica para a entrega 2 (decisão do agente).

## 4. Motor do tutorial

### Texto que congela o tempo (João)

Cada linha com "-" no roteiro é uma **fala**: o jogo congela (lutadores,
animações, timers; como a pausa), a fala aparece numa caixa no terço de
cima, e a pessoa continua com qualquer botão de luta, Enter ou toque na
tela. A caixa só aceita continuar depois de 0,4 s, para golpe apertado na
hora não pular a fala sem ler (decisão do agente). Duas falas seguidas no
roteiro viram duas caixas seguidas.

### Checklist (João)

Depois da fala, a luta solta e um checklist pequeno fica no canto de cima,
abaixo do HUD, com uma linha por coisa a fazer e a tecla de cada uma. Item
feito ganha um visto. Com todos feitos, a próxima etapa começa.

### Teclas certas (João)

Toda tecla nos textos e no checklist sai de um marcador no roteiro
(`{esquerda}`, `{soco}`, `{defesa}`...) resolvido na hora da fala:

- **Teclado:** a tecla salva em Ajustes > Botões do teclado
  (`carregarControles`), com o nome de `nomeDaTecla` (Espaço, Shift...).
  As teclas extras do modo sozinho (I O P) não aparecem, para não poluir.
- **Celular (controles de toque ativos):** direção vira "direcional ◀ ▶ ▲
  ▼"; golpe vira o nome do botão na cara escolhida (Xbox: A B X Y;
  PlayStation: Xis, Bola, Quadrado, Triângulo) na posição em que a pessoa
  pôs aquela função (Funções dos botões).
- **"Para frente" e "para trás"** dependem de que lado a pessoa está: o
  texto do dash e do passo largo usa a direção certa naquele momento.
- O texto lê de novo se a pessoa remapear pela pausa.

### CPU roteirizada (João: "faz exatamente o que o tutorial manda")

No tutorial a CPU não é a `CpuLutador`: é um roteiro por etapa que
devolve a entrada dela a cada quadro (parada, andar até o jogador, guarda
alta, pular a cada 1,5 s, soco rápido em ritmo, soco forte, voadora). Pura,
sem Phaser, testada como a `cpu.ts`.

### Putômetro e foco de luz (João)

O tutorial pode **mandar** no Putômetro do jogador (encher até o "Que
Show!", derrubar até o vermelho) e acender um **foco de luz**: a tela
escurece e só o Putômetro (e, na etapa final, também a barra do especial)
fica clara, com a fala por cima.

### Putômetro no começo

O jogo começa o Putômetro em 0,7, que já é verde ("Que Show!"). No tutorial
ele começa no amarelo, para a subida da etapa 4b aparecer (decisão do
agente, 03/11/2026).

### Passo largo

O tutorial conta o passo largo pelos dashes **iniciados**: colado no rival
o dash para a frente começa e para no mesmo quadro, e apertar os dois
toques já vale (decisão do agente, 03/11/2026).

### Vida

Igual ao treino (decisão do agente, confirmado como palpite): a vida desce
ao apanhar e volta sozinha; ninguém cai de vez antes do "QUEBRE ELE!".

## 5. As etapas

Mecânica do motor que cada uma usa, para quem constrói: soco forte é
Baixo + Soco e chute baixo é Baixo + Chute, os dois quebram a guarda alta;
voadora é Chute no ar e é a única que quebra a guarda baixa; aparo é a
guarda apertada até 0,15 s antes do golpe (`isPerfectGuard`), deixa quem
bateu tonto 0,8 s; passo largo é o dash para trás (dois toques rápidos).

| # | CPU faz | Fala (antes) | Checklist para passar |
|---|---------|--------------|-----------------------|
| 1 | parada, longe | Se movimente com {esquerda} e {direita}. | andou para a esquerda; andou para a direita |
| 2 | parada | Pule com {pular}, abaixe-se com {abaixar}. | pulou; abaixou |
| 3 | parada | Pra cima dele! ({frente} 2 vezes rápido) | deu um dash para a frente |
| 4 | anda até o jogador e fica parada | Experimente bater com {soco} ou {chute}. | acertou um soco; acertou um chute |
| 4b | Putômetro do jogador vai ao máximo, foco de luz nele | Que Show! A torcida se animou! | (só a fala) |
| 5 | guarda alta, parada | Agora derrube essa guarda com golpes fortes! ({abaixar} + {soco} ou {abaixar} + {chute}) | quebrou a guarda dela |
| 6 | pula no lugar a cada 1,5 s | Agora tente pulando ({pular}, e no ar {soco} ou {chute}) | acertou um golpe no ar |
| 7 | começa a soltar soco rápido; Putômetro do jogador desaba no vermelho, foco de luz | P%#R@! A torcida não está gostando! | (só a fala) |
| 8 | soco rápido em ritmo, com o aviso de aparo | Rápido! Bloqueie na hora do impacto apertando {defesa}! | 1 aparo |
| 8b | fica tonta (o aparo) | Bloquear na hora do impacto deixa eles tontos! Continue com {defesa}. | (só a fala) |
| 9 | mais socos rápidos | (sem fala nova) | defendeu 3 socos (aparo ou guarda comum) |
| 10 | um soco forte que quebra a guarda alta | Bloqueio de pé não aguenta golpes pesados. / Bloqueie abaixado ({abaixar} + {defesa}). | (as falas vêm depois que a guarda quebrou) |
| 11 | soco forte e chute baixo alternados | (sem fala nova) | defendeu 3 golpes pesados agachado |
| 12 | uma voadora que quebra a guarda baixa | Desvie da voadora com um passo largo ({tras} 2 vezes rápido). | desviou de uma voadora com o dash para trás |
| 13 | parada; a barra do jogador enche | Vamo Virar! Aperte {especial}. | acertou o especial |
| 13b | Putômetro sobe, foco de luz nele | Agora sim! | (só a fala) |
| 13c | foco no Putômetro e na barra do especial | Agradar a torcida faz seu Especial carregar mais rápido com o tempo! | (só a fala; ver seção 8) |
| 14 | | Chega de conversa! QUEBRE ELE! | vai para a luta no Fácil |

### O aparo como quick time event (João)

"Tem que ser sincronizado, perfeito, para a pessoa não tomar o soco. Quase
um quick time event." No passo 8:

- A CPU solta um soco rápido de cada vez, com pausa entre eles, sempre do
  mesmo jeito, para dar ritmo.
- Um anel encolhe em volta do jogador e fecha no instante em que o soco
  chega; a tecla de defesa aparece no meio dele. A luta fica em câmera lenta
  (metade da velocidade) enquanto o anel fecha, para a janela de 0,15 s
  ficar humana (decisão do agente).
- Apertou na janela: aparo, faísca azul, a CPU fica tonta e a etapa passa.
- Apertou cedo (segurando antes): a guarda segura, não toma dano, mas não
  vale: aviso "Cedo! Aperte na hora do impacto" e a CPU tenta de novo.
- Atrasado ou sem apertar: toma o soco, aviso "Tarde!" e a CPU tenta de
  novo. Sem limite de tentativas.

Os passos 10 e 12 começam com um golpe que **tem** que quebrar a defesa: a
CPU espera a pessoa estar defendendo do jeito errado (de pé, depois
agachada) antes de soltar, e a fala vem depois do golpe entrar. Se a pessoa
não estiver defendendo, a CPU espera com a guarda dela, e um aviso lembra:
"Segure {defesa}".

## 6. Quem a CPU escolhe (regra do rival)

Proposta aceita pelo João em 03/11/2026. Cada JSON de lutador ganha
`estado` (sigla da UF do clube) e, quando houver, `rival` (o id do
clássico). A CPU pega, nesta ordem:

1. o `rival` declarado, se estiver na seleção;
2. alguém do mesmo estado;
3. alguém da mesma região do Brasil (tabela UF → região no código, dado
   fixo do país, não do mascote);
4. sorteio entre os outros.

Nunca o mesmo mascote do jogador. Valores iniciais (decisão do agente, a
conferir pelo João):

| Mascote | Estado | Rival |
|---|---|---|
| Urubu | RJ | Almirante |
| Almirante | RJ | Urubu |
| Cartola | RJ | Urubu |
| Bira | RJ | Cartola |
| Porco | SP | Mosqueteiro Paulista |
| Mosqueteiro Paulista | SP | Porco |
| Saci | RS | Mosqueteiro Gaúcho |
| Mosqueteiro Gaúcho | RS | Saci |
| Galo | MG | (sem rival no elenco: sai alguém do Sudeste) |
| Esquadrão | BA | (sorteio: Nordeste sem mais ninguém) |
| Dragão | GO | (sorteio) |
| Vovô Coxa | PR | (Sul: Saci ou Mosqueteiro Gaúcho) |

Pela Regra do Criador, `estado` e `rival` entram no questionário de
mascote novo no mesmo commit.

## 7. Celular

O tutorial roda com os controles de toque: textos com os nomes dos botões
(seção 4), continuar a fala com um toque na tela. Dash e passo largo no
celular são os mesmos dois toques rápidos no direcional, que já viram duas
teclas apertadas. O controle pelo corpo fica de fora.

## 8. Em aberto para o João

- **A torcida não acelera o especial hoje.** A barra enche com o tempo
  (45 s) e com golpes; o Putômetro não muda isso. A fala 13c ensinaria uma
  regra que não existe. Ou o motor ganha a regra (a barra enche mais rápido
  com o ponteiro no verde, mais devagar no vermelho, em toda luta), ou a
  fala muda. Recomendação: criar a regra, porque dá sentido ao Putômetro.
- **Guia rápido do 1x1 (João, 03/11/2026).** Pedido à parte: uma tela só
  com os comandos dos dois jogadores. Fica para depois do tutorial; falta
  decidir quando aparece.

## 9. Ordem de construção (Regra do Fim de Semana)

1. **Entrega 1 (feita em 03/11/2026):** primeira visita, tela "Primeira vez?", Seleção do
   tutorial com rival, motor de falas e checklist com teclas certas,
   etapas 1 a 6 com o foco de luz do "Que Show!", e o "QUEBRE ELE!"
   levando à luta no Fácil. Roda de ponta a ponta pulando a defesa.
2. **Entrega 2:** etapas 7 a 13: aparo com anel e câmera lenta, guarda
   alta e baixa, voadora e passo largo, especial e o foco duplo.
3. **Entrega 3:** botão Tutorial na Academia, a regra da torcida no
   especial (se aprovada), guia rápido do 1x1.
