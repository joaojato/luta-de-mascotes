# Lições

O destilado do `diario-de-bordo.md`: o que funciona com o João e o que não
funciona, neste projeto. Este arquivo **é editável**, ao contrário do diário.

Toda linha cita a data da entrada do diário que a originou, entre parênteses.
Sem a citação, a afirmação não pode ser conferida depois e vira folclore.

Quando uma lição se mostrar errada, **corrija a linha**, não acrescente outra
embaixo contradizendo.

## Sobre a mecânica

- **Caixa de apanhar herdada era a soma de todos os quadros da ação.** A
  bengalada do Cartola deixava ele vulnerável na ponta da bengala durante
  1,33 s, e o soco rápido alcançava mais que o punho desenhado; com emenda
  livre e atordoamento maior que o intervalo entre socos, o soco virou
  combo infinito e o meta era spam. Medir saída, janela, recuperação e
  alcance contra o desenho antes de culpar a arte. (2026-10-28)

## Preferências confirmadas

Coisas que ele aprovou de forma explícita, ou que repetiu como regra.

- Português do Brasil, sem travessão como pausa explicativa. (regra global
  dele, anterior a este projeto)
- Bullet vence parágrafo. Uma recomendação vence um catálogo de opções.
  (regra global dele)
- Documento de contrato antes de código. (regra global dele)
- **NPC fica no fundo; acompanhar o dono é decisão de cada um.** Os
  Gaviões entraram no mesmo chão e na mesma camada do lutador, parecendo na
  frente dele. Ele pediu o plano do Biriba (atrás dos lutadores, entre eles
  e a torcida) e disse que todo NPC dele será assim: virou a Regra do Fundo.
  Li "não se mexeram, diferente do Biriba" como defeito e fiz os Gaviões
  andarem atrás do dono; era descrição do que ele queria: o Biriba precisa
  acompanhar, os Gaviões ficam parados assistindo. Quando ele compara com
  outro NPC, perguntar qual parte é igual em vez de copiar tudo. (2026-10-30)
- **Mosqueteiro é esgrima: lento para sair e voltar, estocada ligeira, e
  recua a cada estocada.** Só a cotovelada sai rápido, com avanço maior e
  volta um pouco lenta. O ritmo do golpe faz parte do personagem, não só o
  desenho. (2026-10-30)
- **Ataque sem defesa não prende o oponente.** Nos Gaviõezinhos (sem
  guarda) o oponente tem que poder se mexer; o que garante o acerto é eles
  serem teleguiados, não o atordoamento. (2026-10-30)
- **Ataque de NPC não tem hora certa.** O mergulho do Gavião saía sempre
  1 s depois do botão; ele aprovou essa janela e pediu sorteio de 0,5 s
  antes até 0,8 s depois, e mais velocidade. (2026-10-30)
- Projeto que nasce de uma sessão da Alure ganha `CLAUDE.md` com identidade
  própria e o trabalho de verdade roda em sessão limpa, aberta na pasta do
  projeto. (regra dele de 01/09/2026, no projeto Designer de Restaurantes)
- O projeto documenta o próprio processo enquanto acontece: diário bruto e
  lições destiladas. (pedido dele em 15/09/2026, no Icons4U; herdado aqui
  porque numa matéria de Comunicação o processo é parte da entrega)

- **Um mascote, uma entrada na seleção.** Com a skin nova mais completa que
  a velha, ele mandou tirar o modelo antigo da seleção e deixar só "Urubu",
  sem o modelo entre parênteses. Variante é assunto da Academia, não da
  escolha de personagem. (2026-09-22)
- **Controle por câmera antes da v1, por ordem dele.** Eu disse que pela
  Regra da v1 isso esperava o Marco 4; ele respondeu "só faz acontecer um
  jogo que rode com esses movimentos como controle". Escolheu o celular
  como câmera (QR code, jogo no PC) no lugar da webcam e do Fight_Detection.
  A regra cede porque a instrução mais recente dele vence o contrato.
  (2026-10-01)
- **Servidor local no celular não serve.** Testando, ele achou o
  `npm run dev` instável no celular e pediu o jogo na Vercel, com endereço
  fixo. O relay do ADR 0004 mora dentro do Vite e não existe num build
  estático: hospedar o jogo pede trocar o caminho do celular até o PC.
  (2026-10-01)

- **Seleção é grade de quadrados, não carta grande.** Ele achou feia a
  seleção herdada (cartas lado a lado, retrato ocupando a tela) e pediu o
  modelo Mortal Kombat: o elenco todo numa tela, em retângulos pequenos.
  Tela de escolha mostra o elenco; o lutador grande fica na lateral.
  (2026-10-14)

## O que não fazer

- **Ele não quer gastar dinheiro no Spriterrific** para o resto dos
  movimentos. Preço na mesa (US$ 12 do Starter) não mudou isso. O caminho é
  o de custo zero primeiro: Gemini com as sheets do Urubu como referência de
  estilo e grade, Spriterrific só para o que falhar. (2026-09-22)
- **Com um crédito só, ele escolhe o golpe, não o andar.** Eu recomendei
  `walk_forward` (onde o vídeo é mais forte); ele quis o soco, que é o que
  mostra o lutador. Priorizar o que comunica, depois o que é tecnicamente
  difícil. (2026-09-22)
