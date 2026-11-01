# Coxa — movimentos das duas versões

Caminhadas normais vigentes: [andador e passos v6](coxa-andador-passos-v6.md). Avançar move o andador primeiro e depois faz dois passos; recuar faz dois passos e só depois recolhe o andador. Os braços precisam levantar, alcançar e recolher o objeto, respeitando o apoio no chão.

Correção posterior vigente para repouso e caminhadas do normal: [apoio e caminhadas v5](coxa-apoio-caminhadas-v5.md). Substitui essas três ações da v4; usa as duas mãos nas manoplas e passos curtos com levantamento e troca de apoio.

## Correção de produção — andador rígido separado

Pedido posterior explícito do usuário durante a produção: o andador não deve ser redesenhado dentro de cada quadro. Produzir o corpo e o acessório em camadas separadas. O vovô manipula uma imagem rígida do objeto por pontos de pegada; translação e rotação plana movem o acessório inteiro sem deformação. Quando houver mudança real de perspectiva, gerar outra vista isolada do mesmo andador com a ferramenta de imagens. Preservar quatro pernas, quatro ponteiras, dois arcos e uma única barra frontal em todas as vistas. A pegada maromba continua na perna traseira esquerda.

As fontes iniciais em `output/coxa-producao-v2/` com andador redesenhado junto ao corpo são estudos de movimento, não folhas finais para integração. Revisar/refazer em camadas; não reaplicar o objeto defeituoso. A montagem pode compor imagens geradas e registrar âncoras/oclusão, sem redesenhar ou deformar anatomia por script.

Correção posterior da esquiva do velhinho: ao abaixar, a mão próxima sai da manopla e vai à lombar, com cotovelo para trás e careta cômica de dor. O outro braço continua apoiado no andador. Sustentar a postura baixa e a mão nas costas no último quadro. Fonte corporal atual em `output/coxa-rigido-v1/normal/crouch-backpain/`; substitui a esquiva anterior sem dor. Não aplicar automaticamente essa gag ao modo maromba.

Pedido de 31/10/2026. Especificação de animação e comportamento, com produção de arte autorizada posteriormente pelo usuário. Sem alteração do runtime nesta etapa. As coreografias próprias abaixo prevalecem sobre os movimentos genéricos do Urubu. Acabamento continua no padrão arcade do projeto.

## Bases e continuidade

**Revisão atual do conjunto: [coxa-revisao-v4.md](coxa-revisao-v4.md).** O usuário esclareceu que deseja refazer as animações com o andador como referência fixa. Maromba usa a orientação mais recente da base v9: braço baixo, curvas à esquerda, pernas à direita. O rápido normal levanta as duas mãos e faz duas estocadas com as ponteiras, recolhendo entre elas. As instruções históricas de carregar o objeto verticalmente ou erguer a mão ao peito não valem para o repouso atual.

Atualização mais recente: [coxa-correcoes-v3.md](coxa-correcoes-v3.md). Arremesso passa para a **esquerda anatômica**, com retirada do bolso. Voadora parte de duas mãos apoiadas, com carga antes de sair do chão. Crescimento e alcance/pegada na perna agora fazem parte da mesma animação, com o andador rígido incluído em todas as prévias. Essa revisão substitui as instruções correspondentes da v2 abaixo.

Correções posteriores do usuário em [coxa-correcoes-v2.md](coxa-correcoes-v2.md): cerveja exclusivamente na direita anatômica distante; chute quase voadora com apoio contínuo de uma mão; transformação com objeto imóvel e nova transição até a pegada na perna traseira esquerda; defesa baixa por trás do andador. Essas revisões substituem as quatro ações correspondentes da entrega rígida v1. Não reaplicar suas composições anteriores.

- Velhinho: referência de trabalho `referencia/coxa/base-normal-v1.png`, com as duas mãos apoiadas no andador. Não inferir nova aprovação dessa base.
- Maromba: orientação atual de trabalho em `referencia/coxa/base-maromba-v9.png`, conforme retomada explícita pelo usuário. Braço direito baixo, mão na altura da coxa e objeto deitado, curvas à esquerda e pernas à direita; B2 é a perna traseira esquerda. A aprovação antiga de `referencia/coritiba/base-vovo-maromba-andador-v3.png` não revoga essa correção posterior de postura/orientação. Não inferir aprovação global da nova produção.
- Andador: `referencia/coritiba/andador-isolado-v1.png`; quatro pernas, duas manoplas, quatro ponteiras, uma única barra frontal. Nunca acrescentar travessas.
- Antes de cada ação, identificar braços/pernas A/B na base e acompanhar articulações, apoio, pegada e profundidade. Anexar a própria base como referência de identidade e acabamento. Uma ação por geração.

