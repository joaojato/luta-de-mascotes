# Guia de criação e entrega de sprites de Luta de Mascotes

Este documento é para os integrantes do grupo e para o GPT que vai ajudá-los. O objetivo é entregar um mascote consistente com o jogo, com imagens utilizáveis e arquivos identificados. Leia o guia inteiro ou envie este arquivo ao seu GPT junto com o pedido da seção 2.

Base conferida em 26/10/2026: scripts do projeto, produção do Urubu, produção do Almirante e lições registradas no diário. Há instruções antigas sobre ferramentas pagas em outros documentos. Para esta tarefa, o caminho recomendado é gerar imagens no chat que você já utiliza, usando personagens e movimentos do repositório como referência. Não é necessário contratar Spriterrific.

## 1. O que combinar antes de começar

- Qual mascote você vai produzir e qual será seu identificador, por exemplo `tigre`. Use minúsculas, sem espaços nem acentos nos nomes de arquivos.
- Se vai fazer somente arte ou também integrar ao jogo. Para enviar os sprites ao João, use preferencialmente uma pasta compartilhada no Google Drive, conforme a seção 10. Se também integrar código, envie o pull request.
- Se já existe um modelo aprovado, use esse modelo. Se não existe, comece pela imagem de identidade e pelo idle. Não gere todas as ações antes disso.
- Cada pessoa trabalha em um mascote e em sua própria branch. João reúne as contribuições. Não substitua o trabalho de outro integrante.

O jogo é de luta 2D com mascotes reinterpretados, atitude de torcida e visual de arcade, próximo da direção de Street Fighter Alpha. Não usar sangue, escudos, patrocinadores, nomes de clubes ou texto na roupa. Preserve a personalidade do mascote sem copiar o desenho oficial.

## 2. Pedido pronto para enviar ao seu GPT

Copie o bloco abaixo e substitua os campos entre colchetes. Anexe este guia. Se o GPT não consegue acessar o repositório, envie também os arquivos indicados na seção 4.

```text
Você vai me ajudar a produzir os sprites do mascote [NOME], identificador
[SLUG], para o jogo Luta de Mascotes. Minha entrega será [SOMENTE ARTE /
ARTE E INTEGRAÇÃO]. Meu modelo aprovado é [ARQUIVO OU AINDA NÃO EXISTE].

Leia o guia anexado e siga suas etapas até a entrega. O repositório é
https://github.com/joaojato/luta-de-mascotes. Não presuma que consegue
acessá-lo nem que tem ferramenta de geração de imagens, terminal ou Git.
Confira suas capacidades e use o caminho possível. Se faltar acesso,
indique exatamente quais arquivos eu preciso anexar e continue com eles.

Primeiro leia CLAUDE.md, docs/licoes.md, docs/gdd.md e este guia.
Consulte docs/almirante-sprites.md para o processo que já funcionou.
Confira o código atual antes de executar comandos de documentação antiga.

Trabalhe só neste mascote. Fixe sua descrição visual e a referência de
identidade; gere e confira o idle antes das outras ações. Use as sheets
do jogo como referência de movimento, sem copiar a identidade delas.
Uma ação por vez. Preserve direção para esquerda, anatomia, roupa,
escala e eixo. Não tente corrigir desenho inconsistente esticando cada
quadro. A saída final usa PNG com alpha, células 256x256 e cinco colunas.

Para cada ação, informe referências anexadas e a função de cada uma,
quantidade de quadros, sequência de poses, nome e destino do arquivo.
Não afirme que gerou, salvou, testou, enviou ou integrou sem ter feito.
Se não puder gerar imagens, prepare o prompt e as referências para eu
usar em um chat com geração de imagens, depois receba o PNG para revisão.

Se houver integração: confira scripts/sprite.py --help; registre os PNGs
no JSON correto; revise caixas e quadros ativos na Academia; execute
npm run check. Não altere o motor para acomodar um mascote. Se uma ideia
precisar de mecânica nova, entregue a arte e descreva a pendência ao João.

Conecte também o Google Drive à minha sessão, se essa integração estiver
disponível, orientando-me a entrar na minha própria conta Google.
Confira se consegue ler e enviar arquivos; não presuma que conexão dá
permissão de upload. Organize os PNGs originais e o relatório numa pasta
de entrega compartilhada com João. Se não conseguir enviar pelo conector,
disponibilize os arquivos para download e me oriente no upload manual.
Confirme o conteúdo enviado e o acesso de João antes de declarar entregue.

No fim, entregue os arquivos novos de verdade e um relatório com ações,
quadros, fps, referências, verificações e pendências. Use branch própria
e pull request para integração, e Google Drive para entregar a arte.
Se não tiver Git, a pasta no Drive basta para João receber os sprites.
Não envie um
Download ZIP do repositório como se fosse o personagem produzido.
```

