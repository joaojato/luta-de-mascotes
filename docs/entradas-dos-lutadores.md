# Entradas dos lutadores

Cada personagem pode registrar uma ação opcional `entrance` no próprio JSON,
com `repeat: 0` e sem ataque. O carregador normal registra a folha e a animação.
Sem essa ação, o personagem permanece na guarda. A entrada toca uma vez por
luta e novamente na revanche; não se repete a cada round.

Produção complementar05/11/2026: pesquisa em
[intros-restantes-pesquisa.md](intros-restantes-pesquisa.md) e caminhos,
prompts, hashes e revisões em [intros-restantes-entrega.md](intros-restantes-entrega.md).
Saci, Cartola, Galo, Porco, Esquadrão e Mosqueteiro Gaúcho recebem ações
próprias. Por correção posterior do usuário, a forma Maromba fica sem intro;
Saci vira tornado da fumaça e Galo tenta voar e cai sentado. As demais
intros anteriores ficam preservadas.

Revisão de fluidez: Galo, Saci, Cartola e Mosqueteiro Gaúcho passam de12
para24 poses desenhadas, com2205ms de movimento após pedido de acelerar. A seleção considera
transições de orientação, apoio e acessórios, não apenas uma média de quadros.
Comparação com Vovô/Dragão em [auditoria-fluidez-intros.md](auditoria-fluidez-intros.md).

A Academia inclui a coluna **Intro** na aba **Animações**. Verde indica
ação `entrance` existente e clicável; vermelho indica ausência, sem contar
idle como substituta. As demais colunas continuam inventariando a arte de
cada comando, respeitando `moves`: tiro do Almirante conta como Bruto próprio,
e seu `heavy-kick` é declarado como Bruto Baixo próprio, não arte faltante.

As entradas exibem seu primeiro quadro por mais **500 ms** antes de iniciar
o movimento (`showBeforeDelay` de Phaser). A espera usa o relógio da animação,
acompanha a pausa e entra na duração devolvida por `Fighter.iniciarEntrada`.
As durações e os tempos listados abaixo descrevem os movimentos, antes dessa
espera adicional; a contagem é recalculada automaticamente com ela incluída.
No Mosqueteiro, por exemplo, a entrada inteira passa a ocupar 4.500 ms e o
**3** aparece aos 4.700 ms, sem cortar quadros.

`MatchScene.startRound` apresenta as entradas junto do aviso de round.
Correção de05/11/2026: os intervalos entre1,2,3 eLutem! têm metade da
duração anterior (mínimo350ms). O1 começa mais tarde durante a intro,
mantendo o3 pelo menos200ms após a pose final. Sem intro, a sequência
ocorre aos450/800/1150/1500ms. Para uma entrada total de3000ms, ocorre
aos2050/2625/3200/3775ms. A velocidade das artes não é alterada.
Só em “Lutem!” o combate recebe comandos, resolve golpes e avança o relógio.
Ao concluir a própria intro, cada personagem volta imediatamente ao idle
em loop, mesmo que o outro ainda esteja se apresentando. Comandos e dano
permanecem bloqueados até o Lutem!. O fim real da animação e o relógio
individual cobrem tanto as folhas comuns quanto as entradas sincronizadas
(caravela, voo e saltinho). A pausa congela a cena e suas animações/timers.

## Teste: Vovô Coxa

- Arte: `public/assets/lutadores/coxa/entrada-v1/entrance.png`.
- Doze quadros de 512×320, cinco colunas, três linhas (três células vazias).
- Duração efetiva: 3.000 ms. O `timing` desta entrada considera que Phaser
  soma a duração extra ao período base de 100 ms; não alterar FPS isoladamente.
- Pega a cerveja no chão, arqueia as costas com dor, bebe, joga a lata fora
  e volta à guarda. Dor mostrada no tronco/rosto, sem pular.
- Braço A: próximo à câmera, ombro à direita da imagem, permanece no apoio.
  Braço B: ao fundo, ombro à esquerda da imagem, pega/bebe/descarta a lata.
  Pernas preservam sua ordem de profundidade, sem giro ou troca de apoio.
- Primeiro quadro usa o idle original com a lata no chão; último quadro é
  exatamente o primeiro idle original, sem lata. Guarda e hash de referência
  em `output/coxa-entrada-v1/referencias.json`.
- Geração pela ferramenta integrada de imagens. Prompts e tentativas de
  revisão estão em `output/coxa-entrada-v1/`; v1–v3 foram rejeitadas por
  continuidade dos braços. Fonte final corrigida: `fonte-final.png`.
- A lata arremessada atravessava a divisão da grade na fonte; foi extraída
  inteira e remontada no quadro correto. Nenhum membro foi redesenhado por
  script. Escala uniforme única, alinhamento pelos pés, sem distorção.
