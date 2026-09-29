import { MathUtils } from 'three';

// Every shot samples the same 87-frame capture, including its final pose.
export const CAPTURE_FRAMES = 87;
export const CAPTURE_FPS = 30;

const shots = [
  { at: 0, angle: Math.PI + .12, distance: 2.15, elevation: .02, targetX: 0, targetY: 1.22 },
  { at: .26, angle: Math.PI * .87, distance: 3.1, elevation: .38, targetX: 0, targetY: 1.03 },
  { at: .50, angle: Math.PI * .6, distance: 4.1, elevation: 1.20, targetX: 0, targetY: 1.16 },
  { at: .66, angle: Math.PI * .26, distance: 3.7, elevation: .52, targetX: 0, targetY: 1.36 },
  { at: .84, angle: Math.PI * .04, distance: 2.85, elevation: .08, targetX: 0, targetY: 1.05 },
  { at: 1, angle: Math.PI * .04, distance: 2.65, elevation: .02, targetX: 0, targetY: 1.03 },
];

export function getRonaldoShot(progress: number, aspect: number) {
  const p = MathUtils.clamp(progress, 0, 1);
  const next = shots.findIndex(shot => shot.at >= p);
  const end = shots[Math.max(1, next)];
  const start = shots[Math.max(0, next - 1)];
  const t = MathUtils.smoothstep(p, start.at, end.at);
  const mix = (a: number, b: number) => MathUtils.lerp(a, b, t);
  const portrait = aspect < 1;
  const distance = mix(start.distance, end.distance) * (portrait ? MathUtils.clamp(1 / aspect, 1.12, 1.65) : 1);
  const elevation = mix(start.elevation, end.elevation);
  const horizontal = Math.cos(elevation) * distance;
  const angle = mix(start.angle, end.angle);
  const targetX = portrait ? 0 : mix(start.targetX, end.targetX);
  const targetY = mix(start.targetY, end.targetY) + (portrait ? .16 : 0);
  // Uniform pacing avoids accelerating through the middle of the capture.
  const capture = MathUtils.clamp((p - .03) / .94, 0, 1) * (CAPTURE_FRAMES - 1);
  const frame = Math.round(capture);
  return {
    frame,
    time: capture / CAPTURE_FPS,
    camera: [targetX + Math.sin(angle) * horizontal, targetY + Math.sin(elevation) * distance, Math.cos(angle) * horizontal] as const,
    target: [targetX, targetY, 0] as const,
  };
}
