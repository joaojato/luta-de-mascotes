import type * as Phaser from 'phaser';
import {amostraEntradaCaravela,geometriaCaravela} from './entradaCaravela';
import {telaDe} from './nitidez';

const PASTA='/assets/lutadores/almirante/base/entrada-v1';
export const ASSETS_ENTRADA_CARAVELA=[
  {kind:'image' as const,key:'entrada-caravela-proa',url:`${PASTA}/proa.png`},
  {kind:'image' as const,key:'entrada-caravela-prancha',url:`${PASTA}/prancha.png`}
];

/** Objetos visuais da intro; nenhuma colisão, projétil ou ataque. */
export class EntradaCaravelaCena{
  private proa:Phaser.GameObjects.Image;
  private prancha:Phaser.GameObjects.Image;
  private ms=0;
  constructor(private scene:Phaser.Scene,private alvoX:number,private piso:number,
    private escala:number,private lado:1|-1,profundidade:number){
    this.proa=scene.add.image(0,0,'entrada-caravela-proa').setDepth(profundidade-2).setOrigin(.5,.5).setFlipX(lado===-1);
    this.prancha=scene.add.image(0,0,'entrada-caravela-prancha').setDepth(profundidade-1).setOrigin(0,.5);
  }
  update(seconds:number):{x:number;y:number;fase:'movimento'|'parado';tempoDaFase:number}{
    this.ms+=Math.max(0,seconds)*1000;
    const cam=this.scene.cameras.main;
    const borda=cam.scrollX+(this.lado===1?0:telaDe(this.scene).width);
    const g=geometriaCaravela(borda,this.alvoX,this.piso,this.escala,this.lado);
    const pose=amostraEntradaCaravela(this.ms,g,this.alvoX);
    const deslocamento=-this.lado*550*this.escala*(pose.retirada+pose.chegada);
    this.proa.setPosition(g.proaX+deslocamento,g.proaY).setDisplaySize(512*this.escala,512*this.escala).setVisible(pose.visivel);
    const dx=g.fimX-g.inicioX,dy=g.fimY-g.inicioY;
    this.prancha.setPosition(g.inicioX+deslocamento,g.inicioY+7*this.escala)
      .setDisplaySize(Math.hypot(dx,dy),18*this.escala).setRotation(Math.atan2(dy,dx)).setVisible(pose.visivel);
    return {x:pose.x-this.lado*550*this.escala*pose.chegada,y:pose.y+27*this.escala,fase:pose.fase,tempoDaFase:pose.tempoDaFase};
  }
  destroy():void{this.proa.destroy();this.prancha.destroy();}
}
