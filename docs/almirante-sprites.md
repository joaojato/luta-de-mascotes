# Almirante: geração e conferência das sprites

Geradas em 09/10/2026 com a ferramenta integrada `image_gen`, usando o Green Boxer como referência de movimentos e `referencia/almirante/referencia-v1.png` como identidade. O chute usa o Red Brawler como referência complementar. Nenhum crédito do Spriterrific foi usado.

Arquivos finais: `public/assets/lutadores/almirante/base/`. Registro: `src/game/lutadores/almirante.json`. Quatorze ações, com arquivos próprios para preparação e execução do especial.

A montagem usa células de 256×256, cinco colunas, chão em y=228 e o primeiro quadro do idle como início idêntico de cada ação. O encaixe de eixo usa apenas deslocamento, sem redimensionar quadros individualmente. Quadros aéreos do salto preservam o deslocamento vertical da referência. A queda permanece inteira na célula; o importador agora limita o deslocamento horizontal para não cortar a bota ou invadir o vizinho.

Correções desta rodada: remover linhas de grade do idle; refazer defesa alta para levantar os dois antebraços; ajustar janelas ativas do soco aos quadros realmente estendidos; conferir transparência, contagem, células vazias, primeiro quadro e sobras por quadro.

A ultimate da caravela e o agarrão continuam como ideias do GDD. O especial desta entrega é o combo do Green Boxer.

## Prompts usados

### Idle

Trocar o Green Boxer pelo Almirante da referência, sem corvo, símbolos ou armas; conservar as 12 poses, orientação para esquerda, escala e posição dos pés, em cinco colunas e três linhas, com fundo transparente e sem divisórias. Correção: remover somente as linhas de grade e as franjas verdes, conservando figuras, poses e posições.

### walk-forward

```text
Replace ONLY the Green Boxer in image 1 with the admiral from image 2. Image 1 is the exact walk-forward pose and motion template; image 2 locks identity, clothes and scale. Preserve all 8 poses in reading order, left facing, same limb angles and foot placement. First frame must be the admiral idle guard from image 2. Black tricorn, brown beard, black long coat with silver trim and shoulder fringes, red lining, grey waistcoat and trousers, red boot cuffs, bare fists. Production pixel art sheet, 5 columns and 2 rows, 8 isolated full-body frames, unused cells empty. Consistent head and torso size; planted feet for stationary actions; crouching bends knees without shrinking anatomy, jumping leaves floor and falling rotates body without resizing. Transparent background with wide clear gaps. Absolutely no grid lines, dividers, text, shadows, green outlines, birds, crosses, weapons or motion effects.
```

### walk-backward

```text
Replace ONLY the Green Boxer in image 1 with the admiral from image 2. Image 1 is the exact walk-backward pose and motion template; image 2 locks identity, clothes and scale. Preserve all 8 poses in reading order, left facing, same limb angles and foot placement. First frame must be the admiral idle guard from image 2. Black tricorn, brown beard, black long coat with silver trim and shoulder fringes, red lining, grey waistcoat and trousers, red boot cuffs, bare fists. Production pixel art sheet, 5 columns and 2 rows, 8 isolated full-body frames, unused cells empty. Consistent head and torso size; planted feet for stationary actions; crouching bends knees without shrinking anatomy, jumping leaves floor and falling rotates body without resizing. Transparent background with wide clear gaps. Absolutely no grid lines, dividers, text, shadows, green outlines, birds, crosses, weapons or motion effects.
```

### crouch

```text
Replace ONLY the Green Boxer in image 1 with the admiral from image 2. Image 1 is the exact crouch pose and motion template; image 2 locks identity, clothes and scale. Preserve all 5 poses in reading order, left facing, same limb angles and foot placement. First frame must be the admiral idle guard from image 2. Black tricorn, brown beard, black long coat with silver trim and shoulder fringes, red lining, grey waistcoat and trousers, red boot cuffs, bare fists. Production pixel art sheet, 5 columns and 1 rows, 5 isolated full-body frames, unused cells empty. Consistent head and torso size; planted feet for stationary actions; crouching bends knees without shrinking anatomy, jumping leaves floor and falling rotates body without resizing. Transparent background with wide clear gaps. Absolutely no grid lines, dividers, text, shadows, green outlines, birds, crosses, weapons or motion effects.
```

### jump

```text
Replace ONLY the Green Boxer in image 1 with the admiral from image 2. Image 1 is the exact jump pose and motion template; image 2 locks identity, clothes and scale. Preserve all 8 poses in reading order, left facing, same limb angles and foot placement. First frame must be the admiral idle guard from image 2. Black tricorn, brown beard, black long coat with silver trim and shoulder fringes, red lining, grey waistcoat and trousers, red boot cuffs, bare fists. Production pixel art sheet, 5 columns and 2 rows, 8 isolated full-body frames, unused cells empty. Consistent head and torso size; planted feet for stationary actions; crouching bends knees without shrinking anatomy, jumping leaves floor and falling rotates body without resizing. Transparent background with wide clear gaps. Absolutely no grid lines, dividers, text, shadows, green outlines, birds, crosses, weapons or motion effects.
```

