import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { initWasm, Resvg } from '@resvg/resvg-wasm';
import { ELECTIONS } from '../src/lib/data/catalogue.ts';
import { findPlace, places } from '../src/lib/places/catalogue.ts';
import { provinces } from '../src/lib/overview/results.ts';
import { districts } from '../src/lib/maps/districts.ts';
import { ogImageUrl, ogPageForPath, OG_WIDTH, OG_HEIGHT } from '../src/lib/og/model.ts';
import { ogSvg } from '../src/lib/og/svg.ts';
import { boundaryOgMap, loadOgMap, nationalOgMap, type Boundary, type Boundaries } from '../src/lib/og/maps.ts';

test('all public page families have contextual OG images, across supported elections', async () => {
  for (const path of ['/', '/map', '/find-address', '/search', '/updates', '/majority-builder', '/api', '/privacy', '/terms', '/disclaimer', '/2026/places/cape-town/coalition']) {
    assert(await ogPageForPath(path), path);
  }
  for (const { year } of ELECTIONS) {
    assert.equal((await ogPageForPath(`/${year}`))?.year, year);
    for (const province of provinces) assert.equal((await ogPageForPath(`/${year}/provinces/${province.slug}`))?.title, province.name);
    for (const place of places) assert.equal((await ogPageForPath(`/${year}/places/${place.slug}`))?.title, place.name);
    assert.match((await ogPageForPath(`/${year}/wards/19100001`))!.title, /Ward 1/);
    assert.equal((await ogPageForPath(`/${year}/voting-districts/97100010`))?.title, 'Voting district 97100010');
  }
  for (const district of districts) assert.equal((await ogPageForPath(`/2026/districts/${district.slug}`))?.title, district.name);
});

test('directory towns retain their names and geographic scope without fetching results', async () => {
  const town = { ...findPlace('calvinia')!, slug: 'test-town', name: 'Test & Town' };
  const page = await ogPageForPath('/2026/places/test-town', async slug => {
    assert.equal(slug, 'test-town');
    return town;
  });
  assert.equal(page?.title, 'Test & Town');
  assert.equal(page?.subtitle, 'Town · Northern Cape');
  assert.equal((await ogPageForPath('/2021/wards/19100001'))?.subtitle, 'South Africa · Ward 19100001');
});

test('OG links discard addresses, search terms, ballot and coalition state', () => {
  assert.equal(ogImageUrl('https://counted.co.za/?address=private#result'), 'https://counted.co.za/og/v3/index.png');
  assert.equal(ogImageUrl('https://counted.co.za/search/?q=private&lat=-33'), 'https://counted.co.za/og/v3/search.png');
  assert.equal(ogImageUrl('https://counted.co.za/2026/places/cape-town/coalition?parties=1,2'), 'https://counted.co.za/og/v3/2026/places/cape-town/coalition.png');
  assert.equal(ogImageUrl('http://localhost:4321/2026/places/witzenberg?ballot=ward'), 'https://counted.co.za/og/v3/2026/places/witzenberg.png');
  assert.equal(ogImageUrl('https://preview.example/api'), 'https://counted.co.za/og/v3/api.png');
});

test('provisional votes, complete counts, seats and claimed confirmation cannot enter an OG image', async () => {
  const path = '/2026/places/cape-town';
  const baseline = await ogPageForPath(path);
  const attempted = await ogPageForPath(`${path}?title=ANC%20wins&votes=1000&reporting=100&seats=200&confirmed=true&status=final`);
  assert.deepEqual(attempted, baseline);
  // Historical import alone is not declaration evidence either.
  for (const year of [2021, 2026]) {
    const page = await ogPageForPath(`/${year}/places/cape-town`);
    assert.deepEqual(Object.keys(page!).sort(), year === 2026 ? ['label', 'map', 'subtitle', 'title', 'year'] : ['label', 'subtitle', 'title', 'year']);
    assert.doesNotMatch(ogSvg(page!, ''), /\bANC\b|\bDA\b|\bseats\b|\bwins\b|\bleads\b|\d[.,]\d%|confirmed/i);
  }
  assert.match((await ogPageForPath(`${path}/coalition`))!.subtitle, /hypothetical/i);
});

