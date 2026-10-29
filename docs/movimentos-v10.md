# Movimentos individuais v10

Entrega de 29/10/2026 a partir de docs/pedidos-codex.md e docs/producao-personagens.md. Uma chamada da ferramenta integrada de imagens por personagem e por ação, sempre com a guarda da própria skin como referência. Nenhum atlas coletivo usado para gerar personagens.

Entregues: três folhas para cada um dos seis (Urubu, Almirante, Saci, Cartola, Bira, Galo), total de 18 folhas e 84 quadros finais.

| Arquivo / ação | Quadros | FPS propostos | Sequência |
|---|---:|---:|---|
| dash-forward.png / dash-forward | 5 | 18 | 0 guarda original; 1–3 arrancada baixa, passada e freada com mãos protegendo o rosto; 4 guarda original |
| dash-back.png / dash-back | 4 | 16 | 0 guarda original; 1–2 saltinho defensivo com guarda alta; 3 pousa na guarda original |
| jump-punch.png / jump-punch | 5 | 14 | 0 preparação aérea; 1–2 extensão/contato do punho; 3 recolhe; 4 recuperação ainda aérea |

Todas sem loop. Os dashes e a parábola do salto são movidos pelo motor: a arte não contém deslocamento acumulado. Saci adapta as passadas e poses à única perna. Pequena poeira extraída da fonte nos dashes frontais quando presente. Soco aéreo não é chute, bicada, patada ou especial.

Pastas em public/assets/lutadores/: urubu/frente, almirante/base, saci, cartola/urubu-v1, cachorro/urubu-v1 e galo/urubu-v1. Folhas RGBA 1280×256, cinco colunas de 256×256.

As três ações estão em public/ para os seis. Conferir applied=true e hashes no relatório antes da integração. Células finais excedentes do dash-back ficam vazias. O sexto desenho nas fontes de jump-punch é uma guarda em pé usada somente como régua de escala e não entra na animação final.

Fontes, prompts individuais, referências/hashes, quadros extraídos, contatos e GIFs em output/movimentos-v10/<personagem>/. Relatório agregado: output/movimentos-v10/report.json; revisão: output/movimentos-v10/revisao.html. Montagem: python scripts/movimentos_v10.py <personagem> <ação>; aplicação: adicionar --apply.

Os quadros de guarda pedidos no início/fim dos dashes usam os pixels do idle original de propósito. A escala das poses geradas é uniforme por ação, calculada pela guarda da fonte. O alinhamento usa uma estimativa do eixo do quadril por faixas opacas do corpo, evitando recentralizar pelo punho estendido. Um deslocamento comum da ação dentro da célula é permitido apenas para manter as poses inteiras; placements e targetHipAxis documentam os valores. Não há escala individual por quadro. Scripts extraem e montam, sem redesenhar nem recolorir. A fonte pode não respeitar perfeitamente a grade; extração por componentes evita cortar figuras nos limites de células estimados.

Na identificação usada na revisão, A é o membro próximo da câmera na guarda, B o distante. O soco aéreo usa B durante extensão e retorno; A recompõe a guarda. Os prompts brutos foram preservados, inclusive o primeiro do Urubu que solicitava A: a revisão identifica o braço efetivamente desenhado em vez de tratar o texto do prompt como prova de anatomia. A fonte mantém um único braço executando o golpe. Saci tem somente perna A; perna B não existe.

## Correção e revisão

A primeira fonte de dash-back do Saci sugeria uma segunda coxa no terceiro quadro. Foi rejeitada e redesenhada pela ferramenta de imagens antes de aplicar; a fonte rejeitada e o prompt de correção estão preservados na pasta dele. Não foi escondida copiando outra pose nem apagada por script.

Conferidas as fontes individuais e os contatos finais lado a lado com as guardas: figurino e materiais, direção, apoio, continuidade de membros e sequência de golpe/recolhimento. A revisão é do agente, não uma aprovação do usuário. O redesenho generativo não é reprodução pixel a pixel da base fora dos quadros de guarda preservados.

Mecânicas, registro, FPS finais e caixas de combate ficam com Claude. As caixas visuais exportadas não são hitboxes. Conferência na Academia e no combate ainda pendente; nenhuma alteração de TypeScript/JSON de runtime foi feita por esta produção.

Janela visual candidata do soco aéreo: quadros 1–2, na ponta do punho. Não criar caixa ofensiva no corpo inteiro nem nos dashes. O responsável pela lógica deve conferir colisão e durações em contexto, inclusive a transição do salto existente para jump-punch e a recuperação ainda aérea.

Verificação final: 18 PNGs RGBA de 1280×256, 84 quadros, margens e sobra vazia conferidos; hashes instalados e guardas ativas correspondem aos usados na produção. Guardas de início/fim dos dashes comparadas com os pixels originais. Os 46 testes existentes de registro de lutadores passaram; não validam a integração das novas ações. Resumo: output/movimentos-v10/validation.json.
