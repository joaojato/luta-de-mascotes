# Raposa: movimentos solicitados em 06/11/2026

Atualização posterior: a imagem com soco-inglês corrigido foi escolhida pelo
usuário como referência dos movimentos. Produção v2 e entrega em
`raposa-animacoes-v2.md`; essa atualização substitui as pendências históricas
de encaixe e de figurino descritas abaixo. Não reaplicar v18/roupa branca.

## Identidade

Correção posterior: usuário rejeitou a posição anatômica da mão na aplicação v18. Não usar `base-boxe-azul-v18.png` como guarda aprovada. Estudo novo isolado `referencia/raposa/mao-guarda-soco-ingles-v2.png` mostra mão/antebraço contínuos e metal orientado com o punho, ainda sujeito à revisão do usuário. A aprovação do estudo frontal v1 não significa aprovação automática de sua aplicação a outro ângulo.

Atualização do estudo: usuário aprovou explicitamente `referencia/raposa/mao-soco-ingles-estudo-v1.png`. O metal é uma crista contínua sobre os nós dos quatro dedos; segmentos dos dedos ficam abaixo, polegar fora. Aplicação proposta à guarda azul: `referencia/raposa/base-boxe-azul-v18.png`, ainda aguardando revisão do usuário. Preserva a versão branca e as bases anteriores. Usar estudo aprovado como guia de perspectiva, não retornar à faixa lateral antiga.

### Correção posterior: retorno à camisa azul

Usuário pediu voltar ao modelo de regata AZUL com cinco estrelas BRANCAS e calça BRANCA com faixas AZUIS, preservando a versão de roupa invertida. Referência de cores/identidade: `referencia/raposa/base-estilo-urubu-v15.png`. Isso muda o figurino, não revoga a guarda normal de boxe com taco nas costas, a intro ou a forma com taco. Ainda falta gerar a guarda de boxe nesse figurino e usá-la como referência das próximas ações. As imagens v16/v17 e as quatro ações de roupa branca ficam preservadas como variante/estudo; não recolorir silenciosamente ou tratá-las como a skin principal atual.

Perspectiva do soco-inglês pendente de guia do usuário: `referencia/raposa/guia-maos-perspectiva-v1.png` contém quatro punhos SEM acessório, em vistas frontal, três quartos, perfil e superior oblíqua, para desenho por cima. É estudo de perspectiva, não fonte de identidade/acabamento final. Aguardar esse guia antes de multiplicar o acessório em novas ações.

Base normal: `referencia/raposa/base-boxe-taco-costas-v16.png`. Forma com taco: `referencia/raposa/base-branca-taco-mao-v17.png`. Regata branca com cinco estrelas azuis, calça azul com faixas brancas. Preservar aliança, soco-inglês, argola original na orelha mordida de ponta intacta, dente de ouro, charuto, cauda e taco lascado. A ficha `raposa-continuidade-aprovada.md` continua válida para detalhes, com as cores e posição do taco atualizadas por este pedido.

## Coreografias e comandos

- Intro obrigatória: chega calma arrastando o taco no chão, charuto apagado; pega isqueiro metálico quadrado de tampa articulada, abre, acende o charuto, fecha e guarda isqueiro; guarda taco no suporte nas costas e termina em guarda de boxe. Brasa só aparece após acender.
- Rápido (`light-punch`): dois socos alternados reais, um por braço, giro de ombros visível. Taco nas costas.
- Rápido pesado (`heavy-punch`): da posição abaixada, gancho ascendente com extensão de pernas/quadril e breve saída dos pés do chão; pousa e recupera guarda.
- Bruto (`heavy-kick`/botão Chute): pega garrafa de cerveja, quebra no chão e deixa cacos como mina que causa dano ao oponente que pisar. Cacos são efeito/ator separado, não cenário pintado na folha do lutador. Uma mina isolada dura 5 segundos e causa menos dano. Ao quebrar outra garrafa sobre uma mina existente, os cacos acumulam, o dano aumenta e o contador é reiniciado para 7 segundos a partir do novo depósito. Não criar duas minas independentes na mesma posição nem apenas renovar a mina sem aumentar o dano. Valores de dano, fórmula/limite de acúmulo, quantidade de minas em posições diferentes e consumo ao acertar ainda não foram definidos. A proposta anterior de uma mina por Raposa e desaparecimento no primeiro acerto NÃO foi aceita pelo usuário.
- Bruto rasteiro (`low-kick`): parte abaixado, chute transversal baixo com avanço. Avanço pertence ao motor, não deslocamento acumulado na folha.
- Especial Pulo de Raposa: salto alto de raposa, inteiramente visível na tela, aterrissa sobre adversário. Não copiar saída de tela do meteoro do Urubu. Só um acerto real aplica stun de 1,5 s e libera forma temporária com taco por 8 s. Erro ou bloqueio não autorizam transformação. Escape definido pelo usuário: avançar para a frente, passando por baixo da Raposa, parecido com o especial do Dragão. Trajetória e alcance devem deixar livre essa passagem; não perseguir o adversário durante a descida anulando o escape. Bloqueabilidade ainda não definida explicitamente.
- Transição após acerto: saca o taco do suporte; mantém mesmo corpo e roupa, muda equipamento/postura. Cronômetro e contagem de quadros de transição precisam ser integrados pela lógica.
- Forma com taco: mesmos comandos e conjunto de movimentos, ataques adaptados ao taco. Bruto passa a tacada ascendente, bruto rasteiro a varredura baixa com taco, substituindo a garrafa e o chute conforme resposta explícita do usuário. Demais coreografias com taco ainda precisam ser especificadas visualmente antes de produzir.
- Retorno após 8 s: guarda o taco nas costas e volta à guarda normal. Não duplicar taco.

