# ADR 0006: deploy público na Vercel antes da resposta do Chong-U

**Data:** 2026-10-29
**Status:** aceito

## Contexto

O João pediu o jogo na Vercel. A arte e o som do Chong-U já saíram todos do
jogo (`docs/varredura-chong-u.md`, seção 1 zerada) e não há pasta `_amostra`
em uso. O que sobra dele é código: motor, Luta, HUD e input partem do Vibe
Fighter, que não tem licença declarada. A varredura recomendava link público
só depois de uma autorização escrita dele, e essa mensagem ainda não foi
enviada.

## Decisão

Publicar agora, em produção aberta, na conta pessoal `joaojato` da Vercel,
ligada ao repositório privado `joaojato/luta-de-mascotes` (cada push na
`main` vira deploy). O João assume o risco do código sem licença.

Na prática:

- O repositório continua privado; só o build minificado fica público.
- O build mostra só Jogar e Ajustes (`FERRAMENTAS_DE_DEV`), sem Academia nem
  Celular, então as variáveis do Supabase não são necessárias por enquanto.
- O pedido de autorização ao Chong-U continua devido. Se ele negar, o projeto
  da Vercel é pausado no mesmo dia.

## Alternativas descartadas

- **Deploy protegido por login da Vercel.** Seguro, mas o João quer o link
  aberto agora.
- **Esperar a resposta do Chong-U.** Sem prazo; trava a apresentação.
- **Reescrever os módulos centrais antes.** Várias semanas, não cabe até
  14/12/2026.

## Consequências

- Existe um link público do jogo, que abre em qualquer navegador de
  computador.
- Fica um risco jurídico aberto até a resposta do Chong-U, mitigado por ser
  trabalho acadêmico sem fins comerciais e por creditar o autor.
- Primeira carga pesada (cerca de 64 MB, quase tudo sprite).
