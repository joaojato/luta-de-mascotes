# Direção de arte e animação

- Dragão do Atlético Goianiense, pedido de 30/10/2026: rosto e físico muito
  musculoso da primeira referência, asas/cauda da segunda; sem camisa,
  corpo vermelho com queimadura/cicatriz preta diagonal e shorts pretos.
  Ler `docs/dragao-animacoes-v1.md`. Dois braços E duas asas membranosas
  separadas nas costas; cauda única. Duplo soco bruto como Porco, cuspida
  curta de fogo, soco baixo único com mínimo avanço, giro baixo de 360 graus
  com a cauda. Avanços usam impulso das asas. Especial decola e varre fogo
  contínuo da diagonal baixa para cima, deixando livre diretamente abaixo.
  Produzir por postura e por ação, preservando paleta e escala da base.

- Mosqueteiro, pedido de 30/10/2026: base `referencia/corinthians/base-mosqueteiro-v6.png`.
  Golpes próprios e quatro acompanhantes em `docs/mosqueteiro-animacoes-v1.md`.
  Duas estocadas recuando; tiro de mosquete lento; bloqueio já abaixado;
  cotovelada e estocada baixa terminam em pé; golpes aéreos usam espada.
  Gavião da Fiel espera parado; três Gaviõezinhos interagem próximos.
  Especial só libera os três ataques aéreos sequenciais após acerto do maior.
  Não aplicar as folhas largas/altas como células 256x256 nem registrar o
  personagem incompleto. Célula e quadros efetivos estão no manifesto de arte.

- Urubu, pedido posterior: pesado deixa de ser o cruzado e passa a abrir os
  dois braços/asas para os lados, com penas longas, alcance maior e fechamento
  gradual demorado, sem envergadura exagerada. Ler `docs/urubu-asas-v1.md`.
  Duas asas são os braços existentes (A direita/B esquerda), nunca um par
  extra. Preservar paleta do idle e corpo de 200 px; célula larga permite asas
  longas sem encolher o personagem. Mudança específica do pesado do Urubu.

- Porco: usar a base `referencia/porco/base-terno-v2.png` (terno verde com
  mangas rasgadas, colete/gravata e calção branco). Pedido posterior autoriza
  as animações: pesado é mordida, baixo usa corrida como Bira seguida de salto
  de costas/coice e especial é vômito verde sujo cartunesco. Ler
  `docs/porco-animacoes-v1.md`. Demais ações seguem Urubu; não substituir a
  base pelo figurino antigo, nem registrar o lutador incompleto.

- Biriba: exceção explícita do usuário para acompanhante de cenário do Bira.
  É um cachorro sobre quatro patas, anda acompanhando o Bira e às vezes para
  para latir sem som. Não transformar em lutador bípede nem copiar a guarda
  do Urubu; preservar o acabamento pixel art do projeto e a identidade da
  imagem enviada. Ler `docs/biriba-cenario.md` e acompanhar os quatro membros
  NF/FF/NH/FH em cada pose.

- Bahia, atualização de 29/10/2026: usuário autorizou a produção dos golpes próprios da primeira base aprovada, conforme docs/bahia-golpes-v11.md. Ataques, laser, preparação e grito têm MUITA cara de bravo; guarda, postura padrão, deslocamentos e dashes preservam a carinha fofa original. Não alterar identidade, paleta ou tamanho da cabeça para mudar expressão. O adiamento antigo das animações não se aplica a esses golpes agora autorizados; não registrar um lutador incompleto.

- **Produção e revisão obrigatórias:** ler [docs/producao-personagens.md](docs/producao-personagens.md) antes de gerar/refazer sprites, animações ou retratos. Uma chamada de geração por personagem e por ação; nunca atlas coletivo de mascotes. Anexar a guarda aprovada da própria skin para cores, luz, proporções e pixels; movimento define só poses. Revisar fonte e cada quadro montado contra a guarda em escala real antes de aplicar. Instruções históricas não revogam correções posteriores do usuário.

