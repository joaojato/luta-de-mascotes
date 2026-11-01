# Controles, chave do mata-mata e treino livre (01/11/2026)

Pedido do João em 01/11/2026, em cinco frentes. Exceção à Regra da v1 aberta
por ele no mesmo dia.

## 1. Teclado: dois jeitos de jogar no computador

| Quem | Andar | Soco | Chute | Defesa | Especial |
|---|---|---|---|---|---|
| P1 | W A S D | E | Q | C | Espaço |
| P2 (dois no teclado) | O K L Ç | P | I | ; | Shift direito |
| P1 sozinho (extra) | W A S D | O | I | P | Espaço |

- Coop é o 1 VS 1. Sozinho é todo modo em que o P2 não está no teclado
  (contra a CPU, torneio, treino livre).
- No modo sozinho, Q E C continuam valendo; I O P são a opção da outra mão,
  na mesma ordem: I = Q (chute), O = E (soco), P = C (defesa). Correção do
  João no mesmo dia; a primeira versão espelhava o P2 (P soco, O defesa).
- Teclado ABNT2: o Ç é a tecla `SEMICOLON` do navegador e o `;` é a
  `FORWARD_SLASH`. Os nomes na tela seguem o ABNT2.
- Shift só vale do lado do dono: no P2, só o direito. O esquerdo fica livre,
  para a mão do P1 não soltar o especial do P2 sem querer.
- Os controles salvos mudam de chave no navegador (`controles-v2`): quem tinha
  remapeado volta ao padrão novo uma vez.
- Na Seleção do 1 VS 1, o P2 anda com O K L Ç (as setas continuam) e confirma
  com Enter ou Shift direito.

## 2. Celular: botões de Xbox por padrão, PlayStation como opção

Posição fixa, só a cara muda:

| Posição | Xbox | PlayStation | Comando |
|---|---|---|---|
| baixo | A verde | ✕ azul | soco |
| direita | B vermelho | ○ vermelho | defesa |
| esquerda | X azul | □ rosa | chute |
| cima | Y amarelo | △ verde | especial |

- As letras e os símbolos são desenhados em SVG, nunca texto (lição de
  31/10/2026, lupa do iPhone).
- O nome dos golpes some por padrão. O menu hambúrguer tem "Nomes dos golpes"
  (liga e desliga) e "Botões: Xbox / PlayStation". Tudo salvo no aparelho.
- O nome é o do golpe que sai agora, conforme o lutador está: de pé, abaixado
  ou no ar. Vem do JSON do lutador, campo `nomes` (um nome curto por golpe do
  catálogo, até 10 letras). Sem o campo, nome genérico.
- O especial fica apagado enquanto não pode sair (barra vazia ou no ar).
- Os ids do layout salvo viram posição (`cima`, `direita`, `baixo`,
  `esquerda`); o arranjo salvo antes disso volta ao de fábrica.

## 3. Mata-mata

- Linhas de chave ligando as duas lutas de cada par à luta seguinte (o
  colchete clássico de chaveamento), na cor da borda, e na cor do P1 no
  caminho do jogador.
- Foto da chave e da tabela vira close do rosto: campo `rosto` no JSON
  (`x`, `y`: centro em fração do retrato; `lado`: lado do quadrado em fração
  da largura).

## 4. Exibição (painel lateral da Academia e do treino)

- "Pontos na barra de vida": escreve `150/150` dentro da barra.
- "Dano dos golpes": número subindo perto de quem apanhou (vermelho; azul
  e entre parênteses quando defendido, que hoje não tira vida).
- Os dois desligados por padrão, salvos no navegador, valem em toda luta.

## 5. Treino livre (Academia)

- É a própria Luta com `treino: true`: sem relógio, sem round, sem fim.
- A vida de quem não apanha há 2 s volta a encher (metade da vida por
  segundo), como no modo treino do Street Fighter. Se alguém cair, levanta
  com a vida cheia.
- Painel lateral: P1 ◀ ▶, P2 ◀ ▶ (troca na hora, reinicia a luta), CPU
  ligada ou desligada (desligada, o P2 fica parado como boneco), as duas
  opções de exibição, e sair para a Academia.
- Atalhos: 1 troca o P1, 2 troca o P2, 3 liga e desliga a CPU, Tab esconde o
  painel, Esc volta à Academia.
- Entra pela Academia: tecla T ou botão "Treino livre" no painel.
