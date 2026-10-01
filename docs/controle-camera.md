# Controle por câmera: análise (01/10/2026)

**Atualização do mesmo dia:** o João mandou construir antes da v1, com o
celular como câmera (QR code, jogo no PC). Feito: decisão em
`docs/decisoes/0004-controle-celular.md`, gestos em `docs/gdd.md`, código em
`src/controle/`. Como rodar: `npm run dev:celular`, abrir
`https://localhost:5173`, menu **Celular**, escanear o QR.

O texto abaixo é a análise original, mantida como registro. Duas coisas
mudaram na construção: o caminho virou o celular (não a webcam do PC), e a
guarda só defende parada, porque no motor bloquear trava o passo.

## O que o Fight_Detection entrega

Pipeline Python (`Fight_Detection/fight_detection/app/`): webcam a 640x480,
YOLO26s-pose com ByteTrack (até várias pessoas, cada uma com id), 18 juntas
por pessoa, uma LSTM que classifica a janela dos últimos 32 frames.

| Saída | O que é | Serve pro jogo? |
|---|---|---|
| PARADO | classe da LSTM | não precisa, é o neutro |
| ANDANDO | classe da LSTM, **sem direção** | não: o jogo precisa de esquerda e direita |
| SOCO | classe da LSTM, sem dizer qual braço | sim, como `light` |
| CHUTE | classe da LSTM | sim, como `heavy` (o Urubu já usa `heavy-kick`) |
| BRIGA | punho ou pé de uma pessoa dentro da caixa de outra | não: o jogo já calcula o acerto |
| juntas + caixa por pessoa | posição em pixel, 18 pontos | **sim, é a parte valiosa** |

Faltam, para o jogo, cinco dos oito comandos: esquerda, direita, agachar,
pular, bloquear e especial. Nenhum vem da LSTM; todos saem da geometria das
juntas.

## O problema: a LSTM é lenta demais para luta

Medido com as amostras reais do dataset (`app/tests/fixtures/`): janela de
PARADO, entrando quadros de golpe um a um, até a LSTM mudar de ideia.

| Golpe | Quadros até virar (mediana, p25 a p75) | Tempo a 15-20 fps |
|---|---|---|
| SOCO | 22 (17 a 27) | 1,1 a 1,5 s |
| CHUTE | 16 (11 a 22) | 0,8 a 1,1 s |

E isso é com soco **contínuo** (o MHAD repete o golpe). Um jab isolado dura
menos que 17 quadros e pode nem virar. Jogo de luta pede resposta abaixo de
0,1 s. Conclusão: a LSTM não serve de gatilho. Os golpes também saem de
geometria: velocidade do punho e abertura do cotovelo, que respondem no
mesmo quadro.

## Onde o jogo recebe o controle

O motor já está pronto para isso, sem mexer em `fighter.ts`. A cada quadro a
Luta monta um `FighterInput` (`src/game/fighter.ts:74`) com oito campos:
`left`, `right`, `crouch`, `block` (segurados) e `jump`, `light`, `heavy`,
`special` (só no quadro em que dispara). Hoje duas fontes produzem isso: o
teclado (`readKeys` em `MatchScene.ts`) e a CPU (`CpuController`). A câmera
vira a terceira fonte. Regra do JSON intacta: o controle não sabe qual
mascote está jogando.

## Gesto para comando (sugestão, vai para o GDD se aprovado)

Tudo relativo a uma calibração de 2 s parado em pé (largura de ombro, altura
do quadril e do pescoço), com a imagem espelhada.

| Comando | Gesto | Tipo |
|---|---|---|
| `left` / `right` | quadril sai do centro calibrado mais que meia largura de ombro | segurado |
| `crouch` | pescoço desce mais que 25% do tronco | segurado |
| `jump` | quadril sobe rápido acima da linha calibrada | quadro único |
| `block` | guarda: os dois punhos acima do ombro, perto do rosto, parados por 150 ms | segurado |
| `light` | punho dispara para o lado do adversário e o cotovelo abre além de 150° | quadro único |
| `heavy` | joelho ou tornozelo sobe acima da altura do quadril | quadro único |
| `special` | "pose de torcida": os dois braços em V acima da cabeça | quadro único |

