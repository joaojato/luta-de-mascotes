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

## 2026-09-22: skins, para testar modelo de roupa sem jogar o anterior fora

**Marco:** Marco 2, em andamento.
**Pedido:** "você consegue fazer isso de skin para os personagens? o que eu
pensei era fazer uma pasta dentro de urubu por exemplo e a gente consegue
definir as skins. É mais para testar os modelos de roupa. A versão de costas
ou a versão de frente (eu não quero jogar fora)."
**Feito:**
- `skins` opcional no `LutadorJson`: lista de subpastas de `assetRoot`. A
  primeira é a base e tem tudo; as outras listam em `sobrescreve` só os
  arquivos próprios e herdam o resto como caminho relativo
  (`../costas/idle.png`), que navegador e `resolve` do teste normalizam
  igual. Expansão em `expandirSkins`, dentro de `lutadores/index.ts`: o
  motor não mudou nem uma linha.
- Base mantém o id (`urubu`); extra vira `urubu-frente` e nasce fora da
  seleção (`selecionavel: false`), aparecendo na Academia, que lista tudo.
- Assets reorganizados: `urubu/costas/` com o que existia (anchor do
  Spriterrific recuperado do commit cd0fa90, idle, light-punch, block-high,
  portrait) e `urubu/frente/` com o anchor do modelo novo e um retrato
  tirado dele.
- Testes: 2 novos de skin (a extra é lutador próprio fora da seleção; herda
  o idle da base e usa o próprio anchor). O teste de arquivos passou a
  resolver `anchorFile`/`portraitFile` em vez de assumir o nome fixo, senão
  skin que herda o anchor daria falso negativo. 30 para 37 testes.
- **Regra da Skin** no `CLAUDE.md` e seção no `docs/pipeline-arte.md` com
  como mover uma sheet para a skin e como promover a skin a base.
**Verificado:** `npm run check` verde (typecheck, 37 testes, build).
Playwright: Academia mostrando "Urubu (perfil) (1/5)" e "Urubu (3/4 de
frente) (2/5)", tocando o idle herdado. Zero erro de console.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada apagado; o ponto do pedido era
justamente não apagar o modelo antigo.
**Aprovado explicitamente:** nada.
**Atrito:** eu tinha commitado o `block-low.png` bruto em `public/` sem
olhar, porque rodei `git add -A` enquanto ele salvava arquivo na pasta.
Removido do repositório no commit seguinte e movido para `referencia/`.
Lição: conferir `git status` antes do add quando a sessão é longa e ele
está mexendo nas pastas ao mesmo tempo.
**Em aberto:** a skin `frente` só tem anchor e retrato. Cada sheet nova
alinhada entra na pasta dela e no `sobrescreve`. O `block-low` que ele gerou
precisa voltar ao Gemini: três dos quatro quadros saíram de frente para a
câmera, e o primeiro é guarda em pé, não bloqueio baixo.

## 2026-09-22: pedido e entrega de sprite viram dois comandos

**Marco:** Marco 2, em andamento.
**Pedido:** "tem como automatizar esse processo? atualmente eu estou usando
o chat gpt para fazer os sprites (ele tem feito muito bem). Eu preciso mandar
a foto do sprite de referência do personagem e uma descrição detalhada para
que ele não alucine. A partir daí eu mando um sprite de referência com os
golpes e peço para fazer os mesmos movimentos, coloca o urubu no lugar do
outro."
**Feito:**
- `docs/mascotes/urubu.md`: a descrição visual travada, em inglês, entre
  marcas `DESCRICAO:INICIO`/`FIM`, lida pelo script. Era o pedaço que ele
  reescrevia à mão a cada pedido.
- `scripts/sprite.py pedido <slug> <acao>`: monta
  `referencia/pedidos/<slug>-<acao>/` com `prompt.txt` (descrição travada +
  a frase do movimento + as proibições), `1-personagem.png` (modelo oficial)
  e `2-movimento.png` (a mesma ação do red-brawler, subamostrada para o
  número de quadros da ação e ampliada 2×, quadros na mesma linha de base).
  O prompt separa explicitamente os papéis: imagem 1 é quem o personagem é,
  imagem 2 é só como o corpo se move, e proíbe copiar roupa, cor, rosto e
  proporção da imagem 2.
- `scripts/sprite.py entrega <slug> <acao> <arquivo>`: chama o alinhador,
  grava na pasta da skin, atualiza a ação no JSON (`frames`, `frameRate` e
  `repeat` copiados da mesma ação do red-brawler, `defaultVisual` medido) e
  acrescenta o arquivo em `sobrescreve`. Avisa quando a ação é golpe, que
  ainda precisa de `attack` definido na Academia.
- `alinhar-sheet.py` ganhou `--json` para entregar os números ao outro
  script em vez de ser lido por stdout.
- `npm run sprite`, e o caminho documentado em `docs/pipeline-arte.md` e no
  `CLAUDE.md`.
**Verificado:** `npm run check` verde (typecheck, 37 testes, build). Pedido
do `idle` gerado e conferido (prompt de 1922 caracteres, referência com 4
de 12 quadros). Entrega testada com o `block-high` que já estava no jogo:
`git diff` vazio no PNG e no JSON, ou seja, idempotente.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** nada.
**Atrito:** nada.
**Em aberto:** automação total (gerar pela API da OpenAI ou do Gemini) foi
apresentada e não feita: custa por imagem e pede chave nova, enquanto o
chat já está no plano que ele paga. `MOVIMENTO` e `QUADROS` no script são
chutes por ação e vão se ajustar com o uso.

## 2026-09-22: régua de alinhamento sai da sheet antiga

**Marco:** Marco 2, em andamento.
**Pedido:** "eu não quero usar o spriterrific para fazer isso. O dev desse
jogo já fez alguns personagens e é possível usar as sprites que ele gerou de
movimento para adaptar com o personagem que eu quero simplesmente mandando
para o chat gpt."
**Feito:**
- Ele leu o fluxo como dependente do Spriterrific. A geração nunca foi: o
  pedido monta modelo do Urubu + fileira do `red-brawler` (o lutador que veio
  do Chong-U) + descrição travada, e a imagem sai do ChatGPT dele. Mas a
  crítica acertou um ponto real: a **régua de escala** do alinhamento
  apontava para o `idle` da skin base do próprio mascote, que hoje é a sheet
  do Spriterrific. Trocada para o `idle` do `red-brawler`, o mesmo lutador de
  onde sai a referência de movimento. Agora nada no caminho olha para arte
  do Spriterrific.
- `--abrir` no pedido: copia o `prompt.txt` para a área de transferência e
  abre a pasta no explorador, para o trabalho no chat ser só colar e
  arrastar.
- Cabeçalho do script e `docs/pipeline-arte.md` dizem com todas as letras
  que Spriterrific não entra, e que a pasta `costas/` existe só porque
  modelo antigo vira skin.
**Verificado:** `npm run check` verde (typecheck, 37 testes, build). Pedido do
`light-punch` regerado com a régua nova. Entrega testada na skin `frente` e
revertida em seguida (tinha escrito arte do modelo antigo na skin nova).
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** a régua do alinhamento. Motivo dado por
ele: não quer Spriterrific em nenhuma parte do processo.
**Aprovado explicitamente:** nada.
**Atrito:** ele ficou irritado, e a causa foi minha: na mensagem anterior eu
citei "o do Spriterrific" ao explicar o `--skin`, o que fez parecer que a
ferramenta estava no caminho. Explicar o fluxo pelo nome do que ele rejeitou
é convite a mal-entendido.
**Em aberto:** ele gera o `light-punch` no ChatGPT a partir de
`referencia/pedidos/urubu-light-punch/`. Depois: `npm run sprite -- entrega
urubu light-punch <arquivo> --skin frente`, e a hitbox do golpe na Academia.

## 2026-09-22: o comando passa a esperar a imagem e se virar sozinho

**Marco:** Marco 2, em andamento.
**Pedido:** "dentro desse processo tem muitas etapas que eu ainda preciso
executar e mexer. Eu tive que entrar no gpt, abrir uma conversa nova, colar o
texto, enviar os arquivos, salvar o resultado, inserir na pasta correta."
**Feito:**
- `--aguardar` no `pedido`: copia o prompt, abre a pasta das imagens, abre o
  ChatGPT numa conversa nova e entra em vigia. Quando um PNG novo aparece em
  `Downloads` ou na Área de Trabalho, alinha, grava na pasta da skin e
  atualiza o JSON sem mais nenhum comando.
- O vigia fotografa o que já existe antes de esperar e só aceita arquivo
  novo, em vez de chutar "o mais recente"; e espera o tamanho parar de
  crescer, para não pegar download pela metade.
- `--skin` e `--minutos` no pedido, para já dizer onde entregar e quanto
  esperar.
- `comando_entrega` virou a função `entregar`, chamada pelos dois caminhos.
- De sete etapas manuais sobraram três: colar, arrastar as duas imagens,
  salvar o resultado.
**Verificado:** `npm run check` verde (typecheck, 37 testes, build). Vigia
testado isolado: rodando em segundo plano, um PNG copiado para Downloads foi
detectado e devolvido em menos de 6 segundos.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** nada.
**Atrito:** nada.
**Em aberto:** dirigir o ChatGPT por Playwright (colar e anexar sozinho) foi
apresentado e não feito: os termos de uso da OpenAI proíbem acesso
automatizado à interface, e a conta é dele. Decisão fica com ele.

## 2026-09-22: primeiro sprite do fluxo novo, o soco do Urubu de frente

**Marco:** Marco 2, em andamento.
**Pedido:** continuação da automação; ele gerou o soco no ChatGPT Plus com o
pedido montado pelo script e salvou o resultado.
**Feito:**
- O soco veio bom de primeira: 6 quadros, modelo novo, virado para a
  esquerda, poses acompanhando a referência do `red-brawler`. Bruto movido
  para `referencia/urubu/light-punch-gpt.png`.
- Bug achado na entrega: o braço esticado do quadro 3 encosta no quadro 4,
  não sobra coluna vazia e os dois viraram um bloco só (5 quadros em vez de
  6). Primeira tentativa de correção (dividir bloco largo pela mediana)
  errou para 7, porque o quadro do soco é legitimamente mais largo. Correção
  boa: o alinhador recebe quantos quadros o pedido pediu (`--esperados`,
  vindo de `QUADROS[acao]`) e, faltando quadro, corta o bloco mais largo na
  coluna com menos pixel, repetindo até fechar a conta.
- `public/assets/lutadores/urubu/frente/light-punch.png` (6 quadros, 14 fps)
  e `attack` medido nos quadros 2 e 3 (caixa 19/65, 72×40), onde o punho
  passa de x=60.
- `__pycache__` tinha vazado para o repositório num commit anterior:
  removido e acrescentado ao `.gitignore`.
**Verificado:** `npm run check` verde (typecheck, 37 testes, build).
Academia: "Urubu (3/4 de frente) (2/5)", light punch quadro 3/6, "ataque
ATIVO", attack box vermelha no punho esticado. Zero erro de console.
**Créditos gastos:** nada. Primeira sheet do projeto feita inteira no plano
que ele já paga.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** nada com todas as letras, mas ele executou o
fluxo e entregou o resultado, que é o sinal prático.
**Atrito:** `git add -A` levou junto o `__pycache__` e o PNG bruto que ele
tinha acabado de salvar na pasta. Segunda vez na mesma sessão.
**Em aberto:** o `idle` do modelo novo, que é o que falta para a skin frente
poder virar a base. Depois: walk-forward, hit-high, block-high, crouch,
jump, knockdown, heavy-kick e special.

## 2026-09-22: lote, o mascote inteiro numa conversa só

**Marco:** Marco 2, em andamento.
**Pedido:** "esse processo ainda está ruim, não tem forma melhor de fazer
isso não?" Perguntei o que pesava e ele marcou duas: uma conversa para todas
as ações, e várias ações por imagem.
**Feito:**
- `npm run sprite -- lote <slug> --skin <skin> --aguardar`: descobre as ações
  que ainda não têm sheet própria, agrupa em mensagens (até 3 ações e 13
  quadros por imagem), monta uma imagem de movimento com **uma ação por
  fileira**, escreve o texto de cada mensagem e um `roteiro.md`. Com
  `--aguardar`, processa cada resultado salvo, separa as fileiras, monta uma
  sheet por ação, registra no JSON e já copia o texto da mensagem seguinte.
  Para o Urubu: 8 ações em 4 mensagens, numa conversa.
- Da segunda mensagem em diante o texto é curto: o personagem já está no
  contexto do chat, então só muda a imagem anexada.
- `alinhar-sheet.py` virou `alinhar_sheet.py` (importável) e foi reescrito em
  funções: `preparar`, `separar`, `montar`, `regua_de`. `separar` agora
  devolve os quadros **agrupados por fileira** e aceita esperado por fileira.
  O `sprite.py` importa em vez de chamar por subprocess.
- Bug latente corrigido na reescrita: com ação única espalhada em duas
  fileiras (8 quadros em 2 linhas de 4), o alinhador antigo aplicava o número
  esperado **dentro de cada fileira** e cortaria quadro bom no meio. Agora o
  alvo vale para o total quando a ação é uma só.
- Salvaguarda: se o chat devolver número de fileiras diferente do pedido, o
  comando avisa e não registra nada, para não gravar ação trocada.
**Verificado:** `npm run check` verde (typecheck, 37 testes, build).
Regressão do soco: mesmos 6 quadros e mesmo `defaultVisual` de antes.
Separação por fileira testada nas 4 imagens do lote ([4,6], [6,3], [5,4,4],
[6]): todas bateram. Ponta a ponta do bloco testado com duas ações numa
imagem: duas sheets gravadas, JSON e `sobrescreve` atualizados; teste
revertido em seguida.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** o fluxo de uma ação por conversa.
Motivo dado por ele: ainda era trabalho braçal demais.
**Aprovado explicitamente:** nada, mas ele escolheu as duas direções na
pergunta.
**Atrito:** heredoc de bash com aspas dentro quebrou duas vezes ao inserir
código Python; passei a usar a ferramenta de edição direta para código.
**Em aberto:** o lote ainda não rodou com resultado de verdade do chat. A
primeira rodada dele é o teste real, em especial se o chat mantém as
fileiras separadas.

## 2026-09-22: prompt cortado ao osso

**Marco:** Marco 2, em andamento.
**Pedido:** "você está complicando demais. A única coisa que você precisa
passar no prompt é que ele precisa trocar os personagens e uma descrição de
como o personagem é. Não precisa falar de método nem nada, ele já faz essas
coisas automaticamente."
**Feito:**
- Prompt de ação única e do lote cortados para duas frases mais a descrição
  travada: "Replace the fighter in image 2 with the character from image 1.
  Same N frames, same poses." De 1919 para 841 caracteres.
- Mensagens seguintes do lote viraram uma linha: "Same character. New
  reference attached, N rows."
- Saíram: separação de papéis das imagens, lista de proibições, estilo,
  enquadramento, direção, baseline e a descrição do movimento por ação. A
  imagem de referência já carrega tudo isso.
- `texto_das_linhas` virou órfã e foi removida.
- Antes disso, na tentativa de resolver a falha de geração, o pedido de
  fundo transparente virou fundo branco liso, que é o que o gerador do
  ChatGPT entrega sem falhar. O recorte por borda já dá conta.
- `sprite.py aguardar <slug> <acao>`: só espera a imagem e entrega, sem
  remontar o pedido. É o comando de repescagem quando a geração falha.
