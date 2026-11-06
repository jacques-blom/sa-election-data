import test from 'node:test';
import assert from 'node:assert/strict';

class ElementStub {
  value = ''; hidden = false; textContent = ''; href = '';
  dataset: Record<string, string> = {};
  listeners = new Map<string, Function[]>();
  fields = new Map<string, ElementStub>();
  addEventListener(name: string, listener: Function) { this.listeners.set(name, [...this.listeners.get(name) ?? [], listener]); }
  emit(name: string, event: object = {}) { this.listeners.get(name)?.forEach(listener => listener(event)); }
  querySelector(selector: string) { return this.fields.get(selector); }
  closest(selector: string) { return selector === '[data-builder-random]' ? this : null; }
}

test('directory controls filter immediately, preserve search after live refresh and pick only visible playable councils', async () => {
  const form = new ElementStub(), query = new ElementStub(), province = new ElementStub(), status = new ElementStub();
  const count = new ElementStub(), empty = new ElementStub(), random = new ElementStub();
  form.fields = new Map([['[name=q]', query], ['[name=province]', province], ['[name=status]', status]]);
  const card = (search: string, province: string, status: string) => Object.assign(new ElementStub(), {
    dataset: { search, province, status }, href: `/2026/places/${search.split(' ')[0]}/coalition`,
  });
  let cards = [card('cape town cpt', '9', 'reported'), card('knysna wc048', '9', 'estimated'), card('pending council', '3', 'pending')];
  const document = Object.assign(new ElementStub(), {
    querySelectorAll(selector: string) {
      return selector === '[data-builder-card]' ? cards : cards.filter(c => !c.hidden && c.dataset.status !== 'pending');
    },
  });
  document.fields = new Map([['#builder-search', form], ['[data-builder-count]', count], ['[data-builder-empty]', empty], ['[data-builder-random]', random]]);
  let navigated = '';
  const location = { href: 'http://localhost/majority-builder', assign(href: string) { navigated = href; } };
  Object.assign(globalThis, { document, Element: ElementStub, location,
    history: { replaceState(_state: unknown, _title: string, url: URL) { location.href = String(url); } },
  });
  await import('../src/lib/seats/directory-client.ts');
  assert.equal(count.textContent, '3 of 3 councils');
  assert.equal(random.hidden, false);
  query.value = 'WC048'; query.emit('input');
  assert.deepEqual(cards.map(c => c.hidden), [true, false, true]);
  assert.equal(new URL(location.href).searchParams.get('q'), 'WC048');
  document.emit('click', { target: random });
  assert.equal(navigated, cards[1]!.href);
  status.value = 'reported'; status.emit('change');
  assert.equal(empty.hidden, false);
  assert.equal(random.hidden, true);
  status.value = 'pending'; status.emit('change');
  assert.equal(count.textContent, '1 of 3 councils', 'pending includes current estimates');
  cards = [card('cape town cpt', '9', 'reported'), card('knysna wc048', '9', 'reported'), card('pending council', '3', 'pending')];
  document.emit('results:updated');
  assert.equal(query.value, 'WC048');
  assert.equal(count.textContent, '0 of 3 councils', 'new reported allocation is filtered out without losing the search');
  assert.equal(query.listeners.get('input')?.length, 1, 'refreshes do not duplicate listeners');
  query.value = ''; status.value = ''; province.value = '3'; province.emit('change');
  assert.equal(count.textContent, '1 of 3 councils');
  assert.equal(random.hidden, true, 'pending council remains visible but cannot be randomly selected');
  let prevented = false;
  form.emit('submit', { preventDefault() { prevented = true; } });
  assert(prevented);
});