## 3. Acesso ao Git e preparação local

### Com acesso de colaborador

1. Entre na sua conta do GitHub. Peça ao João acesso a `joaojato/luta-de-mascotes` e aceite o convite. O último registro do projeto informa que o repositório está privado.
2. Abra o endereço do repositório estando conectado. Se aparecer 404, confirme conta e convite com João. Não precisa tornar o projeto público.
3. Para trabalho local, tenha Git, Node.js compatível com o projeto e Python 3.10 ou superior. Verifique as versões no terminal. O script de sprites importa Pillow.
4. Clone o repositório. Autentique na sua própria conta quando solicitado. Não envie senhas, tokens ou chaves ao GPT.

```powershell
git clone https://github.com/joaojato/luta-de-mascotes.git
cd luta-de-mascotes
git remote -v
git status --short
git switch -c sprites/tigre-seunome
npm ci
python --version
python -m pip install Pillow
npm run sprite -- --help
npm run dev
```

Troque `tigre-seunome` pelo seu mascote e seu nome. Abra o endereço exibido pelo Vite. `npm ci` usa o arquivo de dependências já travado no projeto. Se `python` não for encontrado, corrija a instalação ou o PATH; o comando `npm run sprite` chama especificamente `python`.

Para uma cópia local já existente, confira `git status` antes de atualizar. Com a árvore limpa, use `git switch main`, `git pull --ff-only` e crie sua branch. Se houver alterações, preserve-as e resolva o estado antes de trocar de branch. Não use reset ou limpeza para apagar trabalho.

Um chat que lê arquivos do GitHub não necessariamente consegue escrever neles, gerar imagens ou executar o jogo. Verifique o que está disponível na sessão. O acesso ao GitHub também não transfere arquivos da sua máquina automaticamente.

### Sem Git ou sem terminal

Peça ao João os arquivos da seção 4 e siga o caminho de arte. Você pode produzir as imagens no seu chat e entregar um pacote para o João integrar. Não precisa configurar API ou ambiente de programação para desenhar.

## 4. O que procurar e quais imagens usar

| Material | Onde procurar | Função |
|---|---|---|
| Regras do projeto | `CLAUDE.md`, `docs/licoes.md` | Evitar erros já conhecidos |
| Identidade e golpes | `docs/gdd.md`, `docs/mascotes/<slug>.md` | Saber quem é o mascote e o que faz |
| Exemplo de produção concluída | `docs/almirante-sprites.md` | Consultar poses e correções que funcionaram |
| Identidade do seu mascote | Modelo aprovado ou `anchor-w.png` da skin correta | Fixar rosto, corpo, roupa e paleta |
| Escala e acabamento | `idle.png` da mesma skin | Régua do tamanho, eixo e pés |
| Movimento principal | `public/assets/lutadores/_amostra-green-boxer/` | Modelo usado para as ações do Almirante |
| Movimento complementar | `public/assets/lutadores/_amostra-red-brawler/` | Chute e outras ações disponíveis |
| Resultado do projeto | `public/assets/lutadores/almirante/base/` e `public/assets/lutadores/urubu/frente/` | Comparar o novo mascote com o elenco |
| Dados de animação | `src/game/lutadores/<slug>.json` | Arquivo, quadros, fps, caixas e skins |

**Atenção às referências ausentes:** `referencia/` fica fora do Git. O clone não traz `modelo-oficial.png` nem as rodadas brutas. Se o modelo original não estiver disponível, peça ao João ou use a âncora aprovada que está em `public/assets/`. Para usar o comando `pedido`, copie a imagem aprovada para `referencia/<slug>/modelo-oficial.png` na sua máquina.

