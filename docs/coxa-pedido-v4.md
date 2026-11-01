# Coxa: pedido de arte v4 (01/11/2026)

Pedido do João para a sessão de arte. Substitui as ações normais da
`rigido-v1` a `rigido-v3`. O vovô já está no jogo, só na máquina do João
(`src/game/lutadores/locais/`), então cada defeito abaixo foi visto em luta.

## O problema

Na maioria das ações a mão de apoio do vovô **não segura o andador**: fica
no ar, ao lado do tubo ou atravessando ele. A causa está no pipeline: o
corpo é gerado sem o andador e o andador é colado por cima depois, sempre
do mesmo tamanho. A mão nunca foi desenhada em volta de um tubo de verdade,
e o recorte dos dedos por cima (`fingersOverlay`) não resolve.

## Regra do Andador (nova)

**Todo quadro parte do andador.** A ordem por quadro passa a ser:

1. Posicionar o andador (o mesmo `objetos/andador.png`, escala fixa) na
   célula, onde ele tem que estar naquele momento.
2. Marcar os pontos de pegada no topo dos arcos.
3. Desenhar ou gerar o corpo **com o andador já na imagem de referência**,
   e cada mão de apoio fechada em volta do tubo nesse ponto.
4. Validar por script: em todo quadro de apoio, a mão cobre o ponto de
   pegada, e nenhum braço ou perna passa através de um tubo.

Mão que solta o andador (arremesso, bolso, lombar) solta de propósito, e o
quadro seguinte mostra a mão voltando para o tubo.

## O que o João apontou, por ação

- **`low-kick` (voadora apoiada).** É a melhor animação, mas o boneco
  praticamente não sai do chão. Medido na v3: no pico (quadros 7 e 8) o pé
  mais baixo fica a só uns 45 px do piso, a cabeça **desce** 15 a 25 px em
  relação ao idle, e a perna do chute atravessa o andador.
  A direção do João (01/11/2026): **a mão esquerda fica presa no andador em
  todo quadro**, no mesmo ponto (topo do arco próximo, (309, 198) na célula,
  com o andador na origem (217, 192)). O golpe vira um salto apoiado,
  assim:
  - quadros 0 a 4: as duas mãos no andador e o corpo flexiona; a direita sobe
    para a guarda e o braço esquerdo trava esticado;
  - quadro 5: empurra o andador para baixo e o corpo começa a subir;
  - quadros 6 a 8: o quadril sobe até a altura da mão e o braço esquerdo fica
    reto, empurrando para baixo. A perna do chute estende **acima do topo do
    andador** (y < 192) e a outra fica dobrada no alto. No pico, os dois pés
    ficam a uns 100 px do chão;
  - quadros 9 a 11: recolhe, desce e aterrissa com as duas mãos no andador;
  - a cabeça nunca fica abaixo da linha da cabeça do idle.
  Guia quadro a quadro com o andador, a pegada e as linhas-alvo:
  `public/assets/lutadores/coxa/guias/low-kick-guia-v4.png`, gerado por
  `python scripts/coxa_guia_voadora_v4.py .`. O corpo apagado nele é a v3,
  só como referência do erro.
  Já no jogo, provisório: `scripts/coxa_voadora_presa_v4.py` remonta a v3
  com a mão presa no topo (198 px) nos quadros 3 a 10, e o corpo sobe 21 px
  (pasta `rigido-v4-provisorio`). Os pés saem uns 70 px do chão, ainda
  longe dos 100 px do guia, e o braço segue dobrado: o desenho novo continua
  pedido.
- **`beer-throw` (lata).** A mão de apoio (direita, distante) larga o
  andador no quadro 7. Ela fica presa ao tubo **nos 10 quadros**. A lata na
  mão (quadros 3 a 5) precisa ser bem maior.
- **Lata (`efeitos/beer-can`).** Hoje ela ocupa 8×14 px na célula e quase
  não aparecia. No jogo ela já está ampliada 3,5×, provisoriamente. Redesenhar
  a lata com uns **20×35 px** na célula de 128 px e a lata da mão no mesmo
  tamanho. Assim o jogo volta à escala normal e o pixel fica nítido.
- **As outras ações normais:** refazer com a Regra do Andador. São elas:
  `idle`, `walk-forward`, `walk-backward`, `dash-forward`, `dash-back`,
  `crouch` (uma mão na lombar, a outra no andador), `jump`, `jump-kick`,
  `jump-punch`, `block-high`, `block-low`, `hit-high`, `stunned`,
  `knockdown`, `light-punch`, `heavy-punch`, `special-charge` e
  `special-transform`.
- **Maromba:** a mesma regra vale para a pegada na perna do andador. O
  maromba já luta no jogo por 5 s depois do especial (tipo `forma`, ver
  `docs/gdd.md`).

Prioridade: `low-kick`, `beer-throw` e a lata primeiro; depois `idle`,
`walk-forward`, `walk-backward`, `light-punch`, `heavy-punch`, as defesas e
o resto.

## Situação em 01/11/2026 (revisão v4 entregue)

A `revisao-v4` já está no jogo local, menos três pontos deste pedido:

- **`low-kick`:** a folha entregue é a mesma da v3 (hash igual). O jogo
  segue com a provisória da mão presa. O salto do guia continua pedido.
- **Lata:** voltou com 8×14 px. O pedido é uns 20×35 px; até lá o jogo
  amplia 3,5×.
- **Gotas (`beer-drops`):** arte recebida, sem uso: o motor ainda não tem
  emissor preso ao projétil.
- **Maromba:** o João preferiu o antigo (`rigido-v1/maromba`, com o andador
  dele). O da v4 saiu do jogo, e a transformação voltou à da v3. Não
  refazer o maromba sem pedido dele.
- **Mão por cima do andador:** na montagem v4 as tampas e o arco de trás
  cobrem os dedos. No jogo, `scripts/coxa_maos_por_cima_v4.py` repõe a mão
  por cima (pasta `v4-maos`). Arte nova já deve sair assim: a mão de apoio
  fica sempre na camada da frente. Desde a v5 o script cobre todas as
  folhas em uso (`maos-por-cima/`). O maromba antigo foi montado com
  `handOcclusion: true`: em arte nova, a mão que segura nunca fica atrás do
  tubo. Na defesa alta do maromba o punho da frente, colado no rosto, ainda
  fica atrás do arco: pede redesenho.

## Ainda depende do João

- O pesado e o rasteiro do maromba. Hoje eles usam a estocada e o chute
  dele como quebra-galho.
- A volta ao normal, que vai virar a sheet `special-return`. Hoje é a
  transformação tocada de trás para a frente.

## Formato

Igual à v3: RGBA, células 512×320, 5 colunas, virado para a esquerda. O pé
fica na linha do idle (293 px no normal, 292 no maromba). Manter as
contagens de quadros e o fps atuais, salvo motivo escrito. Entrega em
`public/assets/lutadores/coxa/rigido-v4/` com o guia em `docs/`. Não
registrar lutador nem mexer em JSON: a integração é feita deste lado.