**Verificado:** `npm run check` verde (typecheck, 37 testes, build). Pedido e
lote regerados com os textos novos.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** o prompt inteiro. Motivo dado por ele:
o chat já faz método sozinho, só precisa saber o que trocar e por quem.
**Aprovado explicitamente:** nada.
**Atrito:** a geração do idle falhou duas vezes no chat ("a ferramenta não
retornou uma imagem"), o que me levou a mexer no fundo antes de descobrir
que o problema real era o prompt inchado.
**Em aberto:** rodar o idle com o prompt curto.

## 2026-09-22: idle do modelo novo entra sozinho

**Marco:** Marco 2, em andamento.
**Pedido:** "vamos fazer o movimento de quando o player está parado."
**Feito:**
- Com o prompt curto, a geração funcionou na primeira. O vigia pegou a
  imagem em `Downloads`, recortou o fundo, separou os 4 quadros, alinhou e
  gravou `public/assets/lutadores/urubu/frente/idle.png` com o JSON
  atualizado (4 quadros, 8 fps), sem nenhum comando meu no meio.
- Teste de skin estava frágil: fixava que o `idle` da skin `frente` era
  herdado da base. Como agora ela tem idle próprio, quebrou. Reescrito como
  regra: todo arquivo listado em `sobrescreve` tem de vir da pasta da skin,
  e todo o resto tem de vir da base. Não quebra mais a cada sheet nova.
**Verificado:** `npm run check` verde (typecheck, 37 testes, build). Academia:
"Urubu (3/4 de frente) (2/5)", idle 1/4 em 8 fps, guarda alta, pés
plantados. Zero erro de console.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** nada.
**Atrito:** duas falhas de geração antes do prompt ser cortado.
**Em aberto:** a skin `frente` tem idle, soco, âncora e retrato. Faltam
walk-forward, walk-backward, crouch, jump, block-high, hit-high e
knockdown, que saem em 3 mensagens do lote. Quando fechar, ela vira a base
e a `costas` passa a ser a variante.

## 2026-09-22: prompt para o Codex rodar o pipeline sozinho

**Marco:** Marco 2, em andamento.
**Pedido:** "não pode fazer um negócio que use o meu computador que está de
servidor ligado direto? A gente baixa o repositório lá, ele faz as imagens e
pronto. Na verdade se eu fizer com o codex será que ele já não faz
automaticamente todos que faltam do urubu? Monte um prompt explicando o que
eu preciso e como deve ser feito."
**Feito:**
- Confirmado por busca que o Codex passou a gerar imagem: skill `imagegen`
  com `gpt-image-2` desde 21/04/2026, built-in (`image_gen`), sem exigir
  chave de API. Isso muda o quadro: o agente faz o pipeline inteiro.
- `docs/prompt-codex.md`: prompt pronto para colar, com o que já existe e
  não deve ser reinventado, as sete ações que faltam, o laço por ação
  (pedido, `view_image`, `image_gen`, salvar, entrega), lista de aceitação
  por sheet, validação (`npm run check` e Academia com print), regras do
  projeto e o que fazer quando a geração falhar.
- Nesse caminho o lote não é usado: uma ação por vez é mais simples para um
  agente, já que o custo de "ir ao chat" não existe.
- Dúvida dele sobre o lote querer refazer o `light-punch` era pasta antiga:
  `referencia/pedidos/urubu-light-punch` e `urubu-idle` continuavam lá depois
  de prontas. Apagadas. O lote lista corretamente só as sete que faltam.
**Verificado:** `npm run check` verde. Lote conferido listando só o que falta.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** nada.
**Atrito:** nada.
**Em aberto:** o prompt do Codex ainda não rodou. Ponto de dúvida: se o
`image_gen` built-in consegue salvar direto num caminho do disco ou se o
agente precisa de outro passo para isso. O prompt pede o resultado salvo em
`referencia/urubu/<acao>-gpt.png` e deixa o caminho a cargo dele.

## 2026-09-22: Codex entrega o jump, e skin ganha números próprios

**Marco:** Marco 2, em andamento.
**Pedido:** "Esquece tudo que eu te falei de processo de automatização com
prompt abrindo gpt e blá blá blá. O Codex consegue acessar a pasta, consegue
gerar imagens e colocar o resultado no lugar certo, ele fez tudo que eu
queria, você podia simplesmente ter me falado que eu podia usá-lo. Implemente
o jump.png."
**Feito:**
- O Codex gerou e **já alinhou** `public/assets/lutadores/urubu/frente/jump.png`
  (8 quadros: agacha, impulsiona, ar com pernas dobradas, descida, pouso).
  Faltava só o registro.
- `npm run sprite -- registrar <slug> <acao> --skin <skin>`: mede uma sheet
  que já está na grade e escreve o JSON, sem passar pelo recorte e
  realinhamento. É o comando para o que o Codex entrega.
- Bug de modelo que isso expôs: as ações eram compartilhadas entre skins, só
  o caminho do arquivo mudava. Registrar o `jump` na skin `frente` fez a base
  apontar para `jump.png`, que não existe na pasta `costas`: teste vermelho e
  erro de spritesheet no console. Pior, `idle` e `light-punch` já estavam com
  os números do modelo novo valendo para a skin antiga (4 quadros numa sheet
  de 10).
- Correção: skin extra agora declara `acoes`, um bloco por ação **com os
  números dela**; a base mantém os seus. `sobrescreve` ficou só para arquivo
  solto (âncora, retrato). `expandirSkins` mescla, `registrar` escreve na
  skin certa, e o teste de skin virou regra em cima disso.
- Base restaurada com os números medidos das sheets dela (idle 10 quadros,
  light-punch 8, block-high 4), e a skin `frente` com idle 4, light-punch 6
  e jump 8.
**Verificado:** `npm run check` verde (typecheck, 37 testes, build). Academia:
"Urubu (3/4 de frente)", jump quadro 4/8 no topo do salto; skin `costas`
conferida na sequência e intacta. Zero erro de console.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** todo o fluxo de automação em volta do
chat. Motivo dado por ele: o Codex já faz o trabalho inteiro sozinho.
**Aprovado explicitamente:** nada.
**Atrito:** eu não ofereci o Codex quando ele perguntou de automação, e ele
descobriu sozinho depois de eu construir três versões de um fluxo que sempre
parava na porta do chat.
**Em aberto:** faltam walk-forward, walk-backward, crouch, block-high,
hit-high e knockdown na skin `frente`. Quando fecharem, ela vira a base e a
`costas` passa a ser a variante.

## 2026-09-22: mais tres do Codex, crouch e os dois bloqueios

**Marco:** Marco 2, em andamento.
**Pedido:** continuação do jump; o Codex entregou `crouch`, `block-high` e
`block-low` na pasta da skin enquanto eu corrigia o modelo de skin.
**Feito:**
- As três registradas com `npm run sprite -- registrar urubu <acao> --skin
  frente`: crouch 5 quadros 10 fps, block-high 4, block-low 4.
- `guard` definido à mão nos dois bloqueios (alto 56/30 140×120, baixo
  56/80 140×110), que o comando não tem como medir.
- O Codex fez `block-low` por conta própria, que não estava na minha lista
  de faltantes porque o motor cai para `block-high` quando falta. Ganho.
**Verificado:** `npm run check` verde (typecheck, 37 testes, build). Academia:
block high quadro 2/4 com "guarda" ativa e guard box roxa sobre cabeça e
tronco. Zero erro de console.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** nada.
**Atrito:** nada.
**Em aberto:** faltam walk-forward, walk-backward, hit-high e knockdown.

## 2026-09-22: a skin `frente` fecha as 13 ações, e o motor deixava 4 de fora

**Marco:** Marco 2, em andamento.
**Pedido:** "Tem novas imagens no urubu frente", e no meio da sessão "todas as
imagens foram inseridas". O Codex despejou o resto das sheets na pasta.
**Feito:**
- Sete ações registradas na skin `frente`: heavy-kick (10 quadros, 12 fps),
  hit-high (6, 12), knockdown (10, 10), walk-forward (8, 8), walk-backward
  (8, 8), special-charge (5, 14) e special (12, 16). Com as seis anteriores,
  a skin fecha as 13 ações que o motor conhece.
- `attack` medido à mão no heavy-kick (quadros 3-5, caixa 22/86 84×80) e no
  special (quadros 4-6, caixa 34/20 84×112). O comando não mede golpe.
- **Sobra de quadro vizinho:** `knockdown` e `special` vieram com pedaços de
  sola do quadro de cima caídos no topo da célula de baixo (4 e 5 quadros
  sujos). Virou código: `ilhas_soltas` acha a faixa isolada, `registrar`
  avisa, e `registrar --limpar` apaga antes de medir. Backup das 15 sheets
  antes de tocar em qualquer uma.
- **Bug do motor achado por acaso:** `expandirSkins` montava as ações da skin
  com `lutador.actions.map(...)`, ou seja, só o que existia na base. As
  quatro ações que só a skin tem (block-low, heavy-kick, special-charge,
  special) ficavam no JSON e nunca chegavam ao jogo. O block-low estava assim
  desde ontem. Corrigido, com teste novo que falha sem o conserto (conferido
  revertendo o patch: "block-low não chegou no motor").
**Verificado:** `npm run check` verde (typecheck, 38 testes, build). As sete
sheets conferidas quadro a quadro em contato de revisão, e as caixas de ataque
desenhadas por cima dos quadros ativos. Dev server servindo as sete com 200.
**Academia: ainda não.** Sem browser nesta sessão, a conferência das 13
animações na Academia ficou para o João.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** nada.
**Atrito:** nada.
**Em aberto:** conferir as 13 na Academia. Depois disso, a `frente` vira a
base e a `costas` passa a variante, como o roteiro previa.

## 2026-09-22: a `frente` vira a base e o perfil sai da seleção

**Marco:** Marco 2, em andamento.
**Pedido:** "Tire o urubu (perfil) como um boneco jogável e deixe apenas
Urubu (para a versão mais completa que acabamos de fazer)."
**Feito:**
- As 13 ações da skin `frente` saíram de `acoes` e viraram a lista `actions`
  do mascote. A `costas` passou a declarar os números antigos em `acoes`
  (idle 10 quadros, light-punch 8, block-high 4, e os seis placeholders que
  apontam para o idle dela) e o âncora e o retrato em `sobrescreve`.
- `expandirSkins`: a base deixou de ganhar o modelo entre parênteses. Na
  seleção aparece "Urubu"; na Academia, "Urubu (perfil)" fora da seleção.
- As quatro ações que a `costas` nunca teve (block-low, heavy-kick,
  special-charge, special) passam a ser herdadas da `frente`. Na Academia
  ela mostra o modelo novo nessas quatro, o que é o sinal visível do que
  falta nela.
- Testes de skin reescritos sem citar pasta por nome: eles descobrem base e
  variante pelo JSON, então a próxima troca de base não quebra teste. Um
  teste novo cobra o pedido de hoje: o mascote entra na seleção uma vez só,
  pela base, e com o nome limpo.
- `docs/pipeline-arte.md` ganhou a receita de promover skin a base.
**Verificado:** `npm run check` verde (typecheck, 39 testes, build). Motor
listado a partir do registro: `urubu` "Urubu" selecionável em
`/assets/lutadores/urubu/frente` com as 13 sheets próprias, e `urubu-costas`
"Urubu (perfil)" com `selecionavel=false`.
**Academia: ainda não.** Continua pendente a conferência visual das 13 na
Academia, e agora também a tela de seleção com um Urubu só.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada apagado. O modelo antigo virou
variante, como manda a Regra da Skin.
**Aprovado explicitamente:** o modelo `frente` do Urubu, ao pedir que ele
seja o único jogável.
**Atrito:** nada.
**Em aberto:** conferir na Academia e na seleção. Depois, cenário e segundo
mascote (Marco 3).

## 2026-09-22: a Régua do Idle, e o mascote para de crescer

**Marco:** Marco 2, em andamento.
**Pedido:** "Precisa refazer as proporções baseando-se no Idle (as outras
estão um pouco distorcidas, crescendo, diminuindo)."
**Feito:**
- Medido: o Codex entrega cada sheet num tamanho. O quadro de guarda ia de
  199px (idle) a 236px (hit-high, special, walk), e a linha dos pés variava
  de 213 a 253. Na luta isso é o mascote crescendo e encolhendo a cada golpe.
- **Três métricas testadas antes de escolher.** Área do bico: ordenava certo
  mas exagerava a diferença (dizia 1,41 onde o certo era 1,18), porque o
  Codex desenha o bico em tamanhos diferentes. Altura da cabeça por perfil de
  silhueta: falhou feio (deu 0,56 para o special, por causa do braço erguido).
  Altura da figura no quadro de guarda: **certa**, confirmada sobrepondo o
  hit-high escalado por 0,843 sobre a silhueta do idle.
- Comando novo: `npm run sprite -- escalar <slug> <acao>`. Mede o fator pela
  pose em pé do quadro 0 contra o `idle` da mesma pasta, reduz a célula
  inteira (não o recorte de cada figura, senão o salto deixa de subir) e
  recoloca no pé e no chão do idle. `--fator` para as três poses que nunca
  ficam eretas (bloqueios e carga), `--chao` para fixar o pé em todo quadro,
  `--piso` para tirar do chão só o quadro que afundou numa ação aérea.
- Aplicado nas 12 ações. Todas com o pé em y=228 e altura de guarda 199-201,
  menos as poses naturalmente baixas. O salto sobe 53px, o uppercut 16px.
- Caixas remedidas depois da escala: light-punch (quadros 2-3), heavy-kick
  (3-5), special (4-6), e as duas guard boxes. Conferidas desenhadas por cima
  dos quadros ativos.
- **Regra da Régua do Idle** virou teste: toda ação pisa na linha do idle, e
  quem sai do chão pode subir mas não afunda. Os três lutadores de amostra
  já passavam; o Urubu não.
**Verificado:** `npm run check` verde (typecheck, 44 testes, build).
**Academia: ainda não.** Continua pendente a conferência visual.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** as 12 sheets foram reescritas em
escala nova. Nada apagado.
**Aprovado explicitamente:** nada.
**Atrito:** ele viu a distorção antes de mim. Eu tinha conferido sheet por
sheet, mas sempre uma de cada vez, nunca uma ao lado da outra na mesma
régua.
**Em aberto:** conferir na Academia. O `knockdown` e o `special` são os que
mais mudaram de posição.

## 2026-09-23: a Regra do Eixo, e o Urubu para de escorregar

**Marco:** Marco 2, em andamento.
**Pedido:** usar os movimentos do Jiu-Jitsu Fighter, Green Boxer e Red
Brawler como referência máxima; o Urubu cresce, diminui e sai do eixo.
**Feito:**
- Medido quadro a quadro nos quatro lutadores (tamanho pela raiz da área,
  tronco pela faixa entre 15% e 60% da altura, pé). O chão já estava certo.
  Os defeitos eram dentro de cada sheet: tronco pulando até 40 px entre
  quadros vizinhos (os de referência ficam em ~10), heavy-kick terminando
  29 px fora do lugar, e o quadro 0 de block-high, block-low e
  special-charge entre 0,78 e 0,89 do idle (o `--fator` à mão da sessão
  passada ficou curto). Nos três do Chong-U o quadro 0 de toda ação é o idle.
- Comando novo: `npm run sprite -- firmar <slug> <acao>`. Quadro 0 vai para
  a altura do idle; os outros ficam na faixa 0,94-1,06 de tamanho,
  escalados em torno do pé; o tronco volta para ±6 px do eixo (±20 no meio
  de golpe); nada afunda no chão; attack e guard boxes acompanham.
- Aplicado nas 12 ações do Urubu `frente`. Conferido em prancha com o idle
  de fantasma e na Academia (playwright, 13 ações quadro a quadro, sem erro
  no console): tamanho e eixo estáveis, caixas de soco e chute no lugar.
**Verificado:** `npm run check` verde (typecheck, 44 testes, build).
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** as 12 sheets reescritas de novo.
**Aprovado explicitamente:** nada.
**Atrito:** a Régua do Idle da sessão passada acertou a sheet inteira e eu
dei por resolvido sem olhar quadro a quadro contra os de referência.
**Em aberto:** o hit-high tem uma sobra solta no topo do último quadro
(`registrar --limpar` resolve); a Regra do Eixo ainda não é teste, porque o
teste em TS não lê pixel.

## 2026-10-01: controle por câmera, análise a partir do Fight_Detection

**Marco:** Marco 2, em andamento.
**Pedido:** entre Vibeboxing e Fight_Detection, qual era qual e como rodar;
depois, como usar a detecção do Fight_Detection como controle alternativo.
**Feito:**
- Vibeboxing (jogo de socar alvo, MediaPipe Hands) identificado; o João o
  apagou e ficou com o Fight_Detection.
- Lido o pipeline do Fight_Detection: 4 classes (PARADO, ANDANDO, SOCO,
  CHUTE) mais BRIGA, juntas por pessoa.
- Medida a latência da LSTM com as amostras do dataset: 22 quadros até
  virar SOCO e 16 até CHUTE (mediana), ~1 s a 15-20 fps. Lenta demais para
  gatilho de luta.
- Análise em `docs/controle-camera.md`: o motor já aceita uma terceira fonte
  de `FighterInput`; gestos por geometria; recomendação de pose no navegador
  (MediaPipe) em vez da ponte Python.
