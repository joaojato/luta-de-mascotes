# Coxa normal — apoio e caminhadas v5

Correção posterior: as duas caminhadas são substituídas pela [v6 — andador como apoio alternado](coxa-andador-passos-v6.md). A v5 melhorou as pernas, mas ainda mantinha o objeto fixo em relação ao personagem, produzindo deslizamento ao deslocá-lo. O repouso v5 permanece vigente.

Correção solicitada em 01/11/2026: o normal mexia pouco as pernas e não segurava corretamente o andador, inclusive parado. Esta revisão substitui somente `normal/idle`, `normal/walk-forward` e `normal/walk-backward` da v4.

São três gerações finais independentes, uma por ação: quatro quadros de repouso e oito por caminhada, mantendo 8 FPS. Corpo com aproximadamente 200 px, células RGBA de 512×320 e cinco colunas. Identidade normal: chapéu com pena, barba branca, camisa listrada, suspensórios, calção oliva, meias listradas e botas marrons.

As duas mãos envolvem as manoplas superiores, com palmas apoiadas, polegares por cima e dedos por baixo. Não segurar na curva lateral. A direita anatômica é a mão distante, à esquerda da imagem; a esquerda anatômica é a mão próxima, à direita da imagem. A pegada é registrada por quadro em `attachments.json` e não muda para outro braço.

As caminhadas usam passos curtos de quem se apoia no andador: levantamento da bota, avanço/recuo, contato e transferência de apoio. Perna B direita/distante parte do quadril à esquerda; perna A esquerda/próxima parte do quadril à direita. Guias técnicos de articulações acompanham as duas pernas, sem trocar identidades para acomodar poses. O avanço global fica para o motor.

O andador vem da mesma imagem da v4, sem nova geração, cortes, deformação ou escala variável. Quatro pernas, quatro ponteiras, dois arcos/manoplas e uma travessa. A camada completa está preservada em cada `walker-layer-XX.png`; a montagem reapresenta somente os dedos já desenhados que envolvem as manoplas. Scripts extraem, alinham o corpo inteiro e montam as camadas; não desenham anatomia.

Fontes, prompts, referências com hashes, guias e montagem: `output/coxa-v5`. Galeria com andador: `output/coxa-v5/revisao.html`. Entrega consolidada: `public/assets/lutadores/coxa/revisao-v5`, com as três ações substituídas e o restante da v4 preservado. Manifesto registra origem v5 para as ações refeitas. Não registrar como lutador completo nem alterar lógica de combate; integração segue pendente.

A primeira tentativa de caminhada para frente foi rejeitada: ainda privilegiava a mesma perna e não desenhava a aproximação da outra. Preservada em `output/coxa-v5/normal/walk-forward-rejected-1`; não integra a entrega.

O quadro 5 da fonte seguinte também foi redesenhado individualmente porque omitia a perna distante de apoio. Sua nova fonte é `normal/walk-forward-contact-fix/source.png`; a montagem usa o corpo inteiro desse redesenho, sem repetir outro quadro nem remontar partes anatômicas. Fonte e hash efetivos de cada quadro estão nos registros de pegada e no manifesto.

No recuo, o quadro 5 foi corrigido em `normal/walk-backward-contact-fix/source.png` para continuar levantando a perna distante, que já vinha saindo do chão no quadro 4. A próxima permanece apoiada. Essa correção evita trocar a identidade da perna no meio do passo.

Verificação final: `python scripts/validate_coxa_v5.py`, com 20 quadros não repetidos, folhas RGBA sem cortes, posições das duas pegadas registradas, camada do andador idêntica ao objeto original nos 20 quadros e 33 outras ações preservadas por hash. Contato em escala real: `output/coxa-v5/revisao-escala-real.png`; relatório: `output/coxa-v5/validation.json`. Revisão visual acompanhou cada perna e apoio na fonte e na montagem. Não houve teste de combate, pois não há integração do Coxa no runtime.
