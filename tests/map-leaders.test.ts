import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { leaderFor, getMapLeaders, parseLeaderQuery } from '../src/lib/maps/leaders.ts';
import { NEUTRAL_COLOR } from '../src/lib/maps/leader-types.ts';
import { resultFromRow } from '../src/lib/places/results.ts';
import { visibleAreas } from '../src/lib/maps/viewport.ts';

function result() {
  return resultFromRow({ level: 'municipality', area_id: '9006', name: 'Cape Town', municipality_id: '9006',
    snapshot_id: 'active', url: 'https://example.test/iec', reported_at: new Date().toISOString(),
    last_checked_at: new Date().toISOString(), last_success_at: new Date().toISOString(), last_error: null,
    payload: JSON.stringify({ party_list_scope: 'all_rows_in_source', ballot_scope: 'source_combined',
      parties: ['DEMOCRATIC ALLIANCE', 'AFRICAN NATIONAL CONGRESS'].map((name, i) => ({
        source_entry_id: String(i), party_id: String(i), party_name: name, entry_type: 'party_or_candidate',
        party_name_source: 'result_file', candidate_name: null,
        votes: { pr: i ? 40 : 60, ward: i ? 70 : 30, source_total: i ? 110 : 90 },
        source_share_percent: null, seats: { ward: null, pr: null, total: null },
      })), progress: { voting_districts: null, municipalities: null, wards: null, seats: null },
      reported_totals: { registered_voters: null, valid_ballot_papers: 200, spoilt_ballot_papers: null, ballot_papers_cast: 200 },
    }),
  });
}

test('map colors use the displayed ballot and the published province denominator', () => {
  const r = result();
  assert.deepEqual(leaderFor(r.id, r), { id: r.id, party: 'DEMOCRATIC ALLIANCE', color: '#2872ba', share: 60, status: 'leading', delayed: false });
  r.level = 'ward';
  assert.equal(leaderFor(r.id, r).party, 'AFRICAN NATIONAL CONGRESS');
  assert.equal(leaderFor(r.id, r).share, 70);
  r.level = 'province'; r.results.party_list_scope = 'leading_parties_only'; r.results.reported_totals.valid_ballot_papers = 1000;
  assert.equal(leaderFor(r.id, r).share, 11);
  assert.equal(leaderFor(r.id, r).status, 'highest-shown');
  r.source.error = 'refresh failed';
  assert.equal(leaderFor(r.id, r).delayed, true);
});

test('ties, missing votes, partial local lists, aggregate entries and zero totals stay neutral', () => {
  assert.equal(leaderFor('9', null).status, 'unavailable');
  for (const kind of ['tie', 'missing', 'partial', 'aggregate', 'zero']) {
    const r = result();
    if (kind === 'tie') r.results.parties[1]!.votes.pr = 60;
    if (kind === 'missing') r.results.parties[1]!.votes.pr = null;
    if (kind === 'partial') r.results.party_list_scope = 'leading_parties_only';
    if (kind === 'aggregate') r.results.parties[0]!.entry_type = 'aggregate';
    if (kind === 'zero') r.results.parties.forEach(p => { p.votes.pr = 0; });
    const leader = leaderFor(r.id, r);
    assert.equal(leader.color, NEUTRAL_COLOR, kind);
    assert.equal(leader.party, null, kind);
    assert.equal(leader.status, kind === 'tie' ? 'tied' : kind === 'zero' ? 'awaiting' : 'unavailable');
  }
});

test('leader batches reject invalid levels, malformed IDs and unbounded requests', () => {
  assert.deepEqual(parseLeaderQuery(new URLSearchParams('level=province&ids=9,1,9')), { level: 'province', ids: ['1', '9'] });
  for (const query of ['level=ward', 'level=national&ids=1', 'level=province&ids=0', 'level=municipality&ids=__proto__', 'level=ward&ids=19100001,',
    `level=ward&ids=${Array.from({length: 81}, (_, i) => String(19100001 + i)).join(',')}`]) {
    assert.equal(parseLeaderQuery(new URLSearchParams(query)), null, query);
  }
});

test('viewport rows are sorted, deduplicated, and use full bounds for navigation', () => {
  const areas = visibleAreas('province', [{ id: '9' }, { id: '1' }, { id: '9' }, { id: '__proto__' }]);
  assert.deepEqual(areas.map(a => a.name), ['Eastern Cape', 'Western Cape']);
  assert.equal(areas[1]!.bbox?.length, 4);
  assert.equal(areas[1]!.url, '/2026/provinces/western-cape');
  assert.deepEqual(visibleAreas('municipality', [{ id: '9' }]), []);
});

test('leader queries read active snapshots and preserve missing IDs without inventing votes', async () => {
  const sql = new DatabaseSync(':memory:');
  try {
    for (const file of ['0001_results.sql', '0003_compact_results.sql']) sql.exec(readFileSync(new URL(`../migrations/${file}`, import.meta.url), 'utf8'));
    const db = { prepare(query: string) { return { bind(...args: string[]) { return { async all() { return { results: sql.prepare(query).all(...args) }; } }; } }; } } as unknown as D1Database;
    sql.exec("INSERT INTO source_documents(id,year,kind,area_id,url,active_snapshot_id,last_checked_at) VALUES('cpt',2026,'municipality','9006','https://example.test','active','2026-11-05T12:00:00Z')");
    const insert = sql.prepare("INSERT INTO area_results(snapshot_id,source_id,year,level,area_id,name,reported_at,payload) VALUES(?,'cpt',2026,'municipality','9006','Cape Town','2026-11-05T12:00:00Z',?)");
    insert.run('active', JSON.stringify(result().results));
    insert.run('obsolete', '{}');
    const leaders = await getMapLeaders(db, undefined, 'municipality', ['9006', '3003']);
    assert.equal(leaders[0]!.share, 60);
    assert.equal(leaders[1]!.id, '3003');
    assert.equal(leaders[1]!.status, 'unavailable');
    assert.deepEqual((await getMapLeaders(db, undefined, 'province', ['9'])).map(r => r.party), [null]);
  } finally { sql.close(); }
});
