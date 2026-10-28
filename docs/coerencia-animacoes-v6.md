# Revisão de coerência dos golpes

Pedido: revisar cada quadro gerado e a sequência montada, evitando inversões involuntárias, mudanças instantâneas e articulações contraditórias. Artes e guia são desta entrega; mecânicas continuam com Claude.

## Problemas encontrados

- Saci: a fonte v5 continha um soco para trás. A montagem o excluía repetindo o quadro seguinte. O jab foi redesenhado com seis poses progressivas: guarda, meia extensão, extensão, início de recolhimento, recolhimento e guarda. Mesmo braço e direção; bota alinhada pelo apoio, não pelo centro da silhueta.
- Cartola pesado: pomo na extremidade errada na passagem e inversão do corpo durante a recuperação. Preservar preparação e impactos válidos, substituindo apenas 8, 12 e 13. Mantém 16 quadros e impacto em 9–10.
- Cartola baixo: mão mudava para o meio da haste durante a extensão. A primeira tentativa de revisão também apresentou esse problema e foi rejeitada. A correção precisa manter a mesma mão no pomo durante extensão e retorno.

## Conferência

Inspeção das folhas e contatos dos leves de Saci, Urubu, Cartola, Galo e Bira, bengaladas pesada/baixa, giro do Galo e carrinho do Bira. Os leves alternados dos outros quatro mantêm impactos para a frente com braços distintos; a vista de costas no segundo impacto é rotação do tronco. No giro do Galo, olhar temporariamente para o outro lado faz parte da volta solicitada.

Não confundir esta inspeção de nove movimentos com aprovação de todas as ações antigas do jogo. Não houve teste de combate nesta revisão de arte.

## Arquivos e reprodução

Fontes, prompts, backups, contatos numerados e GIFs: `output/coerencia-v6/`. Visualizador: `output/coerencia-v6/revisao.html`. Montagem: `python scripts/coerencia_v6.py`; aplicação após conferência visual: `python scripts/coerencia_v6.py --apply`. Recusa sobrescrever uma arte alterada desde o backup. Não executar o pipeline v5 para reaplicar fontes antigas sobre as correções.

As correções mantêm nomes, grade de cinco colunas de 256×256, contagens e FPS já configurados. O relatório exporta caixas visuais e hashes para Claude revisar eventual ajuste de caixas. Nenhum JSON de runtime ou código de combate é alterado pelo pipeline.

Arte redesenhada com a ferramenta integrada de imagens; scripts fazem extração, alinhamento, montagem e prévias. Conferir fonte e folha final: direção do alvo, mão que golpeia, apoio dos pés, escala anatômica, pegada dos acessórios e retorno à guarda. Um quadro incorreto deve ser redesenhado; duplicá-lo ou repetir outro quadro não corrige uma transição defeituosa. Sustentação intencional de contato é permitida quando não esconde uma falha.

Aplicado: três folhas, 38 quadros. No baixo, quadros 9–11 sustentam intencionalmente o contato; 7–8 estendem, 12 recolhe e 13 levanta antes de guardar. A fonte intermediária `cartola-low-source.png` foi rejeitada; a montagem usa `cartola-low-fix-source.png`. Relatório final com hashes e caixas: `output/coerencia-v6/report.json`.
