# Luta de Mascotes: contrato do projeto

Instruções para qualquer agente que abrir sessão nesta pasta. A instrução mais
recente do João sempre vence este documento.

## O que este projeto é

Jogo de luta 2D, um contra um, com **mascotes de clubes de futebol do Brasil**,
no espírito visual de Street Fighter. É o trabalho do João para a matéria
**CTN1423 Games, Narrativas e Comunicação** (PUC-Rio, professor Barbato).

- Briefing e o que ainda está em aberto: `docs/briefing.md`.
- Elenco, golpes, rivalidades, narrativa: `docs/gdd.md`.
- Ordem de construção, em marcos que rodam cedo: `docs/roteiro-de-construcao.md`.
- Como a arte é feita: `docs/pipeline-arte.md`.
- De onde as ideias vieram: `docs/referencias.md`.

## O que este projeto NÃO é

- **Não é a Alure.** A Alure é o segundo cérebro pessoal do João e vive em
  `Desktop/VsCode/Pessoal/Obsidian/alure`. Ela pode ler esta pasta depois.
  Este projeto **nunca escreve dentro dela**, nem em nenhum vault do Obsidian,
  nem no FOS.
- **Não é o clone do Chong-U.** Dele se herda a **ordem de construção** e a
  ferramenta de sprite. O código-fonte dele é pago e não entra aqui.
- **Não é produto.** É trabalho acadêmico. Sem monetização, sem loja, sem
  conta de usuário, sem escudo oficial de clube no build público (ver Regra
  do Escudo).

## Stack fixa

**Phaser 4 + TypeScript + Vite**, rodando no navegador. Decisão registrada em
`docs/decisoes/0001-phaser-vite-ts.md`. Não trocar de engine no meio.

Arquitetura alvo (cresce a partir do template, não nasce pronta):

```
src/game/scenes/      Boot, Preloader, Menu, Selecao, Luta, Academia
src/game/luta/        motor: máquina de estados, hitbox/hurtbox, input, rounds
src/game/lutadores/   um JSON por mascote: frames, hitboxes, golpes, stats
public/assets/lutadores/<slug>/   sprite sheets do mascote
public/assets/cenarios/<slug>/    camadas do cenário
public/assets/audio/
```

## Regras nomeadas

Cada uma tem nome para poder ser cobrada depois.

- **Regra do JSON.** Lutador é dado, não classe. Adicionar mascote é criar um
  JSON e uma pasta de sprites, zero código novo no motor. Se um mascote precisar
  de código próprio, o motor está errado, não o mascote.
- **Regra da Academia.** Nenhum golpe entra na luta sem antes ter sido visto na
  cena `Academia` (o "gym"): animação quadro a quadro com hitbox desenhada.
- **Regra do Fim de Semana.** Cada marco do roteiro roda no navegador ao final
  de uma janela de trabalho real (uma noite ou um fim de semana). Marco que
  não roda no fim da janela foi grande demais e é quebrado em dois.
- **Regra do Retângulo.** O motor de luta nasce com retângulos coloridos e só
  depois recebe arte. Arte é o gargalo e é estocástica; o motor não pode
  depender dela para existir.
- **Regra do Escudo.** Mascotes são reinterpretados, não copiados. Sem escudo,
  nome oficial de clube ou patrocínio nos assets. Protege o trabalho se ele
  for publicado, e é decisão de design antes de ser jurídica: o mascote
  precisa se sustentar como personagem.
- **Regra da v1.** A v1 é: 2 mascotes, 1 cenário, 4 golpes por mascote, 2
  jogadores no mesmo teclado, sem CPU. Nada além disso é construído antes de
  a v1 rodar de ponta a ponta.

## Anti-referência

O que o jogo **não** pode parecer:

- Mortal Kombat: sem sangue, sem fatality, sem realismo.
- Jogo de cassino de celular: sem moeda, sem loot, sem brilho dourado.
- Mascote de banco: sem fofura corporativa. Mascote aqui tem atitude de torcida.
- Placeholder de IA: sem texto embaralhado em cenário, sem mão de seis dedos,
  sem fundo "genérico bonito" que não diz que estádio é.

## Conta e ambiente

Projeto **pessoal**. Repositório e serviços externos ficam na conta pessoal do
João (`joaojato`). Nada aqui vai para conta da Icons4u.

- Chave do Spriterrific em `.env` como `SPRITERRIFIC_API_KEY`. Valor de
  credencial nunca entra em arquivo versionado. `.env.example` mostra o nome.
