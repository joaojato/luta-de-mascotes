# Mosqueteiro e ataque dos Gavioes da Fiel

Pedido de 30/10/2026. Esta producao entrega artes por acao e contrato para
integracao. Nao registrar lutador com reacoes/queda ainda nao produzidas.
Instrucoes do usuario prevalecem sobre os golpes padrao do Urubu.

Identidade: `referencia/corinthians/base-mosqueteiro-v6.png`: roupa preta
de risca fina mais espaçada, friso branco fino no chapeu, penas verdadeiras
vermelhas/vinho, pele clara, couro vinho escuro, espada, bainha e mosquete.
Guarda de producao: `output/mosqueteiro-v1/guard.png`.
Um personagem/acao por chamada da ferramenta integrada de imagens.

## Continuidade

Braco A: direito anatomico, espada. B: esquerdo livre. Perna A proxima da
camera e recuada a direita; B distante e avancada a esquerda na guarda.
A mao nao troca durante estocadas/cortes. Bainha presa ao cinto esquerdo;
mosquete longo preso por bandoleira, sem desaparecer ou encolher.
No tiro, embainhar a espada, retirar/empunhar mosquete, mirar/disparar,
devolver a bandoleira e desembainhar. Nunca empunhar duas armas com a mesma
mao ou produzir arma duplicada.

Celulas do Mosqueteiro: 640x320; os dois ataques aereos usam 640x384.
Todas as folhas usam cinco colunas. A largura preserva o corpo e o comprimento
da espada/mosquete. Montagem uniforme por acao, sem deformar membros nem
reduzir quadros mais largos individualmente para caber. Origem local:
`[largura/2, altura-24]`; chao y=296 ou y=360 conforme a celula. A origem
nao significa que uma pose aerea esteja aterrissando. A integracao precisa
ler frameWidth/frameHeight POR FOLHA, origem dos pes e offsets de caixas.
Nao carregar estas folhas como 256x256. As celulas dos NPCs estao no manifesto.
Movimentos de mundo, recuos e trajetorias aereas pertencem ao motor.

## Acoes do Mosqueteiro

| Acao | Sequencia e estado final |
|---|---|
| idle | Respiracao sutil em guarda defensiva |
| walk-forward | Passos curtos de esgrima sem cruzar os pes |
| walk-backward | Pe traseiro inicia o recuo; continua olhando o inimigo |
| block-high | Espada/antebraco fecham linha frontal; sustenta defesa |
| light-punch | Duas estocadas com a mesma espada; recua um passo curto a cada impacto |
| shot | Preparacao deliberada do mosquete longo; disparo mais lento que a garrucha |
| crouch | Abaixa profundamente e termina baixo |
| block-low | COMECA no agachamento e permanece baixo, sem subir antes de defender |
| heavy-punch | Do agachamento, cotovelada com avancada e termino em pe |
| low-kick | Uma estocada baixa, mantem baixo durante contato; so depois levanta recuando |
| jump | Preparo e poses aereas; motor aplica parabola |
| jump-punch | Corte simples de espada inteiramente no ar |
| jump-kick | Descida com ponta da espada na diagonal, sem chute ou pouso desenhado |
| special-charge | Sinal para os Gavioes, arma segura e guarda recuperada |

Cadencia/dano do tiro: Almirante atual usa `shot`, seis quadros a 12 FPS,
releaseFrame=3 (aprox. 0,25 s), `kickDamage=19`. Mosqueteiro precisa de
preparacao maior e dano maior; marcar o quadro exato de disparo na arte
entregue e sugerir 26 de dano, sujeito ao balanceamento da logica. Nao
confundir tamanho visual da arma com caixa de acerto automatica.

## Quatro NPCs e especial

Principal: **Gaviao da Fiel**, parado de prontidao, bracos cruzados.
Menores: **Gavioezinhos da Fiel**: gorro/robusto, bone/esguio,
boina/arredondado. Cada um preserva especie, roupa e acessorios proprios.
Todos ficam perto do maior; pequenos fazem gestos/olhares entre si sem
percorrer o campo. Interacao desenhada individualmente, nunca atlas coletivo.

