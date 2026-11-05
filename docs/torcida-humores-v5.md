# Torcida v5: humores, eventos individuais e camadas

Atualização de movimento: no amarelo, ciclos individuais alternam incentivo (40%) e hesitação com animação de espera (60%). Irritação usa os quadros 0, 0, 0, 1, 0, 0 a 3 FPS e fase individual: o copo continua na mão, sem passar pelo lançamento (quadro 2) nem pelo quadro 3 sem copo. Não há salto. O cache de arte e os sorteios individuais de arremesso permanecem.

Pedidos e correções do João em 03/11/2026. Esta revisão amplia a circulação v4 e prevalece sobre seus horários de fila única e sobre o comportamento inicial em que muitos NPCs arremessavam copos em loop.

## Comportamento e probabilidades

Os sorteios ocorrem **uma vez por segundo para o lado afetado**, escolhendo no máximo uma pessoa para cada evento; não são multiplicados pelo FPS nem pelo número de NPCs. Um atraso na atualização não acumula sorteios em rajada. Pessoas já encaminhadas à saída não podem ser sorteadas novamente.

| Condição | Arremesso individual | Saída individual |
|---|---|---|
| Vida vermelha contra verde, sem round perdido | progressiva: 10%–50% | progressiva: 2%?20% |
| Já perdeu um round e está no vermelho contra verde | progressiva: 10%–50% | progressiva: 4%?30% |
| Já perdeu um round e chega ao amarelo, adversário verde | não | progressiva: 4%?30% |
| Sofreu uma virada e agora está no vermelho contra verde | progressiva: 10%–50% | progressiva: 6%?40% |
| Fora dessas condições, intervalo, K.O. ou luta encerrada | não | não |

Atualização posterior de 03/11/2026: a chance fixa de 1/15 para jogar bebida foi substituída, por pedido explícito, por uma chance crescente com a surra. A diferença de vida é normalizada do menor desnível vermelho × verde (25 pontos percentuais) até a vantagem máxima (100 pontos). A chance cresce linearmente de 10% a 50% por sorteio de um segundo. Exemplo: 25% contra 75% dá cerca de 23%; 10% contra 90%, cerca de 39%; 1% contra 100%, cerca de 49,5%. Continua sendo um único torcedor escolhido por evento, sem arremessos coletivos. Saídas individuais, porcentagens de derrota e os 35% extras não foram alterados.

Na virada, a torcida do jogador que reagiu comemora; a do novo lado pressionado fica irritada. A condição de virada e a chance agravada de sa?da cessam quando deixa de existir vermelho contra verde. O histórico de quem estava apanhando atravessa a pausa entre rounds, permitindo reconhecer a virada no round seguinte.

**Os percentuais foram preservados, conforme a correção explícita do usuário.** Derrota de round com vencedor vermelho retira 7%, verde retira 35%, amarelo interpola de forma linear. Depois de perder para um vencedor verde, voltar ao vermelho contra esse adversário verde encaminha **mais 35 pontos percentuais**, uma vez. As saídas avulsas não descontam desses 35%: são contadas separadamente. A chance de 1/60 já começa no amarelo após um round perdido, antes desse gatilho percentual no vermelho. A derrota decisiva manda todo o restante da torcida perdedora embora; o vencedor não recebe novas retiradas por causa do resultado final. A revanche limpa os históricos e restaura a torcida.

Limites iguais aos do HUD: vermelho até 25%; amarelo acima de 25% até 50%; verde acima de 50%. Arremessos e condição normal de apanhando exigem vermelho contra verde; a exceção amarela vale somente para a saída individual após round perdido, conforme a última correção.

## Animações e figurino

Pasta `public/assets/cenarios/estadio/torcida/`:

| Arquivos | Ação | Grade/célula | Quadros | FPS |
|---|---|---|---|---|
| `torcida-quieta-v5.png`, `torcida-quieta-v5-camisa.png` | respiração leve, olhar acompanhando o campo, braços baixos | 4×10 / 64×80 | 40 por folha | 3 |
| `torcida-brava-v5.png`, `torcida-brava-v5-camisa.png` | irritação, preparo, arremesso com braço direito, recolhimento | 4×10 / 64×80 | 40 por folha | 6 |
| `torcida-copo-v5.png` | copo extraído do desenho na mão | 24×24 | 1 | trajetória pelo código |
| `cadeiras-camadas-v5.png` | cópia dos pixels originais de cadeiras/patamares para oclusão | 2048×869, 13 recortes | — | — |

Manifestos: `humores-v5.json` e `cadeiras-camadas-v5.json`. As quatro folhas de pessoas medem 256×800 RGBA; ordem linear `tipo * 4 + quadro`, dez identidades iguais às da base atual. A arte sem camisa continua como base; a variante em chave magenta recebe a roupa do clube no jogo. NPCs já sem camisa continuam usando a base sem camisa.

