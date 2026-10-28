# Animações legíveis — bengalas, giro, carrinho e socos

**Integrado pelo Claude em 28/10/2026:** as seis ações usam os nomes v5 com as contagens, FPS e janelas da tabela; caixas medidas na ponta real. O carrinho do Bira desliza 110 px de sheet nos quadros 4 a 8 e para a 60 do adversário (`travel` no JSON). Cortes nascem no pé do Galo e na pata do Bira (`effectAt`). `saci/light-punch.png` voltou ao original (Regra da Skin: modelo antigo não é apagado) e o jab novo vive só em `light-snap-v5.png`. Os aliases `claw-slash-fx-v1.png`, `talon-slash-fx-v3.png` e `urubu/frente/light-alternating-v4.png` saíram. O `--apply-safe` não tem mais alvo; não reexecutar.

## Pedidos atendidos pela arte

- Cartola: bengalada pesada e varredura baixa mais longas, com preparação, haste realmente estendida e retorno legível.
- Galo: giro completo do corpo com costas, perfil oposto e frente, seguido do chute. Não apenas um chute frontal com as costas paradas.
- Galo e Bira: rastros cortantes menores e translúcidos, permitindo ver o lutador atrás.
- Bira: novo chute baixo de carrinho, apoiado no quadril com um pé estendido à frente.
- Saci: novo ataque leve de jab rápido, substituindo a preferência anterior por manter o fraco original. O forte original continua preservado.
- Urubu: socos leves continuam alternando as mãos; o contorno excessivo foi redesenhado mais fino, em azul-escuro/carvão, com volumes internos mais claros.

As identidades, figurinos e o padrão pixel art aprovados permanecem. Artes geradas com a ferramenta integrada de imagens (built-in). Scripts locais apenas extraem figuras completas, normalizam escala entre partes, montam as folhas, limitam tamanho/alpha na exportação e compõem prévias.

## Assets e duração sugerida

Grade final: cinco colunas, células 256×256, RGBA transparente, ordem por linhas, índice zero, sem loop nos golpes. Virados para a esquerda; o motor espelha para a direita.

| Movimento | Pasta em `public/assets/lutadores/` | Arquivo | Quadros | FPS | Duração |
| --- | --- | --- | --- | --- | --- |
| Cartola pesado | `cartola/urubu-v1/` | `heavy-cane-extended-v5.png` | 16 | 12 | 1,33 s |
| Cartola baixo | `cartola/urubu-v1/` | `low-cane-extended-v5.png` | 16 | 12 | 1,33 s |
| Galo giratório | `galo/urubu-v1/` | `spin-full-turn-v5.png` | 20 | 14 | 1,43 s |
| Bira carrinho baixo | `cachorro/urubu-v1/` | `low-slide-tackle-v5.png` | 14 | 14 | 1,00 s |
| Corte compacto | `cachorro/urubu-v1/` | `claw-slash-small-v5.png` | 6 | 18 | 0,33 s |
| Mesmo corte para Galo | `galo/urubu-v1/` | `talon-slash-small-v5.png` | 6 | 18 | 0,33 s |
| Saci leve rápido | `saci/` | `light-snap-v5.png` | 6 | 24 | 0,25 s |
| Urubu leve, contorno limpo | `urubu/frente/` | `light-clean-outline-v5.png` | 6 | 14 | 0,43 s |

As bengaladas anteriores duravam 8/14 = 0,57 s; o novo conjunto dura mais que o dobro. O giro anterior durava 10/16 = 0,63 s; o novo dura 1,43 s. Não acelerar as novas folhas aos FPS antigos sem revisar a leitura.

## O que pode ser substituído sem mudar contagens

`python scripts/animacoes_legiveis_v5.py --apply-safe` substitui somente os quatro PNGs de seis quadros já consumidos pelo jogo, após validar os hashes dos backups:

- Bira `claw-slash-fx-v1.png`: corte menor/translúcido.
- Galo `talon-slash-fx-v3.png`: o mesmo corte menor/translúcido.
- Urubu `light-alternating-v4.png`: novos contornos, mantendo poses/picos de mãos distintas em 1 e 3.
- Saci `light-punch.png`: novo desenho do jab. A versão anterior fica no backup `saci-light-before.png`.

As folhas novas de 16/20/14 quadros **não devem sobrescrever as antigas de 8/10** sem o responsável integrar a nova contagem: isso faria o jogo tocar só a preparação. Esses movimentos ficam em nomes v5, prontos para Claude registrar.

O Saci ainda tinha 12 FPS no JSON lido nesta entrega. A troca do PNG melhora o gesto e antecipa a extensão para o quadro 2, mas o total só chega a **0,25 s quando Claude mudar para 24 FPS e alinhar a janela em 2–3**. Não afirmar que a substituição da arte sozinha já alterou esse FPS. Nenhum TypeScript ou JSON de runtime é escrito aqui, conforme a divisão vigente.

## Cartola — preparar, estender, retornar

Pesado: 0 guarda; 1–3 saca; 4–6 arma a bengala; 7–8 começa a passagem à frente; **9–10 haste estendida com alcance visível**; 11–13 segue/recolhe; 14–15 guarda. Janela visual candidata 9–10, um dano por execução. A haste pertence à mão que segura o pomo vermelho, não é uma peça/projétil independente.

Baixo: 0 guarda; 1–2 saca; 3–6 abaixa e arma; 7–8 começa a varredura; **9–11 extensão rente às canelas/tornozelos**; 12–14 recolhe/levanta; 15 guarda. Janela candidata 9–11. Não reutilizar a caixa alta do soco pesado para a bengala baixa.

