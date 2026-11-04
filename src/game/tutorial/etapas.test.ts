import { describe, expect, it } from 'vitest';

import type { GuardStance } from '../moveMechanics';
import { ANEL_MS, TreinoDeAparo } from './aparo';
import { CpuDoTutorial, type LeituraDoTutorial } from './cpuDoTutorial';
import { ROTEIRO } from './roteiro';
import { Tutorial, type GolpeNaLuta, type QuadroDoJogador } from './tutorial';

const PARADO: QuadroDoJogador = { esquerda: false, direita: false, noAr: false, agachado: false, dash: null };

/** Fecha as falas na tela (e as da etapa só de fala que vier depois). */
function lerFalas(tutorial: Tutorial): void {
  for (let i = 0; i < 50 && tutorial.congelado; i++) tutorial.continuar();
}

/** Um pouco de tudo, uma ação por quadro, como o jogador (e a CPU) fariam. */
function acoes(tutorial: Tutorial): (() => void)[] {
  const golpe = (extra: Partial<GolpeNaLuta> & { golpe: string }) => () =>
    tutorial.golpe({ atacante: 'p1', defendido: false, guardaQuebrada: false, ...extra });
  const quadro = (q: Partial<QuadroDoJogador>, segundos = 0.1) => () => tutorial.quadro({ ...PARADO, ...q }, segundos);
  return [
    quadro({ esquerda: true }, 1),
    quadro({ direita: true }, 1),
    quadro({ noAr: true }),
    quadro({ agachado: true }),
    quadro({ dash: 'frente' }),
    golpe({ golpe: 'soco-rapido' }),
    golpe({ golpe: 'chute-basico' }),
    golpe({ golpe: 'soco-forte', guardaQuebrada: true }),
    golpe({ golpe: 'chute-baixo', guardaQuebrada: true }),
    golpe({ golpe: 'soco-no-ar' }),
    golpe({ golpe: 'voadora' }),
    golpe({ golpe: 'especial', especial: true }),
    // A CPU: soco que entra, aparo, defesas em pé e abaixado, guardas quebradas.
    golpe({ atacante: 'p2', golpe: 'soco-rapido' }),
    golpe({ atacante: 'p2', golpe: 'soco-rapido', defendido: true, aparo: true }),
    ...Array.from({ length: 3 }, () => golpe({ atacante: 'p2', golpe: 'soco-rapido', defendido: true })),
    golpe({ atacante: 'p2', golpe: 'soco-forte', guardaQuebrada: true }),
    ...Array.from({ length: 3 }, () => golpe({ atacante: 'p2', golpe: 'chute-baixo', defendido: true })),
    // Passo largo para trás com a voadora no ar, e ela pousa sem acertar.
    quadro({ dash: 'tras', cpuNoAr: true }),
    quadro({ cpuNoAr: false }),
    golpe({ atacante: 'p2', golpe: 'voadora', guardaQuebrada: true }),
    // O respiro depois do checklist completo.
    quadro({}, 1)
  ];
}

function fazerTudo(tutorial: Tutorial): void {
  acoes(tutorial).forEach((acao) => acao());
}

/** Avança até a etapa, uma ação por vez, e para assim que ela começa. */
function ate(tutorial: Tutorial, id: string): void {
  for (let volta = 0; volta < 50 && tutorial.etapa.id !== id; volta++) {
    for (const acao of acoes(tutorial)) {
      // Confere antes de ler: a etapa só de fala passaria direto.
      if (tutorial.etapa.id === id) break;
      lerFalas(tutorial);
      if (tutorial.etapa.id === id) break;
      acao();
    }
  }
  expect(tutorial.etapa.id).toBe(id);
}

