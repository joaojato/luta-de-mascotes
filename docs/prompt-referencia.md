# Prompt base da referência de mascote

Prompt completo para gerar a imagem de referência de um mascote no Nano
Banana Pro ou GPT Image, anexando a imagem de partida. É o prompt do João
(17/09/2026) com o bloco **REGRAS DO PROJETO** acrescentado no topo, que
vence qualquer elemento da imagem anexada. O molde curto continua em
`docs/pipeline-arte.md`; este é o longo, para copiar inteiro.

Salvar o resultado em `referencia/<slug>/referencia-vN.png` (fora do git),
1024×1024.

---

Use a imagem anexada como referência visual principal e obrigatória do personagem.

Transforme o personagem da imagem em um asset 2D de videogame em pixel art 32-bit, com estética de jogo de luta arcade clássico dos anos 1990, fortemente inspirada na linguagem visual de fighting games como Street Fighter: sprite detalhado, anatomia estilizada, silhueta forte, pose marcante e acabamento profissional de personagem selecionável de um jogo de luta.

REGRAS DO PROJETO (prioridade máxima, acima de FIDELIDADE AO PERSONAGEM)

Estas regras vencem qualquer elemento presente na imagem anexada. Se a imagem anexada contradiz uma regra, a regra vale e a imagem é corrigida.

1. Direção: o personagem olha para a ESQUERDA da imagem. O adversário está à esquerda. Se a referência olha para a direita, espelhe a pose para que o resultado olhe para a esquerda.

2. Sem escudo, sem marca: remova qualquer escudo, brasão, emblema, monograma, sigla, patch, patrocínio, número ou texto que exista na roupa, no chapéu, nos acessórios ou em qualquer parte do personagem. Onde havia o emblema, deixe o tecido liso, mantendo a cor de base e o padrão. Listras, faixas e blocos de cor são permitidos e devem ser preservados.

3. Um personagem só: nenhum animal de companhia, mascote secundário, pássaro no ombro, pet ou figura extra. Se a referência tiver um, remova completamente.

4. Acessórios presos ao corpo: chapéu, luvas, cinto, capa, arma ou objeto na mão são permitidos, desde que encostados no corpo ou segurados. Nada flutuando, nada solto no ar, no máximo um objeto na mão.

5. Sem efeitos: sem partículas, sem aura, sem brilho, sem linhas de movimento, sem fumaça, sem energia, sem sombra projetada.

6. Atitude de torcida, não de empresa: expressão provocadora e confiante. Nada fofo, corporativo, infantil ou de propaganda de banco.

7. Sem violência gráfica: sem sangue, sem ferimento, sem arma apontada.

8. Cores: o figurino tem até três cores fortes dominantes, mais preto, branco e o tom natural de pele, pelo ou penas. Sem dourado brilhante, sem metálico chamativo, sem cor de moeda de cassino.

9. O personagem pode ser pessoa, animal ou criatura. Tudo o que este prompt diz sobre pele e cabelo vale também para penas, pelo, plumagem ou escamas.

10. Saída: imagem quadrada de 1024x1024 pixels.

FIDELIDADE AO PERSONAGEM

Preserve com máxima fidelidade os elementos que tornam o personagem reconhecível na imagem original, exceto o que as REGRAS DO PROJETO mandam remover:

* formato do rosto;
* cabelo e penteado;
* barba ou pelos faciais, caso existam;
* tom de pele, pelo ou penas;
* proporções físicas;
* roupa e acessórios;
* cores principais do figurino;
* detalhes visuais característicos;
* personalidade e expressão geral.

O personagem precisa ser claramente reconhecível como o personagem da imagem anexada, porém reinterpretado completamente como sprite de fighting game 2D.

ESTILO VISUAL

Criar como pixel art 32-bit autêntica, e não como ilustração vetorial, pintura digital ou desenho com filtro pixelado.

Características obrigatórias:

* pixels claramente definidos;
* bordas desenhadas manualmente em pixel art;
* sem anti-aliasing suave;
* clusters de pixels bem construídos;
* alto nível de detalhe dentro da linguagem de pixel art;
* sombreamento por blocos de pixels;
* highlights bem definidos;
* contraste forte entre luz e sombra;
* volumes musculares e dobras da roupa construídos com pixels;
* paleta rica, semelhante a sprites avançados de arcade 2D;
* aparência de personagem de um jogo de luta premium da era 32-bit;
* acabamento limpo e legível mesmo em tamanho reduzido.

Evite aparência de Minecraft, voxel art, 8-bit extremamente simples, chibi, cartoon infantil ou pixel art minimalista.

DESIGN DE FIGHTING GAME

