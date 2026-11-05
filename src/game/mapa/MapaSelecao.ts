import * as Phaser from 'phaser';
import {FONTE_TEXTO,FONTE_TITULO} from '../estilo';
import {ESTADOS_BRASIL,REGIOES_MAPA,corDoEstado,estadoDoMapa,pontoNoMapa} from './selecaoBrasil';

interface Marcacao {uf?:string;cor:number;nome:string;visivel:boolean}
/** Mapa estatico rasterizado uma vez; selecao muda apenas o realce de duas UFs. */
export class MapaSelecao {
  private raiz:Phaser.GameObjects.Container;
  private realce:Phaser.GameObjects.RenderTexture;
  private marcadores:{ponto:Phaser.GameObjects.Arc;anel:Phaser.GameObjects.Arc;nome:Phaser.GameObjects.Text}[]=[];
  private assinatura='';
  constructor(private scene:Phaser.Scene,x:number,y:number){
    this.raiz=scene.add.container(x-220,y-200).setDepth(2);
    const key='selecao-globo-brasil-v2';
    if(!scene.textures.exists(key)){
      const g=scene.make.graphics({},false);
      g.fillStyle(0x0b1c33).fillCircle(220,200,190);
      g.lineStyle(2,0x5d879a,.6).strokeCircle(220,200,190);
      g.lineStyle(1,0x407087,.28);
      for(const w of [70,160,270])g.strokeEllipse(220,200,w,378);
      for(const h of [60,160,280])g.strokeEllipse(220,200,378,h);
      for(const e of ESTADOS_BRASIL){
        this.poligono(g,e.contorno,corDoEstado(e.uf),.94,0x0d1a2b,.8);
      }
      g.generateTexture(key,440,400);g.destroy();
    }
    this.raiz.add(scene.add.image(0,0,key).setOrigin(0));
    this.realce=scene.add.renderTexture(0,0,440,400).setOrigin(0);this.raiz.add(this.realce);
    for(const r of REGIOES_MAPA){
      const p=pontoNoMapa(r.posicao[0],r.posicao[1]);
      this.raiz.add(scene.add.text(p.x,p.y,r.rotulo,{fontFamily:FONTE_TEXTO,fontSize:'12px',fontStyle:'bold',color:'#f4eed4',align:'center',stroke:'#07101a',strokeThickness:3,lineSpacing:-1}).setOrigin(.5));
    }
    this.raiz.add(scene.add.text(220,390,'BRASIL',{fontFamily:FONTE_TITULO,fontSize:'16px',color:'#f8f0e6',letterSpacing:7,stroke:'#050913',strokeThickness:4}).setOrigin(.5));
    for(let i=0;i<2;i++){
      const anel=scene.add.circle(0,0,10).setStrokeStyle(2,0xffffff).setAlpha(.7);
      const ponto=scene.add.circle(0,0,4,0xffffff);
      const nome=scene.add.text(0,0,'',{fontFamily:FONTE_TEXTO,fontSize:'14px',fontStyle:'bold',stroke:'#030810',strokeThickness:4}).setOrigin(.5,1);
      this.raiz.add([anel,ponto,nome]);this.marcadores.push({anel,ponto,nome});
      scene.tweens.add({targets:anel,scaleX:1.45,scaleY:1.45,alpha:.25,duration:900,delay:i*250,yoyo:true,repeat:-1});
    }
    this.raiz.setAlpha(0);scene.tweens.add({targets:this.raiz,alpha:1,duration:500});
  }
  private poligono(g:Phaser.GameObjects.Graphics,contorno:number[][],cor:number,alpha:number,borda:number,espessura:number){
    g.fillStyle(cor,alpha).lineStyle(espessura,borda,1).beginPath();
    contorno.forEach(([lon,lat],i)=>{const p=pontoNoMapa(lon,lat);if(i===0)g.moveTo(p.x,p.y);else g.lineTo(p.x,p.y);});
    g.closePath().fillPath().strokePath();
  }
  marcar(marcacoes:Marcacao[]):void {
    const assinatura=JSON.stringify(marcacoes);if(assinatura===this.assinatura)return;this.assinatura=assinatura;
    this.realce.clear();const g=this.scene.make.graphics({},false);
    marcacoes.forEach((m,i)=>{
      const e=m.visivel?estadoDoMapa(m.uf):null,visual=this.marcadores[i];
      visual.ponto.setVisible(Boolean(e));visual.anel.setVisible(Boolean(e));visual.nome.setVisible(Boolean(e));
      if(!e)return;
      this.poligono(g,e.contorno,corDoEstado(e.uf),.9,m.cor,2);
      const p=pontoNoMapa(e.centro[0],e.centro[1]);
      const iguais=marcacoes[0].uf===marcacoes[1].uf && marcacoes[0].visivel && marcacoes[1].visivel;
      const dx=iguais?(i===0?-7:7):0;
      visual.ponto.setPosition(p.x+dx,p.y).setFillStyle(m.cor);
      visual.anel.setPosition(p.x+dx,p.y).setStrokeStyle(2,m.cor);
      visual.nome.setPosition(i===0?90:350,382).setText(`${m.nome} · ${e.uf}`).setColor(`#${m.cor.toString(16).padStart(6,'0')}`);
    });
    this.realce.draw(g);this.realce.render();g.destroy();
  }
}