O menor de bone decola/voa/ataca para a direita, com virada continua da
pose frontal; os demais usam a direcao indicada no contrato de cada folha.
Isto permite entradas por lados opostos sem inverter um quadro isolado.

Especial solicitado:

1. Mosqueteiro sinaliza; principal descruza asas, impulsiona e voa para
   cima ate sair da tela. Usar subida do Urubu como inspiracao de fases.
2. Principal reentra e ataca NO AR, sem tocar o chao. Primeiro golpe pode
   falhar/ser evitado; NAO disparar sequencia apenas porque animacao acabou.
3. Somente evento de acerto confirmado no oponente libera os menores.
4. Tres menores atacam um por vez, em ordem, de lados alternados; estes
   tres contatos sao imbloqueaveis. Os quatro danos individuais sao baixos,
   soma consideravel. Sugestao inicial: 8+8+8+8=32, sem autorizar acertos
   fantasmas se o primeiro errou ou foi bloqueado.
5. Ataques e afastamentos ficam no ar. Depois do combo, retorno separado
   para prontidao; nao misturar pouso com quadros de contato ofensivo.

O acerto confirmado deve manter a mesma vitima em hitstun durante os tres
contatos seguintes, com pouco afastamento intermediario, para que a sequencia
realmente conecte. Ser imbloqueavel, sozinho, nao garante isso. Cancelar ao
morrer a vitima ou encerrar o round. Sugestoes de dano/deslocamento nao sao
valores ativos no jogo.

As artes distinguem os menores: gorro soca no ar; bone da um chute lateral
com uma perna; boina recolhe as duas pernas e golpeia com as duas garras
na diagonal para baixo. O maior ataca com as garras no ar. Todos possuem
decolagem, ciclo de voo e retorno separados, sem pousar durante os contatos.

Contrato de logica a implementar: invocadores vinculados ao dono; idle/
interacao fora do especial; estado decolagem -> voo -> ataque-principal ->
confirmacao -> tres ataques sequenciais OU falha -> retorno. Um unico combo
ativo por dono, cancelar ao encerrar round/destruir ator. Contatos nao
simultaneos. Primeiro acerto consome uma vez, sem reiniciar o especial em
cada quadro ativo. Alvos/lados e trajetorias sao dados de mundo.

## Entrega e revisao

Assets em `public/assets/lutadores/mosqueteiro/base-v1/`, NPCs em subpastas.
Fontes/prompts/extracoes/contatos/previas/hashes em `output/mosqueteiro-v1/`.
Montagem: `scripts/mosqueteiro_v1.py`. Previa: `revisao.html` na pasta output.
Status de cada folha no manifesto; nao declarar combate testado ou registro
integrado com base apenas na verificacao dos PNGs.

## Entrega concluida de arte — 30/10/2026

**34 folhas finais, 212 quadros:** 14 acoes do Mosqueteiro (110 quadros)
e cinco acoes para cada um dos quatro acompanhantes (102 quadros).
Artes produzidas individualmente, com fontes e tentativas rejeitadas preservadas.
Esta entrega nao modifica a logica de combate nem registra o lutador incompleto.

| Mosqueteiro | Quadros | FPS |
|---|---:|---:|
| idle | 4 | 8 |
| walk-forward | 8 | 10 |
| walk-backward | 8 | 10 |
| block-high | 6 | 12 |
| light-punch | 12 | 16 |
| shot | 16 | 16 |
| crouch | 6 | 16 |
| block-low | 4 | 12 |
| heavy-punch | 10 | 14 |
| low-kick | 10 | 14 |
| jump | 8 | 12 |
| jump-punch | 6 | 14 |
| jump-kick | 6 | 14 |
| special-charge | 6 | 12 |

Tiro: evento unico no quadro **9**, cerca de **0,5625 s** de preparo.
Leve: contatos **2–3** e **7–8**, recuos separados **4–5** e **9–10**.
Cotovelada: contato **3–4**, termina em pe. Estocada baixa: contato **2–4**
abaixado; recua/levanta depois. Ataques aereos: contato **2–3** sem pouso.
Sinal para os Gavioes no quadro **3**. Indices comecam em zero.

