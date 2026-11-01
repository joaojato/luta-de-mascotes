# Pelada, Torneios, dificuldade clara e lutador aleatório

Design pedido pelo João em 31/10/2026. Exceção à Regra da v1 aberta por
ele, como foi com o controle pelo corpo.

## Por quê

Hoje o jogo só tem a luta avulsa. O João quer um motivo para jogar várias
lutas seguidas contra a CPU, no formato que todo torcedor entende: copa em
mata-mata e campeonato em pontos corridos. Para a matéria, o torneio é
onde a rivalidade e a torcida viram campanha, não só uma briga solta.

A dificuldade existe desde 30/10 (Fácil, Médio, Difícil), mas fica
escondida na tela de modo (só com 1 VS CPU selecionado, ↑ ↓). O João não
a encontrou. Além de aparecer, os extremos precisam ficar muito mais
distantes do Médio.

## Objetivos

1. Menu com **Pelada** no lugar de Jogar, e **Torneios** logo abaixo.
2. Dificuldade numa tela própria, impossível de não ver, com três cartões
   que dizem o que a CPU faz em cada nível.
3. Fácil bem mais burra e Difícil bem mais esperta. Médio fica como está.
4. Opção **?** na seleção: lutador aleatório para o jogador e para o
   oponente (P2 ou CPU).
5. Torneio em **mata-mata** (chaveamento) e em **pontos corridos**, cada
   um com 8 ou 16 times, sempre um jogador contra a CPU.

## Fora do escopo

- Torneio com dois jogadores humanos.
- Salvar o torneio entre sessões: recarregou a página, perdeu (chamada
  minha; um torneio de 8 é curto o bastante).
- Arte final dos cartões novos: é pedido ao Codex, em paralelo (ver Arte).
- Lutas entre duas CPUs jogadas na tela: são decididas por sorteio.

## Anti-objetivos

- Não pode parecer jogo de cassino de celular (anti-referência do
  contrato): sem moeda, sem prêmio, sem brilho dourado no troféu nem na
  tabela.
- A dificuldade não pode ficar de novo escondida atrás de uma tecla.
- O Difícil não pode ser "rápido e onisciente" de um jeito injusto: ele
  reage mais rápido e decide melhor, mas continua lendo só o que um
  jogador veria (distância, golpe em curso, projétil, barra).

## Fluxo de telas (aprovado pelo João no navegador)

```
Menu: Pelada | Torneios | Ajustes   (Academia e Celular só no dev, como hoje)

Pelada -> 1 VS 1                 -> Cenário -> Seleção -> Luta
       -> 1 VS CPU -> Dificuldade -> Cenário -> Seleção -> Luta

Torneios -> Mata-mata | Pontos corridos
         -> 8 times | 16 times (travado enquanto o elenco tiver menos de 16)
         -> Dificuldade -> Seleção (só o lutador do jogador)
         -> Chaveamento ou Tabela -> Luta -> Chaveamento ou Tabela -> ...
         -> Tela final (campeão, eliminado ou posição na tabela)
```

Esc sempre volta uma tela. A dificuldade escolhida continua guardada nos
ajustes do aparelho, como hoje, e vem pré-selecionada.

## Dificuldade

Tela própria, mesma tela para a Pelada e para o Torneio. Três cartões
lado a lado, Médio pré-selecionado na primeira vez:

| Nível | Texto do cartão |
|---|---|
| Fácil | A CPU demora para reagir e quase não defende. Para aprender os golpes. |
| Médio | Defende metade dos golpes e pune erro. Luta de igual para igual. |
| Difícil | Lê seus golpes, defende quase tudo e não perdoa. Para quem já sabe jogar. |

← → escolhe, Enter confirma, Esc volta, toque ou clique no cartão
escolhe e confirma.

**Comportamento.** Os perfis vivem em `src/game/cpu.ts` (`PERFIS`).

- **Fácil, mais burra:** reação bem mais lenta, ataques bem mais espaçados,
  quase nunca defende nem usa especial, e também erra: às vezes ataca fora
  de alcance e às vezes anda para trás sem motivo. Hoje o Fácil começou 12
  golpes em 20 s contra um P1 parado; o alvo é cair para uns 5.
- **Difícil, mais esperta:** além de números maiores, comportamentos que o
  Médio não tem. Fica para o construtor escolher dentro do que o motor já
  oferece, por exemplo: punir golpe que errou (whiff), defender baixo
  contra golpe baixo e alto contra alto, usar a guarda perfeita, pular ou
  agachar projétil, guardar o especial para quando ele acerta (oponente
  tonto ou se recuperando), manter a distância do próprio melhor golpe.
- **Médio:** inalterado.

**Como medir.** O construtor define um teste repetível (por exemplo, CPU
contra CPU com semente fixa, ou contra um P1 roteirizado) e mostra que
Difícil vence Médio e Médio vence Fácil na maioria das lutas.

## Lutador aleatório (?)

- Uma casa **?** na grade da Seleção, como última casa. Funciona como
  qualquer retrato: o cursor para nela e o jogador trava.
- Ao travar no ?, o lutador é sorteado entre os selecionáveis e revelado
  com o mesmo destaque da trava normal.
- Na 1 VS CPU (etapa da CPU) e no 1 VS 1 (P2), vale para o oponente. O
  sorteio respeita a regra que já existe: a CPU não pode cair no mesmo
  lutador do jogador.
