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
