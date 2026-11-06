import test, { after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire, registerHooks } from 'node:module';
import type { FixedMapOptions } from '../src/lib/maps/fixed-types.ts';
import type { LayerSpecification, SourceSpecification } from 'maplibre-gl';

const require = createRequire(import.meta.url);
const { validateStyleMin } = require(require.resolve('@maplibre/maplibre-gl-style-spec', { paths: [require.resolve('maplibre-gl/package.json')] }));

// Exercise the actual preview mount and event handlers without requiring WebGL.
class ElementStub extends EventTarget {
  children: ElementStub[] = [];
  attributes: Record<string, string> = {};
  dataset: Record<string, string> = {};
  style = { cursor: '', setProperty(_name: string, _value: string) {} };
  classes = new Set<string>();
  classList = {
    toggle: (name: string, active: boolean) => active ? this.classes.add(name) : this.classes.delete(name),
    add: (name: string) => this.classes.add(name), remove: (name: string) => this.classes.delete(name),
  };
  className = '';
  textContent = '';
  href = '';
  hidden = false;
  type = '';
  value = '';
  queries = new Map<string, ElementStub>();
  appendChild(child: ElementStub) { this.children.push(child); return child; }
  replaceChildren(...children: ElementStub[]) { this.children = children; }
  add(child: ElementStub) { this.appendChild(child); }
  setAttribute(name: string, value: string) { this.attributes[name] = value; }
  removeAttribute(name: string) { delete this.attributes[name]; }
  contains(target: ElementStub): boolean { return target === this || this.children.some(child => child.contains(target)); }
  querySelector(selector: string) { return this.queries.get(selector); }
}

class PopupStub {
  static instances: PopupStub[] = [];
  open = false;
  content = new ElementStub();
  element = new ElementStub();
  constructor() { PopupStub.instances.push(this); }
  setDOMContent(content: ElementStub) { this.content = content; return this; }
  setLngLat() { return this; }
  isOpen() { return this.open; }
  addTo() { this.open = true; return this; }
  remove() { this.open = false; return this; }
  getElement() { return this.element; }
}

type MapOptions = { container: ElementStub | string; interactive?: boolean; zoom?: number; style: { sources: Record<string, SourceSpecification>; layers: LayerSpecification[] } };
class MapStub {
  static instances: MapStub[] = [];
  options: MapOptions;
  canvas = new ElementStub();
  features: { properties: Record<string, unknown> }[] = [];
  states = new Map<string, { hover?: boolean; resultColor?: string }>();
  flights: { zoom?: number }[] = [];
  handlers = new Map<string, Set<(event: unknown) => void>>();
  queries = 0;
  scans = 0;
  zoom: number;
  constructor(options: MapOptions) {
    const errors = validateStyleMin(options.style);
    assert.deepEqual(errors.map((error: {message:string}) => error.message), []);
    this.options = options; this.zoom = options.zoom ?? 5;
    this.getContainer().appendChild(this.canvas); MapStub.instances.push(this);
  }
  getCanvas() { return this.canvas; }
  getContainer() { return typeof this.options.container === 'string' ? elements.get(this.options.container)! : this.options.container; }
  getLayer(id: string) { return this.options.style.layers.find(layer => layer.id === id); }
  getSource(id: string) { return this.options.style.sources[id]; }
  isMoving() { return false; }
  isSourceLoaded() { return true; }
  getZoom() { return this.zoom; }
  getCenter() { return { lng: 24.5, lat: -29.4 }; }
  addControl() {}
  removeLayer(id: string) { this.options.style.layers = this.options.style.layers.filter(layer => layer.id !== id); }
  removeSource(id: string) { delete this.options.style.sources[id]; }
  addSource(id: string, source: SourceSpecification) { this.options.style.sources[id] = source; }
  addLayer(layer: LayerSpecification) { this.options.style.layers.push(layer); }
  setFilter(id: string, filter: unknown) { Object.assign(this.getLayer(id)!, { filter }); }
  setPaintProperty(id: string, property: string, value: unknown) { Object.assign(this.getLayer(id)!.paint!, { [property]: value }); }
  resize() {}
  fitBounds() {}
  cameraForBounds(_bounds: unknown, options: { maxZoom: number }) { return { center: [20, -30], zoom: Math.min(options.maxZoom, 6) }; }
  flyTo(camera: { zoom?: number }) { this.flights.push(camera); }
  queryRenderedFeatures(geometry?: object) { this.queries++; if (geometry && 'layers' in geometry) this.scans++; return this.features; }
  setFeatureState(target: { id: string }, state: { hover?: boolean; resultColor?: string }) { this.states.set(target.id, { ...this.states.get(target.id), ...state }); }
  on(name: string, handler: (event: unknown) => void) {
    const handlers = this.handlers.get(name) ?? new Set(); handlers.add(handler); this.handlers.set(name, handlers); return this;
  }
  off(name: string, handler: (event: unknown) => void) { this.handlers.get(name)?.delete(handler); return this; }
  fire(name: string, originalEvent: object = {}, details: object = {}) {
    for (const handler of [...this.handlers.get(name) ?? []]) handler({ originalEvent, point: { x: 50, y: 50 }, lngLat: [20, -30], ...details });
  }
  remove() { this.options.style.sources = {}; this.fire('remove'); }
}

