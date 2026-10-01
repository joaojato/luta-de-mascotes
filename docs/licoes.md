# Lições

O destilado do `diario-de-bordo.md`: o que funciona com o João e o que não
funciona, neste projeto. Este arquivo **é editável**, ao contrário do diário.

Toda linha cita a data da entrada do diário que a originou, entre parênteses.
Sem a citação, a afirmação não pode ser conferida depois e vira folclore.

Quando uma lição se mostrar errada, **corrija a linha**, não acrescente outra
embaixo contradizendo.

## Preferências confirmadas

Coisas que ele aprovou de forma explícita, ou que repetiu como regra.

- Português do Brasil, sem travessão como pausa explicativa. (regra global
  dele, anterior a este projeto)
- Bullet vence parágrafo. Uma recomendação vence um catálogo de opções.
  (regra global dele)
- Documento de contrato antes de código. (regra global dele)
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
- O Spriterrific não faz o estilo 16-bit arcade do SF2. O melhor é o mixels.
  Dizer isso antes de gastar crédito, não depois. (2026-09-17, lido na
  própria skill)

## Sobre o método

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
