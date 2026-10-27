# Revisão de artes: esquiva, salto e guarda

Pedido do usuário: o Claude cuida das mecânicas; esta entrega altera somente as artes e sua documentação/pipeline de montagem. Não escrever código de combate nem os JSONs dos lutadores.

## Arquivos substituídos

São 21 folhas, nos caminhos já consumidos pelo jogo:

- Urubu (`public/assets/lutadores/urubu/frente/`): `crouch.png`, `jump.png`, `block-high-v2.png`, `block-low.png`.
- Bira (`public/assets/lutadores/cachorro/urubu-v1/`), Cartola (`public/assets/lutadores/cartola/urubu-v1/`) e Galo (`public/assets/lutadores/galo/urubu-v1/`): `crouch.png`, `jump.png`, `block-high.png`, `block-low.png` de cada um.
- Almirante (`public/assets/lutadores/almirante/base/`): `crouch.png`, `jump.png`, `block-high.png`, `block-low.png`.
- Saci (`public/assets/lutadores/saci/`): somente `jump.png`; suas defesas e agachamento existentes são as referências preservadas.

Variantes antigas da Academia e lutadores de demonstração não fazem parte deste conjunto.

## Contrato visual

- Agachar: 5 quadros, primeiro em pé, segundo de transição, restantes em agachamento profundo. Manter o último abaixado, sem levantar sozinho. Pés na linha do idle; membros dobram sem reduzir o tamanho anatômico do personagem.
- Bloqueio alto: 4 quadros; transição de guarda para as duas mãos e antebraços protegendo rosto/peito pela frente. Últimos dois quadros sustentam a proteção, segundo o princípio do Saci. Não terminar voltando ao idle.
- Bloqueio baixo: 4 quadros; baixar o corpo e sustentar a proteção frontal nos últimos dois. Não segurar a cabeça atrás das orelhas nem abrir a guarda no fim.
- Saltos de 8 quadros: 0 em pé, 1–2 preparação/pose de aterrissagem; **3–7 exclusivamente aéreos**. O último não volta a ficar plantado no chão.
- Salto do Saci: 6 quadros; 0 em pé, 1 preparação, **2–4 aéreos**, 5 aterrissagem, mantendo uma única perna. Preservar a configuração já existente do personagem.
- Durante os quadros aéreos, cabeça/crista/chapéu ficam na mesma altura local da célula. O corpo não percorre uma segunda parábola dentro da folha: o motor aplica a trajetória física. As pernas articulam para preparar a descida.

Dimensões das imagens, grade de cinco colunas de 256×256, número e ordem dos quadros e caminhos existentes são preservados. FPS, eventos, colisão, input, esquiva funcional e ataques aéreos continuam sob responsabilidade da implementação de mecânicas. Nenhuma ação nova é registrada por este trabalho.

As caixas efetivamente medidas de cada quadro são exportadas em `output/revisao-poses/report.json`, para eventual ajuste de metadados pelo responsável pelas mecânicas. O JSON de runtime não é atualizado por este pipeline.

## Produção e conferência

Geradas com a ferramenta integrada de imagens. O Urubu corrigido é o guia quadro a quadro para Bira, Cartola e Galo; Saci é referência para sustentar a guarda. As aparências e figurinos aprovados são preservados.

Prompts completos, referências, hashes dos arquivos originais e especificações: `output/revisao-poses/manifest.json` e `output/revisao-poses/<id>/<acao>-prompt.txt`. Backups das artes anteriores: `<acao>-before.png`. Folhas novas montadas: `<acao>-packed.png`. GIFs por ação: `<acao>-preview.gif`. Comparação antes/depois: `output/revisao-poses/revisao.html`.

Pipeline: `python scripts/revisar_poses.py prepare`, geração das artes, `attach-guides` para reutilizar o Urubu corrigido, `import` e `verify`. A importação recusa substituir uma arte cujo hash mudou após a preparação, para detectar edição concorrente. Não executar `prepare` novamente durante uma importação em andamento.
