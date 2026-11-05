# Biriba, acompanhante do Bira

## Correção de 04/11/2026 — NPC temporário, não acompanhante fixo

Esta correção explícita do usuário substitui o acompanhamento descrito no
histórico abaixo. Biriba não fica mais andando no fundo nem reaparece entre
rounds. A antiga máquina `BiribaMotion` de seguir/latir foi removida.

Na entrada da luta, ele vem andando pela lateral do próprio Bira, para para
o carinho e retorna andando pela mesma lateral enquanto Bira levanta/vira.
As folhas idle/walk existentes são reutilizadas, sem redesenhar o Biriba.
`biribaEntrada.ts` descreve os tempos e o trajeto; `BiribaCena` só é visível
durante esse encontro. P1 e P2 espelham o encontro inteiro, inclusive no
espelho Bira × Bira. A linha de apoio é a arena para permitir contato real.

No combate, entra apenas quando chamado pelo Bruto: usa os balões da folha
aprovada `biriba-voando.png`, vindo de fora da lateral atrás do dono,
subindo na entrada, oscilando durante o sobrevoo e ganhando altura na saída.
`carrierFlight` ativa esse trajeto só para a chamada do Bira. Continua um
Biriba por vez; alvo salvo, cocô, dano e regras de defesa permanecem os mesmos.
Não é registrado como lutador selecionável e não tem hitbox corporal própria.

Fonte corporal do Bira, prompt, referências/hashes, montagem, contato de mão
e cabeça, APNG e prévia composta em `output/bira-entrada-v1/`. A prévia
composta é montagem offline, não captura de uma partida. A arte do Bira
usa o anchor e o idle ativos; Biriba permanece quadrúpede com NF/FF/NH/FH.

## Histórico anterior (substituído quanto ao acompanhamento)

Pedido do usuário: cachorro de cenário sobre quatro patas, acompanhando o Bira
de um lado para o outro e parando às vezes para latir, sem som.

A imagem enviada define a identidade: pelagem cinza, orelhas longas escuras,
focinho claro, estrela branca no olho, camisa preta e branca listrada.
O acabamento segue o pixel art do Urubu; a exceção solicitada é a anatomia
canina quadrúpede, com movimentos próprios de cachorro, sem guarda de lutador.
Não usar escudo, patrocinador, letras ou efeitos na arte corporal.

## Anatomia

Na base voltada à esquerda, NF é a pata dianteira próxima da câmera, sob a
manga visível à direita; FF é a dianteira distante, à esquerda. NH é a traseira
próxima, a mais à direita; FH é a traseira distante, menor e à esquerda de NH.
Na caminhada, NF/FH e FF/NH alternam o avanço. A identidade permanece ligada
ao mesmo ombro/quadril durante a sobreposição. Espelhar o personagem inteiro
para acompanhar à direita; nunca espelhar uma pata ou quadro isolado.

## Arquivos e comportamento

Destino: `public/assets/cenarios/biriba/`. Células RGBA 256×256, cinco colunas,
linha das patas em y=232; escala de exibição 0,5.

| Folha | Quadros | FPS | Uso |
|---|---:|---:|---|
| idle.png | 4 | 6 | Espera, respiração, rabo e piscada |
| walk.png | 4 | 8 | Acompanha horizontalmente, ciclo de caminhada |
| bark.png | 6 | 10 | Para, ergue focinho, abre e fecha a boca |

`biribaCena.ts` desenha o cachorro atrás dos lutadores, 60 px acima da origem
lógica deles (que inclui espaço transparente abaixo dos pés), com distância
lateral de 130 px, em coordenadas do cenário. Ele aparece para cada jogador que usa
o Bira (id interno `cachorro`), inclusive no lado P2. Em Bira × Bira, cada um
tem seu acompanhante. Acompanha o X com atraso e distância lateral, permanece
visível nos limites da câmera e reinicia no começo de cada round.
`biribaMotion.ts` controla caminhada, espera e pausas de latido; não copia o
Y dos saltos. O cachorro não tem corpo físico, hitbox, som ou ações de combate.

Uma ação por geração, com a base própria anexada. Fontes, prompts, guia técnico,
contatos e GIFs individuais ficam em `output/biriba/`. A primeira caminhada
foi separada como rejeitada por sobreposição de patas difícil de conferir.
Montagem: `python scripts/biriba.py <ação>`, inspeção visual, depois
`python scripts/biriba.py <ação> --install "notas da revisão"`.
O script só extrai, escala uniformemente a ação e alinha as figuras.

As duas correções individuais da caminhada saíram em resoluções de geração
diferentes. A conversão da imagem inteira usa a largura da silhueta superior
da cabeça, antes de camisa e rabo entrarem na medida, para igualar a resolução
das fontes. Não ajustar cabeça ou membros separadamente, nem usar a altura
de uma pata levantada como régua. A montagem final usa uma escala comum e
registra as conversões em `walk-independent-source-calibration.json`.

## Validação da entrega

Espera, caminhada e latido foram inspecionados na fonte e nos quadros montados.
`python scripts/biriba.py verify` confere hashes, RGBA, grade, margens e células
vazias, gravando o manifesto junto das folhas finais. O teste no navegador
confirmou acompanhamento nos dois sentidos, troca para o latido, ausência
quando nenhum jogador usa o Bira, presença em P2 e dois acompanhantes no
espelho. As três imagens carregaram com HTTP 200, sem exceções de JavaScript.
Captura: `output/biriba/in-game.png`; dados: `browser-validation.json` na mesma
pasta. Typecheck, 161 testes e build passaram; os avisos anteriores do atlas
de tiles e tamanho do bundle continuam fora desta alteração.
