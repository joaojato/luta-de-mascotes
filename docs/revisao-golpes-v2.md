# Soco leve duplo, pesado separado e Bira em galope

Atualização posterior: [golpes-personalizados-v3.md](golpes-personalizados-v3.md) define exceções próprias para pesado/baixo/especial do Cartola e os chutes de Urubu, Saci e Galo. Os leves e a patada do Bira desta revisão permanecem. A tabela abaixo registra a entrega anterior.

## Decisões confirmadas

- Leve: os dois socos rápidos do Almirante/Vasco são a referência de animação de todos os personagens.
- Pesado: o movimento que era o leve do Urubu/Flamengo e do Galo passa a ser o soco pesado. Um cruzado com giro do tronco, distinto dos dois rápidos.
- Bira é exceção expressamente confirmada pelo usuário: mantém a patada com garras e efeito cortante como pesado.
- Todos os seis personagens atuais precisam de ao menos um chute verdadeiro. O chute não deve substituir o soco pesado nem desaparecer ao separá-los.
- Bira corre em quatro patas com galope e momentos de suspensão, quase saltando, e dá um bote com pulo para morder ao chegar ao alcance. Substitui a direção anterior de corrida rasteira/mordida com patas plantadas.
- Bahia: primeira versão (`referencia/bahia/referencia-estilo-urubu-v1.png`) escolhida. Suas animações ficam para depois, conforme pedido; ele não entra nesta auditoria dos seis lutadores atuais.

## Escopo e entrega

Codex produz artes, montagem, prévias e este guia. Claude continua responsável por mecânica e integração. Não são alterados TypeScript ou JSON de combate. As folhas novas têm nomes próprios para não colocar uma animação de dois golpes sob a janela antiga de um único golpe enquanto a integração está pendente.

Folhas de cinco colunas, células 256×256 transparentes, direção original para a esquerda. Ler por linhas, índice zero, espelhar para a direita. Fontes geradas com a ferramenta integrada de imagens (built-in), prompts completos, referências, relatório e prévias em `output/revisao-golpes-v2/`. Script técnico: `python scripts/revisao_golpes_v2.py`.

| Personagem | Pasta em `public/assets/lutadores/` | Leve | Pesado | Chute preservado |
| --- | --- | --- | --- | --- |
| Urubu | `urubu/frente/` | `light-double-jab-v2.png` | `heavy-cross-v2.png` | `heavy-kick.png` |
| Almirante | `almirante/base/` | `light-punch.png` existente, sem alteração | `heavy-cross-v2.png` | `heavy-kick.png` |
| Galo | `galo/urubu-v1/` | `light-double-jab-v2.png` | `heavy-cross-v2.png` | `heavy-kick.png` |
| Cartola | `cartola/urubu-v1/` | `light-double-jab-v2.png` | `heavy-cross-v2.png` | `heavy-kick.png` |
| Bira | `cachorro/urubu-v1/` | `light-double-jab-v2.png` | `heavy-claw-v1.png` existente | `heavy-kick.png` |
| Saci | `saci/` | `light-double-jab-v2.png` | `heavy-cross-v2.png` | `heavy-kick.png` |

Os pesados do Urubu, Galo e Cartola são cópias exatas das respectivas folhas de leve anteriores, com hash conferido. Não é necessário redesenhar o movimento que já serve de referência. Os pesados do Almirante e Saci foram desenhados usando a sequência do Urubu. O Saci preserva sua única perna. Seu chute existente usa apoio nas mãos; não adicionar uma segunda perna.

`catalog.json` contém arquivo, quadros, FPS sugerido, caixas visuais quadro a quadro e hash para cada leve/pesado/chute dos seis personagens. `art-contract.json` contém as nove folhas geradas nesta revisão. `revisao.html` reúne as animações; clicar abre a folha numerada. Contagens e quadros vazios são verificados pelo script.

O galope final foi gerado em duas partes (`gallop-a-source.png` e `gallop-b-source.png`, com seus prompts), reunidas em uma folha de oito quadros. As tentativas anteriores de grade foram descartadas. A montagem separa as figuras completas pelos componentes de transparência, evitando cortar poses esticadas em limites artificiais da grade; não redesenha a arte. `comparacao.png` mostra os dois picos do leve, o pesado e um chute de cada personagem.

## Leve e pesado: fases para integração

Leve (6 quadros, 14 FPS sugeridos): 0 guarda; 1 primeiro soco estendido; 2 recolhe; 3 segundo soco estendido; 4 recolhe; 5 guarda. Os dois picos são **1 e 3**, com recolhimento entre eles. Claude deve sincronizar as janelas com esses dois movimentos e decidir a política de dano/combo. Não manter cegamente a antiga janela 2–3 do Urubu, que agora acertaria a retração.

