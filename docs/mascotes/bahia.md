# Bahia — super-herói no padrão Urubu

Atualização posterior: o usuário autorizou colocar o Bahia no jogo e solicitou
refazer/completar todas as animações. Essa autorização substitui o adiamento e
as restrições históricas de cadastro abaixo. Produção individual em andamento:
[conjunto completo v12](../bahia-animacoes-v12.md). Preservar os golpes escolhidos,
a flutuação e a primeira base; não reutilizar a guarda parada para ações faltantes.

## Projeto de golpes — decisões de 29/10/2026

Produção das artes autorizada pelo usuário em 29/10/2026, depois da definição dos golpes. Entrega de artes e guia: [golpes e expressões v11](../bahia-golpes-v11.md). Não registrar um lutador incompleto nem alterar a lógica de combate nesta etapa.

- **Forte confirmado pelo usuário:** golpe descendente com a mão aberta/estendida, dedos juntos, como uma lâmina. Preparação acima do ombro, corte diagonal de cima para baixo e recolhimento do mesmo braço. Referência verbal: gesto viltrumita. Não é cruzado nem soco de punho fechado; preservar o padrão artístico e a identidade aprovados.
- **Comando de chute principal confirmado pelo usuário:** laser disparado pelos olhos, cumprindo papel de projétil como o tiro do Almirante. O corpo paira, olhos miram e emitem; manter preparação, emissão e recuperação legíveis. Cor, velocidade, alcance e duração ainda abertos. Isso substitui somente o chute principal; chute baixo e voadora continuam a definir e devem fornecer golpes reais com as pernas.
- **Especial confirmado pelo usuário: Bora Bahêa.** O personagem grita e a expressão visível “Bora Bahêa” sai em direção ao adversário como um projétil de letras, com linguagem de onomatopeia de quadrinhos. O texto nasce pequeno e cresce com a distância percorrida desde a emissão. Quanto maior a distância percorrida e o tamanho correspondente no momento do acerto, maiores o dano e o tempo de atordoamento. Acerto causa stun; a forma de esquiva definida é pular. A investida voadora simples e o esquadrão de silhuetas não são o especial escolhido.

### Especial Bora Bahêa — contrato e pontos abertos

- Crescimento depende do percurso do projétil desde a boca, não da distância inicial entre lutadores nem de um redimensionamento arbitrário no contato. Dano e duração do stun devem usar a mesma progressão que determina o tamanho visível.
- Preservar a grafia legível “Bora Bahêa”, inclusive o circunflexo. O pedido autoriza texto neste efeito; não autoriza texto/escudo novo no traje ou na base do mascote.
- Personagem e projétil de texto são artes separadas. Preparação: enche o peito; emissão: abre a boca e grita; recuperação: recompõe a guarda flutuante. Não desenhar o projétil atravessando várias posições na folha do corpo.
- A arte do efeito segue pixel art de quadrinhos e a direção simples/de rua do jogo. As letras precisam continuar legíveis pequenas e grandes; sem acabamento metálico.
- Ainda abertos: dano e stun mínimos/máximos, distância e curva de crescimento, velocidade, alcance, tamanho máximo, quantidade de acertos e possibilidade de bloquear. O usuário definiu pulo como esquiva, mas não declarou que o golpe seja imbloqueável.
- Recomendação de balanceamento ainda não aprovada: limitar crescimento, dano e stun; manter o projétil na faixa baixa/média para continuar sendo possível saltar por cima mesmo no tamanho máximo. Tamanho visual não deve criar uma parede inevitável.
- Implementação e colisões ficam com Claude; a ficha registra o projeto, não altera mecânica nem runtime.

Uso real da expressão conferido em fontes do clube: [Bora Bahêa!](https://www.esporteclubebahia.com.br/bora-bahea/), [App do Bahia](https://esporteclubebahia.com.br/app-do-bahia/) e [Embaixadas da Associação](https://ecbahiaassociacao.com.br/embaixadas/), que lista grupos de torcedores com a expressão no nome.

As demais sugestões de golpes feitas na conversa não equivalem a decisões do usuário. Base visual, flutuação e mudança de expressão abaixo permanecem válidas.

Sprite-base escolhido pelo usuário: `referencia/bahia/referencia-estilo-urubu-v1.png` (primeira versão). O usuário decidiu deixar as animações do Bahia para depois. A variante com pés juntos fica preservada em `referencia/bahia/referencia-estilo-urubu-v2.png`, sem ser a referência atual. Edição feita com a ferramenta integrada de imagens; prompt da variante em `referencia/bahia/prompt-estilo-urubu-v2.txt`.

Identidade baseada na referência enviada pelo usuário: humano de pele clara, cabelo preto com topete, traje azul, capa/luvas/botas vermelhas, cinto branco e faixas brancas nas botas. Sem escudo ou texto. Pixel art arcade no padrão do Urubu, contorno escuro, sombras em blocos e anatomia heroica compacta; corpo inteiro e guarda voltada para a esquerda.

Exceções visuais solicitadas explicitamente: permanece pairando, sem apoiar os pés, com joelhos relaxados, botas pendentes e capa suspensa. Na guarda tem expressão simpática de bobão. Ao atacar deve mudar para expressão brava/má, com sobrancelhas fechadas, olhar agressivo e boca firme; depois retorna ao sorriso. Preservar a identidade do rosto ao mudar a expressão.

**Intensidade reforçada pelo usuário:** MUITA cara de bravo durante ataques, laser e grito: sobrancelhas fortemente inclinadas para dentro, olhos estreitos e olhar duro; boca sem sorriso, cerrada de raiva no golpe e aberta no grito. Guarda, postura padrão, deslocamentos e dashes conservam a carinha fofa/simpática original. A mudança é de expressão, sem trocar o formato do rosto, tamanho da cabeça, cabelo, cor de pele ou estilo. Quadros de guarda no início/fim de ataques retornam à expressão fofa.

A etapa original entregou somente a base visual. O usuário retomou a produção e autorizou os golpes descritos na v11; os demais movimentos e o registro de um lutador completo continuam pendentes. Mecânica de voo, colisões e combate fica com Claude conforme a divisão vigente. Pairar visualmente não deve ser interpretado automaticamente como invulnerabilidade a ataques baixos.

Gerado com a ferramenta integrada de imagens (built-in). Referências: ilustração anexada pelo usuário para identidade e `referencia/urubu/modelo-oficial.png` para estilo. Prompt final: `referencia/bahia/prompt-estilo-urubu-v1-final.txt`. O prompt inicial está preservado em `prompt-estilo-urubu-v1.txt`; não gerou a imagem entregue.
