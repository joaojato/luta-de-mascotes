# Torcida: comemoração intensa sem camisa

**Escopo corrigido pelo usuário:** esta entrega isolada não atende à comemoração de toda a torcida. Substituída pela [comemoração coletiva v3](torcida-coletiva-v3.md); não carregar este atlas no jogo.

Pedido de 03/11/2026: nova animação de comemoração; torcida sem camisa. Esta correção prevalece sobre o figurino com camisa descrito na entrega v1.

Arte adicional de um torcedor adulto, baseada no primeiro tipo de `torcedores.png`: pele marrom, cabelo curto preto, barba e calça preta. Peito e braços descobertos em todos os quadros. Produzida com a ferramenta integrada de imagens, uma chamada para este personagem e esta ação. A referência antiga foi anexada para identidade, cores e acabamento; a camisa foi removida conforme o pedido.

## Arquivos

- `public/assets/cenarios/estadio/torcida/comemoracao-sem-camisa-v2.png`: RGBA 256×160, células 64×80, quatro colunas e duas linhas, oito quadros em ordem de leitura.
- `public/assets/cenarios/estadio/torcida/comemoracao-sem-camisa-v2.json`: manifesto individual; 8 FPS sugeridos, loop, âncora (32,79).
- `output/torcida-comemoracao-v2/comemoracao.gif`: prévia ampliada.
- `output/torcida-comemoracao-v2/contato.png`: oito quadros para revisão.
- Fonte, referência, prompt completo, script de montagem e hashes: `output/torcida-comemoracao-v2/`.

## Movimento e revisão

Preparação com punhos junto ao corpo; braços sobem; abertura em V; pico do pulo com dois punhos acima; aterrissagem; punho direito alto; punho esquerdo alto; recolhimento para reiniciar. Braço A é o direito anatômico, à esquerda da imagem; B é o esquerdo. Não há giro nem cruzamento. Pernas ficam ocultas pela composição da arquibancada.

Fonte e oito quadros montados inspecionados visualmente: mãos completas, braços ligados aos ombros, peito descoberto, identidade e iluminação coerentes, margens e leitura no tamanho final. A montagem aplica escala uniforme de 0,15 e pequenos deslocamentos verticais, sem deformar partes. A transparência residual de baixa opacidade da fonte foi limpa por limiar de alfa. Dimensões e margens verificadas por script. O arquivo final tem transparência real.

## Integração

Entrega de arte: não altera `torcida.json` nem o código da cena. O atlas antigo contém dez tipos e quatro poses por tipo; esta folha contém um tipo e oito quadros, portanto não pode substituí-lo diretamente. Carregar como ação adicional, ler a grade 4×2 e percorrer os índices 0–7. O peito não recebe recoloração de camisa. Bandeiras e efeitos continuam responsáveis pelas cores dos clubes nesta ação.

Teste em combate, reprodução no runtime e aceite visual do João permanecem pendentes. As roupas dos outros nove tipos antigos não foram redesenhadas nesta ação.
