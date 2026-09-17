# ADR 0002: Spriterrific como gerador de sprite

**Data:** 2026-09-17
**Status:** aceito, com reavaliação marcada para o fim do Marco 2

## Contexto

Um jogo de luta precisa de dezenas de quadros por personagem, todos com o
mesmo mascote. Modelos de imagem genéricos (Midjourney, GPT Image, Nano
Banana) geram uma imagem boa e não seguram identidade ao longo de 40 quadros.
Esse é o gargalo histórico de jogo de luta feito por uma pessoa só.

## Decisão

Spriterrific (spriterrific.com) gera personagem e animações a partir de uma
imagem de referência, via API, com a skill oficial `spriterrific-api` dentro
desta pasta. A referência do mascote vem de um modelo de imagem único (Nano
Banana Pro ou GPT Image).

Na prática: o agente enfileira jobs de dentro da sessão, estima o custo em
créditos antes, baixa a sheet e escreve o JSON do mascote. Rodadas brutas
ficam em `spriterrific-runs/`, fora do git.

## Alternativas descartadas

- **Gerar quadro a quadro num modelo de imagem.** Não segura identidade, e
  cada quadro é uma rolagem de dado. Fica como plano C, com 3 a 5 quadros
  por golpe, se tudo mais falhar.
- **PixelLab.** Pixel art em grade real, com esqueleto e MCP. Não descartado:
  é o **plano B** se o modo mixels do Spriterrific não agradar. Decisão no
  fim do Marco 2.
- **Desenhar à mão no Aseprite.** Fora da capacidade de tempo do João.
- **Sprites prontos de asset pack.** Não existem mascotes de clube brasileiro
  prontos, e o projeto perderia a identidade.

## Consequências

- Custo por mascote da v1: cerca de 1.060 créditos (60 do personagem a partir
  de imagem, mais 100 por ação, 10 ações). Os 500 grátis validam o estilo com
  um mascote parcial antes de comprar.
- O visual será pixel art de alta fidelidade sem grade rígida (mixels). A
  ferramenta declara que o estilo 16-bit arcade do SF2 ainda não é servido.
  O João aceita isso ao aceitar esta ADR; se não aceitar, o caminho é PixelLab.
- Chave em `SPRITERRIFIC_API_KEY` no `.env`. Nunca em arquivo versionado.
- A skill é cópia da versão 1.3.2 do repositório do autor. Atualizar quando a
  API mudar, comparando com o upstream.
