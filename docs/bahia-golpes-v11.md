# Bahia v11 — golpes próprios e expressões

Pedido de 29/10/2026: desenhos do golpe descendente de mão aberta, laser dos olhos e especial Bora Bahêa. Regra reforçada durante a produção: MUITA cara de bravo nas ações ofensivas; a carinha fofa original permanece na guarda e nos movimentos comuns.

Produção individual por ação com a ferramenta integrada de imagens, sempre tomando a primeira base aprovada como identidade/acabamento: referencia/bahia/referencia-estilo-urubu-v1.png. A v2 de pés juntos não foi usada. Bahia continua pairando; botas pendentes, joelho distante dobrado e capa suspensa, sem pisar no chão nem desenhar uma trajetória de voo dentro da folha.

## Arquivos finais

Todos em public/assets/lutadores/bahia/base/. Não há cadastro de um lutador completo nesta entrega.

| Arquivo | Formato | Quadros | FPS propostos | Função |
|---|---|---:|---:|---|
| guard-reference.png | RGBA 256×256 | 1 | — | Régua de montagem derivada da base aprovada, não uma animação idle |
| heavy-punch.png | RGBA 1280×512, 5 colunas | 6 | 14 | Golpe descendente com mão aberta |
| heavy-kick.png | RGBA 1280×512, 5 colunas | 6 | 14 | Animação corporal do laser no comando de chute principal |
| special-charge.png | RGBA 1280×256, 5 colunas | 4 | 12 | Inspiração/preparação do grito |
| special.png | RGBA 1280×256, 5 colunas | 5 | 12 | Emissão do grito e recuperação |
| eye-laser-projectile.png | RGBA 256×256 | 1 | — | Projétil vermelho independente do corpo |
| bora-bahea-projectile.png | RGBA 768×256 | 1 | — | Texto legível independente do corpo |

Animações corporais sem loop; o responsável pela lógica define a sustentação da preparação e da emissão. Células excedentes vazias. As dimensões dos efeitos são as do PNG inteiro; usar visualBox no relatório para o conteúdo visível.

## Expressões e sequência

- Guarda e deslocamentos: sorriso fofo/bobão e olhos amigáveis do modelo original. Os deslocamentos ainda não foram desenhados nesta entrega; esta é a regra para sua produção futura.
- Golpe descendente: quadro 0 guarda fofa; 1 arma a mão aberta acima do ombro; 2 desce; 3 completa o corte diagonal; 4 recolhe; 5 guarda fofa. Quadros 1–4 com sobrancelhas muito fechadas, olhos duros e dentes cerrados. Não há punho fechado na mão de ataque.
- Laser: 0 guarda fofa; 1 mira com expressão muito brava; 2–3 pontos vermelhos nos olhos; 4 interrompe e ainda está bravo; 5 guarda fofa. O quadro 3 foi redesenhado individualmente porque a primeira fonte havia colocado um sorriso durante a emissão.
- Preparação do especial: 0 guarda fofa; 1 fecha a expressão e recolhe cotovelos; 2 inspira com boca franzida; 3 termina a preparação com expressão muito brava. O último quadro não volta a sorrir.
- Especial: 0–1 grito de boca aberta e expressão furiosa; 2–3 fecha a boca e recompõe a guarda ainda bravo; 4 volta à guarda fofa. A fonte tinha seis desenhos; o primeiro serviu como régua de escala e não entra na emissão, pois a preparação está na ação separada.

A mudança é de expressão, sem substituir a identidade do rosto, cabelo ou figurino. A revisão é do agente; não constitui aprovação do usuário. Redesenho generativo não equivale a edição pixel a pixel da base fora dos quadros de guarda preservados.

## Anatomia e montagem

Braço A é o próximo da câmera, com ombro à direita da imagem; ele arma, desce a mão aberta e recolhe no golpe forte. Braço B é o distante, punho à esquerda da imagem, que guarda o rosto. Perna A é a bota mais baixa à direita; B tem joelho dobrado à esquerda. Conferir as conexões com seus próprios ombros/quadris, não apenas a posição na tela.

