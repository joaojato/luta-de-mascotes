# Produção de personagens: identidade, cor e continuidade

Leitura obrigatória antes de gerar ou refazer sprites, animações ou retratos de mascotes. Consolidado em 29/10/2026 a partir das correções do João: personagens fugindo da base, cores e iluminação diferentes, atlas coletivo de stun, membros trocados, escala oscilando e poses contraditórias.

Este é o procedimento de produção e revisão. O [padrão artístico](mascotes/padrao-artistico.md) define a linguagem visual; [continuidade anatômica](continuidade-anatomica.md) detalha o acompanhamento dos membros. Incluir “pixel art” no prompt não basta.

## 1. Antes de gerar

1. Ler AGENTS.md, este guia e [pedidos-codex.md](pedidos-codex.md). Identificar personagem, skin, ação, prioridade, poses, quadros e destino pedidos.
2. Conferir o JSON atual em src/game/lutadores/ e os arquivos que ele efetivamente usa. Não reaplicar uma fonte antiga porque o nome parece correto.
3. Ler a revisão específica da ação. Instrução explícita mais recente do usuário prevalece sobre instrução anterior; relato histórico de uma entrega não é aprovação visual. O JSON descreve o runtime existente, mas não revoga uma correção nova pedida pelo usuário.
4. Abrir e inspecionar a guarda aprovada da skin correta, a identidade oficial quando necessária e o movimento de referência. Anexar as imagens à ferramenta: mencionar caminhos no texto não envia referências visuais.
5. Registrar uma ficha por personagem/ação: caminhos e hashes das referências, quadro de guarda usado, características que não podem mudar, membros A/B, sequência de poses, contagem, FPS existentes/propostos, eixo e chão. Guardar a ficha junto do prompt.

Se uma ação nova ainda não tem guia aprovado, definir sua sequência a partir do pedido e da guarda. Não inventar uma referência de aprovação.

## 2. Uma geração por personagem e por ação

- **Nunca gerar vários mascotes numa mesma chamada ou atlas de produção de sprites.** Um pedido para seis personagens vira seis produções individuais.
- Vários quadros da mesma ação e do mesmo personagem podem sair numa folha. Não juntar todas as ações numa imagem grande.
- Produzir, inspecionar a fonte e montar a ação individual antes de avançar para a próxima. Não multiplicar um defeito de coreografia para os outros mascotes.
- Contatos coletivos, comparações e prévias são permitidos depois da geração individual; não são fontes de identidade.
- Cartazes/cartões com vários personagens são composições específicas, não exceção para gerar atlas coletivos de animação. Anexar a base de cada participante.

O atlas coletivo v8 foi rejeitado por divergência das bases. Isso evidencia um processo que falhou, não prova que toda divergência tenha uma única causa. Também houve prompt pedindo penas azuladas e uso de movimento sem a guarda de acabamento.

## 3. Separar identidade, acabamento e movimento

| Referência | O que determina | O que não autoriza |
|---|---|---|
| Guarda aprovada/idle da própria skin | Cores, luz, sombras, contorno, densidade de pixels, proporções, escala e figurino efetivo | Redesenhar rosto, trocar uniforme ou mudar material durante uma ação |
| Modelo oficial aprovado do próprio mascote | Identidade, espécie, rosto, roupa e acessórios | Trocar o padrão artístico por outro estilo |
| Urubu oficial e movimento aprovado | Linguagem arcade do projeto; poses, ordem e ritmo, respeitando exceções pedidas | Copiar espécie, paleta ou uniforme do Urubu para outro mascote |
| Referência de acessório | Forma e pegada do objeto solicitado | Importar aparência ou estilo do personagem que aparece com o objeto |

Declarar os papéis por número de anexo no prompt. Ao corrigir poses, anexar também a guarda de acabamento. Evitar uma cadeia que usa somente a última geração como identidade e vai se afastando da base.

### Guardas atuais de trabalho

Caminhos relativos a public/assets/lutadores/. Confirmar a skin selecionável e o arquivo ativo antes de cada tarefa; a tabela não autoriza usar uma variante antiga se o projeto mudar.