**Verificado:** `npm run check` (só docs mudaram).
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** Fight_Detection no lugar do Vibeboxing.
**Atrito:** nenhum.
**Em aberto:** decidir caminho A ou B; a pasta `Fight_Detection/` (4,7 GB,
repositório próprio) segue solta dentro deste repo, fora do git.

## 2026-10-01: controle pelo corpo, com o celular como câmera

**Marco:** fora de ordem, por ordem do João (Marco 2 segue em andamento).
**Pedido:** "só faz acontecer um jogo que rode com esses movimentos como
controle", depois de aprovar o celular como câmera via QR code.
**Feito:**
- `controle.html`: o celular abre a câmera, roda o MediaPipe Pose e manda os
  33 pontos do corpo (2D e 3D) por WebSocket.
- Relay dentro do Vite (`src/controle/relay.ts`) e endereço que diz o IP da
  máquina para o QR. `npm run dev:celular` liga HTTPS com certificado próprio.
- `gestos.ts`: calibração de 1 s parado; passo anda, guarda parada defende,
  soco (pose 3D, pega soco de frente), joelho alto chuta, pulo pula, mãos
  pro alto soltam o especial (pose de torcida). 20 testes com corpo sintético.
- Tela "Celular" no menu: QR por jogador, esqueleto ao vivo, comandos acesos.
  Na Luta, o celular soma com o teclado e aparece num painel no canto.
- ADR 0004, tabela de gestos no GDD, `Fight_Detection/` no `.gitignore`.
**Verificado:** `npm run check` verde (typecheck, 64 testes, build).
De ponta a ponta com Playwright: "celular" com câmera falsa tocando um vídeo
livre de treino de boxe (Wikimedia, CC BY-SA) conecta, calibra e acende a
guarda em 78 de 80 leituras; celular simulado na Luta fez o Urubu andar de
x=246 a x=643, dar 3 socos e 1 chute (animação no mesmo milissegundo do
gesto) e tirar 21% da vida da CPU.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** celular como câmera, construir antes da v1.
**Atrito:** três limites caíram no primeiro contato com dado real: a guarda
exigia os dois punhos visíveis (na guarda um esconde o outro), a guarda
travava o passo (bloquear no motor para o lutador) e andar para perto da
câmera virava pulo. Corrigidos com teste para cada um.
**Em aberto:** teste com celular e gente de verdade; headless rodou a 5 fps
sem GPU, o celular deve dar mais e não foi medido; Safari do iPhone com
certificado próprio pode recusar o WebSocket; Wi-Fi da PUC pode isolar os
aparelhos (plano: PC no roteador do celular).

## 2026-10-01: o celular passa pela internet (Supabase), rumo à Vercel

**Marco:** fora de ordem, controle pelo corpo (Marco 2 segue em andamento).
**Pedido:** "sobe isso no vercel, essa versão de ficar acessando pelo npm run
dev tá muito instável (pelo menos para o celular)"; depois, "consegue fazer
isso do supabase então? e comite tudo".
**Feito:**
- Diagnóstico: o relay da ADR 0004 vive dentro do Vite; num build estático
  na Vercel o celular não acharia o jogo.
- `src/controle/canal.ts`: o cano entre celular e jogo, com dois jeitos e as
  mesmas mensagens. Com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no
  build, vai pelo Supabase Realtime (`canalSupabase.ts`, carregado só nesse
  caso); sem elas, segue o relay do Vite.
- Sala de 6 letras guardada no navegador do PC, no QR code; um canal por
  jogador; presença diz quem está na sala; vale o celular que entrou por
  último; pose só sai com o jogo na sala, no máximo 20 por segundo (cota de
  100 eventos/s do plano gratuito).
- ADR 0005, `.env.example` com as duas variáveis, `@supabase/supabase-js`
  2.117.2 fixado.
- Junto, a pedido dele ("comite tudo"), o que estava solto desde 23/09: o
  `firmar` refeito para encaixar cada quadro no idle por sobreposição, as
  sheets do Urubu nesse estado, e as `-v2` de block-high, hit-high e
  light-punch que apareceram na pasta e que o JSON já usa (as `-v2` do andar
  existem mas não estão ligadas). Não conferi esse lote de sprites.
**Verificado:** `npm run check` verde (typecheck, 73 testes, build). Relay
local de ponta a ponta com Playwright: jogo entra no relay, celular falso
aparece como P1, o leitor responde, a saída é percebida.
**Supabase: não testado de ponta a ponta.** Falta o projeto: o CLI do
Supabase não está logado nesta máquina.
**Vercel: não publicado.** A CLI desta máquina está na conta da Icons4u, que
o contrato proíbe; falta a conta pessoal.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** Supabase como caminho do celular.
**Atrito:** o repositório no GitHub está público, contra a ADR 0003; avisado,
não mexi.
**Em aberto:** projeto no Supabase (URL e chave anon no `.env` e na Vercel),
teste com celular de verdade, deploy pela conta pessoal, repositório privado.


## 2026-10-09: sprites completas do Almirante a partir do Green Boxer

**Marco:** 2, arte dos mascotes, segue em andamento.
**Pedido:** todos os movimentos do Almirante a partir das sprites do Green
Boxer, lembrando o processo do Urubu e as correções apontadas pelo João.
**Feito:**
- Leitura das lições de escala, eixo, primeiro quadro, sobreposição e sobras.
- 14 sheets na skin `base`, 102 quadros, retrato e âncora. Green Boxer como
  movimento; referência existente do Almirante como identidade; chute
  complementar a partir do Red Brawler. Imagem gerada pela ferramenta integrada.
- Especial e preparação com arquivos próprios. Removidos corvo, cruzes,
  símbolos e armas da referência. Modelo original preservado na referência.
- Primeiro quadro idêntico ao idle; chão comum e alinhamento por deslocamento,
  sem escalar os quadros individualmente. Salto conserva afastamento do chão.
- Defesa alta refeita: a primeira só variava a guarda e reduzia um quadro.
- Importador corrigido para conservar a bota da queda: x negativo fazia a
  figura deitada sair da célula. Caso sintético confirmou todos os pixels.
- JSON na Academia, com janelas ativas conforme os quadros estendidos;
  teste cobre as 14 ações e exige sheets próprias, sem reutilizar placeholders.
- Prévia GIF das 14 ações, prancha PNG e prompts em `docs/almirante-sprites.md`.
**Verificado:** 102 quadros na prancha; sequência e células vazias;
transparência, primeiro quadro e ausência de sobras por máquina. No navegador,
Almirante na Academia, quadro ativo do chute (6/10) e especial (3/8) com boxes.
`npm run check`: typecheck, 80 testes e build aprovados.
**Créditos gastos:** 0 do Spriterrific.
**Refeito ou apagado a pedido dele:** nada nesta sessão; consideradas as
correções antigas do Urubu. Defesa alta refeita por falha identificada na QA.
**Aprovado explicitamente:** nada.
**Atrito:** linhas de grade no primeiro idle, defesa alta sem pose de bloqueio,
bota cortada pelo alinhador. Corrigidos; lições registradas.
**Em aberto:** revisar todas as ações no ritmo do jogo e liberar o Almirante
na seleção depois da revisão completa na Academia. A ultimate da caravela,
o agarrão e as falas permanecem no planejamento.

## 2026-10-09: Almirante liberado como personagem jogável

**Marco:** 2, segue em andamento.
**Pedido:** adicionar o Almirante como personagem jogável; João não entendeu
por que o mascote completo aparecia apenas na Academia.
**Feito:** `selecionavel: true` no JSON; teste exige que o Almirante seja
selecionável. Documentação atualizada e restrição anterior retirada.
**Verificado:** `npm run check` aprovado (typecheck, 80 testes, build).
No navegador, Almirante aparece na seleção e inicia a luta como P1 contra
Jiu-Jitsu Fighter controlado pela CPU, com retrato, nome e sprites corretos.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** restrição à Academia, que impedia jogar.
**Aprovado explicitamente:** nada.
**Atrito:** tratei a revisão visual como bloqueio da entrega jogável. Lição
registrada para não repetir essa etapa de aprovação desnecessária.
**Em aberto:** nada para liberar o personagem; restante do Marco 2 permanece.

## 2026-10-14: Seleção no modelo Mortal Kombat

**Marco:** 2, segue em andamento.
**Pedido:** a seleção com cartas grandes lado a lado estava feia; ele quer o
elenco inteiro numa tela, em retângulos pequenos, como no Mortal Kombat. E
perguntou por que só alguns golpes funcionam na luta, se a Academia mostra mais.
**Feito:** `CharacterSelectScene` refeita: grade de quadrados de 116 px no
centro (até 6 por linha, linha incompleta centralizada), retrato recortado
pelo topo, P1 e P2 animados em guarda nas laterais com o nome embaixo,
cenário escolhido escurecido ao fundo. Navegação em 2D (WASD e setas), cursor
pula o quadro do outro jogador, trava com borda dourada e o lutador da
lateral solta um soco. Na pergunta dos golpes: o motor tem só três botões de
ataque; o `heavy-punch` do Almirante e do Saci existe mas nunca é chamado,
porque o pesado prefere o `heavy-kick`.
**Verificado:** `npm run check` aprovado (typecheck, 89 testes, build). No
navegador: grade com os 5 lutadores, D leva o P1 do Urubu ao Saci pulando o
Almirante do P2, trava toca `saci-light-punch`, Enter do P2 abre a luta
Saci contra Jiu-Jitsu Fighter; em 1vCPU a CPU sorteia outro e a luta começa.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** a seleção de cartas grandes do Chong-U.
**Aprovado explicitamente:** nada.
**Atrito:** nenhum.
**Em aberto:** quarto botão de ataque para o `heavy-punch`, se ele quiser;
o resto das telas (menu, modo, cenário) segue no visual herdado.

## 2026-10-23: Zip do amigo conferido

**Marco:** 2, segue em andamento.
**Pedido:** ver o que dá para aproveitar do `referencia/luta-de-mascotes-main.zip`,
que seria um lutador novo feito por um amigo.
**Feito:** extraído fora do repo e comparado arquivo a arquivo. O comentário
do zip é `81ea894` e os 223 arquivos são idênticos ao nosso HEAD: é o
"Download ZIP" do GitHub deste repositório, sem lutador novo.
**Verificado:** nenhum arquivo só no zip; nenhum difere do HEAD.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** nada.
**Atrito:** nenhum.
**Em aberto:** pedir ao amigo o material de verdade. O repositório está
**público** com assets `_amostra`, contra o NUNCA do contrato; decidir se
volta a privado (os colaboradores continuam com acesso).
Atualização no mesmo dia: por ordem dele, repositório voltou a **privado**
(`gh repo view` confirma `PRIVATE`). Ele vai olhar o zip pessoalmente.

## 2026-10-26: Guia de sprites para os integrantes do grupo

**Marco:** 2, produção de arte.
**Pedido:** reunir instruções completas para os amigos enviarem aos seus GPTs,
da conexão com Git às referências, parâmetros, geração e entrega de sprites.
**Feito:** criado `docs/guia-sprites-para-amigos.md`, com prompt pronto,
acesso ao repositório, referências disponíveis no clone, descrição travada,
idle como régua, parâmetros de sheets, comandos reais do importador,
revisão na Academia e entrega por PR ou pacote somente de arte.
Destacado que `referencia/` não vem no clone e que Download ZIP do GitHub
não inclui imagens produzidas apenas na máquina do colaborador.
**Verificado:** comandos confrontados com `scripts/sprite.py`; `npm run check`
aprovado: typecheck, 8 arquivos de teste, 94 testes e build. Build com aviso
de tamanho de chunk. Verificação executada sobre a árvore local existente,
que já tinha alterações de código e sprites de outra tarefa.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** nada.
**Atrito:** nenhum.
**Em aberto:** revisão visual dos futuros mascotes cabe à etapa de produção;
nesta sessão somente documentação foi criada, sem mudança no jogo.

## 2026-10-26: Entrega de sprites pelo Google Drive

**Marco:** 2, produção de arte.
**Pedido:** orientar os amigos a conectar também o Google Drive para enviar
os sprites ao João.
**Feito:** guia e prompt inicial atualizados com conexão da conta Google,
pasta por mascote e versão, upload pelo conector quando disponível ou manual,
compartilhamento com a conta confirmada de João e conferência da entrega.
Drive definido como canal recomendado para arte; integração segue por PR.
**Verificado:** instruções consultadas na documentação oficial da OpenAI e
Google; diff de documentação revisado. Código não alterado. Check da sessão
anterior aprovado com 94 testes, sem repetição por alteração apenas textual.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** orientação de envio prioriza Drive.
**Aprovado explicitamente:** nada.
**Atrito:** nenhum.
**Em aberto:** cada integrante conecta sua conta e usa a pasta/e-mail que
João fornecer; nenhuma pasta foi criada nem compartilhada nesta sessão.

## 2026-10-26: Fluxo de sprites conduzido pelo GPT

**Marco:** 2, produção de arte.
**Pedido:** detalhar conexões e etapas executadas pelo GPT, deixando ao
integrante somente autenticação e permissões.
**Feito:** prompt reescrito e sequência operacional em 11 etapas incluída
no guia, da descoberta de ferramentas à conferência do Drive. Definidas
responsabilidades, evidências de conclusão, retomada após autorização,
leitura versus escrita, obtenção das referências, geração e revisão pelo
agente. Procedimentos manuais classificados como alternativas excepcionais.
**Verificado:** documentação oficial de conexões relida; ferramentas
expostas de Drive consultadas para confirmar capacidades e restrições de
upload. Diff textual revisado; nenhum código de jogo alterado. Check da
sessão anterior aprovado com 94 testes; sem repetição por mudança textual.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** roteiro que transferia tarefas de
baixar, renomear, gerar em outro chat e fazer upload para o integrante.
**Aprovado explicitamente:** nada.
**Atrito:** o fluxo anterior ainda dependia de operação manual.
**Em aberto:** fluxo depende de sessão com geração, processamento e escrita
no Drive; consentimento não fornece ferramentas inexistentes. Pasta do
grupo ou conta Google confirmada do destinatário ainda deve ser identificada.

## 2026-10-27: Cartola e Cachorro entram na seleção

**Marco:** 2, produção de arte.
**Pedido:** incluir nos lutadores os pacotes de arte do Cartola (v02) e do
Cachorro, enviados como ZIP.
**Feito:** sheets em `public/assets/lutadores/<slug>/base/`, JSON novo para
cada um, registro na seleção depois do Almirante. Quadros e caixa medidos
pelo `sprite registrar`; hitbox dos socos medida pelo braço que passa da
borda do idle; guard box pela silhueta da defesa. Especial provisório no
molde do Green Boxer (agachar carrega, soco forte em três golpes).
Ajustes de arte: no Cartola, `walk-backward` e `knockdown` vieram como tira
bruta de 8 quadros fora da grade (2172x724) e foram postos em células de 256
na escala do idle; o `hit-high` provisório afundava 11 px e foi firmado no
chão. No Cachorro, `crouch` e `block-low` vieram menores que o idle e foram
reescalados (fator 1,379); os dois terminavam em pé, então a animação para
no quadro mais baixo (4 de 5).
**Verificado:** `npm run check` com 6 arquivos e 92 testes aprovados, build
ok. Jogo aberto no navegador: os dois na grade da seleção, Cartola contra
Almirante e Cachorro contra Almirante andando, socando e tirando vida, sem
erro de jogo no console.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** nada.
**Atrito:** o LEIA-ME do Cartola descreve 13 sheets de 256 de altura, mas
duas vieram em outro formato; o pacote do Cachorro não tem descrição de
cada ação.
**Em aberto:** Academia quadro a quadro dos dois; ficha completa no GDD
(clube, arquétipo e falas do Cachorro); redesenho do soco forte e da reação
do Cartola; especial e chute próprios.

## 2026-10-27: Pull do Cartola e do Cachorro

**Marco:** 2, segue em andamento.
**Pedido:** puxar os personagens novos que ele subiu e saber se o jogo está
na Vercel e como jogar.
**Feito:** pull de `f1f42bf`. O `index.ts` tinha mudança local (Saci e
mecânica de golpes, ainda não commitados) e remota (Cartola e Cachorro);
juntei as duas listas. Trabalho local preservado.
**Verificado:** `npm run check` aprovado (typecheck, 106 testes, build).
Vercel: nenhum projeto do jogo na conta; nunca foi publicado.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** nada.
**Atrito:** nenhum.
**Em aberto:** publicar na Vercel esbarra no NUNCA do contrato enquanto
Red Brawler e Jiu-Jitsu Fighter (`_amostra`) estiverem na seleção.

