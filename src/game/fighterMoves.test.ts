import { describe, expect, it, vi } from 'vitest';
import type * as Phaser from 'phaser';
import type { AppContext } from './context';
import { Fighter, NEUTRAL_FIGHTER_INPUT } from './fighter';
import { createDefaultFighterPlaygroundState } from './fighterConfig';
import { getCharacterAnimationDefinition, getCharacterDefinition } from './hero';
import { DASH_STOP_GAP, PERFECT_GUARD_STAGGER } from './moveMechanics';

vi.mock('phaser', () => ({
  Math: { Clamp: (v: number, min: number, max: number) => Math.max(min, Math.min(max, v)),
    Vector2: class {constructor(public x=0,public y=0){} copy(p:{x:number;y:number}){this.x=p.x;this.y=p.y;return this;}} },
  Geom: { Rectangle: class { constructor(public x: number, public y: number, public width: number, public height: number) {} },
    Intersects: { RectangleToRectangle: (a: {x:number;y:number;width:number;height:number}, b: {x:number;y:number;width:number;height:number}) =>
      a.x < b.x+b.width && b.x < a.x+a.width && a.y < b.y+b.height && b.y < a.y+a.height } }
}));
vi.mock('./vfx', () => ({ spawnChargeAura: vi.fn() }));

function setup(characterId: string, facing: 1 | -1 = 1) {
  const events = new Map<string, () => void>();
  const delays: Array<() => void> = [];
  const visual = { x: 0, scaleX: 1, setDepth() { return this; }, setAlpha() { return this; }, setScale() { return this; }, destroy: vi.fn() };
  const effectVisual = { x:0, y:0, depth:0, anims:{currentAnim:{key:'',frames:[]},pause:vi.fn()},setVisible(){return this;},setDepth(d: number) {this.depth=d; return this;}, setOrigin() {return this;},
    setScale() {return this;}, setFlipX() {return this;}, play() {return this;}, once() {return this;},
    setPosition(x: number, y: number) { this.x=x; this.y=y; return this; }, destroy:vi.fn() };
  const sprite = {
    x: 200, y: 500, displayWidth: 358.4, displayHeight: 358.4, originX: .5, originY: 255/256,
    flipX: false, frame: { name: 0 },
    anims: { currentAnim: {key: ''}, pause: vi.fn(), resume: vi.fn() },
    setOrigin(x: number, y: number) { this.originX=x; this.originY=y; return this; },
    setScale() { return this; }, setFlipX(v: boolean) { this.flipX=v; return this; }, setDepth() { return this; },
    setFrame(v: number) { this.frame.name=v; return this; },
    setPosition(x: number, y: number) { this.x=x; this.y=y; return this; },
    play(config: {key: string; startFrame?: number}) { this.anims.currentAnim.key=config.key; this.frame.name=config.startFrame ?? 0; return this; },
    stop() { return this; },
    once(event: string, callback: () => void) { events.set(event, callback); return this; },
    removeAllListeners(event?: string) { if (event) events.delete(event); else events.clear(); return this; },
    destroy() {}
  };
  const shadow = { x: 0, setAlpha() { return this; }, setDepth() { return this; }, setScale() { return this; }, setSize() { return this; }, destroy() {} };
  let spriteCalls = 0;
  const scene = { add: { sprite: (x: number) => {
    if (spriteCalls++ === 0) return sprite;
    effectVisual.x=x;
    return effectVisual;
  }, ellipse: () => shadow, rectangle: () => visual,
    graphics: () => ({ setDepth() { return this; }, clear() {} }) },
    time: { delayedCall: (_ms: number, fn: () => void) => delays.push(fn) } } as unknown as Phaser.Scene;
  const state = { fighterPlayground: createDefaultFighterPlaygroundState(), characterGym: { boundsOverrides: {} } };
  const app = { debugStore: { getState: () => state } } as unknown as AppContext;
  const fighter = new Fighter({scene, app, characterId, x:200, groundY:500, facing, minX:40, maxX:960});
  fighter.setFrozen(false);
  function complete(action: string) {
    const event = `animationcomplete-${characterId}-${action}`;
    const callback = events.get(event);
    events.delete(event);
    callback?.();
  }
  function special() {
    fighter.fillMeter();
    fighter.update(0, {...NEUTRAL_FIGHTER_INPUT, special:true});
    complete('special-charge');
    delays.splice(0).forEach(fn => fn());
  }
  return {fighter, sprite, special, complete, visual, effectVisual, delays, scene};
}