### block-high

```text
Replace ONLY the Green Boxer in image 1 with the admiral from image 2. Image 1 is the exact block-high pose and motion template; image 2 locks identity, clothes and scale. Preserve all 4 poses in reading order, left facing, same limb angles and foot placement. First frame must be the admiral idle guard from image 2. Black tricorn, brown beard, black long coat with silver trim and shoulder fringes, red lining, grey waistcoat and trousers, red boot cuffs, bare fists. Production pixel art sheet, 5 columns and 1 rows, 4 isolated full-body frames, unused cells empty. Consistent head and torso size; planted feet for stationary actions; crouching bends knees without shrinking anatomy, jumping leaves floor and falling rotates body without resizing. Transparent background with wide clear gaps. Absolutely no grid lines, dividers, text, shadows, green outlines, birds, crosses, weapons or motion effects.
```

### block-low

```text
Replace ONLY the Green Boxer in image 1 with the admiral from image 2. Image 1 is the exact block-low pose and motion template; image 2 locks identity, clothes and scale. Preserve all 4 poses in reading order, left facing, same limb angles and foot placement. First frame must be the admiral idle guard from image 2. Black tricorn, brown beard, black long coat with silver trim and shoulder fringes, red lining, grey waistcoat and trousers, red boot cuffs, bare fists. Production pixel art sheet, 5 columns and 1 rows, 4 isolated full-body frames, unused cells empty. Consistent head and torso size; planted feet for stationary actions; crouching bends knees without shrinking anatomy, jumping leaves floor and falling rotates body without resizing. Transparent background with wide clear gaps. Absolutely no grid lines, dividers, text, shadows, green outlines, birds, crosses, weapons or motion effects.
```

### hit-high

```text
Replace ONLY the Green Boxer in image 1 with the admiral from image 2. Image 1 is the exact hit-high pose and motion template; image 2 locks identity, clothes and scale. Preserve all 6 poses in reading order, left facing, same limb angles and foot placement. First frame must be the admiral idle guard from image 2. Black tricorn, brown beard, black long coat with silver trim and shoulder fringes, red lining, grey waistcoat and trousers, red boot cuffs, bare fists. Production pixel art sheet, 5 columns and 2 rows, 6 isolated full-body frames, unused cells empty. Consistent head and torso size; planted feet for stationary actions; crouching bends knees without shrinking anatomy, jumping leaves floor and falling rotates body without resizing. Transparent background with wide clear gaps. Absolutely no grid lines, dividers, text, shadows, green outlines, birds, crosses, weapons or motion effects.
```

### light-punch

```text
Replace ONLY the Green Boxer in image 1 with the admiral from image 2. Image 1 is the exact light-punch pose and motion template; image 2 locks identity, clothes and scale. Preserve all 6 poses in reading order, left facing, same limb angles and foot placement. First frame must be the admiral idle guard from image 2. Black tricorn, brown beard, black long coat with silver trim and shoulder fringes, red lining, grey waistcoat and trousers, red boot cuffs, bare fists. Production pixel art sheet, 5 columns and 2 rows, 6 isolated full-body frames, unused cells empty. Consistent head and torso size; planted feet for stationary actions; crouching bends knees without shrinking anatomy, jumping leaves floor and falling rotates body without resizing. Transparent background with wide clear gaps. Absolutely no grid lines, dividers, text, shadows, green outlines, birds, crosses, weapons or motion effects.
```

### heavy-punch

```text
Replace ONLY the Green Boxer in image 1 with the admiral from image 2. Image 1 is the exact heavy-punch pose and motion template; image 2 locks identity, clothes and scale. Preserve all 8 poses in reading order, left facing, same limb angles and foot placement. First frame must be the admiral idle guard from image 2. Black tricorn, brown beard, black long coat with silver trim and shoulder fringes, red lining, grey waistcoat and trousers, red boot cuffs, bare fists. Production pixel art sheet, 5 columns and 2 rows, 8 isolated full-body frames, unused cells empty. Consistent head and torso size; planted feet for stationary actions; crouching bends knees without shrinking anatomy, jumping leaves floor and falling rotates body without resizing. Transparent background with wide clear gaps. Absolutely no grid lines, dividers, text, shadows, green outlines, birds, crosses, weapons or motion effects.
```

### knockdown

