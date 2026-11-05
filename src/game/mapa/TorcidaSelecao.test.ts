import {EventEmitter} from 'node:events';
import type * as Phaser from 'phaser';
import {describe,expect,it,vi} from 'vitest';
vi.mock('phaser',()=>({Scenes:{Events:{SHUTDOWN:'shutdown'}}}));
const preparar=vi.hoisted(()=>vi.fn((_s:unknown,_origem:string,key:string)=>key));
vi.mock('../torcidaCena',()=>({
  criarTexturaFatiada:preparar,
  TORCIDA_CHAVES:{dados:'dados',torcedores:'pessoas',fundo:'fundo',cadeiras:'cadeiras'},
  lerDadosTorcida:()=>({divisaoX:1024,torcedores:{tipos:10},fileiras:[
    {y:290,xInicio:450,xFim:520,escala:1,passo:30},
    {y:290,xInicio:1450,xFim:1520,escala:1,passo:30}
  ]})
}));
vi.mock('../torcidaFundo',()=>({prepararFrenteEstadio:()=> 'frente'}));
import {TorcidaSelecao} from './TorcidaSelecao';
class Sprite {
  texture={key:''};frame=0;
  constructor(key=''){this.texture.key=key;}
  setOrigin(){return this;}setScale(){return this;}setDepth(){return this;}setDisplaySize(){return this;}setAlpha(){return this;}
  setTexture(key:string,frame:number){this.texture.key=key;this.frame=frame;return this;}
  setFrame(frame:number){this.frame=frame;return this;}destroy(){}
}
describe('previa leve da torcida na selecao',()=>{
  it('mantem comemoracao, so prepara nova paleta ao trocar clube e limpa texturas ao sair',()=>{
    preparar.mockClear();
    const events=new EventEmitter(),time={now:0,addEvent:vi.fn(()=>({remove:remover}))},remover=vi.fn();
    const desenhados:Sprite[][]=[];
    const target={setOrigin(){return this;},setDepth(){return this;},setAlpha(){return this;},clear(){return this;},draw(s:Sprite[]){desenhados.push([...s]);return this;},render(){}};
    const source={getSourceImage:()=>({width:2048,height:869}),has:()=>true};
    const contexto={clearRect(){},fillRect(){},createRadialGradient:()=>({addColorStop(){}}),beginPath(){},arc(){},stroke(){}};
    const remove=vi.fn(),canvas={key:'mascara',context:contexto,refresh:vi.fn()};
    const scene={events,time,cache:{json:{get:()=>({})}},textures:{exists:()=>true,get:()=>source,createCanvas:()=>canvas,remove},
      add:{rectangle:()=>new Sprite(),image:(_x:number,_y:number,key:string)=>new Sprite(key),renderTexture:()=>target},
      make:{sprite:(c:{key:string})=>new Sprite(c.key)}} as unknown as Phaser.Scene;
    const preview=new TorcidaSelecao(scene,'estadio',1280,720);
    preview.atualizar('urubu','porco');expect(preparar).toHaveBeenCalledTimes(4);
    const quadros=new Set<number>();
    for(let i=0;i<20;i++){
      time.now+=220;preview.atualizar('urubu','porco');
      quadros.add(desenhados.at(-1)!.find(s=>s.texture.key.includes('selecao-torcida'))!.frame);
    }
    expect(preparar).toHaveBeenCalledTimes(4);
    expect(quadros.size).toBeGreaterThan(1);
    expect(preparar.mock.calls.every(c=>c[1]==='pessoas')).toBe(true);
    preview.atualizar('saci','porco');expect(preparar).toHaveBeenCalledTimes(5);
    expect(canvas.refresh).toHaveBeenCalledTimes(1);
    expect(desenhados.length).toBeGreaterThan(1);
    for(const s of desenhados.at(-1)!)if(s.texture.key.includes('selecao-torcida'))expect(s.frame%4).toBeLessThan(4);
    events.emit('shutdown');expect(remover).toHaveBeenCalledTimes(1);expect(remove).toHaveBeenCalledWith('mascara');
  });
});
