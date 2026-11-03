# Gremista — passos com direita à frente e cortes leves

Correção posterior à coesão v3, solicitada pelo usuário em 02/11/2026.
Altera somente `walk-forward`, `walk-backward` e `light-punch`, oito
quadros cada, mantendo os FPS existentes (8, 8 e 20 respectivamente).
Células 640×384, cinco colunas, origem 320,360.

## Pernas e deslocamento

Nas duas caminhadas a direita anatômica A conduz à esquerda da tela,
próxima da câmera; a esquerda B fica atrás, à direita da tela e distante.
A coxa direita sobrepõe a esquerda de forma contínua, sem trocar a
ligação quadril–joelho–pé. Esta correção específica substitui a anotação
anterior que colocava a esquerda à frente nessas ações.

São passos curtos de esgrima, sem ultrapassagem dos pés. No avanço a
direita dá o passo (1–4), a esquerda acompanha (5–7). No recuo a esquerda
de trás abre distância (1–4), a direita acompanha (5–7), permanecendo
à frente. Sem espelhar o corpo, trocar a espada de mão ou inverter uma
pose isolada. O motor continua responsável pelo deslocamento mundial.
A guarda parada e as demais ações não foram refeitas neste pedido.

## Ataque rápido

Dois cortes compactos em 2 e 5, com movimento pequeno de punho/antebraço,
cotovelo dobrado, pés plantados e tronco ereto. Sem preparação acima da
cabeça, agachamento, avanço ou grande golpe descendente. A hanger mantém
o comprimento físico; reduz-se o arco do corte e a extensão do braço.
O braço A direito mantém a espada, B esquerdo mantém a guarda.
Os estados de guarda 0/7 usam a guarda de produção exata, como na v3;
todos os contatos e preparações têm desenhos próprios.

## Produção e entrega

Gerado com a ferramenta de imagens embutida, uma chamada por ação,
anexando a guarda da própria skin. Cabelo e pelos faciais permanecem
pretos, uniforme manga longa e duas pistolas nos coldres.
Magenta opaco nas fontes, removido dos PNGs de produção; alfa binário,
sem halo branco, resíduos rosa ou corte de pontas. Escala uniforme por
ação: 0,49 nas caminhadas e 0,48 no leve, escolhida pelo corpo e pela
lâmina, sem normalizar cada quadro pelo retângulo da pose.

- PNGs: `public/assets/lutadores/mosqueteiro-gremio/passos-v4/`.
- Prévia, prompts, fontes, quadros e GIFs:
  `output/gremista-passos-v4/revisao.html` e subpastas por ação.
- Manifesto com hashes e metadados: `passos-v4/manifest-art.json`.
- Montagem/validação: `python scripts/gremista_passos_v4.py finalize`.
- Backup anterior: `output/gremista-passos-v4/runtime-before.json`.

Integração troca apenas os três caminhos de PNG no JSON existente.
Contagens, FPS, janelas, caixas de combate, velocidades, dano e NPC
permanecem como estavam. Caixas antigas não foram recalculadas a partir
dos desenhos; a conferência de alcance em combate continua pertencendo
à Academia/integração. Inspeção técnica de fonte inteira e quadros
montados não é aprovação do usuário nem teste de uma partida.

Não reaplicar as três fontes v3 sobre esta correção v4.

Validação: três folhas / 24 quadros, margens, dimensões, sobras vazias,
hashes, alfa 0/255 e ausência de magenta passaram. JavaScript da prévia
passou em `node --check`; TypeScript passou em `npm run typecheck`.
Os 94 testes do registro de lutadores passaram. Nenhuma partida foi
executada nesta revisão de arte.

Durante a produção houve alteração paralela na configuração das pistolas.
A integração preservou o documento mais recente e verificou que somente
os três caminhos de imagem foram trocados por este script. Backup exato
antes da aplicação em `runtime-integration-before.json`.
