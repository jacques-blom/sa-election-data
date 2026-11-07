import test from 'node:test';
import assert from 'node:assert/strict';
import { findPlace, searchPlaces, type Place } from '../src/lib/places/catalogue.ts';
import { resolveCoalitionSelection, validCoalitionSelection } from '../src/lib/seats/selection.ts';

const lookups = {
  findPlace: async (slug: string) => findPlace(slug),
  searchPlaces: async (query: string) => searchPlaces(query),
  locate: async (_location: { lat: number; lng: number }): Promise<string[]> => { throw new Error('Unexpected coordinate lookup'); },
};

test('named towns and wards open their whole municipality game', async () => {
  for (const selection of [{ url: '/2026/places/calvinia' }, { names: ['Calvinia'], types: ['locality'], province: 'Northern Cape', location: { lat: -31.47, lng: 19.77 } }]) {
    const result = await resolveCoalitionSelection(selection, lookups);
    assert.equal(result.browse, undefined);
    assert.deepEqual(result.councils.map(c => c.href), ['/2026/places/hantam/coalition']);
  }
  const ward = await resolveCoalitionSelection({ url: '/2026/wards/10408005' }, lookups);
  assert.equal(ward.councils[0]?.href, '/2026/places/knysna/coalition');
});

test('Google addresses and unlisted towns use municipal boundaries and deduplicate matches', async () => {
  const location = { lat: -33.97, lng: 18.46 };
  for (const types of [['street_address'], ['locality'], ['sublocality_level_1']]) {
    let calls = 0;
    const result = await resolveCoalitionSelection({ names: ['Example place'], types, location }, { ...lookups,
      locate: async point => { calls++; assert.deepEqual(point, location); return ['9006', '9006']; },
    });
    assert.equal(calls, 1);
    assert.deepEqual(result.councils.map(c => c.href), ['/2026/places/cape-town/coalition']);
  }
});

test('province, district and country selections stay in the council picker', async () => {
  const province = await resolveCoalitionSelection({ names: ['Gauteng'], types: ['administrative_area_level_1'], location: { lat: -26.2, lng: 28.04 } }, lookups);
  assert.equal(province.browse, 'Gauteng');
  assert.equal(province.councils.length, 9);
  assert.ok(province.councils.every(c => c.province === 'Gauteng' && c.href.endsWith('/coalition')));
  const district = await resolveCoalitionSelection({ url: '/2026/districts/cape-winelands' }, lookups);
  assert.equal(district.browse, 'Cape Winelands');
  assert.ok(district.councils.length > 1);
  const country = await resolveCoalitionSelection({ names: ['South Africa'], types: ['country'] }, lookups);
  assert.equal(country.browse, 'All provinces');
  assert.equal(country.councils.length, 213);
  const unknown = await resolveCoalitionSelection({ names: ['Unknown district'], types: ['administrative_area_level_2'], location: { lat: -26, lng: 28 } }, lookups);
  assert.deepEqual(unknown.councils, []);
});

test('a town crossing municipal boundaries offers both councils without choosing its centre', async () => {
  const town: Place = { ...findPlace('calvinia')!, relationships: [
    { election: 2026, level: 'municipality', areaId: '6605', relation: 'overlaps', boundaryVersion: '', method: '' },
    { election: 2026, level: 'municipality', areaId: '9006', relation: 'overlaps', boundaryVersion: '', method: '' },
    { election: 2021, level: 'municipality', areaId: '9928', relation: 'within', boundaryVersion: '', method: '' },
  ] };
  const result = await resolveCoalitionSelection({ url: '/2026/places/calvinia' }, { ...lookups, findPlace: async () => town });
  assert.deepEqual(result.councils.map(c => c.id).sort(), ['6605', '9006']);
  const boundary = await resolveCoalitionSelection({ names: ['Example address'], types: ['street_address'], location: { lat: -33.9, lng: 18.5 } }, { ...lookups, locate: async () => ['9006', '6605'] });
  assert.equal(boundary.councils.length, 2);
});

test('empty lookups stay empty and selection validation rejects outside or arbitrary URLs', async () => {
  assert.deepEqual(await resolveCoalitionSelection({ names: ['Example address'], types: ['street_address'] }, lookups), { councils: [] });
  for (const selection of [null, {}, { url: 'https://example.com/' }, { url: '//example.com' }, { url: '/map?address=private' },
    { names: [], types: [] }, { names: ['Example'], types: [], location: { lat: 0, lng: 0 } },
    { names: ['Example'], types: [], location: null }, { names: ['Example'], types: [], location: { lat: -33, lng: Infinity } }]) {
    assert.equal(validCoalitionSelection(selection), false, JSON.stringify(selection));
  }
  for (const selection of [{ url: '/2026/places/calvinia' }, { url: '/' }, { names: ['Example address'], types: ['street_address'], location: { lat: -33.9, lng: 18.5 } }]) assert.equal(validCoalitionSelection(selection), true);
});

test('a single same-name town in another region cannot override the Google location', async () => {
  const elsewhere: Place = { ...findPlace('calvinia')!, name: 'Newlands', aliases: [], bbox: [28, -31, 30, -29] };
  let located = false;
  const result = await resolveCoalitionSelection({ names: ['Newlands'], types: ['sublocality_level_1'], location: { lat: -33.973, lng: 18.457 } }, {
    ...lookups, searchPlaces: async () => [elsewhere], locate: async () => { located = true; return ['9006']; },
  });
  assert.equal(located, true);
  assert.equal(result.councils[0]?.name, 'Cape Town');
});
