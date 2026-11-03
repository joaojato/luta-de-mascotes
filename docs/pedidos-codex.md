# Pedidos de arte para o Codex

## Entrega: Urubu ? pesado com abertura das duas asas

Aplicado em `urubu.json`: `frente/heavy-wing-spread-v1.png`, 20 quadros a
16 FPS, c?lulas 512?256. Asas longas com alcance para os dois lados;
contato em 6?8 e onze quadros de recolhimento sem acerto. Guarda, escala,
paleta e dano preservados. Guia: [urubu-asas-v1.md](urubu-asas-v1.md).
Pr?via: `output/urubu-asas-v1/revisao.html`. Validado no jogo e com
`npm run check` (172 testes).

## Entrega: Porco — terno verde e golpes próprios

Conjunto de 21 animações de corpo (134 quadros), produzido uma ação por vez
a partir de `referencia/porco/base-terno-v2.png`. Preserva terno verde com
mangas rasgadas, colete/gravata, calção branco e identidade do porco.
Pesado é mordida; baixo tem corrida em galope separada e salto de costas com
coice; especial tem preparo, emissão e jato de vômito verde-oliva cartunesco
separado (seis quadros). Restante acompanha os guias atuais do Urubu.

Assets: `public/assets/lutadores/porco/terno-v1/`, com `manifest.json` e
`emission-guide.json`. Guia completo: [porco-animacoes-v1.md](porco-animacoes-v1.md).
Prévia: `output/porco-v1/revisao.html`; fontes, prompts, contatos, hashes e
validação na mesma pasta. Verificação: `python scripts/porco.py verify`.
Arte concluída e conferida; integração do lutador e mecânicas ficam com o
responsável pela lógica. Não há registro ou teste de combate nesta entrega.

## Entrega 29/10/2026: Bahia — golpes próprios e expressões

Artes produzidas separadamente a partir da primeira base aprovada: mão aberta descendente, laser dos olhos, preparação e emissão do Bora Bahêa; projétil de laser e texto separados. Caminho: public/assets/lutadores/bahia/base/. Expressões muito bravas nos ataques e fofas na guarda. Guia, contagens e integração: [bahia-golpes-v11.md](bahia-golpes-v11.md). Fontes, prompts, hashes e prévias: output/bahia-v11/. Não registrar o personagem incompleto; demais animações e mecânicas seguem pendentes.

Antes de produzir: ler [produção de personagens](producao-personagens.md). Uma geração por personagem e por ação, guarda aprovada da própria skin anexada e comparação de cada quadro com a base antes de aplicar. Este pedido define a tarefa; o guia define o controle de identidade, cor, estilo, anatomia e entrega.

## Aberto em 29/10/2026: dash (avanço rápido)

**Artes entregues pelo Codex:** dash-forward.png, dash-back.png e jump-punch.png dos seis, produzidos individualmente; 18 folhas / 84 quadros em public/. Guia de integração: [movimentos-v10.md](movimentos-v10.md); hashes, caixas visuais e prévias em output/movimentos-v10/. Registro e validação no jogo continuam com Claude. Os detalhes do pedido original abaixo ficam preservados.

Mecânica nova pedida pelo João: dois toques rápidos no direcional fazem o
lutador dar um dash. É a porta de entrada da guarda perfeita (defender no
tempo certo deixa o atacante tonto por pouco tempo). O motor move o
personagem; **não desenhar deslocamento dentro da célula**: o corpo fica no
eixo do `idle` (Regra do Eixo), quem anda é o motor.

Para os seis, cada um na pasta da skin que está na seleção (`urubu/frente`,
`almirante/base`, `saci`, `cartola/urubu-v1`, `cachorro/urubu-v1`,
`galo/urubu-v1`). Partir da guarda aprovada de cada um, como na tontura v9:
uma referência por lutador, nunca um atlas coletivo.

