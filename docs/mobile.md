# Versão mobile: celular deitado com botões na tela (30/10/2026)

Pedido do João: jogo deitado no celular, sem barra de rolagem horizontal ou
vertical, opção de tela cheia para esconder a barra do navegador, e à
escolha do jogador botões direcionais ou joystick à esquerda; à direita
Rápido, Bruto, bloqueio e especial.

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

## Rodada 3 (01/11/2026): Xbox por padrão, OK e Voltar, nome do golpe da vez

- **Xbox é o padrão, PlayStation é opção.** Menu hambúrguer: "Botões: Xbox /
  PlayStation". Mesmo comando nas duas caras, pelo lugar no losango: baixo
  (A verde / ✕ azul) Rápido, direita (B vermelho / ○ vermelho) defesa,
  esquerda (X azul / □ rosa) Bruto, cima (Y amarelo / △ verde) especial.
  Letras e símbolos em SVG. Os ids do arranjo salvo viraram lugar (`cima`,
  `direita`, `baixo`, `esquerda`): o ajuste da rodada 2 voltou ao de fábrica.
- **Fora da luta, A / ✕ confirma e B / ○ volta** (Enter e Esc). Na luta voltam
  a ser Rápido e defesa. No fim da partida o A é revanche (ou segue o torneio)
  e o B volta ao menu. Quem decide é `src/toque/lutaNaTela.ts`: a Luta publica
  o estado todo quadro; sem luta, `null`.
- **Nome do golpe escondido por padrão.** "Nomes dos golpes" no menu liga.
  Ligado, cada botão mostra o golpe que sai agora, de pé, abaixado ou no ar
  (Rápido, Rápido Forte, Rápido Aéreo; Bruto, Bruto Baixo, Bruto de Cima),
  conforme `NOMES_DOS_ATAQUES`. O JSON não sobrepõe esses nomes; o nome
  próprio continua nas descrições e no especial. Nos menus,
  OK e Voltar. O especial fica apagado sem barra ou no ar.
- **Opacidade dos controles** (pedido do João no mesmo dia): item no menu
  que alterna 100%, 75%, 50% e 30%. Apertado, o controle acende inteiro; no
  Ajustar botões, todos aparecem inteiros.
- Preferências em `luta-de-mascotes:toque-botoes` (`src/toque/preferencias.ts`).

Verificado em Chromium com toque emulado (844×390): A avança da abertura ao
menu e do menu aos modos, B volta; na luta (Urubu) os nomes mudam de
Socos/Bicada de pé para Asas/Chute abaixado e Soco aéreo no pulo; troca para
PlayStation com as cores certas.

## Funções dos botões (03/11/2026)

Pedido do João: remapear o que cada botão faz, mas só entre o que o celular
tem. Menu ☰ ▸ Controles ▸ Funções dos botões (ou Ajustes ▸ Botões do
celular, que abre a mesma tela e fecha direto no Voltar). Cada item mostra
o botão e o golpe ("A: Rápido (trocar)"); tocar passa para o próximo golpe
(Rápido, Bruto, Defender, Especial) e quem tinha esse golpe fica com o antigo,
para nunca haver golpe repetido nem golpe sem botão. Andar, pular e agachar
ficam no direcional. Nos menus o lugar continua mandando: A / ✕ confirma e
B / ○ volta, qualquer que seja o golpe deles na luta. O especial apagado
segue o botão que tem o especial. Salvo em `funcoes` dentro de
`luta-de-mascotes:toque-botoes`; losango incompleto volta ao de fábrica.

Os botões apertam as teclas do P1, relidas a cada aperto: remapear o
teclado em Ajustes ▸ Botões do teclado vale na hora aqui também.

