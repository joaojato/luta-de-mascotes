# Direção de arte e animação

Regra explícita do usuário: todo personagem novo ou refeito deve seguir SEMPRE o estilo artístico e as animações do Urubu. Só mudar esse padrão quando o usuário pedir explicitamente. Uma imagem enviada como referência define a identidade do personagem, não substitui o padrão de traço, proporções ou animação.

- Ler `docs/mascotes/padrao-artistico.md` antes de criar ou refazer personagens.
- Referência visual principal: `referencia/urubu/modelo-oficial.png`; complementar: Saci e bases aprovadas de Bira e Cartola.
- Pixel art arcade, contornos escuros fortes, sombras em blocos, paleta enxuta, anatomia heroica compacta, mãos/pés grandes e atitude de lutador. Evitar realismo, renderização suave, vetores e proporções infantis.
- Sprite-base: corpo inteiro, guarda voltada para a esquerda, seguindo a pose do Urubu, fundo transparente, margem para cabeça, cauda e pés. Sem texto, escudo, patrocinador, cenário, sombra ou efeitos.
- Animações: usar as ações e arquivos efetivamente apontados por `src/game/lutadores/urubu.json`, variante principal `frente`, como guia quadro a quadro. Preservar poses, ordem, contagem, fps, repetição e janelas de ataque/defesa. Funciona como uma skin até o usuário pedir movimentos diferentes.
- Correção explícita posterior do usuário: agachamento deve ser uma esquiva visual profunda e permanecer baixo no fim; bloqueios seguem as mãos/antebraços do Saci e mantêm a proteção no último quadro; salto não desenha outra parábola dentro da folha. Ler `docs/revisao-poses.md` para as fases e referências corrigidas. Mecânicas e metadados de combate ficam com quem está implementando a lógica, salvo pedido explícito.
- Preservar identidade e figurino do novo personagem enquanto adapta o traço e o movimento ao padrão. Não copiar a espécie nem as cores do uniforme do Urubu.
- Respeitar a etapa solicitada: se o usuário pedir apenas o primeiro sprite, produzir somente a imagem-base; não gerar movimentos nem registrar um lutador incompleto no jogo.
- Gerar/redesenhar a arte com a ferramenta de imagens. Scripts locais servem para organização, referências, montagem/alinhamento das folhas e verificação.
