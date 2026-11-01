# Dragão do Atlético Goianiense — artes v1

Pedido de 30/10/2026. Produção de base e animações, individualmente, na ordem:
em pé, abaixado, no ar e especial. Acabamento arcade do Urubu; imagens do
usuário determinam identidade, não substituem o traço do jogo.

## Identidade e anatomia

Rosto e musculatura da primeira imagem: dragão adulto vermelho, focinho
largo, olhos amarelos, presas e chifres/crista vermelhos, ombros e braços
muito fortes. Asas membranosas e estrutura corporal da segunda referência,
sem importar o rosto infantil ou acabamento 3D. Sem camisa; faixa diagonal
preta como cicatriz/queimadura já curada, da direita anatômica à cintura
esquerda. Não é tecido, alça ou ferimento aberto. Shorts pretos, sem logos.

A: braço/perna esquerdos anatômicos, próximos da câmera na guarda. Braço A junto ao
abdômen; perna A recuada à direita da tela. B: braço/perna direitos anatômicos,
distantes; punho B alto e pé B avançado à esquerda. As posições de profundidade
mudam progressivamente no giro, sem trocar conexões com ombro/quadril.
A cicatriz começa no ombro B/direito e termina junto à cintura A/esquerda.
As primeiras fichas chamavam A de direito; a ligação visual A=próximo e
B=distante permanece, esta correção explicita os lados anatômicos da vista frontal.
Cauda única ligada à pelve, comprimento constante. DUAS asas nas costas,
separadas dos DOIS braços: esta espécie não usa os braços como asas de ave.
Faixa, chifres, asas e cauda mantêm os mesmos lados durante as rotações.

## Golpes próprios

- Soco em pé: dois golpes brutos alternando braços, referência efetiva do Porco.
- Chute em pé: cuspida curta de fogo; corpo e efeito separados, alcance visual
  muito menor que o vômito do Porco. Não transformar em projétil de tela inteira.
- Bloqueio baixo começa já abaixado e termina baixo.
- Soco baixo: um único soco forte com rotação de quadril e mínimo avanço;
  a força técnica não implica aumento automático de dano. Retorna abaixado.
- Chute baixo: preparação contida e giro completo de 360 graus, com golpe
  único e rápido da cauda. Mostrar costas, perfil oposto e frente; seguir
  ambas as pernas durante o pivô. Não girar/espelhar uma pose pronta por script.
  No contato a cabeça já olha para a direita, mas o adversário continua à
  esquerda e é a cauda, atrás do corpo, que o atinge. Isso não altera o facing
  lógico do ator; espelhar apenas a ação inteira para enfrentar o outro lado.
- Avanços: batida visível das asas fornece impulso; física move o ator.
- Salto e golpes aéreos padrão seguem Urubu, sem outra parábola na folha.

## Especial: varredura aérea de fogo

Decolagem, varredura e retorno separados. Jato contínuo separado do corpo,
emitido da boca; não atira bolas de fogo sucessivas. Começa inclinado para
baixo e à frente, depois varre para cima para alcançar pulos. A faixa sob o
dragão fica livre; fugir exige avançar para essa área.

Convenção proposta para os ângulos citados pelo usuário: zero aponta para
baixo e os ângulos positivos giram em direção ao oponente. 30 graus = diagonal
baixa à frente; 90 = horizontal à frente; 180 = para cima; 190 = ligeiramente
além do vertical. A integração deve confirmar a geometria nessa convenção;
não interpretar 190 como uma segunda passagem pela área diretamente abaixo.
O alcance começa na boca, deslocada à frente do corpo. Medir o corredor
seguro com hurtboxes reais, não só pela ausência de pixels de fogo.

A altura de voo precisa permitir que o maior oponente passe **em pé** por
baixo. Pushboxes horizontais devem respeitar a separação vertical; caso
contrário, a mecânica de avanço por baixo não funcionará mesmo com a arte
correta. Travar o facing durante o especial: cruzar por baixo não deve virar
o feixe para o outro lado ou reiniciar a varredura. Iniciar fogo só após
atingir a altura segura e interpolar a direção a cada passo de física, não
apenas quando trocar um dos 12 desenhos do corpo. Colisão e dano pertencem
à integração, não foram testados em combate por esta produção de sprites.

Artes e dados de produção em `output/dragao-v1/`; destino final reservado:
`public/assets/lutadores/dragao/base-v1/`. Células e contagens serão registradas
no manifesto. Mecânicas, hitboxes, registro e teste de combate pertencem à
integração, conforme o processo do projeto. Não registrar lutador incompleto.

## Entrega das artes

