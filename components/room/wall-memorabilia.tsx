'use client';
import {useTexture,Text} from '@react-three/drei';
import {useMemo} from 'react';
import * as THREE from 'three';
type V=[number,number,number];
const noHit=()=>null;
function Box({p,s,color='#272a2e'}:{p:V;s:V;color?:string}){return <mesh position={p} castShadow raycast={noHit}><boxGeometry args={s}/><meshStandardMaterial color={color} roughness={.65}/></mesh>}
function Print({position,rotation=0,stadium=false,small=false}:{position:V;rotation?:number;stadium?:boolean;small?:boolean}){
 const map=useTexture(stadium?'/room/posters/bernabeu.jpg':'/room/posters/ronaldo-madrid.jpg');
 const texture=useMemo(()=>{const t=map.clone();t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;t.needsUpdate=true;return t;},[map]);
 const w=stadium?1.6:small?.63:.9,h=stadium?1.35:small?1.43:1.85;
 return <group position={position} rotation={[0,rotation,0]} name={stadium?'Bernabeu framed print':'Ronaldo Madrid framed print'}>
  <Box p={[0,0,0]} s={[w+.07,h+.07,.065]}/><Box p={[0,0,.038]} s={[w,h,.015]} color="#efe9db"/>
  <mesh position={[0,.085,.049]} raycast={noHit}><planeGeometry args={[w-.1,stadium?(w-.1)*.75:(w-.1)*942/540]}/><meshBasicMaterial map={texture} toneMapped={false}/></mesh>
  <Text position={[0,-h/2+.065,.052]} font="/fonts/room-ui.ttf" fontSize={small?.027:.038} color="#27262a" raycast={noHit}>{stadium?'REAL MADRID / BERNABEU':'CRISTIANO RONALDO / 07'}</Text>
 </group>;
}
function Scarf({position,rotation=0}:{position:V;rotation?:number}){return <group position={position} rotation={[0,rotation,0]} name="Madrid supporter scarf">
 <Box p={[0,.05,0]} s={[1.52,.035,.05]} color="#b4a58b"/><Box p={[0,-.04,.045]} s={[1.4,.22,.025]} color="#e9e5dc"/>
 {[-.61,.61].map(x=><group key={x}><Box p={[x,-.33,.05]} s={[.19,.55,.028]} color="#ede9e0"/>{[-.17,-.28,-.39,-.5].map(y=><Box key={y} p={[x,y,.067]} s={[.19,.037,.006]} color="#31385a"/>)}{Array.from({length:7},(_,i)=><Box key={i} p={[x-.08+i*.027,-.64,.051]} s={[.009,.08,.012]} color="#d4c8a4"/>)}</group>)}
 <Text position={[0,-.04,.065]} font="/fonts/room-ui.ttf" fontSize={.068} color="#30385b" raycast={noHit}>HALA MADRID</Text>
 </group>}
