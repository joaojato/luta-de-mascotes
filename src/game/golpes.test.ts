import { describe, expect, it } from 'vitest';
import { GOLPES, golpesDoLutador, golpesNaPausa, nomesDosBotoes, animacoesDaAcademia } from './golpes';
import { LUTADORES } from './lutadores';
import { getCharacterDefinition } from './hero';

function situacoes(id: string) {
  return Object.fromEntries(golpesDoLutador(getCharacterDefinition(id)).map((g) => [g.golpe.id, [g.situacao, g.acao]]));
}

describe('catálogo de golpes', () => {
  it('mostra o que o Urubu tem, o que usa de quebra-galho e o que falta', () => {
    const urubu = situacoes('urubu');
    expect(urubu['soco-rapido']).toEqual(['tem', 'light-punch']);
    expect(urubu['soco-forte']).toEqual(['tem', 'heavy-punch']);
    expect(urubu['chute-basico']).toEqual(['tem', 'beak-pull']);
    expect(urubu['chute-baixo']).toEqual(['tem', 'low-kick']);
    expect(urubu['voadora']).toEqual(['tem', 'jump-kick']);
    expect(urubu['soco-no-ar']).toEqual(['tem', 'jump-punch']);
    expect(urubu['especial'][0]).toBe('tem');
  });
  it('usa a sheet do Forte que o JSON escolhe (tiro do Almirante)', () => {
    expect(situacoes('almirante')['soco-forte']).toEqual(['tem', 'heavy-punch']);
    expect(situacoes('almirante')['chute-basico']).toEqual(['tem', 'shot']);
    expect(situacoes('almirante')['chute-baixo']).toEqual(['tem', 'heavy-kick']);
  });
});

describe('inventário de animações da Academia',()=>{
  it('todo o elenco da seleção tem intro própria; Maromba fica sem intro por escolha do usuário',()=>{
    for(const lutador of LUTADORES.filter(l=>l.selecionavel!==false)) {
      const intro=animacoesDaAcademia(getCharacterDefinition(lutador.id)).find(a=>a.animacao.id==='entrance')!;
      expect(intro.situacao,lutador.id).toBe('tem');
      expect(intro.acao,lutador.id).toBe('entrance');
    }
    expect(animacoesDaAcademia(getCharacterDefinition('coxa-maromba')).find(a=>a.animacao.id==='entrance')).toMatchObject({situacao:'faltando',acao:null});
  });
  it('não conta a guarda como intro quando falta a ação',()=>{
    const c=getCharacterDefinition('urubu');
    const semIntro={...c,animations:c.animations.filter(a=>a.action!=='entrance')};
    expect(animacoesDaAcademia(semIntro).find(a=>a.animacao.id==='entrance')).toMatchObject({situacao:'faltando',acao:null});
  });
  it('tiro de garrucha conta como Bruto próprio do Almirante, com descrição visível',()=>{
    const inventario=animacoesDaAcademia(getCharacterDefinition('almirante'));
    expect(inventario.find(a=>a.animacao.id==='chute-basico')).toMatchObject({situacao:'tem',acao:'shot',descricao:'Tiro de garrucha'});
    expect(inventario.find(a=>a.animacao.id==='chute-baixo')).toMatchObject({situacao:'tem',acao:'heavy-kick'});
  });
});

describe('nome do golpe no botão do celular', () => {
  it('muda com o lutador de pé, abaixado e no ar', () => {
    const saci = LUTADORES.find((l) => l.id === 'saci')!.nomes;
    expect(nomesDosBotoes(saci, 'pe')).toEqual({ light: 'Rápido', heavy: 'Bruto', block: 'Defesa', special: 'Furacão' });
    expect(nomesDosBotoes(saci, 'abaixado')).toMatchObject({ light: 'Rápido Forte', heavy: 'Bruto Baixo', block: 'Defesa baixa' });
    expect(nomesDosBotoes(saci, 'ar')).toMatchObject({ light: 'Rápido Aéreo', heavy: 'Bruto de Cima' });
  });

  it('sem nomes no JSON, cai no nome genérico', () => {
    expect(nomesDosBotoes(undefined, 'pe')).toEqual({ light: 'Rápido', heavy: 'Bruto', block: 'Defesa', special: 'Especial' });
  });

  it('nomes particulares de todos os mascotes não sobrepõem os seis comandos', () => {
    for (const lutador of LUTADORES) {
      const estados = ['pe', 'abaixado', 'ar'] as const;
      const esperados = [['Rápido', 'Bruto'], ['Rápido Forte', 'Bruto Baixo'], ['Rápido Aéreo', 'Bruto de Cima']];
      estados.forEach((estado, i) => {
        const botoes = nomesDosBotoes(lutador.nomes, estado);
        expect([botoes.light, botoes.heavy], `${lutador.id}: ${estado}`).toEqual(esperados[i]);
      });
    }
  });

  it('todo lutador da seleção tem nome curto para cada golpe, que cabe no botão', () => {
    for (const lutador of LUTADORES.filter((l) => l.selecionavel !== false)) {
      for (const golpe of GOLPES) {
        const nome = lutador.nomes?.[golpe.id];
        expect(nome, `${lutador.id}: ${golpe.id}`).toBeTruthy();
        expect(nome!.length, `${lutador.id}: ${golpe.id}`).toBeLessThanOrEqual(11);
      }
    }
  });
});

describe('golpes na pausa', () => {
  it('o Almirante lista o baixo + chute como os outros: o chute forte, que é o que ele dá', () => {
    const almirante = LUTADORES.find((l) => l.id === 'almirante')!;
    expect(golpesNaPausa(almirante)).toContain('Bruto: Tiro de garrucha');
    expect(golpesNaPausa(almirante)).toContain('Bruto Baixo: Chute forte');
  });

  it('todo mascote da seleção lista os seis ataques e o especial', () => {
    LUTADORES.filter((l) => l.selecionavel !== false).forEach((lutador) => {
      expect(golpesNaPausa(lutador).map((linha) => linha.split(':')[0]), lutador.id).toEqual(['Rápido', 'Rápido Forte', 'Bruto', 'Bruto Baixo', 'Rápido Aéreo', 'Bruto de Cima', 'Especial']);
    });
  });
});