| Personagem | Guarda |
|---|---|
| Urubu | urubu/frente/idle.png |
| Almirante | almirante/base/idle.png |
| Saci | saci/idle.png |
| Cartola | cartola/urubu-v1/idle.png |
| Bira (id interno cachorro) | cachorro/urubu-v1/idle.png |
| Galo | galo/urubu-v1/idle.png |

Extrair um quadro de guarda inteiro, sem deformá-lo nem cortar partes do corpo. Preservar a folha original como evidência. Para personagem novo, usar a identidade fornecida e o padrão do Urubu; não inventar uma guarda “aprovada”. Se o pedido é só a base, entregar só a base.

## 4. O que fica travado

- Mesmo rosto, tamanho relativo da cabeça, bico/focinho, cabelo, crista, orelhas e cauda. Preservar idade aparente e silhueta; não infantilizar nem engrossar/afinar arbitrariamente.
- Mesmas cores por material e mesmas relações de luz/sombra da guarda. Sem luz azul, clareamento geral, brilho ou nova luz de recorte para “melhorar a leitura”.
- Não corrigir contorno recolorindo penas, pele ou roupa. Urubu escuro não vira azul; Galo mantém penas brancas. A paleta de um mascote não contamina outro.
- Mesma direção e largura das listras, corte de roupa, calçados, chapéus e acessórios. Sem escudos, patrocinadores, letras ou ornamentos novos.
- Pixel art arcade: volumes em blocos, paleta enxuta, contornos escuros legíveis, proporções heroicas compactas. Sem renderização suave, gradientes novos, vetor, realismo ou halo preto grosso.
- Saci mantém uma única perna. A espécie e a anatomia de cada mascote continuam próprias; “skin do Urubu” não significa copiar sua anatomia literal.
- Efeitos só quando pedidos, sem esconder o corpo. Medir escala pelo corpo, sem usar estrelas de stun, poeira ou acessórios como altura anatômica.

Registrar amostras de cor por material da guarda e comparar regiões equivalentes, excluindo contorno, transparência e efeitos. Histograma global e limite RGB único não provam identidade: pose, áreas expostas e sombras mudam. O limite de seis unidades usado no reparo v7 do Urubu é específico daquele caso, não tolerância universal.

## 5. Coreografia, anatomia e eixo

- Identificar pernas e braços anatômicos A/B: qual sustenta, ataca, recolhe ou segura o acessório. A identidade não muda quando um membro passa para perto/longe da câmera.
- Seguir cada membro da origem ao extremo em todos os quadros. Verificar pelve, ombros, articulações, pés e mãos; cruzamento ambíguo exige guia técnico ou redesenho.
- Manter direção ofensiva e pegada dos acessórios. Não virar o personagem num simples balanço; giros pedidos mostram a transição contínua.
- Manter escala anatômica e eixo do idle. O motor desloca dash, caminhada e trajetória de salto; não desenhar outro deslocamento acumulado nas células. Pose baixa dobra membros, não encolhe o personagem.
- Ações plantadas mantêm apoio; passos, saltos e giros articulam os pés conforme a coreografia. Pé nunca afunda abaixo do chão.
- Quando o contrato pede guarda no quadro 0, usar a guarda aprovada efetivamente, sem reinterpretar cabeça ou tamanho. Respeitar exceções: stun começa tonto; voadora começa aérea; bloqueio e agachamento sustentam o estado final pedido.
- Não impor retorno à guarda a toda ação. Conferir a transição real do último quadro para a próxima ação ou para o início do loop.

Consultar conforme a ação: [poses](revisao-poses.md), [golpes próprios](golpes-personalizados-v3.md), [braços alternados](socos-alternados-v4.md), [legibilidade](animacoes-legiveis-v5.md), [coerência](coerencia-animacoes-v6.md), [voadoras e luz](voadoras-e-iluminacao-v7.md) e [stun individual](estunados-v9.md). Ler também atualizações do pedido. A passagem v5 que clareava/azulava o Urubu foi corrigida pela v7: não reutilizar essa instrução.

