import test from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';

test('walkouts cancel pending loads, preserve progress on refresh and stop for reduced motion', async () => {
  const view = new Window({ url: 'https://counted.co.za/2026/places/witzenberg/coalition' });
  let now = 0, reduced = false, nextFrame = 0;
  const queued = new Map<number, FrameRequestCallback>();
  const mediaListeners: Array<() => void> = [];
  const loads: Array<{ onload: (() => void) | null }> = [];
  class SpriteImage {
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    set src(_value: string) { loads.push(this); }
  }
  Object.defineProperty(view, 'matchMedia', { value: () => ({ get matches() { return reduced; }, addEventListener: (_name: string, fn: () => void) => mediaListeners.push(fn) }) });
  for (const [name, value] of Object.entries({ window: view, document: view.document, Image: SpriteImage,
    performance: { now: () => now }, requestAnimationFrame: (fn: FrameRequestCallback) => { queued.set(++nextFrame, fn); return nextFrame; },
    cancelAnimationFrame: (id: number) => queued.delete(id),
  })) Object.defineProperty(globalThis, name, { value, configurable: true });
  const { document } = view;
  document.body.innerHTML = '<dialog><figure data-twist-scene><canvas width="256" height="96"></canvas></figure></dialog>';
  const dialog = document.querySelector('dialog')!;
  const canvas = document.querySelector('canvas')!;
  const draws: unknown[][] = [];
  const context = { imageSmoothingEnabled: true, clearRect() {}, drawImage(...args: unknown[]) { draws.push(args); }, save() {}, restore() {}, beginPath() {}, rect() {}, clip() {}, fillRect() {}, fillStyle: '' };
  Object.defineProperty(canvas, 'getContext', { value: () => context });
  dialog.showModal();
  const { playWalkout, stopWalkout } = await import('../src/lib/seats/walkout-animation.ts');
  try {
    const actors = [{ name: 'DA', cell: 1 }];
    const pending = playWalkout(canvas as unknown as HTMLCanvasElement, actors, true);
    stopWalkout();
    loads.forEach(img => img.onload?.());
    await pending;
    assert.equal(draws.length, 0, 'cancelled image loads cannot start a late scene');
    await playWalkout(canvas as unknown as HTMLCanvasElement, actors, true);
    assert.equal(queued.size, 1);
    assert.equal(context.imageSmoothingEnabled, false);
    const initialX = draws.at(-1)![5] as number;
    now = 1000;
    await playWalkout(canvas as unknown as HTMLCanvasElement, actors, false);
    assert.ok((draws.at(-1)![5] as number) > initialX, 'a refresh retains the existing scene clock');
    assert.equal(queued.size, 1, 'refresh cannot create duplicate animation loops');
    reduced = true; mediaListeners.forEach(fn => fn());
    assert.equal(queued.size, 0);
    assert.equal(canvas.dataset.sceneState, 'complete');
    assert.equal(draws.at(-1)![5], 173, 'reduced motion keeps the actor visible at the doorway');
    await playWalkout(canvas as unknown as HTMLCanvasElement, [{ name: 'WP' }], true);
    assert.equal(draws.at(-1)![0], loads[2], 'a party without a leader uses the anonymous delegate atlas');
    assert.equal(draws.at(-1)![2], 0);
    stopWalkout();
    assert.equal(queued.size, 0);
  } finally { stopWalkout(); await view.happyDOM.close(); }
});
