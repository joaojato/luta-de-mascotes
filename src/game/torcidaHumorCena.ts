import * as Phaser from 'phaser';
import { humorDoTorcedor,humorPorResultado,humorPorVida,novoHumorTorcida,sementeDoTorcedor,type HumorTorcida } from './torcidaHumor';
import type { TorcedorNaCena } from './torcidaMovimentoCena';

interface ObjetoArremessado {
  sprite: Phaser.GameObjects.Sprite;
  inicio:number;x:number;y:number;alvoX:number;alvoY:number;duracao:number;altura:number;giro:number;
}
export function criarHumoresTorcida(
  scene:Phaser.Scene,escalaCena:number,fileiras:{y:number;escala:number}[],pessoas:TorcedorNaCena[],
  arte:(p:TorcedorNaCena,humor:HumorTorcida)=>{textura:string;anim:string},objetoTextura?:string,profundidadeObjeto=0
):{atualizar:()=>void;sprites:()=>Phaser.GameObjects.Sprite[]} {
  let estado=novoHumorTorcida();
  const objetos:ObjetoArremessado[]=[];
  const arremessando=new Map<TorcedorNaCena,{inicio:number;lancou:boolean}>();
  const niveis:[number|null,number|null]=[null,null];
  const medidor=(lado:0|1,nivel:number)=>{niveis[lado]=nivel;};
  const derrota=(lado:0|1,decisiva:boolean)=>humorPorResultado(estado,lado,decisiva,scene.time.now);
  const vida=(p1:number,p2:number)=>humorPorVida(estado,p1,p2);
  const arremesso=(p:TorcedorNaCena)=>{
    if(!estado.pressao[p.lado] || !p.sprite.active || !p.sprite.visible || arremessando.has(p))return;
    arremessando.set(p,{inicio:scene.time.now,lancou:false});
    p.sprite.play({key:arte(p,'brava').anim,startFrame:0,repeat:0});
  };
  const limpar=()=>{objetos.forEach(o=>o.sprite.destroy());objetos.length=0;arremessando.clear();niveis.fill(null);estado=novoHumorTorcida();};
  scene.events.on('torcida-derrota',derrota);
  scene.events.on('torcida-vida',vida);
  scene.events.on('torcida-arremesso',arremesso);
  scene.events.on('torcida-reiniciar',limpar);
  scene.events.on('torcida-medidor',medidor);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>{
    scene.events.off('torcida-derrota',derrota);scene.events.off('torcida-vida',vida);scene.events.off('torcida-arremesso',arremesso);scene.events.off('torcida-reiniciar',limpar);scene.events.off('torcida-medidor',medidor);limpar();
  });
  const atualizar=()=>{
    const agora=scene.time.now;
    for(let i=objetos.length-1;i>=0;i--) {
      const o=objetos[i],tempo=(agora-o.inicio)/1000,t=Math.min(1,tempo/o.duracao);
      if(tempo>o.duracao+.4){o.sprite.destroy();objetos.splice(i,1);continue;}
      o.sprite.setPosition((o.x+(o.alvoX-o.x)*t)*escalaCena,(o.y+(o.alvoY-o.y)*t-4*o.altura*t*(1-t))*escalaCena).setAngle(o.giro*t);
      if(t===1)o.sprite.setScale(escalaCena*.7,escalaCena*.2);
    }
    for(const p of pessoas) {
      if(!p.sprite.active || !p.sprite.visible){arremessando.delete(p);continue;}
      const seed=sementeDoTorcedor(p.x,p.fileira,p.tipo);
      const ritmo=Math.max(.01,p.sprite.anims.timeScale||1);
      let acao=arremessando.get(p);
      if(acao && !estado.pressao[p.lado]){arremessando.delete(p);acao=undefined;}
      if(acao && agora-acao.inicio>=4000/(6*ritmo)){arremessando.delete(p);acao=undefined;}
      const nivel=niveis[p.lado];
      const humor=acao?'brava':nivel===null?humorDoTorcedor(estado,p.lado,agora,seed):nivel===3?'torcendo':nivel===2?'quieta':'irritada';
      const anim=arte(p,humor);
      if(p.sprite.anims.currentAnim?.key!==anim.anim) p.sprite.play({key:anim.anim,startFrame:humor==='brava'||humor==='irritada'?0:seed%4});
      p.sprite.setData('torcidaHumor',humor);
      if(!acao || acao.lancou || agora-acao.inicio<2000/(6*ritmo) || !objetoTextura)continue;
      const f=fileiras[p.fileira],s=f.escala;
      const sprite=scene.make.sprite({x:(p.x-16*s)*escalaCena,y:(f.y-42*s)*escalaCena,key:objetoTextura},true).setOrigin(.5).setScale(escalaCena*s).setDepth(profundidadeObjeto);
      objetos.push({sprite,inicio:agora,x:p.x-16*s,y:f.y-42*s,
        alvoX:340+seed%1368,alvoY:760+seed%61,duracao:1.1+(seed%401)/1000,altura:100+seed%80,
        giro:(seed%2?1:-1)*(180+seed%180)});
      acao.lancou=true;
    }
  };
  return {atualizar,sprites:()=>objetos.map(o=>o.sprite)};
}