- **Conta nova para repetir os 500 grátis: não operar.** Dito duas vezes na
  mesma noite. A recusa é curta, sem sermão, e o trabalho segue no que dá
  para fazer de graça. (2026-09-22)
- Chamar Codex de gerador de gráficos. Ele imaginava "Codex pros gráficos";
  Codex é agente de código. Imagem é modelo de imagem. (2026-09-17)

## Sobre a arte

- **Golpe preservado pode ser trocado depois, mas o arquivo antigo fica.**
  Um dia após pedir os socos originais do Saci, o João pediu um jab rápido
  no lugar do fraco. O Codex gravou o jab por cima de `light-punch.png`; na
  integração o original voltou e o JSON aponta para `light-snap-v5.png`.
  Arte nova entra com nome próprio, nunca sobrescrevendo a sheet em uso.
  (2026-10-28)
- **"Dois socos" é um com cada mão, e padronizar não vale para todos.** Os
  jabs duplos v2 repetiam o mesmo braço e o João rejeitou: o segundo soco
  precisa trocar de ombro e girar o tronco, como no Almirante. E o Saci não
  devia ter entrado na padronização; voltou aos socos fraco e forte
  originais. Conferir a origem do braço no ombro, não só o punho, e
  perguntar antes de estender um padrão a quem já tinha golpe próprio.
  (2026-10-27)
- **O João não quer fluidez de vídeo, quer key pose de SF2.** Ele mostrou a
  sheet do Ryu (3 a 5 quadros por golpe) e perguntou por que não gerar a
  sheet no modelo de imagem. A ADR 0002 tinha descartado isso como "plano
  C, sai pior" pensando em quadro avulso; sheet inteira numa imagem só, com
  pose de referência, é outra coisa. Reavaliar premissa de custo antes de
  defender ferramenta paga. (2026-09-17)
- **Regra de remoção enterrada num prompt longo de fidelidade não funciona.**
  O prompt de 200 linhas com "preserve roupa e acessórios" e a imagem
  anexada venceram o bloco "REGRAS DO PROJETO": o Almirante voltou com
  corvo, Cruz de Malta no chapéu e ainda ganhou um pendente com a cruz. O
  Urubu perdeu escudo e monograma, mas os dois vieram olhando para a
  direita mesmo com a regra de direção em três lugares. Remoção e espelho
  são edição curta, com só a instrução de mudança, sobre a imagem já
  gerada; direção se resolve por script (`ImageOps.mirror`), não por
  prompt. (2026-09-17)
- **Spriterrific com `high-fidelity-v1` joga fora a pose da referência.** O
  job de personagem a partir de imagem passa por um "candidate" de frente,
  em pose neutra de braços caídos, e só depois vira de lado. A guarda de
  luta do Urubu sumiu, o anchor virou um urubu andando de perfil e o idle
  "andou" apesar da receita de congelamento (as pernas do anchor já estavam
  em passada). Para lutador, o anchor precisa nascer em guarda: tentar
  `preserve-reference-v1`; e a receita do idle precisa dizer `guard up,
  fists raised` além de congelar os pés. Job de personagem exige ao menos
  uma animação, então o teste mínimo de anchor custa 160, não 60.
  (2026-09-22)
- **Pé visível não é o ponto de chão.** Os sprites do Spriterrific têm ~27
  px de margem abaixo dos pés na célula de 256 (43 px na tela a 1,6×). Ao
  posicionar cenário, mirar o chão do motor 40 px abaixo de onde o pé deve
  parecer pisar. Deslocar imagem com faixa transparente não resolve: o chão
  é fração da tela, não da imagem. (2026-09-22)
- **Ele espera que a imagem na pasta baste.** Colocou o `block-high.png` e
  achou que estava pronto. A Regra do JSON é clara para quem programa, não
  para quem gera arte. Toda receita de asset precisa terminar com "e aí o
  JSON", e o script tem de imprimir os números prontos. (2026-09-22)
- **Conferir sheet sozinha não mostra proporção.** Eu olhei uma por uma e
  aprovei todas; ele abriu o jogo e viu o mascote crescer e encolher entre
  os golpes. Defeito de escala só aparece com as ações **lado a lado na
  mesma régua**, e agora é teste (Regra da Régua do Idle). (2026-09-22)
- **Pós-processo não conserta desenho inconsistente.** A Regra do Eixo
  (82c2e6b) piorou o block-high: ao forçar o quadro 0 para a altura do idle,
  ele ficou maior que os quadros 1-3. Ele mostrou o Red Brawler: pés
  cravados, tamanho igual. Medido: nos três do Chong-U o quadro 0 de toda
  ação é o idle pixel por pixel e os pés não mexem nas ações paradas; no
  Urubu o quadro 0 cobre só 61-91% do idle, porque cada quadro foi desenhado
  do zero. Escalar e deslocar só aproxima. O conserto está na geração:
  partir do idle e mexer só no que a ação mexe. (2026-09-23)
- **Acertar a sheet inteira não basta: o gerador desenha cada quadro solto.**
  Depois da Régua do Idle o Urubu ainda pulsava e escorregava de lado dentro
  da mesma ação (tronco pulando 30 a 40 px entre quadros vizinhos, bloqueio
  com a guarda a 85% do idle). Ele notou comparando com os três do Chong-U,
  e são eles a referência de movimento: quadro 0 igual ao idle, tamanho
  estável, tronco no eixo. Medir sempre contra eles, quadro a quadro, e
  nunca aceitar `--fator` à mão sem sobrepor ao idle. (2026-09-23)