## 2026-10-27: Agachar, pulo e golpe no ar

**Marco:** 2, segue em andamento.
**Pedido:** agachar como esquiva; pulo parecia dar um segundo pulo; não dava
para bater no ar; bloqueio do Urubu e das skins dele solta a guarda (o Saci
mantém as mãos no rosto).
**Feito:** agachar religado na luta (estava forçado a falso). Regra da
esquiva em `moveMechanics.ts`: soco alto de quem está no chão passa por cima
de quem está agachado; chute forte, golpe no ar e especial acertam. Pulo em
três fases para todos: preparação no chão (quadros 1 e 2, 0,1 s), voo com os
quadros 3 a 7 seguindo o arco da física, aterrissagem agachada (0,1 s). O
segundo pulo era a sheet tocando a preparação com o corpo já subindo. Um
golpe por pulo no ar (fraco = soco, forte = chute). Quem apanha no ar cai
em vez de flutuar no hitstun. Saci passa a usar `moves.jump`
(`takeoff`, `airEnd`, `land`) no lugar de `jumpTakeoffFrame`. Agachar do
Urubu, Cartola e Cachorro de 10 para 20 fps, para a esquiva aparecer.
**Verificado:** `npm run check` com 8 arquivos e 130 testes aprovados,
build ok. Testes novos cobrem preparação no chão, quadros de voo sem voltar,
golpe aéreo, agachar e queda após golpe. Não abri o navegador.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** o conserto do bloqueio (último quadro
virando cópia da guarda) foi desfeito quando ele disse que o Codex cuida das
animações. Sheets do Cartola, Cachorro e Galo reconstruídas pela mesma conta
do `skins_urubu.py`, idênticas nos quadros conferíveis.
**Aprovado explicitamente:** nada.
**Atrito:** o repositório tem trabalho do Codex não commitado nos mesmos
arquivos (`fighter.ts`, `moveMechanics.ts`, JSONs, Galo). Não commitei para
não levar trabalho alheio pela metade.
**Em aberto:** para o Codex, o bloqueio alto no modelo Urubu: o quadro 3
baixa os braços e o motor congela nele. Golpe aéreo usa o soco e o chute de
chão; sheet própria de pulo com golpe fica para depois. Testar no navegador.

## 2026-10-27: Catálogo de golpes, botões e modo dev na Academia

**Marco:** 2, segue em andamento.
**Pedido:** soco rápido, Forte que quebra a defesa baixa, tiro e caravela
puláveis (só o tiro esquivável agachado), voadora no ar que quebra a defesa
alta, chute baixo que interrompe o Forte; ver na Academia o que cada mascote
tem e o que falta; remapear botões por lado; modo dev com dano, vida e carga
do especial. Divisão nova: Codex faz arte, Claude faz mecânica.
**Feito:** catálogo em `src/game/golpes.ts` e no GDD. Regras puras em
`moveMechanics.ts` (guarda por golpe, esquiva, pulo sobre projétil,
armadura do Forte contra soco rápido). Soco rápido emenda outro depois do
quadro ativo. Voadora mergulha em diagonal e sai já no quadro do chute;
golpe apertado na preparação do pulo sai na decolagem. Chute baixo tem botão
(B / K), perfil de dano e fica inerte até chegar `low-kick.png`. Academia:
painel HTML com abas Golpes (tabela mascote × golpe), Botões (P1 e P2,
salvos no navegador, tecla repetida troca de lugar) e Ajustes (vida, danos e
carga do especial por mascote, por cima do JSON). Barra do especial enche
sozinha em 45 s. Vite deixa de recarregar a página quando o Codex grava em
`output/`, que entrou no `.gitignore` (169 MB de material bruto).
**Verificado:** `npm run check` com 11 arquivos e 144 testes, build ok. No
Chrome: tabela e remapeamento na Academia, aba Ajustes gravando, luta
Urubu × Almirante com voadora avançando 71 px, guarda baixa reconhecida e
socos tirando vida, sem erro de página. O teste no navegador achou um erro
real (painel de debug sem os campos novos) e um furo de jogo (golpe apertado
na preparação do pulo se perdia); os dois corrigidos.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** nada.
**Atrito:** "socos rápidos (vasco tem)" foi lido como o jab duplo do
Almirante; para os outros virou soco que emenda. Conferir com o João.
**Em aberto:** mecânica dos especiais que o Codex já desenhou (meteoro do
Urubu, bicada do Galo, patada e mordida do Bira); sheets `low-kick`,
`jump-kick` e `jump-punch` para pedir ao Codex.

## 2026-10-27: Comandos de dois botões e especiais do Codex no jogo

**Marco:** 2, segue em andamento.
**Pedido:** Chute no botão do Forte; Baixo+Soco = soco forte; chute no ar
= voadora, soco no ar = soco no ar; incluir as animações novas do Codex.
**Feito:** motor guarda qual golpe foi pedido (vários dividem a mesma
sheet). Baixo+Chute virou o chute baixo e o botão separado saiu. Perfil de
dano novo do chute básico (também a voadora). Especiais de avanço por tipo
no JSON: `run` (Bira), `hop` (Galo), `meteor` (Urubu), com esquiva por
dado (`pulo`, `agachar`, `pulo-recuando`) e efeitos (`moves.effects`):
térmica, rastro, garras, mandíbula. Patada do Bira no soco forte. Dano dos
três especiais 18.
**Verificado:** `npm run check` com 11 arquivos e 149 testes, build ok.
Chrome: meteoro sobe, mergulha e acerta o Bira; Bira corre e morde o Galo;
Galo voa baixo e bica o Urubu; sem erro de página.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** a divisão Codex arte, Claude mecânica.
**Atrito:** Régua do Idle barrou dois quadros do meteoro abaixo do chão;
alinhados (3 e 13 px) e registrados em `docs/pedidos-codex.md`.
**Em aberto:** conferir a esquiva de cada especial jogando de verdade;
sheets `heavy-punch` (Urubu, Cartola, Galo), `low-kick`, `jump-kick`,
`jump-punch`.

## 2026-10-27: Lutadores e variantes guardados em arquivo/

**Marco:** 2, segue em andamento.
**Pedido:** guardar os lutadores que não usamos: as três amostras do
Chong-U e as versões de que ele não gostou.
**Feito:** `arquivo/lutadores/` com LEIA-ME de como trazer de volta: Red
Brawler, Green Boxer e Jiu-Jitsu Fighter (JSON e sprites), Urubu de perfil
(skin `costas`), Arte anterior do Cartola e do Bira. Elenco: Urubu,
Almirante, Saci, Cartola, Bira e Galo, cada um com uma versão. Teste da
Regra da Skin passou a usar um mascote de teste. Contrato atualizado.
**Verificado:** `npm run check` aprovado (resultado no commit).
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** primeiro tirei Cartola e Bira
inteiros; ele reclamou que a versão boa tinha ido junto. Os dois voltaram
idênticos e só a Arte anterior foi guardada. Lição registrada.
**Aprovado explicitamente:** nada.
**Atrito:** "cartola, bira e urubu v1" lido como mascotes inteiros.
**Em aberto:** cenário de amostra do Chong-U ainda em uso.

## 2026-10-27: Jab duplo, cruzado, tiro no chute e bote do Bira

**Marco:** 2, segue em andamento.
**Pedido:** ligar a revisão de golpes v2 do Codex; no meio, o João decidiu
o Almirante: tiro no Chute, chute normal no Baixo + Chute, cruzado no
Baixo + Soco.
**Feito:** soco rápido vira dois jabs (dois acertos, quadros 1 e 3) para
Urubu, Galo, Cartola, Bira e Saci; Almirante mantém o dele. Cruzado
`heavy-cross-v2` no soco forte de todos menos o Bira (patada). Motor:
projétil sai de qualquer golpe que o JSON indicar (`moves.kick` no
Almirante, ação `shot`). Especial `run` ganhou sheet de aproximação
(`approachAction`: galope) e bote com salto real (`pounceFrames`).
**Verificado:** `npm run check` com 113 testes, build ok. Chrome: jab duplo
tira 14 em dois acertos; tiro sai no quadro 3 e tira 10; Bira galopa, dá o
bote e tira 18; sem erro de página.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** tiro do Almirante: primeiro "chute
baixo", depois "chute"; ficou no Chute.
**Aprovado explicitamente:** nada.
**Atrito:** nenhum.
**Em aberto:** `low-kick`, `jump-kick`, `jump-punch` para os outros cinco.

## 2026-10-27: Golpes próprios v3 ligados

**Marco:** 2, segue em andamento.
**Pedido:** colocar tudo o que o Codex entregou na v3.
**Feito:** Cartola com bengalada (soco forte), varredura (chute baixo) e Pó
de Arroz (nuvem que atordoa 1,5 s, guarda evita, sem sheet de preparação);
Urubu com bicada que puxa no Chute; Saci arremessa o cachimbo em parábola no
Chute; Galo com chute giratório e rastro de garras; chutes antigos viraram o
chute baixo. Motor: projétil com efeito próprio, arco e gravidade, alcance
curto e atordoamento; efeito em qualquer golpe; especial sem preparação.
Caixas de golpe medidas na ponta real de cada ataque.
**Verificado:** `npm run check` com 115 testes, build ok. Chrome: Pó de
Arroz atordoa, cachimbo cai em arco e acerta, giro do Galo, bicada (9) e
bengalada (12) acertam; sem erro de página.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** nada.
**Atrito:** no Chrome sem janela o jogo pula quadros e o teste perde janelas
de golpe curtas; conferir quadro a quadro antes de concluir que errou.
**Em aberto:** `low-kick` do Bira; `jump-kick` e `jump-punch` dos seis;
animação de atordoado.

## 2026-10-27: Um soco com cada mão e Saci original

**Marco:** 2, segue em andamento.
**Pedido:** continuar o que o Codex deixou nos socos (`docs/socos-alternados-v4.md`).
**Feito:** leve de Urubu, Bira, Cartola e Galo aponta para
`light-alternating-v4.png` (um soco com cada mão, giro de tronco no
segundo). Saci volta a `light-punch.png` e `heavy-punch.png` com as entradas
de antes da v2 (12 FPS, acerto no quadro 3, caixas originais). Aliases
`light-double-jab-v2.png` e `saci/heavy-cross-v2.png` saíram. Caixas
conferidas pela ponta do punho: os dois braços dos quatro cabem na caixa
atual. GDD atualizado.
**Verificado:** `npm run check` com 115 testes (inclui existência dos
arquivos apontados), build ok. Não abri no navegador.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** jab duplo v2 repetia o mesmo braço;
Saci não devia ter sido padronizado.
**Aprovado explicitamente:** nada.
**Atrito:** nenhum.
**Em aberto:** conferir os leves na Academia; `low-kick` do Bira;
`jump-kick` e `jump-punch` dos seis; animação de atordoado.

## 2026-10-27: Varredura do Chong-U e rooftop desativado

**Marco:** 2, segue em andamento.
**Pedido:** varrer tudo o que ainda é do Chong-U para adaptar e publicar na
Vercel; desativar o rooftop, porque já temos o Estádio.
**Feito:** `docs/varredura-chong-u.md`: arte e som dele visíveis (HUD,
cartões de modo, som de menu, favicon), assets que vão no build sem uso
(atlas quest, tiles, levels, index.json), código herdado (37 arquivos
idênticos) e o que a Vercel precisa. Rooftops fora de `STAGE_DEFINITIONS`,
Estádio vira padrão da Luta e do painel de fundo; PNGs em
`arquivo/cenarios/rooftop/` com LEIA-ME.
**Verificado:** `npm run check` com 115 testes, build ok e sem rooftop em
`dist` (só no `index.json` morto). Extensão do Chrome desconectada: não vi
a tela de cenário rodando.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** rooftop desativado.
**Aprovado explicitamente:** nada.
**Atrito:** nenhum.
**Em aberto:** licença do código do Chong-U antes do link público (pedir
autorização); trocar HUD, cartões, som e favicon; podar o starter de RPG.

## 2026-10-28: Animações legíveis v5 ligadas

**Marco:** 2, segue em andamento.
**Pedido:** ligar as artes novas do Codex (`docs/animacoes-legiveis-v5.md`).
**Feito:** Cartola com bengalada e varredura de 16 quadros (janelas 9-10 e
9-11); Galo com giro completo de 20 quadros (janela 10-13, garras no quadro
10, no pé); Bira ganha o carrinho no chute baixo (14 quadros, janela 4-8);
cortes de Bira e Galo menores e translúcidos; Saci com jab rápido a 24 FPS
(janela 2-3); Urubu com contorno limpo. Motor: `travel` na ação (o lutador
desliza nos quadros indicados e para antes do adversário) e `effectAt` no
golpe (onde o efeito nasce), ambos como dado no JSON. `saci/light-punch.png`
restaurado ao original; aliases antigos removidos.
**Verificado:** `npm run check` com 116 testes (novo: deslizar só nos
quadros indicados), Régua do Idle passa nas sheets novas, build ok.
Extensão do Chrome desconectada: não vi os golpes rodando.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** jab do Saci trocado, depois de ter
sido preservado na véspera.
**Aprovado explicitamente:** nada.
**Atrito:** o Codex sobrescreveu a sheet original do Saci.
**Em aberto:** conferir na Academia e numa luta: alcance das bengaladas,
garras no pé do Galo, distância do carrinho; `jump-kick` e `jump-punch` dos
seis; animação de atordoado.

## 2026-10-28: Revisão de coerência v6 do Codex

**Marco:** 2, segue em andamento.
**Pedido:** implementar as artes novas do Codex.
**Feito:** o Codex aplicou a v6 direto em `public/` (`docs/coerencia-animacoes-v6.md`):
jab do Saci redesenhado sempre para a frente; Cartola pesado com os quadros 8,
12 e 13 trocados; Cartola baixo com a mão no pomo nos quadros 7 a 13. Mesmas
contagens, FPS e janelas, então nenhum JSON mudou. Acentos que o Codex gravou
como `?` no AGENTS.md e no guia, restaurados.
**Verificado:** `npm run check` com 116 testes, Régua do Idle passa nas três
sheets, build ok. Folhas de contato conferidas. Não vi rodando no navegador.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** jab do Saci v5 (soco para trás).
**Aprovado explicitamente:** nada.
**Atrito:** o Codex ainda estava gravando quando o pedido chegou; esperei
ele terminar.
**Em aberto:** relatar ao Codex, sem editar: no Cartola baixo, o quadro 5
aparece de costas entre dois de frente; nas duas bengaladas a bengala some
de uma vez no fim (pesado 12 para 13, baixo 14 para 15). Conferir na luta.

## 2026-10-28: Vida 230, round de 99 s, quebra de guarda e cachimbo do Saci

**Marco:** 2, segue em andamento.
**Pedido:** 230 de vida para todos; guarda em pé quebrada só por chute baixo
e soco forte, guarda baixa só pela voadora; quebra em pé atordoa 0,3 s e
baixa 0,6 s; round de 99 s; cachimbo do Saci alto o bastante para desviar
agachando.
**Feito:** `maxHealth` padrão 230 (nenhum JSON sobrescrevia); `ROUND_SECONDS`
99. Tabela `GUARDS` refeita: guarda baixa agora segura também soco forte,
tiro e caravela. `guardBreakStunMs` troca o atordoamento do golpe por 0,3 s
ou 0,6 s quando a guarda quebra; especial imbloqueável fica de fora. Cachimbo:
agachar desvia (regra, como o Tiro, porque a caixa de quem agacha não encolhe)
e o arco ficou longo (`launchVy` 320, `gravity` 600): fica acima da cabeça
agachada até 546 px do Saci, antes 410, e cai a 714 px, antes 516. Textos
da Academia e GDD atualizados.
**Verificado:** `npm run check` com 117 testes (regras de guarda, atordoamento
da quebra e esquiva do cachimbo), build ok. Não vi rodando no navegador.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** regras antigas de guarda (soco forte
quebrava a baixa; chute baixo e voadora quebravam a alta).
**Aprovado explicitamente:** nada.
**Atrito:** o Codex gravou na pasta durante a sessão; commit só com os
arquivos desta mudança.
**Em aberto:** testar numa luta o tempo da quebra e o cachimbo; ajuste de
Vida salvo na aba Ajustes da Academia ainda vence o padrão de 230.

