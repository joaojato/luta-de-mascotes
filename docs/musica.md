# Música do jogo (03/11/2026)

Pedido do João: música o jogo inteiro, "estilo arquibancada argentina no
estilo de jogo retrô", com Los Pibes Chorros, "Domingo eu vou ao Maracanã" e
sambas antigos de arquibancada de referência. Na luta, mais tensa, acelerando
conforme a vida cai. Desenho em
`docs/superpowers/specs/2026-11-03-som-e-musica-design.md`; decisão na ADR 0008.

## Como funciona

- **Montada nota a nota** no Web Audio do Phaser (`src/game/musica/`): o
  andamento sobe sem a música ficar aguda.
- `temas.ts`: os dois temas como dado. Compasso de 16 passos; batida é uma
  string (`x` bate, `o` fraco, `.` cala); melodia é lista de notas MIDI.
- `sequenciador.ts`: a parte pura e testada (andamento, camadas, o que toca
  em cada passo, afinação a partir da nota gravada mais perto).
- `tocador.ts`: agenda 150 ms à frente, uma música para o jogo inteiro.
  Volume pelo ajuste "Música".
- Amostras em `public/assets/audio/musica/`, preparadas por
  `scripts/musica_amostras.py` (FluidR3 GM, MIT, licença na pasta).

## Os temas (melodias nossas, nada copiado)

| Tema | Onde | Estilo | Harmonia | Andamento |
|---|---|---|---|---|
| `menu` | menus, seleção, Academia, Museu | samba de arquibancada: surdos, caixa, tamborim, chocalho, agogô, cuíca, trompete, coro, apito do mestre | C, A7, Dm, G7 | 104 BPM fixo |
| `luta` | a luta | cumbia de hinchada: bombo, güiro, baixo, acordeão no contratempo, trompete, coro | Am, G, F, E | 96 a 140 BPM |

## Tensão na luta

Tensão = a vida perdida do mais machucado dos dois (0 a 1). Ela anda até o
alvo aos poucos, a cada passo.

| Tensão | Entra |
|---|---|
| 0 | bombo, güiro, baixo, acordeão (abafados, "do outro lado do estádio") |
| 0,2 | caixa e chocalho |
| 0,45 | trompete puxando o canto, prato a cada volta |
| 0,7 | coro de "ôôô" e repique |
| 0,88 | rufo de caixa, bombo dobrado, agogô, apito |

O andamento sobe em linha reta (96 a 140 BPM) e o filtro abre (1,4 kHz a
12 kHz). Camada nova só entra na virada do compasso. K.O. ou tempo esgotado
param a música com uma pancada (bumbo, caixa, prato); o próximo round começa
de novo do calmo. Pausa cala a música; sair da luta volta ao tema do menu.

Medido no navegador (03/11/2026): menu a 104 BPM; luta com vida cheia a
96 BPM só com a base; P2 a 40% a 122 BPM com caixa e trompete; P2 a 4% a
138 BPM com todas as camadas.

## Mexer

- Trocar melodia ou batida: editar `temas.ts`; os testes de
  `musica.test.ts` conferem compasso, alcance das notas e amostras.
- Instrumento novo: acrescentar em `scripts/musica_amostras.py` e em
  `NOTAS_GRAVADAS`/`PERCUSSAO` no sequenciador, rodar o script.
