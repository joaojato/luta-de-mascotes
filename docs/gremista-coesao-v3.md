# Gremista — revisão de coesão e conjunto completo

Atualização posterior: caminhadas e ataque rápido foram substituídos
pela [revisão v4](gremista-passos-v4.md). Os demais arquivos desta revisão
permanecem vigentes. Não reaplicar essas três folhas v3 sobre a correção.

Pedido de 02/11/2026: priorizar excelência, corrigir crescimento/distorção
entre quadros e ações, criar espera animada e verificar ações ausentes.
Referência de identidade: `referencia/gremio/base-manga-longa-cabelos-pretos-v8.png`.
Manter a manga longa inteira azul/preta/branca, físico baixo e robusto,
rosto pequeno, cabelo/costeletas/sobrancelhas/bigode/barba pretos,
chapéu marinho com faixa azul e penas brancas curtas, renda branca,
luvas/botas marrons, duas pederneiras e hanger de tamanho médio.

Auditoria inicial: idle, caminhadas, salto, defesas, reação, atordoamento,
queda e especial usavam um quadro provisório. Agachar e defesa baixa
reutilizavam a pose do corte. Jump-punch existia apenas como arte e
jump-kick não tinha fonte. Dashes também não possuíam arte própria.

Produzir uma ação por chamada, sempre com a mesma guarda de identidade.
Corpo em pé de aproximadamente 190 px; célula 640×384, cinco colunas,
origem `[320,360]`. Fonte inteira e quadros montados precisam ser revisados.
Escala uniforme por ação, sem normalizar cada quadro pelo seu retângulo,
sem esticar cabeça/membros para esconder variação. Altura total da caixa
não serve para medir anatomia: chapéu, lâmina, postura e voo alteram a caixa.

Braço A direito mantém espada (exceto ao embainhar para as pistolas).
Braço B esquerdo livre/em guarda. Perna A direita próxima da câmera e
recuada à direita; B esquerda distante e avançada à esquerda na base.
Manter as mesmas ligações aos quadris/ombros durante toda a ação.
Lâmina hanger e cabos das pistolas não crescem nem trocam de mão.

Coreografia dos golpes preservada do pedido: dois cortes curtos rápidos;
descendente forte seguido de pequeno avanço; dois disparos com guarda
das pistolas demorada; corte agachado na canela; golpes aéreos de espada.
Especial do próprio Gremista é gesto de chamada do Flecha Negra.

Guarda, caminhada, dashes, agachar, salto, bloqueios e reações seguem as
fases do Urubu vigente. Bloqueios mantêm proteção no final, agachamento
termina profundo, salto usa trajetória do motor, queda termina no chão.

Fontes, prompts, guias, fichas, extrações, prévias e revisão:
`output/gremista-coesao-v3/`. PNGs finais em
`public/assets/lutadores/mosqueteiro-gremio/coesao-v3/`.
Metadados visuais serão conferidos contra os arquivos finais. Não alterar
dano, velocidades, regras de defesa ou comportamento do Flecha Negra.

## Entrega de 02/11/2026

Conjunto montado, inspecionado e vinculado em
`src/game/lutadores/mosqueteiro-gremio.json`: **19 ações / 122 quadros**.
Não há ação provisória usando um único quadro da guarda.

| Ação | Quadros | FPS | Loop |
|---|---:|---:|---|
| idle | 4 | 8 | sim |
| walk-forward / walk-backward | 8 cada | 8 | sim |
| dash-forward / dash-back | 5 / 4 | 18 | não |
| crouch | 5 | 20 | não; sustenta baixo |
| jump | 8 | 10 | não |
| block-high / block-low | 4 cada | 10 | não; sustenta proteção |
| hit-high | 6 | 12 | não |
| stunned | 4 | 6 | sim |
| knockdown | 10 | 10 | não; termina caído |
| special | 6 | 12 | não |
| light-punch | 8 | 20 | não |
| heavy-punch | 8 | 14 | não |
| shot | 12 | 12 nominal | duração própria abaixo |
| low-kick | 6 | 16 | não; termina baixo |
| jump-punch / jump-kick | 6 cada | 14 | não; inteiramente aéreos |

