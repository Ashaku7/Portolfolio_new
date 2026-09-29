import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const js=ts.transpileModule(fs.readFileSync('lib/celebration.ts','utf8')+'\n'+fs.readFileSync('lib/pitch-game.ts','utf8').replace(/^import .*celebration.*;\r?\n/,''),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.ES2020}}).outputText;
const {PitchGame,CUES,cinematicProgress,celebrationPose}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const g=new PitchGame();assert.equal(g.speed,.42);g.start();g.tick(3.1);assert.equal(g.status,'playing');
for(let n=0;n<CUES.length*2;n++){
 while(!g.canHit&&g.status==='playing')g.tick(.003);
 assert.equal(g.status,'playing','stays alive until a valid contact');const cue=g.cue;g.press(cue.target);
 if(cue.end){while(g.index===CUES.indexOf(cue)&&g.status==='playing')g.tick(.003);g.release();}
 else {while(g.hit&&g.status==='playing')g.tick(.003);}
 assert.equal(g.status,'playing');
}
assert.equal(g.score,66);assert.ok(g.speed>.42);assert.equal(g.round,2);
for(const type of ['miss','wrong','early','double','release']){const f=new PitchGame();f.start();f.tick(3.1);if(type==='miss')f.tick(1);if(type==='wrong')f.press('rightFoot');if(type==='early'){f.time=1;f.press('leftFoot');}if(type==='double'){f.time=.16;f.press('leftFoot');f.press('leftFoot');}if(type==='release'){f.index=CUES.findIndex(c=>c.target==='neck');f.time=f.cue.time;f.press('neck');f.release();}assert.equal(f.status,'gameover',type+' ends run');}
const p=new PitchGame();p.start();p.tick(3.1);p.pause();const time=p.time;p.tick(5);assert.equal(p.time,time);p.resume();assert.equal(p.status,'playing');p.celebrate();p.tick(4,2.9);assert.equal(p.time,0);p.scrub(1);assert.equal(p.status,'celebrated');p.scrub(.4);assert.equal(p.status,'celebrating');assert.equal(p.celebrationProgress,.4);p.celebrate();assert.equal(p.time,0);p.start();assert.equal(p.score,0);assert.equal(p.status,'countdown');
console.log('PASS: two complete rounds, all 33 contacts including neck hold, speed, five loss conditions, pause, celebration replay, restart.');

const movie=new PitchGame();movie.celebrate(true);movie.tick(2);assert.ok(movie.celebrationProgress>0);movie.scrub(.3);const still=movie.celebrationProgress;movie.tick(1);assert.equal(movie.celebrationProgress,still);movie.celebrate(true);movie.tick(10);assert.equal(movie.status,'celebrated');assert.equal(movie.celebrationProgress,1);movie.scrub(.2);assert.equal(movie.status,'celebrating');console.log('PASS cinematic playback, scroll takeover, finish and reverse');

assert.equal(celebrationPose(0).visible,false);assert.equal(celebrationPose(.18).capture,.18);assert.equal(celebrationPose(1).capture,1);assert.ok(cinematicProgress(2.6)-cinematicProgress(2.4)>cinematicProgress(4.9)-cinematicProgress(4.7));console.log('PASS hidden entrance and variable cinematic pace');

// Only the airborne segment is slower; the other segments never ease to a stop.
for(let t=.1;t<8.7;t+=.05)assert.ok(cinematicProgress(t+.01)-cinematicProgress(t)>.0005,'continuous cinematic motion');
const before=cinematicProgress(1.01)-cinematicProgress(1),after=cinematicProgress(8.01)-cinematicProgress(8),air=cinematicProgress(4.01)-cinematicProgress(4);
assert.ok(Math.abs(before-after)<.00001);assert.ok(air<before*.5);
console.log('PASS one airborne slowdown, continuous takeoff and landing');