const elements = new Map<string, ElementStub>();
const documentStub = Object.assign(new ElementStub(), {
  createElement: () => new ElementStub(), getElementById: (id: string) => elements.get(id), querySelectorAll: () => [],
});
const navigations: string[] = [];
let savedUrl = '';
let resizeDisconnects = 0;
Object.assign(globalThis, {
  Node: ElementStub,
  document: documentStub,
  window: Object.assign(new EventTarget(), { matchMedia: () => ({ matches: false }) }),
  location: { origin: 'https://example.test', href: 'https://example.test/map', assign: (href: string) => navigations.push(href) },
  history: { replaceState: (_state: unknown, _title: string, url: URL) => { savedUrl = url.href; } },
  Option: class extends ElementStub { constructor(text: string, value: string) { super(); this.textContent = text; this.value = value; } },
  ResizeObserver: class { observe() {} disconnect() { resizeDisconnects++; } },
});
Object.defineProperty(globalThis, '__mapInteractionTest', { configurable: true, value: { Map: MapStub, Popup: PopupStub } });
const hooks = registerHooks({ resolve(specifier, context, next) {
  if (specifier === 'maplibre-gl') return { shortCircuit: true, url: 'data:text/javascript,export const {Map,Popup}=globalThis.__mapInteractionTest;export const setWorkerUrl=()=>{};export const addProtocol=()=>{};export class NavigationControl{};export class ScaleControl{};' };
  if (specifier.endsWith('.css') || specifier.includes('?worker&url')) return { shortCircuit: true, url: 'data:text/javascript,export default "";' };
  return next(specifier, context);
} });
const { mountRegionMap } = await import('../src/lib/maps/fixed-client.ts');
after(() => hooks.deregister());
afterEach(() => { for (const map of MapStub.instances) map.remove(); MapStub.instances.length = 0; navigations.length = 0; });

function preview(options: FixedMapOptions, properties: Record<string, unknown>) {
  const figure = new ElementStub();
  figure.dataset.options = JSON.stringify(options);
  figure.queries.set('.region-map-canvas', new ElementStub());
  figure.queries.set('.region-map-status', new ElementStub());
  mountRegionMap(figure as unknown as HTMLElement);
  const map = MapStub.instances.at(-1)!;
  assert.ok(map);
  map.features = [{ properties }];
  return { map, figure, popup: PopupStub.instances.at(-1)! };
}
function pointer(map: MapStub, pointerType: string) {
  const event = new Event('pointerdown'); Object.defineProperty(event, 'pointerType', { value: pointerType }); map.canvas.dispatchEvent(event);
}
const bbox: FixedMapOptions['bbox'] = [18, -34, 23, -30];
const capeTown = { id: '9006', name: 'Cape Town', url: '/2026/places/cape-town', level: 'municipality' };