Reinterprete o personagem como um lutador de jogo arcade 2D.

A anatomia pode ser levemente estilizada para melhorar a leitura visual típica de fighting games:

* ombros mais definidos;
* mãos e pés ligeiramente maiores para melhor leitura do sprite;
* postura atlética;
* silhueta clara;
* expressão determinada;
* sensação de força, velocidade e presença.

Não transforme o personagem em um bodybuilder exagerado caso sua aparência original não seja assim.

POSE

Mostrar o personagem de corpo inteiro, completamente visível, sem cortar cabeça, mãos ou pés.

Coloque-o em uma neutral fighting stance / idle pose, como se estivesse pronto para começar uma luta:

* pés afastados;
* centro de gravidade baixo;
* joelhos levemente flexionados;
* tronco preparado para combate;
* braços elevados em posição natural de luta;
* pose dinâmica, porém equilibrada;
* leitura clara da silhueta.

A pose deve parecer um verdadeiro idle sprite de um fighting game 2D.

PERSPECTIVA

Usar a perspectiva tradicional de jogo de luta lateral:

* personagem visto principalmente de lado, olhando para a ESQUERDA;
* corpo em aproximadamente 3/4;
* rosto parcialmente direcionado para o adversário, que está à esquerda;
* câmera perfeitamente ortográfica / lateral;
* sem perspectiva dramática;
* sem câmera de cima;
* sem câmera de baixo.

O resultado deve parecer pronto para ser colocado diretamente sobre o cenário de um jogo de luta 2D.

ILUMINAÇÃO E SOMBREAMENTO

Utilize iluminação típica de sprites arcade:

* luz principal vindo de cima e levemente pela frente;
* highlights fortes nas áreas iluminadas;
* sombras profundas nas regiões opostas;
* separação clara entre os planos do corpo;
* rosto sempre legível;
* detalhes do figurino claramente visíveis.

O sombreamento deve ser feito exclusivamente dentro da estética de pixel art.

FUNDO

FUNDO TOTALMENTE VERDE CHAPADO (#00FF00). Se o personagem for verde, usar magenta chapado (#FF00FF) no lugar.

Nenhum cenário.

Nenhum gradiente.

Nenhuma sombra projetada no fundo.

Nenhum chão.

Nenhuma interface.

Nenhuma barra de vida.

Nenhum texto.

Nenhum nome.

Nenhum logotipo.

Nenhum escudo, brasão ou emblema.

Nenhum elemento gráfico adicional.

Apenas o personagem centralizado sobre o fundo chapado, funcionando como um asset isolado.

COMPOSIÇÃO

* personagem inteiro;
* centralizado;
* bastante espaço ao redor da silhueta;
* não encostar nas bordas;
* nenhuma parte do corpo cortada;
* personagem ocupando aproximadamente 75 a 85% da altura da imagem;
* asset perfeitamente isolado e fácil de recortar posteriormente.

QUALIDADE FINAL

O resultado deve parecer um sprite oficial de um sofisticado fighting game arcade 2D, produzido pixel por pixel por um artista profissional.

Prioridades, em ordem:

1. cumprir as REGRAS DO PROJETO (direção, sem escudo, um personagem só);
2. preservar a identidade do personagem anexado;
3. preservar fielmente sua roupa e elementos característicos, menos o que as regras removem;
4. transformar a aparência em pixel art 32-bit genuína;
5. criar uma silhueta típica de fighting game;
6. corpo inteiro perfeitamente visível;
7. fundo verde chapado;
8. nenhuma aparência de ilustração digital suavizada ou de filtro automático.

NEGATIVE PROMPT / EVITAR

Não criar:

* fotografia;
* pintura digital;
* 3D;
* CGI;
* render realista;
* vetor;
* cel shading moderno;
* anime;
* chibi;
* cartoon infantil;
* voxel art;
* Minecraft style;
* 8-bit excessivamente simples;
* filtro de pixelização aplicado sobre uma foto;
* pixels borrados;
* anti-aliasing suave;
* fundo com cenário;
* elementos de interface;
* texto;
* logotipos;
* escudo, brasão, emblema, monograma, sigla, patrocínio;
* animal de companhia, pet, pássaro no ombro;
* segundo personagem;
* efeitos de energia, aura, partículas, linhas de movimento;
* dourado brilhante, metálico chamativo;
* sangue, ferimento;
* personagem olhando para a direita;
* personagem cortado;
* membros escondidos;
* múltiplas poses;
* sprite sheet;
* mais de um personagem.

Gerar apenas UM personagem, UMA pose, corpo inteiro, olhando para a esquerda, pixel art 32-bit, fighting game arcade style, sobre fundo verde chapado, 1024x1024.
