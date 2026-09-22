# Diário de bordo

Registro bruto do processo, **append-only**. Uma entrada por sessão de
trabalho, acrescentada ao final, antes do commit.

Nunca editar entrada antiga. O valor deste arquivo está em preservar o que
pareceu certo na hora, inclusive quando estava errado. É a leitura dele que
mostra onde o método falha, e é o material da apresentação da matéria: o
processo de fazer um jogo com IA é parte do que se entrega.

## Formato fixo

Copie o bloco abaixo e preencha. Campo sem conteúdo fica com `nada`, não some.

```
## AAAA-MM-DD: título curto da sessão

**Marco:** em qual marco do roteiro a sessão trabalhou.
**Pedido:** o que o João pediu, na linguagem dele.
**Feito:** o que saiu, em bullets. Arquivos tocados.
**Verificado:** qual comando rodou e o que a saída disse. Se não rodou, dizer.
**Créditos gastos:** Spriterrific, se houve. Quantos, em quê, e o que prestou.
**Refeito ou apagado a pedido dele:** o que ele mandou desfazer, e o motivo
dado por ele. Se ele não deu motivo, escrever "sem motivo declarado".
**Aprovado explicitamente:** o que ele disse que ficou bom.
**Atrito:** onde a sessão travou, esperou ou deu voltas.
**Em aberto:** o que ficou para a próxima.
```

---

## 2026-09-17: terreno preparado, a partir da sessão da Alure

**Marco:** anterior ao Marco 0.
**Pedido:** "prepare um ambiente para o VS Code dentro dos meus projetos
pessoais para que eu comece a vibecodar lá. Veja skills e afins que a gente
pode fazer." Antes disso, na mesma conversa, ele pediu recomendação de quais
IAs e programas usar, e trouxe duas referências que gostou (Food Fighters e o
clone de Street Fighter do Chong-U).
**Feito:**
- Template oficial `phaserjs/template-vite-ts` clonado e limpo (telemetria,
  screenshot, README e LICENSE do template removidos; `package.json`
  reescrito com `npm run check`).
- `CLAUDE.md` com identidade própria, regras nomeadas e anti-referência.
- `COMECE-AQUI.md`, `docs/briefing.md`, `docs/gdd.md`,
  `docs/pipeline-arte.md`, `docs/roteiro-de-construcao.md`,
  `docs/referencias.md`, `docs/licoes.md`, `docs/decisoes/`.
- Skills: `spriterrific-api` (oficial, baixada do repositório do autor),
  `lutador-novo` e `fechar-sessao` (escritas aqui).
- `.claude/settings.json`, `.vscode/settings.json` (janela verde),
  `.gitignore`, `.env.example`.
**Verificado:** `npm install` e `npm run check` (ver saída no commit inicial).
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** nada ainda. Ele gostou das duas referências, o
que confirmou a escolha do Phaser.
**Atrito:** não achei o link do Food Fighters. Ficou campo aberto em
`docs/referencias.md`. O código do clone do Chong-U é pago, então herdamos a
ordem de construção e não o código.
**Em aberto:** campos do briefing (entrega, prazo, solo ou grupo). Conta do
Spriterrific. Escolha dos dois mascotes da v1. Marco 0.

## 2026-09-17: ultimates entram no GDD, vindos do doc do Drive

**Marco:** anterior ao Marco 0.
**Pedido:** "Tem um docs no meu drive de nome Projeto street fighter futebol.
Estamos colocando nossas ideias lá. Coloque algumas das minhas aqui também.
Pretendo colocar ataques especiais (ultimates) com algo relacionado ao
mascote/time. Exemplo: Vasco da Gama tem o especial de uma caravana junto de
uma onda atropelar o personagem rival."
**Feito:**
- `docs/gdd.md`: seção "Ultimates" com a regra (ultimate vem do símbolo do
  clube), o exemplo do Vasco, medidor de torcida, ficha de ultimate, e a
  decisão técnica de construir como efeito em camada, fora do Spriterrific.
  Coluna da tabela de candidatos renomeada para "semente de ultimate".
- `docs/roteiro-de-construcao.md`: ultimate abre o Marco 4.
- `docs/briefing.md`: o doc do Drive registrado como fonte de ideias; pista
  de que o trabalho é em grupo.
