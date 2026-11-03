# Gremista — postura, passos completos e ataques de ponta

Pedido de 03/11/2026. O usuário rejeitou as pernas quase imóveis,
joelhos voltados para trás e giro isolado dos pés nas caminhadas. Também
pediu mais intenção de espetar/agressividade no rápido e no golpe baixo,
que pareciam movimentar somente o punho. Esta correção prevalece sobre
o antigo contrato de manter o cotovelo perto das costelas durante cortes
muito pequenos e sobre a interpretação de apenas girar a lâmina.

## Quatro ações refeitas

| Ação | Quadros / FPS | Movimento |
|---|---|---|
| walk-forward | 8 / 8 | A direita à frente levanta coxa/joelho/bota, alcança e pousa; B esquerda acompanha com flexão e levantamento completos. |
| walk-backward | 8 / 8 | B esquerda de trás levanta e recua; A direita acompanha, mantendo a frente voltada ao oponente. |
| light-punch | 16 / 40 | Duas estocadas curtas com ombro, extensão do cotovelo, inclinação do tronco e punho firme. Contatos 6–7 e 12–13. |
| low-kick | 12 / 32 | Uma estocada baixa, permanece agachado; ombro e tronco avançam, cotovelo estende e recolhe. Contato 6–7. |

A direita anatômica A permanece próxima da câmera e conduz à esquerda
da tela. A esquerda B permanece atrás/distante, à direita da tela.
Peito e quadril em três quartos voltados para o oponente à esquerda;
joelhos e botas acompanham essa orientação. As pernas não se ultrapassam
nem trocam de identidade. Os pés levantam, deslocam e pousam; não é um
ciclo feito somente com rotação de tornozelos. O motor desloca o ator.

Nos ataques, a extensão vem das articulações e do giro/inclinação do
tronco. A mão, a espada e o antebraço não aumentam para alcançar.
O punho fica alinhado ao antebraço e a ponta permanece à esquerda do cabo.
O pedido posterior autoriza a intenção de estocar; não reproduzir a
restrição anterior que impedia avanço real do braço e gerava a “munheca”.

## Produção, arquivos e revisão

Produção individual por ação com a ferramenta de imagens embutida, guarda
da própria skin para identidade/paleta/iluminação e guia de articulações
para movimento. A caminhada inicial com grade e bota traseira para trás
foi rejeitada; a perna traseira foi redesenhada antes da montagem.
Os guias dos ataques usam segmentos de braço de comprimento fixo para
descrever flexão/extensão, sem serem desenhos finais do personagem.

Cabeça/cabelo/barba/sobrancelhas pretos, uniforme manga longa, chapéu e
penas curtas, duas pistolas e hanger preservados. Cada ação recebe uma
escala uniforme, nunca escala por membro ou quadro. Corpos em pé de
aproximadamente 190 px e agachado de aproximadamente 148 px; margens e
fontes completas conferidas antes da aplicação.

- PNGs: `public/assets/lutadores/mosqueteiro-gremio/postura-v7/`.
- Fontes, prompts completos, guias de articulações, configurações,
  contatos em fundo claro/escuro e GIFs: `output/gremista-postura-v7/`.
- Prévia com reprodução lenta, passo a passo e comparação anterior/nova:
  `output/gremista-postura-v7/revisao.html`.
- Manifesto de dimensões e hashes: `postura-v7/manifest-art.json`.
- Referências anexadas e hashes: `reference-hashes-v7.json` na produção.
- Montagem e validação: `python scripts/gremista_postura_v7.py finalize`.

São 44 quadros em células 640×384 e cinco colunas. Fundo magenta das
fontes removido, PNGs finais RGBA com alfa 0/255, sem halo ou rosa.
Guardas de entrada/saída são redesenhadas na postura corrigida da própria
ação; não copiar a bota traseira antiga para restaurar o erro ao entrar
em guarda. A guarda idle e as outras ações ficam como estavam neste pedido.

## Integração e limites

Somente quatro caminhos de PNG são trocados no JSON existente.
Contagens, FPS, janelas, caixas de combate, danos, distâncias, tiros, NPC
e outras ações permanecem como estavam. Backup exato anterior à aplicação
em `runtime-integration-before.json`. Nenhuma partida/Academia foi
executada nesta revisão de arte; testes de grade e registro não aprovam
automaticamente anatomia, leitura ou alcance em combate.

As estocadas alteram a posição projetada da lâmina, especialmente o
primeiro contato do rápido. `combat-visual-guide.json` registra medições
visuais para o responsável pela lógica conferir as caixas na Academia;
essas medições não são hitboxes automáticas. Não presumir aprovação do
usuário nem reaplicar v4/v6 sobre estas quatro folhas v7.

Validações passaram: quatro folhas / 44 quadros, dimensões, margens,
hashes, células excedentes vazias, alfa binário e ausência de magenta.
JavaScript da prévia sem erro de sintaxe, TypeScript e os 94 testes do
registro de lutadores passaram. Auditoria do JSON confirmou somente os
quatro caminhos de imagem alterados por esta revisão.
