# Gremista — continuidade da espada e fase de acerto

Atualização de 03/11/2026: rápido e baixo substituídos pela
[postura v7](gremista-postura-v7.md), com extensão real do braço e mais
agressividade conforme pedido posterior. Não reaplicar estas folhas v6.

Correções posteriores à v5. A última instrução do usuário esclarece que
o movimento **da torcida para a câmera ocorre no acerto**. A ida para o
fundo é preparação. O usuário também rejeitou inversões súbitas da ponta
da espada entre quadros. Esta instrução prevalece sobre a interpretação
inicial de aplicar o corte ativo no sentido contrário.

## Coreografia e revisão

Foi criado um guia técnico por ação com ombro/cotovelo/punho A direitos
e a linha cabo–ponta. O arco foi reduzido: a ponta permanece do lado do
adversário (à esquerda do próprio cabo na fonte). A profundidade muda
pela rotação pequena do ombro e pelo escorço gradual, sem apontar a
espada para o lado oposto. Braço B guarda; espada fica na mesma mão A;
joelhos, quadris, botas e apoio mantêm continuidade.

- Baixo: 12 quadros / 32 FPS / 375 ms. Preparação 0–3, corte para o
  primeiro plano 4–7, acerto 6–7, recolhimento gradual 8–11. Permanece
  agachado. A ponta cortada de uma tentativa intermediária foi
  redesenhada antes da montagem; fontes com inversões foram descartadas.
- Rápido: 16 quadros / 40 FPS / 400 ms. Preparação 1–3 e 8–9,
  cortes para o primeiro plano 4–7 e 10–13; acertos 6–7 e 12–13;
  retorno à guarda em 14–15. Dois cortes pequenos, cotovelo dobrado,
  tronco ereto e pés plantados. Guarda exata somente em 0/15.

Os intermediários são desenhos próprios produzidos com a ferramenta de
imagens embutida, com a guarda da própria skin e o guia técnico anexados.
Não houve inversão da ordem de uma folha antiga ou espelhamento isolado
para esconder transições ruins. Scripts fazem extração, alinhamento e
montagem com uma única escala por ação, sem deformar membros/quadros.

As fontes e os quadros montados foram conferidos lado a lado. Marcas
manuais de cabo/ponta nas fontes finais estão em
`blade-source-landmarks.json`; `orientation-review.json` confirma que
todas as pontas ficam à esquerda do cabo e que nenhum salto angular
consecutivo marcado chega a 45 graus. Essas marcas apoiam a inspeção
visual, sem pretender provar automaticamente anatomia ou perspectiva.

## Arquivos e integração

- PNGs finais: `public/assets/lutadores/mosqueteiro-gremio/cortes-v6/`.
- Prévia com pausa, passo e velocidade:
  `output/gremista-cortes-v6/revisao.html`.
- Guias técnicos, prompts completos, fontes, recortes, contatos claros/
  escuros e GIFs: subpastas por ação na mesma pasta de produção.
- Manifesto de dimensões, quadros, escalas e hashes: `cortes-v6/manifest-art.json`.
- Validação reproduzível: `python scripts/gremista_cortes_v6.py finalize`.

Células 640×384, cinco colunas. PNGs RGBA com alfa 0/255, sem resíduos
magenta e sem halo. As prévias GIF distribuem arredondamento para o
formato de 10 ms; HTML e runtime usam os tempos exatos.

Integração muda somente as duas ações: caminhos, contagem e FPS dobrados,
índices das janelas duplicados e intervalo do avanço convertido para a
nova grade temporal. **Duração total e início/fim dos acertos permanecem
nos mesmos milissegundos**; o corte baixo continua em 187,5–250 ms e o
rápido em 150–200 e 300–350 ms. Dano, caixas e distâncias não mudam.
As demais ações, NPC, tiros e alterações paralelas são preservados.
Backup exato em `runtime-integration-before.json`; auditoria de duração
em `integration-report.json`.

A sincronização foi conferida nos dados da animação; não houve partida
nem inspeção de combate na Academia. Testes de dados e grade não
substituem aprovação visual do usuário. Não reaplicar folhas v5 ou
tentativas rejeitadas v6 sobre os arquivos finais.

Verificações passaram: duas folhas / 28 quadros, margens, dimensões,
células excedentes vazias, hashes e alfa binário; JavaScript da prévia
sem erro de sintaxe; TypeScript e 94 testes de registro de lutadores.
Hashes das referências e dos guias anexados em `reference-hashes-v6.json`.