- Contato revisado quadro a quadro: `contato-final.png`; prévia `entrada.gif`;
  dimensões, tempos e SHA-256 em `montagem.json`. Conferidos mãos, pegada,
  roupa, expressão, piso e último quadro idêntico ao idle.

Validação: testes de ordem/tempo da abertura e registro da entrada, typecheck,
build e comparação pixel a pixel do último quadro. Inspeção de PNGs realizada;
validação visual dentro de uma partida ainda depende de execução no navegador.

## Dragão: espetinho (04/11/2026)

- Entrada integrada na skin selecionável `dragao`, pasta `jogo-v1`.
- Arte: `public/assets/lutadores/dragao/jogo-v1/entrada-v1/entrance.png`.
- Dezesseis quadros de 512×384, cinco colunas e quatro linhas; quatro células
  finais transparentes. Duração efetiva 3.400 ms, com o tempo extra de Phaser
  considerado no `timing`, como na entrada do Coxa.
- Segura um espetinho de três carnes, sopra fogo curto para assá-las, leva
  todas à boca numa única abocanhada, retira o palito vazio e o descarta.
- A segura a base do espetinho no preparo. B acompanha a ponta e recebe o
  palito na retirada após a abocanhada, enquanto A retorna à guarda. Essa
  passagem aparece nos quadros 9–11; não há troca de membro nem terceiro braço.
- Pernas A/B mantêm lado e apoio; duas asas separadas dos dois braços,
  cauda única e cicatriz preservadas. Fogo assa a carne apenas na entrada;
  a ação não contém hitboxes de ataque nem dispara projéteis de combate.
- Primeiro e último quadros são o primeiro idle original, idênticos em RGBA.
  Montagem usa uma única escala para a ação e alinhamento pelas botas.
- Fontes, referência com SHA-256, prompt completo da ferramenta integrada,
  contato em escala real, GIF e manifesto: `output/dragao-entrada-v1/`.
- Com esta entrada: ROUND aos 0 ms, 1 aos 900 ms, 2 aos 2.250 ms, 3 aos
  3.600 ms e Lutem! aos 4.950 ms. Se enfrentar o Coxa, este sustenta sua
  guarda após terminar aos 3.000 ms; a contagem acompanha a entrada maior.
- Fonte e dezesseis quadros montados inspecionados. Verificações automáticas
  cobrem grade, tempo, skin, ausência de ataque e último quadro original.
  Reprodução visual dentro da partida ainda não conferida no navegador.

## Mosqueteiro Paulista: preparo do mosquete v1 (histórico, substituído pela v2)

- Arte: `public/assets/lutadores/mosqueteiro/jogo-v1/entrada-v1/entrance.png`.
- Vinte quadros, cinco colunas, quatro linhas, células 512×384. A guarda
  atual usa 512×256; a entrada ganha 128 px transparentes em cima, conservando
  o corpo e a distância dos pés à borda inferior. Não carregar como 256×256
  nem como o formato histórico 640×320 de outra produção.
- Primeiro e último quadros usam o primeiro idle original sem redesenho,
  com margem superior de 128 px. Montagem com escala uniforme única e piso
  alinhado pelas botas, mantendo o porte do personagem.
- Embainha a espada, tira o mosquete da bandoleira, usa a vareta para limpar,
  faz os gestos de recarga, recolhe a vareta, confere o mosquete e o devolve
  às costas. Só então desembainha a espada e assume a guarda.
- Braço A/direito anatômico: espada e manejo da vareta; B/esquerdo: apoio
  do mosquete. Mesmas pernas de apoio, sem giro ou troca de profundidade.
  Um único mosquete, espada e vareta; nenhuma arma duplicada nas costas
  durante o preparo. Bainha da espada permanece no cinto.
- Duração efetiva 4.000 ms. ROUND aos 0 ms; 1 aos 900 ms; 2 aos 2.550 ms;
  3 aos 4.200 ms; Lutem! aos 5.850 ms. Em confrontos com entradas menores,
  elas sustentam a guarda enquanto esta termina.
- Ação sem ataque, disparo ou projétil. Os golpes e os Gaviões permanecem
  nas ações existentes. Reprise só ao iniciar outra luta/revanche.
- Ferramenta integrada de imagens; fonte inicial rejeitada pela arma
  duplicada. Prompts, fonte corrigida, referência e SHA-256, contato com os
  vinte quadros, GIF e manifesto em `output/mosqueteiro-entrada-v1/`.
- Fonte e montagem inspecionadas: guarda, roupa, pluma, armas, mãos e apoios.
  Testes cobrem skin, grade, tempo e ausência de ataque; script confere
  igualdade RGBA do último quadro com a guarda acrescida da margem.
  Reprodução visual dentro da partida ainda não conferida no navegador.

