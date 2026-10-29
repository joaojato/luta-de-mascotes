# Biriba, ovo e tontura — entrega de arte

Entrega de 29/10/2026 para os itens 1–9 de [biriba-ovo-tontura.md](biriba-ovo-tontura.md). Oito peças novas, 48 quadros, produzidas em oito chamadas individuais da ferramenta integrada de imagens. Seis folhas de tontura limpas, 24 quadros corporais preservados. Contagem de quadros **a partir de zero**, ordem por linha, **cinco colunas em todas as folhas**. PNG RGBA, transparência real; células excedentes vazias. Lutadores e Biriba voltados para a esquerda; o motor espelha o conjunto para a direita.

## Arquivos instalados

| Item | Caminho a partir da raiz do projeto | Célula | Quadros | PNG completo | FPS sugeridos | Reprodução | Soltura |
|---|---|---|---:|---|---:|---|---|
| 1 | `public/assets/lutadores/cachorro/urubu-v1/summon-biriba.png` | 256×256 | 6 | 1280×512 | 14 | uma vez | **2** |
| 2 | `public/assets/lutadores/cachorro/urubu-v1/biriba-voando.png` | 256×256 | 6 | 1280×512 | 8 | loop | pelo X do alvo, no motor |
| 3 | `public/assets/lutadores/cachorro/urubu-v1/coco.png` | 64×64 | 4 | 320×64 | 10 | loop | — |
| 4 | `public/assets/lutadores/cachorro/urubu-v1/coco-splash.png` | 128×128 | 6 | 640×256 | 16 | uma vez | — |
| 5 | `public/assets/lutadores/galo/urubu-v1/egg-throw.png` | 256×256 | 8 | 1280×512 | 14 | uma vez | **4** |
| 6 | `public/assets/lutadores/galo/urubu-v1/ovo.png` | 64×64 | 4 | 320×64 | 12 | loop | — |
| 7 | `public/assets/lutadores/galo/urubu-v1/ovo-splash.png` | 128×128 | 6 | 640×256 | 16 | uma vez | — |
| 8 | `public/assets/fx/tontura.png` | 128×64 | 8 | 640×128 | 10 | loop | — |

FPS são sugestões para integração; nenhum dado de runtime foi alterado. Para um quadro `i`, o recorte começa em `x=(i%5)*larguraDaCelula`, `y=floor(i/5)*alturaDaCelula`.

## Chamado do Bira

0: recorte exato do `idle.png`, quadro 0, da própria skin. 1: dois dedos chegam ao focinho e o outro braço começa a subir. **2: assobio com dois dedos e indicação para trás/alto, disparo sugerido do chamado.** 3: sustenta o gesto. 4: recolhe. 5: recorte exato da guarda.

Braço da guarda alta, à esquerda na imagem, faz o assobio; braço da guarda baixa, à direita, aponta para trás e para cima. As pernas mantêm seus lados anatômicos e apoio. O eixo foi alinhado pelos pés, sem deixar o braço estendido recentrar o corpo. Linha de apoio: último pixel em **y=227**; limite exclusivo da caixa em 228. Expressão de ataque brava, sem mudar tamanho da cabeça, identidade ou uniforme.

## Biriba voador e queda

Identidade anexada: quadro 0 de `public/assets/cenarios/biriba/idle.png`, capturado sem modificar o original. Preservados pelagem cinza, focinho claro, orelhas escuras longas, marca branca no olho, camisa listrada e corpo canino quadrúpede. Balões pretos e brancos acima do cachorro; quatro a cinco ficam visíveis nas poses. Não há símbolos nos balões.

Seis poses de balanço dos balões e remada pequena das patas, sem deslocamento acumulado. NF/FF seguem os respectivos ombros; NH/FH seguem os quadris, inclusive nas oclusões. O volume corporal usa escala uniforme para a ação, comparado ao Biriba de cenário; o conjunto de balões não foi usado como medida de altura anatômica. A montagem usa escala 0,52 sobre a fonte gerada, preservando margem na célula.

O chamado usa quadro 2. **A soltura do cocô não pertence a um quadro fixo da folha de voo**: o contrato pede que o motor solte ao cruzar o X armazenado do oponente. Não há cocô embutido na imagem do cachorro. O cocô separado balança levemente em quatro poses; o motor desenha a queda vertical. Seu respingo achata, espalha pedacinhos e assenta em seis fases. Base de todos os quadros do respingo: último pixel em **y=127**.

## Ovo do Galo

0: recorte exato do idle da própria skin. 1: mão do braço próximo da câmera alcança sob a asa oposta. 2: mostra o ovo retirado. 3: arma o braço para trás, ainda segurando o ovo. **4: solta; braço estendido para a esquerda, mão aberta e vazia.** 5: continuação do gesto com mão vazia. 6: recolhe. 7: recorte exato da guarda.

O mesmo braço retira, arma, lança e recolhe. A rotação curta do tronco conserva o vínculo dos ombros e o apoio das pernas. Nenhum ovo solto foi desenhado na sheet do lutador: o projétil separado deve nascer no quadro **4**, na mão, aproximadamente **(34,86)** na célula original voltada à esquerda; ajustar o socket na Academia sem tratar essa indicação visual como hitbox. Linha de apoio igual à guarda, último pixel em **y=227**.

