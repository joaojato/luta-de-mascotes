# Bahia: conjunto completo de animações, revisão v12

Pedido do usuário: refazer as animações e completar todas, individualmente,
mantendo o personagem pairando e sem deformações ou membros que crescem.
Este pedido substitui o adiamento histórico das animações. A integração já
autorizada permanece válida; preservar os golpes e as mecânicas escolhidos.

## Referências e invariantes

- Identidade e acabamento: `referencia/bahia/referencia-estilo-urubu-v1.png`.
- Régua em jogo: `public/assets/lutadores/bahia/base/guard-reference.png`.
- Movimento: arquivos efetivos de `src/game/lutadores/urubu.json`, com as
  adaptações de flutuação e os golpes próprios solicitados para o Bahia.
- Braço A: próximo da câmera, ombro à direita da imagem. Braço B: distante,
  punho à esquerda na guarda. Perna A: bota mais baixa à direita da imagem;
  B: joelho dobrado à esquerda. Acompanhar articulações e não trocar membros.
- Topete preto, rosto e pele originais, traje azul, capa/luvas/botas vermelhas,
  cinto branco e faixas brancas nas botas. Sem escudo, texto ou luz nova.
- Guarda, deslocamentos e dashes fofos; golpes muito bravos. Reação, stun e
  queda têm expressões adequadas de dor/tontura, sem transformar o rosto.
- Pairar sem passos ou apoio: botas pendentes. A queda termina no chão.
  Esquiva baixa dobra as articulações e termina baixa, sem reduzir o corpo.
- Montagem: deslocamento visual comum de 8 px para cima deixa espaço visível
  entre botas e chão/sombra. Na queda, o deslocamento diminui progressivamente
  até zero. Nenhum membro é redimensionado; a caixa corporal lógica original
  continua igual, para a flutuação visual não conceder imunidade a golpes baixos.

## Sequência de produção

Uma chamada de imagem por ação. Inspecionar a fonte, montar, conferir os
quadros e o loop antes de gerar a próxima. Não usar uma folha inteira com
todas as ações. Não usar transformações locais para disfarçar anatomia errada.

| Ação | Quadros | FPS | Direção da animação |
|---|---:|---:|---|
| idle | 4 | 8 | Respiração, pequeno balanço no ar e capa ondulando |
| walk-forward | 8 | 8 | Flutuação frontal com leve inclinação, sem andar |
| walk-backward | 8 | 8 | Recuo flutuante, olhando o adversário, sem andar |
| hit-high | 6 | 12 | Impacto, tronco recua, recuperação no ar |
| knockdown | 10 | 10 | Perde sustentação, cai, termina deitado |
| light-punch | 6 | 14 | Dois socos alternados, giro dos ombros |
| block-high | 4 | 10 | Antebraços protegem rosto, sustenta no fim |
| block-low | 4 | 10 | Corpo recolhido baixo, proteção frontal sustentada |
| crouch | 5 | 20 | Esquiva profunda flutuante, mantém pose baixa |
| jump | 8 | 10 | Impulso de voo, poses aéreas sem parábola na folha |
| stunned | 4 | 6 | Tonto, perde estabilidade mas permanece suspenso |
| dash-forward | 5 | 18 | Arrancada de voo, carinha fofa, sem passos |
| dash-back | 4 | 18 | Arrancada de recuo, carinha fofa, sem passos |
| low-kick | 8 | 12 | Chute baixo real com A, recolhe o mesmo membro |
| jump-punch | 5 | 14 | Soco aéreo com B, frente e ligeiramente para baixo; A protege |
| jump-kick | 6 | 14 | Voadora descendente com A, B dobrada, recolhe A |
| heavy-punch | 6 | 14 | Mão A aberta em corte descendente |
| eye-laser | 6 | 14 | Mira e emissão pelos olhos, sem raio colado no corpo |
| special-charge | 4 | 12 | Enche o peito, muito bravo, sustenta preparo |
| special | 5 | 12 | Grita e recupera guarda; texto é efeito separado |

Retrato: busto próprio, preservando a mesma identidade. Fontes, prompts,
referências de movimento, hashes, contatos e GIFs ficam em `output/bahia-v12/`.
As verificações automáticas não substituem a inspeção visual dos membros.

Estado em 29/10/2026: 19 ações refeitas e integradas, com 110 quadros de corpo.
O soco descendente (`heavy-punch`) ainda usa a folha anterior: oito tentativas
de geração/correção foram recusadas pela ferramenta de imagens. Não contar
essa folha como refeita ou aprovada nesta revisão. O retrato anterior permanece.
A prévia individual está em `output/bahia-v12/revisao.html`; o relatório
`validation.json` distingue as ações entregues da pendência. Foram conferidos
fontes e quadros montados; não foi realizado teste visual de combate nesta etapa.

Cuidados de montagem: joelhos recolhidos não servem como régua de altura total.
Usar cabeça, tronco e segmentos dos membros para definir uma escala comum à
ação inteira. Nunca aumentar cada pose separadamente para preencher a célula.
Ao alinhar pela face, excluir pixels alaranjados da capa e das botas: a maior
região conectada de pele é a referência, seguida de inspeção visual.