- No Torneio, o ? vale só para o jogador (os adversários já são sorteados).

## Torneios

**Times.** Cada time é um lutador. O jogador escolhe o dele; os outros 7
(ou 15) são sorteados entre os selecionáveis restantes, sem repetir. Com
10 lutadores, ficam 2 de fora em cada torneio de 8.

**Luta do jogador.** Igual à luta de hoje: melhor de 3 rounds, empate de
round repete o round. Por isso todo placar é 2x0 ou 2x1. Cenário: o
Estádio, o único que existe.

**Luta CPU contra CPU.** Resolvida por sorteio, 50% para cada lado, e
placar sorteado entre 2x0 e 2x1. Aparece direto no chaveamento ou na
tabela, sem animação de luta.

**16 times.** O botão aparece travado, com o texto "Precisa de 16
lutadores (hoje N)". Destrava sozinho quando o elenco selecionável
chegar a 16, sem mudar código.

### Mata-mata

- 8 times: quartas, semifinal, final. 16 times: oitavas antes.
- Chaveamento sorteado no início. O jogador sempre joga a luta dele da
  rodada; as outras da mesma rodada são sorteadas e aparecem no chave.
- Tela de chaveamento entre as lutas: retratos dos times, placar de cada
  luta já jogada, o caminho do jogador em destaque, o próximo adversário.
  Enter joga a próxima luta.
- Perdeu, caiu: tela "Eliminado nas quartas" (ou semi, ou final), com
  opções de jogar de novo (mesmo formato e dificuldade, novo sorteio) ou
  voltar ao menu.
- Venceu a final: tela de campeão com o lutador do jogador e o troféu.

### Pontos corridos

- Todos contra todos, turno único: 8 times dão 7 rodadas, 16 dão 15. Em
  cada rodada o jogador joga uma luta e as outras são sorteadas.
- Pontos: vitória por 2x0 vale **2**, vitória por 2x1 vale **1**, derrota
  vale **0** (regra do João).
- Desempate (chamada minha): saldo de rounds (ganhos menos perdidos),
  depois rounds ganhos, depois confronto direto, depois sorteio.
- Tela de tabela entre as rodadas: posição, retrato, nome, pontos,
  lutas, vitórias, derrotas, saldo de rounds; a linha do jogador em
  destaque e o próximo adversário abaixo. Enter joga a próxima rodada.
- Perder não elimina: o jogador joga todas as rodadas.
- Fim: tela com a posição final. Primeiro lugar é campeão, com troféu.

### Depois de cada luta do torneio

A tela de fim de luta de hoje oferece revanche e menu. No torneio ela
oferece **continuar** (volta ao chaveamento ou à tabela, com o resultado
já lançado) em vez de revanche. Esc na luta (pausa) continua levando ao
menu; sair no meio abandona o torneio.

## Arte

Seguir a identidade de rua de `docs/identidade-ui-v1.md`: moldura clara
sobre carvão, cores chapadas, detalhe vermelho e azul, texto grande com
sombra vermelha, sem metálico e sem dourado ornamental.

- **Cartões novos** no molde de `mode-1vcpu-card.png` (ilustração na quadra
  de bairro, texto embutido): Mata-mata, Pontos corridos, Fácil, Médio e
  Difícil. O menu continua em lista de texto, só troca Jogar por Pelada e
  ganha Torneios (chamada minha). Pedido
  ao Codex em `docs/pedidos-codex.md`. Sugestão para a dificuldade: o mesmo
  mascote cada vez mais bravo, ou a quadra cada vez mais cheia.
- **Enquanto a arte não chega:** cartões provisórios desenhados pelo jogo,
  só moldura e texto no estilo do HUD. Trocar pela ilustração é trocar o
  arquivo, sem código.
- **Chaveamento e tabela:** com o que já existe (retratos, molduras de
  nome do atlas, fundo da quadra). Arte nova só o troféu, também pedido
  ao Codex; até lá, um provisório simples.

## Restrições

- Phaser 4 + TypeScript + Vite, nada de dependência nova.
- Regra do JSON: o torneio lê o elenco de `selecionavel`, nunca de lista
  de ids.
- A lógica do torneio (sorteio do chave, rodadas, pontos, desempate) mora
  fora das cenas, em módulo puro e testado (por exemplo
  `src/game/torneio.ts`), como `cpu.ts`.
- Toque: o torneio é contra a CPU, então precisa funcionar no celular
  (versão de toque, `docs/mobile.md`). Outra sessão está mexendo em
  `src/toque/telaToque.ts`, `MatchScene.ts` e `BaseScene.ts` sem commit:
  coordenar antes de editar esses arquivos.
- Regra do Criador: nada aqui muda o que um mascote precisa, então o
  questionário não muda.

## Deixado para o construtor

- Como a cena da luta recebe e devolve o contexto do torneio.
- O desenho exato das telas de chaveamento e tabela, dentro da identidade.
- Quais comportamentos novos o Difícil ganha e os números do Fácil, desde
  que o teste de força passe.
- Ordem das entregas. Sugestão, cada uma jogável sozinha: (1) menu Pelada
  e tela de dificuldade, (2) Fácil e Difícil novos, (3) lutador ?, (4)
  mata-mata de 8, (5) pontos corridos de 8, (6) pedido de arte ao Codex.
