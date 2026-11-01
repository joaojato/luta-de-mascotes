# Coxa — duas artes-base v1

Pedido de 31/10/2026. Primeiras propostas, aguardando revisão do usuário.

- Normal: `public/assets/lutadores/coxa/bases/normal-v1.png`; idoso de chapéu com pena, suspensórios e botas, apoiado no andador com ambas as mãos.
- Maromba: `public/assets/lutadores/coxa/bases/maromba-v1.png`; boné e uniforme verde/branco, físico musculoso, andador erguido com uma mão e outra mão livre.
- Cópias de referência em `referencia/coxa/base-normal-v1.png` e `base-maromba-v1.png`.

Cada arquivo é uma pose única RGBA 1126×1397, sem grade nem FPS. São artes-base para revisão, ainda sem normalização para células do jogo. Não registrar como lutador completo. Transformação no especial e demais movimentos aguardam explicação do usuário.

Geração: ferramenta integrada image_gen, uma chamada por versão. Prompts completos em `output/coxa-bases-v1/normal-prompt.txt` e `maromba-prompt.txt`. Medidas, caixas alfa e SHA256 em `output/coxa-bases-v1/report.json`.

Referências de identidade: três imagens anexadas pelo usuário (vovô tirolês, maromba e andador). Referência de acabamento: `referencia/urubu/modelo-oficial.png`, SHA256 4322FEC694887B769C1AA74D99BD5F767BAB2F5536810B0490F19B0ECD3E6FA3. A versão normal recém-gerada também foi anexada à geração do maromba para coerência facial. Nenhuma delas foi considerada previamente aprovada.

Anatomia: braço A próximo e B distante; normal com uma mão em cada manopla; maromba com braço erguido segurando o acessório e braço oposto livre. Duas pernas ligadas aos próprios quadris, pés em apoio. Revisão visual das fontes: direção à esquerda, rosto idoso, duas mãos, duas pernas, pegada e acessório inteiro. Transparência RGBA confirmada. Integração e comparação na escala final do jogo pendentes; nenhum teste de combate realizado.

## Correção maromba v2

Pedido posterior: segurar por uma das pernas do andador. Nova proposta em `referencia/coxa/base-maromba-v2.png` e `public/assets/lutadores/coxa/bases/maromba-v2.png`. Mão envolve tubo inferior próximo da ponteira, andador erguido com uma mão. v1 do maromba rejeitada quanto à pegada e preservada como histórico. Ferramenta integrada image_gen; prompt em `output/coxa-bases-v1/maromba-v2-prompt.txt`. Inspeção visual: pegada no tubo inferior, ponteira abaixo do punho e outra mão livre. Aprovação do usuário e escala final de jogo pendentes.

## Modelo fixo do andador — correção explícita do usuário

Usar SEMPRE a estrutura do primeiro andador, visível em `referencia/coxa/base-normal-v1.png`: quatro pernas, dois arcos superiores com manoplas, quatro ponteiras e APENAS UMA barra horizontal frontal. Não adicionar segunda barra, travessas inferiores ou reforços laterais. Todas as próximas poses e a versão maromba devem preservar o mesmo objeto. O mapa anterior `mapa-andador-v1.png` e os andadores maromba divergentes não servem como referência de estrutura. Pegada continua aguardando indicação do usuário no novo mapa.

Mapa corrigido: `referencia/coxa/mapa-andador-v2.png`. Conferido visualmente: quatro pernas, duas manoplas e uma única barra horizontal, sem reforços extras; 28 códigos A1–G4. Guia de localização, cores técnicas não são a paleta final do acessório. Gerado com image_gen.

## Pegada definida pelo usuário

Segurar exatamente B2 do mapa v2: segundo quarto da perna traseira esquerda a partir do topo. Preservar orientação do mapa e estrutura com barra horizontal única. Andador à frente da mão: mão por trás do tubo, sem cobrir a face frontal com o punho. Cores e códigos do guia não aparecem na arte final.

Proposta maromba v3: `referencia/coxa/base-maromba-v3.png` e `public/assets/lutadores/coxa/bases/maromba-v3.png`. Pegada deslocada para tubo traseiro esquerdo acima da barra, braço por trás do objeto, uma barra horizontal. Gerada individualmente por image_gen a partir do personagem e mapa fixo. Primeira tentativa desta revisão rejeitada por segurar tubo dianteiro. Proposta final ainda aguardando revisão do usuário; sem integração de runtime.

