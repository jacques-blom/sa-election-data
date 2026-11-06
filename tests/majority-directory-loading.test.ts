import test from 'node:test';
import assert from 'node:assert/strict';
import { observeBuilderSeats } from '../src/lib/seats/directory-seats-client.ts';

class Card {
  dataset: Record<string, string>;
  fields = new Map<string, Card>();
  textContent = ''; hidden = false; isConnected = true;
  attrs = new Map<string, string>();
  classList = { toggle() {} };
  constructor(id = '') { this.dataset = { council: id, loaded: 'false', status: 'pending' }; }
  querySelector(selector: string) {
    if (!this.fields.has(selector)) this.fields.set(selector, new Card());
    return this.fields.get(selector)!;
  }
  setAttribute(key: string, value: string) { this.attrs.set(key, value); }
  removeAttribute(key: string) { this.attrs.delete(key); }
}
class Observer {
  static latest: Observer;
  watched: Card[] = [];
  callback: (entries: { target: Card; isIntersecting: boolean }[]) => void;
  constructor(callback: Observer['callback']) { this.callback = callback; Observer.latest = this; }
  observe(card: Card) { this.watched.push(card); }
  unobserve(card: Card) { this.watched = this.watched.filter(c => c !== card); }
  disconnect() { this.watched = []; }
  reveal(cards: Card[]) { this.callback(cards.map(target => ({ target, isIntersecting: true }))); }
}
const tick = () => new Promise(resolve => setImmediate(resolve));

test('only visible cards load, batches are bounded, and live refresh rejects stale in-flight responses', async () => {
  let cards = Array.from({ length: 9 }, (_, i) => new Card(String(i + 1)));
  let updates = 0;
  const calls: string[][] = [];
  Object.assign(globalThis, { IntersectionObserver: Observer,
    document: { querySelectorAll: () => cards, dispatchEvent() { updates++; } },
    fetch: async (url: string) => {
      const ids = new URL(url, 'http://localhost').searchParams.get('councils')!.split(',');
      calls.push(ids);
      return { ok: true, async json() { return { councils: ids.filter(id => id !== '4').map(id => ({ id,
        status: id === '3' ? 'pending' : id === '2' ? 'reported' : 'estimated',
        total: id === '3' ? null : 10, majority: id === '3' ? null : 6 })) }; } };
    },
  });
  observeBuilderSeats();
  assert.equal(calls.length, 0);
  Observer.latest.reveal(cards);
  await tick();
  assert.deepEqual(calls.map(c => c.length), [8, 1]);
  assert.equal(updates, 2);
  assert.equal(cards[0]!.dataset.status, 'estimated');
  assert.equal(cards[0]!.querySelector('[data-builder-majority]').textContent, '6');
  assert.equal(cards[0]!.querySelector('[data-builder-wait]').hidden, true);
  assert.equal(cards[1]!.dataset.status, 'reported');
  assert.equal(cards[2]!.querySelector('[data-builder-seat-status]').textContent, 'Seats pending');
  assert.equal(cards[2]!.querySelector('[data-builder-target]').hidden, true);
  assert.equal(cards[3]!.querySelector('[data-builder-seat-status]').textContent, 'Open to check');
  assert.equal(cards[3]!.dataset.loaded, 'false', 'a failed read is not marked as an unavailable allocation');
  assert(cards.every(c => !c.attrs.has('aria-busy')));

  let finish!: (response: unknown) => void;
  let signal!: AbortSignal;
  Object.assign(globalThis, { fetch: (_url: string, options: { signal: AbortSignal }) => {
    signal = options.signal;
    return new Promise(resolve => { finish = resolve; });
  } });
  cards = [new Card('1')];
  observeBuilderSeats();
  const oldCard = cards[0]!;
  Observer.latest.reveal(cards);
  cards = [new Card('1')];
  observeBuilderSeats();
  assert(signal.aborted);
  finish({ ok: true, async json() { return { councils: [{ id: '1', status: 'reported', total: 10, majority: 6 }] }; } });
  await tick();
  assert.equal(oldCard.dataset.loaded, 'false');
  assert.equal(cards[0]!.dataset.loaded, 'false');
});
