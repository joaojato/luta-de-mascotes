# Biriba do Bira, ovo do Galo e tontura do motor (29/10/2026)

Três pedidos do João, nesta ordem. Mecânica e integração com o Claude; arte
com o Codex, seguindo `docs/producao-personagens.md` (uma geração por peça,
guarda aprovada da própria skin anexada, conferir cada quadro, entregar em
`public/` com guia em `docs/`).

## 1. Chute do Bira: chamar o Biriba

**Como joga.** O chute do Bira deixa de ser um chute: ele chama o Biriba,
como o Almirante chama a caravela. O Biriba entra voando por trás do Bira,
pendurado em balões pretos e brancos, e atravessa o campo de um lado ao
outro. No momento em que o chute é apertado, o jogo guarda onde o oponente
está; quando o Biriba passa por cima desse ponto, solta um cocôzinho, que
cai reto.

- Só escapa quem **sai do lugar**. A defesa não segura (imbloqueável), e
  pular ou agachar no mesmo ponto não adianta.
- Um Biriba por vez: enquanto ele está atravessando, o botão de chute do
  Bira não faz nada.
- Dano do chute básico (`kickDamage`). O acerto e o chão mostram o
  respingo.
- **Mina** (João, 29/10): o cocô que cai no chão sem acertar fica lá 2
  segundos. Quem pisar leva metade do dano; pular por cima escapa. Pisca no
  último segundo antes de sumir (`drop.mine`).
- **Acerto evidente** (João, 29/10): além do respingo, pedacinhos marrons
  caindo e um fedor verde subindo do ponto do acerto por 1,5 s
  (`hitParticles`, partículas do motor, por dado).
- Tom cômico, não nojento (GDD: "manter cômico, não vulgar").

**Motor (genérico, por dado).** Projétil que carrega outro: o `kick` do
Bira vira `kind: "projectile"` com `spawnFrom: "behind"` e um bloco `drop`
(efeito do que cai, gravidade, tamanho do acerto, efeito do respingo). O
carregador não acerta ninguém; o que cai usa o golpe novo `queda`, que
nenhuma guarda segura e que pulo e agachamento não evitam. Enquanto existir
carregador, o chute não sai.

**Biriba de cenário.** Outra sessão está pondo o Biriba como acompanhante
do Bira na beira do campo (`docs/biriba-cenario.md`). Enquanto o Biriba
voador atravessa, o acompanhante some e volta quando o voo acaba (decisão do
Claude: é o mesmo cachorro). Ligado depois que aquela sessão fechar.

## 2. Tontura: partícula do jogo, não da sheet

Hoje as estrelas e espirais da tontura estão desenhadas dentro do
`stunned.png` de cada lutador; o Esquadrão veio sem e ficou sem. Passa a
ser um efeito do motor, igual para todos, desenhado acima da cabeça
enquanto o lutador está tonto. A sheet `stunned` de cada um fica só com o
corpo. Lutador novo não precisa mais desenhar partícula (entra no
`docs/criador-de-personagem.md`).

Posição: centro da caixa visual da ação `stunned`, um pouco acima do topo
dela.

## 3. Galo: giro vira chute baixo, chute vira ovo

- **Chute baixo** (Baixo + Chute): passa a ser o chute girando
  (`spin-full-turn-v5.png`), com o talho de garra no acerto. O chute baixo
  clássico sai de uso (o arquivo fica).
- **Chute** (Chute): o Galo arremessa um ovo. Projétil como o cachimbo do
  Saci, mas mais reto e mais rápido, quase sem parábola. Defesa segura;
  agachar passa por baixo, como o cachimbo. No acerto e no chão, o ovo
  quebra.

## Arte (Codex)

Células em pixels, fundo transparente, pixel art no padrão da skin de cada
um. Virado para a esquerda (o jogo espelha). Golpe de lutador: quadro 0 é a
guarda (`idle` quadro 0), mesma escala e mesmo pé no chão (Regras da Régua
e do Eixo).

Bira, em `public/assets/lutadores/cachorro/urubu-v1/`:

1. **`summon-biriba.png`**: o Bira chama o Biriba. Assobia com dois dedos
   na boca e aponta para trás e para o alto, depois volta à guarda. 6
   quadros, células 256×256, 5 colunas. Referência: `idle.png` da mesma
   pasta. Muito bravo no ataque como os outros golpes dele.
2. **`biriba-voando.png`**: o Biriba (identidade de
   `public/assets/cenarios/biriba/idle.png` e `docs/biriba-cenario.md`)
   pendurado por fios em 4 a 6 balões pretos e brancos, patas soltas,
   orelhas ao vento, voando para a esquerda. 6 quadros em loop (balões
   balançando, patas remando), células 256×256. O cachorro no mesmo tamanho
   relativo do Biriba de cenário; os balões acima dele. Nada de escudo,
   letra ou número nos balões.
3. **`coco.png`**: cocôzinho caindo, cartunesco (espiral marrom, brilho,
   talvez uma mosquinha), 4 quadros de leve balanço, células 64×64.
4. **`coco-splash.png`**: respingo no chão, cômico (achata e espirra
   pedacinhos), 6 quadros, células 128×128, base do respingo na base da
   célula.

Galo, em `public/assets/lutadores/galo/urubu-v1/`:

5. **`egg-throw.png`**: o Galo tira um ovo de baixo da asa, arma o braço e
   arremessa reto para a frente, depois volta à guarda. 8 quadros, células
   256×256, 5 colunas, a mão vazia no quadro em que o ovo sai (dizer qual
   no guia). Referência: `idle.png` da mesma pasta.
6. **`ovo.png`**: ovo branco girando, 4 quadros, células 64×64.
7. **`ovo-splash.png`**: ovo quebrando, gema e casca, 6 quadros, células
   128×128, base na base da célula.

Tontura:

8. **`public/assets/fx/tontura.png`**: estrelas amarelas e espirais azuis
   girando numa elipse achatada, no estilo das que já estão nas sheets
   (ver `urubu/frente/stunned.png`), 8 quadros em loop, células 128×64, a
   elipse centrada na célula.
9. **Limpar as partículas** das seis sheets `stunned.png` que têm (Urubu
   `frente`, Almirante `base`, Bira e Cartola e Galo `urubu-v1`, Saci). Só
   apagar estrelas e espirais, sem tocar em nenhum pixel do corpo; guardar
   as originais em `output/`.

Guia da entrega: `docs/biriba-ovo-tontura-arte.md`, com quadros, o quadro
de soltura do ovo e do chamado, e o que foi conferido.
