import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import { rememberAddress, selectedAddress, loadSelectedAddress } from '../src/lib/address/selected-address.ts';
import { mountRegionMap } from '../src/lib/maps/address-map.ts';
import { updateRegionMap } from '../src/lib/maps/history.ts';

let version = 0;
let cleanup: (() => void | Promise<void>)[] = [];
afterEach(async () => { for (const fn of cleanup.reverse()) await fn(); cleanup = []; });
function global(name: string, value: unknown) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, name);
  Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
  cleanup.push(() => { if (descriptor) Object.defineProperty(globalThis, name, descriptor); else Reflect.deleteProperty(globalThis, name); });
}
const settle = async () => { for (let i = 0; i < 5; i++) await new Promise(resolve => setImmediate(resolve)); };
function environment() {
  const window = new Window({ url: 'https://example.test/2026/wards/19100001' });
  cleanup.push(() => window.happyDOM.close());
  const navigations: string[] = [];
  global('document', window.document);
  global('Event', window.Event);
  global('sessionStorage', window.sessionStorage);
  global('location', window.location);
  global('window', { location: { assign: (url: string) => navigations.push(url) } });
  return { window, document: window.document, navigations };
}
const wards = [{ id: '19100001', number: 1, municipality: 'Cape Town' }, { id: '19100002', number: 2, municipality: 'Cape Town' }];
const place = { id: 'address-place', formattedAddress: '12 Private Road, Cape Town', location: { toJSON: () => ({ lat: -33.9, lng: 18.4 }) } };
async function search(reply: typeof fetch) {
  const env = environment();
  env.document.body.innerHTML = '<section data-address-lookup><div data-place-search></div><p data-address-status></p><div data-address-wards></div></section>';
  global('fetch', reply);
  await import(`../src/lib/address/client.ts?test=${++version}`);
  const root = env.document.querySelector('[data-place-search]')!;
  const select = (detail = place) => root.dispatchEvent(new env.window.CustomEvent('place-search:select', { bubbles: true, detail }));
  return { ...env, root, select };
}

test('selecting an address opens ward results immediately and carries only the place ID in this tab', async () => {
  const requests: { url: string; init: RequestInit }[] = [];
  const ui = await search(async (url, init) => { requests.push({ url: String(url), init: init! }); return Response.json({ wards: [wards[0]] }); });
  ui.select(); await settle();
  assert.deepEqual(ui.navigations, ['/2026/wards/19100001']);
  assert.equal(requests.length, 1);
  assert.equal(requests[0]!.url, '/api/locate');
  assert.equal(requests[0]!.init.method, 'POST');
  assert.deepEqual(JSON.parse(requests[0]!.init.body as string), { lat: -33.9, lng: 18.4 });
  assert.equal(selectedAddress('19100001')?.placeId, place.id);
  assert.equal(selectedAddress('19100002'), undefined);
  const saved = JSON.parse(sessionStorage.getItem('counted:selected-address')!);
  assert.deepEqual(Object.keys(saved).sort(), ['placeId', 'savedAt', 'wardId']);
  assert.equal(ui.document.querySelector('[data-address-wards]')!.children.length, 0);
});

test('boundary matches require a choice and retain that ward’s address context', async () => {
  const ui = await search(async () => Response.json({ wards }));
  ui.select(); await settle();
  assert.deepEqual(ui.navigations, []);
  assert.match(ui.document.querySelector('[data-address-status]')!.textContent, /boundary/);
  const buttons = ui.document.querySelectorAll('button');
  assert.equal(buttons.length, 2);
  buttons[1]!.click();
  assert.deepEqual(ui.navigations, ['/2026/wards/19100002']);
  assert.equal(selectedAddress('19100002')?.placeId, place.id);
});

test('new input, selection, cancellation and year changes prevent stale ward navigation', async () => {
  for (const event of ['place-search:input', 'place-search:pending', 'place-search:area', 'place-search:cancel', 'place-search:sync-query', 'results:before-year-change']) {
    let respond!: (response: Response) => void;
    let signal: AbortSignal | undefined;
    const ui = await search(async (_url, init) => { signal = init?.signal as AbortSignal; return new Promise(resolve => { respond = resolve; }); });
    ui.select();
    (event.startsWith('results:') ? ui.document : ui.root).dispatchEvent(new ui.window.Event(event));
    respond(Response.json({ wards: [wards[0]] })); await settle();
    assert.equal(signal?.aborted, true, event);
    assert.deepEqual(ui.navigations, [], event);
    assert.equal(selectedAddress('19100001'), undefined);
  }
});

test('empty matches and failed lookups leave search available without navigating', async () => {
  for (const response of [Response.json({ wards: [] }), new Response('', { status: 503 })]) {
    const ui = await search(async () => response);
    ui.select(); await settle();
    assert.deepEqual(ui.navigations, []);
    assert.match(ui.document.querySelector('[data-address-status]')!.textContent, /Try|try/);
    assert.equal(ui.document.querySelector('[data-address-wards]')!.children.length, 0);
  }
});

test('blocked browser storage never prevents navigation to ward results', async () => {
  const ui = await search(async () => Response.json({ wards: [wards[0]] }));
  global('sessionStorage', { getItem() { throw new Error('blocked'); }, removeItem() { throw new Error('blocked'); } });
  ui.select(); await settle();
  assert.deepEqual(ui.navigations, ['/2026/wards/19100001']);
  assert.equal(selectedAddress('19100001'), undefined);
});