## Mosqueteiro: revisão de definição v2 (rejeitada por identidade, substituída pela v3)

Usuário identificou qualidade ruim apenas nesta entrada. Nova produção pela
ferramenta integrada, usando a guarda aprovada como referência, com figuras
maiores na fonte (~299 px contra ~199 px da v1). Redução única LANCZOS para
o porte original; nenhuma alteração no renderer global ou nas outras intros.

Arquivo histórico: `public/assets/lutadores/mosqueteiro/jogo-v1/entrada-v2/entrance.png`.
Quinze poses em células 512×384, cinco colunas, três linhas. A sequência
continua embainhando, limpando/recarregando, guardando e retomando a guarda.
Mantém os quatro segundos de movimento, pausa inicial de 500 ms e término
antes do 3. Primeiro/último quadros são o idle original com margem superior.

Prévia `output/mosqueteiro-entrada-v2/entrada.apng`: PNG animado sem perda,
conferido quadro a quadro contra a folha. O GIF antigo reduzia os quadros a
256 cores, enquanto o PNG do jogo preserva milhares; não avaliar a v2 pelo
GIF da v1. Fonte, prompts, ficha, referência, contato nativo e hashes estão
na mesma pasta. A divisão das linhas da fonte foi detectada nos vãos reais,
para não levar fragmentos de botas de uma linha para outra. Fonte e montagem
revisadas em escala real; reprodução dentro do jogo ainda não conferida.

## Mosqueteiro: fidelidade ao anchor v3 (ativa, 04/11/2026)

Correção explícita: a v2 melhorou definição, mas o usuário identificou mudança
de desenho em relação ao anchor. Ela não é referência de identidade. Nova
produção individual usando o anchor ativo E a base original em alta resolução
`referencia/corinthians/base-mosqueteiro-v6.png`, além da guarda para escala.
Olhar primeiro rosto/nariz, cabeça/corpo, terno preto, riscas finas espaçadas,
chapéu/plumas e couro vinho; definição sozinha não aprova identidade.

Ativo: `public/assets/lutadores/mosqueteiro/jogo-v1/entrada-v3/entrance.png`.
Quinze poses, células 512×384, 4.000 ms de movimento e espera inicial de
500 ms, mesmos controles, sequência e contagem da v2. Nenhuma mudança nas
outras artes ou no renderer. Primeiro/último quadros continuam o idle original.

Produção em `output/mosqueteiro-entrada-v3/`: referências com hashes, ficha,
prompt, fonte, contato dos quinze quadros, comparação lado a lado com o
anchor no mesmo porte corporal e prévia APNG sem perda. Na comparação,
a primeira linha usa pixels em escala nativa, a segunda amplia os mesmos
pixels 2× para inspecionar rosto/chapéu/roupa. Fonte e montagem inspecionadas;
isso não equivale a aprovação do usuário nem a teste visual na partida.

## Bira e Biriba: carinho e giro (04/11/2026)

- Arte: `public/assets/lutadores/cachorro/urubu-v1/entrada-v1/entrance.png`.
- Dezesseis quadros 512×320, cinco colunas e quatro linhas; quatro células
  finais vazias. 4.200 ms de movimento e pausa global de 500 ms.
- Primeiro quadro: idle original com margem64px acima e128px à esquerda.
  Último: o mesmo idle espelhado inteiro, após giro desenhado pela frente.
- `entranceReverseFacing` começa a entrada voltado à própria lateral e
  preserva essa orientação até o giro. Ao liberar, a troca para o idle e
  seu espelhamento é atômica, inclusive quando o tutorial abre uma fala.
- Biriba chega andando de500 a2.000ms, Bira faz carinho a partir de2.150ms;
  aos3.200ms Biriba inicia a volta, Bira recolhe a mão e se levanta. Biriba
  fica fora da arena aos4.500ms; Bira termina virado ao adversário aos4.700ms.
- Na arte final, braço distante B acaricia e perna distante B ajoelha;
  braço/perna próximos A sustentam o corpo. Membros não trocam identidade.
- Biriba é ator separado, escala .3 da escala do Bira, centro62px locais
  atrás do pivô, mesma linha de piso. Os quadros de contato foram compostos
  e inspecionados com as duas figuras no porte relativo final.
- Fonte, anchor/idle, prompt e hashes em `output/bira-entrada-v1/`.
  `contato.png` mostra os16 quadros; `contato-biriba.png`, o encontro;
  `encontro.apng`, uma montagem offline do trajeto completo.
- Nenhum dano durante a entrada; testes cobrem sincronia, ida/volta, ausência
  entre rounds, orientação nos dois lados e trava de chamada dos balões.
  Fonte e montagem revisadas; reprodução visual na partida ainda não conferida.

## Urubu: pouso imponente (04/11/2026)