## Maromba v4 — carregar com braço baixo

Correção explícita: braço que carrega deve ficar baixo junto ao corpo, como o outro braço, mão na altura da coxa; não erguer nem estender andador. Proposta em `referencia/coxa/base-maromba-v4.png`, cópia em `public/assets/lutadores/coxa/bases/maromba-v4.png`. Dois braços baixos e pegada no tubo traseiro esquerdo acima da barra única. Gerada por image_gen. Revisão do usuário pendente. Acabamento e oclusão dos dedos ainda precisam de revisão antes de produção das animações; não considerar aprovada nem registrar no jogo.

## Maromba v5 — lado da pegada

v4 rejeitada: punho sobreposto à frente de B2. Correção localizada com image_gen: tubo B2 contínuo à frente da palma, mão atrás, dedos visíveis nas bordas; braço baixo mantido. Proposta `referencia/coxa/base-maromba-v5.png`, cópia em `public/assets/lutadores/coxa/bases/maromba-v5.png`; prompt completo em output/coxa-bases-v1/maromba-v5-prompt.txt. Conferido visualmente: segundo tubo da esquerda, mão baixa, tubo visível diante da palma e uma barra horizontal. Ainda não aprovada pelo usuário.

## Maromba v6 — andador deitado de lado

Correção explícita posterior prevalece sobre orientação vertical anterior: carregar como mala com braço baixo, mas segurando pela PERNA B2, nunca pela manopla. Andador deitado de lado, pernas horizontais, ponteiras à esquerda, arcos à direita; única barra gira junto com objeto. Proposta gerada individualmente com image_gen em `referencia/coxa/base-maromba-v6.png`, cópia em `public/assets/lutadores/coxa/bases/maromba-v6.png`. Conferida orientação horizontal, braço baixo e pegada em tubo reto; revisão fina da correspondência B2 e profundidade da mão ainda depende de aprovação do usuário. v5 vertical não representa mais a postura solicitada. Sem integração de runtime.

## Maromba v7 — sem andador

Pedido mais recente: somente a versão forte sem andador, braços normais. Nova proposta `referencia/coxa/base-maromba-sem-andador-v7.png`, cópia em `public/assets/lutadores/coxa/bases/maromba-sem-andador-v7.png`. Dois braços baixos junto ao corpo, mãos vazias, corpo inteiro. Gerada com image_gen, prompt completo em output/coxa-bases-v1/maromba-v7-prompt.txt. Conferida visualmente remoção total do objeto, dois braços e duas pernas. Sem registro no runtime; aprovação do usuário pendente. Para esta base prevalece o pedido sem acessório sobre as tentativas anteriores de pegada.

## Maromba v8 — orientação da mão direita

Pedido: somente braço direito com dedos voltados para câmera. Direita anatômica corresponde ao lado esquerdo da imagem. Supinação do antebraço/punho direito com face dos dedos recolhidos visível, braço baixo; braço esquerdo mantido. Proposta `referencia/coxa/base-maromba-sem-andador-v8.png`, cópia em public/assets/lutadores/coxa/bases/maromba-sem-andador-v8.png. Editada com image_gen a partir de v7; prompt em output/coxa-bases-v1/maromba-v8-prompt.txt. Conferido visualmente lado anatômico e rotação de uma mão; aprovação pendente.

## Maromba v9 — guia desenhado pelo usuário

Novo anexo do usuário define posição exata do andador: deitado ao redor da mão direita baixa, curvas à esquerda e pernas para direita, próximas da coxa/joelho. Este desenho prevalece sobre a orientação invertida da v6. Substituído rabisco por tubos prateados em geração individual image_gen; fonte `referencia/coxa/base-maromba-v9.png`, cópia `public/assets/lutadores/coxa/bases/maromba-v9.png`, prompt em output/coxa-bases-v1/maromba-v9-prompt.txt. Conferidos orientação conforme esboço, braço baixo e remoção dos traços vermelhos. Proposta aguardando revisão do usuário, sem registro no jogo.
