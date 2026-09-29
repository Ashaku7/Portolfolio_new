// A deliberate entrance, quick takeoff, slow airborne turn and decisive landing.
export const CELEBRATION_SECONDS=8.75;
const beats=[[0,0],[2.9,.42],[6.4,.66],[8.75,1]] as const;
export function cinematicProgress(seconds:number){
 const t=Math.max(0,Math.min(CELEBRATION_SECONDS,seconds));
 for(let i=1;i<beats.length;i++){const [end,p1]=beats[i];if(t<=end){const [start,p0]=beats[i-1];const x=(t-start)/(end-start);return p0+(p1-p0)*x;}}
 return 1;
}
export function celebrationPose(progress:number){
 const p=Math.max(0,Math.min(1,progress));const entrance=Math.min(1,p/.18);
 return {capture:p,entrance:entrance*entrance*(3-2*entrance),visible:p>.001};
}

export const CHANT_START=.82;
export const CHANT_TEXT='SIUUUUUUUUUUU!';
export function chantLetters(progress:number){return progress<CHANT_START?0:Math.min(CHANT_TEXT.length,Math.max(1,Math.ceil((progress-CHANT_START)/(1-CHANT_START)*CHANT_TEXT.length)));}
