import {cinematicProgress,CELEBRATION_SECONDS} from './celebration';
// Contact frames measured from the supplied 25 fps juggling capture.
// Anatomical left/right follow Ronaldo, not the viewer.
export type Target = 'leftFoot'|'rightFoot'|'leftThigh'|'rightThigh'|'head'|'neck';
export type Status = 'lobby'|'countdown'|'playing'|'paused'|'gameover'|'celebrating'|'celebrated';
export type Cue = {target:Target;time:number;end?:number};
const foot: [number,Target][]=[[4,'leftFoot'],[19,'rightFoot'],[34,'leftFoot'],[47,'rightFoot'],[61,'leftFoot'],[83,'rightThigh'],[98,'leftThigh'],[113,'rightThigh'],[133,'leftThigh'],[156,'rightThigh'],[174,'leftFoot'],[197,'rightFoot'],[210,'head'],[217,'head'],[225,'head'],[234,'head'],[240,'head'],[252,'head'],[270,'head'],[280,'head'],[290,'head'],[310,'neck'],[354,'leftFoot'],[364,'leftFoot'],[382,'rightFoot'],[398,'leftFoot'],[414,'rightFoot'],[426,'leftFoot'],[437,'rightFoot'],[452,'leftFoot'],[466,'rightFoot'],[476,'leftFoot'],[492,'rightFoot']];
export const CUES:Cue[]=foot.map(([f,target])=>({time:f/25,target,...(target==='neck'?{end:334/25}:{})}));
export const LABELS:Record<Target,string>={leftFoot:'Left foot',rightFoot:'Right foot',leftThigh:'Left thigh',rightThigh:'Right thigh',head:'Header',neck:'Neck balance'};
export class PitchGame {
 status:Status='lobby';beforePause:Status='playing';time=0;score=0;round=1;index=0;hit=false;holding=false;countdown=3;reason='';feedback='';best=0;mode:'juggle'|'celebrate'='juggle';
 celebrationShown=0;celebrationProgress=0;celebrationAuto=false;celebrationElapsed=0;celebrationRun=0;
 get cue(){return CUES[this.index];}
 get speed(){return Math.min(.8,.35+Math.floor(this.score/10)*.025);}
 get window(){return this.cue?.target==='head'?.115:.17;}
 get active(){return this.status==='playing';}
 get canHit(){return this.active&&!!this.cue&&!this.hit&&Math.abs(this.time-this.cue.time)<=this.window;}
 start(){this.celebrationAuto=false;this.mode='juggle';this.status='countdown';this.time=0;this.score=0;this.round=1;this.index=0;this.hit=false;this.holding=false;this.countdown=3;this.reason='';this.feedback='';}
 celebrate(auto=false){this.celebrationShown=0;this.celebrationAuto=auto;this.celebrationElapsed=0;this.celebrationRun++;this.celebrationProgress=0;this.mode='celebrate';this.status='celebrating';this.time=0;this.holding=false;}
 scrub(progress:number){if(this.mode!=='celebrate')return;this.celebrationAuto=false;this.celebrationProgress=Math.max(0,Math.min(1,progress));this.status=this.celebrationProgress>=1?'celebrated':'celebrating';}
 lobby(){this.celebrationAuto=false;this.mode='juggle';this.status='lobby';this.time=0;this.holding=false;}
 fail(reason:string){if(!this.active)return;this.reason=reason;this.status='gameover';this.holding=false;}
 award(){this.score++;this.best=Math.max(this.best,this.score);this.feedback='Clean touch';}
 press(target:Target){
  if(!this.active)return;
  if(this.holding){this.fail('Keep holding through the neck balance.');return;}
  if(!this.cue||this.hit){this.fail('One touch for each contact.');return;}
  if(target!==this.cue.target){this.fail('Wrong contact. Watch the highlighted body part.');return;}
  if(!this.canHit){this.fail('Too early. Tap when the ring lights up.');return;}
  this.hit=true;if(target==='neck'){this.holding=true;this.feedback='Hold steady';}else this.award();
 }
 release(){if(this.active&&this.holding&&this.cue?.end&&this.time<this.cue.end){this.fail('Released too early. Hold until the neck balance finishes.');}this.holding=false;}
 pause(){if(this.mode==='celebrate'){this.celebrationAuto=false;return;}if(!['playing','countdown'].includes(this.status))return;this.beforePause=this.status;if(this.holding){this.time=this.cue.time-this.window*.5;this.hit=false;this.holding=false;}this.status='paused';}
 resume(){if(this.status==='paused')this.status=this.beforePause;}
 tick(dt:number,duration=20.12){
  if(this.status==='countdown'){this.countdown-=dt;if(this.countdown<=0)this.status='playing';return;}
  if(this.mode==='celebrate'){if(this.celebrationAuto){this.celebrationElapsed+=dt;this.celebrationProgress=cinematicProgress(this.celebrationElapsed);if(this.celebrationElapsed>=CELEBRATION_SECONDS){this.celebrationAuto=false;this.status='celebrated';}}return;}
  if(!this.active)return;
  this.time+=dt*this.speed;const c=this.cue;
  if(c){
   if(!this.hit&&this.time>c.time+this.window){this.fail('Missed '+LABELS[c.target].toLowerCase()+'.');return;}
   if(this.hit&&this.time>(c.end??c.time+this.window)){
    if(c.end){if(!this.holding){this.fail('Keep holding until the release cue.');return;}this.holding=false;this.award();this.feedback='Balance complete';}
    this.index++;this.hit=false;
   }
  }
  if(this.time>=duration){this.time=0;this.index=0;this.hit=false;this.round++;this.feedback='Next round';}
 }
}
