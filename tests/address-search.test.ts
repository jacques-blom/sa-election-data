import test from 'node:test';
import assert from 'node:assert/strict';
import { isWholeArea } from '../src/lib/address/selection.ts';
import { rankPlaceSuggestions } from '../src/lib/places/suggestions.ts';
import { findPlace } from '../src/lib/places/catalogue.ts';
import { resolveArea } from '../src/lib/address/resolve-area.ts';
import type { Place } from '../src/lib/places/types.ts';
import { addressSearchBounds } from '../src/lib/address/scope.ts';
import { googleAreaView } from '../src/lib/address/google-area.ts';

test('address search uses each municipality’s bounds in longitude/latitude order',()=>{
  const capeTown = findPlace('cape-town')!;
  const hantam = findPlace('hantam')!;
  for (const place of [capeTown,hantam]) {
    const [west,south,east,north] = place.bbox!;
    assert.deepEqual(addressSearchBounds(place.bbox),{west,south,east,north});
  }
  assert.notDeepEqual(addressSearchBounds(capeTown.bbox),addressSearchBounds(hantam.bbox));
});

test('missing or invalid geographic bounds leave address search unrestricted within South Africa',()=>{
  for (const bbox of [undefined,null,[],[18,-34,19],[18,-34,18,-33],[19,-34,18,-33],[18,-33,19,-34],[-181,-34,19,-33],[18,-91,19,-33],[18,-34,181,-33],[18,-34,19,91],[18,-34,NaN,-33],[18,-34,Infinity,-33],['18',-34,19,-33]]) {
    assert.equal(addressSearchBounds(bbox),undefined,JSON.stringify(bbox));
  }
});

test('cities, suburbs and administrative areas open whole-area results',()=>{
  for (const type of ['locality','neighborhood','sublocality','sublocality_level_2','administrative_area_level_1','administrative_area_level_3','postal_code','country']) {
    assert.equal(isWholeArea([type,'political']),true,type);
  }
});

test('exact metro names and aliases precede statistical towns and broader matches',()=>{
  const metro = findPlace('cape-town')!;
  const town = { ...metro, slug: 'cape-town-town', kind: 'town' as const };
  const other = { ...town, slug: 'new-town', name: 'New Town', aliases: [] };
  assert.deepEqual(rankPlaceSuggestions('Cape Town', [other, town, metro, metro]).map(p => p.slug), ['cape-town','cape-town-town','new-town']);
  const joburg = findPlace('johannesburg')!;
  assert.equal(rankPlaceSuggestions('Jozi', [metro,joburg])[0]?.slug,'johannesburg');
});

test('street addresses and landmarks use the selected-location ward lookup',()=>{
  for (const types of [['street_address'],['premise'],['route'],['establishment','point_of_interest'],['subpremise'],[]]) {
    assert.equal(isWholeArea(types),false,types.join(','));
  }
});

test('Gauteng selects the province even when its central ward is unknown', () => {
  const result = resolveArea({ names: ['Gauteng'], types: ['administrative_area_level_1', 'political'] }, []);
  assert.equal(result.area?.url, '/2026/provinces/gauteng');
  assert.equal(result.area?.geometry?.level, 'province');
  assert.equal(result.area?.bbox?.length, 4);
});

test('Knysna defaults to the municipality even when Google labels it as a locality', () => {
  const municipality = findPlace('knysna')!;
  const town: Place = { ...municipality, id: 'town-180009', kind: 'town', slug: 'knysna-town-western-cape-180009', geometry: { level: 'town', id: '180009' } };
  const selection = { names: ['Knysna'], province: 'Western Cape', types: ['locality'] };
  assert.equal(resolveArea(selection, [municipality, town]).area?.url, '/2026/places/knysna');
  assert.equal(resolveArea({ ...selection, names: ['Knysna Local Municipality'], types: ['administrative_area_level_3'] }, [town, municipality]).area?.url, '/2026/places/knysna');
});

test('Calvinia retains the directory’s whole-town geometry and overlapping wards', () => {
  const curated = findPlace('calvinia')!;
  const directory: Place = { ...curated, bbox: [19.71, -31.54, 19.93, -31.39], geometry: { level: 'town', id: '366005' } };
  const result = resolveArea({ names: ['Calvinia'], types: ['locality'], province: 'Northern Cape' }, [directory, curated]);
  assert.equal(result.area?.url, '/2026/places/calvinia');
  assert.deepEqual(result.area?.geometry, directory.geometry);
  assert.deepEqual(result.area?.bbox, directory.bbox);
});

test('same-named areas use province, type and then bounds without guessing an ambiguous result', () => {
  const template = findPlace('calvinia')!;
  const first: Place = { ...template, name: 'Newtown', aliases: [], slug: 'newtown-a', province: 'Gauteng', bbox: [28, -26, 29, -25] };
  const second: Place = { ...first, slug: 'newtown-b', bbox: [27, -27, 28, -26] };
  const elsewhere: Place = { ...first, slug: 'newtown-c', province: 'Western Cape' };
  const selection = { names: ['Newtown'], types: ['locality'], province: 'Gauteng' };
  const result = resolveArea(selection, [first, second, elsewhere]);
  assert.equal(result.area, undefined);
  assert.equal(result.alternatives.length, 2);
  assert.equal(resolveArea({ ...selection, location: { lat: -25.5, lng: 28.5 } }, [first, second]).area?.url, '/2026/places/newtown-a');
});

test('unknown broad areas and postal codes never fall back to a nearby municipality or ward', () => {
  const calvinia = findPlace('calvinia')!;
  for (const types of [['locality'], ['postal_code'], ['administrative_area_level_2']]) {
    assert.deepEqual(resolveArea({ names: ['Unknown place'], types, location: { lat: -31.5, lng: 19.8 } }, [calvinia]), { alternatives: [] });
  }
});

test('unlisted Google areas retain their full viewport without inventing an electoral boundary', () => {
  const place = { id: 'newlands-cape-town', displayName: 'Newlands', formattedAddress: 'Newlands, Cape Town, South Africa', types: ['sublocality_level_2', 'sublocality'],
    viewport: { toJSON: () => ({ west: 18.40, south: -34.01, east: 18.48, north: -33.95 }) } };
  const area = googleAreaView(place as Parameters<typeof googleAreaView>[0])!;
  assert.deepEqual(area.bbox, [18.40, -34.01, 18.48, -33.95]);
  assert.equal(area.url, '/map?google-place=newlands-cape-town');
  assert.equal(area.googlePlaceId, place.id);
  assert.equal(area.geometry, undefined);
  for (const change of [{ viewport: undefined }, { types: ['street_address'] }, { id: '' }, { viewport: { toJSON: () => ({ west: NaN, south: -34, east: 18, north: -33 }) } }]) {
    assert.equal(googleAreaView({ ...place, ...change } as Parameters<typeof googleAreaView>[0]), undefined);
  }
});