## Conjunto comum obrigatório nas duas formas

Intro; guarda; andar à frente/atrás; dash à frente/atrás; agachar; saltar; bloqueio alto/baixo; reação; atordoamento; queda; rápido; rápido pesado; bruto; bruto rasteiro; soco aéreo; voadora; preparação/especial/retorno conforme a ação exigir. A intro não é opcional para esta produção. Ataques aéreos normais seguem padrão até pedido diferente; forma com taco exige adaptação coerente. Não registrar personagem incompleto.

## Estado de produção

### Decisões adotadas ao receber "ent faz"

Para fechar o restante sem nova rodada de perguntas: cacos são consumidos no primeiro acerto; acúmulo limitado a duas garrafas por área, terceira e seguintes mantêm 18 de dano e reiniciam 7 segundos. Especial imbloqueável, escapa avançando por baixo. Forma com taco: rápido são duas tacadas curtas de lados alternados; pesado é tacada ascendente partindo de baixo; soco aéreo é tacada descendente; voadora usa golpe diagonal descendente com taco, inteiramente aéreo. São escolhas de produção do assistente após delegação do usuário, não citações de aprovação visual.

### Produção iniciada

Arte montada em `public/assets/lutadores/raposa/normal-v1/`: `idle.png` (4 quadros, 8 FPS), `light-punch.png` (6, 18 FPS), `heavy-punch.png` (6, 14 FPS; quadro 3 aéreo) e `crouch.png` (4, 16 FPS). Células 256×256, cinco colunas; dados e fontes por ação em `output/raposa-animacoes-v1/`. Gancho usa braço A da aliança continuamente; braço B do soco-inglês permanece em guarda. O gancho anterior com troca de braços foi rejeitado. FPS propostos, não aplicados à lógica. Revisão no jogo e aprovação do usuário pendentes. Fonte da garrafa ainda em revisão por inconsistência na estampa no impacto.

### Dano dos cacos definido após autorização do usuário

Referência atual: Biriba usa `kickDamage` padrão 18 (`src/game/fighterConfig.ts`) e sua mina no chão aplica `damageFactor: 0.5` (`src/game/lutadores/cachorro.json`), resultando em 9 de dano ao pisar, sem considerar modificadores temporários.

- Mina simples da Raposa: **12 de dano**, duração de **5 segundos**. Fica um pouco acima da mina do Biriba.
- Mina dupla: **18 de dano**, exatamente **50% acima de 12**, duração reiniciada para **7 segundos** ao receber a segunda garrafa sobre a mesma área.
- Valores registrados como especificação para integração; ainda não implementados no motor ou em JSON da Raposa. Não assumir dano contínuo a cada quadro. Consumo após contato, limite de acúmulo além de duas garrafas e quantidade em áreas distintas continuam abertos.

Pedido e respostas registrados. Nenhuma folha desta produção foi integrada ou aprovada. Produzir uma ação por chamada; anexar base correspondente, revisar fonte e cada quadro montado, guardar ficha com hashes, contagem e FPS. Lógica atual de forma e mina existe no motor, mas salto que transforma somente no acerto e garrafa quebrada diretamente no chão exigem conferência/adaptação pela integração. Não declarar funcionamento em jogo com base apenas na arte.

Intro: três fontes geradas e rejeitadas na revisão, preservadas com prompts e motivos em `output/raposa-animacoes-v1/entrance/`. Primeiras duas trocaram a mão do taco; terceira corrigiu lado mas perdeu aliança/bandoleira e não manteve charuto apagado. Nenhuma deve servir como base futura nem ser integrada. As demais ações ainda não foram produzidas.

Referências SHA256: guarda normal `4DFB387B1DE4F3FE00BEC9FB0E0399D1423D85CD88D8D7D028D3239112546AC6`; guarda com taco `DA1ED9AEA09091EEBBA2D8F9D1709A6EF226EAE31F80F738028D2AC373130697`.
