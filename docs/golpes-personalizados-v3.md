# Golpes próprios — Cartola, Urubu, Saci e Galo

Revisão de legibilidade posterior: [animacoes-legiveis-v5.md](animacoes-legiveis-v5.md) substitui as bengaladas curtas e o giro por sequências mais longas, reduz tamanho/alpha dos cortes e acrescenta carrinho baixo ao Bira. Não reutilizar as contagens/janelas antigas desta página nesses golpes novos.

Correção posterior dos socos: [socos-alternados-v4.md](socos-alternados-v4.md). Os leves de Urubu/Bira/Cartola/Galo alternam de fato as mãos, e o Saci mantém os socos fraco e forte originais. Os golpes próprios desta revisão v3 permanecem preservados.

## Direção solicitada e responsabilidades

Esta atualização substitui apenas os movimentos explicitamente indicados. Preservar as aparências aprovadas e os leves de dois socos rápidos da revisão anterior. Cartola ganha bengalada pesada, varredura de bengala e especial Pó de Arroz. Urubu ganha bicada que fecha e puxa no comando de chute. Saci arremessa o cachimbo em parábola enquanto coloca outro na boca. Galo ganha chute giratório com o efeito de garras do Bira.

Codex entrega artes, efeitos, prévias e guia. Claude integra comandos, dados, física, colisões, bloqueio e stun. Nenhum TypeScript ou JSON de runtime é alterado nesta entrega. As animações dos adversários estunados foram expressamente adiadas pelo usuário.

## Arquivos e mapeamento para Claude

Todos os arquivos têm cinco colunas de 256×256, RGBA transparente, leitura por linhas e índice inicial zero. Direção original à esquerda; espelhar para a direita. Células excedentes transparentes. Reproduzir uma vez, sem loop; a rotação do projétil pode repetir durante seu voo.

| Personagem / comando | Pasta em `public/assets/lutadores/` | Arquivo | Quadros / FPS sugerido |
| --- | --- | --- | --- |
| Cartola / soco pesado | `cartola/urubu-v1/` | `heavy-cane-v3.png` | 8 / 14 |
| Cartola / chute baixo | `cartola/urubu-v1/` | `low-cane-sweep-v3.png` | 8 / 14 |
| Cartola / especial | `cartola/urubu-v1/` | `special-rice-throw-v3.png` | 10 / 14 |
| Cartola / efeito do especial | `cartola/urubu-v1/` | `rice-powder-cloud-v3.png` | 8 / 16 |
| Urubu / chute principal | `urubu/frente/` | `kick-beak-clamp-pull-v3.png` | 8 / 14 |
| Urubu / chute baixo | `urubu/frente/` | `low-kick-classic-v3.png` | 10 / 12 |
| Saci / chute principal | `saci/` | `kick-pipe-swap-throw-v3.png` | 8 / 14 |
| Saci / projétil | `saci/` | `pipe-lob-projectile-v3.png` | 6 / 16 |
| Saci / chute baixo | `saci/` | `low-kick-classic-v3.png` | 14 / 12 |
| Galo / chute principal | `galo/urubu-v1/` | `kick-spinning-talon-v3.png` | 10 / 16 |
| Galo / rastro de garras | `galo/urubu-v1/` | `talon-slash-fx-v3.png` | 6 / 18 |
| Galo / chute baixo | `galo/urubu-v1/` | `low-kick-classic-v3.png` | 10 / 12 |

Os três `low-kick-classic-v3.png` são cópias exatas das animações de chute normal anteriores (`heavy-kick.png`), por pedido expresso. Não são redesenhos de novas poses rasteiras. Claude deve registrar o comando de chute baixo apontando para essas folhas, conferir as caixas com a arte real e manter separado o novo chute principal. A escolha da folha sozinha não implementa a regra de golpe baixo.

O efeito do Galo é cópia exata de `cachorro/urubu-v1/claw-slash-fx-v1.png`, com hash conferido. Não muda a patada do Bira. Bira, Almirante e o chute principal de pé do Cartola permanecem com suas artes anteriores; assim os seis personagens continuam dispondo de ao menos um chute físico. Não excluir os chutes normais originais ao migrar comandos.