- Material bruto de arte (vídeos, rodadas do Spriterrific, referências) fica
  em `spriterrific-runs/` e `referencia/`, ambos fora do git. Só o sprite final
  entra em `public/assets/`.

## Como falar com o João

- Português do Brasil, com acentuação correta.
- **Nunca usar travessão** como pausa explicativa. Entrega texto de IA na hora.
- Direto e curto. Bullet vence parágrafo. Uma recomendação vence um catálogo
  de opções.
- Não vender ideia. Apresentar o trade-off e recomendar.
- Se algo exceder a capacidade técnica dele, avisar explicitamente em vez de
  entregar calado.

## Capacidade real da semana

Período letivo até 14/12/2026. Terça a sexta são dias comprometidos (aula de
manhã na Gávea, Icons4u à tarde, cerca de 2h de trajeto). Segunda tem aula das
11h às 15h. Sobra noite de dia útil com fadiga alta, e fim de semana.

Estimar esforço contra essa janela, nunca contra horas teóricas. Em projeto
longo o risco real não é a dificuldade técnica, é a motivação cair. Por isso
os marcos do roteiro são pequenos e cada um termina com algo jogável.

## Disciplina de trabalho

1. Documento de contrato antes do código. Golpe novo começa no `docs/gdd.md`.
2. Menor alteração coerente que resolva o pedido.
3. Antes de afirmar que algo funciona, **rodar `npm run check` e mostrar a
   saída**. Para coisa visual, abrir `npm run dev` e descrever o que apareceu.
4. Ao terminar uma tarefa, commitar e dar push sem esperar pedido. Mensagem
   curta em português. Avisar depois, não perguntar antes.
5. Toda dependência nova justifica a própria existência em `docs/decisoes/`,
   no formato de `docs/decisoes/0000-modelo.md`. Uma página por decisão.

## Skills desta pasta

- `spriterrific-api` (oficial, MIT): gera sprite sheet animada a partir de
  descrição ou imagem de referência via API. Pede `SPRITERRIFIC_API_KEY`.
- `lutador-novo`: o pipeline completo de um mascote novo, do briefing ao JSON
  validado na Academia. Usar sempre que entrar mascote.
- `fechar-sessao`: verificação, diário, commit e push. Usar ao final de toda
  sessão ou quando o João disser "fecha", "terminamos", "commita".

## Registro do processo: a parte que não é opcional

Este projeto documenta como foi construído, não só o que foi construído. São
dois arquivos, com funções diferentes. **Manter os dois é tarefa, não cortesia.**

### `docs/diario-de-bordo.md` (bruto, append-only)

**Ao final de cada sessão de trabalho**, antes do commit, acrescente uma
entrada no formato fixo que já está no arquivo. Nunca editar entrada antiga.

### `docs/licoes.md` (destilado)

**No momento em que o João mandar refazer, apagar ou mudar de rumo**, registre
ali, na hora. Mesma coisa quando ele aprovar algo de forma explícita.

Cada linha de `licoes.md` cita a data da entrada do diário que a originou.

Gatilhos que **obrigam** registro imediato:

- Ele pediu para desfazer, apagar ou refazer algo.
- Ele reclamou do formato da resposta, não do conteúdo.
- Ele aprovou algo explicitamente.
- Uma suposição sua sobre o gosto ou o método dele se mostrou errada.
- Uma solução técnica falhou por um motivo que vai se repetir (em especial:
  uma rodada de sprite que saiu errada, e por quê).

## SEMPRE

- Responder em português, sem travessão.
- Ler `docs/briefing.md`, `docs/licoes.md` e `docs/roteiro-de-construcao.md`
  no começo de qualquer sessão, e dizer em qual marco o projeto está.
- Estimar créditos do Spriterrific antes de enfileirar qualquer job, e dizer
  o número.
- Rodar `npm run check` e mostrar a saída antes de dizer que terminou.
- Commitar e dar push ao final da tarefa.
- Registrar no diário antes de encerrar.

## NUNCA

- Escrever dentro de um vault do Obsidian, incluindo a Alure, nem no FOS.
- Trocar de engine, ou colocar lógica de um mascote específico no motor.
- Guardar valor de credencial em arquivo.
- Versionar material bruto (vídeo, rodadas inteiras do Spriterrific, ZIP de
  referência). Só o asset final entra no repositório.
- Construir além da v1 antes de a v1 rodar de ponta a ponta.
- Dizer que funciona sem ter rodado.
