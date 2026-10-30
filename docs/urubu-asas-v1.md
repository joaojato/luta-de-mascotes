# Urubu — pesado com abertura das duas asas

Pedido do usuário: substituir o cruzado pesado por abertura das duas asas,
longas como as de um urubu, com mais alcance e fechamento demorado/coeso,
sem exagerar na envergadura. Exceção específica do Urubu; os golpes dos
outros lutadores mantêm seus contratos atuais.

Identidade e paleta: primeiro quadro do `idle.png` efetivamente usado pela
skin `frente`. Penas carvão/pretas, bico amarelo, camisa horizontal vermelha
e preta, calção branco, faixas vermelhas/pretas nas canelas, botas escuras.
Sem clareamento/azulamento das penas, luz nova, escudo ou efeitos.

## Anatomia e coreografia

As asas são os dois braços existentes, com penas longas desdobrando ao longo
dos antebraços. A, braço próximo à direita da guarda, vira a asa direita;
B, braço distante à esquerda, vira a asa esquerda. Não gerar quatro braços
nem crescer os ossos. O tronco abre moderadamente para a frente, enquanto
a cabeça continua olhando para a esquerda. As pernas mantêm seus quadris
e a base de apoio. O fechamento dobra cotovelos/punhos e sobrepõe as penas
gradualmente, voltando à guarda original.

Guarda: 200 px de altura anatômica. Envergadura máxima planejada: cerca de
340–365 px, com margem na célula. Usar células **512×256**, cinco colunas;
não reduzir o corpo para caber com asas longas numa célula 256×256.

| Fase | Quadros | Uso |
|---|---|---|
| Preparação e abertura | 0–5 | Desdobramento progressivo |
| Contato | 6–8 | Asas abertas, janela única de acerto |
| Recuperação | 9–19 | Onze quadros sem caixa ofensiva, recolhimento e guarda |

20 quadros a 16 FPS, sem repetição: duração total 1,25 s, recuperação após
o último quadro ativo de aproximadamente 0,69 s. O quadro8 sustenta
intencionalmente a pose7 por mais uma batida de contato; a recuperação usa
onze desenhos novos, sem repetir uma pose para esconder falha de movimento.
Primeiro e último quadros usam a guarda original, apenas centralizada na
célula larga. O passo curto de abertura mantém a regra de avanço dos pesados.

## Arquivos e integração

Destino: `public/assets/lutadores/urubu/frente/heavy-wing-spread-v1.png`.
A ação continua `heavy-punch`; o cruzado antigo fica preservado em arquivo.
Fontes de abertura/fechamento, prompts, guias A/B, contatos e prévia em
`output/urubu-asas-v1/`. Montagem: `scripts/urubu_asas_v1.py`.

O suporte opcional a `frameWidth` em `FighterActionSpec` permite carregar a
asa inteira. A caixa corporal do idle é deslocada dentro da célula larga
para continuar no mesmo lugar do mundo; a extensão visual das asas aumenta
o alcance do golpe. O dano do pesado permanece o existente. O fechamento
termina antes de o motor liberar a próxima ação, sem novas caixas de ataque.

As fontes e cada quadro montado precisam ser inspecionados antes de aplicar.
A primeira fonte de fechamento teve as solas cortadas na borda inferior;
foi separada como rejeitada e reenviada à ferramenta para reparo. Acrescentar
uma borda vazia por script não conserta desenho cortado.

Estado: produção e integração em andamento.