| Prioridade | Arquivo | Ação | Quadros | Como desenhar |
|---|---|---|---|---|
| 1 | `dash-forward.png` | Dash para a frente | 5 | Quadro 0 é a guarda. 1 a 3: arrancada baixa, tronco inclinado para a frente, passada longa, braços ainda em guarda perto do rosto (dali ele precisa conseguir defender). Pés podem subir um pouco, nunca afundar no chão. Poeira pequena no pé de trás, dentro da célula. 4: freada de volta à guarda. Sugestão: 18 FPS. |
| 2 | `dash-back.png` | Dash para trás | 4 | Saltinho curto para trás: tronco recuado, guarda alta protegendo o rosto, pés sobem pouco. Último quadro pousa na guarda. Sugestão: 16 FPS. |
| 3 | `jump-punch.png` | Soco no ar (pendente desde 27/10) | 5 | No ar, joelhos recolhidos, soco para a frente e um pouco para baixo. |

Somando: 12 sheets de dash (6 de cada) e 6 de soco no ar. Se der para fazer
só uma leva agora, é a prioridade 1: o dash para trás pode começar com o
andar para trás acelerado, e o soco no ar já tem quebra-galho.

**Não desenhar** (o Claude resolve com o que já existe):

- Guarda perfeita: pose `block-high` com brilho e a faísca azul do atlas do HUD.
- Atacante pego pela guarda perfeita: a tontura `stunned` que já existe
  (0,8 s, correção do João em 29/10/2026).

Entrega como nas anteriores: arquivos finais em `public/`, guia em `docs/`
e relatório com caixas visuais e hashes em `output/`. O Claude só integra o
que estiver em `public/` com o guia escrito (lição de 29/10/2026).

## Entrega 29/10/2026: interface de rua

HUD e faíscas refeitos no atlas ativo de 1254×1254, preservando os 22 recortes e sockets. Cartões 1 VS 1 / 1 VS CPU substituídos por Urubu contra Galo numa quadra de bairro. Logo transparente 1200×400 em public/assets/branding/luta-de-mascotes-logo.png, pronto para integrar na abertura/menu. Direção explícita do usuário: simples, de rua, sem metálico/medieval.

Coordenadas exatas e detalhes: [identidade-ui-v1.md](identidade-ui-v1.md). Fontes finais, prompts, hashes, backups e prévias: output/identidade-ui-v1/. Nenhuma alteração de TypeScript nesta entrega.

## Entrega 29/10/2026: vítimas estunadas

Entregues `stunned.png` nas seis pastas principais: Urubu, Almirante, Saci, Cartola, Bira e Galo. A v8 foi rejeitada pelo usuário por divergir das bases e substituída pela v9, gerada individualmente com as guardas de cada skin. Quatro quadros, 6 FPS, loop; a ação já está registrada nos JSONs atuais. Guia vigente: `docs/estunados-v9.md`; relatório: `output/stun-v9/report.json`; prévias: `output/stun-v9/revisao.html`. Não reutilizar fontes/prompts da v8. Registro no JSON não substitui conferência do comportamento na Academia e no combate.

O Claude escreve aqui o que a mecânica já espera e ainda não tem arte. O Codex
desenha seguindo o `AGENTS.md` e `docs/mascotes/padrao-artistico.md`, salva
nos caminhos abaixo e avisa. O Claude registra no JSON e confere na Academia
(aba Golpes: ✗ vira ✓ quando a sheet chega).

Formato de toda sheet: células 256×256, 5 colunas, virado para a esquerda,
fundo transparente, mesma escala e mesmo pé no chão do `idle` (Regra da
Régua do Idle). Quadro 0 parte da guarda.

## Aberto em 27/10/2026: golpes novos do catálogo

Para Urubu, Almirante, Saci, Cartola, Bira e Galo, cada um na pasta da skin
que está na seleção (`urubu/frente`, `almirante/base`, `saci`,
`cartola/urubu-v1`, `cachorro/urubu-v1`, `galo/urubu-v1`).