test('static provincial maps highlight municipalities and show their names on hover', () => {
  const { map, popup } = preview({ level: 'province', id: '9', bbox }, capeTown);
  assert.equal(map.options.interactive, false, 'preview must still allow ordinary page scrolling');
  const fill = map.getLayer('regions-fill');
  assert.ok(fill && fill.type === 'fill');
  assert.deepEqual(fill.filter, ['all', ['==', ['get', 'level'], 'municipality'], ['==', ['get', 'provinceId'], '9']]);
  assert.ok(JSON.stringify(fill.paint).includes('feature-state'));
  pointer(map, 'mouse'); map.fire('mousemove');
  assert.equal(popup.content.children[0]!.textContent, 'Cape Town');
  assert.equal(map.states.get('9006')!.hover, true);
  map.features = [{ properties: { id: '9909', name: 'Witzenberg', url: '/2026/places/witzenberg' } }];
  map.fire('mousemove');
  assert.equal(popup.content.children[0]!.textContent, 'Witzenberg');
  assert.equal(map.states.get('9006')!.hover, false);
  map.canvas.dispatchEvent(new Event('mouseleave'));
  assert.equal(popup.isOpen(), false);
  assert.equal(map.states.get('9909')!.hover, false);
  map.fire('click');
  assert.deepEqual(navigations, ['/2026/places/witzenberg']);
});

test('touching a static provincial map opens a persistent navigation tooltip', () => {
  const { map, popup } = preview({ level: 'province', id: '9', bbox }, capeTown);
  pointer(map, 'touch'); map.fire('touchstart'); map.fire('mousemove');
  assert.equal(popup.isOpen(), false, 'compatibility mouse events should not create hover tooltips');
  map.fire('click', { pointerType: '' });
  assert.equal(popup.content.children[0]!.textContent, 'Cape Town');
  assert.equal(popup.content.children[2]!.href, '/2026/places/cape-town');
  assert.equal(popup.content.children[2]!.textContent, 'View results →');
  assert.equal(popup.element.classes.has('is-pinned'), true);
  map.canvas.dispatchEvent(new Event('mouseleave')); map.fire('click');
  assert.equal(popup.isOpen(), true);
  assert.deepEqual(navigations, [], 'tapping the polygon, including twice, must not navigate');
  popup.content.children[1]!.dispatchEvent(new Event('click'));
  assert.equal(popup.isOpen(), false);
  assert.equal(map.states.get('9006')!.hover, false);
});

test('live leader updates repaint the existing province map without remounting it', () => {
  const options: FixedMapOptions = { level: 'province', id: '9', bbox, colors: [{ id: '9006', color: '#111111' }] };
  const { map, figure } = preview(options, capeTown);
  options.colors = [{ id: '9006', color: '#222222' }];
  figure.dataset.options = JSON.stringify(options);
  figure.dispatchEvent(new Event('results:map-update'));
  assert.equal(MapStub.instances.length, 1);
  assert.deepEqual((map.getLayer('regions-fill')!.paint as { 'fill-color': unknown })['fill-color'], ['match', ['get', 'id'], '9006', '#222222', '#dce1d5']);
});

test('static national, municipal and ward previews retain hover names and touch result links', () => {
  for (const [options, properties, name, href] of [
    [{ level: 'national', bbox }, { id: '9', name: 'Western Cape', url: '/2026/provinces/western-cape' }, 'Western Cape', '/2026/provinces/western-cape'],
    [{ level: 'municipality', id: '9006', code: 'CPT', bbox }, { id: '19100001', number: 1, municipality: 'Cape Town' }, 'Ward 1, Cape Town', '/2026/wards/19100001'],
    [{ level: 'ward', id: '19100001', bbox }, { id: '97410089', name: 'Example Primary School' }, 'Example Primary School', '/2026/voting-districts/97410089'],
  ] as [FixedMapOptions, Record<string, unknown>, string, string][]) {
    const { map, popup } = preview(options, properties);
    pointer(map, 'mouse'); map.fire('mousemove');
    assert.equal(popup.content.children[0]!.textContent, name);
    pointer(map, 'touch'); map.fire('click');
    assert.equal(popup.content.children[2]!.href, href);
    if (options.level === 'national') assert.equal(map.getSource('administrative')!.type, 'geojson');
  }
});