## 2026-10-28: Voadoras v7 ligadas

**Marco:** 2, segue em andamento.
**Pedido:** aplicar as artes novas do Codex (`docs/voadoras-e-iluminacao-v7.md`).
**Feito:** ação `jump-kick` registrada nos seis lutadores (Urubu, Almirante,
Saci, Cartola, Bira, Galo): 6 quadros, 14 FPS, sem loop; caixa visual pela
união dos quadros; ataque nos quadros 0 a 3, só na região do pé de ataque
(medida na sheet, 84 a 104 px de largura), não na silhueta inteira. A voadora
deixa de usar o chute terrestre como quebra-galho e começa no quadro 0. Leve
do Urubu corrigido pelo Codex (paleta do idle) entra no commit. Testes que
esperavam o quebra-galho atualizados; `jump-kick` entra na lista de ações
aéreas da Régua do Idle. Acentos gravados como `?` nos docs do Codex,
restaurados.
**Verificado:** `npm run check` com 117 testes, build ok. No navegador (dev,
Chromium automatizado): as seis animações carregam com 6 quadros a 14 FPS,
sem erro de console nem 404; quadros desenhados lado a lado conferem.
Não joguei uma luta com a voadora.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** nada.
**Atrito:** nenhum.
**Em aberto:** testar a voadora numa luta (alcance do pé, quebra da guarda
baixa com 0,6 s); voadora do Bahia (Codex não entregou); `jump-punch` dos
seis; `low-kick` do Bira.

## 2026-10-28: Fim do spam de soco rápido

**Marco:** 2, segue em andamento.
**Pedido:** o meta era spamar soco rápido; golpes longos (bengala, chutes)
não davam vantagem nenhuma. Implementar as correções propostas e fazer o
alcance valer.
**Feito:** diagnóstico medido: soco emendava sem limite com intervalo de
143 ms e atordoamento de 280 ms (combo infinito, 3 ms de brecha na guarda);
P1 sempre vencia golpes simultâneos; caixa de apanhar era a soma dos quadros
(Cartola apanhava na ponta da bengala o tempo todo); caixa do soco passava
10 a 16 px do punho. Mudanças: emenda só com contato; atordoamento do soco
200 ms; dano 4/18/14/10 (Almirante 5/16/15); guarda empurra 60%; atacante
recua na parede; troca em golpe simultâneo; Regra do Corpo; caixas de
acerto até a ponta do desenho; `timing` por quadro no JSON (bengalada,
varredura, giro do Galo).
**Verificado:** `npm run check` com 121 testes (tempo por quadro, emenda só
com contato, recuo, Regra do Corpo), build ok. No navegador: bengalada
acerta aos 369 ms (antes 750) e dura 1,05 s; giro do Galo acerta aos 406 ms.
Não joguei uma luta.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** emenda livre do soco rápido e caixas
de apanhar pela soma dos quadros.
**Aprovado explicitamente:** nada.
**Atrito:** nenhum.
**Em aberto:** jogar e ajustar números; ajustes salvos na aba Ajustes da
Academia vencem os padrões novos; chutes curtos no desenho (pedido ao Codex).

## 2026-10-28: Conferência da varredura do Chong-U

**Marco:** 2, segue em andamento.
**Pedido:** mapear tudo o que ainda é do criador original e impede publicar
na Vercel.
**Feito:** conferi `docs/varredura-chong-u.md` (27/10) contra o código de
hoje: assets e pastas batem; comparação arquivo a arquivo com `6f3a57c`
confirma 37 arquivos de `src/` idênticos ao original. Completei a lista de
textos herdados em inglês (menu, splash, ajustes).
**Verificado:** `npm run check` (só documentação mudou).
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** nada.
**Atrito:** nenhum.
**Em aberto:** mensagem ao Chong-U pedindo autorização; poda da seção 2;
troca da seção 1 (HUD é o item grande).

## 2026-10-29: Tontura do meteoro e nuvem que envolve

**Marco:** 2, segue em andamento.
**Pedido:** o meteoro do Urubu atordoa como o Pó de Arroz; a nuvem do Pó de
Arroz passa pela frente do oponente em vez de sumir no acerto; ligar as
animações de tontura que o Codex entregou (v8).
**Feito:** ação `stunned` (4 quadros, 6 FPS, loop) nos seis JSONs, com a
caixa só do corpo (símbolos fora); motor toca o loop de tontura quando o
atordoamento vem de `stunMs` e mantém a reação curta no golpe comum; meteoro
com `stunMs` 1500; nuvem com `persistOnHit`, desenhada acima dos dois
lutadores, e `rangeAfterHit` 220 px (campo novo: depois do acerto a nuvem
segue e os quadros que restam se esticam até ela se desfazer).
**Verificado:** `npm run check` com 123 testes, build ok. No navegador
(Playwright): Urubu tonto sob a nuvem, Cartola tonto depois do meteoro;
atordoamento medido em tempo real, 1,55 s nos dois; nuvem cobre o Urubu
pela frente e se desfaz no centro dele.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nuvem que sumia no acerto.
**Aprovado explicitamente:** nada.
**Atrito:** nenhum.
**Em aberto:** meteoro com 1,5 s de tontura e imbloqueável pode ficar forte
demais (testar em luta); o Urubu aterrissa em cima do alvo e o cobre
durante a tontura; conferir os seis `stunned` na Academia.

## 2026-10-29: Tontura v9 no jogo

**Marco:** 2, segue em andamento.
**Pedido:** implementar as novas animações de tontura (v9 do Codex).
**Feito:** a v9 substituiu os seis `stunned.png` da v8 (rejeitada por perder
identidade e cores). Mesmo formato (4 quadros, 6 FPS, loop); caixas visuais
dos seis JSONs refeitas pelo `output/stun-v9/report.json`, só o corpo, sem
os símbolos.
**Verificado:** `npm run check` com 123 testes, build ok. Prancha de
comparação do Codex conferida (Saci com uma perna só). Na Luta, os seis
tontos lado a lado com o próprio idle: mesma escala, pé na linha do chão,
virados para o oponente.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** tontura v8.
**Aprovado explicitamente:** nada.
**Atrito:** nenhum.
**Em aberto:** força do meteoro com 1,5 s de tontura (testar em luta).

## 2026-10-29: Telas fora da luta viram nossas

**Marco:** 2, segue em andamento.
**Pedido:** reconfigurar o que era estético do Chong-U; o Codex faz a arte
(HUD, faíscas, cartões, logo) e eu mudo o que não depende de arte.
**Feito:** `estilo.ts` com a identidade da Seleção; fundo do estádio e
título amarelo na cena base, usados por abertura, menu, modo, estádio,
ajustes, Academia e Celular; botões e cartões redesenhados; textos em
português; ajustes sem sobreposição; legenda da Luta lida dos controles
salvos (antes ficava errada com tecla remapeada); apito sintetizado no lugar
do mp3; favicon próprio; poda dos arquivos do RPG (1.772 linhas a menos).
**Verificado:** `npm run check` com 124 testes, build ok. Nove telas
fotografadas no navegador; jogo do zero até a luta sem erro de console nem
arquivo faltando.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** visual do template nas telas de menu.
**Aprovado explicitamente:** nada.
**Atrito:** nenhum.
**Em aberto:** ligar as entregas do Codex; trocar o shell de debug por um
nosso (leva junto o resto do código do RPG); autorização do Chong-U.

## 2026-10-29: Identidade de rua do Codex no jogo

**Marco:** 2, segue em andamento.
**Pedido:** aplicar as entregas do Codex e ficar de olho nas próximas.
**Feito:** HUD e faíscas (atlas com os mesmos 22 recortes), cartões de modo
(Urubu contra Galo na quadra de bairro) e logo na abertura e no menu; cores
do `estilo.ts` trocadas do amarelo para o creme com sombra vermelha da logo;
fundo escuro no vão da barra de vida e do retrato (a moldura nova é
transparente ali); letreiros e fim de luta no estilo novo e em português
(VENCE!, REVANCHE, TEMPO ESGOTADO, EMPATE; FIGHT! e K.O. ficam). Vigia de
arquivos ligado nas pastas de entrega do Codex.
**Verificado:** `npm run check` com 124 testes, build ok. Hashes das quatro
saídas do Codex conferidos com o relatório. Nove telas, HUD com vida baixa,
faísca no acerto e tela de vitória fotografados no navegador.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada; desfiz meu próprio erro (cartões
gravados por cima dos finais do Codex).
**Aprovado explicitamente:** nada.
**Atrito:** apliquei rascunho de `output/` enquanto o Codex terminava.
**Em aberto:** shell de debug (código dele); autorização do Chong-U.

## 2026-10-29: Dano, guarda perfeita, dash e criador de personagem

**Marco:** 2, segue em andamento.
**Pedido:** recompensar a defesa bem feita (dash por toque duplo e guarda
perfeita que atordoa), dimensionar o dano, listar animações para o Codex, e
um .md de criador de personagem que pergunta antes de criar e acompanha o
jogo. Ideias para depois: carga diferente por especial e Bahia com o
Super-Homem (roteiro, Marco 4).
**Feito:** escala de dano em fração da vida (rápido 7, chute baixo 14,
chute 18, forte 24, especial 34; meteoro 30, Pó de Arroz 18, Almirante e
Saci proporcionais), cobrada por teste. Guarda perfeita: defesa até 0,15 s
antes de golpe corpo a corpo, atacante tonto 0,4 s sem dano, defensor sem
empurrão, faísca azul maior e clarão; projétil só bloqueia; CPU não faz.
Dash: toque duplo em 0,3 s, 180 px para a frente ou 120 para trás, para no
corpo do oponente, defesa ou golpe cancela; usa o andar até chegar a arte.
Pedido ao Codex: `dash-forward`, `dash-back`, `jump-punch`.
`docs/criador-de-personagem.md` com a Regra do Criador (teste exige que toda
ação, golpe e tipo de especial esteja nele); skill `lutador-novo` começa
pelo questionário e pede a arte ao Codex.
**Verificado:** `npm run check` com 135 testes, build ok. No navegador:
chute sem defesa tira 18; defesa 80 ms antes do acerto deixa o atacante
tonto sem dano; defesa segurada antes é comum. Dash longe avança cerca de
195 px; colado, para no oponente sem trocar de lado.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** desenho da guarda perfeita, dash e escala de dano.
**Atrito:** janela de 0,25 s do toque duplo falhou em navegador lento; foi
para 0,3 s.
**Em aberto:** jogar e calibrar janela e tontura da guarda perfeita; ligar
as sheets de dash quando o Codex entregar; ajustes salvos na aba Ajustes da
Academia vencem os padrões novos de dano.

## 2026-10-29: Dash do Codex, tontura da guarda perfeita, caravela e tornado

**Marco:** 2, segue em andamento.
**Pedido:** guarda perfeita com a tontura (`stunned`) por 0,8 s e só na
guarda que segura o golpe; museu dos mascotes nas ideias; caravela do
Almirante vindo de trás dele e pose apontando mais longa; tornado do Saci
impossível de pular. Ordem: imagens do Codex primeiro.
**Feito:** tontura de 0,8 s na guarda perfeita, com teste da compatibilidade
com a guarda; dash do Codex (v10) ligado nos seis, para a frente e para
trás, a 18 FPS; caravela com `spawnFrom: "behind"` (borda da câmera atrás
dele, desenhada atrás do corpo, velocidade 1000) e quadro apontando 0,7 s;
tornado com caixa só no funil e `dodge: "pulo"`. Museu no Marco 4.
**Verificado:** `npm run check` com 138 testes, build ok. No navegador:
tontura de 0,8 s com a animação certa e sem dano; dash toca a sheet nova;
caravela pausada em três momentos (entra atrás, passa por trás dele, segue);
tornado: antes acertava em qualquer pulo, agora quem pula no começo escapa.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** reação curta de 0,4 s na guarda perfeita.
**Aprovado explicitamente:** nada.
**Atrito:** baixar só a caixa do tornado não bastou (janela de um quadro).
**Em aberto:** ligar o soco no ar quando o Codex fechar os seis (precisa de
caixa de acerto no punho por quadro).

## 2026-10-29: Passo à frente no chute e no soco forte

**Marco:** 2, segue em andamento.
**Pedido:** a maioria dos chutes dava uma recuada; chute e soco forte devem
avançar um pouco.
**Feito:** medi o tronco quadro a quadro: nas sheets de chute ele inclina 25
a 49 px para trás e o lutador ficava parado. Fora do canto, o motor não
empurra o atacante. `travel` no JSON (só dado, zero motor) no soco forte, no
chute básico e no chute baixo dos seis, cobrindo a inclinação mais ~15 px;
giro do Galo também. Bicada, cachimbo e tiro ficam no lugar (não recuam).
Regra do Passo no contrato, no GDD e no criador, com teste.
**Verificado:** `npm run check` com 139 testes, build ok. No navegador,
longe do oponente: soco forte anda 35 a 50 px, chute 54 a 85, chute baixo
30 a 94 (carrinho do Bira 151, como antes); nenhum recua.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** nada.
**Atrito:** nada.
**Em aberto:** o passo soma ao alcance; jogar e ver se o chute baixo do
Saci e do Galo (cerca de 90 px) ficou longo demais.

## 2026-10-29: Build de computador pronto para a Vercel

**Marco:** 2, segue em andamento; passo do Marco 3 (link publicado).
**Pedido:** colocar o jogo na Vercel sem Academia e sem Celular; anotar
versão mobile com botões na tela e multiplayer como tarefas futuras.
**Feito:** `FERRAMENTAS_DE_DEV` (`import.meta.env.DEV`) em `constants.ts`.
No build, o menu tem só Jogar e Ajustes e a Luta não liga o relay do
celular (antes tentaria um WebSocket inexistente em loop). Roteiro e lições
com as duas tarefas futuras.
**Verificado:** `npm run check` com 139 testes, build de 60 MB. `vite
preview` com Playwright: menu com dois botões, luta Urubu contra Almirante
rodando com golpes, nenhum WebSocket aberto, console sem erro.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** nada.
**Atrito:** nada.
**Em aberto:** o deploy em si. A seção 3 da varredura (código do Chong-U
sem licença) continua sem resposta dele.

## 2026-10-29: Esquadrão (Bahia) entra na seleção

**Marco:** 2, segue em andamento.
**Pedido:** "coloque o super man"; depois do questionário, "só põe no jogo".
**Feito:** `bahia.json` com a arte da v11 do Codex: corte de mão aberta
(soco forte e, a 20 FPS, soco rápido), laser dos olhos no chute (projétil
`tiro` na altura dos olhos) e Bora Bahêa no especial (projétil `onda`, tonto
1 s, dano 25). O resto usa o quadro da guarda. Motor, só por dado: efeito
com célula própria (`frameWidth`, o texto tem 768 px) e projétil que não
espelha (`mirror: false`). Retrato e âncora recortados da guarda. Nome
provisório Esquadrão pela Regra do Escudo. Ficha no GDD, pedido ao Codex,
criador atualizado.
**Verificado:** `npm run check` com 145 testes, build ok. No navegador: o
Esquadrão na segunda fileira da seleção; luta contra o Urubu com o corte
(10% da vida), o laser (8%) e o especial (11%) acertando, texto legível
virado para a direita, console sem erro.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** nada.
**Atrito:** outra sessão mexia em `fighter.ts` e `moveMechanics.ts` ao mesmo
tempo (crescimento do projétil); commit levou só os meus trechos.
**Em aberto:** sheets do corpo; ligar o crescimento quando a outra sessão
fechar; nome final; falas.

## 2026-10-29: Esquadrão ganha o corpo da v12

**Marco:** 2, segue em andamento.
**Pedido:** implementar as últimas imagens do Codex. Ele instalou uma
extensão para eu usar o Codex, mas pediu para manter o fluxo como está.
**Feito:** integradas as 11 sheets que o Codex marcou como instaladas depois
de revisão (`idle`, andar, agachar, pulo, defesas, apanhar, tonto, queda,
soco leve de dois jabs), já ligadas por ele no `bahia.json`, mais o
crescimento por distância do projétil (`growth`) que outra sessão
implementou no motor. Ficaram fora: voadora (montada, sem revisão), chute
baixo (rejeitado por ele), dash e soco no ar (não chegaram).
**Verificado:** `npm run check` com 146 testes, build ok. Medição por quadro:
escala estável (cabeça ao cinto 87 a 94 px), nenhum quadro afunda. No
navegador contra o Urubu: dois jabs acertam (6%), defesa segura soco e
chute sem perder vida, especial cresce e deixa tonto (12%), queda termina
deitado e a luta segue para o round 2; console sem erro.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** nada.
**Atrito:** primeiro teste de defesa falhou porque os dois lutadores
estavam sobrepostos (bloqueio é geométrico); refeito a 177 px, segurou.
**Em aberto:** `hit-high` ainda volta 36 px num quadro só (tranco); dash,
chute baixo, soco no ar, voadora e retrato.