describe('etapas do tutorial', () => {
  it('começa congelado na primeira fala e avisa a etapa nova uma vez', () => {
    const tutorial = new Tutorial();
    expect(tutorial.congelado).toBe(true);
    expect(tutorial.falaAtual).toContain('{esquerda}');
    expect(tutorial.tomarEtapaNova()?.id).toBe('andar');
    expect(tutorial.tomarEtapaNova()).toBeNull();
  });

  it('com a fala na tela, nada que o jogador faz conta', () => {
    const tutorial = new Tutorial();
    tutorial.quadro({ ...PARADO, esquerda: true }, 1);
    lerFalas(tutorial);
    expect(tutorial.checklist.every((item) => !item.feito)).toBe(true);
  });

  it('o checklist libera a próxima etapa só quando tudo foi feito', () => {
    const tutorial = new Tutorial();
    lerFalas(tutorial);
    tutorial.quadro({ ...PARADO, esquerda: true }, 0.4);
    expect(tutorial.etapa.id).toBe('andar');
    expect(tutorial.checklist.map((item) => item.feito)).toEqual([true, false]);
    // Toque rápido não conta como andar.
    tutorial.quadro({ ...PARADO, direita: true }, 0.1);
    expect(tutorial.etapa.id).toBe('andar');
    tutorial.quadro({ ...PARADO, direita: true }, 0.25);
    // Tudo marcado: 1 s de luta solta antes da próxima fala, e nada mais conta.
    expect(tutorial.etapa.id).toBe('andar');
    expect(tutorial.checklist.every((item) => item.feito)).toBe(true);
    expect(tutorial.congelado).toBe(false);
    tutorial.quadro(PARADO, 0.6);
    expect(tutorial.etapa.id).toBe('andar');
    tutorial.quadro(PARADO, 0.5);
    expect(tutorial.etapa.id).toBe('pular');
    expect(tutorial.congelado).toBe(true);
  });

  it('percorre o roteiro inteiro até o QUEBRE ELE', () => {
    const tutorial = new Tutorial();
    const ids: string[] = [];
    for (let i = 0; i < 400 && !tutorial.acabou; i++) {
      const nova = tutorial.tomarEtapaNova();
      if (nova) ids.push(nova.id);
      if (tutorial.congelado) tutorial.continuar();
      else fazerTudo(tutorial);
    }
    expect(tutorial.acabou).toBe(true);
    expect(ids).toEqual(ROTEIRO.map((etapa) => etapa.id));
  });

  it('golpe defendido não conta como acerto, e golpe da CPU não conta como golpe do jogador', () => {
    const tutorial = new Tutorial();
    ate(tutorial, 'bater');
    lerFalas(tutorial);
    tutorial.golpe({ atacante: 'p1', golpe: 'soco-rapido', defendido: true, guardaQuebrada: false });
    tutorial.golpe({ atacante: 'p2', golpe: 'chute-basico', defendido: false, guardaQuebrada: false });
    expect(tutorial.checklist.every((item) => !item.feito)).toBe(true);
  });

  it('etapa só de fala passa ao fechar a fala, com a torcida e a luz dela', () => {
    const tutorial = new Tutorial();
    ate(tutorial, 'que-show');
    tutorial.tomarEtapaNova();
    expect(tutorial.etapa.putometro).toBe('cheio');
    expect(tutorial.etapa.foco).toEqual(['putometro']);
    tutorial.continuar();
    expect(tutorial.tomarEtapaNova()?.id).toBe('quebrar-guarda');
    expect(tutorial.congelado).toBe(true);
  });

  it('com gatilho, a luta corre sem fala até o jogador apanhar', () => {
    const tutorial = new Tutorial();
    ate(tutorial, 'apanhar');
    expect(tutorial.congelado).toBe(false);
    expect(tutorial.esperandoGatilho).toBe(true);
    expect(tutorial.cpu).toBe('socos');
    // Defendido não é apanhar.
    tutorial.golpe({ atacante: 'p2', golpe: 'soco-rapido', defendido: true, guardaQuebrada: false });
    expect(tutorial.congelado).toBe(false);
    tutorial.golpe({ atacante: 'p2', golpe: 'soco-rapido', defendido: false, guardaQuebrada: false });
    expect(tutorial.falaAtual).toContain('P%#R@!');
    expect(tutorial.tomarEtapaNova()?.putometro).toBe('vermelho');
  });

  it('cada golpe forte testado: soco forte e chute baixo, um não basta', () => {
    const tutorial = new Tutorial();
    ate(tutorial, 'quebrar-guarda');
    lerFalas(tutorial);
    const quebrar = (golpe: string) => tutorial.golpe({ atacante: 'p1', golpe, defendido: false, guardaQuebrada: true });
    quebrar('soco-forte');
    quebrar('soco-forte');
    tutorial.quadro(PARADO, 2);
    expect(tutorial.etapa.id).toBe('quebrar-guarda');
    quebrar('chute-baixo');
    tutorial.quadro(PARADO, 1.1);
    expect(tutorial.etapa.id).toBe('no-ar');
  });

  it('a CPU muda depois das falas', () => {
    const tutorial = new Tutorial();
    ate(tutorial, 'tontos');
    expect(tutorial.cpu).toBe('parada');
    lerFalas(tutorial);
    expect(tutorial.cpu).toBe('socos');
  });

  it('conta as vezes: três defesas abaixado para passar', () => {
    const tutorial = new Tutorial();
    ate(tutorial, 'guarda-baixa');
    tutorial.golpe({ atacante: 'p2', golpe: 'soco-forte', defendido: false, guardaQuebrada: true });
    lerFalas(tutorial);
    expect(tutorial.cpu).toBe('pesados');
    const defender = () => tutorial.golpe({ atacante: 'p2', golpe: 'chute-baixo', defendido: true, guardaQuebrada: false });
    defender();
    defender();
    // Soco rápido defendido em pé não é golpe pesado.
    tutorial.golpe({ atacante: 'p2', golpe: 'soco-rapido', defendido: true, guardaQuebrada: false });
    expect(tutorial.checklist[0]).toMatchObject({ contagem: 2, feito: false });
    defender();
    tutorial.quadro(PARADO, 1.1);
    expect(tutorial.etapa.id).toBe('voadora');
  });

  it('desviar da voadora: passo largo para trás com ela no ar, e ela pousa sem acertar', () => {
    const tutorial = new Tutorial();
    ate(tutorial, 'voadora');
    tutorial.golpe({ atacante: 'p2', golpe: 'voadora', defendido: false, guardaQuebrada: true });
    lerFalas(tutorial);
    // Deu o passo, mas a voadora acertou: não vale.
    tutorial.quadro({ ...PARADO, dash: 'tras', cpuNoAr: true }, 0.1);
    tutorial.golpe({ atacante: 'p2', golpe: 'voadora', defendido: false, guardaQuebrada: false });
    tutorial.quadro({ ...PARADO, cpuNoAr: false }, 0.1);
    expect(tutorial.etapa.id).toBe('voadora');
    // Ficou parado e ela errou: também não.
    tutorial.quadro({ ...PARADO, cpuNoAr: true }, 0.1);
    tutorial.quadro({ ...PARADO, cpuNoAr: false }, 0.1);
    expect(tutorial.etapa.id).toBe('voadora');
    tutorial.quadro({ ...PARADO, cpuNoAr: true }, 0.1);
    tutorial.quadro({ ...PARADO, dash: 'tras', cpuNoAr: true }, 0.1);
    tutorial.quadro({ ...PARADO, cpuNoAr: false }, 0.1);
    tutorial.quadro(PARADO, 1.1);
    expect(tutorial.etapa.id).toBe('especial');
  });
});

