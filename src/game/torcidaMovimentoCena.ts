import * as Phaser from 'phaser';
import { avancarPercurso, embaralharPessoas, iniciarPercurso, perfilDeCirculacao, quantidadeParaSair, rotaDeSaida, type CorredorTorcida, type PercursoTorcida } from './torcidaRotas';
import { camadaDoPercurso } from './torcidaCamadas';
import { avaliarPressaoTorcida, novaReacaoTorcida, registrarDerrotaTorcida } from './torcidaReacao';

export interface TorcedorNaCena {
  x: number;
  fileira: number;
  lado: 0 | 1;
  tipo: number;
  camisa: number;
  sprite: Phaser.GameObjects.Sprite;
  extras: Phaser.GameObjects.Sprite[];
  semCamisa?: boolean;
}
interface FileiraMovimento { y: number; escala: number; setor?: string }
interface Saindo {
  pessoa: TorcedorNaCena;
  percurso: PercursoTorcida;
  comeca: number;
  sprite: Phaser.GameObjects.Sprite | null;
  corredor: CorredorTorcida;
  velocidade: number;
}

/** Eventos duram a cena inteira, inclusive o intervalo e a tela de resultado. */
export function derrotaDaTorcida(scene: Phaser.Scene, lado: 0 | 1, decisiva: boolean, vidaVencedor = 1): void {
  scene.events.emit('torcida-derrota', lado, decisiva, vidaVencedor);
}
export function vidaDaTorcida(scene: Phaser.Scene, p1: number, p2: number): void {
  scene.events.emit('torcida-vida', p1, p2);
}
export function reiniciarTorcida(scene: Phaser.Scene): void {
  scene.events.emit('torcida-reiniciar');
}

