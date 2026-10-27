# Pedidos de arte para o Codex

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
| `low-kick.png` | Chute baixo | 6 a 8 | Rápido. Corpo baixo, perna varre rente ao chão; o pé de ataque estica no 3º ou 4º quadro e volta à guarda. O motor não move o personagem. |
| `jump-kick.png` | Voadora | 6 | Desenhada **no ar**, sem pé no chão. Corpo em diagonal para baixo e para a frente, uma perna esticada liderando, a outra dobrada. O motor começa no primeiro quadro de chute e faz o mergulho; não desenhar a trajetória dentro da célula. |
| `jump-punch.png` | Soco no ar | 5 | No ar, joelhos recolhidos, soco para a frente e um pouco para baixo. |

Enquanto não chegam, o jogo usa o chute forte para a voadora e o soco rápido
no ar; o chute baixo não sai.