**Verificado:** só documentação, `npm run check` não se aplica.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** nada.
**Atrito:** a sessão da Alure não tem conector do Drive, então o doc não foi
lido. "Caravana" foi registrado como "caravela" (símbolo do Vasco), a
confirmar com ele.
**Em aberto:** colar o resto do doc do Drive; confirmar caravela; confirmar
se é grupo e quem faz o quê.

## 2026-09-17: grupo confirmado, caravela confirmada

**Marco:** anterior ao Marco 0.
**Pedido:** "Caravela, o trabalho é em grupo", com os nomes dos quatro amigos.
**Feito:** `docs/briefing.md` recebeu o grupo de cinco e uma sugestão de
divisão por frente (código, arte, narrativa, som, apresentação), com um dono
por frente e o repo com dono único.
**Verificado:** só documentação.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** "caravela" confirmada, o GDD já estava certo.
**Atrito:** nada.
**Em aberto:** quem assume cada frente; colar o doc do Drive.

## 2026-09-17: Marco 0 fechado com o Vibe Fighter do Chong-U como base

**Marco:** Marco 0, fechado.
**Pedido:** "clone o projeto desse jogo em código aberto (street fighter) do
Chong-U. Me diga quão fundamental é usar o Cursor, ou se o VS Code funciona
no lugar dele. E como usar outras IAs para imagens, gráficos, cenários, e
como fazer vários frames animados de uma vez mantendo qualidade."
**Feito:**
- Conferido que o Vibe Fighter é público (`github.com/chongdashu/vibe-fighter`,
  sem licença) e que o gym é a parte paga. Os docs diziam "clube pago";
  corrigido em `docs/referencias.md`.
- Trade-off apresentado (referência de estudo, recomendado, contra base do
  jogo). Ele escolheu **base do jogo**. Registrado em `docs/licoes.md` e na
  ADR `docs/decisoes/0003-base-chong-u.md`.
- ZIP dele descompactado em `referencia/chong-u/vibe-fighter/`, oakwoods
  (MIT) clonado em `referencia/chong-u/oakwoods/`. Build e 8 testes dele
  passaram como vieram.
- Template Phaser apagado. `src/`, `public/`, `index.html`, `tsconfig`,
  `vite.config.ts` e `package.json` dele copiados. Lutadores de amostra
  movidos para `public/assets/lutadores/_amostra-*` (3 linhas de caminho no
  código), GIFs de preview descartados. Título, tagline e chave de storage
  próprios. `npm run check` = typecheck + vitest + build; vitest ignora
  `referencia/`.
- Prints via Playwright headless: splash, menu, modo, cenário, seleção,
  Round 1, luta com HUD e timer. Zero erro de console.
- `CLAUDE.md` reescrito: seção "não é", arquitetura real, Regra do
  Retângulo vira Regra do Placeholder, CPU entra na v1 de brinde, proibido
  publicar com `_amostra` em uso. Roteiro: Marco 0 fechado, Marco 1 vira
  "fazer o motor ser nosso" (JSON + Academia + poda), Marco 4 liga os
  ultimates ao medidor de especial que o motor já tem. Prompts do
  `prompts.pdf` transcritos em `docs/pipeline-arte.md`. README, COMECE-AQUI e
  skill `lutador-novo` ajustados.
**Verificado:** `npm run check` verde (typecheck, 8 testes, build de 1,5 MB).
Prints do fluxo inteiro, descritos ao João.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** o plano original de motor com
retângulos (Marco 0 e 1). Motivo dele: partir de código pronto.
**Aprovado explicitamente:** "Base do jogo" e "Baixo agora e aviso", na
pergunta de plano.
**Atrito:** a sessão da Alure rodou em paralelo nesta pasta e commitou com
`git add -A`, levando meus arquivos pela metade sob a mensagem "Briefing:
grupo de cinco confirmado". Nada quebrou, mas o histórico ficou confuso.
Lição registrada: uma sessão escreve no repo por vez. Também escrevi 18/09
em vários lugares antes de notar que era 17/09; corrigido.
**Em aberto:** Marco 1 (lutador em JSON, Academia magra, poda do starter de
RPG). Ler o `phaser-gamedev` do oakwoods e decidir se copia. Campos do
briefing (entrega, prazo, rubrica, dois mascotes da v1). Conta do
Spriterrific.

