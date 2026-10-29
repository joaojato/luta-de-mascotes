# Estunados: ciclo de tontura

> ENTREGA REJEITADA pelo usuario por divergencia das bases. Substituida pela [revisao v9](estunados-v9.md). As afirmacoes de validacao abaixo descrevem a entrega antiga e nao constituem aprovacao. Nao reaplicar o atlas v8.

Pedido de 29/10/2026: todos os seis lutadores atuais ficam visivelmente confusos, com corpo cambaleando, braços frouxos, olhos desfocados e símbolos cartoon sobre a cabeça. Esta entrega substitui o adiamento das artes de vítimas estunadas.

Arte gerada com a ferramenta de imagens a partir das guardas aprovadas. As quatro poses oscilam cabeça e tronco sem trocar membros; Saci conserva uma única perna. X, estrelas amarelas e espirais ciano mudam de posição sobre uma elipse pontilhada. O efeito está incorporado às poses, não exige partícula separada.

## Arquivos entregues

Todos em `public/assets/lutadores/`, arquivo `stunned.png`:

| Lutador | Pasta |
| --- | --- |
| Urubu | `urubu/frente` |
| Almirante | `almirante/base` |
| Saci | `saci` |
| Cartola | `cartola/urubu-v1` |
| Bira | `cachorro/urubu-v1` |
| Galo | `galo/urubu-v1` |

RGBA transparente, 1280×256, cinco colunas de 256×256. Quatro quadros válidos (0–3); quinta célula vazia. Sugestão: ação `stunned`, 6 FPS, repetição contínua (`repeat: -1`). Todos os quadros já representam tontura; não iniciar com guarda para evitar interrupção visual a cada volta. Encerrar o ciclo imediatamente ao terminar o estado de stun.

## Integração pendente para Claude

Conforme a divisão do projeto, esta entrega não altera TypeScript nem JSON de runtime. Registrar a ação nos seis lutadores e selecioná-la durante o atordoamento de Pó de Arroz; preservar defesa/blockstun, dano, duração de 1,5 s e regras de combate existentes. Não usar o retângulo dos símbolos como caixa vulnerável nem ativar caixas ofensivas. Reação breve a golpe e atordoamento prolongado precisam continuar distinguíveis na lógica.

`output/stun-v8/claude-integration.json` contém caminhos, hashes e caixas visuais completas, incluindo símbolos. `output/stun-v8/revisao.html` mostra os seis ciclos animados; contatos individuais comparam idle e os quatro quadros. Fonte: `atlas-source.png`; prompt: `prompt.txt`. Montagem reproduzível: `python scripts/stun_v8.py`.

Conferidos visualmente fonte e 24 quadros montados: continuidade dos membros, pé de apoio, figurino, expressões, cartola/cristas e órbita sem cortes. Verificados dimensões, transparência, contagem e célula excedente vazia. Sem teste de combate: a ação ainda depende da integração.
