import test from 'node:test';
import assert from 'node:assert/strict';
import { councilSeats, canBuildCoalition, type AvailableSeats } from '../src/lib/seats/allocation.ts';
import { coalitionData, coalitionSelection, coalitionShareText } from '../src/lib/seats/coalition.ts';
import { councilPoints } from '../src/lib/seats/diagram.ts';
import type { AreaRecord } from '../src/lib/data/normalize.ts';

type Payload = AreaRecord['payload'];
function payload(total = 10, rows = [[600, 0], [300, 0], [100, 0]]): Payload {
  const parties: Payload['parties'] = rows.map(([votes, ward], i) => ({ source_entry_id: String(i + 1),
    party_id: String(i + 1), entry_type: 'party_or_candidate', party_name: `Party ${i + 1}`,
    party_name_source: 'result_file', candidate_name: null, source_share_percent: null,
    votes: { pr: votes!, ward: votes!, source_total: votes! * 2 }, seats: { ward: ward!, pr: 0, total: ward! } }));
  const wards = parties.reduce((sum, p) => sum + p.seats.ward!, 0);
  return { party_list_scope: 'all_rows_in_source', ballot_scope: 'source_combined', parties,
    progress: { seats: { expected: total, completed: wards }, wards: { expected: Math.ceil(total / 2), completed: wards },
      voting_districts: { expected: 100, completed: 30 }, municipalities: { expected: 1, completed: 0 } },
    reported_totals: { valid_ballot_papers: parties.reduce((sum, p) => sum + p.votes.source_total!, 0),
      registered_voters: null, ballot_papers_cast: null, spoilt_ballot_papers: null } };
}
function allocated(p: Payload) {
  const result = councilSeats('municipality', p);
  assert.notEqual(result.status, 'unavailable');
  return result as AvailableSeats;
}
test('allocates the full council from both ballots, not PR percentages or PR seats plus wards', () => {
  const p = payload();
  p.parties[0]!.votes = { pr: 100, ward: 1100, source_total: 1200 };
  p.parties[0]!.source_share_percent = 99;
  const result = allocated(p);
  assert.equal(result.status, 'estimated');
  assert.deepEqual(result.parties.map(p => p.count), [6, 3, 1]);
  assert.equal(result.majority, 6);
});
test('the playground allows any complete breakdown, including a single-party majority', () => {
  assert.equal(canBuildCoalition(allocated(payload())), true);
  assert.equal(canBuildCoalition({ status: 'unavailable', reason: 'No votes yet.' }), false);
});
test('reserves independent wins and excludes all independent votes from the party quota', () => {
  const p = payload(10, [[600, 2], [400, 1], [9000, 1]]);
  const independent = p.parties[2]!;
  independent.source_entry_id = independent.party_id = '0'; independent.party_name = 'INDEPENDENTS';
  independent.votes = { pr: 0, ward: 18000, source_total: 18000 };
  const result = allocated(p);
  assert.equal(result.parties.find(p => p.party_id === '0')!.count, 1);
  assert.equal(result.parties.find(p => p.party_id === '1')!.count, 5);
  assert.equal(result.parties.find(p => p.party_id === '2')!.count, 4);
});
test('preserves ward overhang and redistributes the remaining council seats', () => {
  const p = payload(10, [[100, 4], [600, 1], [300, 0]]);
  const result = allocated(p);
  assert.equal(result.parties.find(p => p.party_id === '1')!.count, 4);
  assert.equal(result.parties.find(p => p.party_id === '2')!.count, 4);
  assert.equal(result.parties.find(p => p.party_id === '3')!.count, 2);
  assert.equal(result.parties.reduce((n, p) => n + p.count, 0), 10);
});
test('a ward allocation equal to the entitlement needs no top-up and does not change other parties’ remainders', () => {
  const p = payload(11, [[9211, 2], [7642, 4], [2405, 0], [579, 0], [221, 0], [119, 0], [45, 0]]);
  const result = allocated(p);
  assert.deepEqual(result.parties.map(p => p.count), [5, 4, 1, 1, 0, 0, 0]);
});
test('an unresolved remainder tie cannot be broken by party order', () => {
  const p = payload(3, [[100, 0], [100, 0]]);
  assert.equal(councilSeats('municipality', p).status, 'unavailable');
  p.parties.reverse();
  assert.equal(councilSeats('municipality', p).status, 'unavailable');
  assert.deepEqual(allocated(payload(4, [[100, 0], [100, 0]])).parties.map(p => p.count), [2, 2]);
});
test('a remainder tie uses total votes before refusing to allocate', () => {
  // Quota 3: 4 votes and 1 vote have equal remainders. The 4-vote party gets the last seat.
  const p = payload(2, [[2, 0], [1, 0]]);
  p.parties[1]!.votes = { pr: 1, ward: 0, source_total: 1 };
  p.reported_totals.valid_ballot_papers = 5;
  assert.equal(allocated(p).parties[0]!.count, 2);
});
test('complete reconciled IEC allocations take precedence even when the estimate differs', () => {
  const p = payload();
  p.parties[0]!.seats = { ward: 3, pr: 2, total: 5 };
  p.parties[1]!.seats = { ward: 2, pr: 2, total: 4 };
  p.parties[2]!.seats = { ward: 0, pr: 1, total: 1 };
  p.progress.seats!.completed = 10; p.progress.wards!.completed = 5;
  const result = allocated(p);
  assert.equal(result.status, 'reported');
  assert.deepEqual(result.parties.map(p => p.count), [5, 4, 1]);
  assert.equal(canBuildCoalition(result), true);
  p.parties[0]!.seats.total = 6;
  assert.equal(councilSeats('municipality', p).status, 'unavailable');
});
test('missing, malformed, truncated and contradictory figures cannot produce estimates', () => {
  const mutations: ((p: Payload) => void)[] = [
    p => { p.progress.seats = null; }, p => { p.progress.wards = null; },
    p => { p.progress.seats!.expected = 0; }, p => { p.progress.seats!.expected = 1001; },
    p => { p.progress.seats!.completed = 0.5; }, p => { p.progress.seats!.completed = 11; },
    p => { p.progress.wards!.completed = 1; }, p => { p.parties = []; },
    p => { p.party_list_scope = 'leading_parties_only'; }, p => { p.parties[0]!.entry_type = 'aggregate'; },
    p => { p.parties.push(p.parties[0]!); }, p => { p.parties[0]!.seats.ward = null; },
    p => { p.parties[0]!.seats.pr = -1; }, p => { p.parties[0]!.votes.ward = null; },
    p => { p.parties[0]!.votes.pr = -1; }, p => { p.parties[0]!.votes.pr = Infinity; },
    p => { p.parties[0]!.votes.source_total = 1; }, p => { p.reported_totals.valid_ballot_papers = 1; },
    p => { p.reported_totals.valid_ballot_papers = null; },
  ];
  for (const mutate of mutations) { const p = payload(); mutate(p); assert.equal(councilSeats('municipality', p).status, 'unavailable', mutate.toString()); }
  for (const level of ['national', 'province', 'ward', 'voting-district']) assert.equal(councilSeats(level, payload()).status, 'unavailable');
  assert.equal(councilSeats('municipality', payload(10, [[0, 0], [0, 0]])).status, 'unavailable');
});
test('every available estimate has integer seats, preserves ward floors and reconciles to council size', () => {
  for (let n = 7; n < 100; n++) {
    const p = payload(n, [[n * 31, 1], [n * 19 + 1, 0], [n * 7 + 3, 1], [n + 5, 0]]);
    const result = councilSeats('municipality', p);
    if (result.status === 'unavailable') { assert.match(result.reason, /tie/i); continue; }
    assert.equal(result.parties.reduce((sum, p) => sum + p.count, 0), n);
    assert(result.parties.every(p => Number.isInteger(p.count) && p.count >= p.seats.ward!));
  }
});