## 2026-10-29: Esquadrão, voadora, laser e especial refeitos

**Marco:** 2, segue em andamento.
**Pedido:** implementar as últimas imagens do Codex (extensão do Codex fica
sem uso por enquanto).
**Feito:** ligadas as quatro que ele marcou como revisadas: voadora
(`jump-kick`, acerto só na bota), sheet própria do laser (`eye-laser.png`,
raio saindo na altura dos olhos da sheet nova e mais fino) e preparação e
grito do especial refeitos. Dash para trás ficou de fora (sem revisão).
**Verificado:** `npm run check` com 146 testes, build ok. No navegador: laser
de 513 px acerta (8%), voadora acerta (8%), console sem erro.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** nada.
**Atrito:** nada.
**Em aberto:** dash, chute baixo, soco no ar, retrato, tranco do `hit-high`.

## 2026-10-29: Jogo publicado na Vercel

**Marco:** 2, segue em andamento; passo do Marco 3 (link publicado).
**Pedido:** "Dê deploy no vercel do jogo". Perguntado sobre o código do
Chong-U sem licença, escolheu público agora, com o Esquadrão incluso.
**Feito:** ADR 0006 (deploy público antes da resposta do Chong-U). Projeto
`luta-de-mascotes` na conta pessoal `joaojato` da Vercel, em
**https://luta-de-mascotes.vercel.app**. O conector da Vercel não tem acesso
ao escopo pessoal e a CLI da máquina está logada na Icons4u, então a CLI
ganhou um login separado em `~/.vercel-pessoal` (o da Icons4u fica intacto).
Ligar ao GitHub falhou (falta conectar o GitHub ao login da Vercel); o
deploy foi `vercel build --prod` local e `vercel deploy --prebuilt --prod`,
que sobe só o build, nunca o código-fonte nem `.env`. `.vercel` no
`.gitignore`.
**Verificado:** `npm run check` com 146 testes, build de 64 MB, nenhuma chave
no build. Link de produção responde 200 sem login. Chromium headless no link
publicado: abertura, menu só com Jogar e Ajustes, seleção com os sete (com o
Esquadrão), luta Urubu contra Almirante com HUD e estádio; nenhum WebSocket.
Único erro: 404 em `configs/background-gym.json`, config do painel de debug
que não existe em `public/`, sem efeito no jogo.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** link público antes da autorização do Chong-U.
**Atrito:** conector da Vercel sem acesso ao escopo pessoal; precisou de
login manual dele na CLI.
**Em aberto:** mensagem ao Chong-U; deploy é manual até o GitHub ser
conectado na Vercel; o 404 do `background-gym.json`.

## 2026-10-29: P1 com Q, E, C e Espaço

**Marco:** 2, segue em andamento.
**Pedido:** perguntou se a Vercel atualiza sozinha com o git (ainda não:
falta conectar o GitHub no login da Vercel) e pediu o P1 no padrão Q chute,
E soco, C bloqueio, Espaço especial.
**Feito:** `CONTROLES_PADRAO.p1` em `controles.ts` (F, G e V saem) e o teste
de botões. Espaço estava livre na Luta; nos menus segue confirmando.
Republicado na Vercel.
**Verificado:** `npm run check` com 146 testes, build ok. No link publicado:
legenda "E soco · Q chute · C defende · Espaço especial"; E acertou o
Almirante em sequência até o medidor encher, e o Espaço gastou o medidor
soltando o especial do Urubu.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** teclas padrão do P1.
**Aprovado explicitamente:** nada.
**Atrito:** nada.
**Em aberto:** quem remapeou na Academia guarda o mapa antigo no navegador
(só no `npm run dev`); conectar o GitHub na Vercel.

## 2026-10-29: Torcida dividida na Luta

**Marco:** 2, segue em andamento.
**Pedido:** dividir a torcida: cada metade com cores e estampa do clube do
lutador daquele lado (camisa, bandeira, sinalizador), sem trocar de lado
na luta e sem reagir a ela; usar a extensão do Codex direto daqui.
**Feito:** contrato em `docs/torcida-dividida.md`. O Codex, chamado pela
linha de comando da extensão, entregou arquibancada vazia, 10 tipos de
torcedor em 4 poses com camisa em magenta, bandeira, fumaça, chama e as 39
fileiras medidas (`docs/torcida-v1.md`). No código: `torcida` no JSON dos
sete mascotes, `torcida.ts` (troca do magenta pela estampa, com sombra, por
figura) e `torcidaCena.ts` (pinta uma folha por clube, monta as fileiras
com sorteio fixo, três bandeiras e dois sinalizadores por lado na
arquibancada central, tudo numa imagem redesenhada dez vezes por segundo).
Sem a arte, a Luta volta à pintura antiga.
**Verificado:** `npm run check` com 155 testes, build ok. No navegador:
Flamengo x Vasco (rubro-negro listrado contra preto com faixa branca,
fumaça vermelha e clara) e Galo x Bahia (listras do preto do Galo contra
branco); 708 torcedores, console sem erro. Desempenho no navegador de teste
sem placa de vídeo: 26 quadros contra 30 da pintura antiga.
**Créditos gastos:** nada (Codex pela conta do ChatGPT).
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** a divisão por cores e a tabela de clubes.
**Atrito:** primeiro sorteio pôs bandeiras e fumaça do P2 na lateral, fora
da câmera; medição de desempenho torta na primeira vez (ver lições).
**Em aberto:** aceite visual do João; menus com a torcida neutra ou dividida.

## 2026-10-29: Torcida com todas as cores do clube

**Marco:** 2, segue em andamento.
**Pedido:** mais variedade (torcedores de camisa lisa nas cores do time),
o vermelho do Bahia tinha sumido, detalhes na mesma regra, sinalizador
coeso e nunca preto; cores da torcida no procedimento de lutador novo.
**Feito:** cada metade mistura a estampa (60%) com camisas lisas em cada
cor do clube, gola na cor seguinte; bandeira na estampa e em faixas com
todas as cores; três sinalizadores por lado revezando as cores do clube com
brilho de 35% ou mais. Regras em `docs/torcida-dividida.md`, bloco 2.6 do
criador e etapa 5 da skill `lutador-novo`; teste cobra que toda cor de todo
clube vira camisa e bandeira e que nenhum sinalizador é escuro.
**Verificado:** `npm run check` com 161 testes, build ok. No navegador:
Galo x Bahia (camisas brancas, azuis e vermelhas; fumaça azul, vermelha e
branca) e Fluminense x Flamengo (grená, verde e branco nas duas formas;
fumaça só vermelha do lado rubro-negro); console sem erro.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** a regra de uma cor só de fumaça e a
camisa só estampada.
**Aprovado explicitamente:** "ficou interessante a forma que ficou construída a torcida".
**Atrito:** nada.
**Em aberto:** aceite visual desta rodada.

## 2026-10-29: Vercel atualizada com a torcida

**Marco:** 2, segue em andamento.
**Pedido:** como atualizar a Vercel com a versão mais recente do git; se
fosse só commitar, commitar.
**Feito:** commit não basta, a Vercel segue sem GitHub conectado. Havia
outra sessão editando (Biriba, ovo, tontura, Bahia v12 pela metade); ele
escolheu publicar só o último commit (3b63aef). Worktree limpo do commit no
scratchpad, `vercel build --prod` e `vercel deploy --prebuilt --prod` com
`--global-config ~/.vercel-pessoal`; o trabalho em andamento ficou intocado.
**Verificado:** `npm run check` no worktree com 157 testes, build ok. Link de
produção responde 200 e serve o `main-DycjOS6o.js` deste build.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** publicar o último commit em vez do estado atual.
**Atrito:** nada.
**Em aberto:** `vercel git connect` (ou o painel) para o push publicar sozinho.

## 2026-10-29: Esquadrão completo e Biriba de cenário (trabalho do Codex)

**Marco:** 2, segue em andamento.
**Pedido:** quando a sessão do Codex terminar, ligar as animações dela.
**Feito:** conferido e commitado o que a sessão do Codex no VS Code deixou:
as 20 ações do Esquadrão com sheets próprias (dash para a frente, chute
baixo e soco no ar novos; o corte de mão aberta segue com a arte antiga,
redesenho recusado pela ferramenta de imagens) e o Biriba de cenário, que
acompanha o Bira pela beira do campo e late de vez em quando
(`docs/biriba-cenario.md`, `biribaCena.ts`, `biribaMotion.ts`).
**Verificado:** `npm run check` só com este recorte, verde. No navegador,
Esquadrão contra Bira: chute baixo (6%) e soco no ar (3%) acertam, dash
voando, Biriba ao lado do Bira; console sem erro além da folha de tontura
que ainda não existe (outra entrega).
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** nada.
**Atrito:** a sessão anterior do Claude caiu no meio; o Codex de arte seguiu
rodando sozinho.
**Em aberto:** retrato do Esquadrão; corte de mão aberta redesenhado.

## 2026-10-29: Biriba do Bira, ovo do Galo e tontura do motor

**Marco:** 2, segue em andamento.
**Pedido:** chute do Bira chama o Biriba em balões pretos e brancos, que
solta um cocô onde o oponente estava (só sair do lugar escapa, defesa não
segura, um Biriba por vez); depois o cocô vira mina de 2 s com metade do
dano e o acerto precisa de partículas; tontura como partícula do jogo, não
da sheet (o Esquadrão estava sem); Galo com o giro no chute baixo e um ovo
arremessado no chute.
**Feito:** contrato em `docs/biriba-ovo-tontura.md`. Arte do Codex pela
linha de comando (8 peças, 48 quadros, e a limpeza das estrelas das seis
sheets `stunned`, guia em `docs/biriba-ovo-tontura-arte.md`). No motor: golpe
`queda` (nenhuma guarda segura), projétil que carrega outro (`drop`), mina
(`mine`), partículas de acerto (`hitParticles`), respingo de projétil
(`hitEffect`), `lowKick` com efeito próprio e a tontura `fx-tontura`
desenhada acima da cabeça de qualquer lutador tonto. Caixas do `stunned`
remedidas sem as estrelas. Biriba de cenário some enquanto o voador
atravessa.
**Verificado:** `npm run check` verde. No navegador: Urubu parado leva o
cocô (7,8%), defendendo leva igual, saindo do lugar escapa, chamar de novo
com o Biriba no ar não faz nada; pisar na mina dá 3,9% e ela some em 2 s;
ovo acerta reto e a defesa segura; Esquadrão tonto com estrelas pela
primeira vez; console sem erro.
**Créditos gastos:** nada (Codex pela conta do ChatGPT).
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** nada.
**Atrito:** a sessão do Claude caiu no meio, o Codex seguiu sozinho e o
aviso de fim se perdeu; vigia novo pelo arquivo de resposta. Partículas da
primeira versão pequenas demais contra a torcida escura.
**Em aberto:** aceite visual do João.

## 2026-10-29: Porco na seleção

**Marco:** 2, segue em andamento.
**Pedido:** "Coloca o porco"; torcida com camisas brancas ou verdes.
**Feito:** questionário respondido com proposta, aceita. `porco.json` com
as 20 sheets que o Codex revisou: dois socos, mordida, chute, coice de
costas com passo largo, voadora, soco no ar, dash e o vômito como projétil
`nuvem` (pular e agachar não escapam), tonto 1 s, 8%. Caixas de acerto
medidas nos PNGs só na altura do punho, boca, pé e casco. Motor:
`launchForward`, para o jato largo nascer na boca. Torcida verde
(`#087028`, do terno) e branca. Retrato e âncora recortados da guarda.
**Verificado:** `npm run check` verde. No navegador contra o Urubu: soco
6,1%, mordida 10,4%, chute 7,8%, coice 6,1%, vômito 7,8% de perto e a 350
px com tontura; arquibancada verde e branca; console sem erro.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** a proposta do questionário ("Pode adicionar").
**Atrito:** caixas automáticas pegavam o pé junto do punho; recortadas por
altura. A corrida antes do coice depende de motor novo.
**Em aberto:** `stunned`, `knockdown`, retrato; jato que se descola da boca
enquanto anda; corrida do coice.

## 2026-10-29: Porco cai e fica tonto com as sheets próprias

**Marco:** 2, segue em andamento.
**Pedido:** o Porco estava sem a animação de queda.
**Feito:** o Codex entregou `stunned` e `knockdown` às 22:27 e 22:30, depois
de eu montar o JSON, que seguia com a reação de apanhar como quebra-galho.
Ligadas as duas sheets próprias.
**Verificado:** `npm run check` verde. No navegador: tonto com a pose de
enjoo e as estrelas do jogo; no nocaute, toca a queda até o último quadro,
deitado; console sem erro.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** nada.
**Atrito:** integrei o Porco com o manifesto ainda marcando as duas como
pendentes e não conferi de novo antes do commit.
**Em aberto:** soco de asas do Urubu, em produção no Codex.

## 2026-10-29: O jogo vira Falta de Respeito FC

**Marco:** 2, segue em andamento.
**Pedido:** novo nome, Falta de Respeito FC, com logo de título nova ("FC"
pequenininho) e endereço da Vercel novo, sem o FC.
**Feito:** logo do Codex pela linha de comando, no estilo de rua da antiga
(`public/assets/branding/falta-de-respeito-logo.png`; a antiga fica no
disco). `GAME_TITLE`, título da aba e do controle trocados. A chave de
armazenamento continua `luta-de-mascotes-settings`, para não apagar os
ajustes salvos. Vercel: `falta-de-respeito.vercel.app` adicionado ao projeto
`luta-de-mascotes`; o endereço antigo segue funcionando.
**Verificado:** recorte do commit com `npm run check` isolado; endereço novo
responde 200; republicado e conferido no navegador.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** o nome Luta de Mascotes.
**Aprovado explicitamente:** nada.
**Atrito:** o teste de golpes quebra no disco por causa do soco de asas do
Urubu, que o Codex integra agora; publicado só o commit.
**Em aberto:** soco de asas do Urubu; renomear o projeto na Vercel e o repo.

## 2026-10-29: Urubu com o golpe de asas no soco forte

**Marco:** 2, segue em andamento.
**Pedido:** incluir a animação nova do Urubu.
**Feito:** a sessão do Codex no app desenhou e integrou o golpe: 20
quadros a 16 FPS em células 512×256 (`heavy-wing-spread-v1.png`), asas
saindo dos próprios braços, acerto nos quadros 6 a 8, fechamento lento. O
motor ganhou `frameWidth` por ação, com a caixa do corpo deslocada para
continuar no lugar. Eu corrigi o teste de golpes, que fixava o quadro 2 do
cruzado antigo; agora lê o contato do próprio golpe.
**Verificado:** `npm run check` com 172 testes, build ok. Altura do bico ao
pé igual à da guarda (170 contra 168 px). No navegador contra o Almirante:
acerta a 178, 236 e 307 px, 10,4%, asas inteiras na tela; console sem erro.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** o cruzado do Urubu (arquivo mantido).
**Aprovado explicitamente:** nada.
**Atrito:** o guia do Codex ainda diz "em andamento"; integrado depois de 5
minutos sem mudança nos arquivos.
**Em aberto:** a caixa de acerto cobre as duas asas, inclusive a de trás.

## 2026-10-29: Golpe de asas mais rápido

**Marco:** 2, segue em andamento.
**Pedido:** o golpe novo do Urubu estava lento demais.
**Feito:** abertura de 16 para 22 FPS e fechamento a 30 ms por quadro.
**Verificado:** `npm run check` verde; no navegador o acerto sai em 0,33 s
(era cerca de 0,4 s) e o golpe acaba em 0,79 s (era 1,25 s), 10,4%,
console sem erro.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** a velocidade do golpe de asas.
**Aprovado explicitamente:** nada.
**Atrito:** nada.
**Em aberto:** nada.

