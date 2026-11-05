# Fluidez das intros —05/11/2026

Referências apontadas pelo usuário: Vovô12quadros/3000ms e Dragão16/3400ms.
Média aritmética14quadros e4,35poses/s. Esse número não é meta universal:
conta a quantidade de mudanças de apoio, orientação e objetos em cada ação.

| Intro | Antes | Avaliação | Correção |
|---|---|---|---|
| Vovô |12/3s| gestos cadenciados, referência do usuário | preservar |
| Dragão |16/3,4s| preparação/fogo/comer/recolher, referência | preservar |
| Galo |12/3,15s| muitas etapas: agachar, bater asas, desequilibrar, sentar e levantar |24poses novas em2,205s |
| Saci |12/3,15s| giro completo e transformação sem ângulos intermediários suficientes |24poses novas em2,205s |
| Cartola |12/3,15s| pegar/tirar/erguer chapéu, curvar, espirrar, recolocar |24poses novas em2,205s |
| Gaúcho |12/3,15s| guardar espada, pegar cuia, beber, guardar e sacar |24poses novas em2,205s |
| Porco |12/3,15s| gestos curtos de lapela/barriga, sem grandes mudanças de apoio | preservar |
| Esquadrão |12/3,15s| poses de voo aprovadas + elevação contínua do motor | preservar |
| Urubu |16/3,6s| pouso/erguer asas/recolher com trajetória contínua | preservar |
| Bira |16/4,2s| carinho e giro, com Biriba animado à parte | preservar |
| Mosqueteiro Paulista |15/4s| manuseio deliberado, sem nova reclamação de fluidez | preservar |
| Almirante |6no ciclo +4parado|21eventos de passos em loop +4finais; movimento contínuo. Contar só os4da finalização engana | preservar |

Após pedido posterior de acelerar, nas quatro revisões cada intervalo antigo
é dividido em dois e reduzido em30%:2205ms de movimento,500ms iniciais,
2705ms ao todo. Em média91,875ms por pose, antes262,5ms; não é apenas
aumento de velocidade sem redesenho. São poses intermediárias desenhadas pelo gerador
integrado, não duplicação de quadros, interpolação borrada ou apenas aumento
do FPS. Primeiro/último idle originais; danos/combate não mudam.
Galo mantém impacto aos1795ms (antes2350ms), agora no quadro14 em vez do7. Guardas
continuam animando após a própria intro, sem esperar o adversário.
Produção em `output/intros-fluidez-v3/<id>/` com prompts/fontes/hashes.