describe('fighter move integration', () => {
  it.each(['saci','cartola','galo','porco','bahia','mosqueteiro-gremio','urubu','coxa','cachorro','dragao','mosqueteiro'])('%s volta à guarda ao terminar sua intro, ainda bloqueando comandos',id=>{
    const {fighter,sprite,scene}=setup(id);
    Object.assign(scene,{anims:{exists:()=>true,get:(key:string)=>{
      const a=getCharacterAnimationDefinition(id,key);
      return {duration:a.sheet.frames*1000/a.frameRate,frames:a.frameDurations!.map(duration=>({duration}))};
    }},...(id==='urubu'?{cameras:{main:{worldView:{y:0},shake:vi.fn()}}}:{})});
    fighter.setFrozen(true);
    const duracao=fighter.iniciarEntrada();
    fighter.update(duracao/1000-.001,NEUTRAL_FIGHTER_INPUT);
    expect(sprite.anims.currentAnim.key).toBe(`${id}-entrance`);
    fighter.update(.002,NEUTRAL_FIGHTER_INPUT);
    expect(sprite.anims.currentAnim.key).toBe(`${id}-idle`);
    expect(sprite.flipX).toBe(true);
    expect(sprite.y).toBe(500);
    const x=fighter.x;
    fighter.update(.5,{...NEUTRAL_FIGHTER_INPUT,light:true,right:true,jump:true});
    expect(fighter.x).toBe(x);
    expect(sprite.anims.currentAnim.key).toBe(`${id}-idle`);
    expect(fighter.getActiveAttack()).toBeNull();
  });
  it('conclusão real da animação também retorna à guarda antes da contagem acabar',()=>{
    const {fighter,sprite,scene,complete}=setup('cachorro',-1);
    Object.assign(scene,{anims:{exists:()=>true,get:(key:string)=>{
      const a=getCharacterAnimationDefinition('cachorro',key);
      return {duration:a.sheet.frames*1000/a.frameRate,frames:a.frameDurations!.map(duration=>({duration}))};
    }}});
    fighter.setFrozen(true);fighter.iniciarEntrada();
    complete('entrance');
    expect(sprite.anims.currentAnim.key).toBe('cachorro-idle');
    expect(sprite.flipX).toBe(false);
    fighter.update(.2,{...NEUTRAL_FIGHTER_INPUT,light:true});
    expect(fighter.getActiveAttack()).toBeNull();
  });
  it('Galo só ganha altura ao bater asas e cai sentado sem perder vida',()=>{
    const {fighter,sprite,scene}=setup('galo');
    Object.assign(scene,{anims:{exists:()=>true,get:(key:string)=>{
      const a=getCharacterAnimationDefinition('galo',key);
      return {duration:a.sheet.frames*1000/a.frameRate,frames:a.frameDurations!.map(duration=>({duration}))};
    }}});
    fighter.setFrozen(true);
    expect(fighter.iniciarEntrada()).toBe(2705);
    fighter.update(.885,NEUTRAL_FIGHTER_INPUT);
    expect(sprite.y).toBe(500);
    fighter.update(.315,NEUTRAL_FIGHTER_INPUT);
    expect(sprite.y).toBeCloseTo(444);
    expect(sprite.frame.name).toBe(8);
    fighter.update(.595,NEUTRAL_FIGHTER_INPUT);
    expect(sprite.y).toBe(500);
    expect(sprite.frame.name).toBe(14);
    expect(sprite.x).toBe(200);
    expect(fighter.health01).toBe(1);
    expect(fighter.getActiveAttack()).toBeNull();
    fighter.setFrozen(false);
    expect(sprite.anims.currentAnim.key).toBe('galo-idle');
  });
  it('intro do Esquadrão sincroniza voo e pose sem dano e retorna à altura normal',()=>{
    const {fighter,sprite,scene}=setup('bahia');
    Object.assign(scene,{anims:{exists:()=>true,get:(key:string)=>{
      const a=getCharacterAnimationDefinition('bahia',key);
      return {duration:a.sheet.frames*1000/a.frameRate,frames:a.frameDurations!.map(duration=>({duration}))};
    }}});
    fighter.setFrozen(true);
    expect(fighter.iniciarEntrada()).toBe(3650);
    fighter.update(.5,NEUTRAL_FIGHTER_INPUT);
    expect(sprite.y).toBe(500);
    fighter.update(.85,NEUTRAL_FIGHTER_INPUT);
    expect(sprite.y).toBeCloseTo(388);
    expect(sprite.frame.name).toBe(4);
    expect(fighter.getActiveAttack()).toBeNull();
    expect(sprite.x).toBe(200);
    fighter.update(1.95,NEUTRAL_FIGHTER_INPUT);
    expect(sprite.y).toBe(500);
    expect(sprite.frame.name).toBe(10);
    fighter.setFrozen(false);
    expect(sprite.anims.currentAnim.key).toBe('bahia-idle');
  });
  it.each([1,-1] as const)('Almirante desce pela prancha sem ser reposicionado pela câmera (%i)',lado=>{
    const {fighter,sprite,scene}=setup('almirante',lado);
    const objetos:Array<{visible:boolean;destroy:ReturnType<typeof vi.fn>}>=[];
    Object.assign(scene.add,{image:()=>{
      const im={visible:true,x:0,y:0,flipX:false,setDepth(){return this;},setOrigin(){return this;},
        setFlipX(v:boolean){this.flipX=v;return this;},setDisplaySize(){return this;},setRotation(){return this;},
        setPosition(x:number,y:number){this.x=x;this.y=y;return this;},setVisible(v:boolean){this.visible=v;return this;},destroy:vi.fn()};
      objetos.push(im);return im;
    }});
    Object.assign(scene,{scale:{width:1600,height:900},cameras:{main:{scrollX:0,width:3200}},anims:{exists:()=>true,get:(key:string)=>{
      const a=getCharacterAnimationDefinition('almirante',key);
      return {duration:a.sheet.frames*1000/a.frameRate,frames:a.frameDurations!.map(duration=>({duration}))};
    }}});
    fighter.setFrozen(true);
    expect(fighter.iniciarEntrada()).toBe(4650);
    expect(sprite.anims.currentAnim.key).toBe('almirante-entrance-walk');
    const inicioX=sprite.x;
    expect(sprite.y).toBeCloseTo(290);
    fighter.setHorizontalBounds(40,960);
    expect(sprite.x).toBe(inicioX);
    expect(fighter.x).toBe(200);
    fighter.update(.5,NEUTRAL_FIGHTER_INPUT);
    expect(sprite.x).toBeCloseTo((lado===1?0:1600)+lado*15*1.4);
    const xAntes=sprite.x;
    fighter.update(.15,NEUTRAL_FIGHTER_INPUT);
    expect(sprite.x).not.toBe(xAntes);
    expect(sprite.frame.name).toBe(1);
    expect(sprite.anims.currentAnim.key).toBe('almirante-entrance-walk');
    fighter.update(1.65,NEUTRAL_FIGHTER_INPUT);
    expect(sprite.y).toBe(500);
    expect(sprite.x).toBeCloseTo(200-lado*120*1.4);
    fighter.update(.9,NEUTRAL_FIGHTER_INPUT);
    expect(sprite.y).toBe(500);
    expect(sprite.x).toBeCloseTo(200-lado*40*1.4);
    expect(sprite.anims.currentAnim.key).toBe('almirante-entrance-walk');
    fighter.update(.45,NEUTRAL_FIGHTER_INPUT);
    expect(sprite.x).toBe(200);
    expect(sprite.y).toBe(500);
    expect(sprite.anims.currentAnim.key).toBe('almirante-entrance');
    expect(sprite.frame.name).toBe(0);
    expect(fighter.getActiveAttack()).toBeNull();
    fighter.update(.8,NEUTRAL_FIGHTER_INPUT);
    expect(sprite.x).toBe(200);
    expect(sprite.y).toBe(500);
    expect(sprite.frame.name).toBe(2);
    expect(objetos.every(o=>!o.visible)).toBe(true);
    fighter.update(.2,NEUTRAL_FIGHTER_INPUT);
    expect(sprite.anims.currentAnim.key).toBe('almirante-idle');
    expect(sprite.x).toBe(200);
    fighter.setFrozen(false);
    expect(objetos.every(o=>o.destroy.mock.calls.length===1)).toBe(true);
    expect(sprite.anims.currentAnim.key).toBe('almirante-idle');
    expect(sprite.flipX).toBe(lado===1);
  });
  it('Urubu desce do alto e dispara o impacto apenas uma vez, sem ataque',()=>{
    const {fighter,sprite,scene}=setup('urubu');
    const shake=vi.fn();
    Object.assign(scene,{anims:{exists:()=>true,get:(key:string)=>{
      const a=getCharacterAnimationDefinition('urubu',key);
      return {duration:a.sheet.frames*1000/a.frameRate,frames:(a.frameDurations??a.bounds.map(()=>0)).map(duration=>({duration}))};
    }},cameras:{main:{worldView:{y:0},shake}}});
    fighter.setFrozen(true);
    expect(fighter.iniciarEntrada()).toBe(4100);
    expect(sprite.y).toBe(-80);
    fighter.update(.5,NEUTRAL_FIGHTER_INPUT);
    expect(sprite.y).toBe(-80);
    fighter.update(.5,NEUTRAL_FIGHTER_INPUT);
    expect(sprite.y).toBe(65);
    expect(shake).not.toHaveBeenCalled();
    fighter.update(.5,NEUTRAL_FIGHTER_INPUT);
    expect(sprite.y).toBe(500);
    expect(shake).toHaveBeenCalledTimes(1);
    fighter.update(3,NEUTRAL_FIGHTER_INPUT);
    expect(shake).toHaveBeenCalledTimes(1);
    expect(fighter.getActiveAttack()).toBeNull();
    fighter.setFrozen(false);
    expect(sprite.y).toBe(500);
    expect(sprite.anims.currentAnim.key).toBe('urubu-idle');
  });
  it('Biriba vem nos balões apenas quando chamado e não permite duas chamadas ao mesmo tempo',()=>{
    const {fighter,sprite,complete}=setup('cachorro');
    fighter.faceToward(800);
    expect(fighter.carrierAloft).toBe(false);
    fighter.update(.01,{...NEUTRAL_FIGHTER_INPUT,heavy:true});
    expect(sprite.anims.currentAnim.key).toBe('cachorro-summon-biriba');
    fighter.update(.3,NEUTRAL_FIGHTER_INPUT);
    expect(fighter.carrierAloft).toBe(true);
    complete('summon-biriba');
    fighter.update(.01,{...NEUTRAL_FIGHTER_INPUT,heavy:true});
    expect(sprite.anims.currentAnim.key).toBe('cachorro-idle');
    for(let i=0;i<45;i++)fighter.update(.1,NEUTRAL_FIGHTER_INPUT);
    expect(fighter.carrierAloft).toBe(false);
  });
  it.each([1,-1] as const)('Bira recebe o Biriba na própria lateral e retoma a guarda para o adversário (%i)', facing=>{
    const {fighter,sprite,scene}=setup('cachorro',facing);
    Object.assign(scene,{anims:{exists:()=>true,get:(key:string)=>{
      const a=getCharacterAnimationDefinition('cachorro',key);
      return {duration:a.sheet.frames*1000/a.frameRate,frames:(a.frameDurations??a.bounds.map(()=>0)).map(duration=>({duration}))};
    }}});
    fighter.setFrozen(true);
    expect(fighter.iniciarEntrada()).toBe(4700);
    expect(sprite.flipX).toBe(facing===-1);
    fighter.faceToward(facing===1?-100:1000);
    fighter.update(.5,NEUTRAL_FIGHTER_INPUT);
    expect(sprite.anims.currentAnim.key).toBe('cachorro-entrance');
    expect(sprite.flipX).toBe(facing===-1);
    expect(fighter.getActiveAttack()).toBeNull();
    fighter.setFrozen(false);
    // Já muda a textura junto do espelhamento, inclusive se o tutorial abrir fala.
    expect(sprite.anims.currentAnim.key).toBe('cachorro-idle');
    expect(sprite.flipX).toBe(facing===1);
  });
  it('keeps Saci grounded during preparation, follows the flight arc and lands', () => {
    const {fighter, sprite} = setup('saci');
    fighter.update(0, {...NEUTRAL_FIGHTER_INPUT, jump:true});
    fighter.update(.03, NEUTRAL_FIGHTER_INPUT);
    expect(sprite.y).toBe(500);
    fighter.update(.03, NEUTRAL_FIGHTER_INPUT);
    expect(sprite.y).toBeLessThan(500);
    expect(sprite.frame.name).toBeGreaterThanOrEqual(2);
    for (let i=0; i<80; i++) {
      fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
      if (sprite.y < 500) expect(sprite.frame.name).toBeLessThanOrEqual(4);
    }
    expect(sprite.y).toBe(500);
    expect(sprite.anims.currentAnim.key).toBe('saci-idle');
  });
  it('squats only on the ground and never replays the wind-up in the air (Urubu model)', () => {
    const {fighter, sprite} = setup('urubu');
    fighter.update(0, {...NEUTRAL_FIGHTER_INPUT, jump:true});
    expect(sprite.anims.currentAnim.key).toBe('urubu-jump');
    fighter.update(.06, NEUTRAL_FIGHTER_INPUT);
    expect(sprite.y).toBe(500);
    expect(sprite.frame.name).toBe(2);
    fighter.update(.05, NEUTRAL_FIGHTER_INPUT);
    expect(sprite.y).toBeLessThan(500);
    let previous = 3;
    while (sprite.y < 500) {
      expect(sprite.frame.name).toBeGreaterThanOrEqual(previous);
      previous = sprite.frame.name;
      fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
    }
    expect(previous).toBe(7);
    expect(sprite.frame.name).toBe(2);
    fighter.update(.12, NEUTRAL_FIGHTER_INPUT);
    fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
    expect(sprite.anims.currentAnim.key).toBe('urubu-idle');
  });
  it('throws one strike per jump that reaches a crouching defender, then lands', () => {
    const {fighter, sprite, complete} = setup('urubu');
    fighter.update(0, {...NEUTRAL_FIGHTER_INPUT, jump:true});
    fighter.update(.11, NEUTRAL_FIGHTER_INPUT);
    fighter.update(1/60, {...NEUTRAL_FIGHTER_INPUT, heavy:true});
    expect(sprite.anims.currentAnim.key).toBe('urubu-jump-kick');
    expect(sprite.frame.name).toBe(0);
    const before = fighter.x;
    const kick = fighter.getActiveAttack()!;
    expect(kick.move).toBe('voadora');
    expect(kick.profile.kind).toBe('kick');
    fighter.update(.05, NEUTRAL_FIGHTER_INPUT);
    expect(fighter.x).toBeGreaterThan(before + 15);
    complete('jump-kick');
    expect(sprite.anims.currentAnim.key).toBe('urubu-jump');
    fighter.update(1/60, {...NEUTRAL_FIGHTER_INPUT, light:true});
    expect(sprite.anims.currentAnim.key).toBe('urubu-jump');
    for (let i=0; i<90; i++) fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
    expect(sprite.y).toBe(500);
    expect(sprite.anims.currentAnim.key).toBe('urubu-idle');
  });
  it('ducks while crouching or crouch-blocking, and stands up when released', () => {
    const {fighter} = setup('urubu');
    fighter.update(1/60, {...NEUTRAL_FIGHTER_INPUT, crouch:true});
    expect(fighter.isDucking).toBe(true);
    fighter.update(1/60, {...NEUTRAL_FIGHTER_INPUT, crouch:true, block:true});
    expect(fighter.isDucking).toBe(true);
    fighter.update(1/60, {...NEUTRAL_FIGHTER_INPUT, block:true});
    expect(fighter.isDucking).toBe(false);
    fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
    expect(fighter.isDucking).toBe(false);
  });
  it('chains quick punches after the hit frames, never during them, and only after contact', () => {
    const {fighter, sprite} = setup('urubu');
    fighter.update(0, {...NEUTRAL_FIGHTER_INPUT, light:true});
    sprite.frame.name = 1;
    const first = fighter.getActiveAttack()!;
    expect(first.move).toBe('soco-rapido');
    fighter.markAttackConnected(first.signature);
    sprite.frame.name = 3;
    fighter.update(0, {...NEUTRAL_FIGHTER_INPUT, light:true});
    expect(sprite.frame.name).toBe(3);
    sprite.frame.name = 4;
    fighter.update(0, {...NEUTRAL_FIGHTER_INPUT, light:true});
    sprite.frame.name = 1;
    expect(fighter.getActiveAttack()!.signature).toBeGreaterThan(first.signature);
  });
  it('a whiffed quick punch plays to the end before the next one', () => {
    const {fighter, sprite, complete} = setup('urubu');
    fighter.update(0, {...NEUTRAL_FIGHTER_INPUT, light:true});
    sprite.frame.name = 1;
    const first = fighter.getActiveAttack()!;
    sprite.frame.name = 4;
    fighter.update(0, {...NEUTRAL_FIGHTER_INPUT, light:true});
    sprite.frame.name = 1;
    expect(fighter.getActiveAttack()!.signature).toBe(first.signature);
    complete('light-punch');
    fighter.update(0, {...NEUTRAL_FIGHTER_INPUT, light:true});
    sprite.frame.name = 1;
    expect(fighter.getActiveAttack()!.signature).toBeGreaterThan(first.signature);
  });
  it('recoils the attacker off a cornered defender, even outside hitstun', () => {
    const {fighter} = setup('urubu');
    const before = fighter.x;
    fighter.recoil(-300);
    fighter.update(.1, NEUTRAL_FIGHTER_INPUT);
    expect(fighter.x).toBeLessThan(before - 10);
    const cornered = setup('urubu').fighter;
    cornered.update(0, {...NEUTRAL_FIGHTER_INPUT, left:true});
    for (let i = 0; i < 120 && !cornered.atWall; i++) cornered.update(1/60, {...NEUTRAL_FIGHTER_INPUT, left:true});
    expect(cornered.atWall).toBe(true);
  });
  it('keeps the heavy punch going under quick punches (armor) and reports the guard held', () => {
    const {fighter, sprite} = setup('urubu');
    fighter.update(0, {...NEUTRAL_FIGHTER_INPUT, light:true, crouch:true});
    expect(fighter.isInHeavy).toBe(true);
    const health = fighter.health01;
    fighter.applyHit({kind:'high', height:'high', damage:5, knockback:100, hitstun:300}, -1, false, true);
    expect(fighter.health01).toBeLessThan(health);
    expect(sprite.anims.currentAnim.key).toBe('urubu-heavy-punch');
    expect(fighter.isInHeavy).toBe(true);
    const guard = setup('urubu').fighter;
    guard.update(1/60, {...NEUTRAL_FIGHTER_INPUT, block:true});
    expect(guard.guardStance).toBe('alta');
    guard.update(1/60, {...NEUTRAL_FIGHTER_INPUT, block:true, crouch:true});
    expect(guard.guardStance).toBe('baixa');
  });
  it('Saci lobs the pipe in an arc that falls to the ground', () => {
    const {fighter, effectVisual} = setup('saci');
    fighter.update(0, {...NEUTRAL_FIGHTER_INPUT, heavy:true});
    fighter.update(.25, NEUTRAL_FIGHTER_INPUT);
    const pipe = fighter.getActiveAttack()!;
    expect(pipe.move).toBe('cachimbo');
    const startY = pipe.rect.y;
    fighter.update(.2, NEUTRAL_FIGHTER_INPUT);
    expect(fighter.getActiveAttack()!.rect.y).toBeLessThan(startY);
    for (let i = 0; i < 90 && fighter.getActiveAttack(); i++) fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
    expect(fighter.getActiveAttack()).toBeNull();
    expect(effectVisual.destroy).toHaveBeenCalled();
  });
  it('Cartola throws the rice powder without a charge sheet; a clean hit stuns for 1.5 s', () => {
    const {fighter, sprite, special} = setup('cartola');
    special();
    expect(sprite.anims.currentAnim.key).toBe('cartola-special');
    fighter.update(.3, NEUTRAL_FIGHTER_INPUT);
    const cloud = fighter.getActiveAttack()!;
    expect(cloud.move).toBe('nuvem');
    expect(cloud.profile.stunMs).toBe(1500);
    const {fighter: victim, sprite: victimSprite} = setup('urubu');
    victim.applyHit(cloud.profile, 1, false);
    victim.update(1.4, NEUTRAL_FIGHTER_INPUT);
    expect(victim.isStunned).toBe(true);
    expect(victimSprite.anims.currentAnim.key).toBe('urubu-stunned');
    victim.update(.2, NEUTRAL_FIGHTER_INPUT);
    expect(victim.isStunned).toBe(false);
  });
  it('the rice powder keeps flying over the opponent after a hit, in front of both fighters', () => {
    const {fighter, special, effectVisual} = setup('cartola');
    special();
    fighter.update(.3, NEUTRAL_FIGHTER_INPUT);
    const cloud = fighter.getActiveAttack()!;
    expect(effectVisual.depth).toBeGreaterThan(8);
    fighter.markAttackConnected(cloud.signature);
    expect(fighter.getActiveAttack()).toBeNull();
    expect(effectVisual.destroy).not.toHaveBeenCalled();
    // Without the hit its 160 px range would end within 0.4 s; it drifts 220 px more over the target.
    const before = effectVisual.x;
    fighter.update(.5, NEUTRAL_FIGHTER_INPUT);
    expect(effectVisual.destroy).not.toHaveBeenCalled();
    fighter.update(.3, NEUTRAL_FIGHTER_INPUT);
    expect(effectVisual.destroy).not.toHaveBeenCalled();
    expect(Math.abs(effectVisual.x - before)).toBeGreaterThanOrEqual(200);
    fighter.update(.2, NEUTRAL_FIGHTER_INPUT);
    expect(effectVisual.destroy).toHaveBeenCalledOnce();
  });
  it('counts how long the guard has been held, for the perfect guard', () => {
    const {fighter} = setup('urubu');
    expect(fighter.guardHeldSeconds).toBeNull();
    fighter.update(1/60, {...NEUTRAL_FIGHTER_INPUT, block:true});
    expect(fighter.guardHeldSeconds).toBe(0);
    fighter.update(.1, {...NEUTRAL_FIGHTER_INPUT, block:true});
    expect(fighter.guardHeldSeconds).toBeCloseTo(.1);
    fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
    expect(fighter.guardHeldSeconds).toBeNull();
  });
  it('projectiles say they are projectiles (no perfect guard against them)', () => {
    const {fighter, special} = setup('cartola');
    special();
    fighter.update(.3, NEUTRAL_FIGHTER_INPUT);
    expect(fighter.getActiveAttack()?.projectile).toBe(true);
  });
  it('double tapping toward the opponent dashes about 180 px, back dash recoils less', () => {
    const tap = (fighter: Fighter, side: 'left' | 'right') => {
      fighter.update(1/60, {...NEUTRAL_FIGHTER_INPUT, [side]: true});
      fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
      fighter.update(1/60, {...NEUTRAL_FIGHTER_INPUT, [side]: true});
    };
    const {fighter} = setup('urubu');
    const start = fighter.x;
    tap(fighter, 'right');
    for (let i = 0; i < 24; i++) fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
    // Three frames of walking for the taps (~12 px) plus the dash.
    expect(fighter.x - start).toBeGreaterThan(175);
    expect(fighter.x - start).toBeLessThan(205);
    const back = setup('urubu').fighter;
    const from = back.x;
    tap(back, 'left');
    for (let i = 0; i < 24; i++) back.update(1/60, NEUTRAL_FIGHTER_INPUT);
    expect(from - back.x).toBeGreaterThan(115);
    expect(from - back.x).toBeLessThan(145);
  });
  it('a forward dash stops against the opponent instead of crossing through', () => {
    const {fighter} = setup('urubu');
    fighter.faceToward(330);
    fighter.update(1/60, {...NEUTRAL_FIGHTER_INPUT, right: true});
    fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
    fighter.update(1/60, {...NEUTRAL_FIGHTER_INPUT, right: true});
    for (let i = 0; i < 24; i++) fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
    expect(fighter.x).toBeLessThanOrEqual(330 - DASH_STOP_GAP);
    expect(fighter.x).toBeGreaterThan(200);
  });
  it('blocking in the middle of a dash stops it at once and guards', () => {
    const {fighter, sprite} = setup('urubu');
    fighter.update(1/60, {...NEUTRAL_FIGHTER_INPUT, right: true});
    fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
    fighter.update(1/60, {...NEUTRAL_FIGHTER_INPUT, right: true});
    fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
    const stopped = fighter.x;
    for (let i = 0; i < 10; i++) fighter.update(1/60, {...NEUTRAL_FIGHTER_INPUT, block: true});
    expect(fighter.x).toBe(stopped);
    expect(sprite.anims.currentAnim.key).toBe('urubu-block-high');
    expect(fighter.guardStance).toBe('alta');
  });
  it('a perfect guard leaves the attacker dizzy for 0.8 s, without damage', () => {
    const {fighter, sprite} = setup('galo');
    fighter.applyHit(PERFECT_GUARD_STAGGER, -1, false);
    fighter.update(.75, NEUTRAL_FIGHTER_INPUT);
    expect(fighter.isStunned).toBe(true);
    expect(sprite.anims.currentAnim.key).toBe('galo-stunned');
    expect(fighter.health01).toBe(1);
    fighter.update(.1, NEUTRAL_FIGHTER_INPUT);
    expect(fighter.isStunned).toBe(false);
  });
  it('a plain hit still shows the short hit reaction, not the dizzy loop', () => {
    const {fighter: victim, sprite} = setup('urubu');
    victim.applyHit({kind:'high', height:'high', damage:4, knockback:0, hitstun:200}, 1, false);
    victim.update(.1, NEUTRAL_FIGHTER_INPUT);
    expect(sprite.anims.currentAnim.key).toBe('urubu-hit-high');
  });
  it('keeps a strike pressed during the jump wind-up and throws it on takeoff', () => {
    const {fighter, sprite} = setup('urubu');
    fighter.update(0, {...NEUTRAL_FIGHTER_INPUT, jump:true});
    fighter.update(.02, {...NEUTRAL_FIGHTER_INPUT, heavy:true});
    expect(sprite.anims.currentAnim.key).toBe('urubu-jump');
    fighter.update(.1, NEUTRAL_FIGHTER_INPUT);
    expect(sprite.anims.currentAnim.key).toBe('urubu-jump-kick');
  });
  it('turns the two attack buttons into four moves with down held', () => {
    const cases: [Partial<typeof NEUTRAL_FIGHTER_INPUT>, string, string][] = [
      [{light:true}, 'soco-rapido', 'urubu-light-punch'],
      [{light:true, crouch:true}, 'soco-forte', 'urubu-heavy-punch'],
      [{heavy:true}, 'chute-basico', 'urubu-beak-pull'],
      [{heavy:true, crouch:true}, 'chute-baixo', 'urubu-low-kick']
    ];
    for (const [input, move, sheet] of cases) {
      const {fighter, sprite} = setup('urubu');
      fighter.update(0, {...NEUTRAL_FIGHTER_INPUT, ...input});
      expect(sprite.anims.currentAnim.key).toBe(sheet);
      // Contact frame from the fighter's own data (the wing spread hits on 6-8, the old cross on 2).
      const contact = getCharacterAnimationDefinition('urubu', sheet).bounds.find((frame) => frame.attack)?.frame;
      sprite.frame.name = contact ?? 0;
      expect(fighter.getActiveAttack()?.move).toBe(move);
    }
    const saci = setup('saci');
    saci.fighter.update(0, {...NEUTRAL_FIGHTER_INPUT, light:true, crouch:true});
    expect(saci.sprite.anims.currentAnim.key).toBe('saci-heavy-punch');
  });
  it('falls back to the ground when struck in the air', () => {
    const {fighter, sprite} = setup('urubu');
    fighter.update(0, {...NEUTRAL_FIGHTER_INPUT, jump:true});
    fighter.update(.11, NEUTRAL_FIGHTER_INPUT);
    fighter.update(.1, NEUTRAL_FIGHTER_INPUT);
    expect(sprite.y).toBeLessThan(500);
    fighter.applyHit({kind:'high', height:'high', damage:5, knockback:0, hitstun:3000}, -1, false);
    for (let i=0; i<60; i++) fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
    expect(sprite.y).toBe(500);
  });
  it('a quick hit during a flying special still drops him to the floor (30/10/2026)', () => {
    for (const id of ['dragao', 'urubu']) {
      const {fighter, sprite, special} = setup(id);
      special();
      for (let i=0; i<12 && sprite.y >= 480; i++) fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
      expect(sprite.y, id).toBeLessThan(480);
      fighter.applyHit({kind:'high', height:'high', damage:5, knockback:0, hitstun:100}, -1, false);
      for (let i=0; i<120; i++) fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
      expect(sprite.y, id).toBe(500);
    }
  });
  it('moves Saci continuously to either far boundary during the tornado', () => {
    for (const facing of [1, -1] as const) {
      const {fighter, special} = setup('saci', facing);
      special();
      fighter.update(.1, NEUTRAL_FIGHTER_INPUT);
      expect(fighter.x).toBe(200);
      fighter.update(.2, NEUTRAL_FIGHTER_INPUT);
      expect(fighter.x).toBeGreaterThan(40);
      expect(fighter.x).toBeLessThan(960);
      fighter.update(.3, NEUTRAL_FIGHTER_INPUT);
      expect(fighter.x).toBe(facing === 1 ? 960 : 40);
    }
  });
  it('releases one traveling shot, retains it after recovery, keeps its direction and consumes it on impact', () => {
    const {fighter, sprite, complete, visual} = setup('almirante');
    fighter.update(0, {...NEUTRAL_FIGHTER_INPUT, heavy:true});
    expect(sprite.anims.currentAnim.key).toBe('almirante-shot');
    expect(fighter.meter01).toBeLessThan(.01);
    fighter.update(.2, NEUTRAL_FIGHTER_INPUT);
    expect(fighter.getActiveAttack()).toBeNull();
    fighter.update(.06, NEUTRAL_FIGHTER_INPUT);
    const initial = fighter.getActiveAttack()!;
    expect(initial.facing).toBe(1);
    expect(initial.move).toBe('tiro');
    complete('shot');
    fighter.faceToward(40);
    fighter.update(.1, NEUTRAL_FIGHTER_INPUT);
    const moving = fighter.getActiveAttack()!;
    expect(moving.rect.x+moving.rect.width).toBeGreaterThan(initial.rect.x+initial.rect.width);
    expect(moving.facing).toBe(1);
    fighter.markAttackConnected();
    expect(fighter.getActiveAttack()).toBeNull();
    expect(visual.destroy).toHaveBeenCalledOnce();
  });
  it('clears a shot on round reset and cancels a special interrupted during its freeze', () => {
    const first = setup('almirante');
    first.fighter.update(0, {...NEUTRAL_FIGHTER_INPUT, heavy:true});
    first.fighter.update(.3, NEUTRAL_FIGHTER_INPUT);
    first.fighter.resetForRound(200, 1);
    expect(first.fighter.getActiveAttack()).toBeNull();
    expect(first.visual.destroy).toHaveBeenCalledOnce();
    const second = setup('saci');
    second.fighter.fillMeter();
    second.fighter.update(0, {...NEUTRAL_FIGHTER_INPUT, special:true});
    second.complete('special-charge');
    second.fighter.applyHit({kind:'high', height:'high', damage:5, knockback:0, hitstun:100}, 1, false);
    second.delays.forEach(fn => fn());
    expect(second.sprite.anims.currentAnim.key).toBe('saci-hit-high');
  });
  it('the Almirante caravel sails in from off-screen behind him, under him, and on past him', () => {
    const {fighter, special, effectVisual} = setup('almirante');
    fighter.setProjectileBounds(0, 2600);
    special();
    fighter.update(.11, NEUTRAL_FIGHTER_INPUT);
    const wave = fighter.getActiveAttack()!;
    // Facing right at x 200: behind is the left edge, and the whole ship starts beyond it.
    expect(wave.rect.x + wave.rect.width).toBeLessThanOrEqual(0);
    expect(effectVisual.depth).toBeLessThan(5);
    fighter.update(.8, NEUTRAL_FIGHTER_INPUT);
    expect(effectVisual.x).toBeGreaterThan(fighter.x);
  });
  it('launches an animated caravel wave, keeps crossing after a hit and removes it beyond the arena', () => {
    const {fighter, special, complete, effectVisual} = setup('almirante');
    fighter.setProjectileBounds(0, 2600);
    special();
    fighter.update(.11, NEUTRAL_FIGHTER_INPUT);
    const wave = fighter.getActiveAttack()!;
    expect(wave.profile.kind).toBe('special');
    expect(wave.move).toBe('onda');
    expect(wave.rect.height).toBe(220);
    expect(fighter.meter01).toBeLessThan(.01);
    complete('special');
    fighter.markAttackConnected(wave.signature);
    expect(fighter.getActiveAttack()).toBeNull();
    const before = effectVisual.x;
    fighter.update(.1, NEUTRAL_FIGHTER_INPUT);
    expect(effectVisual.x).toBeGreaterThan(before);
    expect(effectVisual.destroy).not.toHaveBeenCalled();
    fighter.update(2, NEUTRAL_FIGHTER_INPUT);
    expect(effectVisual.x).toBeGreaterThan(960);
    expect(effectVisual.destroy).not.toHaveBeenCalled();
    fighter.update(4, NEUTRAL_FIGHTER_INPUT);
    expect(effectVisual.destroy).toHaveBeenCalledOnce();
  });
});

