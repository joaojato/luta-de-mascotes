import * as Phaser from 'phaser';
import {FONTE_TEXTO} from './estilo';
import {faixaPutometro,LEGENDAS_PUTOMETRO,type Putometro} from './putometro';

/** Rock meter: segmentos curvos, agulha radial e luz apenas na faixa ativa. */
export class PutometroVisual {
  private raiz:Phaser.GameObjects.Container;
  private desenho:Phaser.GameObjects.Graphics;
  private legenda:Phaser.GameObjects.Text;
  private mostrado=.7;
  private brilho=0;
  private entrada:Phaser.Tweens.Tween;
  constructor(scene:Phaser.Scene,pai:Phaser.GameObjects.Container,x:number,y:number,private largura:number,private altura:number,private espelhado=false){
    this.raiz=scene.add.container(x,y);pai.add(this.raiz);
    this.desenho=scene.add.graphics();this.raiz.add(this.desenho);
    this.legenda=scene.add.text(2,0,'',{fontFamily:FONTE_TEXTO,fontSize:'17px',fontStyle:'bold',color:'#fff1d6',align:'left',stroke:'#08090e',strokeThickness:3}).setOrigin(0,0);
    this.raiz.add(this.legenda);
    this.raiz.setAlpha(0).setScale(.65*.9);
    this.entrada=scene.tweens.add({targets:this.raiz,alpha:1,scaleX:.9,scaleY:.9,duration:650,delay:250,ease:'Back.Out'});
  }
  atualizar(e:Putometro,lado:0|1,delta:number):void {
    const alvo=e.valor[lado];
    if(Math.abs(alvo-this.mostrado)>.002)this.brilho=1;
    this.mostrado+=(alvo-this.mostrado)*(1-Math.exp(-Math.max(0,delta)/55));
    this.brilho=Math.max(0,this.brilho-delta/450);
    const g=this.desenho.clear(),r=Math.min((this.largura-18)/1.08,(this.altura-32)/1.08);
    const cx=this.espelhado?8:this.largura-8,cy=8;
    // Angulos cartesianos: esquerda Q4 (270–360), direita Q3 (270–180).
    const ponto=(t:number,raio:number)=>{
      const a=(270+(this.espelhado?90:-90)*t)*Math.PI/180;
      return {x:cx+Math.cos(a)*raio,y:cy-Math.sin(a)*raio};
    };
    const faixa=(de:number,ate:number,interno:number,externo:number,cor:number,alpha=1)=>{
      if(ate-de<.001)return;
      const pontos:Phaser.Types.Math.Vector2Like[]=[];
      for(let i=0;i<=32;i++)pontos.push(ponto(de+(ate-de)*i/32,externo));
      for(let i=32;i>=0;i--)pontos.push(ponto(de+(ate-de)*i/32,interno));
      g.fillStyle(cor,alpha).beginPath().moveTo(pontos[0].x,pontos[0].y);
      pontos.slice(1).forEach(p=>g.lineTo(p.x,p.y));g.closePath().fillPath();
    };
    faixa(0,1,r*.57,r*1.04,0x07090f);
    faixa(0,1,r*.62,r,0xa99b7f);
    faixa(0,1,r*.67,r*.95,0x20212a);
    const preto=1/3-e.verde[lado],limites=[0,preto,1/3,1-e.verde[lado],1];
    const cores=[0x4c111e,0xe13439,0xe8bd36,0x57d72e],ativa=faixaPutometro(e,lado);
    for(let i=0;i<4;i++){
      const de=limites[i]+.007,ate=limites[i+1]-.007;
      if(i===ativa)faixa(de,ate,r*.53,r*1.08,cores[i],.15+this.brilho*.15);
      faixa(de,ate,r*.69,r*.93,cores[i],i===ativa?1:.28);
      if(i===ativa)faixa(de,ate,r*.87,r*.91,0xffffff,.4);

    }
    for(let i=0;i<=24;i++){
      const a=ponto(i/24,r*.95),b=ponto(i/24,r*(i%4===0?1.04:1));
      g.lineStyle(1,0xf7e7b6,.8).lineBetween(a.x,a.y,b.x,b.y);
    }
    const ponta=ponto(this.mostrado,r*.98),base={x:cx,y:cy};
    g.lineStyle(5,0x08090e,1).lineBetween(base.x,base.y,ponta.x,ponta.y);
    g.lineStyle(2,0xfff5d9,1).lineBetween(base.x,base.y,ponta.x,ponta.y);
    g.fillStyle(0x0b0d14).fillCircle(cx,cy,6);g.lineStyle(2,0xd6c59d).strokeCircle(cx,cy,6);
    this.legenda.setText(LEGENDAS_PUTOMETRO[ativa]);
    const escalaTexto=Math.min(1,(this.largura-4)/Math.max(1,this.legenda.width));
    this.legenda.setScale(escalaTexto);
    this.desenho.y=this.legenda.displayHeight+2;
    this.legenda.setColor(['#ff748d','#ff7070','#ffdf64','#a1ff75'][ativa]);
  }
  destruir():void {this.entrada.stop();}
}
