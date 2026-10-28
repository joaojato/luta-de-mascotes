# Cenários guardados

Fora do jogo desde 27/10/2026, a pedido do João: o Estádio é o nosso cenário.
Nada aqui é carregado pelo Vite nem entra no build.

| Pasta | O que é | Por que saiu |
|---|---|---|
| `rooftop/` | Os dois telhados do Vibe Fighter do Chong-U (Twilight e Sunset) e o atlas de props do Twilight, que nunca foi usado | Não são nossos (Regra do Placeholder); não podem ir para link público. |

## Como trazer de volta

1. Mover os PNGs para `public/assets/backgrounds/`.
2. Recolocar as duas entradas em `STAGE_DEFINITIONS` (`src/game/stageConfig.ts`),
   como estavam no commit `f778082`.
3. `npm run check`.
