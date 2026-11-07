import { walkoutDuration, walkoutPose } from './animation-timing.ts';

export type WalkoutActor = { name: string; cell?: number };
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const assetRoot = '/images/coalition/';
const images = new Map<string, Promise<HTMLImageElement>>();
function image(file: string) {
  let pending = images.get(file);
  if (!pending) {
    pending = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img); img.onerror = () => { images.delete(file); reject(new Error(`Sprite unavailable: ${file}`)); };
      img.src = assetRoot + file;
    });
    images.set(file, pending);
  }
  return pending;
}
export function preloadWalkout() {
  void Promise.all(['council-chamber-v2.webp', 'leaders-walk-v4.webp', 'delegate-walk-v2.webp'].map(image)).catch(() => {});
}
let version = 0, frameRequest = 0;
let active: { canvas: HTMLCanvasElement; actors: WalkoutActor[]; started: number; animate: boolean; key: string; art: HTMLImageElement[] } | null = null;

export function stopWalkout() {
  version++; cancelAnimationFrame(frameRequest); active = null;
}
function draw(now: number) {
  if (!active || !active.canvas.isConnected) { stopWalkout(); return; }
  const { canvas, actors, started, animate, art } = active;
  if (document.hidden) return;
  const context = canvas.getContext('2d');
  if (!context) return;
  context.imageSmoothingEnabled = false;
  context.clearRect(0, 0, 256, 96);
  context.drawImage(art[0]!, 0, 0);
  let finished = true;
  for (const [index, actor] of actors.entries()) {
    const elapsed = animate ? now - started - index * 260 : walkoutDuration;
    const pose = walkoutPose(elapsed, motion.matches);
    if (!pose.done) finished = false;
    if (!pose.visible) continue;
    const sprite = actor.cell === undefined ? art[2]! : art[1]!;
    const row = actor.cell ?? 0;
    context.save();
    // The generated wooden door leaf and jamb are the foreground occluder.
    // No fading portraits or CSS door outlines: shoes and legs move in the art.
    context.beginPath(); context.rect(0, 0, 226, 96); context.clip();
    context.fillStyle = '#193b3240';
    context.fillRect(pose.x - 9, 83, 18, 2);
    context.drawImage(sprite, pose.frame * 64, row * 64, 64, 64, pose.x - 32, 26, 64, 64);
    context.restore();
  }
  canvas.dataset.sceneState = finished ? 'complete' : 'walking';
  if (!finished && !motion.matches) frameRequest = requestAnimationFrame(draw);
}

export async function playWalkout(canvas: HTMLCanvasElement, actors: WalkoutActor[], animate: boolean) {
  const key = JSON.stringify(actors);
  if (!animate && active?.canvas === canvas && active.key === key) { cancelAnimationFrame(frameRequest); draw(performance.now()); return; }
  stopWalkout();
  const ticket = version;
  try {
    const art = await Promise.all(['council-chamber-v2.webp', 'leaders-walk-v4.webp', 'delegate-walk-v2.webp'].map(image));
    if (ticket !== version || !canvas.isConnected || !canvas.closest('dialog')?.open) return;
    active = { canvas, actors: actors.slice(0, 4), started: performance.now(), animate, key, art };
    canvas.closest<HTMLElement>('[data-twist-scene]')!.hidden = false;
    draw(performance.now());
  } catch {
    // The labelled portrait cast and seat arithmetic remain the complete result.
    if (ticket === version) canvas.closest<HTMLElement>('[data-twist-scene]')!.hidden = true;
  }
}
document.addEventListener('visibilitychange', () => {
  cancelAnimationFrame(frameRequest);
  if (!document.hidden) draw(performance.now());
});
motion.addEventListener('change', () => { cancelAnimationFrame(frameRequest); draw(performance.now()); });
window.addEventListener('pagehide', stopWalkout);
