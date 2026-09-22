# Prompt para o Codex gerar as sheets que faltam

O Codex ganhou geração de imagem (`image_gen`, gpt-image-2) e consegue rodar
o pipeline inteiro sozinho: gerar, alinhar, registrar e conferir. Isso serve
para rodar na máquina que fica ligada, liberando a principal.

**Antes de colar:** o repositório é privado, então a máquina precisa estar
autenticada no GitHub como `joaojato`. E `npm install` precisa ter rodado ao
menos uma vez.

Trocar a lista de ações quando for outro mascote ou outra skin.

---

Você vai gerar sprite sheets para um jogo de luta 2D e deixá-las funcionando
no jogo. O repositório é https://github.com/joaojato/luta-de-mascotes
(privado). Clone, rode `npm install` e trabalhe numa branch nova chamada
`sprites-urubu-frente`.

## O que já existe e você não deve reinventar

O projeto tem o pipeline pronto em `scripts/sprite.py`. Leia
`docs/pipeline-arte.md` antes de começar. Em resumo:

- `npm run sprite -- pedido <slug> <acao> --skin <skin>` monta, em
  `referencia/pedidos/<slug>-<acao>/`, três arquivos: `1-personagem.png` (o
  mascote), `2-movimento.png` (a mesma ação num lutador que já está no jogo,
  uma fileira de quadros) e `prompt.txt`.
- `npm run sprite -- entrega <slug> <acao> <arquivo> --skin <skin>` pega a
  imagem gerada, recorta o fundo, separa os quadros, alinha todos na mesma
  escala com os pés na mesma linha, monta a grade de 256×256 que o motor lê,
  salva em `public/assets/lutadores/<slug>/<skin>/<acao>.png` e atualiza
  `src/game/lutadores/<slug>.json`.

Você não precisa escrever código para nada disso. Se algo falhar, conserte o
script em vez de contornar por fora.

## A tarefa

Gerar estas sete ações do mascote `urubu`, na skin `frente`, uma de cada vez:

    walk-forward  walk-backward  crouch  jump  block-high  hit-high  knockdown

Para cada ação, nesta ordem:

1. `npm run sprite -- pedido urubu <acao> --skin frente`
2. Abra as duas imagens do pedido com `view_image` para elas entrarem no seu
   contexto, e leia `prompt.txt`.
3. Gere a imagem com `image_gen`, usando `1-personagem.png` como referência
   de personagem e `2-movimento.png` como referência de movimento, e o texto
   de `prompt.txt` como instrução. Fundo branco liso.
4. Salve o resultado em `referencia/urubu/<acao>-gpt.png`.
5. `npm run sprite -- entrega urubu <acao> referencia/urubu/<acao>-gpt.png --skin frente`
6. Olhe a sheet que saiu em `public/assets/lutadores/urubu/frente/<acao>.png`
   e confira a lista de aceitação abaixo. Se reprovar, gere de novo (até três
   tentativas por ação) antes de seguir.

## Lista de aceitação, por sheet

Reprove e gere de novo se qualquer item falhar:

- O personagem é o mesmo em todos os quadros: mesma cabeça de urubu, mesmo
  bico laranja, mesma camisa listrada vermelha e preta, mesmo calção branco,
  mesmas meias listradas. Sem deriva de cor ou de proporção entre quadros.
- Todos os quadros virados para a **esquerda**, de lado. Nenhum quadro
  olhando para a câmera.
- O número de quadros bateu com o que o comando pediu (ele imprime).
- Corpo inteiro visível em todo quadro, nada cortado na borda.
- Sem texto, número, escudo, logo, patrocínio, sombra no chão, brilho,
  linha de movimento ou segundo personagem.
- Nada de sangue nem de realismo: é mascote de torcida, não Mortal Kombat.

## Depois das sete

1. `npm run check` e mostre a saída inteira. Tem de passar typecheck, testes
   e build. Se um teste quebrar, leia o que ele cobra e conserte a causa.
2. Suba `npm run dev`, abra a cena `Academia` no navegador, selecione
   "Urubu (3/4 de frente)" e passe ação por ação, quadro a quadro. Tire um
   print de cada ação e diga o que viu. A cena se navega com A/D para trocar
   lutador, W/S para trocar ação, vírgula e ponto para andar quadro a quadro.
3. Commite com mensagem curta em português, sem travessão, e abra um pull
   request descrevendo o que entrou e o que ficou de fora.

## Regras do projeto que valem para você

- Responda em português do Brasil, sem travessão.
- Não troque de engine, não mexa no motor para acomodar um mascote
  específico: mascote é dado (JSON), nunca código.
- Material bruto (as imagens que você gerar antes do alinhamento) fica em
  `referencia/`, que está fora do git. Só a sheet final entra no repositório.
- Não escreva em nenhuma pasta do Obsidian.
- Não diga que funciona sem ter rodado. Mostre a saída.
- Ao terminar, acrescente uma entrada em `docs/diario-de-bordo.md` no formato
  fixo que já está no arquivo, dizendo o que deu errado e quantas tentativas
  cada ação levou.

## O que fazer se a geração falhar

O gerador falha às vezes ("a ferramenta não retornou uma imagem"). Tente de
novo antes de mudar qualquer coisa. Se falhar três vezes seguidas na mesma
ação, pule para a próxima e diga no final quais ficaram pendentes.
