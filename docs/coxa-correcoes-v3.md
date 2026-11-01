# Coxa — bolso, preparação e crescimento com pegada

Correção posterior do usuário, 31/10/2026. Substitui o arremesso e o chute apoiado v2 e substitui transformação + pegada separada por uma ação contínua. A defesa baixa v2 e as demais ações anteriores permanecem fora desta revisão.

**Mão do arremesso: esquerda anatômica**, braço próximo da câmera à direita da imagem. O pedido anterior de direita foi corrigido pelo próprio usuário. Não reaplicar essa instrução histórica.

Galeria com andador montado: `output/coxa-rigido-v3/revisao.html`. PNGs: `public/assets/lutadores/coxa/rigido-v3`. Pacote: `output/coxa-rigido-v3/coxa-revisao-v3.zip`.

| Ação | Quadros / FPS propostos | Sequência |
|---|---|---|
| beer-throw | 10 / 14 | 0 repouso com duas mãos baixas; 1 esquerda vai ao bolso; 2 entra no bolso; 3 retira a lata; 4–5 prepara; 6 solta com a esquerda; 7 acompanha; 8 recolhe; 9 repouso. Nenhuma lata na mão direita. |
| low-kick | 12 / 14 | 0 duas mãos apoiadas; 1–2 flexão/preparação; 3–4 direita distante sobe para guarda, esquerda próxima mantém apoio; 5 impulsão; 6 saída aérea; 7–8 chute quase voadora; 9 recolhe a mesma perna direita; 10 aterrissa; 11 repouso com duas mãos baixas. A esquerda permanece agarrada ao arco/tubo; desliza um pouco para baixo durante a carga e volta ao topo no repouso. |
| special-transform | 12 / 14 | 0 normal apoiado; 1–4 cresce e começa a alcançar; 5 fecha a mão direita distante na perna traseira esquerda do objeto ainda parcialmente transformado; 6–8 completa crescimento e ajeita a pega ao longo do mesmo tubo; 9–11 ergue o objeto inteiro, terminando maromba. Não anexar o antigo `walker-grab` v2 depois: a pegada já está nesta ação. |

Todas as prévias desta entrega **incluem o andador**, quatro pernas e quatro ponteiras. Corpo gerado separadamente por ação, com referências da identidade e da postura de repouso; a transformação também usa a identidade final maromba. Foi feito um guia técnico de alcance para corrigir a distância entre mão e perna correta. A primeira tentativa de transformação v3 ficou como estudo; a versão montada usa `special-transform-fit`.

O andador continua sendo exclusivamente a imagem isolada original, recortada e reduzida uniformemente uma única vez na produção v1. Na montagem v3 sua escala é sempre 1 e rotação 0. Permanece na mesma origem até o quadro 8 da transformação; depois apenas se translada inteiro com a mão. Nenhum tubo é regenerado, deformado, apagado ou substituído. Partes ocultas pelo corpo continuam na camada do objeto. A cópia `walker-layer-XX.png`, preservada por quadro em output, permite verificar todos os pixels mesmo quando estão ocultos na composição.

Formato: RGBA, células **512×320**, cinco colunas, sobras transparentes. `*-body.png` já possui o alinhamento de montagem; não reaplicar deslocamentos nele. `*-composed.png` é a folha final montada para revisão. `*-attachments.json` aponta origem do mesmo objeto, ordem das camadas e pegada. `*-props.json` indica a lata na esquerda nos quadros 3–5 e sua soltura no 6. Efeitos de lata/gotas reutilizados da geração anterior; física de voo e partículas continuam com a integração.

Fonte e cada quadro montado inspecionados localmente; verificação estrutural em `python scripts/validate_coxa_rigido_v3.py`. Isso não constitui aprovação do usuário nem teste em combate. Contagens/FPS novos dependem da integração; sem mudanças de runtime, hitboxes, balanceamento ou registro. A volta ao normal continua aguardando definição do usuário.
