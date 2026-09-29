'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import type {PitchGame} from '@/lib/pitch-game';
import {CHANT_START} from '@/lib/celebration';
export function useCelebrationAudio(game:PitchGame,mode:'juggle'|'celebrate'){
 const audio=useRef<HTMLAudioElement>(null);const [muted,setMuted]=useState(false);const [blocked,setBlocked]=useState(false);
 const armed=useRef(false);const played=useRef(false);const unlocking=useRef(false);
 const stop=useCallback(()=>{armed.current=false;audio.current?.pause();},[]);
 const unlock=useCallback(()=>{const a=audio.current;if(!a||unlocking.current)return;armed.current=true;played.current=false;a.pause();a.currentTime=0;a.playbackRate=1;if(muted)return;unlocking.current=true;a.volume=0;void a.play().then(()=>{a.pause();a.currentTime=0;a.volume=.75;setBlocked(false);}).catch(()=>setBlocked(true)).finally(()=>{unlocking.current=false;});},[muted]);
 useEffect(()=>{if(audio.current)audio.current.muted=muted;},[muted]);
 useEffect(()=>{const a=audio.current;if(!a)return;
 const timer=setInterval(()=>{
  if(unlocking.current)return;
  if(mode!=='celebrate'||document.hidden||(!game.celebrationAuto&&game.status!=='celebrated')){a.pause();if(mode!=='celebrate'||document.hidden)armed.current=false;return;}
  if(!armed.current||played.current||!game.celebrationAuto||game.celebrationShown<CHANT_START)return;
  played.current=true;a.currentTime=0;a.playbackRate=1;a.volume=.75;
  void a.play().then(()=>setBlocked(false)).catch(()=>setBlocked(true));
 },30);return()=>{clearInterval(timer);a.pause();};
 },[game,mode]);
 const toggle=()=>{if(blocked&&game.celebrationAuto){unlock();return;}setMuted(v=>!v);};
 return {audio,muted,blocked,unlock,toggle,stop};
}
