# ADR 0005: o celular fala com o jogo pelo Supabase Realtime

**Data:** 2026-10-01
**Status:** aceito (substitui em parte a 0004)

## Contexto

O João testou o controle por celular com `npm run dev:celular` e achou
instável no celular: certificado próprio, IP da rede mudando, Wi-Fi que
isola os aparelhos. Pediu o jogo na Vercel, num endereço fixo. O relay da
ADR 0004 mora dentro do servidor do Vite; a Vercel só serve arquivos, então
lá o jogo rodaria no teclado e o celular não acharia o PC.

## Decisão

Quando o build tem `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`, o celular
e o jogo conversam por um canal do Supabase Realtime; sem as chaves, segue o
relay do Vite como antes.

- **`@supabase/supabase-js`**: cliente oficial. Broadcast leva a pose,
  presença diz quem está na sala (jogo, celular do P1, celular do P2).
  Carregado só quando as chaves existem.
- Cada jogo tem uma **sala** (6 letras, guardada no navegador do PC) que vai
  no QR code. Um canal por jogador na sala: o celular do P1 não recebe a
  pose do P2.
- Mesmas mensagens da 0004 (`protocolo.ts`). Quem usa o cano (`canal.ts`)
  não sabe qual dos dois está do outro lado.
- Celular só manda pose com o jogo na sala, e no máximo 20 por segundo.
- A chave `anon` é pública por natureza (vai no JavaScript do navegador),
  mas mora no `.env` e nas variáveis da Vercel, nunca em arquivo versionado.

## Alternativas descartadas

- **Hospedar o relay atual (Render, Fly.io).** O código já existe, mas o
  plano gratuito do Render dorme depois de 15 min parado (30 a 60 s para
  acordar) e o Fly pede cartão.
- **WebRTC com PeerJS.** Mais rápido (direto celular e PC), mas falha
  justamente nas redes que isolam aparelhos, que é o problema que motivou a
  troca.
- **Trocar o relay de vez.** Sem as chaves o projeto continua rodando em
  casa, sem conta nenhuma; o relay custa pouco para manter.

## Consequências

- O jogo hospedado tem HTTPS de verdade: a câmera abre sem aviso de
  certificado, e celular e PC não precisam estar na mesma rede.
- Atraso a mais pela ida e volta até o Supabase (projeto em São Paulo).
  Não medido ainda com celular de verdade.
- Cota do plano gratuito: 100 eventos por segundo no projeto (cada pose
  conta duas vezes, envio e entrega) e mensagens por mês limitadas. Com
  dois celulares a 20 poses por segundo, a conta fecha no limite por
  segundo; o teste `canal.test.ts` cobra isso.
- Mais um serviço na conta pessoal do João. Qualquer pessoa com o QR (ou
  com a sala) entra no canal: aceitável para trabalho acadêmico, sem dado
  pessoal; a pose não sai do canal da sala.
- O relay e o `dev:celular` continuam valendo para quem rodar sem chaves.
