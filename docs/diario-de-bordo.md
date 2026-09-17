# Diário de bordo

Registro bruto do processo, **append-only**. Uma entrada por sessão de
trabalho, acrescentada ao final, antes do commit.

Nunca editar entrada antiga. O valor deste arquivo está em preservar o que
pareceu certo na hora, inclusive quando estava errado. É a leitura dele que
mostra onde o método falha, e é o material da apresentação da matéria: o
processo de fazer um jogo com IA é parte do que se entrega.

## Formato fixo

Copie o bloco abaixo e preencha. Campo sem conteúdo fica com `nada`, não some.

```
## AAAA-MM-DD: título curto da sessão

**Marco:** em qual marco do roteiro a sessão trabalhou.
**Pedido:** o que o João pediu, na linguagem dele.
**Feito:** o que saiu, em bullets. Arquivos tocados.
**Verificado:** qual comando rodou e o que a saída disse. Se não rodou, dizer.
**Créditos gastos:** Spriterrific, se houve. Quantos, em quê, e o que prestou.
**Refeito ou apagado a pedido dele:** o que ele mandou desfazer, e o motivo
dado por ele. Se ele não deu motivo, escrever "sem motivo declarado".
**Aprovado explicitamente:** o que ele disse que ficou bom.
**Atrito:** onde a sessão travou, esperou ou deu voltas.
**Em aberto:** o que ficou para a próxima.
```

---

## 2026-09-17: terreno preparado, a partir da sessão da Alure

**Marco:** anterior ao Marco 0.
**Pedido:** "prepare um ambiente para o VS Code dentro dos meus projetos
pessoais para que eu comece a vibecodar lá. Veja skills e afins que a gente
pode fazer." Antes disso, na mesma conversa, ele pediu recomendação de quais
IAs e programas usar, e trouxe duas referências que gostou (Food Fighters e o
clone de Street Fighter do Chong-U).
**Feito:**
- Template oficial `phaserjs/template-vite-ts` clonado e limpo (telemetria,
  screenshot, README e LICENSE do template removidos; `package.json`
  reescrito com `npm run check`).
- `CLAUDE.md` com identidade própria, regras nomeadas e anti-referência.
- `COMECE-AQUI.md`, `docs/briefing.md`, `docs/gdd.md`,
  `docs/pipeline-arte.md`, `docs/roteiro-de-construcao.md`,
  `docs/referencias.md`, `docs/licoes.md`, `docs/decisoes/`.
- Skills: `spriterrific-api` (oficial, baixada do repositório do autor),
  `lutador-novo` e `fechar-sessao` (escritas aqui).
- `.claude/settings.json`, `.vscode/settings.json` (janela verde),
  `.gitignore`, `.env.example`.
**Verificado:** `npm install` e `npm run check` (ver saída no commit inicial).
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** nada ainda. Ele gostou das duas referências, o
que confirmou a escolha do Phaser.
**Atrito:** não achei o link do Food Fighters. Ficou campo aberto em
`docs/referencias.md`. O código do clone do Chong-U é pago, então herdamos a
ordem de construção e não o código.
**Em aberto:** campos do briefing (entrega, prazo, solo ou grupo). Conta do
Spriterrific. Escolha dos dois mascotes da v1. Marco 0.

## 2026-09-17: ultimates entram no GDD, vindos do doc do Drive

**Marco:** anterior ao Marco 0.
**Pedido:** "Tem um docs no meu drive de nome Projeto street fighter futebol.
Estamos colocando nossas ideias lá. Coloque algumas das minhas aqui também.
Pretendo colocar ataques especiais (ultimates) com algo relacionado ao
mascote/time. Exemplo: Vasco da Gama tem o especial de uma caravana junto de
uma onda atropelar o personagem rival."
**Feito:**
- `docs/gdd.md`: seção "Ultimates" com a regra (ultimate vem do símbolo do
  clube), o exemplo do Vasco, medidor de torcida, ficha de ultimate, e a
  decisão técnica de construir como efeito em camada, fora do Spriterrific.
  Coluna da tabela de candidatos renomeada para "semente de ultimate".
- `docs/roteiro-de-construcao.md`: ultimate abre o Marco 4.
- `docs/briefing.md`: o doc do Drive registrado como fonte de ideias; pista
  de que o trabalho é em grupo.
**Verificado:** só documentação, `npm run check` não se aplica.
**Créditos gastos:** nada.
**Refeito ou apagado a pedido dele:** nada.
**Aprovado explicitamente:** nada.
**Atrito:** a sessão da Alure não tem conector do Drive, então o doc não foi
lido. "Caravana" foi registrado como "caravela" (símbolo do Vasco), a
confirmar com ele.
**Em aberto:** colar o resto do doc do Drive; confirmar caravela; confirmar
se é grupo e quem faz o quê.
