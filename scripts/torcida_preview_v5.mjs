// Simula os controladores reais, sem navegador, para renderizar a revisao de camadas e movimento.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname,extname} from 'node:path';
import {EventEmitter} from 'node:events';
import ts from 'typescript';
const OUT='output/torcida-humores-v5';mkdirSync(OUT,{recursive:true});
const cache=new Map();
function modulo(file){
  file=resolve(file);if(cache.has(file))return cache.get(file);
  let code=extname(file)==='.json'?`export default ${readFileSync(file,'utf8')};`:ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
  code=code.replace(/import \* as Phaser from ['"]phaser['"];?/g,"const Phaser={Scenes:{Events:{SHUTDOWN:'shutdown'}}};");
  code=code.replace(/from ['"](\.[^'"]+)['"]/g,(_all,source)=>{
    const path=resolve(dirname(file),source);return `from '${modulo(extname(path)?path:path+'.ts')}'`;
  });
  const url='data:text/javascript;base64,'+Buffer.from(code).toString('base64');cache.set(file,url);return url;
}
const {criarCirculacaoTorcida,derrotaDaTorcida,vidaDaTorcida}=await import(modulo('src/game/torcidaMovimentoCena.ts'));
const {criarHumoresTorcida}=await import(modulo('src/game/torcidaHumorCena.ts'));
const {camadaDaFileira}=await import(modulo('src/game/torcidaCamadas.ts'));
const {rotaDeSaida}=await import(modulo('src/game/torcidaRotas.ts'));
writeFileSync(`${OUT}/rotas-3-corredores.json`,JSON.stringify([650,1400].flatMap(x=>[0,1,2].map(corredor=>({corredor,rota:rotaDeSaida({x,y:290,escala:.835,setor:'central',corredor})})))));
const dados=JSON.parse(readFileSync('public/assets/cenarios/estadio/torcida/torcida.json','utf8'));
const time={now:0};
class Sprite {
  visible=true;active=true;x=0;y=0;scale=1;flip=false;angle=0;data={};texture={key:'torcendo'};start=0;offset=0;
  constructor(config={}){this.x=config.x??0;this.y=config.y??0;this.texture.key=config.key??'torcendo';}
  anims={currentAnim:null,timeScale:1,pause(){},resume(){}};
  get frame(){
    const key=this.anims.currentAnim?.key??this.texture.key,[action,type='0']=key.split(':');
    if(action==='irritada')return {name:Number(type)*4+3};
    const fps=action==='quieta'?3:action==='andar'?8:6;
    return {name:Number(type)*4+(this.offset+Math.floor((time.now-this.start)/1000*fps*this.anims.timeScale))%4};
  }
  setOrigin(){return this;}play(arg){const key=typeof arg==='string'?arg:arg.key;this.anims.currentAnim={key};this.texture.key=key.split(':')[0];this.start=time.now;this.offset=typeof arg==='string'?0:arg.startFrame??0;return this;}
  setVisible(v){this.visible=v;return this;}setPosition(x,y){this.x=x;this.y=y;return this;}
  setScale(s){this.scale=s;return this;}setFlipX(v){this.flip=v;return this;}setAngle(a){this.angle=a;return this;}
  setData(k,v){this.data[k]=v;return this;}getData(k){return this.data[k];}destroy(){this.active=false;}
}
const scene={time,events:new EventEmitter(),make:{sprite:c=>new Sprite(c)},sys:{updateList:{add(){}}}};
let seed=1959;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const fileiras=[...dados.fileiras].sort((a,b)=>a.y-b.y),pessoas=[];
fileiras.forEach((f,i)=>{
  const step=f.passo*f.escala;
  for(let x=f.xInicio+step/2;x<=f.xFim;x+=step){
    const px=x+(random()-.5)*step*.3,type=Math.floor(random()*10);
    const sprite=new Sprite({x:px,y:f.y,key:'torcendo'}).play(`torcendo:${type}`).setScale(f.escala).setData('torcidaCamada',camadaDaFileira(f.y));
    sprite.anims.timeScale=.7+random()*.6;
    pessoas.push({x:px,fileira:i,lado:px<1024?0:1,tipo:type,camisa:0,sprite,extras:[]});
  }
});
const circulacao=criarCirculacaoTorcida(scene,1,fileiras,pessoas,(p,d)=>({textura:d?'descer':'andar',anim:`${d?'descer':'andar'}:${p.tipo}`}),random);
const humor=criarHumoresTorcida(scene,1,fileiras,pessoas,(p,h)=>({textura:h,anim:`${h}:${p.tipo}`}),'copo');
const frames=[],lanes=new Set();let terminou=null;
for(let tick=0;tick<=1800;tick++){
  time.now=tick*100;
  if(tick===40)vidaDaTorcida(scene,.2,.9);
  if(tick===90)vidaDaTorcida(scene,1,1);
  if(tick===100)derrotaDaTorcida(scene,0,false,.9);
  if(tick>=200 && tick<300)vidaDaTorcida(scene,.4,.9);
  if(tick===300)vidaDaTorcida(scene,.2,.9);
  if(tick>300 && tick<450)vidaDaTorcida(scene,.2,.9);
  if(tick===450)derrotaDaTorcida(scene,0,true,.9);
  circulacao.atualizar();humor.atualizar();
  const moving=circulacao.sprites();moving.forEach(s=>lanes.add(s.getData('torcidaCorredor')));
  if(tick>450 && !moving.length && pessoas.filter(p=>p.lado===0).every(p=>!p.sprite.visible) && terminou===null)terminou=tick/10;
  if(tick%5===0 && (terminou===null || tick/10<=terminou+3)){
    const entry=s=>({x:s.x,y:s.y,s:s.scale,flip:s.flip,angle:s.angle,action:s.texture.key,frame:s.frame.name,camada:s.getData('torcidaCamada')});
    frames.push({t:tick/10,parados:pessoas.filter(p=>p.sprite.visible).map(p=>({...entry(p.sprite),lado:p.lado})),
      andando:moving.map(s=>({...entry(s),corredor:s.getData('torcidaCorredor')})),objetos:humor.sprites().map(entry)});
  }
}
if(terminou===null || lanes.size!==3)throw new Error('Simulacao nao concluiu as saidas nos tres corredores.');
writeFileSync(`${OUT}/previa-posicoes.json`,JSON.stringify(frames));
writeFileSync(`${OUT}/simulacao.json`,JSON.stringify({pessoas:pessoas.length,tresCorredores:[...lanes],terminou,quadros:frames.length,permanecem:pessoas.filter(p=>p.sprite.visible).length,maxObjetos:Math.max(...frames.map(f=>f.objetos.length))},null,2));
console.log(`Simulacao concluida aos ${terminou}s, tres corredores ocupados e ${frames.length} amostras.`);
