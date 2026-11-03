# Som com personalidade e música de arquibancada (03/11/2026)

Pedido do João: os efeitos estão "extremamente genéricos" e "muito
digitalizados". Cada golpe precisa soar de quem bate. E o jogo ganha música
o tempo todo, de arquibancada sul-americana com cara de jogo retrô, que na
luta fica mais tensa e mais rápida conforme a vida cai.

Referências dele: "Domingo eu vou ao Maracanã", sambas antigos de
arquibancada, Los Pibes Chorros, música sul-americana. Hotline Miami é a
referência dos efeitos.

## Efeitos

- **Gravação, não síntese.** A base dos efeitos passa a ser som gravado de
  licença CC0 (OpenGameArt), tratado num script: corte curto, grave
  reforçado, saturação e compressão (o peso sujo de Hotline Miami). A síntese
  de `scripts/sons.py` fica só para o que não tem gravação boa.
- **Material bruto fora do git.** Os pacotes baixados vão para
  `referencia/sons-cc0/`; só o WAV final entra em `public/assets/audio/sfx/`.
  O script sabe baixar tudo de novo.
- **Golpe com dono.** O som do acerto passa a ser evento do atacante
  (`acerto-leve`, `acerto-pesado`, `acerto-baixo`, `acerto-especial`), que o
  bloco `sons` do JSON troca como qualquer outro (Regra do Som). Cada mascote
  ganha uma família de material: o Almirante bate madeira de navio, o Porco
  bate pesado e molhado, o Mosqueteiro corta com aço, e assim por diante.
- Defesa continua som do motor, igual para todos.

## Música

- **Montada nota a nota no navegador** (Web Audio, dentro do gerenciador de
  som do Phaser), para o andamento acelerar sem a música ficar aguda.
- **Timbre de 16 bits:** instrumento gravado (soundfont FluidR3 GM, MIT)
  reamostrado baixo, com cara de cartucho. Nada de bip de chiptune.
- **Dois temas, melodias nossas.** Nada copiado das referências.
  - Menu: samba de arquibancada, surdo, caixa, tamborim, trompete e coro
    de "ôôô".
  - Luta: cumbia de hinchada em lá menor, cadência andaluza (Am, G, F, E),
    güiro, baixo, acordeão, bombo, trompete de torcida.
- **Tensão na luta = vida mais baixa dos dois.** De 0 a 1, ela sobe o
  andamento (de 96 para 140 BPM) e acrescenta camadas: caixa, trompete,
  coro, repique dobrado. Com a tensão baixa a música soa abafada, "vindo da
  arquibancada"; com a tensão alta, abre.
- K.O. corta a música com uma pancada final. Fora da luta volta o tema do
  menu.
- Volume pelo ajuste "Música" que já existe.

## Fora do escopo

- Voz cantada com letra (pede gravação de gente).
- Tema próprio por mascote.

## Calls do construtor (Claude)

- Fontes CC0 escolhidas por medida (duração, grave, ataque), porque o agente
  não ouve. O ouvido final é do João; trocar um som é trocar um nome no
  script.
- O andamento anda a cada passo, aos poucos; camada nova só entra na virada
  do compasso, nunca no meio da frase.
