'use client';

import { useEffect, useMemo } from 'react';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';

// Real stadium panorama: Sergej Majboroda / Poly Haven, CC0.
export default function StadiumEnvironment() {
  const turf = useMemo(() => {
    const size = 256, data = new Uint8Array(size * size * 4);
    let seed = 7;
    for (let i = 0; i < size * size; i++) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const n = seed / 4294967296;
      data.set([28 + n * 22, 48 + n * 36, 25 + n * 17, 255], i * 4);
    }
    const texture = new THREE.DataTexture(data, size, size);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(80, 80);
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.generateMipmaps = true;
    texture.needsUpdate = true;
    return texture;
  }, []);
  useEffect(() => () => turf.dispose(), [turf]);
  return <>
    <Environment files="/environments/stadium-01-2k.hdr" background
      backgroundIntensity={.23} environmentIntensity={.35} backgroundBlurriness={.025}
      backgroundRotation={[0, .65, 0]} environmentRotation={[0, .65, 0]} />
    <fog attach="fog" args={['#17252c', 18, 95]} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.03, 0]} receiveShadow>
      <planeGeometry args={[130, 130]} />
      <meshStandardMaterial map={turf} roughness={1} metalness={0} />
    </mesh>
    {Array.from({ length: 12 }, (_, i) => <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, -.027, (i - 6) * 10]} receiveShadow>
      <planeGeometry args={[68, 5]} />
      <meshStandardMaterial color="#548153" transparent opacity={.1} roughness={1} depthWrite={false} />
    </mesh>)}
    <group position={[0, -.022, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh><ringGeometry args={[9.1, 9.2, 128]} /><meshStandardMaterial color="#c6cec0" roughness={1} /></mesh>
      <mesh><planeGeometry args={[68, .10]} /><meshStandardMaterial color="#c6cec0" roughness={1} /></mesh>
      <mesh><circleGeometry args={[.12, 24]} /><meshStandardMaterial color="#c6cec0" roughness={1} /></mesh>
    </group>
    {[-1, 1].flatMap(x => [-1, 1].map(z => <group key={x + ':' + z} position={[x * 24, 14, z * 28]} rotation={[0, x * z * -.5, 0]}>
      <mesh position={[0, -7, 0]}><cylinderGeometry args={[.09, .2, 14, 8]} /><meshStandardMaterial color="#3c4b50" metalness={.7} roughness={.45} /></mesh>
      <mesh rotation={[.28 * z, 0, 0]}><boxGeometry args={[4, 1.1, .2]} /><meshStandardMaterial color="#c6e8ff" emissive="#c6e8ff" emissiveIntensity={4} /></mesh>
    </group>))}
    <hemisphereLight args={['#a5c7e2', '#34452b', .65]} />
    <spotLight position={[-6, 9, -6]} color="#dfedff" intensity={100} angle={.52} penumbra={.85} decay={2} />
    <spotLight position={[5, 8, 5]} color="#ffdda4" intensity={100} angle={.5} penumbra={.85} decay={2} />
  </>;
}
