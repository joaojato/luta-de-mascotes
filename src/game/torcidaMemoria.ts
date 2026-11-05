import type * as Phaser from 'phaser';
const recortes=new WeakMap<Phaser.Textures.Texture,string>();

/** Fontes sem repintura compartilham os pixels e os quadros, sem outro canvas. */
export function quadrosCompartilhados(textura:Phaser.Textures.Texture,largura:number,altura:number):string {
  const assinatura=`${largura}:${altura}`;
  if(recortes.get(textura)===assinatura && textura.has('0')){
    const zero=textura.get('0');
    if(zero.cutWidth===largura && zero.cutHeight===altura){textura.firstFrame='0';return textura.key;}
  }
  const imagem=textura.getSourceImage('__BASE');
  const colunas=Math.floor(imagem.width/largura),linhas=Math.floor(imagem.height/altura);
  for(let i=0;i<colunas*linhas;i++){
    const x=i%colunas*largura,y=Math.floor(i/colunas)*altura;
    if(textura.has(String(i))){
      const frame=textura.get(String(i));
      if(frame.cutX===x && frame.cutY===y && frame.cutWidth===largura && frame.cutHeight===altura)continue;
      textura.remove(String(i));
    }
    textura.add(i,0,x,y,largura,altura);
  }
  // Texture.get(0) usa firstFrame no Phaser: spritesheets precisam do quadro 0,
  // enquanto a imagem inteira continua acessivel explicitamente por __BASE.
  textura.firstFrame='0';
  recortes.set(textura,assinatura);
  return textura.key;
}

/** As variantes pintadas pertencem a partida; as folhas originais permanecem. */
export function liberarArteTorcida(scene:Phaser.Scene,temporarias:Set<string>):void {
  temporarias.forEach(key=>scene.anims.getAnimsFromTexture(key).forEach(anim=>scene.anims.remove(anim)));
  temporarias.forEach(key=>scene.textures.remove(key));temporarias.clear();
}