## 2026-09-17: Marco 1 fechado, lutador em JSON e Academia

**Marco:** Marco 1, fechado. Poda do starter de RPG pendente.
**Pedido:** "Comece a fazer o jogo. Me diga quando e aonde eu coloco as
imagens, como configuro, como gero as imagens? Várias imagens de cada frame
de um soco, ou apenas uma? Faça um prompt para a geração dessas imagens."
**Feito:**
- Regra do JSON: `src/game/lutadores/{red-brawler,green-boxer,jiujitsu-fighter}.json`
  extraídos por script dos TS, com `stats` e `combat` que estavam em
  `fighterConfig.ts`. `lutadores/index.ts` registra e monta via
  `buildFighterCharacter`. Teste temporário de ida e volta provou definição
  idêntica campo a campo (só o texto do `anchorUsage` do jiu-jitsu divergiu,
  corrigido); depois apagado junto com os três TS. `hero.ts`,
  `fighterConfig.ts` e `debug.ts` religados no registro.
- `lutadores.test.ts` permanente (17 testes): ações que o motor exige pelo
  nome, quadros de ataque dentro do alcance, golpe com hitbox, bloqueio com
  guard box, e cada sheet, âncora e retrato existindo em `public/`.
- `AcademiaScene`: sprite em 2x, moldura do 256x256, boxes nas cores do motor
  (`FIGHTER_BOUNDS_FIELDS`), lista de ações, contador de quadro, legenda por
  cor. Teclas: A/D lutador, W/S ação, Espaço toca/pausa, `,` `.` quadro, R
  quadro 1, 1 a 5 boxes, Esc menu. Entrou no menu principal.
- Descoberta que muda a arte: o motor espelha com `flipX` quem olha para a
  direita, então os sprites nativos olham para a **esquerda** (`w`, padrão do
  Spriterrific, e o `anchor-w.png` do Chong-U veio dele). Pipeline e skill
  `lutador-novo` diziam `e`; corrigidos.
- `docs/pipeline-arte.md` ganhou "O que o João faz, o que o agente faz":
  tabela de passos e pastas, prompt da referência (com exemplo do
  Almirante), prompt do retrato, e o que os 500 créditos grátis compram
  (idle + 3 ações, resto por placeholder no JSON).
**Verificado:** `npm run check` verde (typecheck, 25 testes, build). Prints
via Playwright: Academia com quadro 3/6 do soco fraco e attack box ativa,
especial do boxeador com hit múltiplo, luta rodando com os lutadores em JSON
e barras de especial enchendo. Zero erro de console.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** nada com todas as letras. "Comece a fazer" foi
o sinal para o Marco 1.
**Atrito:** a outra sessão não mexeu no repo desta vez. Meu teste do registro
nasceu mais rígido que o motor (exigia `block-low` e `heavy-*`); alinhado
com `resolveActionKeys`.
**Em aberto:** os dois mascotes da v1 (ainda sem escolha; a Alure sugeriu
Urubu × Cartola, o João deu ideia de ultimate pro Almirante). Conta do
Spriterrific. Poda do starter. Marco 2 espera a referência do primeiro
mascote, que é do João.

## 2026-09-22: Urubu entra no jogo com idle e soco do Spriterrific

**Marco:** Marco 2, em andamento.
**Pedido:** "estou no spriterrific para fazer as imagens. Como eu uso?",
depois "o resto você pode tocar", "Faz a do golpe".
**Feito:**
- `.env` criado a partir do modelo; a chave veio com o nome da variável
  duplicado na linha (dois `=`), corrigido por `sed` sem ler o valor.
- Referência do Urubu (`referencia/urubu/referencia-v2.png`) publicada pelo
  João no catbox.moe (o upload feito por mim foi bloqueado pelo classificador
  de permissão do Claude Code, motivo "Data Exfiltration"; ler parte da
  chave também foi bloqueado, "Credential Materialization").
- Três jobs na API do Spriterrific, um por vez, com resultado olhado entre
  cada um. Rodadas em `spriterrific-runs/urubu-cx8exraz` (descartada) e
  `spriterrific-runs/urubu-j58ew5pw` (usada).