Não use o retrato de busto como única referência de corpo. Não use a skin `costas` do Urubu para substituir silenciosamente o modelo `frente`. As pastas `_amostra-*` são referências internas de pose; seus personagens não são a arte final do novo mascote.

Se o GPT só recebe anexos, envie: este guia, descrição do mascote, imagem de identidade, idle aprovado e a sheet da ação desejada. Para integrar, envie também o JSON do mascote e os arquivos de código que o GPT precisar consultar.

## 5. Fixar o personagem e aprovar o idle

1. Escreva uma descrição curta e estável: espécie ou figura, cabeça, compleição, roupa, três cores principais, acessórios indispensáveis e atitude.
2. Salve essa descrição em `docs/mascotes/<slug>.md`. Para o script ler, coloque o texto entre `<!-- DESCRICAO:INICIO -->` e `<!-- DESCRICAO:FIM -->`, como nos exemplos do Urubu e do Almirante.
3. Gere uma imagem de corpo inteiro, em guarda, vista de três quartos voltada para a esquerda. Inclua cabeça, mãos, pés e acessórios com folga. Fundo transparente, sem cenário.
4. Corrija defeitos pontuais com uma instrução curta: por exemplo, remover somente o símbolo do chapéu. Não recomece a descrição inteira a cada ajuste.
5. Gere o idle: pés plantados, guarda alta e respiração discreta. Compare com Almirante e Urubu, lado a lado na mesma escala.
6. Com o idle aprovado, trave a identidade. Use seu primeiro quadro como base para as demais ações. Trocar o idle depois exige revisar toda a coleção.

Molde para a identidade:

```text
Create one full-body original 2D arcade fighting-game mascot:
[DESCRIÇÃO VISUAL]. Three-quarter fighting guard facing left, fists raised,
strong readable silhouette, consistent high-fidelity pixel-art finish like
the attached project reference. Entire body inside the image with generous
clear margins. Transparent background. No text, logos, crest, ground shadow
or extra characters.
```

## 6. Gerar uma ação com as referências certas

Recomendação: uma ação por imagem, com poucas poses legíveis. Anexe os arquivos de verdade; escrever o caminho no prompt não envia a imagem.

Use sempre a mesma ordem e declare os papéis:

1. **Imagem 1: identidade.** Seu mascote aprovado, preferencialmente em guarda.
2. **Imagem 2: movimento.** Ação equivalente de um lutador de referência.
3. **Imagem 3, se necessária: primeiro quadro do idle.** Régua de escala e eixo quando a imagem 1 ainda for uma ilustração de conceito.

Prompt curto para o gerador:

```text
Replace the fighter in image 2 with the character from image 1.
Keep the same [N] poses in reading order, all facing left.
Image 1 defines identity and costume; image 2 defines motion only.
[DESCRIÇÃO VISUAL TRAVADA].
Keep head and torso size consistent. Start from the approved idle guard
[in image 3, if attached]. Stationary actions keep the feet planted.
Full bodies, clear gaps, transparent background, no grid lines or text.
Action: [AÇÃO E SEQUÊNCIA DE POSES].
```

Confira os números dos anexos antes de enviar. Os prompts históricos do Almirante usam outra ordem; não os copie sem adaptar. Não peça ao modelo para inventar poses intermediárias de todas as ações em uma imagem grande.

Para uma saída em fileira, peça `[N] frames in one horizontal row`. Ela será alinhada depois pelo importador. Para uma sheet final, peça `5 columns, [R] rows, [N] frames, unused cells empty`; ainda será necessário conferir as dimensões no arquivo baixado. O gerador pode não respeitar a grade em pixels.

### Quantidades iniciais de quadros

Estes são os padrões do script `pedido`, não uma obrigação de todas as skins. Uma referência já aprovada pode ter outra contagem. O JSON precisa refletir o PNG real.

