# Torcida: caminhada, escadas e saída por resultado

Atualização: a [revisão v5](torcida-humores-v5.md) adiciona humores, probabilidades de saída individual, sorteio de pessoas espalhadas e camadas de cadeiras. Mantém os percentuais por derrota e os 35% extras; prevalece sobre os horários e a fila descritos nesta entrega histórica.

Pedido e correções de 03/11/2026. A torcida inteira usa a estrutura de fileiras existente; cada NPC pode andar lateralmente até um acesso, descer até o nível 0 e seguir ao limite externo antes de ser removido. As duas novas ações têm os dez tipos da v3.

## Reação à luta

- Vitória com o vencedor no vermelho: encaminhar 7% da torcida perdedora à saída.
- Vitória com o vencedor no verde: encaminhar 35%.
- Amarelo: percentual gradual entre 7% e 35%, conforme a vida restante. Escolha confirmada pelo João em 03/11/2026; interpolação linear entre os limites vermelho e verde do HUD.
- Após uma derrota contra vencedor verde, se no round seguinte esse adversário estiver verde e o jogador derrotado chegar ao vermelho: encaminhar **mais 35 pontos percentuais**, uma única vez por lado. Assim 35% + 35% = 70% da torcida inicial.
- Derrota decisiva: encaminhar todo o restante da torcida perdedora. O resultado final não cria novas retiradas do vencedor.
- A revanche restaura a torcida, os adereços e todos os gatilhos. Empates, intervalo, treino e tela de resultado não disparam a parcela extra por vida.

Os limites são compartilhados com o HUD em `src/game/vidaFaixas.ts`: vermelho até 25%, amarelo acima de 25% até 50%, verde acima de 50%. Percentuais usam o público inicial de cada metade, com arredondamento para cima de frações de pessoa. Pessoas já encaminhadas não são contadas novamente.

## Leitura da pintura e caminhos

Imagem: `arquibancada-vazia.png`, 2048×869. O manifesto `circulacao-v4.json` registra 13 níveis, de 12 ao fundo a 0 na frente. A altura de cada fileira vem da pintura e do manifesto existente: 290, 315, 340, 365, 390, 416, 442, 468, 496, 525, 555, 586 e 618. Não são andares de prédio: são patamares da arquibancada.

A âncora antiga é o quadril, não o pé. Para circulação foram definidos pontos de apoio entre y=307 e y=623, com a cintura preservada como referência da posição sentada. O eixo da escada esquerda abre de x=323 até x=147; a direita acompanha o reflexo em x=1024. Os pontos foram calibrados visualmente sobre os degraus da pintura. `output/torcida-circulacao-v4/mapa-arquibancada.png` mostra o traçado sobre a imagem original.

Sequência central: deslocamento horizontal na própria fileira → escada do lado correspondente → todos os patamares inferiores → corredor frontal em y=623 (nível 0) → saída fora do quadro. A fila respeita uma distância de espera na escada; há escalonamento de início de 65 ms por pessoa, com atraso inicial de 300 ms. Velocidade nominal 65 px/s, 55% dela nas escadas, ajustada à escala de perspectiva. A saída total é gradual, podendo levar mais de dois minutos com centenas de pessoas; a tela de resultado mantém a cena animada.

**Limitação da pintura:** os setores laterais não têm um acesso completo visível. Seus acessos externos em x=-48 e x=2096 são inferidos, fora do enquadramento. O NPC continua descendo na simulação até o nível 0 antes de ser removido, embora essa parte não apareça na imagem. Não foi desenhada uma passagem através do muro para conectar as laterais à escada central.

O alambrado/gramado a partir de y=624 é recomposto por cima da torcida. Ninguém desce pelo campo. A ordem de desenho acompanha os pés; a perspectiva muda progressivamente. Bandeiras e sinalizadores do torcedor deixam de aparecer quando ele abandona seu lugar. Pessoas e cores continuam vinculadas à metade do P1/P2, não à posição dos lutadores durante o combate.

## Artes

Pasta: `public/assets/cenarios/estadio/torcida/`.

