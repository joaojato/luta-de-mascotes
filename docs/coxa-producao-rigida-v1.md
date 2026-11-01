# Coxa — entrega de arte em camadas

Galeria: `output/coxa-rigido-v1/revisao.html`. Pacote: `output/coxa-rigido-v1/coxa-sprites-v1.zip`.

36 folhas corporais e 220 quadros: 20 ações normais e 16 maromba. Células 512×320, cinco colunas; transparência e células finais vazias. Duas folhas adicionais contêm a latinha e as gotas, seis quadros cada. FPS são propostas de arte, sem integração de combate.

Arquivos disponíveis em `public/assets/lutadores/coxa/rigido-v1`. Cada ação possui corpo separado e composição de referência. `manifest-art.json` contém contagens, hashes da fonte e transformação do mesmo andador por quadro. `objetos/andador.png` é a única vista ativa, com escala fixa; a imagem horizontal rejeitada nunca é exportada.

O agachamento normal usa `normal/crouch-backpain`: mão na lombar, careta, outro braço em apoio, término baixo. As fontes de arremesso, reação alta e soco aéreo que encostavam na borda foram substituídas pelas versões `*-final`; as antigas permanecem apenas como histórico fora do pacote.

Cada pasta de produção guarda fonte, especificação, referências, recortes, escala, quadros e prévias. Conferidas as margens das fontes substitutas e a montagem. A pegada e a oclusão fina das mãos nas composições ainda são material de revisão visual; não representam aprovação do usuário nem validação em combate. A latinha é uma camada independente com coordenadas em `*-props.json`; parábola e emissão das gotas ficam para a lógica.

Pendentes de definição do usuário: pesado e rasteiro maromba, além da animação de retorno ao normal. Não registrar lutador incompleto. Nenhuma alteração da lógica do jogo nesta entrega.
