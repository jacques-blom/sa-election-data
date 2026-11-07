import test from 'node:test';
import assert from 'node:assert/strict';
import { setImmediate } from 'node:timers/promises';
import { Window } from 'happy-dom';

const settle = async () => { for (let i = 0; i < 4; i++) await setImmediate(); };
test('game picker keeps province browsing in the modal, navigates to councils and cancels stale searches', async () => {
  const view = new Window({ url: 'https://counted.co.za/2026/places/cape-town/coalition' });
  const originalFetch = globalThis.fetch;
  const restore: (() => void)[] = [];
  for (const name of ['window', 'document', 'Element', 'HTMLElement', 'HTMLDialogElement', 'Event', 'CustomEvent'] as const) {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, { configurable: true, value: name === 'window' ? view : view[name] });
    restore.push(() => descriptor ? Object.defineProperty(globalThis, name, descriptor) : Reflect.deleteProperty(globalThis, name));
  }
  const { document } = view;
  document.body.innerHTML = `
    <button data-coalition-picker-open="councils">Cape Town</button><button data-coalition-picker-open="provinces">Western Cape</button>
    <dialog data-coalition-picker data-current-province="9">
      <button data-picker-close>Close</button><h2 id="coalition-picker-title" tabindex="-1"></h2>
      <div data-place-search><input type="search"></div><p data-picker-status hidden></p>
      <div data-picker-browse><button data-picker-provinces><span data-picker-province-label></span></button><span data-picker-count></span>
        <div data-picker-province-list><button data-picker-province="" data-province-name="All provinces">All provinces</button><button data-picker-province="9" data-province-name="Western Cape">Western Cape</button><button data-picker-province="6" data-province-name="Northern Cape">Northern Cape</button></div>
        <div data-picker-councils><a data-picker-council="9006" data-province="9" href="/2026/places/cape-town/coalition">Cape Town</a><a data-picker-council="6605" data-province="6" href="/2026/places/hantam/coalition">Hantam</a></div>
      </div>
    </dialog>`;
  const dialog = document.querySelector('dialog')!;
  const search = document.querySelector('[data-place-search]')!;
  const status = document.querySelector('[data-picker-status]')!;
  const click = (selector: string) => document.querySelector<import('happy-dom').HTMLElement>(selector)!.click();
  const dispatch = (type: string, detail?: object) => search.dispatchEvent(new view.CustomEvent(type, { detail, cancelable: true, bubbles: true }));
  let response: () => Promise<Response> = async () => Response.json({ councils: [{ id: '6605' }] });
  const requests: unknown[] = [];
  globalThis.fetch = async (_url, init) => { requests.push(JSON.parse(init!.body as string)); return response(); };
  try {
    await import('../src/lib/seats/picker.ts');
    click('[data-coalition-picker-open="councils"]');
    assert.equal(dialog.open, true);
    assert.equal(document.querySelector<import('happy-dom').HTMLElement>('[data-picker-council="6605"]')!.hidden, true);
    click('[data-picker-close]');
    assert.equal(dialog.open, false);
    assert.equal(document.activeElement, document.querySelector('[data-coalition-picker-open="councils"]'));
    click('[data-coalition-picker-open="provinces"]');
    assert.equal(document.querySelector<import('happy-dom').HTMLElement>('[data-picker-province-list]')!.hidden, false);
    click('[data-picker-province="6"]');
    assert.equal(dialog.open, true);
    assert.equal(document.querySelector<import('happy-dom').HTMLElement>('[data-picker-council="9006"]')!.hidden, true);
    assert.equal(view.location.pathname, '/2026/places/cape-town/coalition');
    assert.equal(dispatch('place-search:area', { url: '/2026/places/calvinia' }), false);
    await settle();
    assert.equal(view.location.pathname, '/2026/places/hantam/coalition');
    assert.deepEqual(requests.at(-1), { url: '/2026/places/calvinia' });

    view.location.href = 'https://counted.co.za/2026/places/cape-town/coalition';
    let finish!: (response: Response) => void;
    response = () => new Promise(resolve => { finish = resolve; });
    dispatch('place-search:google', { name: 'Example address', types: ['street_address'], place: { location: { toJSON: () => ({ lat: -33.9, lng: 18.4 }) } } });
    dispatch('place-search:input');
    finish(Response.json({ councils: [{ id: '6605' }] }));
    await settle();
    assert.equal(view.location.pathname, '/2026/places/cape-town/coalition');
    assert.equal((status as import('happy-dom').HTMLElement).hidden, true);

    response = async () => { throw new Error('Unavailable'); };
    dispatch('place-search:area', { url: '/2026/places/calvinia' });
    await settle();
    assert.match(status.textContent, /choose a council below/);
    assert.equal(dialog.open, true);
    response = async () => Response.json({ councils: [{ id: '9006' }, { id: '6605' }] });
    dispatch('place-search:area', { url: '/2026/places/example' });
    await settle();
    assert.match(status.textContent, /more than one council/);
    assert.equal(document.querySelectorAll('[data-picker-council]:not([hidden])').length, 2);
    assert.equal(view.location.pathname, '/2026/places/cape-town/coalition');

    response = () => new Promise(resolve => { finish = resolve; });
    dispatch('place-search:area', { url: '/2026/places/calvinia' });
    click('[data-picker-close]');
    finish(Response.json({ councils: [{ id: '6605' }] }));
    await settle();
    assert.equal(dialog.open, false);
    assert.equal(view.location.pathname, '/2026/places/cape-town/coalition');
  } finally {
    globalThis.fetch = originalFetch;
    restore.reverse().forEach(fn => fn());
    await view.happyDOM.close();
  }
});
