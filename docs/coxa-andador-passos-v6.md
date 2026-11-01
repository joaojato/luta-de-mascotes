# Coxa normal — andador como apoio alternado v6

Pedido posterior explícito do usuário: o andador não pode apenas deslizar durante a caminhada. Ele funciona como um terceiro apoio. Esta revisão substitui somente as duas caminhadas normais da v5. Postura parada e demais ações ficam preservadas.

## Coreografia

- Avançar: ambos os pés apoiados enquanto os braços levantam o andador, avançam e o plantam à frente. Depois, passo curto da perna direita/distante B e passo curto da esquerda/próxima A. Os cotovelos dobram à medida que o corpo alcança o apoio.
- Recuar: passo curto da esquerda/próxima A para trás e depois da direita/distante B. As mãos permanecem nas manoplas e os braços vão abrindo enquanto o corpo se afasta do andador plantado. Com os dois pés apoiados, os braços levantam o objeto, puxam para trás e o pousam perto do corpo.

Cada caminhada tem 12 quadros a 10 FPS propostos, contra oito a 8 FPS na v5. A mudança é de coreografia autorizada pelo usuário, ainda sem integração de lógica. Corpo inteiro com cerca de 200 px; folhas RGBA em células 512×320, cinco colunas e três linhas. Não carregar como 256×256 nem manter a contagem anterior ao integrar.

## Continuidade e objeto

Direita anatômica/distante B corresponde à mão/perna à esquerda na imagem; esquerda anatômica/próxima A parte do lado direito da imagem. Cada mão permanece na própria manopla durante todo o ciclo. As duas pernas continuam identificáveis do quadril até a bota, inclusive quando passam próximas. As poses reutilizadas nos guias vêm da v5. O avanço foi redesenhado pela ferramenta de imagens; o recuo final usa o mesmo ciclo inteiro em ordem inversa, conforme a coreografia inversa solicitada. Assim, começa pelos passos e termina recolhendo o objeto, sem trocar pernas ou mãos. Os círculos nos guias indicam novas posições das mãos; não aparecem na entrega. Scripts somente organizam guias, extraem corpos inteiros, ordenam poses e montam camadas.

O último quadro do avanço retorna intencionalmente à pose 0 para fechar o ciclo de apoio. Não houve redesenho anatômico nem espelhamento por script. São 24 quadros de reprodução nas duas caminhadas, com a arte do avanço compartilhada pelo recuo; não são 24 poses generativas independentes. O estudo de recuo gerado diretamente repetia a mesma perna e foi rejeitado. Fonte, ficha e prompt desse estudo estão nos arquivos `rejected-*` de `normal/walk-backward`; o estudo adicional `walk-backward-step-fix` também não entra na entrega.

Andador: a mesma imagem `output/coxa-v4/objetos/andador.png`, escala 1 e rotação 0, movida inteira sem deformação ou geração por quadro. Quatro pernas/ponteiras, dois arcos/manoplas e uma travessa. Camadas completas `walker-layer-XX.png` permitem conferir o objeto independentemente da oclusão corporal.

## Apoio no mundo e integração futura

`choreography.json` guarda o guia inicial. Os registros finais em `attachments.json` e `motion-guide.json` usam as pegadas efetivamente desenhadas: corpo alinhado pelo apoio no chão, sem ancorá-lo verticalmente às mãos; objeto carregado segue a mão; durante os passos, `rootX` compensa a posição local do objeto. A soma mantém o andador parado no mundo durante os passos. Deslocamento final de referência: −33 px por ciclo no avanço e +33 px no recuo, na escala corporal de cerca de 200 px. São deslocamentos visuais propostos para sincronização, não parâmetros de combate já aplicados. O guia inicial de 18 px não deve substituir as curvas finais.

Ao integrar, respeitar essa curva por fase e escalar uniformemente o deslocamento conforme a escala do personagem. Somar uma velocidade global constante à folha faria o andador plantado voltar a deslizar. Nas fases em que o objeto é carregado, `rootX` fica parado e o objeto move-se pelas mãos; nos passos, o objeto permanece plantado no mundo enquanto o corpo muda de apoio.

Prévia com câmera e marcas do chão fixas: `output/coxa-v6/revisao.html`; GIFs individuais `normal/<ação>/world-preview.gif`. As marcas e legendas pertencem à prévia, não às folhas transparentes. Entrega consolidada: `public/assets/lutadores/coxa/revisao-v6`, 36 ações e 240 quadros corporais. Fontes, prompts, hashes e relatórios ficam em `output/coxa-v6`. A primeira fonte do avanço foi rejeitada por pouca articulação das pernas e pegadas aproximadas demais; preservada em `normal/walk-forward-rejected-1`, fora da entrega.

Não há registro do Coxa no runtime nesta etapa; integração e validação de combate continuam pendentes.

Montagem final: `python scripts/coxa_v6_mount.py`; entrega: `python scripts/coxa_v6_deliver.py`; QA: `python scripts/validate_coxa_v6.py`. Verificação: 24 camadas completas idênticas ao objeto original, apoio estacionário no mundo nas fases plantadas, pés no chão durante o transporte, folhas sem cortes e 34 outras ações preservadas por hash. Contatos nativos para revisão individual em `normal/<ação>/native-review.png`; relatório `output/coxa-v6/validation.json`. A revisão visual acompanhou braços, pernas, apoios e fechamento dos ciclos na fonte e na montagem.