O especial como gesto de torcida é escolha de Comunicação: o jogador
comemora como arquibancada para soltar o golpe do mascote.

## Dois caminhos

| | A. Ponte com o Fight_Detection | B. Pose direto no navegador |
|---|---|---|
| Como | Python roda à parte e manda as juntas por WebSocket para `localhost` | MediaPipe Pose Landmarker em TS, dentro do jogo |
| Onde roda | só no PC do João (Python, GPU, 3 GB de PyTorch) | em qualquer navegador com câmera, inclusive no link publicado |
| Velocidade | 13 a 18 fps medidos na RTX 3050 | ~30 fps em notebook comum |
| Peças novas | servidor WebSocket no Python, cliente no jogo, dois processos | uma dependência (`@mediapipe/tasks-vision`, ADR própria) e o modelo de pose (~6 MB) |
| Teste | detector em Python, jogo em TS | detector em TS, testado pelo vitest com poses gravadas |

**Recomendação: B.** O que o Fight_Detection tem de único é a LSTM, e ela
não serve para luta. A parte que serve (pose de corpo inteiro) o navegador
faz sozinho, mais rápido, e vai junto no link. O Fight_Detection fica como
bancada de referência: as regras dele (640x480, janela cheia, teste 2D)
valem de lição.

## O que precisa ser criado (caminho B)

1. **Fonte de controle única.** `src/game/controles/`: teclado, CPU e câmera
   expondo o mesmo `update(tempo): FighterInput`. A Luta escolhe a fonte
   por jogador. Hoje teclado e CPU estão dentro de `MatchScene.ts`.
2. **`gestos.ts`.** Funções puras: juntas + calibração viram intenção. É
   aqui que mora todo o ajuste. Testes com poses gravadas do João.
3. **`ControleCamera`.** Abre a webcam, roda a pose a cada quadro, passa por
   `gestos.ts` e garante o "quadro único" de `jump`, `light`, `heavy` e
   `special`.
4. **Calibração.** Tela de 2 s antes da luta: "fica em pé de frente".
5. **Espelho na tela.** Miniatura da câmera com o esqueleto num canto da
   Luta, acendendo o comando lido. Sem isso o jogador não sabe por que o
   mascote não socou.
6. **Opção no menu.** "Controle: Teclado / Câmera" na escolha de modo.
7. **Academia de gestos.** Na Academia, um modo que mostra o esqueleto e
   qual comando foi lido, para ajustar os limites sem lutar (espírito da
   Regra da Academia).
8. **Papel.** Tabela de gestos no `docs/gdd.md` e ADR da dependência em
   `docs/decisoes/`.

## Ordem que roda cedo (Regra do Fim de Semana)

- **Janela 1:** itens 1 e 3 com só `left`, `right` e `light`. P1 na câmera
  contra a CPU. Roda no fim: andar de lado e socar mexe o mascote.
- **Janela 2:** `block`, `crouch`, `heavy`, calibração e espelho.
- **Janela 3:** `jump`, `special`, Academia de gestos, opção no menu.
- **Depois, se valer:** dois jogadores na mesma câmera (esquerda da imagem é
  P1, direita é P2). Pede uns 3 m de sala e luz boa.

## Riscos

- **Ajuste é empírico.** Os limites só se acertam com o João na frente da
  câmera, testando. Conta mais tempo que o código.
- **Corpo inteiro na imagem.** Chute e agachar precisam dos pés visíveis:
  jogador a uns 2,5 m da câmera. No celular do professor isso é difícil;
  a demo com câmera é no notebook.
- **Guarda e soco brigam.** O soco sai da guarda. O bloqueio só liga com a
  guarda parada, e esse atraso precisa ser testado.
- **Cansaço.** Round de 99 s pulando de verdade cansa. Na apresentação isso
  vira graça; em partida longa vira abandono.
- **Câmera pede HTTPS.** `localhost` e Vercel/GitHub Pages servem.