## Vertical, formatos e estabilidade (03/11/2026)
Em pé, o quadro do jogo fica acima e os controles numa área dedicada abaixo; o aviso de girar não bloqueia mais o jogo. Deitado, os controles continuam sobrepostos ao jogo. Menu ☰ > Controles > Formato da tela alterna Automático, 4:3, 16:9 e 18:9, salvos no aparelho. A troca recalcula largura lógica, câmera e HUD durante a luta sem zerar o combate; menus se remontam para a largura escolhida. Os personagens mantêm a proporção. Os arranjos salvos em pé e deitado são independentes. O editor rejeita colisões entre as caixas de toque, e arranjos antigos sobrepostos voltam ao padrão seguro.
Tamanho do canvas e zoom agora têm um único responsável em nitidez.ts. A geometria lógica é preservada sem deduzi-la repetidamente de pixels arredondados. ResizeObserver, resize da visualViewport, pageshow e rotação atualizam o encaixe. A viewport visível também limita o host e os controles; nenhuma tecla fica presa na rotação, perda de foco ou de captura. Tela cheia não trava mais a orientação.
Validação: geometria dos controles em celulares de 320–430 px e tablet, três formatos, rejeição de sobreposição, armazenamento separado e ciclos de rotação com câmera sincronizada. A revisão num aparelho real ainda precisa ser feita; o acesso visual nativo estava indisponível nesta sessão.

Ajuste posterior: em pé, a área útil fica dividida exatamente ao meio. O quadro do jogo ocupa a metade superior (imagem encaixada sem distorcer) e todas as caixas dos controles de luta ficam abaixo do meio; o editor também respeita esse limite. Deitado, botões de ação de fábrica aumentados em 25% e direcional até 190 px, com afastamento do losango recalculado para não sobrepor caixas de toque.

## Investigação de reinícios espontâneos (03/11/2026)
Não há location.reload, service worker ou reinício de Boot disparado por atualização de produção. Rotação e resize não remontam o Game. Não foi possível reproduzir o reinício relatado; a causa permanece sem confirmação. Encontrado risco concreto de memória na torcida: variantes pintadas persistiam entre partidas e folhas sem mudança de paleta eram copiadas novamente por clube/camisa. Agora fontes sem pintura compartilham quadros na textura original, preservando __BASE; variantes temporárias e animações correspondentes são liberadas ao sair da Luta. A legenda do P*tômetro só rasteriza a cor quando ela muda.
Diagnóstico técnico local na sessionStorage, chave luta-de-mascotes:diagnostico-sessao, limitado aos 20 últimos eventos: criação/destruição do Game, entrada em cena, tipo de navegação, document.wasDiscarded quando disponível, pagehide, perda/restauração WebGL e ocorrência de erro JS. Sem transmissão e sem recarga automática. Um descarte do processo pelo navegador não é evitável por JavaScript; registrar tipo de navegação e pressão de recursos ajuda a distinguir as hipóteses. Referência: https://developer.chrome.com/docs/web-platform/page-lifecycle-api .

Correção de alinhamento vertical: game-host é flex-direction: column, portanto justify-content: center ainda centralizava o quadro na página inteira. No retrato, justify-content agora é flex-start; a imagem dentro do quadro superior fica por padrão alinhada embaixo, com a borda inferior na divisão central. Pausa > Ajustes oferece posição vertical (junto à divisão, topo, centro da metade superior), formato, som, volumes de música/efeitos e FPS. Posição salva separadamente no aparelho; mudar posição atualiza as coordenadas de entrada sem reiniciar o jogo.

## Desempenho e FPS (03/11/2026, noite)
A preparação de arte por torcedor agora usa cache por humor; a configuração do filtro NEAREST só ocorre quando necessária e variantes já prontas retornam antes de chamar o renderer. Recortes compartilhados são reutilizados sem percorrer novamente todos os quadros. Teste: 600 atualizações de um ator, incluindo troca de humor, solicitam somente duas preparações de arte.
O alerta de canto usa dois gradientes 128x128 criados uma vez e quatro imagens com opacidade variável, substituindo a geração de centenas de retângulos por atualização. Eventos de vida/ações atualizam o modelo sem desenhar o HUD novamente; faixa de humor é publicada somente ao mudar. O arco do medidor conserva o desenho quando parado e o relógio só rasteriza uma nova cor quando ela muda.
O contador mede eventos postrender reais numa janela de 500 ms, em vez da média lenta actualFps. Indica PAUSADO quando o jogo está pausado, libera seu ouvinte ao desligar e fica fora do notch via safe-area-inset. Teste reproduz 60 FPS e queda imediata para 10 FPS. Melhora de FPS no aparelho real ainda não foi medida nesta sessão.