23 folhas finais, 153 quadros: 21 ações do corpo (141 quadros) e dois efeitos (12 quadros).
Arquivos em `public/assets/lutadores/dragao/base-v1/`; cinco colunas por folha, índices começando em zero.
Células vazias ao final são transparentes. Ler o tamanho por ação no manifesto; não carregar como 256×256.

| Arquivo | Quadros | FPS nominal | Célula |
| --- | ---: | ---: | --- |
| `idle.png` | 4 | 8 | 512×384 |
| `walk-forward.png` | 8 | 8 | 512×384 |
| `walk-backward.png` | 8 | 8 | 512×384 |
| `dash-forward.png` | 5 | 18 | 512×384 |
| `dash-back.png` | 4 | 18 | 512×384 |
| `block-high.png` | 4 | 10 | 512×384 |
| `light-punch.png` | 6 | 14 | 512×384 |
| `heavy-kick.png` | 6 | 12 | 512×384 |
| `crouch.png` | 5 | 20 | 512×384 |
| `block-low.png` | 4 | 10 | 512×384 |
| `heavy-punch.png` | 8 | 14 | 512×384 |
| `low-kick.png` | 16 | 18 | 512×384 |
| `jump.png` | 8 | 10 | 512×384 |
| `jump-punch.png` | 5 | 14 | 512×384 |
| `jump-kick.png` | 6 | 14 | 512×384 |
| `special-charge.png` | 6 | 14 | 512×384 |
| `special.png` | 12 | 10 | 512×384 |
| `special-return.png` | 6 | 12 | 512×384 |
| `hit-high.png` | 6 | 12 | 512×384 |
| `stunned.png` | 4 | 6 | 512×384 |
| `knockdown.png` | 10 | 10 | 512×384 |
| `fire-short.png` | 6 | 12 | 256×192 |
| `fire-beam.png` | 6 | 14 | 1024×256 |

O corpo em pé tem 200 pixels de altura anatômica. Agachamento, voo e queda mantêm a escala dos membros; não normalizar cada caixa visual para 200 pixels.
A guarda de produção é `referencia/dragao/guarda-producao-v1.png`, consolidada do idle. A base inicial continua preservada separadamente.

- [Player de todas as ações](../output/dragao-v1/revisao.html), com pausa, velocidade e controle quadro a quadro.
- [Composição do fogo](../output/dragao-v1/fogo-preview.html), com cuspida e ângulos do especial.
- [Contrato de integração](../output/dragao-v1/claude-integration.json) e [pontos de emissão](../output/dragao-v1/emission-guide.json).
- [Prompts, fontes e fichas](../output/dragao-v1/prompt-index.md), incluindo mapas de seleção das sequências corrigidas.
- [Validação dos PNGs](../output/dragao-v1/validation.json) e [validação do player](../output/dragao-v1/browser-validation.json).

`heavy-kick` é a cuspida curta; `heavy-punch` é o soco baixo. O chute real está na voadora `jump-kick`.
O soco em pé alterna B/direito no quadro 1 e A/esquerdo no 3. Soco baixo tem contato 3–4 e retorna abaixado.
O giro de cauda tem contato único em 6–7. Seus tempos absolutos são `[80,80,80,80,40,40,40,40,40,40,40,40,60,60,60,60]` ms (880 ms no total); substituem o FPS nominal, não se somam a ele.

Decolagem: 0–2 apoiado, 3–5 no ar; manter o último quadro até atingir a altura segura antes de emitir fogo.
Varredura: todos os 12 quadros aéreos, ângulos 30,45,60,75,90,105,120,135,150,165,180,190 graus na convenção acima.
Retorno: 0–2 no ar, aterrissagem no 3, amortecimento e guarda em 4–5. Desligar o fogo antes do retorno.
A textura do fogo tem animação própria, sem criar golpes extras nem prolongar automaticamente as janelas do corpo.
Cuspida: origem local do efeito `[220,96]`, comprimento máximo visual 120 px. Feixe: origem `[1000,128]`, comprimento visual até 920 px; a integração determina extensão até a borda da arena.

Cada fonte e a folha montada foram inspecionadas. Correções foram redesenhadas com a ferramenta integrada de imagens; scripts só extraem, alinham, redimensionam uniformemente a figura inteira por fonte e montam.
Tentativas descartadas estão preservadas fora do manifesto final. Não reaplicar uma fonte antiga por cima das correções nem usar o nome de ação interno de uma pasta de estudo como arquivo final.

**Entrega de arte concluída; integração de gameplay pendente.** Nenhum JSON de lutador, dano, hitbox, colisão, registro ou Academia foi alterado. A prévia não equivale a teste de combate.
Verificar novamente os arquivos com `python scripts/dragao_v1.py verify`.
