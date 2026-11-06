import test from 'node:test';
import assert from 'node:assert/strict';
import { googleBoundaries, type BoundaryView } from '../src/lib/maps/google-boundaries.ts';
import { administrative } from '../src/lib/maps/administrative.ts';
import { MUNICIPALITIES_URL, PROVINCES_URL } from '../src/lib/maps/config.ts';

const feature = (id: string) => ({ type: 'Feature', properties: { id }, geometry: { type: 'Polygon', coordinates: [] } });
const collection = (ids: string[]) => ({ type: 'FeatureCollection', features: ids.map(feature) });
const ward = (i: number) => ({ id: String(19100001 + i), number: i + 1, municipality: 'Cape Town', code: 'CPT', province: 'Western Cape', bbox: [18, -34, 19, -33] });
const settle = async () => { for (let i = 0; i < 4; i++) await new Promise(resolve => setImmediate(resolve)); };

function harness(zoom: number) {
  type Stored = { getId(): string; getProperty(name: string): unknown };
  const features = new Map<string, Stored>();
  let additions = 0, removals = 0, failures = 0, completions = 0;
  const views: BoundaryView[] = [];
  const map = {
    zoom, bounds: { west: 16, south: -35, east: 33, north: -22 },
    getZoom() { return this.zoom; }, getBounds() { return { toJSON: () => this.bounds }; },
    data: {
      forEach(callback: (value: Stored) => void) { features.forEach(callback); },
      remove(value: Stored) { removals++; features.delete(value.getId()); },
      addGeoJson(data: { features: { id: string; properties: Record<string, unknown> }[] }) {
        for (const value of data.features) {
          additions++;
          features.set(value.id, { getId: () => value.id, getProperty: name => value.properties[name] });
        }
      },
    },
  };
  const boundaries = googleBoundaries(map as unknown as google.maps.Map, view => views.push(view), () => failures++, () => completions++);
  return { map, features, views, boundaries, counts: () => ({ additions, removals, failures, completions }) };
}

function overviewResponse(url: string) {
  return Response.json(collection(Object.keys(url === PROVINCES_URL ? administrative.provinces : administrative.municipalities)));
}

test('municipal overview uses one request for 213 areas and reuses polygons and overview data across pans and zooms', async t => {
  const app = harness(6);
  const requests: string[] = [];
  t.mock.method(globalThis, 'fetch', async (input: RequestInfo | URL) => { const url = String(input); requests.push(url); return overviewResponse(url); });
  await app.boundaries.update();
  assert.deepEqual(requests, [MUNICIPALITIES_URL]);
  assert.equal(app.features.size, 213);
  const capeTown = app.features.get('9006');
  await app.boundaries.update();
  assert.equal(app.features.get('9006'), capeTown);
  assert.equal(app.counts().additions, 213);
  assert.equal(app.counts().removals, 0);
  app.map.bounds = { west: 18.4, south: -34, east: 18.5, north: -33.9 };
  await app.boundaries.update();
  assert.equal(app.features.get('9006'), capeTown, 'panning keeps overlapping polygons mounted');
  assert.equal(app.counts().additions, 213);
  app.map.zoom = 4;
  await app.boundaries.update();
  app.map.zoom = 6;
  await app.boundaries.update();
  assert.deepEqual(requests, [MUNICIPALITIES_URL, PROVINCES_URL]);
});

test('ward results start before geometry; each completed batch draws without waiting for slower batches', async t => {
  const app = harness(10);
  const all = Array.from({ length: 81 }, (_, i) => ward(i));
  const requests: string[] = [];
  const pending: { ids: string[]; resolve(value: Response): void }[] = [];
  t.mock.method(globalThis, 'fetch', async (input: RequestInfo | URL) => {
    const url = String(input); requests.push(url);
    if (url.includes('/areas?')) return Response.json({ wards: all, limited: false });
    const ids = new URL(url, 'https://example.test').searchParams.get('ids')!.split(',');
    return new Promise<Response>(resolve => pending.push({ ids, resolve }));
  });
  const loading = app.boundaries.update();
  await settle();
  assert.equal(app.views[0]!.areas.length, 81, 'sidebar/result requests can start before geometry arrives');
  assert.equal(pending.length, 3, '81 wards require three batches rather than 81 geometry requests');
  assert.equal(app.features.size, 0);
  pending[1]!.resolve(Response.json(collection(pending[1]!.ids)));
  await settle();
  assert.equal(app.features.size, 40, 'a fast batch is drawn while two batches remain pending');
  pending[0]!.resolve(Response.json(collection(pending[0]!.ids)));
  pending[2]!.resolve(Response.json(collection(pending[2]!.ids)));
  await loading;
  assert.equal(app.features.size, 81);
  const original = app.features.get(all[0]!.id);
  await app.boundaries.update();
  assert.equal(app.features.get(all[0]!.id), original);
  assert.equal(requests.length, 4, 'returning to the same viewport uses both metadata and geometry caches');
  assert.deepEqual(app.counts(), { additions: 81, removals: 0, failures: 0, completions: 2 });
});

test('a late ward batch cannot redraw old polygons after switching back to provinces', async t => {
  const app = harness(10);
  let release!: (value: Response) => void;
  t.mock.method(globalThis, 'fetch', async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes('/areas?')) return Response.json({ wards: [ward(0)], limited: false });
    if (url === PROVINCES_URL) return overviewResponse(url);
    return new Promise<Response>(resolve => { release = resolve; });
  });
  const old = app.boundaries.update();
  await settle();
  app.boundaries.cancel();
  app.map.zoom = 4;
  await app.boundaries.update();
  release(Response.json(collection([ward(0).id])));
  await old;
  assert.equal(app.features.size, 9);
  assert.ok([...app.features.values()].every(value => value.getProperty('level') === 'province'));
  assert.equal(app.counts().completions, 1);
  assert.equal(app.counts().failures, 0);
});

test('incomplete batches are retried and a limited ward view uses the cached municipal overview', async t => {
  const app = harness(10);
  let incomplete = true, limited = false;
  const requests: string[] = [];
  t.mock.method(globalThis, 'fetch', async (input: RequestInfo | URL) => {
    const url = String(input); requests.push(url);
    if (url.includes('/areas?')) return Response.json({ wards: limited ? [] : [ward(0), ward(1)], limited });
    if (url === MUNICIPALITIES_URL) return overviewResponse(url);
    return Response.json(collection(incomplete ? [ward(0).id] : [ward(0).id, ward(1).id]));
  });
  await app.boundaries.update();
  assert.equal(app.counts().failures, 1);
  assert.equal(app.counts().completions, 0);
  incomplete = false;
  await app.boundaries.update();
  assert.equal(app.features.size, 2);
  assert.equal(requests.filter(url => url.includes('/boundaries?')).length, 2);
  limited = true;
  app.map.bounds = { ...app.map.bounds, west: 17 };
  await app.boundaries.update();
  assert.equal(app.views.at(-1)!.level, 'municipality');
  assert.equal(app.views.at(-1)!.limited, true);
  assert.ok(app.features.has('9006'));
  assert.equal(requests.filter(url => url.includes('/boundaries?')).length, 2);
});