const source = { url: 'https://example.org/iec', reportedAt: '2026-11-05T19:00:00Z', snapshotId: 'snapshot-1' };
function mockupCouncil() {
  const seats = allocated(payload(120, [[5400, 0], [4100, 0], [1100, 0], [600, 0], [400, 0], [300, 0], [100, 0]]));
  return coalitionData('Nelson Mandela Bay', seats, source);
}
test('the mockup boundary: 60 of 120 is one short; 61 is a majority', () => {
  const data = mockupCouncil();
  assert.equal(coalitionSelection(data, []).total, 0);
  const half = coalitionSelection(data, ['1', '4']);
  assert.equal(half.total, 60); assert.equal(half.shortfall, 1); assert.equal(half.status, '1 more seat needed');
  const majority = coalitionSelection(data, ['1', '4', '7']);
  assert.equal(majority.total, 61); assert.equal(majority.shortfall, 0); assert.match(majority.status, /Majority reached/);
  assert.equal(coalitionSelection(data, ['1', '1', 'unknown']).total, 54);
});
test('an independent aggregate is never treated as a selectable coalition bloc', () => {
  const data = mockupCouncil();
  data.parties.push({ id: '0', name: 'INDEPENDENTS', short: 'Independent', color: '#888888', seats: 5, selectable: false });
  assert.equal(coalitionSelection(data, ['0']).total, 0);
});
test('coalition captions stay short and preserve hypothetical and estimated context', () => {
  const text = coalitionShareText(mockupCouncil(), ['1', '4'], 'https://example.org/coalition?parties=1,4');
  for (const expression of [/Hypothetical/, /estimated seats/, /60 of 120/, /1 more needed/, /https:\/\/example.org/]) assert.match(text, expression);
  assert(text.length < 280);
  assert.doesNotMatch(text, /Snapshot:|Source:|IEC result time:/);
});
test('seat diagrams contain exactly one finite point per seat', () => {
  for (const n of [1, 7, 23, 120, 235, 270, 1000]) {
    const points = councilPoints(n); assert.equal(points.length, n);
    assert(points.every(p => Number.isFinite(p.x) && Number.isFinite(p.y) && p.x >= 0 && p.x <= 320 && p.y >= 0 && p.y <= 170));
  }
});
