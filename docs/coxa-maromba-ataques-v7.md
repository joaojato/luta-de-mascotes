# Vovô Maromba — ataques rasteiros e aéreos simples

Pedido de 02/11/2026: ataques simples, preservando o andador coeso, sem
deformações ou alterações na estrutura. Cobertura dos comandos baixo+soco,
baixo+chute, soco no ar e chute no ar.

Referência de acabamento e figurino: guarda efetivamente usada pelo
`coxa-maromba.json`, em `maos-por-cima/rigido-v1/maromba/idle-composed.png`.
O pedido v4 registra a preferência do usuário por essa versão antiga;
não substituir pela postura de mala da base v9 nesta entrega.

## Entrega

Arquivos em `public/assets/lutadores/coxa/maromba-ataques-v7/`.
Cada ação tem `*-body.png`, `*-composed.png` e `*-rig.json`.
Manifesto: `manifest-art.json`. Objeto canônico: `andador.png`.

| Ação | Quadros | FPS proposto | Contato visual (índice zero) | Movimento |
| --- | ---: | ---: | --- | --- |
| heavy-punch | 6 | 12 | 3 | Abaixa, estocada curta com andador inteiro, recolhe e levanta |
| low-kick | 8 | 12 | 3–4 | Chute curto diagonal baixo, recolhe a mesma perna |
| jump-punch | 5 | 14 | 2 | Estocada curta no ar, sem girar o andador |
| jump-kick | 6 | 14 | 2–3 | Chute aéreo diagonal descendente, recolhe a mesma perna |

Todas: RGBA, células **512×320**, cinco colunas, leitura por linhas,
sem repetição. Corpo em escala equivalente ao idle de cerca de200px.
Chão y=292 nas ações plantadas. As aéreas começam e terminam no ar;
não desenham pouso nem trajetória vertical. A origem local declarada é
`[256,292]`; não significa que os pés aéreos estejam no chão.

Braço direito anatômico B/distante segura o tubo do andador. Braço
esquerdo A/próximo fica em guarda. Nos chutes, a perna direita B/distante
estende e recolhe, enquanto A/próxima apoia ou permanece dobrada no ar.
Sem giros da pelve, troca de membros ou crescimento para alcançar o alvo.
As ações de chão usam o quadro original do idle em ambos os extremos,
intencionalmente, para restaurar a guarda exata.

## Andador preservado

Imagem única: `output/coxa-rigido-v1/objetos/upright.png`, **104×100px**.
As 25 camadas do objeto reutilizam os mesmos bytes RGBA; escala1,
rotação0, sem troca de perspectiva. Só a translação inteira acompanha a
mão. Nenhum tubo foi redesenhado, alongado, torcido ou recolorido.
Mantém quatro pernas/ponteiras, dois arcos e uma barra de união.

O objeto aparece nas referências antes da geração do corpo; a arte
corporal é produzida separadamente. Na montagem, a imagem original do
andador é posicionada pela pega; pixels dos próprios dedos ficam sobre o
tubo. Cada `walker-layer-XX.png` guarda o objeto completo, antes das
oclusões da mão, permitindo comparar sua estrutura integralmente.
As mãos foram conferidas na fonte e na composição em escala real.

O chute baixo passa por baixo das ponteiras; na voadora a perna se
estende abaixo do objeto. Nas estocadas, a mão transporta o andador
inteiro, sem abrir a estrutura, girar os tubos ou lançar o acessório.

## Revisão e integração

Prévia: `output/coxa-maromba-v7/revisao.html`. Fontes individuais, prompts
completos, ficha A/B, referências/hashes, recortes, quadros, GIFs normal/
lento, contatos e comparação com idle em fundos claro/escuro ficam ali.
Ferramenta de arte: image_gen integrada; scripts só extraem, alinham,
compõem e verificam. O primeiro estudo do rasteiro foi rejeitado por altura
excessiva da perna e resíduos do guia; não aplicar essa fonte.

Montagem por ação: `python scripts/coxa_maromba_v7.py mount <ação>`.
Manifesto e verificação final: `python scripts/coxa_maromba_v7.py finalize`.
Verificados: quatro ações, 25 quadros, dimensões, RGBA, margens, sobra
transparente, pega dentro da mão e todas as25 camadas idênticas ao objeto.
Isso não substitui a aprovação visual do usuário ou o teste em combate.

Não alterei runtime, dano, hitboxes, física ou registro de lutador nesta
produção. Os contatos acima são guia visual; a lógica deve avaliar dano
uma vez por golpe. No rasteiro, ajustar a caixa às partes baixas que
atingem; não usar o retângulo inteiro da célula ou do andador. Nos aéreos,
o motor mantém a trajetória do salto. Integração e teste em combate devem
conferir os arquivos que estiverem efetivamente ativos, inclusive eventuais
camadas posteriores de correção das mãos.
