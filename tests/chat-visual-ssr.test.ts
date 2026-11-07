import test from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import { nextFixture } from './fixtures/chat-visual-next.ts';
import { artifactMarkup } from '../src/lib/chat/markup.server.ts';
import { enhanceSavedVisuals } from '../src/lib/chat/render.ts';
import { renderVisual } from '../src/lib/chat/visuals/render.ts';

test('all six new components render their actual initial view without browser globals', () => {
  const artifact = nextFixture();
  artifact.charts.bars!.table!.rows[0]!.values.share = 59.42868879304124;
  const previous = globalThis.document; Reflect.deleteProperty(globalThis, 'document');
  let html: string;
  try { html = artifactMarkup(artifact); } finally { Object.assign(globalThis, { document: previous }); }
  const window = new Window(), root = window.document.createElement('div'); root.innerHTML = html;
  const fresh = renderVisual(artifact, { document: window.document as unknown as Document, interactive: false });
  assert.equal(root.textContent, fresh.textContent, 'server text, rounding and default rows match the interactive renderer');
  assert.equal(root.querySelectorAll('[data-component]').length, 6);
  assert.equal(root.querySelectorAll('.cv-rank-row').length, 5);
  assert.equal(root.querySelectorAll('.cv-data-scroll tbody tr').length, 5);
  assert.equal(root.querySelectorAll('.cv-timeline>li').length, 3);
  assert.equal(root.querySelectorAll('.cv-grid').length, 3);
  assert.equal(root.querySelector('.cv-metric-value')!.textContent, '4');
  assert.equal(root.querySelectorAll('details[open]').length, 0);
  assert.doesNotMatch(root.textContent, /59\.42868879304124|Enable JavaScript to explore|First 10 of/);
  assert.ok(root.querySelector('.cv-map-svg'), 'maps reserve their final plot dimensions before geometry loads');
  assert.equal(root.querySelectorAll('.cv-map-controls select').length, 2);
  window.happyDOM.abort();
});

test('hydration preserves chart nodes and layout while activating tables, rankings and timelines', () => {
  const window = new Window(); Object.assign(globalThis, { document: window.document });
  const root = window.document.createElement('div'); root.innerHTML = artifactMarkup(nextFixture());
  const cards = [...root.querySelectorAll('[data-component]')];
  const initial = cards.map(n => ({ html: n.tagName, text: n.textContent, class: n.className }));
  enhanceSavedVisuals(root as unknown as HTMLElement);
  assert.deepEqual([...root.querySelectorAll('[data-component]')], cards, 'all component roots are retained');
  assert.deepEqual(cards.map(n => ({ html: n.tagName, text: n.textContent, class: n.className })), initial);
  assert.equal(root.querySelector('[data-saved-visual]'), null);
  const input = root.querySelector('input')!; assert.equal(input.disabled, false);
  input.value = 'Example 23'; input.dispatchEvent(new window.Event('input'));
  assert.equal(root.querySelectorAll('.cv-data-scroll tbody tr').length, 1);
  assert.match(root.querySelector('.cv-data-scroll tbody')!.textContent, /Example 23/);
  root.querySelector('.cv-rank-row')!.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  assert.equal(root.querySelector('.cv-rank-row')!.getAttribute('aria-pressed'), 'true');
  root.querySelector('[data-component=GovernmentTimeline]>button')!.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  assert.equal(root.querySelectorAll('.cv-timeline>li').length, 5);
  window.happyDOM.abort();
});