describe('treino de aparo', () => {
  it('a CPU soca a antecedência antes do impacto, e o anel fecha no impacto', () => {
    const aparo = new TreinoDeAparo();
    expect(aparo.quadro(0, true, 80)).toEqual({ socar: false, anel: 0 });
    expect(aparo.quadro(ANEL_MS - 81, true, 80).socar).toBe(false);
    const soco = aparo.quadro(ANEL_MS - 80, true, 80);
    expect(soco.socar).toBe(true);
    expect(aparo.quadro(ANEL_MS - 40, true, 80).socar).toBe(false);
    expect(aparo.quadro(ANEL_MS, true, 80).anel).toBe(1);
  });

  it('julga o contato: na hora, cedo (guarda comum) ou tarde (apanhou)', () => {
    const aparo = new TreinoDeAparo();
    aparo.quadro(0, true, 80);
    expect(aparo.contato(ANEL_MS, true, true)).toBe('certo');
    expect(aparo.emAndamento).toBe(false);
    // Espera entre tentativas.
    expect(aparo.quadro(ANEL_MS + 500, true, 80).anel).toBeNull();
    aparo.quadro(ANEL_MS + 2000, true, 80);
    expect(aparo.contato(ANEL_MS + 2900, true, false)).toBe('cedo');
    aparo.quadro(10000, true, 80);
    expect(aparo.contato(10900, false, false)).toBe('tarde');
    expect(aparo.resultado).toEqual({ resultado: 'tarde', em: 10900 });
  });

  it('sem contato (fora do alcance), recomeça sozinho', () => {
    const aparo = new TreinoDeAparo();
    aparo.quadro(0, true, 80);
    expect(aparo.quadro(ANEL_MS + 500, true, 80).anel).toBeNull();
    expect(aparo.emAndamento).toBe(false);
  });

  it('não começa sem estar pronto (longe, ou o jogador no ar)', () => {
    const aparo = new TreinoDeAparo();
    expect(aparo.quadro(0, false, 80).anel).toBeNull();
    expect(aparo.emAndamento).toBe(false);
  });
});