test('invalid and expired selections cannot appear on another ward page', () => {
  environment();
  for (const value of ['broken', '{}', JSON.stringify({ placeId: 'x', wardId: '19100001', savedAt: Date.now() - 3600001 }), JSON.stringify({ placeId: 'x', wardId: '19100001', savedAt: Date.now() + 10000 })]) {
    sessionStorage.setItem('counted:selected-address', value);
    assert.equal(selectedAddress('19100001'), undefined);
  }
  rememberAddress('new-place', '19100001');
  assert.equal(selectedAddress('19100002'), undefined);
  rememberAddress('', '19100001');
  assert.equal(selectedAddress('19100001'), undefined);
});

function googleMaps() {
  const position = { lat: () => -33.9, lng: () => 18.4 };
  const calls: string[][] = [];
  const maps: MapStub[] = [];
  class MapStub {
    container: HTMLElement;
    bounds: unknown;
    data = { geometry: undefined as unknown, addGeoJson: (geometry: unknown) => { this.data.geometry = geometry; }, setStyle() {} };
    constructor(container: HTMLElement) { this.container = container; maps.push(this); }
    fitBounds(bounds: unknown) { this.bounds = bounds; }
  }
  class OverlayView {
    map: MapStub | null = null;
    onAdd() {} onRemove() {} draw() {}
    setMap(map: MapStub | null) { if (this.map) this.onRemove(); this.map = map; if (map) { this.onAdd(); this.draw(); } }
    getPanes() { return { floatPane: this.map!.container }; }
    getProjection() { return { fromLatLngToDivPixel: (value: unknown) => { assert.equal(value, position); return { x: 120, y: 80 }; } }; }
  }
  class Place {
    location = position; formattedAddress = '<12 Private Road>, Cape Town'; displayName = 'Private Road';
    async fetchFields({ fields }: { fields: string[] }) { calls.push(fields); }
  }
  global('google', { maps: { Map: MapStub, OverlayView, importLibrary: async () => ({ Place }), event: { clearInstanceListeners() {} },
    LatLngBounds: class { bounds: unknown; constructor(bounds: unknown) { this.bounds = bounds; } extend(value: unknown) { assert.equal(value, position); } },
  } });
  return { maps, calls, position };
}

test('ward page restores the address once, pins the same location, survives refresh, and hides it for historical results', async () => {
  const env = environment();
  rememberAddress('ward-map-place', '19100001');
  const google = googleMaps();
  const geometry = { type: 'Feature', geometry: { type: 'Polygon', coordinates: [] }, properties: {} };
  global('fetch', async () => Response.json(geometry));
  env.document.body.innerHTML = '<main id="main"><div data-ward-address="19100001" hidden><p data-ward-address-label></p><a data-ward-address-map></a></div><figure data-region-map><div class="region-map-canvas"></div><p class="region-map-status"></p><figcaption><span data-map-caption>Voting district boundaries</span><a href="/map">Explore map</a></figcaption></figure></main>';
  const figure = env.document.querySelector('figure')!;
  figure.dataset.options = JSON.stringify({ level: 'ward', id: '19100001', bbox: [18, -34, 19, -33] });
  figure.dataset.mapHistorical = 'false';
  const next = figure.cloneNode(true) as typeof figure;
  await import(`../src/lib/address/ward-context.ts?test=${++version}`);
  const dispose = mountRegionMap(figure as unknown as HTMLElement);
  cleanup.push(dispose);
  await settle();
  assert.equal(google.calls.length, 1, 'heading and map share the destination details request');
  assert.equal(env.document.querySelector('[data-ward-address]')!.hasAttribute('hidden'), false);
  assert.equal(env.document.querySelector('[data-ward-address-label]')!.textContent, '<12 Private Road>, Cape Town');
  assert.equal(env.document.querySelector('[data-ward-address-label]')!.children.length, 0, 'address is rendered as text');
  assert.equal(figure.querySelector('.ward-address-pin')!.getAttribute('aria-label'), '<12 Private Road>, Cape Town');
  assert.deepEqual(google.maps[0]!.data.geometry, geometry);
  updateRegionMap(figure as unknown as HTMLElement, next as unknown as HTMLElement);
  assert.match(figure.querySelector('[data-map-caption]')!.textContent, /Selected address/);
  next.dataset.mapHistorical = 'true';
  env.document.querySelector('#main')!.setAttribute('data-results-url', '/2021/wards/19100001');
  updateRegionMap(figure as unknown as HTMLElement, next as unknown as HTMLElement);
  env.document.dispatchEvent(new env.window.Event('results:updated'));
  assert.equal(figure.querySelector('.ward-address-pin'), null);
  assert.equal(env.document.querySelector('[data-ward-address]')!.hasAttribute('hidden'), true);
  next.dataset.mapHistorical = 'false';
  env.document.querySelector('#main')!.setAttribute('data-results-url', '/2026/wards/19100001');
  updateRegionMap(figure as unknown as HTMLElement, next as unknown as HTMLElement);
  env.document.dispatchEvent(new env.window.Event('results:updated'));
  assert.ok(figure.querySelector('.ward-address-pin'));
  assert.equal(env.document.querySelector('[data-ward-address]')!.hasAttribute('hidden'), false);
  assert.equal(google.maps.length, 1);
  dispose();
  assert.equal(figure.querySelector('.ward-address-pin'), null);
});

test('failed destination details can be retried without affecting ward results', async () => {
  environment();
  rememberAddress('retry-place', '19100001');
  let failed = true;
  global('google', { maps: { importLibrary: async () => ({ Place: class {
    location = {};
    async fetchFields() { if (failed) throw new Error('offline'); }
  } }) } });
  await assert.rejects(loadSelectedAddress('19100001'));
  failed = false;
  assert.ok(await loadSelectedAddress('19100001'));
});
