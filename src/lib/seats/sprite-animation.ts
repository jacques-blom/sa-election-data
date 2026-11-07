import { frameAt, portraitFrames, portraitMood, spriteIdle, type PortraitMood } from './animation-timing.ts';

type SpriteState = {
  seed: number;
  pose?: string;
  quote?: string;
  speakerReaction?: { start: number; kind: 'pose' | 'quote' };
  portraitReaction?: { start: number; mood: PortraitMood };
};
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
let screen: HTMLElement | null = null;
let timer: number | undefined;
let nextSeed = 0;
const sprites = new Map<HTMLElement, SpriteState>();
const visible = new Set<HTMLElement>();
const observer = new window.IntersectionObserver(entries => {
  for (const entry of entries) {
    const element = entry.target as HTMLElement;
    if (!sprites.has(element)) continue;
    if (entry.isIntersecting) visible.add(element);
    else visible.delete(element);
  }
  tick();
});

function paintFrame(element: HTMLElement, frame: number) {
  if (element.dataset.frame !== String(frame)) {
    element.dataset.frame = String(frame);
    element.style.setProperty('--frame-x', `${frame * 100 / 3}%`);
  }
}
function paintProperty(element: HTMLElement, name: string, value: string) {
  if (element.style.getPropertyValue(name) !== value) element.style.setProperty(name, value);
}

function paint(element: HTMLElement, state: SpriteState, now: number, hasDeal: boolean, still = false) {
  const idle = still ? { blink: false, lift: 0, gesture: false } : spriteIdle(now, state.seed);
  paintProperty(element, '--sprite-lift', `${idle.lift}px`);
  if (element.dataset.gameSprite === 'badge') return;
  if (element.dataset.gameSprite === 'leader') {
    const button = element.closest<HTMLButtonElement>('[data-coalition-party]');
    const mood = button ? portraitMood(button.getAttribute('aria-pressed') === 'true', hasDeal)
      : element.dataset.mood === 'happy' ? 'happy' : element.dataset.mood === 'sad' ? 'sad' : 'neutral';
    element.dataset.mood = mood;
    let frame: number = idle.blink ? 1 : portraitFrames[mood];
    const reaction = state.portraitReaction;
    if (!still && reaction?.mood === mood && now - reaction.start < 350) {
      frame = frameAt(now - reaction.start, mood === 'happy' ? [0, 1, 2] : [2, 0, 3], [80, 90, 180]);
    } else state.portraitReaction = undefined;
    paintFrame(element, frame);
    return;
  }

  const pose = element.dataset.pose ?? '0';
  let row = Number(pose), frame = pose === '0' ? 0 : 3;
  const reaction = state.speakerReaction;
  const elapsed = reaction ? now - reaction.start : Infinity;
  if (!still && reaction && elapsed < 900) {
    if (reaction.kind === 'pose' && pose !== '0') {
      frame = frameAt(elapsed, [0, 1, 2, 3], [140, 140, 380, 240]);
    } else {
      // A quick agenda/gavel gesture accompanies each genuinely new line.
      frame = pose === '0' ? frameAt(elapsed, [0, 2, 3, 2, 0], [70, 180, 130, 180, 340])
        : frameAt(elapsed, [3, 1, 2, 3], [70, 180, 180, 470]);
    }
    paintProperty(element, '--sprite-lift', '0px');
  } else {
    state.speakerReaction = undefined;
    // The idle row supplies closed eyelids and the small side-eye/paper pose.
    // Return to the current mood after blinking, including after a majority.
    if (idle.blink || idle.gesture) { row = 0; frame = idle.blink ? 1 : 2; }
  }
  paintProperty(element, '--speaker-y', `${row * 50}%`);
  paintFrame(element, frame);
}

function tick() {
  window.clearTimeout(timer);
  timer = undefined;
  if (!screen?.isConnected || document.hidden || motion.matches) return;
  const hasDeal = !!screen.querySelector('[data-coalition-party][aria-pressed="true"]');
  const dialog = screen.querySelector('dialog[open]');
  const now = performance.now();
  let awake = false;
  for (const element of visible) {
    if (!element.isConnected || dialog && !dialog.contains(element)) continue;
    const state = sprites.get(element);
    if (!state) continue;
    paint(element, state, now, hasDeal);
    awake = true;
  }
  // One shared clock; no work for offscreen casts, closed dialogs or hidden tabs.
  if (awake) timer = window.setTimeout(tick, 70);
}

export function syncGameSprites(root: HTMLElement, reactTo?: string) {
  if (screen !== root) { stopGameSprites(); screen = root; }
  const now = performance.now();
  const elements = new Set(root.querySelectorAll<HTMLElement>('[data-game-sprite]'));
  for (const element of sprites.keys()) if (!elements.has(element)) {
    observer.unobserve(element); visible.delete(element); sprites.delete(element);
  }
  const hasDeal = !!root.querySelector('[data-coalition-party][aria-pressed="true"]');
  for (const element of elements) {
    let state = sprites.get(element);
    if (!state) {
      state = { seed: nextSeed++ };
      sprites.set(element, state);
      observer.observe(element);
    }
    if (element.dataset.gameSprite === 'speaker') {
      const pose = element.dataset.pose ?? '0';
      const quote = element.hasAttribute('data-speaker') ? root.querySelector('[data-speaker-quote]')?.textContent ?? '' : '';
      if (!motion.matches && state.pose !== undefined && state.pose !== pose) state.speakerReaction = { start: now, kind: 'pose' };
      else if (!motion.matches && state.quote !== undefined && state.quote !== quote) state.speakerReaction = { start: now, kind: 'quote' };
      state.pose = pose; state.quote = quote;
    } else if (reactTo && element.closest<HTMLElement>('[data-coalition-party]')?.dataset.coalitionParty === reactTo && !motion.matches) {
      state.portraitReaction = { start: now, mood: portraitMood(element.closest('[aria-pressed]')?.getAttribute('aria-pressed') === 'true', hasDeal) };
    }
    // Initialise offscreen art too, without consuming its pending reaction.
    if (motion.matches) { state.speakerReaction = undefined; state.portraitReaction = undefined; }
    if (motion.matches || !visible.has(element)) paint(element, { ...state }, now, hasDeal, true);
  }
  tick();
}

export function stopGameSprites() {
  window.clearTimeout(timer); timer = undefined;
  observer.disconnect(); visible.clear(); sprites.clear(); screen = null; nextSeed = 0;
}
document.addEventListener('visibilitychange', tick);
motion.addEventListener('change', () => { if (screen) syncGameSprites(screen); });
window.addEventListener('pagehide', stopGameSprites);
window.addEventListener('pageshow', () => {
  const root = document.querySelector<HTMLElement>('[data-coalition]');
  if (root) syncGameSprites(root);
});