- **Para medir escala de personagem, a altura da pose em pé ganha do resto.**
  A área do bico exagera (o gerador desenha o bico em tamanhos variados) e o
  perfil de silhueta quebra com braço erguido. A prova barata é sobrepor a
  figura escalada na silhueta do idle e olhar. (2026-09-22)
- **Sheet do Codex vem com sobra do quadro vizinho.** No `knockdown` e no
  `special` do Urubu de frente, pedaços de sola dos quadros da fileira de
  cima caíram no topo da célula de baixo (4 e 5 quadros sujos). O olho não
  pega na sheet inteira, só quando a animação roda. Conferir sempre com
  `registrar` (ele avisa) e limpar com `registrar --limpar` antes de medir,
  porque a sobra também estraga o `defaultVisual`. (2026-09-22)
- **Imagem na pasta e ação no JSON ainda não é ação no jogo.** `expandirSkins`
  montava a skin só com as ações que a base já tinha, então block-low,
  heavy-kick, special-charge e special ficavam de fora sem erro nenhum.
  Silêncio não é aprovação: ação nova pede teste que a cobre por nome.
  (2026-09-22)
- **O Gemini segura o estilo do Spriterrific** quando recebe anchor e sheet
  do idle como referência: o bloqueio saiu no mesmo traço, 4 quadros, sem
  gastar crédito. Sheet inteira com referência é outra coisa que quadro
  avulso, como ele tinha dito em 17/09. (2026-09-22)
- **Ele compara o mascote com os lutadores de amostra, não com a
  referência.** O anchor do Spriterrific saiu quase de costas e só incomodou
  quando ficou lado a lado com o Red Brawler na seleção. Ao avaliar arte
  nova, montar a comparação lado a lado com quem já está no jogo, não olhar
  o asset isolado. (2026-09-22)
- **Fundo verde é exigência do Spriterrific, não do Gemini.** Ele achou que
  era regra do projeto. Toda regra herdada de uma ferramenta precisa dizer
  de qual, senão vira superstição e trava trabalho que podia andar.
  (2026-09-22)
- **Ele não joga arte fora, e isso é método, não apego.** Pediu skin para
  guardar o modelo antigo ao trocar de modelo. Toda troca de asset deve
  perguntar onde o anterior fica, nunca sobrescrever calado. (2026-09-22)
- **`git add -A` sem olhar o `git status` em sessão longa.** Ele salva
  arquivo na pasta enquanto eu trabalho; um PNG bruto entrou no repositório
  sem conferência. Conferir a lista antes do commit, sempre. (2026-09-22)
- **O ChatGPT acertou o sprite onde o Spriterrific gastou crédito.** O
  método dele (referência de personagem + descrição travada + referência de
  movimento de outro lutador) é o que funciona, e o trabalho repetitivo
  estava no preparo, não na geração. Automatizar o que cerca a IA rende
  mais que trocar a IA. (2026-09-22)
- **Nunca explicar um caminho citando a ferramenta que ele rejeitou.** Eu
  disse "em vez de sobrescrever o do Spriterrific" só para localizar uma
  pasta, e ele entendeu que a ferramenta estava no fluxo. Descrever pelo que
  a coisa é, não pelo histórico dela. (2026-09-22)
- **Quando ele acusa uma dependência, checar antes de responder.** Estava
  certo pela metade: a geração não usava, mas a régua de escala usava. A
  parte certa da crítica é a que importa. (2026-09-22)
- **"Automatizado" para ele é contar as ações dele, não as minhas.** Dois
  comandos com seis passos manuais no meio ainda é trabalho braçal. Medir
  automação pelo número de vezes que ele precisa sair do lugar.
  (2026-09-22)
- **Quando ele diz "ainda está ruim", perguntar o que pesa antes de
  construir.** Dei duas opções erradas na cabeça (API e robô de navegador) e
  ele queria outra coisa: menos idas ao chat. Quatro opções concretas
  resolveram em uma pergunta. (2026-09-22)
- **Prompt curto vence prompt blindado.** Eu empilhava método, estilo,
  proibições e enquadramento; ele cortou para duas coisas: "troca o
  personagem" e a descrição de quem é o personagem. O chat já faz o resto.
  De 1900 para 840 caracteres. (2026-09-22)
- **Devia ter oferecido o Codex na primeira pergunta sobre automação.**
  Ele perguntou "tem como automatizar?" e eu construí três versões de um
  fluxo que sempre parava na porta do chat, quando a resposta era "usa o
  Codex, ele gera imagem e escreve no disco". Antes de automatizar em volta
  de uma ferramenta, checar se já existe uma que faz o trabalho inteiro.
  (2026-09-22)
- **Número de quadros é por skin, não por ação.** O `idle` de um modelo tem
  4 quadros e o do outro 10. Compartilhar a contagem entre skins faz uma
  delas tocar errado e a base apontar para arquivo que não existe na pasta
  dela. (2026-09-22)
- **Pacote de arte de fora não é garantia de grade.** O LEIA-ME do Cartola
  dizia 13 sheets de 256 de altura, e duas chegaram como tira bruta de
  2172x724 com poses encostadas. Medir todo PNG antes de copiar para
  `public/`, nunca confiar só na descrição. Tira com poses coladas se separa
  por ilha de pixel, não por fatia de largura igual: o espaçamento não é
  regular. (2026-10-27)
