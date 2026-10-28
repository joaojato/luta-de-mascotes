# Voadoras e consistência de iluminação

Revisão anatômica obrigatória: [continuidade-anatomica.md](continuidade-anatomica.md). A perna estendida nos quadros 0–3 é a mesma que recolhe em 4–5; o membro oposto não assume seu lugar durante um cruzamento. Conferir conexão com a pelve e sobreposição, além da silhueta.

## Diagnóstico do leve do Urubu

A correção v5 para o contorno usou outra folha de soco como referência, sem incluir a guarda aprovada. Seu prompt solicitava explicitamente penas com tons azul-acinzentados mais claros. Isso permitiu mudar o acabamento do personagem inteiro junto com o contorno: penas mais azuladas, contraste diferente e alterações de volume. A análise da fonte e do prompt sustenta essa explicação; não há evidência de uma luz adicional aplicada pelo motor só nesse golpe.

Na amostra de penas do quadro de guarda, a mediana RGB do idle é `(39,40,51)` e a do leve v5 é `(38,39,60)`. A amostra filtra pixels opacos azulados escuros; é uma medida de diagnóstico, não uma prova isolada de identidade artística. O novo leve usa o idle diretamente como referência de acabamento; preserva dois socos com braços diferentes e seis quadros. Comparação visual, amostras e prompts em `output/voadoras-v7/`.

## Regra de produção

- Usar a guarda aprovada para identidade, paleta, proporções, densidade de pixels e iluminação em toda geração. Uma folha de movimento define somente poses e ordem.
- Nunca corrigir um contorno clareando o corpo inteiro ou adicionando azul, brilho, luz de recorte ou outro material.
- Comparar o primeiro e último quadro com a guarda, lado a lado em escala real; revisar todos os impactos e transições. Validar também contorno e luz sobre fundo claro e escuro.
- Conferir a fonte antes da montagem: um personagem cortado na borda continua incompleto mesmo quando o recorte é centralizado numa célula maior. O pipeline rejeita fontes com desenho opaco nas bordas externas.
- O pipeline mede a mediana da amostra de penas dos quadros de guarda do novo leve e recusa desvios superiores a seis unidades por canal frente ao idle. Esse limite é específico deste reparo; a revisão visual continua obrigatória e inclui formato e sombreado.

## Voadora comum

Arte para os seis lutadores atuais: Urubu, Almirante, Saci, Cartola, Bira e Galo. Bahia recebe uma folha preparada à parte com a primeira base aprovada; não registrar um lutador incompleto. A voadora do Urubu é o guia de poses das demais.

Destino dos seis: `jump-kick.png` nas pastas de seleção descritas em `docs/pedidos-codex.md`. O destino reservado do Bahia seria `output/voadoras-v7/bahia/jump-kick.png`, mas esse arquivo não foi entregue.

Todas as folhas: RGBA transparente, cinco colunas, células 256×256, seis quadros em ordem por linhas, sem loop. Sugestão de 14 FPS (0,43 s), a confirmar pelo Claude. Não alterar contagens/configurações do jogo nesta entrega de artes.

| Quadro | Pose |
| --- | --- |
| 0 | Já no ar, perna de ataque quase estendida para a frente e para baixo. |
| 1 | Extensão completa, pé abaixo do quadril e à frente, cerca de 40°. |
| 2 | Contato/impulso na mesma diagonal descendente. |
| 3 | Seguimento curto na mesma direção. |
| 4 | Recolhe a mesma perna em direção ao peito. |
| 5 | Recuperação compacta ainda no ar. |

O corpo inclina para trás, mãos guardam o tronco/rosto e a perna oposta fica dobrada. Saci usa somente sua única perna, tanto para golpear quanto para recolher. Galo mantém pés de ave; nenhum acessório vira ataque aqui. Não desenhar decolagem, aterrissagem nem uma trajetória vertical dentro da folha. A altura da cabeça permanece estável; a física do motor move o lutador.

## Entrega ao Claude

Registrar a ação `jump-kick` de cada lutador com seis quadros e o arquivo próprio, substituindo o fallback de chute terrestre. Janela visual candidata 0–3, no pé de ataque; 4–5 são recuperação sem acerto. O motor já procura o primeiro quadro com caixa ofensiva ao iniciar a voadora. Preservar as regras de deslocamento/defesa do catálogo; não criar dano extra com o tamanho total da silhueta. Caixas visuais medidas e hashes serão exportados em `output/voadoras-v7/report.json` para integração.

Montagem e verificação: `python scripts/voadoras_v7.py`; aplicar após conferência: `python scripts/voadoras_v7.py --apply`. Fontes e prompts gerados com a ferramenta integrada de imagens. Scripts apenas extraem/alinham/montam as folhas e prévias; não redesenham ou recolorem a arte. Prévias em `output/voadoras-v7/revisao.html`. Combate depende da integração pelo responsável pela mecânica.

## Validação final

Aplicadas sete folhas: leve do Urubu e seis voadoras, total de 42 quadros. Verificados formato, transparência, margens, células vazias e hashes instalados; os 43 testes existentes de registro de lutadores passaram. As seis voadoras ainda dependem do registro pelo Claude antes de aparecerem no combate. O leve já usa o caminho ativo existente. O pipeline v5 recusa execução quando encontra a entrega v7 aplicada, prevenindo reaplicar a fonte antiga.
