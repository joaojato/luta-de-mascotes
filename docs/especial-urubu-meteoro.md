# Urubu: Avanço — corrente térmica e mergulho meteoro

## Escopo confirmado pelo usuário

Codex produz **as artes e este guia**; Claude implementa a mecânica. Os novos PNGs estão prontos na pasta do personagem, com nomes próprios. Não alterei `special.png`, `special-charge.png`, os JSONs dos lutadores nem o código de combate. O especial novo **ainda não está ativado no jogo**.

## Comportamento solicitado

Categoria: **Avanço**, assim como o especial do Saci, com uma trajetória própria do Urubu. O personagem avança **em direção ao oponente**, não simplesmente até a extremidade da arena.

1. Uma corrente de ar quente sobe por baixo do Urubu.
2. Ele abre os braços como uma ave aproveitando a térmica e levanta voo verticalmente.
3. Sobe até ficar completamente fora da tela.
4. Reentra pelo alto e mergulha na diagonal, aproximadamente 45 graus, em direção ao oponente, como um meteoro.
5. Atinge a região do alvo e recupera a guarda no chão.

Regra explícita de esquiva: **a única forma de escapar é pular enquanto recua, afastando-se do atacante**. Bloqueio, agachamento, ficar parado ou apenas pular não devem neutralizar o ataque. Não basta mudar a imagem: o responsável pela mecânica deve implementar e testar essa regra dos dois lados da tela, inclusive perto das bordas.

Para que a regra de esquiva seja possível, o mergulho não deve perseguir indefinidamente o alvo depois de iniciado; definir e testar o momento em que o ponto de impacto é fixado. O momento exato e o alcance devem ser calibrados na mecânica para cumprir o pedido. Dano, custo, stun, invulnerabilidade e possibilidade de interromper a preparação não foram redefinidos pelo usuário.

## Arquivos prontos

Todos em `public/assets/lutadores/urubu/frente/`, RGBA transparente, células de **256×256**, **cinco colunas**, leitura da esquerda para a direita e depois de cima para baixo. Células não utilizadas ficam vazias.

| Arquivo | Quadros | FPS sugerido | Conteúdo |
|---|---:|---:|---|
| `special-thermal-charge-v1.png` | 5 | 14 | Preparação e braços abrindo para captar a térmica |
| `special-meteor-v1.png` | 12 | 16 | Subida, mudança de direção, mergulho e recuperação |
| `thermal-updraft-v1.png` | 6 | 12 | Coluna ascendente de ar quente, sem personagem |
| `meteor-trail-v1.png` | 6 | 16 | Rastro diagonal do mergulho, sem personagem |

As duas camadas de efeito têm semitransparência intencional; preservar o alpha. O calor é uma estilização dourada/âmbar do fluxo de ar, não um projétil autônomo. Não adicionar dano independente à coluna térmica ou ao rastro por inferência.

As artes seguem o Urubu aprovado: penas azul-ardósia, bico laranja, camisa com faixas horizontais vermelhas e pretas, calção branco, meias vermelhas e pretas e chuteiras escuras. Ele usa seus dois braços; não foi adicionada outra dupla de asas.

## Mapa dos quadros — índices começam em zero

Preparação (5 quadros):

- 0: guarda.
- 1: leve flexão das pernas, concentra a força.
- 2: abre os braços para captar o ar quente.
- 3: braços erguidos/abertos, início de sustentação.
- 4: pose de decolagem com as pernas recolhendo.

Execução (12 quadros):

- 0–2: poses de subida e voo; o motor eleva a posição do personagem até ele sair completamente da tela.
- 3: inclina o tronco no alto, preparando o mergulho. Pode ser mantido enquanto o personagem estiver fora do enquadramento.
- 4–5: entra no mergulho diagonal.
- 6–7: ataque mais esticado, punho e bico liderando a descida.
- 8: fim do mergulho, começa a preparar o contato com o chão.
- 9: contato/recuperação muito baixa.
- 10: levanta para retomar a guarda.
- 11: guarda.

Sugestão visual para uma janela única de acerto: durante o mergulho 4–8, com pico em 6–7. A janela, hitboxes e contabilização do golpe devem ser decididas/testadas pelo Claude; não estão registradas no JSON de runtime. A coreografia mostra uma investida principal, não a antiga sequência de socos.

## Orientação, pivôs e trajetória

Os PNGs são desenhados para atacar **à esquerda**. No mergulho, cabeça e punho ficam na parte inferior esquerda; pernas e botas ficam na parte superior direita. Para atacar à direita, espelhar personagem **e rastro** juntos. A coluna térmica permanece vertical.

O motor precisa mover a entidade real e as caixas de acerto ao longo da subida/descida. Não deslocar só a arte enquanto a colisão fica parada, nem desenhar toda a viagem dentro de uma célula. Não é necessário cortar sprites ou adicionar quadros vazios para sair da tela: mover o personagem inteiro para além do limite superior do viewport.

As poses do corpo estão inteiras dentro das células, com escala anatômica uniforme por folha e 200 px na pose de guarda. Durante a preparação, braços erguidos mudam o tamanho da silhueta. Usar os `frameBoxes` de `output/urubu-meteoro/art-contract.json` para alinhar a raiz visual/pés quando necessário; para as poses aéreas, manter um pivô corporal estável, sem realinhar cada frame pela ponta das botas. Os efeitos mantêm origem consistente dentro das suas células.

O `kind: "dash"` atual apenas percorre X no chão; **reutilizá-lo sem acrescentar as fases verticais não implementa este especial**. A categoria de produto pode continuar sendo Avanço, com uma variante de trajetória aérea/meteoro na lógica. A nomenclatura final dos campos é responsabilidade da implementação.

## Prévia e fontes

- Prévia visual com pausa, controle de tempo e espelhamento: `output/urubu-meteoro/previa.html`. Serve como demonstração da coreografia, **não como prova da mecânica/esquiva**.
- Prévia animada portátil: `output/urubu-meteoro/previa-especial.gif`; sequência de seis momentos para conferência: `output/urubu-meteoro/storyboard.png`.
- GIFs separados: `output/urubu-meteoro/charge-preview.gif`, `meteor-preview.gif`, `thermal-preview.gif` e `trail-preview.gif`.
- Quadros numerados em imagens de conferência: `charge-contact.png`, `meteor-contact.png`, `thermal-contact.png` e `trail-contact.png`, na mesma pasta.
- Fontes e prompts completos: `output/urubu-meteoro/manifest.json`, `<id>-source.png` e `<id>-prompt.txt`. Gerados pela ferramenta integrada de imagens.
- Correção do enquadramento dos braços da preparação: `charge-layout-correction-prompt.txt`; a fonte corrigida usa 3×2 posições com a última vazia, enquanto o PNG final mantém cinco colunas para o motor.
- Montagem e validação: `python scripts/urubu_meteoro.py`. Exporta 4 folhas/29 quadros e as caixas em `art-contract.json`, sem escrever arquivos de gameplay.
