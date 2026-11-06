import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import type { FeatureCollection } from 'geojson';
import { byteRange } from '../src/lib/maps/ranges.ts';
import { boundaryLevel, boundaryOverlay, replaceBoundaryOverlay } from '../src/lib/maps/detail.ts';
import { MUNICIPALITIES_URL, PROVINCES_URL, WARDS_URL } from '../src/lib/maps/config.ts';
import { administrative } from '../src/lib/maps/administrative.ts';
import type { LayerSpecification, SourceSpecification } from 'maplibre-gl';

test('PMTiles byte ranges preserve inclusive HTTP offsets and handle suffix/open ranges', () => {
  assert.deepEqual(byteRange('bytes=0-126', 1000), { offset: 0, length: 127 });
  assert.deepEqual(byteRange('bytes=900-', 1000), { offset: 900, length: 100 });
  assert.deepEqual(byteRange('bytes=900-1200', 1000), { offset: 900, length: 100 });
  assert.deepEqual(byteRange('bytes=-127', 1000), { offset: 873, length: 127 });
  assert.deepEqual(byteRange('bytes=-1200', 1000), { offset: 0, length: 1000 });
});

test('malformed and unsatisfiable requests never fall back to the full archive', () => {
  for (const range of ['bytes=1000-', 'bytes=50-49', 'bytes=-0', 'bytes=-', 'bytes=0-1,4-5', 'items=0-1', 'bytes=9007199254740992-', 'bytes=0-9007199254740992']) {
    assert.equal(byteRange(range, 1000), null, range);
  }
  assert.equal(byteRange('bytes=0-1', 0), null);
});

test('display boundaries retain unique electoral IDs and remain distinct from the town extent', () => {
  const all = new Set<string>();
  for (const [slug, count, prefix] of [['cape-town', 118, '19100'], ['hantam', 7, '30605']] as const) {
    const data = JSON.parse(readFileSync(new URL(`../public/maps/geometry/${slug}-2026.geojson`, import.meta.url), 'utf8')) as FeatureCollection;
    assert.equal(data.features.length, count);
    for (const feature of data.features) {
      const p = feature.properties!;
      assert.equal(p.id, `${prefix}${String(p.number).padStart(3, '0')}`);
      assert.equal(p.municipality, slug);
      assert.ok(['Polygon', 'MultiPolygon'].includes(feature.geometry.type));
      assert.ok(!all.has(p.id));
      all.add(p.id);
    }
  }
  const town = JSON.parse(readFileSync(new URL('../public/maps/geometry/calvinia-2016.geojson', import.meta.url), 'utf8')) as FeatureCollection;
  assert.equal(town.features.length, 1);
  assert.equal(town.features[0]!.properties!.id, '366005');
  assert.ok(!all.has('366005'));
});

test('map views are bounded and duplicate tile fragments become a single visible ward', async () => {
  const { parseView, visibleWards } = await import('../src/lib/maps/viewport.ts');
  assert.deepEqual(parseView('28.04,-26.2,11'), { center: [28.04,-26.2], zoom: 11 });
  for (const value of [null, '', ',,', '28,-26,NaN', '100,-26,8', '28,0,8', '28,-26,30', '28,-26,8,1']) assert.equal(parseView(value), undefined);
  const ward = { id: '79800001', number: 1, municipality: 'City of Johannesburg', code: 'JHB' };
  assert.deepEqual(visibleWards([ward, {...ward}, {id:'invalid'}, {...ward,id:'79800002',number:2}]), [ward,{...ward,id:'79800002',number:2}]);
});

test('national ward catalogue supports wards outside the original two municipalities', async () => {
  const { findMapWard } = await import('../src/lib/maps/ward-catalogue.ts');
  const data = JSON.parse(readFileSync(new URL('../src/lib/maps/ward-index.json', import.meta.url), 'utf8'));
  assert.equal(Object.keys(data).length, 4485);
  for (const [id, ward] of Object.entries(data) as [string,{id:string;number:number;bbox:number[]}][]) {
    assert.equal(ward.id, id);
    assert.equal(ward.number, Number(id.slice(-3)));
    assert.ok(ward.bbox.length === 4 && ward.bbox.every(Number.isFinite));
    assert.ok(ward.bbox[0]! < ward.bbox[2]! && ward.bbox[1]! < ward.bbox[3]!);
  }
  assert.equal(findMapWard('79800001')?.municipality, 'City of Johannesburg');
  assert.equal(findMapWard('30605007')?.code, 'NC065');
  assert.equal(findMapWard('__proto__'), undefined);
  assert.equal(findMapWard('00000000'), undefined);
});

