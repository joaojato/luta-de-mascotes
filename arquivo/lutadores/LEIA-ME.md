# Lutadores guardados

Fora do jogo e da Academia desde 27/10/2026, a pedido do João. Nada aqui é
carregado pelo Vite nem entra no build. Cada pasta tem o JSON (`lutador.json`
ou `skin.json`) e as sheets (`sprites/`).

| Pasta | O que é | Por que saiu |
|---|---|---|
| `jiujitsu-fighter/`, `green-boxer/`, `red-brawler/` | Os três lutadores de amostra do Vibe Fighter do Chong-U (Regra do Placeholder) | Não são nossos; não podem ir para link público. |
| `cartola-arte-anterior/` | Skin `base` do Cartola: o pacote de arte anterior | O João não gostou (quebrada). O Cartola no padrão Urubu continua. |
| `bira-arte-anterior/` | Skin `base` do Bira (id interno `cachorro`): o pacote de arte anterior | O João não gostou (quebrada). O Bira no padrão Urubu, com patada e mordida, continua. |
| `urubu-perfil/` | Skin `costas` do Urubu (o modelo de perfil antigo) | O João não gostou. O Urubu de frente continua. |

## Como trazer um de volta

1. Mover `sprites/` de volta: amostras para `public/assets/lutadores/_amostra-<nome>`;
   Urubu de perfil para `urubu/costas`; arte anterior do Cartola para
   `cartola/base` e do Bira para `cachorro/base`.
2. Amostras: mover `lutador.json` para `src/game/lutadores/<id>.json` e
   importar em `src/game/lutadores/index.ts`, na lista `LUTADORES`. Skins
   (`skin.json`): colar de volta no fim de `skins` no JSON do mascote.
3. `npm run check`.
