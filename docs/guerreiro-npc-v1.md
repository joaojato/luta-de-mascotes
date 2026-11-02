# Guerreiro — NPC do Fluminense

Pedido de 01/11/2026: acompanhante na mesma proposta do Gavião maior do
Mosqueteiro. Primeira etapa: base visual frontal de prontidão, com lança
e escudo da referência enviada, sem o símbolo do Fluminense.

Identidade: guerreiro humano de pele escura, barba preta, elmo e braçadeiras
de bronze, capa vinho, camisa listrada verde/vinho/branco e calça clara.
Acabamento em pixel art arcade conforme o Urubu. A referência externa
determina identidade e acessórios; o Gavião determina a apresentação de NPC.

Braço A (direito anatômico) segura a lança; B (esquerdo) porta o escudo.
Dois braços e duas pernas, sem asas. Escudo sem letras ou monograma.

Correção posterior: rosto, elmo e olhar diretamente para a frente, como
o Gavião, sem giro de cabeça em três quartos. Preservar lança e escudo.

Base corrigida: `referencia/fluminense/base-guerreiro-v2.png`.
Primeira tentativa preservada: `referencia/fluminense/base-guerreiro-v1.png`.
Fonte, prompt e ficha: `output/guerreiro-v1/`.
## Animações autorizadas — 01/11/2026

Pedido posterior: melhorar a ult do Cartola. Quando o pó de arroz acerta
o adversário e aplica stun, o Guerreiro aparece atrás dele, no outro lado
da arena, e dá um único chute frontal de empurrão inspirado em “This is
Sparta!”. A boca abre para o grito “FLU!”, sem texto desenhado nem áudio.
Também foi solicitada uma espera curta em campo, de frente como o Gavião.

Artes em `public/assets/npcs/guerreiro/base-v1/`:

| Arquivo | Quadros | FPS sugerido | Loop | Contato visual |
| --- | ---: | ---: | --- | --- |
| `idle.png` | 4 | 6 | sim | nenhum |
| `war-run.png` | 6 | 14 | sim | nenhum |
| `sparta-kick.png` (refeito v3) | 8 | 12 | não | 3–4, evento único |
| `turn-exit.png` | 8 | 14 | virada uma vez; corrida 4–7 até sair | nenhum |
| `run-stop.png` | 8 | 12 | não; depois idle | nenhum |

Todas: RGBA, células **512×320**, cinco colunas, leitura por linhas,
origem `[256,296]`, chão y=296. Não interpretar como células 256×256.
Corpo de aproximadamente 200 px em pé; a lança fica acima da cabeça.
Escala uniforme por ação, sem deformar membros. Braço A direito mantém
lança; B esquerdo mantém escudo. Perna A direita chuta; B esquerda apoia.

Espera: respiração discreta e pequeno balanço da capa, pés plantados e
olhar frontal. Correção v3: corrida de investida antes do chute, tronco
inclinado e capa para trás. Ciclo: 0 pouso direito A; 1 passagem esquerda B;
2 voo com B à frente; 3 pouso B; 4 passagem A com apoio B; 5 voo com A à frente.
No chute, manter a pelve voltada para a esquerda do primeiro ao último quadro:
0 base lateral; 1 começa a erguer direita A; 2 joelho A alto;
3 estende A; 4 extensão máxima; 5 recolhe A; 6 baixa A; 7 base lateral.
A direita A permanece próxima da câmera; a esquerda B apoia ao fundo.
Não virar de frente no recolhimento nem trocar os quadris para acomodar a pose.
Sem ataque de lança ou escudo, efeitos de aparição, vítima ou áudio.

### Contrato para integração

- Manter o lançamento e a nuvem existentes do Cartola. Invocar somente
  após acerto confirmado que aplique stun, nunca só por término da animação.
  Erro, esquiva ou bloqueio que evite o stun não libera o Guerreiro.
- Correção posterior: começa **longe**, atrás do alvo, no outro lado da
  arena em relação ao Cartola, e **vem correndo como quem parte para a guerra**.
  Não aparecer já colado no alvo. Motor move a corrida até perto do adversário;
  só então completar a fase de apoio B (quadro 4 da corrida), frear e iniciar
  o chute. A corrida não causa dano. Não tocar o chute enquanto ainda distante.
  A arte corre e chuta para a esquerda; espelhar a
  sequência inteira quando necessário, sem inverter quadros isolados.
- Quadros 3–4 representam um só chute. Caixa ofensiva deve acompanhar a
  bota, não a lança, o escudo ou toda a célula. Dano, alcance, recuo, tempo
  de aparição e sincronização com o stun pertencem à integração.
- Não definir novos valores de dano/stun com esta entrega. A regra antiga
  do pó é stun de 1,5 s em acerto sem bloqueio; o pedido acrescenta o chute.
- Cancelar a participação ao encerrar o round ou perder o alvo. Não
  desenhar deslocamento de arena dentro dos quadros.

