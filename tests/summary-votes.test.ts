import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ELECTIONS, sourceFor } from '../src/lib/data/catalogue.ts';
import { normalize } from '../src/lib/data/normalize.ts';
import { summaryVoteTotals } from '../src/lib/data/summary-votes.ts';
import { resultFromRow, type Result } from '../src/lib/places/results.ts';
import { summaryBallot } from '../src/lib/overview/results.ts';
import { partyMovement } from '../src/lib/history/comparison.ts';
import { resultShareCard } from '../src/lib/sharing/results.ts';
import { areaSummary } from '../src/lib/mcp/summaries.ts';

// Minimal fields from the IEC LiteMapsNational feed, reported 6 Nov 2026 16:36:58 UTC.
// Its fourteen party rows exceed the reported 25,572,706 valid ballots by 91.
function national(): Result {
  const source = sourceFor(ELECTIONS.find(e => e.year === 2026)!);
  const raw = JSON.parse(readFileSync(new URL('./fixtures/national-summary-mismatch.json', import.meta.url), 'utf8'));
  const [record] = normalize(raw, source);
  return resultFromRow({ year: 2026, level: 'national', area_id: 'ZA', municipality_id: null, name: 'South Africa',
    snapshot_id: 'national-mismatch-fixture', url: source.url, reported_at: record!.reportedAt,
    last_checked_at: record!.reportedAt, last_success_at: record!.reportedAt, last_error: null,
    payload: JSON.stringify(record!.payload) });
}

function counts(votes: number[], total: number, partial = true) {
  const payload = national().results;
  payload.parties = votes.map((v, i) => ({ ...payload.parties[i % payload.parties.length]!, source_entry_id: String(i),
    votes: { source_total: v, pr: null, ward: null } }));
  payload.reported_totals.valid_ballot_papers = total;
  payload.party_list_scope = partial ? 'leading_parties_only' : 'all_rows_in_source';
  return payload;
}

test('the live national mismatch retains official shares and raw reconciliation across charts, sharing and API', () => {
  const result = national(), original = structuredClone(result.results);
  const chart = summaryBallot(result);
  assert.equal(chart.total, 25_572_706);
  assert.equal(chart.discrepancy, 91);
  assert.equal(chart.unlisted, 0, 'a source overrun cannot become negative unlisted votes');
  assert.equal(chart.parties[0]!.share, 8_059_959 / 25_572_706 * 100);
  assert.equal(chart.parties[0]!.share!.toFixed(1), '31.5');
  assert.equal(chart.parties[1]!.share!.toFixed(1), '24.2');
  assert.ok(chart.parties.every(p => p.share !== null && p.share <= 100));
  assert.equal(result.quality.vote_total_reconciliation.difference, -91);
  assert.equal(result.quality.vote_total_reconciliation.status, 'differs_from_reported_total');
  const card = resultShareCard(result, 'South Africa');
  assert.equal(card.metric, '31.5%');
  assert.match(card.note, /Source totals differ by 91 votes/);
  const api = areaSummary(result);
  assert.equal(api.ballot.denominator, chart.total);
  assert.equal(api.parties[0]!.share_percent, chart.parties[0]!.share);
  assert.equal(api.quality.vote_total_reconciliation.difference, -91);
  assert.deepEqual(result.results, original, 'published counts are never repaired');
});

test('summary history uses the same reported denominator and still rejects material conflicts', () => {
  const result = national();
  result.previous = structuredClone(result);
  result.previous.year = 2021;
  result.previous.results.parties[0]!.votes.source_total = 7_000_000;
  const previousTotal = result.previous.results.parties.reduce((n, p) => n + p.votes.source_total!, 0);
  result.previous.results.reported_totals.valid_ballot_papers = previousTotal;
  const party = result.results.parties[0]!;
  const movement = partyMovement(result, party, 'source_total')!;
  assert.equal(movement.currentShare, summaryBallot(result).parties[0]!.share);
  assert.equal(movement.previousShare, 7_000_000 / previousTotal * 100);
  assert.equal(movement.delta, movement.currentShare! - movement.previousShare!);
  result.results.reported_totals.valid_ballot_papers = 20_000_000;
  assert.equal(summaryBallot(result).total, null);
  assert.equal(partyMovement(result, party, 'source_total')!.delta, null);
});

test('minor mismatches must satisfy both the size limit and unchanged one-decimal rounding', () => {
  assert.equal(summaryVoteTotals(counts([600_050, 400_050], 1_000_000)).total, 1_000_000);
  assert.equal(summaryVoteTotals(counts([600_050, 400_051], 1_000_000)).total, null, 'over one in 10,000');
  assert.equal(summaryVoteTotals(counts([500_501, 499_501], 1_000_001)).total, null, 'even one vote can change rounding');
  assert.equal(summaryVoteTotals(counts([600_000, 399_999], 1_000_000, false)).discrepancy, -1);
  assert.equal(summaryVoteTotals(counts([1_000_001], 1_000_000)).total, null, 'shares above 100% are invalid');
  const duplicate = counts([600_000, 400_001], 1_000_000);
  duplicate.parties[1]!.source_entry_id = duplicate.parties[0]!.source_entry_id;
  assert.equal(summaryVoteTotals(duplicate).total, null);
});

test('partial lists retain unlisted votes while missing, unsafe and zero counts remain explicit', () => {
  const partial = national();
  partial.results = counts([300, 200], 1_000);
  assert.equal(summaryBallot(partial).unlisted, 500);
  assert.equal(summaryBallot(partial).discrepancy, null);
  assert.deepEqual(summaryBallot(partial).parties.map(p => p.share), [30, 20]);
  for (const value of [null, -1, NaN, 1.5]) {
    const invalid = counts([600_000, 400_001], 1_000_000);
    invalid.parties[0]!.votes.source_total = value;
    assert.equal(summaryVoteTotals(invalid).total, null);
  }
  assert.equal(summaryVoteTotals(counts([Number.MAX_SAFE_INTEGER, 1], Number.MAX_SAFE_INTEGER)).total, null);
  assert.equal(summaryVoteTotals(counts([0, 0], 0)).total, 0);
  const empty = counts([], 1_000_000);
  assert.equal(summaryVoteTotals(empty).total, null);
});