| Ação | Quadros iniciais | O que deve aparecer |
|---|---:|---|
| `idle` | 4 | Respiração discreta em guarda, sem passos |
| `walk-forward` | 6 | Passos para frente com guarda |
| `walk-backward` | 6 | Recuo com guarda, sem virar de costas |
| `crouch` | 3 | Flexão dos joelhos, sem encolher anatomia |
| `jump` | 5 | Preparação, subida, ar e aterrissagem |
| `block-high` | 4 | Antebraços realmente cobrindo a cabeça |
| `block-low` | 4 | Defesa agachada |
| `hit-high` | 4 | Reação ao impacto e recuperação |
| `light-punch` | 6 | Guarda, preparação, extensão e retorno |
| `heavy-kick` | 6 | Preparação, chute forte e recuperação |
| `special-charge` | 4 | Antecipação do especial |
| `special` | 8 | Ataque característico definido no GDD |
| `knockdown` | 6 | Perda de equilíbrio, queda e corpo no chão |

`heavy-punch` e efeitos específicos podem existir no JSON atual, mas não fazem parte de todas as tabelas do script. Confira suporte e referência antes de pedir. Não crie mecânica nova só porque uma animação foi desenhada. O registro de 14/10 mostrou que uma ação visível na Academia pode não ter botão correspondente na luta.

## 7. Parâmetros do arquivo final

| Parâmetro | Padrão de entrega |
|---|---|
| Formato | PNG RGBA com transparência real |
| Célula | 256 × 256 pixels |
| Colunas | 5, inclusive na última linha incompleta |
| Largura da sheet | 1280 pixels |
| Altura | `256 × teto(N / 5)` pixels |
| Ordem | Esquerda para direita, depois linha seguinte, sem buracos entre quadros |
| Células restantes | Totalmente transparentes |
| Orientação | Esquerda; o motor espelha para direita |
| Escala e eixo | Medidos contra o idle da mesma skin |
| Primeiro quadro | Igual ao primeiro quadro do idle, conforme a regra do projeto |
| Chão | Linha dos pés do idle; no Almirante a referência usada foi y=228 |
| Cadência | Usar os valores do JSON/referência; 8 fps para andar e 10 para golpe são pontos de partida, sujeitos à revisão |
| Repetição | Loops para idle/andar; ações pontuais conforme definição existente |

Exemplos: 4 quadros usam 1280 × 256; 6 ou 8 usam 1280 × 512; 12 usam 1280 × 768. Uma grade pintada ou um fundo quadriculado desenhado não é transparência.

Não force todos os desenhos a terem a mesma altura aparente: agachar diminui a altura da pose; saltar altera a posição vertical; cair gira o corpo. A anatomia permanece do mesmo tamanho. Não redimensione cada quadro separadamente para fazê-lo preencher a célula. Use nearest-neighbor ao ampliar pixel art para inspeção.

Deixe folga para socos, bico, chapéu e botas. Nada pode entrar na célula vizinha. Efeitos, como tornado ou caravela, só entram em arquivos separados se a integração atual definir como serão usados. O personagem básico não deve vir com aura ou sombra embutida.

## 8. Importar e registrar no projeto

Esta seção é para quem tem terminal e integra o personagem. Substitua `tigre` e `base` pelos nomes reais.

### Preparação de um mascote novo

O script não cria um lutador do zero. Antes de `pedido` ou `entrega`, devem existir o JSON válido em `src/game/lutadores/<slug>.json`, a descrição marcada em `docs/mascotes/<slug>.md` e o modelo oficial local. Use um JSON existente como estrutura, revise identificadores, caminhos e ações e registre o lutador em `src/game/lutadores/index.ts` seguindo o padrão atual. Não deixe nomes e referências do personagem copiado.

Se houver `skins`, a primeira é a base e deve ter todos os arquivos. Variantes declaram suas ações e números próprios e herdam o restante. Um mascote sem `skins` pode usar arquivos diretamente em sua pasta, como ocorre com o Saci na cópia local consultada. Não acrescente `base/` por suposição: confira o JSON.

### Preparar o pedido automaticamente

```powershell
npm run sprite -- pedido tigre light-punch --skin base
```

O comando cria `referencia/pedidos/tigre-light-punch/` com `prompt.txt`, `1-personagem.png` e `2-movimento.png`. Use os dois anexos nessa ordem. Por padrão, o script usa Red Brawler para movimento; ele não escolhe Green Boxer automaticamente. Para repetir o método do Almirante, prepare as referências do Green Boxer manualmente, sem alterar o script compartilhado só para isso.

