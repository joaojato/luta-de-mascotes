# Gavioezinhos da Fiel

Nome definido pelo usuario para o trio menor. O NPC grande de bracos
cruzados se chama **Gaviao da Fiel**. Este trio acompanha a identidade de
gavioes brancos com bicos/garras amarelos e aderecos pretos/brancos.
Referencia externa de criminosos define atitude malandra e mascaras;
nao copiar especie canina nem uniforme azul/laranja.

Tres bases produzidas separadamente pela ferramenta integrada de imagens:

| Base | Silhueta e aderecos | Pose |
|---|---|---|
| `01-gorro-v1.png` | Baixo/robusto, gorro, mascara, regata preta, calcoes brancos, faixas nos pulsos | Bracos cruzados |
| `02-bone-v1.png` | Esguio, bone para tras, moletom preto aberto, camiseta branca, corrente prateada | Maos nos bolsos |
| `03-boina-v1.png` | Arredondado, boina, bomber, camiseta listrada, bandana branca, argola prateada | Segura lapelas |

Arquivos em `referencia/corinthians/gavioezinhos/`. Fontes, prompts,
relatorios e manifesto em `output/gavioezinhos-v1/`. A referencia do
Urubu define o acabamento arcade; o Gaviao da Fiel define identidade
e paleta da familia. Dois bracos e duas pernas por personagem,
rostos voltados ao espectador, sem escudos, letras ou armas.

Conferidos individualmente figurino, identidade, membros, silhueta,
RGBA e hashes. Sao bases visuais, sem animacoes ou registro no jogo.
Os recortes gerados ainda apresentam halo suave externo; limpar antes
de montar atlas de runtime. O tamanho menor devera ser estabelecido pela
escala anatomica durante a integracao, nao pela resolucao dos PNGs fonte.
