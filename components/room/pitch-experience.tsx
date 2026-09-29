'use client';
import {Component,Suspense,useCallback,useEffect,useMemo,useRef,useState,ReactNode} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {Html,useGLTF} from '@react-three/drei';
import * as THREE from 'three';
import {clone} from 'three/examples/jsm/utils/SkeletonUtils.js';
import StadiumEnvironment from '../stadium-environment';
import {useCelebrationAudio} from './use-celebration-audio';
import {celebrationPose,chantLetters,CHANT_TEXT} from '@/lib/celebration';
import {getRonaldoShot} from '@/lib/ronaldo-motion';
import {PitchGame,LABELS,Target} from '@/lib/pitch-game';
const TARGETS=Object.keys(LABELS) as Target[];
const KEYS:Record<string,Target>={Digit1:'leftFoot',Digit2:'rightFoot',Digit3:'leftThigh',Digit4:'rightThigh',Digit5:'head',Space:'neck'};
const SUFFIX:Record<Target,string>={leftFoot:'L Foot_00',rightFoot:'R Foot_063',leftThigh:'L Calf_058',rightThigh:'R Calf_062',head:'Head_055',neck:'Neck_06'};
class Boundary extends Component<{children:ReactNode;onFail:()=>void},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return {failed:true};}componentDidCatch(){this.props.onFail();}render(){return this.state.failed?null:this.props.children;}}
function Performer({game,mode,onReady,onRefresh,targets,mouth}:{game:PitchGame;mode:'juggle'|'celebrate';onReady:()=>void;onRefresh:()=>void;mouth:React.MutableRefObject<HTMLDivElement|null>;targets:React.MutableRefObject<Partial<Record<Target,HTMLButtonElement|null>>>}){
 const data=useGLTF(mode==='juggle'?'/models/ronaldo-juggling.glb':'/models/ronaldo-portugal.glb','/draco/');
 const model=useMemo(()=>clone(data.scene),[data.scene]);const mixer=useMemo(()=>new THREE.AnimationMixer(model),[model]);const action=useRef<THREE.AnimationAction>();
 const {camera,size,gl,invalidate}=useThree();const shown=useRef(0);const run=useRef(-1);const last=useRef(0);const lastStatus=useRef(game.status);const group=useRef<THREE.Group>(null);const p=useMemo(()=>new THREE.Vector3(),[]);
 const head=useMemo(()=>model.getObjectByName('Head'),[model]);
 const bones=useMemo(()=>{const found:Partial<Record<Target,THREE.Object3D>>={};model.traverse(o=>{for(const t of TARGETS)if(o.name.replace(/ /g,'_').endsWith(SUFFIX[t].replace(/ /g,'_')))found[t]=o;});return found;},[model]);
 useEffect(()=>{const mats:THREE.Material[]=[];model.traverse(o=>{if(o instanceof THREE.Mesh){o.castShadow=true;o.receiveShadow=false;const array=Array.isArray(o.material);const list=(array?o.material:[o.material]) as THREE.Material[];const copies=list.map(m=>{const c=m.clone();mats.push(c);if(c instanceof THREE.MeshStandardMaterial){c.metalness=0;c.envMapIntensity=.65;if(c.map)c.map.anisotropy=8;if(/hair|eyelash/i.test(c.name)){c.alphaTest=.35;c.transparent=false;}}return c;});o.material=array?copies:copies[0];}});
  const a=mixer.clipAction(data.animations[0]);a.play();a.paused=true;action.current=a;mixer.update(0);onReady();invalidate();
  return()=>{mixer.stopAllAction();mixer.uncacheRoot(model);mats.forEach(m=>m.dispose());};
 },[model,mixer,data.animations,onReady,invalidate]);
 useEffect(()=>{const portrait=size.width/size.height<.8;camera.position.set(.12,1.62,portrait?6.4:4.9);camera.lookAt(0,1.22,0);camera.updateProjectionMatrix();invalidate();},[camera,size,invalidate]);
 useFrame((state,dt)=>{
  if(!action.current)return;
  if(!document.hidden)game.tick(Math.min(dt,.08),data.animations[0].duration);
  let settling=false;
  if(mode==='celebrate'){
   if(run.current!==game.celebrationRun){shown.current=0;run.current=game.celebrationRun;}
   shown.current=game.celebrationProgress;
   game.celebrationShown=shown.current;const pose=celebrationPose(shown.current);game.time=pose.capture*data.animations[0].duration;
   const shot=getRonaldoShot(pose.capture,size.width/size.height);camera.position.set(...shot.camera);camera.lookAt(shot.target[0],shot.target[1]+3.8*(1-pose.entrance),shot.target[2]);camera.updateMatrixWorld();
   if(group.current)group.current.visible=pose.visible;
   gl.domElement.dataset.celebrationVisible=String(pose.visible);gl.domElement.dataset.celebrationProgress=shown.current.toFixed(4);gl.domElement.dataset.celebrationAuto=String(game.celebrationAuto);
  }
  action.current.enabled=true;action.current.paused=true;action.current.time=game.time;mixer.update(0);group.current?.updateMatrixWorld(true);
  for(const target of TARGETS){const el=targets.current[target],bone=bones[target];if(!el||!bone)continue;bone.getWorldPosition(p);if(target==='head')p.y+=.15;if(target==='neck')p.y+=.09;p.project(camera);el.style.left=((p.x*.5+.5)*size.width)+'px';el.style.top=((-p.y*.5+.5)*size.height)+'px';}
  if(mode==='celebrate'&&mouth.current&&head){head.getWorldPosition(p);p.y+=.025;p.project(camera);const x=(p.x*.5+.5)*size.width,y=(-p.y*.5+.5)*size.height;mouth.current.style.left=(x+32)+'px';mouth.current.style.top=(y-4)+'px';mouth.current.style.fontSize=Math.max(17,Math.min(54,(size.width-x-48)/8))+'px';mouth.current.dataset.mouthX=x.toFixed(1);mouth.current.dataset.mouthY=y.toFixed(1);}
  gl.domElement.dataset.pitchTime=game.time.toFixed(3);gl.domElement.dataset.pitchState=game.status;gl.domElement.dataset.pitchCue=game.cue?.target??'';
  if(state.clock.elapsedTime-last.current>.04||lastStatus.current!==game.status){last.current=state.clock.elapsedTime;lastStatus.current=game.status;onRefresh();}
  if((['playing','countdown'].includes(game.status)||game.celebrationAuto||settling)&&!document.hidden)invalidate();
 });
 useEffect(()=>{const wake=()=>invalidate();window.addEventListener('pointerdown',wake);window.addEventListener('keydown',wake);return()=>{window.removeEventListener('pointerdown',wake);window.removeEventListener('keydown',wake);};},[invalidate]);
 // Turn the juggling rig with its ball; celebration keeps the original cinematic camera path.
 return <group ref={group} rotation={[0,mode==='juggle'?Math.PI:0,0]}><primitive object={model}/></group>;
}
function Wake({revision}:{revision:number}){const invalidate=useThree(s=>s.invalidate);useEffect(()=>invalidate(),[revision,invalidate]);return null;}
// Temporarily closed to visitors. Keep the assets and playback implementation for later.
const CELEBRATION_ENABLED = false;
export default function PitchExperience({onExit}:{onExit:()=>void}){
 const game=useMemo(()=>new PitchGame(),[]);const [revision,refresh]=useState(0);const [mode,setMode]=useState<'juggle'|'celebrate'>('juggle');const [ready,setReady]=useState(false);const [failed,setFailed]=useState(false);const [reduced,setReduced]=useState(false);const [consent,setConsent]=useState(false);
 const chant=useCelebrationAudio(game,mode);const mouth=useRef<HTMLDivElement|null>(null);
 const surface=useRef<HTMLElement>(null);
 const targets=useRef<Partial<Record<Target,HTMLButtonElement|null>>>({});const bestLoaded=useRef(false);const onRefresh=useCallback(()=>refresh(n=>n+1),[]);const loaded=useCallback(()=>{setReady(true);},[]);const fail=useCallback(()=>setFailed(true),[]);
 const update=(fn:()=>void)=>{fn();onRefresh();};
 useEffect(()=>{const m=matchMedia('(prefers-reduced-motion: reduce)');const sync=()=>setReduced(m.matches);sync();m.addEventListener('change',sync);try{const b=Number(localStorage.getItem('akash-pitch-best'));if(Number.isFinite(b)&&b>0)game.best=b;}catch{}bestLoaded.current=true;return()=>m.removeEventListener('change',sync);},[game]);
 useEffect(()=>{if(bestLoaded.current)try{localStorage.setItem('akash-pitch-best',String(game.best));}catch{}},[game,game.best]);
 useEffect(()=>{if(ready)return;const id=setTimeout(fail,35000);return()=>clearTimeout(id);},[ready,mode,fail]);
 useEffect(()=>{
  const key=(e:KeyboardEvent)=>{if(e.code==='Escape'){e.preventDefault();game.pause();onRefresh();return;}if(e.target instanceof HTMLButtonElement||e.repeat)return;const target=KEYS[e.code];if(target&&game.active){e.preventDefault();game.press(target);onRefresh();}};
  const up=(e:KeyboardEvent)=>{if(e.code==='Space'){game.release();onRefresh();}};
  const release=()=>{game.release();onRefresh();};const pause=()=>{game.pause();onRefresh();};
  window.addEventListener('keydown',key);window.addEventListener('keyup',up);window.addEventListener('pointerup',release);window.addEventListener('pointercancel',pause);window.addEventListener('blur',pause);document.addEventListener('visibilitychange',pause);
  return()=>{window.removeEventListener('keydown',key);window.removeEventListener('keyup',up);window.removeEventListener('pointerup',release);window.removeEventListener('pointercancel',pause);window.removeEventListener('blur',pause);document.removeEventListener('visibilitychange',pause);};
 },[game,onRefresh]);
 const choose=(next:'juggle'|'celebrate',auto=true)=>{if(next==='celebrate'&&!CELEBRATION_ENABLED)return;if(next==='celebrate'&&auto)chant.unlock();else chant.stop();if(next!==mode){setReady(false);setMode(next);}update(()=>next==='juggle'?game.start():game.celebrate(auto));surface.current?.focus();};
 const locked=!ready||failed||(reduced&&!consent);const live=game.status==='playing'||game.status==='countdown';const hasActivity=live;
 return <main ref={surface} tabIndex={-1} className="pitch-experience" data-state={game.status} data-score={game.score} data-speed={game.speed.toFixed(2)}>
  <div className="pitch-stage">
   {!failed&&<Boundary onFail={fail}><Canvas shadows frameloop="demand" dpr={[1,1.5]} camera={{fov:40,position:[.12,1.62,4.9],near:.1,far:180}} gl={{antialias:true,powerPreference:'high-performance',toneMapping:THREE.ACESFilmicToneMapping,toneMappingExposure:1.02}} onPointerMissed={()=>{if(game.active)update(()=>game.fail('Missed the contact. Aim for the highlighted ring.'));}}>
    <ambientLight intensity={.35}/><directionalLight position={[-3,5,4]} color="#fff1e0" intensity={1.5} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-4} shadow-camera-right={4} shadow-camera-top={5} shadow-camera-bottom={-3} shadow-normalBias={.025}/><directionalLight position={[4,3,-3]} color="#dcecff" intensity={1.2}/>
    <Suspense fallback={null}><StadiumEnvironment/><Performer key={mode} game={game} mode={mode} onReady={loaded} onRefresh={onRefresh} targets={targets} mouth={mouth}/></Suspense><Wake revision={revision}/>
   </Canvas></Boundary>}
   {failed&&<div className="pitch-fallback"/>}
  </div>
  <header className="pitch-header"><button onClick={onExit} className="pitch-back">← Locker room</button><span className="pitch-identity">{mode==='celebrate'?'THE ICONIC SIUU':game.status==='lobby'?'':'JUGGLE GAME'}</span>{mode==='juggle'?<div className="pitch-best">PERSONAL BEST <strong>{String(game.best).padStart(2,'0')}</strong></div>:<button className="chant-sound" onClick={chant.toggle} aria-label={chant.blocked?'Enable stadium sound':chant.muted?'Unmute stadium sound':'Mute stadium sound'} aria-pressed={!chant.muted}>{chant.blocked?'Enable sound':chant.muted?'Sound off':'Sound on'}</button>}</header>
  {live&&<div className="pitch-targets" aria-label="Ronaldo contact targets">{TARGETS.map((t,i)=>{const next=game.cue?.target===t;return <button key={t} ref={el=>{targets.current[t]=el;}} tabIndex={-1} aria-label={LABELS[t]+(t==='neck'?' — hold':' — tap')} data-target={t} data-active={next} data-ready={next&&game.canHit} className={'pitch-target'+(next?' is-next':'')+(next&&game.canHit?' is-timed':'')+(next&&game.holding?' is-holding':'')} onPointerDown={e=>{if(e.button!==0)return;e.preventDefault();e.stopPropagation();try{e.currentTarget.setPointerCapture(e.pointerId);}catch{}update(()=>game.press(t));}} onPointerCancel={()=>update(()=>game.pause())}><i>{t==='neck'?'HOLD':String(i+1)}</i>{next&&<span>{LABELS[t]}</span>}</button>;})}</div>}
  {game.status==='lobby'&&<section className="pitch-launch"><h1>JUGGLE<span>GAME</span></h1><div className="launch-actions"><button className="arcade-start" disabled={locked} onClick={()=>choose('juggle')} aria-label="Start challenge"><span>▶</span> START GAME</button><details className="game-rules"><summary aria-label="Game rules">?</summary><div><button className="rules-close" aria-label="Close game rules" onClick={e=>{const details=e.currentTarget.closest('details');if(details)details.open=false;}}>&times;</button><strong>HOW TO PLAY</strong><ul><li>Tap the highlighted foot, thigh or head ring.</li><li>Hold for the neck balance, then release when it ends.</li><li>One missed touch ends your run.</li><li>The pace increases every ten successful touches.</li></ul><small>1 / 2 feet · 3 / 4 thighs · 5 head · Space hold</small></div></details></div></section>}
  {(live||game.status==='paused'||game.status==='gameover')&&<aside className="pitch-score"><span>CLEAN TOUCHES</span><strong>{String(game.score).padStart(2,'0')}</strong><div><span>ROUND {game.round}</span><span>{game.speed.toFixed(2)}× PACE</span></div><div className="pitch-pace"><i style={{width:Math.min(100,((game.speed-.35)/.45)*100)+'%'}}/></div></aside>}
  {game.status==='countdown'&&ready&&<div className="pitch-countdown" role="status"><b>{Math.max(1,Math.ceil(game.countdown))}</b><span>WATCH THE FIRST RING</span></div>}
  {game.status==='playing'&&<div className="pitch-callout"><span>{game.holding?'KEEP HOLDING':game.canHit?'NOW':game.cue?'NEXT TOUCH':'NEXT ROUND'}</span><strong>{game.holding?'Hold the balance':game.cue?LABELS[game.cue.target]:'Stay ready'}</strong><p>{game.holding?'Keep your finger down until the balance ends.':game.feedback||'Wait for the ring to light up.'}</p></div>}
  {game.status==='gameover'&&<section className="pitch-result" role="status"><p className="pitch-kicker">EVERY TOUCH COUNTS</p><h2>End of the run.</h2><p>{game.reason}</p><strong>{game.score}<small>clean touches</small></strong><div className="pitch-choices"><button onClick={()=>choose('juggle')}>Try again ↗</button><button onClick={()=>update(()=>game.lobby())}>Pitch menu</button></div></section>}
  {game.status==='paused'&&<section className="pitch-result"><p className="pitch-kicker">TAKE A BREATHER</p><h2>Paused.</h2><p>Your run is waiting right here.</p><div className="pitch-choices"><button onClick={()=>{update(()=>game.resume());surface.current?.focus();}}>Resume</button><button onClick={()=>{if(mode!=='juggle'){setMode('juggle');setReady(false);}update(()=>game.lobby());}}>Pitch menu</button></div></section>}
  {mode==='celebrate'&&<>{chantLetters(game.celebrationShown)>0&&<div ref={mouth} className="mouth-chant" role="status" aria-label="Siu celebration"><span aria-hidden="true">{CHANT_TEXT.slice(0,chantLetters(game.celebrationShown)).split('').map((letter,i)=><i key={i}>{letter}</i>)}</span></div>}</>}
  {CELEBRATION_ENABLED&&<audio ref={chant.audio} src="/audio/stadium-siu-mix.mp3" preload="auto" hidden/>}
  {(!ready||failed)&&<div className="pitch-loading" role="status">{failed?<><b>The pitch could not load.</b><p>Return to the locker room and try again.</p><button onClick={onExit}>Back to locker room</button></>:<><span className="pitch-loader"/><b>Preparing the pitch</b><p>Loading Ronaldo and the stadium.</p></>}</div>}
  {reduced&&!consent&&ready&&!failed&&<div className="pitch-motion-note"><p>This game uses moving 3D animation. Your reduced-motion preference is on.</p><button onClick={()=>setConsent(true)}>Enable animation for this visit</button></div>}
  <footer className="pitch-footer"><span>{live?'1 / 2 FEET · 3 / 4 THIGHS · 5 HEAD · SPACE HOLD':''}</span>{hasActivity&&<button onClick={()=>update(()=>game.pause())}>Pause <span>ESC</span></button>}{mode==='juggle'?(CELEBRATION_ENABLED&&<button className="next-stop" disabled={locked} onClick={()=>choose('celebrate')} aria-label="Next stop - The iconic Siuu"><span>NEXT STOP</span><b>The iconic Siuu ↗</b></button>):<><button className="back-to-game" onClick={()=>{setMode('juggle');setReady(false);update(()=>game.lobby());}}>Juggle game</button><button className="full-celebration" disabled={locked} onClick={()=>choose('celebrate',true)}>Replay celebration</button></>}</footer>

 </main>;
}
