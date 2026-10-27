# Padrão artístico — Urubu como referência

Referência principal: `referencia/urubu/modelo-oficial.png`. Saci como referência complementar de linguagem arcade.

## Regra permanente definida pelo usuário

Todo personagem novo ou refeito deve seguir **sempre este estilo artístico e as animações do Urubu**, salvo alteração solicitada explicitamente pelo usuário. Referências externas definem a identidade, espécie, cores e figurino; o traço e as poses continuam seguindo o padrão do projeto. Não reinterpretar livremente as animações: tratar os novos personagens como skins do Urubu até que o usuário peça movimentos próprios.

Exceção explicitamente solicitada depois: a revisão de agachamento, salto e bloqueios em `docs/revisao-poses.md` atualiza o padrão. Bloqueios sustentam as mãos como no Saci; esquiva termina bem abaixada; quadros de voo não contêm outra trajetória vertical. As novas artes do Urubu nesses caminhos são a referência para as próximas skins.

Quando o pedido for apenas o primeiro sprite, entregar somente a base de corpo inteiro em guarda, voltada para a esquerda e com transparência. A geração das animações e a integração do lutador ficam para a etapa solicitada depois.

## Traço

Pixel art de luta arcade, com contornos escuros fortes, silhueta legível e pixels aparentes. Volumes construídos com áreas de cor e sombras em blocos, aproximadamente três ou quatro tons por material. Evitar gradientes suaves, texturas minuciosas e acabamento realista.

Proporções heroicas e compactas: ombros largos, braços e pernas fortes, mãos e pés grandes. Anatomia simplificada; músculos sugeridos por poucos planos. Rosto expressivo, sobrancelhas marcadas e atitude competitiva. O personagem precisa funcionar em tamanho pequeno.

Roupa com poucas dobras bem escolhidas. Paleta reconhecível por mascote. Não incluir escudos, patrocinadores, texto, sombra no chão ou efeitos na imagem-base.

## Bases redesenhadas em 27/10/2026

- Bira: `referencia/bira/referencia-estilo-urubu-v1.png`. Preserva cachorro de orelhas pontudas, focinho claro, cauda, uniforme listrado preto e branco e faixas nos pulsos. Simplifica anatomia e sombras.
- Cartola: `referencia/cartola/referencia-estilo-urubu-v1.png`. Preserva cabelo ruivo, cartola preta, fraque bordô, gravata e calça verdes. Adota rosto adulto e porte de lutador.
- Galo: `referencia/galo/referencia-estilo-urubu-v1.png`. Base aprovada pelo usuário: penas brancas, crista e barbela vermelhas, camisa vertical preta e branca, calça preta dobrada, pernas e garras de ave ocres. Animações e integração detalhadas em `docs/mascotes/galo.md`.

Geradas com a ferramenta integrada de imagens, com fundo transparente. Prompts completos das bases em `referencia/bira/prompt-estilo-urubu-v1.txt` e `referencia/cartola/prompt-estilo-urubu-v1.txt`.

## Movimentos como skins do Urubu

Exceções próprias mais recentes: [golpes-personalizados-v3.md](../golpes-personalizados-v3.md). Só os comandos explicitamente pedidos ganham novas coreografias; o Cartola preserva a aparência aprovada ao adicionar a bengala da referência. Essa revisão prevalece sobre o pesado padrão do Cartola e os chutes principais de Urubu, Saci e Galo. As outras regras continuam valendo.

Atualização posterior explícita: [revisao-golpes-v2.md](../revisao-golpes-v2.md). Leve passa a seguir os dois rápidos do Almirante; pesado usa o antigo leve do Urubu/Galo, com patada do Bira como exceção confirmada. Todos mantêm ao menos um chute real. Bira usa galope com suspensão e bote com salto para morder. Essa atualização prevalece sobre a cópia integral das ações descrita abaixo. Bahia permanece na primeira versão e suas animações foram adiadas pelo usuário.

As novas bases do Bira e do Cartola usam as 13 ações da variante principal (`frente`) do Urubu: guarda, andar para frente, andar para trás, agachar, saltar, defesa alta, defesa baixa, reação ao golpe, soco leve, chute forte, preparar especial, especial e queda. São 90 quadros por personagem. As folhas de referência usam os arquivos apontados pelo JSON do Urubu, incluindo as versões v2 de defesa alta, reação e soco.

Os quadros foram redesenhados pela ferramenta integrada de imagens usando a base aprovada como identidade e cada sequência do Urubu como guia de poses. Quantidade de quadros, ordem, fps, repetição, janelas de ataque, caixas de ataque/guarda e parâmetros de movimento/combate são herdados do Urubu. O redesenho é generativo: os contornos e detalhes não são uma transformação geométrica idêntica do original. A montagem usa uma escala uniforme dentro de cada ação, acompanha o deslocamento vertical da referência e calcula as caixas visuais das novas figuras.

Assets finais: `public/assets/lutadores/cachorro/urubu-v1/` (Bira; id interno preservado) e `public/assets/lutadores/cartola/urubu-v1/`. São as bases selecionáveis; as artes anteriores permanecem na variante `base`, acessível na Academia.

Fontes e prompts completos por personagem/ação: `output/skins-urubu/<id>/<acao>-source.png` e `<acao>-prompt.txt`. O manifesto `output/skins-urubu/manifest.json` registra as referências e os prompts usados. A comparação sincronizada está em `output/skins-urubu/revisao.html`, acompanhada de GIFs de cada ação. Abrir o HTML localmente ou pelo servidor Vite.

Pipeline de preparação, importação e verificação: `python scripts/skins_urubu.py prepare|import|verify`. `prepare` monta apenas referências; a arte deve ser gerada pela ferramenta de imagens antes de `import`. A importação preserva um backup das definições anteriores em `output/skins-urubu/<id>/previous-definition.json`.