| Arquivo | Uso | Célula | Grade | Quadros | FPS |
|---|---|---|---|---|---|
| `torcida-andar-v4.png` | caminhada, base sem camisa | 64×112 | 8×5 | 40, quatro por tipo | 8 |
| `torcida-descer-v4.png` | descida, base sem camisa | 64×112 | 8×5 | 40, quatro por tipo | 6 |
| `torcida-andar-v4-camisa.png` | caminhada, roupa em chave magenta | 64×112 | 8×5 | 40 | 8 |
| `torcida-descer-v4-camisa.png` | descida, roupa em chave magenta | 64×112 | 8×5 | 40 | 6 |

Todas as folhas têm 512×560 RGBA. Índice linear `tipo * 4 + quadro`; cada linha contém dois tipos. Origem do pé em (32,111). Cada ciclo alterna apoio e passagem das pernas; na descida o peso passa de um apoio alto para o baixo. Identidade A/B permanece anatômica; espelhar a ação inteira permite a outra direção lateral. Sem giros isolados de um quadro.

Fontes corporais geradas pela ferramenta integrada de imagens com o atlas v3 sem camisa anexado. Cada ação foi gerada separadamente. Variantes vestidas foram editadas individualmente pela mesma ferramenta, com a fonte corporal correspondente anexada; o jogo mantém a recoloração do clube existente. Torcedores que já estavam sem camisa usam as bases sem camisa ao caminhar. A tentativa inicial de máscara procedural de camiseta foi rejeitada por falhas no figurino; não é fonte dos arquivos finais.

Fonte e contatos dos 160 quadros conferidos quanto a corpos inteiros, mãos/pés, identidade por tipo, continuidade, margens, transparência e leitura. Montagem por componentes conectados, escala uniforme 0,44 por ação/variante; sem deformação de membros ou poses repetidas para corrigir cortes. Cores de tecido foram normalizadas aos três tons da chave do projeto. Fontes, prompts completos, fichas em forma de relatório, recortes, caixas e hashes SHA-256 estão em `output/torcida-circulacao-v4/relatorio.json` e arquivos adjacentes.

## Integração e verificação

- `torcidaRotas.ts`: percurso por patamares, escala e remoção apenas no nível 0.
- `torcidaReacao.ts`: percentuais por vida, parcela extra única e decisão final.
- `torcidaMovimentoCena.ts`: grupos, fila, eventos, adereços, reinício e limpeza da cena.
- `torcidaCena.ts`: carrega as folhas, animações, recoloração e profundidade por pés.
- `MatchScene.ts`: passa resultado/vida real do vencedor e acompanha a condição verde × vermelho somente durante combate.

Reproduzir arte: `python scripts/torcida_circulacao_v4.py`. Reproduzir simulação: `node scripts/torcida_preview_v4.mjs`; renderizar: `python scripts/torcida_preview_v4.py`. A prévia `saida-coletiva.gif` é acelerada e offline: usa posições do controlador real com sprites simulados, não uma captura do Phaser. Não inclui os efeitos de bandeiras/fumaça. Os PNGs intermediários e o mapa também ficam na pasta de produção.

Testes cobrem os dois lados, todos os níveis, acesso lateral externo, avanço temporal, percentuais, limites de cor, parcela extra sem repetição, derrota final e revanche. Acesso ao navegador/desktop indisponível nesta sessão; inspeção ao vivo em combate e aceite visual do João permanecem pendentes.

Verificação final: TypeScript passou; `npx vitest run --pool=threads --maxWorkers=1` passou com 37 arquivos e 340 testes, sem erros; `npm run build` passou. A execução padrão por processos registrou timeouts do executor, por isso a suíte completa foi repetida com uma thread. Permanecem os avisos preexistentes de atlas de tiles não resolvido e tamanho do bundle. As quatro folhas finais foram conferidas por dimensões, margens e chave de cor, e as cópias do build coincidem com os arquivos em `public/`.

Simulação demonstrativa: 708 NPCs, dos quais 353 do lado que perde. A primeira derrota verde encaminha 124; a nova condição verde × vermelho leva o total encaminhado a 248. Ao fim, os 353 concluem a saída e os 355 do outro lado permanecem. A prévia simula a derrota verde em 1 s, a parcela extra em 25 s e a derrota final em 70 s; o último NPC termina aos 187 s. O GIF acelera esse tempo para revisão.
