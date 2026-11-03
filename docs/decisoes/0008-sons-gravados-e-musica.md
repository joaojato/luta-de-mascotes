# ADR 0008: sons gravados (CC0) e música montada no navegador

**Data:** 2026-11-03
**Status:** aceito (pedido do João: efeitos "extremamente genéricos" e "muito
digitalizados"; música de arquibancada que acelera com a vida)

Substitui em parte a ADR 0007: a síntese continua, mas só para o que não tem
gravação boa (apito de juiz, laser, voz de porco e galo).

## Contexto

Os efeitos eram todos sintetizados em Python (ADR 0007). Em 30/10 o João já
tinha dito que não agradavam; em 03/11 pediu personalidade por mascote, som
menos eletrônico, com Hotline Miami de referência, e música o jogo inteiro,
de arquibancada sul-americana com cara de jogo retrô, que fica mais rápida e
tensa conforme a vida cai.

Síntese pura não tira o "digital" do som. E música que acelera sem ficar
aguda não pode ser um arquivo pronto tocado mais rápido.

## Decisão

1. **Efeitos gravados.** Base de efeitos vem de pacotes CC0 do OpenGameArt
   (domínio público, sem atribuição obrigatória), tratados por
   `scripts/sons_gravados.py` com o ffmpeg: camadas, grave, saturação,
   compressão. Material bruto em `referencia/sons-cc0/`, fora do git.
2. **Timbres da música do FluidR3 GM (MIT).** Percussão de marcha, cuíca,
   güiro e agogô saem do `FluidR3Mono_GM.sf3` do MuseScore; trompete,
   acordeão, baixo e coro das notas do mesmo FluidR3 renderizadas por
   gleitz/midi-js-soundfonts. `scripts/musica_amostras.py` prepara tudo. A
   licença MIT vai junto das amostras (`public/assets/audio/musica/LICENCA-FluidR3.txt`).
3. **Música montada nota a nota** no Web Audio do Phaser
   (`src/game/musica/`), sem biblioteca nova. Os temas são dado.

Ferramentas na máquina, não dependências do projeto: ffmpeg (já instalado) e
7-Zip (só para extrair os pacotes `.7z` uma vez).

## Alternativas descartadas

- **Seguir na síntese:** foi o que o João recusou duas vezes.
- **Freesound:** muito mais acervo, mas download exige conta e cada som tem
  licença própria (CC-BY pede crédito um a um). CC0 do OpenGameArt basta.
- **Kenney:** CC0, mas o site recusa download por script.
- **Música em MP3 pronto com variações por tensão:** troca de faixa dá
  degrau audível, e acelerar o arquivo sobe o tom. Montar nota a nota deixa
  o andamento contínuo.
- **Tone.js ou biblioteca de sequenciador:** dependência nova para o que
  são umas 200 linhas sobre o Web Audio que o Phaser já abre.
- **Chiptune:** o João pediu menos eletrônico; "retrô" ficou no timbre de
  16 bits (amostra reamostrada a 22 kHz, agudo cortado em 8 kHz).

## Consequências

- O agente escolhe gravação por medida (duração, grave, ataque), sem ouvir.
  Trocar um som é trocar o nome do arquivo na receita e rodar o script.
- Regerar exige baixar o material bruto de novo (o script sabe).
- O jogo carrega mais 2,9 MB de amostras de música.
- `scripts/sons.py` não grava por cima das chaves que têm receita gravada.