Pistolas: durações por quadro em ms
`[60,70,60,80,80,130,170,190,190,160,140,100]`, total 1430 ms.
Disparos desenhados em 3 e 4; embainha a espada antes de sacar, guarda
as duas pistolas separadamente e recupera a mesma hanger ao final.
Os golpes leves contatam em 2 e 5; os demais cortes em 2–3.
O forte desenha o passo depois do corte, em 4–5.

### Halo e escala

As fontes antigas tinham pixels de baixa opacidade fora do contorno e
matte claro/cinza, produzindo a aura. As fontes novas foram geradas com
a ferramenta de imagens embutida, uma ação por chamada, sobre magenta
opaco ausente no personagem, conforme a sugestão do usuário. O recorte
remove apenas a cor chave, sem adicionar branco, desfocar ou corroer a
roupa e as penas. Os PNGs finais têm alfa exclusivamente 0/255 e foram
comparados sobre fundos claro e escuro. Exemplos: `halo-before.png` e
`halo-after.png` na pasta de produção.

Cada ação recebe uma única escala uniforme, com nearest-neighbor.
A altura do retângulo total não foi usada como medida do corpo:
agachar e dobrar joelhos naturalmente encurtam a silhueta. Como régua,
chapéu até cinto em poses neutras fica aproximadamente em 95–103 px;
a hanger fica em torno de 67–75 px e a bota em perfil, 45–51 px.
Não houve escala independente por membro ou quadro.

A guarda exata entra somente nos estados explicitamente de guarda.
O corte baixo começa/termina no agachamento sustentado; os dois ataques
aéreos começam/terminam na guarda aérea já revisada. Os quadros de
contato permanecem próprios, sem substituição por pose de espera.
Fontes com pontas cortadas ou recuperação errada da espada foram
rejeitadas e redesenhadas antes da montagem.

### Arquivos e limites da verificação

- Prévia com seleção de ação, pausa, velocidade e avanço quadro a quadro:
  `output/gremista-coesao-v3/revisao.html`.
- Fontes, prompts completos, extrações, configurações de alinhamento,
  contatos claros/escuros e GIFs: subpasta de cada ação em `output/`.
- Manifesto com dimensões, contagens, duração, caixas visuais, hashes e
  observações: `public/assets/lutadores/mosqueteiro-gremio/coesao-v3/manifest-art.json`.
- Validação reproduzível: `python scripts/gremista_coesao_v3.py finalize`.
- Integração: `output/gremista-coesao-v3/integration-report.json`, com
  backup anterior em `runtime-before.json`.

A integração atualiza arquivos, quadros, FPS, repetição e duração visual
das pistolas; acrescenta dashes e ataques aéreos antes ausentes.
Preserva os danos, velocidades, configuração do NPC, caixas e avanço
dos golpes antigos. Os ataques aéreos novos têm caixas iniciais de
registro, a refinar na Academia. O runtime continua com o gatilho de
projétil existente no quadro 3; a arte também mostra o segundo disparo
no quadro 4. A sincronização dos dois projéteis e o avanço do forte em
4–5 pertencem à integração de combate, sem alterações nesta revisão.
Não foi realizada partida nem inspeção na Academia; PNG/GIF e testes
de dados não substituem essa conferência. A revisão visual é técnica,
sem presumir aprovação do usuário.

Não reaplicar as fontes antigas de `ataques-v1/` sobre esta revisão.

Verificação de projeto: `npm run check` passou (TypeScript, **303 testes**
em 31 arquivos e build). O build mantém os avisos já existentes de atlas
de tiles não resolvido e tamanho de bundle. O JavaScript da prévia passou
em `node --check`. Hashes das referências, prompts e configurações em
`output/gremista-coesao-v3/reference-hashes.json`.
