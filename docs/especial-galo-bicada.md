# Especial do Galo — avanço com bicada em voo baixo

## Pedido e divisão de trabalho

O Galo levanta pouco do chão, voa na direção da cabeça do adversário e dá uma bicada. **Abaixar deve permitir passar por baixo do ataque.** Este movimento próprio foi solicitado explicitamente pelo usuário, como exceção ao conjunto de movimentos copiado do Urubu.

Codex entrega as artes e este guia. Claude implementa a mecânica, registra as animações e valida o combate. Esta entrega não altera TypeScript, JSON do lutador nem os especiais atualmente ativos.

## Arquivos entregues

Pasta: `public/assets/lutadores/galo/urubu-v1/`.

| Arquivo | Quadros | Organização | FPS sugerido |
| --- | --- | --- | --- |
| `special-peck-charge-v1.png` | 5 | 5 colunas, 1 linha | 14 |
| `special-flying-peck-v1.png` | 12 | 5 colunas, 3 linhas; últimas 3 células vazias | 16 |

Células de 256×256, transparência RGBA, sequência por linhas, índice inicial zero, personagem voltado à esquerda. Espelhar para a direita. Reproduzir uma vez, sem loop. Os tempos sugeridos são uma base visual, sujeitos ao ajuste da mecânica por Claude.

Identidade e estilo vêm de `referencia/galo/referencia-estilo-urubu-v1.png`: pixel art arcade, contorno escuro, sombras em blocos, penas claras, crista e barbela vermelhas, camisa listrada vertical preta e branca, calça preta e pés de ave. Dois braços recolhidos durante o voo, sem asas extras. O bico conduz o ataque; mãos e garras ficam para trás.

## Sequência visual

Preparação: 0 guarda; 1 flexão curta; 2 impulso; 3 recolhimento das pernas; 4 saída em voo baixo.

| Quadros da bicada | Intenção |
| --- | --- |
| 0–2 | Entrada no voo e avanço horizontal, pernas recolhidas |
| 3–4 | Preparação da cabeça para a bicada |
| 5–6 | Extensão do bico, pico visual do ataque |
| 7 | Seguimento da mesma bicada |
| 8 | Retração da cabeça, ainda no ar |
| 9–10 | Pouso curto e amortecimento |
| 11 | Retorno à guarda |

É **uma bicada por execução**. O quadro 7 não inicia um segundo golpe. A janela visual candidata é 5–7; Claude deve decidir os instantes efetivos e impedir múltiplos danos pela permanência em contato.

## Contrato para a mecânica

- Classificar como especial de **avanço**, indo na direção do oponente. A subida é curta; não sai da tela, não usa corrente térmica e não mergulha como o especial do Urubu.
- Usar a ponta do bico como referência do ataque. Não colocar caixa ofensiva nas mãos, barriga ou pés apenas por sobreposição dos sprites.
- Manter a linha da bicada na altura da cabeça de um adversário em pé durante a janela ofensiva. Não acompanhar a cabeça quando o adversário agacha: isso anularia a esquiva solicitada.
- Abaixar deve reduzir a região atingível o suficiente para a bicada passar por cima. Não depender só da aparência do sprite; conferir a caixa real de colisão.
- Tratar deslocamento horizontal, elevação curta e pouso na mecânica. As folhas contêm poses, não um arco completo de deslocamento pelo cenário. Evitar um segundo impulso ao trocar de animação.
- Alinhar a transição da preparação para o voo e do voo para o pouso usando os pivôs do jogo. As poses de voo são recolhidas; não alinhar todos os quadros pelos pés, o que faria a cabeça oscilar.
- Ajustar o alcance ao adversário sem teleporte, atravessamento involuntário nem correção vertical em direção a alvos abaixados. Conferir os dois sentidos e os limites da arena.
- Dano, custo, invulnerabilidade, bloqueio e demais regras não foram redefinidos neste pedido. Não copiar a condição de esquiva do meteoro do Urubu para este especial.

## Revisão e reprodução

Abra `output/galo-bicada/previa.html` para alternar entre o adversário em pé e abaixado. GIFs: `previa-acerto.gif` e `previa-esquiva.gif`. As prévias demonstram a coreografia; não simulam colisões nem comprovam acerto/esquiva no jogo.

`charge-contact.png`, `peck-contact.png` e `storyboard.png` permitem revisar as poses. `art-contract.json` registra dimensões, quantidade e limites visíveis de cada quadro. Fontes e prompts completos estão em `output/galo-bicada/`, registrados em `manifest.json`. Artes criadas com a ferramenta integrada de imagens (built-in); montagem técnica e prévias via Pillow. Reproduzir a montagem e checagens: `python scripts/galo_bicada.py`.

Verificação desta entrega: 2 folhas, 17 quadros, margens internas, células finais vazias e revisão visual com fundo contrastante. Integração pendente com Claude: testar acerto em pé, esquiva abaixado em toda a janela ativa, um dano por execução, os dois sentidos, distância curta/longa, limites da arena e retorno à guarda sem salto adicional.
