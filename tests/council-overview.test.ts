import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { readCouncilStates, summariseCouncils } from '../src/lib/overview/councils.ts';
import { normalize } from '../src/lib/data/normalize.ts';
import { ELECTIONS, sourceFor } from '../src/lib/data/catalogue.ts';

const row = (id: string, payload: string | null = null) => ({ area_id: id, source_id: id, snapshot_id: 'active', payload });
const state = (id: string, counts = [3, 1], ids = ['1', '2']) => ({ source_id: id, snapshot_id: 'active',
  council_json: JSON.stringify({ kind: 'council_decided', areaId: id, totalSeats: 4, majority: 3,
    seats: counts.map((count, i) => ({ id: ids[i], name: `Party ${ids[i]}`, count })) }) });

test('only reported seat allocations enter outcome totals; missing councils remain unresolved', () => {
  const summary = summariseCouncils([row('a'), row('b'), row('c')], [state('a'), state('b', [2, 2])], 5);
  assert.equal(summary.total, 5);
  assert.equal(summary.singleParty, 1);
  assert.equal(summary.noMajority, 1);
  assert.equal(summary.pending, 3);
  assert.deepEqual(summary.parties, [{ id: '1', name: 'Party 1', councils: 1 }]);
  assert.equal(summary.hasExpectedTotal, true);
  for (const expected of [null, 0, -1, 1.5, 2]) {
    const partial = summariseCouncils([row('a'), row('b'), row('c')], [], expected);
    assert.equal(partial.total, 3);
    assert.equal(partial.hasExpectedTotal, false);
  }
});

test('independent groupings, stale states and inconsistent allocations cannot become party majorities', () => {
  assert.equal(summariseCouncils([row('a')], [state('a', [3, 1], ['0', '2'])], 1).singleParty, 0);
  const invalid = [
    { ...state('a'), snapshot_id: 'obsolete' },
    { ...state('b'), source_id: 'a' },
    state('a', [4, 1]), state('a', [2, 2], ['1', '1']), state('a', [3, 1], ['-2', '1']),
    { ...state('a'), council_json: '{' }, { ...state('a'), council_json: null },
  ];
  for (const entry of invalid) {
    const summary = summariseCouncils([row('a')], [entry], 1);
    assert.equal(summary.pending, 1);
    assert.equal(summary.singleParty + summary.noMajority, 0);
  }
});

test('local payloads use the seat validator and never promote estimates or a stale milestone', () => {
  const source = sourceFor(ELECTIONS.find(e => e.year === 2026)!, '9909');
  const document = { ElectoralEventID: 1887, ProvinceID: 9, MunicipalityID: 9909,
    Municipality: 'WC022 - Example', ReportDate: '2026-11-06T09:00:00Z',
    VDExpected: 2, VDsComplete: 2, SeatsExpected: 4, SeatsComplete: 4, WardExpected: 2, WardsComplete: 2,
    PartyBallotResults: [3, 1].map((total, i) => ({ ID: i + 1, Name: `Party ${i + 1}`,
      WardSeatsWon: 1, PRSeatsWon: total - 1, TotalSeatsWon: total,
      WardVotes: i ? 20 : 80, PRVotes: i ? 20 : 80, TotalValidVotes: i ? 40 : 160, ValidVotesCast: 200 })), WardResults: [] };
  const payload = () => JSON.stringify([...normalize(document, source)][0]!.payload);
  assert.equal(summariseCouncils([row('9909', payload())], [], 1).singleParty, 1);
  document.SeatsComplete = 2;
  document.PartyBallotResults.forEach(p => { p.PRSeatsWon = 0; p.TotalSeatsWon = 1; });
  const estimate = summariseCouncils([row('9909', payload())], [state('9909')], 1);
  assert.equal(estimate.singleParty, 0);
  assert.equal(estimate.pending, 1);
  assert.equal(estimate.entries[0]?.status, 'estimated', 'the builder can use estimates without counting them as reported outcomes');
  assert.equal(summariseCouncils([row('9909', '{}')], [], 1).pending, 1);
});

test('compact state query is scoped to the active election and snapshot and tolerates an absent rollout table', async () => {
  const sql = new DatabaseSync(':memory:');
  const db = { prepare(query: string) { return { bind(...values: (string | number)[]) {
    return { async all() { return { results: sql.prepare(query).all(...values) }; } };
  } }; } } as unknown as D1Database;
  try {
    sql.exec(readFileSync(new URL('../migrations/0001_results.sql', import.meta.url), 'utf8'));
    assert.deepEqual(await readCouncilStates(db, 2026), []);
    sql.exec(readFileSync(new URL('../migrations/0006_result_updates.sql', import.meta.url), 'utf8'));
    for (const [id, year, snapshot] of [['a', 2026, 'active'], ['b', 2026, 'old'], ['c', 2021, 'active']] as const) {
      sql.prepare("INSERT INTO source_documents(id,year,kind,area_id,url,active_snapshot_id,last_checked_at) VALUES(?,?,'municipality',?,'https://example.org','active','2026-11-06')").run(id, year, id);
      sql.prepare("INSERT INTO result_update_state VALUES(?,?,?,'2026-11-06','2026-11-06')").run(id, snapshot,
        JSON.stringify({ [`council:${id}`]: JSON.parse(state(id).council_json), 'ward:1': { kind: 'ward_won' } }));
    }
    const states = await readCouncilStates(db, 2026);
    assert.equal(states.length, 1);
    assert.equal(states[0]!.source_id, 'a');
    assert.equal(JSON.parse(states[0]!.council_json!).kind, 'council_decided');
    assert.equal(summariseCouncils([row('a')], states, 1).singleParty, 1);
  } finally { sql.close(); }
});
