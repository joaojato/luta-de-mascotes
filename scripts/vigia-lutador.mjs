// Vigia de lutador novo: acha sprite entregue em public/assets/lutadores/<slug>/
// que ainda não tem JSON em src/game/lutadores/. Usado pelo hook SessionStart
// (.claude/settings.json) e pelo vigia em segundo plano de uma sessão aberta.
//
//   node scripts/vigia-lutador.mjs           relatório (sai 0 sempre)
//   node scripts/vigia-lutador.mjs --hook    JSON para o hook SessionStart
//   node scripts/vigia-lutador.mjs --esperar fica rodando até haver entrega
//
// Entrega conta como pronta quando a skin tem todas as ações do plano do
// Codex (output/<slug>*/plan.json) ou, sem plano, o conjunto mínimo (a ordem
// de prioridade de docs/criador-de-personagem.md), e nenhum arquivo da pasta
// mudou nos últimos 10 minutos (o Codex terminou de escrever).
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const RAIZ = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const SPRITES = join(RAIZ, 'public/assets/lutadores');
const JSONS = join(RAIZ, 'src/game/lutadores');
const QUIETO_MS = 10 * 60 * 1000;
const MINIMO = ['idle', 'walk-forward', 'hit-high', 'knockdown', 'light-punch', 'heavy-kick'];

function maisRecente(dir) {
  let t = statSync(dir).mtimeMs;
  for (const nome of readdirSync(dir)) {
    const p = join(dir, nome);
    const s = statSync(p);
    t = Math.max(t, s.isDirectory() ? maisRecente(p) : s.mtimeMs);
  }
  return t;
}

/** Ações que o plano do Codex promete para este mascote, se houver plano. */
function planoDoCodex(slug) {
  const saida = join(RAIZ, 'output');
  if (!existsSync(saida)) return null;
  for (const pasta of readdirSync(saida).filter((p) => p.startsWith(slug))) {
    const arquivo = join(saida, pasta, 'plan.json');
    if (!existsSync(arquivo)) continue;
    try {
      const plano = JSON.parse(readFileSync(arquivo, 'utf8'));
      if (plano[slug]) return { acoes: Object.keys(plano[slug]) };
    } catch {
      // Plano sendo escrito: tenta de novo na próxima volta.
    }
  }
  return null;
}

function pendentes() {
  const registrados = new Set(readdirSync(JSONS).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)));
  return readdirSync(SPRITES)
    .filter((slug) => !slug.startsWith('_') && !registrados.has(slug) && statSync(join(SPRITES, slug)).isDirectory())
    .map((slug) => {
      const pasta = join(SPRITES, slug);
      const skins = readdirSync(pasta).filter((s) => existsSync(join(pasta, s, 'idle.png')));
      // Com plano do Codex (output/<slug>*/plan.json), pronto é o plano inteiro; sem plano, o mínimo.
      const plano = planoDoCodex(slug);
      const esperadas = plano ? plano.acoes : MINIMO;
      const faltam = esperadas.filter((acao) => !skins.some((s) => existsSync(join(pasta, s, `${acao}.png`))));
      const quieto = Date.now() - maisRecente(pasta) > QUIETO_MS;
      return { slug, skins, faltam, pronto: faltam.length === 0 && quieto };
    });
}

function guias(slug) {
  return readdirSync(join(RAIZ, 'docs')).filter((f) => f.startsWith(slug) && f.endsWith('.md'));
}

const modo = process.argv[2];

if (modo === '--esperar') {
  const verificar = () => {
    const prontos = pendentes().filter((p) => p.pronto);
    if (prontos.length === 0) return;
    prontos.forEach((p) => console.log(`ENTREGA PRONTA: ${p.slug} (skins: ${p.skins.join(', ')}; guias: ${guias(p.slug).join(', ') || 'nenhum'})`));
    process.exit(0);
  };
  verificar();
  setInterval(verificar, 60 * 1000);
} else {
  const lista = pendentes();
  const prontos = lista.filter((p) => p.pronto);
  if (modo === '--hook') {
    if (prontos.length > 0) {
      const texto = prontos
        .map((p) => `Lutador novo entregue e ainda fora do jogo: ${p.slug} (skins: ${p.skins.join(', ')}; guias em docs/: ${guias(p.slug).join(', ') || 'nenhum'}).`)
        .join(' ');
      console.log(JSON.stringify({
        systemMessage: `Vigia de lutador: ${prontos.map((p) => p.slug).join(', ')} pronto para integrar.`,
        hookSpecificOutput: {
          hookEventName: 'SessionStart',
          additionalContext: `${texto} O João pediu que entre no jogo automaticamente: integrar com a skill lutador-novo (Etapas 3 a 5), rodar npm run check, commitar, dar push e publicar na Vercel (autorizado por ele em 30/10/2026 para o Corinthiano e o Dragão goianiense; procedimento em docs/licoes.md, "Deploy da Vercel sai da conta pessoal"), e avisar.`
        }
      }));
    }
  } else {
    if (lista.length === 0) console.log('Nenhum lutador entregue fora do jogo.');
    lista.forEach((p) => console.log(`${p.slug}: ${p.pronto ? 'PRONTO' : p.faltam.length ? `faltam ${p.faltam.join(', ')}` : 'ainda sendo escrito'} (skins: ${p.skins.join(', ') || 'nenhuma'})`));
  }
}
