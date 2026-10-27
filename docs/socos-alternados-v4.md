# Correção: um soco com cada mão e Saci original

## Correção pedida

O usuário apontou que os leves desenhados na revisão v2 repetiam o mesmo braço, ao contrário da referência do Almirante. Foram refeitos **Urubu, Bira, Cartola e Galo**, com alternância clara de braços. O Saci não precisava dessa padronização: seus socos fraco e forte originais devem ser preservados. Almirante permanece inalterado.

Critério visual: no primeiro impacto, o peito fica visível e a mão de trás protege o rosto. No segundo, o outro ombro passa à frente, o braço oposto cruza o primeiro plano e o tronco gira mostrando as costas. Conferir a origem do braço no ombro, não apenas a posição do punho. Repetir o mesmo jab duas vezes não atende ao pedido.

## Arquivos corrigidos no jogo

**Integrado pelo Claude em 27/10/2026:** os JSONs apontam direto para `light-alternating-v4.png` (Urubu, Bira, Cartola, Galo) e para `light-punch.png`/`heavy-punch.png` (Saci, com FPS 12, acerto no quadro 3 e caixas originais). Os aliases `light-double-jab-v2.png` dessas quatro pastas e `saci/light-double-jab-v2.png`/`saci/heavy-cross-v2.png` saíram do repositório. O `--apply` do pipeline abaixo não tem mais alvo; não reexecutar.

Para evitar depender de nova integração, as folhas **nos caminhos já consumidos pelos JSONs atuais** são substituídas após revisão. Não são editados arquivos TypeScript nem JSON. Preservam-se seis quadros, grade de cinco colunas e células 256×256, transparência e fases de impacto 1 e 3 dos quatro leves corrigidos.

| Personagem | Pasta em `public/assets/lutadores/` | Folha usada atualmente, substituída | Cópia canônica corrigida |
| --- | --- | --- | --- |
| Urubu | `urubu/frente/` | `light-double-jab-v2.png` | `light-alternating-v4.png` |
| Bira | `cachorro/urubu-v1/` | `light-double-jab-v2.png` | `light-alternating-v4.png` |
| Cartola | `cartola/urubu-v1/` | `light-double-jab-v2.png` | `light-alternating-v4.png` |
| Galo | `galo/urubu-v1/` | `light-double-jab-v2.png` | `light-alternating-v4.png` |

Sequência final: 0 guarda; 1 primeiro braço estende; 2 recolhe/transição; 3 outro braço estende com giro; 4 recolhe; 5 guarda. A ordenação das fontes do Urubu e do Galo foi ajustada na montagem para manter esses picos em 1 e 3. Não é uma repetição de quadros de um único braço.

Os pesados desses quatro, a patada do Bira, bengala/Pó de Arroz do Cartola, chutes e especiais próprios ficam preservados.

## Saci — restaurar o que já existia

Fontes originais intactas: `public/assets/lutadores/saci/light-punch.png` e `heavy-punch.png`, ambas com seis quadros. São copiadas exatamente, com hash conferido, para os dois nomes que o jogo estava usando:

- `light-punch.png` → `light-double-jab-v2.png` (alias atual do fraco).
- `heavy-punch.png` → `heavy-cross-v2.png` (alias atual do forte).

Assim os sprites originais voltam a aparecer sem esperar mudança de arquivo no JSON. Para organização futura, Claude pode apontar os dois comandos diretamente aos nomes originais, evitando aliases com nomes de movimentos rejeitados. **Não gerar outro jab duplo nem cruzado padrão para o Saci.** Sua perna única e seu movimento original são preservados.

Temporização e janelas originais para o responsável pela mecânica: ambos a 12 FPS, ataque principal no quadro 3; o fraco atual foi registrado a 14 FPS e janela 1/3 durante a padronização, então Claude deve alinhar esses metadados ao original. A restauração feita aqui é da arte; não altera a lógica em trabalho pelo Claude. O arremesso de cachimbo e o chute baixo do Saci não são revertidos.

## Produção e revisão

Gerado com a ferramenta integrada de imagens (built-in), usando a identidade aprovada de cada personagem e um guia de poses do Almirante. O guia combina o primeiro jab com uma pose de braço oposto e giro evidente para impedir a repetição do mesmo braço.

Fontes, prompts completos, `manifest.json`, guia e backups das seis folhas ativas ficam em `output/socos-alternados-v4/`. `before.json` registra os hashes anteriores. `art-contract.json` registra dimensões, caixas visuais e hashes das quatro correções e duas restaurações. `applied.json` registra os arquivos efetivamente substituídos após revisão.

Prévia antes/depois: `revisao.html`. Comparação dos dois impactos: `comparacao-maos.png`. GIFs e folhas numeradas por personagem acompanham a entrega; Saci tem prévias dos dois originais.

Pipeline: `python scripts/socos_alternados_v4.py` monta e verifica sem alterar as folhas ativas; `python scripts/socos_alternados_v4.py --apply` aplica após conferir todos os hashes dos alvos contra os backups (ou contra a própria correção já aplicada). Recusa sobrescrever mudanças de arte concorrentes. Não executar o pipeline histórico v2 para substituir estes leves ou os socos restaurados do Saci.

Checagens: 24 quadros novos com margens, transparência, contagem e células finais vazias; revisão dos dois impactos de cada personagem; comparação exata dos originais do Saci com os aliases restaurados; nenhum código ou metadado de combate alterado. A verificação visual no jogo após recarregar os assets e os ajustes de janelas/FPS do Saci ficam com Claude.