Para reduzir erros, baixe o resultado para um caminho explícito e importe:

```powershell
npm run sprite -- entrega tigre light-punch "C:\Users\SEU_USUARIO\Downloads\tigre-light-punch.png" --skin base
```

Esse comando recorta, alinha e atualiza dados da ação no JSON. Confira o resultado contra o idle: o alinhamento automático não garante consistência do desenho. Não basta copiar a imagem para uma pasta.

### Sheet já montada na grade correta

Salve em `public/assets/lutadores/tigre/base/light-punch.png` e rode:

```powershell
npm run sprite -- registrar tigre light-punch --skin base
```

O comando mede quadros e caixa visual e registra o JSON. Não é um validador completo da largura, dos buracos na sequência ou da identidade. Confira esses itens antes. Se detectar sobras, inspecione-as. `registrar --limpar` apaga ilhas que a heurística considera sujeira e pode apagar detalhe legítimo; preserve o original e compare depois.

O JSON precisa apontar para arquivo, quantidade real de `frames`, `frameRate`, `repeat` e `defaultVisual`. Ataques exigem revisão de `attack`, quadros ativos e caixas; bloqueios exigem os dados de guarda conforme o formato atual. O registrador pode preservar dados antigos de ataque, que deixam de corresponder às poses quando a animação muda.

`escalar` e `firmar` existem para ajustes, mas não corrigem mudança de anatomia. Sobreponha ao idle antes de aceitar a correção. Se o desenho varia, refaça a geração a partir do idle.

O modo `--aguardar` é opcional e observa imagens novas em Downloads/Desktop. Pode capturar um download sem relação com a ação. O caminho explícito em `entrega` é mais fácil de conferir. O modo `lote` existe, mas deixe para depois que uma ação completa tiver sido validada.

## 9. Revisão antes de entregar

- [ ] Baixei o PNG original, em vez de captura de tela ou prévia da conversa.
- [ ] Todos os quadros mantêm roupa, cores, espécie, acessórios e anatomia.
- [ ] A direção é esquerda e o primeiro quadro corresponde ao idle.
- [ ] O personagem não cresce, diminui ou desliza nas ações paradas.
- [ ] A defesa realmente protege; o golpe tem preparação, impacto legível e recuperação.
- [ ] As figuras estão inteiras, sem membros extras, contaminação do vizinho ou quadros colados.
- [ ] A transparência é real; não há grade, texto, logo, sombra ou franja de chroma.
- [ ] A contagem é a real, com cinco colunas e células restantes vazias no arquivo final.
- [ ] Comparei todas as ações lado a lado com o idle na mesma escala.
- [ ] Vi a animação tocando e também os quadros isolados, não somente a sheet inteira.

Para integração, abra `npm run dev`, entre na Academia e selecione o mascote e a skin. Confira todas as ações quadro a quadro com caixas visíveis, principalmente impacto, bloqueio, salto e queda. Depois teste na luta as ações acessíveis pelos controles atuais.

Execute `npm run check`, que reúne TypeScript, testes e build. Registre o resultado real. Se só produziu arte ou não conseguiu abrir o jogo, declare “integração/Academia não verificadas”. Uma imagem bonita e testes passando não substituem a revisão da animação.

## 10. Como enviar a entrega correta

### Caminho recomendado para os sprites Google Drive

Conecte o Google Drive ao seu GPT para facilitar a consulta às referências e a organização da entrega. Cada integrante conecta sua própria conta. A conexão com o GPT e o compartilhamento com João são etapas distintas: conectar sua conta não dá acesso automático ao João.

