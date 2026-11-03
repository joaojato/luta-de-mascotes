# Gremista — cortes horizontais com profundidade

Pedido posterior a passos-v4: Q/I baixo e E/P pareciam estranhos. O usuário
esclareceu que o corte seco atravessa um plano horizontal, como vindo da
arquibancada para a câmera. O mapa atual confirma `low-kick` para baixo +
Q/I e `light-punch` para E/P de pé. Não é pedido de mudar o forte.

## Movimento

Preparação no lado distante do corpo → passagem da lâmina em perspectiva
em direção ao primeiro plano → final atravessado à frente do corpo.
O fio descreve a varrida: não é estocada que projeta o braço reto nem
oscilação vertical da espada. Ombro, cotovelo e punho direitos A permanecem
conectados; o braço B esquerdo guarda. A redução aparente da lâmina no
meio é escorço de perspectiva; o comprimento físico permanece o mesmo.

- `low-kick`: seis quadros, 16 FPS. 0 pronto baixo; 1 arma do lado distante;
  2 passa em direção à câmera; 3 termina atravessado no primeiro plano;
  4 recolhe; 5 pronto baixo. Um só corte, permanece profundamente agachado,
  joelhos e pés mantêm suas identidades e apoios. A preparação também fica
  baixa, evitando parecer uma descida da espada.
- `light-punch`: oito quadros, 20 FPS. 0 guarda; 1 arma distante na cintura;
  2 varre para perto; 3 termina horizontal; 4 arma curto na altura do peito;
  5 segunda varrida para perto; 6 termina horizontal; 7 guarda. Dois cortes
  compactos, cotovelo dobrado, tronco ereto, pés plantados. O retorno à guarda
  0/7 usa a guarda exata de produção, sem substituir contatos.

## Arte e arquivos

Ferramenta de imagens embutida, uma ação por chamada, guarda da própria
skin para identidade/paleta/acabamento. O baixo usa o agachamento revisado
como postura; ele é guia do movimento em profundidade no leve, que fica
em pé. A primeira fonte do leve tinha as lâminas dos finais longas demais:
essas duas lâminas foram redesenhadas pela ferramenta antes da montagem.

Escala uniforme por ação (0,35 baixo / 0,48 leve), escolhida por cabeça,
chapéu, bota e comprimento físico da hanger, não pela caixa de uma pose.
Sem deformação por membro/quadro. Fontes inteiras e montagens comparadas
em escala real; pés, ombros, pegada, escorço e bordas revisados. Magenta
opaco nas fontes foi removido; PNGs finais RGBA, alfa 0/255, sem rosa/halo.

PNGs: `public/assets/lutadores/mosqueteiro-gremio/horizontais-v5/`.
Prompts completos, fontes, quadros, GIFs, contatos, hashes e prévia:
`output/gremista-horizontais-v5/revisao.html` e subpastas por ação.
Manifesto final: `horizontais-v5/manifest-art.json`.
Revalidar: `python scripts/gremista_horizontais_v5.py finalize`.

Integração troca somente os dois caminhos de PNG no JSON vigente. Mantém
contagem/FPS, danos, janelas, caixas, movimento mundial, pistolas, NPC e
as caminhadas v4. Caixas de combate não são derivadas automaticamente do
escorço novo; sua conferência pertence à integração/Academia. Não foi
realizada partida nesta revisão; testes de registro não aprovam anatomia
ou alcance em combate. Sem presumir aprovação visual do usuário.

Esta revisão substitui o baixo v3 e somente o leve v4. Não reaplicar
essas fontes antigas sobre os novos cortes.

Validação: duas folhas / 14 quadros passaram nas verificações de grade,
dimensões, margens, sobras vazias, hashes, alfa binário e ausência de
magenta. JavaScript da prévia passou em `node --check`; os 94 testes do
registro de lutadores passaram após a aplicação. Comparação com o backup
confirmou que apenas os caminhos desses dois PNGs mudaram no JSON.
