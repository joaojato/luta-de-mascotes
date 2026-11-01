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

- **`low-kick` (voadora apoiada).** É a melhor animação, mas nos quadros 3
  a 10 a cabeça fica na altura do idle. Por isso a mão próxima atravessa o
  andador e segura o nada, e a perna do chute passa através do andador.
  Durante o chute o corpo **sobe** (a cabeça uns 25 a 35 px acima do idle),
  o braço estica para baixo até o arco, e a perna passa por cima ou ao lado
  do andador, nunca por dentro.
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