- **Agachar que termina em pé fica em pé na luta.** O `crouch` segura o
  último quadro; o do Cachorro voltava à guarda no fim. Conferir o último
  quadro de toda ação com `repeat: 0`, não só o do meio. (2026-10-27)
- **Quadro errado escondido por repetição continua errado.** O jab v5 do
  Saci tinha um soco para trás na fonte; a montagem repetia o quadro
  vizinho no lugar e o João viu o tranco mesmo assim. Quadro contraditório
  se redesenha. Ao receber sheet nova, olhar a folha de contato inteira
  procurando inversão de lado, troca de mão e acessório que some.
  (2026-10-28)
- O Spriterrific não faz o estilo 16-bit arcade do SF2. O melhor é o mixels.
  Dizer isso antes de gastar crédito, não depois. (2026-09-17, lido na
  própria skill)

## Sobre o método

- **"Os que a gente fez e eu não gostei" eram as variantes, não o mascote.**
  Pedido para guardar "cartola, bira e urubu v1": tirei Cartola e Bira
  inteiros e ele reclamou na hora, porque a versão boa (padrão Urubu, na
  seleção) tinha ido junto. O que ele queria fora eram só as variantes da
  Academia (Arte anterior do Cartola e do Bira, Urubu de perfil). Antes de
  tirar mascote do jogo, nomear exatamente qual versão sai e qual fica, com o
  rótulo que aparece na Academia. (2026-10-27)

- **Arte das animações fica com o Codex; o Claude fica na mecânica.** No
  meio do pedido de agachar, pulo e bloqueio, o João avisou que o Codex vai
  mudar as animações que incomodam. A troca do quadro final do bloqueio do
  Urubu e das skins `urubu-v1` foi desfeita (sheets reconstruídas idênticas)
  e só a mecânica ficou. Defeito de sheet vira relato, não edição. (2026-10-27)

- **Guia para os amigos deve orientar o GPT a executar o trabalho.** João
  pediu uma sequência de conexões, produção e envio pelo Drive em que o
  integrante só autentica e concede permissões. Baixar, renomear, montar
  prompts e fazer upload são tarefas do agente quando há ferramentas;
  limitações precisam ser identificadas antes de prometer automação.
  (2026-10-26)

- O João prefere **partir de código pronto e adaptar** a construir motor do
  zero, mesmo com trade-off de licença apresentado. Ver algo lutando na
  primeira sessão pesa mais que pureza de arquitetura. A Regra do Retângulo
  durou um dia e virou Regra do Placeholder. (2026-09-17)
- Antes de dizer que uma referência é paga ou fechada, **conferir no GitHub
  e no site**. "Clube pago" estava errado: o jogo era público, só o gym era
  pago. Custou uma conversa de trade-off que não precisava existir. (2026-09-17)
- **Duas sessões de agente na mesma pasta ao mesmo tempo colidem.** A sessão
  da Alure commitou docs com `git add -A` e levou junto arquivos pela metade
  da sessão do projeto, sob mensagem de briefing. Regra: uma sessão escreve
  no repo por vez; a outra só lê. Se as duas precisarem escrever, a da Alure
  passa o texto e a do projeto commita. (2026-09-17)
- Motor antes da arte continua valendo, só que o motor agora é o herdado.
  Arte é estocástica e custa crédito; o jogo já existe antes dela. (2026-09-17)

- **Queda alinhada pelo centro dos pés pode cortar a figura.** No Almirante,
  o corpo deitado cabia nos 256 pixels, mas o alinhador calculava x=-6 e
  cortava a bota. Limitar x pela largura total conserva a figura e evita
  invasão da célula vizinha. Conferir pixels preservados, não só a caixa.
  (2026-10-09)
- **Pedido de bloquear precisa mudar a guarda de verdade.** A primeira defesa
  alta do Almirante só variava a guarda comum e reduzia um quadro. Refazer
  com os dois antebraços cobrindo o rosto, usando o idle como identidade,
  antes de tentar compensar o desenho com escala por quadro. (2026-10-09)

- **Mascote entregue deve estar jogável.** O João não entendeu por que o
  Almirante com todas as sprites aparecia só na Academia e pediu sua liberação.
  A Academia serve para conferir; não deve virar uma etapa de aprovação que
  impede entregar o personagem jogável solicitado. (2026-10-09)
- **Nuvem envolve, não é projétil.** O Pó de Arroz sumia no acerto como um
  tiro e parecia cortado. O João quer a nuvem passando por cima do oponente,
  na frente dos dois lutadores. Efeito de área atravessa o alvo e se desfaz
  nele; só projétil sólido some no impacto. (2026-10-29)
- **Arte nova parte da guarda de cada um, não de um atlas coletivo.** A
  tontura v8 saiu de uma imagem só com os seis e perdeu identidade, estilo e
  cores; o João rejeitou. A v9, gerada lutador por lutador com a guarda
  aprovada como referência, ficou fiel. (2026-10-29)
- **Aprovado: tontura e Pó de Arroz como estão.** "Está ótimo até o
  momento" sobre a tontura v9, o meteoro que atordoa e a nuvem que envolve.
  Próximo passo pedido por ele: trocar tudo que é estético do Chong-U.
  (2026-10-29)
