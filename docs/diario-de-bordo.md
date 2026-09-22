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