- Continuidade anatômica obrigatória: ler `docs/continuidade-anatomica.md`. Identificar pernas anatômicas A/B e segui-las do quadril ao pé em cada quadro; nunca trocar a perna do fundo pela próxima da câmera para acomodar uma pose. Giros mudam a profundidade progressivamente, mantendo a identidade dos membros e a perna que golpeia/recolhe. Cruzamentos ambíguos exigem guia técnico ou redesenho antes de aprovação. Vale também para braços.

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
- Atualização explícita: soco leve de todos segue os DOIS socos rápidos do Almirante; pesado segue o antigo leve do Urubu/Galo. Bira mantém a patada como exceção confirmada pelo usuário. Todos precisam de ao menos um chute real, separado do soco pesado. Especial do Bira usa galope de cachorro com suspensão e um pulo para morder ao chegar ao alcance. Ler `docs/revisao-golpes-v2.md`. Bahia: usar a primeira versão da base; animações adiadas pelo usuário.
- Exceções específicas posteriores em `docs/golpes-personalizados-v3.md`: Cartola pesado e baixo usam bengala (referência só do acessório), especial Pó de Arroz com stun de 1,5 s se não bloquear; Urubu chute principal é bicada que fecha e retrai; Saci chute principal lança cachimbo em parábola enquanto repõe outro na boca; Galo chute principal é giratório com rastro de garras do Bira. Os três chutes normais anteriores passam para chute baixo, como solicitado. Aparências e leves permanecem no padrão aprovado; artes de vítimas estunadas ficam para depois.
- Correção do usuário em `docs/socos-alternados-v4.md`: leve de Urubu/Bira/Cartola/Galo deve alternar de fato os braços, com giro visível do tronco/ombros no segundo impacto; nunca repetir o mesmo jab duas vezes. Saci é exceção: manter seus socos fraco e forte ORIGINAIS (`saci/light-punch.png`, `saci/heavy-punch.png`), sem padronizar para jab duplo/cruzado. Almirante mantém o leve existente. Esta regra prevalece sobre a revisão v2.
- Ajustes posteriores em `docs/animacoes-legiveis-v5.md`: bengaladas do Cartola precisam de mais tempo e extensão visível (16 quadros); giro do Galo deve mostrar costas, perfil oposto e frente (20); cortes de Bira/Galo são pequenos e translúcidos; Bira ganha carrinho como chute baixo (14). Novo pedido substitui só o fraco original do Saci por jab rápido (6 quadros/24 FPS sugeridos), mantendo seu forte. Urubu preserva alternância das mãos com contorno fino, sem halo preto grosso. Contagens/FPS novas precisam ser integrados pelo responsável pela lógica antes de trocar folhas antigas por folhas maiores.

- Revisão de coerência em `docs/coerencia-animacoes-v6.md`: conferir cada quadro da fonte e da folha montada antes de aplicar; manter direção ofensiva, braço, apoio, escala e pegada dos acessórios. Redesenhar quadros contraditórios; não esconder erro repetindo outra pose. Sustentação intencional de contato é permitida. Não reaplicar fontes antigas sobre correções novas.

- Voadoras e luz em `docs/voadoras-e-iluminacao-v7.md`: a guarda aprovada define paleta, iluminação, proporções e pixels; uma folha de movimento define só poses. Não clarear/azular penas para corrigir contorno. Comparar com idle em escala real e conferir fonte sem cortes antes de montar. Voadora é diagonal descendente, inteiramente aérea, sem trajetória desenhada; Saci mantém uma única perna.

- Bahia, pedido posterior: o usuário autorizou a integração e depois solicitou refazer/completar TODAS as animações, uma ação por vez. O adiamento histórico não se aplica mais. Ler `docs/bahia-animacoes-v12.md`. Manter flutuação sem passos, base v1, rosto fofo na guarda/movimento/dashes e muito bravo nos golpes. Nenhum membro cresce para alcançar o alvo; extensão vem de articulações e giro contínuo dos ombros/quadris. Queda perde sustentação e termina no chão.