- **Interface é de rua, simples.** O João corrigiu o Codex: nada de
  metálico, dourado ornamental ou medieval; pintura clara sobre carvão,
  detalhes vermelho e azul. Vale para todas as telas: o `estilo.ts` trocou
  o amarelo da Seleção pelo creme da logo. (2026-10-29)
- **Só integrar o que o Codex publicou em `public/` com guia em `docs/`.**
  Peguei rascunhos de `output/` enquanto ele terminava e gravei os cartões
  por cima dos finais dele um minuto depois. Restaurado pelos hashes do
  relatório. Fonte em `output/` não é entrega. (2026-10-29)
- **Guarda perfeita é só corpo a corpo.** Aprovado pelo João: dash com dois
  toques, guarda perfeita na janela de 0,15 s deixa o atacante tonto 0,4 s;
  projétil é só bloqueado, senão o tiro viraria armadilha para quem atira.
  Aprovou também a nova escala de dano (rápido 3%, forte 10%, especial 15%
  da vida). (2026-10-29)
- **Guarda perfeita deixa tonto de verdade.** Eu tinha escolhido a reação
  curta (`hit-high`, 0,4 s) para o atacante pego; o João corrigiu: animação
  de tonto (`stunned`) e 0,8 s parado. A recompensa da defesa tem que ser
  visível e grande. (2026-10-29)
- **Imagens do Codex primeiro, depois as correções, na ordem pedida.**
  Quando chega entrega publicada no meio de outra tarefa, ligar a entrega
  antes; as correções do João seguem na ordem em que ele falou. (2026-10-29)
- **Escapar de golpe rápido por altura não funciona.** O tornado do Saci
  anda a uns 1000 px/s e o pulo leva uns 0,1 s para sair do chão: baixar a
  caixa deixava uma janela de um quadro. Especial que atravessa a tela
  precisa de regra de esquiva (`dodge`), não só de caixa. (2026-10-29)
- **Chute recuava porque o desenho inclina e o lutador ficava parado.** O
  João notou que a maioria dos chutes dava uma recuada; medindo o tronco
  quadro a quadro, ele ia 25 a 49 px para trás nas sheets de chute. Golpe de
  chão agora dá um passo para a frente (`travel`) que cobre a inclinação
  (Regra do Passo). Sheet nova de chute: medir o tronco antes de ligar.
  (2026-10-29)
- **Build publicado é só o jogo.** O João pediu a Vercel sem Academia
  (ferramenta de desenvolvimento) e sem Celular (não finalizado). Tela de
  dev fica atrás de `FERRAMENTAS_DE_DEV`, nunca no menu de quem joga.
  (2026-10-29)
- **Luta com celular como câmera não convenceu na prática.** Na avaliação do
  João, a batalha pelo corpo não parece funcionar; o próximo passo para
  jogar fora do teclado é botão na tela, e multiplayer vira estudo à parte.
  (2026-10-29)
- **Duas sessões no mesmo arquivo: commit só com os próprios trechos.** Ao
  ligar o Esquadrão, outra sessão implementava o crescimento do projétil em
  `fighter.ts` e `moveMechanics.ts` ao mesmo tempo. Separei meus trechos por
  patch no índice em vez de commitar o arquivo inteiro. Conferir `git diff`
  antes de todo commit. (2026-10-29)
- **Deploy da Vercel sai da conta pessoal por um login separado.** O
  conector da Vercel não alcança o escopo `joaojatos-projects` e a CLI da
  máquina é da Icons4u. Todo comando da CLI neste projeto leva
  `--global-config ~/.vercel-pessoal`. Sem o GitHub conectado, publicar é
  `vercel build --prod` e `vercel deploy --prebuilt --prod`: o `--prebuilt`
  evita subir `Fight_Detection/`, `referencia/` e `.env`. (2026-10-29)
- **Link público antes da autorização do Chong-U, por escolha dele.** Diante
  do código sem licença, o João preferiu publicar já e assumir o risco
  (ADR 0006). Pedido de autorização continua devido. (2026-10-29)
- **P1 joga com a mão esquerda em volta do WASD.** O João trocou F, G e V
  por Q chute, E soco, C bloqueio e Espaço especial: tudo ao alcance sem
  tirar os dedos do WASD. Tecla nova de P1 segue essa lógica. (2026-10-29)
- **Cor de torcida sai da sprite do lutador, não da camisa oficial.** Eu
  tinha posto o Galo no mesmo preto do Botafogo; o João corrigiu: o preto
  do Galo é o da camisa dele, mais claro, sem chegar a cinza (`#403B3F`).
  Amostrar a sprite antes de propor cor. (2026-10-29)
- **Aprovado: torcida dividida pelas cores dos lutadores**, P1 à esquerda e
  P2 à direita, sem reagir à luta. "Só essa diferença das cores já resolve
  grande parte das questões que eu tinha com o cenário." Contrato em
  `docs/torcida-dividida.md`. (2026-10-29)
- **Medir desempenho trocando só a peça em teste.** A primeira medição da
  torcida escondia também o fundo novo e acusou 37 contra 23 quadros; a
  comparação justa (pintura antiga contra torcida nova, mesma página) deu
  30 contra 26. O custo era uma camada de tela inteira, não os 708
  torcedores. (2026-10-29)
