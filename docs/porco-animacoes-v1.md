# Porco — sprites de terno e golpes próprios

Base autorizada: `referencia/porco/base-terno-v2.png`, com versão 256×256 em
`sprite-terno-v2-256.png` na mesma pasta. Pelagem verde, focinho rosado, presas
de marfim, terno verde com lapelas/colete/gravata e mangas rasgadas, calção
branco e cascos escuros bipartidos. Sem logos ou texto. O figurino v2 substitui
a camisa branca e o calção verde da primeira proposta.

Pedido posterior autoriza produzir o conjunto de animações, individualmente,
com três exceções ao Urubu: baixo com corrida e salto de costas para dar
coice; pesado com mordida; especial de vômito verde sujo e cartunesco.
As demais ações usam os arquivos efetivamente apontados pelo Urubu como
guias de poses, contagens e FPS; não importar espécie ou cores do Urubu.

## Continuidade

A é a perna próxima da câmera na base, ligada ao quadril da direita da imagem;
B é a distante, avançada à esquerda. Braço A próximo protege o abdômen e braço
B distante mantém o punho junto ao rosto. Nos giros, a profundidade muda por
rotação contínua, nunca trocando membros. Coice liderado por A: ele vira para
a direita, mostra as costas ao adversário à esquerda, fica inteiramente no
ar, estende A para trás/esquerda e recolhe A; B fica dobrada e A reassume
o apoio na aterrissagem da sequência efetivamente desenhada.
Mordida abre/fecha a mandíbula com presas constantes, avançando tronco e
cabeça juntos; nunca aumentar focinho ou pescoço para alcançar o adversário.

## Entrega de arte

Destino: `public/assets/lutadores/porco/terno-v1/`, RGBA, células 256×256,
cinco colunas. `manifest.json` informa os arquivos conferidos e as pendências.
Fontes, prompts, snapshots dos guias atuais, hashes, contatos e GIFs ficam em
`output/porco-v1/`; prévia `revisao.html`. Montagem: `scripts/porco.py`.
Gerar uma ação, conferir fonte, montar, conferir cada quadro e só então salvar
no destino final. Não reaplicar fontes rejeitadas nem esconder erro repetindo
uma pose. Nenhum membro é desenhado por scripts ou deformado para caber.

| Ação | Quadros | FPS | Contrato |
|---|---:|---:|---|
| idle | 4 | 8 | Guarda e respiração, loop |
| walk-forward / walk-backward | 8 cada | 8 | Passos no padrão do Urubu |
| dash-forward | 5 | 18 | Arrancada curta |
| dash-back | 4 | 18 | Recuo curto |
| crouch | 5 | 20 | Esquiva profunda; sustenta baixo |
| jump | 8 | 10 | 0 guarda, 1–2 preparo, 3–7 aéreos |
| jump-kick | 6 | 14 | Voadora descendente com a mesma perna |
| jump-punch | 5 | 14 | Soco inteiramente aéreo |
| block-high / block-low | 4 cada | 10 | Proteção frontal sustentada no fim |
| hit-high | 6 | 12 | Reação e retorno |
| stunned | 4 | 6 | Tontura em loop, sem flash de guarda |
| light-punch | 6 | 14 | Dois socos com braços alternados e giro do tronco |
| heavy-punch | 8 | 14 | Abre, avança, fecha mordida, recolhe |
| heavy-kick | 10 | 12 | Chute físico principal no padrão do Urubu |
| low-kick-run | 8 | 16 | Galope baixo como Bira, loop de aproximação |
| low-kick | 10 | 14 | Giro, salto de costas e coice com A, recuperação |
| special-charge | 5 | 14 | Enjoo/preparo; último quadro sustentado |
| special | 6 | 12 | Inclina e abre a boca para emitir vômito, recupera |
| knockdown | 10 | 10 | Cai e termina deitado |

O efeito de vômito é separado do corpo para manter o ponto de emissão na boca
e permitir integração da lógica. Verdes oliva/escuro/amarelado, gotas e pedaços
simples, sem realismo gráfico. O corpo preserva a paleta da base.
`vomit-jet.png`: seis quadros a 10 FPS, células 512×256, cinco colunas,
origem da emissão no pixel (480,128), direção original para a esquerda.
`emission-guide.json` registra os pontos da boca nas poses 2–3 do corpo e a
origem do efeito. A composição de conferência não altera nenhum PNG corporal.

## Integração da lógica

Esta solicitação é de sprites. Não registrar lutador incompleto ou alterar
JSONs, hitboxes, dano, deslocamento ou controles dos personagens existentes.
O responsável pela lógica deve integrar o conjunto depois da entrega da arte,
usando as novas contagens e FPS acima. A corrida é separada para poder repetir
antes do coice, sem duplicar poses de preparação dentro do loop.
O salto normal não desenha uma segunda parábola; os quadros aéreos ficam na
mesma altura local da cabeça. No coice, quadros 3–6 são aéreos e não têm apoio.
Mesmo quando o Porco olha para a direita no coice, o adversário continua à
esquerda: o golpe é para trás. Manter a direção ofensiva da sequência inteira;
espelhar a folha inteira apenas quando o adversário estiver à direita.
Prévia de GIF e inspeção de PNG não equivalem a teste de combate no jogo.

Estado: arte concluída. São 21 animações de corpo (134 quadros) e o jato de
vômito separado (seis quadros). Fontes e folhas montadas foram inspecionadas
individualmente e comparadas em `output/porco-v1/cohesion-final.png`.
`python scripts/porco.py verify` passou: hashes das fontes/destinos e base
inalterados, RGBA, margens, grade, células excedentes vazias e estados finais
de proteção/esquiva/queda e poses aéreas conferidos. As únicas duplicações
exatas são as guardas canônicas intencionais de início/fim das ações que
retornam à guarda; não há quadros repetidos para esconder erros no movimento.

As fontes sem calibração da tontura e a corrida com extensão excessiva foram
preservadas separadamente como histórico e não viraram assets finais.
A figura adicional de guarda usada em algumas fontes é só uma régua de
escala e não aparece nas animações exportadas. `whiteShortsAxes` nos relatórios
é um diagnóstico de alinhamento da região branca contínua, dependente das
sombras e sobreposições da roupa.

Artes e contrato visual entregues para integração. Nenhum JSON de lutador,
hitbox, dano, deslocamento ou controle foi alterado nesta produção. Não houve
teste de combate: a prévia demonstra a arte, não o comportamento de runtime.
