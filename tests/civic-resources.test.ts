import test from 'node:test';
import assert from 'node:assert/strict';
import municipalities from '../src/lib/places/municipalities.json' with { type: 'json' };
import directory from '../src/lib/civic/municipal-directory.json' with { type: 'json' };
import { civicResources, localCivicResources } from '../src/lib/civic/resources.ts';
const now = new Date('2026-11-07T12:00:00Z');

test('all playable municipalities have a scoped ward link, guide and honest contact fallback', () => {
  assert.equal(municipalities.length, 213);
  for (const place of municipalities) {
    const resources = civicResources(place, now);
    assert.equal(new URL(resources.wardUrl, 'https://counted.co.za').searchParams.get('place'), place.slug);
    assert.equal(new URL(resources.guideUrl, 'https://counted.co.za').searchParams.get('place'), place.slug);
    assert.equal(new URL(resources.contact.url).hostname, 'www.gov.za');
    assert.match(resources.contact.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
    if (!resources.localContact) assert.match(resources.contact.note, /National government directory/);
  }
});

test('same-name councils in different provinces cannot share a directory entry', () => {
  const records = directory.records as Record<string, { name: string; url: string }>;
  const sameNames = municipalities.filter(p => p.name === 'Emalahleni');
  assert.equal(sameNames.length, 2);
  const urls = sameNames.map(p => records[p.slug]!.url);
  assert.equal(new Set(urls).size, 2);
  assert.ok(urls.some(url => url.includes('/ec-municipalities/')));
  assert.ok(urls.some(url => url.includes('/mp-municipalities/')));
  assert.equal(civicResources({ slug: 'jb-marks', name: 'JB Marks' }, now).localContact, false);
});

test('local resources use known councils and reviewed HTTPS pages, never inferred contact URLs', () => {
  for (const [slug, resources] of Object.entries(localCivicResources)) {
    assert.ok(municipalities.some(p => p.slug === slug), slug);
    for (const resource of Object.values(resources)) {
      assert.equal(new URL(resource.url).protocol, 'https:');
      assert.ok(resource.note.length > 30);
      assert.match(resource.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
    }
  }
  assert.equal(Object.keys(directory.records).length, 211);
  assert.equal(new Set(Object.values(directory.records).map(r => r.url)).size, 211);
});

test('old or future-dated resource reviews fall back without pretending consultations are open', () => {
  const joburg = { slug: 'johannesburg', name: 'Johannesburg' };
  assert.ok(civicResources(joburg, now).participation);
  assert.equal(civicResources(joburg, new Date('2027-01-01')).participation, undefined, 'year-specific notices expire at year end');
  const hantam = { slug: 'hantam', name: 'Hantam' };
  assert.ok(civicResources(hantam, now).meetings);
  assert.equal(civicResources(hantam, new Date('2027-06-01')).meetings, undefined);
  assert.equal(civicResources(hantam, new Date('2020-01-01')).meetings, undefined);
  assert.ok(civicResources(hantam, new Date('2027-06-01')).contact.url);
});