- **Toda cor do clube tem que aparecer na torcida.** O Bahia saiu só branco
  e azul: o vermelho estava na barra de 2 px da camisa e sumiu. O João pediu
  variedade (torcedores de camisa lisa em cada cor do time), detalhes na
  mesma regra e sinalizador coeso com o clube, nunca preto. As cores da
  torcida viram parte do procedimento de todo lutador novo. (2026-10-29)
- **Lutador com arte em produção: reler o manifesto antes do commit.** O
  Porco foi commitado com a queda apontando para o quebra-galho, embora o
  Codex tivesse entregado a sheet minutos antes; o João notou que ele não
  caía. Conferir `pending` de novo logo antes de commitar. (2026-10-29)
- **Golpe de asas do Urubu estava lento demais.** 1,25 s (20 quadros a 16
  FPS) com o fechamento arrastado; o João pediu mais rápido. Ficou abertura
  a 22 FPS e fechamento a 30 ms por quadro, 0,8 s no total. Golpe pesado
  com muitos quadros: acelerar a recuperação antes do acerto. (2026-10-29)
- **Som de desenho animado não serve.** O João pediu "sem sons goofy": o
  pouso do Urubu estava "muito fino" (o meteoro tinha um apito de 2600 Hz
  descendo por cima da explosão) e era para ser estrondoso. Impacto grande
  é grave; bicho e gente por formantes com tremor e sopro, nunca tom limpo
  subindo ou descendo ("boing", "piu-piu", bolha). (2026-10-30)
- **Os sons sintetizados ainda não agradam.** Depois da entrega 3 o João
  disse que os sons "ainda não estão me agradando, mas a gente resolve isso
  depois". Síntese pura pode não bastar; na próxima rodada, perguntar quais
  sons incomodam mais e considerar pacote CC0 (ADR 0007 já prevê). (2026-10-30)
- **Plano do Codex sem reações não é lutador pronto.** A entrega do
  Mosqueteiro veio com 14 ações e nenhuma reação (apanhar, tonto, cair).
  Pedido de mascote ao Codex lista `hit-high`, `stunned` e `knockdown` desde
  o começo; se faltarem, `codex exec --enable image_generation` pede só elas
  e volta em uns 10 minutos, sem esperar o João. (2026-10-30)
- **Altura de voo se mede contra o maior oponente, não contra a tela.** O
  sopro do Dragão ficou em 170 para a cabeça dele não sair da tela, e a
  cabeça do oponente ficava dentro do corpo dele; o João pediu "bem mais
  alto". Agora 240, cobrado por teste (maior idle + 30). A borda da tela
  cede antes da passagem por baixo. (2026-10-31)
- **Especial que voa precisa soltar o lutador no ar ao apanhar.** Sopro,
  meteoro e voo do Galo sobem o desenho sem tirar o lutador do estado de
  chão; golpe rápido acabava o atordoamento antes da queda e ele ficava em
  pé no ar. O teste antigo usava atordoamento de 3 s e escondia isso: teste
  de queda usa golpe rápido. (2026-10-31)
- **Aprovado: jogar como web app pela Tela de Início.** "Adorei a
  recomendação de adicionar o jogo como web app." (2026-10-31)
- **Controle de toque nunca é texto.** As setas do direcional eram
  caracteres (▲◀); no iPhone, segurar abria a lupa de seleção e dava zoom
  na página, o que cortava a tela. O iOS ignora `user-scalable=no`: o
  remédio é símbolo em SVG, `user-select: none` em tudo e cancelar o
  `touchstart` cru nos controles. (2026-10-31)
- **Botões de luta seguem o controle de PlayStation**, cores e posições:
  quadrado rosa defende, xis azul chuta, bola vermelha soca, triângulo verde
  é o especial. Botão genérico com nome escrito não serviu. (2026-10-31)
- **No celular, tela cheia vale mais que cenário inteiro; HUD vale mais que
  os dois.** O João aceitou cortar cenário, nunca barra de vida e relógio.
  Encher a tela pela largura e encolher o HUD quando falta espaço resolveu
  sem cortar nada. (2026-10-31)
- **Opção que só aparece com uma tecla é opção escondida.** A dificuldade
  existia desde 30/10, mas só surgia com o 1 VS CPU selecionado e trocava
  no ↑ ↓; o João não a achou e pediu "não pode ser escondida". Escolha que
  muda a partida ganha tela ou cartão próprio, com texto do que ela faz.
  (2026-10-31)
- **Esboço de navegação mostra as telas, não o caminho em texto.** O
  primeiro esboço dos torneios trazia o fluxo numa linha de setas e o João
  respondeu "acho que você não entendeu"; com uma maquete de cada tela
  (menu, Pelada, Torneios) veio "é exatamente isso". (2026-10-31)
- **Aprovado: menu com Pelada e Torneios, torneio em mata-mata ou pontos
  corridos**, "de acordo com a arte do jogo". (2026-10-31)
- **Estimativa de esforço conta o teste do João, não o código.** Estimei
  um fim de semana para os torneios pela janela dele, e ele estranhou o
  tempo; o código saiu numa sessão. O que pede janela é ele jogar e
  aprovar cada etapa. (2026-10-31)
- **Vitest com a máquina carregada: `--pool=threads`.** Com o Chrome e
  outros servidores abertos, os processos do Vitest estouraram "Timeout
  starting forks runner": todos os testes passavam e o comando saía com
  erro. Em threads roda limpo. (2026-10-31)