Montagem por escala uniforme da ação e alinhamento pelo cinto branco. O corpo não é recentralizado pela extensão da mão ou da capa. Guarda no início/fim usa a base aprovada original. A fonte inicial do golpe forte tinha figuras encostando e uma capa na borda; foi substituída pela fonte com figuras isoladas. Não importar as fontes iniciais.

O quadro redesenhado do laser veio em outra resolução e foi normalizado à altura anatômica da guarda da mesma fonte antes da montagem uniforme. Fator e hash estão em redrawnFrame no relatório. Scripts somente extraem, alinham e montam; não desenham, deformam ou recolorem para esconder erro.

## Integração pelo responsável pela lógica

- heavy-punch: gesto visual candidato de contato nos quadros 2–3, na mão aberta; não no corpo inteiro nem na capa.
- heavy-kick: emissão candidata nos quadros 2–3, a partir dos olhos. O raio é um PNG separado, sem recolorir o traje. Vermelho é a proposta visual inicial; velocidade, alcance e dano permanecem em aberto.
- special-charge prepara; special começa já gritando. Emissão candidata no quadro 0, com sustentação visual em 1. Não disparar repetidamente só por sustentar a pose.
- Texto exato: Bora Bahêa, com circunflexo. **Não espelhar as letras quando trocar o lado do lutador.** O projétil pode viajar em qualquer direção mantendo a leitura normal.
- Crescimento é aplicado pelo motor conforme a distância percorrida desde a boca. Dano e tempo de stun acompanham a mesma progressão, com valores e limites ainda a definir. O texto não contém crescimento nem deslocamento gravados em sua imagem.
- Pular é a esquiva definida pelo usuário. Preservar uma trajetória/altura que permita passar por cima mesmo no tamanho máximo. Possibilidade de bloquear e limites de dano/stun não foram decididos nesta entrega.
- Medidas visuais não são hitboxes. Pairar visualmente não dá invulnerabilidade automática a golpes baixos.

Não foram alterados JSONs de runtime, TypeScript, dano, stun ou regras de combate. Ainda faltam os demais movimentos necessários a um lutador completo; não registrar o Bahia apenas com estas artes. Conferir na Academia e no combate durante a integração.

## Evidências e reprodução

Fontes escolhidas, prompts completos, ficha, referências/hashes, quadros extraídos, contatos e GIFs: output/bahia-v11/. Relatório agregado: report.json. Revisão animada: revisao.html. Comparação ampliada dos rostos: expressions.png.

Montagem: python scripts/bahia_v11.py <ação>; aplicação: adicionar --apply. O script recusa sobrescrever um destino que tenha conteúdo diferente. A origem canônica da identidade permanece na pasta referencia/bahia/.

Validação final: quatro folhas corporais, 21 quadros e dois efeitos, além da régua de guarda. Conferidos hashes instalados, referência inalterada, transparência, margens, células excedentes vazias e pixels das guardas preservadas. Resumo em output/bahia-v11/validation.json. Não houve teste de combate nem cadastro de personagem nesta entrega.


## Integra??o autorizada no jogo

Ap?s a aprova??o expl?cita do usu?rio, Bahia est? selecion?vel como Esquadr?o.
Corte descendente, laser e especial usam as folhas aprovadas. Movimentos comuns
sem arte pr?pria usam temporariamente a guarda; o leve reutiliza o corte acelerado.
O texto mant?m a leitura nos dois lados e cresce durante 700 px percorridos, at?
1,8 vez o tamanho, 40 de dano e 1,8 s de stun (in?cio: 25 de dano e 1 s).
Pular evita o proj?til; as regras existentes de bloqueio continuam v?lidas.
Esses registros substituem as restri??es de cadastro da entrega art?stica acima.