describe('CPU do tutorial', () => {
  const leitura = (eu: number, oponente: number, tempoMs = 0, noAr = false, guarda: GuardStance | null = null): LeituraDoTutorial => ({
    tempoMs,
    eu: { x: eu, noAr, atordoado: false, barraCheia: false, chuteDeLonge: false },
    oponente: { x: oponente, noAr: false, atordoado: false, atacando: false, projetil: false, caido: false },
    guardaDoOponente: guarda,
    euOcupado: false
  });

  it('parada não faz nada; chegar anda até perto e para', () => {
    const cpu = new CpuDoTutorial();
    expect(Object.values(cpu.atualizar('parada', leitura(800, 300))).some(Boolean)).toBe(false);
    expect(cpu.atualizar('chegar', leitura(800, 300)).left).toBe(true);
    expect(cpu.atualizar('chegar', leitura(450, 300)).left).toBe(false);
  });

  it('guarda alta: chega e segura a defesa em pé', () => {
    const cpu = new CpuDoTutorial();
    expect(cpu.atualizar('guarda-alta', leitura(800, 300)).left).toBe(true);
    const perto = cpu.atualizar('guarda-alta', leitura(480, 300));
    expect(perto.block).toBe(true);
    expect(perto.crouch).toBe(false);
  });

  it('pula no lugar com 1,5 s entre o pouso e o próximo pulo', () => {
    const cpu = new CpuDoTutorial();
    expect(cpu.atualizar('pular', leitura(500, 300, 0)).jump).toBe(true);
    cpu.atualizar('pular', leitura(500, 300, 100, true));
    expect(cpu.atualizar('pular', leitura(500, 300, 900)).jump).toBe(false);
    expect(cpu.atualizar('pular', leitura(500, 300, 2300)).jump).toBe(false);
    expect(cpu.atualizar('pular', leitura(500, 300, 2400)).jump).toBe(true);
  });

  it('socos: chega e soca em ritmo', () => {
    const cpu = new CpuDoTutorial();
    expect(cpu.atualizar('socos', leitura(800, 300)).left).toBe(true);
    expect(cpu.atualizar('socos', leitura(470, 300, 0)).light).toBe(true);
    expect(cpu.atualizar('socos', leitura(470, 300, 500)).light).toBe(false);
    expect(cpu.atualizar('socos', leitura(470, 300, 1100)).light).toBe(true);
  });

  it('encostada no corpo do jogador, a distância não diminui: já está no alcance e soca', () => {
    const cpu = new CpuDoTutorial();
    // 200 px é longe para 180, mas o corpo não deixa passar disso.
    expect(cpu.atualizar('socos', leitura(500, 300, 0)).left).toBe(true);
    expect(cpu.atualizar('socos', leitura(500, 300, 100)).light).toBe(false);
    const golpe = cpu.atualizar('socos', leitura(500, 300, 260));
    expect(golpe.light).toBe(true);
    expect(golpe.left).toBe(false);
  });

  it('presa no próprio golpe, ou longe demais, a distância parada não é encostar', () => {
    const ocupada = new CpuDoTutorial();
    ocupada.atualizar('socos', leitura(500, 300, 0));
    ocupada.atualizar('socos', { ...leitura(500, 300, 100), euOcupado: true });
    expect(ocupada.atualizar('socos', { ...leitura(500, 300, 300), euOcupado: true }).light).toBe(false);
    expect(ocupada.atualizar('socos', leitura(500, 300, 400))).toMatchObject({ left: true, light: false });
    const longe = new CpuDoTutorial();
    longe.atualizar('socos', leitura(700, 300, 0));
    longe.atualizar('socos', leitura(700, 300, 100));
    expect(longe.atualizar('socos', leitura(700, 300, 400))).toMatchObject({ left: true, light: false });
  });

  it('distância parada sem ela tentar andar (luta congelada) não é encostar', () => {
    const cpu = new CpuDoTutorial();
    cpu.atualizar('parada', leitura(700, 300, 0));
    cpu.atualizar('parada', leitura(700, 300, 500));
    expect(cpu.atualizar('socos', leitura(700, 300, 1000)).left).toBe(true);
    expect(cpu.atualizar('socos', leitura(690, 300, 1100))).toMatchObject({ left: true, light: false });
  });

  it('soco forte só com a guarda em pé, abaixado e botão no mesmo quadro', () => {
    const cpu = new CpuDoTutorial();
    expect(cpu.atualizar('soco-forte-na-guarda', leitura(470, 300, 0)).light).toBe(false);
    const golpe = cpu.atualizar('soco-forte-na-guarda', leitura(470, 300, 100, false, 'alta'));
    expect(golpe).toMatchObject({ crouch: true, light: true });
    // Segura o baixo um instante depois.
    expect(cpu.atualizar('soco-forte-na-guarda', leitura(470, 300, 150, false, 'alta'))).toMatchObject({ crouch: true, light: false });
  });

  it('pesados se alternam entre soco forte e chute baixo', () => {
    const cpu = new CpuDoTutorial();
    expect(cpu.atualizar('pesados', leitura(470, 300, 0))).toMatchObject({ crouch: true, light: true, heavy: false });
    expect(cpu.atualizar('pesados', leitura(470, 300, 1400))).toMatchObject({ crouch: true, light: false, heavy: true });
  });

  it('voadora: espera a guarda baixa, pula para a frente e chuta no ar', () => {
    const cpu = new CpuDoTutorial();
    expect(cpu.atualizar('voadora-na-guarda-baixa', leitura(630, 300, 0, false, 'alta')).jump).toBe(false);
    const pulo = cpu.atualizar('voadora-na-guarda-baixa', leitura(630, 300, 100, false, 'baixa'));
    expect(pulo).toMatchObject({ jump: true, left: true });
    expect(cpu.atualizar('voadora-na-guarda-baixa', leitura(620, 300, 200, true)).heavy).toBe(false);
    expect(cpu.atualizar('voadora-na-guarda-baixa', leitura(600, 300, 330, true)).heavy).toBe(true);
    expect(cpu.atualizar('voadora-na-guarda-baixa', leitura(580, 300, 360, true)).heavy).toBe(false);
  });

  it('aparo: o soco sai pelo treino de aparo, sincronizado com o anel', () => {
    const cpu = new CpuDoTutorial();
    expect(cpu.atualizar('aparo', leitura(470, 300, 0, false), 80).light).toBe(false);
    expect(cpu.aparo.emAndamento).toBe(true);
    expect(cpu.atualizar('aparo', leitura(470, 300, ANEL_MS - 80, false), 80).light).toBe(true);
  });
});