test('national map progresses through exclusive province, municipality and ward zoom ranges', () => {
  for (const [zoom, expected] of [[3, 'province'], [4.999, 'province'], [5, 'municipality'], [7.999, 'municipality'], [8, 'ward'], [17, 'ward']] as const) {
    assert.equal(boundaryLevel(zoom), expected);
    const overlay = boundaryOverlay(expected, 'https://example.test');
    assert.ok(overlay.layers.some(layer => zoom >= (layer.minzoom ?? 0) && zoom < (layer.maxzoom ?? 24)));
    if (expected !== 'ward') {
      assert.ok(!JSON.stringify(overlay).includes(WARDS_URL), 'coarse views must not register a ward source');
    }
  }
  const wards = boundaryOverlay('ward', 'https://example.test');
  for (const layer of wards.layers) assert.ok(layer.minzoom! >= 8, `${layer.id} must not load wards on zoom-out`);
});

test('switching levels releases old source data, including when returning from wards', () => {
  let previous = boundaryOverlay('province', 'https://example.test');
  const sources = new Map<string, SourceSpecification>([[previous.sourceId, previous.source]]);
  const layers = new Map<string, LayerSpecification>(previous.layers.map(layer => [layer.id, layer]));
  const map = {
    removeLayer(id: string) { assert.ok(layers.delete(id)); return this; },
    removeSource(id: string) {
      assert.ok(![...layers.values()].some(layer => 'source' in layer && layer.source === id));
      assert.ok(sources.delete(id)); return this;
    },
    addSource(id: string, source: SourceSpecification) { assert.ok(!sources.has(id)); sources.set(id, source); return this; },
    addLayer(layer: LayerSpecification) { assert.ok(sources.has((layer as {source:string}).source)); layers.set(layer.id, layer); return this; },
  };
  for (const level of ['municipality', 'ward', 'province', 'ward', 'municipality'] as const) {
    const next = boundaryOverlay(level, 'https://example.test');
    replaceBoundaryOverlay(map as unknown as Parameters<typeof replaceBoundaryOverlay>[0], previous, next);
    assert.equal(sources.size, 1);
    assert.deepEqual([...layers.keys()], next.layers.map(layer => layer.id));
    assert.equal(sources.has('wards'), level === 'ward');
    previous = next;
  }
});

test('national overview stays small and preserves all nine province names and result links', () => {
  const bytes = readFileSync(new URL(`../public${PROVINCES_URL}`, import.meta.url));
  assert.ok(bytes.length < 75000);
  const data = JSON.parse(bytes.toString()) as FeatureCollection;
  assert.equal(data.features.length, 9);
  assert.deepEqual(data.features.map(feature => feature.properties!.id).sort(), ['1','2','3','4','5','6','7','8','9']);
  for (const feature of data.features) {
    assert.equal(feature.properties!.level, 'province');
    assert.ok(feature.properties!.name);
    assert.match(feature.properties!.url, /^\/2026\/provinces\/[a-z-]+$/);
    assert.ok(['Polygon', 'MultiPolygon'].includes(feature.geometry.type));
  }
});

test('municipal overview fits in one bounded download and includes every electoral municipality', () => {
  const bytes = readFileSync(new URL(`../public${MUNICIPALITIES_URL}`, import.meta.url));
  assert.ok(bytes.length < 1_000_000);
  const data = JSON.parse(bytes.toString()) as FeatureCollection;
  assert.deepEqual(data.features.map(feature => feature.properties!.id).sort(), Object.keys(administrative.municipalities).sort());
  assert.ok(data.features.every(feature => ['Polygon', 'MultiPolygon'].includes(feature.geometry.type)));
});
