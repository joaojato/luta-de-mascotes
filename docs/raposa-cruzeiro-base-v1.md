# Raposa do Cruzeiro — primeira base

Atualização de 05/11/2026: a [base v2](raposa-cruzeiro-base-v2.md) tem
pelagem laranja e chapéu ligeiramente menor, conforme a correção posterior
do usuário. Esta primeira versão branca permanece como histórico.

Pedido de 04/11/2026: raposa branca baseada na referência de boxeador,
sem camisa, mãos enfaixadas, shorts azuis; personalidade malandra,
confiante e menos durona. Chapéu de palha grande, aba baixa sombreando
e tentando esconder os olhos, faixa de couro marrom como no acessório
enviado. Guarda de luta voltada para a esquerda.

Somente uma base neste pedido. Referência da raposa define identidade;
foto do chapéu define o acessório; `referencia/urubu/modelo-oficial.png`
define traço, proporções e guarda. Pixel art arcade, contornos escuros,
sombras em blocos, anatomia compacta, mãos/pés grandes, sem logos/texto.
Dois braços, duas pernas e uma única cauda. Membros A direitos próximos
e B esquerdos distantes, conexões ombro/quadril legíveis.

Fonte e prompt: `referencia/cruzeiro/base-raposa-v1.png` e
`referencia/cruzeiro/prompt-base-raposa-v1.txt`.
Produzida com a ferramenta de imagens embutida. Estado: conceito inicial,
aguarda revisão visual do usuário; não é aprovação presumida.

Entrega: PNG de referência em resolução integral e versão alinhada em
`referencia/cruzeiro/base-raposa-v1-256.png` (célula 256×256, altura visível
200 px, pés em y228). Cópias em `public/assets/lutadores/raposa/bases/`.
Somente a base foi produzida; não há registro de lutador ou animações.

A primeira saída transparente tinha opacidade intermediária inclusive
no interior do personagem. Foi refeita pela ferramenta sobre magenta
opaco, preservando o desenho; a cor chave foi removida sem corroer o
contorno nem as áreas brancas. PNG final com alfa somente 0/255, nenhum
resíduo magenta, corpos/chapéu/cauda completos e margens livres.

Comparação em escala real e ampliada nos fundos claro, escuro e cinza:
`output/raposa-cruzeiro-v1/revisao-base.png`. Relatório com hashes em
`output/raposa-cruzeiro-v1/report.json`. Prompt da limpeza e fonte opaca
na mesma pasta. Montagem reproduzível: `python scripts/raposa_cruzeiro_base_v1.py`.
Fonte e versão reduzida inspecionadas visualmente: duas mãos/faixas,
dois pés, duas orelhas, uma cauda, pose para a esquerda e sorriso visível
sob a aba. Camadas brancas de pelo e faixas mantêm separação por contorno.