| NPC | Celula final | Espera/interacao | Decolagem | Voo | Ataque | Retorno |
|---|---|---|---|---|---|---|
| principal | 512x320 | 4 / 6 FPS | 6 / 12 FPS | 4 / 12 FPS | 6 / 14 FPS | 4 / 10 FPS |
| gorro | 320x256 | 6 / 7 FPS | 6 / 14 FPS | 4 / 14 FPS | 6 / 16 FPS | 4 / 12 FPS |
| bone | 320x256 | 6 / 7 FPS | 6 / 14 FPS | 4 / 14 FPS | 6 / 16 FPS | 4 / 12 FPS |
| boina | 256x256 | 6 / 7 FPS | 6 / 14 FPS | 4 / 14 FPS | 6 / 16 FPS | 4 / 12 FPS |

Nomes dos arquivos dos NPCs: `npcs/<identidade>/idle.png` para o maior,
`interact.png` para os menores, mais `takeoff.png`, `flight.png`, `strike.png`
e `return.png`. Todos os ataques dos Gavioes usam contato 2–3 como um unico
evento por participante. Os 20 atlas de NPC tiveram apenas margens vazias
removidas: o montador reconstruiu os 102 quadros originais e comparou os
bytes RGBA, garantindo que nenhum pixel do desenho mudou nesse recorte.

Arquivos para revisao e integracao:

- [Previa interativa de todas as acoes](../output/mosqueteiro-v1/revisao.html):
  reproduzir, pausar, reduzir velocidade e percorrer quadro a quadro.
- [Comparacao em escala real](../output/mosqueteiro-v1/elenco.png).
- [Contrato para a logica](../public/assets/lutadores/mosqueteiro/base-v1/claude-integration.json):
  arquivos, hashes, dimensoes por folha, quadros de contato, transicoes,
  trajetorias a implementar e condicao de confirmacao do especial.
- [Manifesto final](../public/assets/lutadores/mosqueteiro/base-v1/manifest.json).
- [Verificacao dos PNGs](../output/mosqueteiro-v1/validation.json) e
  [verificacao da previa no navegador](../output/mosqueteiro-v1/browser-validation.json).

Verificado: 34 folhas RGBA, 212 quadros, hashes dos destinos, margens sem
cortes e celulas excedentes vazias. A previa carregou as 34 animacoes,
conferiu dimensoes e ultimo quadro de cada uma, sem excecoes de JavaScript.
Fontes e folhas montadas foram inspecionadas visualmente; isso nao significa
aprovacao pelo usuario. Ainda falta a integracao e conferencia no combate/
Academia pelo responsavel pela logica. Dano, deslocamento, hitboxes e hitstun
do contrato sao propostas ou requisitos para implementar, nao combate testado.

## Reacoes complementares — 30/10/2026

| Acao | Quadros | FPS | Loop |
|---|---:|---:|---|
| hit-high | 6 | 12 | nao |
| stunned | 4 | 6 | sim |
| knockdown | 10 | 10 | nao |

Tres folhas RGBA em `public/assets/lutadores/mosqueteiro/base-v1/`, com
celulas 640x320, cinco colunas, origem [320,296] e chao y=296. Hit-high
recua para a direita e retorna a guarda no quadro 5; stunned permanece
em pe, com espada baixa na mao direita, sem efeitos. Knockdown toca o
chao com quadril/costas no quadro **5** (0,5 s, indice iniciado em zero),
assenta a parte superior das costas no 7 e termina deitado, imovel, nos
quadros **8 e 9**, identicos; segurar o ultimo quadro sem loop.

Fontes, prompts, referencias com hashes, extracoes, comparacoes com a guarda
em fundos claro/escuro e previas ficam em `output/mosqueteiro-v1/<acao>/`.
Montagem com `scripts/mosqueteiro_v1.py` e extensao
`scripts/mosqueteiro_reacoes_v1.py`, sem pintura manual. Geração embutida,
uma acao por chamada, com guarda aprovada e base v6 anexadas. Manifesto,
validacao e contrato passam a incluir **37 folhas / 232 quadros**.
Esta entrega completa as reacoes de arte; registro e teste em combate
continuam com a integracao, sem alteracoes em `src/` nesta tarefa.
