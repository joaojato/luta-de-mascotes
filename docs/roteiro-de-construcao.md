# Roteiro de construção

Marcos em ordem. Cada um termina com algo que **roda no navegador** ao fim de
uma janela real (Regra do Fim de Semana). A ordem vem do tutorial do Chong-U
(concept, sprites, gym, combate, UI e especiais, CPU), com uma inversão
deliberada: aqui o **motor vem antes da arte**, com retângulos, porque arte é
estocástica e custa crédito, e o motor não pode esperar por ela.

Estimativa contra a janela real do João (noite de dia útil com fadiga, ou fim
de semana), nunca contra horas teóricas. Se um marco não fechar na janela,
ele é quebrado em dois, não esticado.

## Estado atual

- [x] Terreno preparado (17/09/2026): template Phaser 4 + Vite + TS, contrato,
  docs, skills. `npm run check` passando.
- [ ] Marco 0
- [ ] Marco 1
- [ ] Marco 2
- [ ] Marco 3 = v1
- [ ] Marco 4 (se sobrar tempo)

Atualizar esta lista ao fechar cada marco. É a primeira coisa que o agente lê
na sessão.

## Marco 0: motor com retângulos (uma noite)

**Roda no fim:** dois retângulos coloridos num chão, cada um controlado por
um lado do teclado. Andam, pulam, agacham, dão soco. O soco tem hitbox
desenhada na tela e, quando acerta, o outro pisca. Cena `Academia` abre com
um retângulo só e mostra o estado atual dele em texto.

- Apagar as cenas do template (`MainMenu`, `Game`, `GameOver`), manter `Boot`
  e `Preloader`.
- `src/game/luta/`: máquina de estados (parado, andando, pulando, agachado,
  atacando, tomando dano), input por jogador, hitbox e hurtbox como retângulos
  do Phaser, colisão por sobreposição.
- Lutador carregado de um JSON de teste (`src/game/lutadores/_retangulo.json`)
  desde o começo, para a Regra do JSON valer desde o Marco 0.
- Sem arte, sem som, sem vida.

## Marco 1: luta completa, ainda feia (um fim de semana)

**Roda no fim:** partida jogável de ponta a ponta com retângulos. Barra de
vida, timer, melhor de 3, bloqueio segurando para trás, "Round 1, Fight!",
"K.O.", tela de vitória com "de novo?".

- Os 4 golpes do GDD (fraco, forte, chute, especial) com dano e alcance
  diferentes, lidos do JSON.
- Empurrão quando os corpos se sobrepõem, limite de tela, câmera fixa.
- Sons do jsfxr (soco, pulo, K.O.). Cinco minutos, grande retorno.
- Este é o marco que prova que o jogo existe. Se o prazo da matéria apertar,
  o que é entregável começa aqui.

## Marco 2: primeiro mascote de verdade (um fim de semana)

**Roda no fim:** o mascote 1 lutando contra um retângulo, no cenário 1.

- Ficha do mascote no GDD, referência, Spriterrific (usar os 500 créditos
  grátis aqui: `idle` + 4 ações, para validar o estilo antes de comprar).
- Skill `lutador-novo` de ponta a ponta. A primeira passagem vai revelar o que
  falta na skill; corrigir a skill, não contornar.
- Cenário em três camadas com parallax.
- Academia ganha o scrub de quadros com hitbox por cima do sprite.
- Decisão ao fim deste marco, registrada em `docs/decisoes/`: o mixels
  agradou, ou vai para o plano B (PixelLab)?

## Marco 3: v1 (um fim de semana)

**Roda no fim:** a v1 do GDD. Dois mascotes, seleção de personagem, retratos,
barras estilizadas, falas de entrada e vitória, link publicado.

- Mascote 2 pela skill (agora já com crédito comprado).
- Telas de título, seleção e vitória.
- UI arcade (fonte de placar, retrato ao lado da barra).
- Deploy na Vercel ou GitHub Pages, com link que abre no celular.
- Diário e lições em dia: é o material da apresentação.

## Marco 4: se sobrar tempo

Em ordem de valor para a matéria, não de dificuldade:

1. Torcida reagindo (som de vaia e grito conforme quem está ganhando). Barato
   e é a camada de Comunicação mais visível.
2. Modo história curto: três lutas com uma fala entre elas.
3. CPU simples (anda em direção, ataca quando perto, bloqueia às vezes).
4. Terceiro mascote, só por JSON + sprites, para provar a Regra do JSON.

## Calendário sugerido (ajustar quando o prazo entrar no briefing)

Contando a partir do fim de semana de 20/09/2026, um marco por janela:

| Janela | Marco |
|---|---|
| noite de 18 ou 19/09 | Marco 0 |
| fim de semana 20 e 21/09 | Marco 1 |
| fim de semana 27 e 28/09 | Marco 2 |
| fim de semana 4 e 5/10 | Marco 3, v1 no ar |
| outubro em diante | Marco 4 e apresentação |

Folga até 14/12 é grande de propósito. O risco não é o calendário, é parar
no meio. Por isso cada marco fecha com algo jogável e commit.
