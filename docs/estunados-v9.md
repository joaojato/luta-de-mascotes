# Estunados v9: referencias individuais

Refaz a entrega v8 rejeitada pelo usuario por perder a identidade, o estilo e as cores dos personagens-base. As fontes novas foram geradas separadamente com a ferramenta integrada de imagens; cada guarda aprovada foi fornecida diretamente como referencia de identidade, paleta, acabamento e proporcoes.

## Arquivos substituidos

Os seis arquivos stunned.png em public/assets/lutadores/: urubu/frente, almirante/base, saci, cartola/urubu-v1, cachorro/urubu-v1 e galo/urubu-v1.

Formato preservado: RGBA, 1280 por 256 pixels, cinco colunas de 256 pixels, quatro quadros e ultima celula vazia. Os JSONs ja registram stunned com quatro quadros, 6 FPS e repeticao continua. Esta revisao altera arte; nao altera mecanicas ou metadados de combate.

## Revisao e montagem

- Referencias individuais em output/stun-v9/*-idle.png; fontes e prompts individuais na mesma pasta.
- Urubu e Cartola tiveram fontes intermediarias com o terceiro quadro virado para o lado oposto. Urubu usa a fonte fixed-source; no Cartola, uma nova pose individual substitui o terceiro quadro. A primeira tentativa individual do Cartola foi descartada por diferenca de proporcao. Nenhum quadro foi espelhado nem substituido por copia de outra pose.
- A escala usa a altura do componente corporal, sem incluir simbolos soltos. O alinhamento conserva a linha de apoio da guarda. Os simbolos possuem margem dentro da celula.
- Conferencia visual das fontes e dos 24 quadros montados contra as guardas: direcao, membros, figurino, proporcoes e cores. Saci conserva uma unica perna. O redesenho generativo nao e uma edicao pixel a pixel da base.
- Verificacao automatica: dimensoes, margens das fontes, transparencia, celula excedente vazia e hashes. Os 44 testes de src/game/lutadores/lutadores.test.ts passaram. Nao foi feito teste visual dentro do combate.

Revisao animada: output/stun-v9/revisao.html. Comparacao conjunta: output/stun-v9/all-contact.png. Relatorio com caminhos, caixas visuais e hashes: output/stun-v9/report.json. Backups: output/stun-v9/*-previous.png.

Reproduzir previas: python scripts/stun_v9.py. Aplicar: python scripts/stun_v9.py --apply. O pipeline v8 recusa reaplicar o atlas rejeitado quando encontra o relatorio v9.