| Arquivo | Golpe | Quadros | O que o motor faz |
|---|---|---|---|
| `low-kick.png` | Chute baixo (Baixo + Chute) | 6 a 8 | Rápido. Corpo baixo, perna varre rente ao chão; o pé de ataque estica no 3º ou 4º quadro e volta à guarda. O motor não move o personagem. |
| `jump-kick.png` | Voadora (Chute no ar) | 6 | Desenhada **no ar**, sem pé no chão. Corpo em diagonal para baixo e para a frente, uma perna esticada liderando, a outra dobrada. O motor começa no primeiro quadro de chute e faz o mergulho; não desenhar a trajetória dentro da célula. |
| `jump-punch.png` | Soco no ar (Soco no ar) | 5 | No ar, joelhos recolhidos, soco para a frente e um pouco para baixo. |

Enquanto não chegam, o jogo usa o chute básico (`heavy-kick`) no lugar do chute
baixo e da voadora, e o soco rápido no lugar do soco no ar. O soco forte
(cruzado `heavy-cross-v2.png`) chegou em 27/10 e já está ligado. O chute baixo
do Almirante é o chute normal por escolha do João: ele não precisa de `low-kick`.

## Ajustes feitos pelo Claude na integração (27/10/2026)

Alinhamento, sem redesenho; conferir se ficou bom aos olhos:

- `urubu/frente/special-thermal-charge-v1.png`, quadro 3: subiu 3 px (a bota
  passava 3 px da linha do chão do idle).
- `urubu/frente/special-meteor-v1.png`, quadro 0: subiu 13 px (as pernas
  pendiam abaixo do chão). Só aparece no primeiro instante da subida.

Próximas entregas: manter as pernas na linha do idle em todo quadro que
começa ou termina no chão (Regra da Régua do Idle, cobrada por teste).

## Atualização 27/10/2026, depois da v3

Já ligados: cruzado (v2), jab duplo (v2), golpes próprios v3 (bengala e Pó de
Arroz, bicada do Urubu, cachimbo do Saci, giro do Galo) e os chutes baixos
clássicos. Ainda faltam: `low-kick.png` do Bira, e `jump-kick.png` e
`jump-punch.png` dos seis. Animação de vítima atordoada segue adiada.

## Entrega de artes: voadoras v7

Atualizacao de stun: seis folhas stunned.png refeitas na v9 apos rejeicao visual da v8. Preservados quatro quadros / 6 FPS nos caminhos ja registrados. Referencias individuais, fontes, prompts, comparacoes e hashes em output/stun-v9/. Guia: docs/estunados-v9.md. Nao reaplicar scripts/stun_v8.py.

Entregues e conferidas: `jump-kick.png`, seis quadros, nas pastas principais de Urubu, Almirante, Saci, Cartola, Bira e Galo. Falta o Claude registrar a ação `jump-kick` e suas caixas no JSON para substituir o fallback terrestre. Sugestão: 14 FPS, contato 0–3, recuperação aérea 4–5. Nenhuma decolagem/aterrissagem ou deslocamento foi desenhado dentro da folha.

Guia: `docs/voadoras-e-iluminacao-v7.md`; entrega com caminhos, caixas visuais e hashes: `output/voadoras-v7/claude-integration.json`; revisão: `output/voadoras-v7/revisao.html`. Também corrigido no caminho ativo o leve do Urubu para combinar paleta e iluminação com o idle. Bahia permanece pendente por recusa da ferramenta; não foi registrado. Socos no ar não fazem parte desta entrega.

Ligadas pelo Claude em 28/10/2026: `jump-kick` nos seis JSONs, 14 FPS, acerto nos quadros 0 a 3 só no pé de ataque. Ainda faltam: `low-kick.png` do Bira, `jump-punch.png` dos seis e a voadora do Bahia.

Chutes curtos no desenho (28/10/2026): a ponta do pé fica a só 16 a 29 px da frente do corpo no chute básico do Bira (22), no chute básico do Cartola (29), no chute baixo do Galo (16) e no do Urubu (29), contra 31 a 45 px do soco rápido. Para o chute valer pelo alcance, a perna precisa esticar mais à frente no quadro de contato.

## Aberto em 29/10/2026: Esquadrão (Bahia), o resto do corpo

