# Coxa — correções de continuidade v2

Pedido de 31/10/2026, posterior à entrega rígida v1. Esta revisão substitui somente arremesso, chute apoiado, defesa baixa e composição da transformação; acrescenta a transição de pegada. Demais ações permanecem na entrega anterior.

Galeria: `output/coxa-rigido-v2/revisao.html`. PNGs e contrato de camadas: `public/assets/lutadores/coxa/rigido-v2`. Pacote: `output/coxa-rigido-v2/coxa-correcoes-v2.zip`.

| Ação | Quadros / FPS propostos | Correção |
|---|---|---|
| beer-throw | 6 / 14 | Retira, prepara e arremessa com a direita anatômica, braço distante à esquerda da imagem. Esquerda próxima mantém apoio. Lata separada nos quadros 0–2, soltura no 3, não reaparece nas mãos depois. |
| low-kick | 8 / 14 | Direita distante golpeia para a esquerda, esquerda próxima recolhe. Quase voadora com quadril avançado; mão esquerda próxima fica no apoio durante todos os quadros. Referência de movimento: chute apoiado clássico do Saci, preservando as duas pernas do vovô. |
| block-low | 4 / 10 | Todos os quadros baixos, antebraços protegendo; corpo recolhido para trás/direita, andador inteiro em primeiro plano. Sem colagem de partes do corpo sobre os tubos. |
| special-transform | 10 / 18 | Preserva a arte do crescimento anteriormente comentada pelo usuário. Montagem do andador refeita com origem fixa no chão, sem trocar âncora de pegada no meio. |
| walker-grab | 6 / 12 | Maromba alcança a perna traseira esquerda do objeto, fecha a mão direita distante e só então levanta o andador. Mesma imagem e mesma escala; o outro braço fica em guarda. |

As folhas possuem células de **512×320 e cinco colunas**, RGBA. Corpo e andador continuam separados. Aplicar os deslocamentos do corpo em `*-body-offsets.json` antes de usar os pontos de `*-attachments.json`; não deduzir a mão por busca automática de cor. `*-composed.png` é a prévia montada das camadas. O diretório `normal` também contém a transição de pegada já maromba por ser parte do especial; o manifesto identifica a skin correta. Isso não é registro de lutador.

O andador usa exclusivamente o PNG isolado original: `referencia/coritiba/andador-isolado-v1.png`, recortado e reduzido uniformemente uma vez. Não há nova geração do objeto, alteração de tubos, escala por quadro ou troca de vista. No chute, o corpo passa à frente do apoio e a mão segue presa; na defesa baixa, a ordem de camadas se inverte. Transformação e pegada são uma sequência, exibida em `transformacao-completa/composed-preview.gif`. A volta ao normal continua pendente da definição do usuário.

Fonte e cada quadro montado foram inspecionados localmente. A revisão anterior do arremesso não deve ser reaplicada. O estudo adicional de bebida salvo em output nesta revisão não faz parte da entrega: a correção solicitada foi o arremesso. Quantidades/FPS novos dependem da integração. Sem alterações de mecânica, hitbox, registro, porcentagens ou teste em combate/Academia.

Verificação estrutural: `python scripts/validate_coxa_rigido_v2.py`. Não é aprovação visual automática nem aprovação do usuário.
