import * as Phaser from 'phaser';
import {getStageDefinition} from '../stageConfig';
import {criarTexturaFatiada,lerDadosTorcida,TORCIDA_CHAVES} from '../torcidaCena';
import {torcidaValida} from '../torcida';
import {LUTADORES} from '../lutadores';
import {camadaDaFileira} from '../torcidaCamadas';
import {prepararFrenteEstadio} from '../torcidaFundo';
import cadeiras from '../torcidaDados/cadeiras-camadas-v5.json';

let sequencia=0;
/** Previa da mesma torcida em festa, sem simular combate, humor ou evacuacao. */
export class TorcidaSelecao {
  private atores:{sprite:Phaser.GameObjects.Sprite;lado:0|1;tipo:number;fase:number}[]=[];
  private ordem:Phaser.GameObjects.Sprite[]=[];
  private texturas=['',''];
  private ids=['',''];
  private alvo:Phaser.GameObjects.RenderTexture|null=null;
  private sombra:Phaser.Textures.CanvasTexture;
  private escala:number;
  private deslocamento:number;
  private prefixo=`selecao-torcida-${sequencia++}`;
  constructor(private scene:Phaser.Scene,stageId:string,largura:number,altura:number){
    const stage=getStageDefinition(stageId),dados=lerDadosTorcida(scene.cache.json.get(TORCIDA_CHAVES.dados));
    const comTorcida=stage.stadiumCrowd && dados && scene.textures.exists(TORCIDA_CHAVES.torcedores) && scene.textures.exists(TORCIDA_CHAVES.fundo);
    const fundo=comTorcida?TORCIDA_CHAVES.fundo:stage.key;
    const source=scene.textures.get(fundo).getSourceImage('__BASE');
    this.escala=Math.max(largura/source.width,altura/source.height);this.deslocamento=(largura-source.width*this.escala)/2;
    scene.add.rectangle(0,0,largura,altura,0x050a18).setOrigin(0).setDepth(-14);
    if(stage.sky && scene.textures.exists(stage.sky.key))scene.add.image(0,0,stage.sky.key).setOrigin(0).setDisplaySize(largura,altura).setAlpha(.07).setDepth(-13);
    scene.add.image(this.deslocamento,0,fundo,'__BASE').setOrigin(0).setScale(this.escala).setAlpha(.11).setDepth(-12);
    if(comTorcida){
      this.alvo=scene.add.renderTexture(0,0,largura,altura).setOrigin(0).setAlpha(.30).setDepth(-11);
      const grupos=Array.from({length:13},()=>[] as Phaser.GameObjects.Sprite[]);
      const chaves=scene.textures.exists(TORCIDA_CHAVES.cadeiras)?scene.textures.get(TORCIDA_CHAVES.cadeiras):null;
      for(const c of chaves?cadeiras.camadas:[]){
        const frame=`patamar-${c.indice}`;
        if(!chaves!.has(frame))chaves!.add(frame,0,0,c.topo,cadeiras.largura,c.base-c.topo+1);
        grupos[c.indice].push(scene.make.sprite({x:this.deslocamento,y:c.topo*this.escala,key:TORCIDA_CHAVES.cadeiras,frame},false).setOrigin(0).setScale(this.escala).setAlpha(.55));
      }
      for(const f of [...dados.fileiras].sort((a,b)=>a.y-b.y)){
        const passo=f.passo*f.escala;
        for(let x=f.xInicio+passo/2;x<=f.xFim;x+=passo){
          const seed=(Math.floor(x)*31+Math.floor(f.y)*137)>>>0;
          const sprite=scene.make.sprite({x:this.deslocamento+x*this.escala,y:f.y*this.escala,key:TORCIDA_CHAVES.torcedores},false).setOrigin(.5,1).setScale(f.escala*this.escala);
          this.atores.push({sprite,lado:x<dados.divisaoX?0:1,tipo:seed%dados.torcedores.tipos,fase:seed%4});
          grupos[camadaDaFileira(f.y)].push(sprite);
        }
      }
      this.ordem=grupos.flat();
      const frente=prepararFrenteEstadio(scene.textures.get(fundo),624);
      scene.add.image(this.deslocamento,624*this.escala,fundo,frente).setOrigin(0).setScale(this.escala).setAlpha(.11).setDepth(-10);
    }
    this.sombra=scene.textures.createCanvas(`${this.prefixo}-sombra-globo`,512,512)!;
    const ctx=this.sombra.context,gradiente=ctx.createRadialGradient(256,256,0,256,256,256);
    gradiente.addColorStop(0,'rgba(3,7,17,.97)');gradiente.addColorStop(.72,'rgba(3,7,17,.94)');gradiente.addColorStop(1,'rgba(3,7,17,0)');
    ctx.fillStyle=gradiente;ctx.fillRect(0,0,512,512);this.sombra.refresh();
    scene.add.image(largura/2,294,this.sombra.key).setDisplaySize(520,520).setDepth(-9);
    this.atualizar(undefined,undefined);
    const relogio=scene.time.addEvent({delay:220,loop:true,callback:()=>this.desenhar()});
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>{
      relogio.remove();this.ordem.forEach(s=>s.destroy());
      this.texturas.filter(Boolean).forEach(key=>scene.textures.remove(key));scene.textures.remove(this.sombra.key);
    });
  }
  atualizar(p1:string|undefined,p2:string|undefined):void {
    [p1,p2].forEach((id,lado)=>{
      if(!this.alvo)return;
      const chave=id??'neutra';if(this.ids[lado]===chave)return;
      const antiga=this.texturas[lado];
      const clube=torcidaValida(LUTADORES.find(l=>l.id===id)?.torcida);
      this.texturas[lado]=criarTexturaFatiada(this.scene,TORCIDA_CHAVES.torcedores,`${this.prefixo}-${lado}-${chave}`,{largura:64,altura:80},clube);
      this.ids[lado]=chave;
      this.atores.filter(p=>p.lado===lado).forEach(p=>p.sprite.setTexture(this.texturas[lado],p.tipo*4+p.fase));
      if(antiga && antiga!==this.texturas[lado])this.scene.textures.remove(antiga);
    });
    this.desenhar();
  }
  private desenhar():void {
    if(!this.alvo)return;
    for(const p of this.atores){
      const frame=p.tipo*4+(Math.floor(this.scene.time.now/(220+(p.fase*35)))+p.fase)%4;
      const textura=this.texturas[p.lado];
      if(p.sprite.texture.key!==textura)p.sprite.setTexture(textura,frame);else p.sprite.setFrame(frame);
    }
    this.alvo.clear().draw(this.ordem);this.alvo.render();
  }
}