- `public/assets/lutadores/urubu/`: `anchor-w.png`, `idle.png` (10 quadros,
  6 fps), `light-punch.png` (8 quadros, 12 fps), `portrait.png` provisório
  (busto recortado do anchor sobre o roxo do retrato de amostra).
- `src/game/lutadores/urubu.json`: idle e light-punch com boxes medidas nos
  quadros (attack nos índices 3, 4 e 5, box x14 y62 70x44); as outras sete
  ações obrigatórias apontam para `idle.png`, rotuladas "placeholder".
- Regra do JSON cobrada na seleção: `CharacterSelectScene` tinha lista fixa
  de ids (`SELECTABLE_FIGHTER_IDS`). Trocada por campo opcional
  `selecionavel` no JSON; `green-boxer.json` recebe `false` (cabem 3 cartas).
- Urubu registrado primeiro em `lutadores/index.ts`.
- `docs/licoes.md`: lição sobre o preset `high-fidelity-v1` jogar fora a pose.
**Verificado:** `npm run check` verde (typecheck, 30 testes, build). Prints via
Playwright: seleção com Urubu como P1, Academia no quadro 5/8 do soco com
attack box no punho e "ataque ATIVO", luta Urubu × Red Brawler com jab
acertando. Zero erro de console do jogo (só aviso de driver GL do headless).
**Créditos gastos:** 420 de 500. Job 1 (160, `high-fidelity-v1`, idle): anchor
de braços caídos em perfil, idle andou; descartado. Job 2 (160,
`preserve-reference-v1`, idle com "guard up, fists raised" no contexto):
anchor em guarda, idle parado; prestou. Job 3 (100, `light_attack` com
"quick straight jab, feet planted"): 8 quadros bons; prestou. Saldo: 80, que
não compra nada. Tentativa de job só de anchor rejeitada sem custo ("Pick at
least one animation").
**Refeito ou apagado a pedido dele:** nada. O refazer do anchor foi decisão
minha, apresentada com o custo antes.
**Aprovado explicitamente:** "Faz a do golpe" (escolheu `light_attack` em vez
do `walk_forward` que eu tinha recomendado).
**Atrito:** ele perguntou duas vezes se podia criar contas novas para ganhar
mais 500. Recusei operar isso (teste é por pessoa, o autor é o mesmo do
motor que usamos de graça); ele disse que cria por conta própria. Sem
travar o trabalho. Playwright: `Down` não é nome de tecla, é `ArrowDown`; e
o clique no canvas já avança a splash, então o Enter seguinte cai no Play.
**Em aberto:** não gastar dinheiro é decisão dele. Próximo teste, custo zero:
Gemini com anchor + sheet do idle do Urubu como referência de estilo e grade
e a fileira do Ryu como pose, gerando o soco (comparar com o do
Spriterrific na Academia) e depois os outros golpes; Almirante só depois de
tirar corvo e cruz da referência. Retrato de verdade do Urubu (João, no
mesmo modelo da referência). Cenário em camadas. Decisão da ADR 0002 no fim
do Marco 2. Permissão do Claude Code para upload em catbox e leitura de
`.env` fica a critério dele (regra em `.claude/settings.json`).

## 2026-09-22: prompts do cenário e camada de céu fixo no motor

**Marco:** Marco 2, em andamento (item "cenário").
**Pedido:** "Eu quero mudar o cenário, preciso de um prompt para eu gerar
ambos, tanto o cenário principal quanto o fundo (o céu não mexe, e o cenário
mexe). É importante também você criar uma seção de escolher o mapa (o padrão
ou o meu)".
**Feito:**
- `docs/prompt-cenario.md`: dois prompts (céu 16:9 fixo; cenário 21:9 com
  céu em verde chapado para recorte), medidas que o motor impõe (chão a 82%
  da altura, ajuste a 720 de altura, rolagem acima de 1280 de largura),
  onde salvar, e o que iterar por script em vez de por prompt.
- `src/game/stageConfig.ts`: campo opcional `sky` em `StageDefinition`, e
  o asset dele entra na carga.
- `src/scenes/MatchScene.ts`: se o cenário tem `sky`, desenha a imagem
  esticada para a tela, presa à câmera (`scrollFactor 0`), atrás do cenário.
- Escolher o mapa: a tela `Select Stage` já lista todo cenário registrado;
  o do João entra como terceira carta quando as imagens chegarem.
**Verificado:** `npm run check` verde (typecheck, 30 testes, build). Teste
descartável: rooftop de amostra partido em céu e cenário com topo
transparente, registrado, luta fotografada em duas posições de câmera: o
cenário rolou e o céu ficou parado. Teste apagado depois.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** nada.
**Atrito:** contei errado os Enter do menu no Playwright (o primeiro é o
Play); custou uma rodada de fotos.
**Em aberto:** as duas imagens são do João. Quando chegarem: recortar o verde
da B por script, registrar em `stageConfig.ts`, conferir chão e rolagem na
luta. Torcida animada e terceira camada (gramado separado) ficam para
depois da v1.

## 2026-09-22: estádio do João entra no jogo

**Marco:** Marco 2, em andamento (item "cenário" fechado na versão de duas camadas).
**Pedido:** "Onde eu coloco as imagens do fundo céu e do cenário (ele está
vindo com uma tela verde)", depois "Pronto".
**Feito:**
- João gerou as duas imagens com os prompts de `docs/prompt-cenario.md`
  (cenário 3168×1344 com céu em verde; céu 2752×1536). Vieram em JPG.