Ele já está na seleção com o que chegou na v11; o resto roda parado na
guarda. Ler [produção de personagens](producao-personagens.md) e
[padrão artístico](mascotes/padrao-artistico.md). Partir sempre de
`referencia/bahia/referencia-estilo-urubu-v1.png`; expressão fofa no
movimento, muito brava no ataque (ver `docs/mascotes/bahia.md`). Células
256×256, 5 colunas, virado para a esquerda, fundo transparente, mesma escala
e mesma linha de bota do `guard-reference.png` (pairando, botas penduradas).

Ordem, para ele parar de parecer estátua:

1. `idle` (4 a 6 quadros): pairando, capa ondulando, sobe e desce pouco.
2. `walk-forward` e `walk-backward` (6 a 8): flutua, sem passos.
3. `hit-high` (4 a 6) e `knockdown` (8 a 10): na queda ele cai no chão de verdade.
4. `light-punch` (6): soco rápido próprio.
5. `block-high`, `block-low`, `crouch`, `jump`, `stunned`, `dash-forward`, `dash-back`.
6. `low-kick`, `jump-punch`, `jump-kick`: golpes reais com as pernas.
7. `portrait.png` (busto) no lugar do recorte provisório.

### Atualização Bahia v12 — 29/10/2026

O corpo já tem 20 comandos com folhas próprias, sem usar a guarda como
substituto de movimento. Destes, 19 foram refeitos e revisados nesta produção
(110 quadros); `heavy-punch` ainda usa a arte anterior, pois a ferramenta de
imagens recusou oito tentativas de redesenho. Retrato em busto continua pendente.
Detalhes e regras de montagem em [bahia-animacoes-v12.md](bahia-animacoes-v12.md).
Prévia local: `output/bahia-v12/revisao.html`; verificação dos arquivos:
`python scripts/validate_bahia_v12.py`. Não considerar a revisão toda concluída
enquanto o corte descendente não for redesenhado e inspecionado.

## Aberto em 29/10/2026: torcida dividida

Arquibancada vazia, torcedores com camisa em cor chave, bandeira, fumaça,
chama e as fileiras medidas. Contrato completo, com formatos e tamanhos, em
[torcida-dividida.md](torcida-dividida.md), seção Arte.

## Entrega de artes — Mosqueteiro e Gavioes da Fiel, 30/10/2026

34 folhas finais / 212 quadros em `public/assets/lutadores/mosqueteiro/base-v1/`:
14 acoes do Mosqueteiro e cinco para cada um dos quatro NPCs. Guia completo:
[mosqueteiro-animacoes-v1.md](mosqueteiro-animacoes-v1.md). Previa quadro a
quadro: `output/mosqueteiro-v1/revisao.html`. Fontes, prompts, fichas e
tentativas rejeitadas ficam na mesma pasta de producao.

Integrar pelo `claude-integration.json` junto dos PNGs. **Ler dimensoes POR
FOLHA**: Mosqueteiro 640x320, ataques aereos 640x384; NPC principal 512x320,
gorro/bone 320x256 e boina 256x256; sempre cinco colunas. Nao carregar tudo
como 256x256. Nao registrar o lutador com reacoes/queda ainda nao desenhadas.

Pontos essenciais: duas estocadas com recuo apos CADA contato; mosquete
dispara no quadro 9 a 16 FPS (preparo 0,5625 s, sugestao 26 de dano contra
19 do Almirante). Bloqueio baixo comeca abaixado; cotovelada e estocada baixa
terminam em pe. Golpes aereos usam a espada. Especial: somente acerto real
do Gavião maior libera os tres ataques sequenciais imbloqueaveis dos menores;
nao liberar em erro, bloqueio ou apenas ao terminar animacao. Todos atacam
no ar e pousam apenas no retorno separado, depois da sequencia.

Artes e previa verificadas; logica, balanceamento, hitboxes e teste em
combate/Academia ainda pertencem a integracao. Sem alteracoes de runtime
nesta entrega. Validar PNGs: `python scripts/mosqueteiro_v1.py verify`.

## Entrega de artes — Dragão do Atlético Goianiense, 30/10/2026