## Cartola — aparência e bengala

A ilustração anexada pelo usuário define **apenas a bengala**: haste fina escura, pequeno pomo esférico vermelho e ponteira clara. Não copiar seu uniforme de futebol, chapéu listrado verde ou rosto caricatural. O Cartola continua com a base aprovada: cabelo ruivo, cartola preta de faixa cinza, fraque bordô, gravata e calça verdes e sapatos pretos. A base/idle não foi alterada.

`output/golpes-personalizados-v3/cane-reference.png` é a referência isolada do acessório, gerada em pixel art a partir da bengala enviada. As folhas de ataque introduzem e recolhem o acessório; não exigem trocar toda a arte do personagem.

Bengalada pesada: 0 guarda; 1 saca; 2 arma perto do ombro; 3 extensão da haste no tronco do alvo; 4 segue a mesma pancada, com haste em perspectiva; 5 recolhe para trás; 6–7 guarda. Uma porrada seca, sem virar projétil. Janela visual candidata 3–4, pico 3. Caixa na haste/ponta, um dano por execução. Este pesado substitui o cruzado padrão **só no Cartola**.

Varredura baixa: 0 guarda; 1 saca; 2 abaixa e arma atrás; 3 varre baixo; 4 haste estendida à frente perto das canelas/tornozelos; 5 segue o mesmo arco baixo; 6 sobe/recolhe; 7 guarda. Janela candidata 3–5. A haste permanece na altura das pernas, sem caixa atingindo cabeça ou tronco por causa do retângulo do sprite inteiro. Preservar o tamanho anatômico durante a flexão.

## Cartola — Pó de Arroz

Corpo: 0 guarda; 1 busca no fraque; 2 mostra o saquinho de pano; 3 prepara/abre; 4 lança o pó com o gesto à frente; 5 extensão; 6 sacode/segue o mesmo lançamento; 7 recolhe; 8 guarda o saquinho; 9 guarda original. Criar a nuvem separada no quadro **4** (cerca de 286 ms a 14 FPS), orientada para o adversário. Conferir a origem junto à abertura do saquinho; não no centro do peito.

Nuvem: 0 jato pequeno; 1 abre; 2 leque; 3–4 volume maior; 5 dissipa; 6–7 poeira residual. O pó é branco com sombras claras, não fumaça azul ou energia. O efeito não contém um adversário nem sua animação de stun.

**Acerto sem bloqueio: stun de 1,5 s (1500 ms).** O pedido diz bloquear de alguma forma: bloqueio alto ou baixo válido deve evitar o stun. A nuvem visual pode tocar a guarda sem aplicar o estado. Processar contato/bloqueio uma vez por lançamento; não renovar o stun a cada quadro da mesma nuvem e não aplicá-lo só porque o efeito foi desenhado na frente do alvo.

Claude define o volume ofensivo, alcance, deslocamento da nuvem, custo, dano e regras de reaplicação entre execuções. A duração pedida é 1,5 s; não inventar uma animação definitiva de vítima nesta etapa. Resolver o estado mecânico e a recuperação sem exigir artes novas de stun agora. A folha já parte da guarda e contém a preparação do saquinho; evitar tocar outra preparação de ataque com poses incompatíveis antes dela.

## Urubu — bicada que fecha e puxa

Quadros: 0 guarda; 1 carrega pescoço; 2 abre bico/inclina; 3 pescoço estendido, bico aberto; 4 fecha o bico; 5 retrai cabeça e tronco com o bico fechado; 6 recupera; 7 guarda. É um movimento de morder e puxar para si, com os pés no chão. Uma única sequência, sem levantar voo ou copiar a bicada aérea do Galo.

Janela candidata 4–5, caixa na ponta do bico. O puxão é **do próprio Urubu**: não agarrar nem arrastar fisicamente o adversário sem novo pedido. Sem sangue, partes arrancadas ou objeto na boca. O especial meteoro é independente e permanece preservado. O antigo chute normal fica disponível no comando de chute baixo.

## Saci — lança um e põe outro na boca

