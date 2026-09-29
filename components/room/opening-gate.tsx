'use client';
import {useEffect,useRef,useState} from 'react';
type Props={ready:boolean;progress:number;reduced:boolean;onEnter:()=>void;onComplete:()=>void};
export default function OpeningGate({ready,progress,reduced,onEnter,onComplete}:Props){
 const video=useRef<HTMLVideoElement>(null);const [portrait,setPortrait]=useState<boolean|null>(null);const [settled,setSettled]=useState(false);const [phase,setPhase]=useState<'loading'|'playing'|'light'|'leaving'>('loading');const [mediaFailed,setMediaFailed]=useState(false);const [canPlay,setCanPlay]=useState(false);const timer=useRef<ReturnType<typeof setTimeout>>();const entered=useRef(false);
 const callbacks=useRef({onEnter,onComplete});callbacks.current={onEnter,onComplete};
 useEffect(()=>{setPortrait(innerWidth/innerHeight<1);const id=setTimeout(()=>setSettled(true),1300);return()=>{clearTimeout(id);clearTimeout(timer.current);};},[]);
 // Preserve the entire door initially, then push through the opening with the footage.
 useEffect(()=>{
  const el=video.current;if(!el)return;
  if(phase==='loading'||reduced){el.style.scale='1';return;}
  if(phase!=='playing')return;
  let frame=0;
  const zoom=()=>{
   const width=el.clientWidth,height=el.clientHeight,vw=el.videoWidth||1080,vh=el.videoHeight||1920;
   const cover=Math.max(width/vw,height/vh)/Math.min(width/vw,height/vh);
   const t=Math.max(0,Math.min(1,(el.currentTime-.8)/2.3));const eased=t*t*(3-2*t);
   el.style.scale=String(1+(Math.max(1.12,cover*1.12)-1)*eased);
   frame=requestAnimationFrame(zoom);
  };frame=requestAnimationFrame(zoom);return()=>cancelAnimationFrame(frame);
 },[phase,reduced]);
 const finish=()=>{if(entered.current)return;entered.current=true;clearTimeout(timer.current);video.current?.pause();setPhase('light');callbacks.current.onEnter();timer.current=setTimeout(()=>{setPhase('leaving');timer.current=setTimeout(()=>callbacks.current.onComplete(),reduced?160:700);},reduced?40:400);};
 const enter=()=>{if(!ready||!settled||phase!=='loading')return;if(reduced||mediaFailed){finish();return;}setPhase('playing');const el=video.current;if(!el){finish();return;}el.muted=true;el.currentTime=0;void el.play().catch(finish);timer.current=setTimeout(finish,6500);};
 // Original portrait footage, framed with black sides until the door opens.
 const source='portrait';const available=ready&&settled;
 return <section className={'opening-gate opening-phase-'+phase+(settled?' is-settled':'')+(reduced?' is-reduced':'')} aria-label="Welcome to Akash Ram's portfolio" aria-busy={!available}>
  <div className="opening-world" aria-hidden="true">
   <div className="opening-ring"/>
   {portrait!==null&&<video ref={video} className="opening-film" src={'/videos/opening-door-'+source+'.mp4'} poster={'/videos/opening-door-'+source+'.jpg'} preload="auto" muted playsInline disablePictureInPicture onCanPlay={()=>setCanPlay(true)} onEnded={finish} onTimeUpdate={()=>{const el=video.current;if(phase==='playing'&&el&&el.currentTime>=el.duration-.12)finish();}} onError={()=>{setMediaFailed(true);if(phase==='playing')finish();}}/>}
   {mediaFailed&&<div className="opening-fallback-door"><div/></div>}
   <div className="opening-shade"/>
  </div>
  <div className="opening-identity"><span>AKASH RAM</span><span>DEVELOPER / STUDENT</span></div>
  {phase==='loading'&&<><div className="opening-console" aria-live="polite"><span className="opening-command">&gt; open akash.portfolio<span className="opening-cursor">_</span></span><span>{ready?'[ READY ]  Room prepared':'[ LOAD  ]  Preparing your visit'}</span><span>{available?'[ ENTER ]  Your way in':canPlay?'[ READY ]  Door sequence loaded':'[ LOAD  ]  Setting the scene'}</span><div className="opening-progress" role="progressbar" aria-label="Loading the locker room" aria-valuemin={0} aria-valuemax={100} aria-valuenow={ready?100:Math.round(progress)}><i style={{width:(ready?100:Math.max(0,Math.min(100,progress)))+'%'}}/></div></div><button className="opening-enter" onClick={enter} disabled={!available} aria-label="STEP INSIDE"><span>{available?'STEP INSIDE':'PREPARING YOUR VISIT'}</span><svg viewBox="0 0 24 24" width="19" height="19" fill="none" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.4"/></svg></button></>}
  {phase==='playing'&&<button className="opening-skip" onClick={finish}>Skip intro</button>}
  <div className="opening-light" aria-hidden="true"/>
 </section>;
}