1. Na área de apps ou plugins da sua versão do ChatGPT/Codex, procure **Google Drive**, escolha conectar e siga o login do Google. Confira a conta e as permissões solicitadas. A disponibilidade e os nomes dos menus podem variar conforme a conta e o ambiente. Se a integração não aparecer, use o Drive pelo navegador; isso não impede a entrega.
2. Depois, envie ao GPT: “Use o Google Drive conectado. Confira se você consegue consultar a pasta de entrega e fazer upload dos PNGs. Se só puder ler, prepare os arquivos para eu enviar manualmente.”
3. Se João já forneceu uma pasta do grupo, use o link exato e crie uma subpasta para o seu mascote. Para adicionar arquivos, sua conta precisa ter permissão de edição nessa pasta. Se não houver pasta do grupo, crie uma no seu próprio Drive e compartilhe com o e-mail Google que João informar. Não deduza o e-mail pelo usuário do GitHub.
4. Organize cada entrega em uma pasta, por exemplo `Luta de Mascotes/Entregas/tigre/seunome-v01/`, com `LEIA-ME.md`, `modelo-aprovado.png`, `sprites/` e, se houver, `originais/` e `previa.gif`. Use a estrutura e o relatório descritos na opção B abaixo. Os PNGs individuais devem estar disponíveis; ZIP pode acompanhar como cópia adicional.
5. Peça ao GPT para enviar os arquivos se ele tiver essa capacidade. Se não tiver, baixe os PNGs originais do chat, abra a pasta em `drive.google.com` e use **Novo > Upload de arquivo/Upload de pasta**, ou arraste os arquivos para a pasta. Aguarde o upload terminar. Não envie somente links temporários de download do chat.
6. Compartilhe a pasta com João como leitor para receber e baixar, ou editor se ele precisar organizar e ajustar os arquivos. Confira se o download está permitido. Na pasta do grupo, confira se João já tem acesso. Não é necessário tornar os arquivos públicos.
7. Reabra a pasta no Drive e confirme nomes, quantidade e presença dos PNGs. Abra ao menos um arquivo para conferir o conteúdo. Se o GPT fez o envio, peça que liste os arquivos na pasta após o upload. Isso confere o conteúdo, mas não substitui a verificação das permissões de João.
8. Envie ao João o **link da pasta**, mascote, versão, lista de ações e pendências. Confirme que a permissão foi concedida à conta correta. Preserve essa versão da entrega; correções seguintes ficam em `v02`, sem apagar a anterior.

Mensagem pronta para acompanhar o link:

```text
João, os sprites do [MASCOTE] estão nesta pasta: [LINK DO DRIVE].
Versão: [v01]. Ações: [LISTA].
Arquivos: [PNGs finais na grade / originais que precisam alinhar].
Conferido: [O QUE FOI VERIFICADO]. Pendências: [LISTA OU NENHUMA].
Compartilhei com sua conta [E-MAIL CONFIRMADO] como [LEITOR/EDITOR].
Integração no jogo: [NÃO FEITA / LINK DO PR].
```

O Drive é o canal recomendado para entregar imagens e referências ao João. O Git continua sendo usado para versionar os assets finais integrados e os dados do jogo. Colocar um PNG no Drive não o registra no JSON nem o inclui no jogo.

### Opção A Arte e integração por branch e pull request

Revise a lista de mudanças. Adicione somente os caminhos do seu trabalho, nunca `git add -A` sem inspeção. Exemplo para um mascote novo com skin base:

```powershell
git status --short
git diff --stat
git add public/assets/lutadores/tigre/base/
git add src/game/lutadores/tigre.json
git add docs/mascotes/tigre.md
git diff --cached --stat
git diff --cached --name-only
git commit -m "Adiciona sprites do Tigre"
git push -u origin sprites/tigre-seunome
```

Inclua também o registro em `index.ts` e outros arquivos necessários que você realmente editou, após revisar o diff. O exemplo não lista automaticamente todas as mudanças. Confira se o PNG e o JSON novos aparecem no commit. Não envie `.env`, material bruto, dependências ou mudanças de outros mascotes.

Abra um pull request da sua branch para `main`. Escreva quais ações foram adicionadas, como foram verificadas, quais pendências existem e anexe uma prévia quando possível. Envie ao João o link do PR e o identificador do commit. João faz a revisão e a integração com o restante do grupo. Não faça merge nem push direto em `main` como parte desta entrega.

### Opção B Somente arte em pasta no Drive ou pacote

Organize a pasta de entrega no Drive com esta estrutura de exemplo. Se necessário, envie também um ZIP criado a partir desses mesmos arquivos:

