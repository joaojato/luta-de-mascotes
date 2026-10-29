# Movimentos individuais v10

Produção em andamento a partir de docs/pedidos-codex.md e docs/producao-personagens.md. Uma chamada da ferramenta integrada de imagens por personagem e por ação, sempre com a guarda da própria skin como referência. Nenhum atlas coletivo usado para gerar personagens.

Entregues até esta etapa: dash-forward.png dos seis (Urubu, Almirante, Saci, Cartola, Bira, Galo). Cinco quadros, 18 FPS propostos, sem loop. Guarda original nos quadros 0 e 4; poses de arrancada, extensão e freada nos quadros 1 a 3. Saci adapta a passada à única perna. Pequena poeira extraída da fonte quando presente.

Pastas em public/assets/lutadores/: urubu/frente, almirante/base, saci, cartola/urubu-v1, cachorro/urubu-v1 e galo/urubu-v1. Folhas RGBA 1280×256, cinco colunas de 256×256.

Dash-back e jump-punch ainda em produção. Não registrar arquivos que ainda não foram entregues; consultar o relatório para applied=true e conferir os arquivos em public/.

Fontes, prompts individuais, referências/hashes, quadros extraídos, contatos e GIFs em output/movimentos-v10/<personagem>/. Relatório agregado: output/movimentos-v10/report.json; revisão: output/movimentos-v10/revisao.html. Montagem: python scripts/movimentos_v10.py <personagem> <ação>; aplicação: adicionar --apply.

Os quadros de guarda pedidos no início/fim dos dashes usam os pixels do idle original de propósito. A escala das poses geradas é uniforme por ação, calculada pela guarda da fonte. Scripts extraem e montam, sem redesenhar nem recolorir. A fonte pode não respeitar perfeitamente a grade; extração por componentes evita cortar figuras nos limites de células estimados.

Mecânicas, registro, FPS finais e caixas de combate ficam com Claude. As caixas visuais exportadas não são hitboxes. Conferência na Academia e no combate ainda pendente; nenhuma alteração de TypeScript/JSON de runtime foi feita por esta produção.
