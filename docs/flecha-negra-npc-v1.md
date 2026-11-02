# Flecha Negra — NPC de guarda do Gremista

Pedido de 02/11/2026: acompanhante de fundo com guarda frontal, como o
Guerreiro do Fluminense. Ao ser chamado pelo especial, sai pelo fundo,
entra correndo na arena, para e executa **um** de três disparos escolhidos
aleatoriamente: reto em pé, rasteiro agachado ou aéreo após salto.
Depois sai, retorna pelo fundo correndo e freia na guarda frontal.

Identidade da imagem enviada: homem negro adulto, cabelo curto crespo,
rosto sério sem barba, camisa preta com azul e branco, calça escura,
aljava azul com faixa diagonal e arco recurvo azul. Sem escudo ou texto.
Acabamento arcade do Urubu; apresentação frontal do Guerreiro.
Base de trabalho: `referencia/gremio/flecha-negra/base-v1.png`.
Esta base foi produzida nesta etapa, ainda sem aprovação expressa do usuário.

Continuidade: braço A direito retira, encaixa e puxa a flecha/corda;
braço B esquerdo segura o arco em todas as ações. Pernas A direita e
B esquerda preservam a ligação aos quadris nas passadas e viradas.
Arco único e aljava única, sem trocar de mão ou entortar o corpo do arco.
Somente a corda flexiona durante a puxada; uma flecha por invocação.

Produção proposta: idle 4 quadros; corrida 6; virada/saída 8;
corrida/parada 8; disparos em pé, baixo e aéreo 8 cada.
Uma geração por ação, fonte e montagem revisadas individualmente.
As corridas são ciclos locais: deslocamento de arena pertence ao motor.
No ataque aéreo a trajetória vertical também pertence ao motor.
Não definir dano, hitboxes ou balanceamento nesta entrega de arte.

## Entrega de arte

54 quadros em oito folhas RGBA, cinco colunas, células **512×320**,
origem `[256,296]`, chão y=296. Corpo em pé de aproximadamente 200 px.
Não interpretar as folhas como células 256×256. Escala uniforme por ação;
posturas baixas dobram os membros, preservando o tamanho da cabeça.

| Arquivo | Quadros | FPS proposto | Uso |
| --- | ---: | ---: | --- |
| `idle.png` | 4 | 6 | Guarda frontal, repetir |
| `war-run.png` | 6 | 14 | Aproximação e retorno para esquerda, repetir |
| `turn-exit.png` | 8 | 14 | Virada 0–3; repetir corrida direita 4–7 |
| `run-stop.png` | 8 | 12 | Já correndo, freia e vira de frente |
| `shoot-standing.png` | 8 | 12 | Uma flecha reta, depois recupera |
| `shoot-low.png` | 8 | 12 | Uma flecha baixa, permanece ajoelhado |
| `shoot-air.png` | 8 | 14 | Preparação, salto, flecha e pouso |
| `kneel-transition.png` | 4 | 12 | 0→3 ajoelha; 3→0 levanta |

`arrow.png`: projétil único para os três ataques, célula 96×24, ponta para
esquerda, comprimento desenhado 74 px. Arte gerada separadamente.

### Contrato de especial para a lógica

1. Guarda frontal no fundo, como o Guerreiro. Quando chamado, começar
   `turn-exit` no quadro 2 (frontal), virar e sair correndo pelo fundo.
2. Entrar na arena correndo, desacelerar e parar no ponto de disparo.
   Usar as fases 0–3 de `run-stop` para a frenagem sem virar de frente.
3. Sortear **uma** das três variantes **uma vez por invocação**. A arte
   permite probabilidades iguais; os pesos definitivos pertencem à lógica.
4. Em pé: `shoot-standing` 0–7. Baixo: `kneel-transition` 0→3,
   `shoot-low` 0–7, transição 3→0 para levantar antes da saída.
   Aéreo: `shoot-air` 0–1 prepara, 2–6 fica no ar, 7 pousa; completar
   a recuperação com `kneel-transition` 1→0.
5. Soltar **um único projétil no quadro 5** da variante escolhida,
   inclusive se o motor visitar esse quadro em múltiplas atualizações.
   `frameData[5].arrowOrigin` no manifesto indica a posição visual local,
   não uma hitbox. Direção base para esquerda; espelhar sequência inteira
   e coordenadas quando necessário. Rasteira horizontal, próxima do chão;
   aérea nasce na altura real do ator durante o salto.
6. O salto usa âncora local de quadril `[256,202]` nos quadros 2–6.
   O motor fornece a elevação e a parábola; não aplicar outra trajetória
   embutida na folha. O projétil não fica preso ao ator depois de lançado.
7. Após recuperação, `turn-exit` 0–3 gira e 4–7 corre até fora da arena.
   Retornar pelo fundo com `war-run` para esquerda; `run-stop` 0–7
   desacelera no posto e termina na guarda frontal; então `idle`.

Sem novo stun, dano, alcance ou hitbox definidos. Não copiar o gatilho
histórico de acerto do pó do Cartola: este NPC é chamado pelo especial
do Gremista. O pedido não define confirmação por acerto como condição.
Cancelar a participação ao encerrar o round ou perder o dono.

### Revisão e montagem

Fontes e cada quadro montado foram comparados com a base em escala de
jogo sobre fundo claro/escuro: cabeça, uniforme, cor da pele, mão do arco,
joelho apoiado, puxada/soltura, margens e transparência. As tentativas com
arcos duplicados e ponta cortada estão identificadas como rejeitadas.
A base continua sujeita à aprovação visual do usuário.

Manifesto com hashes, limites visuais, quadro de soltura e origem da
flecha: `public/assets/npcs/flecha-negra/base-v1/manifest-art.json`.
Verificação técnica: `output/flecha-negra-v1/validation.json`.
Prévia com seletor de ação, avanço quadro a quadro, velocidade e guarda
na mesma escala: `output/flecha-negra-v1/revisao.html`.
Inclui composições ilustrativas de aproximação, ataque e retorno.

Montador: `python scripts/flecha_negra_v1.py prepare`, depois
`mount <ação>` para cada fonte existente, `projectile`, `finalize`, `demos`.
Os scripts somente extraem, redimensionam uniformemente e alinham arte
gerada pela ferramenta integrada de imagens; prompts completos em output.
Verificados 54 quadros, oito folhas, transparência, margens, dimensões,
sobras vazias e hashes; JavaScript da prévia passou em `node --check`.
Nenhum arquivo de lógica ou registro de lutador foi alterado.
**Integração na Academia/combate e balanceamento continuam pendentes.**

Fontes, prompts, fichas, extrações e prévia: `output/flecha-negra-v1/`.
PNG finais: `public/assets/npcs/flecha-negra/base-v1/`.