- `urubu/frente/entrada-v1/entrance.png`: 16 quadros de 512×320, cinco colunas.
- Desce de cima da câmera, amortece o impacto, ergue o peito e abre os dois
  braços/asas; recolhe e termina no idle original. Não possui ataques.
- 500 ms iniciais, impacto aos 1.500 ms, guarda aos 4.100 ms. A contagem
  ajusta o “3” para depois da entrada, mantendo a liberação no “Lutem!”.
- `entranceLandingFrame: 5` sincroniza deslocamento vertical, sombra,
  som de pouso, 18 partículas de poeira e um tremor único de 180 ms.
  O movimento é de apresentação; não executa o especial nem causa dano.
- Na fonte, braço distante B amortece próximo ao chão, braço próximo A
  equilibra o corpo; ambos abrem como asas, sem membros extras.
- Fonte, prompt, referências/hashes e montagem em `output/urubu-entrada-v1/`.
  `contato.png` contém os quadros em escala nativa; `pouso.apng` é uma
  composição offline da trajetória, sem os efeitos do motor.
- Fonte e cada quadro montado revisados; último quadro conferido idêntico
  ao idle com margens. Testes cobrem trajetória, impacto único, ausência de
  dano e contagem. A reprodução visual na partida ainda não foi conferida.

## Almirante: desembarque da caravela (04/11/2026)

- Pedido: apenas a ponta da caravela, cortada pelo canto da arena; Almirante
  desce pela prancha, chega à arena e termina na guarda.
- `almirante/base/entrada-v4/movimento.png`: seis quadros de caminhada em loop;
  `almirante/base/entrada-v4/parado.png`: quatro quadros da finalização parada.
  São duas animações independentes, `entrance-walk` e `entrance`, células512×320;
  corpo no mesmo porte da guarda ativa, último quadro é o idle original.
- Proa e prancha continuam PNGs separados na pasta `entrada-v1`. A referência do especial
  define a madeira/vela da caravela; o personagem usa seu próprio anchor/idle.
  A fonte contém somente o trecho dianteiro, não um navio inteiro encolhido.
- De0 a500ms a proa entra parcialmente pelo canto. De500 a2300ms o Almirante
  desce pela prancha; continua andando no piso até3650ms. Dos3200 aos3650ms,
  há três quadros completos de caminhada com a silhueta inteira já fora da
  prancha. Só então para, ajeita o chapéu e assume a guarda. Final aos4650ms,
  antes do “3”; objetos retirados aos4450ms. A finalização mantém os tempos
  originais200/250/400/150ms, sem acelerar o gesto junto da caminhada.
- `entranceGangplank` move apenas a apresentação. A posição lógica fica na
  marca de início, evitando que a câmera siga o navio. O enquadramento usa
  largura lógica do jogo e espelha no P2, inclusive em telas de alta densidade.
- Nenhum ataque, projétil ou dano; limpar na liberação, reset e destruição.
  A intro é executada somente na abertura da luta, como as demais.
- `output/almirante-entrada-v1/` guarda fonte, prompts, referências/hashes,
  montagem, contato dos quadros, objetos e `desembarque.apng` composto offline.
  Fonte e quadros montados revisados. Essa prévia não é captura da partida.

Correção solicitada pelo usuário: a caminhada v1 repetia a mesma perna;
essa produção está rejeitada como referência de movimento. V2 usa um ciclo
de seis fases com liderança alternada A/B, duas repetições intencionais,
150ms por quadro em vez de250ms. Os quatro quadros de finalização são
preservados da v1. Percurso até a arena reduzido de3000 para1800ms (40%).
Guia técnico, fontes, prompt e revisão próprios em `output/almirante-entrada-v2/`.

Correção posterior v3: a caminhada precisa continuar até estar completamente
no chão por pelo menos três quadros. V3 preserva as artes da v2, estende o
ciclo no piso e só depois reproduz os quatro quadros finais na velocidade
original. Montagem e hashes em `output/almirante-entrada-v3/`. A margem traseira
dos quadros18–20 foi medida e cabe nos80px já percorridos além da prancha.

Correção v4: Movimento e Parado são arquivos e animações distintos. Durante
todo deslocamento, inclusive o trecho no piso, `entrance-walk` repete a
troca de pernas. Só na posição final passa a `entrance` com x/y travados.
O relógio da trajetória seleciona diretamente o quadro de cada fase; o
avanço independente do Phaser fica pausado durante essa intro para não
permitir que o gesto parado comece antes de terminar o deslocamento.
Os tempos permanecem3650ms até parar e1000ms de finalização, com os três
quadros inteiros fora da prancha preservados. Ao liberar a luta, a animação
automática é retomada junto da guarda. Separação sem redesenho de pixels,
fonte e hashes em `output/almirante-entrada-v4/montagem.json`.