- **Mascote que não pode ir a público mora em `lutadores/locais/`.** O
  João supôs que não subir para o git bastava para ficar fora da Vercel;
  aqui a Vercel publica a pasta pela CLI. JSON em `locais/` (fora do git)
  só entra no `npm run dev`, e o build nunca o vê. (2026-11-01)
- **Personagem com objeto de apoio se desenha a partir do objeto.** O corpo
  do Coxa foi gerado sem o andador e o andador colado depois: a mão de apoio
  segurava o nada em quase toda ação e a perna atravessava o tubo. O João
  mandou refazer partindo do andador (Regra do Andador, `docs/coxa-pedido-v4.md`).
  Vale para bengala, bandeira, qualquer coisa que o mascote segure. (2026-11-01)
- **Efeito pequeno some na luta.** A lata de 8×14 px na célula ficou com
  11×20 px na tela, e o João quase não a via. Objeto arremessado precisa de
  uns 20×35 px na célula. (2026-11-01)
- **Golpe apoiado: a pegada fixa decide a altura.** Na voadora do Coxa eu
  pedi "o corpo sobe uns 25 a 35 px" e ainda era pouco: o João quer o boneco
  saindo do chão de verdade. O certo é fixar a mão no mesmo ponto do objeto
  em todo quadro e derivar o resto dela (braço reto, quadril na altura da
  mão, perna acima do objeto). Pedido de arte com número de altura vem com
  guia desenhado. (2026-11-01)
- **Quando o João fala de quadro, ele quer ver quadro.** Respondi o pedido da
  voadora com documento e guia para a arte, e ele perguntou cadê os quadros.
  Se dá para aproximar com o que já existe (remontar camadas, prender a mão),
  fazer isso primeiro e mostrar no jogo; o pedido de arte vem junto, não no
  lugar. (2026-11-01)
- **Arte nova não substitui arte aprovada sem perguntar.** Troquei o maromba
  inteiro pela revisão v4 só porque ela chegou, e o João achou o antigo
  melhor ("não tinha por que trocar"). Entrega de arte que refaz algo que já
  estava no jogo e sem queixa entra lado a lado para ele comparar; só troca
  o que ele pediu para refazer. (2026-11-01)
- **A mão de apoio fica sempre por cima do andador.** Montagem em camadas
  pôs as tampas e o arco de trás sobre os dedos. Regra: depois de montar,
  a pele da mão perto da pegada volta por cima de tudo
  (`scripts/coxa_maos_por_cima_v4.py`); rosto e joelho continuam atrás do
  arco da frente. (2026-11-01)
- **Correção de camada vale para toda folha do lutador, inclusive as que
  chegam depois.** Corrigi a mão por cima só nas ações da v4; a guarda e as
  caminhadas v5, o maromba e a transformação entraram sem a correção, e o
  João teve de repetir o pedido. Toda folha do Coxa que entra no jogo passa
  por `scripts/coxa_maos_por_cima_v4.py` (pasta `maos-por-cima/`), e a
  varredura de pele coberta roda antes de dizer que terminou. (2026-11-01)
- **Personagem diferente na arte não é diferente no controle.** Propus
  seguir a curva de deslocamento da caminhada v6 e deixar o vovô mais
  lento; o João quer que ele se mova igual aos outros, com a diferença só
  no desenho. Arte que traz ritmo próprio (root motion, velocidade) se
  adapta ao motor, não o contrário. (2026-11-01)
- **No celular, A/✕ confirma e B/○ volta, como em console.** Fora da luta o
  botão de baixo vale Enter e o da direita vale Esc; na luta voltam a ser
  soco e defesa. O João marcou como muito importante: menu que só anda com
  o botão de cima (o especial) não serve. (2026-11-01)
- **Celular troca para Xbox por padrão.** O losango de PlayStation de
  31/10 virou opção; baixo soco, direita defesa, esquerda chute, cima
  especial, nas duas caras. Nome do golpe sai do botão por padrão e, quando
  ligado, é o do golpe que sai agora (de pé, abaixado, no ar). (2026-11-01)
- **Passo do tiro é curto.** Pus 40 px da sheet (~56 px na tela) e o João
  achou forte demais: ficou 20 px. O coice do mosquete (70 px) ele aprovou
  como estava. Deslocamento que tira vantagem de distância é sutil; começar
  pequeno. (2026-11-01)
- **I O P é o Q E C na mesma ordem, não espelho do P2.** Pus P soco e O
  defesa copiando o P2; o João corrigiu: "qec está para iop", então I chute,
  O soco, P defesa. Tecla extra de um lado segue a ordem das teclas desse
  mesmo lado. (2026-11-01)
- **Debug não pode emoldurar o jogo.** O shell herdado (cabeçalho, botão
  Play, console fixo ao lado) deixava a luta pequena dentro de outra tela, e
  o João se incomodou. Em dev o jogo ocupa a tela como no build; ferramenta
  de debug entra como gaveta por cima, escondida até ser chamada. (2026-11-01)
- **Esc pausa, não sai.** Esc na luta levava direto ao menu; o João quer
  pausa com Continuar, Recomeçar, Configurações e Sair da partida, e Tab sem
  função. Sair de uma partida sempre passa por uma escolha explícita.
  (2026-11-01)
