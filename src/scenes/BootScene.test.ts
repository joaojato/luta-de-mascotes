import {describe,expect,it,vi} from 'vitest';
import {BootScene} from './BootScene';
import {BLOCOS_DA_BARRA,posicoesDaAbertura} from '../game/abertura';

vi.mock('phaser',()=>({}));
vi.mock('./BaseScene',()=>({BaseScene:class {}}));

describe('alinhamento das logos durante o carregamento',()=>{
  it('recentra a logo, barra e legenda ao mudar a largura ou girar a tela',()=>{
    const scene=Object.create(BootScene.prototype) as BootScene;
    const elemento=()=>({setPosition:vi.fn().mockReturnThis(),setOrigin:vi.fn().mockReturnThis()});
    const logo=elemento(),texto=elemento();
    const blocos=Array.from({length:BLOCOS_DA_BARRA},elemento);
    const linhas={clear:vi.fn().mockReturnThis(),fillStyle:vi.fn().mockReturnThis(),fillRect:vi.fn().mockReturnThis()};
    Object.assign(scene,{inicio:0,saindo:false,carregou:false,pulou:false,logoNaTela:0,
      logo,blocos,textos:[texto],linhas,tamanhoDaAbertura:''});
    let tela={width:1280,height:720,centerX:640,centerY:360};
    Object.defineProperty(scene,'tela',{get:()=>tela});
    for (const [width,height] of [[1280,720],[1700,720],[720,1280],[1280,720]]) {
      tela={width,height,centerX:width/2,centerY:height/2};
      scene.update(0);
      const pos=posicoesDaAbertura(tela);
      expect(logo.setPosition).toHaveBeenLastCalledWith(width/2,height/2);
      expect(logo.setOrigin).toHaveBeenLastCalledWith(.5);
      expect(texto.setPosition).toHaveBeenLastCalledWith(width/2,pos.barraY+24);
      const inicio=blocos[0].setPosition.mock.lastCall![0] as number;
      const fim=(blocos.at(-1)!.setPosition.mock.lastCall![0] as number)+18;
      expect((inicio+fim)/2).toBe(width/2);
    }
    const desenhos=linhas.clear.mock.calls.length;
    scene.update(1);
    expect(linhas.clear).toHaveBeenCalledTimes(desenhos);
  });
});
