'use client';
import { Component, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import type { Destination } from './locker-room-scene';
import {FORMATIONS,SKILL_GROUPS} from '@/lib/skill-formations';
import { projects } from '@/lib/portfolio-data';
import OpeningGate from './opening-gate';
import {StoryCard,StoryBadge} from './story-card';
const Pitch=dynamic(()=>import('./pitch-experience'),{ssr:false});
const Scene=dynamic(()=>import('./locker-room-scene'),{ssr:false});
const EMAIL='akashram.27csa@licet.ac.in';
const titles={about:'The person behind the game.',projects:'Built with intent.',skills:'The game plan.',contact:'Say hello.'};
const menu:[Destination,string][]=[['about','About'],['projects','Projects'],['skills','Skills'],['contact','Contact']];
const Arrow=()=> <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.5"/></svg>;
class Boundary extends Component<{children:ReactNode;onFailure:()=>void},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return{failed:true}}componentDidCatch(){this.props.onFailure()}render(){return this.state.failed?null:this.props.children}}
export default function RoomExperience(){
 const [entered,setEntered]=useState(false);const [openingComplete,setOpeningComplete]=useState(false);const [ready,setReady]=useState(false);const [progress,setProgress]=useState(0);const [failed,setFailed]=useState(false);const [reduced,setReduced]=useState(false);
 const [slideDirection,setSlideDirection]=useState(1);
 const [destination,setDestination]=useState<Destination>('room');const [project,setProject]=useState(0);const [copied,setCopied]=useState(false);const [copyError,setCopyError]=useState(false);
 const [freeLook,setFreeLook]=useState(false);const [formation,setFormation]=useState(0);const [mapOpen,setMapOpen]=useState(false);const [visited,setVisited]=useState<Destination[]>([]);const [tour,setTour]=useState(-1);
 const [mounted,setMounted]=useState(false);const panel=useRef<HTMLElement>(null);const restoreFocus=useRef<HTMLElement|null>(null);
 const onReady=useCallback(()=>{setReady(true);setProgress(100)},[]);const failure=useCallback(()=>{setFailed(true);setReady(true)},[]);
 const hasPanel=['about','projects','skills','contact'].includes(destination);
 useEffect(()=>{setMounted(true);const media=matchMedia('(prefers-reduced-motion: reduce)');const sync=()=>setReduced(media.matches);sync();media.addEventListener('change',sync);return()=>media.removeEventListener('change',sync)},[]);
 useEffect(()=>{if(ready)return;const id=setTimeout(failure,35000);return()=>clearTimeout(id)},[ready,failure]);
 useEffect(()=>{if(!copied)return;const id=setTimeout(()=>setCopied(false),2500);return()=>clearTimeout(id)},[copied]);
 const select=useCallback((d:Destination,keepTour=false)=>{setEntered(true);setDestination(d);setFreeLook(false);setMapOpen(false);if(!keepTour)setTour(-1);if(d!=='room'&&d!=='pitch')setVisited(v=>v.includes(d)?v:[...v,d]);},[]);
 const stops:Destination[]=['about','projects','skills','contact'];
 const nextStop=()=>{const next=tour+1;if(next>=stops.length){select('room');return;}setTour(next);select(stops[next],true);};
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(!entered||destination==='pitch')return;if(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)return;if(!hasPanel&&e.key==='Escape')select('room');if(!hasPanel&&['1','2','3','4'].includes(e.key))select(menu[Number(e.key)-1][0]);};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[destination,hasPanel,select,entered]);
 useEffect(()=>{if(!hasPanel)return;restoreFocus.current=document.activeElement as HTMLElement;panel.current?.focus();const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){setDestination('room');return;}};document.addEventListener('keydown',key);return()=>{document.removeEventListener('keydown',key);restoreFocus.current?.focus()}},[hasPanel,destination]);
 const copy=async()=>{try{await navigator.clipboard.writeText(EMAIL);setCopied(true);setCopyError(false)}catch{setCopyError(true)}};
 const start=()=>{setEntered(true);setDestination('room')};
 useEffect(()=>{if(destination==='projects')panel.current?.scrollTo({top:0});},[project,destination]);
 if(destination==='pitch')return <Pitch onExit={()=>select('room')}/>;
 const current=projects[project];
 const changeProject=(next:number,direction=next>project?1:-1)=>{setSlideDirection(direction);setProject((next+projects.length)%projects.length)};
 return <main className={'experience'+(entered?' is-entered':'')+(hasPanel?' has-panel':'')+(failed?' is-fallback':'')+(hasPanel?' scene-beside-panel':'')}>
  <div className="room-canvas" aria-label="Interactive sports clubhouse">
   {mounted&&!failed&&<Boundary onFailure={failure}><Scene freeLook={freeLook} formation={formation} onFormation={setFormation} project={project} entered={entered} destination={destination} reduced={reduced} onReady={onReady} onProgress={setProgress} onSelect={select}/></Boundary>}
   {failed&&<div className="room-fallback-image"/>}
  </div>
  <div className="room-vignette" aria-hidden="true"/>
  <header className="experience-header"><button className="brand" aria-label="Return to room overview" onClick={()=>select('room')}>AKASH<span>RAM</span></button><span className="edition">DEVELOPER / STUDENT</span><nav aria-label="Main navigation">{menu.map(([d,name])=><button key={d} onClick={()=>select(d)} aria-current={destination===d?'page':undefined}>{name}</button>)}</nav></header>
  {!openingComplete&&<OpeningGate ready={ready} progress={progress} reduced={reduced} onEnter={start} onComplete={()=>setOpeningComplete(true)}/>}
  {entered&&!hasPanel&&<>
   <div className="room-toolbar" aria-label="Explore the room"><button aria-pressed={freeLook} disabled={failed||reduced} onClick={()=>{setDestination('room');setFreeLook(v=>!v);setTour(-1);}}>{freeLook?'Reset camera':'Look around'}</button><button onClick={()=>select('pitch')} disabled={failed}>To the pitch ↗</button><button onClick={()=>{setTour(0);select('about',true);}}>Take the tour</button><button aria-expanded={mapOpen} onClick={()=>setMapOpen(v=>!v)}>Room map</button></div>
   {mapOpen&&<div className="room-map"><div><strong>YOUR WAY AROUND</strong><button aria-label="Close room map" onClick={()=>setMapOpen(false)}>×</button></div><div className="map-floor">{(['about','projects','skills','contact'] as Destination[]).map((d,i)=><button key={d} style={{left:[16,35,64,83,66][i]+'%',top:[23,65,23,65,82][i]+'%'}} onClick={()=>select(d)} aria-label={'Go to '+d}>{i+1}</button>)}</div><p>1 About · 2 Projects · 3 Skills · 4 Contact</p></div>}

  </>}
  {hasPanel&&<section className={"room-panel panel-"+destination} ref={panel} role="dialog" aria-modal="false" aria-labelledby="panel-title" tabIndex={-1} key={destination}>
   <div className="panel-top"><span className="eyebrow">{destination==='about'?'01 / YOUR HOST':destination==='projects'?'02 / THE ANALYSIS DESK':destination==='skills'?'03 / THE GAME PLAN':'04 / THE NEXT CHAPTER'}</span><button className="panel-close" onClick={()=>select('room')} aria-label="Close section and return to room">×</button></div>
   {destination==='about'&&<div className="person-intro"><div className="person-cover"><span className="person-kicker">HELLO, I'M</span><strong className="person-name">Akash<br/>Ram<span>.</span></strong><span className="curiosity-sticker" aria-hidden="true">MADE OF<br/><b>curiosity</b><svg className="curiosity-smile" width="44" height="30" viewBox="0 0 44 30" fill="none"><path d="M8 14c5 15 24 15 29-1M13 6l1 4M30 5l-1 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg></span><div className="person-roles"><span>CS grad student</span><span>Full stack developer</span><span>Gen AI developer</span></div></div><p className="person-bio">I'm a computer science graduate student who enjoys building for the web, exploring AI, and getting the little design details right.</p><div className="person-actions"><button onClick={()=>select('projects')}>Explore my work <Arrow/></button><button onClick={()=>select('contact')}>Let's talk <Arrow/></button></div></div>}
   {destination==='projects'&&<div className="projects-content" role="region" aria-label="Project carousel" tabIndex={0} onKeyDown={e=>{if(e.key==='ArrowRight'){e.preventDefault();changeProject(project+1,1)}if(e.key==='ArrowLeft'){e.preventDefault();changeProject(project-1,-1)}}}><div className="project-switcher" role="group" aria-label="Choose a project">{projects.map((p,i)=><button key={p.name} onClick={()=>changeProject(i)} aria-label={'View '+p.name} aria-pressed={i===project}><span><small>VOL.</small>0{i+1}</span><b>{p.name}</b></button>)}</div><div className={"project-slide "+(slideDirection>0?"slide-next":"slide-prev")} key={project}><StoryCard className="project-feature"><div className="project-preview"><Image src={current.image} fill sizes="(max-width:767px) 90vw, 450px" alt={current.name+' preview'}/><span>0{project+1} / 05</span></div><p className="eyebrow project-category">{current.type.split(' / ')[1]}</p><h3>{current.name}</h3><p>{current.detail}</p><div className="tech-tags">{current.tags.slice(0,4).map(t=><StoryBadge key={t}>{t}</StoryBadge>)}</div><div className="project-links"><a href={current.url} target="_blank" rel="noopener noreferrer">Live project <Arrow/></a><a href={current.code} target="_blank" rel="noopener noreferrer">Source code <Arrow/></a></div></StoryCard></div><div className="project-pagination"><button onClick={()=>changeProject(project-1,-1)} aria-label="Previous project">←</button><span><span className="project-count" role="status" aria-live="polite">0{project+1}<i/>0{projects.length}</span></span><button onClick={()=>changeProject(project+1,1)} aria-label="Next project">→</button></div></div>}
   {destination==='skills'&&<div className="skills-content formation-content">{SKILL_GROUPS.map((group,row)=><article className={"formation-line story-card squad-"+row} key={group.name}><header><span className="squad-icon" aria-hidden="true">{['</>','+','{ }'][row]}</span><h3>{group.name}</h3></header><div className="formation-skill-grid" data-columns={FORMATIONS[formation].columns[row]} style={{gridTemplateColumns:`repeat(${FORMATIONS[formation].columns[row]},minmax(0,1fr))`}}>{group.items.map((item,i)=><span key={item}><i aria-hidden="true">{String(i+1).padStart(2,'0')}</i>{item}</span>)}</div></article>)}</div>}
   {destination==='contact'&&<div className="contact-content"><p>Have an idea? Let's make it happen.</p><div className="contact-note"><span className="contact-note-label">DROP ME A LINE</span><div className="contact-email-row"><a className="contact-email" href={'mailto:'+EMAIL}>akashram.27csa<br/>@licet.ac.in <Arrow/></a><button className="copy-email" onClick={copy} aria-label={copied?'Email copied':'Copy email address'} title="Copy email address"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">{copied?<path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="1.5"/>:<><rect x="8" y="8" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M16 8V4H4v12h4" stroke="currentColor" strokeWidth="1.5"/></>}</svg></button></div><p role="status" className="copy-status">{copyError?'Please use the email link above.':copied?'Copied!':''}</p></div><div className="contact-socials"><a href="https://github.com/Ashaku7" target="_blank" rel="noopener noreferrer">GitHub <Arrow/></a><a href="https://www.linkedin.com/in/k-akash-ram-4802552ba/" target="_blank" rel="noopener noreferrer">LinkedIn <Arrow/></a><a href="https://wa.me/+919791011459" target="_blank" rel="noopener noreferrer">WhatsApp <Arrow/></a></div></div>}

  </section>}
  {tour>=0&&<div className="tour-controls tour-floating"><span>GUIDED TOUR / {tour+1} OF 4</span><button className="tour-next" onClick={nextStop}>{tour===3?'Finish tour':'Next stop'} <Arrow/></button><button aria-label="End guided tour" onClick={()=>setTour(-1)}>×</button></div>}
  <div className="stories-explored">{visited.length} / 4 STORIES EXPLORED</div>
 </main>;
}