function BallMount({position,rotation=0}:{position:V;rotation?:number}){const map=useTexture('/room/football.jpg');return <group position={position} rotation={[0,rotation,0]} name="Wall mounted football"><Box p={[0,0,0]} s={[.34,.45,.055]}/><Box p={[0,-.14,.19]} s={[.32,.035,.38]}/><mesh position={[0,.04,.24]} castShadow raycast={noHit}><sphereGeometry args={[.19,32,24]}/><meshStandardMaterial map={map} roughness={.8}/></mesh></group>}
function Pennant(){const shape=useMemo(()=>{const s=new THREE.Shape();s.moveTo(-.28,.4);s.lineTo(.28,.4);s.lineTo(.28,-.15);s.lineTo(0,-.43);s.lineTo(-.28,-.15);s.closePath();return s;},[]);return <group position={[3.62,2.18,-3.37]} name="Madrid wall pennant"><Box p={[0,.44,.02]} s={[.66,.025,.035]} color="#baa475"/><mesh raycast={noHit}><shapeGeometry args={[shape]}/><meshStandardMaterial color="#eee7d7" side={THREE.DoubleSide}/></mesh><Text position={[0,.17,.01]} font="/fonts/room-ui.ttf" fontSize={.07} color="#303953" raycast={noHit}>{'REAL'+String.fromCharCode(10)+'MADRID'}</Text><Text position={[0,-.12,.01]} font="/fonts/room-display.ttf" fontSize={.15} color="#b29a62" raycast={noHit}>07</Text></group>}
function FanCollage(){
 const photo=useTexture('/room/posters/ronaldo-portugal.jpg');
 return <group position={[5.79,2.15,-1.7]} rotation={[0,-Math.PI/2,0]} name="Portugal fan memory board">
 <Box p={[0,0,0]} s={[1.95,1.65,.07]} color="#9a8063"/>
 <Box p={[0,0,.04]} s={[1.85,1.55,.012]} color="#cdb998"/>
 <group position={[-.43,.04,.06]} rotation={[0,0,.08]}><Box p={[0,0,0]} s={[.73,1.25,.015]} color="#faf7ee"/><mesh position={[0,.05,.011]} raycast={noHit}><planeGeometry args={[.65,.943]}/><meshBasicMaterial map={photo} toneMapped={false}/></mesh><Text position={[0,-.51,.02]} font="/fonts/room-ui.ttf" fontSize={.037} color="#293536">PORTUGAL / 07</Text><Box p={[0,.62,.03]} s={[.21,.10,.008]} color="#e1cea7"/></group>
 <group position={[.48,.34,.075]} rotation={[0,0,-.07]}><Box p={[0,0,0]} s={[.69,.52,.016]} color="#f9f5e9"/><Text position={[0,.12,.02]} font="/fonts/room-ui.ttf" fontSize={.045} color="#2d3847">MATCHDAY</Text><Text position={[0,-.025,.02]} font="/fonts/room-display.ttf" fontSize={.13} color="#9c4637">SIUU!</Text><Text position={[0,-.17,.02]} font="/fonts/room-ui.ttf" fontSize={.025} color="#4c5555">ONE GAME. ALL HEART.</Text></group>
 <group position={[.46,-.35,.08]} rotation={[0,0,.04]}><Box p={[0,0,0]} s={[.66,.49,.015]} color="#314555"/><Text position={[0,.05,.02]} font="/fonts/room-display.ttf" fontSize={.16} color="#f6eddc">07</Text><Text position={[0,-.15,.02]} font="/fonts/room-ui.ttf" fontSize={.033} color="#f6eddc">FOREVER A FAN</Text></group>
 </group>;
}
function SignatureDisplay(){
 const signature=useMemo(()=>{
  const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=1024;
  const ctx=canvas.getContext('2d')!;
  ctx.fillStyle='#eee8db';ctx.fillRect(0,0,1536,1024);
  // Original autograph-inspired artwork, not an authenticated signature.
  ctx.strokeStyle='#20343b';ctx.lineWidth=10;ctx.lineCap='round';ctx.lineJoin='round';
  const strokes=[
   'M 660 250 C 560 160 300 245 255 425 C 215 610 470 575 590 440',
   'M 505 510 C 610 415 650 350 620 360 C 575 375 575 510 625 465 C 690 390 702 413 670 465 C 728 387 750 390 722 456 C 772 420 798 423 810 447',
   'M 680 650 C 740 495 842 290 925 240 C 985 205 965 303 877 370 C 1060 222 1235 273 1160 355 C 1095 427 944 437 847 433 C 965 442 1020 590 1170 562',
   'M 1040 484 C 1125 452 1162 425 1207 408 L 1120 548',
   'M 320 658 C 585 622 973 602 1220 589'
  ];
  strokes.forEach(d=>ctx.stroke(new Path2D(d)));
  const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;
 },[]);
 return <group position={[5.79,2.2,1.8]} rotation={[0,-Math.PI/2,0]} name="Cristiano signature tribute board">
 <Box p={[0,0,0]} s={[1.5,1.32,.09]} color="#252d30"/>
 <Box p={[0,0,.051]} s={[1.43,1.25,.018]} color="#b29b72"/>
 <Box p={[0,0,.065]} s={[1.4,1.22,.018]} color="#eee8db"/>
 <mesh position={[0,.04,.078]} raycast={noHit}><planeGeometry args={[1.29,.86]}/><meshStandardMaterial map={signature} roughness={.88}/></mesh>
 <Text position={[0,.5,.081]} font="/fonts/room-ui.ttf" fontSize={.027} letterSpacing={.2} color="#7b705b" raycast={noHit}>THE ICON / CR7</Text>
 <Box p={[0,-.4,.08]} s={[1.03,.003,.003]} color="#b29b72"/>
 <Text position={[0,-.48,.084]} font="/fonts/room-ui.ttf" fontSize={.044} letterSpacing={.08} color="#253840" raycast={noHit}>CRISTIANO RONALDO</Text>
 <Text position={[0,-.55,.084]} font="/fonts/room-ui.ttf" fontSize={.018} letterSpacing={.1} color="#7b705b" raycast={noHit}>A SIGNATURE OF GREATNESS</Text>
 </group>}
export default function WallMemorabilia(){return <group name="Football wall collection">
 <Print position={[-5.78,2.22,2.65]} rotation={Math.PI/2}/>
 <Print position={[-5.78,2.22,-2.25]} rotation={Math.PI/2} stadium/>
 <Scarf position={[-5.75,2.55,.05]} rotation={Math.PI/2}/>
 <BallMount position={[-5.73,1.37,.05]} rotation={Math.PI/2}/>
 <FanCollage/><SignatureDisplay/>
 <Scarf position={[5.8,2.6,.05]} rotation={-Math.PI/2}/>
 <BallMount position={[5.8,1.4,.05]} rotation={-Math.PI/2}/>
 <Pennant/>
 </group>}