Fontes, prompts, guias técnicos A/B, extrações, quadros, contatos em escala
real, GIFs normal/lento e relatório em `output/guerreiro-v3/`.
Prévia: `revisao.html`, incluindo composição ilustrativa de aproximação.
Manifesto público contém hashes, dimensões e caixas visuais por quadro;
essas caixas não substituem hitboxes. Montagem: `python scripts/guerreiro_v3.py`.
Não executar o montador v2: ele restaura o chute rejeitado pelo usuário.

Revisados fontes e 14 quadros novos montados (6 corrida + 8 chute):
direção do chute, perna direita que ergue/estende/recolhe, apoio esquerdo,
acessórios inteiros e nas mesmas mãos, transparência e margens. A aprovação
visual final é do usuário. Nenhum TypeScript ou JSON de runtime alterado;
integração e teste em combate continuam pendentes.

## Saída e parada em guarda — revisão v4

Novo pedido: virar e correr para fora do campo; outra ação já correndo,
freando e parando na posição frontal padrão do acompanhante ao fundo.

`turn-exit.png`: 0 postura esquerda após golpe; 1 começa a virar;
2 frontal; 3 continua giro para direita; 4 passada direita de saída;
5 passagem; 6 extensão em suspensão; 7 passagem oposta. Os quadros 0–3
tocam uma vez. Repetir apenas 4–7 se necessário para chegar fora da câmera.
O ator continua de posse da lança e do escudo; uma fonte que deixava a
lança solta foi rejeitada e está identificada em output.

`run-stop.png`: 0 já corre para esquerda; 1 planta o pé dianteiro para
frear; 2 reduz a passada; 3 fica em pé; 4 começa a virar de frente;
5 quase frontal; 6–7 guarda frontal, com a capa assentando. Em seguida
entrar no `idle.png` existente. A posição de espera ao fundo e sua camada
visual são coordenadas do motor, não uma redução do corpo na folha.

Braço A direito mantém lança, B esquerdo mantém escudo durante a rotação;
nas poses direitas a leitura de profundidade muda progressivamente. Não
espelhar quadros individuais para substituir a virada. Passadas e pivôs
articulam pernas a partir dos mesmos quadris. Fontes e montagem revistos
com comparação da guarda em tamanho real sobre fundos claro e escuro.

O motor move a saída para a borda, desacelera a chegada até o ponto de
espera e remove o NPC só depois de sair da câmera. Nenhuma dessas ações
tem ataque ou dano. As prévias com deslocamento são composições de arte,
não testes de integração no combate.

Fontes, prompts completos, ficha, hashes, extrações, 16 quadros novos,
contatos, GIFs e prévia: `output/guerreiro-v4/revisao.html`.
Montagem: `python scripts/guerreiro_v4.py pack run-stop`,
`python scripts/guerreiro_v4.py pack turn-exit`, depois
`python scripts/guerreiro_v4.py finalize`.
Os montadores antigos v2/v3 não devem reaplicar manifestos sobre a v4.
PNG finais e manifesto atualizados em `public/assets/npcs/guerreiro/base-v1/`.
Nenhum arquivo de lógica de combate foi alterado nesta entrega.

## Integração no jogo (01/11/2026)

NPC de Guarda (CLAUDE.md, Regra do Fundo): mecânica `reforco` no especial do
Cartola (`src/game/reforco.ts`). Correção do João sobre o contrato acima: ele
não aparece só quando o pó atordoa. Fica de guarda no fundo, como os
Gaviões, e sai assim que o Cartola solta o especial: corre pelo fundo para
fora da tela, volta já correndo dentro do campo por trás do adversário,
freia no quadro 4 da corrida, chuta (contato 3 e 4, caixa na bota), sai do
campo pelo mesmo lado e volta pelo fundo até o posto.

Números no JSON do Cartola (`moves.special.reforco`): 10 de dano, empurrão
340, sem guarda que segure, corrida de 1100 px/s no campo e 1300 no fundo.
Arte por nome em `reforco.animacoes`: `guarda` = `idle.png`, `corrida` =
`war-run.png`, `chute` = `sparta-kick.png`. As duas animações a caminho (sair
do campo depois do chute; voltar correndo e parar no posto) entram como
`volta` e `parada` (ou `retorno`), cada uma um efeito novo no JSON; até lá,
a corrida faz as duas.

### Ajustes da integração (01/11/2026, depois)

- Pé no fundo na mesma linha dos Gaviões e do Biriba (`chaoDoFundo`); antes
  ficava 33 px acima ("ele tá voando").
- O chute vai no ponto onde o adversário estava quando o especial saiu, como
  o Biriba: quem sai do lugar escapa.
- `turn-exit` ligado como `volta` (vira parado nos quadros 0 a 3; 4 a 7
  repetem até sair da tela) e `run-stop` como `parada` (o motor desacelera
  até o posto). Ele sempre volta pela direita, correndo para a esquerda,
  para a guarda de frente não sair espelhada.
