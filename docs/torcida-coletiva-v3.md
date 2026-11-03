# Comemoração coletiva da torcida — 03/11/2026

Correção de escopo do João: a animação é para toda a arquibancada, baseada na torcida que já existe no jogo. A entrega isolada v2 não atendia ao pedido.

## Arte e integração

`public/assets/cenarios/estadio/torcida/torcedores-comemoracao-v3.png`: 256×800 RGBA, células 64×80, quatro colunas e dez tipos, 40 quadros. Produzida pela ferramenta integrada de imagens com o atlas original anexado como referência de proporções, acabamento e organização. Os tipos desta versão são adultos masculinos sem camisa, com variação de cabelo, pele, idade aparente e porte. Não representam literalmente as mulheres e a criança do atlas antigo.

Colunas: punhos junto aos ombros; salto com braços em V; punho direito erguido; punho esquerdo erguido. Braço direito anatômico à esquerda da imagem, esquerdo à direita, sem giros nem cruzamentos. Cintura ancorada em y=79, com elevação de 5 px no pulo e 2 px na última pose. Pernas ocultas pela arquibancada.

`src/game/torcidaCena.ts` carrega o novo atlas e percorre 0–3 a 6 FPS, preservando fases e ritmos individuais, distribuição com semente fixa, fileiras, escala, camadas, bandeiras e sinalizadores existentes. `torcida.json` descreve os novos tipos e poses. A comemoração passa a ser o loop ambiente da torcida; não introduz reação a acertos ou K.O. O atlas antigo está preservado.

## Conferência

Fonte inteira e contato dos 40 quadros inspecionados: peito descoberto, mãos completas, conexão dos braços, margens e identidade por linha. Montagem com escala uniforme de 0,32, sem deformação de partes; componentes soltos de células vizinhas removidos. Dimensões e margens verificadas por script.

`output/torcida-coletiva-v3/estadio.gif` mostra a composição offline com 708 pessoas nas fileiras reais; não é captura do jogo. `estadio.png`, `contato.png`, fonte, prompt completo, script, manifesto anterior e relatório com hash ficam na mesma pasta. A prévia usa passos de 180 ms, próximos do ritmo nominal com variação individual do runtime; não reproduz bandeiras ou fumaça.

Aceite visual do usuário e inspeção em combate permanecem pendentes. A entrega isolada `comemoracao-sem-camisa-v2.png` não é carregada.

Validação: `npm run check` concluído com sucesso (TypeScript, 312 testes e build). Build informa referência preexistente a `atlas-transparent.png` não resolvida e aviso de tamanho do bundle.

## Camisa por cima (03/11/2026)

O "sem camisa" era a base para vestir os clubes por cima. Ligada direto, a
v3 tirou a cor de toda a arquibancada: sem magenta, `pintarChave` não tem o
que pintar. `scripts/torcida_camisa.py` pinta em cada um dos 40 quadros uma
camiseta de manga curta em magenta, com a sombra da pele, sem mexer em
nenhum outro pixel, e grava `torcedores-comemoracao-v3-camisa.png`, que é o
atlas carregado. Prévia lado a lado: `output/torcida-camisa-v1/contato.png`.
`--sem <tipos>` deixa tipos sem camisa, se um dia quiserem o torcedor que
tirou a camisa. O teste "atlas da torcida que a Luta carrega" exige cor
chave em toda célula.