export function criarCirculacaoTorcida(
  scene: Phaser.Scene,
  escalaCena: number,
  fileiras: FileiraMovimento[],
  pessoas: TorcedorNaCena[],
  animacao: (pessoa: TorcedorNaCena, descer: boolean) => { textura: string; anim: string },
  sortear:()=>number = Math.random
): { atualizar: () => void; sprites: () => Phaser.GameObjects.Sprite[] } {
  const saindo: Saindo[] = [];
  const selecionados = new Set<TorcedorNaCena>();
  const saidasAvulsas=[0,0];
  let reacao = novaReacaoTorcida();
  let ultimo = scene.time.now;

  const encaminhar=(pessoa:TorcedorNaCena,atraso:number):void=>{
    selecionados.add(pessoa);
    const f=fileiras[pessoa.fileira],perfil=perfilDeCirculacao(pessoa.x,pessoa.fileira,pessoa.tipo);
    saindo.push({pessoa,comeca:scene.time.now+atraso,sprite:null,corredor:perfil.corredor,velocidade:perfil.velocidade,
      percurso:iniciarPercurso(rotaDeSaida({x:pessoa.x,y:f.y,escala:f.escala,setor:f.setor,corredor:perfil.corredor,desvio:perfil.desvio,variarCorredor:true}))});
  };

  const retirar = (lado: 0 | 1, fracao: number): void => {
    const candidatos = pessoas.filter((p) => p.lado === lado);
    const total = Math.min(candidatos.length,quantidadeParaSair(candidatos.length, false, fracao)+saidasAvulsas[lado]);
    const jaEscolhidos = candidatos.filter((p) => selecionados.has(p)).length;
    const novos = embaralharPessoas(candidatos.filter((p) => !selecionados.has(p)),sortear).slice(0, Math.max(0, total - jaEscolhidos));
    const janela=Math.max(1000,Math.min(45000,novos.length*160));
    novos.forEach((pessoa)=>encaminhar(pessoa,200+sortear()*janela));
  };
  const derrota = (lado: 0 | 1, decisiva: boolean, vidaVencedor: number): void => {
    const retirada = registrarDerrotaTorcida(reacao, lado, decisiva, vidaVencedor);
    if (retirada && !decisiva) retirar(retirada.lado, retirada.fracao);
    if(retirada && decisiva){
      const sentados=embaralharPessoas(pessoas.filter(p=>p.lado===lado && p.sprite.active && p.sprite.visible),sortear);
      const espera=Math.ceil(sentados.length*.1);
      sentados.forEach((p,i)=>{
        const atraso=i<espera?1500:0;
        const pendente=saindo.find(s=>s.pessoa===p && !s.percurso.concluido);
        if(pendente)pendente.comeca=scene.time.now+atraso;
        else if(!selecionados.has(p))encaminhar(p,atraso);
      });
      // A vitoria cancela inclusive abandonos ainda em andamento desse lado.
      for(let i=saindo.length-1;i>=0;i--){
        const s=saindo[i];
        if(s.pessoa.lado===lado || s.percurso.concluido)continue;
        s.sprite?.destroy();s.pessoa.sprite.setVisible(true);
        s.pessoa.extras.forEach(e=>e.setVisible(true));
        selecionados.delete(s.pessoa);saindo.splice(i,1);
      }
      atualizar();
    }
  };
  const vida = (p1: number, p2: number): void => {
    const evento=avaliarPressaoTorcida(reacao,[p1,p2],scene.time.now,sortear);
    if(evento.retirada)retirar(evento.retirada.lado,evento.retirada.fracao);
    if(evento.lado===null || (!evento.arremesso && !evento.saida))return;
    const disponiveis=()=>pessoas.filter(p=>p.lado===evento.lado && p.sprite.active && p.sprite.visible && !selecionados.has(p));
    const escolher=():TorcedorNaCena|undefined=>{const lista=disponiveis();return lista[Math.min(lista.length-1,Math.floor(sortear()*lista.length))];};
    if(evento.saida){const pessoa=escolher();if(pessoa){saidasAvulsas[pessoa.lado]++;encaminhar(pessoa,0);}}
    if(evento.arremesso){const pessoa=escolher();if(pessoa)scene.events.emit('torcida-arremesso',pessoa);}
  };
  const reset = (): void => {
    saindo.forEach((s) => s.sprite?.destroy());
    saindo.length = 0;
    selecionados.clear();
    saidasAvulsas.fill(0);
    reacao = novaReacaoTorcida();
    pessoas.forEach((p) => { p.sprite.setVisible(true); p.extras.forEach((e) => e.setVisible(true)); });
    ultimo = scene.time.now;
  };
  scene.events.on('torcida-derrota', derrota);
  scene.events.on('torcida-vida', vida);
  scene.events.on('torcida-reiniciar', reset);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    scene.events.off('torcida-derrota', derrota);
    scene.events.off('torcida-vida', vida);
    scene.events.off('torcida-reiniciar', reset);
    saindo.forEach((s) => s.sprite?.destroy());
  });

  const atualizar = (): void => {
    const agora = scene.time.now;
    const dt = Math.min(.25, Math.max(0, (agora - ultimo) / 1000));
    ultimo = agora;
    // Tres faixas podem se sobrepor visualmente; so evitamos coincidencia exata de pes na mesma faixa.
    const ordem = [...saindo].sort((a,b) => b.percurso.ponto.y - a.percurso.ponto.y);
    const adiante: Saindo[] = [];
    for (const s of ordem) {
      if (s.percurso.concluido || agora < s.comeca) continue;
      if (!s.sprite) {
        const arte = animacao(s.pessoa, false);
        s.sprite = scene.make.sprite({ x: 0, y: 0, key: arte.textura }, false).setOrigin(.5,111/112);
        scene.sys.updateList.add(s.sprite);
        s.sprite.play(arte.anim);
        s.pessoa.sprite.setVisible(false);
        s.pessoa.extras.forEach((e) => e.setVisible(false));
      }
      const anterior = { ...s.percurso.ponto };
      const trecho = s.percurso.trecho;
      avancarPercurso(s.percurso, dt, s.velocidade);
      const p = s.percurso.ponto;
      const bloqueado = p.etapa === 'escada' && adiante.some((outro) => {
        const q=outro.percurso.ponto;
        return q.etapa==='escada' && Math.abs(q.x-p.x)<5*p.escala && q.y>=p.y && q.y-p.y<6*p.escala;
      });
      if (bloqueado) {
        s.percurso.ponto=anterior;s.percurso.trecho=trecho;s.percurso.concluido=false;
        s.sprite.anims.pause();
      } else s.sprite.anims.resume();
      if (s.percurso.concluido) { s.sprite.destroy(); s.sprite=null; continue; }
      const atual=s.percurso.ponto;
      const arte=animacao(s.pessoa,atual.etapa==='escada');
      if (s.sprite.anims.currentAnim?.key!==arte.anim) s.sprite.play(arte.anim);
      const alvo=s.percurso.rota[s.percurso.trecho];
      s.sprite.setFlipX(atual.etapa!=='escada' && alvo.x<atual.x);
      s.sprite.setPosition(atual.x*escalaCena,atual.y*escalaCena).setScale(atual.escala*escalaCena);
      s.sprite.setData('torcidaChao',atual.y);
      s.sprite.setData('torcidaCamada',camadaDoPercurso(atual,fileiras[s.pessoa.fileira].y));
      s.sprite.setData('torcidaCorredor',s.corredor);
      adiante.push(s);
    }
  };
  return { atualizar, sprites: () => saindo.flatMap((s) => s.sprite?.active ? [s.sprite] : []) };
}
