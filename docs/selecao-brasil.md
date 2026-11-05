# Seleção de personagens: Brasil

Atualização: estádio escolhido ao fundo, com opacidade reduzida; torcida mais clara que a arquitetura, exclusivamente na comemoração básica. Cores/estampa acompanham cada escolha. Não há holofote; uma sombra suave em volta do globo reduz a poluição visual. A prévia reutiliza as artes existentes, atualiza quadros em baixa frequência, mantém apenas duas paletas e libera texturas ao trocar de clube/sair da tela. Molduras e UFs no mapa compartilham tonalidade; elenco agrupado por UF, com Sudeste primeiro. Dentro do Sudeste: RJ (Fla/Urubu, Vasco/Almirante, Flu/Cartola, Botafogo/Bira), SP e MG. Depois vêm Sul, Nordeste, Centro-Oeste e Norte.

Pedido de 04/11/2026: seleção inspirada nos jogos antigos de Street Fighter, com globo ampliado no Brasil e estado de origem de cada clube.

- Globo central com grade de latitude/longitude, contorno dos 27 estados e cinco regiões em cores diferentes. Rótulos: Norte, Nordeste, Centro-Oeste, Sudeste e Sul.
- Retratos abaixo do globo e lutadores animados nas laterais. Nome do estado e UF abaixo do personagem.
- Cada cursor destaca o estado do clube declarado em `estado` no JSON do lutador. Dois jogadores no mesmo estado recebem marcadores separados. O sorteio não inventa uma origem.
- Preservados: teclado, toque, escolha da CPU, tutorial, torneio, confirmação e retorno à seleção. Grade dimensionada para larguras lógicas de 960 a 1680.
- Desenho geográfico estático convertido em textura uma vez; realce só é recomposto quando a seleção muda. Dois anéis pequenos animados indicam os jogadores.

## Dados e revisão

Fonte: [API de malhas geográficas simplificadas do IBGE](https://servicodados.ibge.gov.br/api/docs/malhas?versao=3), nível UF, qualidade mínima. Nomes e regiões vêm da API de Localidades do IBGE. O jogo usa o arquivo compacto local `src/game/mapa/brasil-estados.json`; não consulta serviços durante o uso. O contorno continental/principal de cada estado é usado para a escala do globo; pequenas ilhas não são representadas. Os marcadores usam pontos internos aos estados.

Regenerar dados: `python scripts/preparar-mapa-brasil.py`.

Testes conferem as 27 UFs, cinco regiões, origem de todos os personagens selecionáveis, limites dos marcadores e encaixe da grade em 4:3, 16:9 e telas largas. Composições estáticas de revisão em `output/selecao-brasil/`; elas não são capturas do jogo em execução.