Pesado padrão (6 quadros, 12 FPS sugeridos): 0 guarda; 1 prepara/gira; 2 cruzado estendido; 3 seguimento/recolhimento; 4 retorno; 5 guarda. Uma única execução ofensiva, pico em 2 e possível seguimento em 3. O FPS mais lento é uma sugestão visual; dano, pausa de impacto e balanceamento ficam com Claude.

Patada do Bira permanece com 10 quadros e efeito cortante, conforme `docs/bira-patada-mordida.md`. Não aplicar a exceção a todos os personagens e não substituir essa folha pelo cruzado.

Claude deve registrar `light-punch` e `heavy-punch` separadamente, apontar as folhas da tabela e manter `heavy-kick` disponível ao comando de chute. O Almirante atualmente usa tiro de garrucha no `moves.heavy`: este mapeamento precisa ser revisto para usar o novo cruzado como soco pesado. Não deixar o projétil saindo do punho da animação nova. A arte antiga do tiro permanece preservada; o pedido não especificou outro comando para ela.

As variantes antigas da Academia ficam fora desta padronização artística. Conferir herança das skins e o modelo selecionado para não apontar por engano os arquivos da variante anterior. Não substituir o chute por um fallback de soco; a tabela contém folhas próprias para os seis.

## Bira: corrida aos saltos e bote

Pasta `public/assets/lutadores/cachorro/urubu-v1/`:

| Arquivo | Quadros | Uso |
| --- | --- | --- |
| `special-bounding-run-v2.png` | 8 | Galope quadrúpede; repetível só durante aproximação |
| `special-pounce-bite-v2.png` | 12 | Impulso, mordida aérea, aterrissagem e guarda; uma vez |
| `special-bite-charge-v1.png` | 5 existentes | Guarda para quatro apoios; preservar |
| `bite-snap-fx-v1.png` | 6 existentes | Efeito de mordida; preservar |

Galope, 16 FPS sugeridos: 0 reúne traseiras; 1 impulsiona; 2 suspensão esticada, quatro apoios fora do chão; 3 suspensão recolhida, coluna flexionada; 4 aterrissa nas dianteiras; 5 amortece; 6 reúne traseiras; 7 novo impulso. A alternância esticado/recolhido e a suspensão são essenciais. Não reutilizar os três quadros de caminhada da versão anterior para aproximar.

Bote, 16 FPS sugeridos: 0 comprime; 1 impulsiona com as traseiras; 2 sai no ar/abre boca; 3 mandíbula aberta no ar; 4 fecha a mordida no ar; 5 segue a mesma mordida; 6 prepara pouso ainda suspenso; 7 dianteiras pousam; 8 traseiras pousam; 9–10 levanta; 11 guarda. **2–6 são aéreos**; a boca fecha no quadro 4, com as patas fora do chão. O dano é uma única mordida. Não confundir a extensão do bote com um soco ou com outra mordida.

Aproximação deve disparar o bote quando o adversário entra no alcance. Movimento horizontal e arco curto do salto pertencem à mecânica. Não levantar o sprite só pela mudança de folha e ainda aplicar uma segunda parábola na física. Pivôs e caixas visuais por quadro estão no contrato. Corrida pode ter balanço pequeno; o bote exige elevação real do corpo na mecânica, sem sair da tela.

A esquiva continua sendo **pular**: o bote ataca uma faixa baixa/média definida ao iniciar o salto, sem rastrear verticalmente o oponente. Não copiar a altura de ataque da bicada do Galo. Validar que o adversário que pulou no tempo certo fica acima da caixa da boca durante toda a janela ativa. Não criar atropelamento pelo corpo ou dano nas patas que elimine essa esquiva.

Efeito de mordida: alinhar o fechamento do quadro 3 do efeito ao quadro 4 do bote/contato confirmado. Não mostrar mandíbula prendendo o alvo que escapou. A corrida usa suspensão cíclica; o bote é uma fase própria e não deve repetir enquanto segura o especial.

`bira-previa.html` alterna adversário em pé e pulando. GIFs de coreografia: `bira-acerto.gif` e `bira-esquiva.gif`. São prévias de arte, sem colisões simuladas nem comprovação de mecânica no jogo.

## Verificações

Arte: transparência, contagem, grade, margens das folhas novas, células excedentes vazias, cópias pesadas idênticas e presença de folhas reais de chute nos seis personagens. Revisão visual dos dois picos do leve, cruzado pesado e galope/bote.

Integração pendente com Claude: os seis têm leve, pesado e chute distintos no personagem selecionado; dois socos rápidos não viram um golpe sustentado; pesado não dispara projétil indevido; Bira preserva patada; galope repete sem caminhar; bote ocorre no alcance e morde no ar; pulo evita; erro e acerto retornam à guarda; ambos os sentidos, curta/longa distância e limites da arena. Não houve testes de combate nesta entrega artística.
