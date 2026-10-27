# Galo — padrão Urubu

Novo especial solicitado explicitamente: avanço com bicada em voo baixo, esquivável ao abaixar. Artes e guia: [especial-galo-bicada.md](../especial-galo-bicada.md). Folhas `special-peck-charge-v1.png` e `special-flying-peck-v1.png` entregues separadamente; a integração da mecânica fica com Claude.

Imagem-base: `referencia/galo/referencia-estilo-urubu-v1.png`.

Identidade baseada na imagem de galo enviada pelo usuário: penas brancas/cinza-claro, crista e barbela vermelhas, sobrancelhas fortes, bico e pernas ocres, cauda longa de penas claras, camisa listrada vertical preta e branca, calça preta com barras dobradas e pés de ave com garras. O escudo e a assinatura da referência não fazem parte do sprite.

Estilo e pose seguem o padrão do Urubu: pixel art arcade, contornos escuros, sombras em blocos, corpo forte e compacto, guarda voltada à esquerda, corpo inteiro e fundo transparente. A referência externa orienta a identidade; o Urubu orienta o traço e a pose.

Gerado com a ferramenta integrada de imagens. Prompt completo: `referencia/galo/prompt-estilo-urubu-v1.txt`. Entradas: ilustração anexada pelo usuário e `referencia/urubu/modelo-oficial.png`.

## Animações

Após a aprovação explícita da base, o conjunto completo segue as 13 ações da variante principal do Urubu, com 90 quadros: guarda, andar para frente, andar para trás, agachar, saltar, defesa alta, defesa baixa, reação ao golpe, soco leve, chute forte, preparação do especial, especial e queda.

As poses são redesenhadas a partir das folhas apontadas por `src/game/lutadores/urubu.json`, com quantidade, ordem, fps, repetição, janelas de ataque e caixas de ataque/guarda do Urubu. O figurino e a identidade vêm da base aprovada. Não adicionar bicadas, ataques de asa ou movimentos próprios sem pedido explícito do usuário.

Assets finais: `public/assets/lutadores/galo/urubu-v1/`. Definição: `src/game/lutadores/galo.json`, id `galo`, nome de seleção `Galo`. Âncora e retrato são derivados da base aprovada. As folhas finais têm cinco colunas, células de 256×256, fundo transparente e margens para crista, cauda e garras.

Fontes geradas pela ferramenta integrada de imagens e prompts completos: `output/skins-galo/galo/<acao>-source.png` e `<acao>-prompt.txt`. Referências e prompts também estão registrados em `output/skins-galo/manifest.json`. Comparação sincronizada com o Urubu: `output/skins-galo/revisao.html`; prévias por movimento: `output/skins-galo/galo/<acao>-preview.gif`.

Pipeline: `python scripts/skins_urubu.py prepare|import|verify --character galo`. A preparação monta referências e prompts; a ferramenta de imagens gera o desenho; a importação monta e alinha as folhas; a verificação confere transparência útil, contagem, tamanho das células e igualdade dos tempos e parâmetros de combate com o Urubu.
