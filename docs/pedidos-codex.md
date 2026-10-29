# Pedidos de arte para o Codex

## Entrega 29/10/2026: vítimas estunadas

Entregues `stunned.png` nas seis pastas principais: Urubu, Almirante, Saci, Cartola, Bira e Galo. Quatro quadros de tontura com X, estrelas e espirais sobre a cabeça, 6 FPS sugeridos, loop. Este pedido retoma as artes antes adiadas. Falta registrar/ligar a ação ao atordoamento na lógica pelo Claude. Guia: `docs/estunados-v8.md`; manifesto: `output/stun-v8/claude-integration.json`; prévias: `output/stun-v8/revisao.html`.

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
