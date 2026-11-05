import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ELECTIONS, sourceFor } from '../src/lib/data/catalogue.ts';
import { discoverMunicipalities, normalize, validateDocument } from '../src/lib/data/normalize.ts';
import { getSource, openStore, recordFailure, recordUnchanged, saveDocument } from '../scripts/lib/store.ts';
import { resultQuality } from '../src/lib/data/quality.ts';
import { sqlLiteral } from '../scripts/lib/sql.ts';
import { DatabaseSync } from 'node:sqlite';

const election = ELECTIONS.find((value) => value.year === 2026)!;
const source = sourceFor(election, '9909');
const timestamp = '2026-11-05T15:00:00+02:00';

test('reopening a local store preserves data after additive schema migrations', () => {
  const directory = mkdtempSync(join(tmpdir(), 'election-migration-test-'));
  try {
    const first = openStore(directory);
    first.prepare('INSERT INTO elections VALUES (2026,1887,\'provisional\')').run();
    first.close();
    const reopened = openStore(directory);
    try {
      assert.equal(reopened.prepare('SELECT COUNT(*) AS n FROM elections').get()!.n, 1);
      assert.ok(reopened.prepare('PRAGMA table_info(sync_state)').all().some(row => row.name === 'last_source_content_sha256'));
    } finally { reopened.close(); }
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

test('SQL export preserves quotes, newlines, Unicode, and SQL-like text as data', () => {
  const db = new DatabaseSync(':memory:');
  try {
    const value = "People's party\n'); DROP TABLE example; -- é";
    db.exec('CREATE TABLE example(value TEXT)');
    db.exec(`INSERT INTO example VALUES (${sqlLiteral(value)})`);
    assert.equal(db.prepare('SELECT value FROM example').get()!.value, value);
    assert.equal(sqlLiteral(null), 'NULL');
    assert.throws(() => sqlLiteral(Number.NaN));
  } finally { db.close(); }
});

function party() {
  return { ID: 7, Name: 'Example party', TotalValidVotes: 30, WardVotes: 10, PRVotes: 20,
    PercOfVotes: 100, RegisteredVoters: 25, TotalVotesCast: 32, ValidVotesCast: 30, SpoiltVotes: 2 };
}

function fixture() {
  return { ElectoralEventID: 1887, ProvinceID: 9, MunicipalityID: 9909,
    Municipality: 'WC022 - Witzenberg', ReportDate: timestamp,
    WardExpected: 1, WardsComplete: 1, VDExpected: 1, VDsComplete: 1,
    PartyBallotResults: [party()], WardResults: [{ WardID: 10202001, ReportDate: timestamp,
      WardExpected: 0, VDExpected: 0, VDsComplete: 0, RegPop: 0,
      PartyBallotResults: [{ ID: 7, Name: 'Example party', TotalValidVotes: 30 }],
      VotingDistrictResults: [{ VotingDistrictID: 97410089, ReportDate: timestamp,
        PartyBallotResults: [{ ID: 7, Name: 'Example party', TotalValidVotes: 30 }] }] }] };
}

test('rejects a different election or municipality rather than assigning its results to the requested year', () => {
  assert.throws(() => validateDocument({ ...fixture(), ElectoralEventID: 1091 }, election, source), /Wrong electoral event/);
  assert.throws(() => validateDocument({ ...fixture(), MunicipalityID: 3003 }, election, source), /Wrong municipality/);
});

test('preserves ballot counts, missing breakdowns, and unknown ward progress without inventing turnout', () => {
  const records = [...normalize(validateDocument(fixture(), election, source), source)];
  assert.equal(records.length, 3);
  assert.equal(records[0]!.payload.reported_totals.ballot_papers_cast, 32);
  assert.equal(records[0]!.payload.parties[0]!.votes.source_total, 30);
  assert.deepEqual(records[0]!.payload.parties[0]!.votes, { source_total: 30, ward: 10, pr: 20 });
  assert.equal(records[1]!.payload.progress.voting_districts, null);
  assert.equal(records[1]!.payload.reported_totals.registered_voters, null);
  assert.equal(records[1]!.payload.parties[0]!.votes.ward, null);
  assert.equal(records[0]!.reportedAt, '2026-11-05T13:00:00.000Z');
});

test('labels OTHER as an aggregate and does not mistake the lightweight list for every party', () => {
  const summary = { ElectoralEventID: 1887, ReportDate: timestamp,
    PartyBallotResults: [{ ...party(), ID: -2, Name: 'OTHER' }],
    ProvinceResults: [{ ProvinceID: 9, Province: 'Western Cape', ReportDate: timestamp,
      PartyBallotResults: [party()], MunicipalityResults: [{ MunicipalityID: 9909 }, { MunicipalityID: 9908 }] }] };
  const summarySource = sourceFor(election);
  const root = validateDocument(summary, election, summarySource);
  const national = [...normalize(root, summarySource)][0]!;
  assert.equal(national.payload.party_list_scope, 'leading_parties_only');
  assert.equal(national.payload.parties[0]!.entry_type, 'aggregate');
  assert.equal(national.payload.parties[0]!.party_id, null);
  assert.deepEqual(discoverMunicipalities(root), ['9908', '9909']);
});

test('exposes discrepancies in published source totals without silently adjusting votes', () => {
  const payload = [...normalize(fixture(), source)][0]!.payload;
  assert.equal(resultQuality(payload).vote_total_reconciliation.status, 'matches_reported_total');
  payload.parties[0]!.votes.source_total = 29;
  assert.deepEqual(resultQuality(payload).vote_total_reconciliation, {
    status: 'differs_from_reported_total', sum_of_published_rows: 29,
    source_reported_valid_ballots: 30, difference: 1,
  });
});

test('resolves historical negative party IDs and preserves invalid seat counts as anomalies', () => {
  const raw = { ...fixture(), PartyBallotResults: [{ ID: -27, TotalValidVotes: 5, PRSeatsWon: -1 }] };
  const payload = [...normalize(raw, source, new Map([['-27', 'NUWE NASIONALE PARTY/NEW NATIONAL PARTY']]))][0]!.payload;
  assert.equal(payload.parties[0]!.party_id, '-27');
  assert.equal(payload.parties[0]!.entry_type, 'party_or_candidate');
  assert.equal(payload.parties[0]!.party_name_source, 'iec_party_directory');
  assert.match(payload.parties[0]!.party_name, /NASIONALE/);
  assert.equal(payload.parties[0]!.seats.pr, null);
  assert.equal(resultQuality(payload).source_anomalies[0]!.reported_value, -1);
});

test('does not expose a synthetic ward-zero grouping as an electoral ward', () => {
  const raw = fixture();
  raw.WardExpected = -1;
  raw.WardResults[0]!.WardID = 11040000;
  const records = [...normalize(raw, source)];
  assert.equal(records.length, 2);
  assert.equal(records[0]!.payload.progress.wards, null);
  assert.equal(records[1]!.level, 'voting-district');
  assert.equal(records[1]!.wardId, null);
});

test('publishes complete snapshots atomically, retains good data on failure, and accepts downward corrections', () => {
  const directory = mkdtempSync(join(tmpdir(), 'sa-election-data-test-'));
  const db = openStore(directory);
  const metadata = { sha256: 'first', checkedAt: '2026-11-05T13:01:00Z', reportedAt: timestamp,
    rawPath: 'raw/example.json.gz', etag: 'first', lastModified: null };
  try {
    saveDocument(db, election, source, metadata, normalize(validateDocument(fixture(), election, source), source));
    const previous = getSource(db, source)!.active_snapshot_id;
    const broken = fixture();
    broken.WardResults[0]!.VotingDistrictResults.push(broken.WardResults[0]!.VotingDistrictResults[0]!);
    assert.throws(() => saveDocument(db, election, source, { ...metadata, sha256: 'broken' }, normalize(broken, source)), /UNIQUE/);
    recordFailure(db, source, new Error('Bad upstream response'));
    assert.equal(getSource(db, source)!.active_snapshot_id, previous);
    assert.equal(db.prepare('SELECT COUNT(*) AS count FROM area_results').get()!.count, 3);
    assert.equal(db.prepare('SELECT COUNT(*) AS count FROM snapshots').get()!.count, 1);
    recordUnchanged(db, source, '2026-11-05T13:02:00Z');
    assert.equal(db.prepare('SELECT last_error FROM source_documents').get()!.last_error, null);
    const corrected = fixture();
    corrected.PartyBallotResults[0]!.TotalValidVotes = 29;
    corrected.PartyBallotResults[0]!.WardVotes = 9;
    saveDocument(db, election, source, { ...metadata, sha256: 'corrected' }, normalize(corrected, source));
    assert.notEqual(getSource(db, source)!.active_snapshot_id, previous);
    assert.equal(db.prepare('SELECT COUNT(*) AS count FROM area_results').get()!.count, 3);
    assert.equal(db.prepare('SELECT COUNT(*) AS count FROM snapshots').get()!.count, 2);
    assert.throws(() => saveDocument(db, election, source,
      { ...metadata, sha256: 'old-cache', reportedAt: '2026-11-05T12:00:00Z' }, normalize(fixture(), source)), /older/);
    assert.match(getSource(db, source)!.active_snapshot_id!, /corrected$/);
    const checkedBefore = db.prepare('SELECT last_success_at FROM source_documents').get()!.last_success_at;
    saveDocument(db, election, source, { ...metadata, sha256: 'reprocessed', reprocess: true }, normalize(corrected, source));
    assert.equal(db.prepare('SELECT last_success_at FROM source_documents').get()!.last_success_at, checkedBefore);
  } finally {
    db.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
