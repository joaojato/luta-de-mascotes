# Comece aqui

Guia de primeira sessão, em ordem. Depois disso, o `CLAUDE.md` e os `docs/`
assumem.

## 1. Abrir a pasta certa

Abra **esta pasta** no VS Code (`Desktop/VsCode/Pessoal/luta-de-mascotes`),
não a pasta da Alure. A janela fica verde: é o sinal de que você está no
projeto certo.

## 2. Instalar e ver rodando

```
npm install
npm run dev
```

Abre `http://localhost:8080`. O que aparece é o template do Phaser (logo e
menu). É feio de propósito: só prova que a engine roda na sua máquina.

Portão de qualidade, que o Claude vai rodar antes de dizer que terminou:

```
npm run check
```

## 3. Criar a conta do Spriterrific (arte)

1. Cadastro em `https://app.spriterrific.com` (Google ou GitHub). Vem com
   **500 créditos grátis**, sem cartão.
2. Menu **API keys**, criar uma chave.
3. Copiar `.env.example` para `.env` e colar a chave lá. O `.env` está fora do
   git.

500 créditos dão, mais ou menos, **um mascote com parado + 4 animações**. Pra
v1 inteira (2 mascotes, uns 10 movimentos cada) vai precisar comprar crédito.
O Claude estima o custo antes de cada job, é regra do `CLAUDE.md`.

## 4. Preencher o que só você sabe

Abra `docs/briefing.md` e responda os campos "em aberto": o que a matéria
entrega, prazo, se é solo ou grupo, o que o professor avalia. Sem isso o
roteiro fica sem data.

## 5. Abrir o Claude Code aqui dentro

No terminal do VS Code, nesta pasta:

```
claude
```

Primeiro prompt sugerido:

> Lê o CLAUDE.md, o docs/briefing.md e o docs/roteiro-de-construcao.md. Me
> diz em que marco estamos e começa o Marco 0.

O Marco 0 é o motor de luta com retângulos. Termina numa noite e já dá pra
jogar com dois no teclado. A arte vem depois, no Marco 2.

## 6. Ao final de cada sessão

Diga "fecha" ou "commita". A skill `fechar-sessao` roda o `npm run check`,
escreve no diário, commita e dá push. Se ela não fizer isso sozinha, cobre.
