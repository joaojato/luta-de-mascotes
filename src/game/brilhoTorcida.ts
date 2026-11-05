import type * as Phaser from 'phaser';

/** Gradientes rasterizados uma vez; pulsar muda so a opacidade de quatro imagens. */
export class BrilhoTorcida {
  private raiz:Phaser.GameObjects.Container;
  private lados:{vermelho:Phaser.GameObjects.Image;vinheta:Phaser.GameObjects.Image}[]=[];
  constructor(scene:Phaser.Scene,profundidade:number){
    const textura=(key:string,potencia:number)=>{
      if(scene.textures.exists(key))return key;
      const canvas=scene.textures.createCanvas(key,128,128)!;
      const gradiente=canvas.context.createRadialGradient(0,0,0,0,0,128);
      for(let i=0;i<=10;i++)gradiente.addColorStop(i/10,`rgba(255,255,255,${Math.pow(1-i/10,potencia)})`);
      canvas.context.fillStyle=gradiente;canvas.context.fillRect(0,0,128,128);canvas.refresh();return key;
    };
    const vermelho=textura('hud-alerta-torcida-radial',1.25),vinheta=textura('hud-alerta-torcida-vinheta',3);
    this.raiz=scene.add.container(0,0).setDepth(profundidade).setScrollFactor(0);
    for(let lado=0;lado<2;lado++){
      const imagem=(key:string,cor:number)=>scene.add.image(0,0,key).setOrigin(lado,0).setFlipX(lado===1).setTint(cor).setVisible(false);
      const par={vermelho:imagem(vermelho,0xef1528),vinheta:imagem(vinheta,0x120006)};
      this.raiz.add([par.vermelho,par.vinheta]);this.lados.push(par);
    }
  }
  atualizar(lado:number,faixa:number,largura:number,altura:number,pulso:number):void {
    const par=this.lados[lado],x=lado===0?0:largura;
    par.vermelho.setPosition(x,0).setDisplaySize(largura*.4,altura*.82).setVisible(faixa<=1).setAlpha((faixa===0?.95:.4)*pulso);
    par.vinheta.setPosition(x,0).setDisplaySize(largura*.4,altura*.82).setVisible(faixa===0).setAlpha(.5);
  }
  destroy():void{this.raiz.destroy(true);}
}
