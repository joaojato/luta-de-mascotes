# Versão mobile: celular deitado com botões na tela (30/10/2026)

Pedido do João: jogo deitado no celular, sem barra de rolagem horizontal ou
vertical, opção de tela cheia para esconder a barra do navegador, e à
escolha do jogador botões direcionais ou joystick à esquerda; à direita
soco, chute, bloqueio e especial.

## Como funciona

- **Os botões apertam as teclas do P1.** `src/toque/telaToque.ts` dispara os
  mesmos eventos de teclado do WASD, E, Q, C e Espaço (o mapa do P1 em
  `controles.ts`). Menus, seleção e luta funcionam sem código novo nas
  cenas: o direcional anda nos menus e o Especial (Espaço) confirma.
- **Liga sozinho em aparelho de toque** (`pointer: coarse`). Para testar no
  computador: `?shell=game&toque=1`. `?toque=0` desliga.
- **Só 1 VS CPU no celular.** Um par de mãos na tela não joga 1 VS 1; o
  cartão some da escolha de modo quando os controles de toque estão ativos.
- **Direcional em 8 fatias** (`direcao.ts`, testado): diagonal aperta duas
  direções (pular para a frente, agachar recuando). Setas valem com qualquer
  toque fora do miolo; o joystick pede um empurrão maior (zona morta de 35%)
  e o pino segue o dedo.
- **Multitoque:** cada controle guarda o próprio dedo. Andar e socar ao mesmo
  tempo funciona.
- **Coluna à esquerda:** voltar (Esc), tela cheia, e troca entre setas (✚) e
  joystick (◎). A escolha fica guardada no aparelho.
- **Tela cheia:** no Android o botão esconde a barra e trava deitado. No
  iPhone o Safari não deixa página entrar em tela cheia: o botão mostra o
  caminho (Compartilhar ▸ Adicionar à Tela de Início). Aberto pelo ícone,
  o jogo roda sem barra (`manifest.webmanifest`, `display: fullscreen`).
- **Em pé:** aparece "Gire o celular para jogar deitado".
- **Sem rolagem:** a página do jogo usa `100dvh` e `overflow: hidden`; abaixo
  de 960 px o shell ganhava `overflow: auto` e rolava.

## Verificado

Celular simulado (844×390, toque real pelo protocolo do Chrome): página do
tamanho exato da tela, sem rolagem; splash, menu, modo, cenário, seleção e
luta só com toques; P1 andou segurando a seta e socou com outro dedo ao
mesmo tempo; joystick levou o P1 para a esquerda; em pé, o aviso de girar.

## Em aberto

- Teste num celular de verdade (o João).
- A dica de rodapé ainda mostra as teclas do teclado.
- Multiplayer em aparelhos diferentes continua como tarefa à parte.

# Rodada 2: correções do teste no iPhone (31/10/2026)

O João testou no iPhone, como app na Tela de Início, e pediu seis coisas.

- **Tela inteira, HUD sempre visível.** No toque, a altura do jogo fica em
  720 e a largura acompanha a proporção da tela, de 1280 (16:9 e tablet) até
  1680 (limite do estádio, que mede 1697 nessa altura). Decidido a cada cena
  que abre (`src/toque/tamanhoDoJogo.ts`); no meio da luta, uma mudança vira
  faixa fina até a próxima cena. O canvas mora na área segura (fora do notch
  e da barra de início), medida por `env(safe-area-inset-*)`, e a altura vem
  do host fixo, não de `vh`.
- **Losango do PlayStation.** Triângulo verde em cima = Especial (Espaço),
  bola vermelha à direita = Soco, xis azul embaixo = Chute, quadrado rosa à
  esquerda = Defesa. Símbolo desenhado em SVG na cor do PS, nome pequeno
  embaixo.
- **Bug do iPhone: lupa de texto e zoom ao segurar o direcional.** As setas
  eram texto (▲◀), e o iOS ignora `user-scalable=no`. Agora: nenhum texto
  selecionável na página, setas em SVG, `touchstart/touchmove/touchend`
  cancelados nos controles de luta (os eventos de ponteiro continuam), e
  `gesturestart`, `dblclick` e `selectstart` cancelados no documento.
  `-webkit-text-size-adjust: 100%` impede o iPhone de aumentar texto deitado.
- **Menu hambúrguer** no canto de cima à esquerda, no lugar da coluna de
  botões. Abrir pausa o jogo inteiro (`game.pause()`) e solta toda tecla
  apertada. Itens: Continuar, Voltar / sair da luta (Esc), Tela cheia (some
  quando aberto pelo ícone), Direcional setas/joystick, Ajustar botões.
  Na luta, o HUD abre margem para o botão; no 16:9, sem sobra, o HUD
  encolhe até caber (`encaixeComMenu` em `matchHud.ts`).
- **Ajustar botões.** Arrasta cada controle (direcional, os quatro botões,
  o próprio menu); toca num e usa − e + para o tamanho; Restaurar volta ao
  de fábrica; Pronto retoma o jogo. Guardado no `localStorage` do aparelho
  (`luta-de-mascotes:toque-layout`), em fração da tela, só os controles
  mexidos. Não é cookie: cookie vai para o servidor a cada pedido e este
  jogo não tem servidor. Atenção: no iPhone, Safari e o ícone da Tela de
  Início guardam separado; o ajuste feito num não aparece no outro.
- **Dicas de teclado somem no toque** (`createFooterHint`), e o splash diz
  "Toque na tela para começar".

Parte pura testada em `src/toque/layout.test.ts` (arranjo de fábrica dentro
da área segura, losango, arrastar sem sair da tela, piso e teto do tamanho,
salvar e restaurar, largura do jogo por proporção).

Verificado em Chromium com toque emulado (844×390, 667×375 e 740×330):
largura do jogo 1558, 1280 e 1614; HUD inteiro nas três; menu pausa e
retoma; botão arrastado e aumentado continua no lugar depois de recarregar.
O WebKit do Playwright no Windows não carrega as ~400 imagens do jogo
(erro de "access control checks" dele), então lupa e zoom do iOS só se
confirmam no iPhone de verdade.
