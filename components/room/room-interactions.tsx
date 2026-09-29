'use client';
import { ReactNode, useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';
export function LockerDoor({open,reduced,onSelect}:{open:boolean;reduced:boolean;onSelect:()=>void}){
 const ref=useRef<THREE.Group>(null);const {invalidate}=useThree();useEffect(()=>invalidate(),[open,invalidate]);
 useFrame((_,dt)=>{if(!ref.current)return;const target=open?-1.48:0;ref.current.rotation.y=THREE.MathUtils.damp(ref.current.rotation.y,target,4,reduced?10:Math.min(dt,.05));if(Math.abs(ref.current.rotation.y-target)>.001)invalidate();});
 return <group ref={ref} position={[-3.52,1.74,-2.36]} onClick={e=>{e.stopPropagation();if(e.delta<5)onSelect();}}>
  <RoundedBox args={[1.30,2.04,.045]} position={[.65,0,0]} radius={.015} smoothness={2} castShadow><meshStandardMaterial color="#28282a" roughness={.66} metalness={.15}/></RoundedBox>
  <Text position={[.65,.6,.03]} font="/fonts/room-ui.ttf" fontSize={.075} color="#eeeae2">AKASH RAM</Text>
  <Text position={[.65,.12,.03]} font="/fonts/room-display.ttf" fontSize={.53} color="#f4f1eb">07</Text>
  <Text position={[.65,-.43,.03]} font="/fonts/room-ui.ttf" fontSize={.041} color="#b7b1a7">OPEN MY LOCKER</Text>
  <mesh position={[1.18,0,.065]}><boxGeometry args={[.027,.22,.07]}/><meshStandardMaterial color="#bcbab5" metalness={.85} roughness={.28}/></mesh>
 </group>;
}
export function LaptopLid({open,reduced,children}:{open:boolean;reduced:boolean;children:ReactNode}){
 const ref=useRef<THREE.Group>(null);const {invalidate}=useThree();useEffect(()=>invalidate(),[open,invalidate]);
 useFrame((_,dt)=>{if(!ref.current)return;const target=open?-.13:1.43;ref.current.rotation.x=THREE.MathUtils.damp(ref.current.rotation.x,target,4,reduced?10:Math.min(dt,.05));if(Math.abs(ref.current.rotation.x-target)>.001)invalidate();});
 return <group ref={ref} position={[0,0,-.25]} rotation={[1.43,0,0]}><group position={[0,.26,0]}>{children}</group></group>;
}
