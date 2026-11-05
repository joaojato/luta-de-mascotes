import {describe,expect,it} from 'vitest';
import {registrarEventoSessao} from './diagnosticoSessao';
describe('diagnostico local de reinicio',()=>{
  it('guarda apenas os ultimos 20 eventos e nao depende de servidor',()=>{
    let dados:string|null=null;
    const storage={getItem:()=>dados,setItem:(_k:string,v:string)=>{dados=v;}} as unknown as Storage;
    for(let i=0;i<30;i++)registrarEventoSessao('cena',String(i),storage);
    const registros=JSON.parse(dados!);expect(registros).toHaveLength(20);expect(registros[0].detalhe).toBe('10');
    registrarEventoSessao('webgl-perdido','',storage);expect(JSON.parse(dados!).at(-1).evento).toBe('webgl-perdido');
  });
  it('armazenamento bloqueado nao interrompe o jogo',()=>{
    const storage={getItem:()=>{throw Error('bloqueado');}} as unknown as Storage;
    expect(()=>registrarEventoSessao('jogo-criado','',storage)).not.toThrow();
  });
});
