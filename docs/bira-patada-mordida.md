# Bira — patada pesada e especial de mordida

## Pedido e responsabilidades

O usuário pediu dois movimentos próprios: soco pesado vira uma patada com garras e efeito cortante; especial vira avanço em quatro patas, com mordida ao alcançar o oponente e efeito de mandíbula. O adversário precisa pular para desviar do especial.

Codex entrega artes, efeitos e guia. Claude implementa ações, deslocamento, alcance, colisões e dano. Esta entrega não altera arquivos de lógica ou JSON, nem ativa as folhas novas. Preserva os movimentos atuais até a integração.

## Assets

Pasta: `public/assets/lutadores/cachorro/urubu-v1/` (Bira conserva o id interno `cachorro`).

| Arquivo | Quadros | Linhas | FPS sugerido |
| --- | --- | --- | --- |
| `heavy-claw-v1.png` | 10 | 2 | 12 |
| `special-bite-charge-v1.png` | 5 | 1 | 14 |
| `special-quadruped-bite-v1.png` | 12 | 3 | 16 |
| `claw-slash-fx-v1.png` | 6 | 2 | 18 |
| `bite-snap-fx-v1.png` | 6 | 2 | 18 |

Todas as folhas têm 5 colunas, células 256×256, RGBA transparente e leitura por linhas, índice inicial zero. Células excedentes ficam vazias. Direção original à esquerda; espelhar para a direita. Sem loop, exceto os quadros de corrida enquanto necessários à aproximação. Os FPS são sugestões visuais, não uma alteração de balanceamento.

Identidade preservada de `referencia/bira/referencia-estilo-urubu-v1.png`: cachorro escuro com focinho e áreas castanhas, orelhas pontudas, cauda, camisa listrada preta e branca, calção preto, munhequeiras, meias pretas e tênis pretos e brancos. A posição quadrúpede utiliza seus dois braços e duas pernas, com o uniforme mantido. Traço pixel art arcade do Urubu, contornos fortes, sombras em blocos.

## Patada pesada

Quadros 0 guarda; 1–2 prepara com a pata aberta; 3 inicia o arco; 4 extensão com garras; 5 segue o corte; 6 termina o arco; 7–8 recolhe; 9 guarda. É uma única patada, com garras caninas, não punho fechado nem chute.

Sincronizar `claw-slash-fx-v1.png` com 3–5: três rastros curvos indicam a trajetória cortante na região da pata. O efeito é uma camada de tela/mundo sobre o golpe, não um projétil e não deve criar alcance próprio sem decisão de mecânica. Não esticar a folha para cobrir a tela inteira. Sem sangue ou feridas.

Na variante principal, a ação forte atual ainda aponta para `heavy-kick`; há também definições antigas de `heavy-punch` em outras variantes. Claude deve registrar a patada na ação/comando de **soco pesado do Bira**, conferir o mapeamento selecionado no jogo e evitar mudar globalmente o chute pesado de outros personagens. Não assumir que apenas trocar um PNG antigo ativa o movimento correto.

Janela visual candidata da patada: 3–5. Caixa ofensiva acompanha a pata/garras. Um dano por execução, sem dano duplicado causado pelo efeito.

## Avanço e mordida

Preparação: 0 guarda; 1 abaixa; 2 leva as patas dianteiras ao chão; 3 apoia; 4 postura baixa em quatro apoios.

| Quadros do especial | Fase |
| --- | --- |
| 0 | Pronto em quatro patas |
| 1–3 | Corrida baixa; repetir apenas esta faixa enquanto aproxima |
| 4 | Freia/arma a mordida ao entrar no alcance |
| 5 | Abre a mandíbula e projeta o focinho |
| 6 | Fecha a mandíbula: pico da mordida |
| 7 | Seguimento da mesma mordida |
| 8 | Recolhe a cabeça, ainda baixo |
| 9–10 | Sai dos quatro apoios e levanta |
| 11 | Guarda |

O avanço se parece funcionalmente com o especial do Saci: aproximação física em direção ao oponente. Visualmente o Bira corre sobre quatro apoios. Não voa e não salta para alcançar a cabeça. A mordida mira a parte inferior do corpo de um adversário em pé; posicionar a caixa pela boca desenhada, sem elevar o Bira artificialmente.

**O alcance real dispara a transição de corrida para mordida.** Não usar apenas um atraso fixo que morde antes de chegar ao alvo. Manter tempo/distância máximos e recuperação em caso de erro, a definir por Claude. As imagens contêm poses; o deslocamento pelo cenário vem da lógica.

O especial deve poder acertar o adversário no chão e passar por baixo de quem pula no tempo certo. Não seguir o adversário para cima nem deslocar a caixa da mordida até sua cabeça durante o salto. Conferir a caixa de corpo inteira: não causar dano de atropelamento fora da janela da boca, anulando a esquiva. Agachar não deve virar a esquiva deste especial por reutilização das regras do Galo.

Janela visual candidata: 6–7, uma única mordida. Usar a boca/focinho como origem do golpe. `bite-snap-fx-v1.png`: 0–2 abrem/convergem as arcadas; 3 fecha com estalo; 4–5 dissipam. Alinhar o quadro 3 do efeito ao fechamento da boca/contato. O efeito completo de impacto deve aparecer no alvo apenas quando houver contato confirmado; não desenhá-lo prendendo um adversário que escapou pulando. Não prender, agarrar ou arrastar o oponente sem uma regra de mecânica explícita.

Dano, custo, bloqueio, invulnerabilidade e outras regras de balanceamento não foram redefinidos neste pedido. A condição visual/mecânica solicitada é a esquiva por pulo. Não importar a regra de pulo + recuo do Urubu nem a regra de abaixar do Galo.

## Revisão e integração

Prévia: `output/bira-garras-mordida/previa.html`, com patada, mordida e esquiva com pulo. São demonstrações de arte/coreografia, sem simulação de colisões. Fontes PNG, prompts completos, folhas de contato e GIFs individuais ficam na mesma pasta. `manifest.json` registra os insumos; `art-contract.json` registra células e caixas visuais quadro a quadro.

Artes geradas com a ferramenta integrada de imagens (built-in). Scripts locais só montam e alinham as folhas e compõem as prévias. Reproduzir montagem e checagens: `python scripts/bira_garras_mordida.py`.

Validação de integração com Claude: comando pesado usa a patada correta; arco e efeito seguem as garras nos dois sentidos; aproximação para na distância certa; mandíbula fecha uma vez; alvo em pé é atingido; alvo que pula evita a boca e o corpo do avanço; não há rastreamento vertical; distância longa, arena e colisão em curta distância não travam o movimento; retorno à guarda funciona em acerto e erro. Nenhum teste de combate foi executado nesta entrega exclusivamente artística.