Os dois conjuntos têm poses progressivas e quadros de extensão suficientes para ler o gesto; não são apenas o golpe anterior tocado duas vezes. A normalização entre as duas fontes mantém a altura das guardas de início/fim equivalente. Conferir pivô e escala com `frameBoxes`, já que a bengala aumenta a largura da silhueta.

## Galo — giro perceptível

0 guarda; 1 pivô; 2–4 costas e giro para o lado oposto; 5–6 perfil/frente virados para a direita; **7 vista frontal para a câmera**; 8–9 retorna para a esquerda com joelho armado; 10 inicia a extensão; 11–13 pico/seguimento; 14–16 recolhe e replanta; 17–19 recompõe a guarda.

Essas orientações distintas são o critério de revisão: a camisa e a cauda mudam de lado durante a volta. O corpo não deve permanecer numa única orientação atrás do pé estendido. A direção temporária do desenho durante o giro não deve inverter a direção ofensiva ou o espelhamento do personagem na lógica.

Janela candidata 10–13, uma única execução ofensiva no pé/garras. Mover o `effectFrame` antigo de 4 para **10**. Não emitir rastro durante a preparação do giro, nem aplicar dano na cauda/mãos pelo tamanho do sprite.

## Cortes discretos

Cada quadro do novo corte tem a área visível limitada a **72×72 pixels dentro da célula de 256×256**. O alpha máximo exportado é **105/255 ≈ 41%**, com bordas ainda mais transparentes. O original ocupava perto da célula inteira. Isso reduz tamanho e opacidade no próprio PNG, sem depender de mudança no motor.

Não aplicar `setDisplaySize`/normalização que volte a esticar o conteúdo para preencher o lutador ou a tela. A célula continua 256×256 para encaixar na leitura existente; o desenho ocupa só o pequeno centro. Emitir junto à pata do Bira e à garra do pé do Galo. O motor atual usa um ponto genérico relativo ao chão: Claude deve ajustar o ponto do Galo para a altura do pé se necessário. O efeito não aumenta a caixa ofensiva e não gera segundo dano.

`efeitos-antes-depois.png` mostra o mesmo lutador por trás dos dois efeitos. Verificar a cena em escala real: a perna, o tronco e o adversário devem continuar legíveis.

## Bira — carrinho baixo

0 guarda; 1–2 baixa; 3 senta/apóia o quadril; 4–5 estende a perna com breve sustentação; 6–8 desliza baixo com o tênis/sola à frente e outra perna dobrada; 9 recolhe; 10–11 levanta com apoio da mão; 12–13 guarda. Uma mão dá apoio atrás do corpo, em vez de permanecer em pé aplicando chute frontal. O primeiro desenho de extensão foi substituído por uma sustentação da pose completa para evitar um tênis cortado na borda da fonte.

Criar/registrar ação de chute baixo própria do Bira. Janela visual candidata 4–8, na ponta/sola do tênis e faixa baixa das pernas adversárias, sem caixa ofensiva na cabeça ou na mão de apoio. Deslocamento horizontal real e regras de bloqueio/esquiva ficam com Claude; a arte contém as poses centradas, não deslocamento acumulado por dentro da folha. A prévia demonstra deslocamento apenas para comunicar a coreografia. Não alterar o galope/bote do especial nem a patada pesada.

## Saci e Urubu

Saci: um único jab compacto, sem grande preparação. 0 guarda; 1 carga curta; **2–3 extensão/contato sustentado brevemente**; 4 recolhe; 5 guarda. Alvo 24 FPS, extensão em aproximadamente 83 ms e ciclo total 250 ms. Uma perna, cachimbo e figurino preservados. Não trazer de volta a obrigação de dois socos para ele. Forte original e arremesso de cachimbo permanecem.

Urubu: 0 guarda; 1 primeiro braço; 2 transição; 3 outro braço com costas/ombro à frente; 4–5 retorna. Contorno fino escuro em lugar de faixa preta larga; volumes internos em azuis mais claros para separar braço, ombro e fundo. Não foi adicionado halo branco para esconder o problema. A alternância correta de mãos foi mantida. Conferir sobre fundo escuro e claro.

## Artefatos e integração

`output/animacoes-legiveis-v5/revisao.html`: sete folhas e durações. `cenas.html`: golpes em contexto e comparação dos cortes. Fontes/prompts em `manifest.json` e `extra-jobs.json`, com prompts completos por parte; `art-contract.json` contém contagens, FPS propostos, caixas e hashes; `applied-safe.json` registra os quatro PNGs efetivamente substituídos. Backups e hashes em `effects-before.json` e `lights-before.json`.

`claude-integration.json` reúne as seis ações com arquivo, quantidade, FPS, duração e janelas sugeridas, para tornar concreta a integração pendente. É um arquivo de entrega, não um JSON de runtime aplicado ao jogo.

Reprodução: `python scripts/animacoes_legiveis_v5.py` monta/verifica; `--apply-safe` aplica só as substituições de seis quadros descritas acima, recusando alteração concorrente de arte. São 84 quadros finais em sete folhas (mais a cópia do mesmo corte para Galo), com extração de figuras completas para evitar fragmentos de células vizinhas. Não executar pipelines antigos para sobrescrever estas correções.

Validação artística: transparência, grade, contagem, células finais vazias, margens, normalização entre partes, giro com múltiplas vistas, bengala inteira, corte ≤72 px/alpha ≤105 e comparação visual das poses. A integração de durações, janelas e deslocamento é do Claude; não foi testado combate nesta entrega. Checar acerto/erro, ambas as direções, volta à guarda e inexistência de dano extra pelos efeitos.
