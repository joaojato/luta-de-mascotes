# Lições

O destilado do `diario-de-bordo.md`: o que funciona com o João e o que não
funciona, neste projeto. Este arquivo **é editável**, ao contrário do diário.

Toda linha cita a data da entrada do diário que a originou, entre parênteses.
Sem a citação, a afirmação não pode ser conferida depois e vira folclore.

Quando uma lição se mostrar errada, **corrija a linha**, não acrescente outra
embaixo contradizendo.

## Preferências confirmadas

Coisas que ele aprovou de forma explícita, ou que repetiu como regra.

- Português do Brasil, sem travessão como pausa explicativa. (regra global
  dele, anterior a este projeto)
- Bullet vence parágrafo. Uma recomendação vence um catálogo de opções.
  (regra global dele)
- Documento de contrato antes de código. (regra global dele)
- Projeto que nasce de uma sessão da Alure ganha `CLAUDE.md` com identidade
  própria e o trabalho de verdade roda em sessão limpa, aberta na pasta do
  projeto. (regra dele de 01/09/2026, no projeto Designer de Restaurantes)
- O projeto documenta o próprio processo enquanto acontece: diário bruto e
  lições destiladas. (pedido dele em 15/09/2026, no Icons4U; herdado aqui
  porque numa matéria de Comunicação o processo é parte da entrega)

## O que não fazer

- Chamar Codex de gerador de gráficos. Ele imaginava "Codex pros gráficos";
  Codex é agente de código. Imagem é modelo de imagem. (2026-09-17)

## Sobre a arte

- **Regra de remoção enterrada num prompt longo de fidelidade não funciona.**
  O prompt de 200 linhas com "preserve roupa e acessórios" e a imagem
  anexada venceram o bloco "REGRAS DO PROJETO": o Almirante voltou com
  corvo, Cruz de Malta no chapéu e ainda ganhou um pendente com a cruz. O
  Urubu perdeu escudo e monograma, mas os dois vieram olhando para a
  direita mesmo com a regra de direção em três lugares. Remoção e espelho
  são edição curta, com só a instrução de mudança, sobre a imagem já
  gerada; direção se resolve por script (`ImageOps.mirror`), não por
  prompt. (2026-09-17)
- O Spriterrific não faz o estilo 16-bit arcade do SF2. O melhor é o mixels.
  Dizer isso antes de gastar crédito, não depois. (2026-09-17, lido na
  própria skill)

## Sobre o método

- O João prefere **partir de código pronto e adaptar** a construir motor do
  zero, mesmo com trade-off de licença apresentado. Ver algo lutando na
  primeira sessão pesa mais que pureza de arquitetura. A Regra do Retângulo
  durou um dia e virou Regra do Placeholder. (2026-09-17)
- Antes de dizer que uma referência é paga ou fechada, **conferir no GitHub
  e no site**. "Clube pago" estava errado: o jogo era público, só o gym era
  pago. Custou uma conversa de trade-off que não precisava existir. (2026-09-17)
- **Duas sessões de agente na mesma pasta ao mesmo tempo colidem.** A sessão
  da Alure commitou docs com `git add -A` e levou junto arquivos pela metade
  da sessão do projeto, sob mensagem de briefing. Regra: uma sessão escreve
  no repo por vez; a outra só lê. Se as duas precisarem escrever, a da Alure
  passa o texto e a do projeto commita. (2026-09-17)
- Motor antes da arte continua valendo, só que o motor agora é o herdado.
  Arte é estocástica e custa crédito; o jogo já existe antes dela. (2026-09-17)
