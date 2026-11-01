# Coxa — revisão do conjunto pelo andador

Atualização posterior: repouso e caminhadas do normal foram solicitados novamente. Para essas três ações, usar [apoio e caminhadas v5](coxa-apoio-caminhadas-v5.md) e a entrega consolidada `public/assets/lutadores/coxa/revisao-v5`. As fontes v4 dessas ações ficam como histórico.

Pedido retomado em 01/11/2026. O usuário esclareceu que a orientação das bases é para refazer as animações, sempre a partir da estrutura/pegada do andador. Esta revisão consolida **36 folhas corporais / 232 quadros**: vinte ações normais e dezesseis maromba. Pedido posterior incluiu redesenhar a lata para a escala final e mostrá-la pingando cerveja: dois efeitos novos, oito orientações da lata e seis fases de gotas.

Galeria com o andador em todas as ações: `output/coxa-v4/revisao.html`. Entrega: `public/assets/lutadores/coxa/revisao-v4`. Pacote: `output/coxa-v4/coxa-revisao-v4.zip`.

## Prioridades vigentes

- Normal: mantém identidade, chapéu com pena, suspensórios, botas e repouso apoiado com duas mãos.
- Maromba: usa a orientação mais recente da **base v9**, `referencia/coxa/base-maromba-v9.png`: braço direito baixo, pegada B2 na altura da coxa, curvas do objeto à esquerda e ponteiras à direita. Repouso e deslocamentos com ambos os braços baixos; ataques/defesas articulam os braços e retornam ao repouso atual. A aprovação antiga da guarda com objeto vertical não prevalece sobre essa correção.
- Estrutura fixa: quatro pernas, quatro ponteiras, dois arcos/manoplas, uma única barra de união. Nunca gerar o andador junto com o corpo de cada quadro.
- Rápido normal: **duas estocadas com os pés do andador**, levantando as duas mãos, projetando o objeto à frente, recolhendo entre os contatos e retornando ao apoio. Não são socos nem pancadas verticais no chão. Dez quadros a 16 FPS propostos, impactos visuais nos quadros 3 e 5.

## Produção e reaproveitamento

As dezesseis ações maromba foram redesenhadas para a postura atual. O rápido normal foi redesenhado com guia técnico do objeto e das duas mãos. A transformação foi refeita em fases de apoio/regrip e crescimento/transporte: os quadros 0–5 usam a fonte `special-transform-b2`, os 6–11 usam `special-transform`, sem deformar ou pintar partes do corpo por script; hashes por quadro estão em `normal/special-transform-final/report.json`. A primeira tentativa antecipava os braços baixos; a outra preservava o figurino normal no fim. As fases finais escolhidas preservam apoio inicial e destino maromba com boné/calção/meias/chuteiras verdes.

As demais fontes corporais normais foram preservadas quando a pose não precisava mudar; as montagens foram revistas a partir do objeto rígido. As correções anteriores do bolso com mão esquerda, voadora apoiada, defesa baixa atrás do objeto, defesa alta com objeto apoiado, mão na lombar e bebida foram preservadas na consolidação. Não interpretar isso como 36 novas gerações corporais: são dezoito ações redesenhadas e dezoito com fontes anteriores, reunidas com as camadas e revisões vigentes.

## Duas vistas rígidas

`objetos/andador.png` é a vista vertical original reduzida uniformemente uma vez. O rápido só translada e gira essa imagem inteira. As duas mãos permanecem em manoplas diferentes; a posição dentro da manopla acomoda o giro sem alterar a escala do objeto.

`objetos/andador-lateral.png` é uma nova perspectiva isolada para carregar de lado conforme a v9. Conferidos quatro tubos completos/ponteiras à direita, duas curvas à esquerda e uma barra de união. A primeira fonte lateral tinha uma perna interrompida; a segunda ainda intercalava as conexões dos arcos. A fonte final é `andador-side-topology-source.png`: arco superior une tubos 1–2, inferior une 3–4, barra única une 2–4 e conecta os dois arcos. B2 fica no terceiro tubo, antes da barra. Todas as ações maromba reutilizam essa mesma imagem final, sem redimensionamento por quadro.

Na transformação, a vertical permanece parada até a pegada em B2. Depois usa a vista lateral inclinada e a endireita até o transporte baixo. É troca explícita de perspectiva de duas imagens rígidas, sem interpolação/deformação dos tubos. Na queda, o acessório é solto e cai inteiro ao lado. Quando a perna do chute passa à frente da mão, a camada corporal oculta a pega e parte dos tubos; a imagem completa permanece em `walker-layer-XX.png` para conferência.

## Formato e integração

Todas as folhas corporais: **RGBA, células 512×320, cinco colunas**. FPS/contagens e caixas visuais estão no manifesto; não carregar como 256×256. `*-body.png` já está alinhado para a montagem; `*-composed.png` é a prévia final; `*-rig.json` registra vista, âncora, posição, rotação, escala fixa, soltura e oclusão. As caixas visuais não são hitboxes.

## Latinha proporcional e gotas

Referência de escala do projeto: corpo200 px, conforme a guarda do Urubu em `src/game/lutadores/urubu.json`. A lata nova ocupa **8×14 px nativos**, não a célula inteira. `efeitos/latinha.png` é a imagem isolada; `efeitos/beer-can.png` tem oito orientações da mesma imagem girada, células **32×32**, cinco colunas,16 FPS propostos. Não redimensionar cada orientação para14 px de altura, pois a lata horizontal precisa ficar14 px de largura por8 de altura. Aplicar a mesma escala visual do lutador, sem esticar a imagem para preencher o quadro.

`efeitos/beer-drops.png`: seis fases, células **16×16**, cinco colunas,20 FPS propostos. Grupos com altura máxima5 px e gotas individuais pequenas, aproximadamente1–3 px. Nova fonte em `output/coxa-v4/efeitos/beer-drops-v4`; nova fonte da lata em `beer-can-master`. Não usar os efeitos antigos128×128 no lugar destes.

As composições de arremesso e bebida usam a lata nova. A prévia `output/coxa-v4/beer-flight.gif` mostra o personagem/andador na escala dos sprites, a retirada com a esquerda e a lata girando em parábola com gotas saindo da abertura e caindo separadamente. O emissor começa após soltura no quadro6 do arremesso; não existe lata duplicada nas mãos após a soltura.

Contrato em `efeitos/beer-emitter.json`: emissão ilustrativa24 vezes/s, vida0,3 s, gravidade visual900, herança horizontal10% do projétil. Os valores são proposta de efeito para a lógica; as gotas não causam dano. Prévia usa a referência de parábola do Saci (420/320/600). Partículas soltam do projétil e caem, não ficam rigidamente presas à lata. Arte e guia entregues; runtime não foi alterado.

Fontes, prompts e referências/hashes estão nas pastas de cada ação. A montagem da transformação preserva a origem de cada fase. Fontes substituídas ficam como histórico e não entram como ações extras no manifesto. Galeria mostra as duas versões com o objeto incluído.

Conferidas fontes e composições locais, orientação, mãos, ponteiras e bordas. Verificação estrutural: `python scripts/validate_coxa_v4.py`. A revisão visual ainda é do usuário; não declarar teste em combate/Academia. Não foram alterados runtime, registro de lutador, hitboxes, porcentagens, duração ou lógica de transformação.

Continuam aguardando definição: pesado/rasteiro maromba e retorno ao normal. Não registrar um lutador incompleto.
