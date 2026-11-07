import test from 'node:test';
import assert from 'node:assert/strict';
import { resultFromRow } from '../src/lib/places/results.ts';
import { areaSummary, areaCard } from '../src/lib/mcp/summaries.ts';

function fixture(year = 2026) {
  return resultFromRow({ year, level: 'municipality', area_id: '9909', name: 'Test', municipality_id: '9909',
    snapshot_id: `snapshot-${year}`, url: 'https://iec.example/results', reported_at: '2026-11-01T00:00:00Z',
    last_checked_at: '2026-11-01T00:00:00Z', last_success_at: '2026-11-01T00:00:00Z', last_error: null,
    payload: JSON.stringify({ party_list_scope: 'all_rows_in_source', ballot_scope: 'source_combined',
      parties: [140, 60].map((n, i) => ({ source_entry_id: String(i + 1), party_id: String(i + 1),
        party_name: `Party ${i + 1}`, party_name_source: 'result_file', candidate_name: null, entry_type: 'party_or_candidate',
        votes: { source_total: n, pr: i === 0 ? 80 : 20, ward: i === 0 ? 60 : 40 },
        seats: { ward: 0, pr: 0, total: 0 }, source_share_percent: n / 2 })),
      reported_totals: { valid_ballot_papers: 200, registered_voters: null, ballot_papers_cast: null, spoilt_ballot_papers: null },
      progress: { municipalities: null, voting_districts: { expected: 10, completed: 5 },
        wards: { expected: 2, completed: 0 }, seats: { expected: 4, completed: 0 } } }) });
}

test('summaries separate estimated allocations from reported seats and preserve whole-list denominators', () => {
  const r = fixture();
  const summary = areaSummary(r, 'pr', 1);
  assert.equal(summary.ballot.denominator, 100);
  assert.equal(summary.parties[0]!.share_percent, 80);
  assert.equal(summary.parties[0]!.reported_seats.total, 0);
  assert.equal(summary.council.status, 'estimated');
  assert.match(summary.council.caveat!, /Unfinished wards/);
  assert.equal(summary.party_page.next_offset, 1);
  assert.equal(summary.progress.voting_districts?.percent, 50);
  assert.match(summary.freshness_warning!, /delayed/);
});

test('AI summaries use the dated government comparison independently of votes and seats',()=>{
  const r=fixture();r.id=r.municipalityId='4404';
  const comparison=areaSummary(r).government_comparison!;
  assert.deepEqual(comparison.before!.members,['ANC','IFP']);assert.equal(comparison.before!.date,'2024-08-06');
  assert.equal(comparison.after,null);assert.equal(comparison.change.status,'unconfirmed');
  r.year=2021;assert.equal(areaSummary(r).government_comparison,null);
});

test('summary source totals retain unlisted ballots instead of inflating leading-party shares', () => {
  const r = fixture(); r.level = 'national'; r.id = 'ZA';
  r.results.party_list_scope = 'leading_parties_only';
  r.results.reported_totals.valid_ballot_papers = 1000;
  const s = areaSummary(r);
  assert.equal(s.ballot.basis, 'source_total');
  assert.equal(s.ballot.denominator, 1000);
  assert.equal(s.ballot.unlisted_votes, 800);
  assert.ok(Math.abs(s.parties[0]!.share_percent! - 14) < 1e-10);
  assert.equal(s.council.status, 'unavailable');
});

test('historical fallback and OTHER aggregates never manufacture missing-party swings', () => {
  const r = fixture(); const before = fixture(2021);
  before.results.parties[1]!.entry_type = 'aggregate';
  before.results.parties[1]!.party_id = null;
  before.results.parties[1]!.source_entry_id = '-2';
  for (const p of before.results.parties) { p.votes.pr = null; p.votes.ward = null; }
  const current = { ...r, previous: before };
  const s = areaSummary(current, 'pr');
  assert.equal(s.parties[0]!.movement?.basis, 'source_total');
  assert.equal(s.parties[0]!.movement?.delta, 0);
  assert.equal(s.parties[1]!.movement?.delta, null);
  assert.match(s.parties[1]!.movement?.reason ?? '', /aggregate/);
  const absent = areaCard(current, 'pr', '999');
  assert.equal(absent.selected_party?.status, 'not_listed');
  assert.equal(absent.selected_party?.votes, null);
  assert.equal(absent.selected_party?.share_percent, null);
});

test('ties and unavailable votes do not become leaders and ambiguous party identities stay unavailable', () => {
  const r = fixture();
  r.results.parties[0]!.votes.pr = 20;
  assert.equal(areaSummary(r).leader, null);
  assert.equal(areaSummary(r).tied, true);
  r.results.parties[0]!.votes.pr = null;
  assert.equal(areaSummary(r).ballot.denominator, null);
  r.results.parties[1]!.party_id = '1';
  assert.equal(areaCard(r, 'pr', '1').selected_party?.status, 'ambiguous');
});