As bases e os figurinos foram produzidos pela ferramenta integrada de imagens, com uma ação por chamada e referências da torcida v3 anexadas. O braço direito anatômico, à esquerda da imagem, segura o copo, prepara, lança e recolhe. O copo aparece na mão em 0–1 e a mão fica vazia em 2–3. A soltura é única no tempo do quadro 2 e a sequência termina após um ciclo. Os demais torcedores irritados **sustentam o quadro 3**, com expressão brava e braço baixo; não repetem o arremesso.

Sem pressão, predomina a espera tranquila, intercalada com a comemoração existente em fases individuais. O copo arremessado é decorativo, percorre uma parábola atrás das camadas inferiores e não participa da lógica de dano.

Fontes, prompts completos, referências/hashes, recortes, caixas e contatos dos 160 quadros ficam em `output/torcida-humores-v5/`. Montagem com escala uniforme 0,4 por folha, transparência real e normalização restrita aos três tons de chave do tecido. Sem redesenho corporal por script. Fontes e contatos conferidos para mãos completas, pose/pegada, identidade, alinhamento e margem. Aceite visual do usuário continua pendente.

## Camadas e circulação

Cada patamar recebe sua cadeira original, seus NPCs e sua circulação. Só depois são desenhadas a cadeira e as pessoas do patamar inferior. A posição do pé não promove quem anda horizontalmente para a camada de baixo. Assim, mesmo uma cadeira vazia encobre as pernas que passam atrás dela. Ao descer, o nível atual determina a camada. O corredor zero fica à frente dos assentos e atrás do alambrado.

As cadeiras foram extraídas da pintura por máscaras poligonais, sem alterar seus pixels RGB. Há treze faixas entre y=267 e y=618; as escadas permanecem transparentes nas máscaras. A comparação `comparacao-camadas.png` isola o defeito anterior das pernas sobre cadeiras vazias.

A saída dos lugares usa embaralhamento de pessoas, independente de assento/fileira, e horários individuais espalhados por uma janela de até 45 segundos. Não há largada em bloco nem ordenação pela posição. Nas escadas continuam existindo três faixas possíveis, mas o NPC pode mudar de faixa progressivamente entre patamares; velocidades, desvios laterais e espaçamento variam. Há apenas uma pequena separação dos pés para impedir coincidência exata, permitindo a massa embolada pedida pelo usuário. Todo percurso ainda passa pelo nível zero antes da remoção.

Os acessos das arquibancadas laterais continuam inferidos fora do enquadramento: a pintura não mostra uma escada completa nesses setores. Não foi criada uma passagem através do muro.

## Implementação e revisão

`torcidaReacao.ts` calcula percentuais, condição de apanhando, virada e probabilidades. `torcidaMovimentoCena.ts` escolhe indivíduos e mantém contagens avulsas separadas das porcentagens. `torcidaHumor.ts` e `torcidaHumorCena.ts` alternam estados e executam o arremesso somente no escolhido. `torcidaCamadas.ts` define a ordem estrutural; `torcidaRotas.ts` permite os três corredores e suas trocas. `torcidaCena.ts` integra arte, roupa, cadeiras, objetos e animações.

Reproduzir: `python scripts/torcida_cadeiras_v5.py`; `python scripts/torcida_humores_v5.py`; `node scripts/torcida_preview_v5.mjs`; `python scripts/torcida_preview_v5.py`. O GIF e os PNGs são composições **offline**, não capturas do Phaser. A simulação usa os controladores reais com sprites de teste. Probabilidades são validadas em testes com valores controlados; uma prévia curta pode não mostrar um evento raro.

## Correção do cenário ao abrir outra luta

Em 03/11/2026 foi reproduzida uma regressão real do Phaser: registrar o recorte do alambrado com `Texture.add` na mesma textura do fundo muda `firstFrame` de `__BASE` para esse recorte. A primeira luta ainda tinha uma imagem criada com o quadro inteiro, mas a luta seguinte reutilizava a textura e criava o fundo implicitamente com apenas os 245 px inferiores, em vez dos 869 px do estádio.

A cena agora pede `__BASE` explicitamente para a imagem e a fonte do fundo. `torcidaFundo.ts` mantém o recorte do alambrado e restaura o quadro padrão para `__BASE`, inclusive quando o cache já ficou alterado por uma luta anterior. As camadas, animações e probabilidades permanecem integradas.

`torcidaFundo.test.ts` usa a classe real `Texture`/`Frame` do Phaser, sem renderizador, para reproduzir a troca de 869 para 245 px, validar duas lutas consecutivas e recuperar o cache alterado. A inspeção ao vivo continua indisponível: na tentativa mais recente o helper Windows retornou `Computer Use native pipe is unavailable` mesmo após recuperação da sessão. A confirmação desta causa vem da reprodução com o motor real, não de uma captura de tela.

Validação desta correção: TypeScript e build passaram; os testes de fundo, camadas e atlas passaram (24 testes, incluindo três regressões com a classe real do Phaser). Não houve mudança nas porcentagens, probabilidades ou artes.