## 6. Revisar fonte e montagem antes de aplicar

1. **Fonte inteira:** conferir cada quadro e suas bordas, mãos, pés, chapéus, caudas e acessórios. Parte já cortada exige redesenho; margem adicionada depois não recupera desenho ausente.
2. **Identidade:** comparar guarda e cada pose no tamanho efetivo do jogo, sem redimensionar cada imagem para “caber” na comparação. Conferir rosto, corpo, figurino, cores, luz e pixels sobre fundos claro e escuro.
3. **Continuidade:** acompanhar A/B, apoio, preparação, impacto e recolhimento; revisar último→primeiro nos loops. Reproduzir devagar e no FPS previsto.
4. **Escala:** sobrepor referências quando útil. Usar escala uniforme de montagem por ação; não escalar cabeça, tronco ou quadros separadamente para esconder oscilação. Corrigir na geração quando a anatomia muda.
5. **Arquivo final:** RGBA com transparência real, células 256×256 e cinco colunas quando esse é o contrato; contagem correta, sobra vazia, sem fragmentos de células vizinhas. Grade técnica não valida arte.
6. **Resultado:** registrar o que foi conferido e o que está pendente. Não chamar de “aprovado pelo usuário” sem aprovação dele. Não declarar teste no jogo se houve somente inspeção de PNG/GIF ou testes de dados.

Quadro contraditório é redesenhado. Não esconder erro duplicando outro quadro ou espelhando uma pose isolada. Sustentação de contato só vale quando intencional na coreografia, sem disfarçar falhas.

## 7. Aplicação e entrega

- Gerar/redesenhar com a ferramenta de imagens. Scripts organizam, extraem, alinham, montam e verificam; não substituem redesenho por deformação ou recoloração para mascarar defeitos.
- Guardar fonte, prompt completo, referências/hashes, ficha, contatos e prévia animada em output/. Identificar tentativas rejeitadas para que não virem referências futuras.
- Preservar backup e hash do destino. Se outro agente alterou o arquivo, inspecionar antes de substituir. Não reaplicar pipelines antigos sobre correções novas.
- Entregar PNGs finais em public/ e guia em docs/, com caminhos, grade, quadros, FPS existentes/propostos, caixas visuais e hashes em relatório. Só em output/ significa preparação, não entrega integrada.
- Mecânicas, hitboxes, duração de stun, registro e JSONs de runtime ficam com o responsável pela lógica, salvo pedido explícito. Medidas visuais não são hitboxes automáticas.
- Conferência na Academia e no combate pertence à integração; indicar quando ainda falta. Testes automáticos não aprovam estilo, cor ou anatomia.

## 8. Molde de prompt por ação

Preencher com o personagem real e conferir a ordem dos anexos; não reutilizar o figurino de outro mascote.

> Produzir somente [PERSONAGEM / SKIN], ação [AÇÃO], [N] quadros.
> Anexo 1: guarda aprovada desta skin; trava identidade, cores, luz, proporções, contornos, densidade de pixels e figurino.
> Anexo 2: guia de movimento; define somente poses e ordem.
> [Anexo adicional: identidade oficial ou acessório, com função explícita.]
> Preservar [rosto, espécie, roupa, materiais, cores e detalhes observados].
> Modificar somente a pose das partes necessárias à ação.
> Sequência: [quadro a quadro, incluindo início e estado final].
> Membros: [A/B, apoio, ataque, recolhimento e pegada].
> Eixo e chão: [referência do idle; movimento que pertence ao motor].
> Mesmo tamanho anatômico em todos os quadros; não ampliar cabeça ou corpo.
> Sem nova iluminação, clareamento, azulamento, brilho ou mudança de estilo.
> Fundo realmente transparente, corpos inteiros e margens sem cortes.
> Sem outros personagens, ações extras, texto, sombra de chão ou efeitos não solicitados.
> [Grade e orientação conforme o contrato desta ação.]

Retirar o anexo 2 quando não existe guia e descrever a sequência solicitada sem inventar aprovação. Não pedir “todas as ações de todos os mascotes” numa chamada.