describe('special meter', () => {
  it('fills on its own over the configured fight time', () => {
    const {fighter} = setup('urubu');
    for (let i = 0; i < 44; i++) fighter.update(1, NEUTRAL_FIGHTER_INPUT);
    expect(fighter.isMeterReady).toBe(false);
    fighter.update(1.5, NEUTRAL_FIGHTER_INPUT);
    expect(fighter.isMeterReady).toBe(true);
  });
});

describe('advance specials', () => {
  function opponent(x: number) {
    return { x, isAirborne: false } as unknown as Fighter;
  }
  function charged(characterId: string, foe: Fighter) {
    const ctx = setup(characterId);
    ctx.fighter.setOpponent(foe);
    ctx.special();
    return ctx;
  }

  it('Bira gallops until in reach, then pounces and bites once in the air (jump escapes)', () => {
    const foe = opponent(800);
    const {fighter, sprite} = charged('cachorro', foe);
    expect(sprite.anims.currentAnim.key).toBe('cachorro-special-run');
    expect(fighter.getActiveAttack()).toBeNull();
    for (let i = 0; i < 120 && sprite.anims.currentAnim.key === 'cachorro-special-run'; i++) {
      fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
      expect(fighter.getActiveAttack()).toBeNull();
    }
    expect(fighter.x).toBe(800 - 230);
    let bite = null as ReturnType<Fighter['getActiveAttack']>;
    let highest = 500;
    for (let i = 0; i < 40 && !bite; i++) {
      fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
      highest = Math.min(highest, sprite.y);
      bite = fighter.getActiveAttack();
    }
    expect(bite?.dodge).toBe('pulo');
    expect(highest).toBeLessThan(470);
    for (let i = 0; i < 60; i++) fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
    expect(sprite.anims.currentAnim.key).toBe('cachorro-idle');
  });

  // João, 03/11/2026: Galo, Bira e a queda do Urubu não tomam golpe nem são
  // defendidos; só a esquiva salva.
  it('Bira run is fast and untouchable, bite included', () => {
    const {fighter, sprite} = charged('cachorro', opponent(800));
    for (let i = 0; i < 15; i++) fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
    // 1120 px/s: a quarter second covers ~280 px (it used to be 140).
    expect(fighter.x).toBeGreaterThanOrEqual(200 + 270);
    expect(fighter.isInvulneravel).toBe(true);
    let bite = null as ReturnType<Fighter['getActiveAttack']>;
    for (let i = 0; i < 100 && !bite; i++) {
      fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
      expect(fighter.isInvulneravel).toBe(true);
      bite = fighter.getActiveAttack();
    }
    expect(bite?.unblockable).toBe(true);
    for (let i = 0; i < 60; i++) fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
    expect(sprite.anims.currentAnim.key).toBe('cachorro-idle');
    expect(fighter.isInvulneravel).toBe(false);
  });

  it('Galo is untouchable from the charge on and the peck is unblockable', () => {
    const {fighter} = setup('galo');
    fighter.setOpponent(opponent(600));
    expect(fighter.isInvulneravel).toBe(false);
    fighter.fillMeter();
    fighter.update(0, {...NEUTRAL_FIGHTER_INPUT, special: true});
    expect(fighter.isInvulneravel).toBe(true);
  });

  it('Urubu can be hit while rising, never on the way down', () => {
    const {fighter, sprite} = charged('urubu', opponent(650));
    fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
    expect(fighter.isInvulneravel).toBe(false);
    let intocavelNaQueda = false;
    for (let i = 0; i < 120 && sprite.anims.currentAnim.key !== 'urubu-idle'; i++) {
      fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
      const quadro = Number(sprite.frame.name);
      if (sprite.anims.currentAnim.key === 'urubu-special' && quadro >= 4 && quadro <= 9) {
        expect(fighter.isInvulneravel).toBe(true);
        intocavelNaQueda = true;
      }
    }
    expect(intocavelNaQueda).toBe(true);
  });

  it('Porco vomit is unstoppable: a hit takes health, the vomit goes on', () => {
    const {fighter, sprite, complete, delays} = setup('porco');
    fighter.setOpponent(opponent(700));
    fighter.fillMeter();
    fighter.update(0, {...NEUTRAL_FIGHTER_INPUT, special: true});
    expect(fighter.isImparavel).toBe(true);
    expect(fighter.isInvulneravel).toBe(false);
    const golpe = { damage: 18, knockback: 260, hitstun: 360, kind: 'kick', height: 'high' } as never;
    let vida = fighter.health01;
    fighter.applyHit(golpe, -1, false, fighter.isImparavel);
    expect(fighter.health01).toBeLessThan(vida);
    expect(sprite.anims.currentAnim.key).toBe('porco-special-charge');
    complete('special-charge');
    delays.splice(0).forEach((fn) => fn());
    expect(sprite.anims.currentAnim.key).toBe('porco-special');
    vida = fighter.health01;
    fighter.applyHit(golpe, -1, false, fighter.isImparavel);
    expect(fighter.health01).toBeLessThan(vida);
    expect(sprite.anims.currentAnim.key).toBe('porco-special');
  });

  it('other specials stay hittable and interruptible', () => {
    const {fighter} = charged('saci', opponent(600));
    fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
    expect(fighter.isImparavel).toBe(false);
    expect(fighter.isInvulneravel).toBe(false);
  });

  it('Galo hops low toward the head, lands, and the peck is ducked', () => {
    const {fighter, sprite} = charged('galo', opponent(600));
    let highest = 500;
    let peck = null as ReturnType<Fighter['getActiveAttack']>;
    for (let i = 0; i < 60; i++) {
      fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
      highest = Math.min(highest, sprite.y);
      peck = peck ?? fighter.getActiveAttack();
    }
    expect(highest).toBeLessThan(470);
    expect(highest).toBeGreaterThan(440);
    expect(fighter.x).toBe(600 - 110);
    expect(peck?.dodge).toBe('agachar');
    expect(sprite.y).toBe(500);
  });

  it('Urubu leaves the screen, locks the target when the dive starts and hits there', () => {
    const foe = opponent(650);
    const {fighter, sprite} = charged('urubu', foe);
    for (let i = 0; i < 40 && sprite.y > -20; i++) fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
    expect(sprite.y).toBeLessThan(-20);
    (foe as unknown as {x: number}).x = 800;
    for (let i = 0; i < 26; i++) fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
    (foe as unknown as {x: number}).x = 400;
    let meteor = null as ReturnType<Fighter['getActiveAttack']>;
    for (let i = 0; i < 30 && sprite.y < 500; i++) {
      fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
      meteor = meteor ?? fighter.getActiveAttack();
    }
    expect(sprite.y).toBe(500);
    expect(fighter.x).toBe(800);
    expect(meteor?.unblockable).toBe(true);
    expect(meteor?.dodge).toBe('pulo-recuando');
    expect(meteor?.profile.stunMs).toBe(1500);
    for (let i = 0; i < 20; i++) fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
    expect(sprite.anims.currentAnim.key).toBe('urubu-idle');
  });
});