test('maps use geographic colours regardless of result-like feature properties', () => {
  const feature: Boundary = { type: 'Feature', properties: { id: '1' }, geometry: { type: 'Polygon', coordinates: [
    [[18,-34],[19,-34],[19,-33],[18,-33],[18,-34]],
    [[18.2,-33.8],[18.4,-33.8],[18.4,-33.6],[18.2,-33.6],[18.2,-33.8]],
  ] } };
  const baseline = boundaryOgMap(feature, 'Ward boundary')!;
  assert.equal(baseline.paths[0]!.d.split('M').length - 1, 2, 'retain the hole as a separate ring');
  feature.properties = { ...feature.properties, winner: 'ANC', color: '#000000', votes: 9000, confirmed: true };
  assert.deepEqual(boundaryOgMap(feature, 'Ward boundary'), baseline);
  assert.equal(nationalOgMap().paths.length, 9);
  assert(new Set(nationalOgMap().paths.map(p => p.fill)).size > 1);
  const svg = ogSvg({ title: 'Ward 1', label: 'Local elections 2026', subtitle: 'Cape Town', year: 2026 }, '', baseline);
  assert.match(svg, /font-size="44"[^>]*>LOCAL ELECTIONS 2026/);
  assert.match(svg, /fill-rule="evenodd"/);
  assert.doesNotMatch(svg, /ANC|9000|winner/);
});

test('area maps use municipal divisions and individual ward shapes, with a national fallback', async () => {
  const collection = JSON.parse(await readFile(new URL('../public/maps/geometry/cape-town-2026.geojson', import.meta.url), 'utf8')) as Boundaries;
  const sources = { asset: async (path: string) => {
    assert.equal(path, '/maps/geometry/cape-town-2026.geojson'); return collection;
  }, geometry: async () => { throw new Error('Bundled boundaries should not need a database read'); } };
  const municipality = await loadOgMap({ level: 'municipality', id: '9006' }, sources);
  assert.equal(municipality.paths.length, 118);
  assert.equal(municipality.caption, 'Municipal ward boundaries');
  const ward = await loadOgMap({ level: 'ward', id: '19100001' }, sources);
  assert.equal(ward.paths.length, 1);
  assert.equal(ward.caption, 'Ward boundary');
  assert.equal((await ogPageForPath('/2021/wards/19100001'))?.map, undefined);
  assert.equal((await ogPageForPath('/2021/places/cape-town'))?.map, undefined);
  const fallback = await loadOgMap({ level: 'ward', id: '99999999' }, { ...sources, geometry: async () => null });
  assert.deepEqual(fallback, nationalOgMap());
});

test('invalid elections and routes cannot create arbitrary branded previews', async () => {
  for (const path of ['/2025', '/2026/provinces/fake', '/2026/places/unknown', '/2021/districts/cape-winelands', '/2021/places/cape-town/coalition', '/2026/wards/injected', '/api/v1', '/anything', '/2026/provinces/gauteng/coalition']) {
    assert.equal(await ogPageForPath(path), null, path);
  }
});

test('the real bundled font and renderer produce a 1200×630 PNG and escape text', async () => {
  const [wasm, medium, bold, icon] = await Promise.all([
    readFile(new URL('../node_modules/@resvg/resvg-wasm/index_bg.wasm', import.meta.url)),
    readFile(new URL('../src/lib/og/fonts/SpaceGrotesk-Medium.ttf', import.meta.url)),
    readFile(new URL('../src/lib/og/fonts/SpaceGrotesk-Bold.ttf', import.meta.url)),
    readFile(new URL('../public/brand/counted-icon.svg', import.meta.url), 'utf8'),
  ]);
  await initWasm(wasm);
  const svg = ogSvg({ title: 'Long municipality & town <name>', label: 'Local elections 2026', subtitle: 'South Africa', year: 2026 }, icon);
  assert.match(svg, /&amp;/);
  assert.match(svg, /&lt;name&gt;/);
  assert.doesNotMatch(svg, /<name>/);
  const renderer = new Resvg(svg, { font: { fontBuffers: [medium, bold], defaultFontFamily: 'Space Grotesk' } });
  try {
    const image = renderer.render();
    try {
      const png = image.asPng();
      assert.deepEqual([...png.slice(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
      assert.equal(image.width, OG_WIDTH);
      assert.equal(image.height, OG_HEIGHT);
      assert(png.length > 10000);
    } finally { image.free(); }
  } finally { renderer.free(); }
});