```text
Replace ONLY the Green Boxer in image 1 with the admiral from image 2. Image 1 is the exact knockdown pose and motion template; image 2 locks identity, clothes and scale. Preserve all 10 poses in reading order, left facing, same limb angles and foot placement. First frame must be the admiral idle guard from image 2. Black tricorn, brown beard, black long coat with silver trim and shoulder fringes, red lining, grey waistcoat and trousers, red boot cuffs, bare fists. Production pixel art sheet, 5 columns and 2 rows, 10 isolated full-body frames, unused cells empty. Consistent head and torso size; planted feet for stationary actions; crouching bends knees without shrinking anatomy, jumping leaves floor and falling rotates body without resizing. Transparent background with wide clear gaps. Absolutely no grid lines, dividers, text, shadows, green outlines, birds, crosses, weapons or motion effects.
```

### block-high-v2

```text
Create 4 frames of the admiral performing a HIGH BLOCK, using image 1 for exact identity and image 2 for action. Frame 0 idle guard. Frame 1 raises BOTH forearms across forehead to cover face; frame 2 holds this firm high defensive guard; frame 3 returns to idle. Keep feet, boots, knees, hips and lower coat PIXEL IDENTICAL in all four frames, only arms move. Same head and torso size and position, no crouching. 5 columns one row, fifth cell empty. No grids or lines. High fidelity arcade pixel art, real transparent background, generous clear gaps between figures, no shadow, no green fringe, no text, no crosses, no birds, no weapons. Preserve black hat, brown beard, black silver-trimmed long coat, red lining, grey trousers, red boot cuffs and bare fists.
```

### heavy-kick

```text
Replace the fighter in image 1 with the admiral in image 2. Exact 10 left-facing heavy-kick poses, 5 columns 2 rows. Image 2 locks identity, hat, clothing, anatomy and scale. First frame idle guard; lift knee, extend powerful boot horizontally left, retract and recover. Keep whole extended boot inside cell, same head and torso size in all frames. No grids or lines. High fidelity arcade pixel art, real transparent background, generous clear gaps between figures, no shadow, no green fringe, no text, no crosses, no birds, no weapons. Preserve black hat, brown beard, black silver-trimmed long coat, red lining, grey trousers, red boot cuffs and bare fists.
```

### special-charge

```text
Replace the Green Boxer in image 1 with the admiral in image 2. Five charging anticipation poses, 5 columns one row: idle guard, knees bend, fists clench near chest, coil shoulders, hold low ready stance. Exact same admiral anatomy and costume, same foot positions and scale. No grid lines, aura or effects. High fidelity arcade pixel art, real transparent background, generous clear gaps between figures, no shadow, no green fringe, no text, no crosses, no birds, no weapons. Preserve black hat, brown beard, black silver-trimmed long coat, red lining, grey trousers, red boot cuffs and bare fists.
```

### special

```text
Replace the Green Boxer in image 1 with the admiral in image 2, making his 8-frame RUSH COMBO: idle guard, shoulder wind-up, extended left jab, retract fist, heavy cross extended left, retract, final extended left straight, recover to idle. 5 columns 2 rows, last 2 cells empty. Image 2 locks identity, clothing, scale and foot position. Keep anatomy size constant; feet planted; whole fists inside cells. No grids, lines, aura or effects. High fidelity arcade pixel art, real transparent background, generous clear gaps between figures, no shadow, no green fringe, no text, no crosses, no birds, no weapons. Preserve black hat, brown beard, black silver-trimmed long coat, red lining, grey trousers, red boot cuffs and bare fists.
```

### portrait

```text
Create a single square pixel-art bust portrait for character selection of exactly this admiral: black unmarked tricorn, stern face, brown beard and moustache, black naval coat and silver fringed epaulettes, grey waistcoat and deep red lining. Head and shoulders centered, fists up in confident guard, consistent with sprite identity. No bird, cross, logo, text or weapons. High fidelity arcade pixel art, real transparent background, generous clear gaps between figures, no shadow, no green fringe, no text, no crosses, no birds, no weapons. Preserve black hat, brown beard, black silver-trimmed long coat, red lining, grey trousers, red boot cuffs and bare fists.
```


## Resultado da conferência

- 14 sheets, 102 quadros; retrato e âncora do modelo da skin.
- Células de 256×256, cinco colunas; quadros preenchidos em sequência e
  células restantes vazias; primeiro quadro idêntico ao idle em todas as ações.
- Prancha de todos os quadros inspecionada à mesma escala e linha de chão.
- Almirante aberto na Academia; idle, deslocamento, queda, chute ativo e
  especial ativo vistos com as caixas. Conferência da caixa do especial no
  quadro 3/8 e do chute no quadro 6/10.
- `npm run check`: typecheck, 80 testes e build aprovados.
- Prévia animada: `public/assets/lutadores/almirante/previa.gif`; prancha de
  poses principais: `public/assets/lutadores/almirante/previa.png`.
- Registro jogável (`selecionavel: true`), disponível na seleção e na
  Academia, por pedido do João em 09/10/2026.