## 2026-10-30: Sons gerais e dos golpes (entrega 1)

**Marco:** 2, segue em andamento.
**Pedido:** fazer os sons do jogo, do geral ao específico, mapeando todos a
partir das animações; ele não sabia como.
**Feito:** mapa em `docs/sons.md`, cinco camadas e cerca de 60 sons; ADR
0007 (síntese em Python, só biblioteca padrão). `scripts/sons.py` gera 28
WAV: menus, partida (torcida em loop, round, apito, K.O., tempo, vitória,
relógio, barra cheia, entrada do especial), corpo (passo, pulo, aterrissar,
dash, queda, tontura) e golpes do catálogo (sopro leve e pesado, impactos
leve, pesado, baixo e especial, defesa, guarda quebrada, guarda perfeita,
projétil, carga). Regra do Som: o motor toca o geral e o bloco `sons` do
JSON troca pelo próprio do mascote, ou cala com `null`.
**Verificado:** `npm run check` com 175 testes; sons sem estalo no fim
(medido); numa luta no navegador tocaram os 19 esperados e a torcida ficou
em loop; console sem erro. Eu não ouço o resultado: o aceite é do João.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** nada.
**Atrito:** `audio.ts` e `sons.ts` se importavam; lista separada em
`sonsLista.ts`. O lutador de teste não tem ajustes de volume; som tolerante.
**Em aberto:** camada 5, os sons de cada mascote.

## 2026-10-30: Sons de cada mascote (entrega 2)

**Marco:** 2, segue em andamento.
**Pedido:** depois dos gerais, os sons específicos (tiro da garrucha,
caravela com água) e o resto, do geral ao específico.
**Feito:** 26 sons novos em `scripts/sons.py` (garrucha, caravela com mar e
madeira, sino do navio, bicada, asas, térmica, meteoro, cachimbo girando,
tornado, pó de arroz, garra, bote, assobio de dedos, cocô, latido, giro,
ovo e ovo quebrando, cacarejo, laser, corte, Bora Bahêa, mordida, coice,
enjoo, vômito) e o bloco `sons` nos oito JSONs. Motor: eventos `especial`
e `projetil-acerto`; o Biriba de cenário late com som. Questionário de
mascote ganhou a parte de sons.
**Verificado:** `npm run check` com 175 testes. No navegador, cada mascote
tocou os próprios sons nos golpes certos; console sem erro. Não ouvi.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** nada.
**Atrito:** o primeiro teste apertava o chute ainda travado no golpe
anterior e acusou falta do tiro e do assobio; isolado, tocaram.
**Em aberto:** aceite de ouvido do João; vozes ficam para gravação.

## 2026-10-30: Vigia do Corinthiano e sons de dor, latido e torcida (entrega 3)

**Marco:** 2, segue em andamento.
**Pedido:** um hook que coloque o Corinthiano no jogo sozinho quando o
Codex terminar; enquanto isso, latido do Biriba, dor dos personagens,
torcida fazendo barulho à toa e nada de som "goofy" (o pouso do Urubu
estava fino, era para ser estrondoso).
**Feito:** `scripts/vigia-lutador.mjs` acha sprite entregue sem JSON (pasta
nova em `public/assets/lutadores/` com idle, andar, hit-high, knockdown,
soco rápido e chute, quieta há 10 min). Roda no hook `SessionStart` de
`.claude/settings.json` (sessão nova já abre sabendo) e em segundo plano
na sessão aberta. O Mosqueteiro (`mosqueteiro/base-v1`) começou a chegar
durante a sessão, só com o idle. Sons: voz por formantes em
`scripts/sons.py` (`glote`, `vogal`), 19 sons novos (dor geral e de
porco, galo, urubu e cão; latido em voo; mergulho e pouso do Urubu; cinco
da torcida) e 12 refeitos sem cara de desenho animado. Motor: eventos
`dor`, `dor-forte`, `dor-ko` (tom variando, um grito a cada 0,35 s),
`especial-mergulho` e `especial-pouso`; a Luta sorteia um som da torcida a
cada 5 a 11 s. O latido estava a 0,2 de volume, quase inaudível; foi a 0,45.
**Verificado:** `npm run check` com 176 testes. Medi os WAVs: o pouso tem
85% da energia abaixo de 150 Hz, nenhum termina com estalo. No navegador:
dor do Porco com tom variando, Urubu meteoro → mergulho → acerto → pouso,
Biriba latindo em voo, KO com gemido, torcida à toa tocando sozinha;
console sem erro. Não ouvi.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** pouso do Urubu e os sons de desenho
animado (lição registrada).
**Aprovado explicitamente:** nada.
**Atrito:** heredoc do bash quebrou de novo com aspas; scripts Python vão
por arquivo no scratchpad.
**Em aberto:** aceite de ouvido; integrar o Mosqueteiro quando o vigia
avisar.

## 2026-10-30: Versão mobile, celular deitado com botões na tela

**Marco:** 2, segue em andamento.
**Pedido:** versão mobile deitada, sem barra de rolagem, opção de tela
cheia, direcional por setas ou joystick (o jogador escolhe) e soco, chute,
bloqueio e especial à direita. Depois, publicar na Vercel quando o
Corinthiano entrar, e fazer o mesmo com o Dragão goianiense.
**Feito:** `src/toque/` (direção em 8 fatias testada; camada de botões que
aperta as teclas do P1), CSS sem rolagem com `100dvh`, manifesto para abrir
em tela cheia pelo ícone, ícones gerados da logo, só 1 VS CPU no toque.
Hook do vigia passou a mandar publicar na Vercel (autorização do João).
**Verificado:** `npm run check`. Celular simulado 844×390 com toque real:
sem rolagem, fluxo inteiro só com toques, andar e socar com dois dedos,
joystick, aviso de girar em pé; console sem erro.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** nada. Sons: "ainda não estão me agradando"
(lição registrada, fica para depois).
**Atrito:** primeira rodada escolheu 1 VS 1 e travou na seleção (o P2 não
tem como confirmar no toque); o 1 VS 1 saiu do celular.
**Em aberto:** teste em celular de verdade; Corinthiano e Dragão quando o
Codex entregar.

## 2026-10-30: Mosqueteiro (Corinthians) entra no jogo pelo vigia

**Marco:** 2, segue em andamento.
**Pedido:** com o João dormindo, colocar o Corinthiano no jogo assim que o
Codex terminasse, commitar e publicar na Vercel; depois, o mesmo com o Dragão.
**Feito:** o vigia acordou com a entrega completa (14 ações e os 4 Gaviões).
O plano do Codex não tinha `hit-high`, `stunned` nem `knockdown`; pedi as
três ao Codex pela linha de comando (`codex exec` com geração de imagem) e
elas chegaram em uns 10 minutos. Folhas convertidas de 640×320 para 512×256
em `jogo-v1/` (`celula_codex.py` ganhou `--saida`, `--pe-saida`, `--so` e
`--espelhar`; o Bonezinho voa virado para a direita e foi espelhado inteiro).
`mosqueteiro.json` com chute = tiro de mosquete, especial `esquadrao` com os
Gaviões, torcida em listras verticais preto e branco, retrato e âncora
recortados da guarda. Entrega bruta `base-v1/` fora do git. O vigia passou a
ler planos com a chave `body` (o do Dragão).
**Verificado:** `npm run check` (186 testes, build). Na luta contra o
Almirante: duas estocadas 8+8, cotovelada 28, estocada baixa 15, tiro 26,
especial 32 (Gavião acerta e os três pequenos completam); nocaute toca a
queda inteira; console sem erro.
**Créditos gastos:** nada no Spriterrific (arte pelo Codex).
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** nada.
**Atrito:** a estocada baixa recua na arte, mas a Regra do Passo pede passo
à frente: ficou um passo curto de 15 px antes do contato.
**Em aberto:** o João ver o Mosqueteiro jogando; Dragão goianiense quando o
Codex terminar.

## 2026-10-30: Gaviões no fundo e mergulho sem hora certa

**Marco:** 2, segue em andamento.
**Pedido:** os Gaviões ficavam na frente do lutador e não acompanhavam o
Mosqueteiro; ele quer igual ao Biriba (fundo, entre lutadores e torcida, e
todo NPC dele será assim). Depois: mergulho do Gavião principal mais rápido
e numa hora sorteada, de 0,5 s antes a 0,8 s depois da janela atual.
**Feito:** `src/game/planoDeFundo.ts` guarda o plano do Biriba (camada 3,
pé 60 px acima do chão da luta, margem da câmera, passo 340 px/s) e o
Biriba passou a usar. Os Gaviões no posto ficam nesse plano, em 60% do
tamanho, andam atrás do dono com passo constante e saltinhos, e o grupo se
desloca para caber na câmera. Só no ataque saem do fundo; o mergulho que
parte do meio da subida cresce do tamanho do fundo ao do lutador. Mergulho
a 2600 px/s (antes 0,45 s fixos) e momento sorteado por `mergulho` no JSON
(`segundos` 1, `adiantar` 0,5, `atrasar` 0,8), em `src/game/mergulho.ts`
com teste. Regra do Fundo no `CLAUDE.md` e no criador.
**Verificado:** `npm run check` (189 testes, build). Na luta: Gaviões no
fundo, atrás dos dois, andando junto; seis especiais com sorteios de 0,55 s
a 1,44 s, mergulho na hora sorteada, dano 32 em todos; console sem erro.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** posição e camada dos Gaviões no posto.
**Aprovado explicitamente:** a janela do mergulho ("achei boa"), base do sorteio.
**Atrito:** nenhum.
**Em aberto:** Dragão goianiense quando o Codex terminar; sons.

## 2026-10-30: Gaviões parados no fundo, só assistindo

**Marco:** 2, segue em andamento.
**Pedido:** os Gaviões não acompanham o Mosqueteiro; ao contrário do
Biriba, ficam parados assistindo.
**Feito:** cada Gavião marca o lugar no fundo no começo do round (atrás do
dono, deslocado para caber na câmera) e fica ali; só vira para o meio da
luta. Depois do especial volta ao mesmo lugar. Regra do Fundo reescrita:
o plano é de todo NPC, acompanhar o dono é decisão de cada um.
**Verificado:** `npm run check` (189 testes, build). Na luta, o Mosqueteiro
andou de x=618 a 1086 e os Gaviões ficaram em 332 a 517; especial com 32 de
dano e volta ao mesmo lugar; console sem erro.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** o andar dos Gaviões atrás do dono,
feito na entrada anterior por leitura errada do pedido.
**Aprovado explicitamente:** nada.
**Atrito:** li a comparação com o Biriba como "fazer igual" em tudo; ele só
queria o mesmo plano de fundo.
**Em aberto:** Dragão goianiense quando o Codex terminar; sons.

## 2026-10-30: Gaviõezinhos teleguiados, esgrima do Mosqueteiro e cocô que atordoa

**Marco:** 2, segue em andamento.
**Pedido:** (1) no ataque sem defesa o oponente tem que poder se mexer, mas
os Gaviõezinhos são teleguiados; (2) golpes do Mosqueteiro lentos para sair
e para voltar, estocada ligeira, um passo para trás a cada estocada; só a
cotovelada sai rápido, com avanço maior e volta um pouco lenta; (3) o cocô
do Biriba que cai na cabeça atordoa por 1 s. Perguntou também do modo
online e do painel de edição do localhost.
**Feito:** (1) contato dos seguidores atordoa 220 ms (antes 650) e eles
perseguem o corpo do oponente onde ele estiver, pulando ou andando; o líder
segue em linha reta (dá para defender e fugir). (2) motor ganhou `recuo`
(passo para trás por janela de quadros) e o passo passou a respeitar o
`timing` de cada quadro; Mosqueteiro com `timing` nas três estocadas e na
cotovelada (avanço 70, antes 40). Regra do Passo ganhou a exceção da
estocada. (3) `stunMs` no `drop`; o do Biriba é 1000; a mina não atordoa.
**Verificado:** `npm run check` (189 testes, build). Na luta: Gaviõezinhos
acertam o Almirante pulando, que fica livre entre um e outro, 32 de dano;
duas estocadas 8+8 em 1,0 s (antes 0,75) com recuo depois de cada uma;
cotovelada 28, avança 99 px; estocada baixa 15 e recua 38 px; cocô 18 de
dano e 1003 ms de tontura; console sem erro.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** o passo à frente da estocada baixa.
**Aprovado explicitamente:** nada.
**Atrito:** o navegador de teste ficou lento (cerca de 25 quadros/s) e dois
scripts de medição travaram; refeitos com amostragem simples.
**Em aberto:** modo online (só no roteiro, nada feito); painel do
localhost grava no `fighter-playground.json` herdado, não no JSON do
mascote; Dragão quando o Codex terminar; sons.

## 2026-10-30: pausa no Tab, CPU com três níveis, sem rodapé e sem a janela do especial

**Marco:** 2, segue em andamento.
**Pedido:** tirar o rodapé com os botões da luta; menu de pausa no Tab com
controles e comandos; tirar a janela que aparecia em todo especial (arte do
criador do jogo-base); CPU que ataca de verdade, com níveis de dificuldade.
**Feito:** rodapé removido. `src/game/menuPausa.ts`: Tab pausa a luta
inteira (animações, tempo, som) e mostra as teclas de cada lado, os golpes
de cada mascote lidos do JSON dele e os comandos gerais; Tab continua, Esc
vai ao menu. `superCutIn.ts` apagado; o som de entrada do especial fica.
`src/game/cpu.ts` no lugar do sorteio cego: lê distância, golpe e projétil
do oponente, barra cheia; chega perto, mistura soco, soco forte, chute e
chute baixo, defende depois do tempo de reação, pune quem está tonto, atira
de longe se o chute é tiro, usa o especial. Três perfis (Fácil, Médio,
Difícil) mudando reação, intervalo entre golpes, defesa, especial,
agressividade e punição. Dificuldade na tela de modo (↑ ↓ ou toque com o
1 VS CPU selecionado), guarda nos ajustes do aparelho.
**Verificado:** testes da CPU (7) e dos ajustes; no navegador, P1 parado
por 20 s: Fácil começou 12 golpes, Difícil 39 e tirou 95 de vida; pausa
congela a vida; tela de modo mostra a dificuldade; console sem erro.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** rodapé da luta; janela do especial.
**Aprovado explicitamente:** nada.
**Atrito:** outra sessão está reescrevendo `src/toque/telaToque.ts` (menu e
pausa do celular) e apagou o botão de pausa que eu tinha posto lá; a pausa
no toque fica com ela. A CPU antiga era o sorteio herdado do jogo-base.
**Em aberto:** Dragão (entrega pronta, integrando agora); nível do chão,
sombra e tela de vitória pedidos em seguida.

## 2026-10-30: escolher o adversário da CPU

**Marco:** 2, segue em andamento.
**Pedido:** no 1 VS CPU, o jogador escolhe o adversário da CPU.
**Feito:** a Seleção em 1 VS CPU tem duas etapas: o jogador trava o próprio
lutador e o mesmo direcional (ou o mouse e o toque) passa a mover o cursor
da CPU, que não para no lutador do jogador; travar o adversário começa a
luta. Esc na segunda etapa destrava o lutador do jogador em vez de sair. A
frase sob o título diz a etapa. O sorteio da CPU saiu.
**Verificado:** no navegador, travar, voltar com Esc, travar de novo, mover
a CPU e travar: a luta começou com Almirante contra o Mosqueteiro escolhido;
console sem erro. `npm run check` no clone limpo do commit.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** o sorteio do adversário da CPU.
**Aprovado explicitamente:** nada.
**Atrito:** antes disso ele avisou que "não rodava na build": o site estava
no ar, mas sem o pacote da pausa e da CPU, que estava commitado e não
publicado; publiquei.
**Em aberto:** Dragão (motor de célula alta e sopro em andamento); chão,
sombra e tela de vitória.

## 2026-10-30: Dragão (Atlético Goianiense) jogável, com o sopro de fogo

