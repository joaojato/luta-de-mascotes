# Raposa do Cruzeiro — laranja e chapéu menor

Pedido de 05/11/2026: usar a nova imagem apenas como referência de cores
para tornar a raposa laranja, e deixar o chapéu ligeiramente menor.
Mantidos pose/guarda para a esquerda, anatomia, expressão malandra,
olhos sob a aba, mãos enfaixadas brancas e shorts azuis com faixas brancas.
Pelagem laranja dourada com sombras alaranjadas escuras e áreas creme no
focinho, garganta, centro do peito/abdômen, interior das orelhas e ponta
da única cauda. Não importar camisa, calçados, escudo, texto ou proporções
dos mascotes do cartaz.

Edição feita com a ferramenta de imagens embutida, usando a base v1 como
alvo e o cartaz como referência somente de paleta. A primeira redução
da aba foi grande demais e foi ajustada antes da entrega; a largura na
faixa horizontal da aba ficou aproximadamente 15,6% menor que a v1.
Chapéu mantém a palha, faixa marrom, inclinação e sombra sobre os olhos.

## Arquivos

- Base transparente: `referencia/cruzeiro/base-raposa-v2-laranja.png`.
- Versão 256×256: `referencia/cruzeiro/base-raposa-v2-laranja-256.png`.
- Cópias: `public/assets/lutadores/raposa/bases/base-v2-laranja.png` e
  `base-v2-laranja-256.png`.
- Prompt principal: `referencia/cruzeiro/prompt-base-raposa-v2-laranja.txt`.
- Prompt do ajuste da aba, fonte magenta, relatório com hashes e revisões
  sobre fundos claro/escuro/cinza: `output/raposa-cruzeiro-v2/`.
- Comparação na mesma escala: `output/raposa-cruzeiro-v2/antes-depois.png`.

Recorte remove somente a cor chave magenta, sem redesenhar/recolorir
pixels do personagem por script. PNG RGBA, alfa binário, nenhum resíduo
magenta ou halo. A versão reduzida usa a mesma escala de corpo e linha
dos pés da v1; a redução do chapéu não aumenta o corpo para preencher
a célula. Fonte e versão reduzida conferidas visualmente: duas mãos e
faixas, dois pés, duas orelhas, uma cauda, pose e sorriso preservados.

Reproduzir montagem/validação: `python scripts/raposa_cruzeiro_base_v2.py`.
Somente revisão da base; não foram geradas animações nem registrado um
lutador incompleto. V1 preservada como histórico. V2 aguarda revisão
visual do usuário, sem aprovação presumida.
