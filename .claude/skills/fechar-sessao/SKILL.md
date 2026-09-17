---
name: fechar-sessao
description: Encerramento obrigatório de toda sessão de trabalho neste projeto. Roda a verificação, escreve no diário de bordo, atualiza o estado do roteiro, commita e dá push. Usar quando o João disser "fecha", "terminamos", "commita", "por hoje é isso", ou quando uma tarefa terminar e não houver próxima.
---

# Fechar sessão

Ordem fixa. Nenhum passo é opcional. Se um passo falhar, o fechamento para
nele e o João é avisado, com a saída.

## 1. Verificar

```
npm run check
```

Mostrar a saída, não resumir. Se falhar, corrigir antes de seguir; se não der
para corrigir na janela, commitar mesmo assim com a mensagem começando por
`WIP:` e dizer no diário o que está quebrado.

## 2. Estado do roteiro

Em `docs/roteiro-de-construcao.md`, seção "Estado atual": marcar o marco se
ele fechou (o critério é "roda no fim", descrito em cada marco). Marco que
não fechou continua desmarcado, sem meio-termo.

## 3. Diário

Acrescentar uma entrada ao **final** de `docs/diario-de-bordo.md`, no formato
fixo que está lá. Campo vazio recebe `nada`. Em especial:

- **Créditos gastos:** número e em quê, se houve Spriterrific.
- **Refeito ou apagado a pedido dele:** com o motivo que ele deu.
- **Aprovado explicitamente:** só o que ele disse com todas as letras.

Nunca editar entrada antiga.

## 4. Lições

Se durante a sessão houve gatilho (ele mandou refazer, reclamou de formato,
aprovou algo, uma suposição caiu, uma rodada de sprite falhou por motivo que
vai se repetir), conferir que `docs/licoes.md` já recebeu a linha, com a data
da entrada do diário entre parênteses. Se não recebeu, escrever agora.

## 5. Commit e push

```
git add -A
git status --short
```

Conferir que nada de `.env`, `spriterrific-runs/` ou `referencia/` está na
lista. Se estiver, o `.gitignore` falhou: parar e avisar.

```
git commit -m "<mensagem curta em português, o que mudou>"
git push
```

Mensagem: uma linha, verbo no presente, sem travessão. Exemplos: "Marco 0:
retângulos andam, pulam e socam", "Urubu entra na seleção", "Corrige hitbox
do chute do Cartola".

## 6. Avisar

Uma linha ao João: o que foi commitado, se o `check` passou, e o que ficou em
aberto para a próxima sessão. Sem perguntar se pode commitar: já commitou.