## Coxa velhinho

Correção posterior: ao agachar, a mão próxima da câmera vai à lombar, com careta de dor; a outra continua apoiando no andador. Termina e permanece baixo. Apenas a versão velhinha recebe essa gag.

Correção estrutural: o andador é um objeto separado e rígido, baseado somente em `referencia/coritiba/andador-isolado-v1.png`. Nunca redesenhá-lo em cada quadro. A tentativa horizontal com estrutura quebrada foi rejeitada e não faz parte da entrega. As composições usam translação e rotação da imagem inteira, mantendo escala e quatro pernas.

| Comando | Coreografia solicitada |
|---|---|
| Soco rápido | Levanta as duas mãos e projeta os pés/ponteiras do andador contra o adversário em DUAS estocadas, como a ideia de espetada do Mosqueteiro. Recolhe entre os dois contatos e retorna ao apoio. O objeto gira inteiro para que as ponteiras liderem o ataque. Não substituir por socos nem por batidas verticais no chão. |
| Chute | Arremessa uma latinha de cerveja contra o adversário, em parábola semelhante à do cachimbo do Saci. Preparar, soltar e recolher o braço; a lata passa a ser projétil separado após a soltura. Desejadas gotas/partículas de cerveja caindo durante o trajeto. |
| Soco pesado | Mantém as duas mãos no andador e projeta cabeça/tronco para dar uma cabeçada. Recolhe sem perder a pegada. O contato vem da cabeça. |
| Chute rasteiro | Apoia o peso nas mãos e no andador para desferir um chute real no adversário, usando o apoio como na ideia do Saci. Preparar apoio, levantar/estender a perna atacante, recolher e recuperar a postura. Fixar a identidade da perna atacante antes de produzir. |
| Especial | Pega rapidamente uma cerveja, vira e bebe, então se transforma na versão maromba aprovada. Mostrar a passagem da guarda com duas mãos para a bebida sem mãos extras nem andador flutuando. A solução exata de apoio durante a bebida será definida na coreografia. |

## Estado maromba

- Duração inicial proposta pelo usuário: **5 segundos**, ajustável posteriormente.
- Durante o estado: pequeno aumento do dano dos ataques e redução do dano recebido. Percentuais ainda não definidos; não inventar números de balanceamento.
- Ao terminar o tempo, retorna ao normal. **Animação e modo de retorno aguardam explicação do usuário.** Não produzir uma reversão presumida.
- Soco rápido: soca junto com o andador contra o oponente, preservando a pegada aprovada. Número de impactos ainda não especificado; não copiar automaticamente as duas batidinhas do velhinho.
- Chute: chute real no oponente, mantendo controle do andador.
- Soco pesado, rasteiro e demais particularidades no modo maromba ainda não descritos. Não presumir que reutilizam as animações do velhinho.

## Referência de projétil e integração futura

Em `src/game/lutadores/saci.json`, `moves.kick` usa `pipe-throw`, soltura no quadro 3, velocidade 420, launchVy 320, gravidade 600 e altura de lançamento 150. São referências existentes para obter física semelhante, não parâmetros aprovados para o Coxa; adaptar à altura efetiva da mão e conferir o comportamento do motor antes de integrar. Não copiar cegamente o quadro de soltura para outra folha.

Trajetória e partículas pertencem ao projétil/efeito no motor; não desenhar uma parábola acumulada dentro da folha do corpo. As gotas são visuais, sem dano próprio definido. Contagem de quadros, FPS, contatos, hitboxes, porcentagens e regras de expiração/interrupção da transformação serão especificados antes da integração.

Produzir por ação, comparar cada quadro à base em escala real e revisar fonte e montagem. Não registrar o personagem incompleto. Ações não personalizadas seguem o padrão atual do projeto, respeitando o andador e a anatomia; a volta ao normal permanece explicitamente pendente.