test('dismissing and removing map tooltips clears state and detaches event listeners', () => {
  const { map, popup } = preview({ level: 'province', id: '9', bbox }, capeTown);
  pointer(map, 'touch'); map.fire('click');
  const escape = new Event('keydown'); Object.defineProperty(escape, 'key', { value: 'Escape' });
  documentStub.dispatchEvent(escape);
  assert.equal(popup.isOpen(), false);
  map.fire('click'); documentStub.dispatchEvent(new Event('pointerdown'));
  assert.equal(popup.isOpen(), false);
  map.fire('click'); map.fire('movestart');
  assert.equal(popup.isOpen(), false);
  const disconnectedBefore = resizeDisconnects;
  map.fire('click'); map.remove();
  assert.equal(resizeDisconnects, disconnectedBefore + 1, 'removed maps must stop observing resize');
  assert.equal(popup.isOpen(), false);
  const queries = map.queries;
  map.fire('mousemove'); map.fire('click');
  assert.equal(map.queries, queries);
});

test('Google explorer browses boundaries, selects whole areas and preserves ward results across zooms', async t => {
  for (const id of ['map-app','map-loading','ward-result','map-selection','map-browse','map-browse-title','map-area-list','map-notice','map-area-title','map-area-description','reset-selection','map-home','map-view-status','map-boundary-label','map-result-scope','map-result-legend','map-search-status','map-hover','election-map']) elements.set(id, new ElementStub());
  t.mock.method(globalThis, 'setTimeout', () => 0 as unknown as ReturnType<typeof setTimeout>);
  type FeatureStub = { getId(): string; getProperty(name: string): unknown };
  class DataStub {
    features = new Map<string, FeatureStub>();
    style: ((feature: FeatureStub) => { fillColor: string; strokeWeight: number }) | undefined;
    handlers = new Map<string, (event: unknown) => void>();
    addListener(name: string, handler: (event: unknown) => void) { this.handlers.set(name, handler); }
    setStyle(style: typeof this.style) { this.style = style; }
    overrideStyle() {}
    revertStyle() {}
    forEach(callback: (feature: FeatureStub) => void) { this.features.forEach(callback); }
    remove(feature: FeatureStub) { this.features.delete(feature.getId()); }
    addGeoJson(json: { features?: { properties: Record<string, unknown> }[]; properties: Record<string, unknown> }) {
      for (const feature of json.features ?? [json]) {
        const id = String(feature.properties.id);
        this.features.set(id, { getId: () => id, getProperty: name => feature.properties[name] });
      }
    }
  }
  class GoogleMapStub {
    static instance: GoogleMapStub;
    data = new DataStub();
    zoom = 4;
    bounds = { west: 16, south: -35, east: 33, north: -22 };
    handlers = new Map<string, Set<() => void>>();
    fits: object[] = [];
    constructor() { GoogleMapStub.instance = this; }
    getCenter() { return { lng: () => 20, lat: () => -30 }; }
    getZoom() { return this.zoom; }
    setZoom(zoom: number) { this.zoom = zoom; }
    getBounds() { return { toJSON: () => this.bounds }; }
    fitBounds(bounds: object) { this.fits.push(bounds); }
    addListener(name: string, handler: () => void) {
      const listeners = this.handlers.get(name) ?? new Set(); listeners.add(handler); this.handlers.set(name, listeners);
      return { remove: () => listeners.delete(handler) };
    }
    fire(name: string) { for (const handler of [...this.handlers.get(name) ?? []]) handler(); }
  }
  Object.assign(globalThis, { google: { maps: {
    importLibrary: async () => ({}), Map: GoogleMapStub, Data: DataStub,
    event: { addListenerOnce: (map: GoogleMapStub, name: string, callback: () => void) => {
      const listener = map.addListener(name, () => { listener.remove(); callback(); }); return listener;
    } },
  } } });
  const ward = { id: '19100001', number: 1, municipality: 'Cape Town', code: 'CPT', province: 'Western Cape', bbox };
  const requests: string[] = [];
  const provinces = JSON.parse(require('node:fs').readFileSync(new URL('../public/maps/geometry/provinces-2026-20261105-v3.geojson', import.meta.url), 'utf8'));
  const municipalities = JSON.parse(require('node:fs').readFileSync(new URL('../public/maps/geometry/municipalities-2026-20261105-v3.geojson', import.meta.url), 'utf8'));
  t.mock.method(globalThis, 'fetch', async (input: RequestInfo | URL) => {
    const url = String(input); requests.push(url);
    if (url.includes('/leaders?')) {
      const params = new URL(url, 'https://example.test').searchParams;
      return Response.json({ areas: params.get('ids')!.split(',').map(id => ({ id, party: 'DEMOCRATIC ALLIANCE', color: '#2872ba', share: 60, status: 'leading', delayed: false })) });
    }
    if (url.includes('/areas?')) return Response.json({ wards: [ward], limited: false });
    if (url.includes('/boundaries?')) return Response.json({ type: 'FeatureCollection', features: [{ type: 'Feature', properties: { id: ward.id }, geometry: { type: 'Polygon', coordinates: [] } }] });
    if (url.includes('/municipalities-')) return Response.json(municipalities);
    if (url.endsWith('.geojson')) return Response.json(provinces);
    if (url.includes('/geometry/')) return Response.json({ type: 'Feature', properties: { id: url.split('/').at(-1) }, geometry: { type: 'Polygon', coordinates: [] } });
    return Response.json({ ward, result: null, url: '/2026/wards/19100001' });
  });
  const settle = async () => { for (let i = 0; i < 12; i++) await new Promise(resolve => setImmediate(resolve)); };
  await import('../src/lib/maps/client.ts'); await settle();
  const map = GoogleMapStub.instance;
  map.fire('idle'); await settle();
  assert.equal(elements.get('map-area-list')!.children.length, 9);
  assert.equal(map.data.features.size, 9);
  assert.equal(map.data.style!(map.data.features.get('9')!).fillColor, '#2872ba');
  assert.equal(elements.get('map-browse-title')!.textContent, 'Provinces');
  assert.equal(elements.get('map-selection')!.hidden, true);
  map.data.handlers.get('click')!({ feature: map.data.features.get('9') }); await settle();
  assert.equal(elements.get('map-selection')!.hidden, false);
  assert.equal(elements.get('map-area-title')!.textContent, 'Western Cape');
  assert.equal(elements.get('ward-result')!.children[0]!.href, '/2026/provinces/western-cape');
  assert.equal(elements.get('map-browse')!.hidden, false);
  assert.equal(new URL(savedUrl).searchParams.get('province'), 'western-cape');
  map.zoom = 6;
  map.bounds = { west: 18.4, south: -34, east: 18.5, north: -33.9 };
  map.fire('idle'); await settle();
  assert.equal(elements.get('map-browse-title')!.textContent, 'Municipalities in view');
  assert.equal(elements.get('map-area-title')!.textContent, 'Western Cape', 'zooming retains the selected province above municipalities');
  assert.equal(elements.get('ward-result')!.children[0]!.href, '/2026/provinces/western-cape');
  const municipalityRow = elements.get('map-area-list')!.children.find(row => row.children.some(child => child.href === '/2026/places/cape-town'))!;
  municipalityRow.children[0]!.dispatchEvent(new Event('click')); await settle();
  assert.equal(elements.get('map-area-title')!.textContent, 'Cape Town');
  assert.equal(elements.get('ward-result')!.children[0]!.href, '/2026/places/cape-town');
  assert.equal(elements.get('map-browse')!.hidden, false);
  assert.equal(new URL(savedUrl).searchParams.get('place'), 'cape-town');
  assert.equal(new URL(savedUrl).searchParams.has('province'), false);
  map.zoom = 8; map.fire('idle'); await settle();
  assert.equal(elements.get('map-browse-title')!.textContent, 'Wards in view');
  assert.equal(elements.get('map-area-title')!.textContent, 'Cape Town', 'zooming retains the selected municipality above wards');
  assert.equal(elements.get('ward-result')!.children[0]!.href, '/2026/places/cape-town');
  assert.equal(elements.get('map-area-list')!.children.length, 1);
  const beforeHover = requests.length;
  map.data.handlers.get('mouseover')!({ feature: map.data.features.get(ward.id) });
  assert.equal(elements.get('map-hover')!.textContent, 'Ward 1');
  assert.equal(requests.length, beforeHover, 'hover does not request results');
  elements.get('map-area-list')!.children[0]!.children[0]!.dispatchEvent(new Event('click')); await settle();
  assert.equal(elements.get('map-area-title')!.textContent, 'Ward 1');
  assert.equal(elements.get('map-selection')!.hidden, false);
  assert.equal(elements.get('map-browse')!.hidden, false, 'selecting a ward keeps areas in view available');
  assert.equal(map.data.style!(map.data.features.get(ward.id)!).strokeWeight, 1.5);
  const result = elements.get('ward-result')!.children[0];
  assert.equal(result!.children.at(-1)!.href, '/2026/wards/19100001');
  map.zoom = 4; map.fire('idle'); await settle();
  assert.equal(elements.get('ward-result')!.children[0], result);
  assert.match(elements.get('map-area-description')!.textContent, /outside this view/);
  assert.equal(new URL(savedUrl).searchParams.get('ward'), ward.id);
  elements.get('reset-selection')!.dispatchEvent(new Event('click'));
  assert.equal(elements.get('map-selection')!.hidden, true);
  assert.equal(elements.get('map-browse')!.hidden, false);
  assert.equal(new URL(savedUrl).searchParams.has('ward'), false);
  const area = { id: '3', name: 'Gauteng', kind: 'province', description: 'Province', url: '/2026/provinces/gauteng', bbox: [27, -27, 29, -25], geometry: { level: 'province', id: '3' } };
  const event = new CustomEvent('place-search:area', { cancelable: true, detail: area });
  elements.get('map-app')!.dispatchEvent(event); await settle();
  assert.equal(event.defaultPrevented, true);
  assert.equal(elements.get('map-area-title')!.textContent, 'Gauteng');
  assert.equal(elements.get('map-selection')!.hidden, false);
  assert.equal(elements.get('map-browse')!.hidden, false, 'search selections keep areas in view available');
  assert(elements.get('ward-result')!.children.some(child => child.href === area.url));
  assert.deepEqual(map.fits.at(-1), { west: 27, south: -27, east: 29, north: -25 });
  assert.equal(new URL(savedUrl).searchParams.get('province'), 'gauteng');
  assert(!requests.some(url => url.includes('/api/locate')), 'whole-area selection must never use a point-to-ward lookup');
  const district = { id: 'DC4', name: 'Garden Route District Municipality', kind: 'district', description: 'District municipality', url: '/2026/districts/garden-route', bbox: [20, -35, 24, -33], geometry: { level: 'district', id: 'DC4' } };
  elements.get('map-app')!.dispatchEvent(new CustomEvent('place-search:area', { cancelable: true, detail: district })); await settle();
  assert.equal(new URL(savedUrl).searchParams.get('district'), 'DC4');
  assert(elements.get('ward-result')!.children.some(child => child.href === district.url));
  assert(requests.includes('/api/v1/geometry/district/DC4'));
  const suburb = { id: 'newlands-cape-town', googlePlaceId: 'newlands-cape-town', name: 'Newlands', kind: 'area', description: 'Newlands, Cape Town', bbox: [18.40, -34.01, 18.48, -33.95], url: '/map?google-place=newlands-cape-town' };
  elements.get('map-app')!.dispatchEvent(new CustomEvent('place-search:area', { cancelable: true, detail: suburb })); await settle();
  assert.equal(elements.get('map-area-title')!.textContent, 'Newlands');
  assert.equal(elements.get('map-browse')!.hidden, false, 'wards remain browsable for an unlisted suburb');
  assert.match(elements.get('ward-result')!.children[0]!.textContent, /Google Maps’ view/);
  assert.equal(new URL(savedUrl).searchParams.get('google-place'), suburb.id);
  assert.equal(new URL(savedUrl).searchParams.has('district'), false);
  assert.deepEqual(map.fits.at(-1), { west: 18.40, south: -34.01, east: 18.48, north: -33.95 });
  elements.get('map-app')!.dispatchEvent(new CustomEvent('place-search:area', { cancelable: true, detail: { id: ward.id, name: 'Ward 1, Cape Town', kind: 'ward', bbox, url: '/2026/wards/'+ward.id } })); await settle();
  assert.equal(elements.get('map-area-title')!.textContent, 'Ward 1');
  assert.equal(new URL(savedUrl).searchParams.get('ward'), ward.id);
  assert.equal(new URL(savedUrl).searchParams.has('district'), false);
  assert.equal(new URL(savedUrl).searchParams.has('google-place'), false);
  assert(!requests.some(url => url.includes('/api/locate')));
  window.dispatchEvent(new Event('pagehide'));
});
