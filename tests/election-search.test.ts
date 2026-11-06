import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { searchElectionAreas } from '../src/lib/address/election-search.ts';
import { districts, findDistrict } from '../src/lib/maps/districts.ts';
import { administrative } from '../src/lib/maps/administrative.ts';
import { resolveArea } from '../src/lib/address/resolve-area.ts';
import { findPlace } from '../src/lib/places/catalogue.ts';

test('Knysna suggests its actual municipality first and labels its wards separately', () => {
  const suggestions = searchElectionAreas('Knysna');
  assert.equal(suggestions[0]?.url, '/2026/places/knysna');
  assert.match(suggestions[0]!.description, /Local municipality · WC048/);
  assert(suggestions.some(area => area.name === 'Ward 5, Knysna' && area.kind === 'ward'));
  assert.equal(searchElectionAreas('Knysna Municipality').length, 1);
  assert.equal(searchElectionAreas('WC048')[0]?.url, '/2026/places/knysna');
});

test('ward queries match exact ward numbers, municipal names/codes and eight-digit IDs', () => {
  for (const query of ['Knysna ward 5', 'ward 5 Knysna', 'Ward5 WC048', '10408005']) {
    const areas = searchElectionAreas(query);
    assert.equal(areas.length, 1, query);
    assert.equal(areas[0]?.url, '/2026/wards/10408005', query);
    assert.deepEqual(areas[0]?.geometry, { level: 'ward', id: '10408005' });
  }
  assert(searchElectionAreas('Ward 1 Cape Town').every(area => /^Ward 1,/.test(area.name)));
  assert.equal(searchElectionAreas('Knysna Ward 999').length, 0);
});

test('districts are searchable by name/code with full district geometry and a real destination', () => {
  for (const query of ['Garden Route', 'Garden Route District Municipality', 'DC4', 'DC04', 'DC 4']) {
    const area = searchElectionAreas(query)[0]!;
    assert.equal(area.kind, 'district', query);
    assert.equal(area.url, '/2026/districts/garden-route');
    assert.deepEqual(area.geometry, { level: 'district', id: 'DC4' });
  }
  assert.equal(resolveArea({names:['Garden Route District Municipality'],types:['administrative_area_level_2'],province:'Western Cape'}, []).area?.kind, 'district');
  assert(!searchElectionAreas('District Municipality').some(area => area.kind !== 'district'));
});

test('official area search respects municipality scope and remains bounded', () => {
  const knysna = findPlace('knysna')!;
  const areas = searchElectionAreas('Ward 5', knysna.bbox);
  assert(areas.some(area => area.url === '/2026/wards/10408005'));
  assert(!areas.some(area => area.description.includes('Gauteng')));
  assert.equal(searchElectionAreas('" OR *').length, 0);
  assert.equal(searchElectionAreas('12 Example Road').length, 0);
  assert(searchElectionAreas('Ward', undefined, 500).length <= 12);
  assert.equal(searchElectionAreas('Jozi')[0]?.url, '/2026/places/johannesburg');
});

test('all 44 districts partition the 205 current local municipalities and exclude metros/legacy FS164', () => {
  assert.equal(districts.length, 44);
  const codes = districts.flatMap(d => d.municipalityCodes);
  assert.equal(codes.length, 205);
  assert.equal(new Set(codes).size, 205);
  const known = new Map(Object.values(administrative.municipalities).map(m => [m.code, m]));
  for (const district of districts) {
    assert.equal(district.municipalityCodes.length, district.municipalitySlugs.length);
    for (const code of district.municipalityCodes) assert.equal(known.get(code)?.provinceId, district.provinceId, `${district.name}/${code}`);
    const geo = JSON.parse(readFileSync(new URL(`../public/maps/geometry/districts-2026/${district.id}.geojson`, import.meta.url), 'utf8'));
    assert.equal(geo.properties.id, district.id);
    assert(['Polygon', 'MultiPolygon'].includes(geo.geometry.type));
    assert(district.bbox.every(Number.isFinite));
  }
  assert(!codes.includes('FS164'));
  assert(!codes.includes('CPT'));
  assert.equal(findDistrict('DC4')?.municipalitySlugs.length, 7);
  assert(findDistrict('garden-route')?.municipalitySlugs.includes('knysna'));
});