```text
tigre-entrega/
  LEIA-ME.md
  modelo-aprovado.png
  sprites/
    idle.png
    light-punch.png
    ...demais ações produzidas...
  previa.gif                 opcional
```

Se as imagens ainda não estão na grade final, coloque-as em `originais/` e declare “precisa alinhar”. Não apresente arquivo bruto como sheet pronta. Inclua apenas as ações que produziu, com nomes exatos e sem versões ambíguas como `final-final2.png`.

O `LEIA-ME.md` deve informar:

```text
Autor:
Mascote e slug:
Skin/modelo:
Entrega: somente arte ou integrada
Referência de identidade:
Referências de movimento:
Arquivo | ação | quadros | dimensões | fps proposto | loop ou ação única
O que foi conferido visualmente:
Academia e luta: verificadas ou não verificadas
npm run check: resultado ou não executado
Pendências e diferenças em relação ao pedido:
```

Abra o ZIP antes de enviar e confirme que os seus PNGs estão dentro. **O botão “Download ZIP” do GitHub baixa o código que já está no servidor. Ele não inclui imagens que ficaram somente no seu computador ou no seu chat.** Foi exatamente esse o problema da entrega examinada em 23/10.

Referências e originais podem acompanhar o pacote para João, mas ficam fora do Git do projeto. Somente assets finais e documentação necessária devem ser versionados.

## 11. Problemas frequentes

| Problema | Próxima ação |
|---|---|
| GPT diz que não acessa o GitHub | Enviar os arquivos da seção 4 ou trabalhar no clone local com um agente que tenha acesso |
| Drive conectado, mas GPT não consegue enviar PNG | Baixar os arquivos e fazer upload manual na pasta de entrega |
| João abre o link e recebe pedido de acesso | Conferir o compartilhamento com o e-mail Google correto e as permissões da pasta |
| Falta `modelo-oficial.png` | Obter o modelo aprovado ou copiar a âncora aprovada para o caminho local exigido |
| Script diz que falta JSON ou descrição | Preparar a estrutura do mascote antes de executar `pedido` |
| Ação não existe no Red Brawler | Escolher referência compatível manualmente; não inventar suporte no script |
| Mascote muda entre os quadros | Refazer a ação usando o idle como base e a mesma identidade |
| Cresce ou afunda no chão | Comparar na régua do idle e revisar montagem; não compensar pelo zoom do jogo |
| Defesa parece idle | Pedir somente a correção dos antebraços cobrindo o rosto |
| Fundo parece transparente, mas tem xadrez | Gerar/exportar com alpha real e conferir em fundo sólido |
| Chute ou queda perde bota ou mão | Refazer enquadramento/encaixe preservando o corpo inteiro |
| Imagem está na pasta e não aparece | Conferir JSON, skin, registro do lutador e caminhos |
| Aparece na Academia, mas não sai na luta | Conferir o mapeamento atual de controles e mecânicas com João |
| ZIP contém só o projeto conhecido | Montar um pacote com os arquivos efetivamente produzidos |

## 12. Fontes para consulta

O método visual deste guia vem de `docs/licoes.md`, `docs/almirante-sprites.md`, `docs/mascotes/urubu.md`, `docs/mascotes/almirante.md`, `scripts/sprite.py` e `scripts/alinhar_sheet.py`. O diário de 23/10 registra o problema do ZIP sem alterações.

Para conexão e entrega no Drive: [conexões e login nas contas Google no ChatGPT](https://learn.chatgpt.com/docs/enterprise/shared-connections), [upload de arquivos e pastas](https://support.google.com/drive/answer/2424368?hl=pt-BR) e [compartilhamento e níveis de acesso](https://support.google.com/drive/answer/7166529?hl=pt-BR). As capacidades disponíveis devem ser conferidas na sessão de cada integrante.

Para o fluxo de colaboração: [clonar um repositório](https://github.com/git-guides/git-clone), [criar e trocar branches](https://git-scm.com/docs/git-switch), [selecionar arquivos para o commit](https://git-scm.com/docs/git-add/) e [pull requests](https://docs.github.com/en/pull-requests/reference/pull-requests). Clone baixa o projeto; a branch guarda sua contribuição; o commit registra os arquivos selecionados; push envia a branch; o pull request apresenta a alteração para revisão.
