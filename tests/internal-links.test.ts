import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { browsePlaces, browseWards, directoryPage, placeDirectoryUrl, wardDirectoryUrl } from '../src/lib/places/browse.ts';
import { findPlace, places } from '../src/lib/places/catalogue.ts';
import { provinces } from '../src/lib/overview/results.ts';
import { districts } from '../src/lib/maps/districts.ts';
import type { Place } from '../src/lib/places/types.ts';

function fixture() {
  const sql = new DatabaseSync(':memory:');
  for (const file of ['0001_results.sql', '0003_compact_results.sql', '0004_geography.sql']) {
    sql.exec(readFileSync(new URL(`../migrations/${file}`, import.meta.url), 'utf8'));
  }
  const db = { prepare(query: string) { return { bind(...args: (string | number)[]) {
    return { async all() { return { results: sql.prepare(query).all(...args) }; } };
  } }; } } as unknown as D1Database;
  function add(place: Place) {
    sql.prepare('INSERT INTO place_directory(id,slug,name,aliases,province,municipality,kind,indexable,payload) VALUES(?,?,?,?,?,?,?,?,?)')
      .run(place.id, place.slug, place.name, place.aliases.join(' '), place.province, place.municipalityName ?? '', place.kind, Number(place.indexable), JSON.stringify(place));
  }
  return { sql, db, add };
}

test('municipalities and wards discover noindex and cross-boundary places using every current relationship', async () => {
  const { sql, db, add } = fixture();
  try {
    const calvinia = findPlace('calvinia')!;
    add(calvinia); add(findPlace('hantam')!);
    const cross = structuredClone(calvinia);
    cross.id = cross.slug = 'cross-boundary'; cross.name = 'Cross-boundary';
    cross.province = 'Western Cape'; cross.municipalityName = 'An old municipality name';
    cross.relationships.push({ ...cross.relationships[0]!, areaId: '9006', relation: 'overlaps' });
    add(cross);
    const old = structuredClone(calvinia);
    old.id = old.slug = 'old-boundary'; old.relationships.forEach(r => r.election = 2021); add(old);
    const council = await browsePlaces(db, { municipalityId: '6605' });
    assert.deepEqual(council.places.map(p => p.slug), ['calvinia', 'cross-boundary']);
    assert.equal(council.total, 2);
    assert.deepEqual((await browsePlaces(db, { municipalityId: '9006' })).places.map(p => p.slug), ['cross-boundary']);
    assert.deepEqual((await browsePlaces(db, { wardId: '30605007' })).places.map(p => p.slug), ['calvinia', 'cross-boundary']);
    assert.equal((await browsePlaces(db, { wardId: '30605003' })).total, 0);
    assert.equal((await browsePlaces(db, { province: "Northern Cape' OR 1=1 --" })).total, 0);
    assert.equal((await browsePlaces(db, { province: 'Northern Cape' })).total, 3);
  } finally { sql.close(); }
});

test('every directory entry is reachable across stable, bounded pages, including duplicate names', async () => {
  const { sql, db, add } = fixture();
  try {
    for (let i = 0; i < 137; i++) {
      const place = structuredClone(findPlace('calvinia')!);
      place.id = place.slug = `town-${String(i).padStart(3, '0')}`;
      place.name = i < 70 ? 'Same name' : 'Another name'; add(place);
    }
    const found: string[] = [];
    for (let page = 1; page <= 3; page++) {
      const data = await browsePlaces(db, { province: 'Northern Cape' }, page);
      assert.equal(data.total, 137); assert.ok(data.places.length <= 60);
      found.push(...data.places.map(p => p.slug));
    }
    assert.equal(found.length, 137); assert.equal(new Set(found).size, 137);
    assert.equal((await browsePlaces(db, {}, 4)).places.length, 0);
    assert.equal((await browsePlaces(db, {}, 1, 1000)).places.length, 60);
  } finally { sql.close(); }
});

test('ward browsing exposes historical orphan wards and respects active packed directories', async () => {
  const { sql, db } = fixture();
  try {
    sql.exec(`INSERT INTO source_documents(id,year,kind,area_id,url,active_snapshot_id,last_checked_at) VALUES
      ('old-council',2000,'municipality','retired','https://example.org','active','2000-01-01'),
      ('current',2026,'municipality','6605','https://example.org','published','2026-01-01');
      INSERT INTO result_bundles(source_id,directory_snapshot_id,object_key,raw_length,normalizer_version,party_directory_hash,index_json)
      VALUES('current','directory','bundle',1,1,'test','{}');`);
    const insert = sql.prepare(`INSERT INTO area_results(snapshot_id,source_id,year,level,area_id,province_id,municipality_id,name,reported_at,payload) VALUES(?,?,?,?,?,?,?,?,?,'{}')`);
    insert.run('active','old-council',2000,'municipality','retired','6','retired','Retired council','2000-01-01');
    insert.run('directory','current',2026,'municipality','6605','6','6605','Hantam','2026-01-01');
    for (let i = 1; i <= 65; i++) {
      const id = `30000${String(i).padStart(3, '0')}`;
      insert.run('active','old-council',2000,'ward',id,'6','retired',`Ward ${i}`,'2000-01-01');
      insert.run('stale','old-council',2000,'ward',id,'6','retired',`Stale ward ${i}`,'2000-01-01');
    }
    insert.run('directory','current',2026,'ward','30605001','6','6605','Ward 1','2026-01-01');
    const first = await browseWards(db, 2000, '6');
    assert.equal(first.total, 65); assert.equal(first.wards.length, 60);
    assert.ok(first.wards.every(w => w.municipalityName === 'Retired council' && !w.name.startsWith('Stale')));
    const second = await browseWards(db, 2000, '6', 2);
    assert.equal(second.wards.length, 5);
    assert.equal(new Set([...first.wards, ...second.wards].map(w => w.area_id)).size, 65);
    assert.equal((await browseWards(db, 2000, '9')).total, 0);
    const packed = await browseWards(db, 2026);
    assert.equal(packed.total, 1); assert.equal(packed.wards[0]?.municipalityName, 'Hantam');
  } finally { sql.close(); }
});

test('directory URLs preserve scope and page identity; malformed pagination is rejected', () => {
  assert.equal(directoryPage(null), 1);
  for (const value of ['0', '-1', 'abc', '1tail', '1.5', 'Infinity', '1000001']) assert.equal(directoryPage(value), null);
  assert.equal(directoryPage('2'), 2);
  assert.equal(placeDirectoryUrl(), '/places');
  assert.equal(placeDirectoryUrl({ municipality: 'hantam' }, 2), '/places?municipality=hantam&page=2');
  assert.equal(placeDirectoryUrl({ ward: '30605001' }), '/places?ward=30605001');
  assert.equal(wardDirectoryUrl(2000, 'northern-cape', 2), '/2000/wards?province=northern-cape&page=2');
});

test('every current municipality and district has a path from a province', () => {
  for (const place of places) assert.ok(provinces.some(p => p.name === place.province), place.slug);
  for (const district of districts) {
    assert.ok(provinces.some(p => p.id === district.provinceId), district.slug);
    for (const slug of district.municipalitySlugs) assert.ok(findPlace(slug), slug);
  }
  for (const place of places.filter(p => p.kind === 'municipality')) {
    assert.ok(districts.some(d => d.municipalitySlugs.includes(place.slug)), place.slug);
  }
});