// Golpe `mina` e forma `soNoAcerto` (a Raposa, docs/gdd.md, 06/11/2026). Sem as
// sheets dela ainda, o teste empresta o Almirante e o Galo e troca só o JSON.
describe('mina que acumula e forma só no acerto', () => {
  const CACOS = { kind: 'mina', action: 'shot', mina: { quadro: 3, avanco: 70, largura: 60, segundos: 5, dano: 12, acumula: { segundos: 7, dano: 18 } } };
  function comCacos<T>(teste: () => T): T {
    const moves = getCharacterDefinition('almirante').moves!;
    const original = moves.kick;
    moves.kick = CACOS;
    try { return teste(); } finally { moves.kick = original; }
  }
  /** Oponente parado: `em cima` põe a caixa dele sobre o chão do lado da Raposa. */
  function alvo() {
    const foe = { x: 900, isAirborne: false, hurt: { x: 2000, y: 0, width: 10, height: 10 },
      getHurtRect() { return this.hurt; } };
    return { foe: foe as unknown as Fighter, emCima: () => { foe.hurt = { x: 0, y: 0, width: 1000, height: 600 }; } };
  }
  function garrafa(ctx: ReturnType<typeof setup>) {
    ctx.fighter.update(0, {...NEUTRAL_FIGHTER_INPUT, heavy: true});
    ctx.fighter.update(.5, NEUTRAL_FIGHTER_INPUT);
    ctx.complete('shot');
    ctx.fighter.update(.01, NEUTRAL_FIGHTER_INPUT);
  }

  it('a mina parada no chão não toma o lugar dos golpes do dono nem assusta a CPU', () => comCacos(() => {
    const ctx = setup('almirante');
    const { foe } = alvo();
    ctx.fighter.setOpponent(foe);
    garrafa(ctx);
    expect(ctx.fighter.getActiveAttack()).toBeNull();
    expect(ctx.fighter.hasThreatInFlight).toBe(false);
  }));

  it('quem pisa toma 12, sem guarda que segure, e a mina some', () => comCacos(() => {
    const ctx = setup('almirante');
    const { foe, emCima } = alvo();
    ctx.fighter.setOpponent(foe);
    garrafa(ctx);
    emCima();
    const mina = ctx.fighter.getActiveAttack()!;
    expect(mina.profile.damage).toBe(12);
    expect(mina.unblockable).toBe(true);
    ctx.fighter.markAttackConnected(mina.signature);
    expect(ctx.fighter.getActiveAttack()).toBeNull();
  }));

  it('segunda garrafa dobra (18, 7 s); a terceira faz outra simples e a dupla fica', () => comCacos(() => {
    const ctx = setup('almirante');
    const { foe, emCima } = alvo();
    ctx.fighter.setOpponent(foe);
    garrafa(ctx);
    garrafa(ctx);
    garrafa(ctx);
    // Passa dos 5 s da simples nova, dentro dos 7 s da dupla.
    for (let i = 0; i < 11; i++) ctx.fighter.update(.5, NEUTRAL_FIGHTER_INPUT);
    emCima();
    const dupla = ctx.fighter.getActiveAttack()!;
    expect(dupla.profile.damage).toBe(18);
    ctx.fighter.markAttackConnected(dupla.signature);
    expect(ctx.fighter.getActiveAttack()).toBeNull();
  }));

  it('as três garrafas deixam duas minas: a dupla e a simples nova', () => comCacos(() => {
    const ctx = setup('almirante');
    const { foe, emCima } = alvo();
    ctx.fighter.setOpponent(foe);
    garrafa(ctx);
    garrafa(ctx);
    garrafa(ctx);
    emCima();
    const primeira = ctx.fighter.getActiveAttack()!;
    expect(primeira.profile.damage).toBe(18);
    ctx.fighter.markAttackConnected(primeira.signature);
    expect(ctx.fighter.getActiveAttack()!.profile.damage).toBe(12);
  }));

  function puloComForma<T>(teste: () => T): T {
    const special = getCharacterDefinition('galo').moves!.special!;
    const original = special.forma;
    special.forma = { lutador: 'coxa-maromba', segundos: 8, soNoAcerto: true };
    try { return teste(); } finally { special.forma = original; }
  }
  function pulo(acerta: boolean) {
    const ctx = setup('galo');
    ctx.fighter.setOpponent({ x: 600, isAirborne: false } as unknown as Fighter);
    ctx.special();
    for (let i = 0; i < 90; i++) {
      ctx.fighter.update(1/60, NEUTRAL_FIGHTER_INPUT);
      const golpe = ctx.fighter.getActiveAttack();
      if (acerta && golpe) ctx.fighter.markAttackConnected(golpe.signature, false);
    }
    return ctx.fighter;
  }

  it('especial que erra não transforma', () => puloComForma(() => {
    expect(pulo(false).formaHud).toBeNull();
  }));

  it('especial que acerta transforma no fim do salto', () => puloComForma(() => {
    expect(pulo(true).formaHud?.segundos).toBe(8);
  }));
});
