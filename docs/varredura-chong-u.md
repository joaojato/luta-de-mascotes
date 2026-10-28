# Varredura do que ainda é do Chong-U (27/10/2026)

Levantamento para publicar o jogo na Vercel. Base: tudo o que entrou no commit
`6f3a57c` (Marco 0) cruzado com o estado de hoje e com quem consome cada
arquivo no código. Pastas fora do build (`referencia/`, `arquivo/`) não contam.

Atenção: a Regra do Placeholder dizia que todo herdado teria prefixo
`_amostra`. Só os lutadores receberam o prefixo. Os itens das seções 1 e 2
**não têm o prefixo**, então "nenhum `_amostra` em uso" não basta como
critério de publicação. O critério é esta lista zerada.

## Feito hoje

- **Rooftop desativado.** Os dois telhados saíram de `STAGE_DEFINITIONS`; o
  Estádio é o único cenário e o padrão da Luta e do painel de fundo do debug.
  PNGs e o atlas de props (nunca usado) foram para `arquivo/cenarios/rooftop/`.

## 1. Arte e som dele que aparecem no jogo publicado (trocar)

| Asset | Onde aparece | Código que consome |
|---|---|---|
| `public/assets/ui/fighting/` (atlas, 904 KB) | HUD da Luta: barras de vida, moldura de retrato, placa de nome, relógio, medidor do especial; faíscas de acerto (`icon-hit-*`) | `matchHud.ts`, `vfx.ts`, `fightingUiAtlas.ts` |
| `public/assets/mode-cards/mode-1v1-card.png`, `mode-1vcpu-card.png` (4 MB) | Escolha de modo | `assets.ts`, `ModeSelectScene.ts` |
| `public/assets/audio/sfx/ui-confirm.mp3` | Confirmação em todos os menus | `core/audio.ts` |
| `public/favicon.svg` | Ícone da aba (`index.html`, `controle.html`) | |

Textos do template em inglês, que são dele mas não são arte (conferido em
28/10/2026):

- Menu: "Play", "Settings" (`MainMenuScene.ts`).
- Splash: "Press any key to begin" / "Tap screen to begin" (`SplashScene.ts`).
- Modo: "Two players, one keyboard", "You pick, the CPU answers" (`ModeSelectScene.ts`).
- Cenário: "Select Stage" (`LevelSelectScene.ts`).
- Ajustes: "Music -", "Music +", "Toggle mute", "Reset defaults", "Back to menu" (`SettingsScene.ts`).

"FIGHT!", "K.O.", "TIME UP" e "DRAW" na Luta são vocabulário do gênero, não
dele; ficam se o João quiser.

Menor caminho: o HUD é o único item com trabalho de arte de verdade (um atlas
com os mesmos nomes de quadro substitui sem tocar no código). Cartões de modo
podem virar só texto nos botões; som e favicon são troca de arquivo.

## 2. Vai no build, mas o jogo não usa (apagar, sem trocar)

| Asset | Situação |
|---|---|
| `public/assets/ui/quest/` (1,1 MB) | Carregado no Boot, nenhum quadro é desenhado. |
| `public/assets/tiles/quest/` (724 KB) | Carregado no Boot; só o editor de fases do painel de debug usa. |
| `public/assets/levels/`, `public/configs/tile-gym.json` | Editor de fases do starter de RPG, só no debug. |
| `public/assets/index.json` | Catálogo do pacote dele, ainda cita os rooftops. Ninguém lê. |

Ficam (são dados que o jogo lê): `public/configs/fighter-playground.json`,
`character-gym.json` e `public/assets/config/*.json`.

Apagar exige podar junto `tileAtlas.ts`, `tileConfig.ts`, `levelEditor.ts`,
`uiAtlas.ts` e os painéis do shell que os usam. É a poda prevista na ADR 0003
para o Marco 1, que não aconteceu.

## 3. Código dele (a questão de licença)

O repositório dele não tem licença: o padrão legal é "todos os direitos
reservados". O build publicado na Vercel leva o código dele, minificado mas
inteiro. A ADR 0003 já previa: "Se um dia o jogo for publicado com parte do
código dele, pedir autorização ou reescrever os módulos centrais."

Estado de `src/` hoje:

- **Idênticos ao que veio (37 arquivos):** `main.ts`, `core/*` (input,
  áudio, config, eventos, controles virtuais), `assets.ts`, `matchHud.ts`,
  `superCutIn.ts`, `vfx.ts`, `ui.ts`, `settings.ts`, `profiles.ts`, `store.ts`,
  as cenas Boot, Splash, ModeSelect, LevelSelect e Settings, `shell/appShell.ts`
  e os módulos do starter de RPG.
- **Mudados por nós:** `fighter.ts` (+763 linhas, o motor), `CharacterSelectScene.ts`
  (reescrita), `MatchScene.ts`, `fighterConfig.ts`, `stageConfig.ts`,
  `fighterCharacter.ts`, `types.ts`, `vite.config.ts`.
- **Nossos do zero:** Academia, Conectar, `src/game/lutadores/`,
  `src/controle/`, os JSONs e toda a arte dos seis mascotes.

Mesmo os mudados partem do arquivo dele. Reescrever os módulos centrais
(motor, Luta, HUD, input) é trabalho de várias semanas, o que não cabe na
janela até 14/12.

**Recomendação:** pedir autorização ao Chong-U por escrito antes do link
público, contando que é trabalho acadêmico sem fins comerciais e que ele é
creditado no README e nos créditos do jogo. Ele publicou o jogo justamente
como exemplo para quem faz vibecoding, então a chance de resposta positiva é
boa. Guardar a resposta em `docs/decisoes/`.

## 4. Vercel: o que o deploy precisa

- Projeto Vite padrão: build `npm run build`, saída `dist/`. Não precisa de
  `vercel.json`.
- Variáveis em Settings > Environment Variables: `VITE_SUPABASE_URL` e
  `VITE_SUPABASE_ANON_KEY` (ADR 0005), para o controle pelo celular.
- O painel de debug já não aparece fora do localhost (`appShell.ts`, só com
  `import.meta.env.DEV` em host local).
- Build de 55 MB, 44 MB são sprites dos mascotes. Funciona, mas a primeira
  carga é pesada em rede de celular.

## Ordem sugerida, em entregas que rodam

1. Mandar a mensagem ao Chong-U (é o item que mais demora a voltar).
2. Poda da seção 2: só apagar, uma noite.
3. Troca da seção 1: favicon, som e cartões numa noite; HUD num fim de semana.
4. Deploy público na Vercel só depois da resposta. Se precisar testar o
   celular antes, deploy com acesso protegido, conferindo no painel da Vercel
   o que o plano gratuito cobre.