- Brutos movidos para `referencia/cenarios/` (fora do git).
- Script (PIL, sem numpy nesta máquina): chroma por `G - max(R,B) > 110`,
  erosão de 1 px na borda, faixa transparente de 93 px no topo para os pés
  (82% da altura) caírem 65 px dentro do gramado, redução para 2048 de
  largura. Despill em dois passos: vizinhança do transparente e, depois,
  todo pixel claro com verde dominante acima do gramado (o refletor do meio
  tinha vazamento entre as lâmpadas).
- `public/assets/cenarios/estadio/cenario.png` (2048×929, 2,7 MB) e
  `ceu.jpg` (1920×1080, 85 KB).
- `src/game/stageConfig.ts`: entrada `estadio` com `sky`. Aparece como
  terceira carta em `Select Stage`.
**Verificado:** `npm run check` verde. Playwright: luta no estádio em duas
posições de câmera, céu parado e arquibancada andando, pés no gramado.
Zero erro de console.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** nada com todas as letras.
**Atrito:** numpy não existe nesta máquina; refeito só com PIL. Vazamento
verde no refletor precisou de segundo passo de despill.
**Em aberto:** o horizonte do céu (morros e brilho) fica escondido atrás da
arquibancada porque o céu é esticado para a tela inteira; se ele quiser ver
os morros, gerar o céu com o horizonte mais alto (uns 25% do topo). Torcida
animada fica para depois da v1.

## 2026-09-22: lutadores flutuando no estádio, chão vira propriedade do cenário

**Marco:** Marco 2, em andamento.
**Pedido:** "Os lutadores estão voando. Tem alguma forma de corrigir isso com
o menu de debug? Eles não estão pisando onde deveriam".
**Feito:**
- Causa: a faixa transparente de 93 px que eu tinha acrescentado no topo do
  cenário empurrou o gramado para baixo, mas o motor manteve os pés a 82%
  da tela (`GROUND_FRACTION` fixo). Conta errada minha.
- Correção no motor: `groundFraction` opcional em `StageDefinition`
  (`DEFAULT_GROUND_FRACTION = 0.82`), `MatchScene` lê do cenário. Não é
  menu de debug: é um número por cenário, no registro.
- `cenario.png` refeito sem a faixa (2048×869), mesmo recorte e despill.
- Estádio com `groundFraction: 0.92`. O primeiro chute (0.876) deixou os pés
  na beirada do gramado, porque os sprites têm ~27 px de margem abaixo dos
  pés na célula (×1,6 = 43 px na tela). Anotado em `docs/prompt-cenario.md`.
**Verificado:** `npm run check` verde. Playwright: luta no estádio com os dois
em pé no gramado, sombra na grama, abaixo do alambrado. Zero erro de console.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** o posicionamento do chão do estádio,
motivo dado: "estão voando, não estão pisando onde deveriam".
**Aprovado explicitamente:** nada.
**Atrito:** nada além do erro de conta.
**Em aberto:** os mesmos itens da entrada anterior.

## 2026-09-22: primeiro golpe pelo Gemini, script de alinhamento

