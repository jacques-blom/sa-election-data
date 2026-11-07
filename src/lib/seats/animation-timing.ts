/** Art frames have their own cadence; elapsed time keeps playback independent of display Hz. */
export function frameAt(elapsed: number, frames: readonly number[], durations: readonly number[], loop = false) {
  const total = durations.reduce((sum, duration) => sum + duration, 0);
  let time = Math.max(0, elapsed);
  if (loop) time %= total;
  for (let i = 0; i < frames.length; i++) {
    if (time < durations[i]!) return frames[i]!;
    time -= durations[i]!;
  }
  return frames[frames.length - 1]!;
}

export const walkoutDuration = 2600;
export function walkoutPose(elapsed: number, reducedMotion = false) {
  // Pause for recognition, then three measured strides into the doorway.
  const progress = Math.min(1, Math.max(0, (elapsed - 240) / 2160));
  if (reducedMotion) return { x: 205, frame: 1, visible: true, done: true };
  return {
    x: Math.round(116 + progress * 136),
    frame: progress === 0 || progress === 1 ? 1 : Math.floor((elapsed - 240) / 90) % 8,
    visible: progress < 1,
    done: elapsed >= walkoutDuration,
  };
}

export type PortraitMood = 'neutral' | 'happy' | 'sad';
export function portraitMood(selected: boolean, hasDeal: boolean): PortraitMood {
  return selected ? 'happy' : hasDeal ? 'sad' : 'neutral';
}
export const portraitFrames = { neutral: 0, happy: 2, sad: 3 } as const;

/** Separate cadences keep the cast from blinking or breathing in unison. */
export function spriteIdle(now: number, seed: number) {
  const cycle = 6200 + seed % 6 * 683;
  const phase = (Math.max(0, now) + seed * 1091) % cycle;
  return {
    blink: phase >= cycle - 180 && phase < cycle - 40,
    lift: phase >= cycle - 1050 && phase < cycle - 650 ? -1 : 0,
    gesture: phase >= cycle - 600 && phase < cycle - 300,
  };
}
