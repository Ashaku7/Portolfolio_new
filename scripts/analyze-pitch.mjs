import fs from 'node:fs';
import * as T from 'three';
const buf=fs.readFileSync('public/models/ronaldo-juggling.glb');const len=buf.readUInt32LE(12);const doc=JSON.parse(buf.subarray(20,20+len));const bin=buf.subarray(28+len);
const read=i=>{const a=doc.accessors[i],v=doc.bufferViews[a.bufferView],n={SCALAR:1,VEC3:3,VEC4:4,MAT4:16}[a.type];return Array.from(new Float32Array(bin.buffer,bin.byteOffset+(v.byteOffset||0)+(a.byteOffset||0),a.count*n));};
const nodes=doc.nodes.map(n=>{const o=new T.Object3D();o.name=n.name;if(n.translation)o.position.fromArray(n.translation);if(n.rotation)o.quaternion.fromArray(n.rotation);if(n.scale)o.scale.fromArray(n.scale);return o;});doc.nodes.forEach((n,i)=>n.children?.forEach(c=>nodes[i].add(nodes[c])));const root=new T.Group();doc.scenes[0].nodes.forEach(i=>root.add(nodes[i]));
const tracks=doc.animations[0].channels.map(c=>{const s=doc.animations[0].samplers[c.sampler],p={translation:'position',rotation:'quaternion',scale:'scale'}[c.target.path];return new (p==='quaternion'?T.QuaternionKeyframeTrack:T.VectorKeyframeTrack)(nodes[c.target.node].uuid+'.'+p,read(s.input),read(s.output));});const clip=new T.AnimationClip('motion',-1,tracks),mixer=new T.AnimationMixer(root),action=mixer.clipAction(clip);action.play();action.paused=true;
const ids={ball:68,leftFoot:55,rightFoot:60,leftKnee:56,rightKnee:61,leftThigh:57,rightThigh:62,neck:50,head:49};const rows=[];
for(let frame=0;frame<=503;frame++){action.time=frame/25;mixer.update(0);root.updateMatrixWorld(true);const row={frame};for(const [name,i]of Object.entries(ids))row[name]=nodes[i].getWorldPosition(new T.Vector3()).toArray();rows.push(row);}
fs.writeFileSync('artifacts/pitch-motion-samples.json',JSON.stringify({duration:clip.duration,rows}));
for(let i=3;i<500;i++){const r=rows[i],y=r.ball[1];if(y===Math.min(...rows.slice(i-3,i+4).map(r=>r.ball[1]))){const d=Object.keys(ids).filter(k=>k!=='ball').map(k=>[k,new T.Vector3(...r.ball).distanceTo(new T.Vector3(...r[k]))]).sort((a,b)=>a[1]-b[1]);console.log(i,(i/25).toFixed(2),'height',y.toFixed(3),d.slice(0,3));}}
console.log('Duration',clip.duration);for(let i=0;i<504;i+=25)console.log(i,rows[i].ball,rows[i].neck);