23 folhas / 153 quadros em `public/assets/lutadores/dragao/base-v1/`: 21 ações do corpo e dois efeitos de fogo. Produção individual por ação, no padrão arcade do Urubu. Guia e tabela: [dragao-animacoes-v1.md](dragao-animacoes-v1.md).

Prévia quadro a quadro: `output/dragao-v1/revisao.html`; composição dos efeitos: `output/dragao-v1/fogo-preview.html`. Fichas e prompts preservados junto das fontes. Integrar pelo `claude-integration.json` e `emission-guide.json` junto dos PNGs.

Ler células por folha: corpo 512×384, cuspida 256×192, feixe 1024×256, sempre cinco colunas. Soco alterna braços; soco baixo termina abaixado. Giro de cauda: contato 6–7 e tempos absolutos próprios de 880 ms. Especial: decola, mantém altura para o maior oponente passar em pé por baixo, varre fogo contínuo da boca e só então aterrissa. Travar facing, permitir passagem vertical nas pushboxes e interpolar feixe a cada passo de física.

Artes e players verificados; mecânicas, balanceamento, hitboxes e teste em combate/Academia ainda pertencem à integração. Sem alterações de runtime nesta entrega. Validar PNGs: `python scripts/dragao_v1.py verify`.

## Aberto em 31/10/2026: cartões dos torneios, da dificuldade e troféu

O jogo já funciona com cartões provisórios (moldura e texto). Cada arte que
chegar entra no lugar sem mudar a tela; o Claude registra a textura no Boot.
Identidade de rua de [identidade-ui-v1.md](identidade-ui-v1.md): moldura
clara sobre carvão, cores chapadas, texto grande com sombra vermelha, sem
metálico e sem dourado ornamental. Molde e proporção de
`public/assets/mode-cards/mode-1vcpu-card.png` (1392×1130), texto embutido.

| Arquivo | Texto no cartão | Ideia |
|---|---|---|
| `mode-cards/torneio-mata-mata.png` | MATA-MATA | chaveamento pintado no muro da quadra, dois mascotes se encarando |
| `mode-cards/torneio-pontos-corridos.png` | PONTOS CORRIDOS | tabela riscada a giz no muro, vários mascotes na arquibancada |
| `mode-cards/dificuldade-facil.png` | FÁCIL | o mesmo mascote tranquilo, quadra vazia |
| `mode-cards/dificuldade-medio.png` | MÉDIO | o mesmo mascote em guarda, quadra com gente |
| `mode-cards/dificuldade-dificil.png` | DIFÍCIL | o mesmo mascote furioso, quadra lotada |
| `ui/trofeu.png` | sem texto | taça de várzea, transparente, 512×512; pode ser prateada ou pintada, nunca dourada brilhante |

## Mosqueteiro Gaúcho (Grêmio): o resto do corpo (02/11/2026, entregue na coesão v3)

O lutador já está no jogo com os quatro golpes de `ataques-v1/`; o resto usa a
guarda parada. Mesma base aprovada (manga longa), mesmo formato dos golpes
(células 640×384, cinco colunas, origem 320,360, pé na linha 360, virado para
a esquerda), uma geração por ação partindo da guarda (`docs/producao-personagens.md`,
`docs/mascotes/padrao-artistico.md`). Estilo agressivo, cara de bravo.

Por prioridade:
1. `idle` (4 quadros, guarda respirando).
2. `walk-forward` e `walk-backward` (8 quadros cada).
3. `hit-high` (4 a 6) e `knockdown` (8 a 10, cai e fica no chão).
4. `crouch` (4 a 6), `block-high` e `block-low` (4 a 6).
5. `jump` (8, no estilo dos outros: prepara, sobe, desce, pousa).
6. `jump-punch` e `jump-kick` (6 cada; já há fonte em `output/gremista-v1/`).
7. `special` (6 a 8): o sinal que chama o Flecha Negra (assobio, braço erguido).
8. `stunned` (4, em loop) e `dash-forward` / `dash-back` (4 a 6).