Quadros: 0 cachimbo antigo na boca; 1 mão oposta busca reserva; 2 uma mão retira o antigo e a outra aproxima o novo dos lábios; **3 arremessa o antigo e simultaneamente coloca o novo na boca**; 4 segue o arremesso/ajusta o novo; 5 volta; 6–7 guarda com cachimbo novo. Não fazer duas ações em sequência, com um intervalo sem cachimbo; os dois braços trabalham ao mesmo tempo no quadro 3. Preservar exatamente uma perna.

Lançar o projétil no quadro **3** (cerca de 214 ms a 14 FPS), a partir da mão que arremessa. A folha do corpo não deve conter um projétil separado que duplique a entidade criada na lógica. O cachimbo substituto fica na boca; apenas o antigo sai voando. Os seis quadros de projétil mostram rotação no mesmo centro local; não contêm o arco de deslocamento.

**Trajetória balística parabólica**: velocidade inicial horizontal em direção ao oponente, componente vertical inicial para cima e gravidade que o faz cair. Não reutilizar a linha reta do tiro da garrucha. Espelhamento altera direção horizontal; a gravidade permanece para baixo. Tratar o chão para o projétil cair/encerrar o voo; não deixá-lo flutuar à altura do rosto. Não rastrear o alvo depois do lançamento. Velocidade, gravidade, alcance, dano, bloqueio e persistência após contato ficam com Claude; a prévia demonstra o arco, não estabelece valores finais.

O antigo chute físico, apoiado nas mãos, é preservado para chute baixo. Não mexer no especial de avanço do Saci nesta alteração do comando de chute.

## Galo — chute giratório com garras

Quadros: 0 guarda; 1 pivô; 2 costas da camisa e joelho armado; 3 rotação lateral/costas; 4–5 perna estendida com garras abertas; 6 seguimento girando; 7 recolhe; 8 recompõe; 9 guarda. A passagem mostrando as costas diferencia este movimento do chute frontal anterior. Uma rotação e um golpe, sem adicionar outra perna, asas ou tênis.

Efeito `talon-slash-fx-v3.png`: iniciar junto ao quadro **4**, seguir a posição das garras durante 4–6 e dissipar. É o mesmo desenho cortante da patada do Bira, agora alinhado ao pé do Galo. Caixa ofensiva no pé/garras, não nas mãos nem na nuvem inteira do rastro. Não causar um segundo dano apenas pelo efeito. O especial de bicada em voo baixo permanece separado. O chute frontal anterior agora é a animação de chute baixo solicitada.

## Revisão e reprodução

`output/golpes-personalizados-v3/revisao.html`: folhas e animações numeradas. `cenas.html`: prévias compostas dos seis golpes, incluindo pó contra guarda e cachimbo em parábola. `storyboard.png`: visão estática dos seis. São demonstrações de coreografia sem simulação de colisão, bloqueio ou stun. As poses de guarda do adversário não são artes novas de vítima estunada.

Geração: ferramenta integrada de imagens (built-in), oito folhas finais novas com 66 quadros, mais referência isolada da bengala. Prompts completos, fontes e `manifest.json` na pasta de saída. `art-contract.json` registra limites visíveis, dimensões, contagens e hashes; registra também as quatro cópias exatas reutilizadas. Scripts locais apenas cortam, montam e alinham as imagens e compõem prévias; não desenham os personagens. Conferir escala e pivô entre ações usando as caixas do contrato, sobretudo nas bengaladas cuja haste alonga a silhueta.

Reproduzir: `python scripts/golpes_personalizados_v3.py`. Checagens artísticas: transparência, contagem, grade, margens, células finais vazias, cópias idênticas, identidade e leitura das fases. Nenhum teste de combate nesta entrega.

Validação pendente com Claude: comandos corretos nas skins atuais; leves e especiais não solicitados preservados; bengala pesada e baixa com caixas distintas; pó sem bloqueio causa 1,5 s de stun e qualquer bloqueio válido evita; cachimbo sai uma vez, troca simultânea, arco e queda funcionam nas duas direções; Urubu fecha e retrai sem arrastar o alvo; giro do Galo e garras sincronizam; ao menos um chute físico nos seis personagens; acerto, erro, arena e recuperação sem travamentos.
