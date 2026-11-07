# Raposa — referência corrigida e movimentos v2

Pedido atual: produzir os movimentos usando a última imagem da conversa,
com o soco-inglês na posição marcada pelo usuário e depois aceita como
referência. Fonte: `referencia/raposa/base-boxe-azul-soco-ingles-v19.png`.
SHA256: `920f6254c42a01f8c3ec3e8b2c41ec9420cc674dceece962f7f19670122f99fb`.

Esta referência substitui as pendências históricas de encaixe da v18 e dos
estudos de mão. Manter o metal recuado junto à base dos dedos, nunca nas
pontas. Braço A usa aliança; braço B usa soco-inglês. Não trocar acessórios.
Regata azul com cinco estrelas brancas (2/1/2), calça branca/faixas azuis,
taco gasto nas costas na forma normal. A imagem fixa acabamento e cores;
não converter o estilo durante as ações.

Coreografias próprias, intro e forma com taco seguem
`raposa-animacoes-v1.md`; especificações de combate pertencem à integração.
Não implementar decisões de dano, stun ou bloqueabilidade nesta produção.

Produção por ação com ferramenta de imagens integrada, fonte e prompt em
`output/raposa-animacoes-v2/`. Folhas montadas em
`public/assets/lutadores/raposa/normal-v2/` e `taco-v2/`, células 512×384,
cinco colunas, pés na linha 360, corpo em guarda com 200 px de altura.
Usar dimensões do manifesto, não tratar as folhas como células 256×256.
Uma escala uniforme por ação. Fontes anteriores preservadas.

Revisão e manifesto: `output/raposa-animacoes-v2/revisao.html` e
`integration.json`. FPS propostos; sem registro de lutador incompleto,
alteração dos JSONs de runtime ou alegação de teste em combate.

## Entrega de arte

48 folhas finais / 269 quadros: forma normal 24 folhas / 142 quadros;
forma com taco 21 / 121; três efeitos separados / seis quadros.
A fase intermediária `entrance-prefix` é fonte de montagem, não outra
ação a registrar. A entrada final tem 13 quadros e termina na guarda normal.

Prévia com pausa, quadro anterior/seguinte, velocidade e fundos:
`public/raposa-revisao-v2.html`. No servidor do projeto, abrir
`/raposa-revisao-v2.html`. Referência v19 e guia da forma com taco ficam
também em `public/assets/lutadores/raposa/bases/`. Manifesto público:
`public/assets/lutadores/raposa/art-manifest-v2.json`.

| Ação | Quadros em cada forma | FPS propostos |
|---|---:|---:|
| idle | 4 | 8 |
| walk-forward / walk-backward | 8 cada | 8 |
| dash-forward | 5 | 18 |
| dash-back | 4 | 18 |
| crouch | 5 | 20 |
| block-high / block-low | 4 cada | 10 |
| jump | 8 | 10 |
| jump-punch | 5 | 14 |
| jump-kick | 6 | 14 |
| hit-high | 6 | 12 |
| stunned | 4 | 6 |
| knockdown | 8 | 10 |
| light-punch | 6 | 18 |
| heavy-punch | 6 | 14 |
| heavy-kick | 8 | 12 |
| low-kick | 6 | 12 |
| special-charge | 5 | 14 |
| special | 8 | 16 |
| special-land | 3 | 12 |
| entrance (normal, compartilhada) | 13 | 10 |
| draw-bat / stow-bat (transições) | 4 cada | 12 |

Efeitos em `public/assets/lutadores/raposa/effects-v2/`: `bottle-break.png`
(4 quadros / 12 FPS), `shards-single.png` e `shards-double.png` (um quadro
cada). **Células de efeitos 256×128, cinco colunas**, diferentes do corpo.
O dobro é acúmulo visual na mesma área, não duas minas independentes.
Não inferir dano, duração ou colisão pelo tamanho da arte.

## Continuidade e montagem

Braço A da aliança dá o primeiro soco normal, o gancho e o soco aéreo;
braço B do soco-inglês dá o segundo soco normal. Na forma com taco, A
segura continuamente o cabo e B protege o rosto. Duas tacadas rápidas
usam arcos alternados com giro do tronco, sem transferir o taco de mão.
Perna A é a avançada da base e executa chute baixo e voadora normal;
perna B é a recuada. A voadora recolhe a mesma perna que se estendeu.

O agachamento termina baixo; bloqueios sustentam a proteção; salto termina
no ar; queda termina deitada. Não repetir automaticamente o retorno à guarda
em ações que sustentam estado. A prévia repete todas para inspeção apenas.

Na entrada, A arrasta o taco; B usa isqueiro quadrado de tampa articulada.
Charuto apagado nos quadros 0–4; aceso a partir do 5. Fecha e guarda o
isqueiro antes de erguer e guardar o taco. A fase de guardar foi redesenhada
por cima da cabeça para preservar A/B. Fontes das duas fases estão nos
relatórios de `entrance`; ambas usam corpo de guarda de 200 px na montagem.

Fontes e prompts completos: `output/raposa-animacoes-v2/<forma>/<ação>/`.
Cada relatório registra SHA256, referências, grade, contagem, FPS, escala
uniforme da fonte e caixas visuais. Os quadros 0 que pedem guarda reutilizam
a guarda de trabalho da própria forma, declarada em `guardSheet`; não usar
as primeiras poses divergentes de fontes intermediárias como novas bases.
Os quadros de referência de escala de `special-land` são excluídos por
contrato: a entrega começa na aterrissagem e termina na guarda.

Montagem reproduzível: `python scripts/finalize_raposa_v2.py`.
Atualizar só a revisão: acrescentar `--review-only`.
Gerar página pública: `python scripts/raposa_v2_review_page.py`.
Dependências de organização: Pillow, NumPy e SciPy. Scripts extraem,
limpam resíduos de matte desconectados, alinham e montam; poses e reparos
de desenho/transparência são produzidos pela ferramenta de imagens.

## Conferência e integração

Fontes e todos os quadros montados inspecionados; contatos em tamanho
efetivo sobre fundos claro/escuro em `output/raposa-animacoes-v2/qa/`.
Corrigidos o halo na reação normal e o charuto ausente no soco aéreo.
Verificados RGBA, margens, células vazias finais, contagens, dimensões e
hashes. As prévias GIF e o player usam os FPS propostos da tabela.

Janelas visuais candidatas, sem alterar combate: socos normais 1 e 3;
gancho 3; garrafa toca o chão/quebra no 5, solta no 6; chute baixo 3;
soco aéreo 2; voadora normal 1–3; especial descendente 6–7.
Com taco: rápido 1 e 3, gancho 3, bruto 4–5, varredura 3, aéreos 2–3.
São indicações de arte, não hitboxes nem validação de dano.

Ainda pertencem à integração: registro, células 512×384, contagens/FPS,
apoio/origem, janelas/colisões, minas, transições e regra do especial que
transforma somente após acerto real. A passagem por baixo do especial
precisa permanecer livre conforme o pedido. Não houve teste em combate
ou Academia nem aprovação visual do usuário atribuída às novas animações.