**Marco:** Marco 2, em andamento.
**Pedido:** "Eu fiz com o gemini o block-high, achei que era só colocar a
imagem e pronto? o que precisava ser feito? eu preciso sempre te avisar?"
**Feito:**
- A sheet do Gemini (2172×724, 4 quadros, fundo transparente, mesmo estilo
  do Spriterrific) foi para `referencia/urubu/block-high-gemini.png`.
- `scripts/alinhar-sheet.py`: separa quadros por faixas vazias, aplica a
  escala do primeiro quadro em relação ao idle de referência, alinha os pés
  e o centro dos pés, monta a grade 256×256 em 5 colunas, imprime `frames`
  e `defaultVisual`. Recorta verde se a entrada não tiver alpha.
- `public/assets/lutadores/urubu/block-high.png` (1280×256) e entrada do
  `block-high` no `urubu.json` (4 quadros, 10 fps, guard 56/30/140×120).
- `docs/pipeline-arte.md`: seção "Sheet pelo Gemini" com os três passos.
**Verificado:** `npm run check` verde. Academia: block high quadro 2/4 com
guard box sobre braços e cabeça. Zero erro de console.
**Créditos gastos:** nada. A ADR 0002 ganha evidência a favor do Gemini.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** nada.
**Atrito:** o servidor de dev tinha caído; subiu de novo. Ele esperava que
a imagem sozinha bastasse: a Regra do JSON não estava explicada do ponto de
vista de quem só gera arte.
**Em aberto:** registrar o prompt que ele usou no Gemini (pedir). Próximas
sheets pelo mesmo caminho: heavy-kick, walk-forward, hit-high, jump,
crouch, knockdown, special.

## 2026-09-22: modelo do Urubu trocado, o de 3/4 vira oficial

**Marco:** Marco 2, em andamento.
**Pedido:** "O modelo atual do urubu nos personagens está me incomodando
porque ele está praticamente de costas, enquanto os outros bonecos estão
mais de frente", depois "é esse mesmo, é possível usar ele para os
movimentos? ou ele precisa ter o fundo verde e etc".
**Feito:**
- Avaliação do `referencia/urubu/Urubu-alternativo.png` (447×447, figura de
  248×382, fundo branco): pose 3/4 mostrando o peito, no mesmo enquadramento
  do Red Brawler, que é exatamente a queixa dele. Cabeça e bico maiores,
  listras com mais contraste, direção certa (esquerda).
- Respondido que o fundo verde era exigência do Spriterrific (chroma), não
  do Gemini. O arquivo serve como está.
- `referencia/urubu/modelo-oficial.png`: o modelo recortado por
  preenchimento a partir das bordas (o calção branco fica intacto porque não
  toca a borda). É o que se anexa no Gemini daqui para frente.
- `public/assets/lutadores/urubu/anchor-w.png` trocado: figura ampliada 2×
  em NEAREST (496×764) sobre verde chapado, pés a 92% da altura. O anchor não
  é desenhado em nenhuma cena, só o teste cobra que exista, então a troca não
  quebra nada visual.
- `scripts/alinhar-sheet.py` aprendeu fundo sólido de borda: tenta chroma
  verde, e se não achar, faz o preenchimento. Testado com fundo branco (2
  quadros, alinhou) e regressão no `block-high` (mesmos números de antes).
- `docs/pipeline-arte.md`: molde de prompt por ação, contagem de quadros
  sugerida por movimento, e a regra de que o `idle` vem primeiro porque o
  script alinha tudo por ele.
**Verificado:** `npm run check` verde (typecheck, 30 testes, build).
**Créditos gastos:** nada. Saldo segue em 80.
**Refeito ou apagado a pedido dele:** o modelo do Urubu. Motivo dado por ele:
"está praticamente de costas, enquanto os outros bonecos estão mais de
frente".
**Aprovado explicitamente:** "é esse mesmo", sobre o modelo alternativo.
**Atrito:** uma busca recursiva em `referencia/` travou por causa da pasta
`chong-u`; refeita direto na pasta do mascote.
**Em aberto:** as três sheets atuais (`idle` e `light-punch` do Spriterrific,
`block-high` do Gemini) ainda são do modelo velho e precisam ser refeitas,
o `idle` primeiro. Retrato do Urubu também sai do modelo novo. Almirante
continua esperando a limpeza de corvo e cruz.
