# 0007: Sons sintetizados em Python

**Data:** 29/10/2026
**Situação:** aceita (pedido do João: "comece a fazer os sons do app, não sei como")

## Contexto

O jogo tinha um som só, o apito dos menus (`scripts/apito.py`). Precisa de
algumas dezenas: interface, partida, corpo, golpes e os próprios de cada
mascote. Trabalho acadêmico, sem verba, e já com uma pendência de licença
no código herdado: som não pode trazer outra.

## Decisão

Gerar todos os sons por síntese, num script Python que usa só a biblioteca
padrão (`scripts/sons.py`), escrevendo WAV mono 22 kHz em
`public/assets/audio/sfx/`. Nenhuma dependência nova no projeto nem na
máquina.

## Alternativas

- **Pacotes CC0 (Kenney e outros):** som mais realista, licença livre, mas
  estilo de vários autores e sem ajuste fino. Fica como reserva para o som
  específico que não convencer sintetizado, perguntando antes.
- **Geração por IA (ElevenLabs e parecidos):** pago por uso e com termos de
  licença a conferir. Não cabe agora.
- **Gravar:** bom para voz; fica para quando o grupo quiser.

## Consequências

- Som de arcade, coeso entre si, refeito em segundos.
- Água, madeira e voz ficam aproximados; se não convencerem, volta-se a
  esta decisão para aquele som.
