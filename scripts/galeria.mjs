// Galeria das imagens que o Codex está gerando, para acompanhar no navegador
// enquanto ele trabalha (o chat lateral mostra as dele; o `codex exec` que o
// Claude dispara não mostra nada). Atualiza sozinha a cada poucos segundos.
//
//   npm run galeria             abre em http://localhost:5199
//
// Mostra, da mais nova para a mais antiga, o que mudou nas últimas horas em:
//   ~/.codex/generated_images/   o bruto de cada geração, uma pasta por sessão
//   output/                      contatos, prévias e revisao.html de cada entrega
//   public/assets/lutadores/     a sheet já aplicada na skin
import { createServer } from 'node:http';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { extname, join, resolve, sep } from 'node:path';

const RAIZ = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const PORTA = 5199;
const FONTES = {
  codex: join(homedir(), '.codex/generated_images'),
  output: join(RAIZ, 'output'),
  sprites: join(RAIZ, 'public/assets/lutadores'),
};
const TIPOS = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.html': 'text/html; charset=utf-8' };
const LIMITE = 120;

function listar(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((nome) => {
    const p = join(dir, nome);
    return statSync(p).isDirectory() ? listar(p) : [p];
  });
}

/** Imagens e prévias mudadas nas últimas `horas`, mais novas primeiro. */
function recentes(horas) {
  const desde = Date.now() - horas * 3600 * 1000;
  return Object.entries(FONTES)
    .flatMap(([fonte, dir]) =>
      listar(dir)
        .filter((p) => TIPOS[extname(p).toLowerCase()])
        .map((p) => ({ fonte, caminho: p.slice(dir.length + 1).split(sep).join('/'), t: statSync(p).mtimeMs }))
    )
    .filter((a) => a.t >= desde)
    .sort((a, b) => b.t - a.t)
    .slice(0, LIMITE);
}

const PAGINA = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>Galeria do Codex</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { margin: 0; font: 14px system-ui, sans-serif; background: #15171a; color: #e8e8e8; }
  header { position: sticky; top: 0; display: flex; gap: 12px; align-items: center; padding: 10px 16px; background: #0d0e10; border-bottom: 1px solid #2a2d31; flex-wrap: wrap; }
  header b { font-size: 16px; }
  input, select { background: #22252a; color: inherit; border: 1px solid #3a3e44; border-radius: 4px; padding: 5px 8px; }
  #estado { color: #8a9099; margin-left: auto; }
  main { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; padding: 16px; }
  figure { margin: 0; background: #1d2024; border: 1px solid #2a2d31; border-radius: 6px; overflow: hidden; }
  figure.nova { border-color: #e0b341; }
  a.img { display: block; height: 220px; background: repeating-conic-gradient(#2b2e33 0 25%, #383c42 0 50%) 0 0 / 16px 16px; }
  a.img img { width: 100%; height: 100%; object-fit: contain; image-rendering: pixelated; }
  a.html { display: flex; height: 220px; align-items: center; justify-content: center; color: #e0b341; font-weight: bold; text-decoration: none; }
  figcaption { padding: 6px 8px; font-size: 12px; word-break: break-all; }
  figcaption span { color: #8a9099; display: block; }
</style></head><body>
<header>
  <b>Galeria do Codex</b>
  <input id="filtro" placeholder="filtrar (ex.: gremista, idle)">
  <select id="fonte"><option value="">todas as pastas</option><option value="codex">bruto do Codex</option><option value="output">output (prévias)</option><option value="sprites">sprites aplicados</option></select>
  <select id="horas"><option value="2">últimas 2 h</option><option value="6" selected>últimas 6 h</option><option value="24">últimas 24 h</option><option value="168">últimos 7 dias</option></select>
  <span id="estado"></span>
</header>
<main id="grade"></main>
<script>
  const $ = (id) => document.getElementById(id);
  let ultima = '', vistas = null;
  async function atualizar() {
    const lista = await (await fetch('/api/lista?horas=' + $('horas').value)).json();
    const f = $('filtro').value.toLowerCase(), fonte = $('fonte').value;
    const itens = lista.filter((a) => (!fonte || a.fonte === fonte) && (a.fonte + '/' + a.caminho).toLowerCase().includes(f));
    const assinatura = JSON.stringify(itens);
    $('estado').textContent = itens.length + ' arquivos, conferido às ' + new Date().toLocaleTimeString('pt-BR');
    if (assinatura === ultima) return;
    ultima = assinatura;
    const chaves = itens.map((a) => a.fonte + '/' + a.caminho + a.t);
    $('grade').innerHTML = itens.map((a, i) => {
      const url = '/arquivo/' + a.fonte + '/' + a.caminho.split('/').map(encodeURIComponent).join('/') + '?t=' + a.t;
      const nova = vistas && !vistas.has(chaves[i]) ? ' nova' : '';
      const corpo = a.caminho.endsWith('.html')
        ? '<a class="html" href="' + url + '" target="_blank">abrir prévia</a>'
        : '<a class="img" href="' + url + '" target="_blank"><img loading="lazy" src="' + url + '"></a>';
      return '<figure class="' + nova + '">' + corpo + '<figcaption>' + a.caminho + '<span>' + a.fonte + ' · ' + new Date(a.t).toLocaleTimeString('pt-BR') + '</span></figcaption></figure>';
    }).join('');
    vistas = new Set(chaves);
  }
  ['filtro', 'fonte', 'horas'].forEach((id) => $(id).addEventListener('input', () => { ultima = ''; atualizar(); }));
  atualizar();
  setInterval(atualizar, 4000);
</script></body></html>`;

createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORTA}`);
  if (url.pathname === '/') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(PAGINA);
    return;
  }
  if (url.pathname === '/api/lista') {
    const horas = Number(url.searchParams.get('horas')) || 6;
    res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(recentes(horas)));
    return;
  }
  const [, prefixo, fonte, ...resto] = url.pathname.split('/');
  const base = FONTES[fonte];
  if (prefixo === 'arquivo' && base) {
    const alvo = resolve(base, decodeURIComponent(resto.join('/')));
    // Só serve o que está dentro das três pastas, nada acima delas.
    if (alvo.startsWith(resolve(base) + sep) && existsSync(alvo) && TIPOS[extname(alvo).toLowerCase()]) {
      res.writeHead(200, { 'content-type': TIPOS[extname(alvo).toLowerCase()], 'cache-control': 'no-store' }).end(readFileSync(alvo));
      return;
    }
  }
  res.writeHead(404).end('não achei');
}).listen(PORTA, '127.0.0.1', () => console.log(`Galeria do Codex em http://localhost:${PORTA}`));
