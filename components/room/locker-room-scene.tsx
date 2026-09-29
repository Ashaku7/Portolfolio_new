'use client';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { Environment, Html, Lightformer, OrbitControls, RoundedBox, Text, useGLTF, useProgress, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { projects } from '@/lib/portfolio-data';
import { LaptopLid } from './room-interactions';
import { FORMATIONS,SKILL_GROUPS } from '@/lib/skill-formations';
import SportsCollection from './sports-collection';
import WallMemorabilia from './wall-memorabilia';
export type Destination = 'room' | 'about' | 'projects' | 'skills' | 'contact' | 'pitch';
type Props = { freeLook:boolean; formation:number; onFormation:(n:number)=>void; project:number; entered: boolean; destination: Destination; reduced: boolean; onReady: () => void; onProgress: (n:number) => void; onSelect: (s:Destination) => void; };
const metal = new THREE.MeshStandardMaterial({color:'#303432',metalness:.8,roughness:.32});
const brass = new THREE.MeshStandardMaterial({color:'#a4a3a0',metalness:.78,roughness:.35});
const cloth = new THREE.MeshStandardMaterial({color:'#ded8c7',roughness:1});
const aluminum=new THREE.MeshStandardMaterial({color:'#9caaaF',metalness:.85,roughness:.32});
const dark = new THREE.MeshStandardMaterial({color:'#232326',roughness:.8});
const floorFinish:THREE.MeshStandardMaterial['onBeforeCompile']=(shader)=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\nfloat stoneLuma=dot(diffuseColor.rgb,vec3(.299,.587,.114));diffuseColor.rgb=mix(vec3(stoneLuma),vec3(.17,.19,.18),.72);');};
const glow = new THREE.MeshBasicMaterial({color:'#ffe5b4',toneMapped:false});
function Block({p,s,m,r=0.018,rotation}: {p:[number,number,number];s:[number,number,number];m:THREE.Material;r?:number;rotation?:[number,number,number]}) {
 return <RoundedBox args={s} radius={Math.min(r,Math.min(...s)*.4)} smoothness={2} position={p} rotation={rotation} castShadow receiveShadow material={m} />;
}
function Label({children,p,size=.1,color='#efede9',rotate=0}: {children:string;p:[number,number,number];size?:number;color?:string;rotate?:number}){
 return <Text position={p} rotation={[0,rotate,0]} font="/fonts/room-ui.ttf" fontSize={size} color={color} anchorX="center" anchorY="middle" outlineWidth={0}>{children}</Text>;
}
function Pin({p,title,select,visible}: {p:[number,number,number];title:string;select:()=>void;visible:boolean}) {
 if(!visible)return null;
 return <Html position={p} center zIndexRange={[15,5]}><button className="room-pin ripple-pin" aria-label={title} onClick={select}><span className="pin-ripples" aria-hidden="true"><i/><i/><b/></span><span className="pin-title" aria-hidden="true">{title}</span></button></Html>;
}
function Jersey({p,color,name,number}: {p:[number,number,number];color:string;name:string;number:string}){

 const fabric=useMemo(()=>{const positions:number[]=[],uvs:number[]=[],indices:number[]=[];const rows=80,cols=64;
  for(let side=0;side<2;side++)for(let row=0;row<=rows;row++){const y=-.52+row/rows*.95;const width=y<.09?.285+.012*Math.cos(y*8):y<.16?.285+(y-.09)/.07*.23:y<.27?.515:.515-(y-.27)/.16*.23;
   for(let col=0;col<=cols;col++){const u=col/cols;const x=(u-.5)*2*width;const neckline=row>72?Math.max(0,1-Math.abs(x)/.13)*.10*((row-72)/8):0;const fold=(Math.sin(x*39+y*3)*.017+Math.sin(x*69-y*6)*.005)*(1-row/rows*.5)+Math.sin(y*18+Math.abs(x)*7)*.006;positions.push(x,y-neckline+Math.sin(x*21)*.006*(1-row/rows),(side===0?1:-1)*(.032+Math.cos((u-.5)*Math.PI)*.035)+fold);uvs.push(u,row/rows);}}
  const layer=(rows+1)*(cols+1);for(let side=0;side<2;side++)for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){const a=side*layer+row*(cols+1)+col,b=a+1,c=a+cols+1,d=c+1;if(side===0)indices.push(a,b,d,a,d,c);else indices.push(a,d,b,a,c,d);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();return g;},[]);
 useEffect(()=>()=>fabric.dispose(),[fabric]);
 const weave=useMemo(()=>{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d')!;g.fillStyle='#888';g.fillRect(0,0,256,256);for(let y=0;y<256;y+=3)for(let x=0;x<256;x+=3){g.fillStyle=(x+y)%2?'#aaa':'#666';g.fillRect(x,y,1,2);}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(5,5);return t;},[]);
 const mat=useMemo(()=>new THREE.MeshPhysicalMaterial({color,roughness:.83,sheen:.3,sheenColor:new THREE.Color('#ae6557'),sheenRoughness:.85,bumpMap:weave,bumpScale:.0012,side:THREE.DoubleSide}),[color,weave]);
 useEffect(()=>()=>{mat.dispose();weave.dispose()},[mat,weave]);
 return <group position={p}>
  <mesh position={[0,.45,-.04]}><torusGeometry args={[.065,.009,6,20,Math.PI*1.55]}/><primitive object={brass} attach="material" /></mesh>
  <mesh rotation={[0,0,Math.PI/2]} position={[0,.34,-.03]}><cylinderGeometry args={[.014,.014,.65,8]}/><primitive object={brass} attach="material" /></mesh>
  <mesh castShadow receiveShadow geometry={fabric} material={mat}/>
  <mesh position={[0,.367,.06]} scale={[1,.57,1]}><torusGeometry args={[.105,.014,8,40]}/><meshStandardMaterial color="#701b19" roughness={.9}/></mesh>
  <mesh position={[0,-.505,.048]}><boxGeometry args={[.565,.012,.012]}/><meshStandardMaterial color="#651c1a" roughness={1}/></mesh>
  <Label p={[0,.22,.094]} size={.065}>{name}</Label>
  <Text position={[0,-.04,.095]} font="/fonts/room-display.ttf" fontSize={.38} color="#dfcca0">{number}</Text>
  <Label p={[0,-.32,.095]} size={.029}>THE CLUBHOUSE</Label>
 </group>;
}
function Boots({p}: {p:[number,number,number]}){
 return <group position={p}>{[-.12,.12].map((x)=><group key={x} position={[x,0,0]} rotation={[0,x*1.8,0]}>
 <Block p={[0,.055,.04]} s={[.14,.085,.32]} m={dark} r={.05}/><Block p={[0,.115,-.035]} s={[.135,.13,.16]} m={dark} r={.05}/>
 {[-.045,0,.045].map(z=><Block key={z} p={[0,.105,z+.035]} s={[.085,.007,.012]} m={cloth} r={.002}/>)}
 {[-.045,.045].map(a=>[-.08,.04,.14].map(b=><mesh key={a+','+b} position={[a,.005,b]}><cylinderGeometry args={[.009,.011,.02,6]}/><primitive object={brass} attach="material" /></mesh>))}
 </group>)}</group>;
}
function Bottle({p}: {p:[number,number,number]}){return <group position={p}><mesh castShadow position={[0,.13,0]}><cylinderGeometry args={[.052,.052,.26,20]}/><meshStandardMaterial color="#a8aca1" metalness={.7} roughness={.28}/></mesh><mesh position={[0,.278,0]}><cylinderGeometry args={[.037,.04,.035,16]}/><primitive object={dark} attach="material" /></mesh><mesh position={[0,.303,0]}><cylinderGeometry args={[.014,.014,.02,12]}/><primitive object={brass} attach="material" /></mesh></group>}
function Locker({x,name,number,select,featured=false}: {x:number;name:string;number:string;select:()=>void;featured?:boolean}) {
 return <group position={[x,0,-2.85]} onClick={e=>{e.stopPropagation();if(e.delta<5)select();}}>
 <Label p={[0,3,.454]} size={.078}>{name + ' / ' + number}</Label>
 <Jersey p={[0,1.91,-.02]} name={name} number={number} color={featured?'#9c1919':'#303237'}/>
 <Boots p={[-.27,.72,.13]}/><Bottle p={[.46,.72,.12]}/>
 {[0,1,2].map(i=><Block key={i} p={[.34,.25+i*.055,.12]} s={[.43,.05,.38]} m={cloth} r={.022}/>)}
 </group>;
}
function Board({select,formation,onFormation,active}: {select:()=>void;formation:number;onFormation:(n:number)=>void;active:boolean}) {
 const texture=useMemo(()=>{const c=document.createElement('canvas');c.width=1400;c.height=920;const g=c.getContext('2d')!;g.fillStyle='#1c3434';g.fillRect(0,0,c.width,c.height);g.strokeStyle='#b9cbb76b';g.lineWidth=3;g.strokeRect(38,135,1324,742);g.beginPath();g.moveTo(38,508);g.lineTo(1362,508);g.stroke();g.beginPath();g.arc(700,508,115,0,Math.PI*2);g.stroke();g.strokeRect(450,135,500,85);g.strokeRect(450,792,500,85);g.font='bold 45px Arial';g.fillStyle='#f4e7cf';g.fillText('THE GAME PLAN',55,75);g.font='32px Arial';g.fillText(FORMATIONS[formation].name,1200,73);
 SKILL_GROUPS.forEach((group,row)=>{const cols=FORMATIONS[formation].columns[row];const y=250+row*240;g.fillStyle='#d8c39b';g.font='bold 19px Arial';g.fillText(group.name.toUpperCase(),60,y-75);for(let col=0;col<cols;col++){const x=130+col*(1140/(cols-1));g.fillStyle=['#bb6b50','#c5ae76','#9caeac'][row];g.beginPath();g.arc(x,y,25,0,Math.PI*2);g.fill();g.fillStyle='#192d31';g.font='bold 21px Arial';g.textAlign='center';g.fillText(String(col+1),x,y+7);g.fillStyle='#f1e9da';g.font='20px Arial';group.items.filter((_,i)=>i%cols===col).forEach((item,i)=>g.fillText(item,x,y+53+i*27));g.textAlign='left';}});const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;},[formation]);
 useEffect(()=>()=>texture.dispose(),[texture]);
 return <group position={[2.02,2,-3.23]} onClick={e=>{e.stopPropagation();select();}}>
 <Block p={[0,0,0]} s={[2.55,1.67,.1]} m={metal}/>
 <mesh position={[0,0,.061]}><planeGeometry args={[2.39,1.49]}/><meshStandardMaterial map={texture} roughness={.78}/></mesh>
 <Block p={[0,-.88,.045]} s={[2.3,.035,.11]} m={brass}/><Label p={[0,1.07,.06]} size={.1} color="#292b2e">THE GAME PLAN</Label>
 {active&&<Html position={[0,-1.08,.12]} center zIndexRange={[25,20]}><div className="board-formations" role="group" aria-label="Board formation">{FORMATIONS.map((f,i)=><button key={f.name} aria-pressed={formation===i} onClick={e=>{e.stopPropagation();onFormation(i);}}>{f.name}</button>)}</div></Html>}
 </group>;
}
function Laptop({select,open,reduced,project}: {select:()=>void;open:boolean;reduced:boolean;project:number}) {
 const images=useTexture(projects.map(p=>p.image));
 return <group position={[-.75,.905,-.82]}>
 <group scale={1.2} rotation={[0,.1,0]} onClick={e=>{e.stopPropagation();if(e.delta<5)select();}}>
 <Block p={[0,0,0]} s={[.85,.038,.57]} m={aluminum}/><Block p={[0,.025,-.075]} s={[.71,.008,.25]} m={dark}/>
 {Array.from({length:5},(_,j)=>Array.from({length:12},(_,i)=><Block key={j*12+i} p={[-.32+i*.058,.032,-.175+j*.047]} s={[.046,.009,.035]} m={metal} r={.004}/>))}
 <Block p={[0,.024,.16]} s={[.27,.004,.135]} m={dark}/>
 <LaptopLid open={open} reduced={reduced}><Block p={[0,0,0]} s={[.85,.54,.03]} m={aluminum}/><Block p={[0,0,.018]} s={[.813,.50,.012]} m={dark}/>
 <mesh position={[0,.005,.027]}><planeGeometry args={[.773,.435]}/><meshBasicMaterial map={images[project]} toneMapped={false}/></mesh>
 <mesh position={[0,.243,.028]}><circleGeometry args={[.004,12]}/><meshStandardMaterial color="#071322" metalness={.8} roughness={.1}/></mesh><Label p={[0,-.241,.031]} size={.014} color="#cdd2d5">AKASH / WORKSTATION</Label>
 </LaptopLid><Block p={[0,.01,-.26]} s={[.66,.042,.045]} m={aluminum}/>
 {[-1,1].map(side=><group key={side}>{Array.from({length:12},(_,i)=><Block key={i} p={[side*.387,.027,-.16+i*.024]} s={[.012,.003,.009]} m={dark} r={.001}/>)}{[-.12,0,.12].map(z=><Block key={z} p={[side*.426,0,z]} s={[.002,.012,.047]} m={dark} r={.001}/>)}</group>)}
 </group>
 <Bottle p={[.85,-.005,-.12]}/><Block p={[-.78,.015,0]} s={[.32,.045,.4]} m={cloth}/>
 </group>;
}
function Phone({select}: {select:()=>void}){
 const {scene}=useGLTF('/old_telephone.glb');
 const phone=useMemo(()=>{
  const object=scene.clone(true);object.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(object),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
  const scale=.65/size.x;
  const mounted=new THREE.Group();mounted.scale.setScalar(scale);
  object.position.sub(new THREE.Vector3(center.x,bounds.min.y,center.z));
  object.traverse(child=>{if(child instanceof THREE.Mesh){child.castShadow=true;child.receiveShadow=true;}});
  mounted.add(object);return mounted;
 },[scene]);
 return <group name="Contact telephone" position={[3.6,.796,-1.55]} onClick={e=>{e.stopPropagation();select();}}>
  <primitive object={phone}/>
  <Label p={[0,.42,-.1]} size={.055}>LET'S TALK</Label>
 </group>;
}
const shots:Record<Destination,{p:number[];t:number[]}>= {
 pitch:{p:[4.8,1.7,-2],t:[4.8,1.7,-7]},room:{p:[4.8,2.45,8.4],t:[-.1,1.55,-1.55]},about:{p:[-2.8,2.05,4.2],t:[-2.8,1.7,-2.7]},projects:{p:[1.45,2.35,2.35],t:[-.65,1.08,-.8]},skills:{p:[2.5,2.4,.95],t:[2.02,1.95,-3.2]},contact:{p:[5,2.1,2.7],t:[3.55,1,-1.6]}
};
function CameraRig({entered,destination,reduced,freeLook}:{entered:boolean;destination:Destination;reduced:boolean;freeLook:boolean}){
 const {camera,invalidate,size,gl}=useThree();const look=useRef(new THREE.Vector3(0,1.4,-2));const moving=useRef(true);const offset=useRef(new THREE.Vector2());const target=useRef(new THREE.Vector3());const focus=useRef(new THREE.Vector3());
 useEffect(()=>{const shot=shots[destination];const mobile=size.width<768;target.current.fromArray(entered?shot.p:[.3,1.8,8.5]);focus.current.fromArray(entered?shot.t:[-.6,1.6,-2]);if(mobile&&destination==='room'){const distance=Math.max(11,6.6/(Math.tan(23*Math.PI/180)*(size.width/size.height)));target.current.set(.5,3.2,distance-1.4);focus.current.set(0,1.55,-1.4);}if(mobile&&destination!=='room'){target.current.z+=1.4;}moving.current=true;invalidate();},[entered,destination,size.width,size.height,invalidate,freeLook]);
 useEffect(()=>{if(reduced)return;const move=(event:PointerEvent)=>{if(event.pointerType==='touch'||destination!=='room'||!entered)return;offset.current.set((event.clientX/innerWidth-.5)*.22,(.5-event.clientY/innerHeight)*.08);moving.current=true;invalidate();};window.addEventListener('pointermove',move,{passive:true});return()=>window.removeEventListener('pointermove',move);},[entered,destination,reduced,invalidate]);
 useFrame((_,dt)=>{if(freeLook||!moving.current)return;const k=reduced?1:1-Math.exp(-dt*3);const goal=target.current.clone();if(entered&&destination==='room'&&!reduced){goal.x+=offset.current.x;goal.y+=offset.current.y;}camera.position.lerp(goal,k);look.current.lerp(focus.current,k);camera.lookAt(look.current);camera.updateMatrixWorld();gl.domElement.dataset.view=destination;if(camera.position.distanceTo(goal)>.002){invalidate();}else{moving.current=false;gl.domElement.dataset.settled=destination;}});
 return null;
}
function Architecture(){
 const {scene}=useGLTF('/models/room-architecture.glb');
 useEffect(()=>{scene.traverse(o=>{if(o instanceof THREE.Mesh){o.castShadow=false;o.receiveShadow=false;(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{m.toneMapped=false;if(m instanceof THREE.MeshBasicMaterial&&m.map)m.map.anisotropy=8;});}});},[scene]);
 return <primitive object={scene}/>;
}
function RoomGeometry({onReady,onSelect,entered,destination,reduced,freeLook,formation,onFormation,project}:Omit<Props,'onProgress'>){
 const photo=useTexture('/images/juggling-stadium.jpg');const {invalidate}=useThree();
 useEffect(()=>{onReady();invalidate()},[onReady,invalidate]);
 const pins=entered&&destination==='room'&&!freeLook;
 return <>
 <color attach="background" args={['#252529']}/>
 <CameraRig entered={entered} destination={destination} reduced={reduced} freeLook={freeLook}/>
 {freeLook&&<OrbitControls makeDefault target={[-.1,1.55,-1.55]} enablePan={false} minDistance={4.3} maxDistance={12} minPolarAngle={.95} maxPolarAngle={1.52} minAzimuthAngle={-.5} maxAzimuthAngle={.8} enableDamping dampingFactor={.08}/>}
 <ambientLight intensity={.24}/><hemisphereLight args={['#dbe6ee','#36241b',.38]}/><pointLight position={[-3.95,2.67,-2.24]} intensity={2.5} distance={3} decay={2} color="#ffe0b2"/><pointLight position={[-1.65,2.67,-2.25]} intensity={2.5} distance={3} decay={2} color="#ffcc92"/><pointLight position={[2.02,3,-2.8]} intensity={4} distance={3} decay={2} color="#ffd29b"/><pointLight position={[3.6,2.3,-1.5]} intensity={3} distance={3} decay={2} color="#ffcb90"/>
 <directionalLight position={[-3,5,4]} intensity={1.2} color="#ffe0b0" castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={7} shadow-camera-bottom={-6} shadow-normalBias={.035}/>
 <directionalLight position={[6,4,-6]} intensity={.55} color="#d8e5ff"/>
 <Environment resolution={128} frames={1}><Lightformer form="rect" intensity={2} color="#fff1e4" position={[0,5,0]} rotation={[Math.PI/2,0,0]} scale={[7,4,1]}/><Lightformer form="rect" intensity={1.4} color="#dae5ff" position={[6,2,0]} rotation={[0,Math.PI/2,0]} scale={[4,3,1]}/></Environment>
 <Architecture/>
 <WallMemorabilia/>
 <mesh rotation={[-Math.PI/2,0,0]} position={[0,.013,0]} receiveShadow><planeGeometry args={[12,10]}/><shadowMaterial transparent opacity={.23} depthWrite={false}/></mesh>
 <Locker x={-3.95} name="AKASH RAM" number="07" featured select={()=>onSelect('about')}/>
 <Label p={[-1.65,2.99,-2.40]} size={.095}>HOBBIES</Label>
 <Label p={[-2.85,3.65,-3.36]} size={.18} color="#292a2d">THE CLUBHOUSE</Label><Label p={[-2.85,3.4,-3.36]} size={.065} color="#686460">BUILT WITH CURIOSITY. MADE FOR PLAY.</Label>
 <Board select={()=>onSelect('skills')} formation={formation} onFormation={onFormation} active={entered&&destination==='skills'}/><Laptop select={()=>onSelect('projects')} open={destination==='projects'} reduced={reduced} project={project}/><Phone select={()=>onSelect('contact')}/>
 <Block p={[-3.75,.57,.8]} s={[.55,.12,.35]} m={cloth} r={.045}/><Boots p={[-2.1,.52,.8]}/>
 <group position={[-4.8,.2,.9]} rotation={[0,.3,0]}><Block p={[0,0,0]} s={[.75,.35,.4]} m={dark} r={.12}/>{[-.18,.18].map(x=><mesh key={x} position={[x,.21,0]} rotation={[0,Math.PI/2,0]}><torusGeometry args={[.14,.015,6,20,Math.PI]}/><primitive object={metal} attach="material"/></mesh>)}</group>
 <mesh position={[4.8,1.65,-7.55]} onClick={e=>{e.stopPropagation();onSelect('pitch');}}><planeGeometry args={[2,3.3]}/><meshBasicMaterial map={photo} toneMapped={false}/></mesh><Label p={[4.8,3.36,-3.39]} size={.087} color="#292a2d">TO THE PITCH</Label>
 <Pin p={[4.8,2.1,-3.3]} title="To the pitch" select={()=>onSelect('pitch')} visible={pins}/>
 <SportsCollection/>
 <Pin p={[-3.95,2.8,-2.25]} title="Your host" select={()=>onSelect('about')} visible={pins}/>
 <Pin p={[-.75,1.65,-.72]} title="The work" select={()=>onSelect('projects')} visible={pins}/>
 <Pin p={[2.02,2.95,-3.1]} title="The game plan" select={()=>onSelect('skills')} visible={pins}/>
 <Pin p={[3.6,1.42,-1.5]} title="Get in touch" select={()=>onSelect('contact')} visible={pins}/>


 </>;
}
function Progress({onProgress}:{onProgress:(n:number)=>void}){const {progress}=useProgress();useEffect(()=>onProgress(progress),[progress,onProgress]);return null;}
export default function LockerRoomScene(props:Props){
 return <Canvas shadows dpr={[1,1.65]} frameloop="demand" camera={{fov:46,position:[.3,1.8,8.5],near:.08,far:50}} gl={{antialias:true,alpha:false,powerPreference:'high-performance',toneMapping:THREE.ACESFilmicToneMapping,toneMappingExposure:1.05}} onCreated={({gl})=>{gl.shadowMap.type=THREE.PCFSoftShadowMap;}}>
 <Progress onProgress={props.onProgress}/><Suspense fallback={null}><RoomGeometry {...props}/></Suspense>
 </Canvas>;
}