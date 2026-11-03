# Modo tutorial (03/11/2026)

Rascunho em andamento. A seção 1 é o roteiro do João, guardado como ele
escreveu para não se perder. As seções seguintes registram o que já foi
decidido na conversa e o que ainda está em aberto.

## 1. Roteiro do João (texto original, 03/11/2026)

> Precisamos adicionar um modo tutorial, é possível verificar se a pessoa já
> acessou antes o jogo pelos cookies? se for a primeira vez aparece uma tela
> perguntando de tutorial antes de qualquer menu. A pessoa então escolhe o
> personagem dela contra a CPU (Interessante a cpu pegar um rival do time, ou
> alguém da mesma região do Brasil) e a CPU tem que fazer exatamente o que o
> tutorial manda.
>
> Importante as teclas que aparecerem sempre estarem de acordo com as teclas
> player definiu no remapeamento de teclas/mobile. Aqui vai um roteiro para o
> tutorial, mas precisa ser adaptado com as teclas (Controle do mobile
> incluso)
>
> A cada texto "-" o jogo pausa (tempo congela)
>
> Checklist para o que o player fez, com isso desbloqueia a próxima etapa do
> tutoial:
>
> - Se movimente com "A, esquerda" "D, direita".
>
> - Pule com "W" abaixe-se com "S"
>
> - Pra cima dele! (D, 2 vezes rápido)
>
> CPU caminha até o player
>
> - Experimente bater com "Q" ou "E".
>
> \*P\*tometro enche no máximo
> "Foco de luz no P\*tometro"
> - Que Show! A torcida se animou!
>
> CPU bloqueia em pé
>
> - Agora derrube essa guarda com golpes fortes! ("Q + (segurando) S" "E +
>   (segurando) S)
>
> CPU fica pulando (mas com delay de 1,5s entre cada pulo)
>
> - Agora tente pulando ("Q + (no ar, W)" "E + (no ar, W)")
>
> CPU difere socos leves
>
> \* P\*tometro desaba no vermelho
> (Foco de luz no P\*tometro)
> - P%#R@! A torcida não está Gostando!
>
> (Treino de Aparo)
> - Rápido! Bloqueie alguns golpes segurando "C"!
>
> CPU difere socos leves e fica estunado
>
> - Bloquear na hora do impacto deixa eles tontos! Continue com o C
>
> CPU difere mais socos leves (Apenas para mostrar a defesa de golpes, sem
> aparo)
>
> CPU difere um soco abaixado (quebrando a defesa)
>
> - Bloqueio de pé não aguenta golpes pesados
> - Bloqueie abaixado ("S" + "C")
>
> CPU difere golpes pesados
>
> \*Com sucesso das defesas
>
> CPU dá uma voadora e quebra a defesa baixa
>
> - Desvie da voadora com um passo largo (A, 2 vezes rápido)
>
> CPU para de se mexer
>
> - Vamo Virar! Aperte "espaço"
>
> Player acerta o especial, medidor sobe
>
> \* Foco de Luz no P\*tometro
>
> - Agora sim!
>
> \* Mantendo o foco de luz no P\*tometro, adicione um foco na barra de ult
>   carergando
>
> - Agradar a torcida faz seu Especial carregar mais rápido com o tempo!
>
> - Chega de conversa! QUEBRE ELE!
>
> CPU no modo fácil

## 2. Decidido na conversa

- **Primeira visita.** Marca "já viu o tutorial" no `localStorage`, como os
  controles e ajustes já fazem. Sem a marca, a tela que pergunta do tutorial
  aparece antes de qualquer menu. Aba anônima ou cache limpo mostram de novo.
- **Teclas.** Todo texto do tutorial mostra a tecla que a pessoa definiu no
  remapeamento (teclado) ou o botão do celular, nunca a tecla fixa do
  roteiro.
- **Aparo é quase um quick time event (João, 03/11/2026).** Tem que ser
  sincronizado e perfeito para a pessoa não tomar o soco. Errou a janela,
  toma o soco e a CPU tenta de novo até sair perfeito.
- **Onde o tutorial vive (João, 03/11/2026).** Antes da luta de verdade, o
  tutorial acontece no modo de luta teste da Academia (o treino livre). O
  "Chega de conversa! QUEBRE ELE!" leva para a luta de verdade contra a CPU
  no fácil.

## 3. Palpites ainda não confirmados

- No tutorial a vida desce mas nunca chega a zero.

## 4. Em aberto

- Depois da primeira vez, por onde a pessoa volta ao tutorial.
- Como a CPU escolhe o rival (mesmo estado, mesma região, rivalidade
  declarada) e onde esse dado mora.
- Como o passo largo e os comandos com direção aparecem no controle de toque.
- Celular como câmera (controle pelo corpo) entra no tutorial ou não.