**Marco:** 2, segue em andamento.
**Pedido:** colocar o Dragão no jogo quando o Codex terminasse, com o sopro
de fogo, commitar e publicar.
**Feito:** motor aceita célula alta por ação (`frameHeight`; o lutador gira no
pé da célula, então o chão não muda), Academia desenha caixas na célula
certa. Folhas convertidas para `jogo-v1/` (512×384, pé em 356; o sopro, todo
no ar, em 336). Especial novo `sopro` (`src/game/sopro.ts`, com teste): sobe
170 px de quadro, varre com o jato da boca de 30 a 190 graus interpolando
boca e ângulo a cada quadro de física, lado travado, sem guarda; desce com
`special-return`. Cuspida como golpe com efeito. `dragao.json`, retrato e
âncora. Entrega bruta `base-v1/` fora do git.
**Verificado:** 218 testes; no navegador contra o Almirante: cuspida 22,
sopro de longe 34, oponente embaixo do Dragão escapou (0), volta ao chão;
console sem erro.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** nada.
**Atrito:** voando a 200 px a cabeça saía da tela no fim da varredura; ficou
170. O navegador de teste estava lento (10 a 17 quadros/s).
**Em aberto:** chão do campo, sombra, tela de vitória.

## 2026-10-31: recapitulação das pendências e sete mascotes novos nas ideias

**Marco:** 2, segue em andamento.
**Pedido:** recapitular tudo que está pendente; perguntou se dá para
adiantar o multiplayer; pediu para pôr nas ideias Coritiba (Vovô Coxa),
Chapecoense (Índio), Cruzeiro (Raposa), Remo (Leão), Grêmio (Mosqueteiro
azul), Santa Cruz (Cobra) e América Mineiro (Coelho).
**Feito:** recapitulação a partir do roteiro, das lições, do diário e dos
pedidos ao Codex. No `docs/gdd.md`, a tabela de candidatos separa o
Mosqueteiro do Corinthians (jogável) e ganha os seis pedidos novos sem
arquétipo, com dois alertas: Vovô Coxa encosta no Vozão, e o Índio precisa
de reinterpretação sem caricatura étnica. A Raposa já estava na tabela.
**Verificado:** só documento; `npm run check` rodado antes do commit.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** nada.
**Atrito:** nada.
**Em aberto:** multiplayer ficou na primeira pergunta (como seria a primeira
partida online); mudanças de outra sessão na tela de toque seguem sem commit.

## 2026-10-31: São Paulo, Ponte Preta, Água Santa, Paysandu e o especial do Santos

**Marco:** 2, segue em andamento.
**Pedido:** anotar ideias de mascote. São Paulo como santo quase Zeus, que
voa e dispara dois raios bloqueáveis; Ponte Preta (Gorilão); Água Santa
(Poseidon); Paysandu (Lobo que uiva e chama matilha); Santos com rajada de
AK-47 de 8 tiros, cuspe d'água e fuzil de bandoleira nas costas.
**Feito:** no `docs/gdd.md`, a linha da Baleia (Santos) ganha o especial e a
nota de arte; os outros quatro entram na tabela de pedidos de 31/10. Duas
imagens dele viraram referência: `referencia/sao-paulo/referencia-joao-v1.png`
(arte da NEO Design) e `referencia/santos/referencia-joao-v1.png` (orca do
banco APSD, com marca d'água). As duas são só referência, nunca asset.
**Verificado:** só documento e imagem.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** nada.
**Atrito:** nada.
**Em aberto:** Lobo encosta na caravela do Vasco; Poseidon encosta no São
Paulo e no Santos; fuzil do Santos a confirmar com o Barbato.

## 2026-10-31: Dragão voa mais alto e ninguém mais fica em pé no ar

**Marco:** 2, segue em andamento.
**Pedido:** o voo do Dragão estava baixo demais para o oponente passar por
baixo; quem apanhava durante um voo (Urubu, Galo, Dragão) ficava em pé no ar.
**Feito:** `altura` do sopro de 170 para 240 em `dragao.json` (o Saci, o
mais alto, tem a cabeça a 316 px do chão; o Dragão passa a ficar a 336).
Em `fighter.ts`, `applyHit` tira o lutador do estado de chão quando o
desenho está acima do piso, e a gravidade termina a queda depois do
atordoamento. Testes novos: queda com golpe rápido no sopro e no meteoro;
altura do sopro contra o maior idle.
**Verificado:** `npm run check` com 220 testes. No navegador, Dragão contra
Saci: no alto, pé do Dragão em y 335 contra a cabeça do Saci em 346; Saci
posto debaixo dele durante o sopro, em pé e sem perder vida; soco rápido no
alto e o Dragão volta ao chão (662). Console sem erro.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** a altura de 170 do sopro.
**Aprovado explicitamente:** nada.
**Atrito:** no primeiro quadro do sopro, o alto da cabeça e das asas passa
da borda de cima da tela, atrás da barra de vida.
**Em aberto:** multiplayer na primeira pergunta; chão, sombra e tela de
vitória.

## 2026-10-31: Versão mobile, rodada 2: tela inteira, botões de PlayStation e menu hambúrguer

**Marco:** 2, segue em andamento (item da versão jogável no celular).
**Pedido:** depois de testar no iPhone como web app: formatação de acordo
com a tela (elementos cortados; cenário pode cortar, HUD nunca); botões nas
cores e posições do PlayStation (quadrado defesa, xis chute, bola soco,
triângulo especial); bug do iPhone que abria seleção de texto e zoom ao
segurar o direcional; menu hambúrguer no lugar da coluna de canto; cada
jogador poder mover e redimensionar os botões e guardar.
**Feito:** `src/toque/layout.ts` (arranjo de fábrica, arrastar, tamanho,
salvar no `localStorage`, largura do jogo pela proporção) com 16 testes;
`src/toque/tamanhoDoJogo.ts` ajusta a largura do jogo (1280 a 1680, altura
720) a cada cena que abre; `telaToque.ts` reescrito com losango PS em SVG,
setas em SVG, toque cru cancelado nos controles, menu hambúrguer que pausa
o jogo e modo "Ajustar botões"; canvas na área segura; `matchHud.ts` abre
margem para o menu e encolhe no 16:9 (`encaixeComMenu`); dicas de teclado
somem no toque; splash diz "Toque na tela para começar". Contrato em
`docs/mobile.md`, rodada 2.
**Verificado:** typecheck, 213 testes (fora `cpu.test.ts`) e build. O
`npm run check` completo falha em 6 testes de `cpu.test.ts`, arquivo que
outra sessão está editando agora sem commitar; não mexi nele. No Chromium
com toque emulado: 844×390 (jogo 1558 de largura), 667×375 (1280, HUD
encolhido ao lado do menu) e 740×330 (1614); HUD inteiro nas três; menu
pausa e retoma; xis arrastado e aumentado continua no lugar depois de
recarregar. WebKit do Playwright no Windows não carrega as imagens do jogo,
então lupa e zoom do iOS ficam para o iPhone de verdade.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** a coluna de canto (voltar, tela
cheia, setas/joystick) virou menu hambúrguer; os botões de cor própria
viraram o losango do PlayStation; as setas em texto viraram SVG.
**Aprovado explicitamente:** "adorei a recomendação de adicionar o jogo
como web app".
**Atrito:** a primeira sessão caiu no meio da verificação; retomada em
seguida. O servidor de dev da porta 5199 era desta pasta, de sessão antiga.
**Em aberto:** o João confirmar no iPhone (lupa, zoom, tela cheia); no
iPhone o ajuste dos botões salvo no Safari não aparece no ícone da Tela de
Início e vice-versa; em menus, o xis não confirma (quem confirma é o
triângulo, que aperta Espaço).

## 2026-10-31: Pelada, Torneios, dificuldade clara e lutador aleatório

**Marco:** 2, segue em andamento (exceção à Regra da v1 aberta pelo João).
**Pedido:** dificuldade que não fique escondida, Fácil mais burra e
Difícil mais esperta; "?" para sortear lutador; menu com Pelada no lugar de
Jogar e Torneios, com mata-mata e pontos corridos de 8 e 16 times contra a
CPU; salvar o progresso.
**Feito:** design aprovado no navegador (esboços das telas) e plano em
`docs/superpowers/`. Menu Pelada e Torneios; `DificuldadeScene` com três
cartões explicados; CPU com perfis novos (Fácil erra e quase não defende;
Difícil agacha na guarda certa, pune golpe que terminou, corta pulo e
guarda o especial; Médio intacto); casa "?" na seleção (`sorteio.ts`);
`torneio.ts` (chave, todos contra todos pelo método do círculo, pontos,
desempate) e `torneioSalvo.ts` (localStorage, com cópia na memória);
`TorneioScene` e `TorneioQuadroScene` (chaveamento, tabela, campeão,
eliminado, vice, posição); a luta do torneio troca revanche por continuar.
Pedido de arte ao Codex: cartões dos formatos, da dificuldade e troféu.
**Verificado:** 246 testes. No navegador: CPU contra CPU, Difícil 3x0 Médio
e Médio 3x0 Fácil; P1 parado aguenta 30 s contra o Fácil (81 de dano) e cai
em ~15 s contra Médio e Difícil. Mata-mata até campeão, eliminado nas
quartas, pontos corridos com recarga da página e Esc no meio da luta
voltando à mesma rodada; "?" sorteou pares diferentes três vezes; console
sem erro.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** o seletor de dificuldade da tela de
modo; o nome Jogar.
**Aprovado explicitamente:** a estrutura do menu ("é exatamente isso").
**Atrito:** o primeiro esboço confundiu; a estimativa de um fim de semana
pareceu longa a ele. Vitest estourando tempo com a máquina carregada.
**Em aberto:** arte dos cartões e do troféu; teste no celular; publicar.

## 2026-11-01: Vovô Coxa jogável só na máquina do João

**Marco:** 2, segue em andamento.
**Pedido:** ver como ficou o vovô do Coritiba e colocá-lo no jogo, sem ir
para a Vercel ("é só não subir pro git?").
**Feito:** a Vercel daqui não lê o git, publica a pasta pela CLI; o que
protege é publicar de cópia limpa do commit. Para não depender só disso,
`lutadores/index.ts` passou a ler `src/game/lutadores/locais/*.json` só no
`npm run dev`; a pasta e a arte do Coxa estão no `.gitignore`. O
`coxa.json` local usa as folhas montadas do Codex (512×320, andador
incluído) sem conversão: o vovô já tem 197 px e o pé a 27 px do fundo,
como o Saci. Golpes: batidinhas com o andador (soco), lata de cerveja em
parábola (chute), cabeçada (soco forte), voadora apoiada (chute baixo),
bebe e vira maromba (especial, só animação). `beer-throw` entrou no
criador de personagem.
**Verificado:** typecheck, 252 testes (os do JSON rodaram para o coxa),
build sem nenhum JS citando o Coxa. Luta Coxa x Saci no navegador: os
cinco golpes acertam (14, 24, 14, 18 e 32), console sem erro.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** nada.
**Atrito:** travei um comando com `cat >` sem entrada de novo.
**Em aberto:** estado maromba (5 s, mais dano e menos dano recebido) é
mecânica nova no motor; o especial hoje volta direto ao vovô. Faltam
pesado e rasteiro do maromba e a volta ao normal (definição do João).

## 2026-11-01: maromba de verdade, lata maior e pedido de arte v4

**Marco:** 2, segue em andamento.
**Pedido:** o vovô tem que ficar maromba por um tempo, com cronômetro
visível para os dois jogadores; a lata quase não aparecia; a mão de apoio
segura o nada em quase toda ação; refazer as animações partindo do andador.
**Feito:** especial novo `forma` no motor (`src/game/forma.ts`): o golpe
acerta e, no fim da sheet, o lutador vira outro registrado (`coxa-maromba`,
JSON local fora da seleção) por 5 s, batendo 25% mais e apanhando 25% menos.
O cronômetro ocupa a barra de especial (laranja, `MAROMBA 4`, pisca no
último segundo e meio); a barra não carrega enquanto isso. A volta espera
ele ficar livre e toca a transformação de trás para a frente até existir
`special-return`. Rodada nova volta ao normal. Lata 3,5× (era 8×14 px na
célula). Ficha do Coxa no GDD, `forma` no criador, pedido de arte em
`docs/coxa-pedido-v4.md` com a Regra do Andador.
**Verificado:** 262 testes; luta Coxa x Saci no navegador: soco normal 14,
estocada maromba 9 (7 × 1,25), cronômetro de 5 a 1 piscando no fim, volta
para `coxa` sem erro no console; foto da lata em voo, legível.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** as animações normais do Coxa vão ser
refeitas (pedido v4). Tentei estender skin com `moves` próprios para o
maromba e desfiz: skin exige pastas irmãs, e a arte do Coxa está espalhada
em rigido-v1 a v3. Virou JSON local próprio.
**Aprovado explicitamente:** a voadora apoiada é a melhor animação dele.
**Atrito:** nenhum.
**Em aberto:** pesado e rasteiro do maromba, a volta ao normal e os
multiplicadores de dano (provisórios) são definição do João; arte v4.

## 2026-11-01: voadora apoiada, a mão manda no corpo

**Marco:** 2, segue em andamento.
**Pedido:** na voadora o corpo precisa subir mais, o boneco quase não sai do
chão; manter a mão dele no andador em cada quadro.
**Feito:** medi a v3: no pico o pé fica a uns 45 px do piso, a cabeça desce
15 a 25 px abaixo do idle e a perna atravessa o andador. Reescrevi a
voadora no `docs/coxa-pedido-v4.md` como salto apoiado: mão esquerda presa
no mesmo ponto do andador em todo quadro, braço reto empurrando, quadril
até a mão, perna do chute acima do topo do andador, pés a uns 100 px do
chão no pico. Guia quadro a quadro com linhas-alvo gerado por
`scripts/coxa_guia_voadora_v4.py` (imagem local, fora do git).
**Verificado:** guia gerado e conferido a olho; arte ainda não refeita.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** a direção da voadora no pedido v4.
**Aprovado explicitamente:** nada.
**Atrito:** nenhum.
**Em aberto:** a sessão de arte refazer a voadora seguindo o guia.

## 2026-11-01: voadora com a mão presa, já no jogo

**Marco:** 2, segue em andamento.
**Pedido:** "Cadê as atualizações com os quadros que eu falei?" Eu tinha
entregado só o pedido de arte e o guia, sem nada novo no jogo.
**Feito:** `scripts/coxa_voadora_presa_v4.py` remonta a voadora da v3 com a
mão esquerda presa no topo do andador nos quadros 3 a 10 (na v3 ela
escorregava 21 px tubo abaixo). O corpo sobe 21 px, a perna do chute passa
acima do andador e a caixa de acerto subiu junto. Saída em
`rigido-v4-provisorio` (local, fora do git); o `coxa.json` local aponta
para ela.
**Verificado:** 262 testes; luta Coxa x Saci com o jogo congelado no quadro
8: vovô acima do andador, mão no topo, chute por cima; a voadora acerta (14),
console sem erro.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** a voadora (provisória até a arte v4).
**Aprovado explicitamente:** nada.
**Atrito:** ele esperava ver quadros, e eu tinha entregado só documento.
**Em aberto:** braço ainda dobrado e pés a ~70 px; o salto completo do guia
pede desenho novo.

## 2026-11-01: revisão v4 do Coxa no jogo

**Marco:** 2, segue em andamento.
**Pedido:** "Adicione as novas animações que o codex fez."
**Feito:** o `coxa.json` e o `coxa-maromba.json` locais passaram a usar
`revisao-v4` (20 ações normais, 16 maromba, lata nova de 8 quadros 32×32).
Caixas de acerto medidas de novo quadro a quadro: o rápido normal virou
duas estocadas com os pés do andador (quadros 3 e 5, 10 quadros); a
cabeçada alcança 175; o maromba estoca no quadro 2, chuta nos 3 e 4, e a
voadora dele tem uma caixa por quadro. Retrato e âncora refeitos do idle
novo. A voadora normal **ficou na provisória**: a da v4 é a mesma da v3
(hash igual), a que o João criticou. As gotas de cerveja
(`beer-drops.png`) não entraram: o motor ainda não tem emissor de
partícula preso ao projétil.
**Verificado:** 262 testes, build sem o Coxa no `dist`; luta Coxa x Saci:
estocadas 7 + 7, lata nova visível no voo, especial vira maromba com o
andador de lado e cronômetro, estocada maromba 9, console sem erro.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** a arte do Coxa inteira, trocada pela v4.
**Aprovado explicitamente:** nada.
**Atrito:** o primeiro teste mediu só 7 nas estocadas porque o jogo estava
congelado no meio do golpe; sem congelar, as duas acertam.
**Em aberto:** voadora com desenho novo; lata ainda 8×14 px (o pedido era
~20×35, segue ampliada 3,5× no jogo); gotas; pesado e rasteiro do maromba;
volta ao normal.