- **Conferir em tela de notebook, não só em 16:9 exato.** Testei a gaveta e
  a pausa numa janela 1440x810 e não vi o jogo torto nem a letra serrilhada;
  na tela do João (proporção e zoom do Windows diferentes) os dois saltavam.
  Print de verificação visual sai em 1536x730 com zoom 125%. (2026-11-01)
- **Letra de jogo não é Impact nem Arial.** O João chamou de "fonte de
  Word". Texto do canvas usa as fontes de `estilo.ts` e é desenhado na
  resolução da tela (`nitidez.ts`); nada de `monospace` em tela de jogador.
  (2026-11-01)
- **Abriu o navegador, está no menu.** Nada de "aperte qualquer tecla".
  (2026-11-01)
- **NPC novo de mascote é NPC de Guarda: mora no fundo e sai quando o dono
  chama.** Integrei o Guerreiro do Cartola aparecendo só quando o Pó de
  Arroz atordoava; o João corrigiu: ele fica no fundo observando, como os
  Gaviões, e sai assim que o Cartola usa a ult (corre para fora da tela,
  volta correndo no campo, chuta, sai e volta pelo fundo até o posto).
  "NPC de Guarda" é o nome que ele dá a esse tipo. (2026-11-01)
- **NPC de fundo pisa numa linha só, e o golpe de NPC se desvia.** O
  Guerreiro pisava 33 px acima dos Gaviões e do Biriba (usava a linha do pé
  dos lutadores menos o recuo; os outros, o chão menos o recuo): "ele tá
  voando". Agora todo NPC usa `chaoDoFundo`. E o chute dele seguia o
  adversário, impossível de desviar; como o Biriba, ele golpeia o ponto onde
  o adversário estava quando a ult saiu. (2026-11-01)
- **Lutador pisa no gramado, abaixo da linha lateral.** Com o pé na linha,
  parecia estar fora do campo. Chão do estádio de 0,92 para 0,96; o fundo
  ficou onde estava (recuo 89). (2026-11-01)
- **Canvas casa pixel com pixel com a tela, nem maior nem menor.** Medi a
  escala pelo monitor e o canvas ficou maior que a área: o navegador reduzia
  e serrilhava ("parece imagem printada"). Escala vem da área do jogo e
  acompanha a janela; arte em pixel usa `smoothPixelArt`. Verificar em Chrome
  de verdade (headed), não só no headless. (2026-11-01)
- **Print em branco no celular emulado era carregamento.** Culpei a largura
  com fração de pixel; era o print saindo antes de o menu abrir (~6 s).
  Antes de concluir causa visual, conferir a cena ativa. (2026-11-01)
- **Ferramenta de debug fica ao lado do jogo, não por cima.** A gaveta que
  cobria a tela incomodou; aberta, ela empurra o jogo e o canvas se refaz na
  área que sobra. (2026-11-02)
- **Entrega do Codex pode estar em andamento.** Ao aplicar a v7 do maromba,
  o soco e a voadora chegaram e o chute baixo foi refeito durante a sessão.
  Antes de ligar arte do Codex, conferir o `manifest-art.json` (sha256 dos
  arquivos e `status`) e só então medir caixas. (2026-11-02)
- Golpe com mais de uma arma desenhada dispara tudo o que o desenho mostra: o João cobra cada tiro visto na sheet (2026-11-02).
- Arte do Codex pode trocar o JSON enquanto eu trabalho: antes de commitar o JSON, conferir se todo `file` dele existe no git, senão o push sai quebrado (2026-11-02).
- Ataque de NPC que mira o adversário precisa vir de longe para ser desviável: o Flecha atirando a 300 px, pelas costas do alvo, ficou difícil demais; atira de trás do dono (2026-11-02).
- Reincidência: o Codex trocou caminhos do JSON do Gremista de novo durante a sessão, e o commit saiu sem os PNGs. Antes de todo commit que toca JSON de lutador, rodar `git ls-files` contra cada `file` dele (2026-11-02).
- Nome no jogo do Mosqueteiro do Corinthians: "Mosqueteiro Paulista", par do "Mosqueteiro Gaúcho" (pedido dele, 2026-11-02).
- **Recorte de retrato tem modelo: o Mosqueteiro Paulista.** O João aprovou o
  enquadramento dele na seleção e no Museu; todo `rosto` se mede igual ao
  dele e o busto sai da mesma conta (`recorte.ts`). (2026-11-02)
- **Torcida "sem camisa" é base para vestir, não figurino final.** O pedido
  de torcida sem camisa era para pôr as camisas dos clubes por cima; o Codex
  entregou a v3 sem camisa e ligou direto no jogo, e a arquibancada inteira
  perdeu as cores dos mascotes. A cor do clube só existe onde há cor chave
  (magenta). Atlas novo de torcida entra pela camisa em magenta
  (`scripts/torcida_camisa.py` veste por cima sem redesenhar), e o teste em
  `torcida.test.ts` derruba atlas sem chave (2026-11-03).

- **Arte nova de torcida tem o tamanho da antiga.** A v3 chegou desenhada
  menor na mesma célula e a arquibancada encolheu na Luta sem ninguém pedir;
  o João notou comparando com o Vercel. Atlas novo de torcedor entra medido
  contra `torcedores.png` (altura mediana do desenho na célula), e o teste em
  `torcida.test.ts` cobra (2026-11-03).