`ovo.png` apresenta quatro orientações do ovo branco. `ovo-splash.png` apresenta contato, abertura da casca, pico do respingo, queda dos fragmentos e assentamento. Base em **y=127** em todos os seis quadros. O giro existente e o chute baixo clássico não foram alterados.

## Tontura do motor e limpeza das folhas

`tontura.png`: oito fases de estrelas amarelas e espirais azuis numa composição elíptica horizontal. Centro da célula em **(64,32)**. O motor posiciona esse centro acima da caixa visual do corpo tonto, conforme o contrato. A partícula não integra as caixas corporais das folhas limpas.

Item 9 aplicado somente a estes arquivos, preservando 1280×256, células 256×256, cinco colunas, quatro quadros e quinta célula vazia:

| Lutador | Caminho | Backup original em `output/biriba-ovo-tontura/` |
|---|---|---|
| Urubu | `public/assets/lutadores/urubu/frente/stunned.png` | `urubu-stunned-original.png` |
| Almirante | `public/assets/lutadores/almirante/base/stunned.png` | `almirante-stunned-original.png` |
| Bira | `public/assets/lutadores/cachorro/urubu-v1/stunned.png` | `cachorro-stunned-original.png` |
| Cartola | `public/assets/lutadores/cartola/urubu-v1/stunned.png` | `cartola-stunned-original.png` |
| Galo | `public/assets/lutadores/galo/urubu-v1/stunned.png` | `galo-stunned-original.png` |
| Saci | `public/assets/lutadores/saci/stunned.png` | `saci-stunned-original.png` |

A limpeza zera apenas o alpha das partículas. RGB idêntico em toda a imagem; RGBA idêntico fora das máscaras de remoção. Cabelo, penas, orelhas, chapéus, figurino, cachimbo e membros corporais foram preservados. Máscaras individuais `*-stunned-removal-mask.png`, proteção corporal `*-stunned-protected-body.png`, comparações original/limpa/pixels removidos e hashes estão junto dos backups. Quatro quadros/6 FPS em loop já existentes permanecem responsabilidade dos dados de runtime, sem alteração nesta entrega.

## Conferência e evidências

- Inspeção das oito fontes inteiras e de todos os 48 quadros montados; contornos, dedos, patas, crista, cauda, acessórios e margens. Separação entre linhas da fonte ajustada ao espaço vazio real no voo e na quebra do ovo, sem cortar desenho nem misturar células vizinhas.
- Comparação das ações com a guarda da própria skin em escala real, em fundos claro e escuro; identidade, paleta, iluminação, proporções, figurino, direção e continuidade dos membros. Escala única por ação, sem esticar partes ou quadros individualmente.
- Conferência das fases e das transições de loop, além dos dois retornos exatos à guarda. Contatos mostram cada quadro; GIFs e página interativa permitem reprodução normal, pausa e seleção de quadro.
- Inspeção das seis comparações de limpeza, 24 quadros, com a faixa de pixels removidos. Conferência especial das espirais próximas às penas do Urubu e à cartola.
- Validação automática dos 14 PNGs: RGBA, dimensões, quantidade, sobras vazias, quadros não vazios, endpoints idênticos ao idle, linha do chão dos lutadores, base dos respingos, hashes e restrição das alterações às máscaras. A diferença de RGB é zero nos seis originais/limpos.

Prévia: [output/biriba-ovo-tontura/revisao.html](../output/biriba-ovo-tontura/revisao.html). Registro de inspeção: [revisao-quadros.md](../output/biriba-ovo-tontura/revisao-quadros.md). Fontes `*-source.png`, prompts completos `*-prompt.txt`, referências congeladas e hashes em `references.json`, fichas em `fichas.json`, caixas visuais e hashes individuais em `*-report.json`, manifesto em `manifest.json`, limpeza em `cleanup-report.json` e resultado de verificação em `validation.json`.

Para repetir somente a verificação: `python output/biriba-ovo-tontura/delivery.py verify`. As caixas registradas são medidas visuais, não hitboxes automáticas. Scripts usados apenas para extração, limpeza de bordas/transparência, remoção solicitada das partículas, alinhamento, montagem e conferência; nenhum redesenho procedimental.

## Fora desta entrega

Mecânicas, carregador/queda, sockets finais, gravidade, dano, hitboxes, defesa, registro de ações, FPS efetivos, reposicionamento do giro do Galo, ocultação do acompanhante e testes na Academia/combate ficam com Claude. Não foi feito teste visual dentro do jogo. A inspeção do Codex não constitui aprovação visual do João.

Nenhuma alteração desta produção em `src/`, JSONs de lutadores, assets do Bahia, pasta do Biriba de cenário, `scripts/biriba.py` ou `docs/biriba-cenario.md`. As únicas sheets existentes substituídas foram os seis `stunned.png` do item 9. Nenhum commit ou push.
