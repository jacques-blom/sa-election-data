import test from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';

test('the visible cast idles, new quotes react once, and hidden/reduced-motion sprites sleep', async () => {
  const view = new Window({ url: 'https://counted.co.za/2026/places/witzenberg/coalition' });
  let now = 0, reduced = false, hidden = false, nextTimer = 0;
  const queued = new Map<number, () => void>();
  const observed = new Set<Element>();
  const mediaListeners: Array<() => void> = [];
  let intersect: (entries: Array<{ target: Element; isIntersecting: boolean }>) => void = () => { throw new Error('Observer not initialised'); };
  class Observer {
    constructor(callback: typeof intersect) { intersect = callback; }
    observe(element: Element) { observed.add(element); }
    unobserve(element: Element) { observed.delete(element); }
    disconnect() { observed.clear(); }
  }
  Object.defineProperties(view, {
    IntersectionObserver: { value: Observer },
    matchMedia: { value: () => ({ get matches() { return reduced; }, addEventListener: (_name: string, fn: () => void) => mediaListeners.push(fn) }) },
    setTimeout: { value: (fn: () => void) => { queued.set(++nextTimer, fn); return nextTimer; } },
    clearTimeout: { value: (id: number) => queued.delete(id) },
  });
  Object.defineProperty(view.document, 'hidden', { get: () => hidden });
  for (const [name, value] of Object.entries({ window: view, document: view.document, performance: { now: () => now } })) {
    Object.defineProperty(globalThis, name, { value, configurable: true });
  }
  view.document.body.innerHTML = `<main data-coalition>
    <span id="speaker" data-game-sprite="speaker" data-speaker data-pose="1"></span><span data-speaker-quote>First line.</span>
    <button data-coalition-party="a" aria-pressed="true"><span id="selected" data-game-sprite="leader"></span></button>
    <button data-coalition-party="b" aria-pressed="false"><span id="excluded" data-game-sprite="leader"></span></button>
    <section><span id="story-bird" data-game-sprite="speaker"></span><span id="cast-a" data-game-sprite="leader"></span><span id="cast-b" data-game-sprite="leader"></span><span id="badge" data-game-sprite="badge"></span></section>
    <dialog></dialog>
  </main>`;
  const root = view.document.querySelector('main')! as unknown as HTMLElement;
  const get = (id: string) => root.querySelector<HTMLElement>(`#${id}`)!;
  const quote = root.querySelector('[data-speaker-quote]')!;
  const step = (time: number) => {
    now = time;
    const callbacks = [...queued.values()]; queued.clear(); callbacks.forEach(fn => fn());
    assert.ok(queued.size <= 1, 'there is only one sprite clock');
  };
  const visibility = (isIntersecting: boolean) => intersect([...observed].map(target => ({ target, isIntersecting })));
  const { syncGameSprites, stopGameSprites } = await import('../src/lib/seats/sprite-animation.ts');
  try {
    syncGameSprites(root);
    assert.equal(queued.size, 0, 'offscreen sprites do not run timers');
    visibility(true);
    assert.equal(queued.size, 1);

    now = 100; quote.textContent = 'New line, same majority.'; syncGameSprites(root);
    step(200); assert.equal(get('speaker').dataset.frame, '1', 'new dialogue moves the gavel without a mood change');
    now = 250; syncGameSprites(root);
    step(600); assert.equal(get('speaker').dataset.frame, '3', 'an unchanged refresh cannot restart the gesture');
    now = 650; quote.textContent = 'Another line.'; syncGameSprites(root);
    step(740); assert.equal(get('speaker').dataset.frame, '1');
    quote.textContent = 'Latest line wins.'; syncGameSprites(root);
    assert.equal(get('speaker').dataset.frame, '3', 'rapid changes restart one gesture, not a queue');
    step(840); assert.equal(get('speaker').dataset.frame, '1');

    const seen = new Map(['speaker', 'selected', 'excluded', 'story-bird', 'cast-a', 'cast-b', 'badge'].map(id => [id, new Set<string>()]));
    let staggered = false;
    for (let time = 2000; time < 25000; time += 70) {
      step(time);
      for (const [id, frames] of seen) frames.add(id === 'badge' ? get(id).style.getPropertyValue('--sprite-lift') : get(id).dataset.frame!);
      if (get('selected').dataset.frame === '1' && get('excluded').dataset.frame !== '1') staggered = true;
    }
    for (const id of ['speaker', 'selected', 'excluded', 'story-bird', 'cast-a', 'cast-b']) assert.ok(seen.get(id)!.has('1'), `${id} blinks`);
    assert.ok(seen.get('selected')!.has('2') && seen.get('excluded')!.has('3'), 'blinks return to the correct inclusion mood');
    assert.ok(seen.get('story-bird')!.has('2'), 'the story bird also gestures');
    assert.deepEqual(seen.get('badge'), new Set(['0px', '-1px']), 'logos get a small lift, not invented facial frames');
    assert.ok(staggered, 'the cast does not blink in unison');

    visibility(false); assert.equal(queued.size, 0);
    visibility(true);
    hidden = true; view.document.dispatchEvent(new view.Event('visibilitychange'));
    assert.equal(queued.size, 0, 'hidden tabs sleep');
    hidden = false; view.document.dispatchEvent(new view.Event('visibilitychange'));
    assert.equal(queued.size, 1);

    reduced = true; mediaListeners.forEach(fn => fn());
    assert.equal(queued.size, 0);
    assert.equal(get('speaker').dataset.frame, '3');
    assert.equal(get('speaker').style.getPropertyValue('--speaker-y'), '50%');
    assert.equal(get('selected').dataset.frame, '2');
    assert.equal(get('excluded').dataset.frame, '3');
    assert.equal(get('story-bird').dataset.frame, '0');
    assert.equal(get('badge').style.getPropertyValue('--sprite-lift'), '0px');
    quote.textContent = 'Quietly updated.'; syncGameSprites(root);
    now = 31000; reduced = false; mediaListeners.forEach(fn => fn());
    assert.equal(get('speaker').dataset.frame, '3', 're-enabling motion does not replay a past quote');

    const dialog = root.querySelector('dialog')!;
    dialog.innerHTML = '<span data-game-sprite="leader" data-mood="sad"></span>';
    dialog.showModal(); syncGameSprites(root);
    assert.equal(queued.size, 0, 'the cast behind an open dialog sleeps');
    const cameo = dialog.firstElementChild!;
    intersect([{ target: cameo, isIntersecting: true }]);
    assert.equal(queued.size, 1);
    assert.equal((cameo as HTMLElement).dataset.frame, '3', 'outcome actors retain their outcome mood');
    dialog.close(); dialog.replaceChildren(); syncGameSprites(root);
    assert.ok(!observed.has(cameo), 'old roll portraits are released');
    assert.equal(queued.size, 1, 'the main cast resumes after the dialog closes');

    stopGameSprites();
    assert.equal(queued.size, 0); assert.equal(observed.size, 0);
  } finally { stopGameSprites(); await view.happyDOM.close(); }
});