Verificação da versão anterior de 03/11/2026: TypeScript passou, suíte completa com `npx vitest run --pool=threads --maxWorkers=1` passou (40 arquivos, 358 testes), e `npm run build` passou. Os avisos preexistentes de atlas de tiles e tamanho do bundle continuam. A chance fixa de 1/15 foi posteriormente substituída pelo cálculo progressivo descrito acima.

Verificação do arremesso progressivo: TypeScript, build e 20 testes de reação, circulação e arremesso passaram. Os testes cobrem crescimento contínuo conforme a vida do jogador cai ou o adversário preserva mais vida, limites de 10%–50%, aplicação da chance no sorteio real e bloqueio fora de vermelho × verde ou no K.O. Saídas de 1/100, 1/60 e 1/40 e os 35% extras continuam cobertos e preservados.

Corre??o posterior: arremesso e sa?da usam a mesma intensidade de surra. Testes verificam crescimento das duas chances com a desvantagem, agravamento da sa?da ap?s derrota e virada, limites de elegibilidade e aplica??o no sorteio real.

Vantagem e comemoração: a torcida de quem lidera em vida comemora continuamente; com vidas empatadas, a liderança em rounds mantém a festa. A vantagem atual limpa a irritação guardada do lado vencedor. Ao deixar de sofrer pressão, o torcedor interrompe o gesto de arremesso ainda em andamento. Frustração por derrota e pressão continuam restritas ao lado em desvantagem.

Fim da partida: toda a torcida perdedora continua saindo; adicionalmente, 90% dos vencedores ainda presentes e sem saída agendada levantam e percorrem as escadas/corredores, com partidas aleatórias no tempo. Eventos finais repetidos não selecionam mais pessoas. Objetos arremessados são sprites na cena acima da frente do estádio, fora da textura da arquibancada: saem da mão, descrevem arco até pontos variados do gramado (x 340–1707, y 760–820 na arte base), achatam no impacto e somem após 0,4 s. Cada arremesso iniciado produz seu objeto, sem limite que suprima lançamentos.

P*tômetro por ações: arco com agulha suavizada, iluminação exclusiva da faixa ativa, legenda única inferior e entrada de 650 ms. Não existe recuperação por espera nem por atualização das vidas. Acerto ganha 3,5 pontos mais parcela do dano, bloqueio ganha 2,5 e parry ganha 12. Receber dano, ter ataque bloqueado ou sofrer parry reduz o valor. O resultado final congela a leitura e põe o vencedor no verde. Derrota disputada leva ao vermelho; derrota com vencedor verde converte um terço do verde restante em A Casa Caiu e inicia na divisa preto/vermelho. Surra após ter aplicado uma surra reduz metade do verde restante uma vez por round. A faixa controla os humores da torcida; os sorteios de abandono e bebida preservam as condições de pressão. A Ult não foi alterada. Correção posterior de vitória: removida a saída de 90% dos vencedores; saídas ainda em andamento desse lado são canceladas. Quem já concluiu a saída antes do resultado não reaparece.

Ampliação do P*tômetro: raio ocupa a largura disponível abaixo dos retratos, legenda de 13 px. Arcos em coordenadas cartesianas: P1 no quarto quadrante (270°–360°), P2 no terceiro (270°–180°), com vermelho embaixo e verde nas pontas externas superiores. Especial confirmado sem bloqueio leva no mínimo à divisa amarelo/verde atual; se já estiver acima, preserva o valor. Especial bloqueado mantém a penalidade de ataque barrado.

Correção de 03/11: removidas as bordas e o halo extra da faixa A Casa Caiu no medidor. O alerta agora colore somente o canto superior do lado correspondente, com gradiente vermelho na faixa VTNC e vermelho escuro na faixa A Casa Caiu. Derrota final: 90% dos ainda sentados iniciam imediatamente o percurso; ceil(10% dos restantes sentados) espera exatamente 1500 ms. Saídas já agendadas do perdedor são antecipadas conforme essa regra; todos concluem as rotas e o lado vencedor fica protegido.

Correção do quadro zero (imagem enviada em 03/11, 21h16): Texture.get(0) usa firstFrame no Phaser. A otimização de compartilhamento deixava __BASE como padrão em spritesheets, fazendo a pose zero resolver para a folha inteira. Fontes de animação compartilhadas agora usam firstFrame='0'; a imagem inteira permanece acessível explicitamente por __BASE. O fundo do estádio continua usando __BASE, pois não é uma folha de animação. Teste com a classe Texture real valida recorte 64x112 no quadro numérico 0, reutilização sem duplicar quadros e recuperação de recorte inconsistente. Filtro NEAREST nas folhas da torcida; pausas individuais no festejo evitam uma parede contínua de braços.
Fim do tutorial: a confirmação da última fala volta ao menu diretamente, sem reiniciar uma partida contra CPU. A fala final informa esse destino e os botões de toque retomam o modo de menu.
