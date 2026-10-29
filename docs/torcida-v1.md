# Torcida dividida — arte v1

Entrega de 29/10/2026 para integração pelo Claude. Artes produzidas com a ferramenta integrada de imagens, uma peça por chamada; as revisões de bandeira e fumaça também foram individuais. Nenhum arquivo de código, JSON de lutador ou sprite de lutador foi alterado nesta entrega. O cenário original foi preservado, sem commit ou push.

## Arquivos instalados

Diretório: `public/assets/cenarios/estadio/torcida/`.

| Arquivo | Imagem | Célula | Grade | Quadros |
|---|---|---|---|---|
| `arquibancada-vazia.png` | 2048×869 RGBA | imagem inteira | 1×1 | 1 |
| `torcedores.png` | 256×800 RGBA | 64×80 | 4 colunas × 10 tipos | 40; 4 por tipo |
| `bandeira.png` | 768×128 RGBA | 128×128 | 6×1 | 6 |
| `fumaca.png` | 512×384 RGBA | 128×192 | 4×2 | 8 |
| `sinalizador.png` | 128×32 RGBA | 32×32 | 4×1 | 4 |
| `torcida.json` | manifesto UTF-8 | — | — | medidas de folhas e 39 trechos de fileira |

Leitura das folhas da esquerda para a direita, de cima para baixo. Em torcedores, cada linha é um tipo: homem de pele escura, mulher de cachos, homem loiro, criança, idoso, mulher gordinha, homem de boné azul, mulher com afro, homem careca com barba e mulher de rabo de cavalo. Colunas: parado, braços acima, pulinho e punho erguido. Quadril no limite inferior da célula, com 1 px transparente; no pulinho fica 5 px acima. Não há pernas completas.

Camisas e pano usam exclusivamente `#FF00FF`, `#B000B0` e `#700070`: vermelho igual ao azul, verde zero, matiz 300°, saturação 100%. Contornos, pele, cabelos, calças, boné e madeira ficam fora da chave. Fumaça tem canais RGB iguais, de cinza claro a branco, com transparência nas bordas. A chama mantém amarelo, laranja e vermelho e não recebe cor chave. Nenhum escudo, nome, patrocínio ou número foi desenhado.

## Manifesto e âncoras

`folhas` declara `arquivo`, `celulaLargura`, `celulaAltura`, `colunas`, `linhas`, `quadros` ou `quadrosPorTipo`. O índice linear dos torcedores é `tipo * 4 + pose`. `fpsSugerido` é orientação de arte: torcedores 4; efeitos 8. O código pode escolher tempos diferentes e fases por pessoa.

Âncoras locais: bandeira (32,126), fumaça (64,190), sinalizador (16,30). A base foi alinhada pela extremidade inferior da imagem, com margem transparente de 2 px. Torcedor: centro da célula, quadril y=79; não usar a cabeça como origem.

`fileiras` contém `setor`, `y`, `xInicio`, `xFim`, `escala` e `passo`. Coordenadas na imagem de 2048×869, origem no canto superior esquerdo. Os intervalos delimitam centros úteis para colocação, recuados das escadas; as extremidades não são a largura do corpo. Renderizar do fundo para a frente. Laterais encostam na borda da tela e podem exigir recorte da figura pelo cenário.

## Medição das fileiras

A fonte vazia tem 1921×819 e foi registrada sobre a tela original 2048×869 com nearest-neighbor. Medidas abaixo conferidas na imagem final; são as arestas inferiores dos patamares de assentos, e não uma grade estimada sobre a torcida antiga. A prévia numerada está em `output/torcida-v1/fileiras-medidas.png`. Não colocar pessoas nas escadas.

| Fileira central, fundo → frente | y do quadril | x início | x fim |
|---|---:|---:|---:|
| 1 | 290 | 368 | 1682 |
| 2 | 315 | 360 | 1690 |
| 3 | 340 | 352 | 1698 |
| 4 | 365 | 344 | 1706 |
| 5 | 390 | 334 | 1716 |
| 6 | 416 | 324 | 1726 |
| 7 | 442 | 314 | 1736 |
| 8 | 468 | 304 | 1746 |
| 9 | 496 | 292 | 1758 |
| 10 | 525 | 280 | 1770 |
| 11 | 555 | 266 | 1784 |
| 12 | 586 | 252 | 1798 |
| 13 | 618 | 238 | 1812 |

Escala central: largura útil de cada fileira dividida pela largura útil da frente (1574 px), arredondada a três casas; frente = 1. Espaçamento de referência = 40 × escala, arredondado. A variação acompanha a abertura medida da arquibancada.

Laterais: y = 292, 316, 340, 365, 390, 416, 442, 470, 498, 527, 556, 587 e 618. À esquerda, intervalo de 0 até 173, 163, 154, 144, 134, 123, 113, 101, 90, 78, 67, 54 e 42 respectivamente. À direita, os intervalos são refletidos sobre x=1024, com limite exterior 2047. Escala lateral recomendada de 0,65 no fundo até 0,80 na frente; espaçamento = 40 × escala. Esses valores de escala são calibração visual de montagem; posições dos patamares e limites úteis foram medidos. O manifesto traz todos os números por trecho, sem exigir interpolação no jogo.

## Revisão e evidências

Fontes, prompts completos, fontes rejeitadas identificadas, script de montagem, quadros individuais, folhas sobre claro/escuro, GIFs, prévia de montagem e hashes SHA-256 ficam em `output/torcida-v1/`. Entrada de revisão: `output/torcida-v1/revisao.html`; relatório: `output/torcida-v1/relatorio.json`.

Conferidos visualmente fonte e todos os 58 quadros das folhas, presença de mãos, continuidade de braços, variação de poses, margens, uniformidade de escala por tipo, alinhamento das bases e vizinhança entre quadros do loop. A montagem inicial que cortava mãos e incluía fragmentos vizinhos foi descartada; extração final usa componentes conectados da fonte. Primeira bandeira descartada por margem insuficiente; primeira fumaça descartada por crescer entre início e fim. Não foram usados quadros repetidos para esconder erros.

Verificados por script: dimensões, células, contagens, três tons exatos da chave, fumaça neutra, caixas visuais, hash do original e igualdade RGBA fora da máscara de edição. O fundo mantém pixels originais nas regiões protegidas; somente arquibancadas e tecidos pendurados foram editados. Para remover faixas penduradas, a malha foi restaurada por extração de um trecho limpo do próprio alambrado; barras e placas foram preservadas. `mascara-edicao.png` permite auditar precisamente a região alterada.

Original preservado: SHA-256 `636e35da13419d880700269c7b8a5e557c5f55cf578ed0c87dfeff359de24bfd`.

## Pendências de integração

Faltam registro/carregamento das folhas pelo código, teste de recoloração e estampas no runtime, camadas em relação ao alambrado, fases e velocidades individuais, câmera e desempenho em combate. A prévia magenta é composição offline para conferir encaixe, não captura do jogo. Não foi executado `npm run check`, pois esta entrega não altera código; as validações realizadas são de arte e arquivos. Aceite visual final continua com João.

Reprodução: `python output/torcida-v1/montar.py`. Aplicação após revisão: acrescentar `--apply`. O script mantém backup de destinos preexistentes em `output/torcida-v1/backup/` e não toca em `src/`, lutadores ou cenário original.
