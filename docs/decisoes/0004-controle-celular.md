# ADR 0004: controle por câmera do celular

**Data:** 2026-10-01
**Status:** aceito; o caminho pela internet é da 0005

## Contexto

O João quer jogar com o corpo: soco, chute, passo e pulo lidos por câmera.
A análise (`docs/controle-camera.md`) mediu o Fight_Detection: a LSTM leva
uns 22 quadros (cerca de 1 s) para reconhecer um soco, lenta demais para luta,
e o pipeline só roda no PC dele, em Python com GPU. Ele escolheu o celular
como câmera: escaneia um QR code, o celular lê o corpo e o jogo roda no PC.
Isso antecipa algo além da v1, por ordem dele (licoes.md, 2026-10-01).

## Decisão

O celular abre `controle.html`, roda o MediaPipe Pose no navegador e manda
os 33 pontos do corpo para o jogo por um WebSocket servido pelo próprio Vite;
o jogo traduz em comando (`src/controle/gestos.ts`) e soma com o teclado.

Quatro dependências, cada uma com o seu motivo:

- **`@mediapipe/tasks-vision`** (Google, Apache 2.0): leitura de corpo
  inteiro no navegador, com pose 3D em metros. É o que permite ver soco de
  frente para a câmera, que quase não muda a imagem 2D. O wasm e o modelo
  `pose_landmarker_lite` vêm de CDN (jsDelivr e Google), não do repositório:
  são 34 MB de wasm.
- **`qrcode`**: monta o QR code da tela de conexão. Escrever um gerador de
  QR à mão não paga o tempo.
- **`ws`** (só dev): o relay. O Vite não expõe um WebSocket genérico; o
  `ws` pendura no mesmo servidor sem brigar com o HMR.
- **`@vitejs/plugin-basic-ssl`** (só dev): a câmera do celular só abre em
  HTTPS. O plugin gera um certificado próprio no `npm run dev:celular`; o
  celular avisa uma vez e segue.

## Alternativas descartadas

- **Ponte com o Fight_Detection.** LSTM lenta demais (1 s por soco), só roda
  no PC do João, dois processos para manter.
- **Webcam do PC.** Funciona, mas dois jogadores dividem a mesma imagem e
  precisam de 3 m de sala. Com um celular cada, cada câmera vê uma pessoa.
- **WebRTC com PeerJS.** Conexão direta celular e PC, mas depende do
  servidor público do PeerJS para o primeiro contato e falha nas mesmas redes
  que bloqueiam o relay. O relay no Vite não depende de nada fora da sala.
- **Supabase Realtime.** Passa pela internet, soma latência e pede conta.
- **Classificar o gesto no celular e mandar só o comando.** Menos dado na
  rede, mas o ajuste ficaria escondido no celular. Com os pontos crus, a tela
  de conexão mostra o esqueleto e o que foi lido, na tela grande.

## Consequências

- O controle por celular só existe com o servidor do projeto rodando
  (`npm run dev:celular`). Um build estático publicado não tem relay; a tela
  de conexão avisa.
- Celular e PC precisam estar na mesma rede, e a rede precisa deixar um
  aparelho falar com o outro. Wi-Fi de universidade costuma bloquear; o plano
  seguro é o PC no roteador do celular.
- A primeira abertura no celular baixa uns 40 MB (wasm e modelo); depois fica
  em cache.
- O motor não mudou: o celular produz o mesmo `FighterInput` que o teclado e
  a CPU. Regra do JSON intacta.
- Os limites dos gestos (`LIMITES` em `gestos.ts`) saíram de corpo sintético
  e de um vídeo de teste. Só se acertam com gente de verdade na frente da
  câmera.
