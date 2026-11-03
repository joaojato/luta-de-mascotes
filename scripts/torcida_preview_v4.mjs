// Executa o controlador real sem renderizador; grava suas posicoes para a previa offline.
import { readFileSync, writeFileSync } from 'node:fs';
import { EventEmitter } from 'node:events';
import ts from 'typescript';
const pasta='public/assets/cenarios/estadio/torcida/';
const mapa=JSON.parse(readFileSync(pasta+'circulacao-v4.json','utf8'));
const dados=JSON.parse(readFileSync(pasta+'torcida.json','utf8'));
const modulo=(code)=>'data:text/javascript;base64,'+Buffer.from(ts.transpileModule(code,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64');
const rotaUrl=modulo(readFileSync('src/game/torcidaRotas.ts','utf8').replace(/import mapa from [^;]+;/,`const mapa=${JSON.stringify(mapa)};`));
const vidaUrl=modulo(readFileSync('src/game/vidaFaixas.ts','utf8'));
const reacaoUrl=modulo(readFileSync('src/game/torcidaReacao.ts','utf8').replace(/from '\.\/vidaFaixas'/g,`from '${vidaUrl}'`));
const codigo=readFileSync('src/game/torcidaMovimentoCena.ts','utf8')
  .replace("import * as Phaser from 'phaser';","const Phaser={Scenes:{Events:{SHUTDOWN:'shutdown'}}};")
  .replace(/from '\.\/torcidaRotas'/g,`from '${rotaUrl}'`)
  .replace(/from '\.\/torcidaReacao'/g,`from '${reacaoUrl}'`);
const {criarCirculacaoTorcida,derrotaDaTorcida,vidaDaTorcida}=await import(modulo(codigo));
class Sprite {
  visible=true;active=true;x=0;y=0;scale=1;flip=false;data={};
  anims={currentAnim:null,pause(){},resume(){}};
  setOrigin(){return this;} play(key){this.anims.currentAnim={key};return this;}
  setVisible(v){this.visible=v;return this;} setPosition(x,y){this.x=x;this.y=y;return this;}
  setScale(s){this.scale=s;return this;} setFlipX(v){this.flip=v;return this;}
  setData(k,v){this.data[k]=v;return this;} destroy(){this.active=false;}
}
const time={now:0};
const scene={time,events:new EventEmitter(),make:{sprite:()=>new Sprite()},sys:{updateList:{add(){}}}};
let seed=1959;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const fileiras=[...dados.fileiras].sort((a,b)=>a.y-b.y);
const pessoas=[];
fileiras.forEach((f,i)=>{
  const step=f.passo*f.escala;
  for(let x=f.xInicio+step/2;x<=f.xFim;x+=step){
    const px=x+(random()-.5)*step*.3;
    pessoas.push({x:px,fileira:i,lado:px<1024?0:1,tipo:Math.floor(random()*10),camisa:0,sprite:new Sprite(),extras:[]});
  }
});
const controle=criarCirculacaoTorcida(scene,1,fileiras,pessoas,(p,descer)=>({textura:descer?'descer':'andar',anim:`${descer?'descer':'andar'}:${p.tipo}`}));
const frames=[];
for(let tick=0;tick<=3600;tick++){
  time.now=tick*100;
  if(tick===10) derrotaDaTorcida(scene,0,false);
  if(tick===250) vidaDaTorcida(scene,.2,.9);
  if(tick===700) derrotaDaTorcida(scene,0,true,.9);
  controle.atualizar();
  if(tick%10===0)frames.push({t:tick/10,
    parados:pessoas.filter(p=>p.sprite.visible).map(p=>({x:p.x,y:fileiras[p.fileira].y,s:fileiras[p.fileira].escala,tipo:p.tipo,lado:p.lado})),
    andando:controle.sprites().map(s=>({x:s.x,y:s.y,s:s.scale,flip:s.flip,anim:s.anims.currentAnim.key}))});
}
const ultimo=frames.at(-1);
writeFileSync('output/torcida-circulacao-v4/previa-posicoes.json',JSON.stringify(frames));
writeFileSync('output/torcida-circulacao-v4/simulacao.json',JSON.stringify({total:pessoas.length,aposPrimeiraDerrota:frames[24].parados.length,aposParcelaExtra:frames[69].parados.length,finalParados:ultimo.parados.length,finalAndando:ultimo.andando.length,segundos:360},null,2));
if(ultimo.parados.some(p=>p.lado===0)||ultimo.andando.length)throw new Error(`Torcida perdedora nao concluiu todas as rotas: ${ultimo.andando.length} andando.`);
console.log(`${pessoas.length} NPCs, simulacao de 360 s: ${ultimo.parados.length} torcedores do vencedor permanecem; todos do perdedor concluidos.`);
