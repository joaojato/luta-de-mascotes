# HUD, faíscas, cartões e logo — identidade de rua

Direção corrigida pelo usuário em 29/10/2026: jogo de rua, simples. Molduras finas de pintura clara sobre carvão, detalhes pequenos vermelhos/azuis e cores chapadas. Sem acabamento metálico, dourado ornamental ou linguagem medieval. Essa orientação vale para estas peças de interface; a arte dos mascotes continua seguindo as bases aprovadas e o padrão do Urubu.

## Entrega

- Atlas ativo: public/assets/ui/fighting/fighting-ui-atlas-transparent.png, RGBA 1254×1254. Coordenadas, nomes e sockets dos 22 recortes preservados. Os nomes legados contendo gold permanecem para compatibilidade; as molduras agora são claras, e o marcador de round cheio é branco. Só a faísca de acerto dourada mantém a cor amarela solicitada.
- Os 19 recortes de HUD/faíscas foram refeitos. Os três ícones auxiliares não pedidos (heal, shield-blue e ko) preservam a arte anterior.
- Cartões ativos: public/assets/mode-cards/mode-1v1-card.png (1330×1182) e mode-1vcpu-card.png (1392×1130). Preservadas dimensões originais para compatibilidade. Urubu contra Galo, quadra de bairro; Galo digital no modo CPU.
- Logo novo: public/assets/branding/luta-de-mascotes-logo.png, RGBA 1200×400. Letras claras, contorno preto e sombra vermelha, fundo transparente. Pronto para registrar e exibir na abertura e no menu pelo responsável pela integração; nenhum TypeScript foi alterado nesta entrega.

Fontes finais, prompts, versões descartadas, backups, relatório e revisão: output/identidade-ui-v1/. Ferramenta integrada de imagens usada para desenhar; Python apenas recorta, dimensiona, alinha sockets e monta as folhas. As primeiras fontes metálicas foram descartadas após a correção do usuário e não foram aplicadas.

## Coordenadas preservadas

Todas em pixels, origem superior esquerda. O manifesto de runtime não foi alterado.

| Nome de frame | x | y | largura | altura |
|---|---:|---:|---:|---:|
| health-frame-left | 22 | 76 | 587 | 110 |
| health-frame-right | 645 | 76 | 586 | 110 |
| portrait-frame-gold-left | 21 | 278 | 223 | 225 |
| portrait-frame-blue-left | 268 | 278 | 223 | 225 |
| timer-frame | 532 | 306 | 179 | 176 |
| portrait-frame-blue-right | 749 | 278 | 225 | 225 |
| portrait-frame-gold-right | 1002 | 278 | 227 | 225 |
| health-fill-green-left | 38 | 565 | 331 | 51 |
| health-fill-green-right | 385 | 565 | 321 | 51 |
| health-fill-yellow-left | 38 | 641 | 331 | 52 |
| health-fill-red-left | 38 | 718 | 331 | 52 |
| meter-pip-blue-1 | 752 | 560 | 86 | 56 |
| meter-pip-gold-1 | 752 | 637 | 86 | 56 |
| meter-pip-empty-1 | 752 | 714 | 86 | 57 |
| nameplate-gold-left | 43 | 825 | 560 | 61 |
| nameplate-gold-right | 651 | 825 | 550 | 61 |
| icon-hit-red | 42 | 1091 | 100 | 96 |
| icon-hit-gold | 162 | 1091 | 104 | 96 |
| icon-hit-blue | 285 | 1091 | 98 | 96 |
| icon-heal | 402 | 1091 | 100 | 96 |
| icon-shield-blue | 522 | 1091 | 100 | 96 |
| icon-ko | 874 | 1091 | 99 | 96 |

Sockets locais preservados: vida esquerda (47,23,490,50), direita (49,23,490,50); retratos conforme manifesto, relógio (42,40,95,96), nomes esquerda (28,12,472,35) e direita (50,12,472,35). Espaço não usado pelas novas bordas finas permanece transparente, sem engrossar a moldura para preencher os antigos limites.

## Verificação

Conferidos visualmente atlas final, HUD montado em escala de tela, os dois cartões e logo. Verificados recortes sem sobreposição, sockets totalmente transparentes, tamanhos finais e hashes. O relatório exporta todos os frames e sockets, além dos hashes de saída e do manifesto. Os 44 testes existentes de registro dos lutadores passaram; eles não substituem um teste visual do HUD no combate, que não foi realizado.

Revisão: output/identidade-ui-v1/revisao.html; prévia do HUD: hud-preview.png. Montagem reproduzível: python scripts/identidade_ui_v1.py; aplicação: adicionar --apply. O script recusa sobrescrever atlas/cartões alterados desde o backup.
